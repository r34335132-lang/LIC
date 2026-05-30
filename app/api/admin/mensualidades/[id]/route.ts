import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getPerfilFromSession } from '@/lib/auth-server'

const ALLOWED_ESTADOS = [
  'pendiente',
  'iniciado',
  'pagado',
  'vencido',
  'cancelado',
  'fallido',
] as const

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getPerfilFromSession()
    if (!session || session.perfil.rol !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const updates: Record<string, unknown> = {}

    if (body.estado !== undefined) {
      if (!ALLOWED_ESTADOS.includes(body.estado)) {
        return NextResponse.json({ error: 'Estado inválido' }, { status: 400 })
      }
      updates.estado = body.estado
      if (body.estado === 'pagado') {
        updates.paid_at = new Date().toISOString()
      }
    }

    if (body.monto !== undefined) {
      const monto = Number(body.monto)
      if (!monto || monto <= 0) {
        return NextResponse.json({ error: 'Monto inválido' }, { status: 400 })
      }
      updates.monto = monto
    }

    if (body.fecha_vencimiento !== undefined) {
      if (typeof body.fecha_vencimiento !== 'string') {
        return NextResponse.json(
          { error: 'fecha_vencimiento inválida' },
          { status: 400 }
        )
      }
      updates.fecha_vencimiento = body.fecha_vencimiento
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No hay campos para actualizar' },
        { status: 400 }
      )
    }

    const admin = createAdminClient()
    const { data, error } = await admin
      .from('mensualidades')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ mensualidad: data })
  } catch (error) {
    console.error('PATCH mensualidad error:', error)
    return NextResponse.json(
      { error: 'Error al actualizar mensualidad' },
      { status: 500 }
    )
  }
}
