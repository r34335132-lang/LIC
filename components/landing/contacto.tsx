'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MapPin, Phone, Mail, Clock, Send, CheckCircle, MessageSquare } from 'lucide-react'
import { programas } from '@/lib/data'

export function Contacto() {
  const [enviado, setEnviado] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    // Simular envío con un pequeño retraso para el efecto visual
    setTimeout(() => {
      setIsSubmitting(false)
      setEnviado(true)
      setTimeout(() => setEnviado(false), 5000)
    }, 1500)
  }

  return (
    <section id="contacto" className="relative py-24 bg-gray-50/30 dark:bg-black/80 overflow-hidden">
      
      {/* Luces de fondo decorativas */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-brand-primary/5 rounded-full blur-[120px] -z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-brand-highlight/5 rounded-full blur-[120px] -z-10 pointer-events-none" />

      <div className="container relative z-10 px-4 md:px-6 mx-auto">
        
        {/* Encabezado */}
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-primary/5 text-brand-primary font-semibold text-sm mb-6 border border-brand-primary/10">
            <MessageSquare className="h-4 w-4 text-brand-highlight" />
            <span>Estamos para ayudarte</span>
          </div>
          <h2 className="mb-4 text-4xl font-extrabold tracking-tight text-foreground md:text-5xl">
            Ponte en <span className="text-gradient-brand">Contacto</span>
          </h2>
          <p className="text-lg text-muted-foreground font-light">
            Da el primer paso hacia tu futuro profesional. Nuestro equipo de asesores está listo para resolver todas tus dudas.
          </p>
        </div>

        <div className="mx-auto max-w-6xl rounded-3xl overflow-hidden shadow-2xl shadow-brand-primary/10 border border-border/50 bg-white/60 dark:bg-black/60 backdrop-blur-xl flex flex-col lg:flex-row">
          
          {/* ================= PANEL IZQUIERDO: FORMULARIO ================= */}
          <div className="w-full lg:w-3/5 p-8 md:p-12 relative">
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-foreground mb-2">Envíanos un mensaje</h3>
              <p className="text-muted-foreground">Completa el formulario y nos pondremos en contacto contigo en menos de 24 horas.</p>
            </div>

            {enviado ? (
              <div className="animate-fade-in flex flex-col items-center justify-center py-16 h-[400px]">
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-brand-highlight/20 rounded-full blur-xl animate-pulse" />
                  <CheckCircle className="relative h-20 w-20 text-brand-highlight" />
                </div>
                <h3 className="mb-2 text-2xl font-bold text-foreground">¡Mensaje enviado con éxito!</h3>
                <p className="text-center text-muted-foreground max-w-md">
                  Gracias por tu interés en nuestra institución. Un asesor se comunicará contigo a la brevedad.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="nombre" className="text-foreground/80 font-medium">Nombre completo</Label>
                  <Input 
                    id="nombre" 
                    placeholder="Escribe tu nombre" 
                    required 
                    className="h-12 bg-white/50 dark:bg-black/50 border-border/50 focus:border-brand-primary focus:ring-brand-primary/20 transition-all rounded-xl"
                  />
                </div>
                
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="telefono" className="text-foreground/80 font-medium">Teléfono</Label>
                    <Input 
                      id="telefono" 
                      type="tel" 
                      placeholder="Ej. (618) 123-4567" 
                      required 
                      className="h-12 bg-white/50 dark:bg-black/50 border-border/50 focus:border-brand-primary focus:ring-brand-primary/20 transition-all rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-foreground/80 font-medium">Correo electrónico</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="tu@correo.com" 
                      required 
                      className="h-12 bg-white/50 dark:bg-black/50 border-border/50 focus:border-brand-primary focus:ring-brand-primary/20 transition-all rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="programa" className="text-foreground/80 font-medium">Programa de interés</Label>
                  <Select required>
                    <SelectTrigger className="h-12 bg-white/50 dark:bg-black/50 border-border/50 focus:ring-brand-primary/20 rounded-xl">
                      <SelectValue placeholder="Selecciona un programa" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {programas.map((programa) => (
                        <SelectItem key={programa.id} value={programa.id} className="cursor-pointer hover:bg-brand-primary/5">
                          {programa.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mensaje" className="text-foreground/80 font-medium">Mensaje o dudas específicas</Label>
                  <Textarea
                    id="mensaje"
                    placeholder="Cuéntanos qué información adicional necesitas..."
                    rows={4}
                    className="resize-none bg-white/50 dark:bg-black/50 border-border/50 focus:border-brand-primary focus:ring-brand-primary/20 transition-all rounded-xl"
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full h-14 rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-white shadow-lg shadow-brand-primary/20 transition-all hover:scale-[1.02] text-base font-semibold"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                       <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                       Enviando...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Send className="h-5 w-5" /> Solicitar información
                    </span>
                  )}
                </Button>
              </form>
            )}
          </div>

          {/* ================= PANEL DERECHO: INFO DE CONTACTO ================= */}
          <div className="w-full lg:w-2/5 relative overflow-hidden bg-gradient-to-br from-[#0A4DCC] to-[#052b73] p-8 md:p-12 text-white flex flex-col justify-between">
            {/* Elemento de diseño de fondo */}
            <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 opacity-10">
              <MessageSquare className="w-64 h-64" />
            </div>

            <div className="relative z-10">
              <h3 className="text-2xl font-bold mb-8">Información Directa</h3>
              
              <div className="space-y-8">
                {/* Ítem: Dirección */}
                <div className="flex items-start gap-4 group">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/10 group-hover:bg-[#00D0FE]/20 transition-colors duration-300">
                    <MapPin className="h-6 w-6 text-[#00D0FE]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white/90 mb-1">Visítanos</h4>
                    <p className="text-white/70 text-sm leading-relaxed">
                      Av. Universidad #123, Col. Centro<br />
                      Durango, Dgo. CP 34000
                    </p>
                  </div>
                </div>

                {/* Ítem: Teléfono */}
                <div className="flex items-start gap-4 group">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/10 group-hover:bg-[#00D0FE]/20 transition-colors duration-300">
                    <Phone className="h-6 w-6 text-[#00D0FE]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white/90 mb-1">Llámanos</h4>
                    <p className="text-white/70 text-sm leading-relaxed">
                      (618) 123-4567<br />
                      (618) 765-4321
                    </p>
                  </div>
                </div>

                {/* Ítem: Correo */}
                <div className="flex items-start gap-4 group">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/10 group-hover:bg-[#00D0FE]/20 transition-colors duration-300">
                    <Mail className="h-6 w-6 text-[#00D0FE]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white/90 mb-1">Escríbenos</h4>
                    <p className="text-white/70 text-sm leading-relaxed">
                      info@iud.edu.mx<br />
                      inscripciones@iud.edu.mx
                    </p>
                  </div>
                </div>

                {/* Ítem: Horario */}
                <div className="flex items-start gap-4 group">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/10 group-hover:bg-[#00D0FE]/20 transition-colors duration-300">
                    <Clock className="h-6 w-6 text-[#00D0FE]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white/90 mb-1">Horarios de atención</h4>
                    <p className="text-white/70 text-sm leading-relaxed">
                      Lunes a Viernes: 9:00 AM - 7:00 PM<br />
                      Sábados: 9:00 AM - 2:00 PM
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Mensaje inferior pequeño */}
            <div className="relative z-10 mt-12 pt-8 border-t border-white/10">
              <p className="text-sm text-white/60">
                Respuesta promedio: <span className="text-white font-semibold">menos de 2 horas</span> en días hábiles.
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}