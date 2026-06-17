import { createAdminClient } from '@/lib/supabase/admin'
import type { MercadoPagoPayment } from '@/lib/mercadopago'
import { mercadoPagoErrorMessage, mercadoPagoStatusToEstadoPago } from '@/lib/mercadopago'
import {
  buildInscripcionPaymentUpdate,
  inscripcionApartadoPagado,
  parseInscripcionIdFromReference,
} from '@/lib/inscripciones-pago'

type AdminClient = ReturnType<typeof createAdminClient>

export function isInscripcionPaymentReference(reference: string | null | undefined): boolean {
  return !!reference?.startsWith('INSCRIPCION-')
}

async function findInscripcionByReference(
  admin: AdminClient,
  reference: string
) {
  const { data: byRef } = await admin
    .from('inscripciones')
    .select('*')
    .eq('mp_reference', reference)
    .maybeSingle()
  if (byRef?.id) return byRef

  const { data: byClipRef } = await admin
    .from('inscripciones')
    .select('*')
    .eq('clip_reference', reference)
    .maybeSingle()
  if (byClipRef?.id) return byClipRef

  const inscripcionId = parseInscripcionIdFromReference(reference)
  if (!inscripcionId) return null

  const { data: byId } = await admin
    .from('inscripciones')
    .select('*')
    .eq('id', inscripcionId)
    .maybeSingle()

  return byId
}

async function findInscripcionByMpPaymentId(admin: AdminClient, paymentId: string) {
  const { data } = await admin
    .from('inscripciones')
    .select('*')
    .eq('mp_payment_id', paymentId)
    .maybeSingle()
  return data
}

export async function actualizarInscripcionDesdePago(
  payment: MercadoPagoPayment
): Promise<boolean> {
  const paymentId = String(payment.id)
  const estadoPago = mercadoPagoStatusToEstadoPago(
    payment.status,
    payment.status_detail
  )
  const errorMsg =
    estadoPago === 'pagado' ? null : mercadoPagoErrorMessage(payment)

  console.info('[MP webhook] inscripción — procesando pago', {
    payment_id: paymentId,
    external_reference: payment.external_reference ?? null,
    estado_pago: estadoPago,
  })

  const admin = createAdminClient()
  let inscripcion = payment.external_reference
    ? await findInscripcionByReference(admin, payment.external_reference)
    : null

  if (!inscripcion) {
    inscripcion = await findInscripcionByMpPaymentId(admin, paymentId)
  }

  if (!inscripcion) {
    console.warn('[MP webhook] inscripción no encontrada', {
      payment_id: paymentId,
      external_reference: payment.external_reference ?? null,
    })
    return false
  }

  if (inscripcionApartadoPagado(inscripcion)) {
    console.info('[MP webhook] inscripción ya apartada; idempotente skip', {
      inscripcion_id: inscripcion.id,
      payment_id: paymentId,
    })
    return true
  }

  const { data: updated, error } = await admin
    .from('inscripciones')
    .update(
      buildInscripcionPaymentUpdate({
        metodo_pago: 'mercado_pago',
        estado_pago: estadoPago,
        pago_error_mensaje: errorMsg,
        mp_payment_id: paymentId,
      })
    )
    .eq('id', inscripcion.id)
    .neq('estado_pago', 'pagado')
    .select('id')
    .maybeSingle()

  if (error) {
    console.error('[MP webhook] error al actualizar inscripción', {
      inscripcion_id: inscripcion.id,
      error: error.message,
    })
    return false
  }

  if (!updated) {
    console.info('[MP webhook] inscripción no actualizada (ya pagada concurrente)', {
      inscripcion_id: inscripcion.id,
    })
    return true
  }

  console.info('[MP webhook] inscripción actualizada', {
    inscripcion_id: inscripcion.id,
    payment_id: paymentId,
    estado_pago: estadoPago,
    estado: estadoPago === 'pagado' ? 'apartado' : inscripcion.estado,
  })

  return true
}

export async function actualizarInscripcionDesdeClip(
  inscripcionId: string,
  paymentRequestId: string,
  estadoPago: 'pagado' | 'pendiente' | 'declinado' | 'error',
  errorMsg: string | null
): Promise<boolean> {
  const admin = createAdminClient()

  const { data: inscripcion } = await admin
    .from('inscripciones')
    .select('*')
    .eq('id', inscripcionId)
    .maybeSingle()

  if (!inscripcion) {
    console.warn('[Clip webhook] inscripción no encontrada', { inscripcionId })
    return false
  }

  if (inscripcionApartadoPagado(inscripcion)) {
    console.info('[Clip webhook] inscripción ya apartada; idempotente skip', {
      inscripcion_id: inscripcionId,
    })
    return true
  }

  const { error } = await admin
    .from('inscripciones')
    .update(
      buildInscripcionPaymentUpdate({
        metodo_pago: 'clip',
        estado_pago: estadoPago,
        pago_error_mensaje: errorMsg,
        clip_payment_id: paymentRequestId,
      })
    )
    .eq('id', inscripcionId)
    .neq('estado_pago', 'pagado')

  if (error) {
    console.error('[Clip webhook] error al actualizar inscripción', {
      inscripcion_id: inscripcionId,
      error: error.message,
    })
    return false
  }

  console.info('[Clip webhook] inscripción actualizada', {
    inscripcion_id: inscripcionId,
    estado_pago: estadoPago,
  })

  return true
}

export async function resolveInscripcionIdFromReference(
  admin: AdminClient,
  reference: string
): Promise<string | null> {
  const row = await findInscripcionByReference(admin, reference)
  return row?.id ?? null
}
