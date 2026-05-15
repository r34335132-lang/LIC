import Link from 'next/link'
import { GraduationCap, Facebook, Instagram, Youtube, Linkedin } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t border-border bg-secondary/30">
      <div className="container px-4 py-12 md:px-6">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Logo y descripción */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <GraduationCap className="h-6 w-6 text-primary-foreground" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold leading-none text-foreground">Instituto Universitario</span>
                <span className="text-xs text-muted-foreground">de Durango</span>
              </div>
            </Link>
            <p className="text-sm text-muted-foreground">
              Formación académica de calidad con horarios flexibles y clases virtuales.
            </p>
            <div className="flex gap-4">
              <Link href="#" className="text-muted-foreground transition-colors hover:text-primary">
                <Facebook className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground transition-colors hover:text-primary">
                <Instagram className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground transition-colors hover:text-primary">
                <Youtube className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground transition-colors hover:text-primary">
                <Linkedin className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Programas */}
          <div>
            <h3 className="mb-4 font-semibold text-foreground">Programas</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#oferta" className="text-muted-foreground transition-colors hover:text-foreground">
                  Preparatoria
                </Link>
              </li>
              <li>
                <Link href="#oferta" className="text-muted-foreground transition-colors hover:text-foreground">
                  Licenciaturas
                </Link>
              </li>
              <li>
                <Link href="#oferta" className="text-muted-foreground transition-colors hover:text-foreground">
                  Maestrías
                </Link>
              </li>
              <li>
                <Link href="#oferta" className="text-muted-foreground transition-colors hover:text-foreground">
                  Cursos
                </Link>
              </li>
            </ul>
          </div>

          {/* Enlaces rápidos */}
          <div>
            <h3 className="mb-4 font-semibold text-foreground">Enlaces</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#beneficios" className="text-muted-foreground transition-colors hover:text-foreground">
                  Beneficios
                </Link>
              </li>
              <li>
                <Link href="#como-funciona" className="text-muted-foreground transition-colors hover:text-foreground">
                  Cómo funciona
                </Link>
              </li>
              <li>
                <Link href="#contacto" className="text-muted-foreground transition-colors hover:text-foreground">
                  Contacto
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-muted-foreground transition-colors hover:text-foreground">
                  Plataforma
                </Link>
              </li>
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h3 className="mb-4 font-semibold text-foreground">Contacto</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Av. Universidad #123</li>
              <li>Durango, Dgo. CP 34000</li>
              <li>(618) 123-4567</li>
              <li>info@iud.edu.mx</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-border pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Instituto Universitario de Durango. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
