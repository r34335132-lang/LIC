'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
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
import { Switch } from '@/components/ui/switch'
import { Bell, Plus, Trash2, CreditCard } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { buildRecordatorioPagoMensualidad } from '@/lib/academico-utils'
import type { Aviso, Mensualidad, Perfil } from '@/types/database'

type AlumnoOption = Pick<Perfil, 'id' | 'nombre_completo' | 'email' | 'matricula'>

type MensualidadPendiente = Mensualidad & {
  estadoEfectivo?: string
}

type AvisoRow = Aviso & {
  alumno: Pick<Perfil, 'id' | 'nombre_completo' | 'email' | 'matricula'> | null
  mensualidad: Pick<Mensualidad, 'id' | 'periodo' | 'monto' | 'estado'> | null
}

export default function AdminAvisosPage() {
  const [avisos, setAvisos] = useState<AvisoRow[]>([])
  const [alumnos, setAlumnos] = useState<AlumnoOption[]>([])
  const [mensualidadesPendientes, setMensualidadesPendientes] = useState<MensualidadPendiente[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [busquedaAlumno, setBusquedaAlumno] = useState('')
  const [form, setForm] = useState({
    alumno_id: '',
    mensualidad_id: '',
    titulo: '',
    contenido: '',
  })

  const load = useCallback(async () => {
    const res = await fetch('/api/admin/avisos', { credentials: 'include' })
    const data = await res.json()
    if (res.ok) setAvisos(data.avisos ?? [])
  }, [])

  const loadAlumnos = useCallback(async () => {
    const res = await fetch('/api/admin/alumnos', { credentials: 'include' })
    const data = await res.json()
    if (res.ok) setAlumnos(data.alumnos ?? [])
  }, [])

  useEffect(() => {
    load()
    loadAlumnos()
  }, [load, loadAlumnos])

  useEffect(() => {
    if (!form.alumno_id) {
      setMensualidadesPendientes([])
      return
    }
    let active = true
    async function loadMensualidades() {
      const res = await fetch(
        `/api/admin/mensualidades?alumno_id=${form.alumno_id}&estado=pendiente`,
        { credentials: 'include' }
      )
      const data = await res.json()
      if (!active || !res.ok) return
      const pendientes = (data.mensualidades ?? []).filter(
        (m: MensualidadPendiente) =>
          m.estado !== 'pagado' && m.estado !== 'cancelado'
      )
      setMensualidadesPendientes(pendientes)
    }
    loadMensualidades()
    return () => {
      active = false
    }
  }, [form.alumno_id])

  const alumnosFiltrados = alumnos.filter((a) => {
    const q = busquedaAlumno.trim().toLowerCase()
    if (!q) return true
    return (
      (a.nombre_completo ?? '').toLowerCase().includes(q) ||
      (a.email ?? '').toLowerCase().includes(q) ||
      (a.matricula ?? '').toLowerCase().includes(q)
    )
  })

  const onMensualidadChange = (mensualidadId: string) => {
    const mensualidad = mensualidadesPendientes.find((m) => m.id === mensualidadId)
    if (mensualidad) {
      const auto = buildRecordatorioPagoMensualidad({
        periodo: mensualidad.periodo,
        monto: Number(mensualidad.monto),
        fecha_vencimiento: mensualidad.fecha_vencimiento,
      })
      setForm({
        ...form,
        mensualidad_id: mensualidadId,
        titulo: auto.titulo,
        contenido: auto.contenido,
      })
    } else {
      setForm({ ...form, mensualidad_id: mensualidadId })
    }
  }

  const crear = async () => {
    if (!form.alumno_id) {
      toast.error('Selecciona un alumno')
      return
    }
    if (!form.titulo.trim() || !form.contenido.trim()) {
      toast.error('Completa título y mensaje (o selecciona una mensualidad)')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/admin/avisos', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alumno_id: form.alumno_id,
          mensualidad_id: form.mensualidad_id || undefined,
          titulo: form.titulo,
          contenido: form.contenido,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Error al publicar')
      toast.success('Recordatorio publicado — el alumno lo verá en Avisos')
      setOpen(false)
      setForm({ alumno_id: '', mensualidad_id: '', titulo: '', contenido: '' })
      setBusquedaAlumno('')
      await load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al publicar')
    } finally {
      setLoading(false)
    }
  }

  const toggleActivo = async (aviso: AvisoRow) => {
    const res = await fetch(`/api/admin/avisos/${aviso.id}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ activo: !aviso.activo }),
    })
    const data = await res.json()
    if (res.ok) {
      toast.success(aviso.activo ? 'Aviso desactivado' : 'Aviso activado')
      await load()
    } else {
      toast.error(data.error ?? 'No se pudo actualizar')
    }
  }

  const eliminar = async (id: string) => {
    if (!confirm('¿Eliminar este recordatorio?')) return
    const res = await fetch(`/api/admin/avisos/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    })
    const data = await res.json()
    if (res.ok) {
      toast.success('Recordatorio eliminado')
      await load()
    } else {
      toast.error(data.error ?? 'No se pudo eliminar')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-black">Avisos de pago</h1>
          <p className="mt-2 text-muted-foreground">
            Envía recordatorios a alumnos para que realicen sus mensualidades pendientes.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" asChild>
            <Link href="/admin/pagos">
              <CreditCard className="mr-2 h-4 w-4" /> Ver pagos
            </Link>
          </Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-brand-primary font-bold">
                <Plus className="mr-2 h-4 w-4" /> Nuevo recordatorio
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Recordatorio de pago</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Buscar alumno</Label>
                  <Input
                    placeholder="Nombre, correo o matrícula"
                    value={busquedaAlumno}
                    onChange={(e) => setBusquedaAlumno(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Alumno</Label>
                  <Select
                    value={form.alumno_id}
                    onValueChange={(v) =>
                      setForm({ alumno_id: v, mensualidad_id: '', titulo: '', contenido: '' })
                    }
                  >
                    <SelectTrigger><SelectValue placeholder="Selecciona alumno" /></SelectTrigger>
                    <SelectContent>
                      {alumnosFiltrados.map((a) => (
                        <SelectItem key={a.id} value={a.id}>
                          {a.nombre_completo}
                          {a.matricula ? ` (${a.matricula})` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {form.alumno_id && (
                  <div>
                    <Label>Mensualidad pendiente (opcional)</Label>
                    <Select
                      value={form.mensualidad_id || 'none'}
                      onValueChange={(v) => onMensualidadChange(v === 'none' ? '' : v)}
                    >
                      <SelectTrigger><SelectValue placeholder="Sin mensualidad vinculada" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Mensaje personalizado</SelectItem>
                        {mensualidadesPendientes.map((m) => (
                          <SelectItem key={m.id} value={m.id}>
                            {m.periodo} — ${Number(m.monto).toLocaleString('es-MX')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div>
                  <Label>Título</Label>
                  <Input
                    placeholder="Recordatorio de pago — Julio 2026"
                    value={form.titulo}
                    onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Mensaje</Label>
                  <Textarea
                    rows={5}
                    placeholder="Recuerda realizar el pago de tu mensualidad..."
                    value={form.contenido}
                    onChange={(e) => setForm({ ...form, contenido: e.target.value })}
                  />
                </div>
                <Button className="w-full bg-brand-primary" onClick={crear} disabled={loading}>
                  {loading ? 'Publicando...' : 'Publicar recordatorio'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="space-y-3">
        {avisos.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <Bell className="mx-auto mb-3 h-10 w-10 opacity-40" />
              Aún no has enviado recordatorios de pago.
            </CardContent>
          </Card>
        )}
        {avisos.map((aviso) => (
          <Card key={aviso.id} className={!aviso.activo ? 'opacity-60' : ''}>
            <CardHeader className="pb-2">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <CardTitle className="text-lg">{aviso.titulo}</CardTitle>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Badge className="bg-amber-100 text-amber-800">
                      <CreditCard className="mr-1 h-3 w-3" /> Pago
                    </Badge>
                    {aviso.alumno && (
                      <Badge variant="outline">
                        {aviso.alumno.nombre_completo}
                        {aviso.alumno.matricula ? ` · ${aviso.alumno.matricula}` : ''}
                      </Badge>
                    )}
                    {aviso.mensualidad && (
                      <Badge variant="secondary">{aviso.mensualidad.periodo}</Badge>
                    )}
                    {!aviso.activo && <Badge variant="destructive">Inactivo</Badge>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <Switch checked={aviso.activo} onCheckedChange={() => toggleActivo(aviso)} />
                    <span className="text-xs text-muted-foreground">Activo</span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => eliminar(aviso.id)}>
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-muted-foreground">{aviso.contenido}</p>
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
