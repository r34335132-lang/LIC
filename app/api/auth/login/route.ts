import { NextResponse, type NextRequest } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/server'
import { getDashboardPath } from '@/lib/auth-server'
import { getSupabaseEnv } from '@/lib/supabase/env'
import type { Perfil, Rol } from '@/types/database'

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

function applySessionCookies(
  cookieHolder: NextResponse,
  response: NextResponse
) {
  cookieHolder.cookies.getAll().forEach(({ name, value, ...options }) => {
    response.cookies.set(name, value, options)
  })
  return response
}

export async function POST(request: NextRequest) {
  try {
    if (!getSupabaseEnv()) {
      return NextResponse.json(
        { error: 'Supabase no configurado en el servidor' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
    const password = typeof body.password === 'string' ? body.password : ''

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email y contraseña son requeridos' },
        { status: 400 }
      )
    }

    const cookieHolder = NextResponse.next({ request })
    const supabase = createRouteHandlerClient(request, cookieHolder)

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error || !data.user) {
      return applySessionCookies(
        cookieHolder,
        NextResponse.json(
          { error: error?.message ?? 'Credenciales incorrectas' },
          { status: 401 }
        )
      )
    }

    const { data: perfil, error: perfilError } = await supabase
      .from('perfiles')
      .select('*')
      .eq('id', data.user.id)
      .single()

    if (perfilError || !perfil) {
      await supabase.auth.signOut()
      return applySessionCookies(
        cookieHolder,
        NextResponse.json(
          { error: 'Perfil no encontrado. Contacta a administración.' },
          { status: 403 }
        )
      )
    }

    const rol = perfil.rol as Rol
    const successResponse = NextResponse.json({
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email ?? email,
      },
      perfil: perfilPayload(perfil as Perfil),
      redirectTo: getDashboardPath(rol),
    })

    return applySessionCookies(cookieHolder, successResponse)
  } catch (error) {
    console.error('Auth login error:', error)
    return NextResponse.json(
      { error: 'Error al iniciar sesión' },
      { status: 500 }
    )
  }
}
