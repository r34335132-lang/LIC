import type { EstadoPagoMensualidad } from '@/types/database'

const DEFAULT_CLIP_BASE_URL = 'https://api-gw.payclip.com'
const DEFAULT_CLIP_CHECKOUT_PATH = '/checkout'
const PRODUCTION_SITE_URL = 'https://lic-two.vercel.app'

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
  failure_reason?: string
  error_message?: string
}

export type ClipApiFailure = {
  status: number
  message: string
  detail?: string
  body: unknown
  sanitizedPayload?: Record<string, unknown>
}

export type ClipConfiguration = {
  authMode: ClipAuthMode
  baseUrl: string
  checkoutPath: string
  siteUrl: string
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

export function resolveClipAuthMode(): ClipAuthMode {
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
  const mode = resolveClipAuthMode()

  if (!apiKey) {
    throw new ClipApiError({
      status: 0,
      message: 'CLIP_API_KEY no configurada',
      body: null,
    })
  }

  if (mode === 'basic' && !apiSecret) {
    throw new ClipApiError({
      status: 0,
      message: 'CLIP_AUTH_MODE=basic requiere CLIP_API_SECRET',
      body: null,
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
    authMode: resolveClipAuthMode(),
    hasApiKey: Boolean(apiKey),
    apiKeyLength: apiKey?.length ?? 0,
    hasApiSecret: Boolean(apiSecret),
    apiSecretLength: apiSecret?.length ?? 0,
  })
}

function unauthorizedMessage(): string {
  return 'Clip rechazó la autenticación. Revisa CLIP_API_KEY, CLIP_API_SECRET y CLIP_AUTH_MODE.'
}

function parseClipFailure(status: number, raw: unknown): ClipApiFailure {
  const body =
    raw && typeof raw === 'object'
      ? (raw as Record<string, unknown>)
      : {}
  const nestedError =
    body.error && typeof body.error === 'object'
      ? (body.error as Record<string, unknown>)
      : {}
  const detail =
    readString(body.detail) ??
    readString(body.error_description) ??
    readString(nestedError.detail) ??
    readString(nestedError.message) ??
    (typeof raw === 'string' ? raw : undefined)
  const apiMessage =
    readString(body.message) ??
    readString(body.error) ??
    detail ??
    `Error HTTP ${status}`
  const message =
    status === 401 || status === 403
      ? unauthorizedMessage()
      : status === 400
        ? `Clip rechazó el payload: ${apiMessage}`
        : apiMessage

  return {
    status,
    message,
    detail: detail ?? apiMessage,
    body: raw,
  }
}

export function getClipConfiguration(): ClipConfiguration {
  const { apiKey, apiSecret } = getClipCredentials()
  const authMode = resolveClipAuthMode()
  const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(
    /\/+$/,
    ''
  )
  const siteUrl =
    process.env.NODE_ENV === 'production'
      ? PRODUCTION_SITE_URL
      : configuredSiteUrl

  if (!apiKey) {
    throw new ClipApiError({
      status: 0,
      message: 'Falta la variable de entorno CLIP_API_KEY',
      body: null,
    })
  }

  if (!siteUrl) {
    throw new ClipApiError({
      status: 0,
      message: 'Falta la variable de entorno NEXT_PUBLIC_SITE_URL',
      body: null,
    })
  }

  if (authMode === 'basic' && !apiSecret) {
    throw new ClipApiError({
      status: 0,
      message: 'CLIP_AUTH_MODE=basic requiere CLIP_API_SECRET',
      body: null,
    })
  }

  try {
    const parsedSiteUrl = new URL(siteUrl)
    if (
      process.env.NODE_ENV === 'production' &&
      parsedSiteUrl.origin !== PRODUCTION_SITE_URL
    ) {
      throw new Error('URL de producción incorrecta')
    }
  } catch {
    throw new ClipApiError({
      status: 0,
      message: `NEXT_PUBLIC_SITE_URL debe ser ${PRODUCTION_SITE_URL} en producción`,
      body: null,
    })
  }

  return {
    authMode,
    baseUrl: getClipBaseUrl(),
    checkoutPath: getClipCheckoutPath(),
    siteUrl,
  }
}

function checkoutEndpoint(suffix = ''): string {
  const base = getClipBaseUrl()
  const path = getClipCheckoutPath()
  return `${base}${path}${suffix}`
}

async function clipFetch(
  url: string,
  init: RequestInit,
  sanitizedPayload?: Record<string, unknown>
): Promise<unknown> {
  logClipCredentialsDev(url, init.method ?? 'GET')

  let response: Response
  try {
    response = await fetch(url, init)
  } catch {
    throw new ClipApiError({
      status: 0,
      message: 'No se pudo conectar con Clip',
      body: null,
      sanitizedPayload,
    })
  }

  const rawText = await response.text()
  let parsed: unknown = null

  if (rawText) {
    try {
      parsed = JSON.parse(rawText)
    } catch {
      parsed = rawText
    }
  }

  if (!response.ok) {
    throw new ClipApiError({
      ...parseClipFailure(response.status, parsed),
      sanitizedPayload,
    })
  }

  return parsed
}

export async function createClipCheckout(params: {
  amount: number
  currency?: 'MXN'
  description: string
  reference: string
  customerEmail?: string
  customerName?: string
}): Promise<ClipCheckoutResponse> {
  const { siteUrl } = getClipConfiguration()
  const webhookUrl = `${siteUrl}/api/clip/webhook`

  const body = {
    amount: params.amount,
    currency: params.currency ?? 'MXN',
    purchase_description: params.description.slice(0, 250),
    redirection_url: {
      success: `${siteUrl}/dashboard/pagos?pago=ok&metodo=clip`,
      error: `${siteUrl}/dashboard/pagos?pago=declinado&metodo=clip`,
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

  console.info('[Clip] checkout payload', {
    amount: body.amount,
    currency: body.currency,
    description: body.purchase_description,
    redirection_url: body.redirection_url,
    metadata: {
      external_reference: body.metadata.external_reference,
    },
    webhook_url: body.webhook_url,
  })

  const data = (await clipFetch(
    checkoutEndpoint(),
    {
      method: 'POST',
      headers: {
        ...buildClipAuthHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    },
    {
      amount: body.amount,
      currency: body.currency,
      purchase_description: body.purchase_description,
      redirection_url: body.redirection_url,
      external_reference: body.metadata.external_reference,
      webhook_url: body.webhook_url,
    }
  )) as ClipCheckoutResponse & {
    message?: string
    detail?: string
  }

  if (!data.payment_request_url || !data.payment_request_id) {
    throw new ClipApiError({
      status: 502,
      message: 'Respuesta inválida de Clip',
      detail: 'Faltan payment_request_url o payment_request_id',
      body: data,
    })
  }

  return data
}

export async function getClipCheckoutStatus(
  paymentRequestId: string
): Promise<ClipCheckoutStatus> {
  const data = (await clipFetch(checkoutEndpoint(`/${paymentRequestId}`), {
    method: 'GET',
    headers: buildClipAuthHeaders(),
  })) as ClipCheckoutStatus & {
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
    failure_reason: readString(
      (data as { failure_reason?: unknown }).failure_reason
    ) ?? undefined,
    error_message: readString(
      (data as { error_message?: unknown; message?: unknown }).error_message ??
        (data as { message?: unknown }).message
    ) ?? undefined,
  }
}

export function clipStatusToEstadoPago(clipStatus: string): EstadoPagoMensualidad {
  const s = clipStatus.toUpperCase()
  if (s === 'CHECKOUT_COMPLETED' || s === 'COMPLETED' || s === 'PAID') {
    return 'pagado'
  }
  if (
    s.includes('DECLIN') ||
    s.includes('REJECT') ||
    s === 'FAILED' ||
    s === 'CHECKOUT_FAILED' ||
    s === 'PAYMENT_DECLINED'
  ) {
    return 'declinado'
  }
  if (
    s === 'CHECKOUT_CANCELLED' ||
    s === 'CANCELED' ||
    s === 'CANCELLED' ||
    s === 'CHECKOUT_EXPIRED' ||
    s === 'EXPIRED'
  ) {
    return 'error'
  }
  return 'pendiente'
}

export function clipCheckoutErrorMessage(status: ClipCheckoutStatus): string | null {
  const parts = [status.status, status.failure_reason, status.error_message].filter(
    Boolean
  )
  return parts.length > 0 ? parts.join(' — ') : null
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
