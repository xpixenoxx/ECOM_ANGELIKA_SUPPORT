# Angelika Fashions — Payment & Shipping Architecture Runbook

> **Production Stack**: Next.js 14 (App Router) on Cloudflare Pages (`@cloudflare/next-on-pages`, Edge Runtime) + Supabase (PostgreSQL + RLS + Auth) + **Razorpay Standard Checkout** (sole online payment gateway) + **Cash on Delivery (COD)** + **Shiprocket API v2** + **Resend**.

---

## 1. System Architecture Overview

```text
Storefront (Browser)
 ├── Razorpay Standard Checkout (https://checkout.razorpay.com/v1/checkout.js)
 └── Server Actions / Edge API Routes (Cloudflare Pages Edge Runtime)
      ├── POST /api/payments/create-razorpay-order  ──► lib/actions/checkout.ts (createOrder)
      │                                                   ├─ Authoritative DB pricing & integer paise
      │                                                   ├─ Atomic stock & coupon reservation RPCs
      │                                                   └─ Razorpay POST /v1/orders
      ├── POST /api/payments/verify-razorpay        ──► lib/actions/checkout.ts (verifyRazorpayPayment)
      │                                                   ├─ Constant-time HMAC-SHA256 signature check
      │                                                   ├─ Authoritative Razorpay GET /v1/payments/{id}
      │                                                   ├─ Optional server capture if status === 'authorized'
      │                                                   └─ confirmAndMarkOrderPaid() + confirm_order_inventory RPC
      ├── POST /api/webhooks/razorpay               ──► lib/actions/payments.ts (handleRazorpayWebhook)
      │                                                   ├─ Constant-time X-Razorpay-Signature check
      │                                                   ├─ Durable webhook_events claim/retry/dedup
      │                                                   └─ Handles payment.*, order.paid, refund.*
      ├── Admin Logistics Actions                   ──► lib/actions/admin-orders.ts ──► lib/services/shiprocket/index.ts
      │                                                   ├─ Eligibility gate (blocks unpaid prepaid / cancelled / duplicates)
      │                                                   ├─ JWT token cache (7d) + 401 refresh lock
      │                                                   ├─ Real order/customer/item/SKU/HSN/weight payloads
      │                                                   └─ Create order, AWB, pickup, label, manifest, track, cancel
      ├── POST /api/webhooks/logistics              ──► Shiprocket tracking webhook (x-api-key auth)
      │                                                   ├─ Durable webhook_events dedup
      │                                                   ├─ Monotonic shipments + orders updates (never alters payment_status)
      │                                                   └─ Idempotent milestone emails (shipped, out_for_delivery, delivered)
      └── Transactional Email Engine                ──► lib/actions/notifications.ts ──► Resend REST API
                                                          └─ Deduped via notifications.dedup_key unique index
```

### Legacy Gateway Decommission Policy
- **Cashfree has been completely removed** from all active runtime routes, frontend checkout/order-success flows, admin settings, environment definitions, CSP headers, and tests.
- Historical database migrations (`supabase/migrations/20261119_cashfree_payment_gateway.sql`) and legacy `orders.payment_method` check constraints are intentionally preserved so existing historical database records remain readable and intact.

---

## 2. Razorpay Standard Checkout Payment Flow

1. **Order Creation (`createOrder` / `POST /api/payments/create-razorpay-order`)**:
   - Validates Zod schema, normalizes Indian phone & pincode, checks KV rate limit (`RATE_LIMIT_KV`), and enforces idempotency key ownership (prevents reusing another user's/email's idempotency key).
   - Queries `product_variants` + `products` directly from Supabase; completely ignores client-submitted prices, totals, or discounts.
   - Reserves variant stock atomically via `reserve_order_inventory` RPC and coupon usage atomically via `reserve_coupon_for_order` RPC. If any subsequent step fails, rolls back inventory/coupon via `release_order_inventory`.
   - Computes authoritative totals in rupees and integer paise (`toPaise`). Enforces Razorpay minimum payable amount (`>= 100 paise` / ₹1) and COD ceiling (`<= ₹25,000`).
   - Validates Razorpay mode consistency via `getRazorpayConfig()` (`RAZORPAY_ENV` === `NEXT_PUBLIC_RAZORPAY_ENV` === key prefix `rzp_test_` or `rzp_live_`).
   - Calls `POST https://api.razorpay.com/v1/orders` with integer paise, `currency: 'INR'`, `receipt: order_number`, and `notes: { order_id, order_number, user_id }`.
   - Persists `orders.payment_id = razorpay_order_id` and returns `{ orderId, orderNumber, razorpayOrderId, razorpayKeyId, amountPaise, currency, receiptToken }` (never secrets).

2. **Browser Modal (`app/(store)/checkout/page.tsx`)**:
   - Loads `https://checkout.razorpay.com/v1/checkout.js` and opens `window.Razorpay(options)` with server-returned `order_id`, `amount` (paise), `currency: 'INR'`, and `key`.
   - Guards against double submission using `submittingRef` + `isProcessing`.
   - On Razorpay success handler: calls `POST /api/payments/verify-razorpay` with `{ razorpay_order_id, razorpay_payment_id, razorpay_signature }`.
   - On `payment.failed` or modal dismissal: surfaces clear feedback; never marks order paid on client.
   - On timeout/network interruption after payment submission: redirects to `/order-success?orderId=...&token=...&verifying=1` where server reconciliation polls safely.

3. **Authoritative Server Verification (`verifyRazorpayPayment`)**:
   - Validates ID/hex formats and timing-safe HMAC-SHA256 of `${razorpay_order_id}|${razorpay_payment_id}` against `RAZORPAY_KEY_SECRET`.
   - Resolves internal order strictly via `orders.payment_id = razorpay_order_id`.
   - Calls `GET https://api.razorpay.com/v1/payments/{payment_id}` to independently verify:
     - `payment.order_id === razorpay_order_id`
     - `payment.currency === 'INR'`
     - `payment.amount === toPaise(order.total_amount)`
     - `payment.status === 'captured'` (if `'authorized'`, executes `POST /v1/payments/{id}/capture`; if capture does not immediately finalize, returns `status: 'pending_capture'` without falsely confirming the order).
   - Calls canonical `confirmAndMarkOrderPaid()` which:
     - Detects duplicate distinct captured `payment_id`s on the same order (flags `metadata.duplicate_payment_alert = true` for ops/auto-refund instead of silently overwriting).
     - Confirms inventory via `confirm_order_inventory`. If a stock conflict occurs after payment capture, triggers automatic full refund via `executeGatewayRefund` with `restoreInventory: false` and marks order cancelled.
     - Updates `payment_status = 'paid'`, `status = 'confirmed'`, clears authenticated cart, and dispatches idempotent customer + admin confirmation emails.

4. **Order Success Page (`app/(store)/order-success/page.tsx`)**:
   - Loads authoritative order state from server using signed `receiptToken` (or authenticated owner session).
   - Displays **Order Confirmed** only when `payment_method === 'cod'` (and order not cancelled) OR `payment_status === 'paid'`.
   - Displays **Verifying Payment** when prepaid order is still `pending`/`authorized`, automatically calling `reconcileCustomerOrderPayment` (rate-limited) to query Razorpay directly if webhooks were delayed.
   - Displays **Payment Not Completed** when `payment_status === 'failed'` or `status === 'cancelled'`.

---

## 3. State Machines

### Payment Status (`lib/orders/state-machine.ts`)
- `pending` → `authorized` | `paid` | `failed`
- `authorized` → `paid` | `failed`
- `paid` → `refund_pending` | `partially_refunded` | `refunded`
- `refund_pending` → `paid` | `partially_refunded` | `refunded`
- `partially_refunded` → `refund_pending` | `refunded`
- `failed` → `pending` | `authorized` | `paid` (supports retry/late capture recovery)
- `refunded` → *(terminal)*

### Order Status
- `pending` → `confirmed` | `cancelled`
- `confirmed` → `processing` | `shipped` | `cancelled`
- `processing` → `shipped` | `cancelled`
- `shipped` → `out_for_delivery` | `delivered` | `delivery_failed` | `rto`
- `out_for_delivery` → `delivered` | `delivery_failed` | `rto`
- `delivery_failed` → `out_for_delivery` | `delivered` | `rto`
- `delivered` → `returned`
- `rto` → `returned`
- `cancelled`, `returned` → *(terminal)*

### Shipment Status (`public.shipments.shipment_status`)
- `created` → `awb_assigned` | `pickup_scheduled` | `in_transit` | `cancelled` | `exception`
- `awb_assigned` → `pickup_scheduled` | `in_transit` | `out_for_delivery` | `delivered` | `rto_initiated` | `cancelled` | `exception`
- `pickup_scheduled` → `in_transit` | `out_for_delivery` | `delivered` | `rto_initiated` | `cancelled` | `exception`
- `in_transit` → `out_for_delivery` | `delivered` | `delivery_failed` | `rto_initiated` | `rto_in_transit` | `rto_delivered` | `exception`
- `out_for_delivery` → `delivered` | `delivery_failed` | `rto_initiated` | `exception`
- `delivery_failed` → `out_for_delivery` | `delivered` | `rto_initiated` | `exception`
- `rto_initiated` → `rto_in_transit` | `rto_delivered`
- `rto_in_transit` → `rto_delivered`
- `delivered`, `cancelled`, `rto_delivered` → *(terminal — never regressed by out-of-order webhooks)*

---

## 4. Webhook Architecture

| Provider | Endpoint | Auth Mechanism | Dedup & Retry |
| --- | --- | --- | --- |
| **Razorpay** | `POST /api/webhooks/razorpay` | `X-Razorpay-Signature` HMAC-SHA256 over raw body using `RAZORPAY_WEBHOOK_SECRET` | `public.webhook_events` unique `(provider, event_id)` with `status` (`processing`/`processed`/`failed`) |
| **Shiprocket** | `POST /api/webhooks/logistics` | `x-api-key` timing-safe comparison against `SHIPROCKET_WEBHOOK_TOKEN` | `public.webhook_events` unique `(provider, event_id)` with `status` (`processing`/`processed`/`failed`) |

- **Status Codes**:
  - `503` if webhook secret/token or service role key is not configured (fails closed; allows gateway retry once configured).
  - `401` on invalid signature / security token.
  - `400` on malformed payload / missing signature header.
  - `429` on KV rate-limit breach.
  - `500` on transient processing errors (event row marked `failed` so gateway retries cleanly instead of silently swallowing).
  - `200` on processed or already-processed duplicate events.
- **Separation of Concerns**: `/api/webhooks/logistics` updates shipment and fulfillment fields ONLY and **never** mutates `orders.payment_status`.

---

## 5. Refund Architecture & Inventory Separation

- **Durable Ledger**: Every refund attempt is recorded in `public.order_refunds` with `idempotency_key` (unique), `amount_paise`, `amount_inr`, `gateway_refund_id`, `status` (`initiated`/`pending`/`processed`/`failed`), `restore_inventory`, `reason`, and `initiated_by`.
- **Remaining Refundable Balance**: Computed from `order_refunds` rows in `initiated`/`pending`/`processed` states (or legacy `metadata.refund_amount`) so cumulative partial + full refunds can **never exceed** `toPaise(order.total_amount)`.
- **Idempotency**: Sends `X-Refund-Idempotency` header to Razorpay `POST /v1/payments/{id}/refund`.
- **Inventory Restoration**: Controlled explicitly via `restoreInventory: boolean` (default `false` in admin refund UI and automated return/cancel callers that already called `release_order_inventory`) to prevent double stock restocking.

---

## 6. Shiprocket API v2 Logistics Flow

1. **Eligibility Gate (`evaluateShipmentEligibility`)**:
   - Blocks shipment creation for `cancelled`, `delivered`, `returned`, `rto` orders, unpaid prepaid orders (`payment_method !== 'cod' && payment_status !== 'paid'`), and orders that already have an active non-cancelled shipment in `public.shipments`.
2. **Authentication**: `POST /v1/external/auth/login` with JWT cached in memory for 7 days (Shiprocket expiry is 10 days), concurrent login deduplication lock, and automatic single refresh+retry on HTTP `401`.
3. **Real Order Payload**: Joins `orders`, `order_items`, `products` (`hsn_code`, `gst_slab`), and `product_variants` (`sku`, `weight_grams`). Rejects missing/invalid customer email, 10-digit Indian phone, 6-digit pincode, street address, or line items — zero hardcoded placeholder data.
4. **End-to-End Admin Operations (`/admin/orders/[id]`)**:
   - **Create Shiprocket Shipment & Assign AWB**: Creates adhoc order (`POST /orders/create/adhoc`), checks pincode serviceability if `SHIPROCKET_PICKUP_PINCODE` is set, assigns AWB (`POST /courier/assign/awb`), saves actual courier partner name + `shiprocket_order_id` + `shiprocket_shipment_id` + `tracking_url` in `public.shipments` & `orders`, transitions order to `processing` (not premature `shipped`), and handles partial failure (Shiprocket order created, AWB pending) cleanly so admins can retry without duplicating the Shiprocket order.
   - **Schedule Pickup**: `POST /courier/generate/pickup`.
   - **Download Label & Manifest**: `POST /courier/generate/label` & `POST /manifests/generate` (stores returned PDF URLs on `public.shipments`).
   - **Live Tracking Sync**: `GET /courier/track/awb/{awb}` updates `scans`, `etd`, and monotonic status on both `shipments` and `orders`.
   - **Cancel Shipment**: `POST /orders/cancel/shipment/awbs` or `POST /orders/cancel` marks shipment cancelled without corrupting payment state.

---

## 7. Reconciliation & Notifications

- **Admin Reconciliation (`reconcileRazorpayOrder`)**: Available directly in `/admin/orders/[id]` for any pending/failed Razorpay order. Queries `GET /v1/orders/{razorpay_order_id}/payments`, captures authorized payments if applicable, and confirms paid orders safely.
- **Customer Self-Reconciliation (`reconcileCustomerOrderPayment`)**: Rate-limited reconciliation triggered automatically on `/order-success?verifying=1` so customers whose browser closed or dropped right after payment still receive authoritative confirmation.
- **Transactional Emails (`lib/actions/notifications.ts`)**:
  - Uses `notifications.dedup_key` (unique partial index `idx_notifications_dedup_key`) so webhook replays or parallel verify + webhook races never send duplicate emails.
  - Covers: Order Confirmed (+ admin alert), Payment Failed, Order Cancelled, Refund Initiated/Processed/Failed, Shipment Created/Shipped/Out for Delivery/Delivered.

---

## 8. Environment Variables & Environments

| Scope | Test / Preview | Production (Test Mode -> Live Mode) |
| --- | --- | --- |
| Razorpay Mode | `RAZORPAY_ENV=test`, `NEXT_PUBLIC_RAZORPAY_ENV=test`, `rzp_test_*` | Start in `test` mode for staging verification; switch all 4 vars + webhook secret together to `live` (`rzp_live_*`) for go-live |
| Shiprocket | Dedicated Shiprocket API user + `SHIPROCKET_WEBHOOK_TOKEN` | Same API credentials + `SHIPROCKET_PICKUP_LOCATION` + `SHIPROCKET_PICKUP_PINCODE` + `SHIPROCKET_WEBHOOK_TOKEN` |
| Resend | `RESEND_API_KEY` + verified `EMAIL_FROM` | Same, with DKIM + SPF verified in Cloudflare DNS |
| Cloudflare Pages | `RATE_LIMIT_KV` preview binding | `RATE_LIMIT_KV` production binding |

---

## 9. Testing, Deployment & Troubleshooting

### Verification Commands
```powershell
npm run type-check
npm run lint
npx vitest run --pool=forks --poolOptions.forks.singleFork
npm run build
```

### Troubleshooting Quick Reference
- **Checkout says "Payment gateway configuration error"**: Check that `RAZORPAY_ENV`, `NEXT_PUBLIC_RAZORPAY_ENV`, `RAZORPAY_KEY_ID`, and `NEXT_PUBLIC_RAZORPAY_KEY_ID` all match (`test` + `rzp_test_*`, or `live` + `rzp_live_*`), and trigger a fresh Cloudflare Pages deploy after editing `NEXT_PUBLIC_*` variables.
- **Razorpay webhook returns `503`**: `RAZORPAY_WEBHOOK_SECRET` or `SUPABASE_SERVICE_ROLE_KEY` is missing in Cloudflare Pages Production secrets.
- **Shiprocket rejects webhook URL**: Ensure you entered `https://angelikafashions.com/api/webhooks/logistics` (no `shiprocket`/`kartrocket`/`sr`/`kr` substring).
- **Shiprocket shipment blocked in Admin**: Verify the prepaid order has `payment_status = 'paid'` (or run **Reconcile with Razorpay** first) and no active shipment already exists.
- **Emails not arriving**: Check `RESEND_API_KEY` in Cloudflare Pages secrets, `notifications` table `error_message` column, and Resend domain verification (SPF/DKIM in Cloudflare DNS).

### Known Limitations & Required External Actions
1. **Supabase SQL Migration**: Run `supabase/migrations/20261126_razorpay_shiprocket_production.sql` in Supabase SQL Editor.
2. **External Credentials**: Supply Razorpay keys/webhook secret, `RESEND_API_KEY`, and `SHIPROCKET_WEBHOOK_TOKEN` in Cloudflare Pages secrets and redeploy.
3. **External Webhooks**: Register `https://angelikafashions.com/api/webhooks/razorpay` in Razorpay Dashboard and `https://angelikafashions.com/api/webhooks/logistics` (`x-api-key`) in Shiprocket Dashboard.
4. **Domain Hardening**: Set Cloudflare SSL/TLS mode to **Full (strict)** and add Resend DKIM/SPF records on `angelikafashions.com`.
