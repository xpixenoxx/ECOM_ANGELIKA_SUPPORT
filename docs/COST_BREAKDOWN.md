# Cost Breakdown — Angelika Fashions on Cloudflare

> [!NOTE]
> All prices are in USD as of 2024. Supabase pricing is in USD; Cloudflare pricing is in USD. Resend pricing is in USD. These are production-tier estimates — not theoretical maximums.

---

## Full Cost Table

| Component | Service | Free Tier Limits | Upgrade Trigger | Free | Paid (Monthly) |
|---|---|---|---|---|---|
| **Hosting** | Cloudflare Pages | 500 builds/month, unlimited bandwidth, unlimited requests | Exceeding 500 builds/month | $0 | $20/mo (Pro) |
| **Workers runtime** | Cloudflare Workers | 100,000 requests/day (across all Workers) | > 100K req/day | $0 | $5/mo (Paid plan — 10M req/day) |
| **Rate limiting store** | Workers KV | 100K reads/day, 1K writes/day, 1GB storage | Write-heavy rate limiting (> 1K writes/day) | Included in Workers Free | Included in Workers Paid |
| **DNS** | Cloudflare DNS | Unlimited queries, unlimited records | Never | $0 | $0 |
| **SSL/TLS** | Cloudflare Universal SSL | Unlimited, auto-renewed | Never (Advanced Cert = $10/mo for custom cipher) | $0 | $0 |
| **WAF** | Cloudflare WAF | Basic DDoS + bot protection, 5 custom rules | Advanced bot management, custom rule sets | $0 | $20/mo (Pro) |
| **Database** | Supabase PostgreSQL | 500MB storage, 2 CPU, no SLA, **pauses after 7 days inactivity** | Production use (SLA, no pausing, more connections) | $0 | $25/mo (Pro) |
| **Auth** | Supabase Auth | 50,000 MAU (Monthly Active Users) | > 50K users | Included | Included in Supabase plan |
| **Storage** | Supabase Storage | 1GB (Free) / 100GB (Pro) | > 1GB product images | $0 | Included in Supabase Pro |
| **Realtime** | Supabase Realtime | 500 concurrent connections (Free) / 10K (Pro) | > 500 concurrent users | $0 | Included in Supabase Pro |
| **Edge Functions** | Supabase Edge Functions | 500K invocations/month (Free) / 2M (Pro) | Invoice generation at scale | $0 | Included in Supabase Pro |
| **Transactional Email** | Resend | 100 emails/day, 3,000/month | > 100 emails/day (order confirmations) | $0 | $20/mo (Pro — 50K emails/month) |
| **Payments** | Razorpay | No monthly fee; 2% per transaction | N/A (per-transaction model) | $0 | Per transaction |
| **Payments (intl)** | Stripe | No monthly fee; 2.9% + 30¢ per transaction | N/A | $0 | Per transaction |
| **Shipping** | Delhivery | Per-shipment pricing (no SaaS fee) | N/A | $0 | Per shipment |
| **WhatsApp** | Meta Business API | 1,000 service conversations/month free | > 1,000 conversations | $0 | Per conversation (~$0.004–$0.011) |

---

## Minimum Viable Production Stack

> [!IMPORTANT]
> **Minimum viable production cost: $30/month**

| Why this is the minimum | Detail |
|---|---|
| Workers Paid ($5/mo) | Required because free tier's 100K req/day will be exceeded by any real traffic pattern + KV write limits too tight for rate limiting |
| Supabase Pro ($25/mo) | Required to prevent database pausing on inactivity, get SLA, and get PgBouncer connection pooling (60 connections vs 15 on Free) |
| Everything else | Remains on free tiers at typical early-stage traffic |

```
Workers Paid:   $5/month
Supabase Pro:   $25/month
─────────────────────────
Total:          $30/month
```

---

## Upgrade Triggers & Thresholds

### When to upgrade Cloudflare to Pro ($20/month)

Upgrade when you need any of the following:
- **> 5 custom WAF rules** (Free allows 5, Pro allows 20)
- **Advanced bot management** (credential stuffing protection)
- **Image optimization** via Cloudflare (Cloudflare Images add-on)
- **Page Rules** beyond 3 (Pro: 20)
- **Priority support** via ticket

### When to upgrade Resend ($20/month)

Upgrade when:
- Order volume exceeds ~80 orders/day (each order triggers at least 1 confirmation email, often 2–3 including shipping)
- Monthly send volume approaches 3,000 emails

### When Workers KV write limits bite (included in Workers Paid)

The rate limiter writes to KV on every rate-limited request window. At 1K free writes/day:
- If you have 1,000 unique users/day each triggering 1 write = at limit
- Workers Paid removes this concern (included in $5/mo plan)

### When Supabase Pro connection pooling matters

Supabase Free provides 15 direct connections. Supabase Pro via PgBouncer provides 60 pooled connections.

At 10K RPS peak, even Pro's 60 connections is a bottleneck for dynamic routes. See [PERFORMANCE_TARGETS.md](./PERFORMANCE_TARGETS.md) for the detailed analysis.

---

## Cost Projections by Traffic Tier

| Traffic Tier | Daily Requests | Workers Cost | Supabase Cost | Resend Cost | Total/Month |
|---|---|---|---|---|---|
| **Early stage** | < 100K req/day | $0 (free) | $0 (free, with risk) | $0 | **$0** (not recommended for production) |
| **Production minimum** | < 10M req/day | $5 (Paid) | $25 (Pro) | $0 | **$30** |
| **Growing store** | < 10M req/day | $5 | $25 | $20 (Resend Pro) | **$50** |
| **High traffic** | 10M–50M req/day | $5 | $25 | $20 | **$50** (Workers Paid covers 10M/day) |
| **Enterprise** | > 50M req/day | Custom | $599 (Team) | Custom | **$600+** |

> [!TIP]
> The economics of Cloudflare are fundamentally different from Vercel: Cloudflare charges per-request only on the free tier (capped at 100K/day). Workers Paid at $5/month gives you **10 million requests/day** — roughly 115 requests/second sustained, 24/7. For an e-commerce store, this is effectively unlimited for years of growth.

---

## Comparison vs. Vercel Equivalent

| Feature | Vercel Pro | Cloudflare (Recommended Stack) |
|---|---|---|
| Hosting | $20/month | $0 (Pages Free) |
| Serverless functions | Included (but metered) | $5/month (10M req/day) |
| Bandwidth | 1TB included, then metered | Unlimited |
| KV / Edge storage | Not included | Included in Workers Paid |
| WAF | Not included | Included (basic) |
| DNS | Not included (use external) | Included |
| **Total (hosting only)** | **$20/month** | **$5/month** |
| **Total (with Supabase Pro)** | **$45/month** | **$30/month** |
