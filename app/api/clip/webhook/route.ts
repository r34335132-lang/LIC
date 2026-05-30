import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  clipStatusToMensualidadEstado,
  extractClipWebhookPaymentId,
  extractClipWebhookReference,
  getClipCheckoutStatus,
} from '@/lib/clip'

async function findMensualidadId(reference: string): Promise<string | null> {
  if (!reference.startsWith('MENSUALIDAD-')) return null

  const admin = createAdminClient()

  const { data: byRef } = await admin
    .from('mensualidades')
    .select('id')
    .eq('clip_reference', reference)
    .maybeSingle()

  if (byRef?.id) return byRef.id

  const parts = reference.split('-')
  const mensualidadId = parts[1]
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
): Promise<string | null> {
  const admin = createAdminClient()
  const { data } = await admin
    .from('mensualidades')
    .select('id')
    .eq('clip_payment_id', paymentRequestId)
    .maybeSingle()

  return data?.id ?? null
}

async function procesarMensualidadPagada(
  mensualidadId: string,
  paymentRequestId: string
) {
  const clipStatus = await getClipCheckoutStatus(paymentRequestId)
  const nuevoEstado = clipStatusToMensualidadEstado(clipStatus.status)

  const admin = createAdminClient()
  const updates: Record<string, unknown> = {
    clip_payment_id: paymentRequestId,
  }

  if (nuevoEstado === 'pagado') {
    updates.estado = 'pagado'
    updates.paid_at = new Date().toISOString()
  } else if (nuevoEstado === 'cancelado') {
    updates.estado = 'cancelado'
  } else if (nuevoEstado === 'fallido') {
    updates.estado = 'vencido'
  } else {
    updates.estado = 'iniciado'
  }

  await admin.from('mensualidades').update(updates).eq('id', mensualidadId)
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

    if (!reference) {
      console.warn(
        '[Clip webhook] Sin reference; usando payment_request_id para lookup. Body:',
        JSON.stringify(body)
      )
    }

    let mensualidadId: string | null = null

    if (reference?.startsWith('MENSUALIDAD-')) {
      mensualidadId = await findMensualidadId(reference)
    }

    if (!mensualidadId && paymentRequestId) {
      mensualidadId = await findMensualidadByPaymentId(paymentRequestId)
    }

    if (!mensualidadId) {
      console.warn('[Clip webhook] Mensualidad no encontrada.', {
        reference,
        paymentRequestId,
      })
      return NextResponse.json({ received: true })
    }

    if (!paymentRequestId) {
      console.warn('[Clip webhook] payment_request_id ausente; no se puede verificar con Clip.', {
        reference,
        mensualidadId,
      })
      return NextResponse.json({ received: true })
    }

    await procesarMensualidadPagada(mensualidadId, paymentRequestId)

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('[Clip webhook] error:', error)
    if (body !== undefined) {
      console.warn('[Clip webhook] Body recibido:', JSON.stringify(body))
    }
    return NextResponse.json({ received: true })
  }
}
