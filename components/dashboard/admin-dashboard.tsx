import type { User } from '@/lib/types'
import { usuarios, cursos, programas, tareas, entregas } from '@/lib/data'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Users,
  GraduationCap,
  BookOpen,
  FileText,
  TrendingUp,
  AlertTriangle,
  Plus,
  ArrowUpRight
} from 'lucide-react'
import Link from 'next/link'

interface AdminDashboardProps {
  user: User
}

export function AdminDashboard({ user }: AdminDashboardProps) {
  const totalAlumnos = usuarios.filter(u => u.rol === 'alumno').length
  const totalMaestros = usuarios.filter(u => u.rol === 'maestro').length
  const cursosActivos = cursos.filter(c => c.estado === 'activo').length
  const entregasPendientes = entregas.filter(e => e.estado === 'pendiente').length

  // Alumnos recientes
  const alumnosRecientes = usuarios
    .filter(u => u.rol === 'alumno')
    .sort((a, b) => new Date(b.fechaIngreso).getTime() - new Date(a.fechaIngreso).getTime())
    .slice(0, 5)

  // Estadísticas por programa
  const estadisticasProgramas = programas.slice(0, 4).map(p => ({
    ...p,
    alumnos: usuarios.filter(u => u.programaId === p.id).length,
    cursos: cursos.filter(c => c.programaId === p.id).length
  }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">
            Panel de Administración
          </h1>
          <p className="text-muted-foreground">
            Bienvenido, {user.nombre}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/alumnos">
            <Button variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo alumno
            </Button>
          </Link>
          <Link href="/dashboard/cursos">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo curso
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{totalAlumnos}</p>
                <p className="text-sm text-muted-foreground">Total alumnos</p>
              </div>
            </div>
            <TrendingUp className="h-5 w-5 text-chart-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                <GraduationCap className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{totalMaestros}</p>
                <p className="text-sm text-muted-foreground">Total maestros</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-chart-2/10">
                <BookOpen className="h-6 w-6 text-chart-2" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{cursosActivos}</p>
                <p className="text-sm text-muted-foreground">Cursos activos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-chart-1/10">
                <FileText className="h-6 w-6 text-chart-1" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{programas.length}</p>
                <p className="text-sm text-muted-foreground">Programas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Alertas y notificaciones */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Alertas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950/30">
              <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                {entregasPendientes} tareas pendientes de revisión
              </p>
              <p className="text-xs text-amber-600 dark:text-amber-400">
                Hay entregas sin calificar
              </p>
            </div>
            <div className="rounded-lg border border-border bg-muted/50 p-3">
              <p className="text-sm font-medium text-foreground">
                2 alumnos con baja asistencia
              </p>
              <p className="text-xs text-muted-foreground">
                Menos del 70% de asistencia
              </p>
            </div>
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
              <p className="text-sm font-medium text-foreground">
                Inscripciones abiertas
              </p>
              <p className="text-xs text-muted-foreground">
                Ciclo 2024-2025
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Alumnos recientes */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Alumnos recientes</CardTitle>
              <CardDescription>Últimos alumnos registrados</CardDescription>
            </div>
            <Link href="/dashboard/alumnos">
              <Button variant="ghost" size="sm">
                Ver todos
                <ArrowUpRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alumnosRecientes.map((alumno) => {
                const programa = programas.find(p => p.id === alumno.programaId)
                return (
                  <div
                    key={alumno.id}
                    className="flex items-center justify-between rounded-lg border border-border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                        {alumno.nombre.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{alumno.nombre}</p>
                        <p className="text-sm text-muted-foreground">{alumno.matricula}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="secondary">{programa?.nombre || 'Sin programa'}</Badge>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {new Date(alumno.fechaIngreso).toLocaleDateString('es-MX')}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Programas académicos */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">Programas académicos</CardTitle>
            <CardDescription>Estadísticas por programa</CardDescription>
          </div>
          <Link href="/dashboard/programas">
            <Button variant="ghost" size="sm">Ver todos</Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {estadisticasProgramas.map((programa) => (
              <div
                key={programa.id}
                className="rounded-lg border border-border p-4 transition-colors hover:bg-muted/50"
              >
                <h4 className="font-medium text-foreground">{programa.nombre}</h4>
                <Badge variant="outline" className="mt-1 mb-3">
                  {programa.tipo}
                </Badge>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>{programa.alumnos} alumnos inscritos</p>
                  <p>{programa.cursos} cursos activos</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Acciones rápidas */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link href="/dashboard/alumnos">
          <Card className="cursor-pointer transition-colors hover:bg-muted/50">
            <CardContent className="flex items-center gap-4 p-4">
              <Users className="h-8 w-8 text-primary" />
              <div>
                <p className="font-medium text-foreground">Gestionar alumnos</p>
                <p className="text-sm text-muted-foreground">Crear, editar, dar de baja</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/dashboard/maestros">
          <Card className="cursor-pointer transition-colors hover:bg-muted/50">
            <CardContent className="flex items-center gap-4 p-4">
              <GraduationCap className="h-8 w-8 text-accent" />
              <div>
                <p className="font-medium text-foreground">Gestionar maestros</p>
                <p className="text-sm text-muted-foreground">Asignar cursos</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/dashboard/matriculas">
          <Card className="cursor-pointer transition-colors hover:bg-muted/50">
            <CardContent className="flex items-center gap-4 p-4">
              <FileText className="h-8 w-8 text-chart-2" />
              <div>
                <p className="font-medium text-foreground">Matrículas</p>
                <p className="text-sm text-muted-foreground">Crear y gestionar</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/dashboard/reportes">
          <Card className="cursor-pointer transition-colors hover:bg-muted/50">
            <CardContent className="flex items-center gap-4 p-4">
              <TrendingUp className="h-8 w-8 text-chart-1" />
              <div>
                <p className="font-medium text-foreground">Reportes</p>
                <p className="text-sm text-muted-foreground">Estadísticas y análisis</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
