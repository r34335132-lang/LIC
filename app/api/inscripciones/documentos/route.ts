import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { subirDocumentoInscripcion } from '@/lib/inscripcion-documentos'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const inscripcionId = searchParams.get('inscripcionId') ?? searchParams.get('id') ?? ''
    const email = (searchParams.get('email') ?? '').trim().toLowerCase()

    if (!inscripcionId) {
      return NextResponse.json({ error: 'ID de inscripción requerido' }, { status: 400 })
    }

    const admin = createAdminClient()
    const { data: inscripcion, error } = await admin
      .from('inscripciones')
      .select('id, email, nombre_completo, programa_id, folio_preinscripcion, estado, programa:programas(id, nombre)')
      .eq('id', inscripcionId)
      .maybeSingle()

    if (error || !inscripcion) {
      return NextResponse.json({ error: 'Inscripción no encontrada' }, { status: 404 })
    }

    if (email && inscripcion.email !== email) {
      return NextResponse.json({ error: 'El correo no coincide con la inscripción' }, { status: 403 })
    }

    const [{ data: requeridos }, { data: subidos }] = await Promise.all([
      admin
        .from('programa_documentos_requeridos')
        .select('*')
        .eq('programa_id', inscripcion.programa_id)
        .order('orden', { ascending: true }),
      admin
        .from('inscripcion_documentos')
        .select('*')
        .eq('inscripcion_id', inscripcionId),
    ])

    const subidosMap = new Map((subidos ?? []).map((d) => [d.documento_requerido_id, d]))

    return NextResponse.json({
      inscripcion: {
        id: inscripcion.id,
        nombre_completo: inscripcion.nombre_completo,
        email: inscripcion.email,
        folio: inscripcion.folio_preinscripcion,
        estado: inscripcion.estado,
        programa: inscripcion.programa,
      },
      requeridos: (requeridos ?? []).map((r) => ({
        ...r,
        subido: subidosMap.get(r.id) ?? null,
      })),
    })
  } catch (error) {
    console.error('Inscripcion documentos GET error:', error)
    return NextResponse.json({ error: 'Error al cargar documentos' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const inscripcionId = String(formData.get('inscripcionId') ?? '')
    const email = String(formData.get('email') ?? '').trim().toLowerCase()
    const documentoRequeridoId = String(formData.get('documentoRequeridoId') ?? '')
    const file = formData.get('archivo')

    if (!inscripcionId || !documentoRequeridoId || !(file instanceof File)) {
      return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 })
    }

    const admin = createAdminClient()
    const result = await subirDocumentoInscripcion(admin, {
      inscripcionId,
      email,
      documentoRequeridoId,
      file,
    })

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status })
    }

    return NextResponse.json({ success: true, documento: result.documento })
  } catch (error) {
    console.error('Inscripcion documentos POST error:', error)
    return NextResponse.json({ error: 'Error al subir documento' }, { status: 500 })
  }
}
