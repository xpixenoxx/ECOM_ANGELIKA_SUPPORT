# Angelika Luxury Fashion E-Commerce (`Gemini.md`)

> **Atelier E-Commerce Architecture & Engineering Guide for Gemini & Antigravity Agents**  
> Storefront: `angelikafashions.com` | Primary Branch: `main`

---

## 1. Project Overview

**Angelika Fashions** is an artisanal Indian luxury haute couture and festive wear e-commerce web application. The platform offers curated collections of modal silk kurtis, pure mulberry silk sarees, bridal ensembles, and contemporary festive silhouettes with custom atelier concierge fitting.

### Core Architecture Pillars
- **Framework**: Next.js 14 (App Router) targeting **Cloudflare Workers** (Edge runtime) with `nodejs_compat`.
- **Database & Auth**: Supabase (PostgreSQL with Row Level Security, Supabase Auth, Storage buckets for media).
- **Payment Infrastructure**: Dual payment gateways (Razorpay + Cashfree) with tamper-proof HMAC-SHA256 webhook verification, paise/INR idempotency, and automated inventory reconciliation.
- **Styling**: Tailwind CSS with custom editorial luxury tokens (`#1A1A1A`, `#FAF8F5`, `#F3EFEA`, `#74590E`, `#C9A84C`), Cormorant Garamond typography, and fluid responsive viewports.

---

## 2. Directory Structure

```
├── app/
│   ├── (store)/                 # Public customer-facing luxury storefront
│   │   ├── page.tsx             # Curated homepage (Hero, Vidhya's Picks, Category Grid, Interactive Pin Lookbook)
│   │   ├── product/[slug]/      # Editorial Product Detail Page (PDP)
│   │   ├── shop/                # Catalog listing, sorting, and faceted filters
│   │   ├── cart/                # Slide-over & dedicated bag review
│   │   ├── wishlist/            # Customer wishlist collection
│   │   ├── checkout/            # Multi-step checkout with address validation & payment integration
│   │   └── size-finder/         # Interactive couture fit calculator
│   ├── (admin)/                 # Restricted administration portal
│   │   ├── login/               # Secure admin sign-in with role verification
│   │   ├── content/             # Visual homepage block CMS
│   │   ├── products/            # Inventory, variant matrix, & pricing manager
│   │   └── orders/              # Fulfillment status, tracking IDs, & refund actions
│   └── api/                     # Edge API routes & webhook handlers
├── components/
│   ├── ui/                      # Atoms & primitives (Buttons, Badges, Modals, Lightboxes)
│   └── composite/               # Complex widgets (ProductCard, Navbar, Footer, MegaMenu, SizeFinder)
├── lib/
│   ├── actions/                 # Next.js Server Actions (products, orders, reviews, payments)
│   ├── hooks/                   # Client state hooks (useCart, useWishlist, useAuth, useSizeFinder)
│   ├── supabase/                # Supabase clients (client, server, admin, edge helpers)
│   └── utils/                   # Sanitizers, rate limiters, formatters, and cn()
├── supabase/
│   └── migrations/              # Declarative PostgreSQL schema, tables, functions, & RLS policies
└── wrangler.toml                # Cloudflare Workers deployment and environment binding configuration
```

---

## 3. Product Detail Page (PDP) Design Specifications

The Product Detail Page is engineered to match premier luxury fashion editorial standards (reference: 2-column seamless lookbook gallery):

- **Editorial Photography Cards**:
  - Exact target dimensions: **`561.92px × 773.18px`** (`aspect-ratio: 561.92 / 773.18`).
  - Desktop: 2-column seamless grid (`xl:grid-cols-[561.92px_561.92px]`, total gallery width **`1123.84px`**).
  - First two images load with `priority={true}` and `fetchPriority="high"` (no lazy-loading) for optimal Core Web Vitals (LCP).
  - Hover zoom with native full-resolution `<dialog>` lightbox modal.
- **Sticky Minimal Right Info Rail**:
  - Class name: `.ProductDetailDescription__product-detail-description`
  - Container padding: **`40px 20px 24px 24px`** (`pt-[40px] pr-[20px] pb-[24px] pl-[24px]`).
  - Total outer rail width: **`440.93px`**, yielding an exact content box width of **`396.93px`**.
  - Dual pill actions: Outline `SELECT SIZE` button + solid dark slate `ADD TO BAG` button (`rounded-full`, uppercase, `tracking-[0.16em]`).
  - Native accessible `<details>`/`<summary>` accordions for *Size & Fit*, *Composition & Care*, *Shipping & Returns*, and *Boutique Care*.
- **Master Centered Grid**:
  - Container width: **`max-w-[1565px] mx-auto`** ($1123.84\text{px} + 440.93\text{px} = 1564.77\text{px}$).

---

## 4. Development & Testing Commands

### Local Development Server
```powershell
npm run dev
# Starts Next.js dev server on http://localhost:3000
```

### Static Type Checking
```powershell
npm run type-check
# Runs tsc --noEmit
```

### Unit & Integration Testing (Vitest)
> [!IMPORTANT]
> Always run Vitest on Windows with single-fork pool settings to prevent Node V8 heap exhaustion:
```powershell
npx vitest run --pool=forks --poolOptions.forks.singleFork
```

### Production Build & Deployment
```powershell
# Next.js build verification
npm run build

# Cloudflare Workers deployment
npx wrangler deploy
```

---

## 5. Engineering Constraints & Best Practices

1. **Cloudflare Workers & Edge Compatibility**:
   - Cloudflare `workerd` rejects `RequestInit.cache: 'no-store'`. Always pass custom headers (`headers: { 'Cache-Control': 'no-store' }`) instead of setting `init.cache`.
   - Ensure `nodejs_compat_populate_process_env = true` is maintained in `wrangler.toml` so `process.env` secrets are populated inside edge functions.
2. **Windows PowerShell Chaining**:
   - Never use `&&` in Windows PowerShell. Chain dependent commands with `; if ($LASTEXITCODE -eq 0) { ... }`.
3. **Database Security (RLS)**:
   - All Supabase tables must have Row Level Security enabled.
   - Direct service role key access is strictly confined to server-side admin actions (`lib/supabase/admin.ts`), never exposed to public storefront clients.
4. **Modern Web Standards**:
   - Prefer native HTML5 primitives: `<dialog>` for modals, `<details>`/`<summary>` for accordions, `loading="lazy"` / `fetchPriority` for responsive images.
