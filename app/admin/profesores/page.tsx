'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
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
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { getNombrePerfil } from '@/lib/perfil-utils'
import { Plus, Pencil, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import type { Materia, Perfil, ProfesorMateria } from '@/types/database'

type ProfesorMateriaRow = ProfesorMateria & { materia: Materia }

export default function AdminProfesoresPage() {
  const [profesores, setProfesores] = useState<Perfil[]>([])
  const [materias, setMaterias] = useState<Materia[]>([])
  const [asignaciones, setAsignaciones] = useState<Record<string, ProfesorMateriaRow[]>>({})
  const [selectedProfesor, setSelectedProfesor] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [assignOpen, setAssignOpen] = useState(false)
  const [editPm, setEditPm] = useState<ProfesorMateriaRow | null>(null)

  const [newProf, setNewProf] = useState({ nombre: '', email: '', telefono: '', password: '' })
  const [createdCreds, setCreatedCreds] = useState<{ email: string; tempPassword: string; emailSent: boolean } | null>(null)
  const [creating, setCreating] = useState(false)
  const [newAssign, setNewAssign] = useState({
    materia_id: '',
    grupo: '',
    periodo_escolar: '',
    horario: '',
    aula: '',
    link_clase: '',
    link_classroom: '',
    link_drive: '',
    descripcion: '',
  })

  const supabase = useMemo(() => createClient(), [])

  const loadData = useCallback(async () => {
    const { data: profs } = await supabase
      .from('perfiles')
      .select('*')
      .eq('rol', 'profesor')
      .order('nombre_completo')
    setProfesores((profs ?? []) as Perfil[])

    const { data: mats } = await supabase.from('materias').select('*').order('periodo')
    setMaterias((mats ?? []) as Materia[])

    const { data: pms } = await supabase
      .from('profesor_materias')
      .select('*, materia:materias(*)')

    const grouped: Record<string, ProfesorMateriaRow[]> = {}
    for (const pm of (pms ?? []) as ProfesorMateriaRow[]) {
      if (!grouped[pm.profesor_id]) grouped[pm.profesor_id] = []
      grouped[pm.profesor_id]!.push(pm)
    }
    setAsignaciones(grouped)
  }, [supabase])

  useEffect(() => {
    loadData()
  }, [loadData])

  const createProfesor = async () => {
    if (!newProf.nombre.trim() || !newProf.email.trim()) {
      toast.error('Nombre y email son requeridos')
      return
    }
    setCreating(true)
    try {
      const res = await fetch('/api/admin/profesores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProf),
      })
      const data = await res.json()
      if (res.ok) {
        setCreateOpen(false)
        setNewProf({ nombre: '', email: '', telefono: '', password: '' })
        setCreatedCreds({
          email: data.email ?? newProf.email,
          tempPassword: data.tempPassword,
          emailSent: !!data.emailSent,
        })
        toast.success('Profesor creado')
        if (!data.emailSent) {
          toast.warning('No se pudo enviar el correo. Comparte la contraseña manualmente.')
        }
        await loadData()
      } else {
        toast.error(data.error ?? 'No se pudo crear el profesor')
      }
    } catch {
      toast.error('Error de conexión')
    } finally {
      setCreating(false)
    }
  }

  const assignMateria = async () => {
    if (!selectedProfesor) return
    if (!newAssign.materia_id) {
      toast.error('Selecciona una materia')
      return
    }
    try {
      const res = await fetch('/api/admin/profesor-materias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profesor_id: selectedProfesor, ...newAssign }),
      })
      const data = await res.json()
      if (res.ok) {
        setAssignOpen(false)
        setNewAssign({
          materia_id: '', grupo: '', periodo_escolar: '', horario: '', aula: '',
          link_clase: '', link_classroom: '', link_drive: '', descripcion: '',
        })
        toast.success('Materia asignada')
        await loadData()
      } else {
        toast.error(data.error ?? 'No se pudo asignar la materia')
      }
    } catch {
      toast.error('Error de conexión')
    }
  }

  const updateAsignacion = async (id: string, updates: Partial<ProfesorMateria>) => {
    try {
      const res = await fetch('/api/admin/profesor-materias', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates }),
      })
      const data = await res.json()
      if (res.ok) {
        setEditPm(null)
        toast.success('Asignación actualizada')
        await loadData()
      } else {
        toast.error(data.error ?? 'No se pudo actualizar')
      }
    } catch {
      toast.error('Error de conexión')
    }
  }

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-950">Profesores</h1>
          <p className="mt-2 text-muted-foreground">Gestiona docentes y asignaciones de materias.</p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-brand-primary font-bold">
              <Plus className="mr-2 h-4 w-4" /> Crear profesor
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nuevo profesor</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div><Label>Nombre</Label><Input value={newProf.nombre} onChange={(e) => setNewProf({ ...newProf, nombre: e.target.value })} /></div>
              <div><Label>Email</Label><Input type="email" value={newProf.email} onChange={(e) => setNewProf({ ...newProf, email: e.target.value })} /></div>
              <div><Label>Teléfono</Label><Input value={newProf.telefono} onChange={(e) => setNewProf({ ...newProf, telefono: e.target.value })} /></div>
              <div>
                <Label>Contraseña temporal (opcional)</Label>
                <Input type="text" placeholder="Déjalo vacío para generarla automáticamente" value={newProf.password} onChange={(e) => setNewProf({ ...newProf, password: e.target.value })} />
                <p className="mt-1 text-xs text-muted-foreground">Si lo dejas vacío, el sistema genera una contraseña segura y la envía por correo.</p>
              </div>
              <Button onClick={createProfesor} disabled={creating} className="w-full bg-brand-primary">
                {creating ? 'Creando...' : 'Crear'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {createdCreds && (
        <Alert className="mt-6 border-green-200 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <strong>Profesor creado.</strong> Estas credenciales solo se muestran una vez.
            <div className="mt-1 font-mono text-sm">
              Email: {createdCreds.email} | Contraseña temporal: {createdCreds.tempPassword}
            </div>
            {createdCreds.emailSent
              ? <span className="text-xs">Se envió un correo con los accesos.</span>
              : <span className="text-xs text-red-700">El correo no se envió: comparte la contraseña manualmente.</span>}
          </AlertDescription>
        </Alert>
      )}

      <div className="mt-8 space-y-6">
        {profesores.map((prof) => (
          <Card key={prof.id}>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{getNombrePerfil(prof)}</CardTitle>
                <p className="text-sm text-muted-foreground">{prof.email}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => { setSelectedProfesor(prof.id); setAssignOpen(true) }}
              >
                <Plus className="mr-1 h-4 w-4" /> Asignar materia
              </Button>
            </CardHeader>
            <CardContent>
              {(asignaciones[prof.id] ?? []).length === 0 ? (
                <p className="text-sm text-muted-foreground">Sin materias asignadas.</p>
              ) : (
                <div className="space-y-2">
                  {asignaciones[prof.id].map((pm) => (
                    <div key={pm.id} className="flex items-center justify-between rounded-lg border p-3">
                      <div>
                        <p className="font-medium">{pm.materia?.nombre}</p>
                        <div className="flex gap-2 mt-1">
                          {pm.grupo && <Badge variant="outline">Grupo {pm.grupo}</Badge>}
                          {pm.periodo_escolar && <Badge variant="secondary">{pm.periodo_escolar}</Badge>}
                          {!pm.activo && <Badge variant="destructive">Inactivo</Badge>}
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => setEditPm(pm)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Asignar materia</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Materia</Label>
              <Select value={newAssign.materia_id} onValueChange={(v) => setNewAssign({ ...newAssign, materia_id: v })}>
                <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                <SelectContent>
                  {materias.map((m) => (
                    <SelectItem key={m.id} value={m.id}>{m.clave} — {m.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {(['grupo', 'periodo_escolar', 'horario', 'aula', 'link_clase', 'link_classroom', 'link_drive', 'descripcion'] as const).map((field) => (
              <div key={field}>
                <Label className="capitalize">{field.replace(/_/g, ' ')}</Label>
                <Input value={newAssign[field]} onChange={(e) => setNewAssign({ ...newAssign, [field]: e.target.value })} />
              </div>
            ))}
            <Button onClick={assignMateria} className="w-full bg-brand-primary">Asignar</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editPm} onOpenChange={(o) => !o && setEditPm(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Editar asignación</DialogTitle></DialogHeader>
          {editPm && (
            <div className="space-y-3">
              <p className="font-medium">{editPm.materia?.nombre}</p>
              {(['grupo', 'periodo_escolar', 'horario', 'aula', 'link_clase', 'link_classroom', 'link_drive', 'descripcion'] as const).map((field) => (
                <div key={field}>
                  <Label className="capitalize">{field.replace(/_/g, ' ')}</Label>
                  <Input
                    defaultValue={editPm[field] ?? ''}
                    onBlur={(e) => updateAsignacion(editPm.id, { [field]: e.target.value || null })}
                  />
                </div>
              ))}
              <div className="flex items-center gap-2">
                <Switch
                  checked={editPm.activo}
                  onCheckedChange={(v) => updateAsignacion(editPm.id, { activo: v })}
                />
                <Label>Activo</Label>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
