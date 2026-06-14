import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getPerfilFromSession } from '@/lib/auth-server'
import {
  generateMatricula,
  generateTempPassword,
  sendWelcomeEmail,
} from '@/lib/utils-auth'
import {
  fechaVencimientoDesdeHoy,
  formatPeriodoMensualidad,
  mensualidadMontoDefault,
} from '@/lib/academico-utils'
import { getProgramaIdCandidates } from '@/lib/programa-utils'

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
    const programaCandidates = getProgramaIdCandidates(inscripcion.programa_id)

    const { data: programa, error: programaError } = await admin
      .from('programas')
      .select('id, nombre')
      .in('id', programaCandidates)
      .eq('activo', true)
      .limit(1)
      .maybeSingle()

    if (programaError || !programa) {
      console.error('Programa no encontrado para la inscripción:', {
        programaId: inscripcion.programa_id,
        candidates: programaCandidates,
        error: programaError,
      })
      return NextResponse.json(
        {
          error: `Programa no válido para la inscripción: ${inscripcion.programa_id}`,
          detail: programaError?.message ?? null,
          candidates: programaCandidates,
        },
        { status: 400 }
      )
    }

    const { data: authData, error: authError } =
      await admin.auth.admin.createUser({
        email: inscripcion.email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: { full_name: inscripcion.nombre_completo },
      })

    if (authError) {
      const dup = /already|registered|exists/i.test(authError.message)
      return NextResponse.json(
        {
          error: dup
            ? `Ya existe un usuario registrado con el correo ${inscripcion.email}. Revisa si el alumno ya fue dado de alta.`
            : authError.message,
        },
        { status: dup ? 409 : 400 }
      )
    }

    const userId = authData.user!.id

    // Si falla crear el perfil, borramos el usuario Auth recién creado (rollback)
    const { error: perfilError } = await admin.from('perfiles').upsert(
      {
        id: userId,
        email: inscripcion.email,
        nombre_completo: inscripcion.nombre_completo,
        rol: 'alumno',
        matricula,
        programa_id: programa.id,
        telefono: inscripcion.telefono,
      },
      { onConflict: 'id' }
    )

    if (perfilError) {
      console.error('Error creando perfil, ejecutando rollback:', {
        userId,
        programaId: programa.id,
        error: perfilError,
      })
      await admin.auth.admin.deleteUser(userId)
      return NextResponse.json(
        { error: `No se pudo crear el perfil: ${perfilError.message}` },
        { status: 400 }
      )
    }

    const { data: materias } = await admin
      .from('materias')
      .select('id')
      .in('programa_id', [...new Set([programa.id, ...programaCandidates])])
      .order('periodo', { ascending: true })
      .order('clave', { ascending: true })

    if (materias && materias.length > 0) {
      const { error: amError } = await admin.from('alumno_materias').insert(
        materias.map((m) => ({
          alumno_id: userId,
          materia_id: m.id,
          estado: 'pendiente',
          calificacion: null,
        }))
      )
      // Si falla asignar materias, hacemos rollback del perfil y del usuario Auth
      if (amError) {
        console.error('Error asignando materias, ejecutando rollback:', {
          userId,
          programaId: programa.id,
          materiasCount: materias.length,
          error: amError,
        })
        await admin.from('perfiles').delete().eq('id', userId)
        await admin.auth.admin.deleteUser(userId)
        return NextResponse.json(
          { error: `No se pudieron asignar las materias: ${amError.message}` },
          { status: 400 }
        )
      }
    }

    const now = new Date()
    const mes = now.getMonth() + 1
    const anio = now.getFullYear()

    const { error: mensualidadError } = await admin.from('mensualidades').upsert(
      {
        alumno_id: userId,
        concepto: 'Mensualidad inicial',
        periodo: formatPeriodoMensualidad(mes, anio),
        mes,
        anio,
        monto: mensualidadMontoDefault(),
        moneda: 'MXN',
        estado: 'pendiente',
        fecha_vencimiento: fechaVencimientoDesdeHoy(),
      },
      { onConflict: 'alumno_id,mes,anio', ignoreDuplicates: false }
    )

    if (mensualidadError) {
      console.error('Error creando mensualidad inicial:', mensualidadError)
    }

    const { error: updateError } = await admin
      .from('inscripciones')
      .update({
        estado: 'aprobada',
        matricula_generada: matricula,
        alumno_id: userId,
      })
      .eq('id', id)

    if (updateError) {
      console.error('Error actualizando inscripción:', updateError)
    }

    const emailResult = await sendWelcomeEmail({
      email: inscripcion.email,
      nombre: inscripcion.nombre_completo,
      matricula,
      tempPassword,
      rol: 'alumno',
    })

    return NextResponse.json({
      success: true,
      userId,
      matricula,
      tempPassword,
      emailSent: emailResult.sent,
      emailError: emailResult.error ?? null,
    })
  } catch (error) {
    console.error('Aprobar inscripción error:', error)
    return NextResponse.json(
      { error: 'Error al aprobar inscripción' },
      { status: 500 }
    )
  }
}
