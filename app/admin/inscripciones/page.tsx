'use client'

import { useCallback, useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle2, Eye, Plus, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { toast } from 'sonner'
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
} from '@/components/ui/dialog'
import type { Inscripcion, Programa } from '@/types/database'
import {
  ESTADOS_SEGUIMIENTO,
  labelEstadoSeguimiento,
} from '@/lib/preinscripcion-utils'

type InscripcionConPrograma = Inscripcion & {
  programa?: Pick<Programa, 'id' | 'nombre'> | null
}

type Credentials = {
  matricula: string
  tempPassword: string
  email: string
  emailSent: boolean
}

export default function AdminInscripcionesPage() {
  const [inscripciones, setInscripciones] = useState<InscripcionConPrograma[]>([])
  const [loading, setLoading] = useState<string | null>(null)
  const [credentials, setCredentials] = useState<Credentials | null>(null)
  const [detalle, setDetalle] = useState<InscripcionConPrograma | null>(null)
  const [filtroSeguimiento, setFiltroSeguimiento] = useState<string>('todos')
  const [editSeguimiento, setEditSeguimiento] = useState({ estado_seguimiento: '', notas_seguimiento: '' })
  const [guardando, setGuardando] = useState(false)
  const [documentosDetalle, setDocumentosDetalle] = useState<
    { nombre: string; subido: boolean; estado?: string; url?: string }[]
  >([])

  const abrirDetalle = async (ins: InscripcionConPrograma) => {
    setDetalle(ins)
    setEditSeguimiento({
      estado_seguimiento: ins.estado_seguimiento ?? 'sin_contactar',
      notas_seguimiento: ins.notas_seguimiento ?? '',
    })
    try {
      const res = await fetch(
        `/api/inscripciones/documentos?inscripcionId=${ins.id}&email=${encodeURIComponent(ins.email)}`
      )
      const data = await res.json()
      if (res.ok) {
        setDocumentosDetalle(
          (data.requeridos ?? []).map((r: { nombre: string; subido: { estado: string; archivo_url: string } | null }) => ({
            nombre: r.nombre,
            subido: !!r.subido,
            estado: r.subido?.estado,
            url: r.subido?.archivo_url,
          }))
        )
      }
    } catch {
      setDocumentosDetalle([])
    }
  }

  const guardarSeguimiento = async () => {
    if (!detalle) return
    setGuardando(true)
    try {
      const res = await fetch(`/api/admin/inscripciones/${detalle.id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editSeguimiento),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Error al guardar')
      toast.success('Seguimiento actualizado')
      setDetalle(data.inscripcion)
      await load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setGuardando(false)
    }
  }

  const load = useCallback(async () => {
    const res = await fetch('/api/admin/inscripciones', { credentials: 'include' })
    const data = await res.json()
    if (res.ok) {
      setInscripciones((data.inscripciones ?? []) as InscripcionConPrograma[])
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
        await load()
      } else {
        toast.error(data.error ?? 'No se pudo aprobar')
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
      if (res.ok) {
        toast.success('Inscripción rechazada')
        await load()
      }
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

  const filtradas =
    filtroSeguimiento === 'todos'
      ? inscripciones
      : inscripciones.filter((i) => (i.estado_seguimiento ?? 'sin_contactar') === filtroSeguimiento)

  return (
    <div>
      <h1 className="text-3xl font-black text-slate-950">Pre-inscripciones</h1>
      <p className="mt-2 text-muted-foreground">
        Seguimiento de aspirantes: comunícate, revisa documentos y aprueba admisiones.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        <Button
          size="sm"
          variant={filtroSeguimiento === 'todos' ? 'default' : 'outline'}
          onClick={() => setFiltroSeguimiento('todos')}
        >
          Todos ({inscripciones.length})
        </Button>
        {ESTADOS_SEGUIMIENTO.map((e) => {
          const count = inscripciones.filter((i) => (i.estado_seguimiento ?? 'sin_contactar') === e.value).length
          return (
            <Button
              key={e.value}
              size="sm"
              variant={filtroSeguimiento === e.value ? 'default' : 'outline'}
              onClick={() => setFiltroSeguimiento(e.value)}
            >
              {e.label} ({count})
            </Button>
          )
        })}
      </div>

      {credentials && (
        <Alert className="mt-6 border-green-200 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <strong>Aprobada.</strong> Matrícula: {credentials.matricula} | Contraseña: {credentials.tempPassword}
          </AlertDescription>
        </Alert>
      )}

      <div className="mt-8 space-y-3">
        {!filtradas.length && <p className="text-muted-foreground">No hay solicitudes.</p>}
        {filtradas.map((ins) => {
          const seg = ins.estado_seguimiento ?? 'sin_contactar'
          const segStyle = ESTADOS_SEGUIMIENTO.find((e) => e.value === seg)?.color ?? ''
          return (
            <Card key={ins.id}>
              <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-bold">{ins.nombre_completo}</p>
                  <p className="text-sm text-muted-foreground">{ins.email} · {ins.telefono ?? '—'}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <Badge variant="outline">{ins.programa?.nombre ?? ins.programa_id}</Badge>
                    {ins.folio_preinscripcion && (
                      <Badge variant="secondary" className="font-mono">{ins.folio_preinscripcion}</Badge>
                    )}
                    <Badge className={estadoColor(ins.estado)}>{ins.estado}</Badge>
                    <Badge className={segStyle}>{labelEstadoSeguimiento(seg)}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(ins.created_at), "d MMM yyyy HH:mm", { locale: es })}
                    </span>
                  </div>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={() => abrirDetalle(ins)}>
                    <Eye className="mr-1 h-4 w-4" /> Seguimiento
                  </Button>
                  {(ins.estado === 'pendiente' || ins.estado === 'apartado') && (
                    <>
                      <Button variant="outline" onClick={() => rechazar(ins.id)} disabled={loading === ins.id} className="border-red-200 text-red-700">
                        Rechazar
                      </Button>
                      <Button onClick={() => aprobar(ins.id)} disabled={loading === ins.id} className="bg-brand-primary font-bold">
                        Aprobar
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Dialog open={!!detalle} onOpenChange={(o) => !o && setDetalle(null)}>
        <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
          <DialogHeader><DialogTitle>Seguimiento de aspirante</DialogTitle></DialogHeader>
          {detalle && (
            <div className="space-y-4 text-sm">
              <p><span className="font-medium">Nombre:</span> {detalle.nombre_completo}</p>
              <p><span className="font-medium">Email:</span> {detalle.email}</p>
              <p><span className="font-medium">Teléfono:</span> {detalle.telefono ?? '—'}</p>
              <p><span className="font-medium">Programa:</span> {detalle.programa?.nombre ?? detalle.programa_id}</p>
              <p><span className="font-medium">Folio:</span> {detalle.folio_preinscripcion ?? '—'}</p>

              <div className="space-y-2 rounded-lg border p-3">
                <Label>Estado de seguimiento</Label>
                <Select
                  value={editSeguimiento.estado_seguimiento}
                  onValueChange={(v) => setEditSeguimiento({ ...editSeguimiento, estado_seguimiento: v })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ESTADOS_SEGUIMIENTO.map((e) => (
                      <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Label>Notas internas</Label>
                <Textarea
                  value={editSeguimiento.notas_seguimiento}
                  onChange={(e) => setEditSeguimiento({ ...editSeguimiento, notas_seguimiento: e.target.value })}
                  rows={3}
                  placeholder="Llamada realizada, pendiente acta de nacimiento…"
                />
                <Button size="sm" className="bg-brand-primary" onClick={guardarSeguimiento} disabled={guardando}>
                  {guardando ? 'Guardando…' : 'Guardar seguimiento'}
                </Button>
              </div>

              {documentosDetalle.length > 0 && (
                <div className="rounded-lg border p-3">
                  <p className="font-bold mb-2">Documentos</p>
                  <ul className="space-y-1">
                    {documentosDetalle.map((d, i) => (
                      <li key={i} className="flex justify-between gap-2">
                        <span>{d.nombre}</span>
                        {d.subido ? (
                          <a href={d.url} target="_blank" rel="noopener noreferrer" className="text-brand-primary hover:underline">
                            {d.estado ?? 'ver'}
                          </a>
                        ) : (
                          <span className="text-amber-700">Pendiente</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
