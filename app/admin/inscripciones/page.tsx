'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle2 } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import type { Inscripcion } from '@/types/database'

export default function AdminInscripcionesPage() {
  const [inscripciones, setInscripciones] = useState<Inscripcion[]>([])
  const [loading, setLoading] = useState<string | null>(null)
  const [credentials, setCredentials] = useState<{ matricula: string; tempPassword: string; email: string } | null>(null)

  const supabase = createClient()

  const load = async () => {
    const { data } = await supabase
      .from('inscripciones')
      .select('*')
      .order('created_at', { ascending: false })
    setInscripciones((data ?? []) as Inscripcion[])
  }

  useEffect(() => { load() }, [])

  const aprobar = async (id: string) => {
    setLoading(id)
    setCredentials(null)
    try {
      const res = await fetch(`/api/admin/inscripciones/${id}/aprobar`, { method: 'POST' })
      const data = await res.json()
      if (res.ok) {
        setCredentials({
          email: inscripciones.find((i) => i.id === id)?.email ?? '',
          matricula: data.matricula,
          tempPassword: data.tempPassword,
        })
        load()
      }
    } finally {
      setLoading(null)
    }
  }

  const estadoColor = (estado: string) => {
    switch (estado) {
      case 'aprobada': return 'bg-green-100 text-green-800'
      case 'rechazada': return 'bg-red-100 text-red-800'
      default: return 'bg-yellow-100 text-yellow-800'
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-black text-slate-950">Inscripciones</h1>
      <p className="mt-2 text-muted-foreground">Revisa y aprueba solicitudes de admisión.</p>

      {credentials && (
        <Alert className="mt-6 border-green-200 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <strong>Inscripción aprobada.</strong> Email: {credentials.email} | Matrícula: {credentials.matricula} | Contraseña temporal: {credentials.tempPassword}
          </AlertDescription>
        </Alert>
      )}

      <div className="mt-8 space-y-3">
        {!inscripciones.length && (
          <p className="text-muted-foreground">No hay solicitudes.</p>
        )}
        {inscripciones.map((ins) => (
          <Card key={ins.id}>
            <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-bold">{ins.nombre_completo}</p>
                <p className="text-sm text-muted-foreground">{ins.email}</p>
                {ins.telefono && <p className="text-sm text-muted-foreground">{ins.telefono}</p>}
                <div className="mt-2 flex gap-2">
                  <Badge variant="outline">{ins.programa_id}</Badge>
                  <Badge className={estadoColor(ins.estado)}>{ins.estado}</Badge>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(ins.created_at), "d MMM yyyy HH:mm", { locale: es })}
                  </span>
                </div>
              </div>
              {ins.estado === 'pendiente' && (
                <Button
                  onClick={() => aprobar(ins.id)}
                  disabled={loading === ins.id}
                  className="bg-brand-primary font-bold shrink-0"
                >
                  {loading === ins.id ? 'Procesando...' : 'Aprobar inscripción'}
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
