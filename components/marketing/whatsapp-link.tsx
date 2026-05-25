'use client'

import Link from 'next/link'
import { forwardRef, type ReactNode } from 'react'
import { buildWhatsAppUrl, DEFAULT_WHATSAPP_MESSAGE, trackEvent } from '@/lib/marketing'

type WhatsAppLinkProps = {
  children: ReactNode
  className?: string
  message?: string
  programId?: string
  ariaLabel?: string
}

export const WhatsAppLink = forwardRef<HTMLAnchorElement, WhatsAppLinkProps>(function WhatsAppLink(
  { children, className, message = DEFAULT_WHATSAPP_MESSAGE, programId, ariaLabel },
  ref
) {
  return (
    <Link
      ref={ref}
      href={buildWhatsAppUrl(message)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={ariaLabel}
      className={className}
      onClick={() => trackEvent('click_whatsapp', { programId, source: 'whatsapp_link' })}
    >
      {children}
    </Link>
  )
})
