'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/auth-context'
import {
  GraduationCap,
  BookOpen,
  Video,
  FileText,
  ClipboardCheck,
  BarChart3,
  Bell,
  User,
  Users,
  Settings,
  BookMarked,
  FolderOpen,
  FileCheck,
  LogOut,
  ChevronLeft,
  Menu,
  ShieldCheck,
  LayoutDashboard
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useState } from 'react'

type MenuSection = {
  section: string
  href?: never
  label?: never
  icon?: never
  badge?: never
}

type MenuLink = {
  href: string
  label: string
  icon: LucideIcon
  badge?: string
  section?: never
}

type MenuItem = MenuSection | MenuLink

function isMenuSection(item: MenuItem): item is MenuSection {
  return 'section' in item
}

// Menús agrupados por rol para mejor jerarquía visual
const menuAlumno: MenuItem[] = [
  { section: 'Principal' },
  { href: '/dashboard', label: 'Tablero', icon: LayoutDashboard },
  { href: '/dashboard/avisos', label: 'Avisos', icon: Bell, badge: '2' },
  
  { section: 'Académico' },
  { href: '/dashboard/cursos', label: 'Mis Materias', icon: BookOpen },
  { href: '/dashboard/clases', label: 'Clases en Vivo', icon: Video },
  { href: '/dashboard/tareas', label: 'Entregables', icon: FileText },
  
  { section: 'Control Escolar' },
  { href: '/dashboard/calificaciones', label: 'Kardex', icon: BarChart3 },
  { href: '/dashboard/asistencia', label: 'Asistencia', icon: ClipboardCheck },
]

const menuMaestro: MenuItem[] = [
  { section: 'Principal' },
  { href: '/dashboard', label: 'Tablero', icon: LayoutDashboard },
  { href: '/dashboard/avisos', label: 'Avisos', icon: Bell },
  
  { section: 'Gestión Académica' },
  { href: '/dashboard/cursos', label: 'Mis Grupos', icon: Users },
  { href: '/dashboard/contenido', label: 'Material Didáctico', icon: FolderOpen },
  { href: '/dashboard/clases', label: 'Aulas Virtuales', icon: Video },
  
  { section: 'Evaluación' },
  { href: '/dashboard/tareas', label: 'Asignar Tareas', icon: FileText },
  { href: '/dashboard/entregas', label: 'Revisión', icon: FileCheck, badge: '5' },
  { href: '/dashboard/calificaciones', label: 'Calificaciones', icon: BarChart3 },
  { href: '/dashboard/asistencia', label: 'Pase de Lista', icon: ClipboardCheck },
]

const menuAdmin: MenuItem[] = [
  { section: 'Principal' },
  { href: '/dashboard', label: 'Resumen Global', icon: LayoutDashboard },
  
  { section: 'Comunidad Escolar' },
  { href: '/dashboard/alumnos', label: 'Directorio Alumnos', icon: Users },
  { href: '/dashboard/maestros', label: 'Plantilla Docente', icon: GraduationCap },
  { href: '/dashboard/usuarios', label: 'Usuarios y Accesos', icon: ShieldCheck },
  
  { section: 'Oferta y Control' },
  { href: '/dashboard/programas', label: 'Programas (RVOE)', icon: BookMarked },
  { href: '/dashboard/cursos', label: 'Gestión de Cursos', icon: BookOpen },
  { href: '/dashboard/matriculas', label: 'Matrículas', icon: FileText },
  
  { section: 'Sistema' },
  { href: '/dashboard/reportes', label: 'Reportes y Métricas', icon: BarChart3 },
  { href: '/dashboard/configuracion', label: 'Configuración', icon: Settings },
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const getMenu = () => {
    switch (user?.rol) {
      case 'admin': return menuAdmin
      case 'maestro': return menuMaestro
      default: return menuAlumno
    }
  }

  const menu = getMenu()

  const getRolLabel = () => {
    switch (user?.rol) {
      case 'admin': return 'Coordinador Académico'
      case 'maestro': return 'Catedrático'
      default: return 'Estudiante'
    }
  }

  const getInitials = (nombre: string) => {
    return nombre
      .split(' ')
      .map(n => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase()
  }

  const SidebarContent = () => (
    <>
      {/* Logo Superior Institucional */}
      <div className={cn(
        "flex items-center gap-3 border-b border-border/50 p-5 min-h-[80px]",
        collapsed && "justify-center px-2"
      )}>
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-primary text-white shadow-md shadow-brand-primary/20">
            <GraduationCap className="h-6 w-6" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-black leading-tight text-foreground uppercase tracking-tight">IUD</span>
              <span className="text-[10px] font-bold text-brand-primary uppercase tracking-widest">Campus Virtual</span>
            </div>
          )}
        </Link>
      </div>

      {/* Navegación con Secciones */}
      <nav className="flex-1 space-y-1.5 overflow-y-auto p-4 custom-scrollbar">
        {menu.map((item, index) => {
          // Renderizar Título de Sección
          if (isMenuSection(item)) {
            if (collapsed) return <div key={`divider-${index}`} className="h-4" />
            return (
              <div key={`section-${index}`} className="pt-4 pb-1 pl-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
                  {item.section}
                </span>
              </div>
            )
          }

          // Renderizar Enlace
          const isActive = pathname === item.href
          const Icon = item.icon!

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "group flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200",
                isActive
                  ? "bg-brand-primary text-white shadow-md shadow-brand-primary/20"
                  : "text-muted-foreground hover:bg-brand-primary/10 hover:text-brand-primary",
                collapsed && "justify-center px-2"
              )}
            >
              <div className="flex items-center gap-3">
                <Icon className={cn("h-5 w-5 shrink-0 transition-transform group-hover:scale-110", isActive ? "text-white" : "text-muted-foreground group-hover:text-brand-primary")} />
                {!collapsed && <span>{item.label}</span>}
              </div>
              
              {/* Badge de Notificaciones */}
              {!collapsed && item.badge && (
                <span className={cn(
                  "flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-bold",
                  isActive ? "bg-white text-brand-primary" : "bg-brand-highlight text-black"
                )}>
                  {item.badge}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Perfil del Usuario Inferior */}
      <div className="border-t border-border/50 p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className={cn(
              "flex w-full items-center gap-3 rounded-xl p-2 text-left transition-all hover:bg-gray-100 dark:hover:bg-gray-800",
              collapsed && "justify-center"
            )}>
              <Avatar className="h-10 w-10 border-2 border-brand-primary/20">
                <AvatarFallback className="bg-gradient-to-br from-brand-primary to-brand-highlight text-white text-xs font-bold">
                  {user ? getInitials(user.nombre) : 'U'}
                </AvatarFallback>
              </Avatar>
              {!collapsed && (
                <div className="flex-1 overflow-hidden">
                  <p className="truncate text-sm font-bold text-foreground">
                    {user?.nombre}
                  </p>
                  <p className="truncate text-xs font-medium text-brand-primary">
                    {getRolLabel()}
                  </p>
                </div>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 rounded-xl p-2">
            <DropdownMenuLabel className="font-bold">Mi Cuenta Institucional</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="cursor-pointer font-medium py-2">
              <Link href="/dashboard/perfil">
                <User className="mr-2 h-4 w-4 text-brand-primary" /> Ver Mi Perfil
              </Link>
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="text-red-500 focus:text-red-600 focus:bg-red-50 cursor-pointer font-bold py-2">
              <LogOut className="mr-2 h-4 w-4" /> Cerrar Sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  )

  return (
    <>
      {/* Botón Flotante para Móviles */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-brand-primary text-white shadow-lg md:hidden hover:scale-105 transition-transform"
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Fondo oscuro al abrir menú móvil */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar para Móviles */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col bg-white dark:bg-[#09090b] shadow-2xl transition-transform duration-300 ease-in-out md:hidden",
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <SidebarContent />
      </aside>

      {/* Sidebar para Computadora (Desktop) */}
      <aside className={cn(
        "sticky top-0 hidden h-screen flex-col bg-white dark:bg-[#09090b] border-r border-border/50 shadow-sm transition-all duration-300 md:flex",
        collapsed ? "w-[80px]" : "w-[280px]"
      )}>
        <SidebarContent />
        
        {/* Botón para colapsar/expandir el sidebar */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-4 top-10 flex h-8 w-8 items-center justify-center rounded-full border border-border/50 bg-white dark:bg-gray-900 text-foreground shadow-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-all z-10"
        >
          <ChevronLeft className={cn("h-5 w-5 transition-transform duration-300", collapsed && "rotate-180")} />
        </button>
      </aside>
    </>
  )
}
