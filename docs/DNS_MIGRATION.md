# DNS Migration — Zero-Downtime Cutover Plan

**Domain:** `angelikafashions.com`  
**From:** Vercel DNS / nameservers  
**To:** Cloudflare DNS with Cloudflare proxy enabled

> [!IMPORTANT]
> This plan achieves **zero downtime** by verifying the Cloudflare deployment fully before touching DNS, and by using a low TTL to minimize propagation time during cutover. Expected total downtime: **0 seconds** for end users.

---

## Pre-Cutover Checklist (Complete Before Any DNS Changes)

```
[ ] Cloudflare Pages project created and deployed
[ ] All environment variables set in Cloudflare Pages dashboard
[ ] KV namespace created and bound (RATE_LIMIT_KV)
[ ] Smoke test complete on *.pages.dev URL (see DEPLOYMENT_GUIDE.md Step 9)
[ ] Webhook URLs registered on *.pages.dev URL in all providers (temporary)
[ ] Note your current DNS TTL values (you'll need them for rollback timing)
[ ] Record current nameservers at your registrar (screenshot recommended)
```

---

## Phase 1 — Reduce TTL (Do 24–48 Hours Before Cutover)

> [!NOTE]
> Lowering TTL means DNS resolvers worldwide will check for updates more frequently. This minimises the propagation window during the actual cutover.

1. Log in to your **current DNS provider** (wherever angelikafashions.com DNS is currently managed)
2. Find the **A record** and **CNAME record** (www) for angelikafashions.com
3. Change TTL on both records to **60 seconds**
4. Wait 24–48 hours for the old TTL to expire globally (old cached TTL must flush first)

---

## Phase 2 — Add Domain to Cloudflare

1. Log in to [dash.cloudflare.com](https://dash.cloudflare.com)
2. Click **Add a Site** → enter `angelikafashions.com`
3. Select the **Free plan** (or Pro if WAF advanced rules needed)
4. Cloudflare will scan your existing DNS records — **verify they match** your current DNS:
   - Confirm A record for `@` (apex) is present
   - Confirm CNAME for `www` is present
   - Confirm MX records for email are present (if using email on this domain)
   - Confirm any TXT records (SPF, DKIM, verification tokens) are present
5. **Do NOT enable the orange cloud proxy yet** — set all records to **DNS-only (grey cloud)** at this stage
6. Cloudflare will show you two nameserver addresses (e.g., `aria.ns.cloudflare.com`, `bob.ns.cloudflare.com`)
7. **Do not change nameservers yet** — just note them

---

## Phase 3 — Configure Cloudflare Pages Custom Domain

1. In Cloudflare Pages → your project → **Custom domains**
2. Click **Set up a custom domain**
3. Enter `angelikafashions.com`
4. Also add `www.angelikafashions.com`
5. Cloudflare will add CNAME records pointing to your Pages deployment automatically:
   - `angelikafashions.com` → `angelika-fashions.pages.dev`
   - `www.angelikafashions.com` → `angelika-fashions.pages.dev`

> [!NOTE]
> Cloudflare Pages handles the apex domain via CNAME flattening — no need for A records manually.

---

## Phase 4 — Switch Nameservers (The Cutover Moment)

> [!CAUTION]
> This is the point of no return for DNS. Vercel will continue serving traffic until your TTL-lowered records expire (maximum 60 seconds if you completed Phase 1). Have the rollback plan ready before proceeding.

1. Log in to your **domain registrar** (GoDaddy, Namecheap, etc.)
2. Navigate to **Domain Settings → Nameservers**
3. Change from your current nameservers to the two Cloudflare nameservers noted in Phase 2
4. Save — propagation typically takes **5–30 minutes** (up to 48 hours in worst case, but rare)
5. Monitor propagation using: `watch -n 5 dig +short NS angelikafashions.com`
   - Or online: [dnschecker.org](https://dnschecker.org) for angelikafashions.com NS records

---

## Phase 5 — Enable Cloudflare Proxy After Nameserver Propagation

Once `dig NS angelikafashions.com` returns Cloudflare nameservers:

1. In **Cloudflare DNS** dashboard:
   - Set `angelikafashions.com` A/CNAME record → **Proxied (orange cloud) ✓**
   - Set `www.angelikafashions.com` CNAME → **Proxied (orange cloud) ✓**
2. Set **SSL/TLS → Overview → Encryption mode** to **Full (strict)**
3. Enable **SSL/TLS → Edge Certificates → Always Use HTTPS** → ON
4. Enable **SSL/TLS → Edge Certificates → Automatic HTTPS Rewrites** → ON

---

## Phase 6 — Verify SSL Auto-Provisioning

Cloudflare Universal SSL auto-provisions within 15 minutes of nameserver propagation.

```bash
# Check SSL certificate
curl -vI https://angelikafashions.com 2>&1 | grep -E "SSL|TLS|certificate|issuer"

# Expected: issuer: Cloudflare, Inc.
# Expected: HTTP/2 200
```

If SSL is not provisioned after 30 minutes:
- Go to **SSL/TLS → Edge Certificates** — check for provisioning errors
- Ensure no CAA DNS record is blocking Cloudflare from issuing certificates

---

## Phase 7 — Post-Cutover Tasks (Within 1 Hour)

### Update Webhook URLs to Production Domain

| Provider | Update From | Update To |
|---|---|---|
| Razorpay | `https://angelika-fashions.pages.dev/api/webhooks/razorpay` | `https://angelikafashions.com/api/webhooks/razorpay` |
| Stripe | `https://angelika-fashions.pages.dev/api/webhooks/stripe` | `https://angelikafashions.com/api/webhooks/stripe` |
| Delhivery | `https://angelika-fashions.pages.dev/api/webhooks/delhivery` | `https://angelikafashions.com/api/webhooks/delhivery` |
| WhatsApp | `https://angelika-fashions.pages.dev/api/webhooks/whatsapp` | `https://angelikafashions.com/api/webhooks/whatsapp` |

### Verify Supabase Auth Redirect URLs

In **Supabase Dashboard → Authentication → URL Configuration**:

- **Site URL:** `https://angelikafashions.com`
- **Redirect URLs:** add `https://angelikafashions.com/**` and `https://www.angelikafashions.com/**`
- Remove old Vercel URL: `https://angelika-fashions.vercel.app/**`

### Monitor Supabase Realtime

Check the Supabase Realtime channels are still connecting from the new domain:
- Open browser DevTools → Network → filter WS
- Confirm WebSocket connection to `wss://xxxx.supabase.co/realtime/v1/websocket` establishes successfully

---

## Phase 8 — Post-Cutover Monitoring (24 Hours)

| Metric | Where to Check | Expected |
|---|---|---|
| Request error rate | Cloudflare Analytics → Overview | < 1% 5xx errors |
| Cache hit ratio | Cloudflare Analytics → Caching | > 70% for product pages |
| SSL certificate status | Cloudflare SSL/TLS → Edge Certs | Active, valid |
| Webhook delivery | Razorpay/Stripe/Delhivery dashboards | 100% delivered |
| Email delivery | Resend dashboard | No bounce spikes |
| Supabase connections | Supabase Dashboard → Database | Below pool limit (60 on Pro) |
| Auth login flow | Manual test | Works end-to-end |

---

## Rollback Plan

> [!CAUTION]
> Execute rollback only if the production deployment has critical failures that cannot be hot-fixed within 30 minutes.

**Rollback steps (estimated recovery time: 5–60 minutes depending on DNS TTL):**

1. Log in to your **domain registrar**
2. Change nameservers back to the **original nameservers** (you recorded these in the pre-cutover checklist)
3. Vercel will begin serving traffic again as DNS propagates back (Vercel's last deployment remains live)
4. TTL is 60 seconds (set in Phase 1), so most resolvers will pick up the change within 1–2 minutes
5. Revert webhook URLs back to original Vercel URLs in all provider dashboards
6. Revert Supabase Auth redirect URLs back to Vercel URLs
7. Notify team — investigate root cause before reattempting cutover

**What Vercel does during rollback:**
- Vercel caches your last successful deployment indefinitely until you delete it
- Your Vercel project is not affected by the Cloudflare deployment
- Do NOT delete the Vercel project until you are 100% stable on Cloudflare (minimum 72 hours)

---

## DNS Record Reference

After full cutover, your Cloudflare DNS should contain exactly:

| Type | Name | Value | Proxy | TTL |
|---|---|---|---|---|
| CNAME | `@` (apex) | `angelika-fashions.pages.dev` | Proxied ☁️ | Auto |
| CNAME | `www` | `angelika-fashions.pages.dev` | Proxied ☁️ | Auto |
| MX | `@` | _(your existing mail MX records)_ | DNS-only | 3600 |
| TXT | `@` | SPF record (existing) | DNS-only | 3600 |
| TXT | `_dmarc` | DMARC record (existing) | DNS-only | 3600 |
