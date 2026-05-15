'use client'

import { useAuth } from '@/lib/auth-context'
import { programas } from '@/lib/data'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { User, Mail, Phone, GraduationCap, Calendar, Edit, Save } from 'lucide-react'
import { useState } from 'react'

export default function PerfilPage() {
  const { user } = useAuth()
  const [editando, setEditando] = useState(false)

  if (!user) return null

  const programa = programas.find(p => p.id === user.programaId)

  const getRolLabel = () => {
    switch (user.rol) {
      case 'admin':
        return 'Administrador'
      case 'maestro':
        return 'Docente'
      default:
        return 'Alumno'
    }
  }

  const getInitials = (nombre: string) => {
    return nombre
      .split(' ')
      .map(n => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground md:text-3xl">Mi Perfil</h1>
        <p className="text-muted-foreground">
          Administra tu información personal
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Tarjeta de perfil */}
        <Card className="lg:col-span-1">
          <CardContent className="flex flex-col items-center p-6 text-center">
            <Avatar className="mb-4 h-24 w-24 border-4 border-primary/20">
              <AvatarFallback className="bg-primary text-2xl text-primary-foreground">
                {getInitials(user.nombre)}
              </AvatarFallback>
            </Avatar>
            <h2 className="text-xl font-bold text-foreground">{user.nombre}</h2>
            <Badge className="mt-2">{getRolLabel()}</Badge>
            {user.matricula && (
              <p className="mt-2 text-sm text-muted-foreground">
                Matrícula: {user.matricula}
              </p>
            )}
            {programa && (
              <Badge variant="outline" className="mt-2">
                {programa.nombre}
              </Badge>
            )}
            <div className="mt-4 w-full space-y-2 text-sm">
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>{user.email}</span>
              </div>
              {user.telefono && (
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>{user.telefono}</span>
                </div>
              )}
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Desde {new Date(user.fechaIngreso).toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Formulario de edición */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Información personal</CardTitle>
              <CardDescription>Actualiza tus datos de contacto</CardDescription>
            </div>
            <Button
              variant={editando ? 'default' : 'outline'}
              size="sm"
              onClick={() => setEditando(!editando)}
            >
              {editando ? (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Guardar
                </>
              ) : (
                <>
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </>
              )}
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre completo</Label>
                <Input
                  id="nombre"
                  defaultValue={user.nombre}
                  disabled={!editando}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  defaultValue={user.email}
                  disabled
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="telefono">Teléfono</Label>
                <Input
                  id="telefono"
                  type="tel"
                  defaultValue={user.telefono || ''}
                  placeholder="618-123-4567"
                  disabled={!editando}
                />
              </div>
              {user.matricula && (
                <div className="space-y-2">
                  <Label htmlFor="matricula">Matrícula</Label>
                  <Input
                    id="matricula"
                    defaultValue={user.matricula}
                    disabled
                  />
                </div>
              )}
            </div>

            {editando && (
              <div className="rounded-lg border border-border bg-muted/50 p-4">
                <h4 className="mb-2 font-medium text-foreground">Cambiar contraseña</h4>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="password">Nueva contraseña</Label>
                    <Input id="password" type="password" placeholder="Nueva contraseña" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm">Confirmar contraseña</Label>
                    <Input id="confirm" type="password" placeholder="Confirmar" />
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Información adicional para alumnos */}
      {user.rol === 'alumno' && programa && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Información académica
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg border border-border p-4">
                <p className="text-sm text-muted-foreground">Programa</p>
                <p className="font-medium text-foreground">{programa.nombre}</p>
              </div>
              <div className="rounded-lg border border-border p-4">
                <p className="text-sm text-muted-foreground">Tipo</p>
                <p className="font-medium capitalize text-foreground">{programa.tipo}</p>
              </div>
              <div className="rounded-lg border border-border p-4">
                <p className="text-sm text-muted-foreground">Duración</p>
                <p className="font-medium text-foreground">{programa.duracion}</p>
              </div>
              <div className="rounded-lg border border-border p-4">
                <p className="text-sm text-muted-foreground">Estado</p>
                <Badge variant="default">Activo</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
