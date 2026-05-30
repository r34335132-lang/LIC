'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle2, AlertCircle } from 'lucide-react'

const programas = [
  { id: 'psicologia', nombre: 'Licenciatura en Psicología' },
]

export function InscripcionForm() {
  const searchParams = useSearchParams()
  const defaultPrograma = searchParams.get('programa') ?? 'psicologia'
  const [nombreCompleto, setNombreCompleto] = useState('')
  const [email, setEmail] = useState('')
  const [telefono, setTelefono] = useState('')
  const [programaId, setProgramaId] = useState(defaultPrograma)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      const res = await fetch('/api/inscripciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombreCompleto, email, telefono, programaId }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Error al enviar solicitud')
        return
      }

      setSuccess(true)
      setNombreCompleto('')
      setEmail('')
      setTelefono('')
    } catch {
      setError('Error de conexión. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800 font-medium">
            Solicitud enviada correctamente. Te contactaremos pronto para continuar tu proceso de admisión.
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="nombre">Nombre completo</Label>
        <Input
          id="nombre"
          value={nombreCompleto}
          onChange={(e) => setNombreCompleto(e.target.value)}
          placeholder="Nombre y apellidos"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Correo electrónico</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="correo@ejemplo.com"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="telefono">Teléfono</Label>
        <Input
          id="telefono"
          type="tel"
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
          placeholder="618 000 0000"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="programa">Programa</Label>
        <Select value={programaId} onValueChange={setProgramaId}>
          <SelectTrigger id="programa">
            <SelectValue placeholder="Selecciona un programa" />
          </SelectTrigger>
          <SelectContent>
            {programas.map((p) => (
              <SelectItem key={p.id} value={p.id}>{p.nombre}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" className="w-full bg-brand-primary font-bold" disabled={loading}>
        {loading ? 'Enviando...' : 'Enviar solicitud'}
      </Button>
    </form>
  )
}
