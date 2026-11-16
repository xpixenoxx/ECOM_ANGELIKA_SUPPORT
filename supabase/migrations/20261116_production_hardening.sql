-- ============================================================================
-- Migration: 20261116_production_hardening.sql
-- Target: Angelika Fashions (E:\Angelika_s)
-- Guarantees:
--   1. Exact alignment with types/database.ts & live application queries
--   2. Non-destructive preservation of historical order/return statuses
--   3. Dynamic pg_constraint replacement (never fails on auto-named CHECKs)
--   4. Deadlock-free (variant_id ASC lock ordering) & idempotent inventory RPCs
--   5. Two-phase coupon reservation/release with per-user & first-order checks
--   6. Strict REVOKE/GRANT privilege boundaries on all SECURITY DEFINER functions
-- ============================================================================

BEGIN;

-- ----------------------------------------------------------------------------
-- 1. RBAC Helper Functions (SECURITY DEFINER with safe search_path)
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
    WHERE id = auth.uid()
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
    WHERE id = auth.uid()
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
    WHERE id = auth.uid()
      AND role = ANY(allowed_roles)
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.has_admin_access() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.has_role(text[]) TO anon, authenticated, service_role;

-- Dynamically drop any existing CHECK constraints on profiles.role before adding canonical constraint
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT conname
    FROM pg_constraint
    WHERE conrelid = 'public.profiles'::regclass
      AND contype = 'c'
      AND pg_get_constraintdef(oid) ILIKE '%role%'
  LOOP
    EXECUTE format('ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS %I', r.conname);
  END LOOP;
END $$;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('customer', 'designer', 'manager', 'admin'));

-- ----------------------------------------------------------------------------
-- 2. Reconcile Existing Tables (content_blocks, product_images, looks, look_hotspots, orders, returns)
-- ----------------------------------------------------------------------------

-- 2a. content_blocks: add sort_order used by lib/actions/content-blocks.ts
ALTER TABLE public.content_blocks
  ADD COLUMN IF NOT EXISTS sort_order integer NOT NULL DEFAULT 0;

-- 2a-bis. product_images: add width, height, blur_data_url, metadata used by lib/image-processing.ts
ALTER TABLE public.product_images
  ADD COLUMN IF NOT EXISTS width integer,
  ADD COLUMN IF NOT EXISTS height integer,
  ADD COLUMN IF NOT EXISTS blur_data_url text,
  ADD COLUMN IF NOT EXISTS metadata jsonb NOT NULL DEFAULT '{}'::jsonb;

-- 2b. looks & look_hotspots: reconcile 20261026_shop_the_look.sql (title/slug/image_url NOT NULL) with types/database.ts (name/lifestyle_image_url)
ALTER TABLE public.looks
  ADD COLUMN IF NOT EXISTS name text,
  ADD COLUMN IF NOT EXISTS lifestyle_image_url text,
  ADD COLUMN IF NOT EXISTS lifestyle_image_alt text,
  ADD COLUMN IF NOT EXISTS display_order integer DEFAULT 0;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='looks' AND column_name='title') THEN
    EXECUTE 'ALTER TABLE public.looks ALTER COLUMN title DROP NOT NULL';
    EXECUTE 'UPDATE public.looks SET name = COALESCE(name, title) WHERE name IS NULL AND title IS NOT NULL';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='looks' AND column_name='slug') THEN
    EXECUTE 'ALTER TABLE public.looks ALTER COLUMN slug DROP NOT NULL';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='looks' AND column_name='image_url') THEN
    EXECUTE 'ALTER TABLE public.looks ALTER COLUMN image_url DROP NOT NULL';
    EXECUTE 'UPDATE public.looks SET lifestyle_image_url = COALESCE(lifestyle_image_url, image_url) WHERE lifestyle_image_url IS NULL AND image_url IS NOT NULL';
  END IF;
END $$;

ALTER TABLE public.look_hotspots
  ADD COLUMN IF NOT EXISTS display_order integer DEFAULT 0;

DROP POLICY IF EXISTS "looks_public_read" ON public.looks;
CREATE POLICY "looks_public_read"
  ON public.looks FOR SELECT
  USING (is_active = true OR public.has_role(ARRAY['admin', 'manager', 'designer']));

DROP POLICY IF EXISTS "looks_admin_all" ON public.looks;
CREATE POLICY "looks_admin_all"
  ON public.looks FOR ALL
  USING (public.has_role(ARRAY['admin', 'manager', 'designer']))
  WITH CHECK (public.has_role(ARRAY['admin', 'manager', 'designer']));

DROP POLICY IF EXISTS "look_hotspots_public_read" ON public.look_hotspots;
CREATE POLICY "look_hotspots_public_read"
  ON public.look_hotspots FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.looks l
      WHERE l.id = look_hotspots.look_id
        AND (l.is_active = true OR public.has_role(ARRAY['admin', 'manager', 'designer']))
    )
  );

DROP POLICY IF EXISTS "look_hotspots_admin_all" ON public.look_hotspots;
CREATE POLICY "look_hotspots_admin_all"
  ON public.look_hotspots FOR ALL
  USING (public.has_role(ARRAY['admin', 'manager', 'designer']))
  WITH CHECK (public.has_role(ARRAY['admin', 'manager', 'designer']));

-- 2c. orders: add idempotency_key & tracking_url; preserve historical statuses safely
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS idempotency_key text UNIQUE,
  ADD COLUMN IF NOT EXISTS tracking_url text;

-- Safe migration for any legacy rows where financial status 'refunded' was stored in orders.status:
-- Never fabricate a 'delivered' status if delivered_at is NULL!
UPDATE public.orders
SET
  metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object('legacy_status_before_migration', status),
  payment_status = 'refunded',
  status = CASE
    WHEN delivered_at IS NOT NULL THEN 'delivered'
    WHEN shipped_at IS NOT NULL THEN 'rto'
    ELSE 'cancelled'
  END,
  cancelled_at = CASE
    WHEN delivered_at IS NULL AND shipped_at IS NULL THEN COALESCE(cancelled_at, updated_at, created_at)
    ELSE cancelled_at
  END
WHERE status = 'refunded';

UPDATE public.orders
SET payment_status = 'pending'
WHERE payment_status IS NULL
   OR payment_status NOT IN ('pending', 'paid', 'failed', 'refunded', 'partially_refunded');

UPDATE public.orders
SET
  metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object('legacy_status_before_migration', status),
  status = 'confirmed'
WHERE status IS NULL
   OR status NOT IN (
     'pending', 'confirmed', 'processing', 'shipped',
     'out_for_delivery', 'delivered', 'delivery_failed', 'rto', 'returned', 'cancelled'
   );

DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT conname
    FROM pg_constraint
    WHERE conrelid = 'public.orders'::regclass
      AND contype = 'c'
      AND (pg_get_constraintdef(oid) ILIKE '%status%' OR pg_get_constraintdef(oid) ILIKE '%payment_status%')
  LOOP
    EXECUTE format('ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS %I', r.conname);
  END LOOP;
END $$;

ALTER TABLE public.orders
  ADD CONSTRAINT orders_status_check
  CHECK (status IN (
    'pending', 'confirmed', 'processing', 'shipped',
    'out_for_delivery', 'delivered', 'delivery_failed', 'rto', 'returned', 'cancelled'
  ));

ALTER TABLE public.orders
  ADD CONSTRAINT orders_payment_status_check
  CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded', 'partially_refunded'));

-- 2d. returns: allow guest returns (nullable user_id) & add inspection/idempotency columns
ALTER TABLE public.returns
  ALTER COLUMN user_id DROP NOT NULL;

ALTER TABLE public.returns
  ADD COLUMN IF NOT EXISTS stock_restored boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS inspection_passed boolean,
  ADD COLUMN IF NOT EXISTS inspection_notes text,
  ADD COLUMN IF NOT EXISTS inspected_at timestamptz,
  ADD COLUMN IF NOT EXISTS refund_reference text,
  ADD COLUMN IF NOT EXISTS replacement_order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL;

UPDATE public.returns
SET status = 'requested'
WHERE status = 'pending';

DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT conname
    FROM pg_constraint
    WHERE conrelid = 'public.returns'::regclass
      AND contype = 'c'
      AND (pg_get_constraintdef(oid) ILIKE '%status%' OR pg_get_constraintdef(oid) ILIKE '%reason%')
  LOOP
    EXECUTE format('ALTER TABLE public.returns DROP CONSTRAINT IF EXISTS %I', r.conname);
  END LOOP;
END $$;

ALTER TABLE public.returns
  ADD CONSTRAINT returns_status_check
  CHECK (status IN (
    'requested', 'more_info_needed', 'approved', 'picked_up', 'shipped',
    'received', 'inspected', 'refunded', 'exchanged', 'rejected', 'cancelled'
  ));

ALTER TABLE public.returns
  ADD CONSTRAINT returns_reason_check
  CHECK (reason IN (
    'size', 'fit', 'wrong_item', 'damaged', 'quality', 'changed_mind', 'other',
    'wrong_size', 'wrong_color', 'not_as_described', 'quality_issue', 'late_delivery'
  ));

-- ----------------------------------------------------------------------------
-- 3. Create Missing Tables (Matching exact application contracts)
-- ----------------------------------------------------------------------------

-- 3a. public.store_settings (Flat columns for store-settings.ts + extended_settings JSONB)
CREATE TABLE IF NOT EXISTS public.store_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_name text NOT NULL DEFAULT 'Angelika Fashions',
  site_tagline text NOT NULL DEFAULT 'Luxury Handcrafted Indian Ethnic Wear',
  logo_url text,
  favicon_url text,
  announcement_bar_enabled boolean NOT NULL DEFAULT true,
  announcement_bar_text text NOT NULL DEFAULT 'Complimentary Pan-India Shipping on Orders Above ₹2,999',
  announcement_bar_link text NOT NULL DEFAULT '/shop',
  announcement_bar_bg_color text NOT NULL DEFAULT '#1C1917',
  announcement_bar_text_color text NOT NULL DEFAULT '#C9A84C',
  contact_email text NOT NULL DEFAULT '',
  contact_phone text NOT NULL DEFAULT '',
  contact_whatsapp text NOT NULL DEFAULT '',
  address text NOT NULL DEFAULT '',
  social_instagram text NOT NULL DEFAULT '',
  social_facebook text NOT NULL DEFAULT '',
  social_whatsapp text NOT NULL DEFAULT '',
  social_youtube text NOT NULL DEFAULT '',
  currency text NOT NULL DEFAULT 'INR',
  currency_symbol text NOT NULL DEFAULT '₹',
  free_shipping_threshold numeric(10,2) NOT NULL DEFAULT 2999,
  cod_max_amount numeric(10,2) NOT NULL DEFAULT 10000,
  return_policy_days integer NOT NULL DEFAULT 7,
  meta_title text NOT NULL DEFAULT 'Angelika Fashions — Handcrafted Indian Ethnic Couture',
  meta_description text NOT NULL DEFAULT 'Curated sarees, lehengas, salwar suits, kurtis, and dupattas by Designer Vidhya.',
  extended_settings jsonb NOT NULL DEFAULT '{
    "shipping": {"standardRate": 99, "expressRate": 249, "defaultPartner": "Delhivery Express", "estimatedDays": "5-7 business days"},
    "payments": {"codEnabled": true, "codFee": 49, "upiEnabled": true, "intlEnabled": false},
    "taxes": {"gstin": null, "pricesIncludeTax": true, "apparelLowRate": 5, "apparelHighRate": 12, "thresholdAmount": 1000},
    "emails": {"senderName": "Angelika Fashions", "senderEmail": "", "orderConfirmationEnabled": true, "shipmentNotificationEnabled": true},
    "notifications": {"orderSound": true, "vipSmsAlert": false, "lowStockAlert": true, "dailyDigest": true, "lowStockThreshold": 5}
  }'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "store_settings_public_read" ON public.store_settings;
CREATE POLICY "store_settings_public_read"
  ON public.store_settings FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "store_settings_admin_write" ON public.store_settings;
CREATE POLICY "store_settings_admin_write"
  ON public.store_settings FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

INSERT INTO public.store_settings (site_name)
SELECT 'Angelika Fashions'
WHERE NOT EXISTS (SELECT 1 FROM public.store_settings);

-- 3b. public.navbar_items (Matching NavbarItem in lib/actions/store-settings.ts)
CREATE TABLE IF NOT EXISTS public.navbar_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL,
  href text NOT NULL,
  parent_id uuid REFERENCES public.navbar_items(id) ON DELETE CASCADE,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  badge_text text,
  badge_color text NOT NULL DEFAULT '#C9A84C',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.navbar_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "navbar_items_public_read" ON public.navbar_items;
CREATE POLICY "navbar_items_public_read"
  ON public.navbar_items FOR SELECT
  USING (is_active = true OR public.has_admin_access());

DROP POLICY IF EXISTS "navbar_items_admin_designer_write" ON public.navbar_items;
CREATE POLICY "navbar_items_admin_designer_write"
  ON public.navbar_items FOR ALL
  USING (public.has_role(ARRAY['admin', 'designer']))
  WITH CHECK (public.has_role(ARRAY['admin', 'designer']));

INSERT INTO public.navbar_items (label, href, sort_order, is_active, badge_text)
SELECT * FROM (VALUES
  ('Kurtis', '/shop/kurtis', 1, true, NULL),
  ('Salwars', '/shop/salwars', 2, true, NULL),
  ('Sarees', '/shop/sarees', 3, true, NULL),
  ('Lehengas', '/shop/lehengas', 4, true, NULL),
  ('Dupattas', '/shop/dupattas', 5, true, NULL),
  ('New Arrivals', '/new-arrivals', 6, true, 'NEW'),
  ('Vidhya''s Picks', '/vidhyas-picks', 7, true, 'CURATED'),
  ('Sale', '/sale', 8, true, 'OFFERS')
) AS v(label, href, sort_order, is_active, badge_text)
WHERE NOT EXISTS (SELECT 1 FROM public.navbar_items);

-- 3c. public.notifications (Supports both lib/actions/payments.ts and Admin Bell)
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  role_target text NOT NULL DEFAULT 'admin' CHECK (role_target IN ('admin', 'customer')),
  type text NOT NULL,
  channel text NOT NULL DEFAULT 'in_app',
  subject text,
  title text,
  content text,
  message text,
  link text,
  status text NOT NULL DEFAULT 'pending',
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notifications_select_policy" ON public.notifications;
CREATE POLICY "notifications_select_policy"
  ON public.notifications FOR SELECT
  USING (
    (user_id IS NOT NULL AND user_id = auth.uid())
    OR (user_id IS NULL AND public.has_admin_access())
    OR (role_target = 'admin' AND public.has_admin_access())
  );

DROP POLICY IF EXISTS "notifications_update_policy" ON public.notifications;
CREATE POLICY "notifications_update_policy"
  ON public.notifications FOR UPDATE
  USING (
    (user_id IS NOT NULL AND user_id = auth.uid())
    OR (public.has_admin_access())
  );

-- 3d. public.inventory_reservations (Two-Phase Atomic Stock Reservation)
CREATE TABLE IF NOT EXISTS public.inventory_reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  variant_id uuid NOT NULL REFERENCES public.product_variants(id) ON DELETE CASCADE,
  quantity integer NOT NULL CHECK (quantity > 0),
  status text NOT NULL DEFAULT 'reserved'
    CHECK (status IN ('reserved', 'confirmed', 'released', 'conflict')),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '15 minutes'),
  confirmed_at timestamptz,
  released_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (order_id, variant_id)
);

ALTER TABLE public.inventory_reservations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "inventory_reservations_admin_read" ON public.inventory_reservations;
CREATE POLICY "inventory_reservations_admin_read"
  ON public.inventory_reservations FOR SELECT
  USING (public.has_admin_access());

-- 3e. public.coupon_redemptions (Two-Phase Coupon Reservation & Per-User Tracking)
CREATE TABLE IF NOT EXISTS public.coupon_redemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id uuid NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,
  order_id uuid NOT NULL UNIQUE REFERENCES public.orders(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  email text,
  discount_amount numeric(10,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'reserved'
    CHECK (status IN ('reserved', 'confirmed', 'released')),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '15 minutes'),
  confirmed_at timestamptz,
  released_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.coupon_redemptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "coupon_redemptions_admin_read" ON public.coupon_redemptions;
CREATE POLICY "coupon_redemptions_admin_read"
  ON public.coupon_redemptions FOR SELECT
  USING (public.has_admin_access());

-- 3f. public.webhook_events (Idempotent Webhook Replay Guard)
CREATE TABLE IF NOT EXISTS public.webhook_events (
  provider text NOT NULL,
  event_id text NOT NULL,
  event_type text NOT NULL,
  order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  processed_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (provider, event_id)
);

ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "webhook_events_admin_read" ON public.webhook_events;
CREATE POLICY "webhook_events_admin_read"
  ON public.webhook_events FOR SELECT
  USING (public.is_admin());

-- 3g. public.review_helpful_votes (1 Vote Per Authenticated User Per Review)
CREATE TABLE IF NOT EXISTS public.review_helpful_votes (
  review_id uuid NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (review_id, user_id)
);

ALTER TABLE public.review_helpful_votes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "review_helpful_votes_user_select" ON public.review_helpful_votes;
CREATE POLICY "review_helpful_votes_user_select"
  ON public.review_helpful_votes FOR SELECT
  USING (auth.uid() = user_id OR public.has_admin_access());

-- 3h. public.analytics_events (Real Storefront Funnel Tracking)
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL CHECK (length(event_type) <= 64),
  session_id text,
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  properties jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "analytics_events_public_insert" ON public.analytics_events;
CREATE POLICY "analytics_events_public_insert"
  ON public.analytics_events FOR INSERT
  WITH CHECK (length(event_type) <= 64);

DROP POLICY IF EXISTS "analytics_events_admin_select" ON public.analytics_events;
CREATE POLICY "analytics_events_admin_select"
  ON public.analytics_events FOR SELECT
  USING (public.has_admin_access());

-- 3i. public.loyalty_rewards & public.newsletter_subscribers
CREATE TABLE IF NOT EXISTS public.loyalty_rewards (
  id text PRIMARY KEY,
  name text NOT NULL,
  description text,
  points_required integer NOT NULL CHECK (points_required > 0),
  reward_type text NOT NULL CHECK (reward_type IN ('discount_fixed', 'discount_percent', 'free_shipping', 'gift', 'coupon')),
  reward_value numeric(10,2) NOT NULL DEFAULT 0,
  min_order_amount numeric(10,2) DEFAULT 0,
  applicable_tiers text[] DEFAULT ARRAY['bronze', 'silver', 'gold', 'platinum'],
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.loyalty_rewards ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "loyalty_rewards_public_read" ON public.loyalty_rewards;
CREATE POLICY "loyalty_rewards_public_read"
  ON public.loyalty_rewards FOR SELECT
  USING (is_active = true OR public.has_admin_access());

DROP POLICY IF EXISTS "loyalty_rewards_admin_write" ON public.loyalty_rewards;
CREATE POLICY "loyalty_rewards_admin_write"
  ON public.loyalty_rewards FOR ALL
  USING (public.has_role(ARRAY['admin', 'manager']))
  WITH CHECK (public.has_role(ARRAY['admin', 'manager']));

INSERT INTO public.loyalty_rewards (id, name, description, points_required, reward_type, reward_value, min_order_amount)
VALUES
  ('discount_100', '₹100 Off Privilege Voucher', 'Redeem 500 points for ₹100 off orders above ₹500', 500, 'discount_fixed', 100, 500),
  ('discount_250', '₹250 Off Atelier Voucher', 'Redeem 1,200 points for ₹250 off orders above ₹1,000', 1200, 'discount_fixed', 250, 1000),
  ('discount_500', '₹500 Off Couture Voucher', 'Redeem 2,200 points for ₹500 off orders above ₹2,000', 2200, 'discount_fixed', 500, 2000),
  ('free_shipping', 'Complimentary Express Shipping', 'Redeem 300 points for free shipping on any order', 300, 'free_shipping', 0, 0)
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  name text,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed')),
  source text NOT NULL DEFAULT 'storefront',
  subscribed_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "newsletter_subscribers_admin_all" ON public.newsletter_subscribers;
CREATE POLICY "newsletter_subscribers_admin_all"
  ON public.newsletter_subscribers FOR ALL
  USING (public.has_role(ARRAY['admin', 'manager']))
  WITH CHECK (public.has_role(ARRAY['admin', 'manager']));

-- Seed canonical coupons safely if missing
INSERT INTO public.coupons (code, name, type, value, min_order_amount, max_discount_amount, is_active)
VALUES
  ('FIRST10', 'First Order 10% Privilege', 'percentage', 10, 1999, 1500, true),
  ('ROYAL500', '₹500 Off Atelier Privilege', 'fixed', 500, 4999, NULL, true),
  ('COUTURE15', '15% Festive Couture Offer', 'percentage', 15, 5999, 2000, true),
  ('WELCOME10', 'Welcome 10% Offer', 'percentage', 10, 999, 1000, true)
ON CONFLICT (code) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 4. Atomic, Deadlock-Free Inventory & Coupon Lifecycle RPCs (service_role ONLY)
-- ----------------------------------------------------------------------------

-- 4a. Release expired inventory & coupon reservations (15-min TTL)
CREATE OR REPLACE FUNCTION public.release_expired_inventory_reservations()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  r RECORD;
  c RECORD;
  v_released_orders integer := 0;
BEGIN
  FOR r IN
    SELECT id, order_id, variant_id, quantity
    FROM public.inventory_reservations
    WHERE status = 'reserved' AND expires_at < now()
    ORDER BY variant_id ASC
    FOR UPDATE SKIP LOCKED
  LOOP
    UPDATE public.inventory_reservations
    SET status = 'released', released_at = now()
    WHERE id = r.id AND status = 'reserved';

    IF FOUND THEN
      UPDATE public.product_variants
      SET inventory_quantity = inventory_quantity + r.quantity,
          updated_at = now()
      WHERE id = r.variant_id;

      FOR c IN
        SELECT id, coupon_id
        FROM public.coupon_redemptions
        WHERE order_id = r.order_id AND status = 'reserved'
        FOR UPDATE
      LOOP
        UPDATE public.coupon_redemptions
        SET status = 'released', released_at = now()
        WHERE id = c.id AND status = 'reserved';

        IF FOUND THEN
          UPDATE public.coupons
          SET usage_count = GREATEST(0, usage_count - 1)
          WHERE id = c.coupon_id;
        END IF;
      END LOOP;

      UPDATE public.orders
      SET status = 'cancelled',
          payment_status = CASE WHEN payment_status = 'pending' THEN 'failed' ELSE payment_status END,
          cancelled_at = COALESCE(cancelled_at, now()),
          cancel_reason = COALESCE(cancel_reason, 'Payment reservation expired (15m timeout)'),
          updated_at = now()
      WHERE id = r.order_id AND status = 'pending' AND payment_status = 'pending';

      v_released_orders := v_released_orders + 1;
    END IF;
  END LOOP;

  RETURN v_released_orders;
END;
$$;

REVOKE ALL ON FUNCTION public.release_expired_inventory_reservations() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.release_expired_inventory_reservations() TO service_role;

-- 4b. Reserve Order Inventory (Idempotent + Sorted Lock Order to Prevent Deadlocks)
CREATE OR REPLACE FUNCTION public.reserve_order_inventory(
  p_order_id uuid,
  p_items jsonb,
  p_ttl_minutes integer DEFAULT 15
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  agg RECORD;
  v_stock integer;
  v_is_active boolean;
  v_prod_name text;
BEGIN
  IF p_order_id IS NULL OR p_items IS NULL OR jsonb_typeof(p_items) != 'array' OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'INVALID_RESERVATION_PAYLOAD';
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.inventory_reservations
    WHERE order_id = p_order_id AND status IN ('reserved', 'confirmed')
  ) THEN
    RETURN true;
  END IF;

  PERFORM public.release_expired_inventory_reservations();

  FOR agg IN
    SELECT
      (item->>'variant_id')::uuid AS variant_id,
      MAX(NULLIF(item->>'product_id', '')::uuid) AS product_id,
      SUM((item->>'quantity')::integer)::integer AS total_qty
    FROM jsonb_array_elements(p_items) AS item
    WHERE (item->>'variant_id') IS NOT NULL
    GROUP BY (item->>'variant_id')::uuid
    ORDER BY (item->>'variant_id')::uuid ASC
  LOOP
    IF agg.total_qty IS NULL OR agg.total_qty <= 0 THEN
      RAISE EXCEPTION 'INVALID_QUANTITY';
    END IF;

    SELECT pv.inventory_quantity, pv.is_active, p.name
    INTO v_stock, v_is_active, v_prod_name
    FROM public.product_variants pv
    JOIN public.products p ON p.id = pv.product_id
    WHERE pv.id = agg.variant_id
    FOR UPDATE OF pv;

    IF NOT FOUND OR NOT COALESCE(v_is_active, false) THEN
      RAISE EXCEPTION 'VARIANT_UNAVAILABLE:%', agg.variant_id;
    END IF;

    IF v_stock < agg.total_qty THEN
      RAISE EXCEPTION 'INSUFFICIENT_STOCK:% (Available: %, Requested: %)', v_prod_name, v_stock, agg.total_qty;
    END IF;

    UPDATE public.product_variants
    SET inventory_quantity = inventory_quantity - agg.total_qty,
        updated_at = now()
    WHERE id = agg.variant_id;

    INSERT INTO public.inventory_reservations (
      order_id, product_id, variant_id, quantity, status, expires_at
    ) VALUES (
      p_order_id, agg.product_id, agg.variant_id, agg.total_qty, 'reserved',
      now() + (GREATEST(1, p_ttl_minutes) || ' minutes')::interval
    )
    ON CONFLICT (order_id, variant_id) DO UPDATE
      SET quantity = EXCLUDED.quantity,
          status = 'reserved',
          expires_at = EXCLUDED.expires_at,
          released_at = NULL;
  END LOOP;

  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.reserve_order_inventory(uuid, jsonb, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.reserve_order_inventory(uuid, jsonb, integer) TO service_role;

-- 4c. Confirm Order Inventory & Coupon (All-or-Nothing Late-Webhook Recovery)
CREATE OR REPLACE FUNCTION public.confirm_order_inventory(p_order_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  r RECORD;
  v_stock integer;
  v_conflict boolean := false;
BEGIN
  FOR r IN
    SELECT id, variant_id, quantity, status
    FROM public.inventory_reservations
    WHERE order_id = p_order_id
    ORDER BY variant_id ASC
    FOR UPDATE
  LOOP
    IF r.status = 'released' THEN
      SELECT inventory_quantity INTO v_stock
      FROM public.product_variants
      WHERE id = r.variant_id
      FOR UPDATE;

      IF NOT FOUND OR v_stock < r.quantity THEN
        v_conflict := true;
      END IF;
    ELSIF r.status = 'conflict' THEN
      v_conflict := true;
    END IF;
  END LOOP;

  IF v_conflict THEN
    UPDATE public.inventory_reservations
    SET status = 'conflict'
    WHERE order_id = p_order_id AND status = 'released';

    RETURN jsonb_build_object('confirmed', false, 'stock_conflict', true);
  END IF;

  FOR r IN
    SELECT id, variant_id, quantity, status
    FROM public.inventory_reservations
    WHERE order_id = p_order_id
    ORDER BY variant_id ASC
  LOOP
    IF r.status = 'reserved' THEN
      UPDATE public.inventory_reservations
      SET status = 'confirmed', confirmed_at = now()
      WHERE id = r.id;
    ELSIF r.status = 'released' THEN
      UPDATE public.product_variants
      SET inventory_quantity = inventory_quantity - r.quantity,
          updated_at = now()
      WHERE id = r.variant_id;

      UPDATE public.inventory_reservations
      SET status = 'confirmed', confirmed_at = now()
      WHERE id = r.id;
    END IF;
  END LOOP;

  UPDATE public.coupon_redemptions
  SET status = 'confirmed', confirmed_at = now()
  WHERE order_id = p_order_id AND status = 'reserved';

  IF EXISTS (SELECT 1 FROM public.coupon_redemptions WHERE order_id = p_order_id AND status = 'released') THEN
    UPDATE public.coupons c
    SET usage_count = usage_count + 1
    FROM public.coupon_redemptions cr
    WHERE cr.order_id = p_order_id AND cr.status = 'released' AND c.id = cr.coupon_id;

    UPDATE public.coupon_redemptions
    SET status = 'confirmed', confirmed_at = now()
    WHERE order_id = p_order_id AND status = 'released';
  END IF;

  RETURN jsonb_build_object('confirmed', true, 'stock_conflict', false);
END;
$$;

REVOKE ALL ON FUNCTION public.confirm_order_inventory(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.confirm_order_inventory(uuid) TO service_role;

-- 4d. Release Order Inventory & Coupon (Idempotent)
CREATE OR REPLACE FUNCTION public.release_order_inventory(p_order_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  r RECORD;
  c RECORD;
  v_count integer := 0;
BEGIN
  FOR r IN
    SELECT id, variant_id, quantity
    FROM public.inventory_reservations
    WHERE order_id = p_order_id AND status IN ('reserved', 'confirmed')
    ORDER BY variant_id ASC
    FOR UPDATE
  LOOP
    UPDATE public.inventory_reservations
    SET status = 'released', released_at = now()
    WHERE id = r.id AND status IN ('reserved', 'confirmed');

    IF FOUND THEN
      UPDATE public.product_variants
      SET inventory_quantity = inventory_quantity + r.quantity,
          updated_at = now()
      WHERE id = r.variant_id;

      v_count := v_count + 1;
    END IF;
  END LOOP;

  FOR c IN
    SELECT id, coupon_id
    FROM public.coupon_redemptions
    WHERE order_id = p_order_id AND status IN ('reserved', 'confirmed')
    FOR UPDATE
  LOOP
    UPDATE public.coupon_redemptions
    SET status = 'released', released_at = now()
    WHERE id = c.id AND status IN ('reserved', 'confirmed');

    IF FOUND THEN
      UPDATE public.coupons
      SET usage_count = GREATEST(0, usage_count - 1)
      WHERE id = c.coupon_id;
    END IF;
  END LOOP;

  RETURN v_count;
END;
$$;

REVOKE ALL ON FUNCTION public.release_order_inventory(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.release_order_inventory(uuid) TO service_role;

-- 4e. Atomic Coupon Reservation RPC (Enforces usage_limit, user_limit, first_order_only)
CREATE OR REPLACE FUNCTION public.reserve_coupon_for_order(
  p_code text,
  p_order_id uuid,
  p_subtotal numeric,
  p_user_id uuid DEFAULT NULL,
  p_email text DEFAULT NULL,
  p_ttl_minutes integer DEFAULT 15
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  c public.coupons%ROWTYPE;
  v_discount numeric := 0;
  v_user_redemptions integer := 0;
  v_prior_orders integer := 0;
  v_existing public.coupon_redemptions%ROWTYPE;
BEGIN
  SELECT * INTO v_existing
  FROM public.coupon_redemptions
  WHERE order_id = p_order_id AND status IN ('reserved', 'confirmed');

  IF FOUND THEN
    SELECT * INTO c FROM public.coupons WHERE id = v_existing.coupon_id;
    RETURN jsonb_build_object(
      'id', c.id,
      'code', c.code,
      'type', c.type,
      'value', c.value,
      'discount_amount', v_existing.discount_amount
    );
  END IF;

  SELECT * INTO c
  FROM public.coupons
  WHERE UPPER(code) = UPPER(TRIM(p_code))
  FOR UPDATE;

  IF NOT FOUND OR NOT c.is_active THEN
    RAISE EXCEPTION 'COUPON_INVALID:Coupon is invalid or inactive';
  END IF;

  IF c.valid_from IS NOT NULL AND c.valid_from::timestamptz > now() THEN
    RAISE EXCEPTION 'COUPON_NOT_STARTED:Coupon is not active yet';
  END IF;

  IF c.valid_until IS NOT NULL AND c.valid_until::timestamptz < now() THEN
    RAISE EXCEPTION 'COUPON_EXPIRED:Coupon has expired';
  END IF;

  IF c.usage_limit IS NOT NULL AND c.usage_count >= c.usage_limit THEN
    RAISE EXCEPTION 'COUPON_EXHAUSTED:Coupon usage limit reached';
  END IF;

  IF c.min_order_amount IS NOT NULL AND p_subtotal < c.min_order_amount THEN
    RAISE EXCEPTION 'COUPON_MIN_ORDER:Minimum order of Rs. % required', c.min_order_amount;
  END IF;

  IF c.user_limit IS NOT NULL AND c.user_limit > 0 AND (p_user_id IS NOT NULL OR p_email IS NOT NULL) THEN
    SELECT COUNT(*) INTO v_user_redemptions
    FROM public.coupon_redemptions cr
    WHERE cr.coupon_id = c.id
      AND cr.status IN ('reserved', 'confirmed')
      AND (
        (p_user_id IS NOT NULL AND cr.user_id = p_user_id)
        OR (p_email IS NOT NULL AND LOWER(cr.email) = LOWER(TRIM(p_email)))
      );

    IF v_user_redemptions >= c.user_limit THEN
      RAISE EXCEPTION 'COUPON_USER_LIMIT:You have already used this coupon the maximum number of times';
    END IF;
  END IF;

  IF COALESCE(c.first_order_only, false) AND (p_user_id IS NOT NULL OR p_email IS NOT NULL) THEN
    SELECT COUNT(*) INTO v_prior_orders
    FROM public.orders o
    WHERE o.id != p_order_id
      AND o.status != 'cancelled'
      AND (
        (p_user_id IS NOT NULL AND o.user_id = p_user_id)
        OR (p_email IS NOT NULL AND LOWER(o.email) = LOWER(TRIM(p_email)))
      );

    IF v_prior_orders > 0 THEN
      RAISE EXCEPTION 'COUPON_FIRST_ORDER_ONLY:This coupon is valid only on your first order';
    END IF;
  END IF;

  IF c.type = 'percentage' THEN
    v_discount := ROUND(p_subtotal * (c.value / 100.0));
    IF c.max_discount_amount IS NOT NULL AND v_discount > c.max_discount_amount THEN
      v_discount := c.max_discount_amount;
    END IF;
  ELSIF c.type = 'fixed' THEN
    v_discount := c.value;
  ELSE
    v_discount := 0;
  END IF;

  v_discount := LEAST(v_discount, p_subtotal);

  UPDATE public.coupons
  SET usage_count = usage_count + 1
  WHERE id = c.id;

  INSERT INTO public.coupon_redemptions (
    coupon_id, order_id, user_id, email, discount_amount, status, expires_at
  ) VALUES (
    c.id, p_order_id, p_user_id, LOWER(TRIM(p_email)), v_discount, 'reserved',
    now() + (GREATEST(1, p_ttl_minutes) || ' minutes')::interval
  );

  RETURN jsonb_build_object(
    'id', c.id,
    'code', c.code,
    'type', c.type,
    'value', c.value,
    'discount_amount', v_discount
  );
END;
$$;

REVOKE ALL ON FUNCTION public.reserve_coupon_for_order(text, uuid, numeric, uuid, text, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.reserve_coupon_for_order(text, uuid, numeric, uuid, text, integer) TO service_role;

-- 4f. Idempotent Return Inspection & Stock Restoration RPC
CREATE OR REPLACE FUNCTION public.complete_return_inspection(
  p_return_id uuid,
  p_passed boolean,
  p_notes text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_ret public.returns%ROWTYPE;
  v_item public.order_items%ROWTYPE;
BEGIN
  SELECT * INTO v_ret
  FROM public.returns
  WHERE id = p_return_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'RETURN_NOT_FOUND';
  END IF;

  IF NOT p_passed THEN
    UPDATE public.returns
    SET status = 'rejected',
        inspection_passed = false,
        inspection_notes = p_notes,
        inspected_at = now(),
        updated_at = now()
    WHERE id = p_return_id;
    RETURN false;
  END IF;

  IF NOT v_ret.stock_restored THEN
    SELECT * INTO v_item
    FROM public.order_items
    WHERE id = v_ret.order_item_id;

    IF FOUND AND v_item.variant_id IS NOT NULL THEN
      UPDATE public.product_variants
      SET inventory_quantity = inventory_quantity + COALESCE(v_item.quantity, 1),
          updated_at = now()
      WHERE id = v_item.variant_id;
    END IF;
  END IF;

  UPDATE public.returns
  SET status = 'inspected',
      inspection_passed = true,
      inspection_notes = p_notes,
      inspected_at = COALESCE(inspected_at, now()),
      stock_restored = true,
      updated_at = now()
  WHERE id = p_return_id;

  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.complete_return_inspection(uuid, boolean, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.complete_return_inspection(uuid, boolean, text) TO service_role;

-- 4g. Direct Inventory Increment Helper (service_role ONLY)
CREATE OR REPLACE FUNCTION public.increase_inventory(
  variant_id uuid,
  quantity integer
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF quantity IS NULL OR quantity <= 0 OR variant_id IS NULL THEN
    RETURN;
  END IF;

  UPDATE public.product_variants
  SET inventory_quantity = inventory_quantity + quantity,
      updated_at = now()
  WHERE id = variant_id;
END;
$$;

REVOKE ALL ON FUNCTION public.increase_inventory(uuid, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.increase_inventory(uuid, integer) TO service_role;

-- 4h. Deduplicated Review Helpful Increment RPC (1 vote per authenticated user)
CREATE OR REPLACE FUNCTION public.increment_review_helpful(review_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_uid uuid := auth.uid();
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'AUTHENTICATION_REQUIRED';
  END IF;

  INSERT INTO public.review_helpful_votes (review_id, user_id)
  VALUES (review_id, v_uid)
  ON CONFLICT (review_id, user_id) DO NOTHING;

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  UPDATE public.reviews
  SET helpful_count = COALESCE(helpful_count, 0) + 1,
      updated_at = now()
  WHERE id = review_id;

  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.increment_review_helpful(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.increment_review_helpful(uuid) TO authenticated, service_role;

-- ----------------------------------------------------------------------------
-- 5. Fix Search Trigger & All Search RPCs (Remove missing description_hi & join product_variants)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_product_search_vector()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, extensions, pg_temp
AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
    setweight(to_tsvector('simple', COALESCE(NEW.sku, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.short_description, '')), 'B') ||
    setweight(to_tsvector('simple', COALESCE(NEW.fabric::text, '')), 'C') ||
    setweight(to_tsvector('simple', COALESCE(NEW.tags::text, '')), 'C') ||
    setweight(to_tsvector('simple', COALESCE(NEW.occasion::text, '')), 'C');
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.search_products_fulltext(
  query_text text,
  category_filter uuid DEFAULT NULL,
  subcategory_filter uuid DEFAULT NULL,
  min_price numeric DEFAULT NULL,
  max_price numeric DEFAULT NULL,
  in_stock_only boolean DEFAULT false,
  limit_count int DEFAULT 20,
  offset_count int DEFAULT 0
)
RETURNS TABLE (
  id uuid,
  name text,
  slug text,
  description text,
  price numeric,
  compare_at_price numeric,
  images jsonb,
  category_id uuid,
  category_name text,
  category_slug text,
  rank real
)
LANGUAGE plpgsql
STABLE
SET search_path = public, extensions, pg_temp
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.name,
    p.slug,
    p.description,
    COALESCE(v.price, 0)::numeric AS price,
    v.compare_at_price::numeric AS compare_at_price,
    COALESCE(
      (
        SELECT jsonb_agg(
          jsonb_build_object('url', pi.url, 'alt_text', pi.alt_text, 'is_primary', pi.is_primary)
          ORDER BY pi.is_primary DESC, pi.sort_order ASC
        )
        FROM public.product_images pi
        WHERE pi.product_id = p.id
      ),
      '[]'::jsonb
    ) AS images,
    p.category_id,
    c.name AS category_name,
    c.slug AS category_slug,
    COALESCE(
      ts_rank_cd(p.search_vector, websearch_to_tsquery('english', query_text), 32),
      0.1
    )::real AS rank
  FROM public.products p
  LEFT JOIN public.categories c ON p.category_id = c.id
  LEFT JOIN LATERAL (
    SELECT pv.price, pv.compare_at_price
    FROM public.product_variants pv
    WHERE pv.product_id = p.id AND pv.is_active = true
    ORDER BY pv.sort_order ASC, pv.price ASC
    LIMIT 1
  ) v ON true
  WHERE p.is_active = true
    AND (
      p.search_vector @@ websearch_to_tsquery('english', query_text)
      OR p.name ILIKE '%' || query_text || '%'
      OR p.sku ILIKE '%' || query_text || '%'
    )
    AND (category_filter IS NULL OR p.category_id = category_filter)
    AND (subcategory_filter IS NULL OR p.subcategory_id = subcategory_filter)
    AND (min_price IS NULL OR COALESCE(v.price, 0) >= min_price)
    AND (max_price IS NULL OR COALESCE(v.price, 0) <= max_price)
    AND (NOT in_stock_only OR EXISTS (
      SELECT 1 FROM public.product_variants pv2
      WHERE pv2.product_id = p.id AND pv2.inventory_quantity > 0 AND pv2.is_active = true
    ))
  ORDER BY rank DESC, p.created_at DESC
  LIMIT limit_count OFFSET offset_count;
END;
$$;

CREATE OR REPLACE FUNCTION public.search_products_semantic(
  query_embedding vector(1536),
  category_filter uuid DEFAULT NULL,
  subcategory_filter uuid DEFAULT NULL,
  min_price numeric DEFAULT NULL,
  max_price numeric DEFAULT NULL,
  in_stock_only boolean DEFAULT false,
  similarity_threshold float DEFAULT 0.5,
  limit_count int DEFAULT 20,
  offset_count int DEFAULT 0
)
RETURNS TABLE (
  id uuid,
  name text,
  slug text,
  description text,
  price numeric,
  compare_at_price numeric,
  images jsonb,
  category_id uuid,
  category_name text,
  category_slug text,
  similarity float
)
LANGUAGE plpgsql
STABLE
SET search_path = public, extensions, pg_temp
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.name,
    p.slug,
    p.description,
    COALESCE(v.price, 0)::numeric AS price,
    v.compare_at_price::numeric AS compare_at_price,
    COALESCE(
      (
        SELECT jsonb_agg(
          jsonb_build_object('url', pi.url, 'alt_text', pi.alt_text, 'is_primary', pi.is_primary)
          ORDER BY pi.is_primary DESC, pi.sort_order ASC
        )
        FROM public.product_images pi
        WHERE pi.product_id = p.id
      ),
      '[]'::jsonb
    ) AS images,
    p.category_id,
    c.name AS category_name,
    c.slug AS category_slug,
    (1 - (p.embedding <=> query_embedding))::float AS similarity
  FROM public.products p
  LEFT JOIN public.categories c ON p.category_id = c.id
  LEFT JOIN LATERAL (
    SELECT pv.price, pv.compare_at_price
    FROM public.product_variants pv
    WHERE pv.product_id = p.id AND pv.is_active = true
    ORDER BY pv.sort_order ASC, pv.price ASC
    LIMIT 1
  ) v ON true
  WHERE p.is_active = true
    AND p.embedding IS NOT NULL
    AND (1 - (p.embedding <=> query_embedding)) >= similarity_threshold
    AND (category_filter IS NULL OR p.category_id = category_filter)
    AND (subcategory_filter IS NULL OR p.subcategory_id = subcategory_filter)
    AND (min_price IS NULL OR COALESCE(v.price, 0) >= min_price)
    AND (max_price IS NULL OR COALESCE(v.price, 0) <= max_price)
    AND (NOT in_stock_only OR EXISTS (
      SELECT 1 FROM public.product_variants pv2
      WHERE pv2.product_id = p.id AND pv2.inventory_quantity > 0 AND pv2.is_active = true
    ))
  ORDER BY similarity DESC, p.created_at DESC
  LIMIT limit_count OFFSET offset_count;
END;
$$;

CREATE OR REPLACE FUNCTION public.search_products_hybrid(
  query_text text,
  query_embedding vector(1536),
  category_filter uuid DEFAULT NULL,
  subcategory_filter uuid DEFAULT NULL,
  min_price numeric DEFAULT NULL,
  max_price numeric DEFAULT NULL,
  in_stock_only boolean DEFAULT false,
  fulltext_weight float DEFAULT 0.5,
  semantic_weight float DEFAULT 0.5,
  similarity_threshold float DEFAULT 0.3,
  limit_count int DEFAULT 20,
  offset_count int DEFAULT 0
)
RETURNS TABLE (
  id uuid,
  name text,
  slug text,
  description text,
  price numeric,
  compare_at_price numeric,
  images jsonb,
  category_id uuid,
  category_name text,
  category_slug text,
  combined_score float
)
LANGUAGE plpgsql
STABLE
SET search_path = public, extensions, pg_temp
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.name,
    p.slug,
    p.description,
    COALESCE(v.price, 0)::numeric AS price,
    v.compare_at_price::numeric AS compare_at_price,
    COALESCE(
      (
        SELECT jsonb_agg(
          jsonb_build_object('url', pi.url, 'alt_text', pi.alt_text, 'is_primary', pi.is_primary)
          ORDER BY pi.is_primary DESC, pi.sort_order ASC
        )
        FROM public.product_images pi
        WHERE pi.product_id = p.id
      ),
      '[]'::jsonb
    ) AS images,
    p.category_id,
    c.name AS category_name,
    c.slug AS category_slug,
    (
      fulltext_weight * COALESCE(ts_rank_cd(p.search_vector, websearch_to_tsquery('english', query_text), 32), 0) +
      semantic_weight * COALESCE(1 - (p.embedding <=> query_embedding), 0)
    )::float AS combined_score
  FROM public.products p
  LEFT JOIN public.categories c ON p.category_id = c.id
  LEFT JOIN LATERAL (
    SELECT pv.price, pv.compare_at_price
    FROM public.product_variants pv
    WHERE pv.product_id = p.id AND pv.is_active = true
    ORDER BY pv.sort_order ASC, pv.price ASC
    LIMIT 1
  ) v ON true
  WHERE p.is_active = true
    AND (
      (p.search_vector @@ websearch_to_tsquery('english', query_text))
      OR (p.embedding IS NOT NULL AND (1 - (p.embedding <=> query_embedding)) >= similarity_threshold)
    )
    AND (category_filter IS NULL OR p.category_id = category_filter)
    AND (subcategory_filter IS NULL OR p.subcategory_id = subcategory_filter)
    AND (min_price IS NULL OR COALESCE(v.price, 0) >= min_price)
    AND (max_price IS NULL OR COALESCE(v.price, 0) <= max_price)
    AND (NOT in_stock_only OR EXISTS (
      SELECT 1 FROM public.product_variants pv2
      WHERE pv2.product_id = p.id AND pv2.inventory_quantity > 0 AND pv2.is_active = true
    ))
  ORDER BY combined_score DESC, p.created_at DESC
  LIMIT limit_count OFFSET offset_count;
END;
$$;

ALTER FUNCTION public.get_search_suggestions(text, int) SET search_path = public, extensions, pg_temp;

GRANT EXECUTE ON FUNCTION public.search_products_fulltext(text, uuid, uuid, numeric, numeric, boolean, int, int) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.search_products_semantic(vector, uuid, uuid, numeric, numeric, boolean, float, int, int) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.search_products_hybrid(text, vector, uuid, uuid, numeric, numeric, boolean, float, float, float, int, int) TO anon, authenticated, service_role;

-- ----------------------------------------------------------------------------
-- 6. Query-Justified Indexes (Matching exact columns on products, variants, orders)
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_products_active_category_created
  ON public.products (is_active, category_id, created_at DESC)
  WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_product_variants_product_active_price
  ON public.product_variants (product_id, is_active, price)
  WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_orders_user_created
  ON public.orders (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_orders_email_lower
  ON public.orders (LOWER(email), created_at DESC);

CREATE INDEX IF NOT EXISTS idx_orders_order_number_upper
  ON public.orders (UPPER(order_number));

CREATE INDEX IF NOT EXISTS idx_orders_status_created
  ON public.orders (status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_inventory_reservations_active_expiry
  ON public.inventory_reservations (status, expires_at)
  WHERE status = 'reserved';

CREATE INDEX IF NOT EXISTS idx_coupon_redemptions_coupon_status
  ON public.coupon_redemptions (coupon_id, status);

CREATE INDEX IF NOT EXISTS idx_notifications_role_unread
  ON public.notifications (role_target, is_read, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_analytics_events_type_created
  ON public.analytics_events (event_type, created_at DESC);

COMMIT;
