import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  getMercadoPagoPayment,
  mercadoPagoErrorMessage,
  mercadoPagoStatusToEstadoPago,
} from '@/lib/mercadopago'
import {
  buildPaymentUpdateRecord,
  parseMensualidadIdFromReference,
} from '@/lib/mensualidades-pago'
import { finalizarCuponEnMensualidadPagada } from '@/lib/cupones'

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

async function procesarPagoMercadoPago(paymentId: string) {
  const payment = await getMercadoPagoPayment(paymentId)
  const estadoPago = mercadoPagoStatusToEstadoPago(
    payment.status,
    payment.status_detail
  )
  const errorMsg =
    estadoPago === 'pagado' ? null : mercadoPagoErrorMessage(payment)

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
      paymentId,
      external_reference: payment.external_reference,
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
    await finalizarCuponEnMensualidadPagada(admin, mensualidadId)
  }
}

export async function POST(request: Request) {
  try {
    const url = new URL(request.url)
    const topic = url.searchParams.get('topic')
    const queryId = url.searchParams.get('id')

    let paymentId: string | null = queryId

    if (!paymentId) {
      try {
        const body = (await request.json()) as {
          type?: string
          topic?: string
          data?: { id?: string | number }
          id?: string | number
        }
        const type = body.type ?? body.topic ?? topic
        if (type === 'payment' && body.data?.id != null) {
          paymentId = String(body.data.id)
        } else if (body.id != null && !paymentId) {
          paymentId = String(body.id)
        }
      } catch {
        // body vacío en algunos pings
      }
    }

    if (!paymentId) {
      console.warn('[MP webhook] Sin payment id', { topic, queryId })
      return NextResponse.json({ received: true })
    }

    await procesarPagoMercadoPago(paymentId)
    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('[MP webhook] error:', error)
    return NextResponse.json({ received: true })
  }
}

export async function GET(request: Request) {
  return POST(request)
}
