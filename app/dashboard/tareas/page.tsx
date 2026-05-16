'use client'

import { useAuth } from '@/lib/auth-context'
import { tareas, cursos, entregas } from '@/lib/data'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  FileText, 
  Search, 
  Calendar, 
  Upload, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Plus, 
  Sparkles, 
  ChevronRight,
  ClipboardList
} from 'lucide-react'
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

  // Estilos de Badges Premium
  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'pendiente':
        return <Badge className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border-0 shadow-sm"><Clock className="mr-1.5 h-3 w-3" />Pendiente</Badge>
      case 'entregada':
        return <Badge className="bg-brand-primary/10 text-brand-primary hover:bg-brand-primary/20 border-0 shadow-sm"><Upload className="mr-1.5 h-3 w-3" />Entregada</Badge>
      case 'calificada':
        return <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-0 shadow-sm"><CheckCircle className="mr-1.5 h-3 w-3" />Calificada</Badge>
      case 'vencida':
        return <Badge className="bg-red-500/10 text-red-600 hover:bg-red-500/20 border-0 shadow-sm"><AlertCircle className="mr-1.5 h-3 w-3" />Vencida</Badge>
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
    <div className="space-y-8 animate-fade-in pb-10">
      
      {/* Header Premium (Glassmorphism y Gradientes) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-black border border-border/50 p-8 shadow-sm">
        <div className="absolute top-0 right-0 -translate-y-8 translate-x-8 opacity-10 pointer-events-none">
          <ClipboardList className="w-64 h-64 text-brand-primary" />
        </div>
        
        <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/10 text-brand-primary text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="h-3 w-3" />
              <span>Centro de Actividades</span>
            </div>
            <h1 className="text-3xl font-extrabold text-foreground md:text-4xl tracking-tight">
              Tareas y Entregables
            </h1>
            <p className="text-muted-foreground text-base max-w-xl">
              {user?.rol === 'alumno' 
                ? 'Mantén el control de tus asignaciones, sube tus trabajos y revisa tus calificaciones.'
                : 'Administra, revisa y califica las tareas asignadas a tus grupos.'}
            </p>
          </div>
          
          {(user?.rol === 'maestro' || user?.rol === 'admin') && (
            <Button className="shrink-0 rounded-full bg-brand-primary hover:bg-brand-primary/90 text-white shadow-lg shadow-brand-primary/20 h-12 px-6 transition-all hover:scale-105">
              <Plus className="mr-2 h-5 w-5" />
              Crear Nueva Tarea
            </Button>
          )}
        </div>
      </div>

      {/* Filtros y Búsqueda */}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between bg-white/40 dark:bg-black/20 p-2 rounded-2xl border border-border/40 backdrop-blur-sm">
        
        {/* Barra de Búsqueda */}
        <div className="relative w-full sm:max-w-md group">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground group-focus-within:text-brand-primary transition-colors" />
          <Input
            placeholder="Buscar tarea o asignatura..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="pl-12 h-12 rounded-xl bg-white/60 dark:bg-black/40 border-transparent focus:border-brand-primary focus:ring-brand-primary/20 transition-all shadow-sm"
          />
        </div>

        {/* Botones de Filtro Estilizados */}
        <div className="flex flex-wrap gap-2 px-2 pb-2 sm:p-0">
          {[
            { id: 'todas', label: 'Todas' },
            { id: 'pendiente', label: 'Pendientes' },
            { id: 'entregada', label: 'Entregadas' },
            { id: 'calificada', label: 'Calificadas' },
          ].map((estado) => (
            <Button
              key={estado.id}
              variant={filtroEstado === estado.id ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setFiltroEstado(estado.id)}
              className={`rounded-lg h-10 px-4 font-semibold transition-all ${
                filtroEstado === estado.id 
                  ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/20' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              {estado.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Lista de tareas (Tarjetas Estilo Lista Premium) */}
      <div className="space-y-4">
        {tareasFiltradas.map((tarea) => {
          const curso = cursos.find(c => c.id === tarea.cursoId)
          const diasRestantes = getDiasRestantes(tarea.fechaLimite)
          const entrega = entregas.find(e => e.tareaId === tarea.id)

          return (
            <Card key={tarea.id} className="group relative overflow-hidden bg-white/60 dark:bg-black/40 backdrop-blur-xl border-border/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-primary/10 hover:border-brand-primary/30">
              
              {/* Línea lateral de color */}
              <div className={`absolute top-0 left-0 w-1.5 h-full transition-opacity ${
                  tarea.estado === 'pendiente' ? 'bg-amber-400' :
                  tarea.estado === 'entregada' ? 'bg-brand-highlight' :
                  tarea.estado === 'calificada' ? 'bg-emerald-500' : 'bg-red-500'
                }`} 
              />

              <CardContent className="p-0">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between p-6 gap-6 pl-8">
                  
                  {/* Info Izquierda */}
                  <div className="flex items-start gap-5">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-primary/10 to-brand-highlight/10 shadow-sm border border-brand-primary/10 group-hover:scale-110 transition-transform duration-300">
                      <FileText className="h-7 w-7 text-brand-primary" />
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold text-foreground group-hover:text-brand-primary transition-colors">
                        {tarea.titulo}
                      </h3>
                      <p className="text-sm font-medium text-muted-foreground line-clamp-1 max-w-2xl">
                        {tarea.descripcion}
                      </p>
                      
                      <div className="flex flex-wrap items-center gap-3 text-sm pt-1">
                        <Badge variant="outline" className="bg-background border-border/50 text-foreground/80 font-semibold">
                          {curso?.nombre}
                        </Badge>
                        
                        <div className="flex items-center gap-1.5 text-muted-foreground font-medium bg-muted/50 px-2 py-0.5 rounded-md">
                          <Calendar className="h-4 w-4 text-brand-primary" />
                          {new Date(tarea.fechaLimite).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>

                        {diasRestantes > 0 && tarea.estado === 'pendiente' && (
                          <span className={`text-xs font-bold px-2 py-1 rounded-md ${diasRestantes <= 2 ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                            ⏳ {diasRestantes} {diasRestantes === 1 ? 'día' : 'días'} restante{diasRestantes !== 1 && 's'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Acciones Derecha */}
                  <div className="flex flex-row lg:flex-col items-center lg:items-end gap-4 lg:gap-3 w-full lg:w-auto border-t lg:border-t-0 border-border/50 pt-4 lg:pt-0">
                    
                    {getEstadoBadge(tarea.estado)}
                    
                    {user?.rol === 'alumno' && tarea.estado === 'pendiente' && (
                      <Button size="sm" className="rounded-xl bg-foreground text-background hover:bg-brand-primary hover:text-white transition-all h-10 w-full sm:w-auto px-6">
                        <Upload className="mr-2 h-4 w-4" />
                        Subir Tarea
                      </Button>
                    )}
                    
                    {user?.rol === 'alumno' && tarea.estado === 'calificada' && entrega && (
                      <div className="text-right bg-emerald-50 dark:bg-emerald-900/10 px-4 py-2 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
                        <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                          {entrega.calificacion}<span className="text-sm font-semibold text-emerald-600/60 dark:text-emerald-400/60">/{tarea.puntosTotales}</span>
                        </p>
                      </div>
                    )}

                    {(user?.rol === 'maestro' || user?.rol === 'admin') && (
                      <Button variant="outline" size="sm" className="rounded-xl h-10 w-full sm:w-auto hover:bg-brand-primary/5 hover:text-brand-primary hover:border-brand-primary/30 transition-all">
                        Revisar entregas <ChevronRight className="ml-1 h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Estado Vacío Estilizado */}
      {tareasFiltradas.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border/60 bg-white/40 dark:bg-black/20 p-16 text-center shadow-sm mt-8">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-brand-primary/10 mb-6">
            <FileText className="h-10 w-10 text-brand-primary" />
          </div>
          <h3 className="text-2xl font-bold text-foreground mb-2">No se encontraron tareas</h3>
          <p className="text-muted-foreground max-w-sm mb-6">
            {busqueda 
              ? `No encontramos tareas que coincidan con "${busqueda}".` 
              : 'Genial, ¡tienes todo al día! No hay tareas en esta categoría.'}
          </p>
          {busqueda && (
            <Button variant="outline" className="rounded-full border-brand-primary/20 hover:bg-brand-primary/5" onClick={() => setBusqueda('')}>
              Limpiar búsqueda
            </Button>
          )}
        </div>
      )}
    </div>
  )
}