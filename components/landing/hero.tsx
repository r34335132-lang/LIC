import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, GraduationCap, Tag } from 'lucide-react'

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      
      {/* IMAGEN DE FONDO A PANTALLA COMPLETA */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=2070&auto=format&fit=crop" 
          alt="Campus Universitario" 
          /* La imagen ahora está a todo color, sin opacidades que la oscurezcan */
          className="object-cover w-full h-full"
        />
        {/* Degradado muy sutil solo a la izquierda para que el texto blanco se pueda leer, el resto de la imagen queda intacta */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/20 to-transparent" />
      </div>

      <div className="container relative z-10 px-4 md:px-6 mx-auto flex flex-col items-center md:items-start text-center md:text-left mt-10">
        
        {/* Etiqueta Superior */}
        <div className="animate-fade-in-down mb-6 inline-flex items-center gap-2 rounded-sm bg-brand-primary px-4 py-1.5 text-sm font-bold text-white uppercase tracking-widest shadow-lg">
          <GraduationCap className="h-4 w-4" />
          <span>Ciclo Escolar 2026</span>
        </div>

        {/* Título Masivo (Con sombra de texto para resaltar sobre la imagen clara) */}
        <h1 className="animate-fade-in-down [animation-delay:200ms] mb-6 max-w-4xl text-5xl font-black tracking-tighter text-white md:text-7xl lg:text-8xl leading-[1.1] drop-shadow-xl">
          PREPÁRATE PARA <br/>
          <span className="text-brand-primary drop-shadow-md">DOMINAR TU FUTURO</span>
        </h1>

        {/* ================= BLOQUE DE PROMOCIÓN ================= */}
        <div className="animate-fade-in [animation-delay:400ms] mb-8 relative border-l-4 border-brand-primary bg-black/40 backdrop-blur-md p-5 sm:p-6 shadow-2xl inline-block max-w-2xl text-left">
          <div className="absolute -top-3 -right-3 bg-brand-highlight text-black font-black text-xs uppercase px-3 py-1 shadow-lg transform rotate-3">
            Tiempo Limitado
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8">
            <div className="flex-1">
              <span className="flex items-center gap-2 text-brand-primary font-bold text-sm uppercase tracking-wider mb-1">
                <Tag className="h-4 w-4" /> Beca de Nuevo Ingreso
              </span>
              <span className="text-white text-3xl font-black block leading-none mt-1">
                INSCRIPCIÓN <span className="text-brand-primary">GRATIS</span>
              </span>
            </div>
            
            <div className="hidden sm:block w-px h-16 bg-white/30"></div>
            <div className="block sm:hidden w-full h-px bg-white/30 my-2"></div>
            
            <div className="flex-1">
              <span className="block text-gray-200 font-medium text-sm mb-1 uppercase tracking-wider">
                1ª Mensualidad desde
              </span>
              <span className="text-white text-4xl font-black leading-none block">
                $600 <span className="text-base font-normal text-gray-300">MXN</span>
              </span>
            </div>
          </div>
        </div>

        {/* Subtítulo */}
        <p className="animate-fade-in [animation-delay:500ms] mb-10 max-w-2xl text-lg text-white font-medium leading-relaxed drop-shadow-md">
          Formación académica de excelencia con validez oficial. Inicia tu carrera profesional hoy mismo sin comprometer tu economía ni tu horario.
        </p>

        {/* Botones de Acción */}
        <div className="animate-fade-in [animation-delay:600ms] flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link href="#oferta" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto rounded-none px-10 bg-brand-primary hover:bg-white hover:text-black text-white transition-colors text-lg h-16 font-bold uppercase tracking-wider shadow-xl">
              Aprovechar Promoción
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          
          <Link href="/login" className="w-full sm:w-auto">
            <Button variant="outline" size="lg" className="w-full sm:w-auto rounded-none px-10 border-2 border-white text-white hover:bg-white hover:text-black transition-colors text-lg h-16 font-bold uppercase tracking-wider bg-black/20 backdrop-blur-sm shadow-xl">
              Iniciar Sesión
            </Button>
          </Link>
        </div>
      </div>

      {/* Franja de Estadísticas inferior */}
      <div className="absolute bottom-0 left-0 w-full bg-brand-primary text-white z-20 border-t-4 border-brand-highlight shadow-[0_-10px_30px_rgba(0,0,0,0.2)]">
        <div className="container mx-auto px-4 py-6 md:py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-x divide-white/20">
            <div className="flex flex-col items-center justify-center">
              <span className="text-3xl md:text-4xl font-black block mb-1 drop-shadow-sm">+15</span>
              <span className="text-xs md:text-sm font-semibold uppercase tracking-wider opacity-90">Años de Excelencia</span>
            </div>
            <div className="flex flex-col items-center justify-center">
              <span className="text-3xl md:text-4xl font-black block mb-1 drop-shadow-sm">100%</span>
              <span className="text-xs md:text-sm font-semibold uppercase tracking-wider opacity-90">Validez Oficial SEP</span>
            </div>
            <div className="flex flex-col items-center justify-center hidden md:flex">
              <span className="text-3xl md:text-4xl font-black block mb-1 drop-shadow-sm">24/7</span>
              <span className="text-xs md:text-sm font-semibold uppercase tracking-wider opacity-90">Plataforma Virtual</span>
            </div>
            <div className="flex flex-col items-center justify-center hidden md:flex">
              <span className="text-3xl md:text-4xl font-black block mb-1 drop-shadow-sm">+500</span>
              <span className="text-xs md:text-sm font-semibold uppercase tracking-wider opacity-90">Egresados Exitosos</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}