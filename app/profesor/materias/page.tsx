'use client'

import { useAuth } from '@/lib/auth-context'
import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { toast } from 'sonner'
import type { Materia, ProfesorMateria } from '@/types/database'

type ProfesorMateriaRow = ProfesorMateria & { materia: Materia }

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
      <p className="mt-2 text-muted-foreground">Todas tus asignaciones docentes.</p>

      <div className="mt-8 space-y-3">
        {materias.map((pm) => (
          <Link key={pm.id} href={`/profesor/materias/${pm.id}`}>
            <Card className="transition-shadow hover:shadow-md">
              <CardContent className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-bold">{pm.materia?.nombre}</p>
                  <p className="text-sm text-muted-foreground">{pm.materia?.clave}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {pm.grupo && <Badge variant="outline">{pm.grupo}</Badge>}
                  {pm.horario && <Badge variant="secondary">{pm.horario}</Badge>}
                  {!pm.activo && <Badge variant="destructive">Inactivo</Badge>}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
