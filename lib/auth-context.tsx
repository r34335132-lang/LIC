'use client'

import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getNombrePerfil } from '@/lib/perfil-utils'
import type { Perfil, Rol } from '@/types/database'
import type { User } from '@supabase/supabase-js'
import type { User as LegacyUser, UserRole } from './types'

function mapRolToLegacy(rol: Rol): UserRole {
  if (rol === 'profesor') return 'maestro'
  return rol
}

function perfilToLegacyUser(perfil: Perfil): LegacyUser {
  return {
    id: perfil.id,
    nombre: getNombrePerfil(perfil),
    email: perfil.email ?? '',
    rol: mapRolToLegacy(perfil.rol),
    matricula: perfil.matricula ?? undefined,
    programaId: perfil.programa_id ?? undefined,
    telefono: perfil.telefono ?? undefined,
    estado: 'activo',
    fechaIngreso: perfil.created_at,
  }
}

interface AuthContextType {
  user: LegacyUser | null
  authUser: User | null
  perfil: Perfil | null
  login: (email: string, password: string) => Promise<{ success: boolean; rol?: Rol; error?: string }>
  logout: () => Promise<void>
  isAuthenticated: boolean
  loading: boolean
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [perfil, setPerfil] = useState<Perfil | null>(null)
  const [loading, setLoading] = useState(true)

  const supabase = useMemo(() => {
    try {
      return createClient()
    } catch {
      return null
    }
  }, [])

  const fetchProfile = useCallback(async (userId: string) => {
    if (!supabase) return
    const { data } = await supabase
      .from('perfiles')
      .select('*')
      .eq('id', userId)
      .single()
    setPerfil(data as Perfil | null)
  }, [supabase])

  const refreshProfile = useCallback(async () => {
    if (!supabase) {
      setLoading(false)
      return
    }
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    setUser(currentUser)
    if (currentUser) {
      await fetchProfile(currentUser.id)
    } else {
      setPerfil(null)
    }
  }, [supabase, fetchProfile])

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }

    refreshProfile().finally(() => setLoading(false))

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        setPerfil(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase, fetchProfile, refreshProfile])

  const login = useCallback(async (email: string, password: string) => {
    if (!supabase) {
      return { success: false, error: 'Supabase no configurado' }
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error || !data.user) {
      return { success: false, error: error?.message ?? 'Credenciales incorrectas' }
    }

    const { data: profile } = await supabase
      .from('perfiles')
      .select('*')
      .eq('id', data.user.id)
      .single()

    if (!profile) {
      await supabase.auth.signOut()
      return { success: false, error: 'Perfil no encontrado. Contacta a administración.' }
    }

    setUser(data.user)
    setPerfil(profile as Perfil)
    return { success: true, rol: profile.rol as Rol }
  }, [supabase])

  const logout = useCallback(async () => {
    if (supabase) await supabase.auth.signOut()
    setUser(null)
    setPerfil(null)
  }, [supabase])

  const legacyUser = perfil ? perfilToLegacyUser(perfil) : null

  return (
    <AuthContext.Provider value={{
      user: legacyUser,
      authUser: user,
      perfil,
      login,
      logout,
      isAuthenticated: !!user && !!perfil,
      loading,
      refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function getRedirectPath(rol: Rol): string {
  switch (rol) {
    case 'admin': return '/admin'
    case 'profesor': return '/profesor'
    case 'alumno': return '/dashboard'
  }
}
