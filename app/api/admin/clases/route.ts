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
      { data: clases, error: clError },
      { data: programas, error: progError },
      { data: profesores, error: profError },
      { data: materias, error: matError },
    ] = await Promise.all([
      admin
        .from('profesor_materias')
        .select(
          '*, materia:materias(*), profesor:perfiles!profesor_materias_profesor_id_fkey(id, nombre_completo, email)'
        )
        .order('created_at', { ascending: false }),
      admin.from('programas').select('*').eq('activo', true).order('nombre'),
      admin
        .from('perfiles')
        .select('id, nombre_completo, email')
        .eq('rol', 'profesor')
        .order('nombre_completo'),
      admin.from('materias').select('*').order('periodo').order('nombre'),
    ])

    if (clError) return NextResponse.json({ error: clError.message }, { status: 400 })
    if (progError) return NextResponse.json({ error: progError.message }, { status: 400 })
    if (profError) return NextResponse.json({ error: profError.message }, { status: 400 })
    if (matError) return NextResponse.json({ error: matError.message }, { status: 400 })

    return NextResponse.json({
      clases: clases ?? [],
      programas: programas ?? [],
      profesores: profesores ?? [],
      materias: materias ?? [],
    })
  } catch (error) {
    console.error('Admin clases GET error:', error)
    return NextResponse.json({ error: 'Error al obtener clases' }, { status: 500 })
  }
}
