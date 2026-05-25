import { NextResponse } from 'next/server'
import { programas } from '@/lib/data'
import { admissionLeadSchema, type AdmissionLead } from '@/lib/lead-schema'

async function sendToGoogleSheets(lead: AdmissionLead) {
  const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL
  if (!webhookUrl) return false

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(lead),
  })

  if (!response.ok) {
    throw new Error('Google Sheets webhook rejected the lead')
  }

  return true
}

async function sendToSupabase(lead: AdmissionLead) {
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !supabaseKey) return false

  const response = await fetch(`${supabaseUrl}/rest/v1/leads`, {
    method: 'POST',
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({
      nombre: lead.nombre,
      telefono: lead.telefono,
      correo: lead.correo,
      programa: lead.programa,
      mensaje: lead.mensaje,
      fuente: lead.fuente,
      utm_source: lead.utmSource,
      utm_medium: lead.utmMedium,
      utm_campaign: lead.utmCampaign,
      utm_content: lead.utmContent,
      utm_term: lead.utmTerm,
      landing_path: lead.landingPath,
    }),
  })

  if (!response.ok) {
    throw new Error('Supabase rejected the lead')
  }

  return true
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const parsed = admissionLeadSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, errors: parsed.error.flatten().fieldErrors },
      { status: 400 }
    )
  }

  const programExists = programas.some((programa) => programa.id === parsed.data.programa)

  if (!programExists) {
    return NextResponse.json(
      { ok: false, errors: { programa: ['Selecciona un programa válido'] } },
      { status: 400 }
    )
  }

  const storageTargets: string[] = []
  const [googleSheetsStored, supabaseStored] = await Promise.all([
    sendToGoogleSheets(parsed.data),
    sendToSupabase(parsed.data),
  ])

  if (googleSheetsStored) storageTargets.push('google_sheets')
  if (supabaseStored) storageTargets.push('supabase')

  return NextResponse.json({
    ok: true,
    storage: storageTargets.length > 0 ? storageTargets : ['not_configured'],
  })
}
