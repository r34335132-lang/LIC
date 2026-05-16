import { LogIn, BookOpen, Video, ClipboardCheck, CheckCircle, FileText, Sparkles, Info } from 'lucide-react'
import { CardContent } from '@/components/ui/card'

const pasos = [
  {
    icon: LogIn,
    numero: '01',
    titulo: 'ACCESO AL PORTAL CAMPUS DIGITAL',
    descripcion: 'Ingresa de forma segura a nuestra plataforma de vanguardia utilizando tus credenciales institucionales únicas asignadas desde tu inscripción.'
  },
  {
    icon: BookOpen,
    numero: '02',
    titulo: 'CONSULTA Y CONTROL DE ASIGNATURAS',
    descripcion: 'Visualiza de forma clara tu carga académica vigente, tus horarios de clase programados y el plan de estudios correspondiente a tu ciclo.'
  },
  {
    icon: Video,
    numero: '03',
    titulo: 'VINCULACIÓN AUTOMÁTICA DE SESIONES',
    descripcion: 'Olvídate de buscar enlaces en correos externos. El sistema enlaza y genera de forma automática el acceso seguro a tu aula virtual en tiempo real.'
  },
  {
    icon: CheckCircle,
    numero: '04',
    titulo: 'INMERSIÓN EN EL AULA INTERACTIVA',
    descripcion: 'Con un solo clic te unes a la cátedra en vivo, participando en un entorno de alta definición con herramientas colaborativas avanzadas.'
  },
  {
    icon: ClipboardCheck,
    numero: '05',
    titulo: 'VALIDACIÓN ASISTENCIAL BIOMÉTRICA',
    descripcion: 'Nuestra infraestructura tecnológica registra y valida tu participación y permanencia en la sesión de manera transparente y automática.'
  },
  {
    icon: FileText,
    numero: '06',
    titulo: 'EVALUACIÓN Y SEGUIMIENTO DE NOTAS',
    descripcion: 'Sube tus entregables académicos, consulta las rúbricas institucionales y monitorea tu progreso y calificaciones finales al instante.'
  }
]

export function ComoFunciona() {
  return (
    <section id="como-funciona" className="py-24 bg-gray-50 dark:bg-black/95 overflow-hidden border-t border-gray-100 dark:border-gray-900">
      <div className="container px-4 md:px-6 mx-auto">
        
        {/* ================= ENCABEZADO MASIVO INSTITUCIONAL ================= */}
        <div className="mx-auto mb-24 max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-black text-white dark:bg-white dark:text-black font-bold text-xs uppercase tracking-widest mb-6 shadow-sm">
            Metodología Académica
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-foreground mb-6 uppercase leading-[1.1]">
            NUESTRO MODELO DE <span className="text-brand-primary block mt-1">APRENDIZAJE VIRTUAL</span>
          </h2>
          <p className="text-lg text-muted-foreground font-medium max-w-2xl mx-auto leading-relaxed">
            Una experiencia educativa totalmente centralizada y optimizada para que enfoques tu energía en el desarrollo de tu perfil profesional.
          </p>
        </div>

        {/* ================= TIMELINE ALTERNADO (ESTILO UVM PREMIUM) ================= */}
        <div className="relative mx-auto max-w-5xl">
          {/* Línea troncal central visible solo en pantallas grandes */}
          <div className="absolute left-1/2 top-0 bottom-0 w-[2px] bg-gradient-to-b from-brand-primary via-gray-200 dark:via-gray-800 to-transparent transform -translate-x-1/2 hidden lg:block" />

          <div className="space-y-16 lg:space-y-24">
            {pasos.map((paso, index) => {
              const isEven = index % 2 === 0
              return (
                <div key={paso.numero} className="relative flex flex-col lg:flex-row items-center">
                  
                  {/* Lado Izquierdo o Contenedor con Texto */}
                  <div className={`w-full lg:w-1/2 ${isEven ? 'lg:pr-16 lg:text-right' : 'lg:pl-16 lg:order-2 lg:text-left'}`}>
                    <div className="flex flex-col gap-3 group">
                      
                      {/* Número grande en background que se ilumina */}
                      <span className="text-5xl md:text-6xl font-black text-brand-primary/10 group-hover:text-brand-primary/20 transition-colors tracking-tighter">
                        PASO {paso.numero}
                      </span>
                      
                      <h3 className="text-xl md:text-2xl font-black text-foreground tracking-tight uppercase group-hover:text-brand-primary transition-colors">
                        {paso.titulo}
                      </h3>
                      
                      <p className="text-muted-foreground text-base leading-relaxed max-w-xl mx-auto lg:mx-0 font-medium">
                        {paso.descripcion}
                      </p>
                    </div>
                  </div>

                  {/* Nodo Central (El círculo de la línea de tiempo) */}
                  <div className="absolute left-1/2 transform -translate-x-1/2 hidden lg:flex h-14 w-14 items-center justify-center rounded-none bg-black text-white dark:bg-white dark:text-black border-4 border-gray-50 dark:border-black/95 shadow-xl z-20 transition-transform duration-300 group-hover:scale-110">
                    <paso.icon className="h-5 w-5" />
                  </div>

                  {/* Lado Vacío de relleno para equilibrar el layout de dos columnas */}
                  <div className="w-full lg:w-1/2 hidden lg:block" />

                </div>
              )
            })}
          </div>
        </div>

        {/* ================= BANNER DE INTEGRACIÓN ROBUSTO ================= */}
        <div className="mx-auto max-w-5xl mt-24">
          <div className="relative overflow-hidden rounded-none bg-white dark:bg-gray-900 border-l-8 border-brand-primary shadow-xl">
            {/* Sutil textura decorativa institucional */}
            <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
              <Sparkles className="h-32 w-32 text-brand-primary" />
            </div>

            <CardContent className="relative flex flex-col md:flex-row items-start md:items-center gap-6 p-8 md:p-10 z-10">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center bg-brand-primary text-white shadow-xl rounded-xl">
                <Video className="h-8 w-8" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <Info className="h-5 w-5 text-brand-highlight" />
                  <h4 className="text-lg font-black text-foreground uppercase tracking-tight">ECOSISTEMA DIGITAL INTEGRADO</h4>
                </div>
                <p className="text-base text-muted-foreground font-medium leading-relaxed">
                  Nuestra arquitectura está homologada de forma nativa con los estándares corporativos globales de <strong className="text-foreground font-bold">Google Meet, Zoom y Microsoft Teams</strong>. El ecosistema gestiona de forma autónoma los accesos encriptados sin requerir interacción manual o enlaces externos vulnerables.
                </p>
              </div>
            </CardContent>
          </div>
        </div>

      </div>
    </section>
  )
}