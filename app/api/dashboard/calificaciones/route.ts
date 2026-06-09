import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getPerfilFromSession, canAccessAlumno } from '@/lib/auth-server'
import type {
  Actividad,
  ActividadEntrega,
  AlumnoMateria,
  Materia,
} from '@/types/database'

type AlumnoMateriaRow = AlumnoMateria & { materia: Materia | null }
type ActividadResumen = Pick<Actividad, 'id' | 'titulo' | 'materia_id'>

export async function GET() {
  try {
    const session = await getPerfilFromSession()
    if (!session || !canAccessAlumno(session.perfil.rol)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const admin = createAdminClient()
    const alumnoId = session.userId

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

    let entregasRevisadas: (ActividadEntrega & {
      actividad?: ActividadResumen
    })[] = []
    if (materiaIds.length > 0) {
      const { data: actividades } = await admin
        .from('actividades')
        .select('id, titulo, materia_id')
        .in('materia_id', materiaIds)

      const actMap = new Map((actividades ?? []).map((a) => [a.id, a]))
      const actIds = [...actMap.keys()]

      if (actIds.length > 0) {
        const { data: entData } = await admin
          .from('actividad_entregas')
          .select('*')
          .eq('alumno_id', alumnoId)
          .eq('estado', 'revisada')
          .in('actividad_id', actIds)
          .order('updated_at', { ascending: false })

        entregasRevisadas = (entData ?? []).map((e) => ({
          ...(e as ActividadEntrega),
          actividad: actMap.get(e.actividad_id),
        }))
      }
    }

    const materias = alumnoMaterias
      .map((am) => ({
        id: am.id,
        materia_id: am.materia_id,
        estado: am.estado,
        calificacion: am.calificacion,
        creditos: am.materia?.creditos ?? 0,
        periodo: am.materia?.periodo ?? 0,
        nombre_periodo: am.materia?.nombre_periodo ?? '',
        nombre: am.materia?.nombre ?? '',
        clave: am.materia?.clave ?? '',
      }))
      .sort((a, b) => {
        if (a.periodo !== b.periodo) return a.periodo - b.periodo
        return a.nombre.localeCompare(b.nombre, 'es')
      })

    const totalCreditos = materias.reduce((acc, m) => acc + m.creditos, 0)
    const creditosAprobados = materias
      .filter((m) => m.estado === 'aprobada')
      .reduce((acc, m) => acc + m.creditos, 0)

    const califsMateria = materias
      .filter((m) => m.calificacion != null)
      .map((m) => m.calificacion as number)
    const promedioGeneral =
      califsMateria.length > 0
        ? Math.round(
            (califsMateria.reduce((a, b) => a + b, 0) / califsMateria.length) * 10
          ) / 10
        : null

    const califsTareas = entregasRevisadas
      .map((e) => e.calificacion)
      .filter((c): c is number => c != null)
    const promedioTareas =
      califsTareas.length > 0
        ? Math.round(
            (califsTareas.reduce((a, b) => a + b, 0) / califsTareas.length) * 10
          ) / 10
        : null

    const porcentajeAvance =
      totalCreditos > 0
        ? Math.round((creditosAprobados / totalCreditos) * 100)
        : 0

    return NextResponse.json({
      materias,
      promedioGeneral,
      promedioTareas,
      creditosAprobados,
      totalCreditos,
      porcentajeAvance,
      tareasRecientes: entregasRevisadas.slice(0, 10),
    })
  } catch (error) {
    console.error('Dashboard calificaciones error:', error)
    return NextResponse.json(
      { error: 'Error al obtener calificaciones' },
      { status: 500 }
    )
  }
}
