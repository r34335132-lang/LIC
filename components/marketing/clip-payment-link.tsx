'use client'

import Link from 'next/link'
import { forwardRef, type ReactNode } from 'react'
import { buildClipPaymentUrl, RESERVATION_AMOUNT_MXN, trackEvent } from '@/lib/marketing'

type ClipPaymentLinkProps = {
  children: ReactNode
  className?: string
  programId?: string
  programName?: string
  ariaLabel?: string
}

export const ClipPaymentLink = forwardRef<HTMLAnchorElement, ClipPaymentLinkProps>(
  function ClipPaymentLink({ children, className, programId, programName, ariaLabel }, ref) {
    const href = buildClipPaymentUrl({ programId, programName })
    const external = href.startsWith('http')

    return (
      <Link
        ref={ref}
        href={href}
        target={external ? '_blank' : undefined}
        rel={external ? 'noopener noreferrer' : undefined}
        aria-label={ariaLabel || `Aparta tu lugar con $${RESERVATION_AMOUNT_MXN} MXN`}
        className={className}
        onClick={() =>
          trackEvent('start_clip_payment', {
            programId,
            programName,
            amount: RESERVATION_AMOUNT_MXN,
            source: 'clip_payment_link',
          })
        }
      >
        {children}
      </Link>
    )
  },
)
