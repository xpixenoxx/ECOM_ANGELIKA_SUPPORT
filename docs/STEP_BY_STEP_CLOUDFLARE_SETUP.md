# Step-by-Step Cloudflare Pages Production Setup Guide
## Angelika Fashions (`angelikafashions.com`)

This guide covers deploying and configuring **Angelika Fashions** on **Cloudflare Pages** with **Supabase**, **Razorpay Standard Checkout**, **Shiprocket API v2**, and **Resend**.

---

## STEP 1: Cloudflare Account & Project Overview

- **Cloudflare Pages Project**: `angelika-fashions`
- **Production Branch**: `main`
- **Build Command**: `npx @cloudflare/next-on-pages`
- **Build Output Directory**: `.vercel/output/static`
- **Compatibility Date**: `2024-09-23` (or newer)
- **Compatibility Flags**: `nodejs_compat`, `nodejs_compat_populate_process_env`
- **KV Namespace Binding**: `RATE_LIMIT_KV` (Production + Preview)
- **Custom Domains**: `angelikafashions.com`, `www.angelikafashions.com`

---

## STEP 2: Apply Supabase Database Migrations

1. Open **[https://supabase.com/dashboard](https://supabase.com/dashboard)** → your **Angelika Fashions** project → **SQL Editor**.
2. Ensure all migrations in `supabase/migrations/` are applied in chronological order, including:
   - `20261116_production_hardening.sql`
   - `20261119_update_real_contact_details.sql`
   - `20261119_cloudflare_edge_perf_indexes.sql`
   - `20261121_content_blocks_type_check.sql` (relaxes `content_blocks_type_check` constraint on `public.content_blocks` so all CMS section keys and bidirectional sync blocks persist cleanly).
   - `20261126_razorpay_shiprocket_production.sql` (adds `order_refunds`, `shipments`, `webhook_events.status`, `notifications.dedup_key`/`metadata`, and expanded payment status constraints while preserving historical orders).
3. Under **Project Settings → API**, record:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (Secret — server-side only)
4. Under **Authentication → URL Configuration**:
   - **Site URL**: `https://angelikafashions.com`
   - **Redirect URLs**: `https://angelikafashions.com/**` and `https://www.angelikafashions.com/**`
5. Under **Storage**, verify public buckets `product-images` and `media` exist.

---

## STEP 3: Configure Cloudflare Pages Environment Variables

In **Cloudflare Dashboard → Workers & Pages → `angelika-fashions` → Settings → Variables and Secrets**, configure the following for **Production** and **Preview**:

### Core Application & Database
| Variable | Type | Value / Notes |
| --- | --- | --- |
| `NODE_VERSION` | Text | `20` |
| `NEXT_PUBLIC_SITE_URL` | Text | `https://angelikafashions.com` |
| `NEXT_PUBLIC_SUPABASE_URL` | Text | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Text | Your Supabase `anon` key |
| `SUPABASE_SERVICE_ROLE_KEY` | **Secret** | Your Supabase `service_role` key |
| `REVALIDATE_SECRET` | **Secret** | Strong random secret |
| `REVALIDATION_SECRET` | **Secret** | Same value as `REVALIDATE_SECRET` |
| `ORDER_TOKEN_SECRET` | **Secret** | Optional dedicated HMAC secret for guest receipt tokens (falls back to `SUPABASE_SERVICE_ROLE_KEY`) |

### Razorpay Standard Checkout (Primary Online Payment Gateway)
> **Mode Consistency Rule**: `RAZORPAY_ENV`, `NEXT_PUBLIC_RAZORPAY_ENV`, `RAZORPAY_KEY_ID`, and `NEXT_PUBLIC_RAZORPAY_KEY_ID` MUST all match (`test` with `rzp_test_*`, OR `live` with `rzp_live_*`). Mismatches are blocked automatically at runtime.

| Variable | Type | Test Mode Value | Live Mode Value |
| --- | --- | --- | --- |
| `RAZORPAY_ENV` | Text | `test` | `live` |
| `NEXT_PUBLIC_RAZORPAY_ENV` | Text | `test` | `live` |
| `RAZORPAY_KEY_ID` | Text/Secret | `rzp_test_...` | `rzp_live_...` |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Text | `rzp_test_...` (exact match to `RAZORPAY_KEY_ID`) | `rzp_live_...` |
| `RAZORPAY_KEY_SECRET` | **Secret** | Razorpay Test Key Secret | Razorpay Live Key Secret |
| `RAZORPAY_WEBHOOK_SECRET` | **Secret** | Webhook secret from Razorpay Dashboard (Test Mode) | Webhook secret from Razorpay Dashboard (Live Mode) |

> **Important**: `NEXT_PUBLIC_*` variables are inlined into the client bundle at build time. After adding or changing `NEXT_PUBLIC_RAZORPAY_KEY_ID` or `NEXT_PUBLIC_RAZORPAY_ENV`, trigger a **Retry deployment** (or push a commit) in Cloudflare Pages.

### Shiprocket Logistics (API v2)
| Variable | Type | Value / Notes |
| --- | --- | --- |
| `SHIPROCKET_EMAIL` | Text | Dedicated Shiprocket API User email (Settings → API → Add New API User) |
| `SHIPROCKET_PASSWORD` | **Secret** | Shiprocket API User password |
| `SHIPROCKET_PICKUP_LOCATION` | Text | Exact Pickup Address Nickname from Shiprocket Dashboard (e.g. `Primary`) |
| `SHIPROCKET_PICKUP_PINCODE` | Text | 6-digit warehouse pickup pincode (enables serviceability check) |
| `SHIPROCKET_WEBHOOK_TOKEN` | **Secret** | Strong random secret matching `x-api-key` in Shiprocket Webhook settings |
| `SHIPROCKET_DEFAULT_WEIGHT_KG` | Text | Optional fallback parcel weight in kg when variant weight is unset (default `0.5`) |
| `SHIPROCKET_DEFAULT_LENGTH_CM` | Text | Optional fallback parcel length in cm (default `30`) |
| `SHIPROCKET_DEFAULT_BREADTH_CM` | Text | Optional fallback parcel breadth in cm (default `24`) |
| `SHIPROCKET_DEFAULT_HEIGHT_CM` | Text | Optional fallback parcel height in cm (default `6`) |

### Transactional Email (Resend)
| Variable | Type | Value / Notes |
| --- | --- | --- |
| `RESEND_API_KEY` | **Secret** | Resend API key (`re_...`) |
| `EMAIL_FROM` | Text | `Angelika Fashions <orders@angelikafashions.com>` (domain verified in Resend) |
| `ADMIN_NOTIFICATION_EMAIL` | Text | Optional ops inbox for new order alerts (defaults to `vidhya@angelikafashions.com`) |

---

## STEP 4: Register Webhooks

### 1. Razorpay Dashboard → Settings → Webhooks
- **Webhook URL**: `https://angelikafashions.com/api/webhooks/razorpay`
- **Secret**: Set a strong secret and save the exact value in Cloudflare Pages as `RAZORPAY_WEBHOOK_SECRET`.
- **Active Events**:
  - `payment.captured`
  - `payment.authorized`
  - `payment.failed`
  - `order.paid`
  - `refund.created`
  - `refund.processed`
  - `refund.failed`

### 2. Shiprocket Dashboard → Settings → API → Webhooks
- **Webhook URL**: `https://angelikafashions.com/api/webhooks/logistics`
  > Note: Shiprocket rejects URLs containing `shiprocket`, `kartrocket`, `sr`, or `kr`. `/api/webhooks/logistics` avoids all restricted keywords.
- **Security Token (`x-api-key`)**: Set a strong random token and save the exact value in Cloudflare Pages as `SHIPROCKET_WEBHOOK_TOKEN`.

---

## STEP 5: Cloudflare DNS, SSL/TLS & Security Verification

1. **SSL/TLS Mode**: In Cloudflare Dashboard for `angelikafashions.com` → **SSL/TLS → Overview**, set encryption mode to **Full (strict)** and enable **Always Use HTTPS**.
2. **Resend Email Authentication**: Add the DKIM (`TXT`/`CNAME`) and SPF records provided by Resend to Cloudflare DNS for `angelikafashions.com` so transactional order/shipping emails pass DMARC and avoid spam folders.
3. **Verify Live Endpoints**:
   - `https://angelikafashions.com/` — confirms storefront + security headers (`Content-Security-Policy`, `Strict-Transport-Security`, `X-Frame-Options`, `X-Content-Type-Options`)
   - `https://angelikafashions.com/api/health` — returns `{ "ok": true }`
   - `https://angelikafashions.com/checkout` — displays Razorpay Standard Checkout + COD
   - `https://angelikafashions.com/admin/settings/payments` — shows Razorpay mode (`Test` or `Live`) & webhook health
   - `https://angelikafashions.com/admin/settings/shipping` — shows Shiprocket API & webhook token status
