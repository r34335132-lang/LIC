'use client'

import { useAuth } from '@/lib/auth-context'
import { AlumnoDashboard } from '@/components/dashboard/alumno-dashboard'
import { MaestroDashboard } from '@/components/dashboard/maestro-dashboard'
import { AdminDashboard } from '@/components/dashboard/admin-dashboard'

export default function DashboardPage() {
  const { user } = useAuth()

  if (!user) return null

  switch (user.rol) {
    case 'admin':
      return <AdminDashboard user={user} />
    case 'maestro':
      return <MaestroDashboard user={user} />
    default:
      return <AlumnoDashboard user={user} />
  }
}
