'use client'

import Link from 'next/link'
import { FileText, Upload, Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  montoInscripcionFicha,
  montoMensualidadFicha,
  buildDocumentosPreInscripcionUrl,
} from '@/lib/preinscripcion-utils'

type FichaPagoProps = {
  folio: string
  inscripcionId: string
  nombreCompleto: string
  email: string
  programaNombre: string
}

export function FichaPago({
  folio,
  inscripcionId,
  nombreCompleto,
  email,
  programaNombre,
}: FichaPagoProps) {
  const montoInscripcion = montoInscripcionFicha()
  const montoMensualidad = montoMensualidadFicha()
  const fecha = new Date().toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="space-y-5" id="ficha-pago">
      <div className="rounded-xl border-2 border-brand-primary/30 bg-white p-6 shadow-sm print:shadow-none">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 pb-4">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-brand-primary">
              Instituto Universitario de Durango
            </p>
            <h2 className="mt-1 text-xl font-black text-slate-950">Ficha de pre-inscripción</h2>
          </div>
          <Badge className="bg-brand-primary text-white font-mono">{folio}</Badge>
        </div>

        <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <p><span className="font-semibold text-slate-600">Aspirante:</span> {nombreCompleto}</p>
          <p><span className="font-semibold text-slate-600">Correo:</span> {email}</p>
          <p className="sm:col-span-2"><span className="font-semibold text-slate-600">Programa:</span> {programaNombre}</p>
          <p><span className="font-semibold text-slate-600">Fecha:</span> {fecha}</p>
        </div>

        <div className="mt-6 overflow-hidden rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-2 text-left font-bold">Concepto</th>
                <th className="px-4 py-2 text-right font-bold">Monto</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t">
                <td className="px-4 py-3">Inscripción (promoción vigente)</td>
                <td className="px-4 py-3 text-right font-bold text-emerald-700">
                  {montoInscripcion === 0 ? 'GRATIS' : `$${montoInscripcion.toLocaleString('es-MX')} MXN`}
                </td>
              </tr>
              <tr className="border-t bg-slate-50/50">
                <td className="px-4 py-3">Mensualidad referencia (primer pago al activar admisión)</td>
                <td className="px-4 py-3 text-right font-bold">
                  ${montoMensualidad.toLocaleString('es-MX')} MXN
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
          Esta ficha confirma tu pre-inscripción. No es necesario pagar en línea para apartar tu lugar.
          Un asesor de admisiones se comunicará contigo. Conserva tu folio y sube los documentos solicitados.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 print:hidden">
        <Button type="button" variant="outline" onClick={() => window.print()}>
          <Printer className="mr-2 h-4 w-4" /> Imprimir / guardar PDF
        </Button>
        <Button asChild className="bg-brand-primary">
          <Link href={buildDocumentosPreInscripcionUrl(inscripcionId)}>
            <Upload className="mr-2 h-4 w-4" /> Subir documentos
          </Link>
        </Button>
      </div>

      <div className="rounded-lg border border-dashed border-brand-primary/40 bg-brand-primary/5 p-4 text-sm print:hidden">
        <p className="flex items-center gap-2 font-bold text-brand-primary">
          <FileText className="h-4 w-4" /> Siguiente paso
        </p>
        <p className="mt-1 text-muted-foreground">
          Sube los documentos que te indiquemos según tu programa. Te contactaremos por correo o teléfono.
        </p>
      </div>
    </div>
  )
}
