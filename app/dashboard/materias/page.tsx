'use client'

import { useAuth } from '@/lib/auth-context'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ExternalLink } from 'lucide-react'
import { toast } from 'sonner'
import type { Actividad, Materia, Perfil } from '@/types/database'

interface MateriaDashboard {
  id: string
  estado: string
  calificacion: number | null
  materia: Materia | null
  profesor: Pick<Perfil, 'id' | 'nombre_completo' | 'email'> | null
  grupo: string | null
  horario: string | null
  aula: string | null
  periodo_escolar: string | null
  link_clase: string | null
  link_classroom: string | null
  link_drive: string | null
  descripcion: string | null
  actividades: Actividad[]
}

export default function DashboardMateriasPage() {
  const { perfil } = useAuth()
  const [materias, setMaterias] = useState<MateriaDashboard[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!perfil) return
    let active = true
    async function load() {
      try {
        const res = await fetch('/api/dashboard/materias', { credentials: 'include' })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error ?? 'Error al cargar materias')
        if (active) setMaterias((data.materias ?? []) as MateriaDashboard[])
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Error al cargar materias')
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [perfil])

  const grouped = materias.reduce<Record<number, MateriaDashboard[]>>((acc, m) => {
    const p = m.materia?.periodo ?? 0
    if (!acc[p]) acc[p] = []
    acc[p].push(m)
    return acc
  }, {})

  const estadoBadge = (estado: string) => {
    const colors: Record<string, string> = {
      pendiente: 'bg-yellow-100 text-yellow-800',
      cursando: 'bg-blue-100 text-blue-800',
      aprobada: 'bg-green-100 text-green-800',
      reprobada: 'bg-red-100 text-red-800',
      baja: 'bg-gray-100 text-gray-800',
    }
    return colors[estado] ?? 'bg-gray-100 text-gray-800'
  }

  return (
    <div>
      <h1 className="text-3xl font-black text-slate-950">Mis materias</h1>
      <p className="mt-2 text-muted-foreground">Plan de estudios y avance académico.</p>

      {loading ? (
        <div className="mt-10 flex justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-primary border-t-transparent" />
        </div>
      ) : materias.length === 0 ? (
        <p className="mt-8 text-muted-foreground">Aún no tienes materias asignadas.</p>
      ) : (
        <div className="mt-8 space-y-6">
          {Object.entries(grouped)
            .sort(([a], [b]) => Number(a) - Number(b))
            .map(([periodo, items]) => (
              <Card key={periodo}>
                <CardHeader>
                  <CardTitle>{periodo}° Periodo</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {items.map((am) => (
                    <div key={am.id} className="rounded-lg border p-4">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="font-bold">{am.materia?.nombre}</p>
                          <p className="text-xs font-mono text-muted-foreground">{am.materia?.clave}</p>
                          {am.profesor && (
                            <p className="text-sm text-muted-foreground mt-1">Prof. {am.profesor.nombre_completo}</p>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Badge className={estadoBadge(am.estado)}>{am.estado}</Badge>
                          {am.calificacion != null && (
                            <Badge variant="outline">Calif. {am.calificacion}</Badge>
                          )}
                          {am.grupo && <Badge variant="secondary">Grupo {am.grupo}</Badge>}
                        </div>
                      </div>

                      {(am.horario || am.aula) && (
                        <div className="mt-3 flex flex-wrap gap-3 text-sm text-muted-foreground">
                          {am.horario && <span>Horario: {am.horario}</span>}
                          {am.aula && <span>Aula: {am.aula}</span>}
                        </div>
                      )}

                      {(am.link_clase || am.link_classroom || am.link_drive) && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {am.link_clase && (
                            <a href={am.link_clase} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-brand-primary hover:underline">
                              <ExternalLink className="h-3 w-3" /> Clase en vivo
                            </a>
                          )}
                          {am.link_classroom && (
                            <a href={am.link_classroom} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-brand-primary hover:underline">
                              <ExternalLink className="h-3 w-3" /> Classroom
                            </a>
                          )}
                          {am.link_drive && (
                            <a href={am.link_drive} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-brand-primary hover:underline">
                              <ExternalLink className="h-3 w-3" /> Drive
                            </a>
                          )}
                        </div>
                      )}

                      {am.actividades.length > 0 && (
                        <div className="mt-4 border-t pt-3">
                          <p className="text-xs font-bold uppercase text-muted-foreground mb-2">Actividades</p>
                          <div className="space-y-2">
                            {am.actividades.map((act) => (
                              <div key={act.id} className="flex items-center justify-between text-sm rounded bg-slate-50 px-3 py-2">
                                <span>{act.titulo}</span>
                                {act.fecha_entrega && (
                                  <span className="text-xs text-muted-foreground">
                                    Entrega: {new Date(act.fecha_entrega).toLocaleDateString('es-MX')}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
        </div>
      )}
    </div>
  )
}
