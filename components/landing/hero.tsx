import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { BookOpen, Users, Laptop, Award } from 'lucide-react'

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-background via-secondary/30 to-background py-20 md:py-32">
      {/* Background decorative elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/4 top-1/4 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />
      </div>

      <div className="container px-4 md:px-6">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary">
            <Award className="h-4 w-4" />
            <span>Educación de calidad con horarios flexibles</span>
          </div>

          <h1 className="mb-6 text-balance text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
            Estudia tu preparatoria, licenciatura o maestría con{' '}
            <span className="text-primary">horarios flexibles</span>
          </h1>

          <p className="mx-auto mb-10 max-w-2xl text-pretty text-lg text-muted-foreground md:text-xl">
            Formación académica virtual diseñada para estudiantes que buscan avanzar a su ritmo,
            con acompañamiento docente, clases en línea y una plataforma educativa completa.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="#oferta">
              <Button size="lg" className="w-full sm:w-auto">
                Ver oferta académica
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Iniciar sesión
              </Button>
            </Link>
            <Link href="#contacto">
              <Button variant="ghost" size="lg" className="w-full sm:w-auto">
                Solicitar información
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 gap-8 md:grid-cols-4">
            <div className="flex flex-col items-center">
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <p className="text-2xl font-bold text-foreground">500+</p>
              <p className="text-sm text-muted-foreground">Estudiantes activos</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <p className="text-2xl font-bold text-foreground">10+</p>
              <p className="text-sm text-muted-foreground">Programas académicos</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Laptop className="h-6 w-6 text-primary" />
              </div>
              <p className="text-2xl font-bold text-foreground">100%</p>
              <p className="text-sm text-muted-foreground">Clases virtuales</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Award className="h-6 w-6 text-primary" />
              </div>
              <p className="text-2xl font-bold text-foreground">15+</p>
              <p className="text-sm text-muted-foreground">Años de experiencia</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
