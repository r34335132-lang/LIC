import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getPerfilFromSession } from '@/lib/auth-server'
import { profesorTieneMateria } from '@/lib/profesor-materias'
import type { TipoAviso } from '@/types/database'

const TIPOS: TipoAviso[] = ['general', 'materia', 'urgente', 'clase']

export async function GET() {
  try {
    const session = await getPerfilFromSession()
    if (
      !session ||
      (session.perfil.rol !== 'profesor' && session.perfil.rol !== 'admin')
    ) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const admin = createAdminClient()
    const { data, error } = await admin
      .from('avisos')
      .select('*, materia:materias(id, nombre, clave)')
      .eq('profesor_id', session.userId)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ avisos: data ?? [] })
  } catch (error) {
    console.error('Profesor avisos GET error:', error)
    return NextResponse.json({ error: 'Error al obtener avisos' }, { status: 500 })
  }
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
    const contenido = typeof body.contenido === 'string' ? body.contenido.trim() : ''
    const materia_id = typeof body.materia_id === 'string' ? body.materia_id : ''
    const tipo = TIPOS.includes(body.tipo) ? (body.tipo as TipoAviso) : 'general'

    if (!titulo || !contenido || !materia_id) {
      return NextResponse.json(
        { error: 'Título, contenido y materia son requeridos' },
        { status: 400 }
      )
    }

    const admin = createAdminClient()

    if (
      session.perfil.rol === 'profesor' &&
      !(await profesorTieneMateria(admin, session.userId, materia_id))
    ) {
      return NextResponse.json(
        { error: 'No estás asignado a esta materia' },
        { status: 403 }
      )
    }

    const { data, error } = await admin
      .from('avisos')
      .insert({
        profesor_id: session.userId,
        materia_id,
        titulo,
        contenido,
        tipo,
        activo: true,
      })
      .select('*, materia:materias(id, nombre, clave)')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, aviso: data })
  } catch (error) {
    console.error('Profesor avisos POST error:', error)
    return NextResponse.json({ error: 'Error al crear aviso' }, { status: 500 })
  }
}
