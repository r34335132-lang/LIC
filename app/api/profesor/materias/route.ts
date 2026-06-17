import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getPerfilFromSession } from '@/lib/auth-server'

type MateriaStats = {
  actividadesActivas: number
  proximaEntrega: string | null
  proximaTareaTitulo: string | null
  entregasPorRevisar: number
}

export async function GET() {
  try {
    const session = await getPerfilFromSession()
    if (
      !session ||
      (session.perfil.rol !== 'profesor' && session.perfil.rol !== 'admin')
    ) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const admin = createAdminClient()
    const profesorId = session.userId

    const { data, error } = await admin
      .from('profesor_materias')
      .select('*, materia:materias(*)')
      .eq('profesor_id', profesorId)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    const materias = data ?? []
    const materiaIds = materias.map((pm) => pm.materia_id).filter(Boolean)

    const statsByMateria: Record<string, MateriaStats> = {}
    for (const id of materiaIds) {
      statsByMateria[id] = {
        actividadesActivas: 0,
        proximaEntrega: null,
        proximaTareaTitulo: null,
        entregasPorRevisar: 0,
      }
    }

    if (materiaIds.length > 0) {
      const now = new Date().toISOString()
      const { data: actividades } = await admin
        .from('actividades')
        .select('id, materia_id, titulo, fecha_entrega, activo')
        .in('materia_id', materiaIds)
        .eq('activo', true)

      for (const act of actividades ?? []) {
        const stats = statsByMateria[act.materia_id]
        if (!stats) continue
        stats.actividadesActivas += 1
        if (act.fecha_entrega && act.fecha_entrega >= now) {
          if (!stats.proximaEntrega || act.fecha_entrega < stats.proximaEntrega) {
            stats.proximaEntrega = act.fecha_entrega
            stats.proximaTareaTitulo = act.titulo
          }
        }
      }

      const actividadIds = (actividades ?? []).map((a) => a.id)
      if (actividadIds.length > 0) {
        const { data: entregas } = await admin
          .from('actividad_entregas')
          .select('id, actividad_id, actividades!inner(materia_id)')
          .in('actividad_id', actividadIds)
          .eq('estado', 'entregada')

        for (const ent of entregas ?? []) {
          const actividadesInner = ent.actividades as { materia_id: string } | { materia_id: string }[]
          const materiaId = Array.isArray(actividadesInner)
            ? actividadesInner[0]?.materia_id
            : actividadesInner?.materia_id
          if (materiaId && statsByMateria[materiaId]) {
            statsByMateria[materiaId].entregasPorRevisar += 1
          }
        }
      }
    }

    const materiasConStats = materias.map((pm) => ({
      ...pm,
      stats: statsByMateria[pm.materia_id] ?? {
        actividadesActivas: 0,
        proximaEntrega: null,
        proximaTareaTitulo: null,
        entregasPorRevisar: 0,
      },
    }))

    return NextResponse.json({ materias: materiasConStats })
  } catch (error) {
    console.error('Profesor materias GET error:', error)
    return NextResponse.json(
      { error: 'Error al obtener materias' },
      { status: 500 }
    )
  }
}
