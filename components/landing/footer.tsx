import Link from 'next/link'
import { GraduationCap, Facebook, Instagram, Youtube, Linkedin, ChevronRight, MapPin, Phone, Mail } from 'lucide-react'

export function Footer() {
  return (
    <footer className="relative bg-white dark:bg-black border-t border-border/40 overflow-hidden pt-16 pb-8">
      
      {/* Brillo sutil en la parte superior del footer */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-brand-primary/20 to-transparent"></div>
      
      {/* Esferas de luz de fondo (muy tenues) */}
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-brand-primary/5 rounded-full blur-[150px] -z-10 pointer-events-none" />

      <div className="container relative z-10 px-4 md:px-6 mx-auto">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-12 mb-16">
          
          {/* ================= COLUMNA 1: Logo y descripción (Más ancha) ================= */}
          <div className="lg:col-span-4 space-y-6">
            <Link href="/" className="flex items-center gap-3 group w-fit">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand-primary to-brand-highlight shadow-lg shadow-brand-primary/20 group-hover:scale-105 transition-transform duration-300">
                <GraduationCap className="h-7 w-7 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-extrabold leading-tight text-foreground tracking-tight">
                  Instituto Universitario
                </span>
                <span className="text-xs font-medium text-brand-primary uppercase tracking-wider">
                  de Durango
                </span>
              </div>
            </Link>
            
            <p className="text-sm text-muted-foreground leading-relaxed pr-4">
              Transformando el futuro a través de educación de excelencia. Plataforma académica vanguardista con horarios flexibles y clases virtuales de primer nivel.
            </p>
            
            <div className="flex gap-3">
              {[
                { icon: Facebook, href: '#' },
                { icon: Instagram, href: '#' },
                { icon: Youtube, href: '#' },
                { icon: Linkedin, href: '#' }
              ].map((social, index) => (
                <Link 
                  key={index} 
                  href={social.href} 
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-900 text-muted-foreground hover:bg-brand-primary hover:text-white transition-all duration-300 hover:-translate-y-1"
                >
                  <social.icon className="h-4 w-4" />
                </Link>
              ))}
            </div>
          </div>

          {/* ================= COLUMNA 2: Programas ================= */}
          <div className="lg:col-span-2 lg:col-start-6">
            <h3 className="mb-6 text-sm font-bold uppercase tracking-wider text-foreground">Programas</h3>
            <ul className="space-y-3 text-sm">
              {['Preparatoria', 'Licenciaturas', 'Maestrías', 'Cursos Online'].map((item) => (
                <li key={item}>
                  <Link href="#oferta" className="group flex items-center text-muted-foreground transition-colors hover:text-brand-primary font-medium">
                    <ChevronRight className="h-3 w-3 mr-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-brand-highlight" />
                    <span className="group-hover:translate-x-1 transition-transform">{item}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ================= COLUMNA 3: Enlaces rápidos ================= */}
          <div className="lg:col-span-2">
            <h3 className="mb-6 text-sm font-bold uppercase tracking-wider text-foreground">Plataforma</h3>
            <ul className="space-y-3 text-sm">
              {[
                { label: 'Beneficios', href: '#beneficios' },
                { label: 'Cómo funciona', href: '#como-funciona' },
                { label: 'Contacto', href: '#contacto' },
                { label: 'Iniciar Sesión', href: '/login' }
              ].map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="group flex items-center text-muted-foreground transition-colors hover:text-brand-primary font-medium">
                    <ChevronRight className="h-3 w-3 mr-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-brand-highlight" />
                    <span className="group-hover:translate-x-1 transition-transform">{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ================= COLUMNA 4: Contacto Corto ================= */}
          <div className="lg:col-span-3">
            <h3 className="mb-6 text-sm font-bold uppercase tracking-wider text-foreground">Contacto Directo</h3>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-brand-primary mt-0.5 shrink-0" />
                <span className="leading-relaxed">Av. Universidad #123, Centro<br/>Durango, Dgo. CP 34000</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-brand-primary shrink-0" />
                <span>(618) 123-4567</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-brand-primary shrink-0" />
                <span>info@iud.edu.mx</span>
              </li>
            </ul>
          </div>

        </div>

        {/* ================= BARRA INFERIOR (Copyright y Legales) ================= */}
        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-border/50 text-xs text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Instituto Universitario de Durango. Todos los derechos reservados.</p>
          
          <div className="flex gap-6 mt-4 md:mt-0">
            <Link href="#" className="hover:text-brand-primary transition-colors">
              Aviso de Privacidad
            </Link>
            <Link href="#" className="hover:text-brand-primary transition-colors">
              Términos y Condiciones
            </Link>
            <Link href="#" className="hover:text-brand-primary transition-colors">
              Soporte
            </Link>
          </div>
        </div>
        
      </div>
    </footer>
  )
}