'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
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
} from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { BulkSemesterForm } from '@/components/admin/bulk-semester-form'
import { Search, UserCog } from 'lucide-react'
import { toast } from 'sonner'
import type { Materia, Perfil, ProfesorMateria, Programa } from '@/types/database'

type ClaseRow = ProfesorMateria & {
  materia: Materia
  profesor?: Pick<Perfil, 'id' | 'nombre_completo' | 'email'>
}

const emptyIndividual = {
  profesor_id: '',
  materia_id: '',
  grupo: '',
  periodo_escolar: '',
  horario: '',
  aula: '',
  link_clase: '',
  link_classroom: '',
  link_drive: '',
  descripcion: '',
  activo: true,
}

export default function AdminClasesPage() {
  const [clases, setClases] = useState<ClaseRow[]>([])
  const [programas, setProgramas] = useState<Programa[]>([])
  const [profesores, setProfesores] = useState<Pick<Perfil, 'id' | 'nombre_completo' | 'email'>[]>([])
  const [materias, setMaterias] = useState<Materia[]>([])
  const [individual, setIndividual] = useState(emptyIndividual)
  const [copySourceId, setCopySourceId] = useState('')
  const [copyTarget, setCopyTarget] = useState({ ...emptyIndividual, activo: true })
  const [loading, setLoading] = useState(false)
  const [busquedaClases, setBusquedaClases] = useState('')
  const [claseEditando, setClaseEditando] = useState<ClaseRow | null>(null)
  const [nuevoProfesorId, setNuevoProfesorId] = useState('')
  const [transferirContenido, setTransferirContenido] = useState(true)
  const [guardandoCambio, setGuardandoCambio] = useState(false)

  const clasesFiltradas = useMemo(() => {
    const q = busquedaClases.trim().toLowerCase()
    if (!q) return clases
    return clases.filter((c) =>
      [c.materia?.nombre, c.materia?.clave, c.profesor?.nombre_completo, c.profesor?.email, c.grupo]
        .filter(Boolean)
        .some((valor) => String(valor).toLowerCase().includes(q))
    )
  }, [clases, busquedaClases])

  const abrirCambioProfesor = (clase: ClaseRow) => {
    setClaseEditando(clase)
    setNuevoProfesorId('')
    setTransferirContenido(true)
  }

  const guardarCambioProfesor = async () => {
    if (!claseEditando || !nuevoProfesorId) return
    setGuardandoCambio(true)
    try {
      const res = await fetch('/api/admin/profesor-materias', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          id: claseEditando.id,
          profesor_id: nuevoProfesorId,
          transferir_contenido: transferirContenido,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error ?? 'No se pudo cambiar el profesor')
        return
      }
      const profesor =
        data.profesor ?? profesores.find((p) => p.id === nuevoProfesorId) ?? claseEditando.profesor
      setClases((actuales) =>
        actuales.map((c) =>
          c.id === claseEditando.id ? { ...c, profesor_id: nuevoProfesorId, profesor } : c
        )
      )
      const t = data.transferidos as
        | { tareas: number | null; examenes: number | null; avisos: number | null; rubrica: boolean }
        | null
      toast.success(
        t
          ? `Profesor actualizado. Se pasaron ${t.tareas ?? 0} tarea(s), ${t.examenes ?? 0} examen(es) y ${t.avisos ?? 0} aviso(s)${t.rubrica ? ' y la rúbrica' : ''}.`
          : 'Profesor actualizado'
      )
      setClaseEditando(null)
    } catch {
      toast.error('Error de conexión')
    } finally {
      setGuardandoCambio(false)
    }
  }

  const load = useCallback(async () => {
    const res = await fetch('/api/admin/clases', { credentials: 'include' })
    const data = await res.json()
    if (!res.ok) {
      toast.error(data.error ?? 'Error al cargar clases')
      return
    }
    setClases((data.clases ?? []) as ClaseRow[])
    setProgramas((data.programas ?? []) as Programa[])
    setProfesores(data.profesores ?? [])
    setMaterias((data.materias ?? []) as Materia[])
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const createIndividual = async () => {
    if (!individual.profesor_id || !individual.materia_id) {
      toast.error('Profesor y materia son requeridos')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/admin/profesor-materias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(individual),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success('Clase creada')
        setIndividual(emptyIndividual)
        await load()
      } else {
        toast.error(data.error ?? 'Error al crear clase')
      }
    } catch {
      toast.error('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const applyCopySource = (id: string) => {
    setCopySourceId(id)
    const src = clases.find((c) => c.id === id)
    if (!src) return
    setCopyTarget({
      profesor_id: src.profesor_id,
      materia_id: '',
      grupo: src.grupo ?? '',
      periodo_escolar: src.periodo_escolar ?? '',
      horario: src.horario ?? '',
      aula: src.aula ?? '',
      link_clase: src.link_clase ?? '',
      link_classroom: src.link_classroom ?? '',
      link_drive: src.link_drive ?? '',
      descripcion: src.descripcion ?? '',
      activo: true,
    })
  }

  const createFromCopy = async () => {
    if (!copyTarget.profesor_id || !copyTarget.materia_id) {
      toast.error('Selecciona materia para la nueva clase')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/admin/profesor-materias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(copyTarget),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success('Clase creada desde plantilla')
        setCopySourceId('')
        setCopyTarget({ ...emptyIndividual, activo: true })
        await load()
      } else {
        toast.error(data.error ?? 'Error al crear clase')
      }
    } catch {
      toast.error('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-black text-slate-950">Clases</h1>
      <p className="mt-2 text-muted-foreground">
        Crea y administra clases (asignaciones profesor-materia) de forma rápida.
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Crear clase individual</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label>Profesor</Label>
              <Select value={individual.profesor_id} onValueChange={(v) => setIndividual({ ...individual, profesor_id: v })}>
                <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                <SelectContent>
                  {profesores.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.nombre_completo ?? p.email}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Materia</Label>
              <Select value={individual.materia_id} onValueChange={(v) => setIndividual({ ...individual, materia_id: v })}>
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
                <Input value={individual[field]} onChange={(e) => setIndividual({ ...individual, [field]: e.target.value })} />
              </div>
            ))}
            <div className="flex items-center gap-2">
              <Switch checked={individual.activo} onCheckedChange={(v) => setIndividual({ ...individual, activo: v })} />
              <Label>Activo</Label>
            </div>
            <Button onClick={createIndividual} disabled={loading} className="w-full bg-brand-primary">
              Crear clase
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Crear clases por cuatrimestre</CardTitle></CardHeader>
          <CardContent>
            <BulkSemesterForm programas={programas} profesores={profesores} onSuccess={load} />
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader><CardTitle>Copiar datos de clase existente</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label>Clase origen</Label>
            <Select value={copySourceId} onValueChange={applyCopySource}>
              <SelectTrigger><SelectValue placeholder="Seleccionar clase para copiar" /></SelectTrigger>
              <SelectContent>
                {clases.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.materia?.nombre} — {c.profesor?.nombre_completo} {c.grupo ? `(Gr. ${c.grupo})` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {copySourceId && (
            <>
              <div>
                <Label>Materia destino</Label>
                <Select value={copyTarget.materia_id} onValueChange={(v) => setCopyTarget({ ...copyTarget, materia_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar materia" /></SelectTrigger>
                  <SelectContent>
                    {materias.map((m) => (
                      <SelectItem key={m.id} value={m.id}>{m.clave} — {m.nombre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <p className="text-sm text-muted-foreground">
                Se copiarán grupo, periodo escolar, horario, aula, links y descripción.
              </p>
              <Button onClick={createFromCopy} disabled={loading} className="bg-brand-primary">
                Crear clase con datos copiados
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader className="space-y-3">
          <CardTitle>Clases registradas ({clases.length})</CardTitle>
          <div className="relative sm:max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={busquedaClases}
              onChange={(e) => setBusquedaClases(e.target.value)}
              placeholder="Buscar por materia, profesor o grupo..."
              className="pl-9"
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-2 max-h-[500px] overflow-y-auto">
          {clasesFiltradas.length === 0 && (
            <p className="text-sm text-muted-foreground">No hay clases que coincidan.</p>
          )}
          {clasesFiltradas.map((c) => (
            <div key={c.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3 text-sm">
              <div>
                <p className="font-medium">{c.materia?.nombre}</p>
                <p className="text-muted-foreground">{c.profesor?.nombre_completo ?? c.profesor?.email ?? 'Sin profesor'}</p>
              </div>
              <div className="flex flex-wrap items-center gap-1">
                {c.grupo && <Badge variant="outline">Gr. {c.grupo}</Badge>}
                {c.periodo_escolar && <Badge variant="secondary">{c.periodo_escolar}</Badge>}
                {!c.activo && <Badge variant="destructive">Inactiva</Badge>}
                <Button size="sm" variant="outline" className="ml-2" onClick={() => abrirCambioProfesor(c)}>
                  <UserCog className="mr-1 h-4 w-4" /> Cambiar profesor
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Dialog open={!!claseEditando} onOpenChange={(open) => !open && setClaseEditando(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Cambiar profesor</DialogTitle>
          </DialogHeader>
          {claseEditando && (
            <div className="space-y-4">
              <div className="rounded-lg border bg-muted/30 p-3 text-sm">
                <p className="font-semibold">{claseEditando.materia?.nombre}</p>
                <p className="text-muted-foreground">
                  Profesor actual: {claseEditando.profesor?.nombre_completo ?? claseEditando.profesor?.email ?? 'Sin profesor'}
                  {claseEditando.grupo ? ` · Gr. ${claseEditando.grupo}` : ''}
                </p>
              </div>
              <div>
                <Label>Nuevo profesor</Label>
                <Select value={nuevoProfesorId} onValueChange={setNuevoProfesorId}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar profesor" /></SelectTrigger>
                  <SelectContent>
                    {profesores
                      .filter((p) => p.id !== claseEditando.profesor_id)
                      .map((p) => (
                        <SelectItem key={p.id} value={p.id}>{p.nombre_completo ?? p.email}</SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <label className="flex items-start gap-3 rounded-lg border p-3 text-sm">
                <Checkbox
                  checked={transferirContenido}
                  onCheckedChange={(v) => setTransferirContenido(v === true)}
                  className="mt-0.5"
                />
                <span>
                  <span className="block font-semibold">Pasar también el contenido de la materia</span>
                  <span className="text-muted-foreground">
                    Las tareas, exámenes, rúbrica y avisos que el profesor anterior publicó en esta materia quedarán a nombre del nuevo, para que pueda editarlos y calificar.
                  </span>
                </span>
              </label>
              <p className="text-xs text-muted-foreground">
                Los alumnos inscritos, sus entregas y calificaciones no cambian.
              </p>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setClaseEditando(null)} disabled={guardandoCambio}>
                  Cancelar
                </Button>
                <Button
                  className="bg-brand-primary"
                  onClick={guardarCambioProfesor}
                  disabled={!nuevoProfesorId || guardandoCambio}
                >
                  {guardandoCambio ? 'Guardando...' : 'Cambiar profesor'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
