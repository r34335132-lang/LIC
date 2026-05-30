import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getPerfilFromSession } from '@/lib/auth-server'
import { generateTempPassword, sendPasswordResetEmail } from '@/lib/utils-auth'
import { getNombrePerfil } from '@/lib/perfil-utils'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getPerfilFromSession()
    if (!session || session.perfil.rol !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json().catch(() => ({}))
    const passwordInput =
      typeof body.password === 'string' ? body.password.trim() : ''
    const nuevaPassword = passwordInput || generateTempPassword()

    if (passwordInput && passwordInput.length < 8) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 8 caracteres' },
        { status: 400 }
      )
    }

    const admin = createAdminClient()
    const { data: perfil, error: perfilError } = await admin
      .from('perfiles')
      .select('*')
      .eq('id', id)
      .single()

    if (perfilError || !perfil) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    const { error: authError } = await admin.auth.admin.updateUserById(id, {
      password: nuevaPassword,
    })

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    let emailSent = false
    if (perfil.email) {
      const emailResult = await sendPasswordResetEmail({
        email: perfil.email,
        nombre: getNombrePerfil(perfil),
        tempPassword: nuevaPassword,
      })
      emailSent = emailResult.sent
    }

    return NextResponse.json({
      success: true,
      tempPassword: nuevaPassword,
      emailSent,
    })
  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json(
      { error: 'Error al restablecer contraseña' },
      { status: 500 }
    )
  }
}
