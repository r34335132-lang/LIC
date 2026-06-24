'use client'

import { useCallback, useEffect, useState } from 'react'
import { Plus, Trash2, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import type { ProgramaDocumentoRequerido } from '@/types/database'

export function ProgramaDocumentosDialog({
  programaId,
  programaNombre,
  open,
  onOpenChange,
}: {
  programaId: string
  programaNombre: string
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [documentos, setDocumentos] = useState<ProgramaDocumentoRequerido[]>([])
  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [obligatorio, setObligatorio] = useState(true)
  const [loading, setLoading] = useState(false)

  const load = useCallback(async () => {
    if (!programaId) return
    const res = await fetch(`/api/admin/programas/${programaId}/documentos`, {
      credentials: 'include',
    })
    const data = await res.json()
    if (res.ok) setDocumentos(data.documentos ?? [])
  }, [programaId])

  useEffect(() => {
    if (open) load()
  }, [open, load])

  const agregar = async () => {
    if (!nombre.trim()) {
      toast.error('Nombre requerido')
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/programas/${programaId}/documentos`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, descripcion, obligatorio }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success('Documento agregado')
      setNombre('')
      setDescripcion('')
      await load()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error')
    } finally {
      setLoading(false)
    }
  }

  const eliminar = async (docId: string) => {
    const res = await fetch(
      `/api/admin/programas/${programaId}/documentos?docId=${docId}`,
      { method: 'DELETE', credentials: 'include' }
    )
    if (!res.ok) {
      toast.error('No se pudo eliminar')
      return
    }
    toast.success('Eliminado')
    await load()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Documentos — {programaNombre}
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Define qué debe subir el aspirante según este programa (acta, CURP, comprobante, etc.).
        </p>

        <ul className="space-y-2">
          {documentos.map((d) => (
            <li key={d.id} className="flex items-center justify-between rounded-lg border p-2 text-sm">
              <div>
                <p className="font-medium">{d.nombre}</p>
                {d.descripcion && <p className="text-xs text-muted-foreground">{d.descripcion}</p>}
              </div>
              <Button size="sm" variant="ghost" className="text-red-600" onClick={() => eliminar(d.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>

        <div className="space-y-3 rounded-lg border p-3">
          <div>
            <Label>Nombre del documento</Label>
            <Input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Acta de nacimiento" />
          </div>
          <div>
            <Label>Descripción (opcional)</Label>
            <Textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} rows={2} />
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={obligatorio} onCheckedChange={setObligatorio} />
            <Label>Obligatorio</Label>
          </div>
          <Button size="sm" className="w-full bg-brand-primary" onClick={agregar} disabled={loading}>
            <Plus className="mr-1 h-4 w-4" /> Agregar documento
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
