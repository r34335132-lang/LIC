import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getPerfilFromSession } from '@/lib/auth-server'

export async function GET() {
  try {
    const session = await getPerfilFromSession()
    if (
      !session ||
      (session.perfil.rol !== 'profesor' && session.perfil.rol !== 'admin')
    ) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const admin = createAdminClient()
    const profesorId = session.userId

    const { data, error } = await admin
      .from('profesor_materias')
      .select('*, materia:materias(*)')
      .eq('profesor_id', profesorId)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ materias: data ?? [] })
  } catch (error) {
    console.error('Profesor materias GET error:', error)
    return NextResponse.json(
      { error: 'Error al obtener materias' },
      { status: 500 }
    )
  }
}
