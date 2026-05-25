'use client'

import { useMemo, useState } from 'react'
import {
  Archive,
  CalendarClock,
  CheckCircle2,
  Download,
  FileCheck,
  FileText,
  MessageSquareText,
  Search,
  SlidersHorizontal,
  UserCheck,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/lib/auth-context'
import { cursos, entregas, tareas, usuarios } from '@/lib/data'
import type { Entrega } from '@/lib/types'

type EntregaVista = Entrega & {
  tareaTitulo: string
  tareaPuntos: number
  cursoNombre: string
  alumnoNombre: string
  alumnoEmail: string
}

const statusOptions = [
  { id: 'todas', label: 'Todas' },
  { id: 'pendiente', label: 'Pendientes' },
  { id: 'revisada', label: 'Revisadas' },
  { id: 'calificada', label: 'Calificadas' },
]

function initials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function statusBadge(status: Entrega['estado']) {
  if (status === 'calificada') {
    return (
      <Badge className="border-0 bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/15">
        <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
        Calificada
      </Badge>
    )
  }

  if (status === 'revisada') {
    return (
      <Badge className="border-0 bg-brand-primary/10 text-brand-primary hover:bg-brand-primary/15">
        <UserCheck className="mr-1.5 h-3.5 w-3.5" />
        Revisada
      </Badge>
    )
  }

  return (
    <Badge className="border-0 bg-amber-500/10 text-amber-700 hover:bg-amber-500/15">
      <CalendarClock className="mr-1.5 h-3.5 w-3.5" />
      Pendiente
    </Badge>
  )
}

export default function EntregasPage() {
  const { user } = useAuth()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('todas')

  const entregasVista = useMemo<EntregaVista[]>(() => {
    const base = user?.rol === 'alumno' ? entregas.filter((entrega) => entrega.alumnoId === user.id) : entregas

    return base.map((entrega) => {
      const tarea = tareas.find((item) => item.id === entrega.tareaId)
      const curso = cursos.find((item) => item.id === tarea?.cursoId)
      const alumno = usuarios.find((item) => item.id === entrega.alumnoId)

      return {
        ...entrega,
        tareaTitulo: tarea?.titulo || 'Tarea sin título',
        tareaPuntos: tarea?.puntosTotales || 100,
        cursoNombre: curso?.nombre || 'Curso no asignado',
        alumnoNombre: alumno?.nombre || 'Alumno no encontrado',
        alumnoEmail: alumno?.email || 'Sin correo registrado',
      }
    })
  }, [user])

  const filtered = entregasVista.filter((entrega) => {
    const text = `${entrega.tareaTitulo} ${entrega.cursoNombre} ${entrega.alumnoNombre}`.toLowerCase()
    const matchesSearch = text.includes(search.toLowerCase())
    const matchesStatus = status === 'todas' || entrega.estado === status

    return matchesSearch && matchesStatus
  })

  const pendientes = entregasVista.filter((entrega) => entrega.estado === 'pendiente').length
  const calificadas = entregasVista.filter((entrega) => entrega.estado === 'calificada').length
  const promedio =
    calificadas > 0
      ? Math.round(
          entregasVista
            .filter((entrega) => typeof entrega.calificacion === 'number')
            .reduce((total, entrega) => total + (entrega.calificacion || 0), 0) / calificadas
        )
      : 0

  return (
    <div className="space-y-8 pb-10">
      <section className="relative overflow-hidden rounded-3xl border border-border/50 bg-slate-950 p-7 text-white shadow-sm sm:p-8">
        <div className="absolute right-0 top-0 h-64 w-64 translate-x-16 -translate-y-20 rounded-full bg-brand-primary/30 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-48 w-48 -translate-x-10 translate-y-16 rounded-full bg-brand-highlight/20 blur-3xl" />

        <div className="relative z-10 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-black uppercase tracking-widest text-brand-highlight">
              <FileCheck className="h-4 w-4" />
              Revisión académica
            </div>
            <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
              Entregas de alumnos
            </h1>
            <p className="mt-3 max-w-2xl text-sm font-medium leading-relaxed text-white/70 sm:text-base">
              {user?.rol === 'alumno'
                ? 'Consulta tus trabajos enviados, retroalimentación y calificaciones registradas.'
                : 'Revisa trabajos recibidos, detecta pendientes y registra retroalimentación con claridad.'}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3">
              <p className="text-2xl font-black">{entregasVista.length}</p>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-white/55">Recibidas</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3">
              <p className="text-2xl font-black">{pendientes}</p>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-white/55">Pendientes</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3">
              <p className="text-2xl font-black">{promedio || '-'}</p>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-white/55">Promedio</p>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-border/50 bg-white/70 p-3 shadow-sm backdrop-blur dark:bg-black/20">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-md">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por alumno, materia o tarea..."
              className="h-12 rounded-2xl border-transparent bg-white pl-11 shadow-sm focus-visible:ring-brand-primary/20"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="hidden items-center gap-2 px-2 text-xs font-bold uppercase tracking-widest text-muted-foreground sm:flex">
              <SlidersHorizontal className="h-4 w-4" />
              Estado
            </span>
            {statusOptions.map((option) => (
              <Button
                key={option.id}
                variant={status === option.id ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setStatus(option.id)}
                className={`h-10 rounded-xl px-4 font-bold ${
                  status === option.id
                    ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/20'
                    : 'text-muted-foreground hover:bg-brand-primary/10 hover:text-brand-primary'
                }`}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4">
        {filtered.map((entrega) => (
          <Card
            key={entrega.id}
            className="group overflow-hidden border-border/50 bg-white/80 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-brand-primary/30 hover:shadow-xl hover:shadow-brand-primary/10 dark:bg-black/30"
          >
            <CardContent className="p-0">
              <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[1fr_auto] lg:items-center">
                <div className="flex gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-primary text-sm font-black text-white shadow-md shadow-brand-primary/20">
                    {initials(entrega.alumnoNombre)}
                  </div>

                  <div className="min-w-0">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      {statusBadge(entrega.estado)}
                      <Badge variant="outline" className="border-brand-primary/20 bg-brand-primary/5 text-brand-primary">
                        {new Date(entrega.fechaEntrega).toLocaleDateString('es-MX', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </Badge>
                    </div>

                    <h2 className="text-xl font-black tracking-tight text-foreground group-hover:text-brand-primary">
                      {entrega.tareaTitulo}
                    </h2>
                    <p className="mt-1 text-sm font-medium text-muted-foreground">
                      {entrega.cursoNombre} · {entrega.alumnoNombre}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-muted-foreground">
                      {entrega.alumnoEmail}
                    </p>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl border border-border/60 bg-muted/30 p-4">
                        <div className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground">
                          <FileText className="h-4 w-4 text-brand-primary" />
                          Archivo o texto
                        </div>
                        <p className="truncate text-sm font-bold text-foreground">
                          {entrega.archivo || entrega.texto || 'Entrega sin adjunto visible'}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-border/60 bg-muted/30 p-4">
                        <div className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground">
                          <MessageSquareText className="h-4 w-4 text-brand-primary" />
                          Retroalimentación
                        </div>
                        <p className="line-clamp-1 text-sm font-bold text-foreground">
                          {entrega.comentarios || 'Pendiente de comentarios'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 border-t border-border/60 pt-4 lg:min-w-48 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
                  <div className="rounded-2xl bg-slate-950 p-4 text-center text-white">
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/50">Calificación</p>
                    <p className="mt-1 text-3xl font-black">
                      {typeof entrega.calificacion === 'number' ? entrega.calificacion : '-'}
                      <span className="text-sm font-bold text-white/50">/{entrega.tareaPuntos}</span>
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" className="h-10 rounded-xl border-border/70 font-bold">
                      <Download className="mr-2 h-4 w-4" />
                      Archivo
                    </Button>
                    <Button className="h-10 rounded-xl bg-brand-primary font-black text-white hover:bg-brand-primary/90">
                      Revisar
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border/60 bg-white/60 p-14 text-center dark:bg-black/20">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-primary/10">
            <Archive className="h-8 w-8 text-brand-primary" />
          </div>
          <h2 className="text-2xl font-black text-foreground">No hay entregas con esos filtros</h2>
          <p className="mt-2 max-w-md text-sm font-medium text-muted-foreground">
            Ajusta la búsqueda o cambia el estado para revisar otros trabajos registrados.
          </p>
        </div>
      )}
    </div>
  )
}
