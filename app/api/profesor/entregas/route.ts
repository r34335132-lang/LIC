import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getPerfilFromSession } from '@/lib/auth-server'
import type {
  Actividad,
  ActividadEntrega,
  Materia,
  Perfil,
  Programa,
} from '@/types/database'

export type EntregaConAlumno = ActividadEntrega & {
  alumno: Pick<Perfil, 'id' | 'nombre_completo' | 'email' | 'matricula'> | null
}

export type TareaConEntregas = {
  actividad: Actividad
  materia: (Materia & { programa?: Pick<Programa, 'id' | 'nombre' | 'tipo'> | null }) | null
  entregas: EntregaConAlumno[]
  stats: {
    total: number
    porRevisar: number
    revisadas: number
  }
}

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

    let materiaIds: string[] = []

    if (session.perfil.rol === 'admin') {
      const { data: acts } = await admin.from('actividades').select('materia_id')
      materiaIds = [...new Set((acts ?? []).map((a) => a.materia_id))]
    } else {
      const { data: pmData } = await admin
        .from('profesor_materias')
        .select('materia_id')
        .eq('profesor_id', profesorId)
        .eq('activo', true)

      materiaIds = (pmData ?? []).map((pm) => pm.materia_id)
    }

    if (materiaIds.length === 0) {
      return NextResponse.json({ tareas: [], entregas: [] })
    }

    const { data: actividades } = await admin
      .from('actividades')
      .select('*')
      .in('materia_id', materiaIds)
      .eq('activo', true)
      .order('fecha_entrega', { ascending: false, nullsFirst: false })

    const acts = (actividades ?? []) as Actividad[]
    const actIds = acts.map((a) => a.id)

    const { data: materiasData } = await admin
      .from('materias')
      .select('*')
      .in('id', materiaIds)

    const materiaMap = new Map((materiasData ?? []).map((m) => [m.id, m as Materia]))
    const programaIds = [
      ...new Set(
        (materiasData ?? [])
          .map((m) => m.programa_id)
          .filter((id): id is string => typeof id === 'string' && id.length > 0)
      ),
    ]
    const programasById = new Map<string, Pick<Programa, 'id' | 'nombre' | 'tipo'>>()

    if (programaIds.length > 0) {
      const { data: programas } = await admin
        .from('programas')
        .select('id, nombre, tipo')
        .in('id', programaIds)

      for (const programa of (programas ?? []) as Pick<Programa, 'id' | 'nombre' | 'tipo'>[]) {
        programasById.set(programa.id, programa)
      }
    }

    if (actIds.length === 0) {
      return NextResponse.json({ tareas: [], entregas: [] })
    }

    const { data: entData, error } = await admin
      .from('actividad_entregas')
      .select('*')
      .in('actividad_id', actIds)
      .order('updated_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    const alumnoIds = [...new Set((entData ?? []).map((e) => e.alumno_id))]
    const { data: alumnosData } = await admin
      .from('perfiles')
      .select('id, nombre_completo, email, matricula')
      .in('id', alumnoIds.length ? alumnoIds : ['00000000-0000-0000-0000-000000000000'])

    const alumnoMap = new Map(
      (alumnosData ?? []).map((a) => [
        a.id,
        a as Pick<Perfil, 'id' | 'nombre_completo' | 'email' | 'matricula'>,
      ])
    )

    const entregasPorActividad = new Map<string, EntregaConAlumno[]>()
    for (const row of entData ?? []) {
      const entrega: EntregaConAlumno = {
        ...(row as ActividadEntrega),
        alumno: alumnoMap.get(row.alumno_id) ?? null,
      }
      const list = entregasPorActividad.get(row.actividad_id) ?? []
      list.push(entrega)
      entregasPorActividad.set(row.actividad_id, list)
    }

    const tareas: TareaConEntregas[] = acts.map((actividad) => {
      const entregas = entregasPorActividad.get(actividad.id) ?? []
      const porRevisar = entregas.filter((e) => e.estado !== 'revisada').length
      const revisadas = entregas.filter((e) => e.estado === 'revisada').length
      return {
        actividad,
        materia: materiaMap.get(actividad.materia_id)
          ? {
              ...materiaMap.get(actividad.materia_id)!,
              programa:
                programasById.get(materiaMap.get(actividad.materia_id)!.programa_id) ?? null,
            }
          : null,
        entregas,
        stats: {
          total: entregas.length,
          porRevisar,
          revisadas,
        },
      }
    })

    // Compatibilidad con consumidores que esperan lista plana
    const entregas = tareas.flatMap((t) =>
      t.entregas.map((e) => ({
        ...e,
        actividad: t.actividad,
        materia: t.materia,
      }))
    )

    return NextResponse.json({ tareas, entregas })
  } catch (error) {
    console.error('Profesor entregas GET error:', error)
    return NextResponse.json({ error: 'Error al obtener entregas' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getPerfilFromSession()
    if (
      !session ||
      (session.perfil.rol !== 'profesor' && session.perfil.rol !== 'admin')
    ) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const id = typeof body.id === 'string' ? body.id : ''
    const calificacion =
      body.calificacion !== undefined ? Number(body.calificacion) : undefined
    const retroalimentacion =
      typeof body.retroalimentacion === 'string'
        ? body.retroalimentacion.trim()
        : undefined

    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 })
    }

    if (calificacion === undefined && retroalimentacion === undefined) {
      return NextResponse.json(
        { error: 'calificacion o retroalimentacion requeridos' },
        { status: 400 }
      )
    }

    if (
      calificacion !== undefined &&
      (!Number.isFinite(calificacion) || calificacion < 0 || calificacion > 10)
    ) {
      return NextResponse.json(
        { error: 'La calificación debe ser un número entre 0 y 10' },
        { status: 400 }
      )
    }

    const admin = createAdminClient()

    const { data: entrega } = await admin
      .from('actividad_entregas')
      .select('*, actividad:actividades(materia_id)')
      .eq('id', id)
      .maybeSingle()

    if (!entrega) {
      return NextResponse.json({ error: 'Entrega no encontrada' }, { status: 404 })
    }

    const materiaId = (entrega.actividad as { materia_id: string } | null)?.materia_id

    if (session.perfil.rol === 'profesor' && materiaId) {
      const { data: pm } = await admin
        .from('profesor_materias')
        .select('id')
        .eq('profesor_id', session.userId)
        .eq('materia_id', materiaId)
        .eq('activo', true)
        .maybeSingle()

      if (!pm) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
      }
    }

    const updates: Record<string, unknown> = {
      estado: 'revisada',
      updated_at: new Date().toISOString(),
    }
    if (calificacion !== undefined) updates.calificacion = calificacion
    if (retroalimentacion !== undefined) updates.retroalimentacion = retroalimentacion

    const { data, error } = await admin
      .from('actividad_entregas')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ entrega: data })
  } catch (error) {
    console.error('Profesor entregas PATCH error:', error)
    return NextResponse.json({ error: 'Error al calificar entrega' }, { status: 500 })
  }
}
