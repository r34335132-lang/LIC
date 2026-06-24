import type { createAdminClient } from '@/lib/supabase/admin'

type AdminClient = ReturnType<typeof createAdminClient>

export async function subirDocumentoInscripcion(
  admin: AdminClient,
  input: {
    inscripcionId: string
    email: string
    documentoRequeridoId: string
    file: File
  }
) {
  const { inscripcionId, email, documentoRequeridoId, file } = input

  if (file.size > 10 * 1024 * 1024) {
    return { ok: false as const, error: 'El archivo no debe superar 10 MB', status: 400 }
  }

  const { data: inscripcion } = await admin
    .from('inscripciones')
    .select('id, email, programa_id, estado')
    .eq('id', inscripcionId)
    .maybeSingle()

  if (!inscripcion) {
    return { ok: false as const, error: 'Inscripción no encontrada', status: 404 }
  }

  if (email && inscripcion.email !== email.toLowerCase()) {
    return { ok: false as const, error: 'Correo no válido', status: 403 }
  }

  if (inscripcion.estado === 'aprobada' || inscripcion.estado === 'rechazada') {
    return { ok: false as const, error: 'Esta inscripción ya fue procesada', status: 400 }
  }

  const { data: requerido } = await admin
    .from('programa_documentos_requeridos')
    .select('id')
    .eq('id', documentoRequeridoId)
    .eq('programa_id', inscripcion.programa_id)
    .maybeSingle()

  if (!requerido) {
    return { ok: false as const, error: 'Documento no válido para este programa', status: 400 }
  }

  const ext = file.name.split('.').pop()?.toLowerCase() || 'bin'
  const path = `${inscripcionId}/${documentoRequeridoId}-${Date.now()}.${ext}`
  const buffer = Buffer.from(await file.arrayBuffer())

  const { error: uploadError } = await admin.storage
    .from('inscripcion-documentos')
    .upload(path, buffer, {
      contentType: file.type || 'application/octet-stream',
      upsert: true,
    })

  if (uploadError) {
    return {
      ok: false as const,
      error: uploadError.message || 'No se pudo subir el archivo',
      status: 400,
    }
  }

  const { data: signed } = await admin.storage
    .from('inscripcion-documentos')
    .createSignedUrl(path, 60 * 60 * 24 * 365)

  const archivoUrl = signed?.signedUrl ?? path

  const { data: doc, error: upsertError } = await admin
    .from('inscripcion_documentos')
    .upsert(
      {
        inscripcion_id: inscripcionId,
        documento_requerido_id: documentoRequeridoId,
        archivo_url: archivoUrl,
        nombre_archivo: file.name,
        estado: 'pendiente',
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'inscripcion_id,documento_requerido_id' }
    )
    .select()
    .single()

  if (upsertError) {
    return { ok: false as const, error: upsertError.message, status: 400 }
  }

  return { ok: true as const, documento: doc }
}
