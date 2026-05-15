'use client'

import { useAuth } from '@/lib/auth-context'
import { avisos, cursos } from '@/lib/data'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Bell, Megaphone, AlertTriangle, BookOpen, Plus } from 'lucide-react'

export default function AvisosPage() {
  const { user } = useAuth()

  const getTipoBadge = (tipo: string) => {
    switch (tipo) {
      case 'urgente':
        return <Badge variant="destructive"><AlertTriangle className="mr-1 h-3 w-3" />Urgente</Badge>
      case 'curso':
        return <Badge variant="secondary"><BookOpen className="mr-1 h-3 w-3" />Curso</Badge>
      default:
        return <Badge variant="outline"><Megaphone className="mr-1 h-3 w-3" />General</Badge>
    }
  }

  const getIcono = (tipo: string) => {
    switch (tipo) {
      case 'urgente':
        return <AlertTriangle className="h-6 w-6 text-destructive" />
      case 'curso':
        return <BookOpen className="h-6 w-6 text-primary" />
      default:
        return <Megaphone className="h-6 w-6 text-accent" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">Avisos</h1>
          <p className="text-muted-foreground">
            {user?.rol === 'alumno'
              ? 'Mantente informado con los últimos avisos'
              : 'Gestiona los avisos para alumnos'}
          </p>
        </div>
        {(user?.rol === 'maestro' || user?.rol === 'admin') && (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo aviso
          </Button>
        )}
      </div>

      {/* Lista de avisos */}
      <div className="space-y-4">
        {avisos.map((aviso) => {
          const curso = aviso.cursoId ? cursos.find(c => c.id === aviso.cursoId) : null

          return (
            <Card key={aviso.id} className={`transition-all hover:shadow-md ${aviso.tipo === 'urgente' ? 'border-destructive/50' : ''}`}>
              <CardContent className="flex gap-4 p-6">
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${
                  aviso.tipo === 'urgente' ? 'bg-destructive/10' : aviso.tipo === 'curso' ? 'bg-primary/10' : 'bg-accent/10'
                }`}>
                  {getIcono(aviso.tipo)}
                </div>
                <div className="flex-1">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-foreground">{aviso.titulo}</h3>
                    {getTipoBadge(aviso.tipo)}
                    {curso && (
                      <Badge variant="outline">{curso.nombre}</Badge>
                    )}
                  </div>
                  <p className="mb-3 text-muted-foreground">{aviso.contenido}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(aviso.fecha).toLocaleDateString('es-MX', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {avisos.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <Bell className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="text-lg font-medium text-foreground">Sin avisos</h3>
            <p className="text-muted-foreground">
              No hay avisos publicados
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
