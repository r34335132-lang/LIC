import {
  Clock,
  Video,
  Laptop,
  Users,
  ClipboardCheck,
  MessageSquare,
  BookOpen,
  GraduationCap
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

const beneficios = [
  {
    icon: GraduationCap,
    title: 'Preparatoria en 2 años',
    description: 'Termina tu bachillerato en menos tiempo con nuestro programa intensivo.'
  },
  {
    icon: Clock,
    title: 'Horarios flexibles',
    description: 'Estudia a tu propio ritmo, adaptándote a tus compromisos laborales y personales.'
  },
  {
    icon: Video,
    title: 'Clases virtuales',
    description: 'Sesiones en vivo con profesores capacitados desde cualquier lugar.'
  },
  {
    icon: Laptop,
    title: 'Plataforma educativa propia',
    description: 'Accede a materiales, tareas y calificaciones en un solo lugar.'
  },
  {
    icon: Users,
    title: 'Docentes capacitados',
    description: 'Profesores con experiencia profesional y académica de alto nivel.'
  },
  {
    icon: ClipboardCheck,
    title: 'Seguimiento académico',
    description: 'Monitoreo constante de tu progreso con reportes detallados.'
  },
  {
    icon: BookOpen,
    title: 'Acceso a tareas y calificaciones',
    description: 'Consulta tu avance académico en tiempo real desde la plataforma.'
  },
  {
    icon: MessageSquare,
    title: 'Comunicación directa',
    description: 'Contacto inmediato con profesores y administración.'
  }
]

export function Beneficios() {
  return (
    <section id="beneficios" className="bg-secondary/30 py-20">
      <div className="container px-4 md:px-6">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Beneficios de estudiar con nosotros
          </h2>
          <p className="text-muted-foreground">
            Descubre por qué somos la mejor opción para tu formación profesional
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {beneficios.map((beneficio, index) => (
            <Card key={index} className="group border-border/50 bg-card transition-all hover:border-primary/30 hover:shadow-md">
              <CardContent className="p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/20">
                  <beneficio.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 font-semibold text-foreground">{beneficio.title}</h3>
                <p className="text-sm text-muted-foreground">{beneficio.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
