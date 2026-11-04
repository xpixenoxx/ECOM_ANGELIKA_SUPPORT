---
name: feature-roadmap
description: "Phased feature delivery with priorities, dependencies, and success metrics"
metadata: 
  node_type: memory
  type: project
  originSessionId: 02c5ce66-d700-4b99-99d4-849096e268e2
---

# Angelika Fashions - Feature Roadmap

## Phase 0: Foundation (Weeks 1-2) — **CURRENT SPRINT**
*Goal: Solidify existing codebase, fix gaps, establish quality gates*

### Must Complete
| Task | Status | Owner | Notes |
|------|--------|-------|-------|
| Audit existing Supabase schema vs `types/database.ts` | 🔄 | Dev | Run `npm run db:generate` |
| Complete missing UI components (Button, Input, Card, Modal, Drawer, Toast, Toast, Select, Radio, Checkbox, Toggle, Slider, Stepper, Tabs, Accordion, Tooltip, Dropdown, Table, Progress, Badge, Avatar, Skeleton) | ⏳ | Dev | Use design-system.md specs |
| Implement design tokens sync (Supabase → CSS build) | ⏳ | Dev | Admin UI + build script |
| Set up Storybook with all components + Chromatic | ⏳ | Dev | Visual regression testing |
| Configure ESLint + Prettier + Husky + lint-staged | ✅ | Done | Check package.json |
| Add Vitest unit tests for hooks (useCart, useAuth, useWishlist, useSizeFinder) | ⏳ | Dev | Target 80% coverage |
| Add Playwright E2E tests for critical flows (auth, cart, checkout) | ⏳ | Dev | 5 core flows |
| Fix TypeScript strict mode errors (`noUncheckedIndexedAccess`, etc.) | ⏳ | Dev | Current tsconfig has strict flags |
| Optimize bundle size (`npm run analyze`) | ⏳ | Dev | Target <170kb First Load JS |
| Set up Sentry error tracking | ⏳ | Dev | Client + Server |
| Configure Vercel Analytics + Speed Insights | ⏳ | Dev | Core Web Vitals monitoring |

### Success Criteria
- [ ] `npm run type-check` passes with 0 errors
- [ ] `npm run lint` passes with 0 warnings
- [ ] `npm run test` passes with >80% coverage
- [ ] `npm run e2e` passes 5 critical flows
- [ ] Lighthouse: Performance >90, Accessibility >95, SEO >90
- [ ] Bundle: First Load JS <170kb gzipped
- [ ] Storybook: All components documented, Chromatic baseline set

---

## Phase 1: Core Commerce Polish (Weeks 3-4)
*Goal: Production-ready shopping experience*

### PDP (Product Detail Page) — **Premium Standard**
| Feature | Spec Reference | Priority |
|---------|----------------|----------|
| Hero gallery (thumbnails, zoom, video, full-screen viewer) | design-system.md#7 | P0 |
| Magnetic "Add to Bag" + morph animation | design-system.md#2 | P0 |
| Size selector (pills, magnetic, out-of-stock notify) | design-system.md#7 | P0 |
| Size Guide modal (measurements + fit predictor) | research-findings.md#4 | P0 |
| "Complete the Look" carousel (AI recommendations) | research-findings.md#3 | P1 |
| "Vidhya's Note" (Hindi + English, personal styling tips) | research-findings.md#2 | P0 |
| Fabric story (loom, weaver, GSM, care, certifications) | research-findings.md#2 | P1 |
| Reviews with photos + measurements + fit ratings | research-findings.md#3 | P1 |
| Sticky add-to-cart on scroll (mobile) | research-findings.md#3 | P0 |
| Share to WhatsApp (product card + deep link) | research-findings.md#7 | P1 |
| Recently viewed (localStorage, cross-device sync) | research-findings.md#3 | P1 |

### PLP (Product Listing Page) — **Conversion Optimized**
| Feature | Spec Reference | Priority |
|---------|----------------|----------|
| Infinite scroll + skeleton loading | research-findings.md#1 | P0 |
| Sticky filters sidebar (mobile: drawer) | research-findings.md#3 | P0 |
| Faceted search (category, size, color, price, occasion, fabric, Vidhya's Pick, sale) | research-findings.md#3 | P0 |
| Sort options (newest, price, popularity, rating, name) | types/commerce.ts | P0 |
| View toggle (grid 2/3/4 cols, list) | design-system.md | P1 |
| Quick view modal (image, name, price, size, add to bag) | design-system.md | P1 |
| "Women Like You Bought" (anonymized size match) | research-findings.md#4 | P2 |
| Semantic search integration | architecture-plan.md | P1 |
| URL-synced filters (shareable links) | architecture-plan.md | P1 |

### Cart & Checkout — **3 Steps Max**
| Feature | Spec Reference | Priority |
|---------|----------------|----------|
| Cart drawer (slide-in, stagger items, magnetic stepper) | design-system.md#5, #7 | P0 |
| Coupon engine (percentage, fixed, free shipping, BXGY) | types/commerce.ts | P0 |
| GST calculation (5%/12%/18% slabs, inclusive pricing) | types/commerce.ts | P0 |
| Shipping estimator (pincode → courier options, COD availability) | research-findings.md#10 | P0 |
| Address autocomplete (Google Places) | research-findings.md#3 | P0 |
| Guest checkout default → account creation post-purchase | research-findings.md#3 | P0 |
| Saved addresses + UPI handles + cards | research-findings.md#3 | P1 |
| Gift wrap + Vidhya's handwritten note | research-findings.md#2 | P1 |
| Order summary (subtotal, shipping, tax, discount, total) | types/commerce.ts | P0 |
| Payment: Razorpay (UPI, cards, wallets, EMI), Stripe, COD | architecture-plan.md | P0 |
| Webhook handling (payment captured/failed, refund) | architecture-plan.md | P0 |
| Order confirmation page + email + WhatsApp | research-findings.md#6 | P0 |

### Account & Post-Purchase
| Feature | Spec Reference | Priority |
|---------|----------------|----------|
| Order history + timeline (visual status tracker) | types/admin.ts | P0 |
| Order details (invoice download, tracking, return initiation) | types/admin.ts | P0 |
| Wishlist (synced, restock/sale notify) | current implementation | P0 |
| Digital Wardrobe (auto-add purchases, outfit planner) | research-findings.md#5 | P1 |
| Loyalty dashboard (tiers, points, history, referral) | types/commerce.ts | P1 |
| Referral program (give ₹500/get ₹500 + styling session) | research-findings.md#5 | P1 |
| Measurements management (save, edit, body shape) | current implementation | P0 |
| Notification preferences (email/WhatsApp/push) | architecture-plan.md | P1 |
| Easy returns (WhatsApp-initiated, doorstep pickup) | research-findings.md#5 | P1 |

---

## Phase 2: Differentiation Features (Weeks 5-8)
*Goal: Unique value props that justify premium positioning*

### Size Finder 2.0 (AI-Powered)
| Feature | Spec Reference | Priority |
|---------|----------------|----------|
| Body Shape Quiz (5 questions → Apple/Pear/Hourglass/Rectangle) | research-findings.md#4 | P0 |
| Photo-based Measurements (WebAR: front + side → key measurements) | research-findings.md#4 | P1 |
| Fit Prediction per variant ("Runs small in bust, true in hip") | research-findings.md#4 | P0 |
| Cross-Brand Calibration ("M in Zara = L here") | research-findings.md#4 | P1 |
| Size Guide Interactions tracking (ML training data) | architecture-plan.md | P2 |
| "Try at Home" — order 2 sizes, free return for one | research-findings.md#5 | P2 |

### Style Quiz & AI Stylist
| Feature | Spec Reference | Priority |
|---------|----------------|----------|
| 10-question Style Profile (occasion, colors, silhouettes, budget) | research-findings.md#4 | P0 |
| Personalized homepage ("Your Edit") | research-findings.md#4 | P1 |
| "Style This For [Occasion]" → 3 complete looks | research-findings.md#4 | P0 |
| "What Goes With [Product]?" → Complementary pieces | research-findings.md#4 | P0 |
| WhatsApp Stylist Chat (human + AI hybrid) | research-findings.md#4, #7 | P1 |
| Monthly "Vidhya's Edit" email + WhatsApp broadcast | research-findings.md#6 | P1 |

### Virtual Try-On (WebAR)
| Feature | Spec Reference | Priority |
|---------|----------------|----------|
| Lehenga/Saree: Body tracking + fabric simulation (Three.js + MediaPipe) | research-findings.md#4 | P1 |
| Kurti: Upper body overlay with size-accurate fit | research-findings.md#4 | P1 |
| Share to WhatsApp for feedback | research-findings.md#4 | P1 |
| "Design Your Lehenga" combinator (skirt + blouse + dupatta) | research-findings.md#2 | P2 |

### Content-First Commerce (Editorial Engine)
| Feature | Spec Reference | Priority |
|---------|----------------|----------|
| Block-based page builder (Hero, Grid, Carousel, Video, Product Grid, Editorial, Instagram, Custom) | types/admin.ts | P0 |
| Design Tokens UI (live preview, version history, rollback) | types/admin.ts | P0 |
| Shoppable video (timestamped product tags) | research-findings.md#6 | P1 |
| "Vidhya's Weekly Edit" (5 products + Reel + styling notes) | research-findings.md#2 | P0 |
| "Behind the Seams" monthly (design process, sourcing trips) | research-findings.md#6 | P1 |
| Festival Guides (Navratri, Diwali, Eid, Christmas) | research-findings.md#6 | P1 |
| Artisan stories ("Meet the Weaver: Ramesh from Chanderi") | research-findings.md#2 | P1 |
| Fabric education ("Cotton vs Linen vs Chanderi") | research-findings.md#6 | P1 |
| UGC gallery (Instagram hashtag aggregation) | research-findings.md#6 | P1 |
| Multi-language (English + Hindi per block) | types/admin.ts | P1 |

### WhatsApp Commerce (First-Class Channel)
| Feature | Spec Reference | Priority |
|---------|----------------|----------|
| Catalog browsing Flow (categories → filters → add to cart) | research-findings.md#7 | P0 |
| Checkout Flow (contact → address → payment → confirmation) | research-findings.md#7 | P0 |
| Order update templates (confirmed, shipped, delivered, cancelled) | research-findings.md#7 | P0 |
| Back-in-stock / price drop broadcasts | research-findings.md#7 | P0 |
| Support Flow (FAQ → human handoff) | research-findings.md#7 | P1 |
| Loyalty Flow (points, rewards, redeem) | research-findings.md#7 | P1 |
| Cart/wishlist sync between web ↔ WhatsApp | research-findings.md#7 | P1 |
| Analytics per flow (open, click, conversion) | research-findings.md#7 | P1 |

---

## Phase 3: Advanced & Scale (Weeks 9-12)
*Goal: Intelligence, automation, international readiness*

### Intelligence & Personalization
| Feature | Spec Reference | Priority |
|---------|----------------|----------|
| Recommendation engine (collaborative + content-based) | architecture-plan.md | P1 |
| Dynamic pricing rules (loyalty tier, first order, volume) | architecture-plan.md | P2 |
| Predictive restock alerts (ML on sales velocity) | architecture-plan.md | P2 |
| Churn prediction + win-back campaigns | architecture-plan.md | P2 |
| Search ranking optimization (click-through learning) | architecture-plan.md | P2 |

### International & Multi-Currency
| Feature | Spec Reference | Priority |
|---------|----------------|----------|
| Multi-currency (INR primary, USD/EUR) | architecture-plan.md | P1 |
| International shipping (DHL/FedEx, duties calculator) | research-findings.md#10 | P2 |
| Localization (Hindi/Hinglish, RTL ready for Arabic) | research-findings.md#10 | P2 |
| GST → VAT/GST transition for intl orders | research-findings.md#10 | P2 |

### Operational Excellence
| Feature | Spec Reference | Priority |
|---------|----------------|----------|
| Advanced admin analytics (funnel, cohorts, real-time) | types/admin.ts | P1 |
| Automated low-stock → reorder suggestions | architecture-plan.md | P1 |
| Supplier portal (fabric, trim orders) | architecture-plan.md | P2 |
| Tailor network management (alterations booking, tracking) | architecture-plan.md | P2 |
| Customer support ticketing (WhatsApp + email unified) | research-findings.md#5 | P1 |

---

## Phase 4: Platform Maturity (Weeks 13-16)
*Goal: Self-serve, extensible, enterprise-grade*

| Feature | Spec Reference | Priority |
|---------|----------------|----------|
| Public API (headless commerce for mobile app) | architecture-plan.md | P2 |
| Webhook marketplace (Zapier, Make, custom) | architecture-plan.md | P2 |
| Multi-store (sub-brands, wholesale portal) | architecture-plan.md | P3 |
| Advanced segmentation (RFM, predictive LTV) | types/admin.ts | P2 |
| A/B testing framework (Vercel Edge Config) | architecture-plan.md | P2 |
| Accessibility audit + certification (WCAG 2.1 AA) | research-findings.md#9 | P1 |
| Performance budget enforcement (CI gate) | architecture-plan.md | P1 |
| Security audit (penetration test, dependency scan) | architecture-plan.md | P1 |

---

## Success Metrics (North Star + Guardrails)

### North Star Metric
**Monthly Active Customers with ≥2 Orders** — measures retention + frequency

### Primary KPIs
| Metric | Target | Measurement |
|--------|--------|-------------|
| **Conversion Rate** | >3.5% (industry avg ~2%) | Purchase sessions / Sessions |
| **Average Order Value** | >₹3,500 | Revenue / Orders |
| **Repeat Purchase Rate (90d)** | >35% | Customers with 2+ orders / New customers |
| **Return Rate** | <15% (ethnic wear avg ~25%) | Returned items / Sold items |
| **WhatsApp Revenue Share** | >20% | WhatsApp-attributed revenue / Total |
| **Size Finder Conversion** | >2x baseline | Size finder users → purchase rate |
| **Content Engagement** | >3 min avg session | Editorial pages time on page |
| **NPS** | >60 | Post-delivery survey |

### Guardrail Metrics (Never Degrade)
| Metric | Floor | Alert Threshold |
|--------|-------|-----------------|
| **LCP** | <2.5s | >3s |
| **INP** | <200ms | >300ms |
| **CLS** | <0.1 | >0.15 |
| **Error Rate** | <0.1% | >0.5% |
| **Checkout Abandonment** | <65% | >75% |
| **Search Null Results** | <5% | >10% |

---

## Dependency Graph

```
Phase 0 (Foundation)
    │
    ├─→ Phase 1 (Core Commerce) ──────────────────┐
    │    │                                         │
    │    ├─→ PDP → Cart → Checkout → Account       │
    │    └─→ PLP → Search → Filters                │
    │                                             │
    └─→ Phase 2 (Differentiation) ◄───────────────┘
         │
         ├─→ Size Finder 2.0 ← needs: Measurements DB, ML pipeline
         ├─→ Style Quiz ← needs: Style Profile DB, Recommendation engine
         ├─→ Virtual Try-On ← needs: WebAR pipeline, 3D assets
         ├─→ Editorial Engine ← needs: Content Blocks, Design Tokens UI
         └─→ WhatsApp Commerce ← needs: WABA approval, Flows, Templates
              │
              └─→ Phase 3 (Advanced) ◄──────────────┘
                   │
                   ├─→ Intelligence ← needs: Analytics Events, ML infra
                   └─→ International ← needs: Multi-currency, Intl shipping
                        │
                        └─→ Phase 4 (Platform) ◄──────────────┘
```

---

## Resource Allocation (Suggested)

| Role | Phase 0 | Phase 1 | Phase 2 | Phase 3 | Phase 4 |
|------|---------|---------|---------|---------|---------|
| **Frontend Lead** | 1.0 | 1.0 | 1.0 | 0.5 | 0.5 |
| **Backend/Full-stack** | 1.0 | 1.0 | 1.0 | 1.0 | 0.5 |
| **UI/UX Designer** | 0.5 | 1.0 | 1.0 | 0.5 | 0.3 |
| **ML/AR Engineer** | 0 | 0 | 1.0 | 1.0 | 0.5 |
| **DevOps** | 0.5 | 0.3 | 0.3 | 0.5 | 0.5 |
| **Content/Community** | 0 | 0.5 | 1.0 | 1.0 | 1.0 |
| **QA/Automation** | 0.5 | 0.5 | 0.5 | 0.5 | 0.5 |

> **Note**: Vidhya (founder) acts as Product Owner + Content Director — final say on design, copy, curation.

---

## Risk Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| WABA approval delay | High | High | Start application Week 1; fallback: WhatsApp chat widget + deep links |
| Virtual Try-On performance on low-end devices | Medium | Medium | Progressive enhancement: photo upload → server render → WebAR |
| Size finder accuracy | Medium | High | Collect interaction data from Day 1; human review loop; free alterations |
| Content velocity (Vidhya bottleneck) | High | Medium | Block editor = self-serve; content calendar; batch creation days |
| Bundle size creep | Medium | Medium | CI gate: `npm run analyze` fails if First Load JS > 180kb |
| Supabase cost scaling | Low | Medium | Monitor usage; read replicas for analytics; archive old partitions |
| Team knowledge silos | Medium | High | Pair programming; ADR docs; Storybook as living docs; rotation |

---

## Definition of Done (Per Feature)
- [ ] TypeScript compiles strict mode
- [ ] Unit tests >80% coverage (hooks, utils, validators)
- [ ] E2E test covers happy path + 1 error path
- [ ] Storybook story for all states (loading, empty, error, success)
- [ ] Chromatic visual regression baseline updated
- [ ] Accessibility audit (axe-core in CI)
- [ ] Performance budget met (Lighthouse CI)
- [ ] Design review (Figma → Code pixel-perfect)
- [ ] Vidhya sign-off (design, copy, flow)
- [ ] Deployed to Vercel Preview + tested
- [ ] Documentation updated (README, API docs, runbooks)