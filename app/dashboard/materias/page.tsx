'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Video, BookMarked, FolderOpen, Zap } from 'lucide-react'
import { toast } from 'sonner'
import type { Actividad, Materia, Perfil } from '@/types/database'
import { cuatrimestreLabel } from '@/lib/academico-utils'

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

function cuatrimestreResumen(items: MateriaDashboard[]) {
  return {
    total: items.length,
    cursando: items.filter((m) => m.estado === 'cursando').length,
    aprobadas: items.filter((m) => m.estado === 'aprobada').length,
    pendientes: items.filter((m) => m.estado === 'pendiente').length,
  }
}

export default function DashboardMateriasPage() {
  const [materias, setMaterias] = useState<MateriaDashboard[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/dashboard/materias', { credentials: 'include' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Error al cargar materias')
      setMaterias((data.materias ?? []) as MateriaDashboard[])
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al cargar materias')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const accesosRapidos = useMemo(
    () =>
      materias.filter(
        (m) => m.link_clase || m.link_classroom || m.link_drive
      ),
    [materias]
  )

  const grouped = useMemo(() => {
    const map = materias.reduce<Record<number, MateriaDashboard[]>>((acc, m) => {
      const p = m.materia?.periodo ?? 0
      if (!acc[p]) acc[p] = []
      acc[p].push(m)
      return acc
    }, {})
    for (const key of Object.keys(map)) {
      map[Number(key)]!.sort((a, b) =>
        (a.materia?.nombre ?? '').localeCompare(b.materia?.nombre ?? '', 'es')
      )
    }
    return map
  }, [materias])

  const estadoBadge = (estado: string) => {
    const colors: Record<string, string> = {
      pendiente: 'bg-yellow-100 text-yellow-800',
      cursando: 'bg-blue-100 text-blue-800',
      aprobada: 'bg-green-100 text-green-800',
      reprobada: 'bg-red-100 text-red-800',
    }
    return colors[estado] ?? 'bg-gray-100 text-gray-800'
  }

  return (
    <div>
      <h1 className="text-3xl font-black text-slate-950">Materias</h1>
      <p className="mt-2 text-muted-foreground">
        Plan de estudios y aula virtual por cuatrimestre.
      </p>

      {loading ? (
        <div className="mt-10 flex justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-primary border-t-transparent" />
        </div>
      ) : materias.length === 0 ? (
        <p className="mt-8 text-muted-foreground">Aún no tienes materias asignadas.</p>
      ) : (
        <div className="mt-8 space-y-6">
          {accesosRapidos.length > 0 && (
            <Card className="border-brand-primary/20 bg-brand-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Zap className="h-5 w-5 text-brand-primary" />
                  Accesos rápidos a clases virtuales
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {accesosRapidos.map((am) => (
                  <div key={am.id} className="flex flex-wrap items-center gap-2 rounded-lg border bg-white px-3 py-2">
                    <span className="text-sm font-semibold">{am.materia?.nombre}</span>
                    {am.link_clase && (
                      <Button asChild size="sm" variant="default" className="bg-brand-primary h-8">
                        <a href={am.link_clase} target="_blank" rel="noopener noreferrer">
                          <Video className="mr-1 h-3 w-3" /> Clase virtual
                        </a>
                      </Button>
                    )}
                    {am.link_classroom && (
                      <Button asChild size="sm" variant="outline" className="h-8">
                        <a href={am.link_classroom} target="_blank" rel="noopener noreferrer">
                          <BookMarked className="mr-1 h-3 w-3" /> Classroom
                        </a>
                      </Button>
                    )}
                    {am.link_drive && (
                      <Button asChild size="sm" variant="outline" className="h-8">
                        <a href={am.link_drive} target="_blank" rel="noopener noreferrer">
                          <FolderOpen className="mr-1 h-3 w-3" /> Drive
                        </a>
                      </Button>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {Object.entries(grouped)
            .sort(([a], [b]) => Number(a) - Number(b))
            .map(([cuatrimestre, items]) => {
              const res = cuatrimestreResumen(items)
              return (
                <Card key={cuatrimestre}>
                  <CardHeader>
                    <CardTitle>{cuatrimestreLabel(Number(cuatrimestre))}</CardTitle>
                    <div className="mt-2 flex flex-wrap gap-2 text-sm text-muted-foreground">
                      <Badge variant="outline">{res.total} materias</Badge>
                      <Badge className="bg-blue-100 text-blue-800">{res.cursando} cursando</Badge>
                      <Badge className="bg-green-100 text-green-800">{res.aprobadas} aprobadas</Badge>
                      <Badge className="bg-yellow-100 text-yellow-800">{res.pendientes} pendientes</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {items.map((am) => (
                      <div key={am.id} className="rounded-lg border p-4">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <p className="font-bold">{am.materia?.nombre}</p>
                            <p className="text-xs font-mono text-muted-foreground">{am.materia?.clave}</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {am.profesor
                                ? `Prof. ${am.profesor.nombre_completo}`
                                : 'Profesor por asignar'}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {am.grupo ? `Grupo ${am.grupo}` : 'Grupo por confirmar'}
                              {am.horario ? ` · Horario: ${am.horario}` : ' · Horario por confirmar'}
                              {am.aula ? ` · Aula: ${am.aula}` : ''}
                            </p>
                            {am.periodo_escolar && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Periodo escolar: {am.periodo_escolar}
                              </p>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Badge className={estadoBadge(am.estado)}>{am.estado}</Badge>
                            {am.calificacion != null && (
                              <Badge variant="outline">Calif. {am.calificacion}</Badge>
                            )}
                          </div>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2 items-center">
                          {am.link_clase ? (
                            <Button asChild size="sm" variant="default" className="bg-brand-primary">
                              <a href={am.link_clase} target="_blank" rel="noopener noreferrer">
                                <Video className="mr-1 h-4 w-4" /> Entrar a clase virtual
                              </a>
                            </Button>
                          ) : (
                            <span className="text-xs text-muted-foreground italic">
                              Clase virtual por confirmar
                            </span>
                          )}
                          {am.link_classroom && (
                            <Button asChild size="sm" variant="outline">
                              <a href={am.link_classroom} target="_blank" rel="noopener noreferrer">
                                <BookMarked className="mr-1 h-4 w-4" /> Classroom
                              </a>
                            </Button>
                          )}
                          {am.link_drive && (
                            <Button asChild size="sm" variant="outline">
                              <a href={am.link_drive} target="_blank" rel="noopener noreferrer">
                                <FolderOpen className="mr-1 h-4 w-4" /> Drive
                              </a>
                            </Button>
                          )}
                        </div>

                        {am.actividades.length > 0 && (
                          <div className="mt-4 border-t pt-3">
                            <p className="text-xs font-bold uppercase text-muted-foreground mb-2">
                              Actividades
                            </p>
                            <div className="space-y-2">
                              {am.actividades.map((act) => (
                                <div
                                  key={act.id}
                                  className="flex items-center justify-between text-sm rounded bg-slate-50 px-3 py-2"
                                >
                                  <span>{act.titulo}</span>
                                  {act.fecha_entrega && (
                                    <span className="text-xs text-muted-foreground">
                                      Entrega:{' '}
                                      {new Date(act.fecha_entrega).toLocaleDateString('es-MX')}
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
              )
            })}
        </div>
      )}
    </div>
  )
}
