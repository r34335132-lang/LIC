-- Evidencias fotograficas de tareas escritas en libreta.
alter table public.actividad_entregas
  add column if not exists imagenes_urls text[] not null default '{}';

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'entregas-imagenes',
  'entregas-imagenes',
  true,
  8388608,
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

comment on column public.actividad_entregas.imagenes_urls is
  'Fotografias que el alumno adjunta como evidencia de su trabajo en libreta';
