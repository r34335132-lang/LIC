import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getPerfilFromSession, canAccessAlumno } from '@/lib/auth-server'
import {
  calcularCalificacionExamen,
  evaluarRespuesta,
  formatearTiempo,
} from '@/lib/examen-utils'

async function alumnoInscritoEnMateria(
  admin: ReturnType<typeof createAdminClient>,
  alumnoId: string,
  materiaId: string
) {
  const { data } = await admin
    .from('alumno_materias')
    .select('id')
    .eq('alumno_id', alumnoId)
    .eq('materia_id', materiaId)
    .maybeSingle()
  return !!data
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getPerfilFromSession()
    if (!session || !canAccessAlumno(session.perfil.rol)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id } = await params
    const admin = createAdminClient()

    const { data: examen } = await admin
      .from('examenes')
      .select('*, materia:materias(id, nombre, clave)')
      .eq('id', id)
      .eq('activo', true)
      .maybeSingle()

    if (!examen) {
      return NextResponse.json({ error: 'Examen no encontrado' }, { status: 404 })
    }

    if (!(await alumnoInscritoEnMateria(admin, session.userId, examen.materia_id))) {
      return NextResponse.json({ error: 'No estás inscrito en esta materia' }, { status: 403 })
    }

    const { data: preguntas } = await admin
      .from('examen_preguntas')
      .select('id, examen_id, texto, tipo, opciones, puntos, orden')
      .eq('examen_id', id)
      .order('orden', { ascending: true })

    const { data: intento } = await admin
      .from('examen_intentos')
      .select('*')
      .eq('examen_id', id)
      .eq('alumno_id', session.userId)
      .maybeSingle()

    let resultado = null
    if (intento && (intento.estado === 'finalizado' || intento.estado === 'revisado')) {
      const { data: respuestas } = await admin
        .from('examen_respuestas')
        .select(
          'id, pregunta_id, respuesta_alumno, es_correcta, puntos_obtenidos, puntos_maximos, corregido_manual, nota_profesor, pregunta:examen_preguntas(texto, tipo, opciones, respuesta_correcta)'
        )
        .eq('intento_id', intento.id)

      resultado = {
        intento,
        tiempo_formateado: formatearTiempo(intento.tiempo_usado_segundos),
        respuestas: respuestas ?? [],
      }
    }

    return NextResponse.json({
      examen: {
        id: examen.id,
        titulo: examen.titulo,
        descripcion: examen.descripcion,
        link_llamada: examen.link_llamada,
        tiempo_limite_minutos: examen.tiempo_limite_minutos,
        materia: examen.materia,
      },
      preguntas: preguntas ?? [],
      intento: intento ?? null,
      resultado,
    })
  } catch (error) {
    console.error('Dashboard examen GET error:', error)
    return NextResponse.json({ error: 'Error al obtener examen' }, { status: 500 })
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getPerfilFromSession()
    if (!session || !canAccessAlumno(session.perfil.rol)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id: examenId } = await params
    const body = await request.json()
    const accion = typeof body.accion === 'string' ? body.accion : ''

    const admin = createAdminClient()

    const { data: examen } = await admin
      .from('examenes')
      .select('*')
      .eq('id', examenId)
      .eq('activo', true)
      .maybeSingle()

    if (!examen) {
      return NextResponse.json({ error: 'Examen no encontrado' }, { status: 404 })
    }

    if (!(await alumnoInscritoEnMateria(admin, session.userId, examen.materia_id))) {
      return NextResponse.json({ error: 'No estás inscrito en esta materia' }, { status: 403 })
    }

    if (accion === 'iniciar') {
      const { data: existing } = await admin
        .from('examen_intentos')
        .select('*')
        .eq('examen_id', examenId)
        .eq('alumno_id', session.userId)
        .maybeSingle()

      if (existing) {
        if (existing.estado !== 'en_progreso') {
          return NextResponse.json(
            { error: 'Ya completaste este examen', intento: existing },
            { status: 400 }
          )
        }
        return NextResponse.json({ intento: existing })
      }

      const { data: intento, error } = await admin
        .from('examen_intentos')
        .insert({
          examen_id: examenId,
          alumno_id: session.userId,
          estado: 'en_progreso',
        })
        .select()
        .single()

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }

      return NextResponse.json({ intento })
    }

    if (accion === 'entregar') {
      const respuestasInput = body.respuestas
      if (!Array.isArray(respuestasInput) || respuestasInput.length === 0) {
        return NextResponse.json({ error: 'Respuestas requeridas' }, { status: 400 })
      }

      const { data: intento } = await admin
        .from('examen_intentos')
        .select('*')
        .eq('examen_id', examenId)
        .eq('alumno_id', session.userId)
        .maybeSingle()

      if (!intento) {
        return NextResponse.json({ error: 'Debes iniciar el examen primero' }, { status: 400 })
      }

      if (intento.estado !== 'en_progreso') {
        return NextResponse.json({ error: 'Este examen ya fue entregado' }, { status: 400 })
      }

      const iniciadoAt = new Date(intento.iniciado_at).getTime()
      const limiteMs = examen.tiempo_limite_minutos * 60 * 1000
      const ahora = Date.now()
      const tiempoUsado = Math.min(
        Math.floor((ahora - iniciadoAt) / 1000),
        Math.ceil(limiteMs / 1000)
      )

      if (ahora - iniciadoAt > limiteMs + 5000) {
        return NextResponse.json(
          { error: 'Se agotó el tiempo del examen' },
          { status: 400 }
        )
      }

      const { data: preguntas } = await admin
        .from('examen_preguntas')
        .select('*')
        .eq('examen_id', examenId)
        .order('orden', { ascending: true })

      const preguntaMap = new Map((preguntas ?? []).map((p) => [p.id, p]))
      let puntosObtenidos = 0
      let puntosTotales = 0
      const respuestasRows: Record<string, unknown>[] = []

      for (const item of respuestasInput) {
        if (!item || typeof item !== 'object') continue
        const r = item as Record<string, unknown>
        const preguntaId = typeof r.pregunta_id === 'string' ? r.pregunta_id : ''
        const respuestaAlumno =
          typeof r.respuesta === 'string' ? r.respuesta.trim() : ''
        const pregunta = preguntaMap.get(preguntaId)
        if (!pregunta) continue

        const puntosMax = Number(pregunta.puntos)
        puntosTotales += puntosMax
        const esCorrecta = evaluarRespuesta(
          {
            tipo: pregunta.tipo,
            respuesta_correcta: pregunta.respuesta_correcta,
            opciones: pregunta.opciones as string[] | null,
          },
          respuestaAlumno
        )
        const puntos = esCorrecta ? puntosMax : 0
        puntosObtenidos += puntos

        respuestasRows.push({
          intento_id: intento.id,
          pregunta_id: preguntaId,
          respuesta_alumno: respuestaAlumno || null,
          es_correcta: esCorrecta,
          puntos_obtenidos: puntos,
          puntos_maximos: puntosMax,
          corregido_manual: false,
        })
      }

      await admin.from('examen_respuestas').delete().eq('intento_id', intento.id)
      if (respuestasRows.length > 0) {
        const { error: respError } = await admin
          .from('examen_respuestas')
          .insert(respuestasRows)
        if (respError) {
          return NextResponse.json({ error: respError.message }, { status: 400 })
        }
      }

      const calificacion = calcularCalificacionExamen(puntosObtenidos, puntosTotales)
      const finalizadoAt = new Date().toISOString()

      const { data: intentoFinal, error: updError } = await admin
        .from('examen_intentos')
        .update({
          finalizado_at: finalizadoAt,
          tiempo_usado_segundos: tiempoUsado,
          puntos_obtenidos: puntosObtenidos,
          puntos_totales: puntosTotales,
          calificacion,
          estado: 'finalizado',
        })
        .eq('id', intento.id)
        .select()
        .single()

      if (updError) {
        return NextResponse.json({ error: updError.message }, { status: 400 })
      }

      return NextResponse.json({
        intento: intentoFinal,
        desglose: {
          tiempo_usado_segundos: tiempoUsado,
          tiempo_formateado: formatearTiempo(tiempoUsado),
          puntos_obtenidos: puntosObtenidos,
          puntos_totales: puntosTotales,
          calificacion,
          respuestas: respuestasRows,
        },
      })
    }

    return NextResponse.json({ error: 'Acción no válida' }, { status: 400 })
  } catch (error) {
    console.error('Dashboard examen POST error:', error)
    return NextResponse.json({ error: 'Error al procesar examen' }, { status: 500 })
  }
}
