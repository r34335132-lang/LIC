'use client'

import { useAuth } from '@/lib/auth-context'
import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { toast } from 'sonner'
import { ClipboardList, Clock, AlertCircle, GraduationCap } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { labelTipoPrograma } from '@/lib/programa-utils'
import { useProgramaFiltro } from '@/lib/use-programa-filtro'
import type { Materia, ProfesorMateria, Programa } from '@/types/database'

type MateriaStats = {
  actividadesActivas: number
  proximaEntrega: string | null
  proximaTareaTitulo: string | null
  entregasPorRevisar: number
}

type ProfesorMateriaRow = ProfesorMateria & {
  materia: Materia & {
    programa?: Pick<Programa, 'id' | 'nombre' | 'tipo'> | null
  }
  stats: MateriaStats
}

type GrupoPrograma = {
  id: string
  nombre: string
  tipo: string
  porRevisar: number
  materias: ProfesorMateriaRow[]
}

export default function ProfesorMateriasPage() {
  const { perfil } = useAuth()
  const [materias, setMaterias] = useState<ProfesorMateriaRow[]>([])
  const [cargado, setCargado] = useState(false)
  const [programaFiltro, setProgramaFiltro] = useProgramaFiltro()

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
      } finally {
        if (active) setCargado(true)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [perfil])

  const grupos = useMemo(() => {
    const map = new Map<string, GrupoPrograma>()
    for (const pm of materias) {
      const id = pm.materia?.programa_id || 'sin-programa'
      const programa = pm.materia?.programa
      const grupo = map.get(id) ?? {
        id,
        nombre: programa?.nombre ?? (id === 'sin-programa' ? 'Sin carrera asignada' : id),
        tipo: programa?.tipo ? labelTipoPrograma(programa.tipo) : 'Programa',
        porRevisar: 0,
        materias: [],
      }
      grupo.porRevisar += pm.stats.entregasPorRevisar
      grupo.materias.push(pm)
      map.set(id, grupo)
    }
    for (const grupo of map.values()) {
      grupo.materias.sort(
        (a, b) =>
          (a.materia?.periodo ?? 0) - (b.materia?.periodo ?? 0) ||
          (a.materia?.nombre ?? '').localeCompare(b.materia?.nombre ?? '', 'es')
      )
    }
    return [...map.values()].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))
  }, [materias])

  useEffect(() => {
    if (cargado && programaFiltro !== 'todos' && !grupos.some((g) => g.id === programaFiltro)) {
      setProgramaFiltro('todos')
    }
  }, [cargado, grupos, programaFiltro, setProgramaFiltro])

  const gruposVisibles =
    programaFiltro === 'todos' ? grupos : grupos.filter((g) => g.id === programaFiltro)

  return (
    <div>
      <h1 className="text-3xl font-black">Mis materias</h1>
      <p className="mt-2 text-muted-foreground">
        Tus materias organizadas por carrera o curso, con tareas activas y entregas por revisar.
      </p>

      {grupos.length > 1 && (
        <div className="mt-6 flex gap-2 overflow-x-auto pb-1">
          {[
            { id: 'todos', nombre: 'Todas', total: materias.length, porRevisar: 0 },
            ...grupos.map((g) => ({
              id: g.id,
              nombre: g.nombre,
              total: g.materias.length,
              porRevisar: g.porRevisar,
            })),
          ].map((opcion) => {
            const activa = programaFiltro === opcion.id
            return (
              <button
                key={opcion.id}
                type="button"
                onClick={() => setProgramaFiltro(opcion.id)}
                className={`flex shrink-0 items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition ${
                  activa
                    ? 'border-brand-primary bg-brand-primary text-white shadow-md'
                    : 'border-border bg-white hover:border-brand-primary/40'
                }`}
              >
                {opcion.nombre}
                <span className={`rounded-md px-1.5 py-0.5 text-xs ${activa ? 'bg-white/20' : 'bg-muted'}`}>
                  {opcion.total}
                </span>
                {opcion.porRevisar > 0 && (
                  <span
                    className={`rounded-md px-1.5 py-0.5 text-xs ${
                      activa ? 'bg-amber-400 text-amber-950' : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {opcion.porRevisar} por revisar
                  </span>
                )}
              </button>
            )
          })}
        </div>
      )}

      <div className="mt-8 space-y-10">
        {cargado && materias.length === 0 && (
          <p className="text-muted-foreground">No tienes materias asignadas.</p>
        )}
        {gruposVisibles.map((grupo) => (
          <section key={grupo.id} className="space-y-4">
            <div className="flex flex-wrap items-center gap-3 border-b pb-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-primary/10">
                <GraduationCap className="h-5 w-5 text-brand-primary" />
              </div>
              <h2 className="text-xl font-black">{grupo.nombre}</h2>
              <Badge variant="outline">{grupo.tipo}</Badge>
              <span className="text-sm text-muted-foreground">
                {grupo.materias.length} materia{grupo.materias.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              {grupo.materias.map((pm) => (
                <Link key={pm.id} href={`/profesor/materias/${pm.id}`}>
                  <Card className="h-full border-l-4 border-l-brand-primary transition-shadow hover:shadow-lg">
                    <CardContent className="p-5">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex-1">
                          <p className="text-xl font-black">{pm.materia?.nombre}</p>
                          <p className="text-sm text-muted-foreground">{pm.materia?.clave}</p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {pm.materia?.periodo != null && (
                              <Badge variant="outline">{pm.materia.periodo}° cuatrimestre</Badge>
                            )}
                            {pm.grupo && <Badge variant="outline">Grupo {pm.grupo}</Badge>}
                            {pm.horario && <Badge variant="secondary">{pm.horario}</Badge>}
                            {!pm.activo && <Badge variant="destructive">Inactivo</Badge>}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 sm:flex-col sm:items-end">
                          <Badge className="bg-brand-primary/10 font-bold text-brand-primary">
                            <ClipboardList className="mr-1 h-3 w-3" />
                            {pm.stats.actividadesActivas} tarea{pm.stats.actividadesActivas !== 1 ? 's' : ''} activa
                            {pm.stats.actividadesActivas !== 1 ? 's' : ''}
                          </Badge>
                          {pm.stats.entregasPorRevisar > 0 && (
                            <Badge className="bg-amber-100 font-bold text-amber-900">
                              <AlertCircle className="mr-1 h-3 w-3" />
                              {pm.stats.entregasPorRevisar} por revisar
                            </Badge>
                          )}
                        </div>
                      </div>

                      {pm.stats.proximaTareaTitulo && pm.stats.proximaEntrega && (
                        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
                          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                            Próxima entrega
                          </p>
                          <p className="mt-1 font-semibold text-slate-900">{pm.stats.proximaTareaTitulo}</p>
                          <p className="mt-1 flex items-center gap-1 text-sm text-brand-primary">
                            <Clock className="h-3 w-3" />
                            {format(new Date(pm.stats.proximaEntrega), 'EEEE d MMM · HH:mm', { locale: es })}
                          </p>
                        </div>
                      )}

                      {pm.stats.actividadesActivas === 0 && (
                        <p className="mt-3 text-sm text-muted-foreground">
                          Sin tareas activas — entra para publicar actividades o usar las sugerencias.
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
