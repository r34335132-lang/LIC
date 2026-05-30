export interface MateriaPlan {
  nombre: string
  clave: string
  seriacion: string | null
  horasDocente: number
  horasIndependientes: number
  creditos: number
  instalacion: string | null
}

export interface PeriodoPlan {
  periodo: number
  nombre: string
  materias: MateriaPlan[]
}

export interface PlanEstudios {
  programaId: string
  nombre: string
  duracionSemestres: number
  modalidad: string
  periodos: PeriodoPlan[]
}
