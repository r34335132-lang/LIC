import { SITE_URL } from '@/lib/marketing'
import { buildMensualidadPaymentReference } from '@/lib/mensualidades-pago'

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

export class MercadoPagoApiError extends Error {
  readonly status: number
  readonly body: unknown

  constructor(message: string, status: number, body: unknown) {
    super(message)
    this.name = 'MercadoPagoApiError'
    this.status = status
    this.body = body
  }
}

function getAccessToken(): string {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN?.trim()
  if (!token) {
    throw new MercadoPagoApiError('MERCADOPAGO_ACCESS_TOKEN no configurado', 0, null)
  }
  return token
}

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

async function mpFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${MP_API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${getAccessToken()}`,
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

  const data = await mpFetch<MercadoPagoPreferenceResponse>('/checkout/preferences', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

  const checkoutUrl =
    process.env.MERCADOPAGO_SANDBOX === 'true' && data.sandbox_init_point
      ? data.sandbox_init_point
      : data.init_point

  if (!data.id || !checkoutUrl) {
    throw new MercadoPagoApiError('Respuesta inválida de Mercado Pago', 502, data)
  }

  return { preferenceId: data.id, checkoutUrl, reference }
}

export async function getMercadoPagoPayment(
  paymentId: string | number
): Promise<MercadoPagoPayment> {
  return mpFetch<MercadoPagoPayment>(`/v1/payments/${paymentId}`)
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
