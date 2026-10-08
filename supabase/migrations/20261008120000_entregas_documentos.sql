-- Documentos (PDF y Word) adjuntos a las entregas de tareas.
alter table public.actividad_entregas
  add column if not exists documentos jsonb not null default '[]'::jsonb;

comment on column public.actividad_entregas.documentos is
  'Documentos PDF/Word que el alumno adjunta: [{nombre, url, path, tipo, tamano}]';

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'entregas-imagenes',
  'entregas-imagenes',
  true,
  20971520,
  array[
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/heic',
    'image/heif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
