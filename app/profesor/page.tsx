'use client'

import { useAuth } from '@/lib/auth-context'
import { getNombrePerfil } from '@/lib/perfil-utils'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import type { Materia, ProfesorMateria } from '@/types/database'

type ProfesorMateriaRow = ProfesorMateria & { materia: Materia }

export default function ProfesorPage() {
  const { perfil } = useAuth()
  const [materias, setMaterias] = useState<ProfesorMateriaRow[]>([])
  const supabase = createClient()

  useEffect(() => {
    if (!perfil) return
    async function load() {
      const { data } = await supabase
        .from('profesor_materias')
        .select('*, materia:materias(*)')
        .eq('profesor_id', perfil!.id)
        .eq('activo', true)
      setMaterias((data ?? []) as ProfesorMateriaRow[])
    }
    load()
  }, [perfil, supabase])

  return (
    <div>
      <h1 className="text-3xl font-black">Hola, {getNombrePerfil(perfil).split(' ')[0]}</h1>
      <p className="mt-2 text-muted-foreground">Panel docente — {materias.length} materias activas</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {materias.map((pm) => (
          <Link key={pm.id} href={`/profesor/materias/${pm.id}`}>
            <Card className="h-full transition-shadow hover:shadow-md">
              <CardContent className="p-5">
                <p className="font-bold">{pm.materia?.nombre}</p>
                <p className="text-xs font-mono text-muted-foreground">{pm.materia?.clave}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {pm.grupo && <Badge variant="outline">Grupo {pm.grupo}</Badge>}
                  {pm.periodo_escolar && <Badge variant="secondary">{pm.periodo_escolar}</Badge>}
                </div>
                {pm.horario && <p className="mt-2 text-sm text-muted-foreground">{pm.horario}</p>}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
