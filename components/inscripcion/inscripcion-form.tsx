'use client'

import { useEffect, useState } from 'react'
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
import type { Programa } from '@/types/database'

export function InscripcionForm() {
  const searchParams = useSearchParams()
  const programaQuery = searchParams.get('programa')

  const [programas, setProgramas] = useState<Pick<Programa, 'id' | 'nombre'>[]>([])
  const [programasLoading, setProgramasLoading] = useState(true)
  const [nombreCompleto, setNombreCompleto] = useState('')
  const [email, setEmail] = useState('')
  const [telefono, setTelefono] = useState('')
  const [programaId, setProgramaId] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    async function loadProgramas() {
      try {
        const res = await fetch('/api/programas')
        const data = await res.json()
        if (!res.ok) throw new Error(data.error ?? 'Error al cargar programas')
        const list = (data.programas ?? []) as Programa[]
        if (!active) return
        setProgramas(list.map((p) => ({ id: p.id, nombre: p.nombre })))
        if (list.length > 0) {
          const match = programaQuery && list.some((p) => p.id === programaQuery)
          setProgramaId(match ? programaQuery! : list[0]!.id)
        }
      } catch {
        if (active) setError('No se pudieron cargar los programas. Intenta más tarde.')
      } finally {
        if (active) setProgramasLoading(false)
      }
    }
    loadProgramas()
    return () => {
      active = false
    }
  }, [programaQuery])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!programaId) {
      setError('Selecciona un programa')
      return
    }

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
        {programasLoading ? (
          <p className="text-sm text-muted-foreground">Cargando programas...</p>
        ) : programas.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No hay programas disponibles en este momento.
          </p>
        ) : (
          <Select value={programaId} onValueChange={setProgramaId}>
            <SelectTrigger id="programa">
              <SelectValue placeholder="Selecciona un programa" />
            </SelectTrigger>
            <SelectContent>
              {programas.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <Button
        type="submit"
        className="w-full bg-brand-primary font-bold"
        disabled={loading || programasLoading || programas.length === 0}
      >
        {loading ? 'Enviando...' : 'Enviar solicitud'}
      </Button>
    </form>
  )
}
