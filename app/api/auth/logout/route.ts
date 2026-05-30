import { NextResponse, type NextRequest } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/server'
import { getSupabaseEnv } from '@/lib/supabase/env'

export async function POST(request: NextRequest) {
  try {
    if (!getSupabaseEnv()) {
      return NextResponse.json(
        { error: 'Supabase no configurado en el servidor' },
        { status: 500 }
      )
    }

    const cookieHolder = NextResponse.next({ request })
    const supabase = createRouteHandlerClient(request, cookieHolder)
    const { error } = await supabase.auth.signOut()

    const response = error
      ? NextResponse.json({ error: error.message }, { status: 400 })
      : NextResponse.json({ success: true })

    cookieHolder.cookies.getAll().forEach(({ name, value, ...options }) => {
      response.cookies.set(name, value, options)
    })

    return response
  } catch (error) {
    console.error('Auth logout error:', error)
    return NextResponse.json(
      { error: 'Error al cerrar sesión' },
      { status: 500 }
    )
  }
}
