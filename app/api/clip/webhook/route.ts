import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  clipStatusToMensualidadEstado,
  getClipCheckoutStatus,
} from '@/lib/clip'

type ClipWebhookPayload = {
  payment_request_id?: string
  me_reference_id?: string
  resource_status?: string
  resource?: string
}

async function actualizarMensualidadPorReferencia(
  reference: string,
  paymentRequestId: string | null
) {
  if (!reference.startsWith('MENSUALIDAD-')) return

  const admin = createAdminClient()
  const { data: mensualidad } = await admin
    .from('mensualidades')
    .select('id, clip_payment_id, estado')
    .eq('clip_reference', reference)
    .maybeSingle()

  if (!mensualidad) {
    const parts = reference.split('-')
    const mensualidadId = parts[1]
    if (!mensualidadId) return

    const { data: byId } = await admin
      .from('mensualidades')
      .select('id, clip_payment_id, estado')
      .eq('id', mensualidadId)
      .maybeSingle()

    if (!byId) return
    await procesarEstadoClip(byId.id, paymentRequestId ?? byId.clip_payment_id)
    return
  }

  await procesarEstadoClip(
    mensualidad.id,
    paymentRequestId ?? mensualidad.clip_payment_id
  )
}

async function procesarEstadoClip(
  mensualidadId: string,
  paymentRequestId: string | null
) {
  if (!paymentRequestId) return

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
  try {
    const webhookSecret = process.env.CLIP_WEBHOOK_SECRET?.trim()
    if (webhookSecret) {
      const signature = request.headers.get('x-clip-signature')
      if (signature !== webhookSecret) {
        return NextResponse.json({ error: 'Firma inválida' }, { status: 401 })
      }
    }

    const body = (await request.json()) as ClipWebhookPayload
    const paymentRequestId = body.payment_request_id ?? null
    const reference = body.me_reference_id ?? null

    if (reference) {
      await actualizarMensualidadPorReferencia(reference, paymentRequestId)
    } else if (paymentRequestId) {
      const admin = createAdminClient()
      const { data: mensualidad } = await admin
        .from('mensualidades')
        .select('id, clip_reference, clip_payment_id')
        .eq('clip_payment_id', paymentRequestId)
        .maybeSingle()

      if (mensualidad?.clip_reference) {
        await procesarEstadoClip(mensualidad.id, paymentRequestId)
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Clip webhook error:', error)
    return NextResponse.json({ received: true })
  }
}
