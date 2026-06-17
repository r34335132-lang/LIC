import type { MetodoPago, EstadoPagoMensualidad } from '@/types/database'

export const INSCRIPCION_APARTADO_OK_MESSAGE =
  '¡Lugar apartado! Recibimos tu pago. Te contactaremos pronto para completar tu admisión.'

export function buildInscripcionPaymentReference(inscripcionId: string): string {
  return `INSCRIPCION-${inscripcionId}-${Date.now()}`
}

export function parseInscripcionIdFromReference(reference: string): string | null {
  if (!reference.startsWith('INSCRIPCION-')) return null
  const parts = reference.split('-')
  return parts[1] ?? null
}

export function inscripcionApartadoPagado(inscripcion: {
  estado?: string
  estado_pago?: string | null
  apartado_pagado_at?: string | null
}): boolean {
  return (
    inscripcion.estado === 'apartado' ||
    inscripcion.estado_pago === 'pagado' ||
    !!inscripcion.apartado_pagado_at
  )
}

export type InscripcionPaymentUpdate = {
  metodo_pago: MetodoPago
  estado_pago: EstadoPagoMensualidad
  pago_error_mensaje?: string | null
  mp_checkout_url?: string | null
  mp_reference?: string | null
  mp_preference_id?: string | null
  mp_payment_id?: string | null
  clip_checkout_url?: string | null
  clip_reference?: string | null
  clip_payment_id?: string | null
  apartado_monto?: number | null
}

export function buildInscripcionPaymentUpdate(
  payload: InscripcionPaymentUpdate
): Record<string, unknown> {
  const updates: Record<string, unknown> = {
    metodo_pago: payload.metodo_pago,
    estado_pago: payload.estado_pago,
    pago_error_mensaje: payload.pago_error_mensaje ?? null,
  }

  if (payload.apartado_monto != null) updates.apartado_monto = payload.apartado_monto

  if (payload.estado_pago === 'pagado') {
    updates.estado = 'apartado'
    updates.apartado_pagado_at = new Date().toISOString()
  }

  if (payload.mp_checkout_url !== undefined) updates.mp_checkout_url = payload.mp_checkout_url
  if (payload.mp_reference !== undefined) updates.mp_reference = payload.mp_reference
  if (payload.mp_preference_id !== undefined) updates.mp_preference_id = payload.mp_preference_id
  if (payload.mp_payment_id !== undefined) updates.mp_payment_id = payload.mp_payment_id
  if (payload.clip_checkout_url !== undefined) {
    updates.clip_checkout_url = payload.clip_checkout_url
  }
  if (payload.clip_reference !== undefined) updates.clip_reference = payload.clip_reference
  if (payload.clip_payment_id !== undefined) updates.clip_payment_id = payload.clip_payment_id

  return updates
}
