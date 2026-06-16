import { NextResponse } from 'next/server'
import { CuponError, validarCuponParaMonto } from '@/lib/cupones'
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

    const { admin, mensualidad } = loaded.data
    const calculo = await validarCuponParaMonto(admin, codigo, Number(mensualidad.monto))

    return NextResponse.json({
      success: true,
      codigo: calculo.cupon.codigo,
      montoOriginal: calculo.montoOriginal,
      montoDescuento: calculo.montoDescuento,
      montoFinal: calculo.montoFinal,
      cubiertoTotal: calculo.cubiertoTotal,
      porcentaje: Number(calculo.cupon.valor),
    })
  } catch (error) {
    if (error instanceof CuponError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error('Validar cupón error:', error)
    return NextResponse.json({ error: 'Error al validar cupón' }, { status: 500 })
  }
}
