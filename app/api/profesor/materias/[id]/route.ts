import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getPerfilFromSession } from '@/lib/auth-server'
import { loadProfesorMateriaAsignacion } from '@/lib/profesor-materias'

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

    const { id: profesorMateriaId } = await params
    const admin = createAdminClient()

    const asignacion = await loadProfesorMateriaAsignacion(
      admin,
      profesorMateriaId,
      { userId: session.userId, rol: session.perfil.rol }
    )

    if (!asignacion.ok) {
      return NextResponse.json(
        { error: asignacion.error },
        { status: asignacion.status }
      )
    }

    const { data: pm, error: pmError } = await admin
      .from('profesor_materias')
      .select('*, materia:materias(*)')
      .eq('id', asignacion.asignacion.id)
      .single()

    if (pmError || !pm) {
      return NextResponse.json(
        { error: 'Asignación de profesor no encontrada' },
        { status: 404 }
      )
    }

    const materiaId = pm.materia_id

    const [{ data: alumnos, error: alError }, { data: actividades, error: actError }] =
      await Promise.all([
        admin
          .from('alumno_materias')
          .select(
            '*, alumno:perfiles!alumno_materias_alumno_id_fkey(id, nombre_completo, matricula, email)'
          )
          .eq('materia_id', materiaId),
        admin
          .from('actividades')
          .select('*')
          .eq('materia_id', materiaId)
          .order('created_at', { ascending: false }),
      ])

    if (alError) {
      return NextResponse.json({ error: alError.message }, { status: 400 })
    }
    if (actError) {
      return NextResponse.json({ error: actError.message }, { status: 400 })
    }

    const actividadIds = (actividades ?? []).map((actividad) => actividad.id)
    let recursos: Record<string, unknown>[] = []

    if (actividadIds.length > 0) {
      const { data: recursosData, error: recursosError } = await admin
        .from('tarea_recursos')
        .select('*')
        .in('tarea_id', actividadIds)
        .order('orden', { ascending: true })

      if (recursosError) {
        console.warn('Profesor materia recursos no disponibles:', recursosError.message)
      } else {
        recursos = recursosData ?? []
      }
    }

    const recursosPorTarea = new Map<string, Record<string, unknown>[]>()
    for (const recurso of recursos) {
      const tareaId = recurso.tarea_id as string
      recursosPorTarea.set(tareaId, [
        ...(recursosPorTarea.get(tareaId) ?? []),
        recurso,
      ])
    }

    return NextResponse.json({
      profesorMateria: pm,
      materiaId,
      profesorMateriaId: asignacion.asignacion.id,
      alumnos: alumnos ?? [],
      actividades: (actividades ?? []).map((actividad) => ({
        ...actividad,
        recursos: recursosPorTarea.get(actividad.id) ?? [],
      })),
    })
  } catch (error) {
    console.error('Profesor materia detail GET error:', error)
    return NextResponse.json(
      { error: 'Error al obtener materia' },
      { status: 500 }
    )
  }
}
