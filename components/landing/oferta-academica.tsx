import Image from 'next/image'
import { programas } from '@/lib/data'
import { getProgramaIcono } from '@/lib/icons'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sparkles, ArrowRight, BookMarked, CheckCircle2 } from 'lucide-react'

export function OfertaAcademica() {
  const preparatoria = programas.filter(p => p.tipo === 'preparatoria')
  const licenciaturas = programas.filter(p => p.tipo === 'licenciatura')
  const maestrias = programas.filter(p => p.tipo === 'maestria')
  const cursos = programas.filter(p => p.tipo === 'curso')

  return (
    <section id="oferta" className="relative py-24 bg-gray-50/50 dark:bg-black/90">
      
      {/* Fondo de Cuadrícula Sutil */}
      <div className="absolute inset-0 bg-grid-subtle [mask-image:linear-gradient(to_bottom,white,transparent)] pointer-events-none" />

      <div className="container relative z-10 px-4 md:px-6 mx-auto">
        
        {/* Encabezado */}
        <div className="mx-auto mb-20 max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-primary/5 text-brand-primary font-semibold text-sm mb-6 border border-brand-primary/10">
            <BookMarked className="h-4 w-4 text-brand-highlight" />
            <span>Catálogo Educativo</span>
          </div>
          <h2 className="mb-6 text-4xl font-extrabold tracking-tight text-foreground md:text-5xl">
            Impulsa tu <span className="text-gradient-brand">Futuro Profesional</span>
          </h2>
          <p className="text-lg text-muted-foreground font-light text-balance">
            Explora nuestros programas diseñados con excelencia académica, adaptados a las exigencias del mercado actual.
          </p>
        </div>

        {/* ================= PREPARATORIA (NUEVO DISEÑO FEATURED) ================= */}
        <div className="mb-24">
          <div className="flex items-center gap-4 mb-8">
            <h3 className="text-3xl font-bold text-foreground tracking-tight">Preparatoria</h3>
            <div className="h-[1px] flex-1 bg-gradient-to-r from-brand-primary/20 to-transparent"></div>
          </div>
          
          <div className="grid grid-cols-1 gap-8">
            {preparatoria.map((programa) => {
              const Icon = getProgramaIcono(programa.id)
              const imageUrl = '/placeholder.jpg' // Imagen por defecto

              return (
                <Card key={programa.id} className="group relative overflow-hidden border-border/40 bg-white dark:bg-black transition-all duration-500 hover:shadow-2xl hover:shadow-brand-primary/15 hover:border-brand-primary/30 flex flex-col md:flex-row">
                  
                  {/* Mitad Izquierda: Imagen (Llenando el espacio vacío) */}
                  <div className="relative w-full md:w-2/5 min-h-[250px] md:min-h-auto overflow-hidden">
                    <Image 
                      src={imageUrl} 
                      alt={programa.nombre} 
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-brand-primary/20 group-hover:bg-transparent transition-colors duration-500" />
                    {/* Gradiente para unir imagen con texto en desktop */}
                    <div className="hidden md:block absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-white dark:from-black to-transparent z-10" />
                  </div>

                  {/* Mitad Derecha: Información */}
                  <div className="w-full md:w-3/5 p-8 md:p-12 flex flex-col justify-center relative z-20">
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-primary/10 group-hover:bg-brand-primary transition-colors duration-500 shadow-sm">
                          <Icon className="h-8 w-8 text-brand-primary group-hover:text-white transition-colors duration-500" />
                        </div>
                        <div>
                          <Badge variant="secondary" className="mb-2 bg-brand-highlight/10 text-brand-primary border-0 font-bold uppercase tracking-wider text-xs">
                            Programa Intensivo
                          </Badge>
                          <CardTitle className="text-3xl font-black leading-tight group-hover:text-brand-primary transition-colors">
                            {programa.nombre}
                          </CardTitle>
                        </div>
                      </div>
                    </div>
                    
                    <CardDescription className="mb-8 text-base md:text-lg text-muted-foreground font-medium leading-relaxed">
                      {programa.descripcion}
                    </CardDescription>

                    {/* Agregamos viñetas de beneficios extra para rellenar visualmente */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                        <CheckCircle2 className="h-5 w-5 text-brand-highlight" /> Duración: {programa.duracion}
                      </div>
                      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                        <CheckCircle2 className="h-5 w-5 text-brand-highlight" /> Horarios Flexibles
                      </div>
                      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                        <CheckCircle2 className="h-5 w-5 text-brand-highlight" /> Validez Oficial
                      </div>
                      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                        <CheckCircle2 className="h-5 w-5 text-brand-highlight" /> Plataforma 24/7
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                      <Button size="lg" className="rounded-full bg-brand-primary hover:bg-brand-primary/90 text-white h-12 px-8 shadow-md transition-all hover:scale-105">
                        Inscribirme Ahora
                      </Button>
                      <Button variant="outline" size="lg" className="rounded-full border-brand-primary/20 hover:bg-brand-primary/5 h-12 px-8">
                        Ver plan de estudios
                      </Button>
                    </div>
                  </div>

                </Card>
              )
            })}
          </div>
        </div>

        {/* ================= LICENCIATURAS ================= */}
        <div className="mb-24">
          <div className="flex items-center gap-4 mb-8">
            <h3 className="text-3xl font-bold text-foreground tracking-tight">Licenciaturas</h3>
            <div className="h-[1px] flex-1 bg-gradient-to-r from-brand-primary/20 to-transparent"></div>
          </div>
          
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {licenciaturas.map((programa) => {
              const Icon = getProgramaIcono(programa.id)
              return (
                <Card key={programa.id} className="group border-border/40 bg-white/60 dark:bg-black/40 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-brand-primary/30">
                  <CardHeader className="pb-4">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-primary/5 group-hover:bg-gradient-to-br group-hover:from-brand-primary group-hover:to-brand-highlight transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-sm">
                      <Icon className="h-6 w-6 text-brand-primary group-hover:text-white transition-colors" />
                    </div>
                    <CardTitle className="text-lg font-bold leading-tight mb-2">{programa.nombre}</CardTitle>
                    <Badge variant="outline" className="w-fit text-xs font-semibold">{programa.duracion}</Badge>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="mb-6 line-clamp-2 text-sm">
                      {programa.descripcion}
                    </CardDescription>
                    <Button variant="ghost" className="w-full rounded-full text-brand-primary hover:bg-brand-primary/10 group-hover:text-brand-primary">
                      Detalles del programa <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* ================= MAESTRÍAS ================= */}
        <div className="mb-24">
          <div className="flex items-center gap-4 mb-8">
            <h3 className="text-3xl font-bold text-foreground tracking-tight">Maestrías</h3>
            <div className="h-[1px] flex-1 bg-gradient-to-r from-brand-highlight/30 to-transparent"></div>
          </div>
          
          <div className="grid gap-8 md:grid-cols-2">
            {maestrias.map((programa) => {
              const Icon = getProgramaIcono(programa.id)
              return (
                <Card key={programa.id} className="group relative overflow-hidden border border-brand-primary/10 bg-gradient-to-b from-white to-gray-50 dark:from-black/60 dark:to-black/40 backdrop-blur-xl transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-brand-highlight/10">
                  <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Sparkles className="h-24 w-24 text-brand-primary" />
                  </div>
                  <CardHeader className="relative z-10 p-8">
                    <div className="flex items-center gap-5">
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-primary to-brand-highlight shadow-lg">
                        <Icon className="h-8 w-8 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl font-black mb-2">{programa.nombre}</CardTitle>
                        <Badge className="bg-brand-text text-white hover:bg-brand-text/90 rounded-full px-3 py-1">
                          {programa.duracion}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="relative z-10 px-8 pb-8">
                    <CardDescription className="mb-8 text-base leading-relaxed text-muted-foreground/90 font-medium">
                      {programa.descripcion}
                    </CardDescription>
                    <Button className="w-full sm:w-auto rounded-full bg-brand-primary hover:bg-brand-primary/90 text-white h-12 px-8 shadow-md transition-all hover:scale-105">
                      Solicitar admisión
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* ================= CURSOS ================= */}
        <div>
          <div className="flex items-center gap-4 mb-8">
            <h3 className="text-3xl font-bold text-foreground tracking-tight">Cursos Especializados</h3>
            <div className="h-[1px] flex-1 bg-gradient-to-r from-brand-primary/20 to-transparent"></div>
          </div>
          
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {cursos.map((programa) => {
              const Icon = getProgramaIcono(programa.id)
              const imageUrl = '/placeholder.jpg' 

              return (
                <Card key={programa.id} className="group relative overflow-hidden border-border/40 bg-white dark:bg-black transition-all duration-500 hover:-translate-y-2 hover:shadow-xl hover:shadow-brand-highlight/20 flex flex-col">
                  <div className="relative h-48 w-full overflow-hidden">
                    <Image 
                      src={imageUrl} 
                      alt={programa.nombre} 
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                    <div className="absolute inset-0 p-4 flex flex-col justify-between">
                      <div className="flex justify-end">
                        <Badge className="bg-brand-highlight text-brand-text font-bold uppercase tracking-wider text-[10px] shadow-sm">
                          Curso Online
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                         <div className="bg-white/20 backdrop-blur-md p-2 rounded-lg">
                           <Icon className="h-5 w-5 text-white" />
                         </div>
                      </div>
                    </div>
                  </div>
                  <CardContent className="flex-1 p-6 pt-5 flex flex-col">
                    <div className="mb-2">
                      <CardTitle className="text-xl font-bold leading-tight group-hover:text-brand-primary transition-colors">
                        {programa.nombre}
                      </CardTitle>
                    </div>
                    <Badge variant="outline" className="w-fit mb-4 text-brand-primary border-brand-primary/30">
                      ⏱ {programa.duracion}
                    </Badge>
                    <CardDescription className="mb-6 flex-1 text-sm">
                      {programa.descripcion}
                    </CardDescription>
                    <Button variant="default" className="w-full rounded-full bg-foreground text-background hover:bg-brand-primary hover:text-white transition-all h-11">
                      Inscribirme Ahora
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

      </div>
    </section>
  )
}