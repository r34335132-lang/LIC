import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getPerfilFromSession } from '@/lib/auth-server'
import { profesorTieneMateria } from '@/lib/profesor-materias'
import { calcularCalificacionExamen } from '@/lib/examen-utils'

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
    const respuestaId = typeof body.id === 'string' ? body.id : ''
    const es_correcta = body.es_correcta
    const puntos_obtenidos =
      body.puntos_obtenidos !== undefined ? Number(body.puntos_obtenidos) : undefined
    const nota_profesor =
      typeof body.nota_profesor === 'string' ? body.nota_profesor.trim() : undefined

    if (!respuestaId) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 })
    }

    const admin = createAdminClient()

    const { data: respuesta } = await admin
      .from('examen_respuestas')
      .select('*, intento:examen_intentos(*, examen:examenes(materia_id))')
      .eq('id', respuestaId)
      .maybeSingle()

    if (!respuesta) {
      return NextResponse.json({ error: 'Respuesta no encontrada' }, { status: 404 })
    }

    const materiaId = (
      respuesta.intento as { examen: { materia_id: string } }
    )?.examen?.materia_id

    if (
      session.perfil.rol === 'profesor' &&
      materiaId &&
      !(await profesorTieneMateria(admin, session.userId, materiaId))
    ) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    const updates: Record<string, unknown> = { corregido_manual: true }
    if (typeof es_correcta === 'boolean') updates.es_correcta = es_correcta
    if (puntos_obtenidos !== undefined) {
      if (!Number.isFinite(puntos_obtenidos) || puntos_obtenidos < 0) {
        return NextResponse.json({ error: 'Puntos inválidos' }, { status: 400 })
      }
      if (puntos_obtenidos > respuesta.puntos_maximos) {
        return NextResponse.json(
          { error: `Los puntos no pueden superar ${respuesta.puntos_maximos}` },
          { status: 400 }
        )
      }
      updates.puntos_obtenidos = puntos_obtenidos
      updates.es_correcta = puntos_obtenidos >= respuesta.puntos_maximos
    }
    if (nota_profesor !== undefined) updates.nota_profesor = nota_profesor || null

    const { error } = await admin
      .from('examen_respuestas')
      .update(updates)
      .eq('id', respuestaId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    const intentoId = respuesta.intento_id as string
    const { data: todasRespuestas } = await admin
      .from('examen_respuestas')
      .select('puntos_obtenidos, puntos_maximos')
      .eq('intento_id', intentoId)

    const ptsObtenidos = (todasRespuestas ?? []).reduce(
      (sum, r) => sum + Number(r.puntos_obtenidos ?? 0),
      0
    )
    const ptsTotales = (todasRespuestas ?? []).reduce(
      (sum, r) => sum + Number(r.puntos_maximos ?? 0),
      0
    )
    const calificacion = calcularCalificacionExamen(ptsObtenidos, ptsTotales)

    await admin
      .from('examen_intentos')
      .update({
        puntos_obtenidos: ptsObtenidos,
        puntos_totales: ptsTotales,
        calificacion,
        estado: 'revisado',
      })
      .eq('id', intentoId)

    return NextResponse.json({
      success: true,
      puntos_obtenidos: ptsObtenidos,
      puntos_totales: ptsTotales,
      calificacion,
    })
  } catch (error) {
    console.error('Examen respuesta PATCH error:', error)
    return NextResponse.json({ error: 'Error al corregir respuesta' }, { status: 500 })
  }
}
