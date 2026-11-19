-- ============================================================================
-- Migration: 20261119_cashfree_payment_gateway.sql
-- Target: Angelika Fashions (Cashfree Payments PG v2023-08-01 Support)
-- Updates orders_payment_method_check constraint on public.orders to allow 'cashfree'
-- ============================================================================

BEGIN;

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
  CHECK (payment_method IN ('cashfree', 'razorpay', 'stripe', 'cod', 'upi', 'wallet'));

COMMIT;
