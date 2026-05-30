import { SITE_URL } from '@/lib/marketing'

const DEFAULT_CLIP_BASE_URL = 'https://api.payclip.com/v2'
const DEFAULT_CLIP_CHECKOUT_PATH = '/checkout'

export type ClipAuthMode =
  | 'authorization_raw'
  | 'bearer'
  | 'basic'
  | 'headers'

export type ClipCheckoutResponse = {
  payment_request_id: string
  payment_request_url: string
  status: string
}

export type ClipCheckoutStatus = {
  payment_request_id: string
  status: string
  external_reference?: string
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

export function getClipBaseUrl(): string {
  return (
    process.env.CLIP_BASE_URL?.trim().replace(/\/$/, '') || DEFAULT_CLIP_BASE_URL
  )
}

export function getClipCheckoutPath(): string {
  const path = process.env.CLIP_CHECKOUT_PATH?.trim() || DEFAULT_CLIP_CHECKOUT_PATH
  return path.startsWith('/') ? path : `/${path}`
}

function resolveAuthMode(): ClipAuthMode {
  const mode = process.env.CLIP_AUTH_MODE?.trim().toLowerCase()
  if (
    mode === 'authorization_raw' ||
    mode === 'bearer' ||
    mode === 'basic' ||
    mode === 'headers'
  ) {
    return mode
  }
  return 'basic'
}

export function buildMensualidadClipReference(mensualidadId: string): string {
  return `MENSUALIDAD-${mensualidadId}-${Date.now()}`
}

function readString(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

/** Extrae external_reference del payload de webhook Clip (varios formatos). */
export function extractClipWebhookReference(body: unknown): string | null {
  if (!body || typeof body !== 'object') return null
  const root = body as Record<string, unknown>

  const metadata = root.metadata
  if (metadata && typeof metadata === 'object') {
    const ref = readString((metadata as Record<string, unknown>).external_reference)
    if (ref) return ref
  }

  const direct =
    readString(root.external_reference) ??
    readString(root.reference) ??
    readString(root.me_reference_id)
  if (direct) return direct

  const paymentRequest = root.payment_request
  if (paymentRequest && typeof paymentRequest === 'object') {
    const pr = paymentRequest as Record<string, unknown>
    const prMetadata = pr.metadata
    if (prMetadata && typeof prMetadata === 'object') {
      const ref = readString((prMetadata as Record<string, unknown>).external_reference)
      if (ref) return ref
    }
  }

  return null
}

export function extractClipWebhookPaymentId(body: unknown): string | null {
  if (!body || typeof body !== 'object') return null
  const root = body as Record<string, unknown>

  const direct = readString(root.payment_request_id)
  if (direct) return direct

  const paymentRequest = root.payment_request
  if (paymentRequest && typeof paymentRequest === 'object') {
    const pr = paymentRequest as Record<string, unknown>
    const nested =
      readString(pr.payment_request_id) ??
      readString(pr.id)
    if (nested) return nested
  }

  return null
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
    case 'authorization_raw':
      headers.Authorization = apiKey
      break
    case 'basic':
      headers.Authorization = `Basic ${Buffer.from(`${apiKey}:${apiSecret}`).toString('base64')}`
      break
    case 'headers':
      headers['x-api-key'] = apiKey
      if (apiSecret) headers['x-api-secret'] = apiSecret
      break
    case 'bearer':
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
  return 'Clip rechazó el token en Authorization. Revisa CLIP_API_KEY.'
}

function parseClipFailure(status: number, raw: unknown): ClipApiFailure {
  const body =
    raw && typeof raw === 'object'
      ? (raw as { message?: string; detail?: string })
      : {}

  const detail = body.detail ?? (typeof raw === 'string' ? raw : undefined)
  const apiMessage = body.message ?? detail ?? `Error HTTP ${status}`

  const message = status === 401 ? unauthorizedMessage() : apiMessage

  return {
    status,
    message,
    detail: detail ?? apiMessage,
    raw,
  }
}

function checkoutEndpoint(suffix = ''): string {
  const base = getClipBaseUrl()
  const path = getClipCheckoutPath()
  return `${base}${path}${suffix}`
}

async function clipFetch(
  url: string,
  init: RequestInit
): Promise<{ ok: true; data: unknown } | { ok: false; failure: ClipApiFailure }> {
  logClipCredentialsDev(url, init.method ?? 'GET')

  const res = await fetch(url, init)
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
      external_reference: params.reference,
      customer_info: {
        name: params.customerName ?? '',
        email: params.customerEmail ?? '',
      },
    },
    webhook_url: webhookUrl,
  }

  const result = await clipFetch(checkoutEndpoint(), {
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
  const result = await clipFetch(checkoutEndpoint(`/${paymentRequestId}`), {
    method: 'GET',
    headers: buildClipAuthHeaders(),
  })

  if (!result.ok) {
    throw new ClipApiError(result.failure)
  }

  const data = result.data as ClipCheckoutStatus & {
    message?: string
    detail?: string
    metadata?: { external_reference?: string; me_reference_id?: string }
  }

  return {
    payment_request_id: data.payment_request_id ?? paymentRequestId,
    status: data.status,
    external_reference:
      data.external_reference ??
      data.metadata?.external_reference ??
      data.metadata?.me_reference_id,
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
