import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getPerfilFromSession } from '@/lib/auth-server'
import { slugifyProgramaId, TIPOS_PROGRAMA } from '@/lib/programa-utils'
import type { Programa, TipoPrograma } from '@/types/database'

const TIPOS_VALIDOS = new Set(TIPOS_PROGRAMA.map((t) => t.value))

function isTipoPrograma(value: string): value is TipoPrograma {
  return TIPOS_VALIDOS.has(value as TipoPrograma)
}

export async function GET() {
  try {
    const session = await getPerfilFromSession()
    if (!session || session.perfil.rol !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const admin = createAdminClient()
    const { data, error } = await admin
      .from('programas')
      .select('*')
      .order('nombre')

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ programas: (data ?? []) as Programa[] })
  } catch (error) {
    console.error('Admin programas GET error:', error)
    return NextResponse.json({ error: 'Error al obtener programas' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getPerfilFromSession()
    if (!session || session.perfil.rol !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const nombre = typeof body.nombre === 'string' ? body.nombre.trim() : ''
    const tipo = typeof body.tipo === 'string' ? body.tipo.trim() : ''
    const modalidad =
      typeof body.modalidad === 'string' ? body.modalidad.trim() : 'Virtual'
    const duracion = typeof body.duracion === 'string' ? body.duracion.trim() : ''
    const idInput = typeof body.id === 'string' ? body.id.trim() : ''
    const rvoe = typeof body.rvoe === 'string' ? body.rvoe.trim() || null : null
    const descripcion =
      typeof body.descripcion === 'string' ? body.descripcion.trim() || null : null
    const imagen_url =
      typeof body.imagen_url === 'string' ? body.imagen_url.trim() || null : null
    const activo = body.activo !== false

    if (!nombre || !tipo || !duracion) {
      return NextResponse.json(
        { error: 'Nombre, tipo y duración son requeridos' },
        { status: 400 }
      )
    }

    if (!isTipoPrograma(tipo)) {
      return NextResponse.json({ error: 'Tipo de programa inválido' }, { status: 400 })
    }

    const id = idInput || slugifyProgramaId(nombre)
    if (!id) {
      return NextResponse.json({ error: 'ID de programa inválido' }, { status: 400 })
    }

    const admin = createAdminClient()

    const { data: existing } = await admin
      .from('programas')
      .select('id')
      .eq('id', id)
      .maybeSingle()

    if (existing) {
      return NextResponse.json(
        { error: `Ya existe un programa con id "${id}"` },
        { status: 409 }
      )
    }

    const { data, error } = await admin
      .from('programas')
      .insert({
        id,
        nombre,
        tipo,
        modalidad,
        duracion,
        rvoe,
        descripcion,
        imagen_url,
        activo,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ programa: data as Programa })
  } catch (error) {
    console.error('Admin programas POST error:', error)
    return NextResponse.json({ error: 'Error al crear programa' }, { status: 500 })
  }
}
