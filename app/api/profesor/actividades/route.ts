import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getPerfilFromSession } from '@/lib/auth-server'
import {
  profesorTieneMateria,
  resolveMateriaIdForProfesor,
} from '@/lib/profesor-materias'
import type { TipoTareaRecurso } from '@/types/database'

const TIPOS_RECURSO = new Set<TipoTareaRecurso>([
  'video',
  'pdf',
  'enlace',
  'documento',
  'lectura',
])

type RecursoInput = {
  titulo: string
  descripcion: string | null
  tipo: TipoTareaRecurso
  url: string
  orden: number
}

function parseRecursos(value: unknown): RecursoInput[] | null {
  if (value === undefined) return null
  if (!Array.isArray(value)) return []

  return value.flatMap((item, index) => {
    if (!item || typeof item !== 'object') return []
    const recurso = item as Record<string, unknown>
    const titulo = typeof recurso.titulo === 'string' ? recurso.titulo.trim() : ''
    const url = typeof recurso.url === 'string' ? recurso.url.trim() : ''
    if (
      typeof recurso.tipo === 'string' &&
      !TIPOS_RECURSO.has(recurso.tipo as TipoTareaRecurso)
    ) {
      return []
    }
    const tipo =
      typeof recurso.tipo === 'string'
        ? (recurso.tipo as TipoTareaRecurso)
        : 'enlace'

    if (!titulo || !url) return []

    try {
      const parsedUrl = new URL(url)
      if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
        return []
      }
    } catch {
      return []
    }

    return [{
      titulo,
      descripcion:
        typeof recurso.descripcion === 'string'
          ? recurso.descripcion.trim() || null
          : null,
      tipo,
      url,
      orden: index,
    }]
  })
}

async function replaceRecursos(
  admin: ReturnType<typeof createAdminClient>,
  tareaId: string,
  recursos: RecursoInput[]
) {
  const { error: deleteError } = await admin
    .from('tarea_recursos')
    .delete()
    .eq('tarea_id', tareaId)

  if (deleteError) throw deleteError
  if (recursos.length === 0) return

  const { error: insertError } = await admin
    .from('tarea_recursos')
    .insert(recursos.map((recurso) => ({ ...recurso, tarea_id: tareaId })))

  if (insertError) throw insertError
}

export async function POST(request: Request) {
  try {
    const session = await getPerfilFromSession()
    if (
      !session ||
      (session.perfil.rol !== 'profesor' && session.perfil.rol !== 'admin')
    ) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const titulo = typeof body.titulo === 'string' ? body.titulo.trim() : ''
    const { descripcion, unidad, instrucciones, link_recurso, fecha_entrega } = body
    const recursos = parseRecursos(body.recursos)

    if (!titulo) {
      return NextResponse.json({ error: 'El título es requerido' }, { status: 400 })
    }

    if (body.recursos !== undefined && recursos?.length !== body.recursos.length) {
      return NextResponse.json(
        { error: 'Cada recurso requiere título y una URL válida' },
        { status: 400 }
      )
    }

    const admin = createAdminClient()

    const resolved = await resolveMateriaIdForProfesor(admin, {
      userId: session.userId,
      rol: session.perfil.rol,
    }, {
      profesor_materia_id: body.profesor_materia_id,
      materia_id: body.materia_id,
    })

    if (!resolved.ok) {
      return NextResponse.json({ error: resolved.error }, { status: resolved.status })
    }

    const materia_id = resolved.materiaId

    const { data, error } = await admin
      .from('actividades')
      .insert({
        materia_id,
        profesor_id: session.userId,
        titulo,
        descripcion: descripcion ?? null,
        unidad: typeof unidad === 'string' ? unidad.trim() || null : null,
        instrucciones:
          typeof instrucciones === 'string' ? instrucciones.trim() || null : null,
        link_recurso: link_recurso ?? null,
        fecha_entrega: fecha_entrega || null,
        activo: true,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    if (recursos && recursos.length > 0) {
      try {
        await replaceRecursos(admin, data.id, recursos)
      } catch (resourceError) {
        await admin.from('actividades').delete().eq('id', data.id)
        const message =
          resourceError instanceof Error
            ? resourceError.message
            : 'No se pudieron guardar los recursos'
        return NextResponse.json({ error: message }, { status: 400 })
      }
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Crear actividad error:', error)
    return NextResponse.json({ error: 'Error al crear actividad' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getPerfilFromSession()
    if (
      !session ||
      (session.perfil.rol !== 'profesor' && session.perfil.rol !== 'admin')
    ) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { id, ...rest } = body

    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 })
    }

    const allowedFields = [
      'titulo',
      'descripcion',
      'unidad',
      'instrucciones',
      'link_recurso',
      'fecha_entrega',
      'activo',
    ] as const

    const updates: Record<string, unknown> = {}
    for (const field of allowedFields) {
      if (rest[field] !== undefined) updates[field] = rest[field]
    }
    const recursos = parseRecursos(rest.recursos)

    if (rest.recursos !== undefined && recursos?.length !== rest.recursos.length) {
      return NextResponse.json(
        { error: 'Cada recurso requiere título y una URL válida' },
        { status: 400 }
      )
    }

    if ('activo' in updates && typeof updates.activo !== 'boolean') {
      return NextResponse.json(
        { error: 'El campo activo debe ser booleano' },
        { status: 400 }
      )
    }

    if (
      'titulo' in updates &&
      (typeof updates.titulo !== 'string' || !updates.titulo.trim())
    ) {
      return NextResponse.json(
        { error: 'El título no puede estar vacío' },
        { status: 400 }
      )
    }

    if (Object.keys(updates).length === 0 && recursos === null) {
      return NextResponse.json(
        { error: 'No hay campos válidos para actualizar' },
        { status: 400 }
      )
    }

    const admin = createAdminClient()

    const { data: actividad } = await admin
      .from('actividades')
      .select('id, profesor_id, materia_id')
      .eq('id', id)
      .maybeSingle()

    if (!actividad) {
      return NextResponse.json(
        { error: 'Actividad no encontrada' },
        { status: 404 }
      )
    }

    // El profesor solo puede editar actividades de sus materias asignadas
    if (
      session.perfil.rol === 'profesor' &&
      !(await profesorTieneMateria(admin, session.userId, actividad.materia_id))
    ) {
      return NextResponse.json(
        { error: 'El profesor no está asignado a esta materia' },
        { status: 403 }
      )
    }

    if (Object.keys(updates).length > 0) {
      const { error } = await admin
        .from('actividades')
        .update(updates)
        .eq('id', id)

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }
    }

    if (recursos !== null) {
      try {
        await replaceRecursos(admin, id, recursos)
      } catch (resourceError) {
        const message =
          resourceError instanceof Error
            ? resourceError.message
            : 'No se pudieron actualizar los recursos'
        return NextResponse.json({ error: message }, { status: 400 })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Actualizar actividad error:', error)
    return NextResponse.json(
      { error: 'Error al actualizar actividad' },
      { status: 500 }
    )
  }
}
