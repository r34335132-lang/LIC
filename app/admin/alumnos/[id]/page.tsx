'use client'

import { useEffect, useState, use } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getNombrePerfil } from '@/lib/perfil-utils'
import type { AlumnoMateria, Materia, Perfil } from '@/types/database'

type AlumnoMateriaRow = AlumnoMateria & { materia: Materia }

export default function AdminAlumnoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const [alumno, setAlumno] = useState<Perfil | null>(null)
  const [materias, setMaterias] = useState<AlumnoMateriaRow[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: perfil } = await supabase.from('perfiles').select('*').eq('id', id).single()
      setAlumno(perfil as Perfil)

      const { data: am } = await supabase
        .from('alumno_materias')
        .select('*, materia:materias(*)')
        .eq('alumno_id', id)

      setMaterias((am ?? []) as AlumnoMateriaRow[])
      setLoading(false)
    }
    load()
  }, [id, supabase])

  const updateMateria = async (amId: string, updates: { estado?: string; calificacion?: number | null }) => {
    const res = await fetch(`/api/admin/alumno-materias/${amId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })
    if (res.ok) {
      setMaterias((prev) =>
        prev.map((m) => (m.id === amId ? { ...m, ...updates } as AlumnoMateriaRow : m))
      )
    }
  }

  const grouped = materias.reduce<Record<number, AlumnoMateriaRow[]>>((acc, m) => {
    const periodo = m.materia?.periodo ?? 0
    if (!acc[periodo]) acc[periodo] = []
    acc[periodo].push(m)
    return acc
  }, {})

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-primary border-t-transparent" />
      </div>
    )
  }

  if (!alumno) {
    return <p>Alumno no encontrado.</p>
  }

  return (
    <div>
      <Link href="/admin/alumnos" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-brand-primary mb-6">
        <ArrowLeft className="h-4 w-4" /> Volver
      </Link>

      <h1 className="text-3xl font-black">{getNombrePerfil(alumno)}</h1>
      <div className="mt-2 flex flex-wrap gap-2">
        <Badge variant="outline">{alumno.email}</Badge>
        {alumno.matricula && <Badge>{alumno.matricula}</Badge>}
        {alumno.programa_id && <Badge variant="secondary">{alumno.programa_id}</Badge>}
      </div>

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
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-semibold">{am.materia?.nombre}</p>
                        <p className="text-xs text-muted-foreground font-mono">{am.materia?.clave}</p>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs">Estado</Label>
                          <Select
                            value={am.estado}
                            onValueChange={(v) => updateMateria(am.id, { estado: v })}
                          >
                            <SelectTrigger className="w-[140px] h-9">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pendiente">Pendiente</SelectItem>
                              <SelectItem value="cursando">Cursando</SelectItem>
                              <SelectItem value="aprobada">Aprobada</SelectItem>
                              <SelectItem value="reprobada">Reprobada</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Calificación</Label>
                          <div className="flex gap-2">
                            <Input
                              type="number"
                              min={0}
                              max={10}
                              step={0.1}
                              className="w-20 h-9"
                              defaultValue={am.calificacion ?? ''}
                              onBlur={(e) => {
                                const val = e.target.value ? parseFloat(e.target.value) : null
                                updateMateria(am.id, { calificacion: val })
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  )
}
