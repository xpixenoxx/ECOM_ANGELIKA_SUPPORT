---
name: deployment-flow
description: "Complete deployment pipeline: GitHub → Vercel → GoDaddy + Supabase"
metadata: 
  node_type: memory
  type: project
  originSessionId: 02c5ce66-d700-4b99-99d4-849096e268e2
---

# Angelika Fashions - Deployment Flow

## Architecture Overview

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Developer  │────▶│   GitHub    │────▶│   Vercel    │────▶│  GoDaddy    │
│  (Local)    │     │  (Source)   │     │  (Edge)     │     │  (Domain)   │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
                           │                    │
                           ▼                    ▼
                    ┌─────────────┐     ┌─────────────┐
                    │  Supabase   │     │  Monitoring │
                    │  (Backend)  │     │  (Sentry,   │
                    │             │     │   Vercel    │
                    └─────────────┘     └─────────────┘
```

---

## 1. Local Development Setup

### Prerequisites
```bash
# Required tools
node >= 20.0.0
npm >= 10.5.0
git >= 2.40
vercel cli >= 33.0
supabase cli >= 1.167

# Verify
node --version && npm --version && git --version
vercel --version
supabase --version
```

### Environment Files
```bash
# .env.local (NEVER commit)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Payments
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...
RAZORPAY_WEBHOOK_SECRET=...

# WhatsApp
WHATSAPP_PHONE_NUMBER_ID=...
WHATSAPP_ACCESS_TOKEN=...
WHATSAPP_WEBHOOK_VERIFY_TOKEN=angelika_verify_2024
WHATSAPP_APP_ID=...
WHATSAPP_APP_SECRET=...

# Email
SENDGRID_API_KEY=SG...
# OR Nodemailer
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=vidhya@angelikafashions.com
SMTP_PASSWORD=...
EMAIL_FROM=vidhya@angelikafashions.com
EMAIL_FROM_NAME="Vidhya @ Angelika Fashions"

# Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=...

# Monitoring
SENTRY_DSN=https://xxx@sentry.io/xxx
NEXT_PUBLIC_SENTRY_DSN=https://xxx@sentry.io/xxx

# Feature Flags
NEXT_PUBLIC_ENABLE_VIRTUAL_TRYON=false
NEXT_PUBLIC_ENABLE_STYLIST_CHAT=false
```

### Supabase Local Development
```bash
# Start local Supabase
supabase start

# Apply migrations
supabase db reset

# Generate types
npm run db:generate

# Seed data (optional)
supabase db seed

# Studio UI
supabase studio  # Opens http://localhost:54323
```

### Vercel Link (One-time)
```bash
vercel login
vercel link  # Select scope, project name: angelika-fashions
```

---

## 2. GitHub Repository Setup

### Branch Strategy
```
main                    ──▶ Production (auto-deploy)
├── develop             ──▶ Staging (auto-deploy to preview)
├── feature/*           ──▶ Feature branches
├── fix/*               ──▶ Bug fixes
├── release/*           ──▶ Release preparation
└── hotfix/*            ──▶ Emergency production fixes
```

### Branch Protection Rules (GitHub Settings)
```
main:
  - Require PR reviews (2)
  - Require status checks: typecheck, lint, test, build, e2e
  - Require linear history
  - Include administrators
  - Restrict pushes

develop:
  - Require PR reviews (1)
  - Require status checks: typecheck, lint, test, build
```

### Repository Secrets (GitHub Settings → Secrets → Actions)
```
VERCEL_TOKEN                # Vercel access token
VERCEL_ORG_ID               # Organization ID
VERCEL_PROJECT_ID           # Project ID
SUPABASE_ACCESS_TOKEN       # Supabase CLI token
SUPABASE_DB_PASSWORD        # Database password
SUPABASE_PROJECT_REF        # Project reference (xxx.supabase.co)
CODECOV_TOKEN               # Code coverage
SENTRY_AUTH_TOKEN           # Sentry release tracking
SLACK_WEBHOOK_URL           # Deployment notifications
```

---

## 3. CI/CD Pipeline (GitHub Actions)

### Workflow Files Structure
```
.github/workflows/
├── ci.yml                    # PR validation
├── deploy-preview.yml        # Deploy preview on PR
├── deploy-staging.yml        # Deploy staging on develop push
├── deploy-production.yml     # Deploy production on main push
├── deploy-supabase.yml       # Deploy Supabase migrations
├── release.yml               # Create release + changelog
└── security.yml              # Dependency audit + SAST
```

### ci.yml (Every PR)
```yaml
name: CI
on: [pull_request]
jobs:
  typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'npm' }
      - run: npm ci
      - run: npm run type-check
  
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'npm' }
      - run: npm ci
      - run: npm run lint
  
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'npm' }
      - run: npm ci
      - run: npm run test -- --coverage
      - uses: codecov/codecov-action@v3
  
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'npm' }
      - run: npm ci
      - run: npm run build
      - run: npx playwright install --with-deps chromium
      - run: npm run e2e
  
  build:
    runs-on: ubuntu-latest
    needs: [typecheck, lint]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'npm' }
      - run: npm ci
      - run: npm run build
  
  analyze:
    runs-on: ubuntu-latest
    needs: build
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'npm' }
      - run: npm ci
      - run: ANALYZE=true npm run build
      - name: Check bundle size
        run: |
          BUNDLE_SIZE=$(cat .next/analyze/client.html | grep -oP 'First Load JS shared by all\s+\K[\d.]+')
          if (( $(echo "$BUNDLE_SIZE > 170" | bc -l) )); then
            echo "Bundle size ${BUNDLE_SIZE}kb exceeds 170kb limit"
            exit 1
          fi
  
  storybook:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'npm' }
      - run: npm ci
      - run: npm run build:storybook
  
  chromatic:
    runs-on: ubuntu-latest
    needs: storybook
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'npm' }
      - run: npm ci
      - uses: chromaui/action@v1
        with:
          projectToken: ${{ secrets.CHROMATIC_PROJECT_TOKEN }}
          buildScriptName: build:storybook
          exitOnceUploaded: true
```

### deploy-preview.yml (PR Merged/Updated)
```yaml
name: Deploy Preview
on:
  pull_request:
    types: [opened, synchronize, reopened, ready_for_review]
jobs:
  deploy:
    runs-on: ubuntu-latest
    if: github.event.pull_request.draft == false
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'npm' }
      - run: npm ci
      - run: npm run build
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod=false'
        env:
          # All env vars from GitHub Secrets
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
          # ... all other env vars
      - name: Comment PR with preview URL
        uses: actions/github-script@v7
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: '🚀 Preview deployed: ${{ steps.deploy.outputs.preview-url }}'
            })
```

### deploy-staging.yml (Develop Branch)
```yaml
name: Deploy Staging
on:
  push:
    branches: [develop]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'npm' }
      - run: npm ci
      - run: npm run build
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod=false --alias=staging-angelika-fashions.vercel.app'
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL_STAGING }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY_STAGING }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY_STAGING }}
          NEXT_PUBLIC_SITE_URL: https://staging-angelika-fashions.vercel.app
          # ... staging env vars
      - name: Notify Slack
        uses: slackapi/slack-github-action@v1.23.0
        with:
          payload: |
            {
              "text": "🚀 Staging deployed: https://staging-angelika-fashions.vercel.app",
              "blocks": [...]
            }
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```

### deploy-production.yml (Main Branch)
```yaml
name: Deploy Production
on:
  push:
    branches: [main]
  workflow_dispatch:  # Manual trigger
jobs:
  pre-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Create Release
        uses: actions/github-script@v7
        with:
          script: |
            const { data: release } = await github.rest.repos.createRelease({
              owner: context.repo.owner,
              repo: context.repo.repo,
              tag_name: `v${new Date().toISOString().split('T')[0]}.${Math.floor(Math.random()*100)}`,
              name: `Release ${new Date().toLocaleDateString()}`,
              body: 'Automated release',
              draft: false,
              prerelease: false
            })
            core.setOutput('release_url', release.html_url)
  
  deploy:
    needs: pre-deploy
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'npm' }
      - run: npm ci
      - run: npm run build
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod=true'
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL_PROD }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY_PROD }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY_PROD }}
          NEXT_PUBLIC_SITE_URL: https://angelikafashions.com
          # ... all production env vars
      - name: Smoke Tests
        run: |
          npx playwright install --with-deps chromium
          npx playwright test --project=smoke --base-url=https://angelikafashions.com
      - name: Notify Slack
        uses: slackapi/slack-github-action@v1.23.0
        with:
          payload: |
            {
              "text": "✅ Production deployed: https://angelikafashions.com",
              "blocks": [...]
            }
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
      - name: Create Sentry Release
        uses: getsentry/action-release@v1
        env:
          SENTRY_AUTH_TOKEN: ${{ secrets.SENTRY_AUTH_TOKEN }}
          SENTRY_ORG: angelika-fashions
          SENTRY_PROJECT: angelika-fashions
        with:
          version: ${{ github.sha }}
          environment: production
```

### deploy-supabase.yml (Database Migrations)
```yaml
name: Deploy Supabase
on:
  push:
    paths:
      - 'supabase/migrations/**'
  workflow_dispatch:
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: supabase/setup-cli@v1
      - run: supabase link --project-ref ${{ secrets.SUPABASE_PROJECT_REF }}
      - run: supabase db push
      - run: supabase gen types typescript --project-ref ${{ secrets.SUPABASE_PROJECT_REF }} > types/database.ts
      - name: Commit Types
        run: |
          git config user.name "github-actions"
          git config user.email "actions@github.com"
          git add types/database.ts
          git commit -m "chore: update database types [skip ci]" || true
          git push || true
```

---

## 4. Vercel Configuration

### Project Settings (Dashboard)
```
Project Name: angelika-fashions
Framework: Next.js
Root Directory: ./
Build Command: npm run build
Output Directory: .next
Install Command: npm ci
Development Command: npm run dev

Environment Variables (Production):
  NEXT_PUBLIC_SUPABASE_URL           @supabase-prod-url
  NEXT_PUBLIC_SUPABASE_ANON_KEY      @supabase-prod-anon
  SUPABASE_SERVICE_ROLE_KEY          @supabase-prod-service
  NEXT_PUBLIC_SITE_URL               https://angelikafashions.com
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY @stripe-prod-pub
  STRIPE_SECRET_KEY                  @stripe-prod-secret
  STRIPE_WEBHOOK_SECRET              @stripe-prod-webhook
  RAZORPAY_KEY_ID                    @razorpay-prod-id
  RAZORPAY_KEY_SECRET                @razorpay-prod-secret
  RAZORPAY_WEBHOOK_SECRET            @razorpay-prod-webhook
  WHATSAPP_PHONE_NUMBER_ID           @whatsapp-prod-phone
  WHATSAPP_ACCESS_TOKEN              @whatsapp-prod-token
  WHATSAPP_WEBHOOK_VERIFY_TOKEN      @whatsapp-verify
  WHATSAPP_APP_ID                    @whatsapp-app-id
  WHATSAPP_APP_SECRET                @whatsapp-app-secret
  SENDGRID_API_KEY                   @sendgrid-prod
  NEXT_PUBLIC_GOOGLE_MAPS_API_KEY    @google-maps-prod
  SENTRY_DSN                         @sentry-prod-dsn
  NEXT_PUBLIC_SENTRY_DSN             @sentry-prod-dsn

Environment Variables (Preview/Staging):
  # Same keys, staging values
  NEXT_PUBLIC_SITE_URL               https://staging-angelika-fashions.vercel.app
  # ... staging credentials

Domains:
  Production:   angelikafashions.com (Primary) + www.angelikafashions.com
  Staging:      staging-angelika-fashions.vercel.app
  Preview:      *.vercel.app (auto)

Edge Functions:
  - middleware.ts (auth, geo, rate-limit)
  - api/cron/* (scheduled jobs)
  - api/revalidate (ISR)

Cache:
  - Static: 1 year (immutable)
  - ISR: 60s (revalidate on content change)
  - API: No cache (dynamic)
  - Images: 1 year (AVIF/WebP)

Headers:
  - Configured in next.config.mjs (security, caching)

Rewrites:
  - /sitemap.xml → /api/sitemap
  - /robots.txt → /api/robots
  - /admin/* → /(admin)/*
```

### Vercel CLI Commands
```bash
# Deploy preview
vercel --token=$VERCEL_TOKEN

# Deploy production
vercel --prod --token=$VERCEL_TOKEN

# List deployments
vercel list --token=$VERCEL_TOKEN

# Rollback
vercel rollback [deployment-url] --token=$VERCEL_TOKEN

# Environment variables
vercel env add KEY production
vercel env ls
vercel env pull .env.production.local

# Logs
vercel logs [deployment-url] --token=$VERCEL_TOKEN

# Inspect
vercel inspect [deployment-url] --token=$VERCEL_TOKEN
```

---

## 5. Supabase Configuration

### Project Setup
```
Project Name: angelika-fashions
Region: Mumbai (ap-south-1) — closest to users
Plan: Pro (for production) / Free (staging)

Database:
  - Postgres 15+
  - pgvector extension (for semantic search)
  - pg_cron extension (scheduled jobs)
  - pg_net extension (HTTP requests from DB)
  - Connection pooling: PgBouncer (transaction mode)

Auth:
  - Providers: Email, Phone, Google, GitHub, Facebook
  - Email templates: Custom (brand colors, Vidhya's voice)
  - MFA: TOTP enabled
  - Session: 1hr access, 30d refresh
  - Rate limits: 10 req/15min (auth), 100 req/min (API)

Storage:
  Buckets:
    - product-images (public, 10MB limit, AVIF/WebP)
    - editorial-images (public, 5MB)
    - user-uploads (private, 5MB, reviews, returns)
    - design-assets (public, 2MB, fonts, logos)
  CDN: Enabled
  Transformations: Enabled (Sharp)

Realtime:
  - Enabled for: carts, orders, whatsapp_conversations, inventory
  - Max connections: 1000 (scale as needed)

Edge Functions:
  - auth-webhook (user.created → create profile)
  - order-webhook (payment → update order)
  - inventory-webhook (low stock → alert)
  - loyalty-webhook (purchase → points)

Cron Jobs (pg_cron):
  - Daily 02:00: Aggregate analytics
  - Daily 03:00: Low stock alerts
  - Weekly Mon 04:00: Loyalty points expiry
  - Daily 05:00: Sitemap generation
  - Hourly: Abandoned cart recovery
```

### Supabase CLI Commands
```bash
# Link project
supabase link --project-ref xxx

# Push migrations
supabase db push

# Pull schema (if manual changes in dashboard)
supabase db pull

# Generate types
supabase gen types typescript --project-ref xxx > types/database.ts

# Deploy edge functions
supabase functions deploy auth-webhook
supabase functions deploy order-webhook

# View logs
supabase functions logs auth-webhook --project-ref xxx

# Database diff
supabase db diff --schema public

# Seed data
supabase db seed

# Backup (manual)
supabase db dump --schema public -f backup.sql
```

---

## 6. GoDaddy Domain Configuration

### Domain Setup
```
Primary Domain: angelikafashions.com
Subdomain: www.angelikafashions.com

DNS Records (GoDaddy DNS Management):
Type    Name    Value                                   TTL
A       @       76.76.21.21                             600   # Vercel IP
CNAME   www     cname.vercel-dns.com                    600
TXT     @       vercel-verification-code=xxx            3600  # Vercel verification
MX      @       mail.angelikafashions.com               3600  # Email (if using custom)
TXT     @       v=spf1 include:_spf.google.com ~all     3600  # SPF
TXT     _dmarc  v=DMARC1; p=quarantine; rua=mailto:dmarc@angelikafashions.com 3600
```

### SSL/TLS
- **Vercel**: Automatic Let's Encrypt certificates (managed)
- **HSTS**: Enforced via middleware headers
- **Certificate Transparency**: Monitored via Vercel

### Email (Optional - if not using Google Workspace)
```
GoDaddy Email / Microsoft 365 / Google Workspace
- vidhya@angelikafashions.com
- orders@angelikafashions.com
- support@angelikafashions.com
- marketing@angelikafashions.com
- noreply@angelikafashions.com
```

---

## 7. Monitoring & Alerting

### Vercel Analytics + Speed Insights
- **Enabled**: Project Settings → Analytics
- **Custom Events**: Track via `va.track('event_name', { props })`
- **Dashboards**: Vercel Dashboard → Analytics

### Sentry (Error Tracking)
```bash
# Install
npm install @sentry/nextjs

# Config (sentry.client.config.ts, sentry.server.config.ts, sentry.edge.config.ts)
# DSN in env vars

# Source Maps: Auto-uploaded on Vercel deploy
# Release tracking: GitHub Action creates release
```

### Uptime Monitoring (UptimeRobot / Better Uptime)
```
Monitors:
- https://angelikafashions.com (HTTP, 1 min)
- https://angelikafashions.com/api/health (HTTP, 5 min)
- https://api.angelikafashions.com (if separate API)
Alerts: Email + Slack + SMS (critical)
```

### Supabase Monitoring
- **Dashboard**: Database → Reports → Performance
- **Alerts**: Database → Settings → Alerts
  - CPU > 80% for 5min
  - Connections > 80% of limit
  - Storage > 80% of limit
  - Replication lag > 10s

### Custom Business Alerts (Supabase Edge Functions + Slack)
```typescript
// supabase/functions/alerts/index.ts
export default async function handler() {
  const alerts = []
  
  // Low stock
  const { data: lowStock } = await supabase
    .from('product_variants')
    .select('*, products(name)')
    .lte('inventory_quantity', 'low_stock_threshold')
  
  if (lowStock.length > 0) {
    alerts.push({ type: 'low_stock', count: lowStock.length, items: lowStock })
  }
  
  // Pending orders > 24h
  const { data: stuckOrders } = await supabase
    .from('orders')
    .select('id, order_number, created_at')
    .eq('status', 'pending')
    .lt('created_at', new Date(Date.now() - 24*60*60*1000).toISOString())
  
  if (stuckOrders.length > 0) {
    alerts.push({ type: 'stuck_orders', count: stuckOrders.length })
  }
  
  // Send to Slack
  if (alerts.length > 0) {
    await fetch(process.env.SLACK_WEBHOOK_URL!, {
      method: 'POST',
      body: JSON.stringify({ blocks: formatAlerts(alerts) })
    })
  }
}
```

---

## 8. Rollback Procedures

### Vercel Rollback (Instant)
```bash
# List recent deployments
vercel list --token=$VERCEL_TOKEN

# Rollback to specific deployment
vercel rollback https://angelika-fashions-xxx.vercel.app --token=$VERCEL_TOKEN

# Or via Dashboard: Deployments → ••• → Promote to Production
```

### Database Rollback (Supabase)
```bash
# Option 1: Point-in-time recovery (Dashboard → Database → Backups → Restore)
# Option 2: Migration down (if reversible)
supabase migration down --project-ref xxx

# Option 3: Manual SQL (last resort)
# Run down migration SQL in Supabase SQL Editor
```

### Feature Flags (Instant Kill Switch)
```typescript
// lib/flags.ts (Vercel Edge Config or Upstash Redis)
export const flags = {
  virtualTryOn: false,
  stylistChat: false,
  whatsappCheckout: false,
  newCheckout: true,
  sizeFinderV2: true,
}

// Usage
if (flags.virtualTryOn) {
  // Render VirtualTryOn component
}
```

---

## 9. Checklist: Pre-Launch (Production Go-Live)

### Code Quality
- [ ] `npm run type-check` — 0 errors
- [ ] `npm run lint` — 0 warnings
- [ ] `npm run test` — >80% coverage, all pass
- [ ] `npm run e2e` — 5 critical flows pass
- [ ] `npm run build` — Successful, bundle <170kb
- [ ] `npm run analyze` — No unexpected chunks
- [ ] Storybook — All components documented, Chromatic baseline
- [ ] Accessibility — axe-core CI passes, manual audit done

### Infrastructure
- [ ] Vercel project linked, domains configured
- [ ] Supabase project: Pro plan, Mumbai region, extensions enabled
- [ ] Environment variables: All set in Vercel (prod + staging)
- [ ] GitHub secrets: All configured for CI/CD
- [ ] Sentry project: DSN configured, source maps uploading
- [ ] Uptime monitors: Created, alerts configured
- [ ] Slack/Discord webhooks: Working

### Payments
- [ ] Razorpay: Live keys, webhook URL configured (https://angelikafashions.com/api/webhooks/razorpay)
- [ ] Stripe: Live keys, webhook URL configured
- [ ] Test transactions: COD, UPI, Card, Wallet — all successful
- [ ] Refund flow: Tested end-to-end
- [ ] Webhook signatures: Verified

### WhatsApp
- [ ] WABA approved (Meta Business Manager)
- [ ] Templates approved: order_confirmed, shipped, delivered, cancelled
- [ ] Flows published: Product Browse, Checkout, Size Finder
- [ ] Webhook URL configured (https://angelikafashions.com/api/webhooks/whatsapp)
- [ ] Test messages: Sent/received successfully

### Email
- [ ] SendGrid/SMTP: Verified sender, templates tested
- [ ] Transactional emails: Order, shipping, delivery, cancel, return
- [ ] Marketing emails: Welcome, abandoned cart, review request, loyalty
- [ ] Unsubscribe: Working, list management

### SEO & Analytics
- [ ] Sitemap.xml accessible (/api/sitemap)
- [ ] Robots.txt accessible (/api/robots)
- [ ] Structured data: Product, Organization, Breadcrumb, FAQ validated
- [ ] Google Search Console: Property added, sitemap submitted
- [ ] Google Analytics 4: Connected, enhanced ecommerce
- [ ] Meta Pixel / Google Ads: Events firing (Purchase, AddToCart, etc.)

### Security
- [ ] CSP headers: Strict, no unsafe-inline in production
- [ ] Rate limiting: Auth, API, checkout endpoints protected
- [ ] Input validation: All server actions use Zod schemas
- [ ] RLS policies: All tables have appropriate policies
- [ ] Secrets: No secrets in code, all in env vars
- [ ] Dependency audit: `npm audit` — 0 high/critical

### Content & Commerce
- [ ] Products: All live products have images, variants, inventory
- [ ] Categories: Hierarchy correct, slugs unique
- [ ] Coupons: Test codes work, limits enforced
- [ ] Shipping: Zones configured, pincode serviceability accurate
- [ ] Returns: Policy published, flow tested
- [ ] Legal: Privacy policy, terms, return policy, GST info pages live

### Performance
- [ ] Lighthouse CI: Performance >90, A11y >95, SEO >90
- [ ] Core Web Vitals: LCP <1.8s, INP <200ms, CLS <0.1
- [ ] Images: AVIF/WebP, responsive, LQIP, lazy-loaded
- [ ] Fonts: Preloaded, display=swap, subsetted
- [ ] Third-party: Minimal, async/deferred

---

## 10. Post-Launch (First 48 Hours)

### Hour 0-1
- [ ] Monitor Vercel logs for errors
- [ ] Monitor Sentry for exceptions
- [ ] Verify orders flowing through (test purchase)
- [ ] Verify WhatsApp notifications sending
- [ ] Verify email notifications sending

### Hour 1-6
- [ ] Check Core Web Vitals in Vercel Analytics
- [ ] Monitor Supabase dashboard (CPU, connections, storage)
- [ ] Verify search indexing (Google Search Console)
- [ ] Respond to any customer inquiries
- [ ] Check payment success rates (Razorpay/Stripe dashboards)

### Hour 6-24
- [ ] Review analytics funnel (drop-off points)
- [ ] Check for any failed webhooks
- [ ] Monitor inventory sync (cart → order)
- [ ] Verify sitemap updated
- [ ] Social media launch posts live

### Day 2
- [ ] Full funnel analysis
- [ ] Customer feedback review
- [ ] Performance deep-dive
- [ ] Plan hotfixes if needed
- [ ] Celebrate! 🎉

---

## 11. Ongoing Operations

### Daily
- Vercel Analytics review
- Sentry error triage
- Order fulfillment status
- WhatsApp conversation review

### Weekly
- Supabase usage/billing review
- Dependency updates (`npm audit`, `npm outdated`)
- Performance budget check
- Content calendar review (Vidhya)

### Monthly
- Security audit (dependencies, headers, RLS)
- Database maintenance (vacuum, analyze, index review)
- Cohort analysis + business review
- Feature flag cleanup
- Backup verification

### Quarterly
- Penetration test (external)
- Accessibility audit
- Disaster recovery drill
- Capacity planning
- Architecture review