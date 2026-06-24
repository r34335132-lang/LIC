-- Rúbricas de calificación por materia
create table if not exists public.materia_rubricas (
  id uuid primary key default gen_random_uuid(),
  materia_id uuid not null references public.materias(id) on delete cascade,
  profesor_id uuid not null references public.perfiles(id) on delete cascade,
  titulo text not null default 'Rúbrica de calificación',
  descripcion text,
  activo boolean not null default true,
  created_at timestamptz not null default now(),
  unique (materia_id, profesor_id)
);

create table if not exists public.materia_rubrica_criterios (
  id uuid primary key default gen_random_uuid(),
  rubrica_id uuid not null references public.materia_rubricas(id) on delete cascade,
  nombre text not null,
  descripcion text,
  peso numeric(5, 2) not null check (peso > 0 and peso <= 100),
  tipo text not null default 'otro'
    check (tipo in ('tareas', 'examenes', 'otro')),
  orden int not null default 0
);

create index if not exists materia_rubricas_materia_id_idx
  on public.materia_rubricas (materia_id);

-- Exámenes en línea
create table if not exists public.examenes (
  id uuid primary key default gen_random_uuid(),
  materia_id uuid not null references public.materias(id) on delete cascade,
  profesor_id uuid not null references public.perfiles(id) on delete cascade,
  titulo text not null,
  descripcion text,
  link_llamada text,
  tiempo_limite_minutos int not null default 60 check (tiempo_limite_minutos > 0),
  activo boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.examen_preguntas (
  id uuid primary key default gen_random_uuid(),
  examen_id uuid not null references public.examenes(id) on delete cascade,
  texto text not null,
  respuesta_correcta text not null,
  puntos numeric(5, 2) not null default 1 check (puntos > 0),
  orden int not null default 0
);

create table if not exists public.examen_intentos (
  id uuid primary key default gen_random_uuid(),
  examen_id uuid not null references public.examenes(id) on delete cascade,
  alumno_id uuid not null references public.perfiles(id) on delete cascade,
  iniciado_at timestamptz not null default now(),
  finalizado_at timestamptz,
  tiempo_usado_segundos int,
  puntos_obtenidos numeric(8, 2),
  puntos_totales numeric(8, 2),
  calificacion numeric(4, 2) check (calificacion >= 0 and calificacion <= 10),
  estado text not null default 'en_progreso'
    check (estado in ('en_progreso', 'finalizado', 'revisado')),
  unique (examen_id, alumno_id)
);

create table if not exists public.examen_respuestas (
  id uuid primary key default gen_random_uuid(),
  intento_id uuid not null references public.examen_intentos(id) on delete cascade,
  pregunta_id uuid not null references public.examen_preguntas(id) on delete cascade,
  respuesta_alumno text,
  es_correcta boolean,
  puntos_obtenidos numeric(5, 2) default 0,
  puntos_maximos numeric(5, 2) not null,
  corregido_manual boolean not null default false,
  nota_profesor text,
  unique (intento_id, pregunta_id)
);

create index if not exists examenes_materia_id_idx on public.examenes (materia_id);
create index if not exists examen_preguntas_examen_id_idx on public.examen_preguntas (examen_id);
create index if not exists examen_intentos_examen_id_idx on public.examen_intentos (examen_id);
create index if not exists examen_intentos_alumno_id_idx on public.examen_intentos (alumno_id);

comment on table public.materia_rubricas is 'Rúbrica de ponderación para calificar una materia';
comment on table public.examenes is 'Exámenes en línea con límite de tiempo y link de videollamada';

-- RLS
alter table public.materia_rubricas enable row level security;
alter table public.materia_rubrica_criterios enable row level security;
alter table public.examenes enable row level security;
alter table public.examen_preguntas enable row level security;
alter table public.examen_intentos enable row level security;
alter table public.examen_respuestas enable row level security;

-- materia_rubricas
drop policy if exists "admin_all_materia_rubricas" on public.materia_rubricas;
create policy "admin_all_materia_rubricas" on public.materia_rubricas
  for all using (
    exists (select 1 from public.perfiles where id = auth.uid() and rol = 'admin')
  ) with check (
    exists (select 1 from public.perfiles where id = auth.uid() and rol = 'admin')
  );

drop policy if exists "profesor_own_materia_rubricas" on public.materia_rubricas;
create policy "profesor_own_materia_rubricas" on public.materia_rubricas
  for all using (profesor_id = auth.uid()) with check (profesor_id = auth.uid());

drop policy if exists "alumno_read_materia_rubricas" on public.materia_rubricas;
create policy "alumno_read_materia_rubricas" on public.materia_rubricas
  for select using (
    activo = true and exists (
      select 1 from public.alumno_materias am
      where am.materia_id = materia_rubricas.materia_id and am.alumno_id = auth.uid()
    )
  );

-- materia_rubrica_criterios (via rubrica ownership)
drop policy if exists "admin_all_rubrica_criterios" on public.materia_rubrica_criterios;
create policy "admin_all_rubrica_criterios" on public.materia_rubrica_criterios
  for all using (
    exists (select 1 from public.perfiles where id = auth.uid() and rol = 'admin')
  ) with check (
    exists (select 1 from public.perfiles where id = auth.uid() and rol = 'admin')
  );

drop policy if exists "profesor_own_rubrica_criterios" on public.materia_rubrica_criterios;
create policy "profesor_own_rubrica_criterios" on public.materia_rubrica_criterios
  for all using (
    exists (
      select 1 from public.materia_rubricas r
      where r.id = rubrica_id and r.profesor_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.materia_rubricas r
      where r.id = rubrica_id and r.profesor_id = auth.uid()
    )
  );

drop policy if exists "alumno_read_rubrica_criterios" on public.materia_rubrica_criterios;
create policy "alumno_read_rubrica_criterios" on public.materia_rubrica_criterios
  for select using (
    exists (
      select 1 from public.materia_rubricas r
      join public.alumno_materias am on am.materia_id = r.materia_id
      where r.id = rubrica_id and r.activo = true and am.alumno_id = auth.uid()
    )
  );

-- examenes
drop policy if exists "admin_all_examenes" on public.examenes;
create policy "admin_all_examenes" on public.examenes
  for all using (
    exists (select 1 from public.perfiles where id = auth.uid() and rol = 'admin')
  ) with check (
    exists (select 1 from public.perfiles where id = auth.uid() and rol = 'admin')
  );

drop policy if exists "profesor_own_examenes" on public.examenes;
create policy "profesor_own_examenes" on public.examenes
  for all using (profesor_id = auth.uid()) with check (profesor_id = auth.uid());

drop policy if exists "alumno_read_examenes" on public.examenes;
create policy "alumno_read_examenes" on public.examenes
  for select using (
    activo = true and exists (
      select 1 from public.alumno_materias am
      where am.materia_id = examenes.materia_id and am.alumno_id = auth.uid()
    )
  );

-- examen_preguntas: alumnos no ven respuesta_correcta vía RLS select parcial no es posible;
-- las APIs usan admin client y filtran campos sensibles.
drop policy if exists "admin_all_examen_preguntas" on public.examen_preguntas;
create policy "admin_all_examen_preguntas" on public.examen_preguntas
  for all using (
    exists (select 1 from public.perfiles where id = auth.uid() and rol = 'admin')
  ) with check (
    exists (select 1 from public.perfiles where id = auth.uid() and rol = 'admin')
  );

drop policy if exists "profesor_examen_preguntas" on public.examen_preguntas;
create policy "profesor_examen_preguntas" on public.examen_preguntas
  for all using (
    exists (
      select 1 from public.examenes e
      where e.id = examen_id and e.profesor_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.examenes e
      where e.id = examen_id and e.profesor_id = auth.uid()
    )
  );

drop policy if exists "alumno_read_examen_preguntas" on public.examen_preguntas;
create policy "alumno_read_examen_preguntas" on public.examen_preguntas
  for select using (
    exists (
      select 1 from public.examenes e
      join public.alumno_materias am on am.materia_id = e.materia_id
      where e.id = examen_id and e.activo = true and am.alumno_id = auth.uid()
    )
  );

-- examen_intentos
drop policy if exists "admin_all_examen_intentos" on public.examen_intentos;
create policy "admin_all_examen_intentos" on public.examen_intentos
  for all using (
    exists (select 1 from public.perfiles where id = auth.uid() and rol = 'admin')
  ) with check (
    exists (select 1 from public.perfiles where id = auth.uid() and rol = 'admin')
  );

drop policy if exists "alumno_own_examen_intentos" on public.examen_intentos;
create policy "alumno_own_examen_intentos" on public.examen_intentos
  for all using (alumno_id = auth.uid()) with check (alumno_id = auth.uid());

drop policy if exists "profesor_read_examen_intentos" on public.examen_intentos;
create policy "profesor_read_examen_intentos" on public.examen_intentos
  for select using (
    exists (
      select 1 from public.examenes e
      join public.profesor_materias pm on pm.materia_id = e.materia_id
      where e.id = examen_id and pm.profesor_id = auth.uid() and pm.activo = true
    )
  );

drop policy if exists "profesor_update_examen_intentos" on public.examen_intentos;
create policy "profesor_update_examen_intentos" on public.examen_intentos
  for update using (
    exists (
      select 1 from public.examenes e
      join public.profesor_materias pm on pm.materia_id = e.materia_id
      where e.id = examen_id and pm.profesor_id = auth.uid() and pm.activo = true
    )
  );

-- examen_respuestas
drop policy if exists "admin_all_examen_respuestas" on public.examen_respuestas;
create policy "admin_all_examen_respuestas" on public.examen_respuestas
  for all using (
    exists (select 1 from public.perfiles where id = auth.uid() and rol = 'admin')
  ) with check (
    exists (select 1 from public.perfiles where id = auth.uid() and rol = 'admin')
  );

drop policy if exists "alumno_own_examen_respuestas" on public.examen_respuestas;
create policy "alumno_own_examen_respuestas" on public.examen_respuestas
  for all using (
    exists (
      select 1 from public.examen_intentos i
      where i.id = intento_id and i.alumno_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.examen_intentos i
      where i.id = intento_id and i.alumno_id = auth.uid()
    )
  );

drop policy if exists "profesor_examen_respuestas" on public.examen_respuestas;
create policy "profesor_examen_respuestas" on public.examen_respuestas
  for all using (
    exists (
      select 1 from public.examen_intentos i
      join public.examenes e on e.id = i.examen_id
      join public.profesor_materias pm on pm.materia_id = e.materia_id
      where i.id = intento_id and pm.profesor_id = auth.uid() and pm.activo = true
    )
  ) with check (
    exists (
      select 1 from public.examen_intentos i
      join public.examenes e on e.id = i.examen_id
      join public.profesor_materias pm on pm.materia_id = e.materia_id
      where i.id = intento_id and pm.profesor_id = auth.uid() and pm.activo = true
    )
  );
