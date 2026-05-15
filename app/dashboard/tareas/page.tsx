'use client'

import { useAuth } from '@/lib/auth-context'
import { tareas, cursos, entregas } from '@/lib/data'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FileText, Search, Calendar, Upload, CheckCircle, Clock, AlertCircle, Plus } from 'lucide-react'
import { useState } from 'react'

export default function TareasPage() {
  const { user } = useAuth()
  const [busqueda, setBusqueda] = useState('')
  const [filtroEstado, setFiltroEstado] = useState<string>('todas')

  const tareasFiltradas = tareas.filter(t => {
    const coincideBusqueda = t.titulo.toLowerCase().includes(busqueda.toLowerCase())
    const coincideEstado = filtroEstado === 'todas' || t.estado === filtroEstado
    return coincideBusqueda && coincideEstado
  })

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'pendiente':
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400"><Clock className="mr-1 h-3 w-3" />Pendiente</Badge>
      case 'entregada':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400"><Upload className="mr-1 h-3 w-3" />Entregada</Badge>
      case 'calificada':
        return <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-950/50 dark:text-green-400"><CheckCircle className="mr-1 h-3 w-3" />Calificada</Badge>
      case 'vencida':
        return <Badge variant="destructive"><AlertCircle className="mr-1 h-3 w-3" />Vencida</Badge>
      default:
        return <Badge variant="secondary">{estado}</Badge>
    }
  }

  const getDiasRestantes = (fechaLimite: string) => {
    const fecha = new Date(fechaLimite)
    const hoy = new Date()
    const diferencia = Math.ceil((fecha.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24))
    return diferencia
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">Tareas</h1>
          <p className="text-muted-foreground">
            {user?.rol === 'alumno' 
              ? 'Gestiona y entrega tus tareas'
              : 'Administra las tareas de tus cursos'}
          </p>
        </div>
        {(user?.rol === 'maestro' || user?.rol === 'admin') && (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nueva tarea
          </Button>
        )}
      </div>

      {/* Filtros */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar tareas..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          {['todas', 'pendiente', 'entregada', 'calificada', 'vencida'].map((estado) => (
            <Button
              key={estado}
              variant={filtroEstado === estado ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFiltroEstado(estado)}
              className="capitalize"
            >
              {estado}
            </Button>
          ))}
        </div>
      </div>

      {/* Lista de tareas */}
      <div className="space-y-4">
        {tareasFiltradas.map((tarea) => {
          const curso = cursos.find(c => c.id === tarea.cursoId)
          const diasRestantes = getDiasRestantes(tarea.fechaLimite)
          const entrega = entregas.find(e => e.tareaId === tarea.id)

          return (
            <Card key={tarea.id} className="transition-all hover:shadow-md">
              <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-semibold text-foreground">{tarea.titulo}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-1">{tarea.descripcion}</p>
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      <Badge variant="secondary">{curso?.nombre}</Badge>
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {new Date(tarea.fechaLimite).toLocaleDateString('es-MX')}
                      </span>
                      {diasRestantes > 0 && tarea.estado === 'pendiente' && (
                        <span className={`text-xs ${diasRestantes <= 2 ? 'text-destructive' : 'text-muted-foreground'}`}>
                          ({diasRestantes} {diasRestantes === 1 ? 'día' : 'días'} restante{diasRestantes !== 1 && 's'})
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {getEstadoBadge(tarea.estado)}
                  
                  {user?.rol === 'alumno' && tarea.estado === 'pendiente' && (
                    <Button size="sm">
                      <Upload className="mr-2 h-4 w-4" />
                      Entregar
                    </Button>
                  )}
                  
                  {user?.rol === 'alumno' && tarea.estado === 'calificada' && entrega && (
                    <div className="text-right">
                      <p className="text-lg font-bold text-primary">{entrega.calificacion}/{tarea.puntosTotales}</p>
                      <p className="text-xs text-muted-foreground">Calificación</p>
                    </div>
                  )}

                  {(user?.rol === 'maestro' || user?.rol === 'admin') && (
                    <Button variant="outline" size="sm">
                      Ver entregas
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {tareasFiltradas.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border p-12 text-center">
          <FileText className="mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="text-lg font-medium text-foreground">No se encontraron tareas</h3>
          <p className="text-muted-foreground">
            {busqueda ? 'Intenta con otra búsqueda' : 'No hay tareas disponibles'}
          </p>
        </div>
      )}
    </div>
  )
}
