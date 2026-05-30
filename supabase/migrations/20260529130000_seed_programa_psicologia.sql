-- Referencia: tabla programas (ya creada en Supabase)
-- Insertar carrera de Psicología si aún no existe:
insert into public.programas (id, nombre, tipo, modalidad, duracion, activo)
values (
  'psicologia',
  'Licenciatura en Psicología',
  'licenciatura',
  'Virtual',
  '9 cuatrimestres',
  true
)
on conflict (id) do nothing;
