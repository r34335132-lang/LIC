'use client'

import { useAuth } from '@/lib/auth-context'
import { asistencias, cursos, usuarios, getAsistenciasByAlumno } from '@/lib/data'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ClipboardCheck, Calendar, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react'

export default function AsistenciaPage() {
  const { user } = useAuth()

  const misAsistencias = user?.rol === 'alumno'
    ? getAsistenciasByAlumno(user.id)
    : asistencias

  const calcularPorcentaje = () => {
    if (misAsistencias.length === 0) return 100
    const presentes = misAsistencias.filter(a => a.estado === 'presente' || a.estado === 'retardo').length
    return Math.round((presentes / misAsistencias.length) * 100)
  }

  const porcentaje = calcularPorcentaje()

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'presente':
        return <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-950/50 dark:text-green-400"><CheckCircle className="mr-1 h-3 w-3" />Presente</Badge>
      case 'falta':
        return <Badge variant="destructive"><XCircle className="mr-1 h-3 w-3" />Falta</Badge>
      case 'retardo':
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400"><Clock className="mr-1 h-3 w-3" />Retardo</Badge>
      case 'justificado':
        return <Badge variant="secondary"><AlertCircle className="mr-1 h-3 w-3" />Justificado</Badge>
      default:
        return <Badge variant="outline">{estado}</Badge>
    }
  }

  const contarPorEstado = (estado: string) => {
    return misAsistencias.filter(a => a.estado === estado).length
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">Asistencia</h1>
          <p className="text-muted-foreground">
            {user?.rol === 'alumno'
              ? 'Consulta tu registro de asistencia'
              : 'Registra la asistencia de los alumnos'}
          </p>
        </div>
        {(user?.rol === 'maestro' || user?.rol === 'admin') && (
          <Button>
            <ClipboardCheck className="mr-2 h-4 w-4" />
            Registrar asistencia
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card className="sm:col-span-2 lg:col-span-1">
          <CardContent className="flex items-center gap-4 p-4">
            <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${porcentaje >= 80 ? 'bg-green-100 dark:bg-green-950/50' : porcentaje >= 70 ? 'bg-amber-100 dark:bg-amber-950/50' : 'bg-red-100 dark:bg-red-950/50'}`}>
              <ClipboardCheck className={`h-6 w-6 ${porcentaje >= 80 ? 'text-green-600' : porcentaje >= 70 ? 'text-amber-600' : 'text-red-600'}`} />
            </div>
            <div>
              <p className={`text-2xl font-bold ${porcentaje >= 80 ? 'text-green-600' : porcentaje >= 70 ? 'text-amber-600' : 'text-red-600'}`}>
                {porcentaje}%
              </p>
              <p className="text-sm text-muted-foreground">Asistencia total</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <CheckCircle className="h-8 w-8 text-green-500" />
            <div>
              <p className="text-2xl font-bold text-foreground">{contarPorEstado('presente')}</p>
              <p className="text-sm text-muted-foreground">Presentes</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <XCircle className="h-8 w-8 text-red-500" />
            <div>
              <p className="text-2xl font-bold text-foreground">{contarPorEstado('falta')}</p>
              <p className="text-sm text-muted-foreground">Faltas</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <Clock className="h-8 w-8 text-amber-500" />
            <div>
              <p className="text-2xl font-bold text-foreground">{contarPorEstado('retardo')}</p>
              <p className="text-sm text-muted-foreground">Retardos</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <AlertCircle className="h-8 w-8 text-muted-foreground" />
            <div>
              <p className="text-2xl font-bold text-foreground">{contarPorEstado('justificado')}</p>
              <p className="text-sm text-muted-foreground">Justificados</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de asistencia */}
      <Card>
        <CardHeader>
          <CardTitle>Registro de asistencia</CardTitle>
          <CardDescription>Historial completo de asistencias</CardDescription>
        </CardHeader>
        <CardContent>
          {misAsistencias.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Curso</TableHead>
                  {user?.rol !== 'alumno' && <TableHead>Alumno</TableHead>}
                  <TableHead>Estado</TableHead>
                  <TableHead>Observaciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {misAsistencias.map((asist) => {
                  const curso = cursos.find(c => c.id === asist.cursoId)
                  const alumno = usuarios.find(u => u.id === asist.alumnoId)

                  return (
                    <TableRow key={asist.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {new Date(asist.fecha).toLocaleDateString('es-MX', {
                            weekday: 'short',
                            day: 'numeric',
                            month: 'short'
                          })}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{curso?.nombre || 'N/A'}</TableCell>
                      {user?.rol !== 'alumno' && (
                        <TableCell>{alumno?.nombre || 'N/A'}</TableCell>
                      )}
                      <TableCell>{getEstadoBadge(asist.estado)}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {asist.observaciones || '-'}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ClipboardCheck className="mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="text-lg font-medium text-foreground">Sin registros</h3>
              <p className="text-muted-foreground">
                Aún no hay registros de asistencia
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
