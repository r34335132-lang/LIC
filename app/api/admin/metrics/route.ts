import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getPerfilFromSession } from '@/lib/auth-server'

export async function GET() {
  try {
    const session = await getPerfilFromSession()
    if (!session || session.perfil.rol !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const admin = createAdminClient()

    const countOf = async (
      table: string,
      filters: Record<string, unknown> = {}
    ) => {
      let query = admin.from(table).select('id', { count: 'exact', head: true })
      for (const [key, value] of Object.entries(filters)) {
        query = query.eq(key, value)
      }
      const { count } = await query
      return count ?? 0
    }

    const [
      totalAlumnos,
      totalProfesores,
      inscripcionesPendientes,
      materiasCargadas,
      actividadesActivas,
    ] = await Promise.all([
      countOf('perfiles', { rol: 'alumno' }),
      countOf('perfiles', { rol: 'profesor' }),
      countOf('inscripciones', { estado: 'pendiente' }),
      countOf('materias'),
      countOf('actividades', { activo: true }),
    ])

    return NextResponse.json({
      totalAlumnos,
      totalProfesores,
      inscripcionesPendientes,
      materiasCargadas,
      actividadesActivas,
    })
  } catch (error) {
    console.error('Admin metrics error:', error)
    return NextResponse.json({ error: 'Error al obtener métricas' }, { status: 500 })
  }
}
