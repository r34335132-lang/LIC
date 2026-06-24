'use client'

import { useCallback, useEffect, useRef, useState, use } from 'react'
import Link from 'next/link'
import { ArrowLeft, Clock, ExternalLink, CheckCircle2, XCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { formatearTiempo, etiquetaRespuestaAlumno, etiquetaRespuestaCorrecta } from '@/lib/examen-utils'
import type { ExamenPregunta, ExamenIntento, Materia, TipoExamenPregunta } from '@/types/database'

type PreguntaAlumno = Pick<
  ExamenPregunta,
  'id' | 'texto' | 'tipo' | 'opciones' | 'puntos' | 'orden'
>

type Resultado = {
  intento: ExamenIntento
  tiempo_formateado: string
  respuestas: {
    id: string
    respuesta_alumno: string | null
    es_correcta: boolean | null
    puntos_obtenidos: number | null
    puntos_maximos: number
    nota_profesor: string | null
    pregunta?: {
      texto: string
      tipo?: TipoExamenPregunta
      opciones?: string[] | null
      respuesta_correcta: string
    }
  }[]
}

export default function DashboardExamenTomarPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const [titulo, setTitulo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [linkLlamada, setLinkLlamada] = useState<string | null>(null)
  const [tiempoLimite, setTiempoLimite] = useState(60)
  const [materia, setMateria] = useState<Pick<Materia, 'nombre'> | null>(null)
  const [preguntas, setPreguntas] = useState<PreguntaAlumno[]>([])
  const [intento, setIntento] = useState<ExamenIntento | null>(null)
  const [resultado, setResultado] = useState<Resultado | null>(null)
  const [respuestas, setRespuestas] = useState<Record<string, string>>({})
  const [segundosRestantes, setSegundosRestantes] = useState<number | null>(null)
  const [entregando, setEntregando] = useState(false)
  const entregadoRef = useRef(false)

  const load = useCallback(async () => {
    const res = await fetch(`/api/dashboard/examenes/${id}`, { credentials: 'include' })
    const data = await res.json()
    if (!res.ok) {
      toast.error(data.error ?? 'Error al cargar')
      return
    }
    setTitulo(data.examen.titulo)
    setDescripcion(data.examen.descripcion ?? '')
    setLinkLlamada(data.examen.link_llamada)
    setTiempoLimite(data.examen.tiempo_limite_minutos)
    setMateria(data.examen.materia)
    setPreguntas(data.preguntas ?? [])
    setIntento(data.intento)
    if (data.resultado) setResultado(data.resultado)
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  const entregar = useCallback(async () => {
    if (entregadoRef.current || entregando) return
    entregadoRef.current = true
    setEntregando(true)

    const res = await fetch(`/api/dashboard/examenes/${id}`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        accion: 'entregar',
        respuestas: preguntas.map((p) => ({
          pregunta_id: p.id,
          respuesta: respuestas[p.id] ?? '',
        })),
      }),
    })
    const data = await res.json()
    setEntregando(false)
    if (!res.ok) {
      entregadoRef.current = false
      toast.error(data.error ?? 'Error al entregar')
      return
    }
    toast.success('Examen entregado')
    await load()
  }, [id, preguntas, respuestas, entregando, load])

  const iniciar = async () => {
    const res = await fetch(`/api/dashboard/examenes/${id}`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accion: 'iniciar' }),
    })
    const data = await res.json()
    if (!res.ok) {
      toast.error(data.error ?? 'No se pudo iniciar')
      return
    }
    setIntento(data.intento)
    const limiteSeg = tiempoLimite * 60
    setSegundosRestantes(limiteSeg)
    toast.success('Examen iniciado — ¡buena suerte!')
  }

  useEffect(() => {
    if (!intento || intento.estado !== 'en_progreso' || segundosRestantes === null) return

    const interval = setInterval(() => {
      setSegundosRestantes((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval)
          if (!entregadoRef.current) entregar()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [intento, segundosRestantes, entregar])

  useEffect(() => {
    if (intento?.estado === 'en_progreso' && segundosRestantes === null) {
      const iniciado = new Date(intento.iniciado_at).getTime()
      const limiteMs = tiempoLimite * 60 * 1000
      const restante = Math.max(0, Math.floor((limiteMs - (Date.now() - iniciado)) / 1000))
      setSegundosRestantes(restante)
    }
  }, [intento, tiempoLimite, segundosRestantes])

  const enProgreso = intento?.estado === 'en_progreso'
  const completado = intento?.estado === 'finalizado' || intento?.estado === 'revisado'

  return (
    <div>
      <Link href="/dashboard/examenes" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-brand-primary mb-6">
        <ArrowLeft className="h-4 w-4" /> Volver
      </Link>

      <h1 className="text-3xl font-black">{titulo}</h1>
      {materia && <p className="text-muted-foreground">{materia.nombre}</p>}
      {descripcion && <p className="mt-2 text-sm">{descripcion}</p>}

      <div className="mt-3 flex flex-wrap gap-2">
        <Badge variant="outline"><Clock className="mr-1 h-3 w-3" />{tiempoLimite} min</Badge>
        {linkLlamada && (
          <a href={linkLlamada} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-brand-primary hover:underline">
            <ExternalLink className="h-3 w-3" /> Unirse a videollamada
          </a>
        )}
        {enProgreso && segundosRestantes !== null && (
          <Badge className={segundosRestantes < 60 ? 'bg-red-100 text-red-900' : 'bg-amber-100 text-amber-900'}>
            Tiempo: {formatearTiempo(segundosRestantes)}
          </Badge>
        )}
      </div>

      {!intento && !completado && (
        <Card className="mt-8">
          <CardContent className="py-8 text-center">
            <p className="mb-4 text-muted-foreground">
              Tendrás {tiempoLimite} minutos para responder {preguntas.length} pregunta(s).
              Solo puedes realizar el examen una vez.
            </p>
            <Button onClick={iniciar} className="bg-brand-primary">Iniciar examen</Button>
          </CardContent>
        </Card>
      )}

      {enProgreso && (
        <div className="mt-8 space-y-4">
          {preguntas.map((p, i) => (
            <Card key={p.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">
                  {i + 1}. {p.texto}
                  <Badge variant="outline" className="ml-2">{p.puntos} pt(s)</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {p.tipo === 'opcion_multiple' && p.opciones?.length ? (
                  <RadioGroup
                    value={respuestas[p.id] ?? ''}
                    onValueChange={(v) => setRespuestas({ ...respuestas, [p.id]: v })}
                  >
                    {p.opciones.map((opcion, oi) => (
                      <div key={oi} className="flex items-center gap-2">
                        <RadioGroupItem value={String(oi)} id={`${p.id}-${oi}`} />
                        <Label htmlFor={`${p.id}-${oi}`} className="font-normal cursor-pointer">
                          {opcion}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                ) : (
                  <>
                    <Label className="sr-only">Tu respuesta</Label>
                    <Input
                      value={respuestas[p.id] ?? ''}
                      onChange={(e) => setRespuestas({ ...respuestas, [p.id]: e.target.value })}
                      placeholder="Escribe tu respuesta"
                    />
                  </>
                )}
              </CardContent>
            </Card>
          ))}
          <Button
            onClick={entregar}
            disabled={entregando}
            className="w-full bg-brand-primary"
          >
            {entregando ? 'Entregando...' : 'Entregar examen'}
          </Button>
        </div>
      )}

      {completado && resultado && (
        <Card className="mt-8 border-green-200 bg-green-50/50">
          <CardHeader>
            <CardTitle>Resultado del examen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg bg-white p-4 text-center">
                <p className="text-2xl font-black text-brand-primary">{resultado.intento.calificacion ?? '—'}</p>
                <p className="text-xs text-muted-foreground">Calificación (0-10)</p>
              </div>
              <div className="rounded-lg bg-white p-4 text-center">
                <p className="text-2xl font-black">{resultado.tiempo_formateado}</p>
                <p className="text-xs text-muted-foreground">Tiempo utilizado</p>
              </div>
              <div className="rounded-lg bg-white p-4 text-center">
                <p className="text-2xl font-black">
                  {resultado.intento.puntos_obtenidos ?? 0}/{resultado.intento.puntos_totales ?? 0}
                </p>
                <p className="text-xs text-muted-foreground">Puntos</p>
              </div>
            </div>

            <div className="space-y-3">
              {resultado.respuestas.map((r) => (
                <div key={r.id} className="rounded-lg border bg-white p-3">
                  <p className="text-sm font-medium">{r.pregunta?.texto}</p>
                  <p className="mt-1 text-sm">
                    Tu respuesta:{' '}
                    {r.pregunta
                      ? etiquetaRespuestaAlumno(r.pregunta, r.respuesta_alumno)
                      : r.respuesta_alumno || '—'}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    {r.es_correcta ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                    <span className="text-sm">{r.puntos_obtenidos ?? 0} / {r.puntos_maximos} pts</span>
                  </div>
                  {r.nota_profesor && (
                    <p className="mt-1 text-xs italic text-muted-foreground">Nota del profesor: {r.nota_profesor}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
