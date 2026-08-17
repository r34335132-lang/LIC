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

export type EntregaConAlumno = Omit<ActividadEntrega, 'id' | 'estado'> & {
  id: string | null
  estado: 'pendiente' | 'entregada' | 'revisada'
  sinEntrega: boolean
  alumno: Pick<Perfil, 'id' | 'nombre_completo' | 'email' | 'matricula'> | null
}

export type TareaConEntregas = {
  actividad: Actividad
  materia: (Materia & { programa?: Pick<Programa, 'id' | 'nombre' | 'tipo'> | null }) | null
  entregas: EntregaConAlumno[]
  stats: {
    total: number
    entregadas: number
    porRevisar: number
    revisadas: number
    sinEntregar: number
  }
}

function placeholderEntrega(
  actividadId: string,
  alumnoId: string,
  alumno: EntregaConAlumno['alumno']
): EntregaConAlumno {
  return {
    id: null,
    actividad_id: actividadId,
    alumno_id: alumnoId,
    texto_respuesta: null,
    link_entrega: null,
    archivo_url: null,
    imagenes_urls: [],
    estado: 'pendiente',
    calificacion: null,
    retroalimentacion: null,
    created_at: '',
    updated_at: '',
    sinEntrega: true,
    alumno,
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

    const { data: inscritosData } = await admin
      .from('alumno_materias')
      .select('alumno_id, materia_id')
      .in('materia_id', materiaIds)

    const alumnosPorMateria = new Map<string, string[]>()
    const alumnoIds = new Set<string>()
    for (const row of inscritosData ?? []) {
      alumnoIds.add(row.alumno_id)
      const list = alumnosPorMateria.get(row.materia_id) ?? []
      if (!list.includes(row.alumno_id)) list.push(row.alumno_id)
      alumnosPorMateria.set(row.materia_id, list)
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

    for (const row of entData ?? []) {
      alumnoIds.add(row.alumno_id)
    }

    const { data: alumnosData } = await admin
      .from('perfiles')
      .select('id, nombre_completo, email, matricula')
      .in('id', alumnoIds.size ? [...alumnoIds] : ['00000000-0000-0000-0000-000000000000'])

    const alumnoMap = new Map(
      (alumnosData ?? []).map((a) => [
        a.id,
        a as Pick<Perfil, 'id' | 'nombre_completo' | 'email' | 'matricula'>,
      ])
    )

    const entregasPorActividad = new Map<string, Map<string, EntregaConAlumno>>()
    for (const row of entData ?? []) {
      const entrega: EntregaConAlumno = {
        ...(row as ActividadEntrega),
        estado: row.estado === 'revisada' ? 'revisada' : 'entregada',
        sinEntrega: false,
        alumno: alumnoMap.get(row.alumno_id) ?? null,
      }
      const porAlumno = entregasPorActividad.get(row.actividad_id) ?? new Map()
      porAlumno.set(row.alumno_id, entrega)
      entregasPorActividad.set(row.actividad_id, porAlumno)
    }

    const tareas: TareaConEntregas[] = acts.map((actividad) => {
      const porAlumno = new Map(entregasPorActividad.get(actividad.id) ?? [])
      const inscritos = alumnosPorMateria.get(actividad.materia_id) ?? []

      for (const alumnoId of inscritos) {
        if (!porAlumno.has(alumnoId)) {
          porAlumno.set(
            alumnoId,
            placeholderEntrega(actividad.id, alumnoId, alumnoMap.get(alumnoId) ?? null)
          )
        }
      }

      const entregas = [...porAlumno.values()].sort((a, b) => {
        const orden = (e: EntregaConAlumno) => {
          if (e.estado === 'entregada') return 0
          if (e.sinEntrega) return 1
          return 2
        }
        const diff = orden(a) - orden(b)
        if (diff !== 0) return diff
        return (a.alumno?.nombre_completo ?? '').localeCompare(
          b.alumno?.nombre_completo ?? '',
          'es'
        )
      })

      const entregadas = entregas.filter((e) => !e.sinEntrega).length
      const porRevisar = entregas.filter((e) => e.estado === 'entregada').length
      const revisadas = entregas.filter((e) => e.estado === 'revisada').length
      const sinEntregar = entregas.filter((e) => e.sinEntrega).length

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
          entregadas,
          porRevisar,
          revisadas,
          sinEntregar,
        },
      }
    })

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
    const id = typeof body.id === 'string' && body.id.trim() ? body.id.trim() : ''
    const actividadId =
      typeof body.actividad_id === 'string' ? body.actividad_id.trim() : ''
    const alumnoId = typeof body.alumno_id === 'string' ? body.alumno_id.trim() : ''
    const calificacion =
      body.calificacion !== undefined ? Number(body.calificacion) : undefined
    const retroalimentacion =
      typeof body.retroalimentacion === 'string'
        ? body.retroalimentacion.trim()
        : undefined

    if (!id && (!actividadId || !alumnoId)) {
      return NextResponse.json(
        { error: 'ID de entrega o actividad y alumno requeridos' },
        { status: 400 }
      )
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

    let entrega = null as
      | (ActividadEntrega & { actividad?: { materia_id: string } | null })
      | null

    if (id) {
      const { data } = await admin
        .from('actividad_entregas')
        .select('*, actividad:actividades(materia_id)')
        .eq('id', id)
        .maybeSingle()
      entrega = data as typeof entrega
    } else {
      const { data } = await admin
        .from('actividad_entregas')
        .select('*, actividad:actividades(materia_id)')
        .eq('actividad_id', actividadId)
        .eq('alumno_id', alumnoId)
        .maybeSingle()
      entrega = data as typeof entrega
    }

    const materiaIdFromEntrega = (
      entrega?.actividad as { materia_id: string } | null | undefined
    )?.materia_id

    let materiaId = materiaIdFromEntrega ?? ''
    let actividadDestino = entrega?.actividad_id ?? actividadId
    let alumnoDestino = entrega?.alumno_id ?? alumnoId

    if (!materiaId) {
      if (!actividadDestino || !alumnoDestino) {
        return NextResponse.json({ error: 'Entrega no encontrada' }, { status: 404 })
      }

      const { data: actividad } = await admin
        .from('actividades')
        .select('id, materia_id, activo')
        .eq('id', actividadDestino)
        .maybeSingle()

      if (!actividad) {
        return NextResponse.json({ error: 'Actividad no encontrada' }, { status: 404 })
      }

      materiaId = actividad.materia_id

      const { data: inscrito } = await admin
        .from('alumno_materias')
        .select('id')
        .eq('alumno_id', alumnoDestino)
        .eq('materia_id', materiaId)
        .maybeSingle()

      if (!inscrito) {
        return NextResponse.json(
          { error: 'El alumno no está inscrito en esta materia' },
          { status: 400 }
        )
      }
    }

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
      actividad_id: actividadDestino,
      alumno_id: alumnoDestino,
      estado: 'revisada',
      updated_at: new Date().toISOString(),
    }
    if (calificacion !== undefined) updates.calificacion = calificacion
    if (retroalimentacion !== undefined) updates.retroalimentacion = retroalimentacion
    if (!entrega) {
      updates.texto_respuesta = null
      updates.link_entrega = null
      updates.archivo_url = null
      updates.imagenes_urls = []
    }

    const { data, error } = await admin
      .from('actividad_entregas')
      .upsert(updates, { onConflict: 'actividad_id,alumno_id' })
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
