import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getPerfilFromSession } from '@/lib/auth-server'

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
    if (materiaIds.length === 0) {
      return NextResponse.json({ avisos: [], total: 0 })
    }

    const { data, error } = await admin
      .from('avisos')
      .select('*, materia:materias(id, nombre, clave)')
      .in('materia_id', materiaIds)
      .eq('activo', true)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    const profesorIds = [...new Set((data ?? []).map((a) => a.profesor_id))]
    let profesoresMap: Record<string, string> = {}
    if (profesorIds.length > 0) {
      const { data: profesores } = await admin
        .from('perfiles')
        .select('id, nombre_completo')
        .in('id', profesorIds)
      profesoresMap = Object.fromEntries(
        (profesores ?? []).map((p) => [p.id, p.nombre_completo ?? 'Profesor'])
      )
    }

    const avisos = (data ?? []).map((a) => ({
      ...a,
      profesor_nombre: profesoresMap[a.profesor_id] ?? 'Profesor',
    }))

    return NextResponse.json({ avisos, total: avisos.length })
  } catch (error) {
    console.error('Dashboard avisos GET error:', error)
    return NextResponse.json({ error: 'Error al obtener avisos' }, { status: 500 })
  }
}
