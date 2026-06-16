import type { MetodoPago, EstadoPagoMensualidad } from '@/types/database'

export const CLIP_DECLINED_USER_MESSAGE =
  'Tu banco rechazó la operación. Intenta con otra tarjeta o paga con Mercado Pago.'

export function buildMensualidadPaymentReference(mensualidadId: string): string {
  return `MENSUALIDAD-${mensualidadId}-${Date.now()}`
}

export function parseMensualidadIdFromReference(reference: string): string | null {
  if (!reference.startsWith('MENSUALIDAD-')) return null
  const parts = reference.split('-')
  return parts[1] ?? null
}

export type PaymentUpdatePayload = {
  metodo_pago: MetodoPago
  estado_pago: EstadoPagoMensualidad
  pago_error_mensaje?: string | null
  clip_checkout_url?: string | null
  clip_reference?: string | null
  clip_payment_id?: string | null
  mp_checkout_url?: string | null
  mp_reference?: string | null
  mp_preference_id?: string | null
  mp_payment_id?: string | null
}

/** Mapea estado_pago al campo legacy `estado` sin marcar pagado salvo confirmación. */
export function legacyEstadoFromEstadoPago(
  estadoPago: EstadoPagoMensualidad,
  currentEstado?: string
): string {
  switch (estadoPago) {
    case 'pagado':
      return 'pagado'
    case 'declinado':
    case 'error':
      return currentEstado === 'iniciado' ? 'pendiente' : (currentEstado ?? 'pendiente')
    case 'pendiente':
    default:
      return 'iniciado'
  }
}

export function buildPaymentUpdateRecord(
  payload: PaymentUpdatePayload,
  currentEstado?: string
): Record<string, unknown> {
  const updates: Record<string, unknown> = {
    metodo_pago: payload.metodo_pago,
    estado_pago: payload.estado_pago,
    pago_error_mensaje: payload.pago_error_mensaje ?? null,
    estado: legacyEstadoFromEstadoPago(payload.estado_pago, currentEstado),
  }

  if (payload.estado_pago === 'pagado') {
    updates.paid_at = new Date().toISOString()
  }

  if (payload.clip_checkout_url !== undefined) updates.clip_checkout_url = payload.clip_checkout_url
  if (payload.clip_reference !== undefined) updates.clip_reference = payload.clip_reference
  if (payload.clip_payment_id !== undefined) updates.clip_payment_id = payload.clip_payment_id
  if (payload.mp_checkout_url !== undefined) updates.mp_checkout_url = payload.mp_checkout_url
  if (payload.mp_reference !== undefined) updates.mp_reference = payload.mp_reference
  if (payload.mp_preference_id !== undefined) updates.mp_preference_id = payload.mp_preference_id
  if (payload.mp_payment_id !== undefined) updates.mp_payment_id = payload.mp_payment_id

  return updates
}
