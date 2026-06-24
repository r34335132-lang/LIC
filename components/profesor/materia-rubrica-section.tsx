'use client'

import { useCallback, useEffect, useState } from 'react'
import { Plus, Trash2, Scale } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { toast } from 'sonner'
import type { MateriaRubricaCriterio, TipoRubricaCriterio } from '@/types/database'

type CriterioDraft = {
  nombre: string
  descripcion: string
  peso: string
  tipo: TipoRubricaCriterio
}

const emptyCriterio: CriterioDraft = {
  nombre: '',
  descripcion: '',
  peso: '',
  tipo: 'otro',
}

export function MateriaRubricaSection({
  profesorMateriaId,
  isOwner,
}: {
  profesorMateriaId: string
  isOwner: boolean
}) {
  const [titulo, setTitulo] = useState('Rúbrica de calificación')
  const [descripcion, setDescripcion] = useState('')
  const [criterios, setCriterios] = useState<CriterioDraft[]>([{ ...emptyCriterio, tipo: 'tareas', nombre: 'Tareas', peso: '50' }, { ...emptyCriterio, tipo: 'examenes', nombre: 'Exámenes', peso: '50' }])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/profesor/rubricas?profesor_materia_id=${profesorMateriaId}`,
        { credentials: 'include' }
      )
      const data = await res.json()
      if (res.ok && data.rubrica) {
        setTitulo(data.rubrica.titulo)
        setDescripcion(data.rubrica.descripcion ?? '')
        if (data.criterios?.length) {
          setCriterios(
            (data.criterios as MateriaRubricaCriterio[]).map((c) => ({
              nombre: c.nombre,
              descripcion: c.descripcion ?? '',
              peso: String(c.peso),
              tipo: c.tipo,
            }))
          )
        }
      }
    } catch {
      toast.error('Error al cargar rúbrica')
    } finally {
      setLoading(false)
    }
  }, [profesorMateriaId])

  useEffect(() => {
    load()
  }, [load])

  const pesoTotal = criterios.reduce((s, c) => s + (parseFloat(c.peso) || 0), 0)

  const guardar = async () => {
    const res = await fetch('/api/profesor/rubricas', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        profesor_materia_id: profesorMateriaId,
        titulo,
        descripcion,
        criterios: criterios.map((c) => ({
          nombre: c.nombre,
          descripcion: c.descripcion || null,
          peso: parseFloat(c.peso),
          tipo: c.tipo,
        })),
      }),
    })
    const data = await res.json()
    if (!res.ok) {
      toast.error(data.error ?? 'Error al guardar')
      return
    }
    toast.success('Rúbrica guardada')
    await load()
  }

  if (loading) return null

  return (
    <Card className="mt-6" id="rubrica">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Scale className="h-5 w-5 text-brand-primary" />
          Rúbrica de calificación
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Define cómo se ponderan tareas y exámenes. La plataforma usará esto solo para
          sugerir una calificación — tú registras la nota final manualmente.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {isOwner && (
          <>
            <div>
              <Label>Título</Label>
              <Input value={titulo} onChange={(e) => setTitulo(e.target.value)} />
            </div>
            <div>
              <Label>Descripción</Label>
              <Textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} rows={2} />
            </div>
            <div className="space-y-3">
              {criterios.map((c, i) => (
                <div key={i} className="grid gap-2 rounded-lg border p-3 sm:grid-cols-4">
                  <Input
                    placeholder="Nombre del criterio"
                    value={c.nombre}
                    onChange={(e) => {
                      const next = [...criterios]
                      next[i] = { ...c, nombre: e.target.value }
                      setCriterios(next)
                    }}
                  />
                  <Select
                    value={c.tipo}
                    onValueChange={(v) => {
                      const next = [...criterios]
                      next[i] = { ...c, tipo: v as TipoRubricaCriterio }
                      setCriterios(next)
                    }}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tareas">Tareas</SelectItem>
                      <SelectItem value="examenes">Exámenes</SelectItem>
                      <SelectItem value="otro">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    min={1}
                    max={100}
                    placeholder="Peso %"
                    value={c.peso}
                    onChange={(e) => {
                      const next = [...criterios]
                      next[i] = { ...c, peso: e.target.value }
                      setCriterios(next)
                    }}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    className="text-red-600"
                    onClick={() => setCriterios(criterios.filter((_, j) => j !== i))}
                    disabled={criterios.length <= 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setCriterios([...criterios, { ...emptyCriterio }])}
              >
                <Plus className="mr-1 h-4 w-4" /> Agregar criterio
              </Button>
            </div>
            <p className={`text-sm font-medium ${Math.abs(pesoTotal - 100) < 0.01 ? 'text-green-700' : 'text-amber-700'}`}>
              Peso total: {pesoTotal}% {Math.abs(pesoTotal - 100) >= 0.01 && '(debe ser 100%)'}
            </p>
            <Button onClick={guardar} className="bg-brand-primary">Guardar rúbrica</Button>
          </>
        )}
        {!isOwner && criterios.length > 0 && (
          <ul className="space-y-2">
            {criterios.map((c, i) => (
              <li key={i} className="flex justify-between text-sm">
                <span>{c.nombre} ({c.tipo})</span>
                <span className="font-medium">{c.peso}%</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
