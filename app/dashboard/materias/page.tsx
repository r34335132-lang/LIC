'use client'

import { useAuth } from '@/lib/auth-context'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ExternalLink } from 'lucide-react'
import type { Actividad, AlumnoMateria, Materia, Perfil, ProfesorMateria } from '@/types/database'

type AlumnoMateriaRow = AlumnoMateria & {
  materia: Materia
  profesor_materia?: ProfesorMateria & { profesor?: Pick<Perfil, 'nombre_completo'> }
}

export default function DashboardMateriasPage() {
  const { perfil } = useAuth()
  const [materias, setMaterias] = useState<AlumnoMateriaRow[]>([])
  const [actividades, setActividades] = useState<Record<string, Actividad[]>>({})
  const supabase = createClient()

  useEffect(() => {
    if (!perfil) return
    async function load() {
      const { data: am } = await supabase
        .from('alumno_materias')
        .select(`
          *,
          materia:materias(*)
        `)
        .eq('alumno_id', perfil!.id)

      const rows = (am ?? []) as AlumnoMateriaRow[]

      for (const row of rows) {
        if (row.materia?.id) {
          const { data: pm } = await supabase
            .from('profesor_materias')
            .select('*, profesor:perfiles!profesor_materias_profesor_id_fkey(nombre_completo)')
            .eq('materia_id', row.materia.id)
            .eq('activo', true)
            .limit(1)
            .maybeSingle()
          if (pm) row.profesor_materia = pm as AlumnoMateriaRow['profesor_materia']

          const { data: acts } = await supabase
            .from('actividades')
            .select('*')
            .eq('materia_id', row.materia.id)
            .eq('activo', true)
          setActividades((prev) => ({ ...prev, [row.materia!.id]: (acts ?? []) as Actividad[] }))
        }
      }

      setMaterias(rows)
    }
    load()
  }, [perfil, supabase])

  const grouped = materias.reduce<Record<number, AlumnoMateriaRow[]>>((acc, m) => {
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

      <div className="mt-8 space-y-6">
        {Object.entries(grouped)
          .sort(([a], [b]) => Number(a) - Number(b))
          .map(([periodo, items]) => (
            <Card key={periodo}>
              <CardHeader>
                <CardTitle>{periodo}° Periodo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {items.map((am) => {
                  const pm = am.profesor_materia
                  const acts = actividades[am.materia?.id ?? ''] ?? []
                  return (
                    <div key={am.id} className="rounded-lg border p-4">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="font-bold">{am.materia?.nombre}</p>
                          <p className="text-xs font-mono text-muted-foreground">{am.materia?.clave}</p>
                          {pm?.profesor && (
                            <p className="text-sm text-muted-foreground mt-1">Prof. {pm.profesor.nombre_completo}</p>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Badge className={estadoBadge(am.estado)}>{am.estado}</Badge>
                          {am.calificacion != null && (
                            <Badge variant="outline">Calif. {am.calificacion}</Badge>
                          )}
                          {pm?.grupo && <Badge variant="secondary">Grupo {pm.grupo}</Badge>}
                        </div>
                      </div>

                      {pm && (pm.horario || pm.aula) && (
                        <div className="mt-3 flex flex-wrap gap-3 text-sm text-muted-foreground">
                          {pm.horario && <span>Horario: {pm.horario}</span>}
                          {pm.aula && <span>Aula: {pm.aula}</span>}
                        </div>
                      )}

                      {pm && (pm.link_clase || pm.link_classroom || pm.link_drive) && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {pm.link_clase && (
                            <a href={pm.link_clase} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-brand-primary hover:underline">
                              <ExternalLink className="h-3 w-3" /> Clase en vivo
                            </a>
                          )}
                          {pm.link_classroom && (
                            <a href={pm.link_classroom} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-brand-primary hover:underline">
                              <ExternalLink className="h-3 w-3" /> Classroom
                            </a>
                          )}
                          {pm.link_drive && (
                            <a href={pm.link_drive} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-brand-primary hover:underline">
                              <ExternalLink className="h-3 w-3" /> Drive
                            </a>
                          )}
                        </div>
                      )}

                      {acts.length > 0 && (
                        <div className="mt-4 border-t pt-3">
                          <p className="text-xs font-bold uppercase text-muted-foreground mb-2">Actividades</p>
                          <div className="space-y-2">
                            {acts.map((act) => (
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
                  )
                })}
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  )
}
