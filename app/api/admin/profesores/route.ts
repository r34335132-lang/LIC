import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getPerfilFromSession } from '@/lib/auth-server'

export async function POST(request: Request) {
  try {
    const session = await getPerfilFromSession()
    if (!session || session.perfil.rol !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { email, nombre, telefono, password } = body

    if (!email || !nombre || !password) {
      return NextResponse.json(
        { error: 'Email, nombre y contraseña son requeridos' },
        { status: 400 }
      )
    }

    const admin = createAdminClient()

    const { data: authData, error: authError } =
      await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: nombre },
      })

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    const userId = authData.user!.id

    const { error: perfilError } = await admin.from('perfiles').upsert(
      {
        id: userId,
        email,
        nombre_completo: nombre,
        rol: 'profesor',
        matricula: null,
        programa_id: null,
        telefono: telefono ?? null,
      },
      { onConflict: 'id' }
    )

    if (perfilError) {
      await admin.auth.admin.deleteUser(userId)
      return NextResponse.json({ error: perfilError.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, userId })
  } catch (error) {
    console.error('Create profesor error:', error)
    return NextResponse.json({ error: 'Error al crear profesor' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const session = await getPerfilFromSession()
    if (!session || session.perfil.rol !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const admin = createAdminClient()
    const { data, error } = await admin
      .from('perfiles')
      .select('*')
      .eq('rol', 'profesor')
      .order('nombre_completo')

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ profesores: data })
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener profesores' }, { status: 500 })
  }
}
