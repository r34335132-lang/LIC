'use client'

import { motion } from 'framer-motion'
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
  { icon: GraduationCap, title: 'Preparatoria en 2 años', description: 'Termina tu bachillerato en menos tiempo con nuestro programa intensivo.' },
  { icon: Clock, title: 'Horarios flexibles', description: 'Estudia a tu ritmo, adaptándote a tus compromisos laborales y personales.' },
  { icon: Video, title: 'Clases virtuales', description: 'Sesiones interactivas en vivo con profesores capacitados desde cualquier lugar.' },
  { icon: Laptop, title: 'Plataforma vanguardista', description: 'Accede a materiales y tareas en un entorno digital intuitivo y moderno.' },
  { icon: Users, title: 'Docentes de élite', description: 'Aprende de profesores con experiencia profesional y trayectoria de primer nivel.' },
  { icon: ClipboardCheck, title: 'Seguimiento', description: 'Monitoreo constante de tu progreso con reportes detallados y asesoría.' },
  { icon: BookOpen, title: 'Control de notas', description: 'Consulta tu avance académico y calificaciones en tiempo real.' },
  { icon: MessageSquare, title: 'Comunicación', description: 'Contacto inmediato y directo con tus profesores y área administrativa.' }
]

// Animaciones base ajustadas para mayor suavidad
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
}

export function Beneficios() {
  return (
    <section id="beneficios" className="relative py-24 md:py-32 lg:py-40 bg-slate-50 dark:bg-zinc-950 overflow-hidden border-t border-slate-200/60 dark:border-zinc-900">
      
      {/* Elementos Decorativos de Fondo (Glows sutiles) */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-brand-primary/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-brand-highlight/5 rounded-full blur-[100px]" />
      </div>

      <div className="container relative z-10 px-4 md:px-6 mx-auto">
        
        {/* Usamos gap-16 en móvil para separar imagen de texto, y gap-24 en desktop */}
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          
          {/* ================= COLUMNA IZQUIERDA: Mosaico de Imágenes Premium ================= */}
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="relative order-2 lg:order-1 w-full max-w-lg mx-auto lg:max-w-none"
          >
            {/* Fondo de acento abstracto detrás de las fotos */}
            <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/10 to-transparent rounded-[3rem] transform -rotate-2 scale-105 z-0" />
            
            <div className="grid grid-cols-2 gap-4 sm:gap-6 relative z-10">
              {/* Columna Izquierda del Mosaico */}
              <div className="space-y-4 sm:space-y-6 pt-8 sm:pt-12">
                <motion.div variants={fadeInUp} className="relative h-48 sm:h-64 rounded-[2rem] overflow-hidden shadow-xl border border-white/20 dark:border-white/5">
                  <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1000&auto=format&fit=crop" alt="Estudiantes" className="object-cover w-full h-full hover:scale-110 transition-transform duration-700" />
                </motion.div>
                <motion.div variants={fadeInUp} className="relative h-40 sm:h-56 rounded-[2rem] overflow-hidden shadow-xl border border-white/20 dark:border-white/5">
                  <img src="https://images.unsplash.com/photo-1565022536102-f7645c84354a?q=80&w=1000&auto=format&fit=crop" alt="Graduación" className="object-cover w-full h-full hover:scale-110 transition-transform duration-700" />
                </motion.div>
              </div>
              
              {/* Columna Derecha del Mosaico */}
              <div className="space-y-4 sm:space-y-6 pb-8 sm:pb-12">
                <motion.div variants={fadeInUp} className="relative h-40 sm:h-56 rounded-[2rem] overflow-hidden shadow-xl border border-white/20 dark:border-white/5">
                  <img src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1000&auto=format&fit=crop" alt="Estudio remoto" className="object-cover w-full h-full hover:scale-110 transition-transform duration-700" />
                </motion.div>
                <motion.div variants={fadeInUp} className="relative h-56 sm:h-72 rounded-[2rem] overflow-hidden shadow-2xl border-b-[8px] border-brand-primary">
                  <img src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=1000&auto=format&fit=crop" alt="Docentes de élite" className="object-cover w-full h-full hover:scale-110 transition-transform duration-700" />
                </motion.div>
              </div>
            </div>
            
            {/* Insignia Flotante Animada */}
            <motion.div 
              initial={{ scale: 0, rotate: -45 }}
              whileInView={{ scale: 1, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 100, delay: 0.4 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-zinc-900 text-slate-900 dark:text-white p-4 sm:p-6 shadow-2xl z-20 flex flex-col items-center justify-center h-28 w-28 sm:h-36 sm:w-36 rounded-full border border-slate-100 dark:border-zinc-800"
            >
              <span className="text-3xl sm:text-4xl font-black text-brand-primary">100%</span>
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest mt-1 text-slate-500 dark:text-zinc-400">Online</span>
            </motion.div>
          </motion.div>

          {/* ================= COLUMNA DERECHA: Textos y Lista (Limpiado para Móvil) ================= */}
          <div className="order-1 lg:order-2 w-full">
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-primary/10 text-brand-primary font-bold text-xs uppercase tracking-widest mb-6 rounded-full border border-brand-primary/20"
            >
              Modelo Educativo
            </motion.div>
            
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white mb-6 uppercase leading-[1.1]"
            >
              ¿Por qué estudiar <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-highlight block mt-1">con nosotros?</span>
            </motion.h2>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg md:text-xl text-slate-600 dark:text-zinc-400 mb-10 md:mb-14 leading-relaxed font-light"
            >
              No somos solo una plataforma de cursos. Somos una institución comprometida con la excelencia, diseñada para derribar las barreras del tiempo y la distancia.
            </motion.p>

            {/* Grid Animado de Beneficios (1 columna en móvil, 2 en desktop) */}
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={staggerContainer}
              className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-10"
            >
              {beneficios.map((beneficio, index) => (
                <motion.div key={index} variants={fadeInUp} className="flex flex-col gap-3 group">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center bg-white dark:bg-zinc-900 shadow-md border border-slate-100 dark:border-zinc-800 group-hover:bg-brand-primary group-hover:border-brand-primary transition-all duration-300 rounded-[1rem] group-hover:-translate-y-1">
                      <beneficio.icon className="h-5 w-5 sm:h-6 sm:w-6 text-brand-primary group-hover:text-white transition-colors" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-tight">
                      {beneficio.title}
                    </h3>
                  </div>
                  <p className="text-slate-500 dark:text-zinc-400 text-sm sm:text-base leading-relaxed font-medium pl-[4.5rem] sm:pl-[4.5rem]">
                    {beneficio.description}
                  </p>
                </motion.div>
              ))}
            </motion.div>

          </div>
        </div>
      </div>
    </section>
  )
}