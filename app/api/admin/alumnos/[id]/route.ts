import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getPerfilFromSession } from '@/lib/auth-server'

export async function GET(
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

    const [{ data: alumno, error: alumnoError }, { data: materias, error: matError }] =
      await Promise.all([
        admin.from('perfiles').select('*').eq('id', id).single(),
        admin
          .from('alumno_materias')
          .select('*, materia:materias(*)')
          .eq('alumno_id', id),
      ])

    if (alumnoError || !alumno) {
      return NextResponse.json({ error: 'Alumno no encontrado' }, { status: 404 })
    }
    if (matError) {
      return NextResponse.json({ error: matError.message }, { status: 400 })
    }

    return NextResponse.json({
      alumno,
      materias: materias ?? [],
    })
  } catch (error) {
    console.error('Admin alumno detail GET error:', error)
    return NextResponse.json(
      { error: 'Error al obtener alumno' },
      { status: 500 }
    )
  }
}
