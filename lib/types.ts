// Tipos para la plataforma educativa

export type UserRole = 'admin' | 'maestro' | 'alumno'

export interface User {
  id: string
  nombre: string
  email: string
  rol: UserRole
  avatar?: string
  telefono?: string
  matricula?: string
  programaId?: string
  estado: 'activo' | 'inactivo'
  fechaIngreso: string
}

export interface Programa {
  id: string
  nombre: string
  tipo: 'preparatoria' | 'licenciatura' | 'maestria' | 'curso'
  descripcion: string
  duracion: string
  imagen?: string
}

export interface Curso {
  id: string
  nombre: string
  programaId: string
  profesorId: string
  descripcion: string
  fechaInicio: string
  fechaFin: string
  estado: 'activo' | 'inactivo'
  imagen?: string
  progreso?: number
}

export interface Tarea {
  id: string
  cursoId: string
  titulo: string
  descripcion: string
  fechaLimite: string
  puntosTotales: number
  tipoEntrega: 'archivo' | 'texto' | 'ambos'
  formatosPermitidos: string[]
  tamanoMaximoMB: number
  estado: 'pendiente' | 'entregada' | 'vencida' | 'calificada'
}

export interface Entrega {
  id: string
  tareaId: string
  alumnoId: string
  fechaEntrega: string
  archivo?: string
  texto?: string
  calificacion?: number
  comentarios?: string
  estado: 'pendiente' | 'revisada' | 'calificada'
}

export interface Asistencia {
  id: string
  cursoId: string
  alumnoId: string
  fecha: string
  estado: 'presente' | 'falta' | 'retardo' | 'justificado'
  observaciones?: string
}

export interface ClaseVirtual {
  id: string
  cursoId: string
  titulo: string
  fecha: string
  horaInicio: string
  horaFin: string
  linkExterno: string
  descripcion?: string
}

export interface Calificacion {
  id: string
  alumnoId: string
  cursoId: string
  tareaId: string
  calificacion: number
  comentarios?: string
  fecha: string
}

export interface Matricula {
  id: string
  numero: string
  alumnoId: string
  programaId: string
  estado: 'activa' | 'inactiva'
  fechaCreacion: string
}

export interface Aviso {
  id: string
  cursoId?: string
  titulo: string
  contenido: string
  fecha: string
  tipo: 'general' | 'curso' | 'urgente'
}
