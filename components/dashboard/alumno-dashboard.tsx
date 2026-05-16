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
  ExternalLink,
  GraduationCap,
  PlayCircle,
  AlertCircle
} from 'lucide-react'
import Link from 'next/link'

interface AlumnoDashboardProps {
  user: User
}

export function AlumnoDashboard({ user }: AlumnoDashboardProps) {
  // Datos del alumno
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
    <div className="space-y-8 animate-fade-in pb-10">
      
      {/* ================= HEADER DEL ALUMNO ================= */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between bg-white dark:bg-black/40 p-6 md:p-8 rounded-3xl border border-border/50 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/10 text-brand-primary font-bold text-xs uppercase tracking-widest mb-3">
            <GraduationCap className="h-4 w-4" /> Ciclo Escolar Activo
          </div>
          <h1 className="text-3xl font-black text-foreground md:text-4xl tracking-tight">
            Hola, {user.nombre.split(' ')[0]}
          </h1>
          <p className="text-muted-foreground font-medium mt-1">
            Revisa tu progreso, tus próximas clases y entregables pendientes.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/cursos">
            <Button className="rounded-xl bg-black text-white hover:bg-brand-primary dark:bg-white dark:text-black font-bold shadow-md">
              Ir a mis materias
            </Button>
          </Link>
        </div>
      </div>

      {/* ================= MÉTRICAS ACADÉMICAS ================= */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* KPI 1: Cursos */}
        <Card className="rounded-3xl border-0 bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/20 dark:to-black shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <BookOpen className="h-6 w-6" />
              </div>
            </div>
            <div>
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-1">Materias Activas</p>
              <p className="text-4xl font-black text-foreground">{cursosActivos.length}</p>
            </div>
          </CardContent>
        </Card>

        {/* KPI 2: Tareas */}
        <Card className="rounded-3xl border-0 bg-gradient-to-br from-amber-50 to-white dark:from-amber-950/20 dark:to-black shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <FileText className="h-6 w-6" />
              </div>
              {tareasPendientes.length > 0 && (
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                </span>
              )}
            </div>
            <div>
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-1">Entregables</p>
              <p className="text-4xl font-black text-foreground">{tareasPendientes.length}</p>
            </div>
          </CardContent>
        </Card>

        {/* KPI 3: Promedio */}
        <Card className="rounded-3xl border-0 bg-gradient-to-br from-purple-50 to-white dark:from-purple-950/20 dark:to-black shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                <BarChart3 className="h-6 w-6" />
              </div>
            </div>
            <div>
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-1">Promedio General</p>
              <p className="text-4xl font-black text-foreground">{calcularPromedio()}</p>
            </div>
          </CardContent>
        </Card>

        {/* KPI 4: Asistencia */}
        <Card className="rounded-3xl border-0 bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-950/20 dark:to-black shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <ClipboardCheck className="h-6 w-6" />
              </div>
            </div>
            <div>
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-1">Asistencia</p>
              <p className="text-4xl font-black text-foreground">{calcularAsistencia()}%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ================= CONTENIDO PRINCIPAL ================= */}
      <div className="grid gap-6 lg:grid-cols-3">
        
        {/* PANEL IZQUIERDO: PRÓXIMA CLASE EN VIVO */}
        <Card className="lg:col-span-1 rounded-3xl border-border/50 shadow-sm overflow-hidden flex flex-col relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-brand-primary"></div>
          <CardHeader className="bg-gray-50/50 dark:bg-gray-900/50 border-b border-border/50 pb-4">
            <CardTitle className="flex items-center gap-2 text-lg font-black uppercase tracking-tight">
              <PlayCircle className="h-5 w-5 text-brand-primary" /> Próxima Sesión
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 flex-1 flex flex-col justify-center">
            {proximaClase ? (
              <div className="space-y-6">
                <div>
                  <Badge className="mb-3 bg-brand-primary/10 text-brand-primary hover:bg-brand-primary/20 border-0 font-bold px-3 py-1">En Vivo</Badge>
                  <h3 className="text-xl font-black text-foreground leading-tight mb-2">{proximaClase.titulo}</h3>
                  <p className="text-sm font-medium text-muted-foreground leading-relaxed">{proximaClase.descripcion}</p>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-4 space-y-3 border border-border/50">
                  <div className="flex items-center gap-3 text-sm font-bold text-foreground">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white dark:bg-black shadow-sm">
                      <Calendar className="h-4 w-4 text-brand-primary" />
                    </div>
                    {new Date(proximaClase.fecha).toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </div>
                  <div className="flex items-center gap-3 text-sm font-bold text-foreground">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white dark:bg-black shadow-sm">
                      <Clock className="h-4 w-4 text-brand-primary" />
                    </div>
                    {proximaClase.horaInicio} - {proximaClase.horaFin}
                  </div>
                </div>

                <Button asChild className="w-full h-14 rounded-xl font-black uppercase tracking-widest bg-brand-primary hover:bg-brand-primary-dark text-white shadow-lg hover:shadow-brand-primary/25 transition-all hover:-translate-y-1">
                  <a href={proximaClase.linkExterno} target="_blank" rel="noopener noreferrer">
                    Unirme al Aula Virtual <ExternalLink className="ml-2 h-5 w-5" />
                  </a>
                </Button>
              </div>
            ) : (
              <div className="text-center py-10">
                <Video className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground font-medium">No tienes sesiones en vivo programadas para hoy.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* PANEL DERECHO: MIS MATERIAS */}
        <Card className="lg:col-span-2 rounded-3xl border-border/50 shadow-sm overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 bg-gray-50/50 dark:bg-gray-900/50 pb-4">
            <div>
              <CardTitle className="text-lg font-black uppercase tracking-tight">Mi Avance Académico</CardTitle>
              <CardDescription className="font-medium">Materias que estás cursando actualmente</CardDescription>
            </div>
            <Link href="/dashboard/cursos">
              <Button variant="outline" size="sm" className="rounded-xl font-bold">Ver todas</Button>
            </Link>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid gap-5 sm:grid-cols-2">
              {cursosActivos.map((curso) => {
                const profesor = getProfesorByCurso(curso.id)
                return (
                  <div
                    key={curso.id}
                    className="group rounded-2xl border border-border/50 p-5 transition-all duration-300 hover:border-brand-primary/30 hover:shadow-md bg-white dark:bg-black/20"
                  >
                    <div className="mb-3 flex items-start justify-between">
                      <h4 className="font-black text-foreground leading-tight line-clamp-2 pr-2">{curso.nombre}</h4>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-5">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-[10px] font-bold">
                        {profesor?.nombre.charAt(0) || 'P'}
                      </div>
                      <p className="text-xs font-medium text-muted-foreground">
                        {profesor?.nombre || 'Profesor Asignado'}
                      </p>
                    </div>

                    <div className="space-y-2 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-xl border border-border/30">
                      <div className="flex justify-between text-xs font-bold text-foreground">
                        <span className="uppercase tracking-wider">Progreso del curso</span>
                        <span className="text-brand-primary">{curso.progreso || 0}%</span>
                      </div>
                      <Progress value={curso.progreso || 0} className="h-2 bg-gray-200 dark:bg-gray-800" />
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ================= TAREAS Y ENTREGABLES ================= */}
      <Card className="rounded-3xl border-border/50 shadow-sm overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 bg-gray-50/50 dark:bg-gray-900/50 pb-4">
          <div>
            <CardTitle className="text-lg font-black uppercase tracking-tight">Entregables Pendientes</CardTitle>
            <CardDescription className="font-medium">Actividades que requieren tu atención</CardDescription>
          </div>
          <Link href="/dashboard/tareas">
            <Button variant="outline" size="sm" className="rounded-xl font-bold">Ir a tareas</Button>
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          {tareasPendientes.length > 0 ? (
            <div className="divide-y divide-border/50">
              {tareasPendientes.slice(0, 5).map((tarea) => {
                const curso = cursos.find(c => c.id === tarea.cursoId)
                const fechaLimite = new Date(tarea.fechaLimite)
                const diasRestantes = Math.ceil((fechaLimite.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                
                // Lógica de colores para urgencia
                const isUrgent = diasRestantes <= 2
                const isPastDue = diasRestantes < 0
                
                return (
                  <div key={tarea.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 hover:bg-gray-50/50 dark:hover:bg-gray-900/20 transition-colors gap-4">
                    <div className="flex items-center gap-4">
                      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl shadow-sm ${
                        isPastDue ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' :
                        isUrgent ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' :
                        'bg-brand-primary/10 text-brand-primary'
                      }`}>
                        {isPastDue || isUrgent ? <AlertCircle className="h-6 w-6" /> : <FileText className="h-6 w-6" />}
                      </div>
                      <div>
                        <h4 className="font-bold text-foreground text-base">{tarea.titulo}</h4>
                        <p className="text-sm font-medium text-muted-foreground">{curso?.nombre}</p>
                      </div>
                    </div>
                    
                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 w-full sm:w-auto mt-2 sm:mt-0 bg-gray-50 dark:bg-black/20 sm:bg-transparent p-3 sm:p-0 rounded-xl">
                      <Badge className={`font-bold px-3 py-1 border-0 ${
                        isPastDue ? 'bg-red-500 text-white' :
                        isUrgent ? 'bg-amber-500 text-white' :
                        'bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                      }`}>
                        {isPastDue ? 'Vencida' : isUrgent ? `Vence en ${diasRestantes} días` : `Faltan ${diasRestantes} días`}
                      </Badge>
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> {fechaLimite.toLocaleDateString('es-MX')}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <ClipboardCheck className="h-16 w-16 text-emerald-500/30 mx-auto mb-4" />
              <h3 className="text-lg font-black text-foreground">¡Todo al día!</h3>
              <p className="text-muted-foreground font-medium mt-1">No tienes entregables pendientes por el momento.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}