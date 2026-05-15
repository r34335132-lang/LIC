'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { User, UserRole } from './types'
import { usuarios } from './data'

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  switchRole: (role: UserRole) => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  const login = useCallback(async (email: string, _password: string): Promise<boolean> => {
    // Simulación de login - en producción conectar a backend real
    const foundUser = usuarios.find(u => u.email.toLowerCase() === email.toLowerCase())
    if (foundUser) {
      setUser(foundUser)
      return true
    }
    return false
  }, [])

  const logout = useCallback(() => {
    setUser(null)
  }, [])

  const switchRole = useCallback((role: UserRole) => {
    // Para demo: cambiar entre roles fácilmente
    const userByRole = usuarios.find(u => u.rol === role)
    if (userByRole) {
      setUser(userByRole)
    }
  }, [])

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      switchRole,
      isAuthenticated: !!user
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
