import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getPerfilFromSession } from '@/lib/auth-server'

export async function PATCH(request: Request) {
  try {
    const session = await getPerfilFromSession()
    if (!session || (session.perfil.rol !== 'profesor' && session.perfil.rol !== 'admin')) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { id, estado, calificacion } = body

    const supabase = await createClient()
    const { error } = await supabase
      .from('alumno_materias')
      .update({
        ...(estado !== undefined && { estado }),
        ...(calificacion !== undefined && { calificacion }),
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
