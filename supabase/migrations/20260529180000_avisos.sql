-- Avisos del profesor para alumnos (por materia)
create table if not exists public.avisos (
  id uuid primary key default gen_random_uuid(),
  profesor_id uuid not null references public.perfiles(id) on delete cascade,
  materia_id uuid not null references public.materias(id) on delete cascade,
  titulo text not null,
  contenido text not null,
  tipo text not null default 'general'
    check (tipo in ('general', 'materia', 'urgente', 'clase')),
  activo boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists avisos_materia_id_idx on public.avisos (materia_id);
create index if not exists avisos_profesor_id_idx on public.avisos (profesor_id);
create index if not exists avisos_created_at_idx on public.avisos (created_at desc);

comment on table public.avisos is 'Anuncios del profesor visibles para alumnos inscritos en la materia';

alter table public.avisos enable row level security;

drop policy if exists "admin_all_avisos" on public.avisos;
create policy "admin_all_avisos" on public.avisos
  for all
  using (
    exists (select 1 from public.perfiles where id = auth.uid() and rol = 'admin')
  )
  with check (
    exists (select 1 from public.perfiles where id = auth.uid() and rol = 'admin')
  );

drop policy if exists "profesor_own_avisos" on public.avisos;
create policy "profesor_own_avisos" on public.avisos
  for all
  using (profesor_id = auth.uid())
  with check (profesor_id = auth.uid());

drop policy if exists "alumno_read_avisos_materias" on public.avisos;
create policy "alumno_read_avisos_materias" on public.avisos
  for select
  using (
    activo = true
    and exists (
      select 1
      from public.alumno_materias am
      where am.materia_id = avisos.materia_id
        and am.alumno_id = auth.uid()
    )
  );
