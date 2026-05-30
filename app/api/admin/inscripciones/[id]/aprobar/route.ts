import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getPerfilFromSession } from '@/lib/auth-server'
import {
  generateMatricula,
  generateTempPassword,
  sendWelcomeEmail,
} from '@/lib/utils-auth'

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getPerfilFromSession()
    if (!session || session.perfil.rol !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id } = await params
    const admin = createAdminClient()

    const { data: inscripcion, error: fetchError } = await admin
      .from('inscripciones')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !inscripcion) {
      return NextResponse.json(
        { error: 'Inscripción no encontrada' },
        { status: 404 }
      )
    }

    if (inscripcion.estado !== 'pendiente') {
      return NextResponse.json(
        { error: 'La inscripción ya fue procesada' },
        { status: 400 }
      )
    }

    const tempPassword = generateTempPassword()
    const matricula = await generateMatricula(admin)

    const { data: authData, error: authError } =
      await admin.auth.admin.createUser({
        email: inscripcion.email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: { full_name: inscripcion.nombre_completo },
      })

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    const userId = authData.user!.id

    await admin.from('perfiles').upsert(
      {
        id: userId,
        email: inscripcion.email,
        nombre_completo: inscripcion.nombre_completo,
        rol: 'alumno',
        matricula,
        programa_id: inscripcion.programa_id,
        telefono: inscripcion.telefono,
      },
      { onConflict: 'id' }
    )

    const { data: materias } = await admin
      .from('materias')
      .select('id')
      .eq('programa_id', inscripcion.programa_id)

    if (materias && materias.length > 0) {
      const { error: amError } = await admin.from('alumno_materias').insert(
        materias.map((m) => ({
          alumno_id: userId,
          materia_id: m.id,
          estado: 'pendiente',
          calificacion: null,
        }))
      )
      if (amError) {
        console.error('Error asignando materias:', amError)
      }
    }

    await admin
      .from('inscripciones')
      .update({ estado: 'aprobada', matricula_generada: matricula })
      .eq('id', id)

    await sendWelcomeEmail({
      email: inscripcion.email,
      nombre: inscripcion.nombre_completo,
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
    console.error('Aprobar inscripción error:', error)
    return NextResponse.json(
      { error: 'Error al aprobar inscripción' },
      { status: 500 }
    )
  }
}
