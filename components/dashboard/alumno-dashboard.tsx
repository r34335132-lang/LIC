import type { User } from '@/lib/types'
import { cursos, tareas, clasesVirtuales, asistencias, calificaciones, getProfesorByCurso } from '@/lib/data'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  BookOpen,
  Video,
  FileText,
  BarChart3,
  ClipboardCheck,
  Calendar,
  Clock,
  ExternalLink
} from 'lucide-react'
import Link from 'next/link'

interface AlumnoDashboardProps {
  user: User
}

export function AlumnoDashboard({ user }: AlumnoDashboardProps) {
  // Datos del alumno (en producción vendría de la BD)
  const cursosActivos = cursos.filter(c => c.estado === 'activo').slice(0, 4)
  const tareasPendientes = tareas.filter(t => t.estado === 'pendiente')
  const proximaClase = clasesVirtuales[0]
  const misAsistencias = asistencias.filter(a => a.alumnoId === user.id)
  const misCalificaciones = calificaciones.filter(c => c.alumnoId === user.id)

  const calcularPromedio = () => {
    if (misCalificaciones.length === 0) return 0
    const suma = misCalificaciones.reduce((acc, c) => acc + c.calificacion, 0)
    return Math.round(suma / misCalificaciones.length)
  }

  const calcularAsistencia = () => {
    if (misAsistencias.length === 0) return 100
    const presentes = misAsistencias.filter(a => a.estado === 'presente' || a.estado === 'retardo').length
    return Math.round((presentes / misAsistencias.length) * 100)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground md:text-3xl">
          Bienvenido, {user.nombre.split(' ')[0]}
        </h1>
        <p className="text-muted-foreground">
          Aquí está el resumen de tu actividad académica
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{cursosActivos.length}</p>
              <p className="text-sm text-muted-foreground">Cursos activos</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
              <FileText className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{tareasPendientes.length}</p>
              <p className="text-sm text-muted-foreground">Tareas pendientes</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-chart-2/10">
              <BarChart3 className="h-6 w-6 text-chart-2" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{calcularPromedio()}</p>
              <p className="text-sm text-muted-foreground">Promedio general</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-chart-1/10">
              <ClipboardCheck className="h-6 w-6 text-chart-1" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{calcularAsistencia()}%</p>
              <p className="text-sm text-muted-foreground">Asistencia</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Próxima clase */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Video className="h-5 w-5 text-primary" />
              Próxima clase
            </CardTitle>
          </CardHeader>
          <CardContent>
            {proximaClase ? (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-foreground">{proximaClase.titulo}</h3>
                  <p className="text-sm text-muted-foreground">{proximaClase.descripcion}</p>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(proximaClase.fecha).toLocaleDateString('es-MX', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long'
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {proximaClase.horaInicio} - {proximaClase.horaFin}
                </div>
                <Button asChild className="w-full">
                  <a href={proximaClase.linkExterno} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Entrar a clase
                  </a>
                </Button>
              </div>
            ) : (
              <p className="text-muted-foreground">No hay clases programadas</p>
            )}
          </CardContent>
        </Card>

        {/* Mis cursos */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Mis cursos</CardTitle>
              <CardDescription>Cursos en los que estás inscrito</CardDescription>
            </div>
            <Link href="/dashboard/cursos">
              <Button variant="ghost" size="sm">Ver todos</Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              {cursosActivos.map((curso) => {
                const profesor = getProfesorByCurso(curso.id)
                return (
                  <div
                    key={curso.id}
                    className="rounded-lg border border-border p-4 transition-colors hover:bg-muted/50"
                  >
                    <div className="mb-2 flex items-start justify-between">
                      <h4 className="font-medium text-foreground">{curso.nombre}</h4>
                      <Badge variant="secondary">Activo</Badge>
                    </div>
                    <p className="mb-2 text-sm text-muted-foreground">
                      {profesor?.nombre || 'Sin profesor'}
                    </p>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Progreso</span>
                        <span>{curso.progreso || 0}%</span>
                      </div>
                      <Progress value={curso.progreso || 0} className="h-2" />
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tareas pendientes */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">Tareas pendientes</CardTitle>
            <CardDescription>Tareas que debes entregar próximamente</CardDescription>
          </div>
          <Link href="/dashboard/tareas">
            <Button variant="ghost" size="sm">Ver todas</Button>
          </Link>
        </CardHeader>
        <CardContent>
          {tareasPendientes.length > 0 ? (
            <div className="space-y-3">
              {tareasPendientes.slice(0, 5).map((tarea) => {
                const curso = cursos.find(c => c.id === tarea.cursoId)
                const fechaLimite = new Date(tarea.fechaLimite)
                const diasRestantes = Math.ceil((fechaLimite.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                
                return (
                  <div
                    key={tarea.id}
                    className="flex items-center justify-between rounded-lg border border-border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                        <FileText className="h-5 w-5 text-accent" />
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground">{tarea.titulo}</h4>
                        <p className="text-sm text-muted-foreground">{curso?.nombre}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={diasRestantes <= 2 ? 'destructive' : 'outline'}>
                        {diasRestantes <= 0 ? 'Vencida' : `${diasRestantes} días`}
                      </Badge>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {fechaLimite.toLocaleDateString('es-MX')}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-center text-muted-foreground">No tienes tareas pendientes</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
