export type MercadoPagoRuntimeConfig = {
  sandbox: boolean
  accessToken: string
  publicKey: string
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

const TEST_CREDENTIAL_PREFIX = 'TEST-'
const PRODUCTION_ACCESS_PREFIX = 'APP_USR-'
const PRODUCTION_PUBLIC_PREFIX = 'APP_USR-'

export function isMercadoPagoTestCredential(value: string): boolean {
  return value.trim().toUpperCase().startsWith(TEST_CREDENTIAL_PREFIX)
}

export function isMercadoPagoSandboxMode(): boolean {
  return process.env.MERCADOPAGO_SANDBOX?.trim().toLowerCase() === 'true'
}

export function isSandboxCheckoutUrl(url: string): boolean {
  try {
    const hostname = new URL(url).hostname.toLowerCase()
    return hostname.includes('sandbox.mercadopago') || hostname.startsWith('sandbox.')
  } catch {
    return url.toLowerCase().includes('sandbox')
  }
}

export function readMercadoPagoPublicKey(): string {
  return (
    process.env.MERCADOPAGO_PUBLIC_KEY?.trim() ||
    process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY?.trim() ||
    ''
  )
}

export function readClientMercadoPagoPublicKey(): string {
  return process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY?.trim() || ''
}

export function validateMercadoPagoConfig(): MercadoPagoRuntimeConfig {
  const sandbox = isMercadoPagoSandboxMode()
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN?.trim() ?? ''
  const publicKey = readMercadoPagoPublicKey()
  const clientPublicKey = readClientMercadoPagoPublicKey()

  if (!accessToken) {
    throw new MercadoPagoApiError(
      sandbox
        ? 'MERCADOPAGO_ACCESS_TOKEN no configurado'
        : 'MERCADOPAGO_ACCESS_TOKEN de producción no configurado',
      0,
      null
    )
  }

  if (isMercadoPagoTestCredential(accessToken)) {
    if (!sandbox) {
      throw new MercadoPagoApiError(
        'MERCADOPAGO_ACCESS_TOKEN es de prueba (TEST-...). En producción usa credenciales APP_USR-...',
        0,
        null
      )
    }
  } else {
    if (sandbox) {
      throw new MercadoPagoApiError(
        'MERCADOPAGO_ACCESS_TOKEN parece ser de producción. Con MERCADOPAGO_SANDBOX=true usa credenciales TEST-...',
        0,
        null
      )
    }
    if (!accessToken.startsWith(PRODUCTION_ACCESS_PREFIX)) {
      throw new MercadoPagoApiError(
        'MERCADOPAGO_ACCESS_TOKEN no parece ser de producción (debe comenzar con APP_USR-)',
        0,
        null
      )
    }
  }

  if (!publicKey) {
    throw new MercadoPagoApiError(
      sandbox
        ? 'MERCADOPAGO_PUBLIC_KEY o NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY no configurada'
        : 'MERCADOPAGO_PUBLIC_KEY de producción no configurada (también acepta NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY)',
      0,
      null
    )
  }

  if (isMercadoPagoTestCredential(publicKey)) {
    if (!sandbox) {
      throw new MercadoPagoApiError(
        'MERCADOPAGO_PUBLIC_KEY es de prueba (TEST-...). En producción usa APP_USR-...',
        0,
        null
      )
    }
  } else {
    if (sandbox) {
      throw new MercadoPagoApiError(
        'MERCADOPAGO_PUBLIC_KEY parece ser de producción. Con MERCADOPAGO_SANDBOX=true usa credenciales TEST-...',
        0,
        null
      )
    }
    if (!publicKey.startsWith(PRODUCTION_PUBLIC_PREFIX)) {
      throw new MercadoPagoApiError(
        'MERCADOPAGO_PUBLIC_KEY no parece ser de producción (debe comenzar con APP_USR-)',
        0,
        null
      )
    }
  }

  if (clientPublicKey && isMercadoPagoTestCredential(clientPublicKey) && !sandbox) {
    throw new MercadoPagoApiError(
      'NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY es de prueba (TEST-...). En producción usa APP_USR-...',
      0,
      null
    )
  }

  if (clientPublicKey && publicKey && clientPublicKey !== publicKey && !sandbox) {
    console.warn(
      '[Mercado Pago] MERCADOPAGO_PUBLIC_KEY y NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY difieren'
    )
  }

  return { sandbox, accessToken, publicKey }
}

export function canReuseMercadoPagoCheckoutUrl(url: string | null | undefined): boolean {
  if (!url) return false

  const sandbox = isMercadoPagoSandboxMode()
  const urlIsSandbox = isSandboxCheckoutUrl(url)

  if (sandbox) return urlIsSandbox
  return !urlIsSandbox
}

export function resolvePreferenceCheckoutUrl(
  preference: { init_point?: string; sandbox_init_point?: string },
  sandbox: boolean
): string {
  if (sandbox) {
    const checkoutUrl = preference.sandbox_init_point?.trim()
    if (!checkoutUrl) {
      throw new MercadoPagoApiError(
        'Mercado Pago no devolvió sandbox_init_point',
        502,
        preference
      )
    }
    return checkoutUrl
  }

  const checkoutUrl = preference.init_point?.trim()
  if (!checkoutUrl) {
    throw new MercadoPagoApiError(
      'Mercado Pago no devolvió init_point de producción',
      502,
      preference
    )
  }

  if (isSandboxCheckoutUrl(checkoutUrl)) {
    throw new MercadoPagoApiError(
      'Mercado Pago devolvió una URL sandbox pero MERCADOPAGO_SANDBOX=false',
      502,
      preference
    )
  }

  return checkoutUrl
}

export function validateClientMercadoPagoPublicKey(): string | null {
  const key = readClientMercadoPagoPublicKey()
  const sandbox = isMercadoPagoSandboxMode()

  if (!key) {
    return sandbox
      ? 'NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY no configurada'
      : 'NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY de producción no configurada'
  }

  if (isMercadoPagoTestCredential(key)) {
    return sandbox
      ? null
      : 'NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY es de prueba (TEST-...). En producción usa APP_USR-...'
  }

  if (!sandbox && !key.startsWith(PRODUCTION_PUBLIC_PREFIX)) {
    return 'NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY no parece ser de producción (debe comenzar con APP_USR-)'
  }

  return null
}
