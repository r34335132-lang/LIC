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

export function labelTipoPrograma(tipo: string): string {
  return TIPOS_PROGRAMA.find((t) => t.value === tipo)?.label ?? tipo
}
