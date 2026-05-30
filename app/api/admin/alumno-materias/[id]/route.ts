import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getPerfilFromSession } from '@/lib/auth-server'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getPerfilFromSession()
    if (!session || session.perfil.rol !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { estado, calificacion } = body

    const updates: Record<string, unknown> = {}
    if (estado !== undefined) updates.estado = estado
    if (calificacion !== undefined) updates.calificacion = calificacion

    const admin = createAdminClient()
    const { error } = await admin
      .from('alumno_materias')
      .update(updates)
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Update alumno materia error:', error)
    return NextResponse.json({ error: 'Error al actualizar' }, { status: 500 })
  }
}
