-- Cupones de descuento para mensualidades
CREATE TABLE IF NOT EXISTS public.cupones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo text NOT NULL,
  tipo text NOT NULL DEFAULT 'porcentaje' CHECK (tipo IN ('porcentaje')),
  valor numeric NOT NULL CHECK (valor > 0 AND valor <= 100),
  activo boolean NOT NULL DEFAULT true,
  usos_maximos integer CHECK (usos_maximos IS NULL OR usos_maximos > 0),
  usos_actuales integer NOT NULL DEFAULT 0 CHECK (usos_actuales >= 0),
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT cupones_codigo_unique UNIQUE (codigo)
);

CREATE UNIQUE INDEX IF NOT EXISTS cupones_codigo_upper_idx
  ON public.cupones (upper(trim(codigo)));

ALTER TABLE public.mensualidades
  ADD COLUMN IF NOT EXISTS cupon_id uuid REFERENCES public.cupones(id),
  ADD COLUMN IF NOT EXISTS cupon_codigo text,
  ADD COLUMN IF NOT EXISTS monto_descuento numeric,
  ADD COLUMN IF NOT EXISTS monto_final numeric,
  ADD COLUMN IF NOT EXISTS cupon_consumido boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.mensualidades.cupon_codigo IS 'Código del cupón aplicado (referencia legible)';
COMMENT ON COLUMN public.mensualidades.monto_final IS 'Monto a cobrar tras descuento';

-- Beca 100% (sin cobro en pasarela)
INSERT INTO public.cupones (codigo, tipo, valor, activo, usos_maximos)
VALUES ('BECA100', 'porcentaje', 100, true, NULL)
ON CONFLICT (codigo) DO UPDATE SET
  tipo = EXCLUDED.tipo,
  valor = EXCLUDED.valor,
  activo = EXCLUDED.activo;

ALTER TABLE public.cupones ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_all_cupones" ON public.cupones;
CREATE POLICY "admin_all_cupones" ON public.cupones
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
