'use client'

import { useAuth } from '@/lib/auth-context'
import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import type { Materia, ProfesorMateria } from '@/types/database'

type ProfesorMateriaRow = ProfesorMateria & { materia: Materia }

export default function ProfesorMateriasPage() {
  const { perfil } = useAuth()
  const [materias, setMaterias] = useState<ProfesorMateriaRow[]>([])
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    if (!perfil) return
    async function load() {
      const { data } = await supabase
        .from('profesor_materias')
        .select('*, materia:materias(*)')
        .eq('profesor_id', perfil!.id)
        .order('created_at', { ascending: false })
      setMaterias((data ?? []) as ProfesorMateriaRow[])
    }
    load()
  }, [perfil, supabase])

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
