'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MapPin, Phone, Mail, Clock, Send, CheckCircle, Sparkles } from 'lucide-react'
import { programas } from '@/lib/data'

// ============================================================================
// HOOK MÁGICO: Efecto de máquina de escribir para los placeholders
// ============================================================================
function useTypewriter(words: string[], speed = 80, pause = 2500) {
  const [text, setText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [loopNum, setLoopNum] = useState(0)
  const [typingSpeed, setTypingSpeed] = useState(speed)

  useEffect(() => {
    let timer = setTimeout(() => {
      const i = loopNum % words.length
      const fullText = words[i]

      setText(isDeleting ? fullText.substring(0, text.length - 1) : fullText.substring(0, text.length + 1))
      setTypingSpeed(isDeleting ? speed / 2 : speed)

      if (!isDeleting && text === fullText) {
        setTimeout(() => setIsDeleting(true), pause)
      } else if (isDeleting && text === '') {
        setIsDeleting(false)
        setLoopNum(loopNum + 1)
      }
    }, typingSpeed)

    return () => clearTimeout(timer)
  }, [text, isDeleting, loopNum, typingSpeed, words, speed, pause])

  return text
}
// ============================================================================

export function Contacto() {
  const [enviado, setEnviado] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Activamos los placeholders animados
  const nombrePlaceholder = useTypewriter(['Ej. Ana García Mendoza', 'Ej. Roberto Silva Pérez', 'Ej. Carlos Rivera'])
  const telPlaceholder = useTypewriter(['Ej. (618) 123-4567', 'Ej. (55) 9876-5432', 'Ej. (81) 2345-6789'])
  const emailPlaceholder = useTypewriter(['ana.garcia@ejemplo.com', 'roberto.s@ejemplo.com', 'carlos.rivera@ejemplo.com'])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      setEnviado(true)
      setTimeout(() => setEnviado(false), 5000)
    }, 2000)
  }

  return (
    // Reducimos el py en móvil para que encaje mejor en pantalla
    <section id="contacto" className="relative py-16 md:py-24 bg-slate-50 dark:bg-zinc-950 overflow-hidden border-t border-slate-200/60 dark:border-zinc-900">
      
      {/* Luces de fondo decorativas adaptativas */}
      <div className="absolute top-0 right-0 md:right-1/4 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-brand-primary/5 rounded-full blur-[80px] md:blur-[120px] -z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 md:left-10 w-[250px] md:w-[400px] h-[250px] md:h-[400px] bg-brand-highlight/5 rounded-full blur-[80px] md:blur-[100px] -z-10 pointer-events-none" />

      <div className="container relative z-10 px-4 md:px-6 mx-auto">
        
        {/* ================= ENCABEZADO INSTITUCIONAL ================= */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto mb-12 md:mb-16 max-w-4xl text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 md:px-5 md:py-2 bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold text-[10px] md:text-xs uppercase tracking-widest mb-4 md:mb-6 rounded-full shadow-sm">
            <Sparkles className="h-3 w-3 md:h-4 md:w-4 text-brand-primary" /> Departamento de Admisiones
          </div>
          {/* Título progresivo para no quebrar palabras en celular */}
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white mb-4 md:mb-6 uppercase leading-[1.1]">
            INICIA TU PROCESO DE <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-highlight block sm:inline mt-1 sm:mt-0">INSCRIPCIÓN HOY</span>
          </h2>
          <p className="text-base md:text-lg text-slate-600 dark:text-zinc-400 font-medium max-w-2xl mx-auto leading-relaxed px-2 md:px-0">
            Da el primer paso hacia tu futuro profesional. Nuestro equipo de asesores académicos está listo para guiarte en tu proceso de admisión.
          </p>
        </motion.div>

        {/* ================= CONTENEDOR PRINCIPAL PREMIUM ================= */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mx-auto max-w-6xl rounded-[2rem] md:rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col lg:flex-row overflow-hidden relative"
        >
          {/* Brillo sutil interno */}
          <div className="absolute top-0 right-0 w-[200px] md:w-[300px] h-[200px] md:h-[300px] bg-brand-primary/5 rounded-full blur-[60px] md:blur-[80px] pointer-events-none" />

          {/* ================= PANEL IZQUIERDO: FORMULARIO ANIMADO ================= */}
          {/* Padding ajustado para móvil (p-6) y desktop (p-12) */}
          <div className="w-full lg:w-3/5 p-6 sm:p-8 md:p-12 relative z-10">
            <div className="mb-8 md:mb-10">
              <h3 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Solicitud de Admisión</h3>
              <p className="text-sm md:text-base text-slate-500 dark:text-zinc-400 font-medium">Completa tus datos y un asesor se comunicará contigo en menos de 24 horas.</p>
            </div>

            {enviado ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-12 md:py-16 h-[400px] md:h-[450px]"
              >
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-brand-primary/20 rounded-full blur-xl animate-pulse" />
                  <CheckCircle className="relative h-20 w-20 md:h-24 md:w-24 text-brand-primary" />
                </div>
                <h3 className="mb-2 text-2xl md:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight text-center">¡Solicitud Recibida!</h3>
                <p className="text-center text-sm md:text-lg text-slate-500 dark:text-zinc-400 max-w-sm md:max-w-md font-medium">
                  Gracias por tu interés. Un asesor académico revisará tu perfil y se comunicará contigo a la brevedad.
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5 md:space-y-6">
                
                {/* CAMPO: NOMBRE (Con animación de tipeo) */}
                <div className="space-y-2 group">
                  <Label htmlFor="nombre" className="text-slate-700 dark:text-zinc-300 font-bold uppercase tracking-wider text-[10px] md:text-xs">Nombre completo</Label>
                  <div className="relative">
                    <Input 
                      id="nombre" 
                      placeholder={nombrePlaceholder} 
                      required 
                      className="h-12 md:h-14 bg-slate-50 dark:bg-zinc-950/50 border-slate-200 dark:border-zinc-800 focus:border-brand-primary focus:ring-brand-primary/20 transition-all rounded-xl text-sm md:text-base px-4 md:px-5 placeholder:text-slate-400/70"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-0.5 bg-brand-primary/50 animate-pulse" />
                  </div>
                </div>
                
                <div className="grid gap-5 md:gap-6 sm:grid-cols-2">
                  {/* CAMPO: TELÉFONO */}
                  <div className="space-y-2">
                    <Label htmlFor="telefono" className="text-slate-700 dark:text-zinc-300 font-bold uppercase tracking-wider text-[10px] md:text-xs">Teléfono Móvil</Label>
                    <div className="relative">
                      <Input 
                        id="telefono" 
                        type="tel" 
                        placeholder={telPlaceholder} 
                        required 
                        className="h-12 md:h-14 bg-slate-50 dark:bg-zinc-950/50 border-slate-200 dark:border-zinc-800 focus:border-brand-primary focus:ring-brand-primary/20 transition-all rounded-xl text-sm md:text-base px-4 md:px-5 placeholder:text-slate-400/70"
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-0.5 bg-brand-primary/50 animate-pulse hidden sm:block" />
                    </div>
                  </div>
                  
                  {/* CAMPO: CORREO */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-slate-700 dark:text-zinc-300 font-bold uppercase tracking-wider text-[10px] md:text-xs">Correo Electrónico</Label>
                    <div className="relative">
                      <Input 
                        id="email" 
                        type="email" 
                        placeholder={emailPlaceholder} 
                        required 
                        className="h-12 md:h-14 bg-slate-50 dark:bg-zinc-950/50 border-slate-200 dark:border-zinc-800 focus:border-brand-primary focus:ring-brand-primary/20 transition-all rounded-xl text-sm md:text-base px-4 md:px-5 placeholder:text-slate-400/70"
                      />
                    </div>
                  </div>
                </div>

                {/* CAMPO: PROGRAMA (Select nativo) */}
                <div className="space-y-2">
                  <Label htmlFor="programa" className="text-slate-700 dark:text-zinc-300 font-bold uppercase tracking-wider text-[10px] md:text-xs">Programa de interés</Label>
                  <Select required>
                    <SelectTrigger className="h-12 md:h-14 bg-slate-50 dark:bg-zinc-950/50 border-slate-200 dark:border-zinc-800 focus:ring-brand-primary/20 rounded-xl text-sm md:text-base px-4 md:px-5 text-slate-500 dark:text-zinc-400">
                      <SelectValue placeholder="Selecciona un programa académico" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {programas.map((programa) => (
                        <SelectItem key={programa.id} value={programa.id} className="cursor-pointer font-medium py-2.5 md:py-3 rounded-lg hover:bg-brand-primary/5">
                          {programa.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mensaje" className="text-slate-700 dark:text-zinc-300 font-bold uppercase tracking-wider text-[10px] md:text-xs">Dudas Adicionales (Opcional)</Label>
                  <Textarea
                    id="mensaje"
                    placeholder="Escribe si te interesa aplicar para alguna beca o revalidar materias..."
                    rows={3}
                    className="resize-none bg-slate-50 dark:bg-zinc-950/50 border-slate-200 dark:border-zinc-800 focus:border-brand-primary focus:ring-brand-primary/20 transition-all rounded-xl p-4 md:p-5 text-sm md:text-base placeholder:text-slate-400/70"
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full h-14 md:h-16 rounded-xl bg-brand-primary hover:bg-brand-highlight text-white shadow-xl shadow-brand-primary/20 transition-all text-xs sm:text-sm md:text-base font-black uppercase tracking-widest mt-2 hover:scale-[1.02]"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                       <div className="h-4 w-4 md:h-5 md:w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                       Procesando Solicitud...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Enviar Solicitud Oficial <Send className="h-4 w-4 md:h-5 md:w-5 ml-1 md:ml-2" />
                    </span>
                  )}
                </Button>
                
                <p className="text-center text-[10px] md:text-xs text-slate-500 dark:text-zinc-500 font-medium pt-2">
                  Tus datos están protegidos bajo nuestro <a href="aviso-de-privacidad" className="text-brand-primary font-bold hover:underline">Aviso de Privacidad</a>.
                </p>
              </form>
            )}
          </div>

          {/* ================= PANEL DERECHO: INFO DE CONTACTO ================= */}
          <div className="w-full lg:w-2/5 relative overflow-hidden bg-slate-900 dark:bg-black p-6 sm:p-8 md:p-12 text-white flex flex-col justify-between">
            
            {/* Imagen de fondo oscurecida (Premium) */}
            <div className="absolute inset-0 z-0">
              <img 
                src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2070&auto=format&fit=crop" 
                alt="Estudiantes en campus" 
                className="object-cover w-full h-full opacity-30 mix-blend-luminosity scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-slate-900/40 dark:from-black dark:via-black/90 dark:to-black/50" />
            </div>

            <div className="relative z-10">
              <h3 className="text-xl md:text-2xl font-black mb-8 md:mb-10 uppercase tracking-tight text-white flex items-center gap-3">
                <div className="h-6 w-1.5 md:h-8 md:w-2 bg-brand-primary rounded-full" />
                Contacto Directo
              </h3>
              
              <div className="space-y-6 md:space-y-8">
                {/* Ítem: Dirección */}
                <div className="flex items-start gap-4 md:gap-5 group">
                  <div className="flex h-12 w-12 md:h-14 md:w-14 shrink-0 items-center justify-center rounded-xl md:rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 group-hover:bg-brand-primary group-hover:border-brand-primary transition-all duration-300 shadow-xl">
                    <MapPin className="h-5 w-5 md:h-6 md:w-6 text-brand-primary group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white uppercase tracking-wider text-xs md:text-sm mb-0.5 md:mb-1">Campus Central</h4>
                    <p className="text-slate-300 font-medium leading-relaxed text-xs md:text-sm">
                      Av. Universidad #123, Col. Centro<br />
                      Durango, Dgo. CP 34000
                    </p>
                  </div>
                </div>

                {/* Ítem: Teléfono */}
                <div className="flex items-start gap-4 md:gap-5 group">
                  <div className="flex h-12 w-12 md:h-14 md:w-14 shrink-0 items-center justify-center rounded-xl md:rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 group-hover:bg-brand-primary group-hover:border-brand-primary transition-all duration-300 shadow-xl">
                    <Phone className="h-5 w-5 md:h-6 md:w-6 text-brand-primary group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white uppercase tracking-wider text-xs md:text-sm mb-0.5 md:mb-1">Línea de Admisiones</h4>
                    <p className="text-slate-300 font-medium leading-relaxed text-xs md:text-sm">
                      (618) 123-4567<br />
                      (618) 765-4321
                    </p>
                  </div>
                </div>

                {/* Ítem: Correo */}
                <div className="flex items-start gap-4 md:gap-5 group">
                  <div className="flex h-12 w-12 md:h-14 md:w-14 shrink-0 items-center justify-center rounded-xl md:rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 group-hover:bg-brand-primary group-hover:border-brand-primary transition-all duration-300 shadow-xl">
                    <Mail className="h-5 w-5 md:h-6 md:w-6 text-brand-primary group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white uppercase tracking-wider text-xs md:text-sm mb-0.5 md:mb-1">Atención Electrónica</h4>
                    <p className="text-slate-300 font-medium leading-relaxed text-xs md:text-sm">
                      admisiones@iud.edu.mx<br />
                      info@iud.edu.mx
                    </p>
                  </div>
                </div>

                {/* Ítem: Horario */}
                <div className="flex items-start gap-4 md:gap-5 group">
                  <div className="flex h-12 w-12 md:h-14 md:w-14 shrink-0 items-center justify-center rounded-xl md:rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 group-hover:bg-brand-primary group-hover:border-brand-primary transition-all duration-300 shadow-xl">
                    <Clock className="h-5 w-5 md:h-6 md:w-6 text-brand-primary group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white uppercase tracking-wider text-xs md:text-sm mb-0.5 md:mb-1">Horarios</h4>
                    <p className="text-slate-300 font-medium leading-relaxed text-xs md:text-sm">
                      Lunes a Viernes: 9:00 AM - 7:00 PM<br />
                      Sábados: 9:00 AM - 2:00 PM
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Logo de Agua inferior */}
            <div className="relative z-10 mt-8 md:mt-12 flex justify-end opacity-20">
              <Sparkles className="h-16 w-16 md:h-24 md:w-24 text-white" />
            </div>
          </div>

        </motion.div>
      </div>
    </section>
  )
}