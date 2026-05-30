import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, GraduationCap, ShieldCheck, FileCheck2 } from 'lucide-react'
import { Suspense } from 'react'
import { InscripcionForm } from '@/components/inscripcion/inscripcion-form'

export const metadata: Metadata = {
  title: 'Solicitud de inscripción',
  description: 'Solicita tu inscripción al Instituto Universitario de Durango.',
}

type InscripcionPageProps = {
  searchParams?: Promise<{ programa?: string }>
}

export default async function InscripcionPage({ searchParams }: InscripcionPageProps) {
  const params = (await searchParams) || {}

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
              Inscripción en línea
            </div>
            <h1 className="text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
              Solicita tu inscripción
            </h1>
            <p className="mt-5 text-lg font-medium leading-relaxed text-slate-600">
              Completa el formulario para registrar tu solicitud de admisión. Un administrador revisará tu información y te contactará para continuar el proceso.
            </p>

            <div className="mt-8 grid gap-4">
              {[
                { icon: ShieldCheck, title: 'Proceso seguro', text: 'Tus datos se almacenan de forma segura en nuestra plataforma académica.' },
                { icon: FileCheck2, title: 'Revisión administrativa', text: 'Tu solicitud será revisada y, al ser aprobada, recibirás tus credenciales de acceso.' },
              ].map((item) => (
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
            <h2 className="text-xl font-black text-slate-950 mb-1">Formulario de inscripción</h2>
            <p className="text-sm text-muted-foreground mb-6">
              {params.programa ? `Programa seleccionado: ${params.programa}` : 'Selecciona tu programa de interés.'}
            </p>
            <Suspense fallback={<div className="h-40 animate-pulse rounded-lg bg-slate-100" />}>
              <InscripcionForm />
            </Suspense>
          </div>
        </div>
      </section>
    </main>
  )
}
