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

    if (typeof body.activo === 'boolean') updates.activo = body.activo
    if (body.valor != null) {
      const valor = Number(body.valor)
      if (!Number.isFinite(valor) || valor <= 0 || valor > 100) {
        return NextResponse.json({ error: 'valor debe estar entre 1 y 100' }, { status: 400 })
      }
      updates.valor = valor
    }
    if (body.usos_maximos !== undefined) {
      updates.usos_maximos =
        body.usos_maximos === null || body.usos_maximos === ''
          ? null
          : Number(body.usos_maximos)
    }
    if (body.expires_at !== undefined) {
      updates.expires_at =
        typeof body.expires_at === 'string' && body.expires_at.trim()
          ? body.expires_at.trim()
          : null
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No hay campos válidos para actualizar' }, { status: 400 })
    }

    const admin = createAdminClient()
    const { error } = await admin.from('cupones').update(updates).eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Admin cupones PATCH error:', error)
    return NextResponse.json({ error: 'Error al actualizar cupón' }, { status: 500 })
  }
}
