import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getPerfilFromSession } from '@/lib/auth-server'
import { resolverEstadoMensualidad } from '@/lib/academico-utils'
import type { Mensualidad } from '@/types/database'

export async function GET() {
  try {
    const session = await getPerfilFromSession()
    if (!session || session.perfil.rol !== 'alumno') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const admin = createAdminClient()
    const { data, error } = await admin
      .from('mensualidades')
      .select('*')
      .eq('alumno_id', session.userId)
      .order('anio', { ascending: false })
      .order('mes', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    const mensualidades = ((data ?? []) as Mensualidad[]).map((m) => ({
      ...m,
      estadoEfectivo: resolverEstadoMensualidad(m.estado, m.fecha_vencimiento),
    }))

    const actual =
      mensualidades.find(
        (m) => m.estadoEfectivo !== 'pagado' && m.estado !== 'cancelado'
      ) ?? mensualidades[0] ?? null

    return NextResponse.json({ mensualidades, actual })
  } catch (error) {
    console.error('Dashboard pagos error:', error)
    return NextResponse.json({ error: 'Error al obtener pagos' }, { status: 500 })
  }
}
