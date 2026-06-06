import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getPerfilFromSession } from '@/lib/auth-server'
import {
  ClipApiError,
  buildMensualidadClipReference,
  createClipCheckout,
  getClipConfiguration,
} from '@/lib/clip'
import type { Mensualidad } from '@/types/database'

export const runtime = 'nodejs'

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

type PaymentContext = {
  paymentId: string | null
  alumnoId: string | null
  estado: string | null
  monto: number | null
}

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  let context: PaymentContext = {
    paymentId: null,
    alumnoId: null,
    estado: null,
    monto: null,
  }

  try {
    const session = await getPerfilFromSession()
    if (!session || session.perfil.rol !== 'alumno') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id } = await params
    context = {
      ...context,
      paymentId: id ?? null,
      alumnoId: session.userId,
    }

    if (!id || !UUID_PATTERN.test(id)) {
      console.error('Pagar mensualidad inválida:', context)
      return NextResponse.json(
        { error: 'El id de la mensualidad no es un UUID válido' },
        { status: 400 }
      )
    }

    const admin = createAdminClient()
    const { data: mensualidad, error: fetchError } = await admin
      .from('mensualidades')
      .select('*')
      .eq('id', id)
      .eq('alumno_id', session.userId)
      .maybeSingle()

    if (fetchError) {
      console.error('Pagar mensualidad consulta error:', {
        ...context,
        error: fetchError.message,
      })
      return NextResponse.json(
        { error: 'No se pudo consultar la mensualidad' },
        { status: 500 }
      )
    }

    if (!mensualidad) {
      const { data: existingPayment } = await admin
        .from('mensualidades')
        .select('id, alumno_id')
        .eq('id', id)
        .maybeSingle()

      console.error('Pagar mensualidad no encontrada o ajena:', {
        ...context,
        exists: Boolean(existingPayment),
        belongsToAlumno: existingPayment?.alumno_id === session.userId,
      })
      return NextResponse.json(
        { error: 'Mensualidad no encontrada' },
        { status: 404 }
      )
    }

    const m = mensualidad as Mensualidad
    const amount = Number(m.monto)
    const currency = (m.moneda || 'MXN').trim().toUpperCase()
    context = {
      paymentId: m.id,
      alumnoId: session.userId,
      estado: m.estado,
      monto: Number.isFinite(amount) ? amount : null,
    }

    if (m.estado === 'pagado') {
      return NextResponse.json(
        { error: 'Esta mensualidad ya está pagada' },
        { status: 400 }
      )
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      console.error('Pagar mensualidad con monto inválido:', context)
      return NextResponse.json(
        { error: 'La mensualidad tiene un monto inválido' },
        { status: 400 }
      )
    }

    if (currency !== 'MXN') {
      console.error('Pagar mensualidad con moneda inválida:', {
        ...context,
        moneda: currency,
      })
      return NextResponse.json(
        { error: 'La moneda de la mensualidad debe ser MXN' },
        { status: 400 }
      )
    }

    getClipConfiguration()

    const reference = buildMensualidadClipReference(m.id)
    const checkout = await createClipCheckout({
      amount,
      currency: 'MXN',
      description: `${m.concepto} - ${m.periodo}`,
      reference,
      customerEmail: session.perfil.email ?? undefined,
      customerName: session.perfil.nombre_completo ?? undefined,
    })

    const { error: updateError } = await admin
      .from('mensualidades')
      .update({
        estado: 'iniciado',
        clip_checkout_url: checkout.payment_request_url,
        clip_reference: reference,
        clip_payment_id: checkout.payment_request_id,
      })
      .eq('id', id)
      .eq('alumno_id', session.userId)

    if (updateError) {
      console.error('Pagar mensualidad actualización error:', {
        ...context,
        error: updateError.message,
      })
      return NextResponse.json(
        { error: 'El checkout se creó, pero no se pudo guardar en la mensualidad' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      checkoutUrl: checkout.payment_request_url,
    })
  } catch (error) {
    console.error('[PAGAR_ERROR]', error)

    if (error instanceof ClipApiError) {
      const { status, message, detail, body, sanitizedPayload } = error.clip
      console.error('[PAGAR_ERROR] Clip', {
        ...context,
        clip: { status, message, detail, body, sanitizedPayload },
      })

      const httpStatus = status >= 400 && status < 500 ? 400 : 500

      return NextResponse.json(
        {
          error: message,
          detail: detail ?? message,
          clip: { status, message, detail },
        },
        { status: httpStatus }
      )
    }

    const detail = error instanceof Error ? error.message : String(error)
    return NextResponse.json(
      {
        error: 'Error interno al iniciar el pago',
        detail,
      },
      { status: 500 }
    )
  }
}
