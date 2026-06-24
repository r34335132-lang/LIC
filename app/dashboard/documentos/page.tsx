'use client'

import { useCallback, useEffect, useState } from 'react'
import { Upload, CheckCircle2, FileText } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import type { ProgramaDocumentoRequerido, InscripcionDocumento } from '@/types/database'

type RequeridoConSubido = ProgramaDocumentoRequerido & {
  subido: InscripcionDocumento | null
}

export default function DashboardDocumentosPage() {
  const [requeridos, setRequeridos] = useState<RequeridoConSubido[]>([])
  const [folio, setFolio] = useState('')
  const [programa, setPrograma] = useState('')
  const [uploading, setUploading] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/dashboard/documentos', { credentials: 'include' })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error ?? 'Error al cargar')
        return
      }
      setFolio(data.inscripcion?.folio_preinscripcion ?? '')
      setPrograma(data.inscripcion?.programa?.nombre ?? '')
      setRequeridos(data.requeridos ?? [])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const subir = async (docId: string, file: File) => {
    setUploading(docId)
    try {
      const fd = new FormData()
      fd.set('documentoRequeridoId', docId)
      fd.set('archivo', file)
      const res = await fetch('/api/dashboard/documentos', {
        method: 'POST',
        credentials: 'include',
        body: fd,
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error ?? 'Error al subir')
        return
      }
      toast.success('Documento subido')
      await load()
    } finally {
      setUploading(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-3xl font-black">Mis documentos</h1>
      <p className="mt-2 text-muted-foreground">
        Sube los documentos requeridos para tu admisión.
      </p>
      {(folio || programa) && (
        <div className="mt-4 rounded-lg border bg-white p-4 text-sm">
          {programa && <p className="font-bold">{programa}</p>}
          {folio && <p className="text-muted-foreground">Folio: {folio}</p>}
        </div>
      )}

      <div className="mt-8 space-y-3">
        {requeridos.length === 0 && (
          <p className="text-muted-foreground">
            No hay documentos pendientes configurados. Si admisiones te solicita archivos, aparecerán aquí.
          </p>
        )}
        {requeridos.map((doc) => (
          <Card key={doc.id}>
            <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-bold flex items-center gap-2">
                  <FileText className="h-4 w-4 text-brand-primary" />
                  {doc.nombre}
                  {doc.obligatorio && <Badge variant="outline">Obligatorio</Badge>}
                </p>
                {doc.descripcion && (
                  <p className="mt-1 text-sm text-muted-foreground">{doc.descripcion}</p>
                )}
                {doc.subido ? (
                  <p className="mt-2 flex items-center gap-1 text-sm text-emerald-700">
                    <CheckCircle2 className="h-4 w-4" />
                    {doc.subido.nombre_archivo}
                    <Badge variant="secondary">{doc.subido.estado}</Badge>
                  </p>
                ) : (
                  <p className="mt-2 flex items-center gap-1 text-sm text-amber-700">
                    <Upload className="h-4 w-4" /> Pendiente de subir
                  </p>
                )}
              </div>
              <Input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.webp"
                className="max-w-xs"
                disabled={uploading === doc.id}
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) void subir(doc.id, f)
                }}
              />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
