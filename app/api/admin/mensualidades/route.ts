import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getPerfilFromSession } from '@/lib/auth-server'
import { resolverEstadoMensualidad } from '@/lib/academico-utils'
import type { Mensualidad, Perfil } from '@/types/database'

export async function GET(request: Request) {
  try {
    const session = await getPerfilFromSession()
    if (!session || session.perfil.rol !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const estado = searchParams.get('estado')

    const admin = createAdminClient()
    let query = admin
      .from('mensualidades')
      .select('*')
      .order('anio', { ascending: false })
      .order('mes', { ascending: false })

    if (estado && estado !== 'todos') {
      query = query.eq('estado', estado)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    const mensualidades = (data ?? []) as Mensualidad[]
    const alumnoIds = [...new Set(mensualidades.map((m) => m.alumno_id))]

    const { data: perfiles } = await admin
      .from('perfiles')
      .select('id, nombre_completo, email, matricula')
      .in('id', alumnoIds.length ? alumnoIds : ['00000000-0000-0000-0000-000000000000'])

    const alumnoMap = new Map(
      (perfiles ?? []).map((p) => [p.id, p as Pick<Perfil, 'id' | 'nombre_completo' | 'email' | 'matricula'>])
    )

    const rows = mensualidades.map((m) => ({
      ...m,
      estadoEfectivo: resolverEstadoMensualidad(m.estado, m.fecha_vencimiento),
      alumno: alumnoMap.get(m.alumno_id) ?? null,
    }))

    return NextResponse.json({ mensualidades: rows })
  } catch (error) {
    console.error('Admin mensualidades GET error:', error)
    return NextResponse.json(
      { error: 'Error al obtener mensualidades' },
      { status: 500 }
    )
  }
}
