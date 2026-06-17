'use client'

import { useAuth } from '@/lib/auth-context'
import { getNombrePerfil } from '@/lib/perfil-utils'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { BookOpen, ArrowRight, Megaphone, AlertTriangle, Video } from 'lucide-react'
import { toast } from 'sonner'

interface MateriaResumen {
  id: string
  estado: string
}

type AvisoResumen = {
  id: string
  titulo: string
  contenido: string
  tipo: string
  created_at: string
  materia?: { nombre: string } | null
  profesor_nombre?: string
}

export default function DashboardPage() {
  const { perfil } = useAuth()
  const [materias, setMaterias] = useState<MateriaResumen[]>([])
  const [avisos, setAvisos] = useState<AvisoResumen[]>([])

  useEffect(() => {
    if (!perfil) return
    let active = true
    async function load() {
      try {
        const [materiasRes, avisosRes] = await Promise.all([
          fetch('/api/dashboard/materias', { credentials: 'include' }),
          fetch('/api/dashboard/avisos', { credentials: 'include' }),
        ])
        const data = await materiasRes.json()
        const avisosData = await avisosRes.json()
        if (!materiasRes.ok) throw new Error(data.error ?? 'Error al cargar materias')
        if (active) {
          setMaterias(
            (data.materias ?? []).map((m: MateriaResumen) => ({
              id: m.id,
              estado: m.estado,
            }))
          )
          if (avisosRes.ok) setAvisos((avisosData.avisos ?? []).slice(0, 3))
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

      {avisos.length > 0 && (
        <div className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-black text-slate-950">Avisos recientes</h2>
            <Link href="/dashboard/avisos" className="text-sm font-bold text-brand-primary hover:underline">
              Ver todos
            </Link>
          </div>
          <div className="space-y-3">
            {avisos.map((aviso) => (
              <Card
                key={aviso.id}
                className={aviso.tipo === 'urgente' ? 'border-red-200 bg-red-50/40' : aviso.tipo === 'clase' ? 'border-blue-200' : ''}
              >
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    {aviso.tipo === 'urgente' ? (
                      <AlertTriangle className="h-5 w-5 shrink-0 text-red-600" />
                    ) : aviso.tipo === 'clase' ? (
                      <Video className="h-5 w-5 shrink-0 text-blue-600" />
                    ) : (
                      <Megaphone className="h-5 w-5 shrink-0 text-brand-primary" />
                    )}
                    <div>
                      <p className="font-bold">{aviso.titulo}</p>
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{aviso.contenido}</p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {aviso.profesor_nombre && `${aviso.profesor_nombre} · `}
                        {aviso.materia?.nombre && `${aviso.materia.nombre} · `}
                        {new Date(aviso.created_at).toLocaleDateString('es-MX')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

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
