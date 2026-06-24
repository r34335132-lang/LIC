'use client'

import { useCallback, useEffect, useState } from 'react'
import { BarChart3 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import type { Perfil } from '@/types/database'

type DesgloseSugerencia = {
  nombre: string
  tipo: string
  peso: number
  promedio: number | null
  aporte: number | null
}

type ResumenAlumno = {
  alumno_materia_id: string
  alumno: Pick<Perfil, 'id' | 'nombre_completo' | 'matricula' | 'email'>
  calificacion_actual: number | null
  tareas: {
    total: number
    entregadas: number
    revisadas: number
    pendientes: number
    promedio: number | null
  }
  examenes: {
    total: number
    completados: number
    pendientes: number
    promedio: number | null
  }
  sugerencia_calificacion: number | null
  desglose_sugerencia: DesgloseSugerencia[]
  sugerencia_parcial: boolean
}

export function MateriaResumenAlumnosSection({
  profesorMateriaId,
  isOwner,
}: {
  profesorMateriaId: string
  isOwner?: boolean
}) {
  const [resumen, setResumen] = useState<ResumenAlumno[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/profesor/materias/${profesorMateriaId}/resumen-alumnos`,
        { credentials: 'include' }
      )
      const data = await res.json()
      if (res.ok) setResumen(data.resumen ?? [])
    } finally {
      setLoading(false)
    }
  }, [profesorMateriaId])

  useEffect(() => {
    load()
  }, [load])

  const aplicarSugerencia = async (amId: string, calificacion: number) => {
    const res = await fetch('/api/profesor/alumno-materias', {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: amId, calificacion }),
    })
    const data = await res.json()
    if (!res.ok) {
      toast.error(data.error ?? 'No se pudo actualizar')
      return
    }
    toast.success('Calificación actualizada manualmente')
    await load()
  }

  if (loading) return null

  return (
    <Card className="mt-6 border-emerald-200 bg-emerald-50/30" id="resumen-alumnos">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <BarChart3 className="h-5 w-5 text-emerald-700" />
          Resumen de alumnos (tareas y exámenes)
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          La calificación sugerida es solo una referencia según la rúbrica — no se aplica sola.
          Tú decides la calificación final.
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {resumen.length === 0 && (
          <p className="text-sm text-muted-foreground">No hay alumnos inscritos.</p>
        )}
        {resumen.map((r) => (
          <div key={r.alumno_materia_id} className="rounded-lg border bg-white p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="font-bold">{r.alumno?.nombre_completo}</p>
                <p className="text-xs text-muted-foreground">{r.alumno?.matricula}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {r.calificacion_actual != null && (
                  <Badge>Calif. registrada: {r.calificacion_actual}</Badge>
                )}
                {r.sugerencia_calificacion != null && (
                  <Badge variant="secondary" className="bg-emerald-100 text-emerald-900">
                    Sugerencia: {r.sugerencia_calificacion}
                    {r.sugerencia_parcial && ' (parcial)'}
                  </Badge>
                )}
                {isOwner && r.sugerencia_calificacion != null && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs"
                    onClick={() => aplicarSugerencia(r.alumno_materia_id, r.sugerencia_calificacion!)}
                  >
                    Usar sugerencia
                  </Button>
                )}
              </div>
            </div>

            {r.desglose_sugerencia?.length > 0 && (
              <div className="mt-3 rounded-md border border-dashed border-emerald-200 bg-emerald-50/50 p-3 text-xs">
                <p className="font-semibold text-emerald-900">Desglose de la sugerencia</p>
                <ul className="mt-2 space-y-1">
                  {r.desglose_sugerencia.map((d, i) => (
                    <li key={i} className="flex justify-between gap-2">
                      <span>
                        {d.nombre} ({d.peso}%)
                        {d.promedio == null && ' — sin datos aún'}
                      </span>
                      <span className="font-medium">
                        {d.aporte != null ? `+${d.aporte}` : '—'}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div className="rounded-md bg-slate-50 p-3 text-sm">
                <p className="font-semibold text-slate-700">Tareas</p>
                <p>{r.tareas.entregadas}/{r.tareas.total} entregadas · {r.tareas.revisadas} revisadas</p>
                <p className="text-muted-foreground">{r.tareas.pendientes} pendiente(s)</p>
                {r.tareas.promedio != null && (
                  <p className="mt-1 font-medium">Promedio: {r.tareas.promedio}</p>
                )}
              </div>
              <div className="rounded-md bg-slate-50 p-3 text-sm">
                <p className="font-semibold text-slate-700">Exámenes</p>
                <p>{r.examenes.completados}/{r.examenes.total} completados</p>
                <p className="text-muted-foreground">{r.examenes.pendientes} pendiente(s)</p>
                {r.examenes.promedio != null && (
                  <p className="mt-1 font-medium">Promedio: {r.examenes.promedio}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
