import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { withProgramaDuracion } from '@/lib/programa-utils'
import type { Programa } from '@/types/database'

export async function GET() {
  try {
    const admin = createAdminClient()
    const { data, error } = await admin
      .from('programas')
      .select('id, nombre, tipo, modalidad, duracion, rvoe, descripcion, imagen_url, activo, created_at')
      .eq('activo', true)
      .order('nombre')

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    const programas = ((data ?? []) as Programa[]).map(withProgramaDuracion)
    return NextResponse.json({ programas })
  } catch (error) {
    console.error('GET programas error:', error)
    return NextResponse.json({ error: 'Error al obtener programas' }, { status: 500 })
  }
}
