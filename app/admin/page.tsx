import Link from 'next/link'
import { BookOpen, ClipboardList, Users, UserCheck } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const links = [
  { href: '/admin/planes', label: 'Planes de estudio', icon: BookOpen, desc: 'Gestionar planes y cargar materias' },
  { href: '/admin/inscripciones', label: 'Inscripciones', icon: ClipboardList, desc: 'Revisar y aprobar solicitudes' },
  { href: '/admin/alumnos', label: 'Alumnos', icon: Users, desc: 'Directorio de estudiantes' },
  { href: '/admin/profesores', label: 'Profesores', icon: UserCheck, desc: 'Plantilla docente y asignaciones' },
]

export default function AdminPage() {
  return (
    <div>
      <h1 className="text-3xl font-black text-slate-950">Panel de administración</h1>
      <p className="mt-2 text-muted-foreground">Gestiona el sistema académico del Instituto Universitario de Durango.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {links.map((item) => (
          <Link key={item.href} href={item.href}>
            <Card className="h-full transition-shadow hover:shadow-md">
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
                  <item.icon className="h-6 w-6" />
                </div>
                <CardTitle className="text-lg">{item.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
