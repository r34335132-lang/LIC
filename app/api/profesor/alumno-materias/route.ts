import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getPerfilFromSession } from '@/lib/auth-server'

const ESTADOS_VALIDOS = ['pendiente', 'cursando', 'aprobada', 'reprobada'] as const

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
    const { id, estado, calificacion } = body

    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 })
    }

    if (estado !== undefined && !ESTADOS_VALIDOS.includes(estado)) {
      return NextResponse.json(
        { error: 'Estado inválido. Usa pendiente, cursando, aprobada o reprobada.' },
        { status: 400 }
      )
    }

    if (
      calificacion !== undefined &&
      calificacion !== null &&
      (typeof calificacion !== 'number' ||
        Number.isNaN(calificacion) ||
        calificacion < 0 ||
        calificacion > 10)
    ) {
      return NextResponse.json(
        { error: 'La calificación debe ser un número entre 0 y 10.' },
        { status: 400 }
      )
    }

    const admin = createAdminClient()

    // Obtenemos la materia del registro a modificar
    const { data: am } = await admin
      .from('alumno_materias')
      .select('id, materia_id')
      .eq('id', id)
      .maybeSingle()

    if (!am) {
      return NextResponse.json(
        { error: 'Registro de alumno no encontrado' },
        { status: 404 }
      )
    }

    // El profesor solo puede modificar materias que tiene asignadas.
    // El admin puede modificar todo.
    if (session.perfil.rol === 'profesor') {
      const { data: pm } = await admin
        .from('profesor_materias')
        .select('id')
        .eq('materia_id', am.materia_id)
        .eq('profesor_id', session.userId)
        .maybeSingle()

      if (!pm) {
        return NextResponse.json(
          { error: 'No tienes esta materia asignada' },
          { status: 403 }
        )
      }
    }

    const updates: Record<string, unknown> = {}
    if (estado !== undefined) updates.estado = estado
    if (calificacion !== undefined) updates.calificacion = calificacion

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No hay campos para actualizar' },
        { status: 400 }
      )
    }

    const { error } = await admin
      .from('alumno_materias')
      .update(updates)
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Update alumno-materia error:', error)
    return NextResponse.json({ error: 'Error al actualizar' }, { status: 500 })
  }
}
