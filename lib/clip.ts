import { SITE_URL } from '@/lib/marketing'

export const CLIP_API_BASE = 'https://api-gw.payclip.com'

export type ClipAuthMode = 'bearer' | 'basic' | 'headers'

export type ClipCheckoutResponse = {
  payment_request_id: string
  payment_request_url: string
  status: string
}

export type ClipCheckoutStatus = {
  payment_request_id: string
  status: string
  me_reference_id?: string
}

export type ClipApiFailure = {
  status: number
  message: string
  detail?: string
  raw: unknown
}

export class ClipApiError extends Error {
  readonly clip: ClipApiFailure

  constructor(clip: ClipApiFailure) {
    super(clip.message)
    this.name = 'ClipApiError'
    this.clip = clip
  }

  get isUnauthorized(): boolean {
    return this.clip.status === 401
  }
}

function resolveAuthMode(): ClipAuthMode {
  const mode = process.env.CLIP_AUTH_MODE?.trim().toLowerCase()
  if (mode === 'bearer' || mode === 'basic' || mode === 'headers') {
    return mode
  }
  // Checkout (api-gw.payclip.com) documenta x-api-key; bearer es fallback común en otras APIs Clip.
  return 'bearer'
}

function getClipCredentials() {
  const apiKey = process.env.CLIP_API_KEY?.trim()
  const apiSecret = process.env.CLIP_API_SECRET?.trim()
  return { apiKey, apiSecret }
}

/** Aísla el esquema de auth para cambiarlo vía CLIP_AUTH_MODE sin tocar el resto. */
export function buildClipAuthHeaders(): Record<string, string> {
  const { apiKey, apiSecret } = getClipCredentials()
  const mode = resolveAuthMode()

  if (!apiKey) {
    throw new ClipApiError({
      status: 0,
      message: 'CLIP_API_KEY no configurada',
      raw: null,
    })
  }

  if (mode === 'basic' && !apiSecret) {
    throw new ClipApiError({
      status: 0,
      message: 'CLIP_AUTH_MODE=basic requiere CLIP_API_SECRET',
      raw: null,
    })
  }

  const headers: Record<string, string> = {
    Accept: 'application/vnd.com.payclip.v2+json',
  }

  switch (mode) {
    case 'basic':
      headers.Authorization = `Basic ${Buffer.from(`${apiKey}:${apiSecret}`).toString('base64')}`
      break
    case 'headers':
      headers['x-api-key'] = apiKey
      if (apiSecret) headers['x-api-secret'] = apiSecret
      break
    case 'bearer':
    default:
      headers.Authorization = `Bearer ${apiKey}`
      break
  }

  return headers
}

function logClipDev(event: string, payload: Record<string, unknown>) {
  if (process.env.NODE_ENV !== 'development') return
  console.log(`[Clip] ${event}`, payload)
}

function logClipCredentialsDev(endpoint: string, method: string) {
  const { apiKey, apiSecret } = getClipCredentials()
  logClipDev('request', {
    endpoint,
    method,
    authMode: resolveAuthMode(),
    hasApiKey: Boolean(apiKey),
    apiKeyLength: apiKey?.length ?? 0,
    hasApiSecret: Boolean(apiSecret),
    apiSecretLength: apiSecret?.length ?? 0,
  })
}

function logClipErrorDev(status: number, raw: unknown) {
  if (process.env.NODE_ENV !== 'development') return
  console.error('[Clip] error response', { status, raw })
}

function unauthorizedMessage(): string {
  return 'Clip rechazó las credenciales. Revisa CLIP_API_KEY, CLIP_API_SECRET y si estás usando ambiente correcto.'
}

function parseClipFailure(
  status: number,
  raw: unknown
): ClipApiFailure {
  const body =
    raw && typeof raw === 'object'
      ? (raw as { message?: string; detail?: string })
      : {}

  const detail = body.detail ?? (typeof raw === 'string' ? raw : undefined)
  const apiMessage = body.message ?? detail ?? `Error HTTP ${status}`

  const message =
    status === 401 ? unauthorizedMessage() : apiMessage

  return {
    status,
    message,
    detail: detail ?? apiMessage,
    raw,
  }
}

async function clipFetch(
  path: string,
  init: RequestInit
): Promise<{ ok: true; data: unknown } | { ok: false; failure: ClipApiFailure }> {
  const endpoint = `${CLIP_API_BASE}${path}`
  logClipCredentialsDev(endpoint, init.method ?? 'GET')

  const res = await fetch(endpoint, init)
  let raw: unknown

  try {
    raw = await res.json()
  } catch {
    raw = { parseError: true, status: res.status }
  }

  if (!res.ok) {
    logClipErrorDev(res.status, raw)
    return { ok: false, failure: parseClipFailure(res.status, raw) }
  }

  return { ok: true, data: raw }
}

export async function createClipCheckout(params: {
  amount: number
  description: string
  reference: string
  customerEmail?: string
  customerName?: string
}): Promise<ClipCheckoutResponse> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, '') || SITE_URL
  const webhookUrl = `${siteUrl}/api/clip/webhook`

  const body = {
    amount: params.amount,
    currency: 'MXN',
    purchase_description: params.description.slice(0, 250),
    redirection_url: {
      success: `${siteUrl}/dashboard/pagos?pago=ok`,
      error: `${siteUrl}/dashboard/pagos?pago=error`,
      default: `${siteUrl}/dashboard/pagos`,
    },
    metadata: {
      me_reference_id: params.reference,
      ...(params.customerEmail
        ? {
            customer_info: {
              name: params.customerName ?? undefined,
              email: params.customerEmail,
            },
          }
        : {}),
    },
    webhook_url: webhookUrl,
  }

  const result = await clipFetch('/checkout', {
    method: 'POST',
    headers: {
      ...buildClipAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!result.ok) {
    throw new ClipApiError(result.failure)
  }

  const data = result.data as ClipCheckoutResponse & {
    message?: string
    detail?: string
  }

  if (!data.payment_request_url || !data.payment_request_id) {
    throw new ClipApiError({
      status: 502,
      message: 'Respuesta inválida de Clip',
      detail: 'Faltan payment_request_url o payment_request_id',
      raw: data,
    })
  }

  return data
}

export async function getClipCheckoutStatus(
  paymentRequestId: string
): Promise<ClipCheckoutStatus> {
  const result = await clipFetch(`/checkout/${paymentRequestId}`, {
    method: 'GET',
    headers: buildClipAuthHeaders(),
  })

  if (!result.ok) {
    throw new ClipApiError(result.failure)
  }

  const data = result.data as ClipCheckoutStatus & {
    message?: string
    detail?: string
    metadata?: { me_reference_id?: string }
  }

  return {
    payment_request_id: data.payment_request_id ?? paymentRequestId,
    status: data.status,
    me_reference_id: data.me_reference_id ?? data.metadata?.me_reference_id,
  }
}

export function clipStatusToMensualidadEstado(
  clipStatus: string
): 'pagado' | 'cancelado' | 'fallido' | 'iniciado' {
  const s = clipStatus.toUpperCase()
  if (s === 'CHECKOUT_COMPLETED' || s === 'COMPLETED') return 'pagado'
  if (s === 'CHECKOUT_CANCELLED' || s === 'CANCELED' || s === 'CANCELLED') {
    return 'cancelado'
  }
  if (s === 'CHECKOUT_EXPIRED' || s === 'EXPIRED') return 'fallido'
  return 'iniciado'
}

/** Expone el fallo en el formato pedido para logs/API. */
export function clipFailurePayload(error: unknown): ClipApiFailure | null {
  if (error instanceof ClipApiError) return error.clip
  return null
}
