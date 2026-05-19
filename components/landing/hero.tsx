import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, GraduationCap, Tag } from 'lucide-react'

export function Hero() {
  return (
    // Ajuste clave: pt-32 pb-40 para móvil. No tan masivo como en desktop.
    <section className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden pt-32 pb-40 md:pt-40 md:pb-48 lg:pt-48 lg:pb-32">
      
      {/* IMAGEN DE FONDO A PANTALLA COMPLETA */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=2070&auto=format&fit=crop" 
          alt="Campus Universitario" 
          className="object-cover w-full h-full"
        />
        {/* Degradado oscuro para pantallas móviles enteras, y degradado lateral para computadoras */}
        <div className="absolute inset-0 bg-black/60 md:bg-transparent" />
        <div className="absolute inset-0 hidden md:block bg-gradient-to-r from-black/90 via-black/50 to-transparent" />
      </div>

      <div className="container relative z-10 px-4 md:px-6 mx-auto flex flex-col items-center md:items-start text-center md:text-left gap-6 md:gap-8">
        
        {/* Etiqueta Superior */}
        <div className="animate-fade-in-down inline-flex items-center gap-2 rounded-sm bg-brand-primary px-3 py-1 sm:px-4 sm:py-1.5 text-xs sm:text-sm font-bold text-white uppercase tracking-widest shadow-lg">
          <GraduationCap className="h-4 w-4" />
          <span>Ciclo Escolar 2026</span>
        </div>

        {/* Título adaptativo (text-4xl en móvil, text-7xl en tablet, text-8xl en desktop) */}
        <h1 className="animate-fade-in-down [animation-delay:200ms] max-w-4xl text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-black tracking-tighter text-white leading-[1.1] drop-shadow-xl">
          PREPÁRATE PARA <br className="hidden sm:block" />
          <span className="text-brand-primary drop-shadow-md"> DOMINAR TU FUTURO</span>
        </h1>

        {/* ================= BLOQUE DE PROMOCIÓN MOBILE-FRIENDLY ================= */}
        <div className="animate-fade-in [animation-delay:400ms] relative border-l-4 border-brand-primary bg-black/50 backdrop-blur-md p-4 sm:p-6 shadow-2xl w-full max-w-sm sm:max-w-2xl text-left mt-2">
          <div className="absolute -top-3 -right-2 sm:-right-3 bg-brand-highlight text-black font-black text-[10px] sm:text-xs uppercase px-2 py-1 shadow-lg transform rotate-3">
            Tiempo Limitado
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8">
            <div className="flex-1">
              <span className="flex items-center gap-2 text-brand-primary font-bold text-xs sm:text-sm uppercase tracking-wider mb-1">
                <Tag className="h-3 w-3 sm:h-4 sm:w-4" /> Beca de Ingreso
              </span>
              <span className="text-white text-2xl sm:text-3xl font-black block leading-none mt-1">
                INSCRIPCIÓN <span className="text-brand-primary">GRATIS</span>
              </span>
            </div>
            
            <div className="hidden sm:block w-px h-16 bg-white/30"></div>
            <div className="block sm:hidden w-full h-px bg-white/20 my-1"></div>
            
            <div className="flex-1">
              <span className="block text-gray-200 font-medium text-xs sm:text-sm mb-1 uppercase tracking-wider">
                Mensualidad desde
              </span>
              <span className="text-white text-3xl sm:text-4xl font-black leading-none block">
                $600 <span className="text-sm sm:text-base font-normal text-gray-300">MXN</span>
              </span>
            </div>
          </div>
        </div>

        {/* Subtítulo */}
        <p className="animate-fade-in [animation-delay:500ms] max-w-2xl text-base sm:text-lg text-gray-200 font-medium leading-relaxed drop-shadow-md px-2 md:px-0">
          Formación académica de excelencia con validez oficial. Inicia tu carrera profesional hoy mismo sin comprometer tu economía ni tu horario.
        </p>

        {/* Botón de Acción Único Mobile */}
        <div className="animate-fade-in [animation-delay:600ms] w-full sm:w-auto mt-2 px-2 md:px-0">
          <Link href="/inscripcion" className="w-full sm:w-auto inline-block">
            <Button size="lg" className="w-full sm:w-auto rounded-none px-8 sm:px-12 bg-brand-primary hover:bg-white hover:text-black text-white transition-all text-sm sm:text-lg h-14 sm:h-16 font-black uppercase tracking-widest shadow-[0_0_30px_-10px_rgba(var(--brand-primary-rgb),0.6)] hover:scale-105">
              Aprovechar Promoción
              <ArrowRight className="ml-2 sm:ml-3 h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Franja de Estadísticas inferior */}
      <div className="absolute bottom-0 left-0 w-full bg-brand-primary text-white z-20 border-t-4 border-brand-highlight shadow-[0_-10px_30px_rgba(0,0,0,0.3)]">
        <div className="container mx-auto px-2 py-4 sm:py-6 md:py-8">
          {/* En móvil solo muestra 2, en desktop 4 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-center divide-x divide-white/20">
            <div className="flex flex-col items-center justify-center">
              <span className="text-2xl sm:text-3xl md:text-4xl font-black block mb-0.5 sm:mb-1 drop-shadow-sm">+15</span>
              <span className="text-[10px] sm:text-xs md:text-sm font-semibold uppercase tracking-wider opacity-90">Años de Excelencia</span>
            </div>
            <div className="flex flex-col items-center justify-center">
              <span className="text-2xl sm:text-3xl md:text-4xl font-black block mb-0.5 sm:mb-1 drop-shadow-sm">100%</span>
              <span className="text-[10px] sm:text-xs md:text-sm font-semibold uppercase tracking-wider opacity-90">Validez SEP</span>
            </div>
            <div className="flex-col items-center justify-center hidden md:flex">
              <span className="text-3xl md:text-4xl font-black block mb-1 drop-shadow-sm">24/7</span>
              <span className="text-xs md:text-sm font-semibold uppercase tracking-wider opacity-90">Plataforma Virtual</span>
            </div>
            <div className="flex-col items-center justify-center hidden md:flex">
              <span className="text-3xl md:text-4xl font-black block mb-1 drop-shadow-sm">+500</span>
              <span className="text-xs md:text-sm font-semibold uppercase tracking-wider opacity-90">Egresados Exitosos</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}