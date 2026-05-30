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

    const { data: pms, error: pmError } = await admin
      .from('profesor_materias')
      .select('*, materia:materias(*)')
      .eq('profesor_id', profesorId)
      .eq('activo', true)

    if (pmError) {
      return NextResponse.json({ error: pmError.message }, { status: 400 })
    }

    const materias = pms ?? []
    const materiaIds = materias.map((m) => m.materia_id).filter(Boolean)

    let totalAlumnos = 0
    let actividades: unknown[] = []

    if (materiaIds.length > 0) {
      const [{ count }, { data: acts, error: actError }] = await Promise.all([
        admin
          .from('alumno_materias')
          .select('id', { count: 'exact', head: true })
          .in('materia_id', materiaIds),
        admin
          .from('actividades')
          .select('*')
          .eq('profesor_id', profesorId)
          .eq('activo', true)
          .order('fecha_entrega', { ascending: true }),
      ])

      totalAlumnos = count ?? 0
      if (actError) {
        return NextResponse.json({ error: actError.message }, { status: 400 })
      }
      actividades = acts ?? []
    }

    return NextResponse.json({
      materias,
      totalAlumnos,
      actividades,
    })
  } catch (error) {
    console.error('Profesor dashboard GET error:', error)
    return NextResponse.json(
      { error: 'Error al obtener panel docente' },
      { status: 500 }
    )
  }
}
