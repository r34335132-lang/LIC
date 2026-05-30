import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getPerfilFromSession } from '@/lib/auth-server'

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getPerfilFromSession()
    if (!session || session.perfil.rol !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id } = await params
    const admin = createAdminClient()

    const { data: inscripcion, error: fetchError } = await admin
      .from('inscripciones')
      .select('estado')
      .eq('id', id)
      .single()

    if (fetchError || !inscripcion) {
      return NextResponse.json(
        { error: 'Inscripción no encontrada' },
        { status: 404 }
      )
    }

    if (inscripcion.estado !== 'pendiente') {
      return NextResponse.json(
        { error: 'La inscripción ya fue procesada' },
        { status: 400 }
      )
    }

    const { error: updateError } = await admin
      .from('inscripciones')
      .update({ estado: 'rechazada' })
      .eq('id', id)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Rechazar inscripción error:', error)
    return NextResponse.json(
      { error: 'Error al rechazar inscripción' },
      { status: 500 }
    )
  }
}
