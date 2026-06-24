export function normalizarRespuesta(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[.,;:!?¿¡'"()]/g, '')
}

export function respuestasCoinciden(
  respuestaAlumno: string,
  respuestaCorrecta: string
): boolean {
  const a = normalizarRespuesta(respuestaAlumno)
  const b = normalizarRespuesta(respuestaCorrecta)
  if (!a || !b) return false
  if (a === b) return true

  const alternativas = b.split('|').map((s) => normalizarRespuesta(s.trim()))
  return alternativas.some((alt) => alt === a)
}

export type PreguntaEvaluable = {
  tipo?: string
  respuesta_correcta: string
  opciones?: string[] | null
}

export function evaluarRespuesta(
  pregunta: PreguntaEvaluable,
  respuestaAlumno: string
): boolean {
  const tipo = pregunta.tipo === 'opcion_multiple' ? 'opcion_multiple' : 'texto'

  if (tipo === 'opcion_multiple') {
    const idxAlumno = respuestaAlumno.trim()
    const idxCorrecto = pregunta.respuesta_correcta.trim()
    if (idxAlumno === idxCorrecto) return true

    const opciones = pregunta.opciones ?? []
    const textoAlumno = opciones[parseInt(idxAlumno, 10)]
    const textoCorrecto = opciones[parseInt(idxCorrecto, 10)]
    if (textoAlumno && textoCorrecto) {
      return normalizarRespuesta(textoAlumno) === normalizarRespuesta(textoCorrecto)
    }
    return false
  }

  return respuestasCoinciden(respuestaAlumno, pregunta.respuesta_correcta)
}

export function etiquetaRespuestaAlumno(
  pregunta: PreguntaEvaluable,
  respuestaAlumno: string | null
): string {
  if (!respuestaAlumno) return '—'
  if (pregunta.tipo === 'opcion_multiple') {
    const opciones = pregunta.opciones ?? []
    const idx = parseInt(respuestaAlumno, 10)
    if (!Number.isNaN(idx) && opciones[idx]) return opciones[idx]
  }
  return respuestaAlumno
}

export function etiquetaRespuestaCorrecta(pregunta: PreguntaEvaluable): string {
  if (pregunta.tipo === 'opcion_multiple') {
    const opciones = pregunta.opciones ?? []
    const idx = parseInt(pregunta.respuesta_correcta, 10)
    if (!Number.isNaN(idx) && opciones[idx]) return opciones[idx]
  }
  return pregunta.respuesta_correcta
}

export function calcularCalificacionExamen(
  puntosObtenidos: number,
  puntosTotales: number
): number {
  if (puntosTotales <= 0) return 0
  const cal = (puntosObtenidos / puntosTotales) * 10
  return Math.round(cal * 100) / 100
}

export function formatearTiempo(segundos: number | null | undefined): string {
  if (segundos == null || segundos < 0) return '—'
  const mins = Math.floor(segundos / 60)
  const secs = segundos % 60
  if (mins === 0) return `${secs}s`
  return `${mins}m ${secs}s`
}

export type PreguntaInput = {
  texto: string
  tipo: 'texto' | 'opcion_multiple'
  opciones: string[] | null
  respuesta_correcta: string
  puntos: number
}

export function parsePreguntas(value: unknown): PreguntaInput[] | null {
  if (value === undefined) return null
  if (!Array.isArray(value)) return []

  return value.flatMap((item, index) => {
    if (!item || typeof item !== 'object') return []
    const p = item as Record<string, unknown>
    const texto = typeof p.texto === 'string' ? p.texto.trim() : ''
    const tipoRaw = typeof p.tipo === 'string' ? p.tipo : 'texto'
    const tipo = tipoRaw === 'opcion_multiple' ? 'opcion_multiple' : 'texto'
    const puntos = Number(p.puntos ?? 1)

    let opciones: string[] | null = null
    if (Array.isArray(p.opciones)) {
      opciones = p.opciones
        .map((o) => (typeof o === 'string' ? o.trim() : ''))
        .filter(Boolean)
    }

    let respuesta_correcta = ''
    if (tipo === 'opcion_multiple') {
      if (!opciones || opciones.length < 2) return []
      const idx =
        typeof p.respuesta_correcta === 'string'
          ? parseInt(p.respuesta_correcta, 10)
          : Number(p.respuesta_correcta)
      if (!Number.isInteger(idx) || idx < 0 || idx >= opciones.length) return []
      respuesta_correcta = String(idx)
    } else {
      respuesta_correcta =
        typeof p.respuesta_correcta === 'string' ? p.respuesta_correcta.trim() : ''
    }

    if (!texto || !respuesta_correcta || !Number.isFinite(puntos) || puntos <= 0) {
      return []
    }

    return [{
      texto,
      tipo,
      opciones,
      respuesta_correcta,
      puntos,
      orden: index,
    } as PreguntaInput & { orden: number }]
  })
}

export type CriterioInput = {
  nombre: string
  descripcion: string | null
  peso: number
  tipo: 'tareas' | 'examenes' | 'otro'
}

export function parseCriterios(value: unknown): CriterioInput[] | null {
  if (value === undefined) return null
  if (!Array.isArray(value)) return []

  return value.flatMap((item, index) => {
    if (!item || typeof item !== 'object') return []
    const c = item as Record<string, unknown>
    const nombre = typeof c.nombre === 'string' ? c.nombre.trim() : ''
    const peso = Number(c.peso)
    const tipoRaw = typeof c.tipo === 'string' ? c.tipo : 'otro'
    const tipo =
      tipoRaw === 'tareas' || tipoRaw === 'examenes' ? tipoRaw : 'otro'
    if (!nombre || !Number.isFinite(peso) || peso <= 0 || peso > 100) return []
    return [{
      nombre,
      descripcion:
        typeof c.descripcion === 'string' ? c.descripcion.trim() || null : null,
      peso,
      tipo,
      orden: index,
    } as CriterioInput & { orden: number }]
  })
}
