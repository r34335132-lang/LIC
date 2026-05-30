'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  FileText,
  Search,
  Calendar,
  Upload,
  CheckCircle,
  Clock,
  AlertCircle,
  Sparkles,
  ClipboardList,
  Link as LinkIcon,
} from 'lucide-react'
import { toast } from 'sonner'
import type { Actividad, ActividadEntrega, Materia, Perfil } from '@/types/database'
import type { EstadoEntregaTarea } from '@/lib/academico-utils'
import { cuatrimestreLabel } from '@/lib/academico-utils'

type TareaRow = {
  actividad: Actividad
  materia: Materia | null
  profesor: Pick<Perfil, 'id' | 'nombre_completo' | 'email'> | null
  entrega: ActividadEntrega | null
  estadoEntrega: EstadoEntregaTarea
  calificacion: number | null
  retroalimentacion: string | null
}

type Resumen = {
  pendientes: number
  entregadas: number
  revisadas: number
  promedioRevisadas: number | null
}

export default function TareasPage() {
  const [tareas, setTareas] = useState<TareaRow[]>([])
  const [resumen, setResumen] = useState<Resumen>({
    pendientes: 0,
    entregadas: 0,
    revisadas: 0,
    promedioRevisadas: null,
  })
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [filtroEstado, setFiltroEstado] = useState<string>('todas')
  const [modalTarea, setModalTarea] = useState<TareaRow | null>(null)
  const [textoRespuesta, setTextoRespuesta] = useState('')
  const [linkEntrega, setLinkEntrega] = useState('')
  const [archivoUrl, setArchivoUrl] = useState('')
  const [enviando, setEnviando] = useState(false)

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/dashboard/tareas', { credentials: 'include' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Error al cargar tareas')
      setTareas(data.tareas ?? [])
      setResumen(data.resumen ?? resumen)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al cargar tareas')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const tareasFiltradas = useMemo(() => {
    return tareas.filter((t) => {
      const titulo = t.actividad.titulo.toLowerCase()
      const materia = t.materia?.nombre?.toLowerCase() ?? ''
      const coincideBusqueda =
        titulo.includes(busqueda.toLowerCase()) ||
        materia.includes(busqueda.toLowerCase())
      const coincideEstado =
        filtroEstado === 'todas' ||
        (filtroEstado === 'pendiente' &&
          (t.estadoEntrega === 'pendiente' || t.estadoEntrega === 'vencida')) ||
        (filtroEstado === 'entregada' && t.estadoEntrega === 'entregada') ||
        (filtroEstado === 'revisada' && t.estadoEntrega === 'revisada')
      return coincideBusqueda && coincideEstado
    })
  }, [tareas, busqueda, filtroEstado])

  const grouped = useMemo(() => {
    const map = new Map<string, TareaRow[]>()
    for (const t of tareasFiltradas) {
      const key = t.materia?.nombre ?? 'Sin materia'
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(t)
    }
    return map
  }, [tareasFiltradas])

  const getEstadoBadge = (estado: EstadoEntregaTarea) => {
    switch (estado) {
      case 'pendiente':
        return (
          <Badge className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border-0 shadow-sm">
            <Clock className="mr-1.5 h-3 w-3" />
            Pendiente
          </Badge>
        )
      case 'entregada':
        return (
          <Badge className="bg-brand-primary/10 text-brand-primary hover:bg-brand-primary/20 border-0 shadow-sm">
            <Upload className="mr-1.5 h-3 w-3" />
            Entregada
          </Badge>
        )
      case 'revisada':
        return (
          <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-0 shadow-sm">
            <CheckCircle className="mr-1.5 h-3 w-3" />
            Revisada
          </Badge>
        )
      case 'vencida':
        return (
          <Badge className="bg-red-500/10 text-red-600 hover:bg-red-500/20 border-0 shadow-sm">
            <AlertCircle className="mr-1.5 h-3 w-3" />
            Vencida
          </Badge>
        )
    }
  }

  const abrirModal = (tarea: TareaRow) => {
    setModalTarea(tarea)
    setTextoRespuesta(tarea.entrega?.texto_respuesta ?? '')
    setLinkEntrega(tarea.entrega?.link_entrega ?? '')
    setArchivoUrl(tarea.entrega?.archivo_url ?? '')
  }

  const entregar = async () => {
    if (!modalTarea) return
    setEnviando(true)
    try {
      const res = await fetch(
        `/api/dashboard/actividades/${modalTarea.actividad.id}/entregar`,
        {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            texto_respuesta: textoRespuesta || undefined,
            link_entrega: linkEntrega || undefined,
            archivo_url: archivoUrl || undefined,
          }),
        }
      )
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'No se pudo entregar')
      toast.success('Tarea entregada correctamente')
      setModalTarea(null)
      await load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al entregar')
    } finally {
      setEnviando(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-black border border-border/50 p-8 shadow-sm">
        <div className="absolute top-0 right-0 -translate-y-8 translate-x-8 opacity-10 pointer-events-none">
          <ClipboardList className="w-64 h-64 text-brand-primary" />
        </div>
        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/10 text-brand-primary text-xs font-bold uppercase tracking-wider">
            <Sparkles className="h-3 w-3" />
            <span>Centro de Actividades</span>
          </div>
          <h1 className="text-3xl font-extrabold text-foreground md:text-4xl tracking-tight">
            Tareas y Entregables
          </h1>
          <p className="text-muted-foreground text-base max-w-xl">
            Mantén el control de tus asignaciones, entrega tus trabajos y revisa tus calificaciones.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Badge variant="outline">{resumen.pendientes} pendientes</Badge>
            <Badge variant="outline">{resumen.entregadas} entregadas</Badge>
            <Badge variant="outline">{resumen.revisadas} revisadas</Badge>
            {resumen.promedioRevisadas != null && (
              <Badge className="bg-emerald-100 text-emerald-800">
                Promedio: {resumen.promedioRevisadas}
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between bg-white/40 dark:bg-black/20 p-2 rounded-2xl border border-border/40 backdrop-blur-sm">
        <div className="relative w-full sm:max-w-md group">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground group-focus-within:text-brand-primary transition-colors" />
          <Input
            placeholder="Buscar tarea o materia..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="pl-12 h-12 rounded-xl bg-white/60 dark:bg-black/40 border-transparent focus:border-brand-primary focus:ring-brand-primary/20 transition-all shadow-sm"
          />
        </div>
        <div className="flex flex-wrap gap-2 px-2 pb-2 sm:p-0">
          {[
            { id: 'todas', label: 'Todas' },
            { id: 'pendiente', label: 'Pendientes' },
            { id: 'entregada', label: 'Entregadas' },
            { id: 'revisada', label: 'Revisadas' },
          ].map((estado) => (
            <Button
              key={estado.id}
              variant={filtroEstado === estado.id ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setFiltroEstado(estado.id)}
              className={`rounded-lg h-10 px-4 font-semibold transition-all ${
                filtroEstado === estado.id
                  ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/20'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              {estado.label}
            </Button>
          ))}
        </div>
      </div>

      {[...grouped.entries()].map(([materiaNombre, items]) => (
        <div key={materiaNombre} className="space-y-4">
          <h2 className="text-lg font-bold text-foreground">{materiaNombre}</h2>
          {items.map((tarea) => {
            const diasRestantes = tarea.actividad.fecha_entrega
              ? Math.ceil(
                  (new Date(tarea.actividad.fecha_entrega).getTime() - Date.now()) /
                    (1000 * 60 * 60 * 24)
                )
              : null

            return (
              <Card
                key={tarea.actividad.id}
                className="group relative overflow-hidden bg-white/60 dark:bg-black/40 backdrop-blur-xl border-border/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-primary/10 hover:border-brand-primary/30"
              >
                <div
                  className={`absolute top-0 left-0 w-1.5 h-full ${
                    tarea.estadoEntrega === 'pendiente' || tarea.estadoEntrega === 'vencida'
                      ? 'bg-amber-400'
                      : tarea.estadoEntrega === 'entregada'
                        ? 'bg-brand-highlight'
                        : 'bg-emerald-500'
                  }`}
                />
                <CardContent className="p-0">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between p-6 gap-6 pl-8">
                    <div className="flex items-start gap-5">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-primary/10 to-brand-highlight/10 shadow-sm border border-brand-primary/10">
                        <FileText className="h-7 w-7 text-brand-primary" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-xl font-bold text-foreground">{tarea.actividad.titulo}</h3>
                        {tarea.actividad.descripcion && (
                          <p className="text-sm text-muted-foreground line-clamp-2 max-w-2xl">
                            {tarea.actividad.descripcion}
                          </p>
                        )}
                        <div className="flex flex-wrap items-center gap-3 text-sm pt-1">
                          {tarea.materia?.periodo && (
                            <Badge variant="outline">
                              {cuatrimestreLabel(tarea.materia.periodo)}
                            </Badge>
                          )}
                          {tarea.profesor && (
                            <span className="text-muted-foreground">
                              Prof. {tarea.profesor.nombre_completo}
                            </span>
                          )}
                          {tarea.actividad.fecha_entrega && (
                            <div className="flex items-center gap-1.5 text-muted-foreground font-medium bg-muted/50 px-2 py-0.5 rounded-md">
                              <Calendar className="h-4 w-4 text-brand-primary" />
                              {new Date(tarea.actividad.fecha_entrega).toLocaleDateString('es-MX', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </div>
                          )}
                          {diasRestantes != null &&
                            diasRestantes > 0 &&
                            tarea.estadoEntrega === 'pendiente' && (
                              <span className="text-xs font-bold px-2 py-1 rounded-md bg-amber-100 text-amber-700">
                                {diasRestantes} días restantes
                              </span>
                            )}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-row lg:flex-col items-center lg:items-end gap-4 lg:gap-3 w-full lg:w-auto border-t lg:border-t-0 border-border/50 pt-4 lg:pt-0">
                      {getEstadoBadge(tarea.estadoEntrega)}
                      {tarea.estadoEntrega !== 'revisada' &&
                        tarea.estadoEntrega !== 'entregada' && (
                          <Button
                            size="sm"
                            className="rounded-xl bg-foreground text-background hover:bg-brand-primary hover:text-white h-10 px-6"
                            onClick={() => abrirModal(tarea)}
                          >
                            <Upload className="mr-2 h-4 w-4" />
                            Entregar tarea
                          </Button>
                        )}
                      {tarea.estadoEntrega === 'entregada' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-xl h-10 px-6"
                          onClick={() => abrirModal(tarea)}
                        >
                          Editar entrega
                        </Button>
                      )}
                      {tarea.estadoEntrega === 'revisada' && tarea.calificacion != null && (
                        <div className="text-right bg-emerald-50 dark:bg-emerald-900/10 px-4 py-2 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
                          <p className="text-2xl font-black text-emerald-600">
                            {tarea.calificacion}
                            <span className="text-sm font-semibold text-emerald-600/60">/100</span>
                          </p>
                          {tarea.retroalimentacion && (
                            <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                              {tarea.retroalimentacion}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ))}

      {tareasFiltradas.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border/60 bg-white/40 dark:bg-black/20 p-16 text-center shadow-sm mt-8">
          <FileText className="h-10 w-10 text-brand-primary mb-4" />
          <h3 className="text-2xl font-bold text-foreground mb-2">No se encontraron tareas</h3>
          <p className="text-muted-foreground max-w-sm">
            {busqueda
              ? `No encontramos tareas que coincidan con "${busqueda}".`
              : 'No hay tareas en esta categoría.'}
          </p>
        </div>
      )}

      <Dialog open={!!modalTarea} onOpenChange={(open) => !open && setModalTarea(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Entregar: {modalTarea?.actividad.titulo}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Respuesta escrita</Label>
              <Textarea
                value={textoRespuesta}
                onChange={(e) => setTextoRespuesta(e.target.value)}
                placeholder="Escribe tu respuesta o comentarios..."
                rows={4}
              />
            </div>
            <div>
              <Label className="flex items-center gap-1">
                <LinkIcon className="h-4 w-4" /> Link de entrega
              </Label>
              <Input
                value={linkEntrega}
                onChange={(e) => setLinkEntrega(e.target.value)}
                placeholder="https://..."
              />
            </div>
            <div>
              <Label>Link de Drive / archivo (opcional)</Label>
              <Input
                value={archivoUrl}
                onChange={(e) => setArchivoUrl(e.target.value)}
                placeholder="https://drive.google.com/..."
              />
            </div>
            <Button
              className="w-full bg-brand-primary"
              onClick={entregar}
              disabled={enviando}
            >
              {enviando ? 'Enviando...' : 'Enviar entrega'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
