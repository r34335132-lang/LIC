import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getPerfilFromSession } from '@/lib/auth-server'
import {
  fechaVencimientoDesdeHoy,
  formatPeriodoMensualidad,
  mensualidadMontoDefault,
} from '@/lib/academico-utils'

export async function POST(request: Request) {
  try {
    const session = await getPerfilFromSession()
    if (!session || session.perfil.rol !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const mes = Number(body.mes)
    const anio = Number(body.anio)
    const monto = Number(body.monto ?? mensualidadMontoDefault())
    const programa_id =
      typeof body.programa_id === 'string' ? body.programa_id : undefined
    const fecha_vencimiento =
      typeof body.fecha_vencimiento === 'string'
        ? body.fecha_vencimiento
        : fechaVencimientoDesdeHoy()

    if (!mes || mes < 1 || mes > 12 || !anio || !monto) {
      return NextResponse.json(
        { error: 'mes, anio y monto son requeridos' },
        { status: 400 }
      )
    }

    const admin = createAdminClient()

    let alumnosQuery = admin
      .from('perfiles')
      .select('id')
      .eq('rol', 'alumno')

    if (programa_id) {
      alumnosQuery = alumnosQuery.eq('programa_id', programa_id)
    }

    const { data: alumnos, error: alError } = await alumnosQuery

    if (alError) {
      return NextResponse.json({ error: alError.message }, { status: 400 })
    }

    if (!alumnos?.length) {
      return NextResponse.json({ created: 0, skipped: 0 })
    }

    const periodo = formatPeriodoMensualidad(mes, anio)
    let created = 0
    let skipped = 0

    for (const alumno of alumnos) {
      const { data: existente } = await admin
        .from('mensualidades')
        .select('id')
        .eq('alumno_id', alumno.id)
        .eq('mes', mes)
        .eq('anio', anio)
        .maybeSingle()

      if (existente) {
        skipped++
        continue
      }

      const { error: insertError } = await admin.from('mensualidades').insert({
        alumno_id: alumno.id,
        concepto: `Mensualidad ${periodo}`,
        periodo,
        mes,
        anio,
        monto,
        moneda: 'MXN',
        estado: 'pendiente',
        fecha_vencimiento,
      })

      if (insertError) {
        if (/duplicate|unique/i.test(insertError.message)) {
          skipped++
        } else {
          console.error('Error insertando mensualidad:', insertError)
          skipped++
        }
      } else {
        created++
      }
    }

    return NextResponse.json({ created, skipped })
  } catch (error) {
    console.error('Generar mensualidades error:', error)
    return NextResponse.json(
      { error: 'Error al generar mensualidades' },
      { status: 500 }
    )
  }
}
