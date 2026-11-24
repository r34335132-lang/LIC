'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { WhatsAppIcon } from '@/components/marketing/whatsapp-icon'
import { WhatsAppLink } from '@/components/marketing/whatsapp-link'

export function Hero() {
  return (
    <section className="relative min-h-[100dvh] overflow-hidden bg-slate-950 text-white">
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2400&auto=format&fit=crop"
          alt="Estudiantes de educación en línea en México — Instituto Universitario de Durango"
          width={2400}
          height={1600}
          fetchPriority="high"
          decoding="async"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-slate-950/55" />
        <div className="absolute inset-0 bg-[linear-gradient(105deg,rgba(4,31,78,0.92)_0%,rgba(10,77,204,0.55)_48%,rgba(15,23,42,0.35)_100%)]" />
      </div>

      <div className="container relative z-10 mx-auto flex min-h-[100dvh] flex-col justify-center px-4 pb-16 pt-36 md:px-6 lg:pt-40">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="max-w-3xl"
        >
          <p className="mb-5 text-sm font-black uppercase tracking-[0.22em] text-brand-highlight sm:text-base">
            Instituto Universitario de Durango
          </p>

          <h1 className="text-4xl font-black leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl xl:text-7xl">
            Preparatoria, licenciaturas y maestrías en línea en México
          </h1>

          <p className="mt-6 max-w-xl text-base font-medium leading-relaxed text-white/85 sm:text-lg">
            Estudia desde cualquier estado con horarios flexibles, revalidación de materias y
            acompañamiento académico.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button
              asChild
              size="lg"
              className="h-14 rounded-md bg-brand-primary px-8 text-sm font-black uppercase tracking-wider text-white shadow-xl shadow-brand-primary/30 hover:bg-brand-primary/90"
            >
              <Link href="/inscripcion">
                <UserPlus className="mr-2 h-5 w-5" />
                Apartar mi lugar
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>

            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-14 rounded-md border-white/35 bg-white/10 px-8 text-sm font-black uppercase tracking-wider text-white backdrop-blur hover:bg-white hover:text-slate-950"
            >
              <WhatsAppLink>
                <WhatsAppIcon className="mr-2 h-5 w-5" />
                Pedir informes
              </WhatsAppLink>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
