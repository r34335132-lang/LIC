-- Conservar una sola asignación por (profesor_id, materia_id): la más antigua
DELETE FROM public.profesor_materias pm
WHERE pm.id NOT IN (
  SELECT DISTINCT ON (profesor_id, materia_id) id
  FROM public.profesor_materias
  ORDER BY profesor_id, materia_id, created_at ASC, id ASC
);

ALTER TABLE public.profesor_materias
  DROP CONSTRAINT IF EXISTS profesor_materias_profesor_materia_unique;

ALTER TABLE public.profesor_materias
  ADD CONSTRAINT profesor_materias_profesor_materia_unique
  UNIQUE (profesor_id, materia_id);
