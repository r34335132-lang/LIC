import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getPerfilFromSession } from '@/lib/auth-server'
import { getProgramaIdCandidates, normalizeProgramaId } from '@/lib/programa-utils'
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
    const programaId = normalizeProgramaId(session.perfil.programa_id)
    const programaCandidates = getProgramaIdCandidates(session.perfil.programa_id)

    // 1. Materias asignadas al alumno, para conservar estado/calificacion.
    const { data: amData, error: amError } = await admin
      .from('alumno_materias')
      .select('*, materia:materias(*)')
      .eq('alumno_id', alumnoId)

    if (amError) {
      return NextResponse.json({ error: amError.message }, { status: 400 })
    }

    const alumnoMaterias = (amData ?? []) as AlumnoMateriaRow[]
    let materiasPlan: Materia[] = []

    if (programaId) {
      const { data: materiasData, error: materiasError } = await admin
        .from('materias')
        .select(
          'id, programa_id, periodo, nombre_periodo, nombre, clave, seriacion, horas_docente, horas_independientes, creditos, instalacion, created_at'
        )
        .in('programa_id', programaCandidates)
        .order('periodo', { ascending: true })
        .order('clave', { ascending: true })

      if (materiasError) {
        return NextResponse.json({ error: materiasError.message }, { status: 400 })
      }

      materiasPlan = (materiasData ?? []) as Materia[]
    }

    if (materiasPlan.length === 0) {
      materiasPlan = alumnoMaterias
        .map((am) => am.materia)
        .filter((materia): materia is Materia => !!materia)
        .sort((a, b) => {
          if (a.periodo !== b.periodo) return a.periodo - b.periodo
          return a.clave.localeCompare(b.clave, 'es')
        })
    }

    const alumnoMateriaPorMateria = new Map<string, AlumnoMateriaRow>()
    for (const am of alumnoMaterias) {
      if (am.materia_id) alumnoMateriaPorMateria.set(am.materia_id, am)
    }

    const materiaIds = materiasPlan.map((materia) => materia.id)

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

    const materias = materiasPlan
      .map((materia) => {
        const am = alumnoMateriaPorMateria.get(materia.id)
        const materiaId = materia.id
        const pm = profesorPorMateria.get(materiaId) ?? null
        return {
          id: am?.id ?? materia.id,
          estado: am?.estado ?? 'pendiente',
          calificacion: am?.calificacion ?? null,
          materia,
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
      .sort((a, b) => {
        const pa = a.materia?.periodo ?? 0
        const pb = b.materia?.periodo ?? 0
        if (pa !== pb) return pa - pb
        return (a.materia?.clave ?? '').localeCompare(b.materia?.clave ?? '', 'es')
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
