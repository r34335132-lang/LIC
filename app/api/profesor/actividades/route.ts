import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getPerfilFromSession } from '@/lib/auth-server'

async function profesorTieneMateria(
  admin: ReturnType<typeof createAdminClient>,
  profesorId: string,
  materiaId: string
) {
  const { data } = await admin
    .from('profesor_materias')
    .select('id')
    .eq('materia_id', materiaId)
    .eq('profesor_id', profesorId)
    .maybeSingle()
  return !!data
}

export async function POST(request: Request) {
  try {
    const session = await getPerfilFromSession()
    if (
      !session ||
      (session.perfil.rol !== 'profesor' && session.perfil.rol !== 'admin')
    ) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const materia_id = typeof body.materia_id === 'string' ? body.materia_id : ''
    const titulo = typeof body.titulo === 'string' ? body.titulo.trim() : ''
    const { descripcion, link_recurso, fecha_entrega } = body

    if (!materia_id || !titulo) {
      return NextResponse.json(
        { error: 'Materia y título son requeridos' },
        { status: 400 }
      )
    }

    const admin = createAdminClient()

    // El profesor solo puede crear actividades en materias asignadas
    if (
      session.perfil.rol === 'profesor' &&
      !(await profesorTieneMateria(admin, session.userId, materia_id))
    ) {
      return NextResponse.json(
        { error: 'No tienes esta materia asignada' },
        { status: 403 }
      )
    }

    const { data, error } = await admin
      .from('actividades')
      .insert({
        materia_id,
        profesor_id: session.userId,
        titulo,
        descripcion: descripcion ?? null,
        link_recurso: link_recurso ?? null,
        fecha_entrega: fecha_entrega || null,
        activo: true,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Crear actividad error:', error)
    return NextResponse.json({ error: 'Error al crear actividad' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getPerfilFromSession()
    if (
      !session ||
      (session.perfil.rol !== 'profesor' && session.perfil.rol !== 'admin')
    ) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { id, ...rest } = body

    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 })
    }

    const allowedFields = [
      'titulo',
      'descripcion',
      'link_recurso',
      'fecha_entrega',
      'activo',
    ] as const

    const updates: Record<string, unknown> = {}
    for (const field of allowedFields) {
      if (rest[field] !== undefined) updates[field] = rest[field]
    }

    if ('activo' in updates && typeof updates.activo !== 'boolean') {
      return NextResponse.json(
        { error: 'El campo activo debe ser booleano' },
        { status: 400 }
      )
    }

    if (
      'titulo' in updates &&
      (typeof updates.titulo !== 'string' || !updates.titulo.trim())
    ) {
      return NextResponse.json(
        { error: 'El título no puede estar vacío' },
        { status: 400 }
      )
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No hay campos válidos para actualizar' },
        { status: 400 }
      )
    }

    const admin = createAdminClient()

    const { data: actividad } = await admin
      .from('actividades')
      .select('id, profesor_id, materia_id')
      .eq('id', id)
      .maybeSingle()

    if (!actividad) {
      return NextResponse.json(
        { error: 'Actividad no encontrada' },
        { status: 404 }
      )
    }

    // El profesor solo puede editar actividades de sus materias asignadas
    if (
      session.perfil.rol === 'profesor' &&
      !(await profesorTieneMateria(admin, session.userId, actividad.materia_id))
    ) {
      return NextResponse.json(
        { error: 'No puedes modificar esta actividad' },
        { status: 403 }
      )
    }

    const { error } = await admin
      .from('actividades')
      .update(updates)
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Actualizar actividad error:', error)
    return NextResponse.json(
      { error: 'Error al actualizar actividad' },
      { status: 500 }
    )
  }
}
