import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getPerfilFromSession } from '@/lib/auth-server'
import { resolveMateriaIdForProfesor } from '@/lib/profesor-materias'
import { parseCriterios } from '@/lib/examen-utils'

async function replaceCriterios(
  admin: ReturnType<typeof createAdminClient>,
  rubricaId: string,
  criterios: ReturnType<typeof parseCriterios> extends infer T ? NonNullable<T> : never
) {
  await admin.from('materia_rubrica_criterios').delete().eq('rubrica_id', rubricaId)
  if (criterios.length === 0) return

  const { error } = await admin.from('materia_rubrica_criterios').insert(
    criterios.map((c, index) => ({
      rubrica_id: rubricaId,
      nombre: c.nombre,
      descripcion: c.descripcion,
      peso: c.peso,
      tipo: c.tipo,
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
    const resolved = await resolveMateriaIdForProfesor(
      admin,
      { userId: session.userId, rol: session.perfil.rol },
      { materia_id: materiaIdParam, profesor_materia_id: profesorMateriaId }
    )

    if (!resolved.ok) {
      return NextResponse.json({ error: resolved.error }, { status: resolved.status })
    }

    const { data: rubrica } = await admin
      .from('materia_rubricas')
      .select('*')
      .eq('materia_id', resolved.materiaId)
      .maybeSingle()

    if (!rubrica) {
      return NextResponse.json({ rubrica: null, criterios: [] })
    }

    const { data: criterios } = await admin
      .from('materia_rubrica_criterios')
      .select('*')
      .eq('rubrica_id', rubrica.id)
      .order('orden', { ascending: true })

    return NextResponse.json({ rubrica, criterios: criterios ?? [] })
  } catch (error) {
    console.error('Rubricas GET error:', error)
    return NextResponse.json({ error: 'Error al obtener rúbrica' }, { status: 500 })
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
    const titulo = typeof body.titulo === 'string' ? body.titulo.trim() : 'Rúbrica de calificación'
    const descripcion =
      typeof body.descripcion === 'string' ? body.descripcion.trim() || null : null
    const criterios = parseCriterios(body.criterios)

    if (!criterios || criterios.length === 0) {
      return NextResponse.json(
        { error: 'Agrega al menos un criterio con nombre y peso' },
        { status: 400 }
      )
    }

    const pesoTotal = criterios.reduce((sum, c) => sum + c.peso, 0)
    if (Math.abs(pesoTotal - 100) > 0.01) {
      return NextResponse.json(
        { error: `Los pesos deben sumar 100% (actual: ${pesoTotal}%)` },
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

    const profesorId = session.userId

    const { data: existing } = await admin
      .from('materia_rubricas')
      .select('id')
      .eq('materia_id', resolved.materiaId)
      .eq('profesor_id', profesorId)
      .maybeSingle()

    let rubricaId: string

    if (existing) {
      const { error } = await admin
        .from('materia_rubricas')
        .update({ titulo, descripcion, activo: true })
        .eq('id', existing.id)
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }
      rubricaId = existing.id
    } else {
      const { data, error } = await admin
        .from('materia_rubricas')
        .insert({
          materia_id: resolved.materiaId,
          profesor_id: profesorId,
          titulo,
          descripcion,
          activo: true,
        })
        .select()
        .single()
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }
      rubricaId = data.id
    }

    try {
      await replaceCriterios(admin, rubricaId, criterios)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Error al guardar criterios'
      return NextResponse.json({ error: message }, { status: 400 })
    }

    return NextResponse.json({ success: true, rubrica_id: rubricaId })
  } catch (error) {
    console.error('Rubricas POST error:', error)
    return NextResponse.json({ error: 'Error al guardar rúbrica' }, { status: 500 })
  }
}
