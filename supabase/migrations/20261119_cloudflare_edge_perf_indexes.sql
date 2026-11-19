-- ============================================================================
-- Migration: 20261119_cloudflare_edge_perf_indexes.sql
-- Target: Angelika Fashions (Cloudflare Edge + Supabase PostgreSQL Optimization)
-- Applies Supabase Postgres Best Practices:
--   1. Foreign-key & hot-path partial indexes for sub-10ms edge Worker queries
--   2. Webhook & payment verification index coverage (payment_id, tracking_number)
--   3. CMS content_blocks & product_images covering indexes
--   4. RLS InitPlan optimization ((SELECT auth.uid())) on RBAC helper functions
-- ============================================================================

BEGIN;

-- ----------------------------------------------------------------------------
-- 1. RLS Helper InitPlan Optimization (Evaluates auth.uid() once per query)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = (SELECT auth.uid())
      AND role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.has_admin_access()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = (SELECT auth.uid())
      AND role IN ('admin', 'manager', 'designer')
  );
$$;

CREATE OR REPLACE FUNCTION public.has_role(allowed_roles text[])
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = (SELECT auth.uid())
      AND role = ANY(allowed_roles)
  );
$$;

-- ----------------------------------------------------------------------------
-- 2. Storefront Catalog & PDP Hot-Path Partial Indexes
-- ----------------------------------------------------------------------------

-- Fast O(1) lookup for Product Detail Pages (/product/[slug])
CREATE INDEX IF NOT EXISTS idx_products_active_slug
  ON public.products (slug)
  WHERE is_active = true;

-- Fast lookup for Homepage & Vidhya's Picks curated queries
CREATE INDEX IF NOT EXISTS idx_products_active_vidyas_pick_created
  ON public.products (created_at DESC)
  WHERE is_active = true AND is_vidyas_pick = true;

-- Fast lookup for active categories by slug
CREATE INDEX IF NOT EXISTS idx_categories_active_slug
  ON public.categories (slug)
  WHERE is_active = true;

-- Fast ordered retrieval of product gallery images
CREATE INDEX IF NOT EXISTS idx_product_images_product_primary_sort
  ON public.product_images (product_id, is_primary DESC, sort_order ASC);

-- Fast published review aggregation & listing per product
CREATE INDEX IF NOT EXISTS idx_reviews_product_published_created
  ON public.reviews (product_id, created_at DESC)
  WHERE is_published = true;

-- ----------------------------------------------------------------------------
-- 3. Transactional Checkout, Payment Webhook & Logistics Indexes
-- ----------------------------------------------------------------------------

-- Foreign key indexes on order_items (prevents sequential scans on joins & review verification)
CREATE INDEX IF NOT EXISTS idx_order_items_order_id
  ON public.order_items (order_id);

CREATE INDEX IF NOT EXISTS idx_order_items_product_id
  ON public.order_items (product_id);

CREATE INDEX IF NOT EXISTS idx_order_items_variant_id
  ON public.order_items (variant_id);

-- Instant order lookup during Razorpay / Stripe payment verification & webhooks
CREATE INDEX IF NOT EXISTS idx_orders_payment_id
  ON public.orders (payment_id)
  WHERE payment_id IS NOT NULL;

-- Instant order lookup during Delhivery AWB webhook status updates
CREATE INDEX IF NOT EXISTS idx_orders_tracking_number
  ON public.orders (tracking_number)
  WHERE tracking_number IS NOT NULL;

-- ----------------------------------------------------------------------------
-- 4. CMS Content Blocks & Store Navigation Indexes
-- ----------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_content_blocks_active_key
  ON public.content_blocks (key)
  WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_content_blocks_type_created
  ON public.content_blocks (type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_navbar_items_active_sort
  ON public.navbar_items (sort_order ASC)
  WHERE is_active = true;

COMMIT;
