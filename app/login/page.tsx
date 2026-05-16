'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { GraduationCap, Mail, Lock, Eye, EyeOff, AlertCircle, ArrowLeft, ShieldCheck } from 'lucide-react'
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
  
  // Estado para el efecto de máquina de escribir
  const [typedText, setTypedText] = useState('')
  const phrase = "LOGRA TU FUTURO HOY."

  const { login } = useAuth()
  const router = useRouter()

  // Efecto de máquina de escribir
  useEffect(() => {
    let currentText = ''
    let currentIndex = 0

    // Pequeño retraso inicial para que la animación empiece justo cuando el usuario presta atención
    const startTimeout = setTimeout(() => {
      const interval = setInterval(() => {
        if (currentIndex < phrase.length) {
          currentText += phrase[currentIndex]
          setTypedText(currentText)
          currentIndex++
        } else {
          clearInterval(interval)
        }
      }, 100) // Velocidad de escritura (100ms por letra)
      
      return () => clearInterval(interval)
    }, 500)

    return () => clearTimeout(startTimeout)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const success = await login(email, password)
      if (success) {
        router.push('/dashboard')
      } else {
        setError('Credenciales incorrectas. Verifica tu correo y contraseña.')
        setLoading(false)
      }
    } catch {
      setError('Error de conexión al iniciar sesión. Intenta de nuevo.')
      setLoading(false)
    }
  }

  // Demo: Login rápido
  const quickLogin = async (targetEmail: string) => {
    setError('')
    setEmail(targetEmail)
    setPassword('demo123')
    setLoading(true)
    
    try {
      const success = await login(targetEmail, 'demo123')
      if (success) {
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
    <div className="flex min-h-screen w-full bg-white dark:bg-black">
      
      {/* ================= MITAD IZQUIERDA: IMAGEN INSTITUCIONAL ================= */}
      <div className="hidden lg:flex relative w-1/2 flex-col justify-between overflow-hidden bg-black text-white p-12">
        {/* Imagen de fondo majestuosa (Biblioteca universitaria clásica) */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?q=80&w=2070&auto=format&fit=crop" 
            alt="Majestuosa biblioteca de campus" 
            className="object-cover w-full h-full opacity-60 mix-blend-luminosity hover:scale-105 transition-transform duration-[20s]"
          />
          {/* Capas de gradiente para hacer que el texto resalte */}
          <div className="absolute inset-0 bg-brand-primary/40 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent" />
        </div>

        {/* Contenido sobre la imagen */}
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-3 transition-transform hover:scale-105">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-brand-primary shadow-2xl">
              <GraduationCap className="h-7 w-7" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black leading-tight tracking-tight uppercase">
                Instituto Univ.
              </span>
              <span className="text-xs font-bold text-brand-highlight uppercase tracking-widest">
                de Durango
              </span>
            </div>
          </Link>
        </div>

        <div className="relative z-10 max-w-lg mt-auto pb-12">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-md px-4 py-1.5 border border-white/30 shadow-xl">
            <ShieldCheck className="h-4 w-4 text-brand-highlight" />
            <span className="text-xs font-bold uppercase tracking-widest">Plataforma Segura</span>
          </div>
          
          {/* Título con efecto Typewriter */}
          <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-[1.2] mb-6 min-h-[120px]">
            <span className="block mb-2 text-white/90">TU CAMPUS VIRTUAL</span>
            <span className="text-brand-highlight flex items-center">
              {typedText}
              {/* El cursor parpadeante (barrita vertical) */}
              <span className="ml-1 w-[4px] h-10 bg-brand-highlight animate-pulse" />
            </span>
          </h2>
          
          <p className="text-lg text-gray-300 font-medium leading-relaxed">
            Accede a tus clases, consulta tus calificaciones y mantente conectado con tu comunidad académica desde cualquier lugar del mundo.
          </p>
        </div>
      </div>

      {/* ================= MITAD DERECHA: FORMULARIO DE ACCESO ================= */}
      <div className="flex w-full lg:w-1/2 flex-col relative bg-gray-50 dark:bg-black/95 shadow-[-20px_0_40px_rgba(0,0,0,0.1)] z-10">
        
        {/* Botón Volver */}
        <div className="absolute top-6 left-6 sm:top-8 sm:left-8 z-20">
          <Button variant="ghost" className="rounded-full text-muted-foreground hover:text-brand-primary hover:bg-brand-primary/5 transition-all font-semibold" asChild>
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" /> Volver al inicio
            </Link>
          </Button>
        </div>

        {/* Contenedor del Formulario centrado */}
        <div className="flex-1 flex flex-col justify-center px-6 py-12 sm:px-12 md:px-20 max-w-2xl mx-auto w-full mt-10 lg:mt-0">
          
          {/* Encabezado del Formulario */}
          <div className="mb-10 text-left">
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground uppercase mb-2">
              Iniciar Sesión
            </h1>
            <p className="text-muted-foreground font-medium text-base">
              Ingresa tus credenciales institucionales para continuar.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Alerta de Error */}
            {error && (
              <Alert variant="destructive" className="animate-fade-in bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 rounded-none border-l-4">
                <AlertCircle className="h-5 w-5" />
                <AlertDescription className="font-bold text-sm ml-2">{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground font-bold uppercase tracking-wider text-xs">Correo Electrónico</Label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground group-focus-within:text-brand-primary transition-colors" />
                <Input
                  id="email"
                  type="email"
                  placeholder="matricula@iud.edu.mx"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-14 pl-12 rounded-none bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-800 focus:border-brand-primary focus:ring-brand-primary/20 transition-all text-base shadow-sm"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-foreground font-bold uppercase tracking-wider text-xs">Contraseña</Label>
                <Link href="#" className="text-xs font-bold text-brand-primary hover:text-brand-primary/80 transition-colors">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground group-focus-within:text-brand-primary transition-colors" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-14 pl-12 pr-12 rounded-none bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-800 focus:border-brand-primary focus:ring-brand-primary/20 transition-all text-base shadow-sm"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-brand-primary transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-14 rounded-none bg-brand-primary hover:bg-black dark:hover:bg-white dark:hover:text-black text-white font-black uppercase tracking-widest transition-all text-base mt-4 shadow-lg shadow-brand-primary/20 hover:scale-[1.01]" 
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Autenticando...
                </span>
              ) : (
                'Acceder al Portal'
              )}
            </Button>
          </form>

          {/* ================= ZONA DE DEMOSTRACIÓN (ACCESOS RÁPIDOS) ================= */}
          <div className="mt-12 pt-8 border-t border-border/50">
            <div className="mb-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Entorno de Pruebas</h4>
              <p className="text-sm text-foreground/80 font-medium">Inicia sesión rápidamente con perfiles pre-configurados:</p>
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              <Button
                type="button"
                variant="outline"
                className="h-auto py-3 flex flex-col items-center gap-1 rounded-lg border-gray-300 dark:border-gray-800 hover:border-brand-primary hover:bg-brand-primary/5 hover:text-brand-primary transition-all bg-white dark:bg-black"
                onClick={() => quickLogin('admin@iud.edu.mx')}
                disabled={loading}
              >
                <span className="font-bold text-xs uppercase tracking-wider">Admin</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-auto py-3 flex flex-col items-center gap-1 rounded-lg border-gray-300 dark:border-gray-800 hover:border-brand-primary hover:bg-brand-primary/5 hover:text-brand-primary transition-all bg-white dark:bg-black"
                onClick={() => quickLogin('mariana.lopez@iud.edu.mx')}
                disabled={loading}
              >
                <span className="font-bold text-xs uppercase tracking-wider">Maestro</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-auto py-3 flex flex-col items-center gap-1 rounded-lg border-gray-300 dark:border-gray-800 hover:border-brand-primary hover:bg-brand-primary/5 hover:text-brand-primary transition-all bg-white dark:bg-black"
                onClick={() => quickLogin('ana.martinez@iud.edu.mx')}
                disabled={loading}
              >
                <span className="font-bold text-xs uppercase tracking-wider">Alumno</span>
              </Button>
            </div>
          </div>

        </div>
      </div>

    </div>
  )
}