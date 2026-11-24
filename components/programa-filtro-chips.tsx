'use client'

import { GraduationCap } from 'lucide-react'

export type ProgramaFiltroOpcion = {
  id: string
  nombre: string
  total: number
  badge?: number
  badgeLabel?: string
}

type Props = {
  opciones: ProgramaFiltroOpcion[]
  value: string
  onChange: (id: string) => void
  /** Si hay una sola carrera, no muestra chips (el padre ya debería fijar el filtro). */
  mostrarTodas?: boolean
  label?: string
}

export function ProgramaFiltroChips({
  opciones,
  value,
  onChange,
  mostrarTodas = true,
  label = 'Carrera o curso',
}: Props) {
  if (opciones.length <= 1) return null

  const chips: ProgramaFiltroOpcion[] = mostrarTodas
    ? [
        {
          id: 'todos',
          nombre: 'Todas',
          total: opciones.reduce((acc, o) => acc + o.total, 0),
          badge: opciones.reduce((acc, o) => acc + (o.badge ?? 0), 0),
          badgeLabel: 'pend.',
        },
        ...opciones,
      ]
    : opciones

  return (
    <div className="space-y-2">
      <p className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground">
        <GraduationCap className="h-4 w-4" /> {label}
      </p>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {chips.map((opcion) => {
          const activa = value === opcion.id
          return (
            <button
              key={opcion.id}
              type="button"
              onClick={() => onChange(opcion.id)}
              className={`flex shrink-0 items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
                activa
                  ? 'border-brand-primary bg-brand-primary text-white shadow-md shadow-brand-primary/20'
                  : 'border-border/60 bg-white text-foreground hover:border-brand-primary/40 dark:bg-black/30'
              }`}
            >
              <span className="max-w-[200px] truncate">{opcion.nombre}</span>
              <span
                className={`rounded-md px-1.5 py-0.5 text-xs ${
                  activa ? 'bg-white/20' : 'bg-muted text-muted-foreground'
                }`}
              >
                {opcion.total}
              </span>
              {(opcion.badge ?? 0) > 0 && (
                <span
                  className={`rounded-md px-1.5 py-0.5 text-xs ${
                    activa ? 'bg-amber-400 text-amber-950' : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {opcion.badge} {opcion.badgeLabel ?? 'por revisar'}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
