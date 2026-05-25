export const WHATSAPP_PHONE = '526181234567'

export const DEFAULT_WHATSAPP_MESSAGE =
  'Hola, quiero información sobre los programas con RVOE del Instituto Universitario de Durango.'

export const RVOE_CONSULTA_URL = 'https://sirvoes.sep.gob.mx/sirvoes/mvc/consultas'

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://institutouniversitariodedurango.edu.mx'

export const RESERVATION_AMOUNT_MXN = 600

export const CLIP_PAYMENT_URL = process.env.NEXT_PUBLIC_CLIP_PAYMENT_URL || ''

export type MarketingEvent =
  | 'click_whatsapp'
  | 'submit_form'
  | 'view_program'
  | 'download_plan'
  | 'start_clip_payment'

export function buildWhatsAppUrl(message = DEFAULT_WHATSAPP_MESSAGE) {
  return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`
}

export function getProgramWhatsAppMessage(programName: string, rvoe?: string) {
  const officialText = rvoe ? ` con RVOE ${rvoe}` : ' con validez oficial'

  return `Hola, quiero información sobre ${programName}${officialText} del Instituto Universitario de Durango.`
}

export function buildClipPaymentUrl({
  programId,
  programName,
}: {
  programId?: string
  programName?: string
} = {}) {
  if (CLIP_PAYMENT_URL) {
    return CLIP_PAYMENT_URL
      .replace('{programId}', encodeURIComponent(programId || ''))
      .replace('{programName}', encodeURIComponent(programName || ''))
      .replace('{amount}', String(RESERVATION_AMOUNT_MXN))
  }

  const params = new URLSearchParams({
    apartar: String(RESERVATION_AMOUNT_MXN),
  })

  if (programId) params.set('programa', programId)

  return `/inscripcion?${params.toString()}`
}

export function trackEvent(event: MarketingEvent, payload?: Record<string, unknown>) {
  if (typeof window === 'undefined') return

  const data = payload || {}
  const win = window as Window & {
    gtag?: (...args: unknown[]) => void
    fbq?: (...args: unknown[]) => void
    dataLayer?: Record<string, unknown>[]
  }

  win.dataLayer = win.dataLayer || []
  win.dataLayer.push({ event, ...data })

  win.gtag?.('event', event, data)
  win.fbq?.('trackCustom', event, data)
}
