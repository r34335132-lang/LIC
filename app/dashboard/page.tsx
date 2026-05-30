'use client'

import { useAuth } from '@/lib/auth-context'
import { getNombrePerfil } from '@/lib/perfil-utils'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { BookOpen, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'

interface MateriaResumen {
  id: string
  estado: string
}

export default function DashboardPage() {
  const { perfil } = useAuth()
  const [materias, setMaterias] = useState<MateriaResumen[]>([])

  useEffect(() => {
    if (!perfil) return
    let active = true
    async function load() {
      try {
        const res = await fetch('/api/dashboard/materias', { credentials: 'include' })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error ?? 'Error al cargar materias')
        if (active) {
          setMaterias(
            (data.materias ?? []).map((m: MateriaResumen) => ({
              id: m.id,
              estado: m.estado,
            }))
          )
        }
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Error al cargar materias')
      }
    }
    load()
    return () => {
      active = false
    }
  }, [perfil])

  const cursando = materias.filter((m) => m.estado === 'cursando').length
  const aprobadas = materias.filter((m) => m.estado === 'aprobada').length
  const pendientes = materias.filter((m) => m.estado === 'pendiente').length

  return (
    <div>
      <h1 className="text-3xl font-black text-slate-950">Bienvenido, {getNombrePerfil(perfil).split(' ')[0]}</h1>
      <div className="mt-2 flex flex-wrap gap-2">
        {perfil?.matricula && <Badge variant="outline">{perfil.matricula}</Badge>}
        {perfil?.programa_id && <Badge className="bg-brand-primary/10 text-brand-primary">{perfil.programa_id}</Badge>}
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Cursando</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-black">{cursando}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Aprobadas</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-black text-green-600">{aprobadas}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Pendientes</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-black text-yellow-600">{pendientes}</p></CardContent>
        </Card>
      </div>

      <Link href="/dashboard/materias" className="mt-8 block">
        <Card className="transition-shadow hover:shadow-md">
          <CardContent className="flex items-center justify-between p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-primary text-white">
                <BookOpen className="h-6 w-6" />
              </div>
              <div>
                <p className="font-bold">Ver mis materias</p>
                <p className="text-sm text-muted-foreground">{materias.length} materias en tu plan</p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground" />
          </CardContent>
        </Card>
      </Link>
    </div>
  )
}
