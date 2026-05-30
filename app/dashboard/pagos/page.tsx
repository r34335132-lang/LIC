'use client'

import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { CreditCard, CheckCircle, Clock, AlertCircle, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'
import type { Mensualidad } from '@/types/database'
import type { EstadoMensualidadEfectivo } from '@/lib/academico-utils'

type MensualidadRow = Mensualidad & { estadoEfectivo: EstadoMensualidadEfectivo }

export default function PagosPage() {
  const searchParams = useSearchParams()
  const [mensualidades, setMensualidades] = useState<MensualidadRow[]>([])
  const [actual, setActual] = useState<MensualidadRow | null>(null)
  const [loading, setLoading] = useState(true)
  const [pagando, setPagando] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/dashboard/pagos', { credentials: 'include' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Error al cargar pagos')
      setMensualidades(data.mensualidades ?? [])
      setActual(data.actual ?? null)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al cargar pagos')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    const pago = searchParams.get('pago')
    if (pago === 'ok') toast.success('Pago procesado. Verificaremos el estado en unos momentos.')
    if (pago === 'error') toast.error('El pago no se completó. Intenta de nuevo.')
  }, [searchParams])

  const pagar = async (id: string) => {
    setPagando(id)
    try {
      const res = await fetch(`/api/dashboard/pagos/${id}/pagar`, {
        method: 'POST',
        credentials: 'include',
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'No se pudo iniciar el pago')
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al pagar')
      setPagando(null)
    }
  }

  const estadoBadge = (estado: EstadoMensualidadEfectivo) => {
    switch (estado) {
      case 'pagado':
        return (
          <Badge className="bg-emerald-100 text-emerald-800">
            <CheckCircle className="mr-1 h-3 w-3" /> Pagado
          </Badge>
        )
      case 'vencido':
        return (
          <Badge className="bg-red-100 text-red-800">
            <AlertCircle className="mr-1 h-3 w-3" /> Vencido
          </Badge>
        )
      case 'iniciado':
        return (
          <Badge className="bg-blue-100 text-blue-800">
            <Clock className="mr-1 h-3 w-3" /> En proceso
          </Badge>
        )
      case 'cancelado':
      case 'fallido':
        return <Badge variant="destructive">{estado}</Badge>
      default:
        return (
          <Badge className="bg-amber-100 text-amber-800">
            <Clock className="mr-1 h-3 w-3" /> Pendiente
          </Badge>
        )
    }
  }

  const botonPago = (m: MensualidadRow) => {
    if (m.estadoEfectivo === 'pagado') {
      return (
        <Badge className="bg-emerald-100 text-emerald-800">
          <CheckCircle className="mr-1 h-3 w-3" /> Pagado
        </Badge>
      )
    }
    if (m.clip_checkout_url && m.estado === 'iniciado') {
      return (
        <Button
          size="sm"
          variant="outline"
          className="bg-brand-primary text-white hover:bg-brand-primary/90"
          disabled={pagando === m.id}
          onClick={() => pagar(m.id)}
        >
          <ExternalLink className="mr-1 h-4 w-4" />
          Continuar pago
        </Button>
      )
    }
    if (['pendiente', 'iniciado', 'vencido'].includes(m.estadoEfectivo)) {
      return (
        <Button
          size="sm"
          className="bg-brand-primary"
          disabled={pagando === m.id}
          onClick={() => pagar(m.id)}
        >
          <CreditCard className="mr-1 h-4 w-4" />
          {pagando === m.id ? 'Procesando...' : 'Pagar ahora'}
        </Button>
      )
    }
    return null
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground md:text-3xl">Pagos</h1>
        <p className="text-muted-foreground">
          Consulta y paga tus mensualidades. La inscripción es gratuita; el primer pago es tu mensualidad.
        </p>
      </div>

      {actual && (
        <Card className="border-brand-primary/30 bg-gradient-to-br from-white to-brand-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-brand-primary" />
              Mensualidad actual
            </CardTitle>
            <CardDescription>{actual.concepto} — {actual.periodo}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-3xl font-black">${Number(actual.monto).toLocaleString('es-MX')} {actual.moneda}</p>
              {actual.fecha_vencimiento && (
                <p className="text-sm text-muted-foreground">
                  Vence: {new Date(actual.fecha_vencimiento).toLocaleDateString('es-MX')}
                </p>
              )}
              {estadoBadge(actual.estadoEfectivo)}
            </div>
            {botonPago(actual)}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Historial de mensualidades</CardTitle>
        </CardHeader>
        <CardContent>
          {mensualidades.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Periodo</TableHead>
                  <TableHead>Concepto</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Vencimiento</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mensualidades.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell>{m.periodo}</TableCell>
                    <TableCell>{m.concepto}</TableCell>
                    <TableCell>${Number(m.monto).toLocaleString('es-MX')}</TableCell>
                    <TableCell>
                      {m.fecha_vencimiento
                        ? new Date(m.fecha_vencimiento).toLocaleDateString('es-MX')
                        : '-'}
                    </TableCell>
                    <TableCell>{estadoBadge(m.estadoEfectivo)}</TableCell>
                    <TableCell>{botonPago(m)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No tienes mensualidades registradas.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
