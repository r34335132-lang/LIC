import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { updateSession } from '@/lib/supabase/middleware'
import { getSupabaseEnv } from '@/lib/supabase/env'
import type { Rol } from '@/types/database'

const protectedPrefixes = ['/admin', '/dashboard', '/profesor']

function isProtectedPath(pathname: string) {
  return protectedPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  )
}

function getDashboardPath(rol: Rol): string {
  switch (rol) {
    case 'admin':
      return '/admin'
    case 'profesor':
      return '/profesor'
    case 'alumno':
      return '/dashboard'
  }
}

function createMiddlewareClient(request: NextRequest, response: NextResponse) {
  const env = getSupabaseEnv()
  if (!env) return null

  return createServerClient(env.url, env.anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        )
      },
    },
  })
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const env = getSupabaseEnv()

  if (!env) {
    if (isProtectedPath(pathname)) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    return NextResponse.next()
  }

  if (!isProtectedPath(pathname)) {
    return updateSession(request)
  }

  const response = await updateSession(request)
  const supabase = createMiddlewareClient(request, response)
  if (!supabase) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  const { data: perfil } = await supabase
    .from('perfiles')
    .select('rol')
    .eq('id', user.id)
    .single()

  const rol = (perfil?.rol as Rol) ?? null
  if (!rol) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (pathname.startsWith('/admin') && rol !== 'admin') {
    return NextResponse.redirect(new URL(getDashboardPath(rol), request.url))
  }

  if (pathname.startsWith('/profesor') && rol !== 'profesor' && rol !== 'admin') {
    return NextResponse.redirect(new URL(getDashboardPath(rol), request.url))
  }

  if (pathname.startsWith('/dashboard') && rol === 'profesor') {
    return NextResponse.redirect(new URL('/profesor', request.url))
  }

  if (pathname.startsWith('/dashboard') && rol !== 'alumno' && rol !== 'admin') {
    return NextResponse.redirect(new URL(getDashboardPath(rol), request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
