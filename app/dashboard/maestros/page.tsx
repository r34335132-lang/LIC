'use client'

import { usuarios, cursos } from '@/lib/data'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { GraduationCap, Search, Plus, MoreHorizontal, Eye, Edit, BookOpen } from 'lucide-react'
import { useState } from 'react'

export default function MaestrosPage() {
  const [busqueda, setBusqueda] = useState('')

  const maestros = usuarios.filter(u => u.rol === 'maestro')
  const maestrosFiltrados = maestros.filter(m =>
    m.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    m.email.toLowerCase().includes(busqueda.toLowerCase())
  )

  const getCursosProfesor = (profesorId: string) => {
    return cursos.filter(c => c.profesorId === profesorId)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">Gestión de Maestros</h1>
          <p className="text-muted-foreground">
            Administra el personal docente de la institución
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo maestro
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
              <GraduationCap className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{maestros.length}</p>
              <p className="text-sm text-muted-foreground">Total maestros</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 dark:bg-green-950/50">
              <GraduationCap className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {maestros.filter(m => m.estado === 'activo').length}
              </p>
              <p className="text-sm text-muted-foreground">Activos</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{cursos.length}</p>
              <p className="text-sm text-muted-foreground">Cursos asignados</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Buscador */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre o email..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Tabla */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de maestros</CardTitle>
          <CardDescription>
            {maestrosFiltrados.length} maestro{maestrosFiltrados.length !== 1 && 's'} encontrado{maestrosFiltrados.length !== 1 && 's'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Correo</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Cursos asignados</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha ingreso</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {maestrosFiltrados.map((maestro) => {
                const cursosDelMaestro = getCursosProfesor(maestro.id)

                return (
                  <TableRow key={maestro.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/10 text-xs font-medium text-accent">
                          {maestro.nombre.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <span className="font-medium">{maestro.nombre}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{maestro.email}</TableCell>
                    <TableCell className="text-muted-foreground">{maestro.telefono || '-'}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {cursosDelMaestro.length > 0 ? (
                          cursosDelMaestro.slice(0, 2).map((curso) => (
                            <Badge key={curso.id} variant="outline" className="text-xs">
                              {curso.nombre.length > 15 ? curso.nombre.slice(0, 15) + '...' : curso.nombre}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-sm text-muted-foreground">Sin cursos</span>
                        )}
                        {cursosDelMaestro.length > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{cursosDelMaestro.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={maestro.estado === 'activo' ? 'default' : 'secondary'}>
                        {maestro.estado === 'activo' ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(maestro.fechaIngreso).toLocaleDateString('es-MX')}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            Ver perfil
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <BookOpen className="mr-2 h-4 w-4" />
                            Asignar cursos
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
