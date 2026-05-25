'use client'

import Link from 'next/link'
import { forwardRef, type ReactNode } from 'react'
import type { MarketingEvent } from '@/lib/marketing'
import { trackEvent } from '@/lib/marketing'

type TrackLinkProps = {
  href: string
  children: ReactNode
  className?: string
  event: MarketingEvent
  payload?: Record<string, unknown>
}

export const TrackLink = forwardRef<HTMLAnchorElement, TrackLinkProps>(function TrackLink(
  { href, children, className, event, payload },
  ref
) {
  return (
    <Link ref={ref} href={href} className={className} onClick={() => trackEvent(event, payload)}>
      {children}
    </Link>
  )
})
