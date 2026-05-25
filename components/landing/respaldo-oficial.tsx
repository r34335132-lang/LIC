'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Award, ExternalLink, FileCheck2, Landmark, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { programas } from '@/lib/data'
import { RVOE_CONSULTA_URL } from '@/lib/marketing'

const respaldoItems = [
  {
    icon: Landmark,
    title: 'RVOE SEP Durango',
    text: 'Reconocimiento otorgado para planes y programas específicos.',
  },
  {
    icon: FileCheck2,
    title: 'Documentación oficial',
    text: 'Certificado, título o grado conforme al nivel académico cursado.',
  },
  {
    icon: ShieldCheck,
    title: 'Consulta transparente',
    text: 'Números de acuerdo visibles antes de solicitar inscripción.',
  },
]

export function RespaldoOficial() {
  const programasConRvoe = programas.filter((programa) => programa.rvoe)

  return (
    <section id="respaldo-oficial" className="bg-white py-20 sm:py-24 lg:py-28">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="grid gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:items-start"
        >
          <div className="max-w-xl">
            <div className="mb-5 inline-flex items-center gap-2 border-l-4 border-brand-highlight bg-brand-primary/10 px-4 py-2 text-xs font-black uppercase tracking-widest text-brand-primary">
              <Award className="h-4 w-4" />
              Respaldo institucional
            </div>
            <h2 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
              Estudia con respaldo oficial
            </h2>
            <p className="mt-5 text-base font-medium leading-relaxed text-slate-600 sm:text-lg">
              El RVOE se otorga por programa. Por eso mostramos el acuerdo correspondiente en cada opción académica, con duración y modalidad desde el primer contacto.
            </p>

            <div className="mt-8 grid gap-4">
              {respaldoItems.map((item) => (
                <div key={item.title} className="flex gap-4 border border-slate-200 bg-slate-50 p-5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center bg-white text-brand-primary shadow-sm">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-950">{item.title}</h3>
                    <p className="mt-1 text-sm font-medium leading-relaxed text-slate-600">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>

            <Button asChild className="mt-8 h-12 rounded-md bg-brand-primary px-6 font-black text-white hover:bg-brand-primary/90">
              <Link href={RVOE_CONSULTA_URL} target="_blank" rel="noopener noreferrer">
                Consultar validez oficial
                <ExternalLink className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="overflow-hidden border border-slate-200 bg-white shadow-xl shadow-slate-200/70">
            <div className="border-b border-slate-200 bg-slate-950 px-5 py-5 text-white sm:px-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-brand-highlight">Relación de programas</p>
                  <h3 className="mt-1 text-2xl font-black">Acuerdos RVOE visibles</h3>
                </div>
                <div className="flex h-11 w-11 items-center justify-center border border-white/15 bg-white/10">
                  <ShieldCheck className="h-5 w-5 text-brand-highlight" />
                </div>
              </div>
            </div>

            <div className="divide-y divide-slate-200">
              {programasConRvoe.map((programa) => (
                <Link
                  key={programa.id}
                  href={`/programas/${programa.id}`}
                  className="group grid gap-3 px-5 py-4 transition hover:bg-slate-50 sm:grid-cols-[1fr_auto] sm:items-center sm:px-6"
                >
                  <div>
                    <p className="font-black text-slate-950 group-hover:text-brand-primary">{programa.nombre}</p>
                    <p className="mt-1 text-xs font-bold uppercase tracking-widest text-slate-500">
                      {programa.duracion} · Modalidad virtual
                    </p>
                  </div>
                  <div className="w-fit border border-brand-primary/20 bg-brand-primary/10 px-3 py-1.5 text-xs font-black uppercase tracking-widest text-brand-primary">
                    RVOE {programa.rvoe}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
