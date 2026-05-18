'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { programas } from '@/lib/data'
import { getProgramaIcono } from '@/lib/icons'
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, GraduationCap, FileText, ShieldCheck } from 'lucide-react'

// Animaciones base
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } }
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
}

export function OfertaAcademica() {
  const preparatoria = programas.filter(p => p.tipo === 'preparatoria')
  const licenciaturas = programas.filter(p => p.tipo === 'licenciatura')
  const maestrias = programas.filter(p => p.tipo === 'maestria')
  const cursos = programas.filter(p => p.tipo === 'curso')

  // Función auxiliar para renderizar las tarjetas animadas
  const renderProgramaCard = (programa: any, tipoLabel: string, colSpanClass: string = "col-span-1") => {
    const Icon = getProgramaIcono(programa.id)

    return (
      <motion.div key={programa.id} variants={fadeInUp} className={colSpanClass}>
        <Card className="group relative overflow-hidden border-0 bg-transparent rounded-[2rem] min-h-[480px] shadow-2xl hover:shadow-brand-primary/20 transition-all duration-500 h-full flex flex-col">
          
          {/* Imagen de fondo con Zoom al hacer hover */}
          <div className="absolute inset-0 z-0">
            <img 
              src={programa.imagen || '/placeholder.jpg'} 
              alt={programa.nombre} 
              className="object-cover w-full h-full transition-transform duration-1000 group-hover:scale-110"
            />
            {/* Gradiente oscuro mejorado para legibilidad */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/80 to-transparent group-hover:from-black group-hover:via-black/90 transition-colors duration-500" />
          </div>

          {/* BADGE DE RVOE OFICIAL (Aparece en la esquina superior derecha) */}
          <div className="absolute top-5 right-5 z-20">
            <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md border border-white/20 text-white px-3 py-1.5 rounded-full shadow-lg">
              <ShieldCheck className="h-3.5 w-3.5 text-brand-primary" />
              <span className="text-[10px] font-bold uppercase tracking-widest">
                {programa.rvoe ? `RVOE: ${programa.rvoe}` : 'Validez Oficial SEP'}
              </span>
            </div>
          </div>

          <CardContent className="relative z-10 flex flex-col flex-1 justify-end p-8 text-white h-full">
            <div className="mb-4 mt-auto">
              {/* Icono del programa flotante */}
              <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl group-hover:-translate-y-3 transition-transform duration-500">
                <Icon className="h-8 w-8 text-white group-hover:text-brand-primary transition-colors duration-300" />
              </div>
              
              <div className="flex gap-2 flex-wrap mb-4">
                <Badge className="bg-brand-primary text-white border-0 font-bold px-3 py-1 text-xs uppercase tracking-wider shadow-md">
                  {programa.duracion}
                </Badge>
                <Badge variant="outline" className="text-white border-white/30 backdrop-blur-md font-semibold px-3 py-1 text-xs uppercase tracking-wider">
                  {tipoLabel}
                </Badge>
              </div>
              
              <CardTitle className="text-3xl font-black leading-tight mb-3 group-hover:text-brand-highlight transition-colors duration-300">
                {programa.nombre}
              </CardTitle>
              
              <CardDescription className="text-gray-300 font-medium mb-8 line-clamp-3 leading-relaxed">
                {programa.descripcion}
              </CardDescription>
            </div>

            {/* ENLACE DIRECTO A LA LANDING PAGE DE LA CARRERA */}
            <Link href={`/programas/${programa.id}`} className="w-full block mt-auto">
              <Button className="w-full rounded-xl bg-white text-slate-900 hover:bg-brand-primary hover:text-white transition-all duration-300 h-14 font-bold text-lg group/btn shadow-xl hover:scale-[1.02]">
                <FileText className="mr-2 h-5 w-5" /> Ver Plan de Estudios
                <ArrowRight className="ml-auto h-5 w-5 opacity-0 -translate-x-4 group-hover/btn:opacity-100 group-hover/btn:translate-x-0 transition-all duration-300" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <section id="oferta" className="relative py-32 bg-slate-50 dark:bg-zinc-950 overflow-hidden">
      
      {/* Fondos decorativos dinámicos estilo "Glow" */}
      <div className="absolute top-0 right-0 -mt-20 -mr-20 w-[600px] h-[600px] bg-brand-primary/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-[500px] h-[500px] bg-brand-highlight/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="container relative z-10 px-4 md:px-6 mx-auto">
        
        {/* Encabezado Principal Animado */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto mb-24 max-w-4xl text-center"
        >
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold text-xs mb-6 shadow-sm border border-slate-800 cursor-default uppercase tracking-widest">
            <GraduationCap className="h-4 w-4 text-brand-primary" />
            Oferta Educativa Oficial
          </div>
          <h2 className="mb-6 text-5xl font-black tracking-tight text-slate-900 dark:text-white md:text-6xl lg:text-7xl leading-[1.1]">
            Encuentra tu <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-highlight">Verdadera Vocación</span>
          </h2>
          <p className="text-xl text-slate-600 dark:text-zinc-400 font-light text-balance max-w-2xl mx-auto leading-relaxed">
            Programas respaldados por la SEP, enfocados en la práctica y diseñados para que destaques en el mundo laboral real.
          </p>
        </motion.div>

        {/* ================= PREPARATORIA ================= */}
        {preparatoria.length > 0 && (
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={staggerContainer}
            className="mb-32"
          >
            <div className="flex items-center gap-6 mb-12">
              <h3 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">Preparatoria</h3>
              <div className="h-[2px] flex-1 bg-gradient-to-r from-slate-200 dark:from-zinc-800 to-transparent"></div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {preparatoria.map((programa) => renderProgramaCard(programa, "Educación Media Superior", "lg:col-span-2"))}
            </div>
          </motion.div>
        )}

        {/* ================= LICENCIATURAS ================= */}
        {licenciaturas.length > 0 && (
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={staggerContainer}
            className="mb-32"
          >
            <div className="flex items-center gap-6 mb-12">
              <h3 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">Licenciaturas</h3>
              <div className="h-[2px] flex-1 bg-gradient-to-r from-slate-200 dark:from-zinc-800 to-transparent"></div>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4">
              {licenciaturas.map((programa) => renderProgramaCard(programa, "Licenciatura"))}
            </div>
          </motion.div>
        )}

        {/* ================= MAESTRÍAS ================= */}
        {maestrias.length > 0 && (
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={staggerContainer}
            className="mb-32"
          >
            <div className="flex items-center gap-6 mb-12">
              <h3 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">Maestrías</h3>
              <div className="h-[2px] flex-1 bg-gradient-to-r from-slate-200 dark:from-zinc-800 to-transparent"></div>
            </div>
            <div className="grid gap-8 md:grid-cols-2">
              {maestrias.map((programa) => renderProgramaCard(programa, "Posgrado"))}
            </div>
          </motion.div>
        )}

        {/* ================= CURSOS ================= */}
        {cursos.length > 0 && (
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={staggerContainer}
          >
            <div className="flex items-center gap-6 mb-12">
              <h3 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">Cursos Especializados</h3>
              <div className="h-[2px] flex-1 bg-gradient-to-r from-slate-200 dark:from-zinc-800 to-transparent"></div>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {cursos.map((programa) => renderProgramaCard(programa, "Certificación"))}
            </div>
          </motion.div>
        )}

      </div>
    </section>
  )
}