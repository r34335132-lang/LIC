'use client'

import { useAuth } from '@/lib/auth-context'
import { clasesVirtuales, cursos, getProfesorByCurso } from '@/lib/data'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Video, Calendar, Clock, ExternalLink, Plus, Users } from 'lucide-react'

export default function ClasesPage() {
  const { user } = useAuth()

  const hoy = new Date().toISOString().split('T')[0]

  const clasesProximas = clasesVirtuales.filter(c => c.fecha >= hoy)
  const clasesPasadas = clasesVirtuales.filter(c => c.fecha < hoy)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">Clases Virtuales</h1>
          <p className="text-muted-foreground">
            {user?.rol === 'alumno' 
              ? 'Accede a tus clases en línea'
              : 'Gestiona las sesiones de clase'}
          </p>
        </div>
        {(user?.rol === 'maestro' || user?.rol === 'admin') && (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Programar clase
          </Button>
        )}
      </div>

      {/* Próximas clases */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-foreground">Próximas clases</h2>
        {clasesProximas.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {clasesProximas.map((clase) => {
              const curso = cursos.find(c => c.id === clase.cursoId)
              const profesor = getProfesorByCurso(clase.cursoId)
              const esHoy = clase.fecha === hoy

              return (
                <Card key={clase.id} className={`overflow-hidden transition-all hover:shadow-lg ${esHoy ? 'ring-2 ring-primary' : ''}`}>
                  {esHoy && (
                    <div className="bg-primary px-4 py-1.5 text-center text-sm font-medium text-primary-foreground">
                      Clase de hoy
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                        <Video className="h-6 w-6 text-primary" />
                      </div>
                      <Badge variant={esHoy ? 'default' : 'outline'}>
                        {esHoy ? 'Hoy' : new Date(clase.fecha).toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short' })}
                      </Badge>
                    </div>
                    <CardTitle className="mt-3 text-lg">{clase.titulo}</CardTitle>
                    <CardDescription>{curso?.nombre}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {clase.descripcion && (
                      <p className="text-sm text-muted-foreground">{clase.descripcion}</p>
                    )}

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {new Date(clase.fecha).toLocaleDateString('es-MX', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{clase.horaInicio} - {clase.horaFin}</span>
                      </div>
                      {profesor && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Users className="h-4 w-4" />
                          <span>{profesor.nombre}</span>
                        </div>
                      )}
                    </div>

                    <Button asChild className="w-full">
                      <a href={clase.linkExterno} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        {user?.rol === 'maestro' ? 'Iniciar clase' : 'Entrar a clase'}
                      </a>
                    </Button>

                    {user?.rol === 'maestro' && (
                      <Button variant="outline" className="w-full">
                        Registrar asistencia
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-12 text-center">
              <Video className="mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="text-lg font-medium text-foreground">No hay clases programadas</h3>
              <p className="text-muted-foreground">Las próximas clases aparecerán aquí</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Clases pasadas */}
      {clasesPasadas.length > 0 && (
        <div>
          <h2 className="mb-4 text-lg font-semibold text-foreground">Clases anteriores</h2>
          <div className="space-y-3">
            {clasesPasadas.slice(0, 5).map((clase) => {
              const curso = cursos.find(c => c.id === clase.cursoId)

              return (
                <Card key={clase.id} className="transition-colors hover:bg-muted/50">
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                        <Video className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <h3 className="font-medium text-foreground">{clase.titulo}</h3>
                        <p className="text-sm text-muted-foreground">{curso?.nombre}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        {new Date(clase.fecha).toLocaleDateString('es-MX')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {clase.horaInicio} - {clase.horaFin}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
