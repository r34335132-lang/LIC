import { NextResponse } from 'next/server'
import { getPerfilFromSession } from '@/lib/auth-server'
import {
  ClipApiError,
  createClipCheckout,
  getClipConfiguration,
} from '@/lib/clip'
import {
  CuponError,
  buildCuponFieldsUpdate,
  validarCuponParaMonto,
} from '@/lib/cupones'
import {
  MercadoPagoApiError,
  canReuseMercadoPagoCheckoutUrl,
  createMercadoPagoPreference,
} from '@/lib/mercadopago'
import { buildMensualidadPaymentReference, buildPaymentUpdateRecord } from '@/lib/mensualidades-pago'
import { loadMensualidadForAlumnoPayment } from '@/lib/pagos-mensualidad'
import type { MetodoPago } from '@/types/database'

export const runtime = 'nodejs'

function parseMetodo(body: unknown): MetodoPago | null {
  if (!body || typeof body !== 'object') return 'mercado_pago'
  const metodo = (body as { metodo?: string }).metodo
  if (metodo === 'clip' || metodo === 'mercado_pago') return metodo
  if (!metodo) return 'mercado_pago'
  return null
}

function parseCodigoCupon(body: unknown): string {
  if (!body || typeof body !== 'object') return ''
  const codigo = (body as { codigo_cupon?: string }).codigo_cupon
  return typeof codigo === 'string' ? codigo.trim() : ''
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getPerfilFromSession()
    const { id } = await params

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

    const loaded = await loadMensualidadForAlumnoPayment(id)
    if (!loaded.ok) return loaded.response

    const { admin, mensualidad: m } = loaded.data
    const codigoCupon = parseCodigoCupon(body)

    let amount = Number(m.monto)
    let cuponUpdate: Record<string, unknown> = {}

    if (codigoCupon) {
      const calculo = await validarCuponParaMonto(admin, codigoCupon, amount)
      if (calculo.cubiertoTotal) {
        return NextResponse.json(
          {
            error:
              'Este cupón cubre el total. Usa "Aplicar cupón" en lugar del checkout.',
          },
          { status: 400 }
        )
      }
      amount = calculo.montoFinal
      cuponUpdate = buildCuponFieldsUpdate(calculo)
    }

    if (amount <= 0) {
      return NextResponse.json(
        { error: 'El monto a cobrar debe ser mayor a cero' },
        { status: 400 }
      )
    }

    if (metodo === 'mercado_pago') {
      if (
        !codigoCupon &&
        m.mp_checkout_url &&
        m.metodo_pago === 'mercado_pago' &&
        m.estado_pago === 'pendiente' &&
        canReuseMercadoPagoCheckoutUrl(m.mp_checkout_url)
      ) {
        return NextResponse.json({
          success: true,
          checkoutUrl: m.mp_checkout_url,
          metodo: 'mercado_pago',
        })
      }

      const preference = await createMercadoPagoPreference({
        mensualidadId: m.id,
        title: `${m.concepto} — ${m.periodo}`,
        amount,
        payerEmail: session?.perfil.email ?? undefined,
      })

      const { error: updateError } = await admin
        .from('mensualidades')
        .update({
          ...buildPaymentUpdateRecord(
            {
              metodo_pago: 'mercado_pago',
              estado_pago: 'pendiente',
              pago_error_mensaje: null,
              mp_checkout_url: preference.checkoutUrl,
              mp_reference: preference.reference,
              mp_preference_id: preference.preferenceId,
            },
            m.estado
          ),
          ...cuponUpdate,
          cupon_consumido: false,
        })
        .eq('id', m.id)
        .eq('alumno_id', loaded.data.userId)

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
        montoFinal: amount,
      })
    }

    getClipConfiguration()

    if (
      !codigoCupon &&
      m.clip_checkout_url &&
      m.metodo_pago === 'clip' &&
      m.estado_pago === 'pendiente'
    ) {
      return NextResponse.json({
        success: true,
        checkoutUrl: m.clip_checkout_url,
        metodo: 'clip',
      })
    }

    const reference = buildMensualidadPaymentReference(m.id)
    const checkout = await createClipCheckout({
      amount,
      currency: 'MXN',
      description: `${m.concepto} — ${m.periodo}`,
      reference,
      customerEmail: session?.perfil.email ?? undefined,
      customerName: session?.perfil.nombre_completo ?? undefined,
    })

    const { error: updateError } = await admin
      .from('mensualidades')
      .update({
        ...buildPaymentUpdateRecord(
          {
            metodo_pago: 'clip',
            estado_pago: 'pendiente',
            pago_error_mensaje: null,
            clip_checkout_url: checkout.payment_request_url,
            clip_reference: reference,
            clip_payment_id: checkout.payment_request_id,
          },
          m.estado
        ),
        ...cuponUpdate,
        cupon_consumido: false,
      })
      .eq('id', m.id)
      .eq('alumno_id', loaded.data.userId)

    if (updateError) {
      return NextResponse.json(
        { error: 'El checkout se creó, pero no se pudo guardar en la mensualidad' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      checkoutUrl: checkout.payment_request_url,
      metodo: 'clip',
      montoFinal: amount,
    })
  } catch (error) {
    console.error('[PAGAR_ERROR]', error)

    if (error instanceof CuponError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    if (error instanceof MercadoPagoApiError) {
      const status =
        error.status >= 400 && error.status < 500
          ? error.status
          : error.status === 0
            ? 503
            : 502
      return NextResponse.json(
        {
          error: error.message,
          metodo: 'mercado_pago',
          provider: { status: error.status, body: error.body },
        },
        { status }
      )
    }

    if (error instanceof ClipApiError) {
      const { status, message, detail, body } = error.clip
      return NextResponse.json(
        {
          error: message,
          detail: detail ?? message,
          metodo: 'clip',
          clip: { status, message, detail, body },
        },
        { status: status >= 400 && status < 500 ? 400 : 502 }
      )
    }

    const detail = error instanceof Error ? error.message : String(error)
    return NextResponse.json(
      { error: 'Error interno al iniciar el pago', detail },
      { status: 500 }
    )
  }
}
