import type { User } from '@/lib/types'
import { cursos, tareas, entregas, clasesVirtuales, usuarios, getCursosByProfesor } from '@/lib/data'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  BookOpen,
  Video,
  FileCheck,
  Users,
  Calendar,
  Clock,
  Plus,
  ExternalLink
} from 'lucide-react'
import Link from 'next/link'

interface MaestroDashboardProps {
  user: User
}

export function MaestroDashboard({ user }: MaestroDashboardProps) {
  const misCursos = getCursosByProfesor(user.id)
  const entregasPorRevisar = entregas.filter(e => e.estado === 'pendiente')
  const alumnosActivos = usuarios.filter(u => u.rol === 'alumno' && u.estado === 'activo')
  const clasesDeHoy = clasesVirtuales.filter(c => {
    const hoy = new Date().toISOString().split('T')[0]
    return c.fecha === hoy
  })
  const proximaClase = clasesVirtuales[0]

  // Contar tareas por revisar en mis cursos
  const misCursosIds = misCursos.map(c => c.id)
  const tareasMisCursos = tareas.filter(t => misCursosIds.includes(t.cursoId))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">
            Bienvenido, {user.nombre.split(' ')[0]}
          </h1>
          <p className="text-muted-foreground">
            Panel de control del docente
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/contenido">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Crear contenido
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{misCursos.length || 3}</p>
              <p className="text-sm text-muted-foreground">Cursos asignados</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
              <FileCheck className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{entregasPorRevisar.length}</p>
              <p className="text-sm text-muted-foreground">Tareas por revisar</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-chart-2/10">
              <Video className="h-6 w-6 text-chart-2" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{clasesDeHoy.length}</p>
              <p className="text-sm text-muted-foreground">Clases de hoy</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-chart-1/10">
              <Users className="h-6 w-6 text-chart-1" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{alumnosActivos.length}</p>
              <p className="text-sm text-muted-foreground">Alumnos activos</p>
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
                <div className="flex gap-2">
                  <Button asChild className="flex-1">
                    <a href={proximaClase.linkExterno} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Iniciar clase
                    </a>
                  </Button>
                  <Link href="/dashboard/asistencia">
                    <Button variant="outline">Asistencia</Button>
                  </Link>
                </div>
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
              <CardDescription>Cursos que impartes actualmente</CardDescription>
            </div>
            <Link href="/dashboard/cursos">
              <Button variant="ghost" size="sm">Ver todos</Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              {(misCursos.length > 0 ? misCursos : cursos.slice(0, 4)).map((curso) => {
                const tareasDelCurso = tareas.filter(t => t.cursoId === curso.id)
                return (
                  <div
                    key={curso.id}
                    className="rounded-lg border border-border p-4 transition-colors hover:bg-muted/50"
                  >
                    <div className="mb-2 flex items-start justify-between">
                      <h4 className="font-medium text-foreground">{curso.nombre}</h4>
                      <Badge variant="secondary">Activo</Badge>
                    </div>
                    <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">
                      {curso.descripcion}
                    </p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {tareasDelCurso.length} tareas
                      </span>
                      <Link href={`/dashboard/cursos/${curso.id}`}>
                        <Button variant="ghost" size="sm">Gestionar</Button>
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Entregas pendientes */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">Entregas por revisar</CardTitle>
            <CardDescription>Tareas entregadas que esperan calificación</CardDescription>
          </div>
          <Link href="/dashboard/entregas">
            <Button variant="ghost" size="sm">Ver todas</Button>
          </Link>
        </CardHeader>
        <CardContent>
          {entregasPorRevisar.length > 0 || tareasMisCursos.length > 0 ? (
            <div className="space-y-3">
              {tareas.filter(t => t.estado === 'entregada').slice(0, 5).map((tarea) => {
                const curso = cursos.find(c => c.id === tarea.cursoId)
                return (
                  <div
                    key={tarea.id}
                    className="flex items-center justify-between rounded-lg border border-border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                        <FileCheck className="h-5 w-5 text-accent" />
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground">{tarea.titulo}</h4>
                        <p className="text-sm text-muted-foreground">{curso?.nombre}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">3 entregas</Badge>
                      <Link href={`/dashboard/entregas/${tarea.id}`}>
                        <Button size="sm">Revisar</Button>
                      </Link>
                    </div>
                  </div>
                )
              })}
              {tareas.filter(t => t.estado === 'entregada').length === 0 && (
                <p className="text-center text-muted-foreground">No hay entregas pendientes de revisión</p>
              )}
            </div>
          ) : (
            <p className="text-center text-muted-foreground">No hay entregas pendientes</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
