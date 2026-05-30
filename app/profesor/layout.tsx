'use client'

import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { ProfesorSidebar } from '@/components/profesor/profesor-sidebar'

export default function ProfesorLayout({ children }: { children: React.ReactNode }) {
  const { perfil, loading, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login')
    } else if (!loading && perfil && perfil.rol === 'alumno') {
      router.push('/dashboard')
    } else if (!loading && perfil && perfil.rol === 'admin') {
      // Admin puede acceder
    }
  }, [loading, isAuthenticated, perfil, router])

  if (loading || !isAuthenticated || !perfil) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-primary border-t-transparent" />
      </div>
    )
  }

  if (perfil.rol !== 'profesor' && perfil.rol !== 'admin') {
    return null
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <ProfesorSidebar />
      <main className="flex-1 overflow-auto">
        <div className="container max-w-7xl p-4 pt-16 md:p-6 md:pt-6">{children}</div>
      </main>
    </div>
  )
}
