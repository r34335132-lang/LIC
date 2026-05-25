'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  Award,
  CalendarDays,
  FileCheck2,
  ShieldCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { WhatsAppIcon } from '@/components/marketing/whatsapp-icon'
import { WhatsAppLink } from '@/components/marketing/whatsapp-link'

const stats = [
  { value: 'RVOE', label: 'Validez oficial por programa' },
  { value: '$600', label: 'Mensualidad desde' },
  { value: 'Virtual', label: 'Clases y seguimiento' },
  { value: 'Durango', label: 'Respaldo institucional' },
]

export function Hero() {
  return (
    <section className="relative min-h-[94dvh] overflow-hidden bg-slate-950 pt-32 text-white sm:pt-36 lg:pt-44">
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=2100&auto=format&fit=crop"
          alt="Estudiantes en institución educativa"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/62" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(4,31,78,0.96),rgba(10,77,204,0.78)_42%,rgba(15,23,42,0.22)_74%)]" />
      </div>

      <div className="container relative z-10 mx-auto grid min-h-[calc(94dvh-8rem)] items-start gap-10 px-4 pb-28 md:px-6 lg:grid-cols-[1.22fr_0.78fr] lg:pb-24">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="max-w-4xl"
        >
          <div className="mb-5 inline-flex items-center gap-2 border-l-4 border-brand-highlight bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-widest text-white backdrop-blur">
            <Award className="h-4 w-4 text-brand-highlight" />
            Programas con validez oficial
          </div>

          <h1 className="text-4xl font-black leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-5xl 2xl:text-6xl">
            Estudia preparatoria, licenciatura o maestría con validez oficial SEP en Durango
          </h1>

          <p className="mt-5 max-w-2xl text-base font-medium leading-relaxed text-white/85 sm:text-lg">
            Clases virtuales, horarios flexibles y acompañamiento durante tu proceso para avanzar sin dejar tu trabajo.
          </p>

          <div className="mt-5 max-w-2xl border-l-4 border-brand-highlight bg-black/35 p-4 shadow-2xl backdrop-blur-md sm:p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-brand-highlight">
                  <FileCheck2 className="h-4 w-4" />
                  Promoción vigente
                </div>
                <p className="mt-2 text-2xl font-black text-white">
                  Inscripción gratis
                </p>
              </div>
              <div className="h-px bg-white/20 sm:h-16 sm:w-px" />
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-white/55">Mensualidad desde</p>
                <p className="mt-1 text-3xl font-black text-white">
                  $600 <span className="text-sm font-bold text-white/65">MXN</span>
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="h-14 rounded-md bg-brand-primary px-7 text-sm font-black uppercase tracking-wider text-white shadow-xl shadow-brand-primary/25 hover:bg-brand-primary/90"
            >
              <WhatsAppLink>
                <WhatsAppIcon className="mr-2 h-5 w-5" />
                Quiero informes por WhatsApp
              </WhatsAppLink>
            </Button>

            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-14 rounded-md border-white/30 bg-white/10 px-7 text-sm font-black uppercase tracking-wider text-white backdrop-blur hover:bg-white hover:text-slate-950"
            >
              <Link href="/#oferta">
                Ver programas con RVOE
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="hidden lg:block"
        >
          <div className="ml-auto max-w-md border border-white/15 bg-white/10 p-6 shadow-2xl backdrop-blur-md">
            <div className="border border-white/15 bg-slate-950/55 p-6">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center bg-brand-primary text-white">
                  <CalendarDays className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-brand-highlight">Nuevo ingreso</p>
                  <p className="font-black text-white">Proceso guiado por admisiones</p>
                </div>
              </div>
              <p className="text-sm font-medium leading-relaxed text-white/75">
                Solicita requisitos, fecha del próximo grupo y números de RVOE antes de iniciar tu inscripción.
              </p>
              <div className="mt-6 space-y-3">
                {['Preparatoria en 2 años', 'Licenciaturas virtuales', 'Maestrías en educación'].map((item) => (
                  <div key={item} className="flex items-center gap-3 border-t border-white/10 pt-3 text-sm font-bold text-white">
                    <ShieldCheck className="h-4 w-4 text-brand-highlight" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="absolute bottom-0 left-0 z-20 w-full border-t border-white/15 bg-brand-primary text-white shadow-[0_-10px_30px_rgba(0,0,0,0.22)]">
        <div className="container mx-auto grid grid-cols-2 divide-x divide-white/15 px-4 py-4 pr-28 text-center sm:grid-cols-4 md:px-6 lg:pr-56">
          {stats.map((stat) => (
            <div key={stat.label} className="px-3">
              <p className="text-xl font-black sm:text-2xl">{stat.value}</p>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-white/75 sm:text-xs">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
