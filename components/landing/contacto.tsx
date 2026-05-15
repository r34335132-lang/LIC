'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MapPin, Phone, Mail, Clock, Send, CheckCircle } from 'lucide-react'
import { programas } from '@/lib/data'

export function Contacto() {
  const [enviado, setEnviado] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Simular envío
    setEnviado(true)
    setTimeout(() => setEnviado(false), 3000)
  }

  return (
    <section id="contacto" className="py-20">
      <div className="container px-4 md:px-6">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Solicita información
          </h2>
          <p className="text-muted-foreground">
            Contáctanos y un asesor te brindará toda la información que necesitas
          </p>
        </div>

        <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-2">
          {/* Formulario */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Envíanos un mensaje</CardTitle>
              <CardDescription>
                Completa el formulario y nos pondremos en contacto contigo
              </CardDescription>
            </CardHeader>
            <CardContent>
              {enviado ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <CheckCircle className="mb-4 h-16 w-16 text-primary" />
                  <h3 className="mb-2 text-xl font-semibold">Mensaje enviado</h3>
                  <p className="text-center text-muted-foreground">
                    Gracias por contactarnos. Un asesor se comunicará contigo pronto.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="nombre">Nombre completo</Label>
                    <Input id="nombre" placeholder="Tu nombre" required />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="telefono">Teléfono</Label>
                      <Input id="telefono" type="tel" placeholder="618-123-4567" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Correo electrónico</Label>
                      <Input id="email" type="email" placeholder="tu@correo.com" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="programa">Programa de interés</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un programa" />
                      </SelectTrigger>
                      <SelectContent>
                        {programas.map((programa) => (
                          <SelectItem key={programa.id} value={programa.id}>
                            {programa.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mensaje">Mensaje</Label>
                    <Textarea
                      id="mensaje"
                      placeholder="Cuéntanos qué información necesitas..."
                      rows={4}
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    <Send className="mr-2 h-4 w-4" />
                    Solicitar información
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>

          {/* Información de contacto */}
          <div className="space-y-6">
            <Card className="border-border/50">
              <CardContent className="flex items-start gap-4 p-6">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="mb-1 font-semibold text-foreground">Dirección</h3>
                  <p className="text-sm text-muted-foreground">
                    Av. Universidad #123, Col. Centro<br />
                    Durango, Dgo. CP 34000
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardContent className="flex items-start gap-4 p-6">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Phone className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="mb-1 font-semibold text-foreground">Teléfono</h3>
                  <p className="text-sm text-muted-foreground">
                    (618) 123-4567<br />
                    (618) 765-4321
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardContent className="flex items-start gap-4 p-6">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="mb-1 font-semibold text-foreground">Correo electrónico</h3>
                  <p className="text-sm text-muted-foreground">
                    info@iud.edu.mx<br />
                    inscripciones@iud.edu.mx
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardContent className="flex items-start gap-4 p-6">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="mb-1 font-semibold text-foreground">Horario de atención</h3>
                  <p className="text-sm text-muted-foreground">
                    Lunes a Viernes: 9:00 AM - 7:00 PM<br />
                    Sábados: 9:00 AM - 2:00 PM
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
