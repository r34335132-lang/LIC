import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { BookOpen, Users, Laptop, Award, ArrowRight, Sparkles } from 'lucide-react'

export function Hero() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-background bg-grid-subtle flex items-center py-20 md:py-32">
      {/* Elementos decorativos de fondo (Esferas de luz)
        Usamos los colores brand-primary (Azul) y brand-highlight (Cian)
      */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-[10%] top-[10%] h-[500px] w-[500px] rounded-full bg-brand-primary/15 blur-[120px] animate-pulse" />
        <div className="absolute right-[10%] bottom-[10%] h-[600px] w-[600px] rounded-full bg-brand-highlight/10 blur-[150px]" />
      </div>

      <div className="container relative z-10 px-4 md:px-6 mx-auto">
        <div className="mx-auto max-w-5xl text-center">
          
          {/* Badge Animado */}
          <div className="animate-fade-in-down [animation-fill-mode:backwards] mb-8 inline-flex items-center gap-2 rounded-full border border-brand-primary/30 bg-brand-primary/10 px-5 py-2 text-sm font-medium text-brand-primary backdrop-blur-md shadow-[0_0_15px_rgba(10,77,204,0.15)]">
            <Sparkles className="h-4 w-4 text-brand-highlight" />
            <span>Educación de excelencia con horarios flexibles</span>
          </div>

          {/* Título Principal de Alto Impacto */}
          <h1 className="animate-fade-in-down [animation-delay:200ms] [animation-fill-mode:backwards] mb-8 text-balance text-5xl font-extrabold tracking-tight text-foreground md:text-6xl lg:text-7xl leading-[1.1]">
            Estudia tu preparatoria, licenciatura o maestría con{' '}
            <span className="text-gradient-brand">
              horarios flexibles
            </span>
          </h1>

          {/* Subtítulo Elegante */}
          <p className="animate-fade-in [animation-delay:400ms] [animation-fill-mode:backwards] mx-auto mb-12 max-w-2xl text-pretty text-lg md:text-xl text-muted-foreground font-light leading-relaxed">
            Formación académica virtual diseñada para estudiantes que buscan avanzar a su ritmo,
            con acompañamiento docente de élite, clases interactivas y una plataforma vanguardista.
          </p>

          {/* Botones de Acción (CTAs) Mejorados */}
          <div className="animate-fade-in [animation-delay:600ms] [animation-fill-mode:backwards] flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="#oferta" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto rounded-full px-8 bg-brand-primary hover:bg-brand-primary/90 text-white shadow-lg shadow-brand-primary/30 transition-all hover:scale-105 hover:shadow-brand-primary/50 text-base h-14">
                Ver oferta académica
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            
            <Link href="/login" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto rounded-full px-8 border-brand-primary/20 hover:bg-brand-primary/5 hover:text-brand-primary transition-all text-base h-14 backdrop-blur-sm">
                Iniciar sesión
              </Button>
            </Link>
            
            <Link href="#contacto" className="w-full sm:w-auto">
              <Button variant="ghost" size="lg" className="w-full sm:w-auto rounded-full px-8 hover:bg-brand-highlight/10 hover:text-brand-primary transition-all text-base h-14">
                Solicitar información
              </Button>
            </Link>
          </div>

          {/* Tarjetas de Estadísticas (Efecto Glassmorphism)
            Aparecen flotando desde abajo
          */}
          <div className="animate-slide-in-up [animation-delay:800ms] [animation-fill-mode:backwards] mt-24 grid grid-cols-2 gap-4 md:gap-8 md:grid-cols-4">
            
            <div className="group relative overflow-hidden rounded-2xl border border-white/20 bg-white/40 dark:bg-black/20 dark:border-white/10 p-6 backdrop-blur-lg shadow-xl shadow-black/5 hover:-translate-y-2 transition-all duration-300">
              <div className="mb-4 mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-primary/20 to-brand-highlight/20 group-hover:scale-110 transition-transform">
                <Users className="h-7 w-7 text-brand-primary" />
              </div>
              <p className="text-3xl font-black text-foreground mb-1">500+</p>
              <p className="text-sm font-medium text-muted-foreground">Estudiantes activos</p>
            </div>

            <div className="group relative overflow-hidden rounded-2xl border border-white/20 bg-white/40 dark:bg-black/20 dark:border-white/10 p-6 backdrop-blur-lg shadow-xl shadow-black/5 hover:-translate-y-2 transition-all duration-300">
              <div className="mb-4 mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-primary/20 to-brand-highlight/20 group-hover:scale-110 transition-transform">
                <BookOpen className="h-7 w-7 text-brand-highlight" />
              </div>
              <p className="text-3xl font-black text-foreground mb-1">10+</p>
              <p className="text-sm font-medium text-muted-foreground">Programas</p>
            </div>

            <div className="group relative overflow-hidden rounded-2xl border border-white/20 bg-white/40 dark:bg-black/20 dark:border-white/10 p-6 backdrop-blur-lg shadow-xl shadow-black/5 hover:-translate-y-2 transition-all duration-300">
              <div className="mb-4 mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-primary/20 to-brand-highlight/20 group-hover:scale-110 transition-transform">
                <Laptop className="h-7 w-7 text-brand-primary" />
              </div>
              <p className="text-3xl font-black text-foreground mb-1">100%</p>
              <p className="text-sm font-medium text-muted-foreground">Virtual</p>
            </div>

            <div className="group relative overflow-hidden rounded-2xl border border-white/20 bg-white/40 dark:bg-black/20 dark:border-white/10 p-6 backdrop-blur-lg shadow-xl shadow-black/5 hover:-translate-y-2 transition-all duration-300">
              <div className="mb-4 mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-primary/20 to-brand-highlight/20 group-hover:scale-110 transition-transform">
                <Award className="h-7 w-7 text-brand-highlight" />
              </div>
              <p className="text-3xl font-black text-foreground mb-1">15+</p>
              <p className="text-sm font-medium text-muted-foreground">Años de experiencia</p>
            </div>

          </div>
        </div>
      </div>
    </section>
  )
}