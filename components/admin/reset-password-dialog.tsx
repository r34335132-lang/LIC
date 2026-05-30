'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { CheckCircle2 } from 'lucide-react'

interface ResetPasswordDialogProps {
  userId: string
  userName: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ResetPasswordDialog({
  userId,
  userName,
  open,
  onOpenChange,
}: ResetPasswordDialogProps) {
  const [mode, setMode] = useState<'auto' | 'manual'>('auto')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{
    tempPassword: string
    emailSent: boolean
  } | null>(null)

  const reset = () => {
    setMode('auto')
    setPassword('')
    setResult(null)
    setLoading(false)
  }

  const handleOpenChange = (next: boolean) => {
    if (!next) reset()
    onOpenChange(next)
  }

  const submit = async () => {
    setLoading(true)
    setResult(null)
    try {
      const body = mode === 'manual' && password.trim() ? { password: password.trim() } : {}
      const res = await fetch(`/api/admin/usuarios/${userId}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error ?? 'No se pudo restablecer la contraseña')
        return
      }
      setResult({ tempPassword: data.tempPassword, emailSent: !!data.emailSent })
      toast.success('Contraseña restablecida')
      if (!data.emailSent) {
        toast.warning('No se pudo enviar el correo. Comparte la contraseña manualmente.')
      }
    } catch {
      toast.error('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cambiar contraseña — {userName}</DialogTitle>
        </DialogHeader>

        {result ? (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <strong>Contraseña restablecida.</strong> Solo se muestra una vez.
              <div className="mt-1 font-mono text-sm">{result.tempPassword}</div>
              {result.emailSent
                ? <span className="text-xs">Se envió un correo al usuario.</span>
                : <span className="text-xs text-red-700">El correo no se envió.</span>}
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button
                type="button"
                variant={mode === 'auto' ? 'default' : 'outline'}
                className={mode === 'auto' ? 'bg-brand-primary' : ''}
                onClick={() => setMode('auto')}
              >
                Generar automática
              </Button>
              <Button
                type="button"
                variant={mode === 'manual' ? 'default' : 'outline'}
                className={mode === 'manual' ? 'bg-brand-primary' : ''}
                onClick={() => setMode('manual')}
              >
                Escribir manual
              </Button>
            </div>

            {mode === 'manual' && (
              <div>
                <Label>Nueva contraseña (mín. 8 caracteres)</Label>
                <Input
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                />
              </div>
            )}

            <Button
              onClick={submit}
              disabled={loading || (mode === 'manual' && password.trim().length < 8)}
              className="w-full bg-brand-primary"
            >
              {loading ? 'Procesando...' : 'Restablecer contraseña'}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
