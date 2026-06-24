import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getPerfilFromSession, canAccessAlumno } from '@/lib/auth-server'
import { subirDocumentoInscripcion } from '@/lib/inscripcion-documentos'

export async function GET() {
  try {
    const session = await getPerfilFromSession()
    if (!session || !canAccessAlumno(session.perfil.rol)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const admin = createAdminClient()
    const userId = session.userId
    const email = session.perfil.email?.toLowerCase() ?? ''

    const { data: inscripcion } = await admin
      .from('inscripciones')
      .select('id, programa_id, folio_preinscripcion, estado, email, programa:programas(id, nombre)')
      .or(`alumno_id.eq.${userId},email.eq.${email}`)
      .in('estado', ['pendiente', 'apartado', 'aprobada'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (!inscripcion) {
      return NextResponse.json({ inscripcion: null, requeridos: [] })
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
        .eq('inscripcion_id', inscripcion.id),
    ])

    const subidosMap = new Map((subidos ?? []).map((d) => [d.documento_requerido_id, d]))

    return NextResponse.json({
      inscripcion,
      requeridos: (requeridos ?? []).map((r) => ({
        ...r,
        subido: subidosMap.get(r.id) ?? null,
      })),
    })
  } catch (error) {
    console.error('Dashboard documentos GET error:', error)
    return NextResponse.json({ error: 'Error al cargar documentos' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getPerfilFromSession()
    if (!session || !canAccessAlumno(session.perfil.rol)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const formData = await request.formData()
    const documentoRequeridoId = String(formData.get('documentoRequeridoId') ?? '')
    const file = formData.get('archivo')

    if (!documentoRequeridoId || !(file instanceof File)) {
      return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 })
    }

    const admin = createAdminClient()
    const email = session.perfil.email?.toLowerCase() ?? ''

    const { data: inscripcion } = await admin
      .from('inscripciones')
      .select('id, email')
      .or(`alumno_id.eq.${session.userId},email.eq.${email}`)
      .in('estado', ['pendiente', 'apartado', 'aprobada'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (!inscripcion) {
      return NextResponse.json({ error: 'No hay inscripción activa' }, { status: 404 })
    }

    const result = await subirDocumentoInscripcion(admin, {
      inscripcionId: inscripcion.id,
      email: inscripcion.email,
      documentoRequeridoId,
      file,
    })

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status })
    }

    return NextResponse.json({ success: true, documento: result.documento })
  } catch (error) {
    console.error('Dashboard documentos POST error:', error)
    return NextResponse.json({ error: 'Error al subir documento' }, { status: 500 })
  }
}
