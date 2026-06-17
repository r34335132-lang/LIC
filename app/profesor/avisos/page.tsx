'use client'

import { useCallback, useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
import { Megaphone, Plus, Trash2, AlertTriangle, Video, BookOpen } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import type { Aviso, Materia, ProfesorMateria, TipoAviso } from '@/types/database'

type AvisoRow = Aviso & { materia: Pick<Materia, 'id' | 'nombre' | 'clave'> | null }
type MateriaOption = ProfesorMateria & { materia: Materia }

const tipoOptions: { value: TipoAviso; label: string }[] = [
  { value: 'general', label: 'General' },
  { value: 'clase', label: 'Clase / virtual' },
  { value: 'urgente', label: 'Urgente' },
  { value: 'materia', label: 'Materia' },
]

export default function ProfesorAvisosPage() {
  const [avisos, setAvisos] = useState<AvisoRow[]>([])
  const [materias, setMaterias] = useState<MateriaOption[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    titulo: '',
    contenido: '',
    materia_id: '',
    tipo: 'general' as TipoAviso,
  })

  const load = useCallback(async () => {
    const [avisosRes, materiasRes] = await Promise.all([
      fetch('/api/profesor/avisos', { credentials: 'include' }),
      fetch('/api/profesor/materias', { credentials: 'include' }),
    ])
    const avisosData = await avisosRes.json()
    const materiasData = await materiasRes.json()
    if (avisosRes.ok) setAvisos(avisosData.avisos ?? [])
    if (materiasRes.ok) {
      const list = (materiasData.materias ?? []) as MateriaOption[]
      setMaterias(list)
      if (!form.materia_id && list[0]?.materia?.id) {
        setForm((f) => ({ ...f, materia_id: list[0]!.materia!.id }))
      }
    }
  }, [form.materia_id])

  useEffect(() => {
    load()
  }, [load])

  const crear = async () => {
    if (!form.titulo.trim() || !form.contenido.trim() || !form.materia_id) {
      toast.error('Completa título, contenido y materia')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/profesor/avisos', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Error al publicar')
      toast.success('Aviso publicado — los alumnos lo verán en su tablero')
      setOpen(false)
      setForm({ titulo: '', contenido: '', materia_id: form.materia_id, tipo: 'general' })
      await load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al publicar')
    } finally {
      setLoading(false)
    }
  }

  const eliminar = async (id: string) => {
    if (!confirm('¿Eliminar este aviso?')) return
    const res = await fetch(`/api/profesor/avisos/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    })
    const data = await res.json()
    if (res.ok) {
      toast.success('Aviso eliminado')
      await load()
    } else {
      toast.error(data.error ?? 'No se pudo eliminar')
    }
  }

  const tipoBadge = (tipo: TipoAviso) => {
    if (tipo === 'urgente') {
      return (
        <Badge variant="destructive">
          <AlertTriangle className="mr-1 h-3 w-3" /> Urgente
        </Badge>
      )
    }
    if (tipo === 'clase') {
      return (
        <Badge className="bg-blue-100 text-blue-800">
          <Video className="mr-1 h-3 w-3" /> Clase
        </Badge>
      )
    }
    if (tipo === 'materia') {
      return (
        <Badge variant="secondary">
          <BookOpen className="mr-1 h-3 w-3" /> Materia
        </Badge>
      )
    }
    return (
      <Badge variant="outline">
        <Megaphone className="mr-1 h-3 w-3" /> General
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-black">Avisos a alumnos</h1>
          <p className="mt-2 text-muted-foreground">
            Publica anuncios como &quot;Mañana tendremos clase virtual&quot; para tus grupos.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-brand-primary font-bold">
              <Plus className="mr-2 h-4 w-4" /> Nuevo aviso
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Publicar aviso</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Materia / grupo</Label>
                <Select
                  value={form.materia_id}
                  onValueChange={(v) => setForm({ ...form, materia_id: v })}
                >
                  <SelectTrigger><SelectValue placeholder="Selecciona materia" /></SelectTrigger>
                  <SelectContent>
                    {materias.map((pm) => (
                      <SelectItem key={pm.id} value={pm.materia.id}>
                        {pm.materia.nombre}{pm.grupo ? ` — Grupo ${pm.grupo}` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Tipo</Label>
                <Select
                  value={form.tipo}
                  onValueChange={(v) => setForm({ ...form, tipo: v as TipoAviso })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {tipoOptions.map((o) => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Título</Label>
                <Input
                  placeholder="Ej. Clase virtual mañana 10:00"
                  value={form.titulo}
                  onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                />
              </div>
              <div>
                <Label>Mensaje</Label>
                <Textarea
                  rows={4}
                  placeholder="Mañana tendremos clase virtual por Meet. Traigan dudas de la unidad 2..."
                  value={form.contenido}
                  onChange={(e) => setForm({ ...form, contenido: e.target.value })}
                />
              </div>
              <Button className="w-full bg-brand-primary" onClick={crear} disabled={loading}>
                {loading ? 'Publicando...' : 'Publicar aviso'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {avisos.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <Megaphone className="mx-auto mb-3 h-10 w-10 opacity-40" />
              Aún no has publicado avisos. Usa el botón de arriba para avisar a tus alumnos.
            </CardContent>
          </Card>
        )}
        {avisos.map((aviso) => (
          <Card key={aviso.id} className={aviso.tipo === 'urgente' ? 'border-red-200' : ''}>
            <CardHeader className="pb-2">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <CardTitle className="text-lg">{aviso.titulo}</CardTitle>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {tipoBadge(aviso.tipo)}
                    {aviso.materia && (
                      <Badge variant="outline">{aviso.materia.nombre}</Badge>
                    )}
                    {!aviso.activo && <Badge variant="destructive">Inactivo</Badge>}
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => eliminar(aviso.id)}>
                  <Trash2 className="h-4 w-4 text-red-600" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-wrap">{aviso.contenido}</p>
              <p className="mt-3 text-xs text-muted-foreground">
                {format(new Date(aviso.created_at), "d MMM yyyy HH:mm", { locale: es })}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
