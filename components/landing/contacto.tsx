import { Clock, Mail, MapPin, Phone, ShieldCheck } from 'lucide-react'
import { AdmissionLeadForm } from '@/components/forms/admission-lead-form'
import { WhatsAppIcon } from '@/components/marketing/whatsapp-icon'
import { WhatsAppLink } from '@/components/marketing/whatsapp-link'

const contactItems = [
  {
    icon: Phone,
    label: 'Admisiones',
    value: '(618) 123-4567',
  },
  {
    icon: Mail,
    label: 'Correo',
    value: 'admisiones@iud.edu.mx',
  },
  {
    icon: Clock,
    label: 'Atención',
    value: 'Lunes a sábado',
  },
  {
    icon: MapPin,
    label: 'Ubicación',
    value: 'Durango, Dgo.',
  },
]

export function Contacto() {
  return (
    <section id="contacto" className="bg-slate-950 py-20 text-white sm:py-24 lg:py-28">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div className="max-w-2xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-widest text-brand-highlight">
              <ShieldCheck className="h-4 w-4" />
              Departamento de admisiones
            </div>
            <h2 className="text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
              Solicita información y recibe acompañamiento para inscribirte
            </h2>
            <p className="mt-5 text-base font-medium leading-relaxed text-white/75 sm:text-lg">
              Cuéntanos qué programa te interesa. Un asesor te contactará para confirmar costos, requisitos, RVOE y fechas de inicio.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {contactItems.map((item) => (
                <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <item.icon className="mb-4 h-6 w-6 text-brand-highlight" />
                  <p className="text-xs font-black uppercase tracking-widest text-white/45">{item.label}</p>
                  <p className="mt-1 font-bold text-white">{item.value}</p>
                </div>
              ))}
            </div>

            <WhatsAppLink className="mt-8 inline-flex h-12 items-center gap-2 rounded-full bg-white px-5 text-sm font-black text-brand-primary transition hover:bg-brand-highlight hover:text-slate-950">
              <WhatsAppIcon className="h-5 w-5" />
              Quiero hablar con un asesor
            </WhatsAppLink>
          </div>

          <div className="rounded-[1.5rem] border border-white/10 bg-white p-5 text-slate-950 shadow-2xl sm:p-7">
            <AdmissionLeadForm source="landing_contacto" submitLabel="Enviar solicitud de informes" />
          </div>
        </div>
      </div>
    </section>
  )
}
