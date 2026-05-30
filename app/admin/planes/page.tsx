'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import type { Programa } from '@/types/database'
import { labelTipoPrograma } from '@/lib/programa-utils'

export default function AdminPlanesPage() {
  const [programas, setProgramas] = useState<Programa[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/programas', { credentials: 'include' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Error al cargar')
      const all = (data.programas ?? []) as Programa[]
      setProgramas(all.filter((p) => p.activo))
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al cargar planes')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return (
    <div>
      <h1 className="text-3xl font-black text-slate-950">Planes de estudio</h1>
      <p className="mt-2 text-muted-foreground">
        Administra materias y planes por carrera activa en Supabase.
      </p>

      {loading ? (
        <div className="mt-10 flex justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-primary border-t-transparent" />
        </div>
      ) : programas.length === 0 ? (
        <Card className="mt-8">
          <CardContent className="py-10 text-center text-muted-foreground">
            No hay carreras activas.{' '}
            <Link href="/admin/programas" className="text-brand-primary underline">
              Crea una carrera
            </Link>{' '}
            para gestionar su plan de estudios.
          </CardContent>
        </Card>
      ) : (
        <div className="mt-8 grid gap-4">
          {programas.map((plan) => (
            <Link key={plan.id} href={`/admin/planes/${encodeURIComponent(plan.id)}`}>
              <Card className="transition-shadow hover:shadow-md">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>{plan.nombre}</CardTitle>
                  <div className="flex gap-2">
                    <Badge variant="secondary">{labelTipoPrograma(plan.tipo)}</Badge>
                    <Badge variant="outline">{plan.duracion}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    ID: {plan.id}
                    {plan.rvoe ? ` · RVOE ${plan.rvoe}` : ''}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
