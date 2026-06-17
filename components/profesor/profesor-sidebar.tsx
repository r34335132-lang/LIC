'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/auth-context'
import { getNombrePerfil } from '@/lib/perfil-utils'
import {
  GraduationCap,
  BookOpen,
  LayoutDashboard,
  LogOut,
  Menu,
  ChevronLeft,
  Shield,
  Megaphone,
  ClipboardList,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useState } from 'react'

const menuItems = [
  { href: '/profesor', label: 'Tablero', icon: LayoutDashboard },
  { href: '/profesor/materias', label: 'Materias', icon: BookOpen },
  { href: '/profesor/avisos', label: 'Avisos', icon: Megaphone },
  { href: '/profesor/entregas', label: 'Entregas / Tareas', icon: ClipboardList },
  { href: '/cuenta/seguridad', label: 'Seguridad', icon: Shield },
]

export function ProfesorSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { perfil, logout } = useAuth()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  const getInitials = (nombre: string) =>
    nombre.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()

  const SidebarContent = () => (
    <>
      <div className={cn('flex items-center gap-3 border-b border-border/50 p-5', collapsed && 'justify-center')}>
        <Link href="/profesor" className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-primary text-white">
            <GraduationCap className="h-6 w-6" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-black uppercase">IUD</span>
              <span className="text-[10px] font-bold text-brand-primary uppercase tracking-widest">Profesor</span>
            </div>
          )}
        </Link>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/profesor' && pathname.startsWith(item.href))
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all',
                isActive
                  ? 'bg-brand-primary text-white shadow-md'
                  : 'text-muted-foreground hover:bg-brand-primary/10 hover:text-brand-primary',
                collapsed && 'justify-center px-2'
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!collapsed && item.label}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-border/50 p-4">
        <div className={cn('flex items-center gap-3 mb-3', collapsed && 'justify-center')}>
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-brand-primary text-white text-xs font-bold">
              {perfil ? getInitials(getNombrePerfil(perfil)) : 'P'}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="overflow-hidden">
              <p className="truncate text-sm font-bold">{getNombrePerfil(perfil)}</p>
              <p className="text-xs text-brand-primary">Profesor</p>
            </div>
          )}
        </div>
        <Button variant="outline" size="sm" className="w-full" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          {!collapsed && 'Cerrar sesión'}
        </Button>
      </div>
    </>
  )

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-brand-primary text-white shadow-lg md:hidden"
      >
        <Menu className="h-6 w-6" />
      </button>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 md:hidden" onClick={() => setMobileOpen(false)} />
      )}

      <aside className={cn(
        'fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col bg-white shadow-2xl transition-transform md:hidden',
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <SidebarContent />
      </aside>

      <aside className={cn(
        'sticky top-0 hidden h-screen flex-col border-r bg-white md:flex transition-all',
        collapsed ? 'w-[80px]' : 'w-[280px]'
      )}>
        <SidebarContent />
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-4 top-10 flex h-8 w-8 items-center justify-center rounded-full border bg-white shadow-md"
        >
          <ChevronLeft className={cn('h-5 w-5', collapsed && 'rotate-180')} />
        </button>
      </aside>
    </>
  )
}
