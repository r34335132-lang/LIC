'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Menu, X, GraduationCap, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

const navLinks = [
  { href: '#oferta', label: 'Oferta Académica' },
  { href: '#beneficios', label: 'Beneficios' },
  { href: '#como-funciona', label: 'Cómo Funciona' },
  { href: '#contacto', label: 'Contacto' },
]

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  // Efecto para detectar el scroll y cambiar el estilo del navbar
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header 
      className={`fixed top-0 z-50 w-full transition-all duration-300 ${
        scrolled 
          ? 'bg-white/80 dark:bg-black/60 backdrop-blur-xl border-b border-brand-primary/10 shadow-sm' 
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="container mx-auto flex h-20 items-center justify-between px-4 md:px-6">
        
        {/* Logo Section */}
        <Link href="/" className="flex items-center gap-3 group">
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

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group relative text-sm font-semibold text-muted-foreground transition-colors hover:text-brand-primary"
            >
              {link.label}
              {/* Línea animada inferior al hacer hover */}
              <span className="absolute -bottom-1 left-0 h-[2px] w-0 bg-brand-highlight transition-all duration-300 group-hover:w-full rounded-full"></span>
            </Link>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-4 md:flex">
          <Link href="/login">
            <Button variant="ghost" size="sm" className="font-semibold text-muted-foreground hover:text-brand-primary hover:bg-brand-primary/5 rounded-full px-5">
              Iniciar Sesión
            </Button>
          </Link>
          <Link href="#contacto">
            <Button size="sm" className="rounded-full bg-brand-primary hover:bg-brand-primary/90 text-white shadow-md shadow-brand-primary/20 px-6 transition-all hover:scale-105">
              Solicitar Información
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden flex items-center justify-center h-10 w-10 rounded-full hover:bg-brand-primary/5 text-foreground transition-colors"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6 text-brand-primary" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile Menu (Desplegable animado y de cristal) */}
      <div 
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          mobileMenuOpen ? 'max-h-[400px] border-t border-brand-primary/10 bg-white/95 dark:bg-black/95 backdrop-blur-xl shadow-xl' : 'max-h-0 bg-transparent'
        }`}
      >
        <nav className="container flex flex-col gap-2 px-4 py-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center justify-between rounded-lg px-4 py-3 text-sm font-semibold text-foreground hover:bg-brand-primary/5 hover:text-brand-primary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.label}
              <ChevronRight className="h-4 w-4 text-brand-highlight" />
            </Link>
          ))}
          <div className="flex flex-col gap-3 pt-6 mt-2 border-t border-brand-primary/10">
            <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="outline" className="w-full rounded-full border-brand-primary/20 text-brand-primary h-12">
                Iniciar Sesión
              </Button>
            </Link>
            <Link href="#contacto" onClick={() => setMobileMenuOpen(false)}>
              <Button className="w-full rounded-full bg-brand-primary text-white h-12 shadow-md shadow-brand-primary/20">
                Solicitar Información
              </Button>
            </Link>
          </div>
        </nav>
      </div>
    </header>
  )
}