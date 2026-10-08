import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getPerfilFromSession, canAccessAlumno } from '@/lib/auth-server'
import { getSupabaseAnonKey } from '@/lib/supabase/env'
import {
  ENTREGAS_IMAGENES_BUCKET,
  asegurarBucketEntregas,
} from '@/lib/entrega-imagenes-server'
import {
  MAX_BYTES_DOCUMENTO,
  MAX_DOCUMENTOS_ENTREGA,
  extensionDocumento,
  resolverTipoDocumento,
} from '@/lib/entrega-documentos'

type ArchivoSolicitado = { nombre: string; tipo: string | null; tamano: number }

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getPerfilFromSession()
    if (!session || !canAccessAlumno(session.perfil.rol)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id: actividadId } = await params
    const body = await request.json().catch(() => null)
    const archivos: ArchivoSolicitado[] = Array.isArray(body?.archivos)
      ? body.archivos.map((item: Record<string, unknown>) => ({
          nombre: typeof item?.nombre === 'string' ? item.nombre : '',
          tipo: typeof item?.tipo === 'string' ? item.tipo : null,
          tamano: Number(item?.tamano),
        }))
      : []

    if (archivos.length === 0) {
      return NextResponse.json({ error: 'No se recibieron documentos' }, { status: 400 })
    }
    if (archivos.length > MAX_DOCUMENTOS_ENTREGA) {
      return NextResponse.json(
        { error: `Puedes adjuntar hasta ${MAX_DOCUMENTOS_ENTREGA} documentos` },
        { status: 400 }
      )
    }

    const preparados: (ArchivoSolicitado & { contentType: string })[] = []
    for (const archivo of archivos) {
      const contentType = resolverTipoDocumento(archivo.nombre, archivo.tipo)
      if (!contentType) {
        return NextResponse.json(
          { error: `${archivo.nombre || 'El archivo'} no es PDF ni Word` },
          { status: 400 }
        )
      }
      if (!Number.isFinite(archivo.tamano) || archivo.tamano <= 0) {
        return NextResponse.json({ error: `${archivo.nombre} está vacío` }, { status: 400 })
      }
      if (archivo.tamano > MAX_BYTES_DOCUMENTO) {
        return NextResponse.json(
          { error: `${archivo.nombre} pesa más de ${MAX_BYTES_DOCUMENTO / (1024 * 1024)} MB` },
          { status: 400 }
        )
      }
      preparados.push({ ...archivo, contentType })
    }

    const admin = createAdminClient()

    const { data: actividad } = await admin
      .from('actividades')
      .select('id, materia_id, activo')
      .eq('id', actividadId)
      .maybeSingle()

    if (!actividad) {
      return NextResponse.json({ error: 'Actividad no encontrada' }, { status: 404 })
    }
    if (!actividad.activo) {
      return NextResponse.json({ error: 'La actividad no está activa' }, { status: 400 })
    }

    const { data: inscripcionMateria } = await admin
      .from('alumno_materias')
      .select('id')
      .eq('alumno_id', session.userId)
      .eq('materia_id', actividad.materia_id)
      .maybeSingle()

    if (!inscripcionMateria) {
      return NextResponse.json(
        { error: 'Esta actividad no pertenece a tus materias' },
        { status: 403 }
      )
    }

    const { data: existente } = await admin
      .from('actividad_entregas')
      .select('estado')
      .eq('actividad_id', actividadId)
      .eq('alumno_id', session.userId)
      .maybeSingle()

    if (existente?.estado === 'revisada') {
      return NextResponse.json(
        { error: 'Esta entrega ya fue revisada y no puede modificarse' },
        { status: 400 }
      )
    }

    await asegurarBucketEntregas(admin)

    const subidas = []
    for (const [index, archivo] of preparados.entries()) {
      const extension = extensionDocumento(archivo.nombre) || 'pdf'
      const path = `${session.userId}/${actividadId}/docs/${Date.now()}-${index}.${extension}`
      const { data, error } = await admin.storage
        .from(ENTREGAS_IMAGENES_BUCKET)
        .createSignedUploadUrl(path)

      if (error || !data) {
        return NextResponse.json(
          { error: `No se pudo preparar ${archivo.nombre}: ${error?.message ?? 'sin respuesta'}` },
          { status: 400 }
        )
      }

      subidas.push({
        nombre: archivo.nombre,
        tamano: archivo.tamano,
        tipo: archivo.contentType,
        path: data.path,
        signedUrl: data.signedUrl,
      })
    }

    return NextResponse.json({ subidas, apikey: getSupabaseAnonKey() ?? null })
  } catch (error) {
    console.error('Preparar documentos entrega error:', error)
    return NextResponse.json({ error: 'Error al preparar los documentos' }, { status: 500 })
  }
}
