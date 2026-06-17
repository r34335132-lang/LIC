import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  ClipApiError,
  createClipCheckout,
  getClipConfiguration,
} from '@/lib/clip'
import {
  buildInscripcionPaymentReference,
  buildInscripcionPaymentUpdate,
  inscripcionApartadoPagado,
} from '@/lib/inscripciones-pago'
import { montoApartadoInscripcion } from '@/lib/inscripciones-checkout'
import {
  MercadoPagoApiError,
  canReuseMercadoPagoCheckoutUrl,
  createMercadoPagoPreferenceForInscripcion,
} from '@/lib/mercadopago'
import type { MetodoPago } from '@/types/database'

export const runtime = 'nodejs'

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function parseMetodo(body: unknown): MetodoPago | null {
  if (!body || typeof body !== 'object') return 'mercado_pago'
  const metodo = (body as { metodo?: string }).metodo
  if (metodo === 'clip' || metodo === 'mercado_pago') return metodo
  if (!metodo) return 'mercado_pago'
  return null
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id || !UUID_PATTERN.test(id)) {
      return NextResponse.json({ error: 'ID de inscripción inválido' }, { status: 400 })
    }

    let body: unknown = null
    try {
      body = await request.json()
    } catch {
      body = null
    }

    const metodo = parseMetodo(body)
    if (!metodo) {
      return NextResponse.json(
        { error: 'metodo debe ser mercado_pago o clip' },
        { status: 400 }
      )
    }

    const admin = createAdminClient()
    const { data: inscripcion, error: fetchError } = await admin
      .from('inscripciones')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (fetchError || !inscripcion) {
      return NextResponse.json({ error: 'Inscripción no encontrada' }, { status: 404 })
    }

    if (inscripcion.estado === 'aprobada' || inscripcion.estado === 'rechazada') {
      return NextResponse.json(
        { error: 'Esta inscripción ya fue procesada' },
        { status: 400 }
      )
    }

    if (inscripcionApartadoPagado(inscripcion)) {
      return NextResponse.json({
        success: true,
        alreadyPaid: true,
        mensaje: 'Tu lugar ya está apartado con pago confirmado',
      })
    }

    const amount = montoApartadoInscripcion()

    if (metodo === 'mercado_pago') {
      if (
        inscripcion.mp_checkout_url &&
        inscripcion.metodo_pago === 'mercado_pago' &&
        inscripcion.estado_pago === 'pendiente' &&
        canReuseMercadoPagoCheckoutUrl(inscripcion.mp_checkout_url)
      ) {
        return NextResponse.json({
          success: true,
          checkoutUrl: inscripcion.mp_checkout_url,
          metodo: 'mercado_pago',
        })
      }

      const preference = await createMercadoPagoPreferenceForInscripcion({
        inscripcionId: inscripcion.id,
        title: `Apartado — ${inscripcion.nombre_completo}`,
        amount,
        payerEmail: inscripcion.email,
      })

      const { error: updateError } = await admin
        .from('inscripciones')
        .update(
          buildInscripcionPaymentUpdate({
            metodo_pago: 'mercado_pago',
            estado_pago: 'pendiente',
            pago_error_mensaje: null,
            apartado_monto: amount,
            mp_checkout_url: preference.checkoutUrl,
            mp_reference: preference.reference,
            mp_preference_id: preference.preferenceId,
          })
        )
        .eq('id', inscripcion.id)

      if (updateError) {
        return NextResponse.json(
          { error: 'No se pudo guardar el checkout de Mercado Pago' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        checkoutUrl: preference.checkoutUrl,
        metodo: 'mercado_pago',
      })
    }

    getClipConfiguration()

    if (
      inscripcion.clip_checkout_url &&
      inscripcion.metodo_pago === 'clip' &&
      inscripcion.estado_pago === 'pendiente'
    ) {
      return NextResponse.json({
        success: true,
        checkoutUrl: inscripcion.clip_checkout_url,
        metodo: 'clip',
      })
    }

    const reference = buildInscripcionPaymentReference(inscripcion.id)
    const checkout = await createClipCheckout({
      amount,
      currency: 'MXN',
      description: `Apartado de lugar — ${inscripcion.nombre_completo}`,
      reference,
      customerEmail: inscripcion.email,
      customerName: inscripcion.nombre_completo,
      returnUrls: {
        success: 'inscripcion',
        error: 'inscripcion',
        inscripcionId: inscripcion.id,
      },
    })

    const { error: updateError } = await admin
      .from('inscripciones')
      .update(
        buildInscripcionPaymentUpdate({
          metodo_pago: 'clip',
          estado_pago: 'pendiente',
          pago_error_mensaje: null,
          apartado_monto: amount,
          clip_checkout_url: checkout.payment_request_url,
          clip_reference: reference,
          clip_payment_id: checkout.payment_request_id,
        })
      )
      .eq('id', inscripcion.id)

    if (updateError) {
      return NextResponse.json(
        { error: 'El checkout se creó, pero no se pudo guardar' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      checkoutUrl: checkout.payment_request_url,
      metodo: 'clip',
    })
  } catch (error) {
    console.error('[INSCRIPCION PAGAR]', error)

    if (error instanceof MercadoPagoApiError) {
      return NextResponse.json({ error: error.message }, { status: 502 })
    }
    if (error instanceof ClipApiError) {
      return NextResponse.json({ error: error.message }, { status: 502 })
    }

    return NextResponse.json({ error: 'Error al iniciar el pago' }, { status: 500 })
  }
}
