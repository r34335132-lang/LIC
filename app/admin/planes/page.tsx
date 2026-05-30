import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const planes = [
  {
    id: 'psicologia',
    nombre: 'Licenciatura en Psicología',
    semestres: 9,
    href: '/admin/planes/psicologia',
  },
]

export default function AdminPlanesPage() {
  return (
    <div>
      <h1 className="text-3xl font-black text-slate-950">Planes de estudio</h1>
      <p className="mt-2 text-muted-foreground">Administra los planes académicos y carga materias a Supabase.</p>

      <div className="mt-8 grid gap-4">
        {planes.map((plan) => (
          <Link key={plan.id} href={plan.href}>
            <Card className="transition-shadow hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{plan.nombre}</CardTitle>
                <Badge variant="secondary">{plan.semestres} semestres</Badge>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">ID: {plan.id}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
