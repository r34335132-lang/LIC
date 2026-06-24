import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getPerfilFromSession } from '@/lib/auth-server'

const ESTADOS_SEGUIMIENTO = [
  'sin_contactar',
  'en_comunicacion',
  'interesado',
  'faltan_documentos',
  'documentos_completos',
  'listo_aprobar',
  'no_interesado',
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

    if (body.estado_seguimiento !== undefined) {
      if (!ESTADOS_SEGUIMIENTO.includes(body.estado_seguimiento)) {
        return NextResponse.json({ error: 'estado_seguimiento inválido' }, { status: 400 })
      }
      updates.estado_seguimiento = body.estado_seguimiento
    }

    if (body.notas_seguimiento !== undefined) {
      updates.notas_seguimiento =
        typeof body.notas_seguimiento === 'string'
          ? body.notas_seguimiento.trim() || null
          : null
    }

    if (body.apartado_pagado_at !== undefined) {
      const paidAt =
        body.apartado_pagado_at === null || body.apartado_pagado_at === ''
          ? null
          : new Date(body.apartado_pagado_at).toISOString()
      if (body.apartado_pagado_at && Number.isNaN(new Date(body.apartado_pagado_at).getTime())) {
        return NextResponse.json({ error: 'apartado_pagado_at inválida' }, { status: 400 })
      }
      updates.apartado_pagado_at = paidAt
      if (paidAt && body.estado === undefined) updates.estado = 'apartado'
    }

    if (body.estado_pago !== undefined) {
      const allowed = ['pendiente', 'pagado', 'declinado', 'error']
      if (body.estado_pago !== null && !allowed.includes(body.estado_pago)) {
        return NextResponse.json({ error: 'estado_pago inválido' }, { status: 400 })
      }
      updates.estado_pago = body.estado_pago
      if (body.estado_pago === 'pagado' && body.estado === undefined) {
        updates.estado = 'apartado'
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No hay campos para actualizar' }, { status: 400 })
    }

    const admin = createAdminClient()
    const { data, error } = await admin
      .from('inscripciones')
      .update(updates)
      .eq('id', id)
      .select('*, programa:programas(id, nombre)')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ inscripcion: data })
  } catch (error) {
    console.error('PATCH inscripción error:', error)
    return NextResponse.json({ error: 'Error al actualizar inscripción' }, { status: 500 })
  }
}
