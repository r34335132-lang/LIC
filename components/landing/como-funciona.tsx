import { BookOpen, ClipboardCheck, FileText, MessageSquareText, Video, WalletCards } from 'lucide-react'

const pasos = [
  {
    icon: MessageSquareText,
    title: 'Solicita informes',
    text: 'Un asesor te explica el programa, duración, costos, requisitos y próxima fecha de inicio.',
  },
  {
    icon: FileText,
    title: 'Entrega documentos',
    text: 'Te guiamos con los requisitos de ingreso y la apertura de tu expediente académico.',
  },
  {
    icon: WalletCards,
    title: 'Activa tu inscripción',
    text: 'Aprovecha la promoción vigente y confirma tu lugar en el grupo disponible.',
  },
  {
    icon: Video,
    title: 'Toma clases virtuales',
    text: 'Accede a sesiones, actividades y materiales desde tu computadora o celular.',
  },
  {
    icon: BookOpen,
    title: 'Avanza por módulos',
    text: 'Cursa materias con seguimiento docente y objetivos claros por periodo.',
  },
  {
    icon: ClipboardCheck,
    title: 'Da seguimiento a tu avance',
    text: 'Consulta tareas, calificaciones y orientación académica durante tu trayectoria.',
  },
]

export function ComoFunciona() {
  return (
    <section id="como-funciona" className="bg-white py-20 sm:py-24 lg:py-28">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mx-auto mb-14 max-w-4xl text-center">
          <div className="mb-4 inline-flex rounded-full bg-brand-primary/10 px-4 py-2 text-xs font-black uppercase tracking-widest text-brand-primary">
            Proceso de ingreso
          </div>
          <h2 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
            De solicitar informes a iniciar clases
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base font-medium leading-relaxed text-slate-600 sm:text-lg">
            Un proceso claro para que sepas qué sigue, qué documentos necesitas y cómo comenzar sin trámites confusos.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {pasos.map((paso, index) => (
            <div key={paso.title} className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-6">
              <div className="mb-5 flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-primary text-white">
                  <paso.icon className="h-6 w-6" />
                </div>
                <span className="text-sm font-black text-brand-highlight">{String(index + 1).padStart(2, '0')}</span>
              </div>
              <h3 className="text-xl font-black text-slate-950">{paso.title}</h3>
              <p className="mt-3 text-sm font-medium leading-relaxed text-slate-600">{paso.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
