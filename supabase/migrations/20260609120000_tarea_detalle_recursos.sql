ALTER TABLE public.actividades
  ADD COLUMN IF NOT EXISTS unidad text,
  ADD COLUMN IF NOT EXISTS instrucciones text;

CREATE TABLE IF NOT EXISTS public.tarea_recursos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tarea_id uuid NOT NULL REFERENCES public.actividades(id) ON DELETE CASCADE,
  titulo text NOT NULL,
  descripcion text,
  tipo text NOT NULL DEFAULT 'enlace'
    CHECK (tipo IN ('video', 'pdf', 'enlace', 'documento', 'lectura')),
  url text NOT NULL,
  orden integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS tarea_recursos_tarea_id_orden_idx
  ON public.tarea_recursos(tarea_id, orden);

ALTER TABLE public.tarea_recursos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_all_tarea_recursos" ON public.tarea_recursos;
CREATE POLICY "admin_all_tarea_recursos" ON public.tarea_recursos
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

DROP POLICY IF EXISTS "alumno_select_tarea_recursos" ON public.tarea_recursos;
CREATE POLICY "alumno_select_tarea_recursos" ON public.tarea_recursos
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.actividades a
      JOIN public.alumno_materias am ON am.materia_id = a.materia_id
      WHERE a.id = tarea_recursos.tarea_id
        AND a.activo = true
        AND am.alumno_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "profesor_select_tarea_recursos" ON public.tarea_recursos;
CREATE POLICY "profesor_select_tarea_recursos" ON public.tarea_recursos
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.actividades a
      JOIN public.profesor_materias pm ON pm.materia_id = a.materia_id
      WHERE a.id = tarea_recursos.tarea_id
        AND pm.profesor_id = auth.uid()
        AND pm.activo = true
    )
  );

DROP POLICY IF EXISTS "profesor_insert_tarea_recursos" ON public.tarea_recursos;
CREATE POLICY "profesor_insert_tarea_recursos" ON public.tarea_recursos
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.actividades a
      JOIN public.profesor_materias pm ON pm.materia_id = a.materia_id
      WHERE a.id = tarea_recursos.tarea_id
        AND pm.profesor_id = auth.uid()
        AND pm.activo = true
    )
  );

DROP POLICY IF EXISTS "profesor_update_tarea_recursos" ON public.tarea_recursos;
CREATE POLICY "profesor_update_tarea_recursos" ON public.tarea_recursos
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM public.actividades a
      JOIN public.profesor_materias pm ON pm.materia_id = a.materia_id
      WHERE a.id = tarea_recursos.tarea_id
        AND pm.profesor_id = auth.uid()
        AND pm.activo = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.actividades a
      JOIN public.profesor_materias pm ON pm.materia_id = a.materia_id
      WHERE a.id = tarea_recursos.tarea_id
        AND pm.profesor_id = auth.uid()
        AND pm.activo = true
    )
  );

DROP POLICY IF EXISTS "profesor_delete_tarea_recursos" ON public.tarea_recursos;
CREATE POLICY "profesor_delete_tarea_recursos" ON public.tarea_recursos
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1
      FROM public.actividades a
      JOIN public.profesor_materias pm ON pm.materia_id = a.materia_id
      WHERE a.id = tarea_recursos.tarea_id
        AND pm.profesor_id = auth.uid()
        AND pm.activo = true
    )
  );
