import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getPerfilFromSession } from '@/lib/auth-server'

export async function PATCH(request: Request) {
  try {
    const session = await getPerfilFromSession()
    if (!session || (session.perfil.rol !== 'profesor' && session.perfil.rol !== 'admin')) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { id, horario, aula, link_clase, link_classroom, link_drive, descripcion } = body

    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 })
    }

    const admin = createAdminClient()

    if (session.perfil.rol === 'profesor') {
      const { data: pm } = await admin
        .from('profesor_materias')
        .select('id')
        .eq('id', id)
        .eq('profesor_id', session.userId)
        .maybeSingle()

      if (!pm) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
      }
    }

    const { error } = await admin
      .from('profesor_materias')
      .update({
        ...(horario !== undefined && { horario }),
        ...(aula !== undefined && { aula }),
        ...(link_clase !== undefined && { link_clase }),
        ...(link_classroom !== undefined && { link_classroom }),
        ...(link_drive !== undefined && { link_drive }),
        ...(descripcion !== undefined && { descripcion }),
      })
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Error al actualizar' }, { status: 500 })
  }
}
