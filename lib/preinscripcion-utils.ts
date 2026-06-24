import { mensualidadMontoDefault } from '@/lib/academico-utils'

export type EstadoSeguimientoInscripcion =
  | 'sin_contactar'
  | 'en_comunicacion'
  | 'interesado'
  | 'faltan_documentos'
  | 'documentos_completos'
  | 'listo_aprobar'
  | 'no_interesado'

export const ESTADOS_SEGUIMIENTO: {
  value: EstadoSeguimientoInscripcion
  label: string
  color: string
}[] = [
  { value: 'sin_contactar', label: 'Sin contactar', color: 'bg-slate-100 text-slate-800' },
  { value: 'en_comunicacion', label: 'En comunicación', color: 'bg-blue-100 text-blue-800' },
  { value: 'interesado', label: 'Interesado', color: 'bg-violet-100 text-violet-800' },
  { value: 'faltan_documentos', label: 'Faltan documentos', color: 'bg-amber-100 text-amber-900' },
  { value: 'documentos_completos', label: 'Documentos completos', color: 'bg-teal-100 text-teal-900' },
  { value: 'listo_aprobar', label: 'Listo para aprobar', color: 'bg-emerald-100 text-emerald-900' },
  { value: 'no_interesado', label: 'No interesado', color: 'bg-red-100 text-red-800' },
]

export function labelEstadoSeguimiento(estado: string): string {
  return ESTADOS_SEGUIMIENTO.find((e) => e.value === estado)?.label ?? estado
}

export function generarFolioPreinscripcion(): string {
  const year = new Date().getFullYear()
  const seq = Math.floor(100000 + Math.random() * 900000)
  return `PRE-${year}-${seq}`
}

export function montoInscripcionFicha(): number {
  return 0
}

export function montoMensualidadFicha(): number {
  return mensualidadMontoDefault()
}

export function buildPreInscripcionUrl(programaId?: string) {
  const params = new URLSearchParams()
  if (programaId) params.set('programa', programaId)
  const qs = params.toString()
  return qs ? `/inscripcion?${qs}` : '/inscripcion'
}

export function buildDocumentosPreInscripcionUrl(inscripcionId: string) {
  return `/inscripcion/documentos?id=${inscripcionId}`
}
