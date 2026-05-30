import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, GraduationCap, BookOpen, Clock, Award } from 'lucide-react'
import { Header } from '@/components/landing/header'
import { Footer } from '@/components/landing/footer'
import { planPsicologiaMeta } from '@/lib/planes/psicologia'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'Plan de estudios — Licenciatura en Psicología',
  description: 'Consulta el plan de estudios de la Licenciatura en Psicología del Instituto Universitario de Durango.',
}

export default function PlanEstudiosPsicologiaPage() {
  const totalMaterias = planPsicologiaMeta.periodos.reduce((acc, p) => acc + p.materias.length, 0)
  const totalCreditos = planPsicologiaMeta.periodos.reduce(
    (acc, p) => acc + p.materias.reduce((s, m) => s + m.creditos, 0),
    0
  )

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-slate-50 pt-32">
        <div className="container mx-auto px-4 py-12 md:px-6">
          <Link href="/programas/lic-psicologia" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-brand-primary mb-8">
            <ArrowLeft className="h-4 w-4" /> Volver al programa
          </Link>

          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-brand-primary/10 px-4 py-2 text-xs font-black uppercase tracking-widest text-brand-primary mb-4">
              <GraduationCap className="h-4 w-4" />
              Licenciatura
            </div>
            <h1 className="text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
              {planPsicologiaMeta.nombre}
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">{planPsicologiaMeta.modalidad}</p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <Card>
              <CardContent className="flex items-center gap-4 p-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-primary text-white">
                  <Clock className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-2xl font-black">{planPsicologiaMeta.duracionSemestres}</p>
                  <p className="text-sm text-muted-foreground">Semestres</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-4 p-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-primary text-white">
                  <BookOpen className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-2xl font-black">{totalMaterias}</p>
                  <p className="text-sm text-muted-foreground">Materias</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-4 p-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-primary text-white">
                  <Award className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-2xl font-black">{totalCreditos}</p>
                  <p className="text-sm text-muted-foreground">Créditos totales</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-12 space-y-8">
            {planPsicologiaMeta.periodos.map((periodo) => (
              <Card key={periodo.periodo} className="overflow-hidden">
                <CardHeader className="bg-brand-primary/5 border-b">
                  <CardTitle className="flex items-center gap-3">
                    {periodo.nombre}
                    <Badge variant="secondary">{periodo.materias.length} materias</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-slate-50 text-left text-muted-foreground">
                          <th className="px-4 py-3 font-semibold">Clave</th>
                          <th className="px-4 py-3 font-semibold">Materia</th>
                          <th className="px-4 py-3 font-semibold">Créditos</th>
                          <th className="px-4 py-3 font-semibold">H. docente</th>
                          <th className="px-4 py-3 font-semibold">H. independientes</th>
                          <th className="px-4 py-3 font-semibold">Seriación</th>
                        </tr>
                      </thead>
                      <tbody>
                        {periodo.materias.map((m) => (
                          <tr key={m.clave} className="border-b border-border/50 hover:bg-slate-50/50">
                            <td className="px-4 py-3 font-mono text-xs font-medium text-brand-primary">{m.clave}</td>
                            <td className="px-4 py-3 font-medium">{m.nombre}</td>
                            <td className="px-4 py-3">{m.creditos}</td>
                            <td className="px-4 py-3">{m.horasDocente}</td>
                            <td className="px-4 py-3">{m.horasIndependientes}</td>
                            <td className="px-4 py-3 text-muted-foreground">{m.seriacion ?? '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-12 rounded-2xl bg-brand-primary p-8 text-center text-white">
            <h2 className="text-2xl font-black">¿Listo para inscribirte?</h2>
            <p className="mt-2 text-white/80">Completa tu solicitud de admisión en línea.</p>
            <Link
              href="/inscripcion?programa=psicologia"
              className="mt-6 inline-flex rounded-xl bg-white px-8 py-3 font-black text-brand-primary transition hover:bg-white/90"
            >
              Solicitar inscripción
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
