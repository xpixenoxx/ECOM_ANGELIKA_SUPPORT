-- ============================================================================
-- Migration: 20261126_fix_reserve_order_inventory_uuid.sql
-- Purpose:
--   Fixes PostgreSQL error `function max(uuid) does not exist` (SQLSTATE 42883)
--   inside public.reserve_order_inventory caused by MAX(...::uuid).
--   Aggregates product_id as text first, then casts back to uuid cleanly.
-- Safe to run repeatedly (CREATE OR REPLACE FUNCTION).
-- ============================================================================

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
      NULLIF(MAX(NULLIF(item->>'product_id', '')), '')::uuid AS product_id,
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
