import type { TipoPrograma } from '@/types/database'

export const TIPOS_PROGRAMA: { value: TipoPrograma; label: string }[] = [
  { value: 'preparatoria', label: 'Preparatoria' },
  { value: 'licenciatura', label: 'Licenciatura' },
  { value: 'maestria', label: 'Maestría' },
  { value: 'curso', label: 'Curso' },
]

export function slugifyProgramaId(nombre: string): string {
  return nombre
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64)
}

export function normalizeProgramaId(programaId: string | null | undefined): string {
  const value = programaId?.trim()
  if (!value) return ''

  const slug = slugifyProgramaId(value.replace(/_/g, '-'))
  const psicologiaAliases = new Set([
    'psicologia',
    'psicologia-id',
    'lic-psicologia',
    'licenciatura-psicologia',
    'licenciatura-en-psicologia',
  ])

  if (psicologiaAliases.has(slug)) return 'psicologia'
  return value
}

export function getProgramaIdCandidates(programaId: string | null | undefined): string[] {
  const value = programaId?.trim()
  const normalized = normalizeProgramaId(value)
  const candidates = [normalized, value].filter((item): item is string => !!item)

  if (normalized === 'psicologia') {
    candidates.push(
      'Licenciatura en Psicología',
      'Licenciatura en Psicologia',
      'Psicología',
      'Psicologia',
      'lic-psicologia',
      'licenciatura_psicologia'
    )
  }

  return [...new Set(candidates)]
}

export function labelTipoPrograma(tipo: string): string {
  return TIPOS_PROGRAMA.find((t) => t.value === tipo)?.label ?? tipo
}
