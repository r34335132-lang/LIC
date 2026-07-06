import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getPerfilFromSession } from '@/lib/auth-server'
import {
  fechaVencimientoDesdeHoy,
  formatPeriodoMensualidad,
  mensualidadMontoDefault,
  resolverEstadoMensualidad,
} from '@/lib/academico-utils'
import type { Mensualidad, Perfil } from '@/types/database'

export async function GET(request: Request) {
  try {
    const session = await getPerfilFromSession()
    if (!session || session.perfil.rol !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const estado = searchParams.get('estado')
    const alumnoId = searchParams.get('alumno_id')

    const admin = createAdminClient()
    let query = admin
      .from('mensualidades')
      .select('*')
      .order('anio', { ascending: false })
      .order('mes', { ascending: false })

    if (estado && estado !== 'todos') {
      query = query.eq('estado', estado)
    }

    if (alumnoId) {
      query = query.eq('alumno_id', alumnoId)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    const mensualidades = (data ?? []) as Mensualidad[]
    const alumnoIds = [...new Set(mensualidades.map((m) => m.alumno_id))]

    const { data: perfiles } = await admin
      .from('perfiles')
      .select('id, nombre_completo, email, matricula')
      .in('id', alumnoIds.length ? alumnoIds : ['00000000-0000-0000-0000-000000000000'])

    const alumnoMap = new Map(
      (perfiles ?? []).map((p) => [p.id, p as Pick<Perfil, 'id' | 'nombre_completo' | 'email' | 'matricula'>])
    )

    const rows = mensualidades.map((m) => ({
      ...m,
      estadoEfectivo: resolverEstadoMensualidad(m.estado, m.fecha_vencimiento),
      alumno: alumnoMap.get(m.alumno_id) ?? null,
    }))

    return NextResponse.json({ mensualidades: rows })
  } catch (error) {
    console.error('Admin mensualidades GET error:', error)
    return NextResponse.json(
      { error: 'Error al obtener mensualidades' },
      { status: 500 }
    )
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
    const mes = Number(body.mes)
    const anio = Number(body.anio)
    const monto = Number(body.monto ?? mensualidadMontoDefault())
    const concepto =
      typeof body.concepto === 'string' && body.concepto.trim()
        ? body.concepto.trim()
        : undefined
    const fecha_vencimiento =
      typeof body.fecha_vencimiento === 'string' && body.fecha_vencimiento
        ? body.fecha_vencimiento
        : fechaVencimientoDesdeHoy()

    if (!alumno_id) {
      return NextResponse.json({ error: 'alumno_id es requerido' }, { status: 400 })
    }

    if (!mes || mes < 1 || mes > 12 || !anio || !monto) {
      return NextResponse.json(
        { error: 'mes, anio y monto son requeridos' },
        { status: 400 }
      )
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

    const { data: existente } = await admin
      .from('mensualidades')
      .select('id')
      .eq('alumno_id', alumno_id)
      .eq('mes', mes)
      .eq('anio', anio)
      .maybeSingle()

    if (existente) {
      return NextResponse.json(
        { error: 'Ya existe una mensualidad para ese alumno en el periodo indicado' },
        { status: 409 }
      )
    }

    const periodo = formatPeriodoMensualidad(mes, anio)

    const { data, error } = await admin
      .from('mensualidades')
      .insert({
        alumno_id,
        concepto: concepto ?? `Mensualidad ${periodo}`,
        periodo,
        mes,
        anio,
        monto,
        moneda: 'MXN',
        estado: 'pendiente',
        fecha_vencimiento,
      })
      .select()
      .single()

    if (error) {
      if (/duplicate|unique/i.test(error.message)) {
        return NextResponse.json(
          { error: 'Ya existe una mensualidad para ese alumno en el periodo indicado' },
          { status: 409 }
        )
      }
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ mensualidad: data })
  } catch (error) {
    console.error('Admin mensualidades POST error:', error)
    return NextResponse.json(
      { error: 'Error al crear mensualidad' },
      { status: 500 }
    )
  }
}
