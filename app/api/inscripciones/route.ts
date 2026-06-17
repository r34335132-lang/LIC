import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { montoApartadoInscripcion } from '@/lib/inscripciones-checkout'
import { getProgramaIdCandidates, normalizeProgramaId } from '@/lib/programa-utils'

interface InscripcionBody {
  nombreCompleto: string
  email: string
  telefono?: string
  programaId: string
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as InscripcionBody
    const { nombreCompleto, email, telefono, programaId } = body
    const normalizedProgramaId = normalizeProgramaId(programaId)
    const programaCandidates = getProgramaIdCandidates(programaId)

    if (!nombreCompleto || !email || !normalizedProgramaId) {
      return NextResponse.json(
        { error: 'Nombre, email y programa son requeridos' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    const { data: programa } = await supabase
      .from('programas')
      .select('id, nombre')
      .in('id', programaCandidates)
      .eq('activo', true)
      .limit(1)
      .maybeSingle()

    if (!programa) {
      return NextResponse.json(
        { error: 'Programa no válido o no disponible' },
        { status: 400 }
      )
    }

    const { data: existing } = await supabase
      .from('inscripciones')
      .select('id, estado, estado_pago, apartado_pagado_at')
      .eq('email', email.trim().toLowerCase())
      .eq('programa_id', programa.id)
      .in('estado', ['pendiente', 'apartado'])
      .maybeSingle()

    if (existing) {
      const { error: updateError } = await supabase
        .from('inscripciones')
        .update({
          nombre_completo: nombreCompleto.trim(),
          telefono: telefono?.trim() ?? null,
        })
        .eq('id', existing.id)

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 400 })
      }

      return NextResponse.json({
        success: true,
        inscripcionId: existing.id,
        existing: true,
        monto: montoApartadoInscripcion(),
        apartado:
          existing.estado === 'apartado' ||
          existing.estado_pago === 'pagado' ||
          !!existing.apartado_pagado_at,
      })
    }

    const { data: inserted, error } = await supabase
      .from('inscripciones')
      .insert({
        nombre_completo: nombreCompleto.trim(),
        email: email.trim().toLowerCase(),
        telefono: telefono?.trim() ?? null,
        programa_id: programa.id,
        estado: 'pendiente',
      })
      .select('id')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      inscripcionId: inserted.id,
      existing: false,
      apartado: false,
      monto: montoApartadoInscripcion(),
    })
  } catch (error) {
    console.error('Inscripción error:', error)
    const message =
      error instanceof Error ? error.message : 'Error al registrar solicitud'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
