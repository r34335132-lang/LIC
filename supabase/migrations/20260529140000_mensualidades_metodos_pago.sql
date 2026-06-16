-- Campos de pago multi-proveedor (Mercado Pago + Clip)
alter table public.mensualidades
  add column if not exists metodo_pago text,
  add column if not exists estado_pago text default 'pendiente',
  add column if not exists pago_error_mensaje text,
  add column if not exists mp_preference_id text,
  add column if not exists mp_payment_id text,
  add column if not exists mp_checkout_url text,
  add column if not exists mp_reference text;

comment on column public.mensualidades.metodo_pago is 'mercado_pago | clip';
comment on column public.mensualidades.estado_pago is 'pendiente | pagado | declinado | error';
