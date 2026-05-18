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
  { icon: GraduationCap, title: 'Preparatoria en 2 años', description: 'Termina tu bachillerato en menos tiempo con nuestro programa intensivo de alto rendimiento.' },
  { icon: Clock, title: 'Horarios flexibles', description: 'Estudia a tu propio ritmo, adaptándote a tus compromisos laborales y personales.' },
  { icon: Video, title: 'Clases virtuales', description: 'Sesiones interactivas en vivo con profesores capacitados desde cualquier lugar.' },
  { icon: Laptop, title: 'Plataforma vanguardista', description: 'Accede a materiales y tareas en un entorno digital intuitivo y moderno.' },
  { icon: Users, title: 'Docentes de élite', description: 'Aprende de profesores con experiencia profesional y trayectoria de primer nivel.' },
  { icon: ClipboardCheck, title: 'Seguimiento', description: 'Monitoreo constante de tu progreso con reportes detallados y asesoría.' },
  { icon: BookOpen, title: 'Control de notas', description: 'Consulta tu avance académico y calificaciones en tiempo real.' },
  { icon: MessageSquare, title: 'Comunicación', description: 'Contacto inmediato y directo con tus profesores y el área administrativa.' }
]

// Animaciones base
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } }
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
}

export function Beneficios() {
  return (
    <section id="beneficios" className="relative py-32 bg-slate-50 dark:bg-zinc-950 overflow-hidden border-t border-slate-200 dark:border-zinc-900">
      
      {/* Elementos Decorativos de Fondo para dar "Vida" */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-brand-primary/5 blur-3xl" />
        <div className="absolute bottom-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-brand-highlight/5 blur-3xl" />
      </div>

      <div className="container relative z-10 px-4 md:px-6 mx-auto">
        
        <div className="grid lg:grid-cols-2 gap-20 lg:gap-28 items-center">
          
          {/* ================= COLUMNA IZQUIERDA: Mosaico de Imágenes ================= */}
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="relative order-2 lg:order-1"
          >
            <div className="absolute -inset-8 bg-brand-primary/5 rounded-tr-[6rem] rounded-bl-[6rem] z-0 transform -rotate-3" />
            
            <div className="grid grid-cols-2 gap-6 relative z-10">
              <div className="space-y-6 mt-16">
                <motion.div variants={fadeInUp} className="relative h-72 rounded-2xl overflow-hidden shadow-2xl">
                  <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1000&auto=format&fit=crop" alt="Estudiantes" className="object-cover w-full h-full hover:scale-110 transition-transform duration-1000" />
                </motion.div>
                <motion.div variants={fadeInUp} className="relative h-56 rounded-2xl overflow-hidden shadow-2xl">
                  <img src="https://images.unsplash.com/photo-1565022536102-f7645c84354a?q=80&w=1000&auto=format&fit=crop" alt="Graduación" className="object-cover w-full h-full hover:scale-110 transition-transform duration-1000" />
                </motion.div>
              </div>
              <div className="space-y-6">
                <motion.div variants={fadeInUp} className="relative h-64 rounded-2xl overflow-hidden shadow-2xl">
                  <img src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1000&auto=format&fit=crop" alt="Estudio remoto" className="object-cover w-full h-full hover:scale-110 transition-transform duration-1000" />
                </motion.div>
                <motion.div variants={fadeInUp} className="relative h-80 rounded-2xl overflow-hidden shadow-2xl border-b-[12px] border-brand-primary">
                  <img src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=1000&auto=format&fit=crop" alt="Docentes de élite" className="object-cover w-full h-full hover:scale-110 transition-transform duration-1000" />
                </motion.div>
              </div>
            </div>
            
            {/* Insignia Flotante Animada */}
            <motion.div 
              initial={{ scale: 0, rotate: -45 }}
              whileInView={{ scale: 1, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 100, delay: 0.5 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-brand-primary text-white p-6 shadow-2xl z-20 flex flex-col items-center justify-center h-44 w-44 border-[10px] border-slate-50 dark:border-zinc-950 rounded-full"
            >
              <span className="text-5xl font-black">100%</span>
              <span className="text-sm font-bold uppercase tracking-widest mt-1">Online</span>
            </motion.div>
          </motion.div>

          {/* ================= COLUMNA DERECHA: Textos y Lista ================= */}
          <div className="order-1 lg:order-2">
            
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white dark:bg-white dark:text-black font-bold text-xs uppercase tracking-widest mb-8 shadow-sm rounded-full"
            >
              Modelo Educativo
            </motion.div>
            
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white mb-6 uppercase leading-[1.1]"
            >
              ¿Por qué estudiar <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-highlight block mt-2">con nosotros?</span>
            </motion.h2>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-slate-600 dark:text-zinc-400 mb-14 leading-relaxed font-light"
            >
              No somos solo una plataforma de cursos. Somos una institución comprometida con la excelencia, diseñada para derribar las barreras del tiempo y la distancia.
            </motion.p>

            {/* Grid Animado de Beneficios */}
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={staggerContainer}
              className="grid sm:grid-cols-2 gap-x-10 gap-y-12"
            >
              {beneficios.map((beneficio, index) => (
                <motion.div key={index} variants={fadeInUp} className="flex flex-col gap-4 group">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center bg-white dark:bg-zinc-900 shadow-md border border-slate-100 dark:border-zinc-800 group-hover:bg-brand-primary transition-colors duration-300 rounded-2xl group-hover:-translate-y-1 transform ease-out">
                      <beneficio.icon className="h-6 w-6 text-brand-primary group-hover:text-white transition-colors" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
                      {beneficio.title}
                    </h3>
                  </div>
                  <p className="text-slate-500 dark:text-zinc-400 text-base leading-relaxed font-medium">
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