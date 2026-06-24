'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Trash2, FileQuestion, ExternalLink, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
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
  DialogTrigger,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import type { Examen, TipoExamenPregunta } from '@/types/database'

type PreguntaDraft = {
  texto: string
  tipo: TipoExamenPregunta
  respuesta_correcta: string
  puntos: string
  opciones: string[]
}

const emptyPregunta = (): PreguntaDraft => ({
  texto: '',
  tipo: 'texto',
  respuesta_correcta: '',
  puntos: '1',
  opciones: ['', ''],
})

export function MateriaExamenesSection({
  profesorMateriaId,
  isOwner,
}: {
  profesorMateriaId: string
  isOwner: boolean
}) {
  const [examenes, setExamenes] = useState<Examen[]>([])
  const [open, setOpen] = useState(false)
  const [titulo, setTitulo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [linkLlamada, setLinkLlamada] = useState('')
  const [tiempoLimite, setTiempoLimite] = useState('60')
  const [preguntas, setPreguntas] = useState<PreguntaDraft[]>([emptyPregunta()])

  const load = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/profesor/examenes?profesor_materia_id=${profesorMateriaId}`,
        { credentials: 'include' }
      )
      const data = await res.json()
      if (res.ok) setExamenes(data.examenes ?? [])
    } catch {
      toast.error('Error al cargar exámenes')
    }
  }, [profesorMateriaId])

  useEffect(() => {
    load()
  }, [load])

  const updatePregunta = (index: number, updates: Partial<PreguntaDraft>) => {
    setPreguntas((current) =>
      current.map((p, i) => (i === index ? { ...p, ...updates } : p))
    )
  }

  const crear = async () => {
    if (!titulo.trim()) {
      toast.error('El título es requerido')
      return
    }

    const payload = preguntas.map((p) => {
      if (p.tipo === 'opcion_multiple') {
        const opciones = p.opciones.map((o) => o.trim()).filter(Boolean)
        return {
          texto: p.texto,
          tipo: p.tipo,
          opciones,
          respuesta_correcta: p.respuesta_correcta,
          puntos: parseFloat(p.puntos) || 1,
        }
      }
      return {
        texto: p.texto,
        tipo: 'texto' as const,
        opciones: null,
        respuesta_correcta: p.respuesta_correcta,
        puntos: parseFloat(p.puntos) || 1,
      }
    })

    const res = await fetch('/api/profesor/examenes', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        profesor_materia_id: profesorMateriaId,
        titulo,
        descripcion,
        link_llamada: linkLlamada || null,
        tiempo_limite_minutos: parseInt(tiempoLimite, 10),
        preguntas: payload,
      }),
    })
    const data = await res.json()
    if (!res.ok) {
      toast.error(data.error ?? 'Error al crear')
      return
    }
    toast.success('Examen creado')
    setOpen(false)
    setTitulo('')
    setDescripcion('')
    setLinkLlamada('')
    setTiempoLimite('60')
    setPreguntas([emptyPregunta()])
    await load()
  }

  return (
    <Card className="mt-6" id="examenes">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2 text-base">
            <FileQuestion className="h-5 w-5 text-brand-primary" />
            Exámenes en línea ({examenes.length})
          </CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            Preguntas abiertas u opción múltiple, con límite de tiempo y link de videollamada.
          </p>
        </div>
        {isOwner && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-brand-primary">
                <Plus className="mr-1 h-4 w-4" /> Nuevo examen
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
              <DialogHeader><DialogTitle>Nuevo examen</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>Título</Label><Input value={titulo} onChange={(e) => setTitulo(e.target.value)} /></div>
                <div><Label>Descripción</Label><Textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} /></div>
                <div><Label>Link de videollamada</Label><Input value={linkLlamada} onChange={(e) => setLinkLlamada(e.target.value)} placeholder="https://meet.google.com/..." /></div>
                <div><Label>Tiempo límite (minutos)</Label><Input type="number" min={1} value={tiempoLimite} onChange={(e) => setTiempoLimite(e.target.value)} /></div>
                <div className="space-y-3 rounded-xl border p-4">
                  <div className="flex items-center justify-between">
                    <Label>Preguntas</Label>
                    <Button type="button" size="sm" variant="outline" onClick={() => setPreguntas([...preguntas, emptyPregunta()])}>
                      <Plus className="mr-1 h-4 w-4" /> Agregar
                    </Button>
                  </div>
                  {preguntas.map((p, i) => (
                    <div key={i} className="space-y-2 rounded-lg bg-muted/40 p-3">
                      <div className="flex gap-2">
                        <Select
                          value={p.tipo}
                          onValueChange={(v) =>
                            updatePregunta(i, {
                              tipo: v as TipoExamenPregunta,
                              respuesta_correcta: '',
                              opciones: v === 'opcion_multiple' ? ['', ''] : [],
                            })
                          }
                        >
                          <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="texto">Respuesta abierta</SelectItem>
                            <SelectItem value="opcion_multiple">Opción múltiple</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input
                          type="number"
                          min={0.5}
                          step={0.5}
                          className="w-24"
                          placeholder="Pts"
                          value={p.puntos}
                          onChange={(e) => updatePregunta(i, { puntos: e.target.value })}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          className="text-red-600"
                          onClick={() => setPreguntas(preguntas.filter((_, j) => j !== i))}
                          disabled={preguntas.length <= 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <Textarea
                        placeholder="Enunciado de la pregunta"
                        value={p.texto}
                        onChange={(e) => updatePregunta(i, { texto: e.target.value })}
                      />
                      {p.tipo === 'texto' ? (
                        <>
                          <Input
                            placeholder="Respuesta correcta"
                            value={p.respuesta_correcta}
                            onChange={(e) => updatePregunta(i, { respuesta_correcta: e.target.value })}
                          />
                          <p className="text-xs text-muted-foreground">
                            Usa | para alternativas válidas (ej: México|Mexico).
                          </p>
                        </>
                      ) : (
                        <div className="space-y-2">
                          {p.opciones.map((opcion, oi) => (
                            <div key={oi} className="flex items-center gap-2">
                              <input
                                type="radio"
                                name={`correcta-${i}`}
                                checked={p.respuesta_correcta === String(oi)}
                                onChange={() => updatePregunta(i, { respuesta_correcta: String(oi) })}
                                className="h-4 w-4"
                              />
                              <Input
                                placeholder={`Opción ${oi + 1}`}
                                value={opcion}
                                onChange={(e) => {
                                  const next = [...p.opciones]
                                  next[oi] = e.target.value
                                  updatePregunta(i, { opciones: next })
                                }}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="text-red-600"
                                onClick={() => {
                                  if (p.opciones.length <= 2) return
                                  const next = p.opciones.filter((_, j) => j !== oi)
                                  let correcta = p.respuesta_correcta
                                  if (correcta === String(oi)) correcta = '0'
                                  else if (parseInt(correcta, 10) > oi) {
                                    correcta = String(parseInt(correcta, 10) - 1)
                                  }
                                  updatePregunta(i, { opciones: next, respuesta_correcta: correcta })
                                }}
                                disabled={p.opciones.length <= 2}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => updatePregunta(i, { opciones: [...p.opciones, ''] })}
                          >
                            <Plus className="mr-1 h-3 w-3" /> Opción
                          </Button>
                          <p className="text-xs text-muted-foreground">
                            Marca el círculo de la respuesta correcta.
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <Button onClick={crear} className="w-full bg-brand-primary">Crear examen</Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </CardHeader>
      <CardContent className="space-y-2">
        {examenes.length === 0 && (
          <p className="text-sm text-muted-foreground">Sin exámenes publicados.</p>
        )}
        {examenes.map((ex) => (
          <div key={ex.id} className="flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-medium">{ex.titulo}</p>
              <div className="mt-1 flex flex-wrap gap-2">
                <Badge variant="outline"><Clock className="mr-1 h-3 w-3" />{ex.tiempo_limite_minutos} min</Badge>
                {!ex.activo && <Badge variant="destructive">Inactivo</Badge>}
                {ex.link_llamada && (
                  <a href={ex.link_llamada} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-brand-primary hover:underline">
                    <ExternalLink className="h-3 w-3" /> Videollamada
                  </a>
                )}
              </div>
            </div>
            <Button size="sm" variant="outline" asChild>
              <Link href={`/profesor/examenes/${ex.id}`}>Ver resultados</Link>
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
