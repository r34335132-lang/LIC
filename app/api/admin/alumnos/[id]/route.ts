import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getPerfilFromSession } from '@/lib/auth-server'
import { getProgramaIdCandidates, normalizeProgramaId } from '@/lib/programa-utils'
import type { AlumnoMateria, Materia, Perfil } from '@/types/database'

type AlumnoMateriaRow = AlumnoMateria & { materia: Materia | null }

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getPerfilFromSession()
    if (!session || session.perfil.rol !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id } = await params
    const admin = createAdminClient()

    const { data: alumno, error: alumnoError } = await admin
      .from('perfiles')
      .select('*')
      .eq('id', id)
      .single()

    if (alumnoError || !alumno) {
      return NextResponse.json({ error: 'Alumno no encontrado' }, { status: 404 })
    }

    const programaId = normalizeProgramaId((alumno as Perfil).programa_id)
    const programaCandidates = getProgramaIdCandidates((alumno as Perfil).programa_id)
    let materiasPlan: Materia[] = []

    if (programaId) {
      const { data: materiasData, error: materiasError } = await admin
        .from('materias')
        .select(
          'id, programa_id, periodo, nombre_periodo, nombre, clave, seriacion, horas_docente, horas_independientes, creditos, instalacion, created_at'
        )
        .in('programa_id', programaCandidates)
        .order('periodo', { ascending: true })
        .order('clave', { ascending: true })

      if (materiasError) {
        return NextResponse.json({ error: materiasError.message }, { status: 400 })
      }

      materiasPlan = (materiasData ?? []) as Materia[]
    }

    const { data: existingMaterias, error: existingError } = await admin
      .from('alumno_materias')
      .select('materia_id')
      .eq('alumno_id', id)

    if (existingError) {
      return NextResponse.json({ error: existingError.message }, { status: 400 })
    }

    const existingIds = new Set((existingMaterias ?? []).map((m) => m.materia_id as string))
    const missingRows = materiasPlan
      .filter((materia) => !existingIds.has(materia.id))
      .map((materia) => ({
        alumno_id: id,
        materia_id: materia.id,
        estado: 'pendiente',
        calificacion: null,
      }))

    if (missingRows.length > 0) {
      const { error: insertError } = await admin
        .from('alumno_materias')
        .upsert(missingRows, { onConflict: 'alumno_id,materia_id', ignoreDuplicates: true })

      if (insertError) {
        return NextResponse.json({ error: insertError.message }, { status: 400 })
      }
    }

    const { data: materias, error: matError } = await admin
      .from('alumno_materias')
      .select('*, materia:materias(*)')
      .eq('alumno_id', id)

    if (matError) {
      return NextResponse.json({ error: matError.message }, { status: 400 })
    }

    const sortedMaterias = ((materias ?? []) as AlumnoMateriaRow[]).sort((a, b) => {
      const pa = a.materia?.periodo ?? 0
      const pb = b.materia?.periodo ?? 0
      if (pa !== pb) return pa - pb
      return (a.materia?.clave ?? '').localeCompare(b.materia?.clave ?? '', 'es')
    })

    return NextResponse.json({
      alumno,
      materias: sortedMaterias,
    })
  } catch (error) {
    console.error('Admin alumno detail GET error:', error)
    return NextResponse.json(
      { error: 'Error al obtener alumno' },
      { status: 500 }
    )
  }
}
