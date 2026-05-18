'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ShieldCheck, Lock, ArrowRight, ArrowLeft, CheckCircle2, GraduationCap, FileText, Landmark } from 'lucide-react'
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
    
    // Simulador de carga para la experiencia de usuario
    setTimeout(() => {
      setIsLoading(false)
      setIsSuccess(true)
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex flex-col selection:bg-brand-primary selection:text-white">
      
      {/* ================= HEADER SIMPLIFICADO (Mantiene tu estilo) ================= */}
      <header className="absolute top-0 w-full z-50 p-6 border-b border-transparent dark:border-white/5">
        <div className="container mx-auto flex justify-between items-center max-w-6xl">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-brand-primary dark:text-zinc-400 dark:hover:text-white transition-colors group">
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" /> 
            Volver a la página principal
          </Link>
          
          {/* Tu Logo Moderno */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-primary to-brand-highlight shadow-lg shadow-brand-primary/20">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <div className="flex flex-col hidden sm:flex">
              <span className="text-sm font-extrabold leading-tight tracking-tight text-slate-900 dark:text-white">
                Instituto Universitario
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* ================= CONTENIDO PRINCIPAL ================= */}
      <main className="flex-1 flex items-center justify-center py-24">
        
        {/* Fondos Decorativos (Glows sutiles con tus colores) */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute -top-[10%] -right-[5%] w-[40%] h-[40%] rounded-full bg-brand-primary/10 blur-[100px]" />
          <div className="absolute bottom-[10%] -left-[10%] w-[30%] h-[30%] rounded-full bg-brand-highlight/10 blur-[100px]" />
        </div>

        <div className="container mx-auto px-4 md:px-6 relative z-10 max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            
            {/* ================= COLUMNA IZQUIERDA: INFORMACIÓN OFICIAL ================= */}
            <div className="space-y-8">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-primary/10 text-brand-primary font-bold text-xs uppercase tracking-widest mb-6 rounded-full border border-brand-primary/20">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-primary"></span>
                  </span>
                  Admisiones Abiertas
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.1] mb-6">
                  Registro de Aspirantes a <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-highlight">Nuevo Ingreso</span>
                </h1>
                <p className="text-lg text-slate-600 dark:text-zinc-400 font-medium leading-relaxed">
                  Bienvenido al sistema de registro oficial. Al completar este formulario, inicias formalmente la apertura de tu expediente académico.
                </p>
              </div>

              {/* Indicadores Formales con tu diseño UI */}
              <div className="space-y-6 pt-6 border-t border-slate-200 dark:border-zinc-800">
                <div className="flex gap-4">
                  <div className="flex items-center justify-center h-12 w-12 rounded-2xl bg-white dark:bg-zinc-900 shadow-sm border border-slate-100 dark:border-zinc-800 shrink-0 text-brand-primary">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-lg">Validación Oficial</h3>
                    <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1 leading-relaxed">Cada matrícula emitida está respaldada por los lineamientos y acuerdos de RVOE otorgados por la SEP.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex items-center justify-center h-12 w-12 rounded-2xl bg-white dark:bg-zinc-900 shadow-sm border border-slate-100 dark:border-zinc-800 shrink-0 text-brand-primary">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-lg">Apertura de Expediente</h3>
                    <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1 leading-relaxed">Tus datos se utilizarán exclusivamente para tu historial de calificaciones y trámites de titulación legal.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex items-center justify-center h-12 w-12 rounded-2xl bg-white dark:bg-zinc-900 shadow-sm border border-slate-100 dark:border-zinc-800 shrink-0 text-brand-primary">
                    <Landmark className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-lg">Protección de Datos</h3>
                    <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1 leading-relaxed">Seguridad total en el manejo de tu información bajo la Ley Federal de Protección de Datos Personales.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* ================= COLUMNA DERECHA: FORMULARIO MODERNO ================= */}
            <div>
              <div className="bg-white dark:bg-zinc-900/80 backdrop-blur-xl rounded-[2rem] p-8 md:p-10 shadow-2xl border border-slate-200 dark:border-zinc-800 relative overflow-hidden">
                
                {isSuccess ? (
                  /* PANTALLA DE ÉXITO */
                  <div className="text-center py-10 animate-in zoom-in duration-500">
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-brand-primary/10 mb-6">
                      <CheckCircle2 className="h-10 w-10 text-brand-primary" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3">
                      Solicitud Recibida
                    </h3>
                    <p className="text-slate-500 dark:text-zinc-400 mb-8 max-w-sm mx-auto leading-relaxed">
                      Tu información ha sido validada. El sistema está generando tu número de aspirante institucional.
                    </p>
                    <div className="flex items-center justify-center gap-2 text-brand-primary font-bold animate-pulse text-sm uppercase tracking-widest">
                      <Lock className="h-4 w-4" /> Configurando expediente seguro...
                    </div>
                  </div>
                ) : (
                  /* FORMULARIO */
                  <>
                    <div className="mb-8">
                      <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Ficha de Inscripción</h2>
                      <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">Ingresa tus datos tal como aparecen en tu identificación oficial.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                      
                      <div className="space-y-2">
                        <Label htmlFor="nombre" className="text-slate-700 dark:text-zinc-300 font-bold text-sm">
                          Nombre Completo del Alumno
                        </Label>
                        <Input 
                          id="nombre" 
                          placeholder="Nombre(s) y Apellidos" 
                          required 
                          className="h-14 rounded-xl bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 px-4 transition-colors focus-visible:ring-brand-primary"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="email" className="text-slate-700 dark:text-zinc-300 font-bold text-sm">
                            Correo Electrónico
                          </Label>
                          <Input 
                            id="email" 
                            type="email" 
                            placeholder="ejemplo@correo.com" 
                            required 
                            className="h-14 rounded-xl bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 px-4 transition-colors focus-visible:ring-brand-primary"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="telefono" className="text-slate-700 dark:text-zinc-300 font-bold text-sm">
                            Teléfono de Contacto
                          </Label>
                          <Input 
                            id="telefono" 
                            type="tel" 
                            placeholder="10 dígitos" 
                            required 
                            className="h-14 rounded-xl bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 px-4 transition-colors focus-visible:ring-brand-primary"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="programa" className="text-slate-700 dark:text-zinc-300 font-bold text-sm">
                          Programa Académico a Cursar
                        </Label>
                        <Select required>
                          <SelectTrigger className="h-14 rounded-xl bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 px-4 transition-colors focus:ring-brand-primary">
                            <SelectValue placeholder="Seleccione el plan de estudios..." />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl">
                            {programas.map((prog) => (
                              <SelectItem key={prog.id} value={prog.id} className="rounded-lg cursor-pointer">
                                {prog.nombre}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <Button 
                        type="submit" 
                        disabled={isLoading}
                        className="w-full h-14 rounded-xl bg-brand-primary hover:bg-brand-highlight text-white font-black uppercase tracking-widest text-sm shadow-xl hover:shadow-brand-primary/20 transition-all hover:scale-[1.02]"
                      >
                        {isLoading ? (
                          <span className="flex items-center gap-2">
                            <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" /> 
                            Validando Expediente...
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            Continuar con mi Inscripción <ArrowRight className="h-4 w-4" />
                          </span>
                        )}
                      </Button>

                      <p className="text-center text-xs text-slate-500 dark:text-zinc-500 font-medium px-4">
                        Al enviar este formulario administrativo, aceptas nuestro <Link href="/aviso-de-privacidad" className="text-brand-primary hover:underline font-bold">Aviso de Privacidad</Link>.
                      </p>
                    </form>
                  </>
                )}
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  )
}