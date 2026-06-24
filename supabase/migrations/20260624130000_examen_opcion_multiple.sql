-- Tipo de pregunta y opciones para exámenes de opción múltiple
alter table public.examen_preguntas
  add column if not exists tipo text not null default 'texto'
    check (tipo in ('texto', 'opcion_multiple'));

alter table public.examen_preguntas
  add column if not exists opciones jsonb;

comment on column public.examen_preguntas.tipo is 'texto = respuesta abierta; opcion_multiple = selección única';
comment on column public.examen_preguntas.opciones is 'Array JSON de strings con las opciones (solo opcion_multiple)';
comment on column public.examen_preguntas.respuesta_correcta is 'Texto o índice (0-based) de la opción correcta';
