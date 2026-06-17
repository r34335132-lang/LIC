'use client'

import { useAuth } from '@/lib/auth-context'
import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { toast } from 'sonner'
import { ClipboardList, Clock, AlertCircle } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import type { Materia, ProfesorMateria } from '@/types/database'

type MateriaStats = {
  actividadesActivas: number
  proximaEntrega: string | null
  proximaTareaTitulo: string | null
  entregasPorRevisar: number
}

type ProfesorMateriaRow = ProfesorMateria & {
  materia: Materia
  stats: MateriaStats
}

export default function ProfesorMateriasPage() {
  const { perfil } = useAuth()
  const [materias, setMaterias] = useState<ProfesorMateriaRow[]>([])

  useEffect(() => {
    if (!perfil) return
    let active = true
    async function load() {
      try {
        const res = await fetch('/api/profesor/materias', { credentials: 'include' })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error ?? 'Error al cargar materias')
        if (active) setMaterias((data.materias ?? []) as ProfesorMateriaRow[])
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Error al cargar materias')
      }
    }
    load()
    return () => {
      active = false
    }
  }, [perfil])

  return (
    <div>
      <h1 className="text-3xl font-black">Mis materias</h1>
      <p className="mt-2 text-muted-foreground">
        Resumen de tareas activas y entregas por revisar en cada materia.
      </p>

      <div className="mt-8 space-y-4">
        {materias.length === 0 && (
          <p className="text-muted-foreground">No tienes materias asignadas.</p>
        )}
        {materias.map((pm) => (
          <Link key={pm.id} href={`/profesor/materias/${pm.id}`}>
            <Card className="transition-shadow hover:shadow-lg border-l-4 border-l-brand-primary">
              <CardContent className="p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1">
                    <p className="text-xl font-black">{pm.materia?.nombre}</p>
                    <p className="text-sm text-muted-foreground">{pm.materia?.clave}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {pm.grupo && <Badge variant="outline">Grupo {pm.grupo}</Badge>}
                      {pm.horario && <Badge variant="secondary">{pm.horario}</Badge>}
                      {!pm.activo && <Badge variant="destructive">Inactivo</Badge>}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 sm:flex-col sm:items-end">
                    <Badge className="bg-brand-primary/10 text-brand-primary font-bold">
                      <ClipboardList className="mr-1 h-3 w-3" />
                      {pm.stats.actividadesActivas} tarea{pm.stats.actividadesActivas !== 1 ? 's' : ''} activa{pm.stats.actividadesActivas !== 1 ? 's' : ''}
                    </Badge>
                    {pm.stats.entregasPorRevisar > 0 && (
                      <Badge className="bg-amber-100 text-amber-900 font-bold">
                        <AlertCircle className="mr-1 h-3 w-3" />
                        {pm.stats.entregasPorRevisar} por revisar
                      </Badge>
                    )}
                  </div>
                </div>

                {pm.stats.proximaTareaTitulo && pm.stats.proximaEntrega && (
                  <div className="mt-4 rounded-xl bg-slate-50 border border-slate-200 p-3">
                    <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                      Próxima entrega
                    </p>
                    <p className="mt-1 font-semibold text-slate-900">{pm.stats.proximaTareaTitulo}</p>
                    <p className="mt-1 flex items-center gap-1 text-sm text-brand-primary">
                      <Clock className="h-3 w-3" />
                      {format(new Date(pm.stats.proximaEntrega), "EEEE d MMM · HH:mm", { locale: es })}
                    </p>
                  </div>
                )}

                {pm.stats.actividadesActivas === 0 && (
                  <p className="mt-3 text-sm text-muted-foreground">
                    Sin tareas activas — entra para publicar actividades.
                  </p>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
