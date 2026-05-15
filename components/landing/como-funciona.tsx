import { LogIn, BookOpen, Video, ClipboardCheck, CheckCircle, FileText } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

const pasos = [
  {
    icon: LogIn,
    numero: 1,
    titulo: 'Inicia sesión',
    descripcion: 'El alumno inicia sesión en la plataforma con su correo y contraseña.'
  },
  {
    icon: BookOpen,
    numero: 2,
    titulo: 'Consulta tus materias',
    descripcion: 'Accede a tus cursos inscritos y revisa los horarios de clase.'
  },
  {
    icon: Video,
    numero: 3,
    titulo: 'Enlace de clase virtual',
    descripcion: 'El profesor publica el enlace de Google Meet, Zoom o Teams.'
  },
  {
    icon: CheckCircle,
    numero: 4,
    titulo: 'Entra a la clase',
    descripcion: 'El alumno entra a la clase desde el botón "Entrar a clase".'
  },
  {
    icon: ClipboardCheck,
    numero: 5,
    titulo: 'Registro de asistencia',
    descripcion: 'El profesor registra la asistencia de los alumnos presentes.'
  },
  {
    icon: FileText,
    numero: 6,
    titulo: 'Tareas y calificaciones',
    descripcion: 'El alumno entrega tareas y consulta sus calificaciones en la plataforma.'
  }
]

export function ComoFunciona() {
  return (
    <section id="como-funciona" className="bg-secondary/30 py-20">
      <div className="container px-4 md:px-6">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Cómo funcionan las clases virtuales
          </h2>
          <p className="text-muted-foreground">
            Un proceso simple y efectivo para tu aprendizaje en línea
          </p>
        </div>

        <div className="mx-auto max-w-4xl">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {pasos.map((paso) => (
              <Card key={paso.numero} className="relative border-border/50 bg-card transition-all hover:shadow-md">
                <div className="absolute -top-3 left-4 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  {paso.numero}
                </div>
                <CardContent className="pt-8">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <paso.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mb-2 font-semibold text-foreground">{paso.titulo}</h3>
                  <p className="text-sm text-muted-foreground">{paso.descripcion}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="mt-8 border-primary/20 bg-primary/5">
            <CardContent className="flex items-start gap-4 p-6">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/20">
                <Video className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h4 className="mb-1 font-semibold text-foreground">Importante</h4>
                <p className="text-sm text-muted-foreground">
                  Las clases virtuales se realizan a través de Google Meet, Zoom o Microsoft Teams.
                  El profesor publica el enlace en la plataforma y el alumno solo necesita hacer clic
                  en {"\"Entrar a clase\""} para unirse a la sesión.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
