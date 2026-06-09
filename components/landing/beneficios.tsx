'use client'

import { motion, type Variants } from 'framer-motion'
import { BookOpenCheck, CalendarClock, Headphones, Laptop, ShieldCheck, UserCheck } from 'lucide-react'

const beneficios = [
  {
    icon: ShieldCheck,
    title: 'Respaldo oficial visible',
    description: 'Consulta el RVOE del programa antes de iniciar tu proceso de inscripción.',
  },
  {
    icon: CalendarClock,
    title: 'Horarios pensados para adultos',
    description: 'Una modalidad flexible para estudiar aunque trabajes, tengas familia o hayas pausado tus estudios.',
  },
  {
    icon: Laptop,
    title: 'Clases virtuales',
    description: 'Accede a sesiones y materiales desde donde estés, con seguimiento durante el curso.',
  },
  {
    icon: Headphones,
    title: 'Asesoría de admisiones',
    description: 'Te explicamos requisitos, costos y fechas de inicio sin rodeos ni presión innecesaria.',
  },
  {
    icon: BookOpenCheck,
    title: 'Plan de estudios claro',
    description: 'Revisa materias, duración y perfil de egreso antes de elegir tu programa.',
  },
  {
    icon: UserCheck,
    title: 'Acompañamiento académico',
    description: 'No estudias en soledad: recibes orientación para avanzar y mantener continuidad.',
  },
]

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

export function Beneficios() {
  return (
    <section id="beneficios" className="bg-white py-20 sm:py-24 lg:py-28">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-5 inline-flex rounded-full bg-brand-primary/10 px-4 py-2 text-xs font-black uppercase tracking-widest text-brand-primary">
              Modelo flexible
            </div>
            <h2 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
              Estudiar debe sentirse posible, no complicado
            </h2>
            <p className="mt-5 text-base font-medium leading-relaxed text-slate-600 sm:text-lg">
              El Instituto Universitario de Durango atiende a estudiantes de todo México que quieren avanzar con estructura, claridad y acompañamiento, sin perder de vista la validez oficial de sus estudios.
            </p>

            <div className="mt-8 overflow-hidden rounded-[1.5rem] border border-slate-200">
              <img
                src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1600&auto=format&fit=crop"
                alt="Alumno estudiando en modalidad virtual"
                className="h-72 w-full object-cover sm:h-96"
              />
            </div>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-70px' }}
            transition={{ staggerChildren: 0.08 }}
            className="grid gap-4 sm:grid-cols-2"
          >
            {beneficios.map((beneficio) => (
              <motion.div
                key={beneficio.title}
                variants={fadeInUp}
                className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-5 transition hover:-translate-y-0.5 hover:border-brand-primary/30 hover:bg-white hover:shadow-xl hover:shadow-slate-200/70"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-primary text-white">
                  <beneficio.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-black text-slate-950">{beneficio.title}</h3>
                <p className="mt-2 text-sm font-medium leading-relaxed text-slate-600">{beneficio.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
