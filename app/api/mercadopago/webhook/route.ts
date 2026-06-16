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
  source: 'query' | 'body' | null
}

async function findMensualidadByReference(reference: string) {
  const admin = createAdminClient()

  const { data: byMpRef } = await admin
    .from('mensualidades')
    .select('id, estado')
    .eq('mp_reference', reference)
    .maybeSingle()
  if (byMpRef?.id) return byMpRef

  const { data: byClipRef } = await admin
    .from('mensualidades')
    .select('id, estado')
    .eq('clip_reference', reference)
    .maybeSingle()
  if (byClipRef?.id) return byClipRef

  const mensualidadId = parseMensualidadIdFromReference(reference)
  if (!mensualidadId) return null

  const { data: byId } = await admin
    .from('mensualidades')
    .select('id, estado')
    .eq('id', mensualidadId)
    .maybeSingle()

  return byId
}

async function findMensualidadByMpPaymentId(paymentId: string) {
  const admin = createAdminClient()
  const { data } = await admin
    .from('mensualidades')
    .select('id, estado')
    .eq('mp_payment_id', paymentId)
    .maybeSingle()
  return data
}

function parseWebhookEvent(url: URL, body: WebhookBody | null): ParsedWebhookEvent {
  const queryTopic = url.searchParams.get('topic')
  const queryId = url.searchParams.get('id')

  if (queryTopic || queryId) {
    return {
      topic: queryTopic ?? body?.type ?? body?.topic ?? null,
      resourceId: queryId ?? (body?.data?.id != null ? String(body.data.id) : null),
      source: 'query',
    }
  }

  if (body) {
    const topic = body.type ?? body.topic ?? body.action ?? null
    const resourceId =
      body.data?.id != null
        ? String(body.data.id)
        : body.id != null
          ? String(body.id)
          : null
    return { topic, resourceId, source: 'body' }
  }

  return { topic: null, resourceId: null, source: null }
}

async function resolveApprovedPaymentFromMerchantOrder(
  merchantOrderId: string
): Promise<MercadoPagoPayment | null> {
  const merchantOrder = await getMercadoPagoMerchantOrder(merchantOrderId)

  console.info('[MP webhook] merchant_order consultada', {
    merchant_order_id: merchantOrderId,
    order_id: merchantOrder.id,
    external_reference: merchantOrder.external_reference ?? null,
    payments_count: merchantOrder.payments?.length ?? 0,
  })

  const approvedInOrder = merchantOrder.payments?.find(
    (payment) => payment.status?.toLowerCase() === 'approved'
  )

  if (!approvedInOrder?.id) {
    console.info('[MP webhook] Sin payment approved en merchant_order', {
      merchant_order_id: merchantOrderId,
      payments: merchantOrder.payments?.map((p) => ({
        id: p.id,
        status: p.status,
      })),
    })
    return null
  }

  console.info('[MP webhook] payment_id encontrado en merchant_order', {
    merchant_order_id: merchantOrderId,
    payment_id: approvedInOrder.id,
  })

  const payment = await getMercadoPagoPayment(approvedInOrder.id)

  console.info('[MP webhook] payment consultado', {
    payment_id: payment.id,
    external_reference: payment.external_reference ?? merchantOrder.external_reference ?? null,
    status: payment.status,
    status_detail: payment.status_detail ?? null,
  })

  if (payment.status?.toLowerCase() !== 'approved') {
    console.info('[MP webhook] payment no approved tras consulta directa', {
      payment_id: payment.id,
      status: payment.status,
    })
    return null
  }

  if (!payment.external_reference && merchantOrder.external_reference) {
    payment.external_reference = merchantOrder.external_reference
  }

  return payment
}

async function actualizarMensualidadDesdePago(payment: MercadoPagoPayment) {
  const estadoPago = mercadoPagoStatusToEstadoPago(
    payment.status,
    payment.status_detail
  )
  const errorMsg =
    estadoPago === 'pagado' ? null : mercadoPagoErrorMessage(payment)

  console.info('[MP webhook] estado final del pago', {
    payment_id: payment.id,
    external_reference: payment.external_reference ?? null,
    proveedor_pago: 'mercadopago',
    mercado_pago_payment_id: String(payment.id),
    mp_status: payment.status,
    estado_pago: estadoPago,
  })

  let mensualidadId: string | null = null
  let currentEstado: string | undefined

  if (payment.external_reference) {
    const row = await findMensualidadByReference(payment.external_reference)
    mensualidadId = row?.id ?? null
    currentEstado = row?.estado
  }

  if (!mensualidadId) {
    const row = await findMensualidadByMpPaymentId(String(payment.id))
    mensualidadId = row?.id ?? null
    currentEstado = row?.estado
  }

  if (!mensualidadId) {
    console.warn('[MP webhook] Mensualidad no encontrada', {
      payment_id: payment.id,
      external_reference: payment.external_reference ?? null,
    })
    return
  }

  const admin = createAdminClient()
  await admin
    .from('mensualidades')
    .update(
      buildPaymentUpdateRecord(
        {
          metodo_pago: 'mercado_pago',
          estado_pago: estadoPago,
          pago_error_mensaje: errorMsg,
          mp_payment_id: String(payment.id),
        },
        currentEstado
      )
    )
    .eq('id', mensualidadId)

  if (estadoPago === 'pagado') {
    console.info('[MP webhook] mensualidad marcada como pagada', {
      mensualidad_id: mensualidadId,
      payment_id: payment.id,
      proveedor_pago: 'mercadopago',
    })
    await finalizarCuponEnMensualidadPagada(admin, mensualidadId)
  }
}

async function procesarPagoMercadoPago(paymentId: string) {
  const payment = await getMercadoPagoPayment(paymentId)
  await actualizarMensualidadDesdePago(payment)
}

async function handleWebhook(request: Request) {
  const url = new URL(request.url)
  let body: WebhookBody | null = null

  if (request.method === 'POST') {
    try {
      const raw = await request.text()
      if (raw) {
        body = JSON.parse(raw) as WebhookBody
      }
    } catch {
      console.warn('[MP webhook] Body JSON inválido')
    }
  }

  const event = parseWebhookEvent(url, body)

  console.info('[MP webhook] evento recibido', {
    topic: event.topic,
    id: event.resourceId,
    source: event.source,
    method: request.method,
  })

  if (!event.topic || !event.resourceId) {
    console.warn('[MP webhook] Sin topic o id utilizable', {
      topic: event.topic,
      id: event.resourceId,
    })
    return NextResponse.json({ received: true })
  }

  if (isMercadoPagoMerchantOrderTopic(event.topic)) {
    const payment = await resolveApprovedPaymentFromMerchantOrder(event.resourceId)
    if (!payment) {
      console.info('[MP webhook] merchant_order sin pago approved; no se actualiza mensualidad', {
        merchant_order_id: event.resourceId,
      })
      return NextResponse.json({ received: true })
    }

    await actualizarMensualidadDesdePago(payment)
    return NextResponse.json({ received: true })
  }

  if (isMercadoPagoPaymentTopic(event.topic)) {
    await procesarPagoMercadoPago(event.resourceId)
    return NextResponse.json({ received: true })
  }

  console.warn('[MP webhook] topic no soportado; ignorado', {
    topic: event.topic,
    id: event.resourceId,
  })
  return NextResponse.json({ received: true })
}

export async function POST(request: Request) {
  try {
    return await handleWebhook(request)
  } catch (error) {
    console.error('[MP webhook] error:', error)
    return NextResponse.json({ received: true })
  }
}

export async function GET(request: Request) {
  try {
    return await handleWebhook(request)
  } catch (error) {
    console.error('[MP webhook] error:', error)
    return NextResponse.json({ received: true })
  }
}
