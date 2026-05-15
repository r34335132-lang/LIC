import {
  Clock,
  Video,
  Laptop,
  Users,
  ClipboardCheck,
  MessageSquare,
  BookOpen,
  GraduationCap,
  Star
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

const beneficios = [
  {
    icon: GraduationCap,
    title: 'Preparatoria en 2 años',
    description: 'Termina tu bachillerato en menos tiempo con nuestro programa intensivo de alto rendimiento.'
  },
  {
    icon: Clock,
    title: 'Horarios flexibles',
    description: 'Estudia a tu propio ritmo, adaptándote perfectamente a tus compromisos laborales y personales.'
  },
  {
    icon: Video,
    title: 'Clases virtuales',
    description: 'Sesiones interactivas en vivo con profesores capacitados desde cualquier lugar del mundo.'
  },
  {
    icon: Laptop,
    title: 'Plataforma vanguardista',
    description: 'Accede a materiales, tareas y calificaciones en un entorno digital intuitivo y moderno.'
  },
  {
    icon: Users,
    title: 'Docentes de élite',
    description: 'Aprende de profesores con experiencia profesional y trayectoria académica de primer nivel.'
  },
  {
    icon: ClipboardCheck,
    title: 'Seguimiento personalizado',
    description: 'Monitoreo constante de tu progreso con reportes detallados y asesoría continua.'
  },
  {
    icon: BookOpen,
    title: 'Control total de tus notas',
    description: 'Consulta tu avance académico y calificaciones en tiempo real desde nuestra plataforma.'
  },
  {
    icon: MessageSquare,
    title: 'Comunicación directa',
    description: 'Contacto inmediato y sin fricciones con tus profesores y el área administrativa.'
  }
]

export function Beneficios() {
  return (
    <section id="beneficios" className="relative py-24 bg-white dark:bg-black/95 overflow-hidden">
      
      {/* Luces decorativas de fondo (Esferas difuminadas) */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-primary/5 rounded-full blur-[120px] -z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-brand-highlight/5 rounded-full blur-[120px] -z-10 pointer-events-none" />

      <div className="container relative z-10 px-4 md:px-6 mx-auto">
        
        {/* Encabezado de la sección */}
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-primary/5 text-brand-primary font-semibold text-sm mb-6 border border-brand-primary/10">
            <Star className="h-4 w-4 text-brand-highlight" />
            <span>¿Por qué elegirnos?</span>
          </div>
          
          <h2 className="mb-6 text-4xl font-extrabold tracking-tight text-foreground md:text-5xl leading-tight">
            Beneficios de <span className="text-gradient-brand">estudiar con nosotros</span>
          </h2>
          
          <p className="text-lg md:text-xl text-muted-foreground font-light text-balance">
            Descubre las ventajas exclusivas que hacen de nuestra plataforma la mejor opción para potenciar tu futuro profesional.
          </p>
        </div>

        {/* Cuadrícula de Beneficios */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {beneficios.map((beneficio, index) => (
            <Card 
              key={index} 
              className="group relative overflow-hidden border-border/40 bg-white/60 dark:bg-black/40 backdrop-blur-md transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-brand-primary/10 hover:border-brand-primary/30 z-10"
            >
              {/* Overlay de gradiente sutil al hacer hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/0 via-transparent to-brand-highlight/0 group-hover:from-brand-primary/5 group-hover:to-brand-highlight/10 transition-colors duration-500" />
              
              <CardContent className="p-8 relative z-20">
                {/* Contenedor del Ícono Animado */}
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-primary/10 to-brand-highlight/10 group-hover:from-brand-primary group-hover:to-brand-highlight transition-all duration-500 group-hover:scale-110 shadow-sm">
                  <beneficio.icon className="h-7 w-7 text-brand-primary group-hover:text-white transition-colors duration-500" />
                </div>
                
                {/* Textos */}
                <h3 className="mb-3 text-xl font-bold text-foreground group-hover:text-brand-primary transition-colors duration-300">
                  {beneficio.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                  {beneficio.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}