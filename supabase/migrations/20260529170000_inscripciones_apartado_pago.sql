-- Pago de apartado en inscripción (antes de aprobación admin)
alter table public.inscripciones
  add column if not exists apartado_monto numeric,
  add column if not exists apartado_pagado_at timestamptz,
  add column if not exists metodo_pago text,
  add column if not exists estado_pago text default 'pendiente',
  add column if not exists pago_error_mensaje text,
  add column if not exists mp_preference_id text,
  add column if not exists mp_payment_id text,
  add column if not exists mp_checkout_url text,
  add column if not exists mp_reference text,
  add column if not exists clip_checkout_url text,
  add column if not exists clip_reference text,
  add column if not exists clip_payment_id text;

comment on column public.inscripciones.apartado_pagado_at is 'Fecha en que se confirmó el pago de apartado';
comment on column public.inscripciones.estado_pago is 'pendiente | pagado | declinado | error';
