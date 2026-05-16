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
  ExternalLink,
  GraduationCap,
  PlayCircle,
  ClipboardEdit,
  UploadCloud,
  FileText // <-- ¡Aquí está la importación que faltaba!
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
    <div className="space-y-8 animate-fade-in pb-10">
      
      {/* ================= HEADER DEL CATEDRÁTICO ================= */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between bg-white dark:bg-black/40 p-6 md:p-8 rounded-3xl border border-border/50 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/10 text-brand-primary font-bold text-xs uppercase tracking-widest mb-3">
            <GraduationCap className="h-4 w-4" /> Nivel de Acceso: Catedrático
          </div>
          <h1 className="text-3xl font-black text-foreground md:text-4xl tracking-tight">
            Hola, Profesor {user.nombre.split(' ')[0]}
          </h1>
          <p className="text-muted-foreground font-medium mt-1">
            Bienvenido a tu espacio de gestión académica y evaluación.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/dashboard/contenido">
            <Button className="rounded-xl bg-black text-white hover:bg-brand-primary dark:bg-white dark:text-black font-bold shadow-md">
              <UploadCloud className="mr-2 h-4 w-4" /> Publicar Material
            </Button>
          </Link>
        </div>
      </div>

      {/* ================= MÉTRICAS PRINCIPALES (KPIs) ================= */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* KPI 1: Grupos */}
        <Card className="rounded-3xl border-0 bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/20 dark:to-black shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <BookOpen className="h-6 w-6" />
              </div>
            </div>
            <div>
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-1">Grupos Asignados</p>
              <p className="text-4xl font-black text-foreground">{misCursos.length || 3}</p>
            </div>
          </CardContent>
        </Card>

        {/* KPI 2: Evaluaciones (Alerta visual si hay pendientes) */}
        <Card className="rounded-3xl border-0 bg-gradient-to-br from-amber-50 to-white dark:from-amber-950/20 dark:to-black shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <FileCheck className="h-6 w-6" />
              </div>
              {entregasPorRevisar.length > 0 && (
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                </span>
              )}
            </div>
            <div>
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-1">Por Evaluar</p>
              <p className="text-4xl font-black text-foreground">{entregasPorRevisar.length}</p>
            </div>
          </CardContent>
        </Card>

        {/* KPI 3: Clases */}
        <Card className="rounded-3xl border-0 bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-950/20 dark:to-black shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Video className="h-6 w-6" />
              </div>
            </div>
            <div>
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-1">Sesiones Hoy</p>
              <p className="text-4xl font-black text-foreground">{clasesDeHoy.length}</p>
            </div>
          </CardContent>
        </Card>

        {/* KPI 4: Alumnos */}
        <Card className="rounded-3xl border-0 bg-gradient-to-br from-purple-50 to-white dark:from-purple-950/20 dark:to-black shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                <Users className="h-6 w-6" />
              </div>
            </div>
            <div>
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-1">Alumnos a Cargo</p>
              <p className="text-4xl font-black text-foreground">{alumnosActivos.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ================= CONTENIDO PRINCIPAL ================= */}
      <div className="grid gap-6 lg:grid-cols-3">
        
        {/* PANEL IZQUIERDO: PRÓXIMA CLASE EN VIVO */}
        <Card className="lg:col-span-1 rounded-3xl border-border/50 shadow-sm overflow-hidden flex flex-col relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500"></div>
          <CardHeader className="bg-gray-50/50 dark:bg-gray-900/50 border-b border-border/50 pb-4">
            <CardTitle className="flex items-center gap-2 text-lg font-black uppercase tracking-tight">
              <PlayCircle className="h-5 w-5 text-emerald-500" /> Siguiente Aula Virtual
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 flex-1 flex flex-col justify-center">
            {proximaClase ? (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-black text-foreground leading-tight mb-2">{proximaClase.titulo}</h3>
                  <p className="text-sm font-medium text-muted-foreground leading-relaxed">{proximaClase.descripcion}</p>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-4 space-y-3 border border-border/50">
                  <div className="flex items-center gap-3 text-sm font-bold text-foreground">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white dark:bg-black shadow-sm">
                      <Calendar className="h-4 w-4 text-emerald-500" />
                    </div>
                    {new Date(proximaClase.fecha).toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </div>
                  <div className="flex items-center gap-3 text-sm font-bold text-foreground">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white dark:bg-black shadow-sm">
                      <Clock className="h-4 w-4 text-emerald-500" />
                    </div>
                    {proximaClase.horaInicio} - {proximaClase.horaFin}
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <Button asChild className="w-full h-14 rounded-xl font-black uppercase tracking-widest bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 transition-all hover:-translate-y-1">
                    <a href={proximaClase.linkExterno} target="_blank" rel="noopener noreferrer">
                      Iniciar Transmisión <ExternalLink className="ml-2 h-5 w-5" />
                    </a>
                  </Button>
                  <Link href="/dashboard/asistencia" className="w-full">
                    <Button variant="outline" className="w-full h-12 rounded-xl font-bold border-border/50 hover:bg-gray-50 dark:hover:bg-gray-900">
                      Pase de Lista Rápido
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-center py-10">
                <Video className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground font-medium">No tienes aulas virtuales programadas para hoy.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* PANEL DERECHO: MIS GRUPOS */}
        <Card className="lg:col-span-2 rounded-3xl border-border/50 shadow-sm overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 bg-gray-50/50 dark:bg-gray-900/50 pb-4">
            <div>
              <CardTitle className="text-lg font-black uppercase tracking-tight">Gestión de Grupos</CardTitle>
              <CardDescription className="font-medium">Materias que impartes en el ciclo actual</CardDescription>
            </div>
            <Link href="/dashboard/cursos">
              <Button variant="outline" size="sm" className="rounded-xl font-bold">Ver todos</Button>
            </Link>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid gap-5 sm:grid-cols-2">
              {(misCursos.length > 0 ? misCursos : cursos.slice(0, 4)).map((curso) => {
                const tareasDelCurso = tareas.filter(t => t.cursoId === curso.id)
                return (
                  <div
                    key={curso.id}
                    className="group rounded-2xl border border-border/50 p-5 transition-all duration-300 hover:border-brand-primary/30 hover:shadow-md bg-white dark:bg-black/20 flex flex-col justify-between"
                  >
                    <div>
                      <div className="mb-3 flex items-start justify-between">
                        <Badge className="bg-brand-primary/10 text-brand-primary hover:bg-brand-primary/20 border-0 font-bold px-3 py-1">Grupo Activo</Badge>
                      </div>
                      <h4 className="font-black text-foreground leading-tight line-clamp-2 mb-2">{curso.nombre}</h4>
                      <p className="line-clamp-2 text-sm font-medium text-muted-foreground mb-4">
                        {curso.descripcion}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-border/50">
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                        <FileText className="h-4 w-4" /> {tareasDelCurso.length} Tareas Activas
                      </span>
                      <Link href={`/dashboard/cursos/${curso.id}`}>
                        <Button variant="secondary" size="sm" className="rounded-lg font-bold bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-foreground">
                          Gestionar
                        </Button>
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ================= TAREAS POR EVALUAR ================= */}
      <Card className="rounded-3xl border-border/50 shadow-sm overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 bg-gray-50/50 dark:bg-gray-900/50 pb-4">
          <div>
            <CardTitle className="text-lg font-black uppercase tracking-tight">Centro de Evaluación</CardTitle>
            <CardDescription className="font-medium">Entregas de alumnos que requieren calificación</CardDescription>
          </div>
          <Link href="/dashboard/entregas">
            <Button variant="outline" size="sm" className="rounded-xl font-bold">Ver bandeja completa</Button>
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          {entregasPorRevisar.length > 0 || tareasMisCursos.length > 0 ? (
            <div className="divide-y divide-border/50">
              {tareas.filter(t => t.estado === 'entregada').slice(0, 5).map((tarea) => {
                const curso = cursos.find(c => c.id === tarea.cursoId)
                return (
                  <div key={tarea.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 hover:bg-gray-50/50 dark:hover:bg-gray-900/20 transition-colors gap-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 shadow-sm">
                        <ClipboardEdit className="h-6 w-6" />
                      </div>
                      <div>
                        <h4 className="font-bold text-foreground text-base">{tarea.titulo}</h4>
                        <p className="text-sm font-medium text-muted-foreground">{curso?.nombre}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto mt-2 sm:mt-0">
                      <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 dark:bg-amber-900/50 dark:text-amber-300 font-bold px-3 py-1 border-0">
                        Nuevas Entregas
                      </Badge>
                      <Link href={`/dashboard/entregas/${tarea.id}`}>
                        <Button className="rounded-xl bg-black text-white hover:bg-brand-primary dark:bg-white dark:text-black font-bold shadow-md">
                          Evaluar Ahora
                        </Button>
                      </Link>
                    </div>
                  </div>
                )
              })}
              {tareas.filter(t => t.estado === 'entregada').length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground font-medium">Bandeja de calificación al día.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-16">
              <FileCheck className="h-16 w-16 text-emerald-500/30 mx-auto mb-4" />
              <h3 className="text-lg font-black text-foreground">¡Todo evaluado!</h3>
              <p className="text-muted-foreground font-medium mt-1">No tienes trabajos pendientes de calificación.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}