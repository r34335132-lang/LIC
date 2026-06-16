export type Rol = 'admin' | 'alumno' | 'profesor'

export type EstadoInscripcion = 'pendiente' | 'aprobada' | 'rechazada'

export type EstadoAlumnoMateria =
  | 'pendiente'
  | 'cursando'
  | 'aprobada'
  | 'reprobada'

export interface Perfil {
  id: string
  email: string | null
  nombre_completo: string | null
  rol: Rol
  matricula: string | null
  programa_id: string | null
  telefono: string | null
  created_at: string
}

export type TipoPrograma = 'preparatoria' | 'licenciatura' | 'maestria' | 'curso'

export interface Programa {
  id: string
  nombre: string
  tipo: TipoPrograma
  modalidad: string
  duracion: string
  rvoe: string | null
  descripcion: string | null
  imagen_url: string | null
  activo: boolean
  created_at: string
}

export interface Materia {
  id: string
  programa_id: string
  periodo: number
  nombre_periodo: string
  nombre: string
  clave: string
  seriacion: string | null
  horas_docente: number
  horas_independientes: number
  creditos: number
  instalacion: string | null
  created_at: string
}

export interface AlumnoMateria {
  id: string
  alumno_id: string
  materia_id: string
  estado: EstadoAlumnoMateria
  calificacion: number | null
  created_at: string
}

export interface ProfesorMateria {
  id: string
  profesor_id: string
  materia_id: string
  grupo: string | null
  periodo_escolar: string | null
  activo: boolean
  link_clase: string | null
  link_classroom: string | null
  link_drive: string | null
  horario: string | null
  aula: string | null
  descripcion: string | null
  created_at: string
}

export interface Inscripcion {
  id: string
  alumno_id: string | null
  nombre_completo: string
  email: string
  telefono: string | null
  programa_id: string
  estado: EstadoInscripcion
  comprobante_url: string | null
  matricula_generada: string | null
  created_at: string
}

export interface Actividad {
  id: string
  materia_id: string
  profesor_id: string
  titulo: string
  descripcion: string | null
  unidad: string | null
  instrucciones: string | null
  link_recurso: string | null
  fecha_entrega: string | null
  activo: boolean
  created_at: string
}

export type TipoTareaRecurso =
  | 'video'
  | 'pdf'
  | 'enlace'
  | 'documento'
  | 'lectura'

export interface TareaRecurso {
  id: string
  tarea_id: string
  titulo: string
  descripcion: string | null
  tipo: TipoTareaRecurso
  url: string
  orden: number
  created_at: string
}

export interface MateriaConProfesor extends Materia {
  profesor_materia?: ProfesorMateria & {
    profesor?: Pick<Perfil, 'id' | 'nombre_completo' | 'email'>
  }
}

export interface AlumnoMateriaDetalle extends AlumnoMateria {
  materia?: Materia
  profesor_materia?: ProfesorMateria & {
    profesor?: Pick<Perfil, 'id' | 'nombre_completo' | 'email'>
  }
  actividades?: Actividad[]
}

export type MetodoPago = 'mercado_pago' | 'clip' | 'cupon'

export type TipoCupon = 'porcentaje'

export interface Cupon {
  id: string
  codigo: string
  tipo: TipoCupon
  valor: number
  activo: boolean
  usos_maximos: number | null
  usos_actuales: number
  expires_at: string | null
  created_at: string
}

export type EstadoPagoMensualidad = 'pendiente' | 'pagado' | 'declinado' | 'error'

export type EstadoMensualidad =
  | 'pendiente'
  | 'iniciado'
  | 'pagado'
  | 'vencido'
  | 'cancelado'
  | 'fallido'

export interface Mensualidad {
  id: string
  alumno_id: string
  concepto: string
  periodo: string
  mes: number
  anio: number
  monto: number
  moneda: string
  estado: EstadoMensualidad
  fecha_vencimiento: string | null
  metodo_pago: MetodoPago | null
  estado_pago: EstadoPagoMensualidad | null
  pago_error_mensaje: string | null
  mp_preference_id: string | null
  mp_payment_id: string | null
  mp_checkout_url: string | null
  mp_reference: string | null
  clip_checkout_url: string | null
  clip_reference: string | null
  clip_payment_id: string | null
  cupon_id: string | null
  cupon_codigo: string | null
  monto_descuento: number | null
  monto_final: number | null
  cupon_consumido: boolean
  paid_at: string | null
  created_at: string
}

export type EstadoActividadEntrega = 'entregada' | 'revisada'

export interface ActividadEntrega {
  id: string
  actividad_id: string
  alumno_id: string
  texto_respuesta: string | null
  link_entrega: string | null
  archivo_url: string | null
  estado: EstadoActividadEntrega
  calificacion: number | null
  retroalimentacion: string | null
  created_at: string
  updated_at: string
}
