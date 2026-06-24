'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Clock, ExternalLink, FileQuestion, CheckCircle2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Examen, ExamenIntento, Materia } from '@/types/database'

type ExamenConMateria = Examen & {
  materia?: Pick<Materia, 'id' | 'nombre' | 'clave'>
  intento?: ExamenIntento | null
}

export default function DashboardExamenesPage() {
  const [examenes, setExamenes] = useState<ExamenConMateria[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/dashboard/examenes', { credentials: 'include' })
      .then((r) => r.json())
      .then((data) => setExamenes(data.examenes ?? []))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-3xl font-black">Exámenes</h1>
      <p className="mt-2 text-muted-foreground">Exámenes en línea de tus materias inscritas.</p>

      <div className="mt-8 space-y-3">
        {examenes.length === 0 && (
          <p className="text-muted-foreground">No hay exámenes disponibles.</p>
        )}
        {examenes.map((ex) => {
          const completado =
            ex.intento?.estado === 'finalizado' || ex.intento?.estado === 'revisado'
          return (
            <Card key={ex.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-lg">{ex.titulo}</CardTitle>
                    <p className="text-sm text-muted-foreground">{ex.materia?.nombre}</p>
                  </div>
                  {completado ? (
                    <Badge className="bg-green-100 text-green-900">
                      <CheckCircle2 className="mr-1 h-3 w-3" />
                      {ex.intento?.calificacion ?? '—'}
                    </Badge>
                  ) : ex.intento?.estado === 'en_progreso' ? (
                    <Badge variant="secondary">En progreso</Badge>
                  ) : (
                    <Badge variant="outline">Pendiente</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex flex-wrap items-center gap-3">
                <Badge variant="outline"><Clock className="mr-1 h-3 w-3" />{ex.tiempo_limite_minutos} min</Badge>
                {ex.link_llamada && (
                  <a href={ex.link_llamada} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-brand-primary hover:underline">
                    <ExternalLink className="h-3 w-3" /> Videollamada
                  </a>
                )}
                <Button size="sm" className="ml-auto bg-brand-primary" asChild>
                  <Link href={`/dashboard/examenes/${ex.id}`}>
                    <FileQuestion className="mr-1 h-4 w-4" />
                    {completado ? 'Ver resultado' : ex.intento ? 'Continuar' : 'Iniciar'}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
