'use client'

import { useAuth } from '@/lib/auth-context'
import { calificaciones, cursos, tareas, getCalificacionesByAlumno } from '@/lib/data'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { BarChart3, TrendingUp, Award } from 'lucide-react'

export default function CalificacionesPage() {
  const { user } = useAuth()

  const misCalificaciones = user?.rol === 'alumno' 
    ? getCalificacionesByAlumno(user.id) 
    : calificaciones

  const calcularPromedio = () => {
    if (misCalificaciones.length === 0) return 0
    const suma = misCalificaciones.reduce((acc, c) => acc + c.calificacion, 0)
    return Math.round(suma / misCalificaciones.length)
  }

  const promedio = calcularPromedio()

  const getCalificacionColor = (cal: number) => {
    if (cal >= 90) return 'text-green-600 dark:text-green-400'
    if (cal >= 70) return 'text-amber-600 dark:text-amber-400'
    return 'text-red-600 dark:text-red-400'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground md:text-3xl">Calificaciones</h1>
        <p className="text-muted-foreground">
          {user?.rol === 'alumno' 
            ? 'Consulta tus calificaciones por curso y tarea'
            : 'Gestiona las calificaciones de los alumnos'}
        </p>
      </div>

      {/* Stats */}
      {user?.rol === 'alumno' && (
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className={`text-2xl font-bold ${getCalificacionColor(promedio)}`}>{promedio}</p>
                <p className="text-sm text-muted-foreground">Promedio general</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                <TrendingUp className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{misCalificaciones.length}</p>
                <p className="text-sm text-muted-foreground">Tareas calificadas</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-chart-2/10">
                <Award className="h-6 w-6 text-chart-2" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {misCalificaciones.filter(c => c.calificacion >= 90).length}
                </p>
                <p className="text-sm text-muted-foreground">Calificaciones A</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabla de calificaciones */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de calificaciones</CardTitle>
          <CardDescription>
            {user?.rol === 'alumno' 
              ? 'Todas tus calificaciones registradas'
              : 'Calificaciones de todos los alumnos'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {misCalificaciones.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Curso</TableHead>
                  <TableHead>Tarea</TableHead>
                  <TableHead>Calificación</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Comentarios</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {misCalificaciones.map((cal) => {
                  const curso = cursos.find(c => c.id === cal.cursoId)
                  const tarea = tareas.find(t => t.id === cal.tareaId)

                  return (
                    <TableRow key={cal.id}>
                      <TableCell className="font-medium">{curso?.nombre || 'N/A'}</TableCell>
                      <TableCell>{tarea?.titulo || 'N/A'}</TableCell>
                      <TableCell>
                        <span className={`font-bold ${getCalificacionColor(cal.calificacion)}`}>
                          {cal.calificacion}
                        </span>
                        <span className="text-muted-foreground">/{tarea?.puntosTotales || 100}</span>
                      </TableCell>
                      <TableCell>{new Date(cal.fecha).toLocaleDateString('es-MX')}</TableCell>
                      <TableCell className="max-w-xs truncate text-muted-foreground">
                        {cal.comentarios || '-'}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <BarChart3 className="mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="text-lg font-medium text-foreground">Sin calificaciones</h3>
              <p className="text-muted-foreground">
                Aún no tienes calificaciones registradas
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Calificaciones por curso */}
      {user?.rol === 'alumno' && (
        <Card>
          <CardHeader>
            <CardTitle>Promedio por curso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {cursos.slice(0, 4).map((curso) => {
                const calsCurso = misCalificaciones.filter(c => c.cursoId === curso.id)
                const promCurso = calsCurso.length > 0
                  ? Math.round(calsCurso.reduce((acc, c) => acc + c.calificacion, 0) / calsCurso.length)
                  : 0

                return (
                  <div key={curso.id} className="flex items-center justify-between rounded-lg border border-border p-4">
                    <div>
                      <h4 className="font-medium text-foreground">{curso.nombre}</h4>
                      <p className="text-sm text-muted-foreground">
                        {calsCurso.length} {calsCurso.length === 1 ? 'calificación' : 'calificaciones'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-2xl font-bold ${getCalificacionColor(promCurso)}`}>
                        {promCurso || 'N/A'}
                      </p>
                      {promCurso > 0 && (
                        <Badge variant={promCurso >= 90 ? 'default' : promCurso >= 70 ? 'secondary' : 'destructive'}>
                          {promCurso >= 90 ? 'Excelente' : promCurso >= 70 ? 'Aprobado' : 'En riesgo'}
                        </Badge>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
