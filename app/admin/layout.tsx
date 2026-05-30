'use client'

import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { AdminSidebar } from '@/components/admin/admin-sidebar'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { perfil, loading, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login')
    } else if (!loading && perfil && perfil.rol !== 'admin') {
      router.push('/dashboard')
    }
  }, [loading, isAuthenticated, perfil, router])

  if (loading || !perfil || perfil.rol !== 'admin') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar />
      <main className="flex-1 overflow-auto">
        <div className="container max-w-7xl p-4 pt-16 md:p-6 md:pt-6">{children}</div>
      </main>
    </div>
  )
}
