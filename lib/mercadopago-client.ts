'use client'

/** Validación client-side de la public key expuesta al navegador. */
export function isSandboxCheckoutUrl(url: string): boolean {
  try {
    const hostname = new URL(url).hostname.toLowerCase()
    return hostname.includes('sandbox.mercadopago') || hostname.startsWith('sandbox.')
  } catch {
    return url.toLowerCase().includes('sandbox')
  }
}

export function isMercadoPagoSandboxModeClient(): boolean {
  return process.env.NEXT_PUBLIC_MERCADOPAGO_SANDBOX?.trim().toLowerCase() === 'true'
}

export function canReuseMercadoPagoCheckoutUrlClient(url: string | null | undefined): boolean {
  if (!url) return false
  const sandbox = isMercadoPagoSandboxModeClient()
  const urlIsSandbox = isSandboxCheckoutUrl(url)
  if (sandbox) return urlIsSandbox
  return !urlIsSandbox
}

export function validateClientMercadoPagoPublicKey(): string | null {
  const key = process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY?.trim() ?? ''
  const sandbox = process.env.NEXT_PUBLIC_MERCADOPAGO_SANDBOX?.trim().toLowerCase() === 'true'

  if (!key) {
    return sandbox
      ? 'NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY no configurada'
      : 'NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY de producción no configurada'
  }

  if (key.toUpperCase().startsWith('TEST-')) {
    return sandbox
      ? null
      : 'NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY es de prueba (TEST-...). En producción usa APP_USR-...'
  }

  if (!sandbox && !key.startsWith('APP_USR-')) {
    return 'NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY no parece ser de producción (debe comenzar con APP_USR-)'
  }

  return null
}

export function getClientMercadoPagoPublicKey(): string | null {
  const key = process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY?.trim()
  return key || null
}
