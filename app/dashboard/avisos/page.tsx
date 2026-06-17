'use client'

import { useAuth } from '@/lib/auth-context'
import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Bell, Megaphone, AlertTriangle, BookOpen, Video } from 'lucide-react'
import type { Aviso, Materia, TipoAviso } from '@/types/database'

type AvisoRow = Aviso & {
  materia: Pick<Materia, 'id' | 'nombre' | 'clave'> | null
  profesor_nombre?: string
}

export default function AvisosPage() {
  const { perfil } = useAuth()
  const [avisos, setAvisos] = useState<AvisoRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!perfil || perfil.rol !== 'alumno') return
    let active = true
    async function load() {
      try {
        const res = await fetch('/api/dashboard/avisos', { credentials: 'include' })
        const data = await res.json()
        if (active && res.ok) setAvisos(data.avisos ?? [])
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [perfil])

  const getTipoBadge = (tipo: TipoAviso) => {
    switch (tipo) {
      case 'urgente':
        return (
          <Badge variant="destructive">
            <AlertTriangle className="mr-1 h-3 w-3" /> Urgente
          </Badge>
        )
      case 'clase':
        return (
          <Badge className="bg-blue-100 text-blue-800">
            <Video className="mr-1 h-3 w-3" /> Clase
          </Badge>
        )
      case 'materia':
        return (
          <Badge variant="secondary">
            <BookOpen className="mr-1 h-3 w-3" /> Materia
          </Badge>
        )
      default:
        return (
          <Badge variant="outline">
            <Megaphone className="mr-1 h-3 w-3" /> General
          </Badge>
        )
    }
  }

  const getIcono = (tipo: TipoAviso) => {
    switch (tipo) {
      case 'urgente':
        return <AlertTriangle className="h-6 w-6 text-destructive" />
      case 'clase':
        return <Video className="h-6 w-6 text-blue-600" />
      case 'materia':
        return <BookOpen className="h-6 w-6 text-primary" />
      default:
        return <Megaphone className="h-6 w-6 text-brand-primary" />
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
        <h1 className="text-2xl font-bold text-foreground md:text-3xl">Avisos</h1>
        <p className="text-muted-foreground">
          Anuncios de tus profesores sobre clases, tareas y avisos importantes.
        </p>
      </div>

      <div className="space-y-4">
        {avisos.map((aviso) => (
          <Card
            key={aviso.id}
            className={`transition-all hover:shadow-md ${aviso.tipo === 'urgente' ? 'border-destructive/50 bg-red-50/30' : aviso.tipo === 'clase' ? 'border-blue-200/60' : ''}`}
          >
            <CardContent className="flex gap-4 p-6">
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${
                  aviso.tipo === 'urgente'
                    ? 'bg-destructive/10'
                    : aviso.tipo === 'clase'
                      ? 'bg-blue-100'
                      : 'bg-brand-primary/10'
                }`}
              >
                {getIcono(aviso.tipo)}
              </div>
              <div className="flex-1">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold text-foreground">{aviso.titulo}</h3>
                  {getTipoBadge(aviso.tipo)}
                  {aviso.materia && (
                    <Badge variant="outline">{aviso.materia.nombre}</Badge>
                  )}
                </div>
                <p className="mb-2 whitespace-pre-wrap text-muted-foreground">{aviso.contenido}</p>
                <p className="text-sm text-muted-foreground">
                  {aviso.profesor_nombre && <span className="font-medium">{aviso.profesor_nombre} · </span>}
                  {new Date(aviso.created_at).toLocaleDateString('es-MX', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {avisos.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <Bell className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="text-lg font-medium text-foreground">Sin avisos</h3>
            <p className="text-muted-foreground">
              Cuando tus profesores publiquen avisos, aparecerán aquí.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
