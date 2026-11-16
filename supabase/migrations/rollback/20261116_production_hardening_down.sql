-- ============================================================================
-- Non-Destructive Rollback Script for 20261116_production_hardening.sql
-- Safely removes newly created RPCs and additive tables without deleting
-- existing customer, product, order, or historical return records.
-- ============================================================================

BEGIN;

DROP FUNCTION IF EXISTS public.release_expired_inventory_reservations();
DROP FUNCTION IF EXISTS public.reserve_order_inventory(uuid, jsonb, integer);
DROP FUNCTION IF EXISTS public.confirm_order_inventory(uuid);
DROP FUNCTION IF EXISTS public.release_order_inventory(uuid);
DROP FUNCTION IF EXISTS public.reserve_coupon_for_order(text, uuid, numeric, uuid, text, integer);
DROP FUNCTION IF EXISTS public.complete_return_inspection(uuid, boolean, text);
DROP FUNCTION IF EXISTS public.increase_inventory(uuid, integer);
DROP FUNCTION IF EXISTS public.increment_review_helpful(uuid);
DROP FUNCTION IF EXISTS public.has_role(text[]);
DROP FUNCTION IF EXISTS public.has_admin_access();

DROP TABLE IF EXISTS public.review_helpful_votes;
DROP TABLE IF EXISTS public.webhook_events;
DROP TABLE IF EXISTS public.coupon_redemptions;
DROP TABLE IF EXISTS public.inventory_reservations;
DROP TABLE IF EXISTS public.analytics_events;
DROP TABLE IF EXISTS public.loyalty_rewards;
DROP TABLE IF EXISTS public.newsletter_subscribers;
DROP TABLE IF EXISTS public.notifications;
DROP TABLE IF EXISTS public.navbar_items;
DROP TABLE IF EXISTS public.store_settings;

COMMIT;
