import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getPerfilFromSession } from '@/lib/auth-server'

export async function POST(request: Request) {
  try {
    const session = await getPerfilFromSession()
    if (!session || session.perfil.rol !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const programa_id = typeof body.programa_id === 'string' ? body.programa_id : ''
    const periodo = Number(body.periodo)
    const grupo = typeof body.grupo === 'string' ? body.grupo.trim() : ''
    const periodo_escolar =
      typeof body.periodo_escolar === 'string' ? body.periodo_escolar.trim() : ''
    const profesor_id =
      typeof body.profesor_id === 'string' ? body.profesor_id.trim() : ''

    if (!programa_id || !periodo || !grupo || !periodo_escolar) {
      return NextResponse.json(
        {
          error:
            'programa_id, periodo (cuatrimestre), grupo y periodo_escolar son requeridos',
        },
        { status: 400 }
      )
    }

    if (!profesor_id) {
      return NextResponse.json(
        { error: 'El profesor es obligatorio para crear clases' },
        { status: 400 }
      )
    }

    const admin = createAdminClient()

    const [{ data: prof }, { data: materias, error: matError }] = await Promise.all([
      admin.from('perfiles').select('id, rol').eq('id', profesor_id).maybeSingle(),
      admin
        .from('materias')
        .select('id, nombre')
        .eq('programa_id', programa_id)
        .eq('periodo', periodo)
        .order('nombre'),
    ])

    if (!prof || prof.rol !== 'profesor') {
      return NextResponse.json({ error: 'Profesor no válido' }, { status: 400 })
    }
    if (matError) {
      return NextResponse.json({ error: matError.message }, { status: 400 })
    }
    if (!materias?.length) {
      return NextResponse.json(
        { error: 'No hay materias para ese programa y cuatrimestre' },
        { status: 404 }
      )
    }

    const materiaIds = materias.map((m) => m.id)
    const { data: existing } = await admin
      .from('profesor_materias')
      .select('materia_id')
      .eq('profesor_id', profesor_id)
      .eq('grupo', grupo)
      .eq('periodo_escolar', periodo_escolar)
      .in('materia_id', materiaIds)

    const existingSet = new Set((existing ?? []).map((e) => e.materia_id))
    const toCreate = materias.filter((m) => !existingSet.has(m.id))

    if (toCreate.length === 0) {
      return NextResponse.json({
        success: true,
        created: 0,
        skipped: materias.length,
      })
    }

    const rows = toCreate.map((m) => ({
      profesor_id,
      materia_id: m.id,
      grupo,
      periodo_escolar,
      horario: body.horario?.trim() || null,
      aula: body.aula?.trim() || null,
      link_clase: body.link_clase?.trim() || null,
      link_classroom: body.link_classroom?.trim() || null,
      link_drive: body.link_drive?.trim() || null,
      descripcion: body.descripcion?.trim() || null,
      activo: true,
    }))

    const { error: insertError } = await admin.from('profesor_materias').insert(rows)

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      created: toCreate.length,
      skipped: materias.length - toCreate.length,
    })
  } catch (error) {
    console.error('Bulk clases error:', error)
    return NextResponse.json(
      { error: 'Error al crear clases masivamente' },
      { status: 500 }
    )
  }
}
