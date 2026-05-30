'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Plus, Pencil, BookOpen } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import type { Programa } from '@/types/database'
import {
  labelTipoPrograma,
  slugifyProgramaId,
  TIPOS_PROGRAMA,
} from '@/lib/programa-utils'

const emptyForm = {
  id: '',
  nombre: '',
  tipo: 'licenciatura',
  modalidad: 'Virtual',
  duracion: '',
  rvoe: '',
  descripcion: '',
  imagen_url: '',
  activo: true,
}

export default function AdminProgramasPage() {
  const [programas, setProgramas] = useState<Programa[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Programa | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [filtro, setFiltro] = useState<'todos' | 'activos' | 'inactivos'>('todos')

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/programas', { credentials: 'include' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Error al cargar')
      setProgramas((data.programas ?? []) as Programa[])
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al cargar programas')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const filtrados = useMemo(() => {
    if (filtro === 'activos') return programas.filter((p) => p.activo)
    if (filtro === 'inactivos') return programas.filter((p) => !p.activo)
    return programas
  }, [programas, filtro])

  const abrirCrear = () => {
    setEditing(null)
    setForm(emptyForm)
    setDialogOpen(true)
  }

  const abrirEditar = (p: Programa) => {
    setEditing(p)
    setForm({
      id: p.id,
      nombre: p.nombre,
      tipo: p.tipo,
      modalidad: p.modalidad,
      duracion: p.duracion,
      rvoe: p.rvoe ?? '',
      descripcion: p.descripcion ?? '',
      imagen_url: p.imagen_url ?? '',
      activo: p.activo,
    })
    setDialogOpen(true)
  }

  const guardar = async () => {
    if (!form.nombre.trim() || !form.duracion.trim()) {
      toast.error('Nombre y duración son requeridos')
      return
    }

    setSaving(true)
    try {
      if (editing) {
        const res = await fetch(`/api/admin/programas/${editing.id}`, {
          method: 'PATCH',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nombre: form.nombre,
            tipo: form.tipo,
            modalidad: form.modalidad,
            duracion: form.duracion,
            rvoe: form.rvoe || null,
            descripcion: form.descripcion || null,
            imagen_url: form.imagen_url || null,
            activo: form.activo,
          }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error ?? 'Error al guardar')
        toast.success('Carrera actualizada')
      } else {
        const res = await fetch('/api/admin/programas', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: form.id.trim() || undefined,
            nombre: form.nombre,
            tipo: form.tipo,
            modalidad: form.modalidad,
            duracion: form.duracion,
            rvoe: form.rvoe || null,
            descripcion: form.descripcion || null,
            imagen_url: form.imagen_url || null,
            activo: form.activo,
          }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error ?? 'Error al crear')
        toast.success('Carrera creada')
      }
      setDialogOpen(false)
      await load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  const toggleActivo = async (p: Programa) => {
    try {
      const res = await fetch(`/api/admin/programas/${p.id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activo: !p.activo }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Error al actualizar')
      toast.success(p.activo ? 'Carrera desactivada' : 'Carrera activada')
      await load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al actualizar')
    }
  }

  const idPreview = editing?.id ?? (form.id.trim() || slugifyProgramaId(form.nombre) || '—')

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-950">Carreras</h1>
          <p className="mt-2 text-muted-foreground">
            Administra programas académicos, RVOE e inscripciones.
          </p>
        </div>
        <Button onClick={abrirCrear} className="bg-brand-primary">
          <Plus className="mr-2 h-4 w-4" />
          Nueva carrera
        </Button>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {(['todos', 'activos', 'inactivos'] as const).map((f) => (
          <Button
            key={f}
            size="sm"
            variant={filtro === f ? 'default' : 'outline'}
            className={filtro === f ? 'bg-brand-primary' : ''}
            onClick={() => setFiltro(f)}
          >
            {f === 'todos' ? 'Todos' : f === 'activos' ? 'Activos' : 'Inactivos'}
          </Button>
        ))}
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Programas registrados</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-primary border-t-transparent" />
            </div>
          ) : filtrados.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No hay carreras registradas. Crea la primera con el botón superior.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Carrera</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Modalidad</TableHead>
                  <TableHead>Duración</TableHead>
                  <TableHead>RVOE</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtrados.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <p className="font-medium">{p.nombre}</p>
                      <p className="text-xs font-mono text-muted-foreground">{p.id}</p>
                    </TableCell>
                    <TableCell>{labelTipoPrograma(p.tipo)}</TableCell>
                    <TableCell>{p.modalidad}</TableCell>
                    <TableCell>{p.duracion}</TableCell>
                    <TableCell>{p.rvoe ?? '—'}</TableCell>
                    <TableCell>
                      <Badge className={p.activo ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}>
                        {p.activo ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/admin/planes/${encodeURIComponent(p.id)}`}>
                            <BookOpen className="mr-1 h-3 w-3" />
                            Plan
                          </Link>
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => abrirEditar(p)}>
                          <Pencil className="mr-1 h-3 w-3" />
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          variant={p.activo ? 'secondary' : 'default'}
                          onClick={() => toggleActivo(p)}
                        >
                          {p.activo ? 'Desactivar' : 'Activar'}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar carrera' : 'Nueva carrera'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {!editing && (
              <div>
                <Label>ID (opcional, se genera del nombre)</Label>
                <Input
                  value={form.id}
                  onChange={(e) => setForm({ ...form, id: e.target.value })}
                  placeholder={slugifyProgramaId(form.nombre) || 'lic-psicologia'}
                />
                <p className="text-xs text-muted-foreground mt-1">Vista previa: {idPreview}</p>
              </div>
            )}
            <div>
              <Label>Nombre</Label>
              <Input
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                placeholder="Licenciatura en Psicología"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Tipo</Label>
                <Select value={form.tipo} onValueChange={(v) => setForm({ ...form, tipo: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TIPOS_PROGRAMA.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Modalidad</Label>
                <Input
                  value={form.modalidad}
                  onChange={(e) => setForm({ ...form, modalidad: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label>Duración</Label>
              <Input
                value={form.duracion}
                onChange={(e) => setForm({ ...form, duracion: e.target.value })}
                placeholder="9 cuatrimestres"
              />
            </div>
            <div>
              <Label>RVOE (opcional)</Label>
              <Input
                value={form.rvoe}
                onChange={(e) => setForm({ ...form, rvoe: e.target.value })}
              />
            </div>
            <div>
              <Label>Descripción (opcional)</Label>
              <Textarea
                value={form.descripcion}
                onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                rows={3}
              />
            </div>
            <div>
              <Label>URL de imagen (opcional)</Label>
              <Input
                value={form.imagen_url}
                onChange={(e) => setForm({ ...form, imagen_url: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <div className="flex items-center gap-3">
              <Switch
                checked={form.activo}
                onCheckedChange={(activo) => setForm({ ...form, activo })}
              />
              <Label>Programa activo (visible en inscripción)</Label>
            </div>
            <Button className="w-full bg-brand-primary" onClick={guardar} disabled={saving}>
              {saving ? 'Guardando...' : editing ? 'Guardar cambios' : 'Crear carrera'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
