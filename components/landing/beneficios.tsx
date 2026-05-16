import {
  Clock,
  Video,
  Laptop,
  Users,
  ClipboardCheck,
  MessageSquare,
  BookOpen,
  GraduationCap,
} from 'lucide-react'

const beneficios = [
  {
    icon: GraduationCap,
    title: 'Preparatoria en 2 años',
    description: 'Termina tu bachillerato en menos tiempo con nuestro programa intensivo de alto rendimiento.'
  },
  {
    icon: Clock,
    title: 'Horarios flexibles',
    description: 'Estudia a tu propio ritmo, adaptándote a tus compromisos laborales y personales.'
  },
  {
    icon: Video,
    title: 'Clases virtuales',
    description: 'Sesiones interactivas en vivo con profesores capacitados desde cualquier lugar.'
  },
  {
    icon: Laptop,
    title: 'Plataforma vanguardista',
    description: 'Accede a materiales y tareas en un entorno digital intuitivo y moderno.'
  },
  {
    icon: Users,
    title: 'Docentes de élite',
    description: 'Aprende de profesores con experiencia profesional y trayectoria de primer nivel.'
  },
  {
    icon: ClipboardCheck,
    title: 'Seguimiento',
    description: 'Monitoreo constante de tu progreso con reportes detallados y asesoría.'
  },
  {
    icon: BookOpen,
    title: 'Control de notas',
    description: 'Consulta tu avance académico y calificaciones en tiempo real.'
  },
  {
    icon: MessageSquare,
    title: 'Comunicación',
    description: 'Contacto inmediato y directo con tus profesores y el área administrativa.'
  }
]

export function Beneficios() {
  return (
    <section id="beneficios" className="py-24 bg-white dark:bg-black overflow-hidden border-t border-gray-100 dark:border-gray-900">
      <div className="container px-4 md:px-6 mx-auto">
        
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          
          {/* ================= COLUMNA IZQUIERDA: Mosaico Universitario ================= */}
          <div className="relative order-2 lg:order-1">
            {/* Fondo de color sólido para dar profundidad */}
            <div className="absolute -inset-4 bg-brand-primary/5 rounded-tr-[5rem] rounded-bl-[5rem] z-0" />
            
            <div className="grid grid-cols-2 gap-4 relative z-10">
              <div className="space-y-4 mt-12">
                <div className="relative h-64 rounded-none overflow-hidden shadow-2xl">
                  {/* Imagen 1: Estudiantes estudiando */}
                  <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1000&auto=format&fit=crop" alt="Estudiantes" className="object-cover w-full h-full hover:scale-105 transition-transform duration-700" />
                </div>
                <div className="relative h-48 rounded-none overflow-hidden shadow-2xl">
                  {/* Imagen 2: Graduación (¡NUEVA IMAGEN!) */}
                  <img src="https://images.unsplash.com/photo-1565022536102-f7645c84354a?q=80&w=1000&auto=format&fit=crop" alt="Graduación" className="object-cover w-full h-full hover:scale-105 transition-transform duration-700" />
                </div>
              </div>
              <div className="space-y-4">
                <div className="relative h-56 rounded-none overflow-hidden shadow-2xl">
                  {/* Imagen 3: Persona en Laptop */}
                  <img src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1000&auto=format&fit=crop" alt="Estudio remoto" className="object-cover w-full h-full hover:scale-105 transition-transform duration-700" />
                </div>
                <div className="relative h-72 rounded-none overflow-hidden shadow-2xl border-b-8 border-brand-primary">
                  {/* Imagen 4: Profesor/Biblioteca */}
                  <img src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=1000&auto=format&fit=crop" alt="Docentes de élite" className="object-cover w-full h-full hover:scale-105 transition-transform duration-700" />
                </div>
              </div>
            </div>
            
            {/* Insignia Flotante Estilo Institucional */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-brand-primary text-white p-6 shadow-2xl z-20 flex flex-col items-center justify-center h-40 w-40 border-8 border-white dark:border-black rounded-full">
              <span className="text-4xl font-black">100%</span>
              <span className="text-sm font-bold uppercase tracking-widest mt-1">Online</span>
            </div>
          </div>

          {/* ================= COLUMNA DERECHA: Contenido y Lista de Beneficios ================= */}
          <div className="order-1 lg:order-2">
            
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-black text-white dark:bg-white dark:text-black font-bold text-xs uppercase tracking-widest mb-6 shadow-sm">
              Modelo Educativo
            </div>
            
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-foreground mb-6 uppercase leading-[1.1]">
              ¿Por qué estudiar <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-highlight block mt-1">con nosotros?</span>
            </h2>
            
            <p className="text-lg text-muted-foreground mb-12 leading-relaxed font-medium">
              No somos solo una plataforma de cursos. Somos una institución comprometida con la excelencia, diseñada para derribar las barreras del tiempo y la distancia.
            </p>

            {/* Grid de tus 8 beneficios */}
            <div className="grid sm:grid-cols-2 gap-x-8 gap-y-10">
              {beneficios.map((beneficio, index) => (
                <div key={index} className="flex flex-col gap-3 group">
                  <div className="flex items-center gap-4 mb-1">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center bg-gray-100 dark:bg-gray-900 group-hover:bg-brand-primary transition-colors duration-300 rounded-lg">
                      <beneficio.icon className="h-5 w-5 text-brand-primary group-hover:text-white transition-colors" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground leading-tight">
                      {beneficio.title}
                    </h3>
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {beneficio.description}
                  </p>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>
    </section>
  )
}