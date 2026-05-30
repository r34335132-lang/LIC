import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getPerfilFromSession } from '@/lib/auth-server'

export async function POST(request: Request) {
  try {
    const session = await getPerfilFromSession()
    if (!session || session.perfil.rol !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const {
      profesor_id,
      materia_id,
      grupo,
      periodo_escolar,
      horario,
      aula,
      link_clase,
      link_classroom,
      link_drive,
      descripcion,
      activo,
    } = body

    if (!profesor_id || !materia_id) {
      return NextResponse.json(
        { error: 'Profesor y materia son requeridos' },
        { status: 400 }
      )
    }

    const admin = createAdminClient()
    const { data, error } = await admin
      .from('profesor_materias')
      .insert({
        profesor_id,
        materia_id,
        grupo: grupo ?? null,
        periodo_escolar: periodo_escolar ?? null,
        horario: horario ?? null,
        aula: aula ?? null,
        link_clase: link_clase ?? null,
        link_classroom: link_classroom ?? null,
        link_drive: link_drive ?? null,
        descripcion: descripcion ?? null,
        activo: activo ?? true,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    return NextResponse.json({ error: 'Error al asignar profesor' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getPerfilFromSession()
    if (!session || session.perfil.rol !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 })
    }

    const admin = createAdminClient()
    const { error } = await admin
      .from('profesor_materias')
      .update(updates)
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Error al actualizar' }, { status: 500 })
  }
}
