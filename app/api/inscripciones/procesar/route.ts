import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getPerfilFromSession } from '@/lib/auth-server'
import {
  generateMatricula,
  generateTempPassword,
  sendWelcomeEmail,
} from '@/lib/utils-auth'

interface ProcesarBody {
  email: string
  nombreCompleto: string
  telefono?: string
  programaId: string
}

export async function POST(request: Request) {
  try {
    const session = await getPerfilFromSession()
    if (!session || session.perfil.rol !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = (await request.json()) as ProcesarBody
    const { email, nombreCompleto, telefono, programaId } = body

    if (!email || !nombreCompleto || !programaId) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      )
    }

    const admin = createAdminClient()
    const tempPassword = generateTempPassword()
    const matricula = await generateMatricula(admin)

    const { data: authData, error: authError } =
      await admin.auth.admin.createUser({
        email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: { full_name: nombreCompleto },
      })

    if (authError || !authData.user) {
      return NextResponse.json(
        { error: authError?.message ?? 'Error al crear usuario' },
        { status: 400 }
      )
    }

    const userId = authData.user.id

    const { error: perfilError } = await admin.from('perfiles').upsert(
      {
        id: userId,
        email,
        nombre_completo: nombreCompleto,
        rol: 'alumno',
        matricula,
        programa_id: programaId,
        telefono: telefono ?? null,
      },
      { onConflict: 'id' }
    )

    if (perfilError) {
      await admin.auth.admin.deleteUser(userId)
      return NextResponse.json({ error: perfilError.message }, { status: 400 })
    }

    const { data: materias } = await admin
      .from('materias')
      .select('id')
      .eq('programa_id', programaId)

    if (materias && materias.length > 0) {
      await admin.from('alumno_materias').upsert(
        materias.map((m) => ({
          alumno_id: userId,
          materia_id: m.id,
          estado: 'pendiente',
          calificacion: null,
        })),
        { onConflict: 'alumno_id,materia_id', ignoreDuplicates: true }
      )
    }

    await sendWelcomeEmail({
      email,
      nombre: nombreCompleto,
      matricula,
      tempPassword,
    })

    return NextResponse.json({
      success: true,
      userId,
      matricula,
      tempPassword,
    })
  } catch (error) {
    console.error('Procesar inscripción error:', error)
    return NextResponse.json(
      { error: 'Error al procesar inscripción' },
      { status: 500 }
    )
  }
}
