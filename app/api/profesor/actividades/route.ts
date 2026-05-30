import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getPerfilFromSession } from '@/lib/auth-server'

export async function POST(request: Request) {
  try {
    const session = await getPerfilFromSession()
    if (!session || (session.perfil.rol !== 'profesor' && session.perfil.rol !== 'admin')) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { materia_id, titulo, descripcion, link_recurso, fecha_entrega } = body

    if (!materia_id || !titulo) {
      return NextResponse.json(
        { error: 'Materia y título son requeridos' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const { data, error } = await supabase
      .from('actividades')
      .insert({
        materia_id,
        profesor_id: session.userId,
        titulo,
        descripcion: descripcion ?? null,
        link_recurso: link_recurso ?? null,
        fecha_entrega: fecha_entrega ?? null,
        activo: true,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    return NextResponse.json({ error: 'Error al crear actividad' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getPerfilFromSession()
    if (!session || (session.perfil.rol !== 'profesor' && session.perfil.rol !== 'admin')) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 })
    }

    const supabase = await createClient()
    const { error } = await supabase
      .from('actividades')
      .update(updates)
      .eq('id', id)
      .eq('profesor_id', session.userId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Error al actualizar actividad' }, { status: 500 })
  }
}
