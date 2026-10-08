import type { EntregaDocumento } from '@/types/database'

export const MAX_DOCUMENTOS_ENTREGA = 5
export const MAX_BYTES_DOCUMENTO = 20 * 1024 * 1024

export const MIME_DOCUMENTO_POR_EXTENSION: Record<string, string> = {
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
}

export const MIME_DOCUMENTOS_PERMITIDOS = Object.values(MIME_DOCUMENTO_POR_EXTENSION)

export const ACCEPT_DOCUMENTOS = [
  '.pdf',
  '.doc',
  '.docx',
  ...MIME_DOCUMENTOS_PERMITIDOS,
].join(',')

export function extensionDocumento(nombre: string) {
  return nombre.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || ''
}

export function resolverTipoDocumento(nombre: string, tipoReportado?: string | null): string | null {
  const porExtension = MIME_DOCUMENTO_POR_EXTENSION[extensionDocumento(nombre)]
  if (porExtension) return porExtension
  const reportado = (tipoReportado || '').toLowerCase().trim()
  return MIME_DOCUMENTOS_PERMITIDOS.includes(reportado) ? reportado : null
}

export function esDocumentoPdf(documento: Pick<EntregaDocumento, 'tipo' | 'nombre'>) {
  return documento.tipo === 'application/pdf' || extensionDocumento(documento.nombre) === 'pdf'
}

export function formatearTamanoArchivo(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) return ''
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function normalizarDocumentos(value: unknown): EntregaDocumento[] {
  if (!Array.isArray(value)) return []
  return value.flatMap((item) => {
    if (!item || typeof item !== 'object') return []
    const doc = item as Record<string, unknown>
    if (typeof doc.path !== 'string' || typeof doc.url !== 'string') return []
    return [
      {
        nombre: typeof doc.nombre === 'string' && doc.nombre ? doc.nombre : 'Documento',
        url: doc.url,
        path: doc.path,
        tipo: typeof doc.tipo === 'string' ? doc.tipo : '',
        tamano: typeof doc.tamano === 'number' ? doc.tamano : 0,
      },
    ]
  })
}
