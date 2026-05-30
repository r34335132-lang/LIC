-- RLS para mensualidades y actividad_entregas
-- NOTA: No crea tablas. Aplicar solo si las tablas ya existen en Supabase.

-- ─── actividad_entregas ───────────────────────────────────────────────────────

ALTER TABLE public.actividad_entregas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_all_actividad_entregas" ON public.actividad_entregas;
CREATE POLICY "admin_all_actividad_entregas" ON public.actividad_entregas
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.perfiles
      WHERE id = auth.uid() AND rol = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.perfiles
      WHERE id = auth.uid() AND rol = 'admin'
    )
  );

DROP POLICY IF EXISTS "alumno_select_own_entregas" ON public.actividad_entregas;
CREATE POLICY "alumno_select_own_entregas" ON public.actividad_entregas
  FOR SELECT
  USING (alumno_id = auth.uid());

DROP POLICY IF EXISTS "alumno_insert_own_entregas" ON public.actividad_entregas;
CREATE POLICY "alumno_insert_own_entregas" ON public.actividad_entregas
  FOR INSERT
  WITH CHECK (
    alumno_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM public.actividades a
      JOIN public.alumno_materias am ON am.materia_id = a.materia_id
      WHERE a.id = actividad_entregas.actividad_id
        AND am.alumno_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "alumno_update_own_entregas" ON public.actividad_entregas;
CREATE POLICY "alumno_update_own_entregas" ON public.actividad_entregas
  FOR UPDATE
  USING (
    alumno_id = auth.uid()
    AND estado <> 'revisada'
  )
  WITH CHECK (
    alumno_id = auth.uid()
    AND estado <> 'revisada'
  );

DROP POLICY IF EXISTS "profesor_select_entregas_materias" ON public.actividad_entregas;
CREATE POLICY "profesor_select_entregas_materias" ON public.actividad_entregas
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.actividades a
      JOIN public.profesor_materias pm ON pm.materia_id = a.materia_id
      WHERE a.id = actividad_entregas.actividad_id
        AND pm.profesor_id = auth.uid()
        AND pm.activo = true
    )
  );

DROP POLICY IF EXISTS "profesor_update_entregas_materias" ON public.actividad_entregas;
CREATE POLICY "profesor_update_entregas_materias" ON public.actividad_entregas
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM public.actividades a
      JOIN public.profesor_materias pm ON pm.materia_id = a.materia_id
      WHERE a.id = actividad_entregas.actividad_id
        AND pm.profesor_id = auth.uid()
        AND pm.activo = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.actividades a
      JOIN public.profesor_materias pm ON pm.materia_id = a.materia_id
      WHERE a.id = actividad_entregas.actividad_id
        AND pm.profesor_id = auth.uid()
        AND pm.activo = true
    )
  );

-- ─── mensualidades ────────────────────────────────────────────────────────────

ALTER TABLE public.mensualidades ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_all_mensualidades" ON public.mensualidades;
CREATE POLICY "admin_all_mensualidades" ON public.mensualidades
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.perfiles
      WHERE id = auth.uid() AND rol = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.perfiles
      WHERE id = auth.uid() AND rol = 'admin'
    )
  );

DROP POLICY IF EXISTS "alumno_select_own_mensualidades" ON public.mensualidades;
CREATE POLICY "alumno_select_own_mensualidades" ON public.mensualidades
  FOR SELECT
  USING (alumno_id = auth.uid());
