import { LogIn, BookOpen, Video, ClipboardCheck, CheckCircle, FileText, Sparkles, Info } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

const pasos = [
  {
    icon: LogIn,
    numero: 1,
    titulo: 'Inicia sesión',
    descripcion: 'Ingresa a tu portal seguro con tu correo y contraseña asignada.'
  },
  {
    icon: BookOpen,
    numero: 2,
    titulo: 'Consulta tus materias',
    descripcion: 'Accede a tu tablero de cursos inscritos y organiza tus horarios de clase.'
  },
  {
    icon: Video,
    numero: 3,
    titulo: 'Enlace de clase virtual',
    descripcion: 'Tu profesor publicará automáticamente el acceso seguro a la sesión en vivo.'
  },
  {
    icon: CheckCircle,
    numero: 4,
    titulo: 'Entra a la clase',
    descripcion: 'Con un solo clic en "Entrar a clase", únete a la videollamada interactiva.'
  },
  {
    icon: ClipboardCheck,
    numero: 5,
    titulo: 'Registro de asistencia',
    descripcion: 'El sistema y el profesor validan tu participación de forma automática.'
  },
  {
    icon: FileText,
    numero: 6,
    titulo: 'Tareas y calificaciones',
    descripcion: 'Sube tus entregables y monitorea tu progreso académico en tiempo real.'
  }
]

export function ComoFunciona() {
  return (
    <section id="como-funciona" className="relative py-24 bg-white dark:bg-black/95 overflow-hidden">
      
      {/* Fondo decorativo sutil */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-primary/5 rounded-full blur-[150px] -z-10 pointer-events-none" />

      <div className="container relative z-10 px-4 md:px-6 mx-auto">
        
        {/* Encabezado */}
        <div className="mx-auto mb-20 max-w-2xl text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-highlight/10 text-brand-primary font-semibold text-sm mb-6 border border-brand-highlight/20">
            <Sparkles className="h-4 w-4 text-brand-highlight" />
            <span>Experiencia sin fricciones</span>
          </div>
          <h2 className="mb-6 text-4xl font-extrabold tracking-tight text-foreground md:text-5xl">
            ¿Cómo funcionan nuestras <span className="text-gradient-brand">clases virtuales?</span>
          </h2>
          <p className="text-lg text-muted-foreground font-light text-balance">
            Hemos diseñado un proceso intuitivo y centralizado para que te enfoques en lo que realmente importa: tu aprendizaje.
          </p>
        </div>

        <div className="mx-auto max-w-5xl">
          {/* Grid de Pasos */}
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {pasos.map((paso) => (
              <Card 
                key={paso.numero} 
                className="group relative pt-6 border-border/40 bg-white/80 dark:bg-black/60 backdrop-blur-md transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-brand-primary/10 hover:border-brand-primary/30"
              >
                {/* Número del paso con diseño sobresaliente */}
                <div className="absolute -top-5 left-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-primary to-brand-highlight text-xl font-black text-white shadow-lg shadow-brand-primary/30 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 z-10">
                  {paso.numero}
                </div>
                
                {/* Número de fondo tipo "Marca de agua" */}
                <div className="absolute top-4 right-4 text-8xl font-black text-brand-primary/5 select-none pointer-events-none transition-colors duration-500 group-hover:text-brand-primary/10">
                  {paso.numero}
                </div>

                <CardContent className="pt-8 relative z-20">
                  <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-primary/5 group-hover:bg-brand-highlight/10 transition-colors duration-300">
                    <paso.icon className="h-6 w-6 text-brand-primary group-hover:text-brand-highlight transition-colors duration-300" />
                  </div>
                  <h3 className="mb-3 text-xl font-bold text-foreground group-hover:text-brand-primary transition-colors">
                    {paso.titulo}
                  </h3>
                  <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                    {paso.descripcion}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Banner de Información Importante (Rediseñado) */}
          <div className="mt-16 group relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-primary/5 via-brand-highlight/5 to-brand-primary/5 border border-brand-primary/20 transition-all hover:border-brand-primary/40 hover:shadow-xl hover:shadow-brand-highlight/10">
            {/* Brillo de fondo animado */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 dark:via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]" />
            
            <CardContent className="relative flex flex-col md:flex-row items-start md:items-center gap-6 p-8 md:p-10 z-10">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-brand-primary text-white shadow-lg shadow-brand-primary/20">
                <Video className="h-8 w-8" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="h-5 w-5 text-brand-highlight" />
                  <h4 className="text-lg font-bold text-foreground">Integración Transparente</h4>
                </div>
                <p className="text-base text-muted-foreground font-medium leading-relaxed">
                  Nuestras clases se enlazan de forma automática con plataformas líderes como <strong className="text-foreground">Google Meet, Zoom o Microsoft Teams</strong>. 
                  No necesitas buscar links en correos perdidos; el acceso seguro está a un solo clic de distancia desde tu tablero principal.
                </p>
              </div>
            </CardContent>
          </div>

        </div>
      </div>
    </section>
  )
}