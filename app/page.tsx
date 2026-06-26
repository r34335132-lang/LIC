import { Header } from '@/components/landing/header'
import { Hero } from '@/components/landing/hero'
import { Beneficios } from '@/components/landing/beneficios'
import { OfertaAcademica } from '@/components/landing/oferta-academica'
import { ComoFunciona } from '@/components/landing/como-funciona'
import { FAQ } from '@/components/landing/faq'
import { Contacto } from '@/components/landing/contacto'
import { Footer } from '@/components/landing/footer'
import { MobileReserveBar } from '@/components/landing/mobile-reserve-bar'
import { SITE_URL } from '@/lib/marketing'
import { programas } from '@/lib/data'
import { generalFaqs } from '@/lib/program-content'

export default function HomePage() {
  const programasAcademicos = programas.filter((programa) => programa.tipo !== 'curso')
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'EducationalOrganization',
        '@id': `${SITE_URL}/#institucion`,
        name: 'Instituto Universitario de Durango',
        url: SITE_URL,
        image: `${SITE_URL}/hero-img.png`,
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Durango',
          addressRegion: 'Durango',
          addressCountry: 'MX',
        },
        areaServed: {
          '@type': 'Country',
          name: 'México',
        },
        educationalCredentialAwarded: ['Certificado', 'Título profesional', 'Grado de maestría'],
        knowsAbout: [
          'Preparatoria en línea México',
          'Licenciaturas en línea México',
          'Universidad en línea México',
          'Maestrías en línea México',
          'Revalidación de materias',
          'Educación en línea flexible',
        ],
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: 'admisiones',
          areaServed: 'MX',
          availableLanguage: 'es-MX',
        },
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: 'Programas académicos en línea',
          itemListElement: programasAcademicos.map((programa) => ({
            '@type': 'Course',
            name: programa.nombre,
            description: programa.descripcion,
            url: `${SITE_URL}/programas/${programa.id}`,
            courseMode: 'Virtual',
            timeRequired: programa.duracion,
            educationalCredentialAwarded: programa.tipo,
            provider: {
              '@id': `${SITE_URL}/#institucion`,
            },
          })),
        },
      },
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        url: SITE_URL,
        name: 'Instituto Universitario de Durango',
        inLanguage: 'es-MX',
        publisher: {
          '@id': `${SITE_URL}/#institucion`,
        },
      },
      {
        '@type': 'FAQPage',
        '@id': `${SITE_URL}/#preguntas-frecuentes`,
        mainEntity: generalFaqs.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer,
          },
        })),
      },
    ],
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <main className="flex-1 pb-20 lg:pb-0">
        <Hero />
        <Beneficios />
        <OfertaAcademica />
        <ComoFunciona />
        <FAQ />
        <Contacto />
      </main>
      <Footer />
      <MobileReserveBar />
    </div>
  )
}
