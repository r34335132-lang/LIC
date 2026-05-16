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
  ArrowUpRight,
  ShieldAlert,
  CalendarCheck,
  MoreHorizontal
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

  // Alumnos recientes (Nuevo Ingreso)
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
    <div className="space-y-8 animate-fade-in pb-10">
      
      {/* ================= HEADER DEL DASHBOARD ================= */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between bg-white dark:bg-black/40 p-6 md:p-8 rounded-3xl border border-border/50 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/10 text-brand-primary font-bold text-xs uppercase tracking-widest mb-3">
            <ShieldAlert className="h-4 w-4" /> Nivel de Acceso: Coordinador
          </div>
          <h1 className="text-3xl font-black text-foreground md:text-4xl tracking-tight">
            Centro de Control Académico
          </h1>
          <p className="text-muted-foreground font-medium mt-1">
            Bienvenido de vuelta, <span className="text-foreground font-bold">{user.nombre}</span>. Aquí tienes el resumen del campus.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/dashboard/alumnos">
            <Button className="rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-white font-bold shadow-md shadow-brand-primary/20">
              <Plus className="mr-2 h-4 w-4" /> Matricular Alumno
            </Button>
          </Link>
          <Link href="/dashboard/cursos">
            <Button variant="outline" className="rounded-xl border-border/50 font-bold hover:bg-gray-50 dark:hover:bg-gray-900">
              <Plus className="mr-2 h-4 w-4" /> Abrir Grupo
            </Button>
          </Link>
        </div>
      </div>

      {/* ================= MÉTRICAS PRINCIPALES (KPIs) ================= */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* KPI 1 */}
        <Card className="rounded-3xl border-0 bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/20 dark:to-black shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <Users className="h-6 w-6" />
              </div>
              <TrendingUp className="h-5 w-5 text-blue-500 opacity-50" />
            </div>
            <div>
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-1">Matrícula Activa</p>
              <p className="text-4xl font-black text-foreground">{totalAlumnos}</p>
            </div>
          </CardContent>
        </Card>

        {/* KPI 2 */}
        <Card className="rounded-3xl border-0 bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-950/20 dark:to-black shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                <GraduationCap className="h-6 w-6" />
              </div>
            </div>
            <div>
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-1">Plantilla Docente</p>
              <p className="text-4xl font-black text-foreground">{totalMaestros}</p>
            </div>
          </CardContent>
        </Card>

        {/* KPI 3 */}
        <Card className="rounded-3xl border-0 bg-gradient-to-br from-purple-50 to-white dark:from-purple-950/20 dark:to-black shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                <BookOpen className="h-6 w-6" />
              </div>
            </div>
            <div>
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-1">Grupos Activos</p>
              <p className="text-4xl font-black text-foreground">{cursosActivos}</p>
            </div>
          </CardContent>
        </Card>

        {/* KPI 4 */}
        <Card className="rounded-3xl border-0 bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-950/20 dark:to-black shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <FileText className="h-6 w-6" />
              </div>
            </div>
            <div>
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-1">Oferta Educativa</p>
              <p className="text-4xl font-black text-foreground">{programas.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ================= CONTENIDO CENTRAL (Doble Columna) ================= */}
      <div className="grid gap-6 lg:grid-cols-3">
        
        {/* ALERTAS Y NOTIFICACIONES */}
        <Card className="lg:col-span-1 rounded-3xl border-border/50 shadow-sm overflow-hidden flex flex-col">
          <CardHeader className="bg-gray-50/50 dark:bg-gray-900/50 border-b border-border/50 pb-4">
            <CardTitle className="flex items-center gap-2 text-lg font-black uppercase tracking-tight">
              <AlertTriangle className="h-5 w-5 text-amber-500" /> Panel de Alertas
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 flex-1 space-y-4">
            
            {/* Alerta: Tareas */}
            <div className="flex gap-4 rounded-2xl border border-amber-200/50 bg-amber-50/50 p-4 dark:border-amber-900/30 dark:bg-amber-950/20">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-amber-900 dark:text-amber-200 leading-tight">
                  {entregasPendientes} Tareas en espera
                </p>
                <p className="text-xs font-medium text-amber-700 dark:text-amber-400/70 mt-1">
                  Requieren revisión docente
                </p>
              </div>
            </div>

            {/* Alerta: Riesgo */}
            <div className="flex gap-4 rounded-2xl border border-red-200/50 bg-red-50/50 p-4 dark:border-red-900/30 dark:bg-red-950/20">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-red-900 dark:text-red-200 leading-tight">
                  Riesgo de deserción
                </p>
                <p className="text-xs font-medium text-red-700 dark:text-red-400/70 mt-1">
                  2 alumnos con asistencia baja
                </p>
              </div>
            </div>

            {/* Alerta: Informativa */}
            <div className="flex gap-4 rounded-2xl border border-emerald-200/50 bg-emerald-50/50 p-4 dark:border-emerald-900/30 dark:bg-emerald-950/20">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400">
                <CalendarCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-emerald-900 dark:text-emerald-200 leading-tight">
                  Periodo de Inscripción
                </p>
                <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400/70 mt-1">
                  Ciclo escolar activo y abierto
                </p>
              </div>
            </div>

          </CardContent>
        </Card>

        {/* ALUMNOS DE NUEVO INGRESO */}
        <Card className="lg:col-span-2 rounded-3xl border-border/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 bg-gray-50/50 dark:bg-gray-900/50 pb-4">
            <div>
              <CardTitle className="text-lg font-black uppercase tracking-tight">Nuevo Ingreso</CardTitle>
              <CardDescription className="font-medium">Últimas matrículas registradas en el sistema</CardDescription>
            </div>
            <Link href="/dashboard/alumnos">
              <Button variant="ghost" size="sm" className="font-bold text-brand-primary hover:bg-brand-primary/10">
                Directorio Completo <ArrowUpRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border/50">
              {alumnosRecientes.map((alumno) => {
                const programa = programas.find(p => p.id === alumno.programaId)
                return (
                  <div key={alumno.id} className="flex items-center justify-between p-5 hover:bg-gray-50/50 dark:hover:bg-gray-900/20 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 text-sm font-black text-foreground shadow-sm">
                        {alumno.nombre.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <p className="font-bold text-foreground text-base">{alumno.nombre}</p>
                        <p className="text-xs font-medium text-muted-foreground">{alumno.matricula}</p>
                      </div>
                    </div>
                    <div className="text-right hidden sm:block">
                      <Badge className="bg-brand-primary/10 text-brand-primary hover:bg-brand-primary/20 border-0 font-bold px-3 py-1">
                        {programa?.nombre || 'Sin programa'}
                      </Badge>
                      <p className="mt-2 text-xs font-medium text-muted-foreground flex items-center justify-end gap-1">
                        Alta: {new Date(alumno.fechaIngreso).toLocaleDateString('es-MX')}
                      </p>
                    </div>
                    <div className="sm:hidden">
                      <Button variant="ghost" size="icon" className="rounded-full">
                        <MoreHorizontal className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ================= ESTADO DE PROGRAMAS ACADÉMICOS ================= */}
      <Card className="rounded-3xl border-border/50 shadow-sm overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 bg-gray-50/50 dark:bg-gray-900/50 pb-4">
          <div>
            <CardTitle className="text-lg font-black uppercase tracking-tight">Rendimiento por Programa</CardTitle>
            <CardDescription className="font-medium">Volumen de alumnos y grupos por oferta educativa</CardDescription>
          </div>
          <Link href="/dashboard/programas">
            <Button variant="outline" size="sm" className="rounded-xl font-bold">Ver catálogo</Button>
          </Link>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {estadisticasProgramas.map((programa) => (
              <div
                key={programa.id}
                className="group rounded-2xl border border-border/50 p-5 transition-all duration-300 hover:border-brand-primary/30 hover:shadow-lg hover:shadow-brand-primary/5 hover:-translate-y-1 bg-white dark:bg-black/20"
              >
                <Badge variant="outline" className="mb-4 text-[10px] uppercase tracking-widest font-bold">
                  {programa.tipo}
                </Badge>
                <h4 className="font-black text-foreground mb-4 line-clamp-2 leading-tight">{programa.nombre}</h4>
                
                <div className="space-y-3 pt-4 border-t border-border/50">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground font-medium flex items-center gap-2"><Users className="h-4 w-4" /> Alumnos</span>
                    <span className="font-bold">{programa.alumnos}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground font-medium flex items-center gap-2"><BookOpen className="h-4 w-4" /> Grupos</span>
                    <span className="font-bold">{programa.cursos}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ================= ACCESOS DIRECTOS DE GESTIÓN ================= */}
      <div className="mb-2">
        <h3 className="text-sm font-black text-muted-foreground uppercase tracking-widest pl-2">Gestión Rápida</h3>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        
        <Link href="/dashboard/alumnos">
          <Card className="group cursor-pointer rounded-2xl border-border/50 transition-all duration-300 hover:border-brand-primary/50 hover:shadow-md hover:-translate-y-1 overflow-hidden">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800 text-foreground group-hover:bg-brand-primary group-hover:text-white transition-colors">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <p className="font-bold text-foreground leading-tight">Expedientes</p>
                <p className="text-xs font-medium text-muted-foreground mt-0.5">Control de Alumnos</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/maestros">
          <Card className="group cursor-pointer rounded-2xl border-border/50 transition-all duration-300 hover:border-brand-primary/50 hover:shadow-md hover:-translate-y-1 overflow-hidden">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800 text-foreground group-hover:bg-brand-primary group-hover:text-white transition-colors">
                <GraduationCap className="h-6 w-6" />
              </div>
              <div>
                <p className="font-bold text-foreground leading-tight">Docentes</p>
                <p className="text-xs font-medium text-muted-foreground mt-0.5">Asignación Académica</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/matriculas">
          <Card className="group cursor-pointer rounded-2xl border-border/50 transition-all duration-300 hover:border-brand-primary/50 hover:shadow-md hover:-translate-y-1 overflow-hidden">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800 text-foreground group-hover:bg-brand-primary group-hover:text-white transition-colors">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <p className="font-bold text-foreground leading-tight">Inscripciones</p>
                <p className="text-xs font-medium text-muted-foreground mt-0.5">Control de Matrículas</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/reportes">
          <Card className="group cursor-pointer rounded-2xl border-border/50 transition-all duration-300 hover:border-brand-primary/50 hover:shadow-md hover:-translate-y-1 overflow-hidden">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800 text-foreground group-hover:bg-brand-primary group-hover:text-white transition-colors">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div>
                <p className="font-bold text-foreground leading-tight">Reportes SEP</p>
                <p className="text-xs font-medium text-muted-foreground mt-0.5">Métricas Oficiales</p>
              </div>
            </CardContent>
          </Card>
        </Link>

      </div>
    </div>
  )
}