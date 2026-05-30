import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getPerfilFromSession } from '@/lib/auth-server'

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
    const id = typeof body.id === 'string' ? body.id : ''

    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 })
    }

    const admin = createAdminClient()

    const { data: source, error: srcError } = await admin
      .from('profesor_materias')
      .select('id, profesor_id, grupo, link_classroom')
      .eq('id', id)
      .single()

    if (srcError || !source) {
      return NextResponse.json({ error: 'Clase no encontrada' }, { status: 404 })
    }

    if (
      session.perfil.rol === 'profesor' &&
      source.profesor_id !== session.userId
    ) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    if (!source.link_classroom) {
      return NextResponse.json(
        { error: 'Esta clase no tiene link de Classroom' },
        { status: 400 }
      )
    }

    if (!source.grupo) {
      return NextResponse.json(
        { error: 'Esta clase no tiene grupo definido' },
        { status: 400 }
      )
    }

    const { data: targets, error: tgtError } = await admin
      .from('profesor_materias')
      .select('id')
      .eq('profesor_id', source.profesor_id)
      .eq('grupo', source.grupo)
      .neq('id', source.id)

    if (tgtError) {
      return NextResponse.json({ error: tgtError.message }, { status: 400 })
    }

    if (!targets?.length) {
      return NextResponse.json({
        success: true,
        updated: 0,
        message: 'No hay otras clases del mismo grupo',
      })
    }

    const { error: updateError } = await admin
      .from('profesor_materias')
      .update({ link_classroom: source.link_classroom })
      .eq('profesor_id', source.profesor_id)
      .eq('grupo', source.grupo)
      .neq('id', source.id)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, updated: targets.length })
  } catch (error) {
    console.error('Copy classroom error:', error)
    return NextResponse.json({ error: 'Error al copiar link' }, { status: 500 })
  }
}
