import type { createAdminClient } from '@/lib/supabase/admin'

const BUCKET = 'entregas-imagenes'
const MIME_PERMITIDOS = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
])

const MIME_POR_EXTENSION: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  heic: 'image/heic',
  heif: 'image/heif',
}

export const ENTREGAS_IMAGENES_BUCKET = BUCKET

export function esArchivoSubido(value: FormDataEntryValue): value is File {
  if (typeof value !== 'object' || value === null) return false
  const candidato = value as File
  return (
    typeof candidato.arrayBuffer === 'function' &&
    typeof candidato.size === 'number' &&
    candidato.size > 0
  )
}

function extensionDeNombre(nombre: string) {
  return nombre.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || ''
}

function mimeDesdeCabecera(buffer: Buffer): string | null {
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return 'image/jpeg'
  }
  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return 'image/png'
  }
  if (
    buffer.length >= 12 &&
    buffer.toString('ascii', 0, 4) === 'RIFF' &&
    buffer.toString('ascii', 8, 12) === 'WEBP'
  ) {
    return 'image/webp'
  }
  if (buffer.length >= 12 && buffer.toString('ascii', 4, 8) === 'ftyp') {
    return 'image/heic'
  }
  return null
}

export function resolverTipoImagen(archivo: File, buffer: Buffer): string | null {
  const reportado = (archivo.type || '').toLowerCase().trim()
  if (reportado === 'image/jpg') return 'image/jpeg'
  if (MIME_PERMITIDOS.has(reportado) && reportado !== 'image/jpg') {
    return reportado === 'image/jpeg' ? 'image/jpeg' : reportado
  }

  const porCabecera = mimeDesdeCabecera(buffer)
  if (porCabecera) return porCabecera

  const porExtension = MIME_POR_EXTENSION[extensionDeNombre(archivo.name)]
  if (porExtension) return porExtension

  return null
}

export async function asegurarBucketEntregas(
  admin: ReturnType<typeof createAdminClient>
) {
  const { data: buckets, error } = await admin.storage.listBuckets()
  if (error) {
    console.warn('No se pudieron listar buckets de storage:', error.message)
    return
  }

  const existe = (buckets ?? []).some((bucket) => bucket.id === BUCKET)
  if (existe) return

  const { error: createError } = await admin.storage.createBucket(BUCKET, {
    public: true,
    fileSizeLimit: 8 * 1024 * 1024,
    allowedMimeTypes: [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/heic',
      'image/heif',
    ],
  })

  if (createError && !/already exists|duplicate/i.test(createError.message)) {
    console.warn('No se pudo crear el bucket de entregas:', createError.message)
  }
}
