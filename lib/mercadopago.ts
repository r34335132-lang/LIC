import { SITE_URL } from '@/lib/marketing'
import { buildMensualidadPaymentReference } from '@/lib/mensualidades-pago'
import {
  MercadoPagoApiError,
  resolvePreferenceCheckoutUrl,
  validateMercadoPagoConfig,
} from '@/lib/mercadopago-config'

const MP_API = 'https://api.mercadopago.com'

export type MercadoPagoPreferenceResponse = {
  id: string
  init_point: string
  sandbox_init_point?: string
}

export type MercadoPagoPayment = {
  id: number | string
  status: string
  status_detail?: string
  external_reference?: string
  transaction_amount?: number
}

export type MercadoPagoMerchantOrderPayment = {
  id: number | string
  status: string
}

export type MercadoPagoMerchantOrder = {
  id: number | string
  status?: string
  external_reference?: string
  payments?: MercadoPagoMerchantOrderPayment[]
}

export { MercadoPagoApiError } from '@/lib/mercadopago-config'

function getSiteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/+$/, '') ||
    process.env.MP_SITE_URL?.trim().replace(/\/+$/, '') ||
    SITE_URL
  )
}

function checkoutBaseUrl(): string {
  return `${getSiteUrl()}/dashboard/pagos`
}

async function mpFetch<T>(
  path: string,
  accessToken: string,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(`${MP_API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  })

  const text = await res.text()
  let body: unknown = null
  if (text) {
    try {
      body = JSON.parse(text)
    } catch {
      body = text
    }
  }

  if (!res.ok) {
    const message =
      body && typeof body === 'object' && 'message' in body
        ? String((body as { message: unknown }).message)
        : `Error Mercado Pago HTTP ${res.status}`
    throw new MercadoPagoApiError(message, res.status, body)
  }

  return body as T
}

export async function createMercadoPagoPreference(params: {
  mensualidadId: string
  title: string
  amount: number
  payerEmail?: string
}): Promise<{ preferenceId: string; checkoutUrl: string; reference: string }> {
  const config = validateMercadoPagoConfig()
  const siteUrl = getSiteUrl()
  const reference = buildMensualidadPaymentReference(params.mensualidadId)
  const base = checkoutBaseUrl()

  const payload = {
    items: [
      {
        id: params.mensualidadId,
        title: params.title.slice(0, 256),
        quantity: 1,
        unit_price: params.amount,
        currency_id: 'MXN',
      },
    ],
    payer: params.payerEmail ? { email: params.payerEmail } : undefined,
    external_reference: reference,
    back_urls: {
      success: `${base}?pago=ok&metodo=mercadopago`,
      failure: `${base}?pago=declinado&metodo=mercadopago`,
      pending: `${base}?pago=pendiente&metodo=mercadopago`,
    },
    auto_return: 'approved',
    notification_url: `${siteUrl}/api/mercadopago/webhook`,
  }

  const data = await mpFetch<MercadoPagoPreferenceResponse>(
    '/checkout/preferences',
    config.accessToken,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    }
  )

  const checkoutUrl = resolvePreferenceCheckoutUrl(data, config.sandbox)

  if (!data.id || !checkoutUrl) {
    throw new MercadoPagoApiError('Respuesta inválida de Mercado Pago', 502, data)
  }

  return { preferenceId: data.id, checkoutUrl, reference }
}

export async function getMercadoPagoPayment(
  paymentId: string | number
): Promise<MercadoPagoPayment> {
  const config = validateMercadoPagoConfig()
  return mpFetch<MercadoPagoPayment>(
    `/v1/payments/${paymentId}`,
    config.accessToken
  )
}

export async function getMercadoPagoMerchantOrder(
  merchantOrderId: string | number
): Promise<MercadoPagoMerchantOrder> {
  const config = validateMercadoPagoConfig()
  return mpFetch<MercadoPagoMerchantOrder>(
    `/merchant_orders/${merchantOrderId}`,
    config.accessToken
  )
}

const MERCHANT_ORDER_TOPICS = new Set(['merchant_order', 'topic_merchant_order_wh'])
const PAYMENT_TOPICS = new Set(['payment', 'topic_payment_wh'])

export function isMercadoPagoMerchantOrderTopic(topic: string): boolean {
  return MERCHANT_ORDER_TOPICS.has(topic.trim().toLowerCase())
}

export function isMercadoPagoPaymentTopic(topic: string): boolean {
  return PAYMENT_TOPICS.has(topic.trim().toLowerCase())
}

export function mercadoPagoStatusToEstadoPago(
  status: string,
  statusDetail?: string
): 'pagado' | 'pendiente' | 'declinado' | 'error' {
  const s = status.toLowerCase()
  if (s === 'approved') return 'pagado'
  if (s === 'rejected') return 'declinado'
  if (s === 'cancelled' || s === 'refunded' || s === 'charged_back') return 'error'
  if (s === 'pending' || s === 'in_process' || s === 'in_mediation') return 'pendiente'

  const detail = (statusDetail ?? '').toLowerCase()
  if (detail.includes('bank') || detail.includes('rejected')) return 'declinado'
  return 'pendiente'
}

export function mercadoPagoErrorMessage(payment: MercadoPagoPayment): string | null {
  const parts = [payment.status, payment.status_detail].filter(Boolean)
  return parts.length > 0 ? parts.join(' — ') : null
}

export {
  canReuseMercadoPagoCheckoutUrl,
  validateMercadoPagoConfig,
} from '@/lib/mercadopago-config'
