'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/auth-context'
import {
  GraduationCap,
  Home,
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
  Menu
} from 'lucide-react'
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

// Menús por rol
const menuAlumno = [
  { href: '/dashboard', label: 'Inicio', icon: Home },
  { href: '/dashboard/cursos', label: 'Mis cursos', icon: BookOpen },
  { href: '/dashboard/clases', label: 'Clases virtuales', icon: Video },
  { href: '/dashboard/tareas', label: 'Tareas', icon: FileText },
  { href: '/dashboard/calificaciones', label: 'Calificaciones', icon: BarChart3 },
  { href: '/dashboard/asistencia', label: 'Asistencia', icon: ClipboardCheck },
  { href: '/dashboard/avisos', label: 'Avisos', icon: Bell },
  { href: '/dashboard/perfil', label: 'Perfil', icon: User },
]

const menuMaestro = [
  { href: '/dashboard', label: 'Inicio', icon: Home },
  { href: '/dashboard/cursos', label: 'Mis cursos', icon: BookOpen },
  { href: '/dashboard/contenido', label: 'Crear contenido', icon: FolderOpen },
  { href: '/dashboard/tareas', label: 'Tareas', icon: FileText },
  { href: '/dashboard/entregas', label: 'Entregas', icon: FileCheck },
  { href: '/dashboard/calificaciones', label: 'Calificaciones', icon: BarChart3 },
  { href: '/dashboard/asistencia', label: 'Asistencia', icon: ClipboardCheck },
  { href: '/dashboard/clases', label: 'Clases virtuales', icon: Video },
  { href: '/dashboard/avisos', label: 'Avisos', icon: Bell },
]

const menuAdmin = [
  { href: '/dashboard', label: 'Inicio', icon: Home },
  { href: '/dashboard/alumnos', label: 'Alumnos', icon: Users },
  { href: '/dashboard/maestros', label: 'Maestros', icon: GraduationCap },
  { href: '/dashboard/cursos', label: 'Cursos', icon: BookOpen },
  { href: '/dashboard/programas', label: 'Programas académicos', icon: BookMarked },
  { href: '/dashboard/matriculas', label: 'Matrículas', icon: FileText },
  { href: '/dashboard/usuarios', label: 'Usuarios', icon: User },
  { href: '/dashboard/reportes', label: 'Reportes', icon: BarChart3 },
  { href: '/dashboard/configuracion', label: 'Configuración', icon: Settings },
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const { user, logout, switchRole } = useAuth()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const getMenu = () => {
    switch (user?.rol) {
      case 'admin':
        return menuAdmin
      case 'maestro':
        return menuMaestro
      default:
        return menuAlumno
    }
  }

  const menu = getMenu()

  const getRolLabel = () => {
    switch (user?.rol) {
      case 'admin':
        return 'Administrador'
      case 'maestro':
        return 'Maestro'
      default:
        return 'Alumno'
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
      {/* Logo */}
      <div className={cn(
        "flex items-center gap-2 border-b border-sidebar-border p-4",
        collapsed && "justify-center"
      )}>
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary">
            <GraduationCap className="h-5 w-5 text-sidebar-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-xs font-bold leading-none text-sidebar-foreground">Instituto Universitario</span>
              <span className="text-[10px] text-sidebar-foreground/70">de Durango</span>
            </div>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {menu.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                collapsed && "justify-center px-2"
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* User Section */}
      <div className="border-t border-sidebar-border p-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className={cn(
              "flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-sidebar-accent/50",
              collapsed && "justify-center"
            )}>
              <Avatar className="h-9 w-9 border-2 border-sidebar-accent">
                <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-xs">
                  {user ? getInitials(user.nombre) : 'U'}
                </AvatarFallback>
              </Avatar>
              {!collapsed && (
                <div className="flex-1 overflow-hidden">
                  <p className="truncate text-sm font-medium text-sidebar-foreground">
                    {user?.nombre}
                  </p>
                  <p className="truncate text-xs text-sidebar-foreground/70">
                    {getRolLabel()}
                  </p>
                </div>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Mi cuenta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard/perfil">
                <User className="mr-2 h-4 w-4" />
                Ver perfil
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Cambiar rol (demo)
            </DropdownMenuLabel>
            <DropdownMenuItem onClick={() => switchRole('alumno')}>
              Alumno
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => switchRole('maestro')}>
              Maestro
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => switchRole('admin')}>
              Administrador
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-40 flex h-10 w-10 items-center justify-center rounded-lg bg-sidebar text-sidebar-foreground shadow-lg md:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-sidebar transition-transform md:hidden",
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <SidebarContent />
      </aside>

      {/* Desktop Sidebar */}
      <aside className={cn(
        "sticky top-0 hidden h-screen flex-col bg-sidebar transition-all md:flex",
        collapsed ? "w-[70px]" : "w-64"
      )}>
        <SidebarContent />
        
        {/* Collapse Button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 flex h-6 w-6 items-center justify-center rounded-full border border-sidebar-border bg-sidebar text-sidebar-foreground shadow-sm hover:bg-sidebar-accent"
        >
          <ChevronLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
        </button>
      </aside>
    </>
  )
}
