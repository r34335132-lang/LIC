import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getPerfilFromSession } from '@/lib/auth-server'
import type { Mensualidad } from '@/types/database'

export const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export type MensualidadPagoContext = {
  admin: ReturnType<typeof createAdminClient>
  mensualidad: Mensualidad
  userId: string
}

export async function loadMensualidadForAlumnoPayment(
  id: string
): Promise<
  | { ok: true; data: MensualidadPagoContext }
  | { ok: false; response: NextResponse }
> {
  const session = await getPerfilFromSession()
  if (!session || session.perfil.rol !== 'alumno') {
    return {
      ok: false,
      response: NextResponse.json({ error: 'No autorizado' }, { status: 401 }),
    }
  }

  if (!id || !UUID_PATTERN.test(id)) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: 'El id de la mensualidad no es un UUID válido' },
        { status: 400 }
      ),
    }
  }

  const admin = createAdminClient()
  const { data: mensualidad, error: fetchError } = await admin
    .from('mensualidades')
    .select('*')
    .eq('id', id)
    .eq('alumno_id', session.userId)
    .maybeSingle()

  if (fetchError) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: 'No se pudo consultar la mensualidad' },
        { status: 500 }
      ),
    }
  }

  if (!mensualidad) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Mensualidad no encontrada' }, { status: 404 }),
    }
  }

  const m = mensualidad as Mensualidad

  if (m.estado === 'pagado' || m.estado_pago === 'pagado') {
    return {
      ok: false,
      response: NextResponse.json(
        { error: 'Esta mensualidad ya está pagada' },
        { status: 400 }
      ),
    }
  }

  const amount = Number(m.monto)
  const currency = (m.moneda || 'MXN').trim().toUpperCase()

  if (!Number.isFinite(amount) || amount <= 0) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: 'La mensualidad tiene un monto inválido' },
        { status: 400 }
      ),
    }
  }

  if (currency !== 'MXN') {
    return {
      ok: false,
      response: NextResponse.json(
        { error: 'La moneda de la mensualidad debe ser MXN' },
        { status: 400 }
      ),
    }
  }

  return {
    ok: true,
    data: { admin, mensualidad: m, userId: session.userId },
  }
}
