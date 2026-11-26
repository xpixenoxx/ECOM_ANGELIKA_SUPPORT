-- ============================================================================
-- Migration: 20261126_razorpay_shiprocket_production.sql
-- Target: Angelika Fashions (Razorpay Standard Checkout + Shiprocket v2)
-- Guarantees:
--   1. Non-destructive, additive, idempotent schema changes
--   2. Preserves all historical Cashfree / legacy transaction records
--   3. Fixes webhook_events.status and notifications.metadata schema drift
--   4. Adds idempotent notifications.dedup_key unique partial index
--   5. Creates durable public.order_refunds ledger with idempotency & RLS
--   6. Creates durable public.shipments ledger for Shiprocket with duplicate guard & RLS
-- ============================================================================

BEGIN;

-- ----------------------------------------------------------------------------
-- 1. public.webhook_events — Durable Status, Retry Tracking & Error Diagnostics
-- ----------------------------------------------------------------------------
ALTER TABLE public.webhook_events
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'processed',
  ADD COLUMN IF NOT EXISTS error_message text,
  ADD COLUMN IF NOT EXISTS attempts integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT conname
    FROM pg_constraint
    WHERE conrelid = 'public.webhook_events'::regclass
      AND contype = 'c'
      AND pg_get_constraintdef(oid) ILIKE '%status%'
  LOOP
    EXECUTE format('ALTER TABLE public.webhook_events DROP CONSTRAINT IF EXISTS %I', r.conname);
  END LOOP;
END $$;

ALTER TABLE public.webhook_events
  ADD CONSTRAINT webhook_events_status_check
  CHECK (status IN ('processing', 'processed', 'failed'));

CREATE INDEX IF NOT EXISTS idx_webhook_events_provider_status
  ON public.webhook_events (provider, status, processed_at DESC);

-- ----------------------------------------------------------------------------
-- 2. public.notifications — Metadata, Idempotent Dedup Key & Delivery Audit
-- ----------------------------------------------------------------------------
ALTER TABLE public.notifications
  ADD COLUMN IF NOT EXISTS metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS dedup_key text,
  ADD COLUMN IF NOT EXISTS error_message text,
  ADD COLUMN IF NOT EXISTS sent_at timestamptz;

CREATE UNIQUE INDEX IF NOT EXISTS idx_notifications_dedup_key
  ON public.notifications (dedup_key)
  WHERE dedup_key IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_notifications_status_created
  ON public.notifications (status, created_at DESC);

-- ----------------------------------------------------------------------------
-- 3. public.orders — Expand Payment Status Safely & Preserve Legacy Methods
-- ----------------------------------------------------------------------------
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT conname
    FROM pg_constraint
    WHERE conrelid = 'public.orders'::regclass
      AND contype = 'c'
      AND pg_get_constraintdef(oid) ILIKE '%payment_status%'
  LOOP
    EXECUTE format('ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS %I', r.conname);
  END LOOP;
END $$;

ALTER TABLE public.orders
  ADD CONSTRAINT orders_payment_status_check
  CHECK (payment_status IN (
    'pending',
    'authorized',
    'paid',
    'failed',
    'refund_pending',
    'partially_refunded',
    'refunded'
  ));

-- Preserve legacy payment_method values (e.g. historical cashfree/stripe rows) while Razorpay + COD are active
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT conname
    FROM pg_constraint
    WHERE conrelid = 'public.orders'::regclass
      AND contype = 'c'
      AND pg_get_constraintdef(oid) ILIKE '%payment_method%'
  LOOP
    EXECUTE format('ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS %I', r.conname);
  END LOOP;
END $$;

ALTER TABLE public.orders
  ADD CONSTRAINT orders_payment_method_check
  CHECK (payment_method IN ('razorpay', 'cod', 'cashfree', 'stripe', 'upi', 'wallet'));

-- ----------------------------------------------------------------------------
-- 4. public.order_refunds — Durable Razorpay Refund Ledger & Idempotency
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.order_refunds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  gateway text NOT NULL DEFAULT 'razorpay',
  gateway_payment_id text,
  gateway_refund_id text UNIQUE,
  idempotency_key text UNIQUE,
  amount numeric(10,2) NOT NULL CHECK (amount > 0),
  amount_paise integer NOT NULL CHECK (amount_paise > 0),
  currency text NOT NULL DEFAULT 'INR',
  status text NOT NULL DEFAULT 'initiated'
    CHECK (status IN ('initiated', 'processing', 'processed', 'failed')),
  speed text NOT NULL DEFAULT 'normal',
  reason text,
  restore_inventory boolean NOT NULL DEFAULT false,
  inventory_restored boolean NOT NULL DEFAULT false,
  initiated_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  error_message text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  processed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.order_refunds ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "order_refunds_admin_all" ON public.order_refunds;
CREATE POLICY "order_refunds_admin_all"
  ON public.order_refunds FOR ALL
  USING (public.has_role(ARRAY['admin', 'manager']))
  WITH CHECK (public.has_role(ARRAY['admin', 'manager']));

DROP POLICY IF EXISTS "order_refunds_customer_read" ON public.order_refunds;
CREATE POLICY "order_refunds_customer_read"
  ON public.order_refunds FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_refunds.order_id
        AND o.user_id = (SELECT auth.uid())
    )
  );

CREATE INDEX IF NOT EXISTS idx_order_refunds_order_created
  ON public.order_refunds (order_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_order_refunds_payment_id
  ON public.order_refunds (gateway_payment_id)
  WHERE gateway_payment_id IS NOT NULL;

-- ----------------------------------------------------------------------------
-- 5. public.shipments — Dedicated Shiprocket Shipment & Tracking Ledger
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.shipments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  provider text NOT NULL DEFAULT 'shiprocket',
  shiprocket_order_id text,
  shiprocket_shipment_id text UNIQUE,
  awb_code text,
  courier_company_id integer,
  courier_name text,
  tracking_url text,
  label_url text,
  manifest_url text,
  pickup_status text NOT NULL DEFAULT 'unscheduled'
    CHECK (pickup_status IN ('unscheduled', 'scheduled', 'picked_up', 'failed', 'cancelled')),
  pickup_scheduled_date text,
  pickup_token_number text,
  shipment_status text NOT NULL DEFAULT 'created'
    CHECK (shipment_status IN (
      'created',
      'awb_assigned',
      'pickup_scheduled',
      'picked_up',
      'in_transit',
      'out_for_delivery',
      'delivered',
      'delivery_failed',
      'rto_initiated',
      'rto_in_transit',
      'rto_delivered',
      'cancelled',
      'lost',
      'damaged'
    )),
  raw_status_code integer,
  raw_status_label text,
  etd text,
  weight_kg numeric(8,3),
  length_cm numeric(8,2),
  breadth_cm numeric(8,2),
  height_cm numeric(8,2),
  scans jsonb NOT NULL DEFAULT '[]'::jsonb,
  last_event_at timestamptz,
  cancelled_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "shipments_admin_all" ON public.shipments;
CREATE POLICY "shipments_admin_all"
  ON public.shipments FOR ALL
  USING (public.has_role(ARRAY['admin', 'manager']))
  WITH CHECK (public.has_role(ARRAY['admin', 'manager']));

DROP POLICY IF EXISTS "shipments_customer_read" ON public.shipments;
CREATE POLICY "shipments_customer_read"
  ON public.shipments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = shipments.order_id
        AND o.user_id = (SELECT auth.uid())
    )
  );

-- Enforce at most one active (non-cancelled) shipment per order to prevent duplicate bookings
CREATE UNIQUE INDEX IF NOT EXISTS idx_shipments_one_active_per_order
  ON public.shipments (order_id)
  WHERE shipment_status != 'cancelled';

CREATE INDEX IF NOT EXISTS idx_shipments_awb_code
  ON public.shipments (awb_code)
  WHERE awb_code IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_shipments_sr_order_id
  ON public.shipments (shiprocket_order_id)
  WHERE shiprocket_order_id IS NOT NULL;

COMMIT;
