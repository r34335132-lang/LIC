import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { AuthProvider } from '@/lib/auth-context'
import { FloatingWhatsApp } from '@/components/marketing/floating-whatsapp'
import { SITE_URL } from '@/lib/marketing'
import './globals.css'

const _geist = Geist({ subsets: ['latin'] })
const _geistMono = Geist_Mono({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: 'Instituto Universitario de Durango',
  title: {
    default: 'Instituto Universitario de Durango | Programas con RVOE SEP',
    template: '%s | Instituto Universitario de Durango',
  },
  description:
    'Estudia preparatoria, licenciatura o maestría con validez oficial SEP en Durango. Modalidad virtual, horarios flexibles, inscripción gratis y mensualidades desde $600 MXN.',
  keywords: [
    'Preparatoria en 2 años Durango',
    'Preparatoria virtual Durango',
    'Licenciatura en Derecho con RVOE Durango',
    'Licenciatura en Psicología con RVOE Durango',
    'Licenciatura en Pedagogía con RVOE Durango',
    'Licenciatura en Criminología Durango',
    'Universidad virtual Durango',
    'Maestría en Educación Durango',
    'Maestría en Psicopedagogía Durango',
    'Programas con RVOE Durango',
    'RVOE SEP Durango',
    'Universidad con horarios flexibles Durango',
  ],
  authors: [{ name: 'Instituto Universitario de Durango', url: SITE_URL }],
  creator: 'Instituto Universitario de Durango',
  publisher: 'Instituto Universitario de Durango',
  category: 'Educación',
  classification: 'Educación superior y media superior con RVOE SEP Durango',
  formatDetection: {
    telephone: true,
    email: true,
    address: true,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'es_MX',
    url: SITE_URL,
    siteName: 'Instituto Universitario de Durango',
    title: 'Preparatoria, licenciaturas y maestrías con RVOE SEP en Durango',
    description:
      'Programas virtuales con RVOE SEP Durango, horarios flexibles, acompañamiento de admisiones e inscripción gratis vigente.',
    images: [
      {
        url: '/hero-img.png',
        width: 1200,
        height: 630,
        alt: 'Instituto Universitario de Durango - programas con RVOE SEP',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Instituto Universitario de Durango | RVOE SEP Durango',
    description: 'Preparatoria, licenciaturas y maestrías virtuales con horarios flexibles.',
    images: ['/hero-img.png'],
  },
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className="bg-background">
      <body className="min-h-screen font-sans antialiased">
        <AuthProvider>
          {children}
          <FloatingWhatsApp />
        </AuthProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
