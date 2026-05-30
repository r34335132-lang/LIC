'use client'

import { useEffect, useState } from 'react'
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
import { getNombrePerfil } from '@/lib/perfil-utils'
import { Plus, Pencil } from 'lucide-react'

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

  const supabase = createClient()

  const loadData = async () => {
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
      grouped[pm.profesor_id].push(pm)
    }
    setAsignaciones(grouped)
  }

  useEffect(() => {
    loadData()
  }, [])

  const createProfesor = async () => {
    const res = await fetch('/api/admin/profesores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newProf),
    })
    if (res.ok) {
      setCreateOpen(false)
      setNewProf({ nombre: '', email: '', telefono: '', password: '' })
      loadData()
    }
  }

  const assignMateria = async () => {
    if (!selectedProfesor) return
    const res = await fetch('/api/admin/profesor-materias', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profesor_id: selectedProfesor, ...newAssign }),
    })
    if (res.ok) {
      setAssignOpen(false)
      setNewAssign({
        materia_id: '', grupo: '', periodo_escolar: '', horario: '', aula: '',
        link_clase: '', link_classroom: '', link_drive: '', descripcion: '',
      })
      loadData()
    }
  }

  const updateAsignacion = async (id: string, updates: Partial<ProfesorMateria>) => {
    const res = await fetch('/api/admin/profesor-materias', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...updates }),
    })
    if (res.ok) {
      setEditPm(null)
      loadData()
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
              <div><Label>Contraseña temporal</Label><Input type="password" value={newProf.password} onChange={(e) => setNewProf({ ...newProf, password: e.target.value })} /></div>
              <Button onClick={createProfesor} className="w-full bg-brand-primary">Crear</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

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
