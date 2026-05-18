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
    <section id="contacto" className="relative py-24 bg-gray-50 dark:bg-black overflow-hidden border-t border-border/50">
      
      {/* Luces de fondo decorativas muy sutiles */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-brand-primary/5 rounded-full blur-[120px] -z-10 pointer-events-none" />

      <div className="container relative z-10 px-4 md:px-6 mx-auto">
        
        {/* ================= ENCABEZADO INSTITUCIONAL ================= */}
        <div className="mx-auto mb-16 max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-black text-white dark:bg-white dark:text-black font-bold text-xs uppercase tracking-widest mb-6 shadow-sm">
            Departamento de Admisiones
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-foreground mb-6 uppercase leading-[1.1]">
            INICIA TU PROCESO DE <span className="text-brand-primary block mt-1">INSCRIPCIÓN HOY</span>
          </h2>
          <p className="text-lg text-muted-foreground font-medium max-w-2xl mx-auto">
            Da el primer paso hacia tu futuro profesional. Nuestro equipo de asesores académicos está listo para guiarte en tu proceso de admisión y opciones de beca.
          </p>
        </div>

        {/* ================= CONTENEDOR PRINCIPAL (ESTILO CORPORATIVO) ================= */}
        <div className="mx-auto max-w-6xl rounded-none shadow-2xl border-t-8 border-brand-primary bg-white dark:bg-gray-900 flex flex-col lg:flex-row overflow-hidden">
          
          {/* ================= PANEL IZQUIERDO: FORMULARIO ================= */}
          <div className="w-full lg:w-3/5 p-8 md:p-12 relative">
            <div className="mb-8">
              <h3 className="text-2xl font-black text-foreground mb-2 uppercase tracking-tight">Solicitud de Información</h3>
              <p className="text-muted-foreground font-medium">Completa tus datos y un asesor se comunicará contigo en menos de 24 horas.</p>
            </div>

            {enviado ? (
              <div className="animate-fade-in flex flex-col items-center justify-center py-16 h-[400px]">
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-brand-primary/20 rounded-full blur-xl animate-pulse" />
                  <CheckCircle className="relative h-24 w-24 text-brand-primary" />
                </div>
                <h3 className="mb-2 text-3xl font-black text-foreground uppercase tracking-tight text-center">¡Solicitud Recibida!</h3>
                <p className="text-center text-muted-foreground max-w-md font-medium text-lg">
                  Gracias por tu interés. Un asesor académico revisará tu perfil y se comunicará contigo a la brevedad.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="nombre" className="text-foreground font-bold uppercase tracking-wider text-xs">Nombre completo</Label>
                  <Input 
                    id="nombre" 
                    placeholder="Escribe tu nombre oficial" 
                    required 
                    className="h-14 bg-gray-50 dark:bg-black/50 border-gray-200 dark:border-gray-800 focus:border-brand-primary focus:ring-brand-primary/20 transition-all rounded-none text-base"
                  />
                </div>
                
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="telefono" className="text-foreground font-bold uppercase tracking-wider text-xs">Teléfono Móvil</Label>
                    <Input 
                      id="telefono" 
                      type="tel" 
                      placeholder="Ej. (618) 123-4567" 
                      required 
                      className="h-14 bg-gray-50 dark:bg-black/50 border-gray-200 dark:border-gray-800 focus:border-brand-primary focus:ring-brand-primary/20 transition-all rounded-none text-base"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-foreground font-bold uppercase tracking-wider text-xs">Correo Electrónico</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="tu@correo.com" 
                      required 
                      className="h-14 bg-gray-50 dark:bg-black/50 border-gray-200 dark:border-gray-800 focus:border-brand-primary focus:ring-brand-primary/20 transition-all rounded-none text-base"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="programa" className="text-foreground font-bold uppercase tracking-wider text-xs">Programa de interés</Label>
                  <Select required>
                    <SelectTrigger className="h-14 bg-gray-50 dark:bg-black/50 border-gray-200 dark:border-gray-800 focus:ring-brand-primary/20 rounded-none text-base">
                      <SelectValue placeholder="Selecciona un programa académico" />
                    </SelectTrigger>
                    <SelectContent className="rounded-none">
                      {programas.map((programa) => (
                        <SelectItem key={programa.id} value={programa.id} className="cursor-pointer hover:bg-brand-primary/5 font-medium py-3">
                          {programa.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mensaje" className="text-foreground font-bold uppercase tracking-wider text-xs">Dudas o Comentarios Adicionales</Label>
                  <Textarea
                    id="mensaje"
                    placeholder="Cuéntanos si te interesa aplicar para alguna beca o revalidar materias..."
                    rows={4}
                    className="resize-none bg-gray-50 dark:bg-black/50 border-gray-200 dark:border-gray-800 focus:border-brand-primary focus:ring-brand-primary/20 transition-all rounded-none p-4 text-base"
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full h-16 rounded-none bg-brand-primary hover:bg-black dark:hover:bg-white dark:hover:text-black text-white shadow-xl transition-all text-lg font-black uppercase tracking-widest mt-4"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                       <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                       Procesando Solicitud...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Enviar Solicitud Oficial <Send className="h-5 w-5 ml-2" />
                    </span>
                  )}
                </Button>
              </form>
            )}
          </div>

          {/* ================= PANEL DERECHO: INFO DE CONTACTO ================= */}
          <div className="w-full lg:w-2/5 relative overflow-hidden bg-brand-primary p-8 md:p-12 text-white flex flex-col justify-between border-l border-white/10">
            
            {/* Imagen de fondo oscurecida con el color de la marca */}
            <div className="absolute inset-0 z-0">
              <img 
                src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2070&auto=format&fit=crop" 
                alt="Estudiantes en campus" 
                className="object-cover w-full h-full opacity-20 mix-blend-luminosity"
              />
              <div className="absolute inset-0 bg-brand-primary/80 mix-blend-multiply" />
            </div>

            <div className="relative z-10">
              <h3 className="text-2xl font-black mb-8 uppercase tracking-tight border-b border-white/20 pb-4">Contacto Directo</h3>
              
              <div className="space-y-8">
                {/* Ítem: Dirección */}
                <div className="flex items-start gap-5 group">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-none bg-white/10 backdrop-blur-sm border border-white/20 group-hover:bg-white group-hover:text-brand-primary transition-all duration-300">
                    <MapPin className="h-6 w-6 currentColor" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white uppercase tracking-wider text-sm mb-1">Campus Central</h4>
                    <p className="text-white/80 font-medium leading-relaxed">
                      Av. Universidad #123, Col. Centro<br />
                      Durango, Dgo. CP 34000
                    </p>
                  </div>
                </div>

                {/* Ítem: Teléfono */}
                <div className="flex items-start gap-5 group">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-none bg-white/10 backdrop-blur-sm border border-white/20 group-hover:bg-white group-hover:text-brand-primary transition-all duration-300">
                    <Phone className="h-6 w-6 currentColor" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white uppercase tracking-wider text-sm mb-1">Línea de Admisiones</h4>
                    <p className="text-white/80 font-medium leading-relaxed">
                      (618) 123-4567<br />
                      (618) 765-4321
                    </p>
                  </div>
                </div>

                {/* Ítem: Correo */}
                <div className="flex items-start gap-5 group">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-none bg-white/10 backdrop-blur-sm border border-white/20 group-hover:bg-white group-hover:text-brand-primary transition-all duration-300">
                    <Mail className="h-6 w-6 currentColor" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white uppercase tracking-wider text-sm mb-1">Atención Electrónica</h4>
                    <p className="text-white/80 font-medium leading-relaxed">
                      admisiones@iud.edu.mx<br />
                      info@iud.edu.mx
                    </p>
                  </div>
                </div>

                {/* Ítem: Horario */}
                <div className="flex items-start gap-5 group">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-none bg-white/10 backdrop-blur-sm border border-white/20 group-hover:bg-white group-hover:text-brand-primary transition-all duration-300">
                    <Clock className="h-6 w-6 currentColor" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white uppercase tracking-wider text-sm mb-1">Horario de Oficina</h4>
                    <p className="text-white/80 font-medium leading-relaxed">
                      Lunes a Viernes: 9:00 AM - 7:00 PM<br />
                      Sábados: 9:00 AM - 2:00 PM
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Mensaje inferior */}
            <div className="relative z-10 mt-12 pt-6 border-t border-white/20">
              <p className="text-sm text-white/80 font-medium">
                Tus datos están protegidos bajo nuestro <a href="aviso-de-privacidad" className="text-white font-bold underline underline-offset-2">Aviso de Privacidad</a>.
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}