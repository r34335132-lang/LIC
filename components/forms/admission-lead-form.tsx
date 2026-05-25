'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { programas } from '@/lib/data'
import { admissionLeadSchema, type AdmissionLeadInput } from '@/lib/lead-schema'
import { trackEvent } from '@/lib/marketing'

type FormState = {
  nombre: string
  telefono: string
  correo: string
  programa: string
  mensaje: string
}

type AdmissionLeadFormProps = {
  defaultProgramId?: string
  source?: string
  title?: string
  description?: string
  submitLabel?: string
}

const initialState: FormState = {
  nombre: '',
  telefono: '',
  correo: '',
  programa: '',
  mensaje: '',
}

function getTrackingContext(source: string) {
  if (typeof window === 'undefined') {
    return {
      fuente: source,
      utmSource: '',
      utmMedium: '',
      utmCampaign: '',
      utmContent: '',
      utmTerm: '',
      landingPath: '',
    }
  }

  const params = new URLSearchParams(window.location.search)

  return {
    fuente: source,
    utmSource: params.get('utm_source') || '',
    utmMedium: params.get('utm_medium') || '',
    utmCampaign: params.get('utm_campaign') || '',
    utmContent: params.get('utm_content') || '',
    utmTerm: params.get('utm_term') || '',
    landingPath: `${window.location.pathname}${window.location.search}`,
  }
}

export function AdmissionLeadForm({
  defaultProgramId,
  source = 'landing',
  title = 'Solicitud de información',
  description = 'Completa tus datos y un asesor de admisiones te contactará para resolver dudas, costos y requisitos.',
  submitLabel = 'Enviar solicitud',
}: AdmissionLeadFormProps) {
  const router = useRouter()
  const [values, setValues] = useState<FormState>({ ...initialState, programa: defaultProgramId || '' })
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})
  const [formError, setFormError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const selectedProgram = useMemo(
    () => programas.find((programa) => programa.id === values.programa),
    [values.programa]
  )

  const updateValue = (field: keyof FormState, value: string) => {
    setValues((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError('')
    setErrors({})

    const payload: AdmissionLeadInput = {
      ...values,
      ...getTrackingContext(source),
    }

    const parsed = admissionLeadSchema.safeParse(payload)

    if (!parsed.success) {
      const fieldErrors: Partial<Record<keyof FormState, string>> = {}

      parsed.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof FormState
        if (field in values) fieldErrors[field] = issue.message
      })

      setErrors(fieldErrors)
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data),
      })

      if (!response.ok) {
        throw new Error('No se pudo enviar la solicitud')
      }

      trackEvent('submit_form', {
        source,
        programId: parsed.data.programa,
        programName: selectedProgram?.nombre,
      })

      setIsSuccess(true)
      setTimeout(() => {
        router.push(`/gracias?programa=${encodeURIComponent(parsed.data.programa)}`)
      }, 900)
    } catch {
      setFormError('No pudimos enviar tu solicitud. Inténtalo de nuevo o escríbenos por WhatsApp.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="flex min-h-[420px] flex-col items-center justify-center rounded-2xl border border-brand-primary/20 bg-brand-primary/5 px-6 py-12 text-center">
        <CheckCircle2 className="mb-5 h-16 w-16 text-brand-primary" />
        <h3 className="text-2xl font-black text-slate-950">Solicitud recibida</h3>
        <p className="mt-3 max-w-md text-sm font-medium leading-relaxed text-slate-600">
          Gracias. Estamos preparando tu seguimiento y en un momento verás la confirmación de admisiones.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <h3 className="text-2xl font-black tracking-tight text-slate-950 dark:text-white">{title}</h3>
        <p className="mt-2 text-sm font-medium leading-relaxed text-slate-600 dark:text-zinc-400">
          {description}
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="nombre">Nombre completo</Label>
        <Input
          id="nombre"
          name="nombre"
          value={values.nombre}
          onChange={(event) => updateValue('nombre', event.target.value)}
          placeholder="Nombre y apellidos"
          className="h-12 rounded-xl bg-white"
          autoComplete="name"
        />
        {errors.nombre && <p className="text-xs font-semibold text-red-600">{errors.nombre}</p>}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="telefono">Teléfono</Label>
          <Input
            id="telefono"
            name="telefono"
            value={values.telefono}
            onChange={(event) => updateValue('telefono', event.target.value)}
            placeholder="10 dígitos"
            className="h-12 rounded-xl bg-white"
            autoComplete="tel"
          />
          {errors.telefono && <p className="text-xs font-semibold text-red-600">{errors.telefono}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="correo">Correo</Label>
          <Input
            id="correo"
            name="correo"
            type="email"
            value={values.correo}
            onChange={(event) => updateValue('correo', event.target.value)}
            placeholder="tu@email.com"
            className="h-12 rounded-xl bg-white"
            autoComplete="email"
          />
          {errors.correo && <p className="text-xs font-semibold text-red-600">{errors.correo}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="programa">Programa de interés</Label>
        <Select value={values.programa} onValueChange={(value) => updateValue('programa', value)}>
          <SelectTrigger id="programa" className="h-12 rounded-xl bg-white">
            <SelectValue placeholder="Selecciona un programa" />
          </SelectTrigger>
          <SelectContent>
            {programas
              .filter((programa) => programa.rvoe)
              .map((programa) => (
                <SelectItem key={programa.id} value={programa.id}>
                  {programa.nombre}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
        {errors.programa && <p className="text-xs font-semibold text-red-600">{errors.programa}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="mensaje">Mensaje</Label>
        <Textarea
          id="mensaje"
          name="mensaje"
          value={values.mensaje}
          onChange={(event) => updateValue('mensaje', event.target.value)}
          placeholder="Cuéntanos si trabajas, quieres revalidar materias o tienes dudas de costos."
          rows={4}
          className="resize-none rounded-xl bg-white"
        />
        {errors.mensaje && <p className="text-xs font-semibold text-red-600">{errors.mensaje}</p>}
      </div>

      {formError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {formError}
        </div>
      )}

      <Button
        type="submit"
        disabled={isSubmitting}
        className="h-14 w-full rounded-xl bg-brand-primary text-sm font-black uppercase tracking-wider text-white shadow-lg shadow-brand-primary/15 hover:bg-brand-primary/90"
      >
        {isSubmitting ? (
          <span className="flex items-center gap-2">
            <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            Enviando...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            {submitLabel}
            <Send className="h-4 w-4" />
          </span>
        )}
      </Button>

      <p className="text-center text-xs font-medium leading-relaxed text-slate-500 dark:text-zinc-500">
        Tus datos se usarán solo para seguimiento de admisiones y se tratarán conforme al aviso de privacidad.
      </p>
    </form>
  )
}
