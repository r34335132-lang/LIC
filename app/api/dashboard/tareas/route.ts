import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getPerfilFromSession, canAccessAlumno } from '@/lib/auth-server'
import { resolverEstadoEntrega } from '@/lib/academico-utils'
import type {
  Actividad,
  ActividadEntrega,
  Materia,
  Perfil,
} from '@/types/database'

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
      .select('materia_id, materia:materias(*)')
      .eq('alumno_id', alumnoId)

    if (amError) {
      return NextResponse.json({ error: amError.message }, { status: 400 })
    }

    const materiaIds = (amData ?? [])
      .map((row) => row.materia_id as string)
      .filter(Boolean)

    if (materiaIds.length === 0) {
      return NextResponse.json({ tareas: [], resumen: { pendientes: 0, entregadas: 0, revisadas: 0, promedioRevisadas: null } })
    }

    const materiaMap = new Map<string, Materia>()
    for (const row of amData ?? []) {
      const m = row.materia as Materia | null
      if (m) materiaMap.set(m.id, m)
    }

    const { data: actividades, error: actError } = await admin
      .from('actividades')
      .select('*')
      .in('materia_id', materiaIds)
      .eq('activo', true)
      .order('fecha_entrega', { ascending: true })

    if (actError) {
      return NextResponse.json({ error: actError.message }, { status: 400 })
    }

    const acts = (actividades ?? []) as Actividad[]
    const actividadIds = acts.map((a) => a.id)

    const profesorIds = [...new Set(acts.map((a) => a.profesor_id))]
    const { data: profesoresData } = await admin
      .from('perfiles')
      .select('id, nombre_completo, email')
      .in('id', profesorIds)

    const profesorMap = new Map<string, Pick<Perfil, 'id' | 'nombre_completo' | 'email'>>()
    for (const p of profesoresData ?? []) {
      profesorMap.set(p.id, p)
    }

    let entregas: ActividadEntrega[] = []
    if (actividadIds.length > 0) {
      const { data: entData, error: entError } = await admin
        .from('actividad_entregas')
        .select('*')
        .eq('alumno_id', alumnoId)
        .in('actividad_id', actividadIds)

      if (entError) {
        return NextResponse.json({ error: entError.message }, { status: 400 })
      }
      entregas = (entData ?? []) as ActividadEntrega[]
    }

    const entregaMap = new Map(entregas.map((e) => [e.actividad_id, e]))

    const tareas = acts.map((act) => {
      const entrega = entregaMap.get(act.id) ?? null
      const materia = materiaMap.get(act.materia_id) ?? null
      const profesor = profesorMap.get(act.profesor_id) ?? null
      const estadoEntrega = resolverEstadoEntrega(entrega, act.fecha_entrega)

      return {
        actividad: act,
        materia,
        profesor,
        entrega,
        estadoEntrega,
        calificacion: entrega?.calificacion ?? null,
        retroalimentacion: entrega?.retroalimentacion ?? null,
      }
    })

    const revisadas = tareas.filter((t) => t.estadoEntrega === 'revisada')
    const califs = revisadas
      .map((t) => t.calificacion)
      .filter((c): c is number => c != null)
    const promedioRevisadas =
      califs.length > 0
        ? Math.round((califs.reduce((a, b) => a + b, 0) / califs.length) * 10) / 10
        : null

    return NextResponse.json({
      tareas,
      resumen: {
        pendientes: tareas.filter((t) => t.estadoEntrega === 'pendiente' || t.estadoEntrega === 'vencida').length,
        entregadas: tareas.filter((t) => t.estadoEntrega === 'entregada').length,
        revisadas: revisadas.length,
        promedioRevisadas,
      },
    })
  } catch (error) {
    console.error('Dashboard tareas error:', error)
    return NextResponse.json({ error: 'Error al obtener tareas' }, { status: 500 })
  }
}
