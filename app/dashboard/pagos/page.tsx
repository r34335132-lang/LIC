'use client'

import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { CreditCard, CheckCircle, Clock, AlertCircle, ExternalLink, Info, Ticket } from 'lucide-react'
import { toast } from 'sonner'
import type { Mensualidad, MetodoPago } from '@/types/database'
import type { EstadoMensualidadEfectivo } from '@/lib/academico-utils'
import { CLIP_DECLINED_USER_MESSAGE } from '@/lib/mensualidades-pago'
import { CUPON_CUBIERTO_MESSAGE } from '@/lib/cupones'
import {
  canReuseMercadoPagoCheckoutUrlClient,
  validateClientMercadoPagoPublicKey,
} from '@/lib/mercadopago-client'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type MensualidadRow = Mensualidad & { estadoEfectivo: EstadoMensualidadEfectivo }
type PaymentResponse = {
  error?: string
  detail?: string
  checkoutUrl?: string
  metodo?: MetodoPago
  cubierto?: boolean
  mensaje?: string
  montoFinal?: number
  clip?: {
    message?: string
    detail?: string
  }
}

type CuponPreview = {
  codigo: string
  montoOriginal: number
  montoDescuento: number
  montoFinal: number
  cubiertoTotal: boolean
  porcentaje: number
}

export default function PagosPage() {
  const searchParams = useSearchParams()
  const [mensualidades, setMensualidades] = useState<MensualidadRow[]>([])
  const [actual, setActual] = useState<MensualidadRow | null>(null)
  const [loading, setLoading] = useState(true)
  const [pagando, setPagando] = useState<string | null>(null)
  const [esperandoConfirmacion, setEsperandoConfirmacion] = useState(false)
  const [mensajeDeclinado, setMensajeDeclinado] = useState<string | null>(null)
  const [configMpError, setConfigMpError] = useState<string | null>(null)
  const [codigoCupon, setCodigoCupon] = useState('')
  const [previewCupon, setPreviewCupon] = useState<CuponPreview | null>(null)
  const [validandoCupon, setValidandoCupon] = useState(false)
  const [aplicandoCupon, setAplicandoCupon] = useState(false)
  const [mensajeCuponOk, setMensajeCuponOk] = useState<string | null>(null)

  useEffect(() => {
    setConfigMpError(validateClientMercadoPagoPublicKey())
  }, [])

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/dashboard/pagos', { credentials: 'include' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Error al cargar pagos')
      const rows = (data.mensualidades ?? []) as MensualidadRow[]
      setMensualidades(rows)
      setActual(data.actual ?? null)
      return rows
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al cargar pagos')
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    const pago = searchParams.get('pago')
    const metodo = searchParams.get('metodo')
    if (!pago) return

    void (async () => {
      const rows = await load()

      if (pago === 'declinado' || (pago === 'error' && metodo === 'clip')) {
        setEsperandoConfirmacion(false)
        setMensajeDeclinado(
          metodo === 'clip' || !metodo
            ? CLIP_DECLINED_USER_MESSAGE
            : 'El pago no fue aprobado. Intenta con otro método o tarjeta.'
        )
        return
      }

      if (pago === 'error') {
        setEsperandoConfirmacion(false)
        toast.error('El pago no se completó. Intenta de nuevo.')
        return
      }

      if (pago === 'ok' || pago === 'pendiente') {
        setMensajeDeclinado(null)
        const algunaPagada = rows.some(
          (m) => m.estado === 'pagado' || m.estado_pago === 'pagado'
        )
        const algunaPendienteConfirmar = rows.some(
          (m) =>
            m.estado_pago === 'pendiente' ||
            m.estado === 'iniciado'
        )

        if (algunaPagada && pago === 'ok') {
          setEsperandoConfirmacion(false)
          toast.success('¡Pago confirmado!')
        } else if (algunaPendienteConfirmar) {
          setEsperandoConfirmacion(true)
        } else {
          setEsperandoConfirmacion(true)
        }
      }
    })()
  }, [searchParams, load])

  const validarCupon = async (mensualidadId: string) => {
    if (!codigoCupon.trim()) {
      toast.error('Ingresa un código de cupón')
      return
    }
    setValidandoCupon(true)
    setPreviewCupon(null)
    setMensajeCuponOk(null)
    try {
      const res = await fetch(`/api/dashboard/pagos/${mensualidadId}/validar-cupon`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codigo: codigoCupon }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Cupón no válido')
      setPreviewCupon(data as CuponPreview)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Cupón no válido')
    } finally {
      setValidandoCupon(false)
    }
  }

  const aplicarCupon = async (mensualidadId: string) => {
    if (!codigoCupon.trim()) return
    setAplicandoCupon(true)
    setMensajeCuponOk(null)
    try {
      const res = await fetch(`/api/dashboard/pagos/${mensualidadId}/aplicar-cupon`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codigo: codigoCupon }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'No se pudo aplicar el cupón')
      setMensajeCuponOk(data.mensaje ?? CUPON_CUBIERTO_MESSAGE)
      setPreviewCupon(null)
      setCodigoCupon('')
      toast.success(data.mensaje ?? CUPON_CUBIERTO_MESSAGE)
      await load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'No se pudo aplicar el cupón')
    } finally {
      setAplicandoCupon(false)
    }
  }

  const pagar = async (id: string, metodo: MetodoPago) => {
    setPagando(`${id}:${metodo}`)
    setEsperandoConfirmacion(false)
    setMensajeDeclinado(null)
    try {
      const res = await fetch(`/api/dashboard/pagos/${id}/pagar`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metodo,
          ...(previewCupon && !previewCupon.cubiertoTotal
            ? { codigo_cupon: previewCupon.codigo }
            : {}),
        }),
      })
      const rawText = await res.text()
      let data: PaymentResponse | null = null
      if (rawText) {
        try {
          data = JSON.parse(rawText) as PaymentResponse
        } catch {
          data = null
        }
      }
      if (!res.ok) {
        const message =
          data?.error ??
          data?.detail ??
          data?.clip?.message ??
          data?.clip?.detail ??
          'No se pudo iniciar el pago. Revisa logs de Vercel.'
        throw new Error(message)
      }

      if (data?.cubierto) {
        setMensajeCuponOk(data.mensaje ?? CUPON_CUBIERTO_MESSAGE)
        await load()
        return
      }

      if (data?.checkoutUrl) {
        window.location.href = data.checkoutUrl
        return
      }

      throw new Error('El servidor no devolvió una URL de checkout')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al pagar')
    } finally {
      setPagando(null)
    }
  }

  const continuarPago = (m: MensualidadRow) => {
    if (m.metodo_pago === 'mercado_pago') {
      const url = m.mp_checkout_url
      if (url && canReuseMercadoPagoCheckoutUrlClient(url)) {
        window.location.href = url
        return
      }
      void pagar(m.id, 'mercado_pago')
      return
    }
    if (m.clip_checkout_url) window.location.href = m.clip_checkout_url
  }

  const estadoBadge = (m: MensualidadRow) => {
    if (m.metodo_pago === 'cupon' && m.estado_pago === 'pagado') {
      return (
        <Badge className="bg-emerald-100 text-emerald-800">
          <Ticket className="mr-1 h-3 w-3" /> Beca / descuento
        </Badge>
      )
    }

    const estado = m.estadoEfectivo
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

  const botonesPago = (m: MensualidadRow) => {
    if (m.estadoEfectivo === 'pagado' || m.estado_pago === 'pagado') {
      if (m.metodo_pago === 'cupon') {
        return (
          <div className="space-y-1">
            <Badge className="bg-emerald-100 text-emerald-800">
              <Ticket className="mr-1 h-3 w-3" /> {CUPON_CUBIERTO_MESSAGE}
            </Badge>
            {m.cupon_codigo && (
              <p className="text-xs text-muted-foreground">Cupón: {m.cupon_codigo}</p>
            )}
          </div>
        )
      }
      return (
        <Badge className="bg-emerald-100 text-emerald-800">
          <CheckCircle className="mr-1 h-3 w-3" /> Pagado
        </Badge>
      )
    }

    const puedePagar = ['pendiente', 'iniciado', 'vencido'].includes(m.estadoEfectivo)
    if (!puedePagar) return null

    const checkoutPendiente =
      m.estado_pago === 'pendiente' &&
      ((m.metodo_pago === 'mercado_pago' &&
        m.mp_checkout_url &&
        canReuseMercadoPagoCheckoutUrlClient(m.mp_checkout_url)) ||
        (m.metodo_pago === 'clip' && m.clip_checkout_url))

    const pagandoMp = pagando === `${m.id}:mercado_pago`
    const pagandoClip = pagando === `${m.id}:clip`
    const deshabilitado = pagando !== null

    return (
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        {checkoutPendiente && m.metodo_pago === 'mercado_pago' ? (
          <Button
            size="sm"
            className="bg-brand-primary"
            disabled={deshabilitado}
            onClick={() => continuarPago(m)}
          >
            <ExternalLink className="mr-1 h-4 w-4" />
            Continuar con Mercado Pago
          </Button>
        ) : (
          <Button
            size="sm"
            className="bg-brand-primary"
            disabled={deshabilitado}
            onClick={() => pagar(m.id, 'mercado_pago')}
          >
            <CreditCard className="mr-1 h-4 w-4" />
            {pagandoMp ? 'Procesando...' : 'Pagar con Mercado Pago'}
          </Button>
        )}

        {checkoutPendiente && m.metodo_pago === 'clip' ? (
          <Button
            size="sm"
            variant="outline"
            disabled={deshabilitado}
            onClick={() => continuarPago(m)}
          >
            <ExternalLink className="mr-1 h-4 w-4" />
            Continuar con Clip
          </Button>
        ) : (
          <Button
            size="sm"
            variant="outline"
            disabled={deshabilitado}
            onClick={() => pagar(m.id, 'clip')}
          >
            {pagandoClip ? 'Procesando...' : 'Pagar con Clip'}
          </Button>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-primary border-t-transparent" />
      </div>
    )
  }

  const metodoRedirect = searchParams.get('metodo')
  const proveedorEspera =
    metodoRedirect === 'mercadopago' || actual?.metodo_pago === 'mercado_pago'
      ? 'Mercado Pago'
      : 'Clip'

  const mostrarEspera =
    esperandoConfirmacion ||
    (searchParams.get('pago') === 'ok' &&
      (actual?.estado === 'iniciado' || actual?.estado_pago === 'pendiente'))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground md:text-3xl">Pagos</h1>
        <p className="text-muted-foreground">
          Consulta y paga tus mensualidades. La inscripción es gratuita; el primer pago es tu mensualidad.
        </p>
      </div>

      {mensajeCuponOk && (
        <Alert className="border-emerald-200 bg-emerald-50">
          <Ticket className="h-4 w-4 text-emerald-600" />
          <AlertDescription className="text-emerald-900">{mensajeCuponOk}</AlertDescription>
        </Alert>
      )}

      {configMpError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Mercado Pago no está configurado correctamente: {configMpError}
          </AlertDescription>
        </Alert>
      )}

      {mensajeDeclinado && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{mensajeDeclinado}</AlertDescription>
        </Alert>
      )}

      {mostrarEspera && (
        <Alert className="border-blue-200 bg-blue-50">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-900">
            Pago enviado, esperando confirmación de {proveedorEspera}. El estado se actualizará en unos
            momentos; no es necesario volver a pagar.
          </AlertDescription>
        </Alert>
      )}

      {actual && (
        <Card className="border-brand-primary/30 bg-gradient-to-br from-white to-brand-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-brand-primary" />
              Mensualidad actual
            </CardTitle>
            <CardDescription>{actual.concepto} — {actual.periodo}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="text-3xl font-black">
                  ${Number(actual.monto).toLocaleString('es-MX')} {actual.moneda}
                </p>
                {previewCupon && (
                  <p className="text-sm text-emerald-700">
                    Con cupón {previewCupon.codigo}: −$
                    {previewCupon.montoDescuento.toLocaleString('es-MX')} → $
                    {previewCupon.montoFinal.toLocaleString('es-MX')}
                  </p>
                )}
                {actual.fecha_vencimiento && (
                  <p className="text-sm text-muted-foreground">
                    Vence: {new Date(actual.fecha_vencimiento).toLocaleDateString('es-MX')}
                  </p>
                )}
                {estadoBadge(actual)}
              </div>
              {botonesPago(actual)}
            </div>

            {actual.estadoEfectivo !== 'pagado' && actual.estado_pago !== 'pagado' && (
              <div className="rounded-lg border p-4 space-y-3">
                <Label className="flex items-center gap-2">
                  <Ticket className="h-4 w-4" /> ¿Tienes un cupón o beca?
                </Label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Input
                    value={codigoCupon}
                    onChange={(e) => {
                      setCodigoCupon(e.target.value.toUpperCase())
                      setPreviewCupon(null)
                    }}
                    placeholder="Ej. BECA100"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    disabled={validandoCupon || aplicandoCupon}
                    onClick={() => validarCupon(actual.id)}
                  >
                    {validandoCupon ? 'Validando...' : 'Validar'}
                  </Button>
                </div>
                {previewCupon?.cubiertoTotal && (
                  <Button
                    type="button"
                    className="bg-emerald-600 hover:bg-emerald-700"
                    disabled={aplicandoCupon}
                    onClick={() => aplicarCupon(actual.id)}
                  >
                    {aplicandoCupon ? 'Aplicando...' : 'Aplicar cupón (sin cobro)'}
                  </Button>
                )}
              </div>
            )}
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
                    <TableCell>{estadoBadge(m)}</TableCell>
                    <TableCell>{botonesPago(m)}</TableCell>
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
