import Link from 'next/link'
import { ArrowLeft, ShieldCheck, Lock, Eye, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const metadata = {
  title: 'Aviso de Privacidad | Instituto Universitario de Durango',
  description: 'Conoce cómo protegemos y administramos tus datos personales de acuerdo con las normativas oficiales vigente.',
}

export default function AvisoPrivacidadPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-800 dark:text-zinc-200">
      
      {/* Encabezado Principal */}
      <div className="bg-slate-900 text-white py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(var(--brand-primary-rgb),0.15),transparent)] pointer-events-none" />
        
        <div className="container mx-auto px-4 md:px-6 max-w-4xl">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-400 hover:text-white transition-colors mb-6 group">
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Volver al Inicio
          </Link>
          
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-brand-primary/10 border border-brand-primary/20 rounded-lg text-brand-primary">
              <ShieldCheck className="h-8 w-8" />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-brand-primary">Documento Legal Oficial</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
            AVISO DE PRIVACIDAD
          </h1>
          <p className="text-gray-400 text-sm md:text-base max-w-2xl font-medium">
            Última actualización: Mayo 2026. En cumplimiento con la Ley Federal de Protección de Datos Personales en Posesión de los Particulares.
          </p>
        </div>
      </div>

      {/* Cuerpo del Aviso de Privacidad */}
      <main className="container mx-auto px-4 md:px-6 max-w-4xl py-12 md:py-16">
        <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800/80 p-6 md:p-10 shadow-sm space-y-8 rounded-none">
          
          <p className="text-base leading-relaxed text-muted-foreground">
            El <strong>Instituto Universitario de Durango</strong>, con domicilio legal en la ciudad de Victoria de Durango, Durango, México, es el responsable del tratamiento de los datos personales que usted proporcione, los cuales serán protegidos conforme a lo dispuesto por la Ley Federal de Protección de Datos Personales en Posesión de los Particulares y demás normatividad aplicable.
          </p>

          <hr className="border-slate-100 dark:border-zinc-800" />

          {/* Sección 1 */}
          <section className="space-y-3">
            <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              <Lock className="h-5 w-5 text-brand-primary shrink-0" />
              1. Datos Personales que Recabamos
            </h2>
            <p className="text-muted-foreground leading-relaxed pl-7">
              Para llevar a cabo las finalidades descritas en el presente aviso, recolectamos los siguientes datos de forma directa (a través de formularios web, inscripciones o llamadas telefónicas):
            </p>
            <ul className="list-disc pl-12 space-y-1.5 text-muted-foreground">
              <li>Datos de identificación (Nombre completo, CURP, fecha de nacimiento).</li>
              <li>Datos de contacto (Correo electrónico, teléfono móvil, dirección física).</li>
              <li>Datos académicos (Historial escolar, certificados, escuela de procedencia).</li>
              <li>Datos de facturación o patrimoniales (en caso de pagos de inscripciones y colegiaturas).</li>
            </ul>
          </section>

          {/* Sección 2 */}
          <section className="space-y-3">
            <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              <Eye className="h-5 w-5 text-brand-primary shrink-0" />
              2. Finalidades del Tratamiento de Datos
            </h2>
            <p className="text-muted-foreground leading-relaxed pl-7">
              Los datos personales que recabamos serán utilizados exclusivamente para las siguientes actividades necesarias para el servicio solicitado:
            </p>
            <ul className="list-disc pl-12 space-y-1.5 text-muted-foreground">
              <li>Gestión del proceso de admisión, inscripción y validación de documentos ante las autoridades educativas (SEP).</li>
              <li>Alta en nuestra plataforma y portal virtual de alumnos.</li>
              <li>Seguimiento de rendimiento académico, asistencia y asignación de calificaciones.</li>
              <li>Emisión de comprobantes fiscales y cobranza.</li>
              <li>Envío de notificaciones institucionales, alertas y avisos de urgencia.</li>
            </ul>
          </section>

          {/* Sección 3 */}
          <section className="space-y-3">
            <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              <FileText className="h-5 w-5 text-brand-primary shrink-0" />
              3. Transferencia de Datos
            </h2>
            <p className="text-muted-foreground leading-relaxed pl-7">
              Le informamos que sus datos personales son compartidos exclusivamente con las autoridades educativas correspondientes (como la Secretaría de Educación Pública o dependencias estatales afines) con el único fin de validar legalmente sus estudios, expedir títulos, cédulas o acreditaciones asociadas a los planes de estudio con **RVOE**. No vendemos ni compartimos sus datos con empresas comerciales terceras bajo ninguna circunstancia.
            </p>
          </section>

          {/* Sección 4 */}
          <section className="space-y-3">
            <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              <ShieldCheck className="h-5 w-5 text-brand-primary shrink-0" />
              4. Derechos ARCO (Acceso, Rectificación, Cancelación u Oposición)
            </h2>
            <p className="text-muted-foreground leading-relaxed pl-7">
              Usted tiene derecho a conocer qué datos personales tenemos de usted, para qué los utilizamos y las condiciones del uso que les damos (Acceso). Asimismo, es su derecho solicitar la corrección de su información en caso de que esté desactualizada o sea inexacta (Rectificación); que la eliminemos de nuestros registros cuando considere que no está siendo utilizada adecuadamente (Cancelación); así como oponerse al uso de sus datos para fines específicos (Oposición).
            </p>
            <p className="text-muted-foreground leading-relaxed pl-7">
              Para ejercer cualquiera de los derechos ARCO, usted deberá enviar una solicitud por escrito dirigida a nuestro Departamento de Privacidad al correo electrónico: <span className="text-brand-primary font-semibold">privacidad@tuinstitucion.edu.mx</span>, detallando su nombre completo, matrícula (si cuenta con ella) y el motivo de su solicitud.
            </p>
          </section>

          {/* Sección 5 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              5. Cambios al Aviso de Privacidad
            </h2>
            <p className="text-muted-foreground leading-relaxed pl-7">
              El presente aviso de privacidad puede sufrir modificaciones, cambios o actualizaciones derivadas de nuevos requerimientos legales o de nuestras propias necesidades institucionales. Cualquier cambio será publicado oportunamente a través de este portal web oficial.
            </p>
          </section>

        </div>

        {/* Sección de ayuda inferior */}
        <div className="mt-10 text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            ¿Tienes alguna duda sobre cómo manejamos tu información escolar?
          </p>
          <Button variant="outline" className="rounded-none border-2 border-slate-300 dark:border-zinc-700 font-bold uppercase tracking-wider text-xs px-6 h-11" asChild>
            <Link href="/#contacto">
              Contactar a Admisiones
            </Link>
          </Button>
        </div>
      </main>
    </div>
  )
}