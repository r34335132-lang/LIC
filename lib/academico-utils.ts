const MESES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
] as const

export function nombreMes(mes: number): string {
  return MESES[mes - 1] ?? `Mes ${mes}`
}

export function formatPeriodoMensualidad(mes: number, anio: number): string {
  return `${nombreMes(mes)} ${anio}`
}

export function cuatrimestreLabel(periodo: number): string {
  return `${periodo}° Cuatrimestre`
}

export function mensualidadMontoDefault(): number {
  return Number(process.env.MENSUALIDAD_MONTO ?? 600)
}

export function mensualidadDiasVencimientoDefault(): number {
  return Number(process.env.MENSUALIDAD_DIAS_VENCIMIENTO ?? 5)
}

export function fechaVencimientoDesdeHoy(dias?: number): string {
  const d = new Date()
  d.setDate(d.getDate() + (dias ?? mensualidadDiasVencimientoDefault()))
  return d.toISOString().slice(0, 10)
}

export type EstadoEntregaTarea = 'pendiente' | 'entregada' | 'revisada' | 'vencida'

export function resolverEstadoEntrega(
  entrega: { estado: string } | null | undefined,
  fechaEntrega: string | null | undefined
): EstadoEntregaTarea {
  if (!entrega) {
    if (fechaEntrega && new Date(fechaEntrega) < new Date()) return 'vencida'
    return 'pendiente'
  }
  if (entrega.estado === 'revisada') return 'revisada'
  return 'entregada'
}

export type EstadoMensualidadEfectivo =
  | 'pendiente'
  | 'iniciado'
  | 'pagado'
  | 'vencido'
  | 'cancelado'
  | 'fallido'

export function buildRecordatorioPagoMensualidad(params: {
  periodo: string
  monto: number
  fecha_vencimiento: string | null
}): { titulo: string; contenido: string } {
  const montoFmt = `$${Number(params.monto).toLocaleString('es-MX')}`
  const vencimiento = params.fecha_vencimiento
    ? new Date(params.fecha_vencimiento).toLocaleDateString('es-MX', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : 'sin fecha definida'

  return {
    titulo: `Recordatorio de pago — ${params.periodo}`,
    contenido: `Tienes una mensualidad pendiente de ${montoFmt} correspondiente a ${params.periodo}.\n\nFecha de vencimiento: ${vencimiento}.\n\nIngresa a la sección Pagos de tu campus virtual para realizar el pago a tiempo.`,
  }
}

export function resolverEstadoMensualidad(
  estado: string,
  fechaVencimiento: string | null | undefined
): EstadoMensualidadEfectivo {
  if (estado === 'pagado' || estado === 'cancelado' || estado === 'fallido') {
    return estado as EstadoMensualidadEfectivo
  }
  if (
    (estado === 'pendiente' || estado === 'iniciado') &&
    fechaVencimiento &&
    new Date(fechaVencimiento) < new Date(new Date().toDateString())
  ) {
    return 'vencido'
  }
  return estado as EstadoMensualidadEfectivo
}
