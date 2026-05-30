'use client'

import { useCallback, useEffect, useState } from 'react'
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
import { BulkSemesterForm } from '@/components/admin/bulk-semester-form'
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
          <CardHeader><CardTitle>Crear clases por semestre</CardTitle></CardHeader>
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
        <CardHeader><CardTitle>Clases registradas ({clases.length})</CardTitle></CardHeader>
        <CardContent className="space-y-2 max-h-[400px] overflow-y-auto">
          {clases.map((c) => (
            <div key={c.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3 text-sm">
              <div>
                <p className="font-medium">{c.materia?.nombre}</p>
                <p className="text-muted-foreground">{c.profesor?.nombre_completo}</p>
              </div>
              <div className="flex flex-wrap gap-1">
                {c.grupo && <Badge variant="outline">Gr. {c.grupo}</Badge>}
                {c.periodo_escolar && <Badge variant="secondary">{c.periodo_escolar}</Badge>}
                {!c.activo && <Badge variant="destructive">Inactiva</Badge>}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
