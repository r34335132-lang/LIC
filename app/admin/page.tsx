'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import {
  BookOpen,
  ClipboardList,
  Users,
  UserCheck,
  GraduationCap,
  CalendarClock,
  ClipboardCheck,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

const links = [
  { href: '/admin/planes', label: 'Planes de estudio', icon: BookOpen, desc: 'Gestionar planes y cargar materias' },
  { href: '/admin/inscripciones', label: 'Inscripciones', icon: ClipboardList, desc: 'Revisar y aprobar solicitudes' },
  { href: '/admin/alumnos', label: 'Alumnos', icon: Users, desc: 'Directorio de estudiantes' },
  { href: '/admin/profesores', label: 'Profesores', icon: UserCheck, desc: 'Plantilla docente y asignaciones' },
]

interface Metrics {
  totalAlumnos: number
  totalProfesores: number
  inscripcionesPendientes: number
  materiasCargadas: number
  actividadesActivas: number
}

export default function AdminPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    async function load() {
      try {
        const res = await fetch('/api/admin/metrics')
        const data = await res.json()
        if (!res.ok) throw new Error(data.error ?? 'Error al cargar métricas')
        if (active) setMetrics(data as Metrics)
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Error al cargar métricas')
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [])

  const cards = [
    { label: 'Total alumnos', value: metrics?.totalAlumnos, icon: GraduationCap },
    { label: 'Total profesores', value: metrics?.totalProfesores, icon: UserCheck },
    { label: 'Inscripciones pendientes', value: metrics?.inscripcionesPendientes, icon: ClipboardCheck },
    { label: 'Materias cargadas', value: metrics?.materiasCargadas, icon: BookOpen },
    { label: 'Actividades activas', value: metrics?.actividadesActivas, icon: CalendarClock },
  ]

  return (
    <div>
      <h1 className="text-3xl font-black text-slate-950">Panel de administración</h1>
      <p className="mt-2 text-muted-foreground">Gestiona el sistema académico del Instituto Universitario de Durango.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {cards.map((c) => (
          <Card key={c.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs text-muted-foreground">{c.label}</CardTitle>
              <c.icon className="h-4 w-4 text-brand-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-black">
                {loading ? '—' : (c.value ?? 0)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <h2 className="mt-10 mb-3 text-lg font-bold">Gestión</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {links.map((item) => (
          <Link key={item.href} href={item.href}>
            <Card className="h-full transition-shadow hover:shadow-md">
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
                  <item.icon className="h-6 w-6" />
                </div>
                <CardTitle className="text-lg">{item.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
