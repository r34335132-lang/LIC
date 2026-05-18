'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Shield, ArrowRight, ArrowLeft, Check, FileText, Landmark, UserCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { programas } from '@/lib/data'

export default function InscripcionPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    setTimeout(() => {
      setIsLoading(false)
      setIsSuccess(true)
    }, 2200)
  }

  return (
    <div className="min-h-screen bg-[#faf8f5] dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 flex flex-col font-sans selection:bg-slate-900 selection:text-white antialiased">
      
      {/* BARRA SUPERIOR INSTITUCIONAL */}
      <header className="w-full border-b border-slate-200/60 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md">
        <div className="container mx-auto max-w-6xl h-20 px-4 md:px-6 flex justify-between items-center">
          <Link href="/" className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white transition-colors group">
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" /> 
            Regresar al Portal
          </Link>
          <div className="flex flex-col items-end">
            <span className="font-serif text-lg font-bold tracking-tight text-slate-900 dark:text-white">
              Instituto Universitario
            </span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 -mt-1">
              Durango
            </span>
          </div>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 flex items-center justify-center py-16 md:py-24 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            
            {/* COLUMNA IZQUIERDA: REQUISITOS E INFORMACIÓN OFICIAL */}
            <div className="lg:col-span-5 space-y-10 lg:pr-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-3">
                  Admisiones Ciclo Escolar 2026
                </span>
                <h1 className="font-serif text-3xl md:text-4xl font-normal tracking-tight text-slate-900 dark:text-white leading-tight">
                  Registro de Aspirantes a Nuevo Ingreso
                </h1>
                <div className="h-1 w-12 bg-slate-900 dark:bg-white mt-6 rounded-full" />
              </div>

              <p className="text-sm text-slate-600 dark:text-zinc-400 leading-relaxed font-normal">
                Bienvenido al sistema de registro oficial de nuestra casa de estudios. Al completar este formulario, inicias formalmente la apertura de tu expediente académico institucional.
              </p>

              {/* Indicadores formales (Estilo Universitario) */}
              <div className="space-y-6 pt-4 border-t border-slate-200/60 dark:border-zinc-800">
                <div className="flex gap-4">
                  <Shield className="h-5 w-5 text-slate-700 dark:text-zinc-300 shrink-0 mt-0.5 stroke-[1.5]" />
                  <div>
                    <h3 className="text-sm font-semibold tracking-tight text-slate-900 dark:text-white">Validación de Documentación Oficial</h3>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 leading-relaxed">Cada matrícula emitida está sujeta a los lineamientos y acuerdos de RVOE otorgados por las autoridades de la SEP.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <FileText className="h-5 w-5 text-slate-700 dark:text-zinc-300 shrink-0 mt-0.5 stroke-[1.5]" />
                  <div>
                    <h3 className="text-sm font-semibold tracking-tight text-slate-900 dark:text-white">Apertura de Expediente Físico y Digital</h3>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 leading-relaxed">Tus datos recolectados se utilizarán exclusivamente para generar tu historial de calificaciones, control de asistencias y titulación legal.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Landmark className="h-5 w-5 text-slate-700 dark:text-zinc-300 shrink-0 mt-0.5 stroke-[1.5]" />
                  <div>
                    <h3 className="text-sm font-semibold tracking-tight text-slate-900 dark:text-white">Respaldo Institucional</h3>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 leading-relaxed">Seguridad total en el manejo de tu información de acuerdo con la Ley Federal de Protección de Datos Personales.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* COLUMNA DERECHA: FORMULARIO SOBRIO Y ELEGANTE */}
            <div className="lg:col-span-7 w-full">
              <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800/80 p-8 md:p-10 shadow-sm rounded-none relative">
                
                {isSuccess ? (
                  /* PANTALLA DE ÉXITO PREMIUM */
                  <div className="text-center py-12 animate-in fade-in zoom-in-95 duration-500">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-white mb-6 border border-slate-200 dark:border-zinc-700">
                      <UserCheck className="h-6 w-6 stroke-[1.5]" />
                    </div>
                    <h3 className="font-serif text-2xl font-normal text-slate-900 dark:text-white mb-3">
                      Solicitud de Ingreso Recibida
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-zinc-400 max-w-md mx-auto mb-8 leading-relaxed">
                      Tu información ha sido validada de manera correcta. El sistema está generando tu número de aspirante institucional y tu alta escolar.
                    </p>
                    <div className="inline-flex items-center gap-2.5 text-xs font-semibold uppercase tracking-widest text-slate-400">
                      <div className="h-3 w-3 rounded-full border border-slate-300 dark:border-zinc-600 border-t-slate-900 dark:border-t-white animate-spin" />
                      Configurando expediente estudiantil...
                    </div>
                  </div>
                ) : (
                  /* FORMULARIO ACADÉMICO */
                  <>
                    <div className="mb-8">
                      <h2 className="text-lg font-bold uppercase tracking-wider text-slate-900 dark:text-white">Ficha de Inscripción</h2>
                      <p className="text-xs text-slate-400 dark:text-zinc-500 mt-1">Por favor, ingrese sus datos completos tal como aparecen en su documentación de identidad legal.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                      
                      <div className="space-y-2">
                        <Label htmlFor="nombre" className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300">
                          Nombre Completo del Alumno
                        </Label>
                        <Input 
                          id="nombre" 
                          placeholder="Nombre(s) y Apellidos completos" 
                          required 
                          className="h-11 rounded-none bg-slate-50/50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 text-sm focus-visible:ring-1 focus-visible:ring-slate-400 focus-visible:ring-offset-0 placeholder:text-slate-400"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300">
                            Correo Electrónico Personal
                          </Label>
                          <Input 
                            id="email" 
                            type="email" 
                            placeholder="ejemplo@correo.com" 
                            required 
                            className="h-11 rounded-none bg-slate-50/50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 text-sm focus-visible:ring-1 focus-visible:ring-slate-400 focus-visible:ring-offset-0 placeholder:text-slate-400"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="telefono" className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300">
                            Teléfono de Contacto Directo
                          </Label>
                          <Input 
                            id="telefono" 
                            type="tel" 
                            placeholder="Código de área + 7 o 10 dígitos" 
                            required 
                            className="h-11 rounded-none bg-slate-50/50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 text-sm focus-visible:ring-1 focus-visible:ring-slate-400 focus-visible:ring-offset-0 placeholder:text-slate-400"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="programa" className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300">
                          Programa Académico a Cursar
                        </Label>
                        <Select required>
                          <SelectTrigger className="h-11 rounded-none bg-slate-50/50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 text-sm focus:ring-1 focus:ring-slate-400 focus:ring-offset-0 text-slate-600 dark:text-zinc-300">
                            <SelectValue placeholder="Seleccione el plan de estudios correspondiente..." />
                          </SelectTrigger>
                          <SelectContent className="rounded-none">
                            {programas.map((prog) => (
                              <SelectItem key={prog.id} value={prog.id} className="rounded-none text-sm">
                                {prog.nombre}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="pt-4">
                        <Button 
                          type="submit" 
                          disabled={isLoading}
                          className="w-full h-12 rounded-none bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 font-bold uppercase tracking-widest text-xs transition-colors shadow-sm"
                        >
                          {isLoading ? (
                            <span className="flex items-center gap-2">
                              <div className="h-3 w-3 rounded-full border-2 border-white dark:border-slate-900 border-t-transparent animate-spin" /> 
                              Validando Expediente Académico...
                            </span>
                          ) : (
                            <span className="flex items-center gap-1">
                              Continuar con mi Proceso de Inscripción <ArrowRight className="h-3.5 w-3.5 ml-1" />
                            </span>
                          )}
                        </Button>
                      </div>

                      <p className="text-center text-[10px] text-slate-400 dark:text-zinc-500 font-medium leading-relaxed max-w-xs mx-auto">
                        Al enviar este formulario administrativo, sus datos quedan protegidos bajo nuestro {' '}
                        <Link href="/aviso-de-privacidad" className="text-slate-600 dark:text-zinc-300 underline font-semibold hover:text-slate-900">
                          Aviso de Privacidad Institucional
                        </Link>.
                      </p>
                    </form>
                  </>
                )}
              </div>
            </div >

          </div >
        </div >
      </main >
    </div >
  )
}