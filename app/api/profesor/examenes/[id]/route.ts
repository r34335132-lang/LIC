import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getPerfilFromSession } from '@/lib/auth-server'
import { profesorTieneMateria } from '@/lib/profesor-materias'

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

    const { id } = await params
    const admin = createAdminClient()

    const { data: examen, error } = await admin
      .from('examenes')
      .select('*, materia:materias(id, nombre, clave)')
      .eq('id', id)
      .maybeSingle()

    if (error || !examen) {
      return NextResponse.json({ error: 'Examen no encontrado' }, { status: 404 })
    }

    if (
      session.perfil.rol === 'profesor' &&
      !(await profesorTieneMateria(admin, session.userId, examen.materia_id))
    ) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    const [{ data: preguntas }, { data: intentos }] = await Promise.all([
      admin
        .from('examen_preguntas')
        .select('*')
        .eq('examen_id', id)
        .order('orden', { ascending: true }),
      admin
        .from('examen_intentos')
        .select(
          '*, alumno:perfiles!examen_intentos_alumno_id_fkey(id, nombre_completo, matricula, email)'
        )
        .eq('examen_id', id)
        .order('finalizado_at', { ascending: false }),
    ])

    const intentoIds = (intentos ?? []).map((i) => i.id)
    let respuestas: Record<string, unknown>[] = []

    if (intentoIds.length > 0) {
      const { data: respData } = await admin
        .from('examen_respuestas')
        .select('*, pregunta:examen_preguntas(id, texto, respuesta_correcta, puntos)')
        .in('intento_id', intentoIds)
      respuestas = respData ?? []
    }

    const respuestasPorIntento = new Map<string, Record<string, unknown>[]>()
    for (const r of respuestas) {
      const intentoId = r.intento_id as string
      respuestasPorIntento.set(intentoId, [
        ...(respuestasPorIntento.get(intentoId) ?? []),
        r,
      ])
    }

    return NextResponse.json({
      examen,
      preguntas: preguntas ?? [],
      intentos: (intentos ?? []).map((intento) => ({
        ...intento,
        respuestas: respuestasPorIntento.get(intento.id) ?? [],
      })),
    })
  } catch (error) {
    console.error('Examen detail GET error:', error)
    return NextResponse.json({ error: 'Error al obtener examen' }, { status: 500 })
  }
}
