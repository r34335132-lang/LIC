import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getPerfilFromSession } from '@/lib/auth-server'
import { planPsicologia } from '@/lib/planes/psicologia'

export async function POST() {
  try {
    const session = await getPerfilFromSession()
    if (!session || session.perfil.rol !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const admin = createAdminClient()

    await admin.from('programas').upsert(
      {
        id: 'psicologia',
        nombre: 'Licenciatura en Psicología',
        tipo: 'licenciatura',
        modalidad: 'Virtual',
        duracion: '4 años',
        rvoe: null,
        descripcion: null,
        imagen_url: null,
        activo: true,
      },
      { onConflict: 'id' }
    )

    let inserted = 0
    let skipped = 0

    for (const periodo of planPsicologia) {
      for (const materia of periodo.materias) {
        const { data: existing } = await admin
          .from('materias')
          .select('id')
          .eq('programa_id', 'psicologia')
          .eq('clave', materia.clave)
          .maybeSingle()

        if (existing) {
          skipped++
          continue
        }

        const { error } = await admin.from('materias').insert({
          programa_id: 'psicologia',
          nombre: materia.nombre,
          clave: materia.clave,
          periodo: periodo.periodo,
          nombre_periodo: periodo.nombre,
          seriacion: materia.seriacion,
          horas_docente: materia.horasDocente,
          horas_independientes: materia.horasIndependientes,
          creditos: materia.creditos,
          instalacion: materia.instalacion,
        })

        if (error) {
          console.error('Error inserting materia:', materia.clave, error)
          skipped++
        } else {
          inserted++
        }
      }
    }

    return NextResponse.json({ success: true, inserted, skipped })
  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json(
      { error: 'Error al cargar materias' },
      { status: 500 }
    )
  }
}
