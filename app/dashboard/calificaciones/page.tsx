'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { BarChart3, TrendingUp, Award, BookOpen } from 'lucide-react'
import { toast } from 'sonner'
import { cuatrimestreLabel } from '@/lib/academico-utils'
import type { Actividad, ActividadEntrega } from '@/types/database'

type MateriaCalif = {
  id: string
  materia_id: string
  estado: string
  calificacion: number | null
  creditos: number
  periodo: number
  nombre: string
  clave: string
}

type CalificacionesData = {
  materias: MateriaCalif[]
  promedioGeneral: number | null
  promedioTareas: number | null
  creditosAprobados: number
  totalCreditos: number
  porcentajeAvance: number
  tareasRecientes: (ActividadEntrega & {
    actividad?: Pick<Actividad, 'id' | 'titulo' | 'materia_id'>
  })[]
}

export default function CalificacionesPage() {
  const [data, setData] = useState<CalificacionesData | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/dashboard/calificaciones', { credentials: 'include' })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Error al cargar')
      setData(json)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al cargar calificaciones')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const grouped = useMemo(() => {
    if (!data) return {}
    return data.materias.reduce<Record<number, MateriaCalif[]>>((acc, m) => {
      if (!acc[m.periodo]) acc[m.periodo] = []
      acc[m.periodo].push(m)
      return acc
    }, {})
  }, [data])

  const getCalificacionColor = (cal: number) => {
    if (cal >= 9) return 'text-green-600 dark:text-green-400'
    if (cal >= 7) return 'text-amber-600 dark:text-amber-400'
    return 'text-red-600 dark:text-red-400'
  }

  const estadoBadge = (estado: string) => {
    const colors: Record<string, string> = {
      pendiente: 'bg-yellow-100 text-yellow-800',
      cursando: 'bg-blue-100 text-blue-800',
      aprobada: 'bg-green-100 text-green-800',
      reprobada: 'bg-red-100 text-red-800',
    }
    return colors[estado] ?? 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-primary border-t-transparent" />
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground md:text-3xl">Calificaciones</h1>
        <p className="text-muted-foreground">Consulta tu avance académico y calificaciones por materia.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <BarChart3 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className={`text-2xl font-bold ${data.promedioGeneral != null ? getCalificacionColor(data.promedioGeneral) : ''}`}>
                {data.promedioGeneral ?? 'N/A'}
              </p>
              <p className="text-sm text-muted-foreground">Promedio general</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
              <TrendingUp className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold">{data.porcentajeAvance}%</p>
              <p className="text-sm text-muted-foreground">Avance del plan</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-chart-2/10">
              <Award className="h-6 w-6 text-chart-2" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {data.creditosAprobados}/{data.totalCreditos}
              </p>
              <p className="text-sm text-muted-foreground">Créditos aprobados</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-primary/10">
              <BookOpen className="h-6 w-6 text-brand-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{data.promedioTareas ?? 'N/A'}</p>
              <p className="text-sm text-muted-foreground">Promedio de tareas</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Progreso de créditos</CardTitle>
          <CardDescription>
            {data.creditosAprobados} de {data.totalCreditos} créditos aprobados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={data.porcentajeAvance} className="h-3" />
        </CardContent>
      </Card>

      {Object.entries(grouped)
        .sort(([a], [b]) => Number(a) - Number(b))
        .map(([periodo, materias]) => (
          <Card key={periodo}>
            <CardHeader>
              <CardTitle>{cuatrimestreLabel(Number(periodo))}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {materias.map((m) => (
                <div
                  key={m.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between rounded-lg border border-border p-4 gap-2"
                >
                  <div>
                    <h4 className="font-medium">{m.nombre}</h4>
                    <p className="text-xs font-mono text-muted-foreground">{m.clave}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className={estadoBadge(m.estado)}>{m.estado}</Badge>
                    <Badge variant="outline">{m.creditos} cr.</Badge>
                    {m.calificacion != null ? (
                      <span className={`font-bold ${getCalificacionColor(m.calificacion)}`}>
                        {m.calificacion}
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground">Sin calificación</span>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}

      <Card>
        <CardHeader>
          <CardTitle>Tareas calificadas recientes</CardTitle>
        </CardHeader>
        <CardContent>
          {data.tareasRecientes.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tarea</TableHead>
                  <TableHead>Calificación</TableHead>
                  <TableHead>Retroalimentación</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.tareasRecientes.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium">
                      {t.actividad?.titulo ?? 'Tarea'}
                    </TableCell>
                    <TableCell>
                      {t.calificacion != null ? (
                        <span className={`font-bold ${getCalificacionColor(t.calificacion)}`}>
                          {t.calificacion}
                        </span>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell className="max-w-xs truncate text-muted-foreground">
                      {t.retroalimentacion ?? '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              Aún no tienes tareas calificadas.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
