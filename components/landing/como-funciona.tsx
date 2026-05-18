'use client'

import { motion } from 'framer-motion'
import { LogIn, BookOpen, Video, ClipboardCheck, CheckCircle, FileText, Sparkles, Info, ArrowDown } from 'lucide-react'
import { CardContent } from '@/components/ui/card'

const pasos = [
  {
    icon: LogIn,
    numero: '01',
    titulo: 'Acceso al Portal',
    descripcion: 'Ingresa de forma segura a nuestra plataforma utilizando tus credenciales institucionales únicas asignadas desde tu inscripción.'
  },
  {
    icon: BookOpen,
    numero: '02',
    titulo: 'Control Académico',
    descripcion: 'Visualiza de forma clara tu carga de materias, horarios programados y el avance exacto de tu plan de estudios.'
  },
  {
    icon: Video,
    numero: '03',
    titulo: 'Aula Inteligente',
    descripcion: 'El sistema enlaza y genera automáticamente el acceso encriptado a tu clase en tiempo real. Cero links externos.'
  },
  {
    icon: CheckCircle,
    numero: '04',
    titulo: 'Cátedra Inmersiva',
    descripcion: 'Con un solo clic te unes a la sesión en vivo, en un entorno de alta definición con pizarras y herramientas colaborativas.'
  },
  {
    icon: ClipboardCheck,
    numero: '05',
    titulo: 'Asistencia Biométrica',
    descripcion: 'Nuestra tecnología registra y valida tu participación en la clase de manera automática, sin pasar lista manualmente.'
  },
  {
    icon: FileText,
    numero: '06',
    titulo: 'Evaluación en Línea',
    descripcion: 'Sube tus tareas, consulta las rúbricas de los profesores y monitorea tus calificaciones al instante en tu dashboard.'
  }
]

export function ComoFunciona() {
  return (
    <section id="como-funciona" className="py-24 bg-slate-900 dark:bg-black overflow-hidden relative">
      
      {/* ================= FONDOS Y LUCES DE MARKETING ================= */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-brand-primary/20 via-transparent to-transparent opacity-50" />
      <div className="absolute -left-[20%] top-[30%] w-[50%] h-[50%] bg-brand-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -right-[20%] bottom-[10%] w-[50%] h-[50%] bg-brand-highlight/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="container px-4 md:px-6 mx-auto relative z-10">
        
        {/* ================= ENCABEZADO "HOOK" (Enganche) ================= */}
        <div className="mx-auto mb-20 max-w-3xl text-center">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-5 py-2 bg-brand-primary/10 text-brand-primary font-bold text-xs uppercase tracking-widest mb-6 rounded-full border border-brand-primary/20 shadow-[0_0_15px_rgba(var(--brand-primary-rgb),0.2)]"
          >
            <Sparkles className="h-4 w-4" /> La Experiencia del Alumno
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-white mb-6 leading-[1.1]"
          >
            TU CAMINO AL ÉXITO EN <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-highlight">6 SIMPLES PASOS</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-slate-300 font-light leading-relaxed"
          >
            Diseñamos un ecosistema digital sin fricciones. Desde que inicias sesión hasta que recibes tus calificaciones, todo fluye de manera natural.
          </motion.p>
        </div>

        {/* ================= ESPIRAL VERTICAL (El "Tobogán" de Ventas) ================= */}
        <div className="relative mx-auto max-w-4xl py-10">
          
          {/* LÍNEA DE ENERGÍA CENTRAL (Guía visual) */}
          <div className="absolute left-[38px] md:left-1/2 top-0 bottom-0 w-1.5 md:-translate-x-1/2 bg-slate-800 rounded-full overflow-hidden">
            <motion.div 
              initial={{ height: "0%" }}
              whileInView={{ height: "100%" }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 2.5, ease: "easeInOut" }}
              className="w-full bg-gradient-to-b from-brand-primary via-brand-highlight to-brand-primary"
            />
          </div>

          <div className="space-y-12 md:space-y-6 relative">
            {pasos.map((paso, index) => {
              const isEven = index % 2 === 0
              return (
                <motion.div 
                  key={paso.numero}
                  initial={{ opacity: 0, x: isEven ? -50 : 50, y: 20 }}
                  whileInView={{ opacity: 1, x: 0, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6, delay: index * 0.15 }}
                  className={`flex flex-col md:flex-row items-center w-full ${isEven ? 'md:justify-start' : 'md:justify-end'} relative`}
                >
                  
                  {/* Contenedor de la Tarjeta (Acercado al centro para reducir scroll) */}
                  <div className={`w-full md:w-[48%] pl-24 md:pl-0 ${isEven ? 'md:pr-12 lg:pr-16 text-left md:text-right' : 'md:pl-12 lg:pl-16 text-left'}`}>
                    <div className="group relative bg-slate-900/50 backdrop-blur-md p-6 rounded-3xl border border-slate-700 hover:border-brand-primary/50 hover:bg-slate-800/80 transition-all duration-300 shadow-xl overflow-hidden">
                      
                      {/* Número de fondo tipo "Marca de Agua" */}
                      <div className={`absolute -top-4 ${isEven ? '-left-2 md:-right-2 md:left-auto' : '-left-2'} text-7xl font-black text-white/[0.03] group-hover:text-brand-primary/10 transition-colors pointer-events-none select-none z-0`}>
                        {paso.numero}
                      </div>

                      <div className="relative z-10">
                        <div className={`flex items-center gap-4 mb-3 ${isEven ? 'md:flex-row-reverse' : ''}`}>
                          <h3 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight group-hover:text-brand-highlight transition-colors">
                            {paso.titulo}
                          </h3>
                        </div>
                        <p className="text-slate-400 text-sm md:text-base leading-relaxed font-medium">
                          {paso.descripcion}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* NODO CENTRAL (El punto brillante en la línea) */}
                  <div className="absolute left-[20px] md:left-1/2 transform md:-translate-x-1/2 flex items-center justify-center h-10 w-10 md:h-14 md:w-14 rounded-full bg-slate-950 border-4 border-brand-primary shadow-[0_0_20px_rgba(var(--brand-primary-rgb),0.5)] z-20 group-hover:scale-125 transition-transform duration-300">
                    <paso.icon className="h-4 w-4 md:h-6 md:w-6 text-white" />
                  </div>

                </motion.div>
              )
            })}
          </div>
          
          {/* Flecha final del tobogán */}
          <div className="absolute left-[38px] md:left-1/2 -bottom-10 transform -translate-x-1/2 animate-bounce text-brand-primary z-20 hidden md:block">
            <ArrowDown className="h-8 w-8" />
          </div>
        </div>

        {/* ================= BANNER AUTORIDAD (El cierre del embudo) ================= */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mx-auto max-w-5xl mt-32"
        >
          <div className="relative overflow-hidden rounded-[2rem] bg-brand-primary text-white shadow-2xl">
            {/* Efecto de cristal interno */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent pointer-events-none" />
            <div className="absolute -top-24 -right-24 opacity-20 pointer-events-none">
              <Sparkles className="h-64 w-64 text-white" />
            </div>

            <CardContent className="relative flex flex-col md:flex-row items-center gap-8 p-8 md:p-12 z-10">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center bg-white text-brand-primary shadow-2xl rounded-[1.5rem] rotate-3 hover:rotate-0 transition-transform duration-300">
                <Video className="h-10 w-10" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row items-center gap-3 mb-3 justify-center md:justify-start">
                  <Badge className="bg-black/30 text-white border-0 hover:bg-black/30 font-bold uppercase tracking-widest px-3 py-1 text-xs">
                    Certificación Tecnológica
                  </Badge>
                  <h4 className="text-2xl font-black uppercase tracking-tight text-white drop-shadow-md">ECOSISTEMA INTEGRADO</h4>
                </div>
                <p className="text-base text-white/90 font-medium leading-relaxed max-w-3xl">
                  Nuestra arquitectura está homologada de forma nativa con los estándares globales de <strong className="font-black text-white underline decoration-brand-highlight decoration-2 underline-offset-4">Google Meet, Zoom y Microsoft Teams</strong>. El ecosistema gestiona los accesos encriptados sin requerir enlaces externos vulnerables.
                </p>
              </div>
            </CardContent>
          </div>
        </motion.div>

      </div>
    </section>
  )
}