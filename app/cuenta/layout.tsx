'use client'

import { useAuth, getRedirectPath } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { useEffect } from 'react'

export default function CuentaLayout({ children }: { children: React.ReactNode }) {
  const { perfil, loading, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login')
    }
  }, [loading, isAuthenticated, router])

  if (loading || !perfil) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-primary border-t-transparent" />
      </div>
    )
  }

  const backHref = getRedirectPath(perfil.rol)

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container max-w-lg py-8 px-4">
        <Link
          href={backHref}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-brand-primary mb-6"
        >
          <ArrowLeft className="h-4 w-4" /> Volver al panel
        </Link>
        {children}
      </div>
    </div>
  )
}
