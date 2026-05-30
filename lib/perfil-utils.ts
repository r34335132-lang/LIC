import type { Perfil } from '@/types/database'

export function getNombrePerfil(
  perfil: Pick<Perfil, 'nombre_completo'> | null | undefined
): string {
  return perfil?.nombre_completo?.trim() || 'Usuario'
}
