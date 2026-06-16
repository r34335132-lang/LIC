import { NextResponse } from 'next/server'
import {
  CUPON_CUBIERTO_MESSAGE,
  CuponError,
  marcarMensualidadCubiertaConCupon,
  validarCuponParaMonto,
} from '@/lib/cupones'
import { loadMensualidadForAlumnoPayment } from '@/lib/pagos-mensualidad'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const codigo = typeof body.codigo === 'string' ? body.codigo : ''

    if (!codigo.trim()) {
      return NextResponse.json({ error: 'El código del cupón es requerido' }, { status: 400 })
    }

    const loaded = await loadMensualidadForAlumnoPayment(id)
    if (!loaded.ok) return loaded.response

    const { admin, mensualidad, userId } = loaded.data
    const calculo = await validarCuponParaMonto(admin, codigo, Number(mensualidad.monto))

    if (!calculo.cubiertoTotal) {
      return NextResponse.json(
        {
          error: `El cupón deja un saldo de $${calculo.montoFinal.toLocaleString('es-MX')}. Usa un método de pago.`,
          montoFinal: calculo.montoFinal,
        },
        { status: 400 }
      )
    }

    await marcarMensualidadCubiertaConCupon(
      admin,
      mensualidad.id,
      userId,
      calculo,
      mensualidad.estado
    )

    return NextResponse.json({
      success: true,
      cubierto: true,
      mensaje: CUPON_CUBIERTO_MESSAGE,
      codigo: calculo.cupon.codigo,
    })
  } catch (error) {
    if (error instanceof CuponError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error('Aplicar cupón error:', error)
    return NextResponse.json({ error: 'Error al aplicar cupón' }, { status: 500 })
  }
}
