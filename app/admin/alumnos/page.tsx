import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getNombrePerfil } from '@/lib/perfil-utils'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export const dynamic = 'force-dynamic'

export default async function AdminAlumnosPage() {
  const supabase = await createClient()
  const { data: alumnos } = await supabase
    .from('perfiles')
    .select('*')
    .eq('rol', 'alumno')
    .order('created_at', { ascending: false })

  const { data: programas } = await supabase.from('programas').select('id, nombre')
  const programaMap = new Map(programas?.map((p) => [p.id, p.nombre]) ?? [])

  return (
    <div>
      <h1 className="text-3xl font-black text-slate-950">Alumnos</h1>
      <p className="mt-2 text-muted-foreground">Directorio de estudiantes inscritos.</p>

      <div className="mt-8 space-y-3">
        {!alumnos?.length && (
          <p className="text-muted-foreground">No hay alumnos registrados.</p>
        )}
        {alumnos?.map((alumno) => (
          <Link key={alumno.id} href={`/admin/alumnos/${alumno.id}`}>
            <Card className="transition-shadow hover:shadow-md">
              <CardContent className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-bold text-slate-950">{getNombrePerfil(alumno)}</p>
                  <p className="text-sm text-muted-foreground">{alumno.email}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {alumno.matricula && (
                    <Badge variant="outline">{alumno.matricula}</Badge>
                  )}
                  {alumno.programa_id && (
                    <Badge className="bg-brand-primary/10 text-brand-primary">
                      {programaMap.get(alumno.programa_id) ?? alumno.programa_id}
                    </Badge>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(alumno.created_at), "d MMM yyyy", { locale: es })}
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
