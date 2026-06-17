import { RESERVATION_AMOUNT_MXN } from '@/lib/marketing'
import { mensualidadMontoDefault } from '@/lib/academico-utils'

export function montoApartadoInscripcion(): number {
  return mensualidadMontoDefault() || RESERVATION_AMOUNT_MXN
}

export function inscripcionCheckoutBaseUrl(siteUrl: string): string {
  return `${siteUrl.replace(/\/+$/, '')}/inscripcion`
}

export function inscripcionCheckoutReturnUrl(
  siteUrl: string,
  inscripcionId: string,
  result: 'ok' | 'declinado' | 'pendiente',
  metodo: 'mercadopago' | 'clip'
): string {
  const base = inscripcionCheckoutBaseUrl(siteUrl)
  return `${base}?pago=${result}&id=${inscripcionId}&metodo=${metodo}`
}
