import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getPerfilFromSession } from '@/lib/auth-server'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getPerfilFromSession()
    if (
      !session ||
      (session.perfil.rol !== 'profesor' && session.perfil.rol !== 'admin')
    ) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id } = await params
    const admin = createAdminClient()

    const { data: pm, error: pmError } = await admin
      .from('profesor_materias')
      .select('*, materia:materias(*)')
      .eq('id', id)
      .single()

    if (pmError || !pm) {
      return NextResponse.json({ error: 'Materia no encontrada' }, { status: 404 })
    }

    if (
      session.perfil.rol === 'profesor' &&
      pm.profesor_id !== session.userId
    ) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    const [{ data: alumnos, error: alError }, { data: actividades, error: actError }] =
      await Promise.all([
        admin
          .from('alumno_materias')
          .select(
            '*, alumno:perfiles!alumno_materias_alumno_id_fkey(id, nombre_completo, matricula, email)'
          )
          .eq('materia_id', pm.materia_id),
        admin
          .from('actividades')
          .select('*')
          .eq('materia_id', pm.materia_id)
          .order('created_at', { ascending: false }),
      ])

    if (alError) {
      return NextResponse.json({ error: alError.message }, { status: 400 })
    }
    if (actError) {
      return NextResponse.json({ error: actError.message }, { status: 400 })
    }

    return NextResponse.json({
      profesorMateria: pm,
      alumnos: alumnos ?? [],
      actividades: actividades ?? [],
    })
  } catch (error) {
    console.error('Profesor materia detail GET error:', error)
    return NextResponse.json(
      { error: 'Error al obtener materia' },
      { status: 500 }
    )
  }
}
