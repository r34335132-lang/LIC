import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getPerfilFromSession } from '@/lib/auth-server'
import { ClipApiError, createClipCheckout } from '@/lib/clip'
import type { Mensualidad } from '@/types/database'

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getPerfilFromSession()
    if (!session || session.perfil.rol !== 'alumno') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id } = await params
    const admin = createAdminClient()

    const { data: mensualidad, error: fetchError } = await admin
      .from('mensualidades')
      .select('*')
      .eq('id', id)
      .eq('alumno_id', session.userId)
      .maybeSingle()

    if (fetchError || !mensualidad) {
      return NextResponse.json({ error: 'Mensualidad no encontrada' }, { status: 404 })
    }

    const m = mensualidad as Mensualidad
    if (m.estado === 'pagado') {
      return NextResponse.json({ error: 'Esta mensualidad ya está pagada' }, { status: 400 })
    }

    if (m.clip_checkout_url && m.estado === 'iniciado') {
      return NextResponse.json({
        success: true,
        checkoutUrl: m.clip_checkout_url,
      })
    }

    const reference = `MENSUALIDAD-${m.id}-${Date.now()}`
    const checkout = await createClipCheckout({
      amount: Number(m.monto),
      description: `${m.concepto} — ${m.periodo}`,
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

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      checkoutUrl: checkout.payment_request_url,
    })
  } catch (error) {
    if (error instanceof ClipApiError) {
      const { status, message, detail, raw } = error.clip
      console.error('Pagar mensualidad Clip error:', { status, message, detail })

      const httpStatus =
        error.isUnauthorized || (status >= 400 && status < 500) ? 400 : 502

      return NextResponse.json(
        {
          error: message,
          clip: { status, message, detail, raw },
        },
        { status: httpStatus }
      )
    }

    console.error('Pagar mensualidad error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al iniciar pago' },
      { status: 500 }
    )
  }
}
