import crypto from 'crypto'
import { Resend } from 'resend'
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

type Rol = 'alumno' | 'profesor'

interface WelcomeEmailParams {
  email: string
  nombre: string
  tempPassword: string
  matricula?: string | null
  rol?: Rol
}

interface SendEmailResult {
  sent: boolean
  skipped?: boolean
  error?: string
}

function getLoginUrl(): string {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, '') ||
    'http://localhost:3000'
  return `${base}/login`
}

function buildWelcomeEmailHtml(params: WelcomeEmailParams, loginUrl: string): string {
  const { nombre, email, tempPassword, matricula, rol } = params
  const esAlumno = rol !== 'profesor'
  const saludoRol = esAlumno ? 'estudiante' : 'docente'

  return `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#0f172a">
    <h1 style="font-size:22px;margin:0 0 8px">Bienvenido(a) al Instituto Universitario de Durango</h1>
    <p style="font-size:15px;line-height:1.6;color:#334155">
      Hola <strong>${nombre}</strong>, tu cuenta como ${saludoRol} ha sido creada.
      A continuación encontrarás tus credenciales de acceso.
    </p>
    <table style="width:100%;border-collapse:collapse;margin:20px 0;font-size:14px">
      <tbody>
        <tr>
          <td style="padding:10px 12px;background:#f1f5f9;border:1px solid #e2e8f0;font-weight:bold">Nombre</td>
          <td style="padding:10px 12px;border:1px solid #e2e8f0">${nombre}</td>
        </tr>
        <tr>
          <td style="padding:10px 12px;background:#f1f5f9;border:1px solid #e2e8f0;font-weight:bold">Correo</td>
          <td style="padding:10px 12px;border:1px solid #e2e8f0">${email}</td>
        </tr>
        ${
          matricula
            ? `<tr>
          <td style="padding:10px 12px;background:#f1f5f9;border:1px solid #e2e8f0;font-weight:bold">Matrícula</td>
          <td style="padding:10px 12px;border:1px solid #e2e8f0">${matricula}</td>
        </tr>`
            : ''
        }
        <tr>
          <td style="padding:10px 12px;background:#f1f5f9;border:1px solid #e2e8f0;font-weight:bold">Contraseña temporal</td>
          <td style="padding:10px 12px;border:1px solid #e2e8f0"><code>${tempPassword}</code></td>
        </tr>
      </tbody>
    </table>
    <p style="font-size:14px;line-height:1.6;color:#334155">
      Por seguridad, te recomendamos cambiar tu contraseña después de iniciar sesión.
    </p>
    <p style="text-align:center;margin:28px 0">
      <a href="${loginUrl}" style="background:#1e3a8a;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:bold;display:inline-block">
        Entrar a la plataforma
      </a>
    </p>
    <p style="font-size:12px;color:#94a3b8">
      Si el botón no funciona, copia y pega esta liga en tu navegador:<br />
      <a href="${loginUrl}" style="color:#1e3a8a">${loginUrl}</a>
    </p>
  </div>`
}

export async function sendWelcomeEmail(
  params: WelcomeEmailParams
): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim()
  const from =
    process.env.RESEND_FROM_EMAIL?.trim() ||
    'Admisiones IUD <onboarding@resend.dev>'

  if (!apiKey) {
    console.warn(
      '[sendWelcomeEmail] RESEND_API_KEY no configurada — se omite el envío de correo.'
    )
    return { sent: false, skipped: true }
  }

  try {
    const resend = new Resend(apiKey)
    const loginUrl = getLoginUrl()

    const { error } = await resend.emails.send({
      from,
      to: params.email,
      subject: 'Tus credenciales de acceso — Instituto Universitario de Durango',
      html: buildWelcomeEmailHtml(params, loginUrl),
    })

    if (error) {
      console.error('[sendWelcomeEmail] Error de Resend:', error)
      return { sent: false, error: error.message }
    }

    return { sent: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error desconocido'
    console.error('[sendWelcomeEmail] Excepción al enviar correo:', err)
    return { sent: false, error: message }
  }
}

function buildPasswordResetEmailHtml(
  params: { nombre: string; email: string; tempPassword: string },
  loginUrl: string
): string {
  return `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#0f172a">
    <h1 style="font-size:22px;margin:0 0 8px">Contraseña restablecida</h1>
    <p style="font-size:15px;line-height:1.6;color:#334155">
      Hola <strong>${params.nombre}</strong>, un administrador restableció tu contraseña de acceso al campus virtual.
    </p>
    <table style="width:100%;border-collapse:collapse;margin:20px 0;font-size:14px">
      <tbody>
        <tr>
          <td style="padding:10px 12px;background:#f1f5f9;border:1px solid #e2e8f0;font-weight:bold">Correo</td>
          <td style="padding:10px 12px;border:1px solid #e2e8f0">${params.email}</td>
        </tr>
        <tr>
          <td style="padding:10px 12px;background:#f1f5f9;border:1px solid #e2e8f0;font-weight:bold">Nueva contraseña</td>
          <td style="padding:10px 12px;border:1px solid #e2e8f0"><code>${params.tempPassword}</code></td>
        </tr>
      </tbody>
    </table>
    <p style="font-size:14px;line-height:1.6;color:#334155">
      Te recomendamos cambiar tu contraseña después de iniciar sesión.
    </p>
    <p style="text-align:center;margin:28px 0">
      <a href="${loginUrl}" style="background:#1e3a8a;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:bold;display:inline-block">
        Entrar a la plataforma
      </a>
    </p>
  </div>`
}

export async function sendPasswordResetEmail(params: {
  email: string
  nombre: string
  tempPassword: string
}): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim()
  const from =
    process.env.RESEND_FROM_EMAIL?.trim() ||
    'Admisiones IUD <onboarding@resend.dev>'

  if (!apiKey) {
    console.warn('[sendPasswordResetEmail] RESEND_API_KEY no configurada.')
    return { sent: false, skipped: true }
  }

  try {
    const resend = new Resend(apiKey)
    const loginUrl = getLoginUrl()
    const { error } = await resend.emails.send({
      from,
      to: params.email,
      subject: 'Tu contraseña fue restablecida — Instituto Universitario de Durango',
      html: buildPasswordResetEmailHtml(params, loginUrl),
    })
    if (error) return { sent: false, error: error.message }
    return { sent: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error desconocido'
    return { sent: false, error: message }
  }
}
