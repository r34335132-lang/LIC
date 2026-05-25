import { z } from 'zod'

export const admissionLeadSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(3, 'Escribe tu nombre completo')
    .max(120, 'El nombre es demasiado largo'),
  telefono: z
    .string()
    .trim()
    .regex(/^[0-9+\s().-]{8,20}$/, 'Escribe un teléfono válido'),
  correo: z
    .string()
    .trim()
    .email('Escribe un correo válido')
    .max(140, 'El correo es demasiado largo'),
  programa: z.string().trim().min(1, 'Selecciona un programa'),
  mensaje: z.string().trim().max(800, 'El mensaje es demasiado largo').optional().default(''),
  fuente: z.string().trim().max(120).optional().default('web'),
  utmSource: z.string().trim().max(120).optional().default(''),
  utmMedium: z.string().trim().max(120).optional().default(''),
  utmCampaign: z.string().trim().max(160).optional().default(''),
  utmContent: z.string().trim().max(160).optional().default(''),
  utmTerm: z.string().trim().max(160).optional().default(''),
  landingPath: z.string().trim().max(240).optional().default(''),
})

export type AdmissionLeadInput = z.input<typeof admissionLeadSchema>
export type AdmissionLead = z.output<typeof admissionLeadSchema>
