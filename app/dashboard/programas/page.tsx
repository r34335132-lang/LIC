'use client'

import { programas, usuarios, cursos } from '@/lib/data'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getProgramaIcono } from '@/lib/icons'
import { BookMarked, Users, BookOpen, Plus } from 'lucide-react'

export default function ProgramasPage() {
  const getEstadisticas = (programaId: string) => {
    const alumnos = usuarios.filter(u => u.programaId === programaId).length
    const cursosPrograma = cursos.filter(c => c.programaId === programaId).length
    return { alumnos, cursos: cursosPrograma }
  }

  const tipoLabel = (tipo: string) => {
    switch (tipo) {
      case 'preparatoria':
        return 'Preparatoria'
      case 'licenciatura':
        return 'Licenciatura'
      case 'maestria':
        return 'Maestría'
      case 'curso':
        return 'Curso'
      default:
        return tipo
    }
  }

  const tipoColor = (tipo: string) => {
    switch (tipo) {
      case 'preparatoria':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400'
      case 'licenciatura':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400'
      case 'maestria':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-400'
      case 'curso':
        return 'bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-400'
      default:
        return ''
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">Programas Académicos</h1>
          <p className="text-muted-foreground">
            Gestiona la oferta educativa de la institución
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo programa
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <BookMarked className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{programas.length}</p>
              <p className="text-sm text-muted-foreground">Total programas</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-950/50">
              <BookMarked className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {programas.filter(p => p.tipo === 'licenciatura').length}
              </p>
              <p className="text-sm text-muted-foreground">Licenciaturas</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-950/50">
              <BookMarked className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {programas.filter(p => p.tipo === 'maestria').length}
              </p>
              <p className="text-sm text-muted-foreground">Maestrías</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 dark:bg-green-950/50">
              <BookMarked className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {programas.filter(p => p.tipo === 'curso').length}
              </p>
              <p className="text-sm text-muted-foreground">Cursos</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de programas */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {programas.map((programa) => {
          const Icon = getProgramaIcono(programa.id)
          const stats = getEstadisticas(programa.id)

          return (
            <Card key={programa.id} className="overflow-hidden transition-all hover:shadow-lg">
              <div className="h-2 bg-gradient-to-r from-primary to-accent" />
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <Badge className={tipoColor(programa.tipo)}>
                    {tipoLabel(programa.tipo)}
                  </Badge>
                </div>
                <CardTitle className="mt-3">{programa.nombre}</CardTitle>
                <CardDescription className="line-clamp-2">{programa.descripcion}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Duración</span>
                  <Badge variant="outline">{programa.duracion}</Badge>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg bg-muted/50 p-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-lg font-bold text-foreground">{stats.alumnos}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Alumnos</p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                      <span className="text-lg font-bold text-foreground">{stats.cursos}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Cursos</p>
                  </div>
                </div>

                <Button variant="outline" className="w-full">
                  Ver detalles
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
