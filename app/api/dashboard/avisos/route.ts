import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getPerfilFromSession } from '@/lib/auth-server'
import type { Aviso } from '@/types/database'

export async function GET() {
  try {
    const session = await getPerfilFromSession()
    if (!session || session.perfil.rol !== 'alumno') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const admin = createAdminClient()
    const alumnoId = session.userId

    const { data: materiasAlumno, error: materiasError } = await admin
      .from('alumno_materias')
      .select('materia_id')
      .eq('alumno_id', alumnoId)

    if (materiasError) {
      return NextResponse.json({ error: materiasError.message }, { status: 400 })
    }

    const materiaIds = (materiasAlumno ?? []).map((m) => m.materia_id)

    const queries = [
      admin
        .from('avisos')
        .select('*, materia:materias(id, nombre, clave)')
        .eq('alumno_id', alumnoId)
        .eq('activo', true)
        .order('created_at', { ascending: false })
        .limit(50),
    ]

    if (materiaIds.length > 0) {
      queries.push(
        admin
          .from('avisos')
          .select('*, materia:materias(id, nombre, clave)')
          .in('materia_id', materiaIds)
          .eq('activo', true)
          .order('created_at', { ascending: false })
          .limit(50)
      )
    }

    const results = await Promise.all(queries)
    const firstError = results.find((r) => r.error)
    if (firstError?.error) {
      return NextResponse.json({ error: firstError.error.message }, { status: 400 })
    }

    const seen = new Set<string>()
    const merged: Aviso[] = []

    for (const result of results) {
      for (const row of result.data ?? []) {
        if (!seen.has(row.id)) {
          seen.add(row.id)
          merged.push(row as Aviso)
        }
      }
    }

    merged.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )

    const avisosSlice = merged.slice(0, 50)
    const profesorIds = [...new Set(avisosSlice.map((a) => a.profesor_id))]
    let profesoresMap: Record<string, string> = {}

    if (profesorIds.length > 0) {
      const { data: profesores } = await admin
        .from('perfiles')
        .select('id, nombre_completo, rol')
        .in('id', profesorIds)

      profesoresMap = Object.fromEntries(
        (profesores ?? []).map((p) => [
          p.id,
          p.rol === 'admin' ? 'Administración' : (p.nombre_completo ?? 'Profesor'),
        ])
      )
    }

    const avisos = avisosSlice.map((a) => ({
      ...a,
      profesor_nombre: profesoresMap[a.profesor_id] ?? 'Administración',
    }))

    return NextResponse.json({ avisos, total: avisos.length })
  } catch (error) {
    console.error('Dashboard avisos GET error:', error)
    return NextResponse.json({ error: 'Error al obtener avisos' }, { status: 500 })
  }
}
