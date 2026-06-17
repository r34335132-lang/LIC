import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getPerfilFromSession } from '@/lib/auth-server'

const ALLOWED_ESTADO_PAGO = ['pendiente', 'pagado', 'declinado', 'error'] as const

function parseDateInput(value: unknown): string | null | undefined {
  if (value === undefined) return undefined
  if (value === null || value === '') return null
  if (typeof value !== 'string') return undefined
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return undefined
  return d.toISOString()
}

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

    if (body.apartado_pagado_at !== undefined) {
      const paidAt = parseDateInput(body.apartado_pagado_at)
      if (paidAt === undefined) {
        return NextResponse.json({ error: 'apartado_pagado_at inválida' }, { status: 400 })
      }
      updates.apartado_pagado_at = paidAt
      if (paidAt && body.estado === undefined) {
        updates.estado = 'apartado'
      }
    }

    if (body.estado_pago !== undefined) {
      if (body.estado_pago !== null && !ALLOWED_ESTADO_PAGO.includes(body.estado_pago)) {
        return NextResponse.json({ error: 'estado_pago inválido' }, { status: 400 })
      }
      updates.estado_pago = body.estado_pago
      if (body.estado_pago === 'pagado' && body.estado === undefined) {
        updates.estado = 'apartado'
      }
    }

    if (body.apartado_monto !== undefined) {
      const monto = Number(body.apartado_monto)
      if (!monto || monto <= 0) {
        return NextResponse.json({ error: 'Monto inválido' }, { status: 400 })
      }
      updates.apartado_monto = monto
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No hay campos para actualizar' },
        { status: 400 }
      )
    }

    const admin = createAdminClient()
    const { data, error } = await admin
      .from('inscripciones')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ inscripcion: data })
  } catch (error) {
    console.error('PATCH inscripción error:', error)
    return NextResponse.json(
      { error: 'Error al actualizar inscripción' },
      { status: 500 }
    )
  }
}
