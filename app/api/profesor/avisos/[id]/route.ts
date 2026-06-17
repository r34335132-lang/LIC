import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getPerfilFromSession } from '@/lib/auth-server'
import { profesorTieneMateria } from '@/lib/profesor-materias'
import type { TipoAviso } from '@/types/database'

const TIPOS: TipoAviso[] = ['general', 'materia', 'urgente', 'clase']

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getPerfilFromSession()
    if (
      !session ||
      (session.perfil.rol !== 'profesor' && session.perfil.rol !== 'admin')
    ) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    const admin = createAdminClient()
    const { data: existing } = await admin
      .from('avisos')
      .select('id, profesor_id, materia_id')
      .eq('id', id)
      .maybeSingle()

    if (!existing) {
      return NextResponse.json({ error: 'Aviso no encontrado' }, { status: 404 })
    }

    if (
      session.perfil.rol === 'profesor' &&
      existing.profesor_id !== session.userId
    ) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    const updates: Record<string, unknown> = {}

    if (body.titulo !== undefined) {
      const titulo = typeof body.titulo === 'string' ? body.titulo.trim() : ''
      if (!titulo) {
        return NextResponse.json({ error: 'Título requerido' }, { status: 400 })
      }
      updates.titulo = titulo
    }

    if (body.contenido !== undefined) {
      const contenido = typeof body.contenido === 'string' ? body.contenido.trim() : ''
      if (!contenido) {
        return NextResponse.json({ error: 'Contenido requerido' }, { status: 400 })
      }
      updates.contenido = contenido
    }

    if (body.tipo !== undefined) {
      if (!TIPOS.includes(body.tipo)) {
        return NextResponse.json({ error: 'Tipo inválido' }, { status: 400 })
      }
      updates.tipo = body.tipo
    }

    if (body.activo !== undefined) {
      if (typeof body.activo !== 'boolean') {
        return NextResponse.json({ error: 'activo debe ser booleano' }, { status: 400 })
      }
      updates.activo = body.activo
    }

    if (body.materia_id !== undefined) {
      const materia_id = typeof body.materia_id === 'string' ? body.materia_id : ''
      if (!materia_id) {
        return NextResponse.json({ error: 'materia_id inválida' }, { status: 400 })
      }
      if (
        session.perfil.rol === 'profesor' &&
        !(await profesorTieneMateria(admin, session.userId, materia_id))
      ) {
        return NextResponse.json(
          { error: 'No estás asignado a esta materia' },
          { status: 403 }
        )
      }
      updates.materia_id = materia_id
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'Sin cambios' }, { status: 400 })
    }

    const { data, error } = await admin
      .from('avisos')
      .update(updates)
      .eq('id', id)
      .select('*, materia:materias(id, nombre, clave)')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, aviso: data })
  } catch (error) {
    console.error('Profesor avisos PATCH error:', error)
    return NextResponse.json({ error: 'Error al actualizar aviso' }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getPerfilFromSession()
    if (
      !session ||
      (session.perfil.rol !== 'profesor' && session.perfil.rol !== 'admin')
    ) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id } = await params
    const admin = createAdminClient()
    const { data: existing } = await admin
      .from('avisos')
      .select('profesor_id')
      .eq('id', id)
      .maybeSingle()

    if (!existing) {
      return NextResponse.json({ error: 'Aviso no encontrado' }, { status: 404 })
    }

    if (
      session.perfil.rol === 'profesor' &&
      existing.profesor_id !== session.userId
    ) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    const { error } = await admin.from('avisos').delete().eq('id', id)
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Profesor avisos DELETE error:', error)
    return NextResponse.json({ error: 'Error al eliminar aviso' }, { status: 500 })
  }
}
