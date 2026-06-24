'use client'

import Link from 'next/link'
import { motion, type Variants } from 'framer-motion'
import { ArrowRight, BookOpen, Clock3, MonitorPlay, ShieldCheck, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { programas } from '@/lib/data'
import { getProgramaIcono } from '@/lib/icons'
import { getProgramWhatsAppMessage, buildPreInscripcionUrl } from '@/lib/marketing'
import { programBenefits } from '@/lib/program-content'
import { TrackLink } from '@/components/marketing/track-link'
import { WhatsAppIcon } from '@/components/marketing/whatsapp-icon'
import { WhatsAppLink } from '@/components/marketing/whatsapp-link'

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

type Program = (typeof programas)[number]
type ProgramGroupType = 'preparatoria' | 'licenciatura' | 'maestria'

function ProgramCard({
  programa,
  levelLabel,
  featured = false,
}: {
  programa: Program
  levelLabel: string
  featured?: boolean
}) {
  const Icon = getProgramaIcono(programa.id)
  const benefit = programBenefits[programa.id] || programa.descripcion

  const renderPreInscripcion = () => (
    <Link
      href={buildPreInscripcionUrl(programa.id)}
      className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-brand-highlight/50 bg-brand-highlight px-3.5 py-2.5 text-xs font-black text-slate-950 transition hover:bg-white"
    >
      <span className="inline-flex min-w-0 items-center gap-2">
        <UserPlus className="h-4 w-4 shrink-0" />
        <span className="truncate">Pre inscríbete hoy</span>
      </span>
      <ArrowRight className="h-4 w-4 shrink-0" />
    </Link>
  )

  const renderActions = () => (
    <div className={`mt-4 grid gap-3 ${featured ? 'sm:grid-cols-2' : ''}`}>
      <Button asChild className="h-11 rounded-xl bg-white font-black text-brand-primary shadow-lg hover:bg-brand-highlight hover:text-slate-950">
        <WhatsAppLink
          message={getProgramWhatsAppMessage(programa.nombre, programa.rvoe)}
          programId={programa.id}
        >
          <WhatsAppIcon className="mr-2 h-4 w-4" />
          Pedir informes
        </WhatsAppLink>
      </Button>

      <Button asChild variant="outline" className="h-11 rounded-xl border-white/25 bg-transparent font-black text-white hover:bg-white hover:text-slate-950">
        <TrackLink
          href={`/programas/${programa.id}`}
          event="view_program"
          payload={{ programId: programa.id, programName: programa.nombre, source: 'program_card' }}
        >
          <BookOpen className="mr-2 h-4 w-4" />
          Ver programa
        </TrackLink>
      </Button>
    </div>
  )

  return (
    <motion.article
      variants={fadeInUp}
      className={`${featured ? 'min-h-[450px] sm:min-h-[500px] lg:col-span-2' : 'h-[560px] sm:h-[580px]'} group relative flex overflow-hidden rounded-[1.75rem] bg-slate-950 shadow-xl shadow-slate-200/70 transition duration-500 hover:-translate-y-1 hover:shadow-2xl hover:shadow-brand-primary/15`}
    >
      <img
        src={programa.imagen || '/placeholder.jpg'}
        alt={programa.nombre}
        className="absolute inset-0 h-full w-full object-cover transition duration-1000 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-slate-950/10" />
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(10,77,204,0.55),transparent_46%)] opacity-80" />

      <div className="absolute left-5 top-5 z-10 flex flex-wrap gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-white backdrop-blur">
          <ShieldCheck className="h-3.5 w-3.5 text-brand-highlight" />
          RVOE {programa.rvoe}
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-white backdrop-blur">
          <MonitorPlay className="h-3.5 w-3.5 text-brand-highlight" />
          Virtual
        </span>
      </div>

      <div className="relative z-10 mt-auto flex w-full flex-col p-5 text-white sm:p-6">
        <div className={`grid gap-5 ${featured ? 'lg:grid-cols-[1fr_0.9fr] lg:items-end' : ''}`}>
          <div>
            <div className={`${featured ? 'mb-5 h-14 w-14' : 'mb-4 h-12 w-12'} flex items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-white shadow-xl backdrop-blur transition duration-500 group-hover:-translate-y-1 group-hover:bg-white group-hover:text-brand-primary`}>
              <Icon className={featured ? 'h-7 w-7' : 'h-6 w-6'} />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-brand-highlight">{levelLabel}</p>
            <TrackLink
              href={`/programas/${programa.id}`}
              event="view_program"
              payload={{ programId: programa.id, programName: programa.nombre, source: 'program_title' }}
              className="block"
            >
              <h3 className={`${featured ? 'sm:text-3xl' : ''} mt-2 text-2xl font-black leading-tight tracking-tight text-white transition hover:text-brand-highlight`}>
                {programa.nombre}
              </h3>
            </TrackLink>
            <p className={`${featured ? 'line-clamp-2' : 'line-clamp-1'} mt-3 text-sm font-medium leading-relaxed text-white/80`}>
              {programa.descripcion}
            </p>
          </div>

          {featured ? (
            <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-md">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-white/10 p-3">
                  <Clock3 className="mb-2 h-4 w-4 text-brand-highlight" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/55">Duración</p>
                  <p className="mt-1 text-sm font-black text-white">{programa.duracion}</p>
                </div>
                <div className="rounded-xl bg-white/10 p-3">
                  <MonitorPlay className="mb-2 h-4 w-4 text-brand-highlight" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/55">Modalidad</p>
                  <p className="mt-1 text-sm font-black text-white">Virtual</p>
                </div>
              </div>

              <div className="mt-4 border-l-2 border-brand-highlight bg-slate-950/35 px-4 py-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-brand-highlight">Beneficio principal</p>
                <p className="mt-1 line-clamp-2 text-sm font-semibold leading-relaxed text-white/80">{benefit}</p>
              </div>

              {renderPreInscripcion()}
              {renderActions()}
            </div>
          ) : (
            <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-md">
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-white">
                  <Clock3 className="h-3.5 w-3.5 text-brand-highlight" />
                  {programa.duracion}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-white">
                  <MonitorPlay className="h-3.5 w-3.5 text-brand-highlight" />
                  Virtual
                </span>
              </div>

              <div className="mt-4 border-l-2 border-brand-highlight bg-slate-950/35 px-4 py-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-brand-highlight">Beneficio principal</p>
                <p className="mt-1 line-clamp-1 text-sm font-semibold leading-relaxed text-white/80">{benefit}</p>
              </div>

              {renderPreInscripcion()}
              {renderActions()}
            </div>
          )}
        </div>
      </div>
    </motion.article>
  )
}

function ProgramGroup({
  title,
  description,
  items,
  type,
}: {
  title: string
  description: string
  items: Program[]
  type: ProgramGroupType
}) {
  if (items.length === 0) return null

  const gridClass =
    type === 'preparatoria'
      ? 'grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-2'
      : type === 'licenciatura'
        ? 'grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2 xl:grid-cols-4'
        : 'grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2'

  const levelLabel =
    type === 'preparatoria'
      ? 'Educación media superior'
      : type === 'licenciatura'
        ? 'Licenciatura'
        : 'Posgrado'

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
      variants={staggerContainer}
      className="space-y-8"
    >
      <div className="flex items-center gap-4 sm:gap-6">
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-widest text-brand-primary">{title}</p>
          <h3 className="mt-2 text-2xl font-black tracking-tight text-slate-950 sm:text-4xl">{title}</h3>
          <p className="mt-2 max-w-2xl text-sm font-medium leading-relaxed text-slate-600">{description}</p>
        </div>
        <div className="hidden h-px flex-1 bg-gradient-to-r from-slate-200 to-transparent sm:block" />
        <ArrowRight className="hidden h-7 w-7 text-brand-highlight sm:block" />
      </div>

      <div className={gridClass}>
        {items.map((programa) => (
          <ProgramCard
            key={programa.id}
            programa={programa}
            levelLabel={levelLabel}
            featured={type === 'preparatoria'}
          />
        ))}
      </div>
    </motion.div>
  )
}

export function OfertaAcademica() {
  const preparatoria = programas.filter((programa) => programa.tipo === 'preparatoria' && programa.rvoe)
  const licenciaturas = programas.filter((programa) => programa.tipo === 'licenciatura' && programa.rvoe)
  const maestrias = programas.filter((programa) => programa.tipo === 'maestria' && programa.rvoe)

  return (
    <section id="oferta" className="relative overflow-hidden bg-slate-50 py-20 sm:py-24 lg:py-28">
      <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-brand-primary/5 blur-3xl" />
      <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-brand-highlight/10 blur-3xl" />

      <div className="container relative z-10 mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-14 max-w-4xl"
        >
          <div className="mb-4 inline-flex items-center gap-2 border-l-4 border-brand-highlight bg-white px-4 py-2 text-xs font-black uppercase tracking-widest text-brand-primary shadow-sm">
            <ShieldCheck className="h-4 w-4" />
            Oferta académica con RVOE
          </div>
          <h2 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
            Programas en línea para estudiantes de todo México
          </h2>
          <p className="mt-5 max-w-2xl text-base font-medium leading-relaxed text-slate-600 sm:text-lg">
            Compara duración, modalidad y RVOE antes de solicitar informes. Estudia desde cualquier estado de México con horarios flexibles y acompañamiento académico.
          </p>
        </motion.div>

        <div className="space-y-16 sm:space-y-20">
          <ProgramGroup
            title="Preparatoria"
            description="Una ruta flexible para concluir el nivel medio superior y continuar con universidad o crecimiento laboral."
            items={preparatoria}
            type="preparatoria"
          />
          <ProgramGroup
            title="Licenciaturas"
            description="Planes de estudio para personas que necesitan avanzar sin abandonar sus responsabilidades actuales."
            items={licenciaturas}
            type="licenciatura"
          />
          <ProgramGroup
            title="Maestrías"
            description="Posgrados para fortalecer tu perfil docente, directivo o académico con modalidad virtual."
            items={maestrias}
            type="maestria"
          />
        </div>
      </div>
    </section>
  )
}
