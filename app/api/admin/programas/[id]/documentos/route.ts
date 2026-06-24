import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getPerfilFromSession } from '@/lib/auth-server'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getPerfilFromSession()
    if (!session || session.perfil.rol !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id: programaId } = await params
    const admin = createAdminClient()

    const { data, error } = await admin
      .from('programa_documentos_requeridos')
      .select('*')
      .eq('programa_id', programaId)
      .order('orden', { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ documentos: data ?? [] })
  } catch (error) {
    console.error('Programa documentos GET error:', error)
    return NextResponse.json({ error: 'Error al obtener documentos' }, { status: 500 })
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getPerfilFromSession()
    if (!session || session.perfil.rol !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id: programaId } = await params
    const body = await request.json()
    const nombre = typeof body.nombre === 'string' ? body.nombre.trim() : ''
    const descripcion =
      typeof body.descripcion === 'string' ? body.descripcion.trim() || null : null
    const obligatorio = body.obligatorio !== false

    if (!nombre) {
      return NextResponse.json({ error: 'El nombre es requerido' }, { status: 400 })
    }

    const admin = createAdminClient()
    const { count } = await admin
      .from('programa_documentos_requeridos')
      .select('id', { count: 'exact', head: true })
      .eq('programa_id', programaId)

    const { data, error } = await admin
      .from('programa_documentos_requeridos')
      .insert({
        programa_id: programaId,
        nombre,
        descripcion,
        obligatorio,
        orden: count ?? 0,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ documento: data })
  } catch (error) {
    console.error('Programa documentos POST error:', error)
    return NextResponse.json({ error: 'Error al crear documento' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getPerfilFromSession()
    if (!session || session.perfil.rol !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const docId = searchParams.get('docId')
    if (!docId) {
      return NextResponse.json({ error: 'docId requerido' }, { status: 400 })
    }

    const admin = createAdminClient()
    const { error } = await admin
      .from('programa_documentos_requeridos')
      .delete()
      .eq('id', docId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Programa documentos DELETE error:', error)
    return NextResponse.json({ error: 'Error al eliminar documento' }, { status: 500 })
  }
}
