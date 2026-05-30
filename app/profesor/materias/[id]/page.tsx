'use client'

import { useCallback, useEffect, useState, use } from 'react'
import Link from 'next/link'
import { ArrowLeft, Plus, Pencil, ExternalLink, Copy, Users, Clock, Video } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
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

type AlumnoRow = AlumnoMateria & {
  alumno: Pick<Perfil, 'id' | 'nombre_completo' | 'matricula' | 'email'>
}

const emptyAct = { titulo: '', descripcion: '', link_recurso: '', fecha_entrega: '' }

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
  const [newAct, setNewAct] = useState(emptyAct)
  const [editAct, setEditAct] = useState<Actividad | null>(null)

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/profesor/materias/${id}`, { credentials: 'include' })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error ?? 'Error al cargar materia')
        return
      }
      setPm(data.profesorMateria as ProfesorMateria & { materia: Materia })
      setAlumnos((data.alumnos ?? []) as AlumnoRow[])
      setActividades((data.actividades ?? []) as Actividad[])
    } catch {
      toast.error('Error de conexión')
    }
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  const callApi = async (
    url: string,
    method: 'POST' | 'PATCH',
    body: Record<string, unknown>,
    successMsg: string
  ): Promise<boolean> => {
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error(data.error ?? 'Ocurrió un error')
        return false
      }
      toast.success(successMsg)
      await load()
      return true
    } catch {
      toast.error('Error de conexión')
      return false
    }
  }

  const updateAlumno = (
    amId: string,
    updates: { estado?: string; calificacion?: number | null }
  ) => callApi('/api/profesor/alumno-materias', 'PATCH', { id: amId, ...updates }, 'Alumno actualizado')

  const updatePm = (updates: Partial<ProfesorMateria>) =>
    callApi('/api/profesor/profesor-materias', 'PATCH', { id, ...updates }, 'Clase actualizada')

  const createActividad = async () => {
    if (!pm?.materia_id) return
    if (!newAct.titulo.trim()) {
      toast.error('El título es requerido')
      return
    }
    const ok = await callApi(
      '/api/profesor/actividades',
      'POST',
      { materia_id: pm.materia_id, ...newAct },
      'Actividad creada'
    )
    if (ok) {
      setActOpen(false)
      setNewAct(emptyAct)
    }
  }

  const updateActividad = async (updates: Partial<Actividad>) => {
    if (!editAct) return
    const ok = await callApi(
      '/api/profesor/actividades',
      'PATCH',
      { id: editAct.id, ...updates },
      'Actividad actualizada'
    )
    if (ok) setEditAct(null)
  }

  const toggleActividad = (act: Actividad) =>
    callApi(
      '/api/profesor/actividades',
      'PATCH',
      { id: act.id, activo: !act.activo },
      act.activo ? 'Actividad desactivada' : 'Actividad activada'
    )

  const copyClassroomToGroup = async () => {
    try {
      const res = await fetch('/api/profesor/profesor-materias/copy-classroom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id }),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success(data.updated ? `Link copiado a ${data.updated} clase(s)` : (data.message ?? 'Listo'))
        await load()
      } else {
        toast.error(data.error ?? 'No se pudo copiar el link')
      }
    } catch {
      toast.error('Error de conexión')
    }
  }

  const scrollTo = (targetId: string) => {
    document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
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
          <CardHeader><CardTitle className="text-base">Acciones rápidas</CardTitle></CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={() => scrollTo('clase-info')}>
              <Video className="mr-1 h-4 w-4" /> Editar link de clase
            </Button>
            <Button size="sm" variant="outline" onClick={() => scrollTo('clase-info')}>
              <Clock className="mr-1 h-4 w-4" /> Editar horario/aula
            </Button>
            <Button size="sm" variant="outline" onClick={copyClassroomToGroup} disabled={!pm.link_classroom || !pm.grupo}>
              <Copy className="mr-1 h-4 w-4" /> Copiar Classroom al grupo
            </Button>
            <Button size="sm" variant="outline" onClick={() => scrollTo('alumnos')}>
              <Users className="mr-1 h-4 w-4" /> Ver alumnos
            </Button>
            <Button size="sm" variant="outline" onClick={() => scrollTo('alumnos')}>
              <Pencil className="mr-1 h-4 w-4" /> Calificar
            </Button>
          </CardContent>
        </Card>
      )}

      {(pm.link_clase || pm.link_classroom || pm.link_drive) && (
        <div className="mt-4 flex flex-wrap gap-2">
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

      {isOwner && (
        <Card className="mt-6" id="clase-info">
          <CardHeader><CardTitle className="text-base">Información de clase</CardTitle></CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {(['horario', 'aula', 'link_clase', 'link_classroom', 'link_drive'] as const).map((field) => (
              <div key={field}>
                <Label className="capitalize text-xs">{field.replace(/_/g, ' ')}</Label>
                <Input
                  defaultValue={pm[field] ?? ''}
                  onBlur={(e) => {
                    const value = e.target.value || null
                    if (value !== (pm[field] ?? null)) updatePm({ [field]: value })
                  }}
                />
              </div>
            ))}
            <div className="sm:col-span-2">
              <Label className="text-xs">Descripción</Label>
              <Textarea
                defaultValue={pm.descripcion ?? ''}
                onBlur={(e) => {
                  const value = e.target.value || null
                  if (value !== (pm.descripcion ?? null)) updatePm({ descripcion: value })
                }}
              />
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="mt-6" id="alumnos">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Alumnos ({alumnos.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {alumnos.length === 0 && (
            <p className="text-sm text-muted-foreground">Aún no hay alumnos en esta materia.</p>
          )}
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
                    onBlur={(e) => {
                      const raw = e.target.value
                      const value = raw ? parseFloat(raw) : null
                      if (value !== null && (value < 0 || value > 10)) {
                        toast.error('La calificación debe estar entre 0 y 10')
                        return
                      }
                      if (value !== (am.calificacion ?? null)) {
                        updateAlumno(am.id, { calificacion: value })
                      }
                    }}
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
          {actividades.length === 0 && (
            <p className="text-sm text-muted-foreground">Sin actividades.</p>
          )}
          {actividades.map((act) => (
            <div key={act.id} className="rounded-lg border p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="font-medium">{act.titulo}</p>
                <div className="flex items-center gap-2">
                  {!act.activo && <Badge variant="destructive">Inactiva</Badge>}
                  {isOwner && (
                    <>
                      <Switch
                        checked={act.activo}
                        onCheckedChange={() => toggleActividad(act)}
                      />
                      <Button variant="ghost" size="sm" onClick={() => setEditAct(act)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
              {act.descripcion && <p className="text-sm text-muted-foreground mt-1">{act.descripcion}</p>}
              {act.link_recurso && (
                <a href={act.link_recurso} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex items-center gap-1 text-sm text-brand-primary hover:underline">
                  <ExternalLink className="h-3 w-3" /> Recurso
                </a>
              )}
              {act.fecha_entrega && (
                <p className="text-xs text-muted-foreground mt-1">
                  Entrega: {new Date(act.fecha_entrega).toLocaleString('es-MX')}
                </p>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <Dialog open={!!editAct} onOpenChange={(o) => !o && setEditAct(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Editar actividad</DialogTitle></DialogHeader>
          {editAct && (
            <div className="space-y-3">
              <div>
                <Label>Título</Label>
                <Input
                  defaultValue={editAct.titulo}
                  onChange={(e) => setEditAct({ ...editAct, titulo: e.target.value })}
                />
              </div>
              <div>
                <Label>Descripción</Label>
                <Textarea
                  defaultValue={editAct.descripcion ?? ''}
                  onChange={(e) => setEditAct({ ...editAct, descripcion: e.target.value })}
                />
              </div>
              <div>
                <Label>Link recurso</Label>
                <Input
                  defaultValue={editAct.link_recurso ?? ''}
                  onChange={(e) => setEditAct({ ...editAct, link_recurso: e.target.value })}
                />
              </div>
              <Button
                onClick={() =>
                  updateActividad({
                    titulo: editAct.titulo,
                    descripcion: editAct.descripcion || null,
                    link_recurso: editAct.link_recurso || null,
                  })
                }
                className="w-full bg-brand-primary"
              >
                Guardar
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
