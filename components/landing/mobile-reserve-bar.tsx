'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserPlus } from 'lucide-react'

export function MobileReserveBar() {
  const pathname = usePathname()
  if (pathname !== '/') return null

  return (
    <div className="fixed inset-x-0 bottom-0 z-[70] border-t border-slate-200 bg-white/95 p-3 shadow-[0_-8px_30px_rgba(15,23,42,0.12)] backdrop-blur-lg lg:hidden">
      <Link
        href="/inscripcion"
        className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-primary text-sm font-black uppercase tracking-wider text-white shadow-lg shadow-brand-primary/20"
      >
        <UserPlus className="h-5 w-5" />
        Apartar mi lugar
      </Link>
    </div>
  )
}
