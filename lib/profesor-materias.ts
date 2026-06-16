import type { createAdminClient } from '@/lib/supabase/admin'

type AdminClient = ReturnType<typeof createAdminClient>

export type ProfesorMateriaAsignacion = {
  id: string
  profesor_id: string
  materia_id: string
}

export type ResolveMateriaResult =
  | { ok: true; materiaId: string; profesorMateriaId: string }
  | { ok: false; error: string; status: 400 | 403 | 404 }

export async function loadProfesorMateriaAsignacion(
  admin: AdminClient,
  profesorMateriaId: string,
  session: { userId: string; rol: string }
): Promise<
  | { ok: true; asignacion: ProfesorMateriaAsignacion }
  | { ok: false; error: string; status: 403 | 404 }
> {
  const { data, error } = await admin
    .from('profesor_materias')
    .select('id, profesor_id, materia_id')
    .eq('id', profesorMateriaId)
    .maybeSingle()

  if (error || !data) {
    return {
      ok: false,
      error: 'Asignación de profesor no encontrada',
      status: 404,
    }
  }

  if (!data.materia_id) {
    return {
      ok: false,
      error: 'No se pudo resolver el ID real de la materia',
      status: 404,
    }
  }

  if (session.rol === 'profesor' && data.profesor_id !== session.userId) {
    return {
      ok: false,
      error: 'El profesor no está asignado a esta materia',
      status: 403,
    }
  }

  return { ok: true, asignacion: data }
}

export async function resolveMateriaIdForProfesor(
  admin: AdminClient,
  session: { userId: string; rol: string },
  input: { profesor_materia_id?: unknown; materia_id?: unknown }
): Promise<ResolveMateriaResult> {
  const profesorMateriaId =
    typeof input.profesor_materia_id === 'string'
      ? input.profesor_materia_id.trim()
      : ''
  const materiaIdRaw =
    typeof input.materia_id === 'string' ? input.materia_id.trim() : ''

  if (profesorMateriaId) {
    const loaded = await loadProfesorMateriaAsignacion(
      admin,
      profesorMateriaId,
      session
    )
    if (!loaded.ok) {
      return { ok: false, error: loaded.error, status: loaded.status }
    }
    return {
      ok: true,
      materiaId: loaded.asignacion.materia_id,
      profesorMateriaId: loaded.asignacion.id,
    }
  }

  if (!materiaIdRaw) {
    return {
      ok: false,
      error: 'profesor_materia_id o materia_id es requerido',
      status: 400,
    }
  }

  // Compatibilidad: el frontend pudo enviar profesor_materias.id como materia_id
  const maybeAsignacion = await loadProfesorMateriaAsignacion(
    admin,
    materiaIdRaw,
    session
  )
  if (maybeAsignacion.ok) {
    return {
      ok: true,
      materiaId: maybeAsignacion.asignacion.materia_id,
      profesorMateriaId: maybeAsignacion.asignacion.id,
    }
  }

  if (session.rol === 'admin') {
    const { data: materia } = await admin
      .from('materias')
      .select('id')
      .eq('id', materiaIdRaw)
      .maybeSingle()

    if (!materia) {
      return {
        ok: false,
        error: 'No se pudo resolver el ID real de la materia',
        status: 404,
      }
    }

    return {
      ok: true,
      materiaId: materia.id,
      profesorMateriaId: '',
    }
  }

  const { data: asignacion } = await admin
    .from('profesor_materias')
    .select('id, materia_id')
    .eq('materia_id', materiaIdRaw)
    .eq('profesor_id', session.userId)
    .maybeSingle()

  if (!asignacion?.materia_id) {
    return {
      ok: false,
      error: 'El profesor no está asignado a esta materia',
      status: 403,
    }
  }

  return {
    ok: true,
    materiaId: asignacion.materia_id,
    profesorMateriaId: asignacion.id,
  }
}

export async function profesorTieneMateria(
  admin: AdminClient,
  profesorId: string,
  materiaId: string
): Promise<boolean> {
  const { data } = await admin
    .from('profesor_materias')
    .select('id')
    .eq('materia_id', materiaId)
    .eq('profesor_id', profesorId)
    .maybeSingle()
  return !!data
}
