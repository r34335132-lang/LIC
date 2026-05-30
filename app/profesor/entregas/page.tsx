'use client'

import { useCallback, useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { ClipboardList, CheckCircle, Clock } from 'lucide-react'
import { toast } from 'sonner'
import type { Actividad, ActividadEntrega, Materia, Perfil } from '@/types/database'

type EntregaRow = ActividadEntrega & {
  actividad: Actividad | null
  materia: Materia | null
  alumno: Pick<Perfil, 'id' | 'nombre_completo' | 'email' | 'matricula'> | null
}

export default function ProfesorEntregasPage() {
  const [entregas, setEntregas] = useState<EntregaRow[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<EntregaRow | null>(null)
  const [calificacion, setCalificacion] = useState('')
  const [retroalimentacion, setRetroalimentacion] = useState('')
  const [guardando, setGuardando] = useState(false)

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/profesor/entregas', { credentials: 'include' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Error al cargar')
      setEntregas(data.entregas ?? [])
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al cargar entregas')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const abrirCalificar = (e: EntregaRow) => {
    setSelected(e)
    setCalificacion(e.calificacion != null ? String(e.calificacion) : '')
    setRetroalimentacion(e.retroalimentacion ?? '')
  }

  const calificar = async () => {
    if (!selected) return
    setGuardando(true)
    try {
      const res = await fetch('/api/profesor/entregas', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selected.id,
          calificacion: Number(calificacion),
          retroalimentacion,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Error al calificar')
      toast.success('Entrega calificada')
      setSelected(null)
      await load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al calificar')
    } finally {
      setGuardando(false)
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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black">Entregas / Tareas</h1>
        <p className="text-muted-foreground">Revisa y califica las entregas de tus alumnos.</p>
      </div>

      {entregas.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <ClipboardList className="mx-auto h-12 w-12 mb-4 opacity-50" />
            No hay entregas registradas aún.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {entregas.map((e) => (
            <Card key={e.id}>
              <CardHeader className="pb-2">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-lg">{e.actividad?.titulo ?? 'Actividad'}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {e.materia?.nombre} · {e.alumno?.nombre_completo ?? 'Alumno'}
                    </p>
                  </div>
                  {e.estado === 'revisada' ? (
                    <Badge className="bg-emerald-100 text-emerald-800">
                      <CheckCircle className="mr-1 h-3 w-3" /> Revisada · {e.calificacion}
                    </Badge>
                  ) : (
                    <Badge className="bg-amber-100 text-amber-800">
                      <Clock className="mr-1 h-3 w-3" /> Por revisar
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {e.texto_respuesta && (
                  <p className="text-sm whitespace-pre-wrap">{e.texto_respuesta}</p>
                )}
                {e.link_entrega && (
                  <a
                    href={e.link_entrega}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-brand-primary underline"
                  >
                    Ver entrega
                  </a>
                )}
                {e.archivo_url && (
                  <a
                    href={e.archivo_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-brand-primary underline block"
                  >
                    Ver archivo / Drive
                  </a>
                )}
                <Button size="sm" variant="outline" onClick={() => abrirCalificar(e)}>
                  {e.estado === 'revisada' ? 'Editar calificación' : 'Calificar'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Calificar entrega</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Calificación (0-100)</Label>
              <Input
                type="number"
                min={0}
                max={100}
                value={calificacion}
                onChange={(ev) => setCalificacion(ev.target.value)}
              />
            </div>
            <div>
              <Label>Retroalimentación</Label>
              <Textarea
                value={retroalimentacion}
                onChange={(ev) => setRetroalimentacion(ev.target.value)}
                rows={4}
              />
            </div>
            <Button className="w-full bg-brand-primary" onClick={calificar} disabled={guardando}>
              {guardando ? 'Guardando...' : 'Guardar calificación'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
