'use client'

import { usePathname } from 'next/navigation'
import { useRef, useState } from 'react'
import { WhatsAppIcon } from '@/components/marketing/whatsapp-icon'
import { WhatsAppLink } from '@/components/marketing/whatsapp-link'

export function FloatingWhatsApp() {
  const pathname = usePathname()
  const hiddenOn = pathname?.startsWith('/dashboard') || pathname?.startsWith('/login')
  const [hintVisible, setHintVisible] = useState(false)
  const hintTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const showHint = () => {
    setHintVisible(true)
    if (hintTimer.current) clearTimeout(hintTimer.current)
    hintTimer.current = setTimeout(() => setHintVisible(false), 2400)
  }

  if (hiddenOn) return null

  return (
    <div
      className="group fixed bottom-5 right-4 z-[80] sm:bottom-6 sm:right-6"
      onPointerEnter={showHint}
      onFocusCapture={showHint}
      onTouchStart={showHint}
    >
      <span
        className={`pointer-events-none absolute bottom-full right-0 mb-3 w-max rounded-xl border border-slate-800/10 bg-slate-950 px-3.5 py-2 text-xs font-black text-white shadow-xl shadow-slate-900/20 transition duration-200 after:absolute after:right-4 after:top-full after:border-x-8 after:border-t-8 after:border-x-transparent after:border-t-slate-950 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100 ${
          hintVisible ? 'translate-y-0 opacity-100' : 'translate-y-1 opacity-0'
        }`}
      >
        ¿Quieres más información?
      </span>
      <WhatsAppLink
        className="flex h-11 w-11 items-center justify-center rounded-full border border-[#25D366]/30 bg-white text-[#25D366] shadow-xl shadow-slate-900/15 ring-4 ring-[#25D366]/10 transition hover:-translate-y-0.5 hover:ring-[#25D366]/20 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#25D366]/25 sm:h-12 sm:w-12"
        ariaLabel="Habla con un asesor por WhatsApp"
      >
        <WhatsAppIcon className="h-7 w-7 sm:h-8 sm:w-8" />
      </WhatsAppLink>
    </div>
  )
}
