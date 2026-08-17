-- Permite calificar aunque el alumno no haya entregado, y asegura el bucket de fotos.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'entregas-imagenes',
  'entregas-imagenes',
  true,
  8388608,
  array['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "entregas_imagenes_public_read" on storage.objects;
create policy "entregas_imagenes_public_read"
  on storage.objects for select
  using (bucket_id = 'entregas-imagenes');

drop policy if exists "entregas_imagenes_authenticated_write" on storage.objects;
create policy "entregas_imagenes_authenticated_write"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'entregas-imagenes');

drop policy if exists "profesor_insert_entregas_materias" on public.actividad_entregas;
create policy "profesor_insert_entregas_materias"
  on public.actividad_entregas
  for insert
  with check (
    exists (
      select 1
      from public.actividades a
      join public.profesor_materias pm on pm.materia_id = a.materia_id
      where a.id = actividad_entregas.actividad_id
        and pm.profesor_id = auth.uid()
        and pm.activo = true
    )
  );
