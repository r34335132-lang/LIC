'use client'

import { Suspense, useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { GraduationCap, Mail, Lock, Eye, EyeOff, AlertCircle, ArrowLeft, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAuth, getRedirectPath } from '@/lib/auth-context'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [typedText, setTypedText] = useState('')
  const phrase = 'LOGRA TU FUTURO HOY.'

  const { login, isAuthenticated, perfil, loading: authLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect')

  useEffect(() => {
    if (!authLoading && isAuthenticated && perfil) {
      router.push(redirect ?? getRedirectPath(perfil.rol))
    }
  }, [authLoading, isAuthenticated, perfil, router, redirect])

  useEffect(() => {
    let currentText = ''
    let currentIndex = 0
    const startTimeout = setTimeout(() => {
      const interval = setInterval(() => {
        if (currentIndex < phrase.length) {
          currentText += phrase[currentIndex]
          setTypedText(currentText)
          currentIndex++
        } else {
          clearInterval(interval)
        }
      }, 100)
      return () => clearInterval(interval)
    }, 500)
    return () => clearTimeout(startTimeout)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await login(email, password)
      if (result.success && result.rol) {
        router.push(redirect ?? getRedirectPath(result.rol))
      } else {
        setError(result.error ?? 'Credenciales incorrectas.')
        setLoading(false)
      }
    } catch {
      setError('Error de conexión al iniciar sesión.')
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full bg-white dark:bg-black">
      <div className="hidden lg:flex relative w-1/2 flex-col justify-between overflow-hidden bg-black text-white p-12">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?q=80&w=2070&auto=format&fit=crop"
            alt="Campus universitario"
            className="object-cover w-full h-full opacity-60 mix-blend-luminosity"
          />
          <div className="absolute inset-0 bg-brand-primary/40 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent" />
        </div>

        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-brand-primary shadow-2xl">
              <GraduationCap className="h-7 w-7" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black leading-tight uppercase">Instituto Univ.</span>
              <span className="text-xs font-bold text-brand-highlight uppercase tracking-widest">de Durango</span>
            </div>
          </Link>
        </div>

        <div className="relative z-10 max-w-lg mt-auto pb-12">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-md px-4 py-1.5 border border-white/30">
            <ShieldCheck className="h-4 w-4 text-brand-highlight" />
            <span className="text-xs font-bold uppercase tracking-widest">Plataforma Segura</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-[1.2] mb-6 min-h-[120px]">
            <span className="block mb-2 text-white/90">TU CAMPUS VIRTUAL</span>
            <span className="text-brand-highlight flex items-center">
              {typedText}
              <span className="ml-1 w-[4px] h-10 bg-brand-highlight animate-pulse" />
            </span>
          </h2>
          <p className="text-lg text-gray-300 font-medium leading-relaxed">
            Accede a tus clases, consulta tus calificaciones y mantente conectado con tu comunidad académica.
          </p>
        </div>
      </div>

      <div className="flex w-full lg:w-1/2 flex-col relative bg-gray-50 dark:bg-black/95 z-10">
        <div className="absolute top-6 left-6 sm:top-8 sm:left-8 z-20">
          <Button variant="ghost" className="rounded-full" asChild>
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" /> Volver al inicio
            </Link>
          </Button>
        </div>

        <div className="flex-1 flex flex-col justify-center px-6 py-12 sm:px-12 md:px-20 max-w-2xl mx-auto w-full mt-10 lg:mt-0">
          <div className="mb-10">
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight uppercase mb-2">Iniciar Sesión</h1>
            <p className="text-muted-foreground font-medium">Ingresa tus credenciales institucionales.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive" className="rounded-none border-l-4">
                <AlertCircle className="h-5 w-5" />
                <AlertDescription className="font-bold text-sm ml-2">{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="font-bold uppercase tracking-wider text-xs">Correo Electrónico</Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-14 pl-12 rounded-none"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="font-bold uppercase tracking-wider text-xs">Contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-14 pl-12 pr-12 rounded-none"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-14 rounded-none bg-brand-primary font-black uppercase tracking-widest"
              disabled={loading}
            >
              {loading ? 'Autenticando...' : 'Acceder al Portal'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}

function LoginFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-primary border-t-transparent" />
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginForm />
    </Suspense>
  )
}
