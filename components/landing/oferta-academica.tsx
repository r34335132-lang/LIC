import { programas } from '@/lib/data'
import { getProgramaIcono } from '@/lib/icons'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export function OfertaAcademica() {
  const preparatoria = programas.filter(p => p.tipo === 'preparatoria')
  const licenciaturas = programas.filter(p => p.tipo === 'licenciatura')
  const maestrias = programas.filter(p => p.tipo === 'maestria')
  const cursos = programas.filter(p => p.tipo === 'curso')

  return (
    <section id="oferta" className="py-20">
      <div className="container px-4 md:px-6">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Oferta Académica
          </h2>
          <p className="text-muted-foreground">
            Programas diseñados para tu crecimiento profesional
          </p>
        </div>

        {/* Preparatoria */}
        <div className="mb-12">
          <h3 className="mb-6 text-2xl font-bold text-foreground">Preparatoria</h3>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {preparatoria.map((programa) => {
              const Icon = getProgramaIcono(programa.id)
              return (
                <Card key={programa.id} className="group overflow-hidden border-border/50 transition-all hover:border-primary/30 hover:shadow-lg">
                  <div className="h-2 bg-gradient-to-r from-primary to-accent" />
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{programa.nombre}</CardTitle>
                        <Badge variant="secondary" className="mt-1">{programa.duracion}</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="mb-4 line-clamp-3">{programa.descripcion}</CardDescription>
                    <Button variant="outline" className="w-full">Ver más</Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Licenciaturas */}
        <div className="mb-12">
          <h3 className="mb-6 text-2xl font-bold text-foreground">Licenciaturas</h3>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {licenciaturas.map((programa) => {
              const Icon = getProgramaIcono(programa.id)
              return (
                <Card key={programa.id} className="group border-border/50 transition-all hover:border-primary/30 hover:shadow-lg">
                  <CardHeader className="pb-3">
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/20">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-base">{programa.nombre}</CardTitle>
                    <Badge variant="outline" className="w-fit">{programa.duracion}</Badge>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="mb-4 line-clamp-2 text-sm">{programa.descripcion}</CardDescription>
                    <Button variant="ghost" size="sm" className="w-full">Ver más</Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Maestrías */}
        <div className="mb-12">
          <h3 className="mb-6 text-2xl font-bold text-foreground">Maestrías</h3>
          <div className="grid gap-6 md:grid-cols-2">
            {maestrias.map((programa) => {
              const Icon = getProgramaIcono(programa.id)
              return (
                <Card key={programa.id} className="group border-border/50 transition-all hover:border-primary/30 hover:shadow-lg">
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-accent/20">
                        <Icon className="h-7 w-7 text-primary" />
                      </div>
                      <div>
                        <CardTitle>{programa.nombre}</CardTitle>
                        <Badge variant="secondary" className="mt-1">{programa.duracion}</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="mb-4">{programa.descripcion}</CardDescription>
                    <Button className="w-full">Solicitar información</Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Cursos */}
        <div>
          <h3 className="mb-6 text-2xl font-bold text-foreground">Cursos</h3>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {cursos.map((programa) => {
              const Icon = getProgramaIcono(programa.id)
              return (
                <Card key={programa.id} className="group relative border-border/50 transition-all hover:border-primary/30 hover:shadow-lg">
                  <Badge className="absolute right-4 top-4 bg-accent text-accent-foreground">
                    Curso disponible
                  </Badge>
                  <CardHeader className="pt-10">
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                      <Icon className="h-6 w-6 text-accent" />
                    </div>
                    <CardTitle className="text-lg">{programa.nombre}</CardTitle>
                    <Badge variant="outline">{programa.duracion}</Badge>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="mb-4">{programa.descripcion}</CardDescription>
                    <Button variant="outline" className="w-full">Inscribirme</Button>
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
