# Performance Targets — Angelika Fashions on Cloudflare

> [!NOTE]
> This document defines the caching strategy, expected performance characteristics, honest feasibility analysis for 10K RPS, and benchmarks to run post-deployment.

---

## Caching Strategy by Route

| Route | Cache Strategy | TTL (Revalidation) | Cache Location | Expected Cache Hit Ratio |
|---|---|---|---|---|
| `/` (homepage) | ISR (Incremental Static Regeneration) | 60 seconds | Cloudflare CDN edge | **85–95%** (high traffic, low churn) |
| `/products` | ISR | 300 seconds (5 min) | Cloudflare CDN edge | **80–90%** |
| `/products/[slug]` | ISR | 300 seconds (5 min) | Cloudflare CDN edge | **75–90%** (popular SKUs cached more) |
| `/categories/[slug]` | ISR | 300 seconds (5 min) | Cloudflare CDN edge | **80–90%** |
| `/_next/static/**` | Immutable static | 1 year (content hash) | Cloudflare CDN edge | **99%+** |
| `/public/**` (images, icons) | Static | 24 hours | Cloudflare CDN edge | **90–99%** |
| `/cart` | Dynamic (SSR) | No cache | Worker only | **0%** (intentional) |
| `/checkout` | Dynamic (SSR) | No cache | Worker only | **0%** (intentional) |
| `/account/**` | Dynamic (SSR) | No cache | Worker only | **0%** (intentional) |
| `/admin/**` | Dynamic (SSR) | No cache | Worker only | **0%** (intentional) |
| `/api/**` | Dynamic | No cache | Worker only | **0%** (intentional) |
| `/api/webhooks/**` | Dynamic | No cache | Worker only | **0%** (intentional) |

### Cache Implementation Notes

For ISR to work correctly with `@cloudflare/next-on-pages`, routes must include:

```typescript
// In each ISR page component or layout:
export const revalidate = 300; // seconds (or 60 for homepage)

// Or via fetch cache options in Server Components:
const data = await fetch(url, {
  next: { revalidate: 300 }
});
```

The Cloudflare CDN respects `Cache-Control: s-maxage=300, stale-while-revalidate` headers emitted by the Worker.

---

## Expected Performance Improvements vs. Vercel

| Metric | Current (Vercel) | Expected (Cloudflare) | Basis |
|---|---|---|---|
| **Cold start latency** | 200–500ms (hobby/pro serverless) | ~0ms (V8 isolates — no cold start) | Cloudflare Workers architecture |
| **Time to First Byte (TTFB) — cached pages** | 50–150ms | 20–50ms | Edge PoPs closer to users |
| **TTFB — dynamic pages** | 100–300ms | 80–200ms | Supabase latency dominates; minor improvement |
| **DB queries eliminated (ISR)** | 100% of requests hit DB | 10–25% of requests hit DB (cache absorbs rest) | **40–60% reduction in Supabase DB load** |
| **Global edge PoPs** | ~16 Vercel regions | 300+ Cloudflare PoPs | Cloudflare network footprint |
| **Bandwidth cost** | Metered after free tier | Unlimited on all Pages tiers | Cloudflare pricing model |
| **Worker memory limit** | 1GB (Vercel function) | 128MB (Cloudflare Worker) | Smaller but sufficient for Next.js routes |

> [!IMPORTANT]
> The **40–60% reduction in Supabase DB queries** is the most significant performance benefit. Product pages and the homepage will be served from Cloudflare's CDN cache for the duration of the ISR TTL, with the Worker only fetching fresh data once per 5-minute window (per edge PoP) instead of on every request.

---

## 10K RPS Feasibility Analysis

This is an **honest, workload-specific** analysis. "10K RPS" is not a single number — it depends entirely on what type of requests those are.

### Scenario A: Static Assets (`/_next/static/**`, images)

**10K RPS: ✅ Easily achievable on free tier**

- Served 100% from Cloudflare's CDN edge cache
- No Worker invocations
- No Supabase connections
- Cloudflare CDN has effectively unlimited throughput
- Cost: $0 additional

### Scenario B: Cached Product/Homepage Pages (ISR)

**10K RPS: ✅ Achievable on Workers Paid ($5/month)**

- After first request per edge PoP, response is cached
- Cache hit ratio of 80–90% means only 1,000–2,000 req/s reach the Worker
- Workers Paid handles **10M requests/day** (~115 req/s sustained, peak much higher)
- Supabase DB sees dramatically reduced load from ISR
- **Bottleneck**: Worker CPU time per request, not Supabase connections

### Scenario C: Dynamic Pages (Cart, Account, Admin)

**10K RPS: ⚠️ Partially achievable — Supabase is the bottleneck**

- Every request hits the Worker **and** Supabase
- Supabase Pro provides **60 connections** via PgBouncer
- At 60 connections × (assume 20ms avg query time): theoretical max ≈ 3,000 req/s
- **10K req/s simultaneously against dynamic DB-backed routes is not achievable on Supabase Pro**
- Realistic safe throughput: **500–1,500 dynamic req/s** before latency degrades

### Scenario D: Checkout / Payment Initiation

**10K RPS checkout simultaneously: ❌ Not achievable on any free or Pro tier**

| Layer | Limit at 10K checkout RPS |
|---|---|
| Cloudflare Workers | ✅ Handles it (10M req/day paid plan) |
| Supabase connections | ❌ 60 connections × fast queries ≈ ~3K req/s max |
| Razorpay API | ❌ Razorpay rate limits payment creation APIs |
| Stripe API | ❌ Stripe rate limits by account tier |
| **Verdict** | **Not achievable. Requires Supabase Team ($599/mo) + horizontal scaling** |

### What 10K RPS Actually Requires (If Needed)

| Component | Required Upgrade | Cost |
|---|---|---|
| Cloudflare Workers | Workers Paid | $5/month |
| Supabase | Team plan | $599/month |
| Supabase connections | PgBouncer → Supavisor + read replicas | +$50–$200/month |
| Razorpay | Enterprise tier with higher rate limits | Custom |
| **Total** | | **$650+/month** |

> [!TIP]
> For Angelika Fashions at current scale, the realistic concurrent checkout RPS is well under 100. Focus on the ISR caching improvements (Scenario B) for the biggest practical win. Revisit Supabase scaling only when Supabase Dashboard shows connection pool saturation.

---

## Post-Deployment Benchmarks

### 1. Lighthouse (Page Quality)

Run after DNS cutover with production domain:

```bash
# Install Lighthouse CLI
npm install -g lighthouse

# Run for key pages
lighthouse https://angelikafashions.com --output=html --output-path=./lighthouse-homepage.html
lighthouse https://angelikafashions.com/products --output=html --output-path=./lighthouse-products.html
lighthouse https://angelikafashions.com/checkout --output=html --output-path=./lighthouse-checkout.html
```

**Target scores:**

| Page | Performance | Accessibility | Best Practices | SEO |
|---|---|---|---|---|
| Homepage | ≥ 90 | ≥ 95 | ≥ 90 | ≥ 95 |
| Product page | ≥ 85 | ≥ 95 | ≥ 90 | ≥ 95 |
| Checkout | ≥ 75 | ≥ 90 | ≥ 90 | ≥ 85 |

### 2. k6 Load Test

Install k6 and run a staged load test before launch:

```bash
# Install k6
winget install k6 --source winget
# or: choco install k6

# Run load test against *.pages.dev (not production)
k6 run load-test.js
```

Create `load-test.js`:

```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 50 },   // Ramp up to 50 users
    { duration: '3m', target: 100 },  // Hold at 100 users
    { duration: '1m', target: 200 },  // Peak load
    { duration: '1m', target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],  // 95% of requests under 500ms
    http_req_failed: ['rate<0.01'],    // Error rate under 1%
  },
};

export default function () {
  // Test product listing (ISR — should be fast)
  const products = http.get('https://angelika-fashions.pages.dev/products');
  check(products, {
    'products page 200': (r) => r.status === 200,
    'products TTFB < 300ms': (r) => r.timings.waiting < 300,
  });

  sleep(1);

  // Test homepage (ISR)
  const home = http.get('https://angelika-fashions.pages.dev/');
  check(home, {
    'homepage 200': (r) => r.status === 200,
    'homepage TTFB < 200ms': (r) => r.timings.waiting < 200,
  });

  sleep(2);
}
```

**Expected k6 results (cached pages at 100 VUs):**
- p50 TTFB: < 100ms
- p95 TTFB: < 300ms
- Error rate: < 0.1%

### 3. Cloudflare Analytics (Ongoing)

Monitor these metrics daily for the first week post-launch:

| Metric | Location in Dashboard | Target |
|---|---|---|
| Cache hit ratio | Analytics → Caching | > 70% overall |
| Worker error rate | Workers & Pages → your project → Metrics | < 0.5% |
| Total requests/day | Analytics → Traffic | Baseline for growth tracking |
| Unique visitors | Analytics → Traffic | Baseline |
| Top 10 cached URLs | Analytics → Caching → Cached content | Verify product pages are top-cached |
| WAF blocked requests | Security → Events | Review any blocks for false positives |
| Bandwidth served | Analytics → Traffic | Confirm no bandwidth billing (should be $0) |

### 4. Supabase Dashboard (Ongoing)

| Metric | Location | Action Trigger |
|---|---|---|
| Active connections | Database → Connection pool | Alert if > 50 (of 60 on Pro) |
| Slow queries | Database → Query Performance | Investigate any query > 100ms |
| Auth errors | Auth → Logs | Investigate 401/403 spikes |
| Storage usage | Storage → Overview | Upgrade if approaching 100GB |
| Edge Function invocations | Functions → generate-invoice | Track invoice generation errors |

---

## Performance Optimization Roadmap

### Phase 1 (Launch — Week 1)
- [ ] Verify ISR is working via `cf-cache-status: HIT` headers
- [ ] Run Lighthouse on all 3 key pages; fix any score < 75
- [ ] Run k6 at 100 VU; confirm p95 < 500ms

### Phase 2 (Month 1)
- [ ] Analyze Cloudflare Cache hit ratio — tune ISR TTLs if hit ratio < 60%
- [ ] Review Supabase slow query log — add indexes if needed
- [ ] Add Cloudflare Image Resizing if `unoptimized: true` causes large image payloads

### Phase 3 (Growth — if traffic spikes)
- [ ] Enable Cloudflare R2 for Supabase Storage offload (reduces Supabase egress costs)
- [ ] Upgrade Supabase to Team plan if connections regularly exceed 50
- [ ] Consider Cloudflare Cache Rules for fine-grained ISR TTL control per route pattern
