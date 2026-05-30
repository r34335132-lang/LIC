import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

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

    if (!nombreCompleto || !email || !programaId) {
      return NextResponse.json(
        { error: 'Nombre, email y programa son requeridos' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    const { data: existing } = await supabase
      .from('inscripciones')
      .select('id')
      .eq('email', email)
      .eq('programa_id', programaId)
      .eq('estado', 'pendiente')
      .maybeSingle()

    if (existing) {
      return NextResponse.json(
        { error: 'Ya existe una solicitud pendiente con este correo' },
        { status: 409 }
      )
    }

    const { error } = await supabase.from('inscripciones').insert({
      nombre_completo: nombreCompleto,
      email,
      telefono: telefono ?? null,
      programa_id: programaId,
      estado: 'pendiente',
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Inscripción error:', error)
    const message =
      error instanceof Error ? error.message : 'Error al registrar solicitud'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
