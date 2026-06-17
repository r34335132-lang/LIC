import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  getMercadoPagoMerchantOrder,
  getMercadoPagoPayment,
  isMercadoPagoMerchantOrderTopic,
  isMercadoPagoPaymentTopic,
  mercadoPagoErrorMessage,
  mercadoPagoStatusToEstadoPago,
  type MercadoPagoPayment,
} from '@/lib/mercadopago'
import {
  buildPaymentUpdateRecord,
  parseMensualidadIdFromReference,
} from '@/lib/mensualidades-pago'
import { finalizarCuponEnMensualidadPagada } from '@/lib/cupones'
import {
  actualizarInscripcionDesdePago,
  isInscripcionPaymentReference,
} from '@/lib/inscripciones-webhook'

type WebhookBody = {
  type?: string
  topic?: string
  action?: string
  data?: { id?: string | number }
  id?: string | number
}

type ParsedWebhookEvent = {
  topic: string | null
  resourceId: string | null
  source: 'query' | 'body' | 'mixed' | null
}

type MensualidadWebhookRow = {
  id: string
  estado: string
  estado_pago: string | null
  mp_payment_id: string | null
  cupon_id: string | null
  cupon_consumido: boolean
}

function parseWebhookEvent(url: URL, body: WebhookBody | null): ParsedWebhookEvent {
  const queryTopic =
    url.searchParams.get('topic') ?? url.searchParams.get('type')

  const queryId =
    url.searchParams.get('data.id') ?? url.searchParams.get('id')

  const bodyTopic = body?.topic ?? body?.type ?? null
  const bodyId =
    body?.data?.id != null
      ? String(body.data.id)
      : body?.id != null
        ? String(body.id)
        : null

  const topic = queryTopic ?? bodyTopic
  const resourceId = queryId ?? bodyId

  let source: ParsedWebhookEvent['source'] = null
  if ((queryTopic || queryId) && (bodyTopic || bodyId)) source = 'mixed'
  else if (queryTopic || queryId) source = 'query'
  else if (bodyTopic || bodyId) source = 'body'

  return { topic, resourceId, source }
}

async function findMensualidadByReference(
  reference: string
): Promise<MensualidadWebhookRow | null> {
  const admin = createAdminClient()
  const select =
    'id, estado, estado_pago, mp_payment_id, cupon_id, cupon_consumido'

  const { data: byMpRef } = await admin
    .from('mensualidades')
    .select(select)
    .eq('mp_reference', reference)
    .maybeSingle()
  if (byMpRef?.id) return byMpRef as MensualidadWebhookRow

  const mensualidadId = parseMensualidadIdFromReference(reference)
  if (!mensualidadId) return null

  const { data: byId } = await admin
    .from('mensualidades')
    .select(select)
    .eq('id', mensualidadId)
    .maybeSingle()

  return (byId as MensualidadWebhookRow | null) ?? null
}

async function findMensualidadByMpPaymentId(
  paymentId: string
): Promise<MensualidadWebhookRow | null> {
  const admin = createAdminClient()
  const { data } = await admin
    .from('mensualidades')
    .select('id, estado, estado_pago, mp_payment_id, cupon_id, cupon_consumido')
    .eq('mp_payment_id', paymentId)
    .maybeSingle()

  return (data as MensualidadWebhookRow | null) ?? null
}

function mensualidadYaPagada(m: MensualidadWebhookRow): boolean {
  return m.estado_pago === 'pagado' || m.estado === 'pagado'
}

async function resolveMensualidadForPayment(
  payment: MercadoPagoPayment
): Promise<MensualidadWebhookRow | null> {
  if (payment.external_reference) {
    const byRef = await findMensualidadByReference(payment.external_reference)
    if (byRef) return byRef
  }

  return findMensualidadByMpPaymentId(String(payment.id))
}

async function resolveApprovedPaymentFromMerchantOrder(
  merchantOrderId: string
): Promise<MercadoPagoPayment | null> {
  const merchantOrder = await getMercadoPagoMerchantOrder(merchantOrderId)
  const orderStatus = merchantOrder.status?.toLowerCase() ?? null

  console.info('[MP webhook] merchant_order consultada', {
    merchant_order_id: merchantOrderId,
    order_id: merchantOrder.id,
    order_status: orderStatus,
    external_reference: merchantOrder.external_reference ?? null,
    payments_count: merchantOrder.payments?.length ?? 0,
  })

  if (orderStatus === 'opened') {
    console.info('[MP webhook] merchant_order opened; no se marca mensualidad', {
      merchant_order_id: merchantOrderId,
    })
    return null
  }

  const approvedInOrder = merchantOrder.payments?.find(
    (p) => p.status?.toLowerCase() === 'approved'
  )

  if (!approvedInOrder?.id) {
    console.info('[MP webhook] sin payment approved en merchant_order', {
      merchant_order_id: merchantOrderId,
      payments: merchantOrder.payments?.map((p) => ({
        id: p.id,
        status: p.status,
      })),
    })
    return null
  }

  console.info('[MP webhook] payment encontrado en merchant_order', {
    merchant_order_id: merchantOrderId,
    payment_id: approvedInOrder.id,
    payment_status: approvedInOrder.status,
  })

  const payment = await getMercadoPagoPayment(approvedInOrder.id)

  if (payment.status?.toLowerCase() !== 'approved') {
    console.info('[MP webhook] payment no approved tras consulta API', {
      payment_id: payment.id,
      status: payment.status,
      status_detail: payment.status_detail ?? null,
    })
    return null
  }

  console.info('[MP webhook] payment aprobado', {
    payment_id: payment.id,
    external_reference:
      payment.external_reference ?? merchantOrder.external_reference ?? null,
    status: payment.status,
    status_detail: payment.status_detail ?? null,
  })

  if (!payment.external_reference && merchantOrder.external_reference) {
    payment.external_reference = merchantOrder.external_reference
  }

  return payment
}

async function actualizarMensualidadDesdePago(
  payment: MercadoPagoPayment
): Promise<void> {
  if (isInscripcionPaymentReference(payment.external_reference)) {
    await actualizarInscripcionDesdePago(payment)
    return
  }

  const paymentId = String(payment.id)
  const estadoPago = mercadoPagoStatusToEstadoPago(
    payment.status,
    payment.status_detail
  )
  const errorMsg =
    estadoPago === 'pagado' ? null : mercadoPagoErrorMessage(payment)

  console.info('[MP webhook] procesando actualización de mensualidad', {
    payment_id: paymentId,
    external_reference: payment.external_reference ?? null,
    mp_status: payment.status,
    estado_pago: estadoPago,
  })

  const mensualidad = await resolveMensualidadForPayment(payment)

  if (!mensualidad) {
    console.warn('[MP webhook] mensualidad no encontrada', {
      payment_id: paymentId,
      external_reference: payment.external_reference ?? null,
    })
    return
  }

  if (mensualidadYaPagada(mensualidad)) {
    console.info('[MP webhook] mensualidad ya pagada; idempotente skip', {
      mensualidad_id: mensualidad.id,
      mp_payment_id: mensualidad.mp_payment_id,
      payment_id: paymentId,
    })
    return
  }

  const otraConMismoPago = await findMensualidadByMpPaymentId(paymentId)
  if (
    otraConMismoPago &&
    otraConMismoPago.id !== mensualidad.id &&
    mensualidadYaPagada(otraConMismoPago)
  ) {
    console.warn('[MP webhook] mp_payment_id ya usado en otra mensualidad pagada', {
      payment_id: paymentId,
      mensualidad_id: mensualidad.id,
      otra_mensualidad_id: otraConMismoPago.id,
    })
    return
  }

  const admin = createAdminClient()

  const { data: updated, error: updateError } = await admin
    .from('mensualidades')
    .update(
      buildPaymentUpdateRecord(
        {
          metodo_pago: 'mercado_pago',
          estado_pago: estadoPago,
          pago_error_mensaje: errorMsg,
          mp_payment_id: paymentId,
        },
        mensualidad.estado
      )
    )
    .eq('id', mensualidad.id)
    .neq('estado_pago', 'pagado')
    .select('id')
    .maybeSingle()

  if (updateError) {
    console.error('[MP webhook] error al actualizar mensualidad', {
      mensualidad_id: mensualidad.id,
      payment_id: paymentId,
      error: updateError.message,
    })
    return
  }

  if (!updated) {
    console.info('[MP webhook] mensualidad no actualizada (ya pagada concurrente)', {
      mensualidad_id: mensualidad.id,
      payment_id: paymentId,
    })
    return
  }

  console.info('[MP webhook] mensualidad actualizada', {
    mensualidad_id: mensualidad.id,
    payment_id: paymentId,
    estado_pago: estadoPago,
    proveedor_pago: 'mercadopago',
  })

  if (estadoPago === 'pagado') {
    try {
      await finalizarCuponEnMensualidadPagada(admin, mensualidad.id)
      console.info('[MP webhook] cupón finalizado', {
        mensualidad_id: mensualidad.id,
        cupon_id: mensualidad.cupon_id,
        cupon_consumido: mensualidad.cupon_consumido,
      })
    } catch (cuponError) {
      console.error('[MP webhook] error al finalizar cupón', {
        mensualidad_id: mensualidad.id,
        error: cuponError instanceof Error ? cuponError.message : String(cuponError),
      })
    }
  }
}

async function procesarPagoMercadoPago(paymentId: string): Promise<void> {
  const payment = await getMercadoPagoPayment(paymentId)
  await actualizarMensualidadDesdePago(payment)
}

async function handleWebhook(request: Request): Promise<NextResponse> {
  const url = new URL(request.url)
  let body: WebhookBody | null = null

  if (request.method === 'POST') {
    try {
      const raw = await request.text()
      if (raw) body = JSON.parse(raw) as WebhookBody
    } catch {
      console.warn('[MP webhook] body JSON inválido')
    }
  }

  const { topic, resourceId, source } = parseWebhookEvent(url, body)

  console.info('[MP webhook]', {
    topic,
    resourceId,
    source,
    method: request.method,
  })

  if (!topic || !resourceId) {
    console.warn('[MP webhook] sin topic/type o id utilizable', {
      topic,
      resourceId,
      query: url.search,
    })
    return NextResponse.json({ received: true })
  }

  if (isMercadoPagoMerchantOrderTopic(topic)) {
    const payment = await resolveApprovedPaymentFromMerchantOrder(resourceId)
    if (!payment) {
      return NextResponse.json({ received: true })
    }
    await actualizarMensualidadDesdePago(payment)
    return NextResponse.json({ received: true })
  }

  if (isMercadoPagoPaymentTopic(topic)) {
    await procesarPagoMercadoPago(resourceId)
    return NextResponse.json({ received: true })
  }

  console.warn('[MP webhook] topic/type no soportado', { topic, resourceId })
  return NextResponse.json({ received: true })
}

export async function POST(request: Request) {
  try {
    return await handleWebhook(request)
  } catch (error) {
    console.error('[MP webhook] error no controlado', {
      error: error instanceof Error ? error.message : String(error),
    })
    return NextResponse.json({ received: true })
  }
}

export async function GET(request: Request) {
  try {
    return await handleWebhook(request)
  } catch (error) {
    console.error('[MP webhook] error no controlado', {
      error: error instanceof Error ? error.message : String(error),
    })
    return NextResponse.json({ received: true })
  }
}
