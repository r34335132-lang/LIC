-- Pre-inscripción: seguimiento y documentos por programa

alter table public.inscripciones
  add column if not exists folio_preinscripcion text unique,
  add column if not exists estado_seguimiento text not null default 'sin_contactar'
    check (estado_seguimiento in (
      'sin_contactar',
      'en_comunicacion',
      'interesado',
      'faltan_documentos',
      'documentos_completos',
      'listo_aprobar',
      'no_interesado'
    )),
  add column if not exists notas_seguimiento text;

create index if not exists inscripciones_estado_seguimiento_idx
  on public.inscripciones (estado_seguimiento);

create table if not exists public.programa_documentos_requeridos (
  id uuid primary key default gen_random_uuid(),
  programa_id text not null references public.programas(id) on delete cascade,
  nombre text not null,
  descripcion text,
  obligatorio boolean not null default true,
  orden int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.inscripcion_documentos (
  id uuid primary key default gen_random_uuid(),
  inscripcion_id uuid not null references public.inscripciones(id) on delete cascade,
  documento_requerido_id uuid not null references public.programa_documentos_requeridos(id) on delete cascade,
  archivo_url text not null,
  nombre_archivo text,
  estado text not null default 'pendiente'
    check (estado in ('pendiente', 'aprobado', 'rechazado')),
  notas_admin text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (inscripcion_id, documento_requerido_id)
);

create index if not exists programa_documentos_programa_id_idx
  on public.programa_documentos_requeridos (programa_id);
create index if not exists inscripcion_documentos_inscripcion_id_idx
  on public.inscripcion_documentos (inscripcion_id);

comment on table public.programa_documentos_requeridos is 'Documentos que el admin define por programa de estudio';
comment on table public.inscripcion_documentos is 'Archivos subidos por el aspirante en su pre-inscripción';

-- Bucket para documentos de inscripción
insert into storage.buckets (id, name, public)
values ('inscripcion-documentos', 'inscripcion-documentos', false)
on conflict (id) do nothing;

alter table public.programa_documentos_requeridos enable row level security;
alter table public.inscripcion_documentos enable row level security;

drop policy if exists "admin_all_programa_documentos" on public.programa_documentos_requeridos;
create policy "admin_all_programa_documentos" on public.programa_documentos_requeridos
  for all using (
    exists (select 1 from public.perfiles where id = auth.uid() and rol = 'admin')
  ) with check (
    exists (select 1 from public.perfiles where id = auth.uid() and rol = 'admin')
  );

drop policy if exists "admin_all_inscripcion_documentos" on public.inscripcion_documentos;
create policy "admin_all_inscripcion_documentos" on public.inscripcion_documentos
  for all using (
    exists (select 1 from public.perfiles where id = auth.uid() and rol = 'admin')
  ) with check (
    exists (select 1 from public.perfiles where id = auth.uid() and rol = 'admin')
  );

drop policy if exists "alumno_own_inscripcion_documentos" on public.inscripcion_documentos;
create policy "alumno_own_inscripcion_documentos" on public.inscripcion_documentos
  for all using (
    exists (
      select 1 from public.inscripciones i
      where i.id = inscripcion_id and i.alumno_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.inscripciones i
      where i.id = inscripcion_id and i.alumno_id = auth.uid()
    )
  );
