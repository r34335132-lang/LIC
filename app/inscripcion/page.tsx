import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, CreditCard, FileCheck2, GraduationCap, ShieldCheck, UserCheck } from 'lucide-react'
import { AdmissionLeadForm } from '@/components/forms/admission-lead-form'
import { programas } from '@/lib/data'
import { RESERVATION_AMOUNT_MXN } from '@/lib/marketing'

export const metadata: Metadata = {
  title: 'Solicitud de información e inscripción',
  description:
    'Solicita informes para estudiar preparatoria, licenciatura o maestría con RVOE SEP Durango en modalidad virtual.',
}

const trustItems = [
  {
    icon: ShieldCheck,
    title: 'RVOE visible por programa',
    text: 'Revisa el número de acuerdo antes de iniciar tu proceso.',
  },
  {
    icon: FileCheck2,
    title: 'Expediente de admisión',
    text: 'Te orientamos con documentos, requisitos y fechas de ingreso.',
  },
  {
    icon: UserCheck,
    title: 'Seguimiento humano',
    text: 'Un asesor te acompaña por WhatsApp para resolver dudas antes de pagar.',
  },
]

type InscripcionPageProps = {
  searchParams?: Promise<{
    programa?: string | string[]
    apartar?: string | string[]
  }>
}

function getSearchValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value
}

export default async function InscripcionPage({ searchParams }: InscripcionPageProps) {
  const params = (await searchParams) || {}
  const selectedProgramId = getSearchValue(params.programa) || ''
  const reservationAmount = getSearchValue(params.apartar)
  const selectedProgram = programas.find((programa) => programa.id === selectedProgramId)
  const hasReservationIntent = reservationAmount === String(RESERVATION_AMOUNT_MXN)

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="container mx-auto flex h-20 items-center justify-between px-4 md:px-6">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-brand-primary">
            <ArrowLeft className="h-4 w-4" />
            Volver a la página principal
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-primary text-white">
              <GraduationCap className="h-6 w-6" />
            </div>
            <span className="hidden text-sm font-black text-slate-950 sm:inline">Instituto Universitario de Durango</span>
          </div>
        </div>
      </header>

      <section className="py-14 sm:py-20">
        <div className="container mx-auto grid gap-10 px-4 md:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <div className="mb-5 inline-flex rounded-full bg-brand-primary/10 px-4 py-2 text-xs font-black uppercase tracking-widest text-brand-primary">
              Admisiones abiertas
            </div>
            <h1 className="text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
              Solicita informes para iniciar tu inscripción
            </h1>
            <p className="mt-5 text-lg font-medium leading-relaxed text-slate-600">
              Déjanos tus datos y nos conectaremos contigo por WhatsApp para explicarte costos, RVOE, requisitos, modalidad y cómo funciona nuestro programa para <strong className="text-slate-900">revalidar materias</strong>.
            </p>

            <div className="mt-8 grid gap-4">
              {trustItems.map((item) => (
                <div key={item.title} className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-primary text-white">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="font-black text-slate-950">{item.title}</h2>
                    <p className="mt-1 text-sm font-medium leading-relaxed text-slate-600">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/60 sm:p-7">
            {hasReservationIntent && (
              <div className="mb-5 rounded-2xl border border-brand-highlight/40 bg-brand-highlight/10 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-highlight text-slate-950">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-brand-primary">Apartado seleccionado</p>
                    <h2 className="mt-1 text-xl font-black text-slate-950">
                      ${RESERVATION_AMOUNT_MXN} MXN
                    </h2>
                    <p className="mt-1 text-sm font-medium leading-relaxed text-slate-600">
                      {selectedProgram
                        ? `Completa tus datos para apartar tu lugar en ${selectedProgram.nombre} y recibir el enlace de pago seguro por Clip.`
                        : 'Completa tus datos para apartar tu lugar y recibir el enlace de pago seguro por Clip.'}
                    </p>
                  </div>
                </div>
              </div>
            )}
            <AdmissionLeadForm
              defaultProgramId={selectedProgramId}
              source={hasReservationIntent ? 'apartado_clip' : 'inscripcion'}
              title="Formulario de admisión"
              description="Llena el formulario y te conectaremos directamente a WhatsApp con un asesor para resolver todas tus dudas sobre costos y revalidación."
              submitLabel="Enviar por WhatsApp"
            />
          </div>
        </div>
      </section>
    </main>
  )
}