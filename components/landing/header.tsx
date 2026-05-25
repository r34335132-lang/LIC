'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ChevronRight, GraduationCap, Menu, ShieldCheck, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { WhatsAppIcon } from '@/components/marketing/whatsapp-icon'
import { WhatsAppLink } from '@/components/marketing/whatsapp-link'

const navLinks = [
  { href: '/#respaldo-oficial', label: 'RVOE' },
  { href: '/#oferta', label: 'Programas' },
  { href: '/#beneficios', label: 'Modalidad' },
  { href: '/#faq', label: 'Preguntas' },
  { href: '/#contacto', label: 'Admisiones' },
]

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 z-50 w-full transition-all duration-300 ${
        scrolled ? 'border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur-xl' : 'bg-transparent'
      }`}
    >
      <div className="flex w-full items-center justify-center gap-2 bg-slate-950 px-3 py-2 text-center text-[10px] font-black uppercase tracking-widest text-white sm:text-xs">
        <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-brand-highlight" />
        <span>Programas con RVOE SEP Durango y validez oficial</span>
      </div>

      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6 lg:h-20">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-md bg-gradient-to-br from-brand-primary to-brand-highlight text-white shadow-lg shadow-brand-primary/15">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div className="flex flex-col">
            <span className={`text-sm font-black leading-tight tracking-tight sm:text-base ${scrolled ? 'text-slate-950' : 'text-white'}`}>
              Instituto Universitario
            </span>
            <span className="text-[10px] font-black uppercase tracking-widest text-brand-highlight">de Durango</span>
          </div>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`relative text-sm font-bold transition hover:text-brand-highlight ${
                scrolled ? 'text-slate-700' : 'text-white/90'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Button
            asChild
            variant="outline"
            className={`rounded-md font-bold ${
              scrolled
                ? 'rounded-md border-slate-300 bg-white text-slate-950 hover:border-brand-primary hover:text-brand-primary'
                : 'rounded-md border-white/25 bg-white/10 text-white hover:bg-white hover:text-slate-950'
            }`}
          >
            <Link href="/login">Portal alumnos</Link>
          </Button>
          <Button asChild className="rounded-md bg-brand-primary px-5 font-black text-white hover:bg-brand-primary/90">
            <WhatsAppLink>
              <WhatsAppIcon className="mr-2 h-4 w-4" />
              Informes
            </WhatsAppLink>
          </Button>
        </div>

        <button
          className={`flex h-10 w-10 items-center justify-center rounded-full lg:hidden ${
            scrolled ? 'text-slate-950' : 'text-white'
          }`}
          onClick={() => setMobileMenuOpen((open) => !open)}
          aria-label="Abrir menú"
        >
          {mobileMenuOpen ? <X className="h-6 w-6 text-brand-primary" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      <div
        className={`overflow-hidden transition-all duration-300 lg:hidden ${
          mobileMenuOpen ? 'max-h-[520px] border-t border-slate-200 bg-white shadow-xl' : 'max-h-0'
        }`}
      >
        <nav className="container flex flex-col gap-2 px-4 py-5">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center justify-between rounded-md px-4 py-3 text-sm font-black text-slate-950 hover:bg-brand-primary/10"
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.label}
              <ChevronRight className="h-4 w-4 text-brand-primary" />
            </Link>
          ))}
          <div className="mt-3 grid gap-3 border-t border-slate-200 pt-5">
            <Button asChild variant="outline" className="h-12 rounded-md border-slate-300 font-bold">
              <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                Portal alumnos
              </Link>
            </Button>
            <Button asChild className="h-12 rounded-md bg-brand-primary font-black text-white hover:bg-brand-primary/90">
              <WhatsAppLink>
                <WhatsAppIcon className="mr-2 h-4 w-4" />
                Informes por WhatsApp
              </WhatsAppLink>
            </Button>
          </div>
        </nav>
      </div>
    </header>
  )
}
