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
import { CreditCard, Plus } from 'lucide-react'
import { toast } from 'sonner'
import type { Mensualidad, Perfil } from '@/types/database'
import type { EstadoMensualidadEfectivo } from '@/lib/academico-utils'
import { mensualidadMontoDefault } from '@/lib/academico-utils'

type MensualidadAdmin = Mensualidad & {
  estadoEfectivo: EstadoMensualidadEfectivo
  alumno: Pick<Perfil, 'id' | 'nombre_completo' | 'email' | 'matricula'> | null
}

export default function AdminPagosPage() {
  const [mensualidades, setMensualidades] = useState<MensualidadAdmin[]>([])
  const [filtroEstado, setFiltroEstado] = useState('todos')
  const [loading, setLoading] = useState(true)
  const [generando, setGenerando] = useState(false)
  const [dialogGenerar, setDialogGenerar] = useState(false)
  const [form, setForm] = useState({
    mes: String(new Date().getMonth() + 1),
    anio: String(new Date().getFullYear()),
    monto: String(mensualidadMontoDefault()),
    fecha_vencimiento: '',
  })

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
  }, [load])

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
        <Button className="bg-brand-primary" onClick={() => setDialogGenerar(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Generar mensualidades del mes
        </Button>
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
                  <TableHead>Pago</TableHead>
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
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

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
    </div>
  )
}
