import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
  CreditCard,
  FileText,
  GraduationCap,
  LockKeyhole,
  MonitorPlay,
  Sparkles,
  ShieldCheck,
  Target,
} from 'lucide-react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AdmissionLeadForm } from '@/components/forms/admission-lead-form'
import { Header } from '@/components/landing/header'
import { Footer } from '@/components/landing/footer'
import { ClipPaymentLink } from '@/components/marketing/clip-payment-link'
import { ProgramViewTracker } from '@/components/marketing/program-view-tracker'
import { TrackLink } from '@/components/marketing/track-link'
import { WhatsAppIcon } from '@/components/marketing/whatsapp-icon'
import { WhatsAppLink } from '@/components/marketing/whatsapp-link'
import { programas } from '@/lib/data'
import { getProgramaIcono } from '@/lib/icons'
import { getProgramWhatsAppMessage, RESERVATION_AMOUNT_MXN, SITE_URL } from '@/lib/marketing'
import { generalFaqs, programBenefits, programSpecificFaqs } from '@/lib/program-content'
import { getProgramaIdCandidates, normalizeProgramaId } from '@/lib/programa-utils'
import { createAdminClient } from '@/lib/supabase/admin'
import type { Materia } from '@/types/database'

export function generateStaticParams() {
  return programas.map((programa) => ({
    id: programa.id,
  }))
}

function getLevelLabel(tipo: string) {
  if (tipo === 'preparatoria') return 'Preparatoria'
  if (tipo === 'licenciatura') return 'Licenciatura'
  if (tipo === 'maestria') return 'Maestría'
  return 'Curso'
}

async function getPlanEstudios(programaId: string, localPlan: { semestre: string; materias: string[] }[] = []) {
  const normalizedProgramaId = normalizeProgramaId(programaId)
  if (normalizedProgramaId !== 'psicologia') return localPlan
  const programaCandidates = getProgramaIdCandidates(programaId)

  try {
    const admin = createAdminClient()
    const { data, error } = await admin
      .from('materias')
      .select('id, programa_id, periodo, nombre_periodo, nombre, clave, seriacion, horas_docente, horas_independientes, creditos, instalacion, created_at')
      .in('programa_id', programaCandidates)
      .order('periodo', { ascending: true })
      .order('clave', { ascending: true })

    if (error) {
      console.error('Error cargando plan de Psicologia:', error)
      return []
    }

    const grouped = new Map<number, Materia[]>()
    for (const materia of (data ?? []) as Materia[]) {
      grouped.set(materia.periodo, [...(grouped.get(materia.periodo) ?? []), materia])
    }

    return Array.from(grouped.entries()).map(([periodo, materias]) => ({
      semestre: materias[0]?.nombre_periodo ?? `${periodo} cuatrimestre`,
      materias: materias.map((materia) => `${materia.clave} - ${materia.nombre}`),
    }))
  } catch (error) {
    console.error('Error cargando plan de Psicologia:', error)
    return []
  }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const programa = programas.find((item) => item.id === id)

  if (!programa) {
    return {
      title: 'Programa no encontrado',
    }
  }

  const rvoeText = programa.rvoe ? ` con RVOE ${programa.rvoe}` : ' con modalidad virtual'
  const title = `${programa.nombre}${rvoeText} en Durango`

  return {
    title,
    description: `${programa.descripcion} Estudia en modalidad virtual con horarios flexibles, acompañamiento académico y ${programa.rvoe ? 'validez oficial SEP Durango.' : 'acompañamiento institucional.'}`,
    keywords: [
      `${programa.nombre} Durango`,
      `${programa.nombre} virtual`,
      `${programa.nombre} con RVOE`,
      `Aparta tu lugar ${programa.nombre}`,
      `Aparta inscripcion ${programa.nombre} $600`,
      programa.rvoe ? `RVOE ${programa.rvoe}` : 'programa virtual Durango',
      'Instituto Universitario de Durango',
      'RVOE SEP Durango',
      'horarios flexibles',
    ],
    alternates: {
      canonical: `/programas/${programa.id}`,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      title,
      description: programa.descripcion,
      url: `${SITE_URL}/programas/${programa.id}`,
      type: 'article',
      images: [
        {
          url: programa.imagen || '/hero-img.png',
          width: 1200,
          height: 630,
          alt: programa.nombre,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: programa.descripcion,
      images: [programa.imagen || '/hero-img.png'],
    },
  }
}

export default async function ProgramaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const programa = programas.find((item) => item.id === id)

  if (!programa) notFound()

  const Icon = getProgramaIcono(programa.id)
  const benefit = programBenefits[programa.id] || programa.descripcion
  const planEstudios = await getPlanEstudios(programa.id, programa.planEstudios || [])
  const campoLaboral = programa.campoLaboral || []
  const perfilEgreso = programa.perfilEgreso || []
  const programFaqs = [
    ...(programa.preguntasFrecuentes || []).map((faq) => ({
      question: faq.pregunta,
      answer: faq.respuesta,
    })),
    ...(programSpecificFaqs[programa.id] || []),
  ]
  const faqs = [...programFaqs, ...generalFaqs]
  const relatedPrograms = programas
    .filter((item) => item.id !== programa.id && item.rvoe && item.tipo === programa.tipo)
    .slice(0, 3)
  const whatsappMessage = getProgramWhatsAppMessage(programa.nombre, programa.rvoe)
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Course',
        '@id': `${SITE_URL}/programas/${programa.id}#course`,
        name: programa.nombre,
        description: programa.descripcion,
        url: `${SITE_URL}/programas/${programa.id}`,
        image: programa.imagen || `${SITE_URL}/hero-img.png`,
        provider: {
          '@type': 'EducationalOrganization',
          name: 'Instituto Universitario de Durango',
          sameAs: SITE_URL,
        },
        educationalCredentialAwarded: getLevelLabel(programa.tipo),
        courseMode: 'Virtual',
        timeRequired: programa.duracion,
        identifier: programa.rvoe,
        offers: {
          '@type': 'Offer',
          price: RESERVATION_AMOUNT_MXN,
          priceCurrency: 'MXN',
          availability: 'https://schema.org/InStock',
          category: 'Apartado de lugar',
          url: `${SITE_URL}/programas/${programa.id}`,
        },
        hasCourseInstance: {
          '@type': 'CourseInstance',
          courseMode: 'online',
          courseWorkload: programa.duracion,
          location: {
            '@type': 'VirtualLocation',
            url: `${SITE_URL}/programas/${programa.id}`,
          },
        },
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${SITE_URL}/programas/${programa.id}#breadcrumb`,
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Inicio',
            item: SITE_URL,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Programas',
            item: `${SITE_URL}/#oferta`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: programa.nombre,
            item: `${SITE_URL}/programas/${programa.id}`,
          },
        ],
      },
      {
        '@type': 'FAQPage',
        '@id': `${SITE_URL}/programas/${programa.id}#faq`,
        mainEntity: faqs.slice(0, 8).map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer,
          },
        })),
      },
    ],
  }

  return (
    <>
      <Header />
      <ProgramViewTracker programId={programa.id} programName={programa.nombre} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <main className="bg-slate-50">
        <section className="relative isolate overflow-hidden bg-slate-950 pt-32 text-white sm:pt-36 lg:pt-44">
          <div className="absolute inset-0 -z-10">
            <img
              src={programa.imagen || '/hero-img.png'}
              alt={programa.nombre}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-slate-950/78" />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(4,31,78,0.96),rgba(15,23,42,0.78)_48%,rgba(15,23,42,0.36))]" />
          </div>

          <div className="container mx-auto grid min-h-[680px] items-center gap-10 px-4 pb-16 md:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:pb-20">
            <div>
              <div className="mb-6 flex flex-wrap items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-primary text-white shadow-xl">
                  <Icon className="h-7 w-7" />
                </div>
                <Badge className="bg-brand-primary px-3 py-1.5 text-white hover:bg-brand-primary">
                  {getLevelLabel(programa.tipo)}
                </Badge>
                {programa.rvoe && (
                  <Badge variant="outline" className="border-white/25 bg-white/10 px-3 py-1.5 text-white">
                    <ShieldCheck className="mr-1.5 h-4 w-4 text-brand-highlight" />
                    RVOE {programa.rvoe}
                  </Badge>
                )}
              </div>

              <h1 className="max-w-4xl text-4xl font-black leading-[1.06] tracking-tight sm:text-5xl lg:text-7xl">
                {programa.nombre} en modalidad virtual
              </h1>
              <p className="mt-6 max-w-2xl text-lg font-medium leading-relaxed text-white/80">
                {programa.descripcion}
              </p>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
                  <Clock3 className="mb-3 h-5 w-5 text-brand-highlight" />
                  <p className="text-xs font-black uppercase tracking-widest text-white/50">Duración</p>
                  <p className="mt-1 font-black">{programa.duracion}</p>
                </div>
                <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
                  <MonitorPlay className="mb-3 h-5 w-5 text-brand-highlight" />
                  <p className="text-xs font-black uppercase tracking-widest text-white/50">Modalidad</p>
                  <p className="mt-1 font-black">Virtual</p>
                </div>
                <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
                  <ShieldCheck className="mb-3 h-5 w-5 text-brand-highlight" />
                  <p className="text-xs font-black uppercase tracking-widest text-white/50">Validez</p>
                  <p className="mt-1 font-black">{programa.rvoe ? 'RVOE SEP' : 'Institucional'}</p>
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Button asChild size="lg" className="h-14 rounded-full bg-brand-highlight px-7 font-black text-slate-950 shadow-xl shadow-brand-highlight/20 hover:bg-white">
                  <ClipPaymentLink programId={programa.id} programName={programa.nombre}>
                    <CreditCard className="mr-2 h-5 w-5" />
                    Aparta tu lugar con ${RESERVATION_AMOUNT_MXN} MXN
                  </ClipPaymentLink>
                </Button>
                <Button asChild size="lg" className="h-14 rounded-full bg-brand-primary px-7 font-black text-white hover:bg-brand-primary/90">
                  <WhatsAppLink message={whatsappMessage} programId={programa.id}>
                    <WhatsAppIcon className="mr-2 h-5 w-5" />
                    Pedir informes por WhatsApp
                  </WhatsAppLink>
                </Button>
                <Button asChild size="lg" variant="outline" className="h-14 rounded-full border-white/25 bg-white/10 px-7 font-black text-white hover:bg-white hover:text-slate-950">
                  <TrackLink
                    href="#plan-estudios"
                    event="download_plan"
                    payload={{ programId: programa.id, programName: programa.nombre }}
                  >
                    Ver plan de estudios
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </TrackLink>
                </Button>
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-white/10 bg-white p-5 text-slate-950 shadow-2xl sm:p-7">
              <div className="mb-5 rounded-2xl border border-brand-primary/15 bg-brand-primary/5 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-brand-primary shadow-sm">
                    <LockKeyhole className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-brand-primary">Aparta tu lugar</p>
                    <h2 className="mt-1 text-xl font-black text-slate-950">
                      ${RESERVATION_AMOUNT_MXN} MXN
                    </h2>
                    <p className="mt-1 text-sm font-medium leading-relaxed text-slate-600">
                      Inicia tu proceso de admisión con pago seguro por Clip y recibe seguimiento de un asesor.
                    </p>
                  </div>
                </div>
                <Button asChild className="mt-4 h-11 w-full rounded-xl bg-brand-primary font-black text-white hover:bg-brand-primary/90">
                  <ClipPaymentLink programId={programa.id} programName={programa.nombre}>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Apartar lugar
                  </ClipPaymentLink>
                </Button>
              </div>
              <AdmissionLeadForm
                defaultProgramId={programa.id}
                source={`programa_${programa.id}`}
                title="Solicita información de este programa"
                description="Déjanos tus datos y un asesor te explicará requisitos, costos, fechas de inicio y validez oficial."
                submitLabel="Quiero que me contacten"
              />
            </div>
          </div>
        </section>

        <section className="bg-white py-16 sm:py-20">
          <div className="container mx-auto grid gap-8 px-4 md:px-6 lg:grid-cols-3">
            <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-6">
              <Target className="mb-4 h-7 w-7 text-brand-primary" />
              <h2 className="text-xl font-black text-slate-950">Beneficio principal</h2>
              <p className="mt-3 text-sm font-medium leading-relaxed text-slate-600">{benefit}</p>
            </div>
            <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-6">
              <ShieldCheck className="mb-4 h-7 w-7 text-brand-primary" />
              <h2 className="text-xl font-black text-slate-950">Respaldo oficial</h2>
              <p className="mt-3 text-sm font-medium leading-relaxed text-slate-600">
                {programa.rvoe
                  ? `Programa con RVOE ${programa.rvoe}, visible para consulta y verificación.`
                  : 'Programa complementario de formación continua.'}
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-6">
              <GraduationCap className="mb-4 h-7 w-7 text-brand-primary" />
              <h2 className="text-xl font-black text-slate-950">Acompañamiento</h2>
              <p className="mt-3 text-sm font-medium leading-relaxed text-slate-600">
                Recibe orientación de admisiones y seguimiento académico durante tu avance.
              </p>
            </div>
          </div>
        </section>

        {programa.porQueEstudiar && (
          <section className="bg-slate-50 py-16 sm:py-20">
            <div className="container mx-auto px-4 md:px-6">
              <div className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-xl shadow-slate-200/60">
                <div className="grid gap-0 lg:grid-cols-[0.82fr_1.18fr]">
                  <div className="bg-slate-950 p-7 text-white sm:p-9">
                    <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-brand-highlight">
                      <Sparkles className="h-7 w-7" />
                    </div>
                    <p className="text-xs font-black uppercase tracking-widest text-brand-highlight">Enfoque del programa</p>
                    <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
                      ¿Por qué estudiar {programa.nombre}?
                    </h2>
                  </div>
                  <div className="p-7 sm:p-9">
                    <p className="text-base font-medium leading-relaxed text-slate-600 sm:text-lg">
                      {programa.porQueEstudiar}
                    </p>
                    <div className="mt-7 grid gap-3 sm:grid-cols-3">
                      {['Horarios flexibles', 'Modalidad virtual', programa.rvoe ? `RVOE ${programa.rvoe}` : 'Acompañamiento'].map((item) => (
                        <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-black text-slate-800">
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        <section className="py-16 sm:py-20">
          <div className="container mx-auto grid gap-10 px-4 md:px-6 lg:grid-cols-2">
            {campoLaboral.length > 0 && (
              <div className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                <BriefcaseBusiness className="mb-5 h-8 w-8 text-brand-primary" />
                <h2 className="text-2xl font-black tracking-tight text-slate-950">Campo laboral</h2>
                <ul className="mt-6 space-y-3">
                  {campoLaboral.map((item) => (
                    <li key={item} className="flex gap-3 text-sm font-semibold leading-relaxed text-slate-700">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand-primary" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {perfilEgreso.length > 0 && (
              <div className="rounded-[1.5rem] border border-slate-200 bg-slate-950 p-6 text-white shadow-sm sm:p-8">
                <GraduationCap className="mb-5 h-8 w-8 text-brand-highlight" />
                <h2 className="text-2xl font-black tracking-tight">Perfil de egreso</h2>
                <ul className="mt-6 space-y-3">
                  {perfilEgreso.map((item) => (
                    <li key={item} className="flex gap-3 text-sm font-semibold leading-relaxed text-white/80">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand-highlight" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>

        {planEstudios.length > 0 && (
          <section id="plan-estudios" className="bg-white py-16 sm:py-20">
            <div className="container mx-auto max-w-5xl px-4 md:px-6">
              <div className="mb-10">
                <div className="mb-4 inline-flex rounded-full bg-brand-primary/10 px-4 py-2 text-xs font-black uppercase tracking-widest text-brand-primary">
                  Plan de estudios
                </div>
                <h2 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                  Materias por periodo
                </h2>
                <p className="mt-3 text-base font-medium text-slate-600">
                  Revisa la estructura académica antes de solicitar tu inscripción.
                </p>
              </div>

              <Accordion type="single" collapsible className="space-y-3">
                {planEstudios.map((plan, index) => (
                  <AccordionItem
                    key={plan.semestre}
                    value={`plan-${index}`}
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-5 data-[state=open]:bg-white"
                  >
                    <AccordionTrigger className="text-left text-lg font-black text-slate-950 hover:text-brand-primary hover:no-underline">
                      {plan.semestre}
                    </AccordionTrigger>
                    <AccordionContent>
                      <ul className="grid gap-2 pt-2 sm:grid-cols-2">
                        {plan.materias.map((materia) => (
                          <li key={materia} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700">
                            {materia}
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </section>
        )}

        <section className="py-16 sm:py-20">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
              <div className="lg:sticky lg:top-28">
                <div className="mb-4 inline-flex rounded-full bg-brand-primary/10 px-4 py-2 text-xs font-black uppercase tracking-widest text-brand-primary">
                  Preguntas frecuentes
                </div>
                <h2 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                  Dudas sobre {programa.nombre}
                </h2>
                <p className="mt-4 text-base font-medium leading-relaxed text-slate-600">
                  Cada programa tiene requisitos, campo laboral y tiempos propios. Aquí concentramos las dudas más importantes antes de pedir informes.
                </p>
              </div>

              <div className="space-y-8">
                {programFaqs.length > 0 && (
                  <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                    <h3 className="mb-5 text-xl font-black text-slate-950">Preguntas de este programa</h3>
                    <Accordion type="single" collapsible className="space-y-3">
                      {programFaqs.map((faq, index) => (
                        <AccordionItem
                          key={`${faq.question}-${index}`}
                          value={`program-faq-${index}`}
                          className="rounded-2xl border border-slate-200 bg-slate-50 px-5 data-[state=open]:bg-white"
                        >
                          <AccordionTrigger className="text-left text-base font-black text-slate-950 hover:text-brand-primary hover:no-underline">
                            {faq.question}
                          </AccordionTrigger>
                          <AccordionContent className="text-sm font-medium leading-relaxed text-slate-600">
                            {faq.answer}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>
                )}

                <div className="rounded-[1.5rem] border border-slate-200 bg-slate-950 p-5 text-white shadow-sm sm:p-6">
                  <h3 className="mb-5 text-xl font-black">Dudas generales de admisión</h3>
                  <Accordion type="single" collapsible className="space-y-3">
                    {generalFaqs.slice(0, 6).map((faq, index) => (
                      <AccordionItem
                        key={`${faq.question}-${index}`}
                        value={`general-faq-${index}`}
                        className="rounded-2xl border border-white/10 bg-white/5 px-5"
                      >
                        <AccordionTrigger className="text-left text-base font-black text-white hover:text-brand-highlight hover:no-underline">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-sm font-medium leading-relaxed text-white/70">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              </div>
            </div>
          </div>
        </section>

        {relatedPrograms.length > 0 && (
          <section className="bg-white py-16 sm:py-20">
            <div className="container mx-auto px-4 md:px-6">
              <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-brand-primary">También puedes revisar</p>
                  <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                    Más programas con RVOE
                  </h2>
                </div>
                <Button asChild variant="outline" className="rounded-full border-slate-300 font-black">
                  <Link href="/#oferta">Ver oferta académica</Link>
                </Button>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {relatedPrograms.map((item) => {
                  const RelatedIcon = getProgramaIcono(item.id)

                  return (
                    <Link
                      key={item.id}
                      href={`/programas/${item.id}`}
                      className="group rounded-[1.4rem] border border-slate-200 bg-slate-50 p-5 transition hover:-translate-y-0.5 hover:border-brand-primary/30 hover:bg-white hover:shadow-xl hover:shadow-slate-200/70"
                    >
                      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-primary text-white">
                        <RelatedIcon className="h-6 w-6" />
                      </div>
                      <h3 className="text-lg font-black text-slate-950 group-hover:text-brand-primary">{item.nombre}</h3>
                      <p className="mt-2 line-clamp-2 text-sm font-medium leading-relaxed text-slate-600">{item.descripcion}</p>
                      <div className="mt-4 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-brand-primary">
                        RVOE {item.rvoe}
                        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          </section>
        )}

        <section className="bg-brand-primary py-16 text-white sm:py-20">
          <div className="container mx-auto max-w-3xl px-4 text-center md:px-6">
            <FileText className="mx-auto mb-5 h-10 w-10 text-brand-highlight" />
            <h2 className="text-3xl font-black tracking-tight sm:text-4xl">
              Da el siguiente paso con información clara
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base font-medium leading-relaxed text-white/85">
              Pregunta por requisitos, costo vigente, RVOE y fecha del próximo grupo antes de decidir.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Button asChild className="h-12 rounded-full bg-brand-highlight px-6 font-black text-slate-950 hover:bg-white">
                <ClipPaymentLink programId={programa.id} programName={programa.nombre}>
                  <CreditCard className="mr-2 h-5 w-5" />
                  Apartar con ${RESERVATION_AMOUNT_MXN} MXN
                </ClipPaymentLink>
              </Button>
              <Button asChild className="h-12 rounded-full bg-white px-6 font-black text-brand-primary hover:bg-brand-highlight hover:text-slate-950">
                <WhatsAppLink message={whatsappMessage} programId={programa.id}>
                  <WhatsAppIcon className="mr-2 h-5 w-5" />
                  Pedir informes
                </WhatsAppLink>
              </Button>
              <Button asChild variant="outline" className="h-12 rounded-full border-white/30 bg-transparent px-6 font-black text-white hover:bg-white hover:text-slate-950">
                <Link href="/inscripcion">Formulario de solicitud</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
