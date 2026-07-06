import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getPerfilFromSession } from '@/lib/auth-server'
import type { Perfil } from '@/types/database'

export async function GET() {
  try {
    const session = await getPerfilFromSession()
    if (!session || session.perfil.rol !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const admin = createAdminClient()
    const { data, error } = await admin
      .from('perfiles')
      .select('id, nombre_completo, email, matricula, programa_id')
      .eq('rol', 'alumno')
      .order('nombre_completo', { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({
      alumnos: (data ?? []) as Pick<
        Perfil,
        'id' | 'nombre_completo' | 'email' | 'matricula' | 'programa_id'
      >[],
    })
  } catch (error) {
    console.error('Admin alumnos GET error:', error)
    return NextResponse.json({ error: 'Error al obtener alumnos' }, { status: 500 })
  }
}
