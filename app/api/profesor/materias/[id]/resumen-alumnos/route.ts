import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getPerfilFromSession } from '@/lib/auth-server'
import { loadProfesorMateriaAsignacion } from '@/lib/profesor-materias'
import { resolverEstadoEntrega } from '@/lib/academico-utils'

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

    const materiaId = asignacion.asignacion.materia_id

    const [
      { data: alumnos },
      { data: actividades },
      { data: examenes },
      { data: rubrica },
    ] = await Promise.all([
      admin
        .from('alumno_materias')
        .select(
          '*, alumno:perfiles!alumno_materias_alumno_id_fkey(id, nombre_completo, matricula, email)'
        )
        .eq('materia_id', materiaId),
      admin
        .from('actividades')
        .select('id, titulo, fecha_entrega, activo')
        .eq('materia_id', materiaId)
        .eq('activo', true),
      admin
        .from('examenes')
        .select('id, titulo, activo')
        .eq('materia_id', materiaId)
        .eq('activo', true),
      admin
        .from('materia_rubricas')
        .select('*, criterios:materia_rubrica_criterios(*)')
        .eq('materia_id', materiaId)
        .eq('profesor_id', asignacion.asignacion.profesor_id)
        .maybeSingle(),
    ])

    const actividadIds = (actividades ?? []).map((a) => a.id)
    const examenIds = (examenes ?? []).map((e) => e.id)
    const alumnoIds = (alumnos ?? []).map((a) => a.alumno_id)

    let entregas: Record<string, unknown>[] = []
    let intentos: Record<string, unknown>[] = []

    if (actividadIds.length > 0 && alumnoIds.length > 0) {
      const { data } = await admin
        .from('actividad_entregas')
        .select('alumno_id, actividad_id, estado, calificacion')
        .in('actividad_id', actividadIds)
        .in('alumno_id', alumnoIds)
      entregas = data ?? []
    }

    if (examenIds.length > 0 && alumnoIds.length > 0) {
      const { data } = await admin
        .from('examen_intentos')
        .select('alumno_id, examen_id, estado, calificacion, tiempo_usado_segundos')
        .in('examen_id', examenIds)
        .in('alumno_id', alumnoIds)
      intentos = data ?? []
    }

    const totalTareas = actividadIds.length
    const totalExamenes = examenIds.length

    const resumen = (alumnos ?? []).map((am) => {
      const alumnoId = am.alumno_id as string
      const entregasAlumno = entregas.filter((e) => e.alumno_id === alumnoId)
      const intentosAlumno = intentos.filter((i) => i.alumno_id === alumnoId)

      const tareasEntregadas = entregasAlumno.length
      const tareasRevisadas = entregasAlumno.filter((e) => e.estado === 'revisada')
      const califsTareas = tareasRevisadas
        .map((e) => Number(e.calificacion))
        .filter((c) => Number.isFinite(c))
      const promedioTareas =
        califsTareas.length > 0
          ? Math.round(
              (califsTareas.reduce((s, c) => s + c, 0) / califsTareas.length) * 100
            ) / 100
          : null

      const tareasPendientes = (actividades ?? []).filter((act) => {
        const ent = entregasAlumno.find((e) => e.actividad_id === act.id)
        const estado = resolverEstadoEntrega(
          ent as { estado: string } | null,
          act.fecha_entrega as string | null
        )
        return estado === 'pendiente' || estado === 'vencida'
      }).length

      const examenesCompletados = intentosAlumno.filter(
        (i) => i.estado === 'finalizado' || i.estado === 'revisado'
      ).length
      const califsExamenes = intentosAlumno
        .map((i) => Number(i.calificacion))
        .filter((c) => Number.isFinite(c))
      const promedioExamenes =
        califsExamenes.length > 0
          ? Math.round(
              (califsExamenes.reduce((s, c) => s + c, 0) / califsExamenes.length) * 100
            ) / 100
          : null

      const examenesPendientes = totalExamenes - examenesCompletados

      let sugerenciaCalificacion: number | null = null
      const desgloseSugerencia: {
        nombre: string
        tipo: string
        peso: number
        promedio: number | null
        aporte: number | null
      }[] = []

      if (rubrica?.criterios) {
        const criterios = rubrica.criterios as {
          nombre: string
          tipo: string
          peso: number
        }[]
        let suma = 0
        let pesoConDatos = 0

        for (const c of criterios) {
          let promedio: number | null = null
          if (c.tipo === 'tareas') promedio = promedioTareas
          else if (c.tipo === 'examenes') promedio = promedioExamenes

          const aporte =
            promedio !== null ? Math.round(promedio * (c.peso / 100) * 100) / 100 : null

          desgloseSugerencia.push({
            nombre: c.nombre,
            tipo: c.tipo,
            peso: c.peso,
            promedio,
            aporte,
          })

          if (promedio !== null) {
            suma += promedio * (c.peso / 100)
            pesoConDatos += c.peso
          }
        }

        if (pesoConDatos > 0) {
          // Sugerencia ponderada; si faltan datos, se normaliza al peso disponible
          sugerenciaCalificacion = Math.round((suma / (pesoConDatos / 100)) * 100) / 100
        }
      }

      return {
        alumno_materia_id: am.id,
        alumno: am.alumno,
        calificacion_actual: am.calificacion,
        tareas: {
          total: totalTareas,
          entregadas: tareasEntregadas,
          revisadas: tareasRevisadas.length,
          pendientes: tareasPendientes,
          promedio: promedioTareas,
        },
        examenes: {
          total: totalExamenes,
          completados: examenesCompletados,
          pendientes: examenesPendientes,
          promedio: promedioExamenes,
        },
        sugerencia_calificacion: sugerenciaCalificacion,
        desglose_sugerencia: desgloseSugerencia,
        sugerencia_parcial: desgloseSugerencia.some((d) => d.promedio === null),
      }
    })

    return NextResponse.json({
      rubrica: rubrica ?? null,
      resumen,
      totales: { tareas: totalTareas, examenes: totalExamenes },
    })
  } catch (error) {
    console.error('Resumen alumnos GET error:', error)
    return NextResponse.json({ error: 'Error al obtener resumen' }, { status: 500 })
  }
}
