import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, GraduationCap, BookOpen, Clock, Award } from 'lucide-react'
import { Header } from '@/components/landing/header'
import { Footer } from '@/components/landing/footer'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getProgramaIdCandidates } from '@/lib/programa-utils'
import { createAdminClient } from '@/lib/supabase/admin'
import type { Materia } from '@/types/database'

export const metadata: Metadata = {
  title: 'Plan de estudios - Licenciatura en Psicologia',
  description: 'Consulta el plan de estudios de la Licenciatura en Psicologia del Instituto Universitario de Durango.',
}

async function getMateriasPsicologia() {
  try {
    const programaCandidates = getProgramaIdCandidates('psicologia')
    const admin = createAdminClient()
    const { data, error } = await admin
      .from('materias')
      .select('id, programa_id, periodo, nombre_periodo, nombre, clave, seriacion, horas_docente, horas_independientes, creditos, instalacion, created_at')
      .in('programa_id', programaCandidates)
      .order('periodo', { ascending: true })
      .order('clave', { ascending: true })

    if (error) {
      console.error('Error cargando materias de Psicologia:', error)
      return []
    }

    return (data ?? []) as Materia[]
  } catch (error) {
    console.error('Error cargando materias de Psicologia:', error)
    return []
  }
}

export default async function PlanEstudiosPsicologiaPage() {
  const materias = await getMateriasPsicologia()
  const totalCreditos = materias.reduce((acc, materia) => acc + materia.creditos, 0)
  const periodos = materias.reduce<Record<number, Materia[]>>((acc, materia) => {
    acc[materia.periodo] = [...(acc[materia.periodo] ?? []), materia]
    return acc
  }, {})

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
              Licenciatura en Psicologia
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">Modalidad virtual</p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <Card>
              <CardContent className="flex items-center gap-4 p-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-primary text-white">
                  <Clock className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-2xl font-black">{Object.keys(periodos).length}</p>
                  <p className="text-sm text-muted-foreground">Periodos</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-4 p-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-primary text-white">
                  <BookOpen className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-2xl font-black">{materias.length}</p>
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
                  <p className="text-sm text-muted-foreground">Creditos totales</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-12 space-y-8">
            {materias.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-muted-foreground">
                  No hay materias cargadas en Supabase para <code>programa_id = "psicologia"</code>.
                </CardContent>
              </Card>
            ) : (
              Object.entries(periodos)
                .sort(([a], [b]) => Number(a) - Number(b))
                .map(([periodo, periodoMaterias]) => (
                  <Card key={periodo} className="overflow-hidden">
                    <CardHeader className="bg-brand-primary/5 border-b">
                      <CardTitle className="flex items-center gap-3">
                        {periodoMaterias[0]?.nombre_periodo ?? `${periodo} cuatrimestre`}
                        <Badge variant="secondary">{periodoMaterias.length} materias</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b bg-slate-50 text-left text-muted-foreground">
                              <th className="px-4 py-3 font-semibold">Clave</th>
                              <th className="px-4 py-3 font-semibold">Materia</th>
                              <th className="px-4 py-3 font-semibold">Creditos</th>
                              <th className="px-4 py-3 font-semibold">H. docente</th>
                              <th className="px-4 py-3 font-semibold">H. independientes</th>
                              <th className="px-4 py-3 font-semibold">Seriacion</th>
                              <th className="px-4 py-3 font-semibold">Instalacion</th>
                            </tr>
                          </thead>
                          <tbody>
                            {periodoMaterias.map((materia) => (
                              <tr key={materia.id} className="border-b border-border/50 hover:bg-slate-50/50">
                                <td className="px-4 py-3 font-mono text-xs font-medium text-brand-primary">{materia.clave}</td>
                                <td className="px-4 py-3 font-medium">{materia.nombre}</td>
                                <td className="px-4 py-3">{materia.creditos}</td>
                                <td className="px-4 py-3">{materia.horas_docente}</td>
                                <td className="px-4 py-3">{materia.horas_independientes}</td>
                                <td className="px-4 py-3 text-muted-foreground">{materia.seriacion ?? '-'}</td>
                                <td className="px-4 py-3 text-muted-foreground">{materia.instalacion ?? '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                ))
            )}
          </div>

          <div className="mt-12 rounded-2xl bg-brand-primary p-8 text-center text-white">
            <h2 className="text-2xl font-black">Listo para inscribirte?</h2>
            <p className="mt-2 text-white/80">Completa tu solicitud de admision en linea.</p>
            <Link
              href="/inscripcion?programa=psicologia"
              className="mt-6 inline-flex rounded-xl bg-white px-8 py-3 font-black text-brand-primary transition hover:bg-white/90"
            >
              Solicitar inscripcion
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
