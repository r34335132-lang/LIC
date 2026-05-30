import crypto from 'crypto'
import type { SupabaseClient } from '@supabase/supabase-js'

export function generateTempPassword(length = 12): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$'
  const bytes = crypto.randomBytes(length)
  let password = ''
  for (let i = 0; i < length; i++) {
    password += chars[bytes[i]! % chars.length]
  }
  return password
}

export async function generateMatricula(adminClient: SupabaseClient): Promise<string> {
  const year = new Date().getFullYear()
  const prefix = `IUD${year}`

  const { data } = await adminClient
    .from('perfiles')
    .select('matricula')
    .like('matricula', `${prefix}%`)
    .order('matricula', { ascending: false })
    .limit(1)

  let nextNumber = 1
  if (data && data.length > 0 && data[0]?.matricula) {
    const lastNum = parseInt(data[0].matricula.replace(prefix, ''), 10)
    if (!isNaN(lastNum)) nextNumber = lastNum + 1
  }

  return `${prefix}${String(nextNumber).padStart(4, '0')}`
}

// TODO: Enviar credenciales por email con Resend cuando RESEND_API_KEY esté configurado
export async function sendWelcomeEmail(_params: {
  email: string
  nombre: string
  matricula: string
  tempPassword: string
}): Promise<void> {
  // const resend = new Resend(process.env.RESEND_API_KEY)
  // await resend.emails.send({ ... })
}
