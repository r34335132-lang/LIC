import { HelpCircle } from 'lucide-react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { WhatsAppIcon } from '@/components/marketing/whatsapp-icon'
import { generalFaqs } from '@/lib/program-content'

export function FAQ() {
  return (
    <section id="faq" className="bg-white py-20 sm:py-24 lg:py-28">
      <div className="container mx-auto grid gap-10 px-4 md:px-6 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
        <div>
          <div className="mb-4 inline-flex items-center gap-2 border-l-4 border-brand-highlight bg-slate-50 px-4 py-2 text-xs font-black uppercase tracking-widest text-brand-primary">
            <HelpCircle className="h-4 w-4" />
            Preguntas frecuentes
          </div>
          <h2 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
            Dudas comunes antes de inscribirte
          </h2>
          <p className="mt-4 text-base font-medium leading-relaxed text-slate-600">
            Respuestas directas sobre validez oficial, modalidad, documentos, costos y próximos grupos.
          </p>
          <div className="mt-8 hidden border border-slate-200 bg-slate-50 p-5 lg:block">
            <WhatsAppIcon className="mb-3 h-6 w-6 text-brand-primary" />
            <p className="text-sm font-semibold leading-relaxed text-slate-700">
              Si necesitas confirmar datos de un programa, admisiones puede revisarlo contigo por WhatsApp.
            </p>
          </div>
        </div>

        <Accordion type="single" collapsible className="space-y-3">
          {generalFaqs.map((faq, index) => (
            <AccordionItem
              key={faq.question}
              value={`faq-${index}`}
              className="border border-slate-200 bg-slate-50 px-5 data-[state=open]:bg-white data-[state=open]:shadow-sm"
            >
              <AccordionTrigger className="text-left text-base font-black text-slate-950 hover:text-brand-primary hover:no-underline">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-sm font-medium leading-relaxed text-slate-600">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
