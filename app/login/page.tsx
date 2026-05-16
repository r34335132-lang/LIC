'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { GraduationCap, Mail, Lock, Eye, EyeOff, AlertCircle, ArrowLeft } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAuth } from '@/lib/auth-context'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const success = await login(email, password)
      if (success) {
        // Redirección directa sin interrupciones
        router.push('/dashboard')
      } else {
        setError('Correo o contraseña incorrectos. Verifica tus datos.')
        setLoading(false)
      }
    } catch {
      setError('Error de conexión al iniciar sesión. Intenta de nuevo.')
      setLoading(false)
    }
  }

  // Demo: Login rápido corregido
  const quickLogin = async (targetEmail: string) => {
    setError('')
    setEmail(targetEmail)
    setPassword('demo123')
    setLoading(true)
    
    try {
      const success = await login(targetEmail, 'demo123')
      if (success) {
        // Al eliminar router.refresh(), Next.js ya no cancela el viaje a la nueva ruta
        router.push('/dashboard')
      } else {
        setError(`El usuario ${targetEmail} no existe en la base de datos.`)
        setLoading(false)
      }
    } catch {
      setError('Error al procesar el acceso rápido.')
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gray-50/50 dark:bg-black/95 p-4">
      
      {/* Luces de fondo (Efecto Premium) */}
      <div className="absolute inset-0 bg-grid-subtle [mask-image:linear-gradient(to_bottom,white,transparent)] pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-brand-primary/20 rounded-full blur-[120px] -z-10 animate-pulse-slow" />
      <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-brand-highlight/15 rounded-full blur-[150px] -z-10" />

      {/* Botón de volver flotante */}
      <div className="absolute top-6 left-6 z-20">
        <Link href="/">
          <Button variant="ghost" className="rounded-full text-muted-foreground hover:text-brand-primary hover:bg-brand-primary/5 transition-all">
            <ArrowLeft className="mr-2 h-4 w-4" /> Volver al inicio
          </Button>
        </Link>
      </div>

      <div className="w-full max-w-[420px] space-y-8 relative z-10 animate-fade-in-down">
        
        {/* Encabezado del Login */}
        <div className="text-center space-y-3">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-primary to-brand-highlight shadow-xl shadow-brand-primary/20 hover:scale-105 transition-transform duration-300">
            <GraduationCap className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Bienvenido de nuevo
          </h1>
          <p className="text-sm text-muted-foreground font-medium">
            Ingresa a tu plataforma educativa
          </p>
        </div>

        {/* Tarjeta Glassmorphism */}
        <Card className="border-border/40 bg-white/80 dark:bg-black/60 backdrop-blur-xl shadow-2xl shadow-brand-primary/10 rounded-3xl overflow-hidden">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl text-center">Iniciar Sesión</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Alerta de Error Animada */}
              {error && (
                <Alert variant="destructive" className="animate-fade-in bg-destructive/10 border-destructive/20 text-destructive rounded-xl">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="font-medium text-sm">{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground/80 font-semibold ml-1">Correo electrónico</Label>
                <div className="relative group">
                  <Mail className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground group-focus-within:text-brand-primary transition-colors" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@correo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 pl-11 rounded-xl bg-white/50 dark:bg-black/50 border-border/50 focus:border-brand-primary focus:ring-brand-primary/20 transition-all"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between ml-1">
                  <Label htmlFor="password" className="text-foreground/80 font-semibold">Contraseña</Label>
                  <Link href="#" className="text-xs font-semibold text-brand-primary hover:text-brand-highlight transition-colors">
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground group-focus-within:text-brand-primary transition-colors" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 pl-11 pr-11 rounded-xl bg-white/50 dark:bg-black/50 border-border/50 focus:border-brand-primary focus:ring-brand-primary/20 transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-brand-primary transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 rounded-xl bg-brand-primary hover:bg-brand-primary-dark text-white font-bold shadow-lg shadow-brand-primary/25 transition-all hover:scale-[1.02]" 
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Ingresando...
                  </span>
                ) : (
                  'Entrar a la plataforma'
                )}
              </Button>
            </form>

            {/* Zona de Demostración (Chips) */}
            <div className="mt-8 relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border/50" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground font-semibold rounded-full border border-border/50">
                  Accesos de prueba
                </span>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-3">
              <Button
                type="button"
                variant="outline"
                className="h-auto py-2 flex flex-col items-center gap-1 rounded-xl border-brand-primary/20 hover:bg-brand-primary/5 hover:border-brand-primary/40 transition-all"
                onClick={() => quickLogin('admin@iud.edu.mx')}
                disabled={loading}
              >
                <span className="text-[10px] uppercase text-muted-foreground">Admin</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-auto py-2 flex flex-col items-center gap-1 rounded-xl border-brand-primary/20 hover:bg-brand-primary/5 hover:border-brand-primary/40 transition-all"
                onClick={() => quickLogin('mariana.lopez@iud.edu.mx')}
                disabled={loading}
              >
                <span className="text-[10px] uppercase text-muted-foreground">Maestro</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-auto py-2 flex flex-col items-center gap-1 rounded-xl border-brand-primary/20 hover:bg-brand-primary/5 hover:border-brand-primary/40 transition-all"
                onClick={() => quickLogin('ana.martinez@iud.edu.mx')}
                disabled={loading}
              >
                <span className="text-[10px] uppercase text-muted-foreground">Alumno</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}