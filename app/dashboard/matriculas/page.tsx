'use client'

import { usuarios, programas } from '@/lib/data'
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
import { FileText, Search, Plus, Eye, Edit, CheckCircle, XCircle } from 'lucide-react'
import { useState } from 'react'

// Matrículas de ejemplo
const matriculas = [
  { id: '1', numero: 'IUD-2024-001', alumnoId: 'alumno-1', programaId: 'lic-derecho', estado: 'activa', fechaCreacion: '2024-01-15' },
  { id: '2', numero: 'IUD-2024-002', alumnoId: 'alumno-2', programaId: 'lic-psicologia', estado: 'activa', fechaCreacion: '2024-01-15' },
  { id: '3', numero: 'IUD-2024-003', alumnoId: 'alumno-3', programaId: 'lic-pedagogia', estado: 'activa', fechaCreacion: '2024-02-01' },
  { id: '4', numero: 'IUD-2023-045', alumnoId: 'alumno-4', programaId: 'prep', estado: 'activa', fechaCreacion: '2023-08-15' },
]

export default function MatriculasPage() {
  const [busqueda, setBusqueda] = useState('')

  const matriculasFiltradas = matriculas.filter(m =>
    m.numero.toLowerCase().includes(busqueda.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">Matrículas</h1>
          <p className="text-muted-foreground">
            Gestiona las matrículas de los alumnos
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nueva matrícula
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{matriculas.length}</p>
              <p className="text-sm text-muted-foreground">Total matrículas</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 dark:bg-green-950/50">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {matriculas.filter(m => m.estado === 'activa').length}
              </p>
              <p className="text-sm text-muted-foreground">Activas</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
              <XCircle className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {matriculas.filter(m => m.estado === 'inactiva').length}
              </p>
              <p className="text-sm text-muted-foreground">Inactivas</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Buscador */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por número de matrícula..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Tabla */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de matrículas</CardTitle>
          <CardDescription>
            {matriculasFiltradas.length} matrícula{matriculasFiltradas.length !== 1 && 's'} encontrada{matriculasFiltradas.length !== 1 && 's'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número de matrícula</TableHead>
                <TableHead>Alumno</TableHead>
                <TableHead>Programa</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha creación</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {matriculasFiltradas.map((matricula) => {
                const alumno = usuarios.find(u => u.id === matricula.alumnoId)
                const programa = programas.find(p => p.id === matricula.programaId)

                return (
                  <TableRow key={matricula.id}>
                    <TableCell className="font-mono font-medium">{matricula.numero}</TableCell>
                    <TableCell>{alumno?.nombre || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{programa?.nombre || 'Sin programa'}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={matricula.estado === 'activa' ? 'default' : 'secondary'}>
                        {matricula.estado === 'activa' ? 'Activa' : 'Inactiva'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(matricula.fechaCreacion).toLocaleDateString('es-MX')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
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
