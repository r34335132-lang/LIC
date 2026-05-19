import { notFound } from 'next/navigation'
import Link from 'next/link'
import { programas } from '@/lib/data'
import { getProgramaIcono } from '@/lib/icons'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ArrowRight, CheckCircle2, Clock, ShieldCheck, Briefcase, HelpCircle, GraduationCap, Target, Zap } from 'lucide-react'

// IMPORTAMOS EL HEADER Y EL FOOTER
import { Header } from '@/components/landing/header'
import { Footer } from '@/components/landing/footer'

// 1. GENERACIÓN DE RUTAS ESTÁTICAS
export function generateStaticParams() {
  return programas.map((programa) => ({
    id: programa.id,
  }))
}

// 2. MAGIA SEO: Generación de Metadatos
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const programa = programas.find((p) => p.id === id)

  if (!programa) return { title: 'Programa no encontrado' }

  return {
    title: `Estudia ${programa.nombre} en Línea | Validez Oficial SEP`,
    description: programa.descripcion,
    openGraph: {
      title: `${programa.nombre} | 100% Online`,
      description: programa.descripcion,
      images: [programa.imagen || '/placeholder.jpg'],
    }
  }
}

export default async function ProgramaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const programa = programas.find((p) => p.id === id)

  if (!programa) {
    notFound()
  }

  const Icon = getProgramaIcono(programa.id)
  const planEstudios = programa.planEstudios || []
  const campoLaboral = programa.campoLaboral || []
  const perfilEgreso = programa.perfilEgreso || []
  const faqs = programa.preguntasFrecuentes || []

  return (
    <>
      <Header />

      <main className="min-h-screen bg-slate-50 dark:bg-zinc-950 selection:bg-brand-primary selection:text-white">
        
        {/* ================= 1. HERO SECTION (ADAPTATIVA Y OPTIMIZADA) ================= */}
        {/* Ajustamos el padding móvil pt-32 pb-20 y desktop pt-48 pb-32 */}
        <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 lg:pt-48 lg:pb-32 overflow-hidden bg-black animate-in fade-in duration-1000">
          
          <div className="absolute inset-0 z-0">
            <img 
              src={programa.imagen || "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=2070&auto=format&fit=crop"} 
              alt={programa.nombre} 
              className="object-cover w-full h-full opacity-40"
            />
            {/* Overlay reforzado en móvil para asegurar legibilidad */}
            <div className="absolute inset-0 bg-black/60 md:bg-black/40" />
            <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/80 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-50 dark:from-zinc-950 to-transparent" />
          </div>

          <div className="container relative z-10 px-4 md:px-6 mx-auto">
            <div className="max-w-4xl animate-in slide-in-from-bottom-8 duration-1000 delay-150 fill-mode-both">
              
              {/* Badges Flexibles */}
              <div className="mb-6 flex flex-wrap items-center gap-3">
                <div className="flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-xl bg-brand-primary border border-white/20 text-white shadow-2xl">
                  <Icon className="h-6 w-6 sm:h-8 sm:w-8" />
                </div>
                <Badge className="bg-brand-primary text-white border-0 font-bold px-3 py-1.5 text-[10px] sm:text-xs uppercase tracking-widest shadow-md">
                  {programa.tipo} 100% Online
                </Badge>
                <Badge variant="outline" className="bg-black/50 backdrop-blur-md text-white border-white/30 font-bold px-3 py-1.5 text-[10px] sm:text-xs uppercase tracking-widest gap-1.5 truncate max-w-[160px] sm:max-w-none">
                  <ShieldCheck className="h-3.5 w-3.5 text-brand-primary shrink-0" />
                  {programa.rvoe ? `RVOE: ${programa.rvoe}` : 'Validez Oficial SEP'}
                </Badge>
              </div>

              {/* Título adaptivo: text-3xl en móvil, text-6xl en desktop */}
              <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.15] mb-4 sm:mb-6 drop-shadow-2xl uppercase">
                {programa.nombre}
              </h1>
              
              <p className="text-base sm:text-xl md:text-2xl text-slate-200 font-medium leading-relaxed max-w-3xl mb-8 sm:mb-12 drop-shadow-md">
                {programa.descripcion}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 px-1 sm:px-0">
                <Button size="lg" className="w-full sm:w-auto rounded-full px-8 bg-brand-primary hover:bg-brand-highlight text-white transition-all duration-300 text-base sm:text-lg h-14 sm:h-16 font-bold uppercase tracking-wider shadow-2xl hover:scale-105" asChild>
                  <Link href="/inscripcion">
                    Iniciar mi Inscripción <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* ================= CONTENIDO PRINCIPAL Y SIDEBAR DE VENTAS ================= */}
        {/* Cambiamos py-24 por py-12 en celular para evitar excesivos espacios en blanco */}
        <div className="container px-4 md:px-6 mx-auto py-12 md:py-24 relative z-20">
          {/* Layout: Flex-col en móvil, Grid de 3 columnas en Desktop */}
          <div className="flex flex-col lg:grid lg:grid-cols-3 gap-12 lg:gap-16 relative">
            
            {/* COLUMNA IZQUIERDA: ARGUMENTOS DE VENTA */}
            <div className="w-full lg:col-span-2 space-y-16 md:space-y-24 order-1">
              
              {/* Sección: ¿Por qué estudiar con nosotros? */}
              <section className="animate-in slide-in-from-bottom-12 duration-1000 delay-300 fill-mode-both">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-slate-900 text-white dark:bg-white dark:text-black font-bold text-[10px] md:text-xs uppercase tracking-widest mb-4 rounded-full shadow-sm">
                  <Target className="h-3.5 w-3.5 text-brand-primary" /> Visión del Programa
                </div>
                <h2 className="text-2xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white mb-4 md:mb-6 leading-[1.2] uppercase">
                  ¿Por qué elegir <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-highlight block sm:inline">este programa?</span>
                </h2>
                <p className="text-base md:text-xl text-slate-600 dark:text-zinc-400 leading-relaxed font-medium">
                  {programa.porQueEstudiar || "Formamos profesionales altamente capacitados para enfrentar los retos del mundo actual mediante un programa innovador y práctico."}
                </p>
              </section>

              {/* Sección: Campo Laboral y Perfil de Egreso (Grid adaptativo) */}
              <section className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
                {campoLaboral.length > 0 && (
                  <div className="bg-white dark:bg-zinc-900 p-6 md:p-8 rounded-[2rem] border border-slate-200 dark:border-zinc-800 shadow-xl shadow-slate-200/50 dark:shadow-none hover:-translate-y-1 transition-transform duration-300">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="p-2.5 bg-brand-primary/10 rounded-xl text-brand-primary">
                        <Briefcase className="h-5 w-5" />
                      </div>
                      <h3 className="text-lg md:text-xl font-bold uppercase tracking-tight text-slate-900 dark:text-white">Campo Laboral</h3>
                    </div>
                    <ul className="space-y-3.5">
                      {campoLaboral.map((item, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <CheckCircle2 className="h-4 w-4 text-brand-primary shrink-0 mt-1" />
                          <span className="text-slate-600 dark:text-zinc-400 font-semibold leading-snug text-sm md:text-base">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {perfilEgreso.length > 0 && (
                  <div className="bg-slate-900 dark:bg-zinc-950 p-6 md:p-8 rounded-[2rem] border border-slate-800 shadow-xl hover:-translate-y-1 transition-transform duration-300">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="p-2.5 bg-white/10 rounded-xl text-brand-highlight">
                        <GraduationCap className="h-5 w-5" />
                      </div>
                      <h3 className="text-lg md:text-xl font-bold uppercase tracking-tight text-white">Perfil de Egreso</h3>
                    </div>
                    <ul className="space-y-3.5">
                      {perfilEgreso.map((item, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <Zap className="h-4 w-4 text-brand-highlight shrink-0 mt-1" />
                          <span className="text-slate-300 font-semibold leading-snug text-sm md:text-base">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </section>

              {/* Sección: Plan de Estudios */}
              {planEstudios.length > 0 && (
                <section>
                  <div className="mb-8 md:mb-10">
                    <h2 className="text-2xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-3 uppercase">
                      Tu Mapa <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-highlight">Curricular</span>
                    </h2>
                    <p className="text-sm md:text-lg text-slate-600 dark:text-zinc-400 font-medium">
                      Materias diseñadas estratégicamente para que adquieras competencias reales y de alta demanda.
                    </p>
                  </div>

                  <Accordion type="single" collapsible className="w-full space-y-3">
                    {planEstudios.map((plan: any, index: number) => (
                      <AccordionItem key={index} value={`item-${index}`} className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl px-4 sm:px-6 shadow-sm overflow-hidden data-[state=open]:border-brand-primary/50 transition-colors">
                        <AccordionTrigger className="text-base sm:text-xl font-bold hover:text-brand-primary hover:no-underline py-5 uppercase tracking-tight text-left">
                          <div className="flex items-center gap-3 sm:gap-4">
                            <span className="flex items-center justify-center h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-slate-100 dark:bg-zinc-800 text-brand-primary text-xs sm:text-sm font-black shrink-0">
                              {index + 1}
                            </span>
                            {plan.semestre}
                          </div>
                        </AccordionTrigger>
                        {/* Corrección Móvil: quitamos el ml-14 excesivo y pusimos ml-4 para dar espacio al texto */}
                        <AccordionContent className="pb-5">
                          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 ml-4 md:ml-14">
                            {plan.materias.map((materia: string, idx: number) => (
                              <li key={idx} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-zinc-950 rounded-xl border border-slate-100 dark:border-zinc-800">
                                <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-primary" />
                                <span className="text-slate-700 dark:text-zinc-300 font-semibold text-xs sm:text-sm">{materia}</span>
                              </li>
                            ))}
                          </ul>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </section>
              )}

            </div>

            {/* ================= COLUMNA DERECHA: SIDEBAR DE CONVERSIÓN ================= */}
            {/* En móvil se posiciona de manera orgánica en el flujo gracias al flex-col, en desktop es sticky */}
            <div className="w-full lg:col-span-1 order-2">
              <div className="lg:sticky lg:top-32 bg-white dark:bg-zinc-900 rounded-[2rem] border border-slate-200 dark:border-zinc-800 shadow-2xl p-6 sm:p-8 overflow-hidden animate-in fade-in slide-in-from-right-8 duration-1000 delay-500">
                
                {/* Deco blur */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-brand-primary/10 rounded-full blur-3xl pointer-events-none" />

                <div className="mb-6 text-center relative z-10">
                  <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20 border-0 font-bold px-3.5 py-1 text-[10px] uppercase tracking-widest mb-3.5 rounded-full">
                    Inscripciones Abiertas
                  </Badge>
                  <h3 className="text-xl sm:text-2xl font-black uppercase text-slate-900 dark:text-white tracking-tight">Resumen de Inversión</h3>
                </div>
                
                <div className="space-y-5 mb-6 relative z-10">
                  <div className="flex justify-between items-end border-b border-slate-100 dark:border-zinc-800 pb-3.5">
                    <span className="text-slate-500 dark:text-zinc-400 font-semibold text-sm">Inscripción</span>
                    <div className="text-right">
                      <span className="line-through text-[10px] text-slate-400 block">$1,500 MXN</span>
                      <span className="font-black text-green-500 text-xs uppercase tracking-wider">Gratis Hoy</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center border-b border-slate-100 dark:border-zinc-800 pb-3.5">
                    <span className="text-slate-500 dark:text-zinc-400 font-semibold text-sm">Colegiatura Mensual</span>
                    <span className="font-black text-xl text-slate-900 dark:text-white">$600 <span className="text-xs text-slate-500 font-normal">MXN</span></span>
                  </div>
                  
                  <div className="flex justify-between items-center border-b border-slate-100 dark:border-zinc-800 pb-3.5">
                    <span className="text-slate-500 dark:text-zinc-400 font-semibold text-sm">Duración Total</span>
                    <div className="flex items-center gap-1.5 font-bold text-sm text-slate-900 dark:text-white">
                      <Clock className="h-4 w-4 text-brand-primary" /> {programa.duracion}
                    </div>
                  </div>
                </div>

                <div className="space-y-3.5 relative z-10">
                  <Button className="w-full rounded-xl bg-brand-primary hover:bg-brand-highlight text-white h-14 font-black uppercase tracking-widest text-xs sm:text-sm shadow-xl hover:scale-[1.02] transition-all duration-300" asChild>
                    <Link href="/inscripcion">
                      Asegurar mi Lugar
                    </Link>
                  </Button>
                  <p className="text-center text-[11px] text-slate-500 dark:text-zinc-500 font-medium">
                    Proceso 100% en línea. Sin trámites complejos.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ================= PREGUNTAS FRECUENTES ================= */}
        {faqs.length > 0 && (
          <section className="py-16 md:py-24 bg-slate-900 dark:bg-black text-white border-t border-slate-800">
            <div className="container px-4 md:px-6 mx-auto max-w-4xl">
              <div className="text-center mb-12 md:mb-16">
                <div className="inline-flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-white/10 mb-4">
                  <HelpCircle className="h-6 w-6 sm:h-8 sm:w-8 text-brand-primary" />
                </div>
                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight">Preguntas Frecuentes</h2>
                <p className="text-slate-400 font-medium text-sm sm:text-lg mt-3 max-w-2xl mx-auto px-2">Resolvemos tus dudas para que tomes la decisión con total seguridad.</p>
              </div>
              
              <Accordion type="single" collapsible className="w-full space-y-3 px-1">
                {faqs.map((faq: any, idx: number) => (
                  <AccordionItem key={idx} value={`faq-${idx}`} className="border border-slate-800 bg-slate-950/50 rounded-2xl px-4 sm:px-6 data-[state=open]:bg-slate-800 transition-colors">
                    <AccordionTrigger className="text-base sm:text-lg font-bold text-left py-5 hover:text-brand-primary hover:no-underline leading-snug">
                      {faq.pregunta}
                    </AccordionTrigger>
                    <AccordionContent className="text-slate-400 text-sm sm:text-base leading-relaxed pb-5">
                      {faq.respuesta}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </section>
        )}

        {/* ================= CTA FINAL BOTTOM ================= */}
        <section className="py-20 md:py-32 relative overflow-hidden bg-brand-primary text-white text-center px-4">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1)_0,transparent_100%)] pointer-events-none" />
          <div className="container relative z-10 px-4 mx-auto max-w-3xl">
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight mb-4 drop-shadow-md uppercase leading-tight">
              ¿Listo para transformar tu futuro?
            </h2>
            <p className="text-base sm:text-xl font-medium mb-8 sm:mb-12 opacity-90 max-w-2xl mx-auto leading-relaxed">
              No dejes pasar más tiempo. Únete a miles de alumnos que ya están construyendo su éxito profesional con nosotros.
            </p>
            <Button size="lg" className="w-full sm:w-auto rounded-full px-10 bg-white text-brand-primary hover:bg-slate-100 hover:scale-105 transition-all duration-300 h-14 sm:h-16 font-black uppercase tracking-widest shadow-2xl text-base" asChild>
              <Link href="/inscripcion">
                Comenzar Ahora Mismo
              </Link>
            </Button>
          </div>
        </section>

      </main>

      <Footer />
    </>
  )
}