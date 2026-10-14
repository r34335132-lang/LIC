export type SugerenciaTarea = {
  clave: string
  titulo: string
  unidad: string
  descripcion: string
  instrucciones: string
  fecha_entrega: string
}

type ContextoMateria = {
  materia: string
  programa: string | null
  periodo: number | null
  tareasExistentes: { titulo: string; unidad: string | null; fecha_entrega: string | null }[]
}

type Plantilla = {
  tipo: string
  titulo: (materia: string) => string
  descripcion: (materia: string) => string
  instrucciones: (materia: string) => string
}

const PLANTILLAS: Plantilla[] = [
  {
    tipo: 'Mapa conceptual',
    titulo: (m) => `Mapa conceptual: conceptos clave de ${m}`,
    descripcion: (m) =>
      `Organiza visualmente los conceptos principales revisados en ${m} y sus relaciones.`,
    instrucciones: () =>
      '1. Revisa el material de la unidad e identifica al menos 10 conceptos centrales.\n2. Relaciónalos con conectores claros.\n3. Agrega un ejemplo en al menos 3 conceptos.\n4. Entrega en PDF o foto legible.',
  },
  {
    tipo: 'Cuadro comparativo',
    titulo: (m) => `Cuadro comparativo de enfoques en ${m}`,
    descripcion: (m) =>
      `Compara dos o más autores, teorías o enfoques estudiados en ${m}.`,
    instrucciones: () =>
      '1. Elige 2 o 3 enfoques del material de la unidad.\n2. Compara: postulados, autores, ventajas, limitaciones y aplicación.\n3. Cierra con una conclusión personal de 5 a 8 líneas.\n4. Cita al menos 2 fuentes en formato APA.',
  },
  {
    tipo: 'Reporte de lectura',
    titulo: (m) => `Reporte de lectura de ${m}`,
    descripcion: (m) => `Analiza críticamente la lectura asignada de ${m}.`,
    instrucciones: () =>
      '1. Resume las ideas principales (máximo una cuartilla).\n2. Señala 3 aportes y 1 crítica del autor.\n3. Relaciona la lectura con un ejemplo de la vida real.\n4. Extensión: 2 a 3 cuartillas, formato APA.',
  },
  {
    tipo: 'Análisis de caso',
    titulo: (m) => `Análisis de caso práctico en ${m}`,
    descripcion: (m) =>
      `Aplica lo aprendido en ${m} al análisis de un caso real o hipotético.`,
    instrucciones: () =>
      '1. Describe brevemente el caso.\n2. Identifica el problema principal y sus causas.\n3. Propón al menos 2 alternativas de intervención fundamentadas en la teoría.\n4. Justifica cuál elegirías y por qué.',
  },
  {
    tipo: 'Ensayo',
    titulo: (m) => `Ensayo argumentativo sobre ${m}`,
    descripcion: (m) =>
      `Desarrolla una postura personal fundamentada sobre un tema de ${m}.`,
    instrucciones: () =>
      '1. Plantea una tesis clara en la introducción.\n2. Desarrolla al menos 3 argumentos con fuentes.\n3. Incluye un contraargumento y respóndelo.\n4. Extensión: 3 a 4 cuartillas, formato APA.',
  },
  {
    tipo: 'Línea del tiempo',
    titulo: (m) => `Línea del tiempo: evolución de ${m}`,
    descripcion: (m) =>
      `Representa los momentos y autores más importantes en el desarrollo de ${m}.`,
    instrucciones: () =>
      '1. Incluye al menos 8 hitos con fecha.\n2. Agrega una breve descripción de cada uno.\n3. Señala qué cambio aportó cada hito.\n4. Puede ser digital (Canva, PowerPoint) o a mano.',
  },
  {
    tipo: 'Infografía',
    titulo: (m) => `Infografía de un tema de ${m}`,
    descripcion: (m) =>
      `Sintetiza un tema de ${m} en un formato visual y fácil de compartir.`,
    instrucciones: () =>
      '1. Elige un tema de la unidad que estás estudiando.\n2. Incluye título, datos clave, imágenes o íconos y fuentes.\n3. Usa lenguaje claro para un público no especializado.\n4. Entrega en PDF o imagen.',
  },
  {
    tipo: 'Cuestionario',
    titulo: (m) => `Cuestionario de repaso de ${m}`,
    descripcion: (m) =>
      `Repasa los contenidos de la unidad de ${m} respondiendo preguntas guía.`,
    instrucciones: () =>
      '1. Elabora 10 preguntas clave sobre el material de la unidad.\n2. Respóndelas con tus propias palabras, fundamentando cada respuesta en las lecturas.\n3. Agrega al final 2 dudas que te hayan surgido.',
  },
  {
    tipo: 'Glosario',
    titulo: (m) => `Glosario de términos de ${m}`,
    descripcion: (m) =>
      `Construye un glosario con la terminología esencial de ${m}.`,
    instrucciones: () =>
      '1. Define al menos 15 términos de la unidad.\n2. Cita la fuente de cada definición.\n3. Agrega un ejemplo de uso en 5 de ellos.',
  },
  {
    tipo: 'Investigación',
    titulo: (m) => `Investigación documental de ${m}`,
    descripcion: (m) =>
      `Investiga en fuentes académicas un tema actual relacionado con ${m}.`,
    instrucciones: () =>
      '1. Consulta al menos 3 artículos científicos de los últimos 5 años.\n2. Resume los hallazgos principales de cada uno.\n3. Escribe una conclusión integradora.\n4. Referencias en formato APA 7.',
  },
  {
    tipo: 'Reflexión',
    titulo: (m) => `Reflexión personal sobre lo aprendido en ${m}`,
    descripcion: (m) =>
      `Reflexiona sobre cómo los contenidos de ${m} se relacionan con tu formación.`,
    instrucciones: () =>
      '1. ¿Qué fue lo más significativo de la unidad?\n2. ¿Cómo lo aplicarías en tu práctica profesional?\n3. ¿Qué te gustaría profundizar?\nExtensión: 1 a 2 cuartillas.',
  },
  {
    tipo: 'Presentación',
    titulo: (m) => `Presentación en diapositivas sobre ${m}`,
    descripcion: (m) =>
      `Elabora una presentación que explique un subtema de ${m} de forma clara y autocontenida.`,
    instrucciones: () =>
      '1. Elige un subtema de la unidad.\n2. Elabora de 8 a 12 diapositivas que se entiendan sin necesidad de exponerlas.\n3. Incluye ejemplos, una conclusión y fuentes en formato APA.\n4. Sube la presentación en PDF.',
  },
]

function normalizar(texto: string) {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function siguienteSemana(tareas: ContextoMateria['tareasExistentes']) {
  let maxSemana = 0
  for (const tarea of tareas) {
    const match = normalizar(tarea.unidad ?? '').match(/semana\s*(\d+)/)
    if (match) maxSemana = Math.max(maxSemana, Number(match[1]))
  }
  return maxSemana > 0 ? maxSemana + 1 : tareas.length + 1
}

function siguientesFechas(tareas: ContextoMateria['tareasExistentes'], cantidad: number) {
  const ahora = new Date()
  const ultima = tareas
    .map((t) => (t.fecha_entrega ? new Date(t.fecha_entrega) : null))
    .filter((d): d is Date => d != null && !Number.isNaN(d.getTime()))
    .sort((a, b) => b.getTime() - a.getTime())[0]

  const base = ultima && ultima > ahora ? new Date(ultima) : new Date(ahora)
  return Array.from({ length: cantidad }, (_, index) => {
    const fecha = new Date(base)
    fecha.setDate(fecha.getDate() + 7 * (index + 1))
    const yyyy = fecha.getFullYear()
    const mm = String(fecha.getMonth() + 1).padStart(2, '0')
    const dd = String(fecha.getDate()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd}T23:59`
  })
}

export function generarSugerenciasPlantilla(
  contexto: ContextoMateria,
  ronda: number,
  cantidad = 4
): SugerenciaTarea[] {
  const usados = contexto.tareasExistentes.map((t) => normalizar(t.titulo))
  const disponibles = PLANTILLAS.filter(
    (p) => !usados.some((titulo) => titulo.includes(normalizar(p.tipo)))
  )
  const pool = disponibles.length >= cantidad ? disponibles : PLANTILLAS
  const inicio = (ronda * cantidad) % pool.length
  const elegidas = Array.from({ length: Math.min(cantidad, pool.length) }, (_, i) =>
    pool[(inicio + i) % pool.length]
  )

  const semana = siguienteSemana(contexto.tareasExistentes)
  const fechas = siguientesFechas(contexto.tareasExistentes, elegidas.length)

  return elegidas.map((plantilla, index) => ({
    clave: `${normalizar(plantilla.tipo).replace(/\s+/g, '-')}-${ronda}-${index}`,
    titulo: plantilla.titulo(contexto.materia),
    unidad: `Semana ${semana + index}`,
    descripcion: plantilla.descripcion(contexto.materia),
    instrucciones: plantilla.instrucciones(contexto.materia),
    fecha_entrega: fechas[index],
  }))
}

export async function generarSugerenciasIA(
  contexto: ContextoMateria,
  cantidad = 4
): Promise<SugerenciaTarea[] | null> {
  const apiKey = process.env.OPENAI_API_KEY?.trim()
  if (!apiKey) return null

  const existentes = contexto.tareasExistentes
    .slice(0, 30)
    .map((t) => `- ${t.titulo}${t.unidad ? ` (${t.unidad})` : ''}`)
    .join('\n')

  const prompt = `Eres asesor pedagógico de una universidad en México.
Materia: ${contexto.materia}
Carrera o curso: ${contexto.programa ?? 'No especificado'}
${contexto.periodo ? `Cuatrimestre: ${contexto.periodo}` : ''}
Tareas ya publicadas (no las repitas):
${existentes || '- Ninguna'}

Propón ${cantidad} tareas nuevas, variadas y realistas para alumnos de licenciatura en línea.
Los alumnos estudian de forma autónoma con los materiales y lecturas de la plataforma: NO hay clases en vivo ni videollamadas.
No menciones clases, sesiones, lo "visto en clase", exposiciones orales ni trabajo presencial; cada tarea debe poder hacerse y entregarse por escrito o en archivo.
Responde SOLO con JSON: {"sugerencias":[{"titulo":"","descripcion":"","instrucciones":""}]}
- titulo: máximo 80 caracteres
- descripcion: 1 o 2 oraciones
- instrucciones: pasos numerados separados por \\n, incluye extensión y formato de entrega`

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL?.trim() || 'gpt-4o-mini',
        response_format: { type: 'json_object' },
        temperature: 0.9,
        messages: [{ role: 'user', content: prompt }],
      }),
      signal: AbortSignal.timeout(20000),
    })
    if (!res.ok) {
      console.warn('Sugerencias IA no disponibles:', res.status, await res.text().catch(() => ''))
      return null
    }
    const data = await res.json()
    const contenido = JSON.parse(data?.choices?.[0]?.message?.content ?? '{}')
    const lista: unknown[] = Array.isArray(contenido?.sugerencias) ? contenido.sugerencias : []

    const semana = siguienteSemana(contexto.tareasExistentes)
    const fechas = siguientesFechas(contexto.tareasExistentes, lista.length)

    const sugerencias = lista.flatMap((item, index) => {
      const s = item as Record<string, unknown>
      const titulo = typeof s.titulo === 'string' ? s.titulo.trim().slice(0, 120) : ''
      if (!titulo) return []
      return [
        {
          clave: `ia-${Date.now()}-${index}`,
          titulo,
          unidad: `Semana ${semana + index}`,
          descripcion: typeof s.descripcion === 'string' ? s.descripcion.trim() : '',
          instrucciones: typeof s.instrucciones === 'string' ? s.instrucciones.trim() : '',
          fecha_entrega: fechas[index],
        },
      ]
    })
    return sugerencias.length > 0 ? sugerencias : null
  } catch (error) {
    console.warn('Sugerencias IA error:', error)
    return null
  }
}
