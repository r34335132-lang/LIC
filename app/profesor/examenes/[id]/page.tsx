'use client'

import { useCallback, useEffect, useState, use } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Clock,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Pencil,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { formatearTiempo, etiquetaRespuestaAlumno, etiquetaRespuestaCorrecta } from '@/lib/examen-utils'
import type { Examen, ExamenIntento, ExamenPregunta, ExamenRespuesta, Perfil } from '@/types/database'

type IntentoConAlumno = ExamenIntento & {
  alumno: Pick<Perfil, 'id' | 'nombre_completo' | 'matricula'>
  respuestas: (ExamenRespuesta & {
    pregunta?: Pick<ExamenPregunta, 'texto' | 'tipo' | 'opciones' | 'respuesta_correcta' | 'puntos'>
  })[]
}

export default function ProfesorExamenDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const [examen, setExamen] = useState<Examen | null>(null)
  const [preguntas, setPreguntas] = useState<ExamenPregunta[]>([])
  const [intentos, setIntentos] = useState<IntentoConAlumno[]>([])
  const [selectedIntento, setSelectedIntento] = useState<string | null>(null)
  const [editRespuesta, setEditRespuesta] = useState<{
    id: string
    puntos: string
    nota: string
  } | null>(null)

  const load = useCallback(async () => {
    const res = await fetch(`/api/profesor/examenes/${id}`, { credentials: 'include' })
    const data = await res.json()
    if (!res.ok) {
      toast.error(data.error ?? 'Error al cargar')
      return
    }
    setExamen(data.examen)
    setPreguntas(data.preguntas ?? [])
    setIntentos(data.intentos ?? [])
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  const corregirRespuesta = async () => {
    if (!editRespuesta) return
    const res = await fetch('/api/profesor/examen-respuestas', {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: editRespuesta.id,
        puntos_obtenidos: parseFloat(editRespuesta.puntos),
        nota_profesor: editRespuesta.nota,
      }),
    })
    const data = await res.json()
    if (!res.ok) {
      toast.error(data.error ?? 'Error al corregir')
      return
    }
    toast.success(`Calificación actualizada: ${data.calificacion}`)
    setEditRespuesta(null)
    await load()
  }

  const intentoActivo = intentos.find((i) => i.id === selectedIntento)

  if (!examen) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div>
      <Link href="/profesor/materias" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-brand-primary mb-6">
        <ArrowLeft className="h-4 w-4" /> Volver
      </Link>

      <h1 className="text-3xl font-black">{examen.titulo}</h1>
      {examen.descripcion && <p className="mt-2 text-muted-foreground">{examen.descripcion}</p>}
      <div className="mt-3 flex flex-wrap gap-2">
        <Badge variant="outline"><Clock className="mr-1 h-3 w-3" />{examen.tiempo_limite_minutos} min</Badge>
        <Badge variant="secondary">{preguntas.length} pregunta(s)</Badge>
        {examen.link_llamada && (
          <a href={examen.link_llamada} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-brand-primary hover:underline">
            <ExternalLink className="h-3 w-3" /> Link de videollamada
          </a>
        )}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Intentos de alumnos ({intentos.length})</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {intentos.length === 0 && (
              <p className="text-sm text-muted-foreground">Ningún alumno ha realizado el examen.</p>
            )}
            {intentos.map((intento) => (
              <button
                key={intento.id}
                type="button"
                onClick={() => setSelectedIntento(intento.id)}
                className={`w-full rounded-lg border p-3 text-left transition-colors ${selectedIntento === intento.id ? 'border-brand-primary bg-brand-primary/5' : 'hover:bg-muted/50'}`}
              >
                <p className="font-medium">{intento.alumno?.nombre_completo}</p>
                <p className="text-xs text-muted-foreground">{intento.alumno?.matricula}</p>
                <div className="mt-2 flex flex-wrap gap-2 text-xs">
                  <Badge>{intento.estado}</Badge>
                  {intento.calificacion != null && <Badge variant="secondary">Calif: {intento.calificacion}</Badge>}
                  {intento.tiempo_usado_segundos != null && (
                    <span className="text-muted-foreground">{formatearTiempo(intento.tiempo_usado_segundos)}</span>
                  )}
                </div>
              </button>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Desglose del intento</CardTitle></CardHeader>
          <CardContent>
            {!intentoActivo && (
              <p className="text-sm text-muted-foreground">Selecciona un alumno para ver el desglose.</p>
            )}
            {intentoActivo && (
              <div className="space-y-4">
                <div className="rounded-lg bg-slate-50 p-4 text-sm">
                  <p><strong>Tiempo:</strong> {formatearTiempo(intentoActivo.tiempo_usado_segundos)}</p>
                  <p><strong>Puntos:</strong> {intentoActivo.puntos_obtenidos ?? 0} / {intentoActivo.puntos_totales ?? 0}</p>
                  <p><strong>Calificación:</strong> {intentoActivo.calificacion ?? '—'}</p>
                </div>
                {intentoActivo.respuestas.map((resp) => (
                  <div key={resp.id} className="rounded-lg border p-3">
                    <p className="text-sm font-medium">{resp.pregunta?.texto}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Respuesta del alumno:{' '}
                      <span className="font-medium text-foreground">
                        {resp.pregunta
                          ? etiquetaRespuestaAlumno(resp.pregunta, resp.respuesta_alumno)
                          : resp.respuesta_alumno || '—'}
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Esperada:{' '}
                      {resp.pregunta ? etiquetaRespuestaCorrecta(resp.pregunta) : '—'}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      {resp.es_correcta ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                      <span className="text-sm font-medium">
                        {resp.puntos_obtenidos ?? 0} / {resp.puntos_maximos} pts
                      </span>
                      {resp.corregido_manual && <Badge variant="outline">Corregido manual</Badge>}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          setEditRespuesta({
                            id: resp.id,
                            puntos: String(resp.puntos_obtenidos ?? 0),
                            nota: resp.nota_profesor ?? '',
                          })
                        }
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                    </div>
                    {resp.nota_profesor && (
                      <p className="mt-1 text-xs italic text-muted-foreground">{resp.nota_profesor}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {editRespuesta && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h3 className="font-bold">Corregir respuesta</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Ajusta los puntos si la respuesta era correcta pero no coincidió exactamente.
            </p>
            <div className="mt-4 space-y-3">
              <div>
                <Label>Puntos obtenidos</Label>
                <Input
                  type="number"
                  min={0}
                  step={0.5}
                  value={editRespuesta.puntos}
                  onChange={(e) => setEditRespuesta({ ...editRespuesta, puntos: e.target.value })}
                />
              </div>
              <div>
                <Label>Nota para el alumno (opcional)</Label>
                <Textarea
                  value={editRespuesta.nota}
                  onChange={(e) => setEditRespuesta({ ...editRespuesta, nota: e.target.value })}
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setEditRespuesta(null)}>Cancelar</Button>
                <Button className="flex-1 bg-brand-primary" onClick={corregirRespuesta}>Guardar</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
