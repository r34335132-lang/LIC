'use client'

import { useCallback, useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Upload, CheckCircle2, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import type { ProgramaDocumentoRequerido, InscripcionDocumento } from '@/types/database'

type RequeridoConSubido = ProgramaDocumentoRequerido & {
  subido: InscripcionDocumento | null
}

function DocumentosContent() {
  const searchParams = useSearchParams()
  const inscripcionId = searchParams.get('id') ?? ''
  const [email, setEmail] = useState('')
  const [verified, setVerified] = useState(false)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState<string | null>(null)
  const [nombre, setNombre] = useState('')
  const [folio, setFolio] = useState('')
  const [programa, setPrograma] = useState('')
  const [requeridos, setRequeridos] = useState<RequeridoConSubido[]>([])

  const load = useCallback(async () => {
    if (!inscripcionId || !email) return
    setLoading(true)
    try {
      const res = await fetch(
        `/api/inscripciones/documentos?inscripcionId=${inscripcionId}&email=${encodeURIComponent(email)}`
      )
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error ?? 'No se pudo verificar')
        setVerified(false)
        return
      }
      setVerified(true)
      setNombre(data.inscripcion.nombre_completo)
      setFolio(data.inscripcion.folio ?? '')
      setPrograma(data.inscripcion.programa?.nombre ?? '')
      setRequeridos(data.requeridos ?? [])
    } finally {
      setLoading(false)
    }
  }, [inscripcionId, email])

  const subir = async (docId: string, file: File) => {
    setUploading(docId)
    try {
      const fd = new FormData()
      fd.set('inscripcionId', inscripcionId)
      fd.set('email', email)
      fd.set('documentoRequeridoId', docId)
      fd.set('archivo', file)
      const res = await fetch('/api/inscripciones/documentos', { method: 'POST', body: fd })
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

  return (
    <div className="space-y-6">
      {!verified ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Verifica tu pre-inscripción</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Ingresa el mismo correo que usaste al pre inscribirte.
            </p>
            <div>
              <Label>Correo electrónico</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="correo@ejemplo.com"
              />
            </div>
            <Button
              className="bg-brand-primary"
              disabled={!email || !inscripcionId || loading}
              onClick={load}
            >
              {loading ? 'Verificando…' : 'Continuar'}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="rounded-lg border bg-white p-4 text-sm">
            <p className="font-bold">{nombre}</p>
            {folio && <p className="text-muted-foreground">Folio: {folio}</p>}
            <p className="text-muted-foreground">{programa}</p>
          </div>

          {requeridos.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Aún no hay documentos configurados para tu programa. Un asesor te indicará qué enviar.
            </p>
          ) : (
            requeridos.map((doc) => (
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
                    {doc.subido && (
                      <p className="mt-2 flex items-center gap-1 text-sm text-emerald-700">
                        <CheckCircle2 className="h-4 w-4" />
                        Subido: {doc.subido.nombre_archivo}
                        <Badge variant="secondary" className="ml-1">{doc.subido.estado}</Badge>
                      </p>
                    )}
                  </div>
                  <div>
                    <Label className="sr-only">Archivo</Label>
                    <Input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,.webp"
                      disabled={uploading === doc.id}
                      onChange={(e) => {
                        const f = e.target.files?.[0]
                        if (f) void subir(doc.id, f)
                      }}
                    />
                    {uploading === doc.id && (
                      <p className="mt-1 text-xs text-muted-foreground">Subiendo…</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </>
      )}
    </div>
  )
}

export default function InscripcionDocumentosPage() {
  return (
    <main className="min-h-screen bg-slate-50 py-12">
      <div className="container mx-auto max-w-2xl px-4">
        <Link href="/inscripcion" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-brand-primary mb-6">
          <ArrowLeft className="h-4 w-4" /> Volver
        </Link>
        <h1 className="text-3xl font-black">Subir documentos</h1>
        <p className="mt-2 text-muted-foreground mb-8">
          Carga los archivos que solicita admisiones según tu programa de estudio.
        </p>
        <Suspense fallback={<div className="h-32 animate-pulse rounded-lg bg-slate-200" />}>
          <DocumentosContent />
        </Suspense>
      </div>
    </main>
  )
}
