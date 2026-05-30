import type { MateriaPlan, PeriodoPlan, PlanEstudios } from '@/types/planes'
import { planPsicologia, planPsicologiaMeta } from './psicologia'

const planesByPrograma: Record<string, PlanEstudios> = {
  psicologia: planPsicologiaMeta,
}

export function getPlanByProgramaId(programaId: string): PlanEstudios | null {
  return planesByPrograma[programaId] ?? null
}

export function getMateriasByProgramaId(programaId: string): MateriaPlan[] {
  const plan = getPlanByProgramaId(programaId)
  if (!plan) return []
  return plan.periodos.flatMap((p) => p.materias)
}

export function getPeriodosByProgramaId(programaId: string): PeriodoPlan[] {
  const plan = getPlanByProgramaId(programaId)
  if (!plan) return []
  return plan.periodos
}

export { planPsicologia, planPsicologiaMeta }
