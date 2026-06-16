import type { createAdminClient } from '@/lib/supabase/admin'
import type { Cupon, TipoCupon } from '@/types/database'

type AdminClient = ReturnType<typeof createAdminClient>

export const CUPON_CUBIERTO_MESSAGE = 'Pago cubierto con beca/descuento'

export type CuponCalculo = {
  cupon: Cupon
  montoOriginal: number
  montoDescuento: number
  montoFinal: number
  cubiertoTotal: boolean
}

export class CuponError extends Error {
  readonly status: number

  constructor(message: string, status = 400) {
    super(message)
    this.name = 'CuponError'
    this.status = status
  }
}

export function normalizarCodigoCupon(codigo: string): string {
  return codigo.trim().toUpperCase()
}

export function calcularDescuentoCupon(
  montoOriginal: number,
  tipo: TipoCupon,
  valor: number
): number {
  if (montoOriginal <= 0) return 0

  if (tipo === 'porcentaje') {
    const descuento = (montoOriginal * valor) / 100
    return Math.min(montoOriginal, Math.round(descuento * 100) / 100)
  }

  return 0
}

export function calcularMontoFinal(montoOriginal: number, montoDescuento: number): number {
  const final = montoOriginal - montoDescuento
  return Math.max(0, Math.round(final * 100) / 100)
}

export function calcularCuponAplicado(
  montoOriginal: number,
  cupon: Cupon
): CuponCalculo {
  const montoDescuento = calcularDescuentoCupon(montoOriginal, cupon.tipo, Number(cupon.valor))
  const montoFinal = calcularMontoFinal(montoOriginal, montoDescuento)

  return {
    cupon,
    montoOriginal,
    montoDescuento,
    montoFinal,
    cubiertoTotal: montoFinal <= 0,
  }
}

function cuponExpirado(cupon: Cupon): boolean {
  if (!cupon.expires_at) return false
  return new Date(cupon.expires_at) < new Date()
}

function cuponAgotado(cupon: Cupon): boolean {
  if (cupon.usos_maximos == null) return false
  return cupon.usos_actuales >= cupon.usos_maximos
}

export async function buscarCuponPorCodigo(
  admin: AdminClient,
  codigo: string
): Promise<Cupon | null> {
  const normalizado = normalizarCodigoCupon(codigo)
  if (!normalizado) return null

  const { data } = await admin
    .from('cupones')
    .select('*')
    .eq('codigo', normalizado)
    .maybeSingle()

  return (data as Cupon | null) ?? null
}

export async function validarCuponParaMonto(
  admin: AdminClient,
  codigo: string,
  montoOriginal: number
): Promise<CuponCalculo> {
  const cupon = await buscarCuponPorCodigo(admin, codigo)

  if (!cupon) {
    throw new CuponError('Cupón no encontrado', 404)
  }
  if (!cupon.activo) {
    throw new CuponError('Este cupón no está activo', 400)
  }
  if (cuponExpirado(cupon)) {
    throw new CuponError('Este cupón expiró', 400)
  }
  if (cuponAgotado(cupon)) {
    throw new CuponError('Este cupón ya alcanzó el límite de usos', 400)
  }

  return calcularCuponAplicado(montoOriginal, cupon)
}

export async function consumirCupon(
  admin: AdminClient,
  cuponId: string
): Promise<void> {
  const { data: cupon, error: fetchError } = await admin
    .from('cupones')
    .select('id, usos_actuales, usos_maximos')
    .eq('id', cuponId)
    .maybeSingle()

  if (fetchError || !cupon) {
    throw new CuponError('No se pudo registrar el uso del cupón', 500)
  }

  if (cupon.usos_maximos != null && cupon.usos_actuales >= cupon.usos_maximos) {
    throw new CuponError('Este cupón ya alcanzó el límite de usos', 400)
  }

  const { data: updated, error: updateError } = await admin
    .from('cupones')
    .update({ usos_actuales: cupon.usos_actuales + 1 })
    .eq('id', cuponId)
    .eq('usos_actuales', cupon.usos_actuales)
    .select('id')
    .maybeSingle()

  if (updateError || !updated) {
    throw new CuponError('No se pudo registrar el uso del cupón. Intenta de nuevo.', 409)
  }
}

export async function finalizarCuponEnMensualidadPagada(
  admin: AdminClient,
  mensualidadId: string
): Promise<void> {
  const { data: mensualidad } = await admin
    .from('mensualidades')
    .select('id, cupon_id, cupon_consumido, estado_pago')
    .eq('id', mensualidadId)
    .maybeSingle()

  if (
    !mensualidad?.cupon_id ||
    mensualidad.cupon_consumido ||
    mensualidad.estado_pago !== 'pagado'
  ) {
    return
  }

  await consumirCupon(admin, mensualidad.cupon_id)

  await admin
    .from('mensualidades')
    .update({ cupon_consumido: true })
    .eq('id', mensualidadId)
}

export function buildCuponFieldsUpdate(calculo: CuponCalculo): Record<string, unknown> {
  return {
    cupon_id: calculo.cupon.id,
    cupon_codigo: calculo.cupon.codigo,
    monto_descuento: calculo.montoDescuento,
    monto_final: calculo.montoFinal,
  }
}

export async function marcarMensualidadCubiertaConCupon(
  admin: AdminClient,
  mensualidadId: string,
  alumnoId: string,
  calculo: CuponCalculo,
  currentEstado?: string
): Promise<void> {
  if (!calculo.cubiertoTotal) {
    throw new CuponError('El cupón no cubre el total de la mensualidad', 400)
  }

  await consumirCupon(admin, calculo.cupon.id)

  const { error } = await admin
    .from('mensualidades')
    .update({
      ...buildCuponFieldsUpdate(calculo),
      metodo_pago: 'cupon',
      estado_pago: 'pagado',
      estado: 'pagado',
      paid_at: new Date().toISOString(),
      pago_error_mensaje: null,
      cupon_consumido: true,
    })
    .eq('id', mensualidadId)
    .eq('alumno_id', alumnoId)
    .neq('estado_pago', 'pagado')

  if (error) {
    throw new CuponError('No se pudo aplicar el cupón a la mensualidad', 500)
  }
}
