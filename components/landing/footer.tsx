import Link from 'next/link'
import { GraduationCap, Facebook, Instagram, Youtube, Linkedin, ChevronRight, MapPin, Phone, Mail, ShieldCheck } from 'lucide-react'

export function Footer() {
  return (
    <footer className="relative bg-white dark:bg-black border-t-8 border-brand-primary overflow-hidden pt-20 pb-10">
      {/* Borde superior grueso (border-t-8) característico del diseño institucional */}
      
      {/* Esferas de luz de fondo para dar textura sin perder seriedad */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-primary/5 rounded-full blur-[150px] -z-10 pointer-events-none" />

      <div className="container relative z-10 px-4 md:px-6 mx-auto">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-12 mb-16">
          
          {/* ================= COLUMNA 1: Logo, descripción y LEGALIDAD ================= */}
          <div className="lg:col-span-4 space-y-6">
            <Link href="/" className="flex items-center gap-3 group w-fit">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-brand-primary to-brand-highlight shadow-lg group-hover:scale-105 transition-transform duration-300">
                <GraduationCap className="h-8 w-8 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black leading-tight text-foreground tracking-tight uppercase">
                  Instituto Univ.
                </span>
                <span className="text-sm font-bold text-brand-primary uppercase tracking-widest">
                  de Durango
                </span>
              </div>
            </Link>
            
            <p className="text-base text-muted-foreground font-medium leading-relaxed pr-4">
              Transformando el futuro a través de educación de excelencia. Plataforma académica vanguardista con horarios flexibles y clases virtuales de primer nivel.
            </p>

            {/* Sello de confianza institucional (Vital para universidades) */}
            <div className="inline-flex items-center gap-2 bg-gray-100 dark:bg-gray-900 px-4 py-2 rounded-lg border border-border/50">
              <ShieldCheck className="h-5 w-5 text-brand-primary" />
              <span className="text-xs font-bold uppercase tracking-wider text-foreground">Programas con RVOE (SEP)</span>
            </div>
            
            <div className="flex gap-4 pt-2">
              {[
                { icon: Facebook, href: '#' },
                { icon: Instagram, href: '#' },
                { icon: Youtube, href: '#' },
                { icon: Linkedin, href: '#' }
              ].map((social, index) => (
                <Link 
                  key={index} 
                  href={social.href} 
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-900 text-foreground hover:bg-brand-primary hover:text-white hover:shadow-lg hover:shadow-brand-primary/20 transition-all duration-300 hover:-translate-y-1"
                >
                  <social.icon className="h-5 w-5" />
                </Link>
              ))}
            </div>
          </div>

          {/* ================= COLUMNA 2: Enlaces Directos a Carreras (Marketing) ================= */}
          <div className="lg:col-span-3 lg:col-start-6">
            <h3 className="mb-6 text-sm font-black uppercase tracking-widest text-foreground">Oferta Educativa</h3>
            <ul className="space-y-4 text-sm font-medium">
              {[
                { label: 'Licenciatura en Derecho', href: '/programas/lic-derecho' },
                { label: 'Licenciatura en Psicología', href: '/programas/lic-psicologia' },
                { label: 'Licenciatura en Criminología', href: '/programas/lic-criminologia' },
                { label: 'Maestría en Educación', href: '/programas/mae-educacion' },
                { label: 'Ver todos los programas', href: '/#oferta', highlight: true }
              ].map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className={`group flex items-center transition-colors ${item.highlight ? 'text-brand-primary font-bold' : 'text-muted-foreground hover:text-brand-primary'}`}>
                    <ChevronRight className="h-4 w-4 mr-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-brand-highlight" />
                    <span className="group-hover:translate-x-1 transition-transform">{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ================= COLUMNA 3: Plataforma ================= */}
          <div className="lg:col-span-2">
            <h3 className="mb-6 text-sm font-black uppercase tracking-widest text-foreground">Institución</h3>
            <ul className="space-y-4 text-sm font-medium">
              {[
                { label: 'Beneficios', href: '/#beneficios' },
                { label: 'Modelo Educativo', href: '/#como-funciona' },
                { label: 'Contacto', href: '/#contacto' },
                { label: 'Campus Virtual', href: '/login' }
              ].map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="group flex items-center text-muted-foreground transition-colors hover:text-brand-primary">
                    <ChevronRight className="h-4 w-4 mr-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-brand-highlight" />
                    <span className="group-hover:translate-x-1 transition-transform">{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ================= COLUMNA 4: Contacto Institucional ================= */}
          <div className="lg:col-span-3">
            <h3 className="mb-6 text-sm font-black uppercase tracking-widest text-foreground">Contacto</h3>
            <ul className="space-y-5 text-sm text-muted-foreground font-medium">
              <li className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-primary/10">
                  <MapPin className="h-5 w-5 text-brand-primary" />
                </div>
                <span className="leading-relaxed mt-1">Av. Universidad #123, Centro<br/>Durango, Dgo. CP 34000</span>
              </li>
              <li className="flex items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-primary/10">
                  <Phone className="h-5 w-5 text-brand-primary" />
                </div>
                <span className="mt-1">(618) 123-4567</span>
              </li>
              <li className="flex items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-primary/10">
                  <Mail className="h-5 w-5 text-brand-primary" />
                </div>
                <span className="mt-1">admisiones@iud.edu.mx</span>
              </li>
            </ul>
          </div>

        </div>

        {/* ================= BARRA INFERIOR (Copyright y Legales) ================= */}
        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-border/50 text-xs font-medium text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Instituto Universitario de Durango. Todos los derechos reservados.</p>
          
          <div className="flex gap-6 mt-4 md:mt-0">
            <Link href="#" className="hover:text-brand-primary transition-colors">Aviso de Privacidad</Link>
            <Link href="#" className="hover:text-brand-primary transition-colors">Términos y Condiciones</Link>
            <Link href="#" className="hover:text-brand-primary transition-colors">Soporte Técnico</Link>
          </div>
        </div>
        
      </div>
    </footer>
  )
}