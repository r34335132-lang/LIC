-- Avisos directos a alumno (recordatorios de pago desde admin)
alter table public.avisos
  alter column materia_id drop not null;

alter table public.avisos
  add column if not exists alumno_id uuid references public.perfiles(id) on delete cascade,
  add column if not exists mensualidad_id uuid references public.mensualidades(id) on delete set null;

alter table public.avisos drop constraint if exists avisos_tipo_check;
alter table public.avisos add constraint avisos_tipo_check
  check (tipo in ('general', 'materia', 'urgente', 'clase', 'pago'));

create index if not exists avisos_alumno_id_idx on public.avisos (alumno_id);

comment on column public.avisos.alumno_id is 'Si se define, solo ese alumno ve el aviso (ej. recordatorio de pago)';
comment on column public.avisos.mensualidad_id is 'Mensualidad relacionada al recordatorio de pago';

drop policy if exists "alumno_read_avisos_direct" on public.avisos;
create policy "alumno_read_avisos_direct" on public.avisos
  for select
  using (
    activo = true
    and alumno_id = auth.uid()
  );
