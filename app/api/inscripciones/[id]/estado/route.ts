import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { inscripcionApartadoPagado } from '@/lib/inscripciones-pago'
import { montoApartadoInscripcion } from '@/lib/inscripciones-checkout'

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    if (!UUID_PATTERN.test(id)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
    }

    const admin = createAdminClient()
    const { data, error } = await admin
      .from('inscripciones')
      .select('id, estado, estado_pago, apartado_pagado_at, apartado_monto')
      .eq('id', id)
      .maybeSingle()

    if (error || !data) {
      return NextResponse.json({ error: 'Inscripción no encontrada' }, { status: 404 })
    }

    return NextResponse.json({
      id: data.id,
      estado: data.estado,
      estado_pago: data.estado_pago,
      apartado: inscripcionApartadoPagado(data),
      apartado_pagado_at: data.apartado_pagado_at,
      monto: data.apartado_monto ?? montoApartadoInscripcion(),
    })
  } catch (error) {
    console.error('Estado inscripción error:', error)
    return NextResponse.json({ error: 'Error al consultar estado' }, { status: 500 })
  }
}
