'use client'

import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
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
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  CheckCircle2,
  AlertCircle,
  CreditCard,
  Clock,
  Loader2,
  ExternalLink,
} from 'lucide-react'
import { INSCRIPCION_APARTADO_OK_MESSAGE } from '@/lib/inscripciones-pago'
import { CLIP_DECLINED_USER_MESSAGE } from '@/lib/mensualidades-pago'
import { RESERVATION_AMOUNT_MXN } from '@/lib/marketing'
import type { Programa } from '@/types/database'

type Paso = 'datos' | 'pago' | 'confirmado'

type EstadoInscripcionResponse = {
  id: string
  estado: string
  estado_pago: string | null
  apartado: boolean
  monto: number
}

export function InscripcionForm() {
  const searchParams = useSearchParams()
  const programaQuery = searchParams.get('programa')
  const pagoReturn = searchParams.get('pago')
  const inscripcionReturnId = searchParams.get('id')
  const metodoReturn = searchParams.get('metodo')

  const [programas, setProgramas] = useState<Pick<Programa, 'id' | 'nombre'>[]>([])
  const [programasLoading, setProgramasLoading] = useState(true)
  const [nombreCompleto, setNombreCompleto] = useState('')
  const [email, setEmail] = useState('')
  const [telefono, setTelefono] = useState('')
  const [programaId, setProgramaId] = useState('')
  const [loading, setLoading] = useState(false)
  const [pagando, setPagando] = useState<'mercado_pago' | 'clip' | null>(null)
  const [paso, setPaso] = useState<Paso>('datos')
  const [inscripcionId, setInscripcionId] = useState<string | null>(null)
  const [montoApartado, setMontoApartado] = useState(RESERVATION_AMOUNT_MXN)
  const [apartadoConfirmado, setApartadoConfirmado] = useState(false)
  const [esperandoConfirmacion, setEsperandoConfirmacion] = useState(false)
  const [error, setError] = useState('')
  const [mensajeDeclinado, setMensajeDeclinado] = useState<string | null>(null)

  const consultarEstado = useCallback(async (id: string): Promise<EstadoInscripcionResponse | null> => {
    try {
      const res = await fetch(`/api/inscripciones/${id}/estado`)
      const data = await res.json()
      if (!res.ok) return null
      return data as EstadoInscripcionResponse
    } catch {
      return null
    }
  }, [])

  useEffect(() => {
    let active = true
    async function loadProgramas() {
      try {
        const res = await fetch('/api/programas')
        const data = await res.json()
        if (!res.ok) throw new Error(data.error ?? 'Error al cargar programas')
        const list = (data.programas ?? []) as Programa[]
        if (!active) return
        setProgramas(list.map((p) => ({ id: p.id, nombre: p.nombre })))
        if (list.length > 0) {
          const match = programaQuery && list.some((p) => p.id === programaQuery)
          setProgramaId(match ? programaQuery! : list[0]!.id)
        }
      } catch {
        if (active) setError('No se pudieron cargar los programas. Intenta más tarde.')
      } finally {
        if (active) setProgramasLoading(false)
      }
    }
    loadProgramas()
    return () => {
      active = false
    }
  }, [programaQuery])

  useEffect(() => {
    if (!pagoReturn || !inscripcionReturnId) return

    setInscripcionId(inscripcionReturnId)
    setPaso('pago')

    let poll: ReturnType<typeof setInterval> | null = null
    let cancelled = false

    void (async () => {
      if (pagoReturn === 'declinado' || (pagoReturn === 'error' && metodoReturn === 'clip')) {
        setEsperandoConfirmacion(false)
        setMensajeDeclinado(
          metodoReturn === 'clip' || !metodoReturn
            ? CLIP_DECLINED_USER_MESSAGE
            : 'El pago no fue aprobado. Intenta con otro método o tarjeta.'
        )
        return
      }

      if (pagoReturn === 'error') {
        setEsperandoConfirmacion(false)
        setError('El pago no se completó. Intenta de nuevo.')
        return
      }

      if (pagoReturn === 'ok' || pagoReturn === 'pendiente') {
        setMensajeDeclinado(null)
        setEsperandoConfirmacion(true)

        const estado = await consultarEstado(inscripcionReturnId)
        if (cancelled) return
        if (estado?.monto) setMontoApartado(estado.monto)

        if (estado?.apartado) {
          setApartadoConfirmado(true)
          setEsperandoConfirmacion(false)
          setPaso('confirmado')
          return
        }

        let intentos = 0
        poll = setInterval(async () => {
          if (cancelled) return
          intentos += 1
          const refreshed = await consultarEstado(inscripcionReturnId)
          if (refreshed?.apartado) {
            if (poll) clearInterval(poll)
            setApartadoConfirmado(true)
            setEsperandoConfirmacion(false)
            setPaso('confirmado')
          } else if (intentos >= 12) {
            if (poll) clearInterval(poll)
            setEsperandoConfirmacion(false)
          }
        }, 2500)
      }
    })()

    return () => {
      cancelled = true
      if (poll) clearInterval(poll)
    }
  }, [pagoReturn, inscripcionReturnId, metodoReturn, consultarEstado])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!programaId) {
      setError('Selecciona un programa')
      return
    }

    setLoading(true)
    setError('')
    setMensajeDeclinado(null)

    try {
      const res = await fetch('/api/inscripciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombreCompleto, email, telefono, programaId }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Error al enviar solicitud')
        return
      }

      setInscripcionId(data.inscripcionId)
      if (data.monto) setMontoApartado(data.monto)

      if (data.apartado) {
        setApartadoConfirmado(true)
        setPaso('confirmado')
        return
      }

      setPaso('pago')
    } catch {
      setError('Error de conexión. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const iniciarPago = async (metodo: 'mercado_pago' | 'clip') => {
    if (!inscripcionId) return

    setPagando(metodo)
    setError('')
    setMensajeDeclinado(null)

    try {
      const res = await fetch(`/api/inscripciones/${inscripcionId}/pagar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ metodo }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(
          [data.error, data.detail].filter(Boolean).join(' — ') ||
            'No se pudo iniciar el pago'
        )
        return
      }

      if (data.alreadyPaid) {
        setApartadoConfirmado(true)
        setPaso('confirmado')
        return
      }

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl
        return
      }

      setError('El servidor no devolvió una URL de pago')
    } catch {
      setError('Error de conexión. Intenta de nuevo.')
    } finally {
      setPagando(null)
    }
  }

  if (paso === 'confirmado' || apartadoConfirmado) {
    return (
      <div className="space-y-4">
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800 font-medium">
            {INSCRIPCION_APARTADO_OK_MESSAGE}
          </AlertDescription>
        </Alert>
        <p className="text-sm text-muted-foreground">
          Guardamos tu solicitud. Un administrador revisará tus datos y te contactará para completar
          tu admisión y entregarte tus accesos.
        </p>
      </div>
    )
  }

  if (paso === 'pago') {
    return (
      <div className="space-y-5">
        <Alert className="border-brand-primary/20 bg-brand-primary/5">
          <CreditCard className="h-4 w-4 text-brand-primary" />
          <AlertDescription>
            <span className="font-bold text-slate-950">Paso 2: Aparta tu lugar</span>
            <span className="mt-1 block text-sm text-slate-600">
              Paga ${montoApartado.toLocaleString('es-MX')} MXN ahora para reservar tu cupo. El resto
              del proceso de admisión lo completamos contigo después.
            </span>
          </AlertDescription>
        </Alert>

        {mensajeDeclinado && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{mensajeDeclinado}</AlertDescription>
          </Alert>
        )}

        {esperandoConfirmacion && (
          <Alert className="border-blue-200 bg-blue-50">
            <Clock className="h-4 w-4 text-blue-600 animate-pulse" />
            <AlertDescription className="text-blue-800">
              Estamos confirmando tu pago. Esto puede tardar unos segundos…
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center">
          <p className="text-sm font-medium text-muted-foreground">Monto de apartado</p>
          <p className="text-3xl font-black text-slate-950">
            ${montoApartado.toLocaleString('es-MX')} <span className="text-lg font-bold">MXN</span>
          </p>
        </div>

        <div className="space-y-3">
          <Button
            type="button"
            className="w-full bg-[#009ee3] font-bold hover:bg-[#008ccc]"
            disabled={!!pagando || esperandoConfirmacion}
            onClick={() => iniciarPago('mercado_pago')}
          >
            {pagando === 'mercado_pago' ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Redirigiendo…
              </>
            ) : (
              <>
                <ExternalLink className="mr-2 h-4 w-4" /> Pagar con Mercado Pago
              </>
            )}
          </Button>

          <Button
            type="button"
            variant="outline"
            className="w-full font-bold"
            disabled={!!pagando || esperandoConfirmacion}
            onClick={() => iniciarPago('clip')}
          >
            {pagando === 'clip' ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Redirigiendo…
              </>
            ) : (
              'Pagar con tarjeta (Clip)'
            )}
          </Button>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          Pagos seguros. Si ya pagaste y no se refleja, espera un momento o intenta de nuevo.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && paso === 'datos' && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="nombre">Nombre completo</Label>
        <Input
          id="nombre"
          value={nombreCompleto}
          onChange={(e) => setNombreCompleto(e.target.value)}
          placeholder="Nombre y apellidos"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Correo electrónico</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="correo@ejemplo.com"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="telefono">Teléfono</Label>
        <Input
          id="telefono"
          type="tel"
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
          placeholder="618 000 0000"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="programa">Programa</Label>
        {programasLoading ? (
          <p className="text-sm text-muted-foreground">Cargando programas...</p>
        ) : programas.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No hay programas disponibles en este momento.
          </p>
        ) : (
          <Select value={programaId} onValueChange={setProgramaId}>
            <SelectTrigger id="programa">
              <SelectValue placeholder="Selecciona un programa" />
            </SelectTrigger>
            <SelectContent>
              {programas.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <Button
        type="submit"
        className="w-full bg-brand-primary font-bold"
        disabled={loading || programasLoading || programas.length === 0}
      >
        {loading ? 'Guardando…' : `Continuar — apartar con $${RESERVATION_AMOUNT_MXN} MXN`}
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        Paso 1 de 2: tus datos. Después podrás pagar en línea para apartar tu lugar.
      </p>
    </form>
  )
}
