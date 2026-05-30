import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getPerfilFromSession } from '@/lib/auth-server'
import { TIPOS_PROGRAMA } from '@/lib/programa-utils'
import type { Programa, TipoPrograma } from '@/types/database'

const TIPOS_VALIDOS = new Set(TIPOS_PROGRAMA.map((t) => t.value))

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getPerfilFromSession()
    if (!session || session.perfil.rol !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const updates: Record<string, unknown> = {}

    if (body.nombre !== undefined) {
      const nombre = typeof body.nombre === 'string' ? body.nombre.trim() : ''
      if (!nombre) {
        return NextResponse.json({ error: 'Nombre inválido' }, { status: 400 })
      }
      updates.nombre = nombre
    }

    if (body.tipo !== undefined) {
      const tipo = typeof body.tipo === 'string' ? body.tipo.trim() : ''
      if (!TIPOS_VALIDOS.has(tipo as TipoPrograma)) {
        return NextResponse.json({ error: 'Tipo inválido' }, { status: 400 })
      }
      updates.tipo = tipo
    }

    if (body.modalidad !== undefined) {
      updates.modalidad =
        typeof body.modalidad === 'string' ? body.modalidad.trim() : 'Virtual'
    }

    if (body.duracion !== undefined) {
      const duracion = typeof body.duracion === 'string' ? body.duracion.trim() : ''
      if (!duracion) {
        return NextResponse.json({ error: 'Duración inválida' }, { status: 400 })
      }
      updates.duracion = duracion
    }

    if (body.rvoe !== undefined) {
      updates.rvoe =
        typeof body.rvoe === 'string' && body.rvoe.trim() ? body.rvoe.trim() : null
    }

    if (body.descripcion !== undefined) {
      updates.descripcion =
        typeof body.descripcion === 'string' && body.descripcion.trim()
          ? body.descripcion.trim()
          : null
    }

    if (body.imagen_url !== undefined) {
      updates.imagen_url =
        typeof body.imagen_url === 'string' && body.imagen_url.trim()
          ? body.imagen_url.trim()
          : null
    }

    if (body.activo !== undefined) {
      if (typeof body.activo !== 'boolean') {
        return NextResponse.json({ error: 'activo debe ser booleano' }, { status: 400 })
      }
      updates.activo = body.activo
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No hay campos para actualizar' }, { status: 400 })
    }

    const admin = createAdminClient()
    const { data, error } = await admin
      .from('programas')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    if (!data) {
      return NextResponse.json({ error: 'Programa no encontrado' }, { status: 404 })
    }

    return NextResponse.json({ programa: data as Programa })
  } catch (error) {
    console.error('Admin programas PATCH error:', error)
    return NextResponse.json({ error: 'Error al actualizar programa' }, { status: 500 })
  }
}
