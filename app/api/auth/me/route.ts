import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getSupabaseEnv } from '@/lib/supabase/env'
import type { Perfil } from '@/types/database'

function perfilPayload(perfil: Perfil) {
  return {
    id: perfil.id,
    rol: perfil.rol,
    nombre_completo: perfil.nombre_completo,
    matricula: perfil.matricula,
    programa_id: perfil.programa_id,
    telefono: perfil.telefono,
    email: perfil.email,
    created_at: perfil.created_at,
  }
}

export async function GET() {
  try {
    if (!getSupabaseEnv()) {
      return NextResponse.json(
        { error: 'Supabase no configurado en el servidor' },
        { status: 500 }
      )
    }

    const supabase = await createClient()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const { data: perfil, error: perfilError } = await supabase
      .from('perfiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (perfilError || !perfil) {
      return NextResponse.json(
        { error: 'Perfil no encontrado' },
        { status: 403 }
      )
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email ?? perfil.email,
      },
      perfil: perfilPayload(perfil as Perfil),
    })
  } catch (error) {
    console.error('Auth me error:', error)
    return NextResponse.json(
      { error: 'Error al obtener sesión' },
      { status: 500 }
    )
  }
}
