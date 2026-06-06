'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'
import { getNombrePerfil } from '@/lib/perfil-utils'
import type { Perfil, Rol } from '@/types/database'
import type { User as LegacyUser, UserRole } from './types'

export interface SessionUser {
  id: string
  email: string | null
}

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
  authUser: SessionUser | null
  perfil: Perfil | null
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; rol?: Rol; error?: string; redirectTo?: string }>
  logout: () => Promise<void>
  isAuthenticated: boolean
  loading: boolean
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null)
  const [perfil, setPerfil] = useState<Perfil | null>(null)
  const [loading, setLoading] = useState(true)

  const clearSession = useCallback(() => {
    setUser(null)
    setPerfil(null)
  }, [])

  const refreshProfile = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include' })
      if (res.status === 401) {
        clearSession()
        return
      }

      if (!res.ok) {
        clearSession()
        return
      }

      const data = await res.json()
      if (!data.user || !data.perfil) {
        clearSession()
        return
      }

      setUser(data.user as SessionUser)
      setPerfil(data.perfil as Perfil)
    } catch {
      clearSession()
    }
  }, [clearSession])

  useEffect(() => {
    refreshProfile().finally(() => setLoading(false))
  }, [refreshProfile])

  const login = useCallback(async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()

      if (!res.ok) {
        return {
          success: false,
          error: data.error ?? 'Credenciales incorrectas',
        }
      }

      setUser(data.user as SessionUser)
      setPerfil(data.perfil as Perfil)

      return {
        success: true,
        rol: data.perfil.rol as Rol,
        redirectTo: data.redirectTo as string,
      }
    } catch {
      return { success: false, error: 'Error de conexión al iniciar sesión' }
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })
    } finally {
      clearSession()
    }
  }, [clearSession])

  const legacyUser = perfil ? perfilToLegacyUser(perfil) : null

  return (
    <AuthContext.Provider
      value={{
        user: legacyUser,
        authUser: user,
        perfil,
        login,
        logout,
        isAuthenticated: !!user && !!perfil,
        loading,
        refreshProfile,
      }}
    >
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
    case 'admin':
      return '/admin'
    case 'profesor':
      return '/profesor'
    case 'alumno':
      return '/dashboard'
  }
}
