'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Database, CheckCircle2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { planPsicologiaMeta } from '@/lib/planes/psicologia'

export default function AdminPsicologiaPlanPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ inserted: number; skipped: number } | null>(null)
  const [error, setError] = useState('')

  const totalMaterias = planPsicologiaMeta.periodos.reduce((acc, p) => acc + p.materias.length, 0)
  const totalCreditos = planPsicologiaMeta.periodos.reduce(
    (acc, p) => acc + p.materias.reduce((s, m) => s + m.creditos, 0),
    0
  )

  const handleSeed = async () => {
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const res = await fetch('/api/admin/seed/psicologia', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Error al cargar materias')
        return
      }
      setResult({ inserted: data.inserted, skipped: data.skipped })
    } catch {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Link href="/admin/planes" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-brand-primary mb-6">
        <ArrowLeft className="h-4 w-4" /> Volver a planes
      </Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-950">{planPsicologiaMeta.nombre}</h1>
          <p className="mt-2 text-muted-foreground">{planPsicologiaMeta.modalidad}</p>
        </div>
        <Button onClick={handleSeed} disabled={loading} className="bg-brand-primary font-bold">
          <Database className="mr-2 h-4 w-4" />
          {loading ? 'Cargando...' : 'Cargar materias a Supabase'}
        </Button>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Badge variant="outline">{planPsicologiaMeta.duracionSemestres} semestres</Badge>
        <Badge variant="outline">{totalMaterias} materias</Badge>
        <Badge variant="outline">{totalCreditos} créditos totales</Badge>
      </div>

      {result && (
        <Alert className="mt-6 border-green-200 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Materias insertadas: {result.inserted}. Omitidas (duplicadas): {result.skipped}.
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive" className="mt-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="mt-8 space-y-6">
        {planPsicologiaMeta.periodos.map((periodo) => (
          <Card key={periodo.periodo}>
            <CardHeader>
              <CardTitle className="text-lg">{periodo.nombre}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="pb-2 pr-4 font-medium">Clave</th>
                      <th className="pb-2 pr-4 font-medium">Materia</th>
                      <th className="pb-2 pr-4 font-medium">Créditos</th>
                      <th className="pb-2 font-medium">Seriación</th>
                    </tr>
                  </thead>
                  <tbody>
                    {periodo.materias.map((m) => (
                      <tr key={m.clave} className="border-b border-border/50">
                        <td className="py-2 pr-4 font-mono text-xs">{m.clave}</td>
                        <td className="py-2 pr-4">{m.nombre}</td>
                        <td className="py-2 pr-4">{m.creditos}</td>
                        <td className="py-2 text-muted-foreground">{m.seriacion ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
