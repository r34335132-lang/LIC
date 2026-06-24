import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getPerfilFromSession, canAccessAlumno } from '@/lib/auth-server'

export async function GET() {
  try {
    const session = await getPerfilFromSession()
    if (!session || !canAccessAlumno(session.perfil.rol)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const admin = createAdminClient()
    const alumnoId = session.userId

    const { data: inscripciones } = await admin
      .from('alumno_materias')
      .select('materia_id')
      .eq('alumno_id', alumnoId)

    const materiaIds = (inscripciones ?? []).map((am) => am.materia_id)
    if (materiaIds.length === 0) {
      return NextResponse.json({ examenes: [] })
    }

    const { data: examenes } = await admin
      .from('examenes')
      .select('*, materia:materias(id, nombre, clave)')
      .in('materia_id', materiaIds)
      .eq('activo', true)
      .order('created_at', { ascending: false })

    const examenIds = (examenes ?? []).map((e) => e.id)
    let intentos: Record<string, unknown>[] = []

    if (examenIds.length > 0) {
      const { data } = await admin
        .from('examen_intentos')
        .select('*')
        .in('examen_id', examenIds)
        .eq('alumno_id', alumnoId)
      intentos = data ?? []
    }

    const intentoMap = new Map(intentos.map((i) => [i.examen_id as string, i]))

    return NextResponse.json({
      examenes: (examenes ?? []).map((examen) => ({
        ...examen,
        intento: intentoMap.get(examen.id) ?? null,
      })),
    })
  } catch (error) {
    console.error('Dashboard examenes GET error:', error)
    return NextResponse.json({ error: 'Error al obtener exámenes' }, { status: 500 })
  }
}
