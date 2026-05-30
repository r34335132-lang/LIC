import { createClient } from '@/lib/supabase/server'
import type { Perfil, Rol } from '@/types/database'

export async function getSessionUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

export async function getPerfil(userId: string): Promise<Perfil | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('perfiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error || !data) return null
  return data as Perfil
}

export async function getPerfilFromSession(): Promise<{
  userId: string
  perfil: Perfil
} | null> {
  const user = await getSessionUser()
  if (!user) return null

  const perfil = await getPerfil(user.id)
  if (!perfil) return null

  return { userId: user.id, perfil }
}

export function getDashboardPath(rol: Rol): string {
  switch (rol) {
    case 'admin':
      return '/admin'
    case 'profesor':
      return '/profesor'
    case 'alumno':
      return '/dashboard'
  }
}

export function canAccessAdmin(rol: Rol): boolean {
  return rol === 'admin'
}

export function canAccessProfesor(rol: Rol): boolean {
  return rol === 'profesor' || rol === 'admin'
}

export function canAccessAlumno(rol: Rol): boolean {
  return rol === 'alumno' || rol === 'admin'
}
