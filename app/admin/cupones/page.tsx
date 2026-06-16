'use client'

import { useCallback, useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
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
import { Plus, Ticket } from 'lucide-react'
import { toast } from 'sonner'
import type { Cupon } from '@/types/database'

const emptyForm = {
  codigo: '',
  valor: '100',
  usos_maximos: '',
  expires_at: '',
  activo: true,
}

export default function AdminCuponesPage() {
  const [cupones, setCupones] = useState<Cupon[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/cupones', { credentials: 'include' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Error al cargar')
      setCupones((data.cupones ?? []) as Cupon[])
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al cargar cupones')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const crear = async () => {
    if (!form.codigo.trim()) {
      toast.error('El código es requerido')
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/admin/cupones', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          codigo: form.codigo,
          tipo: 'porcentaje',
          valor: Number(form.valor),
          activo: form.activo,
          usos_maximos: form.usos_maximos ? Number(form.usos_maximos) : null,
          expires_at: form.expires_at || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Error al crear')
      toast.success('Cupón creado')
      setDialogOpen(false)
      setForm(emptyForm)
      await load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al crear cupón')
    } finally {
      setSaving(false)
    }
  }

  const toggleActivo = async (cupon: Cupon) => {
    try {
      const res = await fetch(`/api/admin/cupones/${cupon.id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activo: !cupon.activo }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Error al actualizar')
      await load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al actualizar')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black">Cupones</h1>
          <p className="text-muted-foreground">
            Descuentos por porcentaje para mensualidades. Ejemplo: BECA100 cubre el 100%.
          </p>
        </div>
        <Button className="bg-brand-primary" onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo cupón
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ticket className="h-5 w-5" /> Cupones activos
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-primary border-t-transparent" />
            </div>
          ) : cupones.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No hay cupones.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Usos</TableHead>
                  <TableHead>Expira</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cupones.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-mono font-semibold">{c.codigo}</TableCell>
                    <TableCell>{c.tipo}</TableCell>
                    <TableCell>{Number(c.valor)}%</TableCell>
                    <TableCell>
                      {c.usos_actuales}
                      {c.usos_maximos != null ? ` / ${c.usos_maximos}` : ' / ∞'}
                    </TableCell>
                    <TableCell>
                      {c.expires_at
                        ? new Date(c.expires_at).toLocaleDateString('es-MX')
                        : '—'}
                    </TableCell>
                    <TableCell>
                      <Badge className={c.activo ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                        {c.activo ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Switch checked={c.activo} onCheckedChange={() => toggleActivo(c)} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuevo cupón</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Código</Label>
              <Input
                value={form.codigo}
                onChange={(e) => setForm({ ...form, codigo: e.target.value.toUpperCase() })}
                placeholder="BECA100"
              />
            </div>
            <div>
              <Label>Descuento (%)</Label>
              <Input
                type="number"
                min={1}
                max={100}
                value={form.valor}
                onChange={(e) => setForm({ ...form, valor: e.target.value })}
              />
            </div>
            <div>
              <Label>Usos máximos (opcional)</Label>
              <Input
                type="number"
                min={1}
                value={form.usos_maximos}
                onChange={(e) => setForm({ ...form, usos_maximos: e.target.value })}
                placeholder="Ilimitado si se deja vacío"
              />
            </div>
            <div>
              <Label>Fecha de expiración (opcional)</Label>
              <Input
                type="datetime-local"
                value={form.expires_at}
                onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={form.activo}
                onCheckedChange={(activo) => setForm({ ...form, activo })}
              />
              <Label>Activo</Label>
            </div>
            <Button className="w-full bg-brand-primary" onClick={crear} disabled={saving}>
              {saving ? 'Guardando...' : 'Crear cupón'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
