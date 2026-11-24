import type { Metadata } from 'next'
import { Header } from '@/components/landing/header'
import { Hero } from '@/components/landing/hero'
import { TrustBar } from '@/components/landing/trust-bar'
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

export const metadata: Metadata = {
  title: 'Instituto Universitario de Durango | Preparatoria, Licenciaturas y Maestrías en línea',
  description:
    'Estudia preparatoria, licenciaturas y maestrías en línea desde cualquier estado de México. Horarios flexibles, revalidación de materias, acompañamiento académico y pre-inscripción sin pago en línea.',
  keywords: [
    'preparatoria en línea México',
    'licenciaturas en línea México',
    'maestrías en línea México',
    'universidad en línea Durango',
    'Instituto Universitario de Durango',
    'estudiar en línea con validez oficial',
    'revalidación de materias',
    'educación virtual México',
  ],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Instituto Universitario de Durango | Educación en línea en México',
    description:
      'Preparatoria, licenciaturas y maestrías en línea con horarios flexibles y cobertura nacional.',
    url: SITE_URL,
    type: 'website',
    locale: 'es_MX',
    images: [
      {
        url: '/hero-img.png',
        width: 1200,
        height: 630,
        alt: 'Instituto Universitario de Durango — educación en línea',
      },
    ],
  },
}

export default function HomePage() {
  const programasAcademicos = programas.filter((programa) => programa.tipo !== 'curso')
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollegeOrUniversity',
        '@id': `${SITE_URL}/#institucion`,
        name: 'Instituto Universitario de Durango',
        alternateName: ['IUD', 'Instituto Universitario'],
        url: SITE_URL,
        logo: `${SITE_URL}/android-icon-192x192.png`,
        image: `${SITE_URL}/hero-img.png`,
        description:
          'Institución de educación en línea en México con preparatoria, licenciaturas y maestrías, horarios flexibles y revalidación de materias.',
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
        availableLanguage: 'es-MX',
        educationalCredentialAwarded: ['Certificado', 'Título profesional', 'Grado de maestría'],
        knowsAbout: [
          'Preparatoria en línea México',
          'Licenciaturas en línea México',
          'Maestrías en línea México',
          'Revalidación de materias',
          'Educación virtual',
        ],
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: 'admisiones',
          areaServed: 'MX',
          availableLanguage: 'es-MX',
          url: `${SITE_URL}/#contacto`,
        },
        sameAs: [],
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: 'Programas académicos en línea',
          itemListElement: programasAcademicos.map((programa, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            item: {
              '@type': 'Course',
              name: programa.nombre,
              description: programa.descripcion,
              url: `${SITE_URL}/programas/${programa.id}`,
              courseMode: 'online',
              timeRequired: programa.duracion,
              educationalCredentialAwarded: programa.tipo,
              inLanguage: 'es-MX',
              provider: {
                '@id': `${SITE_URL}/#institucion`,
              },
              offers: {
                '@type': 'Offer',
                category: 'Educación en línea',
                availability: 'https://schema.org/InStock',
                url: `${SITE_URL}/inscripcion?programa=${programa.id}`,
              },
            },
          })),
        },
      },
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        url: SITE_URL,
        name: 'Instituto Universitario de Durango',
        description: 'Preparatoria, licenciaturas y maestrías en línea en México',
        inLanguage: 'es-MX',
        publisher: {
          '@id': `${SITE_URL}/#institucion`,
        },
      },
      {
        '@type': 'WebPage',
        '@id': `${SITE_URL}/#webpage`,
        url: SITE_URL,
        name: 'Instituto Universitario de Durango | Educación en línea en México',
        isPartOf: { '@id': `${SITE_URL}/#website` },
        about: { '@id': `${SITE_URL}/#institucion` },
        inLanguage: 'es-MX',
        primaryImageOfPage: {
          '@type': 'ImageObject',
          url: `${SITE_URL}/hero-img.png`,
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
      {
        '@type': 'BreadcrumbList',
        '@id': `${SITE_URL}/#breadcrumb`,
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Inicio',
            item: SITE_URL,
          },
        ],
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
        <TrustBar />
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
