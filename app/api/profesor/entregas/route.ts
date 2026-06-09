import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getPerfilFromSession } from '@/lib/auth-server'
import type {
  Actividad,
  ActividadEntrega,
  Materia,
  Perfil,
} from '@/types/database'

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
      return NextResponse.json({ entregas: [] })
    }

    const { data: actividades } = await admin
      .from('actividades')
      .select('*')
      .in('materia_id', materiaIds)
      .eq('activo', true)

    const acts = (actividades ?? []) as Actividad[]
    const actIds = acts.map((a) => a.id)
    const actMap = new Map(acts.map((a) => [a.id, a]))

    const materiaIdSet = new Set(materiaIds)
    const { data: materiasData } = await admin
      .from('materias')
      .select('*')
      .in('id', [...materiaIdSet])

    const materiaMap = new Map((materiasData ?? []).map((m) => [m.id, m as Materia]))

    if (actIds.length === 0) {
      return NextResponse.json({ entregas: [] })
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

    const entregas = (entData ?? []).map((e) => {
      const act = actMap.get(e.actividad_id)
      const materia = act ? materiaMap.get(act.materia_id) ?? null : null
      return {
        ...(e as ActividadEntrega),
        actividad: act ?? null,
        materia,
        alumno: alumnoMap.get(e.alumno_id) ?? null,
      }
    })

    return NextResponse.json({ entregas })
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
