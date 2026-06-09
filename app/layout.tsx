import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { AuthProvider } from '@/lib/auth-context'
import { FloatingWhatsApp } from '@/components/marketing/floating-whatsapp'
import { Toaster } from '@/components/ui/sonner'
import { SITE_URL } from '@/lib/marketing'
import './globals.css'

const _geist = Geist({ subsets: ['latin'] })
const _geistMono = Geist_Mono({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: 'Instituto Universitario de Durango',
  title: {
    default: 'Instituto Universitario | Preparatoria, Licenciaturas y Maestrías en línea en México',
    template: '%s | Instituto Universitario de Durango',
  },
  description:
    'Estudia preparatoria, licenciaturas y maestrías en línea desde cualquier estado de México. Programas flexibles, acompañamiento académico, revalidación de materias y opciones con RVOE.',
  keywords: [
    'preparatoria en línea México',
    'licenciaturas en línea México',
    'maestrías en línea México',
    'universidad en línea México',
    'estudiar en línea con validez oficial',
    'programas con RVOE',
    'preparatoria virtual',
    'licenciatura virtual',
    'maestría virtual',
    'revalidación de materias',
    'estudiar desde cualquier estado de México',
    'universidad flexible para adultos',
    'educación en línea México',
    'instituto universitario en línea',
  ],
  authors: [{ name: 'Instituto Universitario de Durango', url: SITE_URL }],
  creator: 'Instituto Universitario de Durango',
  publisher: 'Instituto Universitario de Durango',
  category: 'Educación',
  classification: 'Educación en línea con cobertura nacional en México',
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
    title: 'Preparatoria, licenciaturas y maestrías en línea en México',
    description:
      'Programas en línea para estudiantes de todo México, con horarios flexibles, acompañamiento académico, revalidación de materias y opciones con RVOE.',
    images: [
      {
        url: '/hero-img.png',
        width: 1200,
        height: 630,
        alt: 'Estudiante de programas en línea del Instituto Universitario de Durango',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Instituto Universitario | Educación en línea en México',
    description: 'Preparatoria, licenciaturas y maestrías en línea para estudiantes de todo México.',
    images: ['/hero-img.png'],
  },
  icons: {
    icon: [
      {
        url: '/favicon.ico',
      },
      {
        url: '/favicon-16x16.png',
        sizes: '16x16',
        type: 'image/png',
      },
      {
        url: '/favicon-32x32.png',
        sizes: '32x32',
        type: 'image/png',
      },
      {
        url: '/favicon-96x96.png',
        sizes: '96x96',
        type: 'image/png',
      },
    ],
    shortcut: '/favicon.ico',
    apple: '/apple-icon-180x180.png',
  },
  manifest: '/site.webmanifest',
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
          {/* Banner Superior Global de Revalidación */}
          <div className="w-full bg-yellow-500 text-black text-center py-2 px-4 font-bold text-sm md:text-base z-50 relative shadow-sm">
            ¡Aprovecha nuestro programa de equivalencias! Revalidamos materias. 🎓
          </div>

          {children}

          <FloatingWhatsApp />
          <Toaster richColors position="top-right" />
        </AuthProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
