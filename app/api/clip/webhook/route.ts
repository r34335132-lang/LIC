import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  clipCheckoutErrorMessage,
  clipStatusToEstadoPago,
  extractClipWebhookPaymentId,
  extractClipWebhookReference,
  getClipCheckoutStatus,
} from '@/lib/clip'
import {
  buildPaymentUpdateRecord,
  parseMensualidadIdFromReference,
} from '@/lib/mensualidades-pago'
import { finalizarCuponEnMensualidadPagada } from '@/lib/cupones'
import {
  actualizarInscripcionDesdeClip,
  resolveInscripcionIdFromReference,
} from '@/lib/inscripciones-webhook'
import { parseInscripcionIdFromReference } from '@/lib/inscripciones-pago'

async function findMensualidadId(reference: string): Promise<string | null> {
  if (!reference.startsWith('MENSUALIDAD-')) return null

  const admin = createAdminClient()

  const { data: byRef } = await admin
    .from('mensualidades')
    .select('id')
    .eq('clip_reference', reference)
    .maybeSingle()

  if (byRef?.id) return byRef.id

  const mensualidadId = parseMensualidadIdFromReference(reference)
  if (!mensualidadId) return null

  const { data: byId } = await admin
    .from('mensualidades')
    .select('id')
    .eq('id', mensualidadId)
    .maybeSingle()

  return byId?.id ?? null
}

async function findMensualidadByPaymentId(
  paymentRequestId: string
): Promise<{ id: string; estado: string } | null> {
  const admin = createAdminClient()
  const { data } = await admin
    .from('mensualidades')
    .select('id, estado')
    .eq('clip_payment_id', paymentRequestId)
    .maybeSingle()

  return data
}

async function procesarMensualidadPagada(
  mensualidadId: string,
  paymentRequestId: string
) {
  const clipStatus = await getClipCheckoutStatus(paymentRequestId)
  const estadoPago = clipStatusToEstadoPago(clipStatus.status)
  const errorMsg =
    estadoPago === 'pagado' ? null : clipCheckoutErrorMessage(clipStatus)

  const admin = createAdminClient()
  const { data: current } = await admin
    .from('mensualidades')
    .select('estado')
    .eq('id', mensualidadId)
    .maybeSingle()

  await admin
    .from('mensualidades')
    .update(
      buildPaymentUpdateRecord(
        {
          metodo_pago: 'clip',
          estado_pago: estadoPago,
          pago_error_mensaje: errorMsg,
          clip_payment_id: paymentRequestId,
        },
        current?.estado
      )
    )
    .eq('id', mensualidadId)

  if (estadoPago === 'pagado') {
    await finalizarCuponEnMensualidadPagada(admin, mensualidadId)
  }
}

export async function POST(request: Request) {
  let body: unknown

  try {
    const webhookSecret = process.env.CLIP_WEBHOOK_SECRET?.trim()
    if (webhookSecret) {
      const signature = request.headers.get('x-clip-signature')
      if (signature !== webhookSecret) {
        return NextResponse.json({ error: 'Firma inválida' }, { status: 401 })
      }
    }

    body = await request.json()

    const reference = extractClipWebhookReference(body)
    const paymentRequestId = extractClipWebhookPaymentId(body)

    if (!reference && !paymentRequestId) {
      console.warn(
        '[Clip webhook] No se encontró reference ni payment_request_id. Body:',
        JSON.stringify(body)
      )
      return NextResponse.json({ received: true })
    }

    let mensualidadId: string | null = null
    let inscripcionId: string | null = null

    const admin = createAdminClient()

    if (reference?.startsWith('INSCRIPCION-')) {
      inscripcionId =
        parseInscripcionIdFromReference(reference) ??
        (await resolveInscripcionIdFromReference(admin, reference))
    }

    if (!inscripcionId && reference?.startsWith('MENSUALIDAD-')) {
      mensualidadId = await findMensualidadId(reference)
    }

    if (!inscripcionId && !mensualidadId && paymentRequestId) {
      const { data: insByClip } = await admin
        .from('inscripciones')
        .select('id')
        .eq('clip_payment_id', paymentRequestId)
        .maybeSingle()
      if (insByClip?.id) inscripcionId = insByClip.id
    }

    if (!mensualidadId && !inscripcionId && paymentRequestId) {
      const row = await findMensualidadByPaymentId(paymentRequestId)
      mensualidadId = row?.id ?? null
    }

    if (!mensualidadId && !inscripcionId) {
      console.warn('[Clip webhook] Recurso no encontrado.', {
        reference,
        paymentRequestId,
      })
      return NextResponse.json({ received: true })
    }

    if (!paymentRequestId) {
      console.warn('[Clip webhook] payment_request_id ausente; no se puede verificar con Clip.', {
        reference,
        mensualidadId,
        inscripcionId,
      })
      return NextResponse.json({ received: true })
    }

    if (inscripcionId) {
      const clipStatus = await getClipCheckoutStatus(paymentRequestId)
      const estadoPago = clipStatusToEstadoPago(clipStatus.status)
      const errorMsg =
        estadoPago === 'pagado' ? null : clipCheckoutErrorMessage(clipStatus)
      await actualizarInscripcionDesdeClip(
        inscripcionId,
        paymentRequestId,
        estadoPago,
        errorMsg
      )
      return NextResponse.json({ received: true })
    }

    await procesarMensualidadPagada(mensualidadId!, paymentRequestId)

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('[Clip webhook] error:', error)
    if (body !== undefined) {
      console.warn('[Clip webhook] Body recibido:', JSON.stringify(body))
    }
    return NextResponse.json({ received: true })
  }
}
