import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getPerfilFromSession } from '@/lib/auth-server'
import { loadProfesorMateriaAsignacion } from '@/lib/profesor-materias'
import {
  generarSugerenciasIA,
  generarSugerenciasPlantilla,
} from '@/lib/sugerencias-tareas'

export const maxDuration = 30

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getPerfilFromSession()
    if (
      !session ||
      (session.perfil.rol !== 'profesor' && session.perfil.rol !== 'admin')
    ) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id: profesorMateriaId } = await params
    const ronda = Math.max(0, Number(new URL(request.url).searchParams.get('ronda')) || 0)
    const admin = createAdminClient()

    const asignacion = await loadProfesorMateriaAsignacion(admin, profesorMateriaId, {
      userId: session.userId,
      rol: session.perfil.rol,
    })
    if (!asignacion.ok) {
      return NextResponse.json({ error: asignacion.error }, { status: asignacion.status })
    }

    const materiaId = asignacion.asignacion.materia_id
    const [{ data: materia }, { data: actividades }] = await Promise.all([
      admin
        .from('materias')
        .select('nombre, periodo, programa:programas(nombre)')
        .eq('id', materiaId)
        .maybeSingle(),
      admin
        .from('actividades')
        .select('titulo, unidad, fecha_entrega')
        .eq('materia_id', materiaId)
        .order('created_at', { ascending: false }),
    ])

    if (!materia) {
      return NextResponse.json({ error: 'Materia no encontrada' }, { status: 404 })
    }

    const programaRel = materia.programa as { nombre: string } | { nombre: string }[] | null
    const programa = Array.isArray(programaRel) ? programaRel[0] : programaRel
    const contexto = {
      materia: materia.nombre as string,
      programa: programa?.nombre ?? null,
      periodo: typeof materia.periodo === 'number' ? materia.periodo : null,
      tareasExistentes: actividades ?? [],
    }

    const sugerenciasIA = await generarSugerenciasIA(contexto)
    if (sugerenciasIA) {
      return NextResponse.json({ sugerencias: sugerenciasIA, origen: 'ia' })
    }

    return NextResponse.json({
      sugerencias: generarSugerenciasPlantilla(contexto, ronda),
      origen: 'plantillas',
    })
  } catch (error) {
    console.error('Sugerencias tareas error:', error)
    return NextResponse.json({ error: 'Error al generar sugerencias' }, { status: 500 })
  }
}
