import Link from 'next/link'
import { ChevronRight, GraduationCap, Mail, MapPin, Phone, ShieldCheck } from 'lucide-react'
import { RVOE_CONSULTA_URL } from '@/lib/marketing'

const programLinks = [
  { label: 'Preparatoria en 2 años', href: '/programas/prep' },
  { label: 'Licenciatura en Derecho', href: '/programas/lic-derecho' },
  { label: 'Licenciatura en Psicología', href: '/programas/lic-psicologia' },
  { label: 'Maestría en Educación', href: '/programas/mae-educacion' },
]

const institutionLinks = [
  { label: 'Respaldo oficial', href: '/#respaldo-oficial' },
  { label: 'Oferta académica', href: '/#oferta' },
  { label: 'Preguntas frecuentes', href: '/#faq' },
  { label: 'Admisiones', href: '/#contacto' },
]

export function Footer() {
  return (
    <footer className="border-t-8 border-brand-primary bg-white py-14">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Link href="/" className="flex w-fit items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-primary text-white">
                <GraduationCap className="h-7 w-7" />
              </div>
              <div>
                <p className="text-lg font-black leading-tight text-slate-950">Instituto Universitario</p>
                <p className="text-sm font-black uppercase tracking-widest text-brand-primary">de Durango</p>
              </div>
            </Link>
            <p className="mt-5 max-w-sm text-sm font-medium leading-relaxed text-slate-600">
              Preparatoria, licenciaturas y maestrías en línea para estudiantes de todo México, con horarios flexibles y acompañamiento académico.
            </p>
            <Link
              href={RVOE_CONSULTA_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 rounded-full border border-brand-primary/20 bg-brand-primary/10 px-4 py-2 text-xs font-black uppercase tracking-widest text-brand-primary"
            >
              <ShieldCheck className="h-4 w-4" />
              Consultar RVOE SEP
            </Link>
          </div>

          <div className="lg:col-span-3 lg:col-start-6">
            <h3 className="mb-5 text-sm font-black uppercase tracking-widest text-slate-950">Programas</h3>
            <ul className="space-y-3">
              {programLinks.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="group flex items-center text-sm font-semibold text-slate-600 hover:text-brand-primary">
                    <ChevronRight className="mr-2 h-4 w-4 text-brand-highlight transition group-hover:translate-x-1" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h3 className="mb-5 text-sm font-black uppercase tracking-widest text-slate-950">Institución</h3>
            <ul className="space-y-3">
              {institutionLinks.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="group flex items-center text-sm font-semibold text-slate-600 hover:text-brand-primary">
                    <ChevronRight className="mr-2 h-4 w-4 text-brand-highlight transition group-hover:translate-x-1" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-3">
            <h3 className="mb-5 text-sm font-black uppercase tracking-widest text-slate-950">Contacto</h3>
            <ul className="space-y-4 text-sm font-semibold text-slate-600">
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-brand-primary" />
                Atención en línea para todo México
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 shrink-0 text-brand-primary" />
                (618) 123-4567
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 shrink-0 text-brand-primary" />
                admisiones@iud.edu.mx
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-slate-200 pt-6 text-xs font-semibold text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} Instituto Universitario de Durango. Todos los derechos reservados.</p>
          <div className="flex gap-5">
            <Link href="/aviso-de-privacidad" className="hover:text-brand-primary">
              Aviso de privacidad
            </Link>
            <Link href="/#contacto" className="hover:text-brand-primary">
              Admisiones
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
