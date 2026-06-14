import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { getPerfilFromSession } from '@/lib/auth-server'
import { createAdminClient } from '@/lib/supabase/admin'
import { cuatrimestreLabel } from '@/lib/academico-utils'
import {
  getProgramaIdCandidates,
  labelTipoPrograma,
  normalizeProgramaId,
  withProgramaDuracion,
} from '@/lib/programa-utils'
import type { Materia, Programa } from '@/types/database'

type PageProps = {
  params: Promise<{ programaId: string }>
}

export default async function AdminPlanProgramaPage({ params }: PageProps) {
  const session = await getPerfilFromSession()
  if (!session) {
    redirect('/login')
  }
  if (session.perfil.rol !== 'admin') {
    redirect('/dashboard')
  }

  const { programaId: rawId } = await params
  const rawProgramaId = decodeURIComponent(rawId)
  const programaId = normalizeProgramaId(rawProgramaId)
  const programaCandidates = getProgramaIdCandidates(rawProgramaId)

  const admin = createAdminClient()

  let { data: programa, error: progError } = await admin
    .from('programas')
    .select('*')
    .eq('id', rawProgramaId)
    .maybeSingle()

  if (!programa && rawProgramaId !== programaId) {
    const normalizedProgram = await admin
      .from('programas')
      .select('*')
      .in('id', programaCandidates)
      .limit(1)
      .maybeSingle()

    programa = normalizedProgram.data
    progError = normalizedProgram.error
  }

  if (progError || !programa) {
    notFound()
  }

  const { data: materiasData, error: matError } = await admin
    .from('materias')
    .select('*')
    .in('programa_id', programaCandidates)
    .order('periodo', { ascending: true })
    .order('clave', { ascending: true })

  if (matError) {
    throw new Error(matError.message)
  }

  const materias = (materiasData ?? []) as Materia[]
  const p = withProgramaDuracion(programa as Programa)

  const porPeriodo = materias.reduce<Record<number, Materia[]>>((acc, m) => {
    if (!acc[m.periodo]) acc[m.periodo] = []
    acc[m.periodo].push(m)
    return acc
  }, {})

  const totalCreditos = materias.reduce((acc, m) => acc + m.creditos, 0)

  return (
    <div>
      <Link
        href="/admin/planes"
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-brand-primary mb-6"
      >
        <ArrowLeft className="h-4 w-4" /> Volver a planes
      </Link>

      <div>
        <h1 className="text-3xl font-black text-slate-950">{p.nombre}</h1>
        <p className="mt-2 text-muted-foreground">
          {labelTipoPrograma(p.tipo)} · {p.modalidad}
        </p>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Badge variant="outline">{p.duracion}</Badge>
        <Badge variant="outline">{materias.length} materias</Badge>
        <Badge variant="outline">{totalCreditos} créditos</Badge>
        {p.rvoe && <Badge variant="outline">RVOE {p.rvoe}</Badge>}
        <Badge className={p.activo ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}>
          {p.activo ? 'Activo' : 'Inactivo'}
        </Badge>
      </div>

      {p.descripcion && (
        <p className="mt-4 text-sm text-muted-foreground max-w-3xl">{p.descripcion}</p>
      )}

      {materias.length === 0 ? (
        <Card className="mt-8">
          <CardContent className="py-10 text-center text-muted-foreground">
            Este programa aún no tiene materias en Supabase. Regístralas en la tabla{' '}
            <code className="text-xs">materias</code> con{' '}
            <code className="text-xs">programa_id = &quot;{programaId}&quot;</code>
            {programaId === 'psicologia' && (
              <>
                {' '}
                o usa{' '}
                <Link href="/admin/planes/psicologia" className="text-brand-primary underline">
                  la carga seed de Psicología
                </Link>
                .
              </>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="mt-8 space-y-6">
          {Object.entries(porPeriodo)
            .sort(([a], [b]) => Number(a) - Number(b))
            .map(([periodo, items]) => (
              <Card key={periodo}>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {items[0]?.nombre_periodo ?? cuatrimestreLabel(Number(periodo))}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Clave</TableHead>
                          <TableHead>Materia</TableHead>
                          <TableHead>Créditos</TableHead>
                          <TableHead>H. docente</TableHead>
                          <TableHead>H. independientes</TableHead>
                          <TableHead>Seriación</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {items.map((m) => (
                          <TableRow key={m.id}>
                            <TableCell className="font-mono text-xs">{m.clave}</TableCell>
                            <TableCell className="font-medium">{m.nombre}</TableCell>
                            <TableCell>{m.creditos}</TableCell>
                            <TableCell>{m.horas_docente}</TableCell>
                            <TableCell>{m.horas_independientes}</TableCell>
                            <TableCell className="text-muted-foreground">
                              {m.seriacion ?? '—'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      )}
    </div>
  )
}
