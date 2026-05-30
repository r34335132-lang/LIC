import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getPerfilFromSession } from '@/lib/auth-server'
import type {
  Actividad,
  AlumnoMateria,
  Materia,
  Perfil,
  ProfesorMateria,
} from '@/types/database'

type ProfesorMateriaConProfesor = ProfesorMateria & {
  profesor?: Pick<Perfil, 'id' | 'nombre_completo' | 'email'> | null
}

type AlumnoMateriaRow = AlumnoMateria & { materia: Materia | null }

export async function GET() {
  try {
    const session = await getPerfilFromSession()
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const admin = createAdminClient()
    const alumnoId = session.userId

    // 1. Materias del alumno (incluye datos de la materia)
    const { data: amData, error: amError } = await admin
      .from('alumno_materias')
      .select('*, materia:materias(*)')
      .eq('alumno_id', alumnoId)

    if (amError) {
      return NextResponse.json({ error: amError.message }, { status: 400 })
    }

    const alumnoMaterias = (amData ?? []) as AlumnoMateriaRow[]
    const materiaIds = alumnoMaterias
      .map((am) => am.materia?.id)
      .filter((id): id is string => !!id)

    if (materiaIds.length === 0) {
      return NextResponse.json({ materias: [] })
    }

    // 2. Asignaciones de profesor activas para esas materias (una sola consulta)
    const { data: pmData } = await admin
      .from('profesor_materias')
      .select(
        '*, profesor:perfiles!profesor_materias_profesor_id_fkey(id, nombre_completo, email)'
      )
      .in('materia_id', materiaIds)
      .eq('activo', true)

    const profesorPorMateria = new Map<string, ProfesorMateriaConProfesor>()
    for (const pm of (pmData ?? []) as ProfesorMateriaConProfesor[]) {
      if (!profesorPorMateria.has(pm.materia_id)) {
        profesorPorMateria.set(pm.materia_id, pm)
      }
    }

    // 3. Actividades activas para esas materias (una sola consulta)
    const { data: actData } = await admin
      .from('actividades')
      .select('*')
      .in('materia_id', materiaIds)
      .eq('activo', true)
      .order('fecha_entrega', { ascending: true })

    const actividadesPorMateria = new Map<string, Actividad[]>()
    for (const act of (actData ?? []) as Actividad[]) {
      const list = actividadesPorMateria.get(act.materia_id) ?? []
      list.push(act)
      actividadesPorMateria.set(act.materia_id, list)
    }

    const materias = alumnoMaterias.map((am) => {
      const materiaId = am.materia?.id ?? ''
      const pm = profesorPorMateria.get(materiaId) ?? null
      return {
        id: am.id,
        estado: am.estado,
        calificacion: am.calificacion,
        materia: am.materia,
        profesor: pm?.profesor ?? null,
        grupo: pm?.grupo ?? null,
        horario: pm?.horario ?? null,
        aula: pm?.aula ?? null,
        periodo_escolar: pm?.periodo_escolar ?? null,
        link_clase: pm?.link_clase ?? null,
        link_classroom: pm?.link_classroom ?? null,
        link_drive: pm?.link_drive ?? null,
        descripcion: pm?.descripcion ?? null,
        actividades: actividadesPorMateria.get(materiaId) ?? [],
      }
    })

    return NextResponse.json({ materias })
  } catch (error) {
    console.error('Dashboard materias error:', error)
    return NextResponse.json(
      { error: 'Error al obtener materias' },
      { status: 500 }
    )
  }
}
