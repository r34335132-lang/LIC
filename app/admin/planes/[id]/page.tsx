'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Database } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import type { Materia, Programa } from '@/types/database'
import { labelTipoPrograma } from '@/lib/programa-utils'

export default function AdminPlanProgramaPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [programa, setPrograma] = useState<Programa | null>(null)
  const [materias, setMaterias] = useState<Materia[]>([])
  const [loading, setLoading] = useState(true)
  const [seeding, setSeeding] = useState(false)

  const load = useCallback(async () => {
    try {
      const [progRes, clasesRes] = await Promise.all([
        fetch('/api/admin/programas', { credentials: 'include' }),
        fetch('/api/admin/clases', { credentials: 'include' }),
      ])
      const progData = await progRes.json()
      const clasesData = await clasesRes.json()

      if (!progRes.ok) throw new Error(progData.error ?? 'Error al cargar programa')

      const found = ((progData.programas ?? []) as Programa[]).find((p) => p.id === id)
      if (!found) {
        toast.error('Programa no encontrado')
        router.push('/admin/planes')
        return
      }
      setPrograma(found)

      const mats = ((clasesData.materias ?? []) as Materia[]).filter(
        (m) => m.programa_id === id
      )
      setMaterias(mats.sort((a, b) => a.periodo - b.periodo || a.nombre.localeCompare(b.nombre, 'es')))
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al cargar plan')
    } finally {
      setLoading(false)
    }
  }, [id, router])

  useEffect(() => {
    if (id === 'psicologia') {
      router.replace('/admin/planes/psicologia')
      return
    }
    load()
  }, [id, load, router])

  const seedPsicologia = async () => {
    setSeeding(true)
    try {
      const res = await fetch('/api/admin/seed/psicologia', { method: 'POST', credentials: 'include' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Error al cargar materias')
      toast.success(`Insertadas: ${data.inserted}, omitidas: ${data.skipped}`)
      await load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al cargar materias')
    } finally {
      setSeeding(false)
    }
  }

  if (id === 'psicologia') {
    return null
  }

  if (loading || !programa) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-primary border-t-transparent" />
      </div>
    )
  }

  const porPeriodo = materias.reduce<Record<number, Materia[]>>((acc, m) => {
    if (!acc[m.periodo]) acc[m.periodo] = []
    acc[m.periodo].push(m)
    return acc
  }, {})

  return (
    <div>
      <Link
        href="/admin/planes"
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-brand-primary mb-6"
      >
        <ArrowLeft className="h-4 w-4" /> Volver a planes
      </Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-950">{programa.nombre}</h1>
          <p className="mt-2 text-muted-foreground">
            {labelTipoPrograma(programa.tipo)} · {programa.modalidad}
          </p>
        </div>
        {id === 'psicologia' && (
          <Button onClick={seedPsicologia} disabled={seeding} className="bg-brand-primary">
            <Database className="mr-2 h-4 w-4" />
            {seeding ? 'Cargando...' : 'Cargar materias seed'}
          </Button>
        )}
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Badge variant="outline">{programa.duracion}</Badge>
        <Badge variant="outline">{materias.length} materias</Badge>
        {programa.rvoe && <Badge variant="outline">RVOE {programa.rvoe}</Badge>}
      </div>

      {materias.length === 0 ? (
        <Card className="mt-8">
          <CardContent className="py-10 text-center text-muted-foreground">
            Este programa aún no tiene materias en Supabase. Carga el plan desde una API seed o
            regístralas manualmente en la tabla materias con programa_id &quot;{id}&quot;.
          </CardContent>
        </Card>
      ) : (
        <div className="mt-8 space-y-6">
          {Object.entries(porPeriodo)
            .sort(([a], [b]) => Number(a) - Number(b))
            .map(([periodo, items]) => (
              <Card key={periodo}>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {items[0]?.nombre_periodo ?? `${periodo}° periodo`}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b text-left text-muted-foreground">
                          <th className="pb-2 pr-4 font-medium">Clave</th>
                          <th className="pb-2 pr-4 font-medium">Materia</th>
                          <th className="pb-2 pr-4 font-medium">Créditos</th>
                          <th className="pb-2 font-medium">Seriación</th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((m) => (
                          <tr key={m.id} className="border-b border-border/50">
                            <td className="py-2 pr-4 font-mono text-xs">{m.clave}</td>
                            <td className="py-2 pr-4">{m.nombre}</td>
                            <td className="py-2 pr-4">{m.creditos}</td>
                            <td className="py-2 text-muted-foreground">{m.seriacion ?? '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      )}
    </div>
  )
}
