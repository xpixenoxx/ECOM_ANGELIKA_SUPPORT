# Production-Grade E-Commerce Codebase Restructuring: Architecture & Implementation Plan

**System:** Angelika Fashions Luxury E-Commerce Platform  
**Target Architecture:** Modular Monolith + Feature-Based + Layered Architecture  
**Runtime:** Next.js 14 App Router, TypeScript (Strict), Tailwind CSS, Supabase PostgreSQL  
**Author:** Senior Software Architect & Production-Level Full-Stack Lead  
**Constraints:** Zero Functionality Changes • Zero UI/UX Regression • Zero Database/API Contract Changes • No Code Pushed  

---

## 1. Architectural Philosophy & Strategy

This architecture restructures the Angelika Fashions codebase into a **Modular Monolith** organized by **Business Features** with a strict **Layered Hierarchy**, while preserving 100% of Next.js 14 App Router routing contracts and runtime performance.

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                             NEXT.JS 14 APP ROUTER                                │
│        app/(store)/*              app/admin/*                 app/api/*          │
│       Storefront Routes           Admin Routes            HTTP Route Handlers    │
└─────────────────────────┬──────────────────┬──────────────────┬──────────────────┘
                          │                  │                  │
                          ▼                  ▼                  ▼
┌──────────────────────────────────────────────────────────────────────────────────┐
│                   FEATURE MODULES (lib/modules/ or features/)                    │
│                                                                                  │
│  ┌───────────────┐ ┌───────────────┐ ┌───────────────┐ ┌───────────────┐         │
│  │     auth      │ │    catalog    │ │     cart      │ │   checkout    │         │
│  ├───────────────┤ ├───────────────┤ ├───────────────┤ ├───────────────┤         │
│  │    orders     │ │   payments    │ │   customers   │ │    content    │         │
│  ├───────────────┤ ├───────────────┤ ├───────────────┤ ├───────────────┤         │
│  │   whatsapp    │ │   analytics   │ │    reviews    │ │    returns    │         │
│  └───────────────┘ └───────────────┘ └───────────────┘ └───────────────┘         │
│                                                                                  │
│  EACH FEATURE IS INTERNALLY STRUCTURED INTO 6 STRICT LAYERS:                    │
│  1. routes / pages:      Client views & page containers                          │
│  2. actions / control:   Server Actions & request orchestration                  │
│  3. services:            Pure business workflows & domain logic                  │
│  4. repositories:        Isolated database queries & Supabase operations         │
│  5. models / types:      TypeScript domain interfaces & schemas                  │
│  6. validators:          Zod schemas for input validation & sanitization         │
└────────────────────────────────────────┬─────────────────────────────────────────┘
                                         │
                                         ▼
┌──────────────────────────────────────────────────────────────────────────────────┐
│                       SHARED INFRASTRUCTURE & CORE LAYER                         │
│  components/ui (Primitives)   •   components/layout   •   components/animations  │
│  lib/supabase (Clients)       •   lib/utils (cn, id)  •   lib/core/errors        │
└──────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Business Feature Domains & Mapping

The application is decomposed into 12 self-contained business modules:

| Feature Domain | Existing Files & Locations | Primary Responsibilities |
| :--- | :--- | :--- |
| **1. Auth** | `app/(store)/login`, `register`, `auth/*`, `lib/actions/auth-otp.ts`, `lib/hooks/useAuth.tsx` | Authentication, OTP verification, password resets, session management, customer RBAC. |
| **2. Catalog** | `app/(store)/shop/*`, `product/[slug]`, `lib/actions/products.ts`, `search.ts`, `recommendations.ts` | Product catalog, category hierarchies, full-text & semantic search, recommendations. |
| **3. Cart** | `app/(store)/cart`, `lib/hooks/useCart.tsx`, `carts` table integration | Cart line items, local storage sync, stock availability check, subtotal calculations. |
| **4. Checkout** | `app/(store)/checkout`, `lib/actions/checkout.ts`, `types/commerce.ts` | Multi-step checkout, shipping/billing address validation, COD checks, coupon application. |
| **5. Orders** | `app/(store)/account/orders/*`, `app/admin/orders/*`, `lib/actions/customer-orders.ts`, `admin-orders.ts` | Order lifecycle, tracking numbers, status transitions, courier integration, PDF invoices. |
| **6. Payments** | `app/api/payments/*`, `lib/actions/payments.ts`, `app/api/webhooks/*` | Razorpay checkout & signature verification, Stripe Payment Intents & webhooks, COD fees. |
| **7. Customers** | `app/(store)/account/*`, `app/admin/customers/*`, `lib/actions/loyalty.ts`, `circle.ts`, `admin-customers.ts` | Customer profiles, Angelika Circle, loyalty tiers, points transactions, RFM segmentation. |
| **8. Content & CMS**| `app/admin/content/*`, `lib/actions/site-content.ts`, `homepage-hero.ts`, `content-blocks.ts` | Modular homepage sections, 17 static page routes, editorial stories, design tokens. |
| **9. WhatsApp** | `app/admin/whatsapp/*`, `lib/actions/admin-whatsapp.ts` | Concierge chat CRM, automated order dispatch notifications, template management. |
| **10. Analytics** | `app/admin/analytics/*`, `lib/actions/admin-analytics.ts`, `admin-dashboard.ts` | Gross revenue, AOV, conversion funnel, real-time KPI subscriptions, CSV report export. |
| **11. Reviews** | `app/admin/products/reviews/*`, `lib/actions/reviews.ts`, `admin-reviews.ts` | Customer product ratings, verified buyer badges, image reviews, admin moderation. |
| **12. Returns** | `app/(store)/returns`, `app/admin/orders/returns`, `lib/actions/returns.ts` | Return requests, pickup scheduling, condition inspection, refund processing. |

---

## 3. Layered Architecture Contract per Feature

To prevent direct database querying from UI components or controllers, every feature adheres to the following contract:

```
[UI Page / Client] ──calls──> [Server Action / Controller] ──calls──> [Service] ──calls──> [Repository] ──queries──> [Supabase DB]
                                      │                                  │
                                      ▼                                  ▼
                              [Zod Validator]                     [Domain Model]
```

1. **Routes Layer (`app/`)**: Thin Next.js page shells and API route handlers. Performs route parameters extraction and delegates immediately to actions or client components.
2. **Controllers Layer (`actions/`)**: Server Actions and API handlers. Authenticates caller, validates input using Zod validators, invokes business service, and revalidates Next.js cache paths (`revalidatePath`).
3. **Services Layer (`services/`)**: Pure business workflows. Orchestrates multiple repositories, executes domain logic (e.g. discount calculation, loyalty points credit), and remains independent of HTTP concepts.
4. **Repositories Layer (`repositories/`)**: Encapsulates all direct database queries using `supabaseAdmin` or `createClient()`. Returns typed domain models. No business logic lives here.
5. **Models / Types Layer (`types/` or `models/`)**: Strongly typed TypeScript interfaces representing database rows, request payloads, and domain entities.
6. **Validators Layer (`validators/`)**: Zod schemas ensuring strict runtime payload validation and sanitization.

---

## 4. Production-Ready Target Folder Structure

```
├── app/                                    # Next.js 14 App Router (Routing Shell)
│   ├── (store)/                            # Customer Storefront Routes
│   │   ├── (home)/page.tsx
│   │   ├── shop/[[...category]]/page.tsx
│   │   ├── product/[slug]/page.tsx
│   │   ├── cart/page.tsx
│   │   ├── checkout/page.tsx
│   │   ├── order-success/page.tsx
│   │   ├── account/
│   │   └── ...                             # Static content routes (about, contact, etc.)
│   ├── admin/                              # Admin Management Routes
│   │   ├── layout.tsx                      # Admin navigation shell
│   │   ├── page.tsx                        # Dashboard
│   │   ├── content/page.tsx                # Pages & Sections CMS
│   │   ├── analytics/page.tsx              # Analytics Hub
│   │   ├── products/page.tsx               # Product Catalog
│   │   ├── orders/page.tsx                 # Orders Management
│   │   ├── customers/page.tsx              # Customer CRM
│   │   └── whatsapp/page.tsx               # WhatsApp Concierge
│   ├── api/                                # HTTP API & Webhook Handlers
│   │   ├── webhooks/
│   │   └── payments/
│   ├── globals.css
│   ├── layout.tsx
│   └── providers.tsx
│
├── components/                             # Global Design System & Shared UI
│   ├── ui/                                 # Atomic UI Primitives (Button, Card, Input, Modal, Badge, etc.)
│   ├── layout/                             # Global Layout Organisms
│   │   ├── header/                         # Header, MegaMenu, MobileNav, SearchModal
│   │   └── footer/                         # Global Atelier Footer, AnnouncementBar
│   └── animations/                         # Consolidated Framer Motion & Motion One Primitives
│
├── features/ (or lib/modules/)             # Modular Monolith Feature Domains
│   ├── auth/                               # Feature: Authentication & Sessions
│   │   ├── components/                     # AuthModal, ResetPasswordForm
│   │   ├── actions/                        # authActions (login, register, logout)
│   │   ├── services/                       # authService (OTP, session validation)
│   │   ├── repositories/                   # authRepository (profiles table query)
│   │   └── types/                          # AuthUser, SessionTypes
│   │
│   ├── catalog/                            # Feature: Products & Categories
│   │   ├── components/                     # ProductCard, ProductGrid, FilterSidebar, QuickView
│   │   ├── actions/                        # catalogActions (getProducts, getCategory)
│   │   ├── services/                       # searchService, recommendationService
│   │   ├── repositories/                   # productRepository, categoryRepository
│   │   └── types/                          # Product, Variant, Category, SearchResult
│   │
│   ├── cart/                               # Feature: Shopping Cart
│   │   ├── hooks/                          # useCart (state, local storage sync, broadcast)
│   │   ├── actions/                        # cartActions (syncCart, validateStock)
│   │   ├── services/                       # cartCalculationService (taxes, discounts)
│   │   └── types/                          # CartItem, CartState
│   │
│   ├── checkout/                           # Feature: Checkout & Shipping
│   │   ├── components/                     # ShippingForm, PaymentSelector, OrderSummary
│   │   ├── actions/                        # checkoutActions (createOrder, applyCoupon)
│   │   ├── services/                       # checkoutWorkflowService
│   │   └── validators/                     # checkoutSchema (Zod address & payment validation)
│   │
│   ├── orders/                             # Feature: Orders & Shipments
│   │   ├── components/                     # OrderCard, TrackingTimeline, InvoiceDownload
│   │   ├── actions/                        # orderActions, adminOrderActions
│   │   ├── services/                       # orderFulfillmentService, invoiceService
│   │   └── repositories/                   # orderRepository, shipmentRepository
│   │
│   ├── content/                            # Feature: Site CMS & Editorial
│   │   ├── components/                     # SectionEditors, PinEditor, PageTables
│   │   ├── actions/                        # contentActions (saveSection, updatePage)
│   │   ├── services/                       # contentService (modular defaults: categories, policies)
│   │   └── repositories/                   # contentRepository (content_blocks table)
│   │
│   ├── analytics/                          # Feature: Analytics & Intelligence
│   │   ├── components/                     # InteractiveAreaChart, MetricCard, FunnelView
│   │   ├── actions/                        # analyticsActions (getAnalyticsData)
│   │   ├── services/                       # analyticsAggregationService, csvExportService
│   │   └── types/                          # AnalyticsData, DailyTrend, FunnelStage
│   │
│   └── whatsapp/                           # Feature: WhatsApp Concierge
│       ├── components/                     # ChatWindow, ThreadList, MessageBubble
│       ├── actions/                        # whatsappActions (sendMessage, markResolved)
│       └── repositories/                   # whatsappRepository (whatsapp_conversations table)
│
├── lib/core/                               # Core Cross-Cutting Concerns
│   ├── supabase/                           # Database client singletons (admin, client, server)
│   ├── errors/                             # AppError, errorHandler, apiResponse
│   └── utils/                              # cn, currency formatters, id generators
│
├── types/                                  # Canonical Domain & Database Interfaces
│   ├── database.ts                         # Supabase auto-generated schema
│   ├── commerce.ts                         # Shared commerce contracts
│   └── admin.ts                            # Admin navigation & dashboard types
│
└── tests/                                  # Centralized Test Specs (unit, integration, e2e)
```

---

## 5. Pre-Requisite Fixes (Quality & Stability Gate)

Before file movements, existing compiler and type errors must be fixed in-place to ensure a clean green baseline:

1. **`lib/actions/search.ts`**:
   - Scope variables properly in fallback paths (`products`, `query`, `pageSize`, `page`, `startTime`).
   - Add optional `vidhyasPicks?: any[]` to `SearchResult` interface.
2. **`app/admin/customers/loyalty/LoyaltyClient.tsx` & `lib/actions/loyalty.ts`**:
   - Ensure toast dispatch includes required `title: string` property.
   - Resolve index signature access on `LoyaltyTransaction`.
3. **`lib/hooks/useAuth.test.tsx`**:
   - Align mock export with `getSupabaseClient` to unblock Vitest test runner.

---

## 6. Phased Step-by-Step Implementation Strategy

### **Phase 1: Zero-Debt Baseline & Type-Check Resolution**
* Fix pre-existing compilation bugs in `search.ts` and `LoyaltyClient.tsx`.
* Run `npx tsc --noEmit` to verify **0 errors**.

### **Phase 2: Eliminate Duplicate Folders & Duplicate Components**
* Consolidate duplicate `components/animation` into `components/animations/`.
* Re-export `AddToCartMorph` from unified animations module.
* Consolidate `components/composite/Pagination.tsx` with `components/ui/Pagination.tsx`.
* Consolidate `components/composite/ScrollReveal.tsx` with `components/animations/ScrollReveal.tsx`.
* Add backward-compatible shims for legacy import paths.

### **Phase 3: Repository & Service Extraction (Layered Architecture)**
* Extract database queries from `lib/actions/admin-dashboard.ts`, `admin-orders.ts`, and `admin-products.ts` into clean repository functions (`orderRepository.ts`, `productRepository.ts`).
* Server Actions become clean controllers that validate input, call services, and revalidate paths.

### **Phase 4: Modularize Massive Monoliths**
* **Deconstruct `lib/actions/site-content.ts` (4,926 lines)**:
  - Extract static default dictionaries into domain service modules:
    - `category-content.ts` (Kurtis, Sarees, Lehengas, Salwars, Dupattas defaults)
    - `policy-content.ts` (Privacy, Terms, Cookies, Shipping, Returns)
    - `editorial-content.ts` (Vidhya's story, Atelier story, FAQ, Contact)
  - `site-content.ts` becomes a clean action controller under 300 lines delegating to these services.
* **Deconstruct `components/composite/Header.tsx` (1,548 lines)**:
  - Extract `HeaderMegaMenu.tsx`, `HeaderMobileDrawer.tsx`, and `HeaderSearchModal.tsx`.
  - Main `Header.tsx` remains the clean coordinator under 200 lines.
* **DRY Category Page Editors**:
  - Extract shared hero, SEO, and spotlight fields into `BaseCategoryPageEditor.tsx`.

### **Phase 5: Feature Module Packaging & Import Aliases**
* Wire up `features/` or `lib/modules/` with clean barrel exports (`index.ts`).
* Update `tsconfig.json` path mappings with full backward compatibility:
  - `@/features/*` -> `./features/*`
  - Existing `@/lib/*`, `@/components/*`, `@/types/*` continue to work without breaking any code.

### **Phase 6: Full Verification & Audit Report**
* Run complete verification suite:
  1. `npx tsc --noEmit` (Must pass with 0 errors).
  2. `npm test` (Unit test validation).
  3. Next.js App Router route checks (Confirm storefront `/`, `/shop`, `/checkout` and admin `/admin`, `/admin/content`, `/admin/analytics` render smoothly).
* Verify zero code is pushed (`git push` not executed).
* Deliver comprehensive Final Restructuring Report.
