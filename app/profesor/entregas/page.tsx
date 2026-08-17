'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
  Calendar,
  CheckCircle,
  ClipboardList,
  Clock,
  ExternalLink,
  FileText,
  Link as LinkIcon,
  Search,
  User,
} from 'lucide-react'
import { toast } from 'sonner'
import { labelTipoPrograma } from '@/lib/programa-utils'
import type { Actividad, ActividadEntrega, Materia, Perfil, Programa } from '@/types/database'

type EntregaRow = Omit<ActividadEntrega, 'id' | 'estado'> & {
  id: string | null
  estado: 'pendiente' | 'entregada' | 'revisada'
  sinEntrega?: boolean
  alumno: Pick<Perfil, 'id' | 'nombre_completo' | 'email' | 'matricula'> | null
}

type TareaRow = {
  actividad: Actividad
  materia: (Materia & { programa?: Pick<Programa, 'id' | 'nombre' | 'tipo'> | null }) | null
  entregas: EntregaRow[]
  stats: {
    total: number
    entregadas?: number
    porRevisar: number
    revisadas: number
    sinEntregar?: number
  }
}

function entregaKey(entrega: EntregaRow) {
  return entrega.id ?? `pendiente:${entrega.alumno_id}`
}

function EntregaBadge({
  estado,
  calificacion,
  sinEntrega,
}: {
  estado: EntregaRow['estado']
  calificacion: number | null
  sinEntrega?: boolean
}) {
  if (estado === 'revisada') {
    return (
      <Badge className="bg-emerald-100 text-emerald-800 shrink-0">
        <CheckCircle className="mr-1 h-3 w-3" />
        {calificacion != null ? `${calificacion}/10` : 'Revisada'}
      </Badge>
    )
  }
  if (sinEntrega || estado === 'pendiente') {
    return (
      <Badge variant="outline" className="shrink-0 text-muted-foreground">
        Sin entregar
      </Badge>
    )
  }
  return (
    <Badge className="bg-amber-100 text-amber-800 shrink-0">
      <Clock className="mr-1 h-3 w-3" />
      Por revisar
    </Badge>
  )
}

export default function ProfesorEntregasPage() {
  const [tareas, setTareas] = useState<TareaRow[]>([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [programaFiltro, setProgramaFiltro] = useState('todos')
  const [tareaId, setTareaId] = useState<string | null>(null)
  const [entregaId, setEntregaId] = useState<string | null>(null)
  const [calificacion, setCalificacion] = useState('')
  const [retroalimentacion, setRetroalimentacion] = useState('')
  const [guardando, setGuardando] = useState(false)

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/profesor/entregas', { credentials: 'include' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Error al cargar')
      const lista: TareaRow[] = data.tareas ?? []
      setTareas(lista)
      setTareaId((prev) => {
        if (prev && lista.some((t) => t.actividad.id === prev)) return prev
        const conEntregas = lista.find((t) => t.stats.total > 0)
        return conEntregas?.actividad.id ?? lista[0]?.actividad.id ?? null
      })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al cargar entregas')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const programas = useMemo(() => {
    const map = new Map<string, { id: string; nombre: string; tipo: string; total: number }>()

    for (const tarea of tareas) {
      const materia = tarea.materia
      const programaId = materia?.programa_id
      if (!programaId) continue

      const programa = materia.programa
      const current = map.get(programaId)
      if (current) {
        current.total += 1
      } else {
        map.set(programaId, {
          id: programaId,
          nombre: programa?.nombre ?? programaId,
          tipo: programa?.tipo ? labelTipoPrograma(programa.tipo) : 'Programa',
          total: 1,
        })
      }
    }

    return [...map.values()].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))
  }, [tareas])

  const tareasFiltradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    return tareas.filter((t) => {
      if (programaFiltro !== 'todos' && t.materia?.programa_id !== programaFiltro) {
        return false
      }
      if (!q) return true
      const titulo = t.actividad.titulo.toLowerCase()
      const materia = t.materia?.nombre?.toLowerCase() ?? ''
      const programa = t.materia?.programa?.nombre?.toLowerCase() ?? ''
      return titulo.includes(q) || materia.includes(q) || programa.includes(q)
    })
  }, [tareas, busqueda, programaFiltro])

  const tareaSeleccionada = useMemo(
    () => tareasFiltradas.find((t) => t.actividad.id === tareaId) ?? null,
    [tareasFiltradas, tareaId]
  )

  useEffect(() => {
    if (!tareasFiltradas.length) {
      setTareaId(null)
      return
    }

    setTareaId((prev) => {
      if (prev && tareasFiltradas.some((t) => t.actividad.id === prev)) return prev
      const conEntregas = tareasFiltradas.find((t) => t.stats.total > 0)
      return conEntregas?.actividad.id ?? tareasFiltradas[0]?.actividad.id ?? null
    })
  }, [tareasFiltradas])

  const entregaSeleccionada = useMemo(() => {
    if (!tareaSeleccionada || !entregaId) return null
    return tareaSeleccionada.entregas.find((e) => entregaKey(e) === entregaId) ?? null
  }, [tareaSeleccionada, entregaId])

  useEffect(() => {
    if (!tareaSeleccionada) {
      setEntregaId(null)
      return
    }
    setEntregaId((prev) => {
      if (prev && tareaSeleccionada.entregas.some((e) => entregaKey(e) === prev)) return prev
      const alumnoId = prev?.startsWith('pendiente:')
        ? prev.slice('pendiente:'.length)
        : tareaSeleccionada.entregas.find((e) => e.id === prev)?.alumno_id
      if (alumnoId) {
        const misma = tareaSeleccionada.entregas.find((e) => e.alumno_id === alumnoId)
        if (misma) return entregaKey(misma)
      }
      const pendiente = tareaSeleccionada.entregas.find((e) => e.estado === 'entregada')
      return pendiente ? entregaKey(pendiente) : tareaSeleccionada.entregas[0]
        ? entregaKey(tareaSeleccionada.entregas[0])
        : null
    })
  }, [tareaSeleccionada])

  useEffect(() => {
    if (!entregaSeleccionada) {
      setCalificacion('')
      setRetroalimentacion('')
      return
    }
    setCalificacion(
      entregaSeleccionada.calificacion != null ? String(entregaSeleccionada.calificacion) : ''
    )
    setRetroalimentacion(entregaSeleccionada.retroalimentacion ?? '')
  }, [entregaSeleccionada])

  const seleccionarTarea = (id: string) => {
    setTareaId(id)
    setEntregaId(null)
  }

  const seleccionarEntrega = (e: EntregaRow) => {
    setEntregaId(entregaKey(e))
  }

  const calificar = async () => {
    if (!entregaSeleccionada) return
    const calificacionNumerica = Number(calificacion)
    if (
      calificacion.trim() === '' ||
      !Number.isFinite(calificacionNumerica) ||
      calificacionNumerica < 0 ||
      calificacionNumerica > 10
    ) {
      toast.error('La calificación debe estar entre 0 y 10')
      return
    }

    setGuardando(true)
    try {
      const res = await fetch('/api/profesor/entregas', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: entregaSeleccionada.id ?? undefined,
          actividad_id: tareaSeleccionada?.actividad.id,
          alumno_id: entregaSeleccionada.alumno_id,
          calificacion: calificacionNumerica,
          retroalimentacion,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Error al calificar')
      toast.success(
        entregaSeleccionada.sinEntrega
          ? 'Calificación guardada aunque el alumno no haya entregado'
          : 'Entrega calificada'
      )
      await load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al calificar')
    } finally {
      setGuardando(false)
    }
  }

  const totalPorRevisar = tareas.reduce((acc, t) => acc + t.stats.porRevisar, 0)

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-3xl font-black">Entregas / Tareas</h1>
        <p className="text-muted-foreground">
          Selecciona una tarea, revisa la entrega del alumno y califica desde un solo lugar. También puedes registrar la nota aunque el alumno aún no haya subido su trabajo.
        </p>
        {totalPorRevisar > 0 && (
          <Badge className="mt-3 bg-amber-100 text-amber-800">
            {totalPorRevisar} entrega{totalPorRevisar !== 1 ? 's' : ''} por revisar
          </Badge>
        )}
      </div>

      {tareas.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <ClipboardList className="mx-auto mb-4 h-12 w-12 opacity-50" />
            No hay tareas activas registradas.
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-3 sm:max-w-3xl sm:grid-cols-[minmax(240px,1fr)_minmax(260px,1fr)]">
            {programas.length > 0 && (
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-slate-800">Carrera o curso</label>
                <Select value={programaFiltro} onValueChange={setProgramaFiltro}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filtrar por carrera o curso" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todas las carreras y cursos ({tareas.length})</SelectItem>
                    {programas.map((programa) => (
                      <SelectItem key={programa.id} value={programa.id}>
                        {programa.nombre} · {programa.tipo} ({programa.total})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-800">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar tarea, materia o carrera..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6 xl:grid xl:grid-cols-[minmax(280px,340px)_minmax(240px,300px)_1fr]">
            {/* Panel: tareas */}
            <Card className="h-fit xl:sticky xl:top-24">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Tareas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 p-3 pt-0">
                {tareasFiltradas.length === 0 ? (
                  <p className="px-2 py-4 text-sm text-muted-foreground">Sin resultados.</p>
                ) : (
                  tareasFiltradas.map((t) => {
                    const activa = t.actividad.id === tareaId
                    return (
                      <button
                        key={t.actividad.id}
                        type="button"
                        onClick={() => seleccionarTarea(t.actividad.id)}
                        className={`w-full rounded-xl border p-3 text-left transition ${
                          activa
                            ? 'border-brand-primary bg-brand-primary/5 shadow-sm'
                            : 'border-border hover:border-brand-primary/40 hover:bg-muted/40'
                        }`}
                      >
                        <p className="font-bold leading-snug">{t.actividad.titulo}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{t.materia?.nombre ?? 'Sin materia'}</p>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {(t.materia?.programa?.nombre || t.materia?.programa_id) && (
                            <Badge variant="outline" className="text-[10px]">
                              {t.materia?.programa?.nombre ?? t.materia?.programa_id}
                            </Badge>
                          )}
                          <Badge variant="outline" className="text-[10px]">
                            {t.stats.total} alumno{t.stats.total !== 1 ? 's' : ''}
                          </Badge>
                          {(t.stats.sinEntregar ?? 0) > 0 && (
                            <Badge variant="outline" className="text-[10px] text-muted-foreground">
                              {t.stats.sinEntregar} sin entregar
                            </Badge>
                          )}
                          {t.stats.porRevisar > 0 && (
                            <Badge className="bg-amber-100 text-amber-800 text-[10px]">
                              {t.stats.porRevisar} por revisar
                            </Badge>
                          )}
                        </div>
                      </button>
                    )
                  })
                )}
              </CardContent>
            </Card>

            {/* Panel: alumnos */}
            <Card className="h-fit xl:sticky xl:top-24">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Alumnos</CardTitle>
                {tareaSeleccionada && (
                  <p className="text-xs text-muted-foreground">
                    {tareaSeleccionada.stats.total === 0
                      ? 'No hay alumnos inscritos en esta materia'
                      : `${tareaSeleccionada.stats.total} alumno${tareaSeleccionada.stats.total !== 1 ? 's' : ''}${
                          (tareaSeleccionada.stats.sinEntregar ?? 0) > 0
                            ? ` · ${tareaSeleccionada.stats.sinEntregar} sin entregar`
                            : ''
                        }`}
                  </p>
                )}
              </CardHeader>
              <CardContent className="space-y-2 p-3 pt-0">
                {!tareaSeleccionada ? (
                  <p className="px-2 py-4 text-sm text-muted-foreground">Selecciona una tarea.</p>
                ) : tareaSeleccionada.entregas.length === 0 ? (
                  <p className="px-2 py-4 text-sm text-muted-foreground">
                    No hay alumnos inscritos en esta materia.
                  </p>
                ) : (
                  tareaSeleccionada.entregas.map((e) => {
                    const activa = entregaKey(e) === entregaId
                    return (
                      <button
                        key={entregaKey(e)}
                        type="button"
                        onClick={() => seleccionarEntrega(e)}
                        className={`w-full rounded-xl border p-3 text-left transition ${
                          activa
                            ? 'border-brand-primary bg-brand-primary/5 shadow-sm'
                            : 'border-border hover:border-brand-primary/40 hover:bg-muted/40'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="truncate font-bold">
                              {e.alumno?.nombre_completo ?? 'Alumno'}
                            </p>
                            {e.alumno?.matricula && (
                              <p className="text-xs text-muted-foreground">{e.alumno.matricula}</p>
                            )}
                          </div>
                          <EntregaBadge
                            estado={e.estado}
                            calificacion={e.calificacion}
                            sinEntrega={e.sinEntrega}
                          />
                        </div>
                        {(e.archivo_url || e.link_entrega || e.imagenes_urls?.length) && (
                          <p className="mt-2 flex items-center gap-1 text-xs text-brand-primary">
                            <FileText className="h-3 w-3" />
                            Archivo adjunto
                          </p>
                        )}
                      </button>
                    )
                  })
                )}
              </CardContent>
            </Card>

            {/* Panel: detalle tarea + calificación */}
            <div className="space-y-4 min-w-0">
              {tareaSeleccionada ? (
                <>
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <CardTitle className="text-xl">{tareaSeleccionada.actividad.titulo}</CardTitle>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {tareaSeleccionada.materia?.nombre}
                            {tareaSeleccionada.materia?.programa?.nombre &&
                              ` · ${tareaSeleccionada.materia.programa.nombre}`}
                            {tareaSeleccionada.actividad.unidad &&
                              ` · ${tareaSeleccionada.actividad.unidad}`}
                          </p>
                        </div>
                        {tareaSeleccionada.actividad.fecha_entrega && (
                          <Badge variant="outline" className="shrink-0">
                            <Calendar className="mr-1 h-3 w-3" />
                            {new Date(tareaSeleccionada.actividad.fecha_entrega).toLocaleString('es-MX', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {tareaSeleccionada.actividad.descripcion && (
                        <div>
                          <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                            Descripción
                          </p>
                          <p className="mt-1 whitespace-pre-wrap text-sm">
                            {tareaSeleccionada.actividad.descripcion}
                          </p>
                        </div>
                      )}
                      {tareaSeleccionada.actividad.instrucciones && (
                        <div className="rounded-xl border-l-4 border-brand-primary bg-brand-primary/5 p-4">
                          <p className="text-xs font-black uppercase tracking-widest text-brand-primary">
                            Instrucciones
                          </p>
                          <p className="mt-1 whitespace-pre-wrap text-sm">
                            {tareaSeleccionada.actividad.instrucciones}
                          </p>
                        </div>
                      )}
                      {tareaSeleccionada.actividad.link_recurso && (
                        <a
                          href={tareaSeleccionada.actividad.link_recurso}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-sm font-medium text-brand-primary hover:underline"
                        >
                          <LinkIcon className="h-4 w-4" />
                          Ver recurso de la tarea
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </CardContent>
                  </Card>

                  {entregaSeleccionada ? (
                    <Card>
                      <CardHeader className="pb-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <CardTitle className="flex items-center gap-2 text-lg">
                            <User className="h-5 w-5 text-brand-primary" />
                            {entregaSeleccionada.alumno?.nombre_completo ?? 'Alumno'}
                          </CardTitle>
                          <EntregaBadge
                            estado={entregaSeleccionada.estado}
                            calificacion={entregaSeleccionada.calificacion}
                            sinEntrega={entregaSeleccionada.sinEntrega}
                          />
                        </div>
                        {entregaSeleccionada.alumno?.email && (
                          <p className="text-sm text-muted-foreground">{entregaSeleccionada.alumno.email}</p>
                        )}
                      </CardHeader>
                      <CardContent className="space-y-5">
                        {entregaSeleccionada.sinEntrega ? (
                          <div className="rounded-xl border border-dashed bg-muted/20 p-4">
                            <p className="text-sm font-semibold">Este alumno aún no ha subido la tarea.</p>
                            <p className="mt-1 text-sm text-muted-foreground">
                              Puedes registrar su calificación y retroalimentación de todas formas.
                            </p>
                          </div>
                        ) : (
                          <>
                        <div className="grid gap-3 sm:grid-cols-2">
                          {entregaSeleccionada.archivo_url && (
                            <a
                              href={entregaSeleccionada.archivo_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-between rounded-xl border p-4 transition hover:border-brand-primary hover:bg-brand-primary/5"
                            >
                              <span className="flex items-center gap-3">
                                <FileText className="h-5 w-5 text-brand-primary" />
                                <span>
                                  <span className="block font-bold">Ver archivo / Drive</span>
                                  <span className="text-xs text-muted-foreground">Abrir en nueva pestaña</span>
                                </span>
                              </span>
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          )}
                          {entregaSeleccionada.link_entrega && (
                            <a
                              href={entregaSeleccionada.link_entrega}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-between rounded-xl border p-4 transition hover:border-brand-primary hover:bg-brand-primary/5"
                            >
                              <span className="flex items-center gap-3">
                                <LinkIcon className="h-5 w-5 text-brand-primary" />
                                <span>
                                  <span className="block font-bold">Ver link de entrega</span>
                                  <span className="text-xs text-muted-foreground">Abrir en nueva pestaña</span>
                                </span>
                              </span>
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          )}
                        </div>

                        {entregaSeleccionada.texto_respuesta && (
                          <div className="rounded-xl border bg-muted/30 p-4">
                            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                              Respuesta del alumno
                            </p>
                            <p className="mt-2 whitespace-pre-wrap text-sm">
                              {entregaSeleccionada.texto_respuesta}
                            </p>
                          </div>
                        )}

                        {entregaSeleccionada.imagenes_urls?.length > 0 && (
                          <div>
                            <p className="mb-3 text-xs font-black uppercase tracking-widest text-muted-foreground">
                              Fotos de la libreta
                            </p>
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                              {entregaSeleccionada.imagenes_urls.map((url, index) => (
                                <a
                                  key={url}
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="group relative overflow-hidden rounded-xl border bg-muted"
                                >
                                  <img
                                    src={url}
                                    alt={`Foto de libreta ${index + 1}`}
                                    className="aspect-square w-full object-cover transition group-hover:scale-105"
                                  />
                                  <span className="absolute bottom-2 right-2 rounded-full bg-black/70 p-2 text-white">
                                    <ExternalLink className="h-4 w-4" />
                                  </span>
                                </a>
                              ))}
                            </div>
                          </div>
                        )}

                        {!entregaSeleccionada.archivo_url &&
                          !entregaSeleccionada.link_entrega &&
                          !entregaSeleccionada.texto_respuesta &&
                          !entregaSeleccionada.imagenes_urls?.length && (
                            <p className="text-sm text-muted-foreground">
                              El alumno no adjuntó archivo ni texto en esta entrega.
                            </p>
                          )}
                          </>
                        )}

                        <div className="space-y-4 border-t pt-5">
                          <h3 className="font-black">
                            {entregaSeleccionada.sinEntrega
                              ? 'Calificar aunque no haya entregado'
                              : 'Calificar entrega'}
                          </h3>
                          <div className="grid gap-4 sm:grid-cols-[120px_1fr]">
                            <div>
                              <Label>Calificación (0-10)</Label>
                              <Input
                                type="number"
                                min={0}
                                max={10}
                                step={0.1}
                                value={calificacion}
                                onChange={(ev) => setCalificacion(ev.target.value)}
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label>Retroalimentación</Label>
                              <Textarea
                                value={retroalimentacion}
                                onChange={(ev) => setRetroalimentacion(ev.target.value)}
                                rows={3}
                                className="mt-1"
                                placeholder="Comentarios para el alumno..."
                              />
                            </div>
                          </div>
                          <Button
                            className="w-full bg-brand-primary sm:w-auto sm:min-w-[200px]"
                            onClick={calificar}
                            disabled={guardando}
                          >
                            {guardando
                              ? 'Guardando...'
                              : entregaSeleccionada.estado === 'revisada'
                                ? 'Actualizar calificación'
                                : 'Guardar calificación'}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card>
                      <CardContent className="py-10 text-center text-muted-foreground">
                        <User className="mx-auto mb-3 h-10 w-10 opacity-40" />
                        Selecciona un alumno para ver su entrega y calificar.
                      </CardContent>
                    </Card>
                  )}
                </>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center text-muted-foreground">
                    Selecciona una tarea del listado para comenzar.
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
