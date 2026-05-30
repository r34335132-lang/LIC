import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getPerfilFromSession, canAccessAlumno } from '@/lib/auth-server'
import type { ActividadEntrega } from '@/types/database'

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
    const body = await request.json()
    const texto_respuesta =
      typeof body.texto_respuesta === 'string' ? body.texto_respuesta.trim() : null
    const link_entrega =
      typeof body.link_entrega === 'string' ? body.link_entrega.trim() : null
    const archivo_url =
      typeof body.archivo_url === 'string' ? body.archivo_url.trim() : null

    if (!texto_respuesta && !link_entrega && !archivo_url) {
      return NextResponse.json(
        { error: 'Debes incluir respuesta, link de entrega o archivo' },
        { status: 400 }
      )
    }

    const admin = createAdminClient()

    const { data: actividad, error: actError } = await admin
      .from('actividades')
      .select('id, materia_id, activo')
      .eq('id', actividadId)
      .maybeSingle()

    if (actError || !actividad) {
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
      .select('*')
      .eq('actividad_id', actividadId)
      .eq('alumno_id', session.userId)
      .maybeSingle()

    if (existente?.estado === 'revisada') {
      return NextResponse.json(
        { error: 'Esta entrega ya fue revisada y no puede modificarse' },
        { status: 400 }
      )
    }

    const payload = {
      actividad_id: actividadId,
      alumno_id: session.userId,
      texto_respuesta,
      link_entrega,
      archivo_url,
      estado: 'entregada' as const,
      updated_at: new Date().toISOString(),
    }

    const { data: entrega, error: upsertError } = await admin
      .from('actividad_entregas')
      .upsert(payload, { onConflict: 'actividad_id,alumno_id' })
      .select()
      .single()

    if (upsertError) {
      return NextResponse.json({ error: upsertError.message }, { status: 400 })
    }

    return NextResponse.json({ entrega: entrega as ActividadEntrega })
  } catch (error) {
    console.error('Entregar actividad error:', error)
    return NextResponse.json({ error: 'Error al entregar actividad' }, { status: 500 })
  }
}
