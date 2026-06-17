'use client'

import { useCallback, useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle2, Eye, CreditCard } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { Inscripcion } from '@/types/database'

type Credentials = {
  matricula: string
  tempPassword: string
  email: string
  emailSent: boolean
}

export default function AdminInscripcionesPage() {
  const [inscripciones, setInscripciones] = useState<Inscripcion[]>([])
  const [loading, setLoading] = useState<string | null>(null)
  const [credentials, setCredentials] = useState<Credentials | null>(null)
  const [detalle, setDetalle] = useState<Inscripcion | null>(null)

  const load = useCallback(async () => {
    const res = await fetch('/api/admin/inscripciones', { credentials: 'include' })
    const data = await res.json()
    if (res.ok) {
      setInscripciones((data.inscripciones ?? []) as Inscripcion[])
    } else {
      toast.error(data.error ?? 'Error al cargar inscripciones')
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const aprobar = async (id: string) => {
    setLoading(id)
    setCredentials(null)
    try {
      const res = await fetch(`/api/admin/inscripciones/${id}/aprobar`, { method: 'POST' })
      const data = await res.json()
      if (res.ok) {
        setCredentials({
          email: inscripciones.find((i) => i.id === id)?.email ?? '',
          matricula: data.matricula,
          tempPassword: data.tempPassword,
          emailSent: !!data.emailSent,
        })
        toast.success('Inscripción aprobada')
        if (!data.emailSent) {
          toast.warning('No se pudo enviar el correo. Comparte la contraseña manualmente.')
        }
        await load()
      } else {
        toast.error(data.error ?? 'No se pudo aprobar la inscripción')
      }
    } catch {
      toast.error('Error de conexión')
    } finally {
      setLoading(null)
    }
  }

  const rechazar = async (id: string) => {
    setLoading(id)
    try {
      const res = await fetch(`/api/admin/inscripciones/${id}/rechazar`, { method: 'POST' })
      const data = await res.json()
      if (res.ok) {
        toast.success('Inscripción rechazada')
        await load()
      } else {
        toast.error(data.error ?? 'No se pudo rechazar la inscripción')
      }
    } catch {
      toast.error('Error de conexión')
    } finally {
      setLoading(null)
    }
  }

  const estadoColor = (estado: string) => {
    switch (estado) {
      case 'aprobada': return 'bg-green-100 text-green-800'
      case 'apartado': return 'bg-emerald-100 text-emerald-800'
      case 'rechazada': return 'bg-red-100 text-red-800'
      default: return 'bg-yellow-100 text-yellow-800'
    }
  }

  const apartadoPagado = (ins: Inscripcion) =>
    ins.estado === 'apartado' ||
    ins.estado_pago === 'pagado' ||
    !!ins.apartado_pagado_at

  return (
    <div>
      <h1 className="text-3xl font-black text-slate-950">Inscripciones</h1>
      <p className="mt-2 text-muted-foreground">Revisa y aprueba solicitudes de admisión.</p>

      {credentials && (
        <Alert className="mt-6 border-green-200 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <strong>Inscripción aprobada.</strong> Estas credenciales solo se muestran una vez.
            <div className="mt-1 font-mono text-sm">
              Email: {credentials.email} | Matrícula: {credentials.matricula} | Contraseña temporal: {credentials.tempPassword}
            </div>
            {credentials.emailSent
              ? <span className="text-xs">Se envió un correo con los accesos.</span>
              : <span className="text-xs text-red-700">El correo no se envió: comparte la contraseña manualmente.</span>}
          </AlertDescription>
        </Alert>
      )}

      <div className="mt-8 space-y-3">
        {!inscripciones.length && (
          <p className="text-muted-foreground">No hay solicitudes.</p>
        )}
        {inscripciones.map((ins) => (
          <Card key={ins.id}>
            <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-bold">{ins.nombre_completo}</p>
                <p className="text-sm text-muted-foreground">{ins.email}</p>
                {ins.telefono && <p className="text-sm text-muted-foreground">{ins.telefono}</p>}
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <Badge variant="outline">{ins.programa_id}</Badge>
                  <Badge className={estadoColor(ins.estado)}>{ins.estado}</Badge>
                  {apartadoPagado(ins) && (
                    <Badge className="bg-emerald-100 text-emerald-800">
                      <CreditCard className="mr-1 h-3 w-3" /> Apartado pagado
                    </Badge>
                  )}
                  {ins.estado_pago && ins.estado_pago !== 'pagado' && (
                    <Badge variant="outline">Pago: {ins.estado_pago}</Badge>
                  )}
                  {ins.matricula_generada && (
                    <Badge variant="secondary">{ins.matricula_generada}</Badge>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(ins.created_at), "d MMM yyyy HH:mm", { locale: es })}
                  </span>
                </div>
              </div>
              <div className="flex shrink-0 flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={() => setDetalle(ins)}>
                  <Eye className="mr-1 h-4 w-4" /> Detalle
                </Button>
                {(ins.estado === 'pendiente' || ins.estado === 'apartado') && (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => rechazar(ins.id)}
                      disabled={loading === ins.id}
                      className="border-red-200 text-red-700 hover:bg-red-50"
                    >
                      Rechazar
                    </Button>
                    <Button
                      onClick={() => aprobar(ins.id)}
                      disabled={loading === ins.id}
                      className="bg-brand-primary font-bold"
                    >
                      {loading === ins.id ? 'Procesando...' : 'Aprobar'}
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!detalle} onOpenChange={(o) => !o && setDetalle(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Detalle de inscripción</DialogTitle></DialogHeader>
          {detalle && (
            <div className="space-y-2 text-sm">
              <p><span className="font-medium">Nombre:</span> {detalle.nombre_completo}</p>
              <p><span className="font-medium">Email:</span> {detalle.email}</p>
              <p><span className="font-medium">Teléfono:</span> {detalle.telefono ?? '—'}</p>
              <p><span className="font-medium">Programa:</span> {detalle.programa_id}</p>
              <p><span className="font-medium">Estado:</span> {detalle.estado}</p>
              {apartadoPagado(detalle) && (
                <p className="text-emerald-700 font-medium">
                  Apartado pagado
                  {detalle.apartado_monto != null && ` — $${Number(detalle.apartado_monto).toLocaleString('es-MX')} MXN`}
                  {detalle.apartado_pagado_at && (
                    <> el {format(new Date(detalle.apartado_pagado_at), "d MMM yyyy HH:mm", { locale: es })}</>
                  )}
                  {detalle.metodo_pago && <> ({detalle.metodo_pago})</>}
                </p>
              )}
              {detalle.estado_pago && (
                <p><span className="font-medium">Estado pago:</span> {detalle.estado_pago}</p>
              )}
              <p><span className="font-medium">Matrícula generada:</span> {detalle.matricula_generada ?? '—'}</p>
              <p>
                <span className="font-medium">Comprobante:</span>{' '}
                {detalle.comprobante_url ? (
                  <a href={detalle.comprobante_url} target="_blank" rel="noopener noreferrer" className="text-brand-primary hover:underline">
                    Ver comprobante
                  </a>
                ) : '—'}
              </p>
              <p>
                <span className="font-medium">Fecha:</span>{' '}
                {format(new Date(detalle.created_at), "d MMM yyyy HH:mm", { locale: es })}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
