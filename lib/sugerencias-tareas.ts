import type { TipoTareaRecurso } from '@/types/database'

export type RecursoSugerido = {
  titulo: string
  descripcion: string
  tipo: TipoTareaRecurso
  url: string
}

export type SugerenciaTarea = {
  clave: string
  titulo: string
  unidad: string
  descripcion: string
  instrucciones: string
  fecha_entrega: string
  recursos: RecursoSugerido[]
}

export function linksDeApoyo(tema: string): RecursoSugerido[] {
  const q = encodeURIComponent(tema.trim())
  return [
    {
      titulo: `Artículos académicos: ${tema}`,
      descripcion: 'Google Académico',
      tipo: 'lectura',
      url: `https://scholar.google.com/scholar?hl=es&q=${q}`,
    },
    {
      titulo: `Artículos en español: ${tema}`,
      descripcion: 'SciELO',
      tipo: 'lectura',
      url: `https://search.scielo.org/?lang=es&q=${q}`,
    },
    {
      titulo: `Videos explicativos: ${tema}`,
      descripcion: 'YouTube',
      tipo: 'video',
      url: `https://www.youtube.com/results?search_query=${q}`,
    },
  ]
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
  busqueda: (materia: string) => string
}

const PLANTILLAS: Plantilla[] = [
  {
    tipo: 'Mapa conceptual',
    titulo: (m) => `Mapa conceptual: conceptos clave de ${m}`,
    descripcion: (m) =>
      `Organiza visualmente los conceptos principales de ${m} y sus relaciones.`,
    instrucciones: () =>
      '1. Consulta los links de apoyo de esta tarea e identifica al menos 10 conceptos centrales.\n2. Relaciónalos con conectores claros.\n3. Agrega un ejemplo en al menos 3 conceptos.\n4. Anota al final las fuentes que usaste.\n5. Entrega en PDF o foto legible.',
    busqueda: (m) => `${m} conceptos fundamentales`,
  },
  {
    tipo: 'Cuadro comparativo',
    titulo: (m) => `Cuadro comparativo de enfoques en ${m}`,
    descripcion: (m) =>
      `Compara dos o más autores, teorías o enfoques de ${m}.`,
    instrucciones: () =>
      '1. Con ayuda de los links de apoyo, elige 2 o 3 enfoques o autores.\n2. Compara: postulados, autores, ventajas, limitaciones y aplicación.\n3. Cierra con una conclusión personal de 5 a 8 líneas.\n4. Cita al menos 2 fuentes en formato APA.',
    busqueda: (m) => `${m} enfoques teóricos`,
  },
  {
    tipo: 'Reporte de lectura',
    titulo: (m) => `Reporte de lectura de ${m}`,
    descripcion: (m) => `Analiza críticamente un artículo académico sobre ${m}.`,
    instrucciones: () =>
      '1. Elige un artículo de los links de apoyo (Google Académico o SciELO).\n2. Resume las ideas principales (máximo una cuartilla).\n3. Señala 3 aportes y 1 crítica del autor.\n4. Relaciona la lectura con un ejemplo de la vida real.\n5. Extensión: 2 a 3 cuartillas, con la referencia en formato APA.',
    busqueda: (m) => m,
  },
  {
    tipo: 'Análisis de caso',
    titulo: (m) => `Análisis de caso práctico en ${m}`,
    descripcion: (m) =>
      `Aplica la teoría de ${m} al análisis de un caso real o hipotético.`,
    instrucciones: () =>
      '1. Busca un caso en los links de apoyo o plantea uno hipotético y descríbelo brevemente.\n2. Identifica el problema principal y sus causas.\n3. Propón al menos 2 alternativas de intervención fundamentadas en las fuentes consultadas.\n4. Justifica cuál elegirías y por qué.\n5. Cita tus fuentes en formato APA.',
    busqueda: (m) => `${m} estudio de caso`,
  },
  {
    tipo: 'Ensayo',
    titulo: (m) => `Ensayo argumentativo sobre ${m}`,
    descripcion: (m) =>
      `Desarrolla una postura personal fundamentada sobre un tema de ${m}.`,
    instrucciones: () =>
      '1. Revisa los links de apoyo y elige un tema que te interese.\n2. Plantea una tesis clara en la introducción.\n3. Desarrolla al menos 3 argumentos sustentados en las fuentes.\n4. Incluye un contraargumento y respóndelo.\n5. Extensión: 3 a 4 cuartillas, formato APA.',
    busqueda: (m) => `${m} debate actual`,
  },
  {
    tipo: 'Línea del tiempo',
    titulo: (m) => `Línea del tiempo: evolución de ${m}`,
    descripcion: (m) =>
      `Representa los momentos y autores más importantes en el desarrollo de ${m}.`,
    instrucciones: () =>
      '1. Investiga en los links de apoyo la historia y los autores principales.\n2. Incluye al menos 8 hitos con fecha y una breve descripción.\n3. Señala qué cambio aportó cada hito.\n4. Agrega las fuentes al final.\n5. Puede ser digital (Canva, PowerPoint) o a mano.',
    busqueda: (m) => `historia de ${m}`,
  },
  {
    tipo: 'Infografía',
    titulo: (m) => `Infografía de un tema de ${m}`,
    descripcion: (m) =>
      `Sintetiza un tema de ${m} en un formato visual y fácil de compartir.`,
    instrucciones: () =>
      '1. Elige un tema a partir de los links de apoyo.\n2. Incluye título, datos clave, imágenes o íconos y fuentes.\n3. Usa lenguaje claro para un público no especializado.\n4. Entrega en PDF o imagen.',
    busqueda: (m) => m,
  },
  {
    tipo: 'Cuestionario',
    titulo: (m) => `Cuestionario de repaso de ${m}`,
    descripcion: (m) =>
      `Repasa los temas principales de ${m} respondiendo preguntas clave.`,
    instrucciones: () =>
      '1. Revisa los links de apoyo de esta tarea.\n2. Elabora 10 preguntas clave sobre lo que leíste o viste.\n3. Respóndelas con tus propias palabras, citando de qué fuente sacaste cada respuesta.\n4. Agrega al final 2 dudas que te hayan surgido.',
    busqueda: (m) => `${m} introducción`,
  },
  {
    tipo: 'Glosario',
    titulo: (m) => `Glosario de términos de ${m}`,
    descripcion: (m) =>
      `Construye un glosario con la terminología esencial de ${m}.`,
    instrucciones: () =>
      '1. Usa los links de apoyo para encontrar al menos 15 términos clave.\n2. Define cada uno y cita la fuente.\n3. Agrega un ejemplo de uso en 5 de ellos.',
    busqueda: (m) => `${m} conceptos básicos`,
  },
  {
    tipo: 'Investigación',
    titulo: (m) => `Investigación documental de ${m}`,
    descripcion: (m) =>
      `Investiga en fuentes académicas un tema actual relacionado con ${m}.`,
    instrucciones: () =>
      '1. En los links de apoyo, consulta al menos 3 artículos científicos de los últimos 5 años.\n2. Resume los hallazgos principales de cada uno.\n3. Escribe una conclusión integradora.\n4. Referencias en formato APA 7.',
    busqueda: (m) => `${m} investigación reciente`,
  },
  {
    tipo: 'Reflexión',
    titulo: (m) => `Reflexión personal sobre ${m}`,
    descripcion: (m) =>
      `Reflexiona sobre cómo los temas de ${m} se relacionan con tu formación.`,
    instrucciones: () =>
      '1. Revisa al menos 2 fuentes de los links de apoyo.\n2. ¿Qué idea te pareció más significativa y por qué?\n3. ¿Cómo la aplicarías en tu práctica profesional?\n4. ¿Qué te gustaría profundizar?\nExtensión: 1 a 2 cuartillas, con las fuentes citadas.',
    busqueda: (m) => `${m} práctica profesional`,
  },
  {
    tipo: 'Presentación',
    titulo: (m) => `Presentación en diapositivas sobre ${m}`,
    descripcion: (m) =>
      `Elabora una presentación que explique un subtema de ${m} de forma clara y autocontenida.`,
    instrucciones: () =>
      '1. Elige un subtema a partir de los links de apoyo.\n2. Elabora de 8 a 12 diapositivas que se entiendan sin necesidad de exponerlas.\n3. Incluye ejemplos, una conclusión y fuentes en formato APA.\n4. Sube la presentación en PDF.',
    busqueda: (m) => m,
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
    recursos: linksDeApoyo(plantilla.busqueda(contexto.materia)),
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
NO hay clases en vivo ni videollamadas: los alumnos investigan por su cuenta usando los links de apoyo que se adjuntan a cada tarea (Google Académico, SciELO y YouTube).
No menciones clases, sesiones, lo "visto en clase", "material de la unidad", exposiciones orales ni trabajo presencial.
Las instrucciones deben pedir que el alumno saque la información de los links de apoyo y cite sus fuentes.
Responde SOLO con JSON: {"sugerencias":[{"titulo":"","descripcion":"","instrucciones":"","busqueda":""}]}
- titulo: máximo 80 caracteres
- descripcion: 1 o 2 oraciones
- instrucciones: pasos numerados separados por \\n, incluye extensión y formato de entrega
- busqueda: términos de búsqueda en español (3 a 6 palabras) para encontrar fuentes sobre el tema de la tarea`

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
      const busqueda =
        typeof s.busqueda === 'string' && s.busqueda.trim()
          ? s.busqueda.trim().slice(0, 100)
          : contexto.materia
      return [
        {
          clave: `ia-${Date.now()}-${index}`,
          titulo,
          unidad: `Semana ${semana + index}`,
          descripcion: typeof s.descripcion === 'string' ? s.descripcion.trim() : '',
          instrucciones: typeof s.instrucciones === 'string' ? s.instrucciones.trim() : '',
          fecha_entrega: fechas[index],
          recursos: linksDeApoyo(busqueda),
        },
      ]
    })
    return sugerencias.length > 0 ? sugerencias : null
  } catch (error) {
    console.warn('Sugerencias IA error:', error)
    return null
  }
}
