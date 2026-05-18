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

      {/* Se quitó el pt-20 aquí para que la imagen pegue hasta arriba del navegador */}
      <main className="min-h-screen bg-slate-50 dark:bg-zinc-950 selection:bg-brand-primary selection:text-white">
        
        {/* ================= 1. HERO SECTION (CON IMAGEN) ================= */}
        {/* Compensamos el header transparente con padding interno (pt-32) */}
        <section className="relative pt-32 pb-24 lg:pt-48 lg:pb-32 overflow-hidden bg-black animate-in fade-in duration-1000">
          
          <div className="absolute inset-0 z-0">
            {/* Imagen de fondo del programa */}
            <img 
              src={programa.imagen || "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=2070&auto=format&fit=crop"} 
              alt={programa.nombre} 
              className="object-cover w-full h-full opacity-50"
            />
            
            {/* Oscurecemos un poco la imagen en general para que el texto blanco sea legible */}
            <div className="absolute inset-0 bg-black/40" />
            
            {/* Gradiente superior para que el menú de navegación contraste bien */}
            <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/80 to-transparent" />
            
            {/* Gradiente inferior para fusionar la foto suavemente con la sección blanca de abajo */}
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-slate-50 dark:from-zinc-950 to-transparent" />
          </div>

          <div className="container relative z-10 px-4 md:px-6 mx-auto">
            <div className="max-w-4xl animate-in slide-in-from-bottom-8 duration-1000 delay-150 fill-mode-both">
              
              {/* Badges de Confianza */}
              <div className="mb-8 flex flex-wrap items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-primary border border-white/20 text-white shadow-2xl transition-transform hover:scale-110 duration-300">
                  <Icon className="h-8 w-8" />
                </div>
                <Badge className="bg-brand-primary text-white font-black px-4 py-2 text-xs uppercase tracking-widest border-0 shadow-lg">
                  {programa.tipo} 100% Online
                </Badge>
                <Badge variant="outline" className="bg-black/50 backdrop-blur-md text-white border-white/30 font-bold px-4 py-2 text-xs uppercase tracking-widest gap-2">
                  <ShieldCheck className="h-4 w-4 text-brand-primary" />
                  {programa.rvoe ? `RVOE: ${programa.rvoe}` : 'Validez Oficial SEP'}
                </Badge>
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.1] mb-6 drop-shadow-2xl">
                {programa.nombre}
              </h1>
              
              <p className="text-xl md:text-2xl text-slate-200 font-medium leading-relaxed max-w-3xl mb-12 drop-shadow-md">
                {programa.descripcion}
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="w-full sm:w-auto rounded-full px-10 bg-brand-primary hover:bg-brand-highlight text-white transition-all duration-300 text-lg h-16 font-bold uppercase tracking-wider shadow-2xl hover:scale-105" asChild>
                  <Link href="/login">
                    Iniciar mi Inscripción <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* ================= CONTENIDO PRINCIPAL Y SIDEBAR DE VENTAS ================= */}
        <div className="container px-4 md:px-6 mx-auto py-24 relative z-20">
          <div className="grid lg:grid-cols-3 gap-16 relative">
            
            {/* COLUMNA IZQUIERDA: ARGUMENTOS DE VENTA */}
            <div className="lg:col-span-2 space-y-24">
              
              {/* Sección: ¿Por qué estudiar con nosotros? */}
              <section className="animate-in slide-in-from-bottom-12 duration-1000 delay-300 fill-mode-both">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white dark:bg-white dark:text-black font-bold text-xs uppercase tracking-widest mb-6 rounded-full shadow-sm">
                  <Target className="h-4 w-4 text-brand-primary" /> Visión del Programa
                </div>
                <h2 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white mb-6 leading-[1.1]">
                  ¿Por qué elegir <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-highlight">este programa?</span>
                </h2>
                <p className="text-lg md:text-xl text-slate-600 dark:text-zinc-400 leading-relaxed font-light">
                  {programa.porQueEstudiar || "Formamos profesionales altamente capacitados para enfrentar los retos del mundo actual mediante un programa innovador y práctico."}
                </p>
              </section>

              {/* Sección: Campo Laboral y Perfil de Egreso */}
              <section className="grid sm:grid-cols-2 gap-8">
                {campoLaboral.length > 0 && (
                  <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-xl shadow-slate-200/50 dark:shadow-none hover:-translate-y-2 transition-transform duration-500">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-3 bg-brand-primary/10 rounded-xl">
                        <Briefcase className="h-6 w-6 text-brand-primary" />
                      </div>
                      <h3 className="text-xl font-bold uppercase tracking-tight text-slate-900 dark:text-white">Campo Laboral</h3>
                    </div>
                    <ul className="space-y-4">
                      {campoLaboral.map((item, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <CheckCircle2 className="h-5 w-5 text-brand-primary shrink-0 mt-0.5" />
                          <span className="text-slate-600 dark:text-zinc-400 font-medium leading-snug">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {perfilEgreso.length > 0 && (
                  <div className="bg-slate-900 dark:bg-zinc-950 p-8 rounded-3xl border border-slate-800 shadow-xl hover:-translate-y-2 transition-transform duration-500">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-3 bg-white/10 rounded-xl">
                        <GraduationCap className="h-6 w-6 text-brand-highlight" />
                      </div>
                      <h3 className="text-xl font-bold uppercase tracking-tight text-white">Perfil de Egreso</h3>
                    </div>
                    <ul className="space-y-4">
                      {perfilEgreso.map((item, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <Zap className="h-5 w-5 text-brand-highlight shrink-0 mt-0.5" />
                          <span className="text-slate-300 font-medium leading-snug">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </section>

              {/* Sección: Plan de Estudios */}
              {planEstudios.length > 0 && (
                <section>
                  <div className="mb-10">
                    <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-4">
                      Tu Mapa <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-highlight">Curricular</span>
                    </h2>
                    <p className="text-lg text-slate-600 dark:text-zinc-400 font-light">
                      Materias diseñadas para que adquieras competencias reales exigidas por las empresas hoy mismo.
                    </p>
                  </div>

                  <Accordion type="single" collapsible className="w-full space-y-4">
                    {planEstudios.map((plan: any, index: number) => (
                      <AccordionItem key={index} value={`item-${index}`} className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl px-2 sm:px-6 shadow-sm overflow-hidden data-[state=open]:border-brand-primary/50 transition-colors">
                        <AccordionTrigger className="text-lg sm:text-xl font-bold hover:text-brand-primary hover:no-underline py-6 uppercase tracking-tight">
                          <div className="flex items-center gap-4">
                            <span className="flex items-center justify-center h-10 w-10 rounded-full bg-slate-100 dark:bg-zinc-800 text-brand-primary text-sm">
                              {index + 1}
                            </span>
                            {plan.semestre}
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pb-6">
                          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 ml-14">
                            {plan.materias.map((materia: string, idx: number) => (
                              <li key={idx} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-zinc-950 rounded-xl border border-slate-100 dark:border-zinc-800">
                                <div className="h-2 w-2 rounded-full bg-brand-primary" />
                                <span className="text-slate-700 dark:text-zinc-300 font-medium text-sm">{materia}</span>
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

            {/* ================= COLUMNA DERECHA: SIDEBAR DE CONVERSIÓN (STICKY) ================= */}
            <div className="lg:col-span-1">
              <div className="sticky top-32 bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-slate-200 dark:border-zinc-800 shadow-2xl p-8 overflow-hidden animate-in fade-in slide-in-from-right-8 duration-1000 delay-500">
                
                {/* Deco background */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-brand-primary/10 rounded-full blur-3xl pointer-events-none" />

                <div className="mb-8 text-center relative z-10">
                  <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20 border-0 font-bold px-4 py-1.5 text-xs uppercase tracking-widest mb-4">
                    Inscripciones Abiertas
                  </Badge>
                  <h3 className="text-2xl font-black uppercase text-slate-900 dark:text-white">Resumen de Inversión</h3>
                </div>
                
                <div className="space-y-6 mb-8 relative z-10">
                  <div className="flex justify-between items-end border-b border-slate-100 dark:border-zinc-800 pb-4">
                    <span className="text-slate-500 dark:text-zinc-400 font-medium">Inscripción</span>
                    <div className="text-right">
                      <span className="line-through text-xs text-slate-400 block">$1,500 MXN</span>
                      <span className="font-black text-green-500 uppercase tracking-wider">Gratis Hoy</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center border-b border-slate-100 dark:border-zinc-800 pb-4">
                    <span className="text-slate-500 dark:text-zinc-400 font-medium">Colegiatura Mensual</span>
                    <span className="font-black text-2xl text-slate-900 dark:text-white">$600 <span className="text-sm text-slate-500 font-normal">MXN</span></span>
                  </div>
                  
                  <div className="flex justify-between items-center border-b border-slate-100 dark:border-zinc-800 pb-4">
                    <span className="text-slate-500 dark:text-zinc-400 font-medium">Duración Total</span>
                    <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                      <Clock className="h-4 w-4 text-brand-primary" /> {programa.duracion}
                    </div>
                  </div>
                </div>

                <div className="space-y-4 relative z-10">
                  <Button className="w-full rounded-2xl bg-brand-primary hover:bg-brand-highlight text-white h-16 font-black uppercase tracking-widest text-sm shadow-xl hover:scale-105 transition-all duration-300" asChild>
                    <Link href="/inscripcion">
                      Asegurar mi Lugar
                    </Link>
                  </Button>
                  <p className="text-center text-xs text-slate-500 dark:text-zinc-500 font-medium">
                    Proceso 100% en línea. Sin trámites engorrosos.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ================= PREGUNTAS FRECUENTES ================= */}
        {faqs.length > 0 && (
          <section className="py-24 bg-slate-900 dark:bg-black text-white">
            <div className="container px-4 md:px-6 mx-auto max-w-4xl">
              <div className="text-center mb-16">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 mb-6">
                  <HelpCircle className="h-8 w-8 text-brand-primary" />
                </div>
                <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight">Preguntas Frecuentes</h2>
                <p className="text-slate-400 font-light text-lg mt-4 max-w-2xl mx-auto">Resolvemos tus dudas para que tomes la decisión con total seguridad.</p>
              </div>
              
              <Accordion type="single" collapsible className="w-full space-y-4">
                {faqs.map((faq: any, idx: number) => (
                  <AccordionItem key={idx} value={`faq-${idx}`} className="border border-slate-800 bg-slate-950/50 rounded-2xl px-6 data-[state=open]:bg-slate-800 transition-colors">
                    <AccordionTrigger className="text-lg font-bold text-left py-6 hover:text-brand-primary hover:no-underline">
                      {faq.pregunta}
                    </AccordionTrigger>
                    <AccordionContent className="text-slate-400 text-base leading-relaxed pb-6">
                      {faq.respuesta}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </section>
        )}

        {/* ================= CTA FINAL BOTTOM ================= */}
        <section className="py-32 relative overflow-hidden bg-brand-primary text-white text-center">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1)_0,transparent_100%)] pointer-events-none" />
          <div className="container relative z-10 px-4 mx-auto max-w-3xl">
            <h2 className="text-5xl md:text-6xl font-black tracking-tight mb-6 drop-shadow-md">
              ¿Listo para transformar tu futuro?
            </h2>
            <p className="text-xl font-medium mb-12 opacity-90">
              No dejes pasar más tiempo. Únete a miles de alumnos que ya están construyendo su éxito profesional con nosotros.
            </p>
            <Button size="lg" className="rounded-full px-12 bg-white text-brand-primary hover:bg-slate-100 hover:scale-105 transition-all duration-300 h-16 font-black uppercase tracking-widest shadow-2xl text-lg" asChild>
              <Link href="/login">
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