import {
  GraduationCap,
  Scale,
  Brain,
  BookOpen,
  Search,
  Globe,
  Sparkles,
  Heart
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export const programaIconos: Record<string, LucideIcon> = {
  'prep': GraduationCap,
  'lic-derecho': Scale,
  'lic-psicologia': Brain,
  'lic-pedagogia': BookOpen,
  'lic-criminologia': Search,
  'mae-educacion': BookOpen,
  'mae-psicopedagogia': Brain,
  'curso-ingles': Globe,
  'curso-ie': Heart,
  'curso-ia': Sparkles
}

export function getProgramaIcono(programaId: string): LucideIcon {
  return programaIconos[programaId] || GraduationCap
}
