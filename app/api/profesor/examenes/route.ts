import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getPerfilFromSession } from '@/lib/auth-server'
import {
  profesorTieneMateria,
  resolveMateriaIdForProfesor,
} from '@/lib/profesor-materias'
import { parsePreguntas } from '@/lib/examen-utils'

async function replacePreguntas(
  admin: ReturnType<typeof createAdminClient>,
  examenId: string,
  preguntas: NonNullable<ReturnType<typeof parsePreguntas>>
) {
  await admin.from('examen_preguntas').delete().eq('examen_id', examenId)
  if (preguntas.length === 0) return

  const { error } = await admin.from('examen_preguntas').insert(
    preguntas.map((p, index) => ({
      examen_id: examenId,
      texto: p.texto,
      tipo: p.tipo,
      opciones: p.opciones,
      respuesta_correcta: p.respuesta_correcta,
      puntos: p.puntos,
      orden: index,
    }))
  )
  if (error) throw error
}

export async function GET(request: Request) {
  try {
    const session = await getPerfilFromSession()
    if (
      !session ||
      (session.perfil.rol !== 'profesor' && session.perfil.rol !== 'admin')
    ) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const materiaIdParam = searchParams.get('materia_id') ?? ''
    const profesorMateriaId = searchParams.get('profesor_materia_id') ?? ''

    const admin = createAdminClient()

    if (materiaIdParam || profesorMateriaId) {
      const resolved = await resolveMateriaIdForProfesor(
        admin,
        { userId: session.userId, rol: session.perfil.rol },
        { materia_id: materiaIdParam, profesor_materia_id: profesorMateriaId }
      )
      if (!resolved.ok) {
        return NextResponse.json({ error: resolved.error }, { status: resolved.status })
      }

      const { data: examenes } = await admin
        .from('examenes')
        .select('*, preguntas:examen_preguntas(count)')
        .eq('materia_id', resolved.materiaId)
        .order('created_at', { ascending: false })

      return NextResponse.json({ examenes: examenes ?? [] })
    }

    let materiaIds: string[] = []
    if (session.perfil.rol === 'admin') {
      const { data } = await admin.from('examenes').select('materia_id')
      materiaIds = [...new Set((data ?? []).map((e) => e.materia_id))]
    } else {
      const { data } = await admin
        .from('profesor_materias')
        .select('materia_id')
        .eq('profesor_id', session.userId)
        .eq('activo', true)
      materiaIds = (data ?? []).map((pm) => pm.materia_id)
    }

    if (materiaIds.length === 0) {
      return NextResponse.json({ examenes: [] })
    }

    const { data: examenes } = await admin
      .from('examenes')
      .select('*')
      .in('materia_id', materiaIds)
      .order('created_at', { ascending: false })

    return NextResponse.json({ examenes: examenes ?? [] })
  } catch (error) {
    console.error('Examenes GET error:', error)
    return NextResponse.json({ error: 'Error al obtener exámenes' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getPerfilFromSession()
    if (
      !session ||
      (session.perfil.rol !== 'profesor' && session.perfil.rol !== 'admin')
    ) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const titulo = typeof body.titulo === 'string' ? body.titulo.trim() : ''
    const descripcion =
      typeof body.descripcion === 'string' ? body.descripcion.trim() || null : null
    const link_llamada =
      typeof body.link_llamada === 'string' ? body.link_llamada.trim() || null : null
    const tiempo_limite_minutos = Number(body.tiempo_limite_minutos ?? 60)
    const preguntas = parsePreguntas(body.preguntas)

    if (!titulo) {
      return NextResponse.json({ error: 'El título es requerido' }, { status: 400 })
    }
    if (!Number.isFinite(tiempo_limite_minutos) || tiempo_limite_minutos <= 0) {
      return NextResponse.json(
        { error: 'El tiempo límite debe ser mayor a 0 minutos' },
        { status: 400 }
      )
    }
    if (!preguntas || preguntas.length === 0) {
      return NextResponse.json(
        { error: 'Agrega al menos una pregunta con respuesta correcta' },
        { status: 400 }
      )
    }

    const admin = createAdminClient()
    const resolved = await resolveMateriaIdForProfesor(
      admin,
      { userId: session.userId, rol: session.perfil.rol },
      {
        materia_id: body.materia_id,
        profesor_materia_id: body.profesor_materia_id,
      }
    )

    if (!resolved.ok) {
      return NextResponse.json({ error: resolved.error }, { status: resolved.status })
    }

    const { data, error } = await admin
      .from('examenes')
      .insert({
        materia_id: resolved.materiaId,
        profesor_id: session.userId,
        titulo,
        descripcion,
        link_llamada,
        tiempo_limite_minutos,
        activo: true,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    try {
      await replacePreguntas(admin, data.id, preguntas)
    } catch (e) {
      await admin.from('examenes').delete().eq('id', data.id)
      const message = e instanceof Error ? e.message : 'Error al guardar preguntas'
      return NextResponse.json({ error: message }, { status: 400 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Examenes POST error:', error)
    return NextResponse.json({ error: 'Error al crear examen' }, { status: 500 })
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
    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 })
    }

    const admin = createAdminClient()
    const { data: examen } = await admin
      .from('examenes')
      .select('id, materia_id, profesor_id')
      .eq('id', id)
      .maybeSingle()

    if (!examen) {
      return NextResponse.json({ error: 'Examen no encontrado' }, { status: 404 })
    }

    if (
      session.perfil.rol === 'profesor' &&
      !(await profesorTieneMateria(admin, session.userId, examen.materia_id))
    ) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    const allowed = [
      'titulo',
      'descripcion',
      'link_llamada',
      'tiempo_limite_minutos',
      'activo',
    ] as const
    const updates: Record<string, unknown> = {}
    for (const field of allowed) {
      if (body[field] !== undefined) updates[field] = body[field]
    }

    const preguntas = parsePreguntas(body.preguntas)

    if (Object.keys(updates).length > 0) {
      const { error } = await admin.from('examenes').update(updates).eq('id', id)
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }
    }

    if (preguntas !== null) {
      if (preguntas.length === 0) {
        return NextResponse.json(
          { error: 'El examen debe tener al menos una pregunta' },
          { status: 400 }
        )
      }
      try {
        await replacePreguntas(admin, id, preguntas)
      } catch (e) {
        const message = e instanceof Error ? e.message : 'Error al actualizar preguntas'
        return NextResponse.json({ error: message }, { status: 400 })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Examenes PATCH error:', error)
    return NextResponse.json({ error: 'Error al actualizar examen' }, { status: 500 })
  }
}
