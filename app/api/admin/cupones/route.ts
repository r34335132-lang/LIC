import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getPerfilFromSession } from '@/lib/auth-server'
import { normalizarCodigoCupon } from '@/lib/cupones'
import type { Cupon, TipoCupon } from '@/types/database'

function parseCuponBody(body: unknown) {
  if (!body || typeof body !== 'object') return null
  const raw = body as Record<string, unknown>
  const codigo =
    typeof raw.codigo === 'string' ? normalizarCodigoCupon(raw.codigo) : ''
  const tipo = raw.tipo === 'porcentaje' ? ('porcentaje' as TipoCupon) : null
  const valor = Number(raw.valor)
  const activo = typeof raw.activo === 'boolean' ? raw.activo : true
  const usos_maximos =
    raw.usos_maximos === null || raw.usos_maximos === undefined || raw.usos_maximos === ''
      ? null
      : Number(raw.usos_maximos)
  const expires_at =
    typeof raw.expires_at === 'string' && raw.expires_at.trim()
      ? raw.expires_at.trim()
      : null

  if (!codigo || !tipo || !Number.isFinite(valor) || valor <= 0 || valor > 100) {
    return null
  }

  if (usos_maximos != null && (!Number.isInteger(usos_maximos) || usos_maximos <= 0)) {
    return null
  }

  return { codigo, tipo, valor, activo, usos_maximos, expires_at }
}

export async function GET() {
  try {
    const session = await getPerfilFromSession()
    if (!session || session.perfil.rol !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const admin = createAdminClient()
    const { data, error } = await admin
      .from('cupones')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ cupones: (data ?? []) as Cupon[] })
  } catch (error) {
    console.error('Admin cupones GET error:', error)
    return NextResponse.json({ error: 'Error al obtener cupones' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getPerfilFromSession()
    if (!session || session.perfil.rol !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = parseCuponBody(body)
    if (!parsed) {
      return NextResponse.json(
        { error: 'codigo, tipo porcentaje y valor (1-100) son requeridos' },
        { status: 400 }
      )
    }

    const admin = createAdminClient()
    const { data, error } = await admin
      .from('cupones')
      .insert({
        codigo: parsed.codigo,
        tipo: parsed.tipo,
        valor: parsed.valor,
        activo: parsed.activo,
        usos_maximos: parsed.usos_maximos,
        expires_at: parsed.expires_at,
      })
      .select()
      .single()

    if (error) {
      const message =
        error.code === '23505'
          ? 'Ya existe un cupón con ese código'
          : error.message
      return NextResponse.json({ error: message }, { status: 400 })
    }

    return NextResponse.json({ success: true, cupon: data as Cupon })
  } catch (error) {
    console.error('Admin cupones POST error:', error)
    return NextResponse.json({ error: 'Error al crear cupón' }, { status: 500 })
  }
}
