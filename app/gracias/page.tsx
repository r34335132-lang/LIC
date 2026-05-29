import type { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { WhatsAppIcon } from '@/components/marketing/whatsapp-icon'
import { WhatsAppLink } from '@/components/marketing/whatsapp-link'

export const metadata: Metadata = {
  title: 'Solicitud recibida',
  description: 'Gracias por solicitar información al Instituto Universitario de Durango.',
}

export default function GraciasPage() {
  return (
    <main className="flex min-h-screen items-center bg-slate-50 px-4 py-16">
      <div className="mx-auto max-w-2xl rounded-[1.75rem] border border-slate-200 bg-white p-8 text-center shadow-xl shadow-slate-200/60 sm:p-12">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-brand-primary/10">
          <CheckCircle2 className="h-11 w-11 text-brand-primary" />
        </div>
        <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
          ¡Te estamos conectando!
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-base font-medium leading-relaxed text-slate-600">
          Gracias por tu interés. Tu WhatsApp debería abrirse automáticamente en unos segundos. 
          Si no es así, un asesor de admisiones revisará tu programa y te contactará para explicarte requisitos, costos y cómo funciona la <strong>revalidación de materias</strong>.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button asChild className="h-12 rounded-full bg-brand-primary px-6 font-black text-white hover:bg-brand-primary/90">
            <WhatsAppLink message="¡Hola! Acabo de enviar mi formulario en la página web y quiero darle seguimiento a mi inscripción y ver lo de la revalidación de materias.">
              <WhatsAppIcon className="mr-2 h-5 w-5" />
              Ir a WhatsApp ahora
            </WhatsAppLink>
          </Button>
          <Button asChild variant="outline" className="h-12 rounded-full border-slate-300 px-6 font-bold">
            <Link href="/#oferta">Ver más programas</Link>
          </Button>
        </div>
      </div>
    </main>
  )
}