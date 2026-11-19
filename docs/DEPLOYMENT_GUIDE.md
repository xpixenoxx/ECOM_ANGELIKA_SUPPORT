# Deployment Guide — Angelika Fashions on Cloudflare Pages

> [!IMPORTANT]
> Complete every step in order. Do **not** switch DNS until the deployment is verified on the `*.pages.dev` subdomain.

---

## Prerequisites

| Requirement | Version / Notes |
|---|---|
| Node.js | 20+ (LTS recommended) |
| npm | 10+ |
| Cloudflare account | Free tier works; Workers Paid ($5/mo) recommended for production |
| Supabase project | Pro plan recommended for production SLA and no pausing |
| Wrangler CLI | `npm install -g wrangler` then `wrangler login` |
| Git | Repo pushed to GitHub (required for Cloudflare Pages CI) |

---

## Step 1 — Install the Next.js / Cloudflare Adapter

```bash
npm install -D @cloudflare/next-on-pages
```

Add a build script to `package.json`:

```json
{
  "scripts": {
    "build:cf": "npx @cloudflare/next-on-pages"
  }
}
```

> [!NOTE]
> `@cloudflare/next-on-pages` transpiles your Next.js App Router build into the Cloudflare Workers format. It wraps the standard `next build` output, so your existing code requires no structural changes.

---

## Step 2 — Verify `wrangler.toml`

Confirm `e:\Angelika_s\wrangler.toml` contains the following (created by the infra worker):

```toml
name = "angelika-fashions"
compatibility_date = "2024-09-23"
compatibility_flags = ["nodejs_compat"]
pages_build_output_dir = ".vercel/output/static"

[vars]
NEXT_PUBLIC_SITE_URL = "https://angelikafashions.com"

[[kv_namespaces]]
binding = "RATE_LIMIT_KV"
id = "PLACEHOLDER_KV_ID"
preview_id = "PLACEHOLDER_KV_PREVIEW_ID"

[build]
command = "npx @cloudflare/next-on-pages"
```

> [!WARNING]
> Replace `PLACEHOLDER_KV_ID` and `PLACEHOLDER_KV_PREVIEW_ID` with real IDs from Step 7 before deploying.

---

## Step 3 — Connect GitHub Repo to Cloudflare Pages

1. Log in to [dash.cloudflare.com](https://dash.cloudflare.com)
2. Navigate to **Workers & Pages → Create → Pages → Connect to Git**
3. Authorize Cloudflare to access your GitHub account
4. Select the **Angelika_s** repository
5. Click **Begin setup**

**Build configuration:**

| Setting | Value |
|---|---|
| Framework preset | None (custom) |
| Build command | `npx @cloudflare/next-on-pages` |
| Build output directory | `.vercel/output/static` |
| Root directory | `/` (default) |
| Node.js version | `20` |

---

## Step 4 — Set Compatibility Settings

In the Cloudflare Pages project settings:

**Settings → Functions → Compatibility date:** `2024-09-23`

**Settings → Functions → Compatibility flags:** add `nodejs_compat`

> [!IMPORTANT]
> `nodejs_compat` is **required**. Without it, Node.js built-ins used by Supabase client and other dependencies will throw runtime errors.

---

## Step 5 — Set Environment Variables

In **Cloudflare Pages → Settings → Environment variables**, add all the following for both **Production** and **Preview** environments:

> [!CAUTION]
> Never commit secrets to source control. All secrets must be set via the Cloudflare dashboard. The `.dev.vars` file is for local development only and is `.gitignore`d.

### Public Variables (safe to expose in browser)

| Variable | Description | Example |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Production site URL | `https://angelikafashions.com` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | `https://xxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key | `eyJ...` |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Razorpay publishable key | `rzp_live_...` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | `pk_live_...` |

### Secret Variables (server-only)

| Variable | Description |
|---|---|
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (admin access — keep secret) |
| `RAZORPAY_KEY_ID` | Razorpay secret key ID |
| `RAZORPAY_KEY_SECRET` | Razorpay secret key |
| `RAZORPAY_WEBHOOK_SECRET` | Razorpay webhook HMAC secret |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `RESEND_API_KEY` | Resend transactional email API key |
| `DELHIVERY_API_TOKEN` | Delhivery shipping API token |
| `DELHIVERY_WEBHOOK_SECRET` | Delhivery webhook verification secret |
| `DELHIVERY_PICKUP_LOCATION` | Delhivery pickup location code |
| `WHATSAPP_PHONE_NUMBER_ID` | Meta WhatsApp phone number ID |
| `WHATSAPP_ACCESS_TOKEN` | Meta WhatsApp access token |
| `WHATSAPP_WEBHOOK_VERIFY_TOKEN` | WhatsApp webhook verification token |
| `WHATSAPP_APP_SECRET` | Meta app secret for webhook HMAC |

---

## Step 6 — Trigger Initial Build

In the Cloudflare Pages dashboard, click **Save and Deploy** (or push a commit to the main branch).

Watch the build log. Expected output:

```
✓ next build
✓ @cloudflare/next-on-pages transform
✓ Output: .vercel/output/static
✓ Deployed to: https://angelika-fashions.pages.dev
```

If the build fails, check:
- Node version is set to 20
- `nodejs_compat` flag is enabled
- All required env vars are set

---

## Step 7 — Create KV Namespace for Rate Limiting

```bash
# Install Wrangler globally if not already
npm install -g wrangler
wrangler login

# Create production KV namespace
wrangler kv:namespace create RATE_LIMIT_KV

# Create preview KV namespace (for staging builds)
wrangler kv:namespace create RATE_LIMIT_KV --preview
```

Wrangler will output the real IDs. Update `wrangler.toml`:

```toml
[[kv_namespaces]]
binding = "RATE_LIMIT_KV"
id = "REAL_KV_ID_FROM_WRANGLER"
preview_id = "REAL_KV_PREVIEW_ID_FROM_WRANGLER"
```

Then also bind the KV namespace in the Cloudflare Pages dashboard:

**Settings → Functions → KV namespace bindings:**
- Variable name: `RATE_LIMIT_KV`
- KV namespace: select the namespace you just created

---

## Step 8 — Update Webhook URLs in External Services

After confirming the `*.pages.dev` deployment works, **and again after DNS cutover**, update webhook endpoints in every provider dashboard:

| Provider | Dashboard URL | Webhook Setting | New URL |
|---|---|---|---|
| **Razorpay** | dashboard.razorpay.com → Settings → Webhooks | Webhook URL | `https://angelikafashions.com/api/webhooks/razorpay` |
| **Stripe** | dashboard.stripe.com → Developers → Webhooks | Endpoint URL | `https://angelikafashions.com/api/webhooks/stripe` |
| **Delhivery** | app.delhivery.com → Settings | Webhook URL | `https://angelikafashions.com/api/webhooks/delhivery` |
| **WhatsApp** | developers.facebook.com → App → Webhooks | Callback URL | `https://angelikafashions.com/api/webhooks/whatsapp` |

> [!WARNING]
> During the transition, temporarily register **both** the `*.pages.dev` URL and the production URL in each provider, then remove the old URL after DNS propagation is confirmed. This prevents missed webhooks during cutover.

---

## Step 9 — Smoke Test on `*.pages.dev`

Before switching DNS, run this checklist on `https://angelika-fashions.pages.dev`:

```
[ ] Homepage loads (ISR)
[ ] Product listing loads (ISR)
[ ] Product detail page loads
[ ] Add to cart works (session persists)
[ ] Supabase Auth login works
[ ] Checkout flow initiates payment (Razorpay / Stripe)
[ ] Webhook endpoints respond with 200 on GET (WhatsApp verify token)
[ ] Admin dashboard accessible to admin user
[ ] Rate limiting triggers after threshold
[ ] No console errors relating to missing env vars
[ ] SSL on pages.dev subdomain is valid
```

Only proceed to DNS migration after all items are checked. See [DNS_MIGRATION.md](./DNS_MIGRATION.md).

---

## Step 10 — Post-Deployment Verification

After DNS cutover to production:

```bash
# Verify CDN headers are set correctly
curl -I https://angelikafashions.com/

# Check Cloudflare cache status header
# Expect: cf-cache-status: HIT (after first request)
curl -I https://angelikafashions.com/products

# Verify security headers
curl -I https://angelikafashions.com/ | grep -E "x-frame-options|x-content-type|strict-transport"
```

Monitor the following for 24 hours post-cutover:
- **Cloudflare Analytics** — request volume, error rates, cache hit ratio
- **Supabase Dashboard** — connection pool usage, query latency
- **Razorpay / Stripe** — webhook delivery success rate
- **Resend** — email delivery rate
