'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import type { Perfil, Programa } from '@/types/database'

interface BulkSemesterFormProps {
  programas: Programa[]
  profesores: Pick<Perfil, 'id' | 'nombre_completo' | 'email'>[]
  defaultProfesorId?: string
  onSuccess?: () => void
}

const emptyForm = {
  programa_id: '',
  periodo: '',
  grupo: '',
  periodo_escolar: '',
  profesor_id: '',
  horario: '',
  aula: '',
  link_clase: '',
  link_classroom: '',
  link_drive: '',
  descripcion: '',
}

export function BulkSemesterForm({
  programas,
  profesores,
  defaultProfesorId,
  onSuccess,
}: BulkSemesterFormProps) {
  const [form, setForm] = useState({
    ...emptyForm,
    profesor_id: defaultProfesorId ?? '',
  })
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    if (!form.programa_id || !form.periodo || !form.grupo || !form.periodo_escolar) {
      toast.error('Programa, cuatrimestre, grupo y periodo escolar son requeridos')
      return
    }
    if (!form.profesor_id) {
      toast.error('Selecciona un profesor')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/admin/clases/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...form,
          periodo: Number(form.periodo),
        }),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success(`Creadas: ${data.created} | Omitidas: ${data.skipped}`)
        setForm({ ...emptyForm, profesor_id: defaultProfesorId ?? '' })
        onSuccess?.()
      } else {
        toast.error(data.error ?? 'Error al crear clases')
      }
    } catch {
      toast.error('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label>Profesor</Label>
          <Select
            value={form.profesor_id}
            onValueChange={(v) => setForm({ ...form, profesor_id: v })}
          >
            <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
            <SelectContent>
              {profesores.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.nombre_completo ?? p.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Programa</Label>
          <Select
            value={form.programa_id}
            onValueChange={(v) => setForm({ ...form, programa_id: v })}
          >
            <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
            <SelectContent>
              {programas.map((p) => (
                <SelectItem key={p.id} value={p.id}>{p.nombre}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Cuatrimestre</Label>
          <Input
            type="number"
            min={1}
            value={form.periodo}
            onChange={(e) => setForm({ ...form, periodo: e.target.value })}
          />
        </div>
        <div>
          <Label>Grupo</Label>
          <Input value={form.grupo} onChange={(e) => setForm({ ...form, grupo: e.target.value })} />
        </div>
        <div>
          <Label>Periodo escolar</Label>
          <Input
            value={form.periodo_escolar}
            onChange={(e) => setForm({ ...form, periodo_escolar: e.target.value })}
            placeholder="Ej. Otoño 2026"
          />
        </div>
        <div>
          <Label>Horario (opcional)</Label>
          <Input value={form.horario} onChange={(e) => setForm({ ...form, horario: e.target.value })} />
        </div>
        <div>
          <Label>Aula (opcional)</Label>
          <Input value={form.aula} onChange={(e) => setForm({ ...form, aula: e.target.value })} />
        </div>
      </div>
      {(['link_clase', 'link_classroom', 'link_drive', 'descripcion'] as const).map((field) => (
        <div key={field}>
          <Label className="capitalize">{field.replace(/_/g, ' ')}</Label>
          <Input value={form[field]} onChange={(e) => setForm({ ...form, [field]: e.target.value })} />
        </div>
      ))}
      <Button onClick={submit} disabled={loading} className="w-full bg-brand-primary">
        {loading ? 'Creando...' : 'Crear clases del cuatrimestre'}
      </Button>
    </div>
  )
}
