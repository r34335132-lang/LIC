'use client'

import { useEffect, useState, use } from 'react'
import Link from 'next/link'
import { ArrowLeft, Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/auth-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import type {
  Actividad,
  AlumnoMateria,
  Materia,
  Perfil,
  ProfesorMateria,
} from '@/types/database'

type AlumnoRow = AlumnoMateria & { alumno: Pick<Perfil, 'id' | 'nombre_completo' | 'matricula' | 'email'> }

export default function ProfesorMateriaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const { perfil } = useAuth()
  const [pm, setPm] = useState<(ProfesorMateria & { materia: Materia }) | null>(null)
  const [alumnos, setAlumnos] = useState<AlumnoRow[]>([])
  const [actividades, setActividades] = useState<Actividad[]>([])
  const [actOpen, setActOpen] = useState(false)
  const [newAct, setNewAct] = useState({ titulo: '', descripcion: '', link_recurso: '', fecha_entrega: '' })
  const supabase = createClient()

  const load = async () => {
    const { data: pmData } = await supabase
      .from('profesor_materias')
      .select('*, materia:materias(*)')
      .eq('id', id)
      .single()
    setPm(pmData as ProfesorMateria & { materia: Materia })

    if (pmData?.materia_id) {
      const { data: am } = await supabase
        .from('alumno_materias')
        .select('*, alumno:perfiles!alumno_materias_alumno_id_fkey(id, nombre_completo, matricula, email)')
        .eq('materia_id', pmData.materia_id)
      setAlumnos((am ?? []) as AlumnoRow[])

      const { data: acts } = await supabase
        .from('actividades')
        .select('*')
        .eq('materia_id', pmData.materia_id)
        .order('created_at', { ascending: false })
      setActividades((acts ?? []) as Actividad[])
    }
  }

  useEffect(() => { load() }, [id])

  const updateAlumno = async (amId: string, updates: { estado?: string; calificacion?: number | null }) => {
    await fetch('/api/profesor/alumno-materias', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: amId, ...updates }),
    })
    load()
  }

  const updatePm = async (updates: Partial<ProfesorMateria>) => {
    await fetch('/api/profesor/profesor-materias', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...updates }),
    })
    load()
  }

  const createActividad = async () => {
    if (!pm?.materia_id) return
    await fetch('/api/profesor/actividades', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ materia_id: pm.materia_id, ...newAct }),
    })
    setActOpen(false)
    setNewAct({ titulo: '', descripcion: '', link_recurso: '', fecha_entrega: '' })
    load()
  }

  if (!pm) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-primary border-t-transparent" />
      </div>
    )
  }

  const isOwner = perfil?.id === pm.profesor_id || perfil?.rol === 'admin'

  return (
    <div>
      <Link href="/profesor/materias" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-brand-primary mb-6">
        <ArrowLeft className="h-4 w-4" /> Volver
      </Link>

      <h1 className="text-3xl font-black">{pm.materia?.nombre}</h1>
      <div className="mt-2 flex flex-wrap gap-2">
        <Badge variant="outline">{pm.materia?.clave}</Badge>
        {pm.grupo && <Badge>Grupo {pm.grupo}</Badge>}
        {pm.periodo_escolar && <Badge variant="secondary">{pm.periodo_escolar}</Badge>}
      </div>

      {isOwner && (
        <Card className="mt-6">
          <CardHeader><CardTitle className="text-base">Información de clase</CardTitle></CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {(['horario', 'aula', 'link_clase', 'link_classroom', 'link_drive'] as const).map((field) => (
              <div key={field}>
                <Label className="capitalize text-xs">{field.replace(/_/g, ' ')}</Label>
                <Input
                  defaultValue={pm[field] ?? ''}
                  onBlur={(e) => updatePm({ [field]: e.target.value || null })}
                />
              </div>
            ))}
            <div className="sm:col-span-2">
              <Label className="text-xs">Descripción</Label>
              <Textarea
                defaultValue={pm.descripcion ?? ''}
                onBlur={(e) => updatePm({ descripcion: e.target.value || null })}
              />
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="mt-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Alumnos ({alumnos.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {alumnos.map((am) => (
            <div key={am.id} className="flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-medium">{am.alumno?.nombre_completo}</p>
                <p className="text-xs text-muted-foreground">{am.alumno?.matricula} — {am.alumno?.email}</p>
              </div>
              {isOwner && (
                <div className="flex gap-2">
                  <Select value={am.estado} onValueChange={(v) => updateAlumno(am.id, { estado: v })}>
                    <SelectTrigger className="w-[130px] h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pendiente">Pendiente</SelectItem>
                      <SelectItem value="cursando">Cursando</SelectItem>
                      <SelectItem value="aprobada">Aprobada</SelectItem>
                      <SelectItem value="reprobada">Reprobada</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    type="number" min={0} max={10} step={0.1}
                    className="w-20 h-9"
                    defaultValue={am.calificacion ?? ''}
                    onBlur={(e) => updateAlumno(am.id, { calificacion: e.target.value ? parseFloat(e.target.value) : null })}
                  />
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Actividades</CardTitle>
          {isOwner && (
            <Dialog open={actOpen} onOpenChange={setActOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-brand-primary"><Plus className="mr-1 h-4 w-4" /> Nueva</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Nueva actividad</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <div><Label>Título</Label><Input value={newAct.titulo} onChange={(e) => setNewAct({ ...newAct, titulo: e.target.value })} /></div>
                  <div><Label>Descripción</Label><Textarea value={newAct.descripcion} onChange={(e) => setNewAct({ ...newAct, descripcion: e.target.value })} /></div>
                  <div><Label>Link recurso</Label><Input value={newAct.link_recurso} onChange={(e) => setNewAct({ ...newAct, link_recurso: e.target.value })} /></div>
                  <div><Label>Fecha entrega</Label><Input type="datetime-local" value={newAct.fecha_entrega} onChange={(e) => setNewAct({ ...newAct, fecha_entrega: e.target.value })} /></div>
                  <Button onClick={createActividad} className="w-full bg-brand-primary">Crear</Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </CardHeader>
        <CardContent className="space-y-2">
          {actividades.map((act) => (
            <div key={act.id} className="rounded-lg border p-3">
              <div className="flex items-center justify-between">
                <p className="font-medium">{act.titulo}</p>
                {!act.activo && <Badge variant="destructive">Inactiva</Badge>}
              </div>
              {act.descripcion && <p className="text-sm text-muted-foreground mt-1">{act.descripcion}</p>}
              {act.fecha_entrega && (
                <p className="text-xs text-muted-foreground mt-1">
                  Entrega: {new Date(act.fecha_entrega).toLocaleString('es-MX')}
                </p>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
