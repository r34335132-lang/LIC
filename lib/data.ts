import type { User, Programa, Curso, Tarea, Entrega, Asistencia, ClaseVirtual, Calificacion, Aviso } from './types'

// Usuarios de ejemplo
export const usuarios: User[] = [
  {
    id: 'admin-1',
    nombre: 'Director Académico',
    email: 'admin@iud.edu.mx',
    rol: 'admin',
    telefono: '618-123-4567',
    estado: 'activo',
    fechaIngreso: '2020-01-15'
  },
  {
    id: 'maestro-1',
    nombre: 'Dra. Mariana López',
    email: 'mariana.lopez@iud.edu.mx',
    rol: 'maestro',
    telefono: '618-234-5678',
    estado: 'activo',
    fechaIngreso: '2021-08-01'
  },
  {
    id: 'maestro-2',
    nombre: 'Mtro. Ricardo Salas',
    email: 'ricardo.salas@iud.edu.mx',
    rol: 'maestro',
    telefono: '618-345-6789',
    estado: 'activo',
    fechaIngreso: '2022-01-15'
  },
  {
    id: 'maestro-3',
    nombre: 'Lic. Fernanda Castillo',
    email: 'fernanda.castillo@iud.edu.mx',
    rol: 'maestro',
    telefono: '618-456-7890',
    estado: 'activo',
    fechaIngreso: '2022-08-01'
  },
  {
    id: 'alumno-1',
    nombre: 'Ana Martínez',
    email: 'ana.martinez@iud.edu.mx',
    rol: 'alumno',
    matricula: 'IUD-2024-001',
    programaId: 'lic-derecho',
    telefono: '618-111-2222',
    estado: 'activo',
    fechaIngreso: '2024-01-15'
  },
  {
    id: 'alumno-2',
    nombre: 'Luis Herrera',
    email: 'luis.herrera@iud.edu.mx',
    rol: 'alumno',
    matricula: 'IUD-2024-002',
    programaId: 'lic-psicologia',
    telefono: '618-222-3333',
    estado: 'activo',
    fechaIngreso: '2024-01-15'
  },
  {
    id: 'alumno-3',
    nombre: 'Sofía Ramírez',
    email: 'sofia.ramirez@iud.edu.mx',
    rol: 'alumno',
    matricula: 'IUD-2024-003',
    programaId: 'lic-pedagogia',
    telefono: '618-333-4444',
    estado: 'activo',
    fechaIngreso: '2024-02-01'
  },
  {
    id: 'alumno-4',
    nombre: 'Carlos Torres',
    email: 'carlos.torres@iud.edu.mx',
    rol: 'alumno',
    matricula: 'IUD-2023-045',
    programaId: 'prep',
    telefono: '618-444-5555',
    estado: 'activo',
    fechaIngreso: '2023-08-15'
  }
]

// Programas académicos
export const programas: Programa[] = [
  {
    id: 'prep',
    nombre: 'Preparatoria en 2 años',
    tipo: 'preparatoria',
    descripcion: 'Programa flexible para terminar tus estudios de nivel medio superior en menor tiempo, con clases virtuales y acompañamiento académico.',
    duracion: '2 años'
  },
  {
    id: 'lic-derecho',
    nombre: 'Licenciatura en Derecho',
    tipo: 'licenciatura',
    descripcion: 'Formación integral en ciencias jurídicas con enfoque práctico y ético para el ejercicio profesional.',
    duracion: '4 años'
  },
  {
    id: 'lic-psicologia',
    nombre: 'Licenciatura en Psicología',
    tipo: 'licenciatura',
    descripcion: 'Desarrollo de competencias para comprender y mejorar el bienestar psicológico individual y colectivo.',
    duracion: '4 años'
  },
  {
    id: 'lic-pedagogia',
    nombre: 'Licenciatura en Pedagogía',
    tipo: 'licenciatura',
    descripcion: 'Formación de profesionales en educación con herramientas innovadoras para la enseñanza.',
    duracion: '4 años'
  },
  {
    id: 'lic-criminologia',
    nombre: 'Licenciatura en Criminología',
    tipo: 'licenciatura',
    descripcion: 'Estudio científico del delito, el delincuente y la víctima con enfoque en prevención y seguridad.',
    duracion: '4 años'
  },
  {
    id: 'mae-educacion',
    nombre: 'Maestría en Educación',
    tipo: 'maestria',
    descripcion: 'Posgrado orientado a la innovación educativa y el liderazgo en instituciones de enseñanza.',
    duracion: '2 años'
  },
  {
    id: 'mae-psicopedagogia',
    nombre: 'Maestría en Psicopedagogía',
    tipo: 'maestria',
    descripcion: 'Especialización en la intervención psicopedagógica para mejorar procesos de aprendizaje.',
    duracion: '2 años'
  },
  {
    id: 'curso-ingles',
    nombre: 'Inglés',
    tipo: 'curso',
    descripcion: 'Curso de inglés desde nivel básico hasta avanzado con certificación internacional.',
    duracion: '6 meses'
  },
  {
    id: 'curso-ie',
    nombre: 'Inteligencia Emocional',
    tipo: 'curso',
    descripcion: 'Desarrollo de habilidades socioemocionales para el éxito personal y profesional.',
    duracion: '3 meses'
  },
  {
    id: 'curso-ia',
    nombre: 'Inteligencia Artificial para Principiantes',
    tipo: 'curso',
    descripcion: 'Introducción práctica a la inteligencia artificial y sus aplicaciones en diversos campos.',
    duracion: '4 meses'
  }
]

// Cursos activos
export const cursos: Curso[] = [
  {
    id: 'curso-1',
    nombre: 'Introducción al Derecho',
    programaId: 'lic-derecho',
    profesorId: 'maestro-1',
    descripcion: 'Fundamentos del sistema jurídico mexicano y principios generales del derecho.',
    fechaInicio: '2024-01-15',
    fechaFin: '2024-06-15',
    estado: 'activo',
    progreso: 65
  },
  {
    id: 'curso-2',
    nombre: 'Psicología General',
    programaId: 'lic-psicologia',
    profesorId: 'maestro-2',
    descripcion: 'Estudio de los procesos mentales básicos y el comportamiento humano.',
    fechaInicio: '2024-01-15',
    fechaFin: '2024-06-15',
    estado: 'activo',
    progreso: 70
  },
  {
    id: 'curso-3',
    nombre: 'Pedagogía Contemporánea',
    programaId: 'lic-pedagogia',
    profesorId: 'maestro-3',
    descripcion: 'Teorías y metodologías educativas del siglo XXI.',
    fechaInicio: '2024-02-01',
    fechaFin: '2024-07-01',
    estado: 'activo',
    progreso: 55
  },
  {
    id: 'curso-4',
    nombre: 'Criminología Aplicada',
    programaId: 'lic-criminologia',
    profesorId: 'maestro-1',
    descripcion: 'Aplicación de teorías criminológicas a casos reales.',
    fechaInicio: '2024-02-15',
    fechaFin: '2024-07-15',
    estado: 'activo',
    progreso: 45
  },
  {
    id: 'curso-5',
    nombre: 'Inglés Básico',
    programaId: 'curso-ingles',
    profesorId: 'maestro-3',
    descripcion: 'Fundamentos del idioma inglés para comunicación básica.',
    fechaInicio: '2024-03-01',
    fechaFin: '2024-08-31',
    estado: 'activo',
    progreso: 35
  },
  {
    id: 'curso-6',
    nombre: 'Inteligencia Artificial para Principiantes',
    programaId: 'curso-ia',
    profesorId: 'maestro-2',
    descripcion: 'Introducción práctica a la IA y machine learning.',
    fechaInicio: '2024-03-15',
    fechaFin: '2024-07-15',
    estado: 'activo',
    progreso: 25
  }
]

// Tareas
export const tareas: Tarea[] = [
  {
    id: 'tarea-1',
    cursoId: 'curso-1',
    titulo: 'Ensayo sobre el Sistema Jurídico Mexicano',
    descripcion: 'Elaborar un ensayo de 3-5 páginas sobre los fundamentos del sistema jurídico mexicano.',
    fechaLimite: '2024-05-20',
    puntosTotales: 100,
    tipoEntrega: 'archivo',
    formatosPermitidos: ['pdf', 'docx'],
    tamanoMaximoMB: 20,
    estado: 'pendiente'
  },
  {
    id: 'tarea-2',
    cursoId: 'curso-2',
    titulo: 'Análisis de Caso Clínico',
    descripcion: 'Analizar el caso clínico proporcionado aplicando las teorías vistas en clase.',
    fechaLimite: '2024-05-25',
    puntosTotales: 100,
    tipoEntrega: 'ambos',
    formatosPermitidos: ['pdf', 'docx', 'pptx'],
    tamanoMaximoMB: 20,
    estado: 'pendiente'
  },
  {
    id: 'tarea-3',
    cursoId: 'curso-3',
    titulo: 'Propuesta Didáctica',
    descripcion: 'Diseñar una propuesta didáctica innovadora para educación básica.',
    fechaLimite: '2024-05-18',
    puntosTotales: 100,
    tipoEntrega: 'archivo',
    formatosPermitidos: ['pdf', 'docx', 'pptx'],
    tamanoMaximoMB: 50,
    estado: 'entregada'
  },
  {
    id: 'tarea-4',
    cursoId: 'curso-1',
    titulo: 'Cuestionario de Repaso',
    descripcion: 'Responder el cuestionario de repaso del tema 5.',
    fechaLimite: '2024-05-10',
    puntosTotales: 50,
    tipoEntrega: 'texto',
    formatosPermitidos: [],
    tamanoMaximoMB: 0,
    estado: 'calificada'
  }
]

// Entregas
export const entregas: Entrega[] = [
  {
    id: 'entrega-1',
    tareaId: 'tarea-3',
    alumnoId: 'alumno-3',
    fechaEntrega: '2024-05-17',
    archivo: 'propuesta_didactica_sofia.pdf',
    estado: 'calificada',
    calificacion: 95,
    comentarios: 'Excelente trabajo, muy creativa la propuesta.'
  },
  {
    id: 'entrega-2',
    tareaId: 'tarea-4',
    alumnoId: 'alumno-1',
    fechaEntrega: '2024-05-09',
    texto: 'Respuestas del cuestionario...',
    estado: 'calificada',
    calificacion: 45,
    comentarios: 'Bien, pero revisa la pregunta 3.'
  }
]

// Asistencias
export const asistencias: Asistencia[] = [
  { id: 'asis-1', cursoId: 'curso-1', alumnoId: 'alumno-1', fecha: '2024-05-13', estado: 'presente' },
  { id: 'asis-2', cursoId: 'curso-1', alumnoId: 'alumno-1', fecha: '2024-05-14', estado: 'presente' },
  { id: 'asis-3', cursoId: 'curso-1', alumnoId: 'alumno-1', fecha: '2024-05-15', estado: 'retardo' },
  { id: 'asis-4', cursoId: 'curso-2', alumnoId: 'alumno-2', fecha: '2024-05-13', estado: 'presente' },
  { id: 'asis-5', cursoId: 'curso-2', alumnoId: 'alumno-2', fecha: '2024-05-14', estado: 'falta' },
  { id: 'asis-6', cursoId: 'curso-2', alumnoId: 'alumno-2', fecha: '2024-05-15', estado: 'justificado' },
  { id: 'asis-7', cursoId: 'curso-3', alumnoId: 'alumno-3', fecha: '2024-05-13', estado: 'presente' },
  { id: 'asis-8', cursoId: 'curso-3', alumnoId: 'alumno-3', fecha: '2024-05-14', estado: 'presente' },
  { id: 'asis-9', cursoId: 'curso-3', alumnoId: 'alumno-3', fecha: '2024-05-15', estado: 'presente' }
]

// Clases virtuales
export const clasesVirtuales: ClaseVirtual[] = [
  {
    id: 'clase-1',
    cursoId: 'curso-1',
    titulo: 'Sesión 15: Derecho Constitucional',
    fecha: '2024-05-20',
    horaInicio: '18:00',
    horaFin: '20:00',
    linkExterno: 'https://meet.google.com/abc-defg-hij',
    descripcion: 'Revisión de los artículos constitucionales más relevantes.'
  },
  {
    id: 'clase-2',
    cursoId: 'curso-2',
    titulo: 'Sesión 16: Terapia Cognitiva',
    fecha: '2024-05-21',
    horaInicio: '19:00',
    horaFin: '21:00',
    linkExterno: 'https://meet.google.com/klm-nopq-rst',
    descripcion: 'Introducción a las técnicas de terapia cognitivo-conductual.'
  },
  {
    id: 'clase-3',
    cursoId: 'curso-3',
    titulo: 'Sesión 12: Metodologías Activas',
    fecha: '2024-05-22',
    horaInicio: '17:00',
    horaFin: '19:00',
    linkExterno: 'https://zoom.us/j/123456789',
    descripcion: 'Aprendizaje basado en proyectos y gamificación.'
  }
]

// Calificaciones
export const calificaciones: Calificacion[] = [
  { id: 'cal-1', alumnoId: 'alumno-1', cursoId: 'curso-1', tareaId: 'tarea-4', calificacion: 90, fecha: '2024-05-10' },
  { id: 'cal-2', alumnoId: 'alumno-3', cursoId: 'curso-3', tareaId: 'tarea-3', calificacion: 95, comentarios: 'Excelente trabajo', fecha: '2024-05-18' },
  { id: 'cal-3', alumnoId: 'alumno-2', cursoId: 'curso-2', tareaId: 'tarea-2', calificacion: 85, fecha: '2024-05-15' }
]

// Avisos
export const avisos: Aviso[] = [
  {
    id: 'aviso-1',
    titulo: 'Inscripciones abiertas para el ciclo 2024-2025',
    contenido: 'Ya están abiertas las inscripciones para el próximo ciclo escolar. Aprovecha los descuentos por pronto pago.',
    fecha: '2024-05-10',
    tipo: 'general'
  },
  {
    id: 'aviso-2',
    cursoId: 'curso-1',
    titulo: 'Cambio de horario de clase',
    contenido: 'La clase del viernes 24 de mayo se recorre a las 19:00 hrs.',
    fecha: '2024-05-15',
    tipo: 'curso'
  },
  {
    id: 'aviso-3',
    titulo: 'Mantenimiento de plataforma',
    contenido: 'El domingo 26 de mayo habrá mantenimiento programado de 2:00 a 6:00 AM.',
    fecha: '2024-05-18',
    tipo: 'urgente'
  }
]

// Funciones helper
export function getUsuarioById(id: string) {
  return usuarios.find(u => u.id === id)
}

export function getCursoById(id: string) {
  return cursos.find(c => c.id === id)
}

export function getProgramaById(id: string) {
  return programas.find(p => p.id === id)
}

export function getCursosByProfesor(profesorId: string) {
  return cursos.filter(c => c.profesorId === profesorId)
}

export function getTareasByCurso(cursoId: string) {
  return tareas.filter(t => t.cursoId === cursoId)
}

export function getClasesByCurso(cursoId: string) {
  return clasesVirtuales.filter(c => c.cursoId === cursoId)
}

export function getAsistenciasByAlumno(alumnoId: string) {
  return asistencias.filter(a => a.alumnoId === alumnoId)
}

export function getCalificacionesByAlumno(alumnoId: string) {
  return calificaciones.filter(c => c.alumnoId === alumnoId)
}

export function getEntregasByAlumno(alumnoId: string) {
  return entregas.filter(e => e.alumnoId === alumnoId)
}

export function getProfesorByCurso(cursoId: string) {
  const curso = getCursoById(cursoId)
  if (!curso) return null
  return getUsuarioById(curso.profesorId)
}
