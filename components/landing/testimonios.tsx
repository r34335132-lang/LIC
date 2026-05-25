'use client'

import { motion } from 'framer-motion'
import { BriefcaseBusiness, Quote, RotateCcw, ShieldCheck, Users } from 'lucide-react'
import { homeTestimonials } from '@/lib/program-content'

const testimonialIcons = [BriefcaseBusiness, RotateCcw, Users, ShieldCheck]

export function Testimonios() {
  return (
    <section className="bg-slate-50 py-20 sm:py-24 lg:py-28">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mb-12 max-w-3xl">
          <div className="mb-4 inline-flex items-center gap-2 border-l-4 border-brand-highlight bg-white px-4 py-2 text-xs font-black uppercase tracking-widest text-brand-primary shadow-sm">
            <Users className="h-4 w-4" />
            Testimonios de alumnos
          </div>
          <h2 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
            Historias de personas que necesitaban una opción flexible
          </h2>
          <p className="mt-4 max-w-2xl text-base font-medium leading-relaxed text-slate-600">
            Mensajes breves, concretos y centrados en las razones reales por las que alguien vuelve a estudiar.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {homeTestimonials.map((testimonial, index) => {
            const Icon = testimonialIcons[index] || Quote

            return (
              <motion.article
                key={testimonial.name}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.06 }}
                className="border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-slate-200/70"
              >
                <div className="mb-5 flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center bg-brand-primary text-white">
                    <Icon className="h-5 w-5" />
                  </div>
                  <Quote className="h-6 w-6 text-brand-highlight" />
                </div>
                <p className="text-sm font-medium leading-relaxed text-slate-700">{testimonial.text}</p>
                <div className="mt-6 border-t border-slate-200 pt-4">
                  <p className="font-black text-slate-950">{testimonial.name}</p>
                  <p className="mt-1 text-xs font-black uppercase tracking-widest text-slate-500">{testimonial.profile}</p>
                </div>
              </motion.article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
