'use client'

import { useAuth } from '@/lib/auth-context'
import { cursos, getProfesorByCurso, programas, getCursosByProfesor } from '@/lib/data'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { BookOpen, Search, Calendar, User, Plus } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

export default function CursosPage() {
  const { user } = useAuth()
  const [busqueda, setBusqueda] = useState('')

  const getMisCursos = () => {
    if (user?.rol === 'maestro') {
      return getCursosByProfesor(user.id)
    }
    return cursos
  }

  const misCursos = getMisCursos()
  const cursosFiltrados = misCursos.filter(c =>
    c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.descripcion.toLowerCase().includes(busqueda.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">
            {user?.rol === 'alumno' ? 'Mis Cursos' : 'Cursos'}
          </h1>
          <p className="text-muted-foreground">
            {user?.rol === 'admin' 
              ? 'Gestiona todos los cursos de la plataforma'
              : user?.rol === 'maestro'
              ? 'Cursos que impartes actualmente'
              : 'Cursos en los que estás inscrito'}
          </p>
        </div>
        {user?.rol === 'admin' && (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo curso
          </Button>
        )}
      </div>

      {/* Buscador */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar cursos..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Lista de cursos */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {cursosFiltrados.map((curso) => {
          const profesor = getProfesorByCurso(curso.id)
          const programa = programas.find(p => p.id === curso.programaId)

          return (
            <Card key={curso.id} className="overflow-hidden transition-all hover:shadow-lg">
              <div className="h-2 bg-gradient-to-r from-primary to-accent" />
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <BookOpen className="h-6 w-6 text-primary" />
                  </div>
                  <Badge variant={curso.estado === 'activo' ? 'default' : 'secondary'}>
                    {curso.estado === 'activo' ? 'Activo' : 'Inactivo'}
                  </Badge>
                </div>
                <CardTitle className="mt-3 text-lg">{curso.nombre}</CardTitle>
                <CardDescription className="line-clamp-2">{curso.descripcion}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {programa && (
                  <Badge variant="outline">{programa.nombre}</Badge>
                )}

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span>{profesor?.nombre || 'Sin profesor asignado'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {new Date(curso.fechaInicio).toLocaleDateString('es-MX')} - {new Date(curso.fechaFin).toLocaleDateString('es-MX')}
                    </span>
                  </div>
                </div>

                {user?.rol === 'alumno' && curso.progreso !== undefined && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Progreso</span>
                      <span>{curso.progreso}%</span>
                    </div>
                    <Progress value={curso.progreso} className="h-2" />
                  </div>
                )}

                <Link href={`/dashboard/cursos/${curso.id}`}>
                  <Button variant="outline" className="w-full">
                    {user?.rol === 'alumno' ? 'Entrar al curso' : 'Ver detalles'}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {cursosFiltrados.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border p-12 text-center">
          <BookOpen className="mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="text-lg font-medium text-foreground">No se encontraron cursos</h3>
          <p className="text-muted-foreground">
            {busqueda ? 'Intenta con otra búsqueda' : 'No hay cursos disponibles'}
          </p>
        </div>
      )}
    </div>
  )
}
