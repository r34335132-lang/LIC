import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getPerfilFromSession } from '@/lib/auth-server'

export async function GET() {
  try {
    const session = await getPerfilFromSession()
    if (!session || session.perfil.rol !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const admin = createAdminClient()

    const [
      { data: profesores, error: profError },
      { data: materias, error: matError },
      { data: profesorMaterias, error: pmError },
      { data: programas, error: progError },
    ] = await Promise.all([
      admin
        .from('perfiles')
        .select('*')
        .eq('rol', 'profesor')
        .order('nombre_completo'),
      admin.from('materias').select('*').order('periodo'),
      admin.from('profesor_materias').select('*, materia:materias(*)'),
      admin.from('programas').select('*').eq('activo', true).order('nombre'),
    ])

    if (profError) {
      return NextResponse.json({ error: profError.message }, { status: 400 })
    }
    if (matError) {
      return NextResponse.json({ error: matError.message }, { status: 400 })
    }
    if (pmError) {
      return NextResponse.json({ error: pmError.message }, { status: 400 })
    }
    if (progError) {
      return NextResponse.json({ error: progError.message }, { status: 400 })
    }

    return NextResponse.json({
      profesores: profesores ?? [],
      materias: materias ?? [],
      profesorMaterias: profesorMaterias ?? [],
      programas: programas ?? [],
    })
  } catch (error) {
    console.error('Admin profesores-data GET error:', error)
    return NextResponse.json(
      { error: 'Error al obtener datos de profesores' },
      { status: 500 }
    )
  }
}
