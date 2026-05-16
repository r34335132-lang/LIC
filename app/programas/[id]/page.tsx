import { notFound } from 'next/navigation'
import Link from 'next/link'
import { programas } from '@/lib/data'
import { getProgramaIcono } from '@/lib/icons'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ArrowRight, CheckCircle2, Clock, Calendar, ShieldCheck, Download, Briefcase, HelpCircle } from 'lucide-react'

// IMPORTAMOS EL HEADER Y EL FOOTER
import { Header } from '@/components/landing/header'
import { Footer } from '@/components/landing/footer'

// Generar rutas estáticas para SEO y velocidad
export function generateStaticParams() {
  return programas.map((programa) => ({
    id: programa.id,
  }))
}

// Hacemos la función 'async' y tipamos 'params' como una Promesa (Next.js 15)
export default async function ProgramaPage({ params }: { params: Promise<{ id: string }> }) {
  // Esperamos a que la promesa se resuelva para obtener el ID
  const { id } = await params
  
  const programa = programas.find((p) => p.id === id)

  if (!programa) {
    notFound()
  }

  const Icon = getProgramaIcono(programa.id)
  const planEstudios = programa.planEstudios || []
  const campoLaboral = programa.campoLaboral || []
  const faqs = programa.preguntasFrecuentes || []

  return (
    <>
      {/* ================= BARRA DE NAVEGACIÓN ================= */}
      <Header />

      <div className="min-h-screen bg-gray-50 dark:bg-black/95 pt-20">
        
        {/* ================= HERO DE LA CARRERA ================= */}
        <section className="relative pt-20 pb-20 lg:pt-32 lg:pb-32 overflow-hidden bg-black">
          <div className="absolute inset-0 z-0">
            <img 
              src={programa.imagen || "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=2070&auto=format&fit=crop"} 
              alt={programa.nombre} 
              className="object-cover w-full h-full opacity-40"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
          </div>

          <div className="container relative z-10 px-4 md:px-6 mx-auto">
            <div className="max-w-4xl">
              <div className="mb-6 flex flex-wrap items-center gap-3">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-primary text-white shadow-2xl">
                  <Icon className="h-8 w-8" />
                </div>
                <Badge className="bg-brand-highlight text-black font-black px-4 py-2 text-sm uppercase tracking-widest border-0">
                  {programa.tipo} 100% Online
                </Badge>
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.1] mb-6 drop-shadow-xl">
                {programa.nombre}
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-300 font-medium leading-relaxed max-w-3xl mb-10">
                {programa.descripcion}
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/login">
                  <Button size="lg" className="w-full sm:w-auto rounded-none px-10 bg-brand-primary hover:bg-white hover:text-black text-white transition-colors text-lg h-16 font-bold uppercase tracking-wider">
                    Inscribirme Ahora <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ================= ZONA DE ENGANCHE (¿POR QUÉ ESTUDIAR?) ================= */}
        <section className="py-20 bg-white dark:bg-black border-b border-border/50">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-black text-white dark:bg-white dark:text-black font-bold text-xs uppercase tracking-widest mb-6">
                  Visión del Programa
                </div>
                <h2 className="text-4xl md:text-5xl font-black tracking-tight text-foreground mb-6 uppercase">
                  ¿Por qué elegir <span className="text-brand-primary block mt-1">este programa?</span>
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed font-medium">
                  {programa.porQueEstudiar || "Formamos profesionales altamente capacitados para enfrentar los retos del mundo actual mediante un programa innovador y práctico."}
                </p>
              </div>

              {/* Campo Laboral y Perfil */}
              <div className="space-y-8">
                {campoLaboral.length > 0 && (
                  <div className="bg-gray-50 dark:bg-gray-900 p-8 border-l-4 border-brand-primary">
                    <div className="flex items-center gap-3 mb-4">
                      <Briefcase className="h-6 w-6 text-brand-primary" />
                      <h3 className="text-2xl font-bold uppercase tracking-tight">Campo Laboral</h3>
                    </div>
                    <ul className="space-y-3">
                      {campoLaboral.map((item, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="h-5 w-5 text-brand-highlight shrink-0 mt-0.5" />
                          <span className="text-muted-foreground font-medium">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ================= PLAN DE ESTUDIOS ================= */}
        <section className="py-24 bg-gray-50 dark:bg-black/95">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid lg:grid-cols-3 gap-16">
              
              <div className="lg:col-span-2">
                <div className="mb-10">
                  <h2 className="text-3xl md:text-4xl font-black text-foreground uppercase tracking-tight mb-4">
                    Tu Ruta de <span className="text-brand-primary">Aprendizaje</span>
                  </h2>
                  <p className="text-lg text-muted-foreground font-medium">
                    Conoce el mapa curricular diseñado para que adquieras competencias reales y exigidas por las empresas.
                  </p>
                </div>

                <Accordion type="single" collapsible className="w-full space-y-4">
                  {planEstudios.map((plan: any, index: number) => (
                    <AccordionItem key={index} value={`item-${index}`} className="bg-white dark:bg-gray-900 border border-border/50 rounded-none px-6 shadow-sm overflow-hidden">
                      <AccordionTrigger className="text-xl font-bold hover:text-brand-primary hover:no-underline py-6 uppercase tracking-tight">
                        {plan.semestre}
                      </AccordionTrigger>
                      <AccordionContent className="pb-6">
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                          {plan.materias.map((materia: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-black/50 border border-border/50">
                              <CheckCircle2 className="h-6 w-6 text-brand-primary shrink-0" />
                              <span className="text-foreground font-medium text-base">{materia}</span>
                            </li>
                          ))}
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>

              {/* Columna Derecha: Tarjeta de Inversión Fija */}
              <div className="lg:col-span-1">
                <div className="sticky top-24 bg-white dark:bg-gray-900 border-t-8 border-brand-primary shadow-2xl p-8">
                  <h3 className="text-2xl font-black uppercase mb-6 text-center">Resumen del Programa</h3>
                  
                  <div className="space-y-4 mb-8">
                    <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-4">
                      <span className="text-muted-foreground font-medium">Inscripción</span>
                      <span className="font-black text-brand-primary uppercase">Gratis</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-4">
                      <span className="text-muted-foreground font-medium">Mensualidad desde</span>
                      <span className="font-black text-xl">$600 MXN</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-4">
                      <span className="text-muted-foreground font-medium">Duración</span>
                      <span className="font-bold">{programa.duracion}</span>
                    </div>
                  </div>

                  <Link href="/login" className="block w-full mb-4">
                    <Button className="w-full rounded-none bg-black text-white hover:bg-brand-primary dark:bg-white dark:text-black h-14 font-bold uppercase tracking-wider">
                      Comenzar Proceso
                    </Button>
                  </Link>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ================= PREGUNTAS FRECUENTES ================= */}
        {faqs.length > 0 && (
          <section className="py-24 bg-white dark:bg-black border-t border-border/50">
            <div className="container px-4 md:px-6 mx-auto max-w-4xl">
              <div className="text-center mb-12">
                <HelpCircle className="h-12 w-12 text-brand-primary mx-auto mb-4" />
                <h2 className="text-4xl font-black uppercase tracking-tight">Preguntas Frecuentes</h2>
                <p className="text-muted-foreground font-medium mt-2">Resolvemos tus dudas para que tomes la mejor decisión.</p>
              </div>
              
              <Accordion type="single" collapsible className="w-full space-y-4">
                {faqs.map((faq: any, idx: number) => (
                  <AccordionItem key={idx} value={`faq-${idx}`} className="border rounded-lg px-6">
                    <AccordionTrigger className="text-lg font-bold text-left py-6">{faq.pregunta}</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground text-base leading-relaxed pb-6">
                      {faq.respuesta}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </section>
        )}

      </div>

      {/* ================= PIE DE PÁGINA ================= */}
      <Footer />
    </>
  )
}