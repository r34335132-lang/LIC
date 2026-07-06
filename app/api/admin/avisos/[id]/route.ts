import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getPerfilFromSession } from '@/lib/auth-server'

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

    if (body.activo !== undefined) {
      if (typeof body.activo !== 'boolean') {
        return NextResponse.json({ error: 'activo debe ser booleano' }, { status: 400 })
      }
      updates.activo = body.activo
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'Sin cambios' }, { status: 400 })
    }

    const admin = createAdminClient()
    const { data: existing } = await admin
      .from('avisos')
      .select('id, tipo')
      .eq('id', id)
      .maybeSingle()

    if (!existing) {
      return NextResponse.json({ error: 'Aviso no encontrado' }, { status: 404 })
    }

    if (existing.tipo !== 'pago') {
      return NextResponse.json({ error: 'Solo se pueden editar avisos de pago' }, { status: 400 })
    }

    const { data, error } = await admin
      .from('avisos')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, aviso: data })
  } catch (error) {
    console.error('Admin avisos PATCH error:', error)
    return NextResponse.json({ error: 'Error al actualizar aviso' }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getPerfilFromSession()
    if (!session || session.perfil.rol !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id } = await params
    const admin = createAdminClient()

    const { data: existing } = await admin
      .from('avisos')
      .select('id, tipo')
      .eq('id', id)
      .maybeSingle()

    if (!existing) {
      return NextResponse.json({ error: 'Aviso no encontrado' }, { status: 404 })
    }

    if (existing.tipo !== 'pago') {
      return NextResponse.json({ error: 'Solo se pueden eliminar avisos de pago' }, { status: 400 })
    }

    const { error } = await admin.from('avisos').delete().eq('id', id)
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Admin avisos DELETE error:', error)
    return NextResponse.json({ error: 'Error al eliminar aviso' }, { status: 500 })
  }
}
