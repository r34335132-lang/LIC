import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getPerfilFromSession } from '@/lib/auth-server'
import { buildRecordatorioPagoMensualidad } from '@/lib/academico-utils'
import type { Aviso, Mensualidad, Perfil } from '@/types/database'

type AvisoAdminRow = Aviso & {
  alumno: Pick<Perfil, 'id' | 'nombre_completo' | 'email' | 'matricula'> | null
  mensualidad: Pick<Mensualidad, 'id' | 'periodo' | 'monto' | 'estado'> | null
}

export async function GET() {
  try {
    const session = await getPerfilFromSession()
    if (!session || session.perfil.rol !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const admin = createAdminClient()
    const { data, error } = await admin
      .from('avisos')
      .select('*')
      .eq('tipo', 'pago')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    const avisos = (data ?? []) as Aviso[]
    const alumnoIds = [...new Set(avisos.map((a) => a.alumno_id).filter(Boolean))] as string[]
    const mensualidadIds = [
      ...new Set(avisos.map((a) => a.mensualidad_id).filter(Boolean)),
    ] as string[]

    const [{ data: alumnos }, { data: mensualidades }] = await Promise.all([
      alumnoIds.length
        ? admin
            .from('perfiles')
            .select('id, nombre_completo, email, matricula')
            .in('id', alumnoIds)
        : Promise.resolve({ data: [] }),
      mensualidadIds.length
        ? admin
            .from('mensualidades')
            .select('id, periodo, monto, estado')
            .in('id', mensualidadIds)
        : Promise.resolve({ data: [] }),
    ])

    const alumnoMap = new Map(
      (alumnos ?? []).map((a) => [
        a.id,
        a as Pick<Perfil, 'id' | 'nombre_completo' | 'email' | 'matricula'>,
      ])
    )
    const mensualidadMap = new Map(
      (mensualidades ?? []).map((m) => [
        m.id,
        m as Pick<Mensualidad, 'id' | 'periodo' | 'monto' | 'estado'>,
      ])
    )

    const rows: AvisoAdminRow[] = avisos.map((aviso) => ({
      ...aviso,
      alumno: aviso.alumno_id ? alumnoMap.get(aviso.alumno_id) ?? null : null,
      mensualidad: aviso.mensualidad_id
        ? mensualidadMap.get(aviso.mensualidad_id) ?? null
        : null,
    }))

    return NextResponse.json({ avisos: rows })
  } catch (error) {
    console.error('Admin avisos GET error:', error)
    return NextResponse.json({ error: 'Error al obtener avisos' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getPerfilFromSession()
    if (!session || session.perfil.rol !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const alumno_id = typeof body.alumno_id === 'string' ? body.alumno_id : ''
    const mensualidad_id =
      typeof body.mensualidad_id === 'string' ? body.mensualidad_id : null
    let titulo = typeof body.titulo === 'string' ? body.titulo.trim() : ''
    let contenido = typeof body.contenido === 'string' ? body.contenido.trim() : ''

    if (!alumno_id) {
      return NextResponse.json({ error: 'alumno_id es requerido' }, { status: 400 })
    }

    const admin = createAdminClient()

    const { data: alumno, error: alumnoError } = await admin
      .from('perfiles')
      .select('id, rol')
      .eq('id', alumno_id)
      .maybeSingle()

    if (alumnoError) {
      return NextResponse.json({ error: alumnoError.message }, { status: 400 })
    }

    if (!alumno || alumno.rol !== 'alumno') {
      return NextResponse.json({ error: 'Alumno no encontrado' }, { status: 404 })
    }

    let mensualidadRef: string | null = null

    if (mensualidad_id) {
      const { data: mensualidad, error: mensError } = await admin
        .from('mensualidades')
        .select('id, alumno_id, periodo, monto, fecha_vencimiento, estado')
        .eq('id', mensualidad_id)
        .maybeSingle()

      if (mensError) {
        return NextResponse.json({ error: mensError.message }, { status: 400 })
      }

      if (!mensualidad) {
        return NextResponse.json({ error: 'Mensualidad no encontrada' }, { status: 404 })
      }

      if (mensualidad.alumno_id !== alumno_id) {
        return NextResponse.json(
          { error: 'La mensualidad no pertenece al alumno seleccionado' },
          { status: 400 }
        )
      }

      mensualidadRef = mensualidad.id

      if (!titulo || !contenido) {
        const auto = buildRecordatorioPagoMensualidad({
          periodo: mensualidad.periodo,
          monto: Number(mensualidad.monto),
          fecha_vencimiento: mensualidad.fecha_vencimiento,
        })
        titulo = titulo || auto.titulo
        contenido = contenido || auto.contenido
      }
    }

    if (!titulo || !contenido) {
      return NextResponse.json(
        { error: 'Título y contenido son requeridos (o selecciona una mensualidad)' },
        { status: 400 }
      )
    }

    const { data, error } = await admin
      .from('avisos')
      .insert({
        profesor_id: session.userId,
        materia_id: null,
        alumno_id,
        mensualidad_id: mensualidadRef,
        titulo,
        contenido,
        tipo: 'pago',
        activo: true,
      })
      .select('*')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, aviso: data })
  } catch (error) {
    console.error('Admin avisos POST error:', error)
    return NextResponse.json({ error: 'Error al crear aviso' }, { status: 500 })
  }
}
