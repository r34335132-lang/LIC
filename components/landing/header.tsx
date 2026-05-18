'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Menu, X, GraduationCap, ChevronRight, Home, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'

const navLinks = [
  { href: '/', label: 'Inicio', icon: Home },
  { href: '/#oferta', label: 'Oferta Académica' },
  { href: '/#beneficios', label: 'Beneficios' },
  { href: '/#como-funciona', label: 'Modelo Educativo' },
  { href: '/#contacto', label: 'Admisiones' },
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
          ? 'bg-white/95 dark:bg-black/90 backdrop-blur-xl border-b border-brand-primary/10 shadow-sm' 
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      {/* ======================================================== */}
      {/* TOP BAR: BADGE DE CONFIANZA SEP (ESTUDIOS OFICIALES)     */}
      {/* ======================================================== */}
      <div className="w-full bg-slate-900 text-white/90 py-1.5 px-4 flex items-center justify-center gap-2 text-[10px] sm:text-xs font-semibold tracking-widest uppercase border-b border-white/10 z-50">
        <ShieldCheck className="h-3.5 w-3.5 text-brand-primary" />
        <span className="text-center">
          Institución con Reconocimiento de Validez Oficial de Estudios (RVOE) por la SEP
        </span>
      </div>

      <div className="container mx-auto flex h-20 items-center justify-between px-4 md:px-6">
        
        {/* Logo Section */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand-primary to-brand-highlight shadow-lg shadow-brand-primary/20 group-hover:scale-105 transition-transform duration-300">
            <GraduationCap className="h-7 w-7 text-white" />
          </div>
          <div className="flex flex-col">
            <span className={`text-base font-extrabold leading-tight tracking-tight transition-colors ${scrolled ? 'text-foreground' : 'text-white'}`}>
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
              className={`flex items-center gap-1 group relative text-sm font-semibold transition-colors hover:text-brand-primary ${scrolled ? 'text-muted-foreground' : 'text-white/90'}`}
            >
              {link.icon && <link.icon className="h-4 w-4 mb-0.5" />}
              {link.label}
              {/* Línea animada inferior al hacer hover */}
              <span className="absolute -bottom-1 left-0 h-[2px] w-0 bg-brand-highlight transition-all duration-300 group-hover:w-full rounded-full"></span>
            </Link>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-4 md:flex">
          <Button 
            variant="ghost" 
            size="sm" 
            className={`font-semibold hover:text-brand-primary hover:bg-brand-primary/10 rounded-full px-5 ${scrolled ? 'text-muted-foreground' : 'text-white'}`} 
            asChild
          >
            <Link href="/login">
              Portal Alumnos
            </Link>
          </Button>
          
          <Button size="sm" className="rounded-full bg-brand-primary hover:bg-brand-primary/90 text-white shadow-md shadow-brand-primary/20 px-6 transition-all hover:scale-105" asChild>
            <Link href="/#contacto">
              Proceso de Admisión
            </Link>
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className={`md:hidden flex items-center justify-center h-10 w-10 rounded-full hover:bg-brand-primary/20 transition-colors ${scrolled ? 'text-foreground' : 'text-white'}`}
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

      {/* Mobile Menu */}
      <div 
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          mobileMenuOpen ? 'max-h-[500px] border-t border-brand-primary/10 bg-white/95 dark:bg-black/95 backdrop-blur-xl shadow-xl' : 'max-h-0 bg-transparent'
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
              <div className="flex items-center gap-2">
                {link.icon && <link.icon className="h-4 w-4 text-brand-primary" />}
                {link.label}
              </div>
              <ChevronRight className="h-4 w-4 text-brand-highlight" />
            </Link>
          ))}
          <div className="flex flex-col gap-3 pt-6 mt-2 border-t border-brand-primary/10">
            <Button variant="outline" className="w-full rounded-full border-brand-primary/20 text-brand-primary h-12" asChild>
              <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                Portal Alumnos
              </Link>
            </Button>
            
            <Button className="w-full rounded-full bg-brand-primary text-white h-12 shadow-md shadow-brand-primary/20" asChild>
              <Link href="/#contacto" onClick={() => setMobileMenuOpen(false)}>
                Proceso de Admisión
              </Link>
            </Button>
          </div>
        </nav>
      </div>
    </header>
  )
}