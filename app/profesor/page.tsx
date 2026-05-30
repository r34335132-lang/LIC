'use client'

import { useAuth } from '@/lib/auth-context'
import { getNombrePerfil } from '@/lib/perfil-utils'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { BookOpen, Users, CalendarClock, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'
import type { Actividad, Materia, ProfesorMateria } from '@/types/database'

type ProfesorMateriaRow = ProfesorMateria & { materia: Materia }

export default function ProfesorPage() {
  const { perfil } = useAuth()
  const [materias, setMaterias] = useState<ProfesorMateriaRow[]>([])
  const [totalAlumnos, setTotalAlumnos] = useState(0)
  const [actividades, setActividades] = useState<Actividad[]>([])

  useEffect(() => {
    if (!perfil) return
    let active = true
    async function load() {
      try {
        const res = await fetch('/api/profesor/dashboard', { credentials: 'include' })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error ?? 'Error al cargar panel')
        if (active) {
          setMaterias((data.materias ?? []) as ProfesorMateriaRow[])
          setTotalAlumnos(data.totalAlumnos ?? 0)
          setActividades((data.actividades ?? []) as Actividad[])
        }
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Error al cargar panel')
      }
    }
    load()
    return () => {
      active = false
    }
  }, [perfil])

  const proximas = actividades
    .filter((a) => a.fecha_entrega && new Date(a.fecha_entrega) >= new Date())
    .slice(0, 5)

  const metrics = [
    { label: 'Materias asignadas', value: materias.length, icon: BookOpen },
    { label: 'Alumnos en mis materias', value: totalAlumnos, icon: Users },
    { label: 'Actividades activas', value: actividades.length, icon: CalendarClock },
  ]

  return (
    <div>
      <h1 className="text-3xl font-black">Hola, {getNombrePerfil(perfil).split(' ')[0]}</h1>
      <p className="mt-2 text-muted-foreground">Panel docente</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {metrics.map((m) => (
          <Card key={m.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm text-muted-foreground">{m.label}</CardTitle>
              <m.icon className="h-4 w-4 text-brand-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-black">{m.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="mb-3 text-lg font-bold">Accesos rápidos</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {materias.length === 0 && (
              <p className="text-sm text-muted-foreground">Sin materias activas.</p>
            )}
            {materias.map((pm) => (
              <Link key={pm.id} href={`/profesor/materias/${pm.id}`}>
                <Card className="h-full transition-shadow hover:shadow-md">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <p className="font-bold">{pm.materia?.nombre}</p>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <p className="text-xs font-mono text-muted-foreground">{pm.materia?.clave}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {pm.grupo && <Badge variant="outline">Grupo {pm.grupo}</Badge>}
                      {pm.periodo_escolar && <Badge variant="secondary">{pm.periodo_escolar}</Badge>}
                    </div>
                    {pm.horario && <p className="mt-2 text-sm text-muted-foreground">{pm.horario}</p>}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h2 className="mb-3 text-lg font-bold">Actividades próximas</h2>
          <Card>
            <CardContent className="space-y-3 p-4">
              {proximas.length === 0 ? (
                <p className="text-sm text-muted-foreground">Sin actividades próximas.</p>
              ) : (
                proximas.map((a) => (
                  <div key={a.id} className="rounded-lg border p-3">
                    <p className="text-sm font-medium">{a.titulo}</p>
                    {a.fecha_entrega && (
                      <p className="text-xs text-muted-foreground">
                        Entrega: {new Date(a.fecha_entrega).toLocaleString('es-MX')}
                      </p>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
