'use client'

import Link from 'next/link'
import { programas } from '@/lib/data'
import { getProgramaIcono } from '@/lib/icons'
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, GraduationCap, FileText } from 'lucide-react'

export function OfertaAcademica() {
  const preparatoria = programas.filter(p => p.tipo === 'preparatoria')
  const licenciaturas = programas.filter(p => p.tipo === 'licenciatura')
  const maestrias = programas.filter(p => p.tipo === 'maestria')
  const cursos = programas.filter(p => p.tipo === 'curso')

  // Función auxiliar para renderizar el estilo "Espectacular" de las tarjetas
  const renderProgramaCard = (programa: any, tipoLabel: string, colSpanClass: string = "col-span-1") => {
    const Icon = getProgramaIcono(programa.id)

    return (
      <Card key={programa.id} className={`group relative overflow-hidden border-0 bg-transparent rounded-[2rem] min-h-[450px] shadow-2xl hover:shadow-brand-primary/20 transition-all duration-500 ${colSpanClass}`}>
        
        {/* Imagen de fondo con Zoom al hacer hover */}
        <div className="absolute inset-0 z-0">
          {/* SOLUCIÓN: Usamos la imagen específica de cada carrera cargada desde data.ts */}
          <img 
            src={programa.imagen || '/placeholder.jpg'} 
            alt={programa.nombre} 
            className="object-cover w-full h-full transition-transform duration-1000 group-hover:scale-110"
          />
          {/* Gradiente oscuro para que el texto sea siempre legible */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/20 group-hover:from-black group-hover:via-black/60 transition-colors duration-500" />
        </div>

        <CardContent className="relative z-10 h-full flex flex-col justify-end p-8 text-white">
          <div className="mb-4">
            <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl group-hover:-translate-y-2 transition-transform duration-500">
              <Icon className="h-7 w-7 text-white" />
            </div>
            <div className="flex gap-2 flex-wrap mb-4">
              <Badge className="bg-brand-primary text-white border-0 font-bold px-3 py-1 text-xs uppercase tracking-wider">
                {programa.duracion}
              </Badge>
              <Badge variant="outline" className="text-white border-white/30 backdrop-blur-md font-semibold px-3 py-1 text-xs uppercase tracking-wider">
                {tipoLabel}
              </Badge>
            </div>
            
            <CardTitle className="text-2xl md:text-3xl font-black leading-tight mb-3">
              {programa.nombre}
            </CardTitle>
            
            <CardDescription className="text-gray-300 font-medium mb-6">
              {programa.descripcion}
            </CardDescription>
          </div>

          {/* ENLACE DIRECTO A LA LANDING PAGE DE LA CARRERA/PROGRAMA */}
          <Link href={`/programas/${programa.id}`} className="w-full block mt-auto">
            <Button className="w-full rounded-xl bg-white text-black hover:bg-brand-primary hover:text-white transition-all h-14 font-bold text-lg group/btn shadow-xl hover:scale-105">
              <FileText className="mr-2 h-5 w-5" /> Ver Toda la Información
              <ArrowRight className="ml-auto h-5 w-5 opacity-0 group-hover/btn:opacity-100 group-hover/btn:translate-x-1 transition-all" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <section id="oferta" className="relative py-24 bg-gray-50 dark:bg-black/95">
      
      {/* Fondo decorativo dinámico */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-brand-primary/10 via-transparent to-transparent pointer-events-none" />

      <div className="container relative z-10 px-4 md:px-6 mx-auto">
        
        {/* Encabezado Principal */}
        <div className="mx-auto mb-20 max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-brand-primary/10 text-brand-primary font-bold text-sm mb-6 shadow-sm border border-brand-primary/20 hover:scale-105 transition-transform cursor-default">
            <GraduationCap className="h-5 w-5" />
            <span className="uppercase tracking-widest">Oferta Educativa</span>
          </div>
          <h2 className="mb-6 text-5xl font-black tracking-tight text-foreground md:text-6xl lg:text-7xl">
            Encuentra tu <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-highlight">Verdadera Vocación</span>
          </h2>
          <p className="text-xl text-muted-foreground font-light text-balance max-w-2xl mx-auto">
            Programas con validez oficial, enfocados en la práctica y diseñados para que destaques en el mundo laboral real.
          </p>
        </div>

        {/* ================= PREPARATORIA ================= */}
        <div className="mb-24">
          <div className="flex items-center gap-4 mb-10">
            <h3 className="text-4xl font-black text-foreground tracking-tighter uppercase">Preparatoria</h3>
            <div className="h-[2px] flex-1 bg-gradient-to-r from-brand-primary via-brand-primary/50 to-transparent"></div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {preparatoria.map((programa) => 
              renderProgramaCard(programa, "Educación Media Superior", "lg:col-span-2 min-h-[500px]")
            )}
          </div>
        </div>

        {/* ================= LICENCIATURAS ================= */}
        <div className="mb-24">
          <div className="flex items-center gap-4 mb-10">
            <h3 className="text-4xl font-black text-foreground tracking-tighter uppercase">Licenciaturas</h3>
            <div className="h-[2px] flex-1 bg-gradient-to-r from-brand-primary via-brand-primary/50 to-transparent"></div>
          </div>
          
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4">
            {licenciaturas.map((programa) => renderProgramaCard(programa, "Licenciatura"))}
          </div>
        </div>

        {/* ================= MAESTRÍAS ================= */}
        <div className="mb-24">
          <div className="flex items-center gap-4 mb-10">
            <h3 className="text-4xl font-black text-foreground tracking-tighter uppercase">Maestrías</h3>
            <div className="h-[2px] flex-1 bg-gradient-to-r from-brand-highlight via-brand-highlight/50 to-transparent"></div>
          </div>
          
          <div className="grid gap-8 md:grid-cols-2">
            {maestrias.map((programa) => renderProgramaCard(programa, "Posgrado"))}
          </div>
        </div>

        {/* ================= CURSOS ================= */}
        <div>
          <div className="flex items-center gap-4 mb-10">
            <h3 className="text-4xl font-black text-foreground tracking-tighter uppercase">Cursos Especializados</h3>
            <div className="h-[2px] flex-1 bg-gradient-to-r from-brand-primary via-brand-primary/50 to-transparent"></div>
          </div>
          
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {cursos.map((programa) => renderProgramaCard(programa, "Certificación"))}
          </div>
        </div>

      </div>
    </section>
  )
}