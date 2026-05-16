import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { BookOpen, Users, Laptop, Award, ArrowRight, Sparkles, Play, CheckCircle } from 'lucide-react'

export function Hero() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-background bg-grid-subtle flex items-center pt-28 pb-20 md:pt-32 md:pb-24">
      {/* Elementos decorativos de fondo (Esferas de luz) */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-[5%] top-[10%] h-[500px] w-[500px] rounded-full bg-brand-primary/15 blur-[120px] animate-pulse" />
        <div className="absolute right-[5%] bottom-[10%] h-[600px] w-[600px] rounded-full bg-brand-highlight/10 blur-[150px]" />
      </div>

      <div className="container relative z-10 px-4 md:px-6 mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          
          {/* ================= COLUMNA IZQUIERDA (TEXTOS Y BOTONES) ================= */}
          <div className="flex flex-col text-center lg:text-left mx-auto max-w-2xl lg:mx-0 lg:max-w-none">
            
            {/* Badge Animado */}
            <div className="animate-fade-in-down [animation-fill-mode:backwards] mb-6 inline-flex items-center gap-2 rounded-full border border-brand-primary/30 bg-brand-primary/10 px-5 py-2 text-sm font-medium text-brand-primary backdrop-blur-md shadow-[0_0_15px_rgba(10,77,204,0.15)] self-center lg:self-start w-fit">
              <Sparkles className="h-4 w-4 text-brand-highlight" />
              <span>Educación de excelencia con horarios flexibles</span>
            </div>

            {/* Título Principal */}
            <h1 className="animate-fade-in-down [animation-delay:200ms] [animation-fill-mode:backwards] mb-6 text-balance text-5xl font-extrabold tracking-tight text-foreground md:text-6xl lg:text-7xl leading-[1.05]">
              Estudia a tu ritmo con{' '}
              <span className="text-gradient-brand block mt-2">
                horarios flexibles
              </span>
            </h1>

            {/* Subtítulo */}
            <p className="animate-fade-in [animation-delay:400ms] [animation-fill-mode:backwards] mb-10 text-pretty text-lg md:text-xl text-muted-foreground font-light leading-relaxed">
              Formación académica virtual diseñada para estudiantes que buscan avanzar sin descuidar su vida. Acompañamiento docente de élite y una plataforma de vanguardia.
            </p>

            {/* Botones de Acción (CTAs) */}
            <div className="animate-fade-in [animation-delay:600ms] [animation-fill-mode:backwards] flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Link href="#oferta" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto rounded-full px-8 bg-brand-primary hover:bg-brand-primary-dark text-white shadow-lg shadow-brand-primary/30 transition-all hover:scale-105 hover:shadow-brand-primary/50 text-base h-14">
                  Ver oferta académica
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              
              <Link href="/login" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full sm:w-auto rounded-full px-8 border-brand-primary/20 hover:bg-brand-primary/5 hover:text-brand-primary transition-all text-base h-14 backdrop-blur-sm">
                  Iniciar sesión
                </Button>
              </Link>
            </div>
          </div>

          {/* ================= COLUMNA DERECHA (IMAGEN/VIDEO VISUAL) ================= */}
          <div className="relative animate-fade-in [animation-delay:800ms] [animation-fill-mode:backwards] mx-auto w-full max-w-lg lg:max-w-none mt-10 lg:mt-0">
            
            {/* Brillo de fondo para la imagen */}
            <div className="absolute inset-0 bg-gradient-to-tr from-brand-primary/30 to-brand-highlight/30 rounded-[3rem] blur-3xl transform rotate-6 scale-105 -z-10" />
            
            {/* Contenedor Principal (Glassmorphism) */}
            <div className="relative rounded-[2.5rem] border border-white/40 dark:border-white/10 bg-white/40 dark:bg-black/40 p-4 backdrop-blur-2xl shadow-2xl shadow-brand-primary/20 group">
              
              {/* Contenedor de la Imagen */}
              <div className="relative aspect-[4/3] md:aspect-video lg:aspect-[4/3] w-full overflow-hidden rounded-[1.5rem] bg-muted">
                
                {/* AQUÍ ESTÁ LA IMAGEN NUEVA */}
                <Image 
                  src="/hero-img.png" 
                  alt="Estudiantes en plataforma virtual" 
                  fill 
                  className="object-cover transition-transform duration-1000 group-hover:scale-110"
                  priority
                />
                
                {/* Capa oscura superpuesta y Botón de Play (Simulando un video) */}
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-500 flex items-center justify-center cursor-pointer">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/20 backdrop-blur-md border border-white/50 shadow-2xl transition-transform duration-300 group-hover:scale-110 group-hover:bg-brand-primary/90 group-hover:border-transparent">
                    <Play className="h-8 w-8 text-white ml-1 group-hover:text-white" fill="currentColor" />
                  </div>
                </div>
              </div>

              {/* Insignia Flotante 1 (Clases en vivo) */}
              <div className="absolute -left-6 lg:-left-12 top-10 rounded-2xl bg-white dark:bg-gray-900 border border-border/50 p-4 shadow-xl shadow-black/5 flex items-center gap-4 transition-transform duration-500 hover:-translate-y-2 cursor-default">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                  <CheckCircle className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">Clases en Vivo</p>
                  <p className="text-xs font-medium text-muted-foreground">Plataforma 24/7</p>
                </div>
              </div>

              {/* Insignia Flotante 2 (Alumnos) */}
              <div className="absolute -right-4 lg:-right-8 bottom-12 rounded-2xl bg-white dark:bg-gray-900 border border-border/50 p-4 shadow-xl shadow-black/5 flex items-center gap-4 transition-transform duration-500 hover:-translate-y-2 cursor-default">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-primary/10">
                  <Users className="h-6 w-6 text-brand-primary" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">+500 Alumnos</p>
                  <p className="text-xs font-medium text-muted-foreground">Activos hoy</p>
                </div>
              </div>
            </div>
          </div>

          {/* ================= FILA INFERIOR (TARJETAS DE ESTADÍSTICAS) ================= */}
          <div className="lg:col-span-2 animate-slide-in-up [animation-delay:1000ms] [animation-fill-mode:backwards] mt-16 grid grid-cols-2 gap-4 md:gap-6 md:grid-cols-4">
            
            <div className="group relative overflow-hidden rounded-2xl border border-border/50 bg-white/60 dark:bg-black/40 p-6 backdrop-blur-lg shadow-lg shadow-black/5 hover:-translate-y-2 transition-all duration-300 hover:border-brand-primary/30">
              <div className="mb-4 mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-brand-primary/10 group-hover:bg-brand-primary transition-colors duration-300">
                <Users className="h-6 w-6 text-brand-primary group-hover:text-white transition-colors" />
              </div>
              <p className="text-3xl font-black text-foreground mb-1 text-center">500+</p>
              <p className="text-sm font-medium text-muted-foreground text-center">Estudiantes</p>
            </div>

            <div className="group relative overflow-hidden rounded-2xl border border-border/50 bg-white/60 dark:bg-black/40 p-6 backdrop-blur-lg shadow-lg shadow-black/5 hover:-translate-y-2 transition-all duration-300 hover:border-brand-primary/30">
              <div className="mb-4 mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-brand-primary/10 group-hover:bg-brand-highlight transition-colors duration-300">
                <BookOpen className="h-6 w-6 text-brand-primary group-hover:text-white transition-colors" />
              </div>
              <p className="text-3xl font-black text-foreground mb-1 text-center">10+</p>
              <p className="text-sm font-medium text-muted-foreground text-center">Programas</p>
            </div>

            <div className="group relative overflow-hidden rounded-2xl border border-border/50 bg-white/60 dark:bg-black/40 p-6 backdrop-blur-lg shadow-lg shadow-black/5 hover:-translate-y-2 transition-all duration-300 hover:border-brand-primary/30">
              <div className="mb-4 mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-brand-primary/10 group-hover:bg-brand-primary transition-colors duration-300">
                <Laptop className="h-6 w-6 text-brand-primary group-hover:text-white transition-colors" />
              </div>
              <p className="text-3xl font-black text-foreground mb-1 text-center">100%</p>
              <p className="text-sm font-medium text-muted-foreground text-center">Virtual</p>
            </div>

            <div className="group relative overflow-hidden rounded-2xl border border-border/50 bg-white/60 dark:bg-black/40 p-6 backdrop-blur-lg shadow-lg shadow-black/5 hover:-translate-y-2 transition-all duration-300 hover:border-brand-primary/30">
              <div className="mb-4 mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-brand-primary/10 group-hover:bg-brand-highlight transition-colors duration-300">
                <Award className="h-6 w-6 text-brand-primary group-hover:text-white transition-colors" />
              </div>
              <p className="text-3xl font-black text-foreground mb-1 text-center">15+</p>
              <p className="text-sm font-medium text-muted-foreground text-center">Años de exp.</p>
            </div>

          </div>
        </div>
      </div>
    </section>
  )
}