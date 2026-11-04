-- ============================================================
-- Migration: shop_the_look
-- Tables: looks, look_hotspots
-- RLS: public read, admin write
-- ============================================================

-- 1. LOOKS TABLE
-- Stores the lifestyle image and metadata for each "look"
CREATE TABLE IF NOT EXISTS public.looks (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title           text NOT NULL,
  slug            text NOT NULL UNIQUE,
  description     text,
  image_url       text NOT NULL,           -- lifestyle/editorial image
  is_active       boolean NOT NULL DEFAULT true,
  display_order   integer NOT NULL DEFAULT 0,
  published_at    timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- 2. LOOK_HOTSPOTS TABLE
-- Each row is a pin on an image linking to a product
CREATE TABLE IF NOT EXISTS public.look_hotspots (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  look_id     uuid NOT NULL REFERENCES public.looks(id) ON DELETE CASCADE,
  product_id  uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  -- position as percentage of image width/height (0–100)
  x_percent   numeric(5,2) NOT NULL CHECK (x_percent BETWEEN 0 AND 100),
  y_percent   numeric(5,2) NOT NULL CHECK (y_percent BETWEEN 0 AND 100),
  label       text,                        -- optional tooltip override
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- 3. INDEXES
CREATE INDEX IF NOT EXISTS idx_looks_is_active        ON public.looks(is_active);
CREATE INDEX IF NOT EXISTS idx_looks_display_order    ON public.looks(display_order);
CREATE INDEX IF NOT EXISTS idx_look_hotspots_look_id  ON public.look_hotspots(look_id);
CREATE INDEX IF NOT EXISTS idx_look_hotspots_product  ON public.look_hotspots(product_id);

-- 4. UPDATED_AT TRIGGERS (reuse existing trigger function if it exists)
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_looks_updated_at ON public.looks;
CREATE TRIGGER set_looks_updated_at
  BEFORE UPDATE ON public.looks
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_look_hotspots_updated_at ON public.look_hotspots;
CREATE TRIGGER set_look_hotspots_updated_at
  BEFORE UPDATE ON public.look_hotspots
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 5. ROW LEVEL SECURITY
ALTER TABLE public.looks          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.look_hotspots  ENABLE ROW LEVEL SECURITY;

-- Public: anyone can read active looks
CREATE POLICY "looks_public_read"
  ON public.looks FOR SELECT
  USING (is_active = true);

-- Admin: full access to looks
CREATE POLICY "looks_admin_all"
  ON public.looks FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Public: anyone can read hotspots on active looks
CREATE POLICY "look_hotspots_public_read"
  ON public.look_hotspots FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.looks l
      WHERE l.id = look_id AND l.is_active = true
    )
  );

-- Admin: full access to hotspots
CREATE POLICY "look_hotspots_admin_all"
  ON public.look_hotspots FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
