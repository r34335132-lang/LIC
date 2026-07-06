'use client'

import { useCallback, useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { CreditCard, Plus, Pencil, Bell } from 'lucide-react'
import { toast } from 'sonner'
import type { Mensualidad, Perfil } from '@/types/database'
import type { EstadoMensualidadEfectivo } from '@/lib/academico-utils'
import { mensualidadMontoDefault } from '@/lib/academico-utils'

type MensualidadAdmin = Mensualidad & {
  estadoEfectivo: EstadoMensualidadEfectivo
  alumno: Pick<Perfil, 'id' | 'nombre_completo' | 'email' | 'matricula'> | null
}

type AlumnoOption = Pick<Perfil, 'id' | 'nombre_completo' | 'email' | 'matricula'>

export default function AdminPagosPage() {
  const [mensualidades, setMensualidades] = useState<MensualidadAdmin[]>([])
  const [alumnos, setAlumnos] = useState<AlumnoOption[]>([])
  const [filtroEstado, setFiltroEstado] = useState('todos')
  const [loading, setLoading] = useState(true)
  const [generando, setGenerando] = useState(false)
  const [creando, setCreando] = useState(false)
  const [recordando, setRecordando] = useState<string | null>(null)
  const [dialogGenerar, setDialogGenerar] = useState(false)
  const [dialogCrear, setDialogCrear] = useState(false)
  const [editando, setEditando] = useState<MensualidadAdmin | null>(null)
  const [guardando, setGuardando] = useState(false)
  const [busquedaAlumno, setBusquedaAlumno] = useState('')
  const [editForm, setEditForm] = useState({
    estado: 'pendiente',
    estado_pago: '',
    monto: '',
    fecha_vencimiento: '',
    paid_at: '',
  })
  const [form, setForm] = useState({
    mes: String(new Date().getMonth() + 1),
    anio: String(new Date().getFullYear()),
    monto: String(mensualidadMontoDefault()),
    fecha_vencimiento: '',
  })
  const [formAlumno, setFormAlumno] = useState({
    alumno_id: '',
    mes: String(new Date().getMonth() + 1),
    anio: String(new Date().getFullYear()),
    monto: String(mensualidadMontoDefault()),
    fecha_vencimiento: '',
  })

  const loadAlumnos = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/alumnos', { credentials: 'include' })
      const data = await res.json()
      if (res.ok) setAlumnos(data.alumnos ?? [])
    } catch {
      // silencioso — el selector mostrará vacío
    }
  }, [])

  const load = useCallback(async () => {
    try {
      const qs = filtroEstado !== 'todos' ? `?estado=${filtroEstado}` : ''
      const res = await fetch(`/api/admin/mensualidades${qs}`, { credentials: 'include' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Error al cargar')
      setMensualidades(data.mensualidades ?? [])
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al cargar pagos')
    } finally {
      setLoading(false)
    }
  }, [filtroEstado])

  useEffect(() => {
    setLoading(true)
    load()
    loadAlumnos()
  }, [load, loadAlumnos])

  const alumnosFiltrados = alumnos.filter((a) => {
    const q = busquedaAlumno.trim().toLowerCase()
    if (!q) return true
    return (
      (a.nombre_completo ?? '').toLowerCase().includes(q) ||
      (a.email ?? '').toLowerCase().includes(q) ||
      (a.matricula ?? '').toLowerCase().includes(q)
    )
  })

  const crearPorAlumno = async () => {
    if (!formAlumno.alumno_id) {
      toast.error('Selecciona un alumno')
      return
    }
    setCreando(true)
    try {
      const res = await fetch('/api/admin/mensualidades', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alumno_id: formAlumno.alumno_id,
          mes: Number(formAlumno.mes),
          anio: Number(formAlumno.anio),
          monto: Number(formAlumno.monto),
          fecha_vencimiento: formAlumno.fecha_vencimiento || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Error al crear')
      toast.success('Mensualidad creada para el alumno')
      setDialogCrear(false)
      await load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al crear')
    } finally {
      setCreando(false)
    }
  }

  const recordarPago = async (m: MensualidadAdmin) => {
    if (!m.alumno_id) return
    setRecordando(m.id)
    try {
      const res = await fetch('/api/admin/avisos', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alumno_id: m.alumno_id,
          mensualidad_id: m.id,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Error al enviar recordatorio')
      toast.success(`Recordatorio enviado a ${m.alumno?.nombre_completo ?? 'alumno'}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al enviar recordatorio')
    } finally {
      setRecordando(null)
    }
  }

  const generar = async () => {
    setGenerando(true)
    try {
      const res = await fetch('/api/admin/mensualidades/generar', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mes: Number(form.mes),
          anio: Number(form.anio),
          monto: Number(form.monto),
          fecha_vencimiento: form.fecha_vencimiento || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Error al generar')
      toast.success(`Creadas: ${data.created}, omitidas: ${data.skipped}`)
      setDialogGenerar(false)
      await load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al generar')
    } finally {
      setGenerando(false)
    }
  }

  const toDateInput = (iso: string | null) =>
    iso ? iso.slice(0, 10) : ''

  const toDateTimeLocal = (iso: string | null) => {
    if (!iso) return ''
    const d = new Date(iso)
    const pad = (n: number) => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
  }

  const abrirEditar = (m: MensualidadAdmin) => {
    setEditando(m)
    setEditForm({
      estado: m.estado,
      estado_pago: m.estado_pago ?? '',
      monto: String(m.monto),
      fecha_vencimiento: toDateInput(m.fecha_vencimiento),
      paid_at: toDateTimeLocal(m.paid_at),
    })
  }

  const guardarEdicion = async () => {
    if (!editando) return
    setGuardando(true)
    try {
      const payload: Record<string, unknown> = {
        estado: editForm.estado,
        monto: Number(editForm.monto),
        fecha_vencimiento: editForm.fecha_vencimiento || null,
        paid_at: editForm.paid_at ? new Date(editForm.paid_at).toISOString() : null,
      }
      if (editForm.estado_pago) payload.estado_pago = editForm.estado_pago

      const res = await fetch(`/api/admin/mensualidades/${editando.id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Error al guardar')
      toast.success('Mensualidad actualizada')
      setEditando(null)
      await load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setGuardando(false)
    }
  }

  const metodoLabel = (metodo: string | null) => {
    if (metodo === 'mercado_pago') return 'Mercado Pago'
    if (metodo === 'clip') return 'Clip'
    if (metodo === 'cupon') return 'Cupón / beca'
    return '—'
  }

  const estadoPagoColor = (estado: string | null) => {
    const map: Record<string, string> = {
      pagado: 'bg-green-100 text-green-800',
      pendiente: 'bg-blue-100 text-blue-800',
      declinado: 'bg-orange-100 text-orange-800',
      error: 'bg-red-100 text-red-800',
    }
    return map[estado ?? ''] ?? 'bg-gray-100 text-gray-800'
  }

  const estadoColor = (estado: string) => {
    const map: Record<string, string> = {
      pagado: 'bg-green-100 text-green-800',
      pendiente: 'bg-yellow-100 text-yellow-800',
      iniciado: 'bg-blue-100 text-blue-800',
      vencido: 'bg-red-100 text-red-800',
      cancelado: 'bg-gray-100 text-gray-800',
    }
    return map[estado] ?? 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black">Pagos</h1>
          <p className="text-muted-foreground">Administración de mensualidades de alumnos.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setDialogCrear(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Crear por alumno
          </Button>
          <Button className="bg-brand-primary" onClick={() => setDialogGenerar(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Generar del mes
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" /> Mensualidades
          </CardTitle>
          <Select value={filtroEstado} onValueChange={setFiltroEstado}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="pendiente">Pendiente</SelectItem>
              <SelectItem value="iniciado">Iniciado</SelectItem>
              <SelectItem value="pagado">Pagado</SelectItem>
              <SelectItem value="vencido">Vencido</SelectItem>
              <SelectItem value="cancelado">Cancelado</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-primary border-t-transparent" />
            </div>
          ) : mensualidades.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No hay mensualidades.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Alumno</TableHead>
                  <TableHead>Periodo</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Vencimiento</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Método</TableHead>
                  <TableHead>Estado pago</TableHead>
                  <TableHead>Fecha pago</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mensualidades.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell>
                      <p className="font-medium">{m.alumno?.nombre_completo ?? '—'}</p>
                      <p className="text-xs text-muted-foreground">
                        {m.alumno?.matricula ?? m.alumno?.email}
                      </p>
                    </TableCell>
                    <TableCell>
                      {m.periodo}
                      <span className="text-xs text-muted-foreground block">
                        {m.mes}/{m.anio}
                      </span>
                    </TableCell>
                    <TableCell>${Number(m.monto).toLocaleString('es-MX')}</TableCell>
                    <TableCell>
                      {m.fecha_vencimiento
                        ? new Date(m.fecha_vencimiento).toLocaleDateString('es-MX')
                        : '—'}
                    </TableCell>
                    <TableCell>
                      <Badge className={estadoColor(m.estadoEfectivo)}>{m.estadoEfectivo}</Badge>
                    </TableCell>
                    <TableCell>{metodoLabel(m.metodo_pago)}</TableCell>
                    <TableCell>
                      <Badge className={estadoPagoColor(m.estado_pago)}>
                        {m.estado_pago ?? '—'}
                      </Badge>
                      {m.pago_error_mensaje && (
                        <p className="text-xs text-muted-foreground mt-1 max-w-[200px] truncate" title={m.pago_error_mensaje}>
                          {m.pago_error_mensaje}
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      {m.paid_at
                        ? new Date(m.paid_at).toLocaleString('es-MX')
                        : '—'}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {(m.estadoEfectivo === 'pendiente' || m.estadoEfectivo === 'vencido') && (
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Recordar pago"
                            onClick={() => recordarPago(m)}
                            disabled={recordando === m.id}
                          >
                            <Bell className="h-4 w-4 text-amber-600" />
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" onClick={() => abrirEditar(m)}>
                          <Pencil className="h-4 w-4" />
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

      <Dialog open={dialogCrear} onOpenChange={setDialogCrear}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear mensualidad por alumno</DialogTitle>
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
                value={formAlumno.alumno_id}
                onValueChange={(v) => setFormAlumno({ ...formAlumno, alumno_id: v })}
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Mes</Label>
                <Input
                  type="number"
                  min={1}
                  max={12}
                  value={formAlumno.mes}
                  onChange={(e) => setFormAlumno({ ...formAlumno, mes: e.target.value })}
                />
              </div>
              <div>
                <Label>Año</Label>
                <Input
                  type="number"
                  value={formAlumno.anio}
                  onChange={(e) => setFormAlumno({ ...formAlumno, anio: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label>Monto (MXN)</Label>
              <Input
                type="number"
                value={formAlumno.monto}
                onChange={(e) => setFormAlumno({ ...formAlumno, monto: e.target.value })}
              />
            </div>
            <div>
              <Label>Fecha de vencimiento (opcional)</Label>
              <Input
                type="date"
                value={formAlumno.fecha_vencimiento}
                onChange={(e) => setFormAlumno({ ...formAlumno, fecha_vencimiento: e.target.value })}
              />
            </div>
            <Button className="w-full bg-brand-primary" onClick={crearPorAlumno} disabled={creando}>
              {creando ? 'Creando...' : 'Crear mensualidad'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={dialogGenerar} onOpenChange={setDialogGenerar}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generar mensualidades del mes</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Mes</Label>
                <Input
                  type="number"
                  min={1}
                  max={12}
                  value={form.mes}
                  onChange={(e) => setForm({ ...form, mes: e.target.value })}
                />
              </div>
              <div>
                <Label>Año</Label>
                <Input
                  type="number"
                  value={form.anio}
                  onChange={(e) => setForm({ ...form, anio: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label>Monto (MXN)</Label>
              <Input
                type="number"
                value={form.monto}
                onChange={(e) => setForm({ ...form, monto: e.target.value })}
              />
            </div>
            <div>
              <Label>Fecha de vencimiento (opcional)</Label>
              <Input
                type="date"
                value={form.fecha_vencimiento}
                onChange={(e) => setForm({ ...form, fecha_vencimiento: e.target.value })}
              />
            </div>
            <Button className="w-full bg-brand-primary" onClick={generar} disabled={generando}>
              {generando ? 'Generando...' : 'Generar para todos los alumnos'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editando} onOpenChange={(o) => !o && setEditando(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar mensualidad</DialogTitle>
          </DialogHeader>
          {editando && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {editando.alumno?.nombre_completo} — {editando.periodo}
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Estado</Label>
                  <Select value={editForm.estado} onValueChange={(v) => setEditForm({ ...editForm, estado: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pendiente">Pendiente</SelectItem>
                      <SelectItem value="iniciado">Iniciado</SelectItem>
                      <SelectItem value="pagado">Pagado</SelectItem>
                      <SelectItem value="vencido">Vencido</SelectItem>
                      <SelectItem value="cancelado">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Estado pago</Label>
                  <Select
                    value={editForm.estado_pago || 'none'}
                    onValueChange={(v) => setEditForm({ ...editForm, estado_pago: v === 'none' ? '' : v })}
                  >
                    <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">—</SelectItem>
                      <SelectItem value="pendiente">Pendiente</SelectItem>
                      <SelectItem value="pagado">Pagado</SelectItem>
                      <SelectItem value="declinado">Declinado</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Monto (MXN)</Label>
                <Input
                  type="number"
                  value={editForm.monto}
                  onChange={(e) => setEditForm({ ...editForm, monto: e.target.value })}
                />
              </div>
              <div>
                <Label>Fecha de vencimiento</Label>
                <Input
                  type="date"
                  value={editForm.fecha_vencimiento}
                  onChange={(e) => setEditForm({ ...editForm, fecha_vencimiento: e.target.value })}
                />
              </div>
              <div>
                <Label>Fecha de pago</Label>
                <Input
                  type="datetime-local"
                  value={editForm.paid_at}
                  onChange={(e) => setEditForm({ ...editForm, paid_at: e.target.value })}
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Déjala vacía si aún no ha pagado.
                </p>
              </div>
              <Button className="w-full bg-brand-primary" onClick={guardarEdicion} disabled={guardando}>
                {guardando ? 'Guardando...' : 'Guardar cambios'}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
