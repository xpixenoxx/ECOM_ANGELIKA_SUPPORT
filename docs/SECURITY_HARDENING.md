# Security Hardening Guide — Angelika Fashions on Cloudflare

> [!CAUTION]
> This application handles payment data (Razorpay, Stripe), personal customer data, and shipping information. Security is non-negotiable. Complete every section before going live.

---

## 1. Cloudflare WAF (Web Application Firewall)

### Enable Managed Rules

Navigate to **Security → WAF → Managed rules** in the Cloudflare dashboard:

| Rule Set | Status | Notes |
|---|---|---|
| Cloudflare Managed Rules | **Enable** | Covers OWASP Top 10, SQLi, XSS, path traversal |
| Cloudflare OWASP Core Ruleset | **Enable** | Paranoia level 1 is safe for most apps |
| Cloudflare Bot Fight Mode | **Enable** | Blocks automated scrapers and credential stuffing |

### DDoS Protection

Cloudflare provides **automatic DDoS mitigation** at L3/L4/L7 on all plans. No configuration needed; it is on by default.

For additional protection:

- **Security → DDoS → HTTP DDoS attack protection** → Set sensitivity to **High**
- **Security → Settings → Security level** → Set to **Medium** (or High during active attacks)

### Custom WAF Rules (Recommended)

Add these custom rules under **Security → WAF → Custom rules**:

```
Rule 1: Block non-POST requests to webhook endpoints
  Expression: (http.request.uri.path contains "/api/webhooks/" and not http.request.method eq "POST" and not http.request.method eq "GET")
  Action: Block

Rule 2: Rate limit admin dashboard
  Expression: (http.request.uri.path starts_with "/admin")
  Action: Rate limit (10 requests / 10 seconds per IP)

Rule 3: Block common scanner paths
  Expression: (http.request.uri.path contains "/.env" or http.request.uri.path contains "/wp-admin" or http.request.uri.path contains "/.git")
  Action: Block
```

---

## 2. Security Headers

The application already sets the following security headers in `next.config.mjs`. These headers are carried through the Cloudflare Pages Worker and delivered to clients. Verify they appear in production responses:

```bash
curl -I https://angelikafashions.com/ | grep -iE "x-frame|x-content|strict-transport|referrer|permissions|x-xss"
```

Expected headers:

| Header | Expected Value | Purpose |
|---|---|---|
| `X-Frame-Options` | `DENY` | Prevents clickjacking |
| `X-Content-Type-Options` | `nosniff` | Prevents MIME sniffing |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` | Forces HTTPS for 1 year |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Limits referrer header leakage |
| `Permissions-Policy` | Configured in next.config.mjs | Restricts browser APIs |
| `X-XSS-Protection` | `1; mode=block` | Legacy XSS filter |

> [!NOTE]
> Cloudflare automatically adds its own `cf-*` headers. It does **not** strip or override your application-level security headers. What you set in `next.config.mjs` reaches the browser.

### Cloudflare HSTS Preload (Additional)

In **SSL/TLS → Edge Certificates**:
- Enable **HTTP Strict Transport Security (HSTS)**
- Max age: `31536000` (1 year)
- Include subdomains: **Yes**
- Preload: **Yes** (after verifying no subdomain uses plain HTTP)

---

## 3. Content Security Policy (CSP)

The existing CSP in `next.config.mjs` should be audited for the new Cloudflare environment. Key considerations:

### Domains to Allow in CSP

Add or verify these domains are present in your CSP directives after migration:

```
# script-src additions
*.cloudflare.com          # Cloudflare Turnstile (if used for checkout protection)
challenges.cloudflare.com # Cloudflare challenge pages

# connect-src additions  
*.supabase.co             # Supabase API and Realtime WebSocket
*.r2.cloudflarestorage.com # If using R2 for assets

# img-src additions
*.r2.cloudflarestorage.com # If using R2 for images

# frame-src additions
api.razorpay.com          # Razorpay payment frame
js.stripe.com             # Stripe Elements frame
```

> [!WARNING]
> After migration, test the checkout flow in browser DevTools (Console tab) for CSP violation errors. Razorpay and Stripe both require their domains in `script-src` and `frame-src`.

---

## 4. Rate Limiting (KV-Backed)

The in-memory rate limiter has been replaced with a Workers KV-backed implementation (`lib/utils/rate-limit.ts`). This is correct for Cloudflare Workers, which are **stateless and do not share memory** between requests or edge nodes.

### How It Works

```
Request → Worker → Check RATE_LIMIT_KV for key: "rl:{ip}:{endpoint}"
  → Key exists AND count >= limit → Return 429 Too Many Requests
  → Key missing OR count < limit → Increment counter, set TTL, proceed
```

### Verify Rate Limiting Is Active

```bash
# Test rate limiting on a protected endpoint (e.g., /api/auth)
for i in {1..20}; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST https://angelikafashions.com/api/auth/login \
    -H "Content-Type: application/json" -d '{"email":"test@test.com","password":"wrong"}')
  echo "Request $i: $STATUS"
done
# Should see 429 after threshold is hit
```

---

## 5. Webhook Security

All webhook endpoints validate HMAC signatures before processing. This is critical — without it, anyone can forge webhook payloads.

### Webhook Signature Validation Summary

| Endpoint | Provider | Secret Variable | Validation Method |
|---|---|---|---|
| `/api/webhooks/razorpay` | Razorpay | `RAZORPAY_WEBHOOK_SECRET` | HMAC-SHA256 of raw body, compare to `x-razorpay-signature` header |
| `/api/webhooks/stripe` | Stripe | `STRIPE_WEBHOOK_SECRET` | Stripe SDK `constructEvent()` with raw body |
| `/api/webhooks/delhivery` | Delhivery | `DELHIVERY_WEBHOOK_SECRET` | HMAC-SHA256 of raw body |
| `/api/webhooks/whatsapp` | Meta/WhatsApp | `WHATSAPP_APP_SECRET` | HMAC-SHA256 of raw body, compare to `x-hub-signature-256` |

> [!CAUTION]
> Webhooks must receive the **raw request body** (not parsed JSON) for HMAC validation to work. Ensure your route handlers use `request.text()` or equivalent before parsing, not `request.json()` directly.

### Post-Migration Webhook URL Registration

**Immediately after DNS cutover**, update webhook URLs in every provider:

1. **Razorpay**: Settings → Webhooks → Update URL to `https://angelikafashions.com/api/webhooks/razorpay`
2. **Stripe**: Developers → Webhooks → Update endpoint to `https://angelikafashions.com/api/webhooks/stripe`
   - Re-download the **signing secret** — it changes when the endpoint URL changes
3. **Delhivery**: Settings → Update webhook URL
4. **WhatsApp/Meta**: App Dashboard → Webhooks → Update callback URL

> [!IMPORTANT]
> The Stripe webhook signing secret is endpoint-specific. When you change the endpoint URL, you get a new secret. Update `STRIPE_WEBHOOK_SECRET` in Cloudflare Pages environment variables immediately.

---

## 6. Environment Variables & Secrets Management

### Rules

1. **Never commit secrets to Git.** The `.dev.vars` file is in `.gitignore`. Verify this:
   ```bash
   git check-ignore -v .dev.vars  # Should show .gitignore match
   ```

2. **All production secrets go into Cloudflare Pages dashboard** (Settings → Environment variables), not into `wrangler.toml` or any committed file.

3. **Rotate secrets on team member departure.** Revoke and regenerate all API keys when a team member with access leaves.

4. **Use separate keys for staging and production.** The Cloudflare Pages "Preview" environment should use test/sandbox API keys for all payment providers.

### Secret Rotation Checklist

| Secret | How to Rotate |
|---|---|
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard → Settings → API → Regenerate |
| `RAZORPAY_KEY_SECRET` | Razorpay Dashboard → Settings → API Keys → Generate New |
| `STRIPE_SECRET_KEY` | Stripe Dashboard → Developers → API keys → Roll key |
| `RESEND_API_KEY` | Resend Dashboard → API Keys → Delete & recreate |
| `DELHIVERY_API_TOKEN` | Contact Delhivery support |
| `WHATSAPP_ACCESS_TOKEN` | Meta for Developers → System User → Generate new token |

---

## 7. CORS Policy

After migrating to Cloudflare, verify CORS configuration allows the new domain.

### Supabase CORS

In **Supabase Dashboard → Settings → API → CORS origins**:

```
https://angelikafashions.com
https://www.angelikafashions.com
https://angelika-fashions.pages.dev
```

Remove any old Vercel origins:
```
# Remove:
https://angelika-fashions.vercel.app
```

### Next.js API Route CORS

If any API routes set explicit CORS headers, update them to include the Cloudflare Pages staging domain during transition, then remove it post-launch:

```typescript
// In any API route that sets CORS manually:
const allowedOrigins = [
  'https://angelikafashions.com',
  'https://www.angelikafashions.com',
  // Remove after stable:
  'https://angelika-fashions.pages.dev',
];
```

---

## 8. Supabase Row-Level Security (RLS) Reminder

> [!NOTE]
> Supabase RLS is already implemented in this application. This is a reminder checklist, not a task.

Confirm the following RLS policies remain active and correct after migration:

```sql
-- Verify RLS is enabled on all public tables
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND rowsecurity = false;

-- Expected: 0 rows (all tables have RLS enabled)
```

Key policies to verify:
- Users can only read/write their own orders
- Product catalog is publicly readable but only admin-writable
- Payment records are write-once (no user can modify after creation)
- Shipping records are readable by owning user only

---

## 9. SSL/TLS Configuration

In **Cloudflare SSL/TLS**:

| Setting | Recommended Value | Reason |
|---|---|---|
| Encryption mode | **Full (strict)** | Encrypts both browser↔Cloudflare and Cloudflare↔origin; prevents MITM |
| Minimum TLS version | **TLS 1.2** | Drops insecure TLS 1.0/1.1 |
| TLS 1.3 | **Enabled** | Modern, faster handshake |
| Opportunistic Encryption | **On** | Signals HTTPS over HTTP for crawlers |
| HSTS | **Enabled** (see section 2) | Instructs browsers to never use HTTP |

> [!WARNING]
> Do NOT set encryption mode to "Flexible". Flexible terminates SSL at Cloudflare but sends plain HTTP to your origin. For Cloudflare Pages this is not relevant (Pages has no "origin" to reach via HTTP), but setting Flexible is a bad habit and misconfigures the security model.

---

## 10. Security Audit Checklist (Pre-Launch)

```
[ ] Cloudflare WAF managed rules enabled
[ ] DDoS sensitivity set to High
[ ] Custom WAF rules for webhooks and admin added
[ ] Security headers present in production curl output
[ ] CSP updated for Cloudflare/Razorpay/Stripe domains
[ ] Rate limiting tested and returning 429 at threshold
[ ] Webhook HMAC validation tested with real test events from each provider
[ ] All webhook URLs updated to production domain in all dashboards
[ ] .dev.vars confirmed in .gitignore and not committed
[ ] Supabase CORS origins updated to production domain
[ ] Supabase Auth redirect URLs updated
[ ] RLS verified on all Supabase tables
[ ] SSL mode set to Full (strict)
[ ] HSTS enabled with preload
[ ] Minimum TLS 1.2 enforced
```
