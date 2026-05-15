import { Header } from '@/components/landing/header'
import { Hero } from '@/components/landing/hero'
import { Beneficios } from '@/components/landing/beneficios'
import { OfertaAcademica } from '@/components/landing/oferta-academica'
import { ComoFunciona } from '@/components/landing/como-funciona'
import { Contacto } from '@/components/landing/contacto'
import { Footer } from '@/components/landing/footer'

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Hero />
        <Beneficios />
        <OfertaAcademica />
        <ComoFunciona />
        <Contacto />
      </main>
      <Footer />
    </div>
  )
}
