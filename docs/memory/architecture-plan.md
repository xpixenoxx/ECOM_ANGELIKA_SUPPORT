---
name: architecture-plan
description: "Technical architecture: Next.js 14, Supabase, API design, data flow, security"
metadata: 
  node_type: memory
  type: project
  originSessionId: 02c5ce66-d700-4b99-99d4-849096e268e2
---

# Angelika Fashions - Technical Architecture

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           CLIENT (Next.js 14)                           │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────────┐   │
│  │ App Router  │ │ Components  │ │   Hooks     │ │   Animation     │   │
│  │ (RSC/Client)│ │ (UI/Commerce)│ │ (State)    │ │   Library       │   │
│  └──────┬──────┘ └──────┬──────┘ └──────┬──────┘ └────────┬────────┘   │
└─────────┼────────────────┼────────────────┼────────────────┼───────────┘
          │                │                │                │
          ▼                ▼                ▼                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        SUPABASE (Backend-as-a-Service)                  │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────────┐   │
│  │   Auth      │ │  Database   │ │  Realtime   │ │    Storage      │   │
│  │  (GoTrue)   │ │  (Postgres) │ │  (WebSocket)│ │    (S3)         │   │
│  └─────────────┘ └──────┬──────┘ └─────────────┘ └─────────────────┘   │
└─────────────────────────┼───────────────────────────────────────────────┘
                          │
          ┌───────────────┼───────────────┐
          ▼               ▼               ▼
    ┌──────────┐   ┌────────────┐  ┌────────────┐
    │  Edge    │   │  Webhooks  │  │  Cron      │
    │ Functions│   │  (Orders,  │  │  Jobs      │
    │ (Vercel) │   │  Payments) │  │  (Analytics)│
    └──────────┘   └────────────┘  └────────────┘
```

---

## Next.js 14 Configuration (Current + Enhancements)

### Current `next.config.mjs` Analysis
- ✅ PPR enabled (`experimental.ppr: true`)
- ✅ Server actions with body limit
- ✅ Image optimization (Supabase, Unsplash, Cloudinary)
- ✅ Security headers (CSP, X-Frame-Options, etc.)
- ✅ Rewrites for admin (`/admin/*` → `/(admin)/*`)
- ✅ Standalone output for Docker/Vercel
- ✅ Bundle analyzer integration

### Required Enhancements
```javascript
// Add to next.config.mjs
experimental: {
  ppr: true,
  serverActions: { bodySizeLimit: '2mb' },
  optimizePackageImports: [...],
  // NEW:
  instrumentationHook: true,        // Custom instrumentation
  typedRoutes: true,                // Type-safe routing
},
// NEW: Middleware matcher optimization
// NEW: Experimental cache handlers for ISR
```

### App Router Structure
```
app/
├── (marketing)/           # Public pages (no auth)
│   ├── layout.tsx         # Marketing layout (minimal providers)
│   ├── page.tsx           # Homepage (editorial hero + sections)
│   ├── collections/       # Category pages
│   │   ├── [slug]/page.tsx
│   │   └── [slug]/[productSlug]/page.tsx  # PDP
│   ├── editorial/         # Blog/styling guides
│   │   ├── [slug]/page.tsx
│   │   └── page.tsx
│   ├── search/page.tsx    # Search results
│   ├── login/page.tsx
│   ├── register/page.tsx
│   └── password-reset/page.tsx
├── (auth)/                # Protected customer pages
│   ├── layout.tsx         # Full providers (Auth, Cart, Wishlist, SizeFinder)
│   ├── account/
│   │   ├── page.tsx       # Dashboard
│   │   ├── orders/page.tsx
│   │   ├── orders/[id]/page.tsx
│   │   ├── wishlist/page.tsx
│   │   ├── measurements/page.tsx
│   │   ├── loyalty/page.tsx
│   │   ├── referrals/page.tsx
│   │   └── settings/page.tsx
│   ├── checkout/
│   │   ├── page.tsx       # Multi-step (contact → shipping → payment)
│   │   ├── success/page.tsx
│   │   └── cancel/page.tsx
│   └── wardrobe/page.tsx  # Digital wardrobe
├── (admin)/               # Admin panel (role-protected)
│   ├── layout.tsx         # Admin layout + providers
│   ├── page.tsx           # Dashboard
│   ├── content/           # Block editor
│   │   ├── page.tsx
│   │   ├── [id]/page.tsx
│   │   └── tokens/page.tsx
│   ├── products/
│   │   ├── page.tsx       # List + filters
│   │   ├── new/page.tsx
│   │   └── [id]/page.tsx  # Editor (tabs: basics, variants, images, SEO)
│   ├── orders/
│   │   ├── page.tsx
│   │   └── [id]/page.tsx
│   ├── customers/
│   │   ├── page.tsx
│   │   └── [id]/page.tsx
│   ├── whatsapp/
│   │   ├── page.tsx       # Conversations
│   │   ├── templates/page.tsx
│   │   └── flows/page.tsx
│   ├── analytics/page.tsx
│   └── settings/page.tsx
├── api/
│   ├── webhooks/
│   │   ├── razorpay/route.ts
│   │   ├── stripe/route.ts
│   │   ├── whatsapp/route.ts
│   │   └── supabase/route.ts
│   ├── cron/
│   │   ├── analytics/route.ts
│   │   ├── inventory/route.ts
│   │   └── loyalty/route.ts
│   ├── search/route.ts    # Semantic search
│   ├── recommendations/route.ts
│   ├── size-finder/route.ts
│   ├── virtual-tryon/route.ts
│   └── revalidate/route.ts
├── providers.tsx          # Root providers (current)
├── globals.css            # Design system (current)
└── layout.tsx             # Root layout
```

---

## Supabase Database Schema (Current + Extensions)

### Current Tables (from `types/database.ts`)
- ✅ `profiles` — users with roles, measurements, loyalty
- ✅ `categories` — hierarchical (parent_id, slug, translations)
- ✅ `products` — rich (fabric, occasion, tags, Vidhya notes, GST/HSN)
- ✅ `product_variants` — size, color, price, inventory
- ✅ `colors` — hex, name, translations
- ✅ `product_images` — typed (lifestyle, detail, flat_lay, model, fabric, video)
- ✅ `size_charts` — per category, JSON measurements
- ✅ `orders` — comprehensive (status, payment, addresses, Vidhya note, gift)
- ✅ `order_items` — with GST, variant details
- ✅ `carts` — JSON items, session/user
- ✅ `reviews` — ratings, fit/quality, photos, verified purchase
- ✅ `wishlists` — notify on restock/sale
- ✅ `coupons` — types, limits, category/product restrictions
- ✅ `loyalty_transactions` — earn/redeem/expire/referral/review/signup
- ✅ `returns` — exchange/return/repair, reasons, pickup, images
- ✅ `whatsapp_conversations` — messages, templates, flows, AI handoff
- ✅ `content_blocks` — block editor (type, content, settings, published)
- ✅ `design_tokens` — versioned, JSON tokens
- ✅ `admin_audit_log` — actions, entities, old/new data

### New Tables Required

```sql
-- Digital Wardrobe
CREATE TABLE wardrobes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  variant_id UUID REFERENCES product_variants(id),
  added_at TIMESTAMPTZ DEFAULT NOW(),
  worn_count INT DEFAULT 0,
  last_worn TIMESTAMPTZ,
  outfit_tags TEXT[], -- e.g., ['office', 'wedding', 'travel']
  notes TEXT
);

-- Outfit Plans
CREATE TABLE outfits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT,
  occasion TEXT,
  date DATE,
  items JSONB, -- [{product_id, variant_id, position}]
  is_packed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Style Quiz Results
CREATE TABLE style_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  answers JSONB, -- {occasion, colors, silhouettes, budget, ...}
  archetype TEXT, -- 'minimalist', 'maximalist', 'traditional', 'fusion', 'boho'
  color_palette TEXT[], -- hex codes
  preferred_silhouettes TEXT[],
  budget_range INT4RANGE,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Stylist Conversations
CREATE TABLE stylist_chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  channel TEXT CHECK (channel IN ('web', 'whatsapp')),
  messages JSONB, -- [{role, content, timestamp, products_mentioned}]
  context JSONB, -- {current_product_id, occasion, ...}
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Virtual Try-On Sessions
CREATE TABLE tryon_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  session_id TEXT, -- anonymous
  product_id UUID REFERENCES products(id),
  variant_id UUID REFERENCES product_variants(id),
  measurements JSONB, -- body measurements used
  result_image_url TEXT, -- generated try-on image
  shared_to_whatsapp BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fabric Swatch Requests
CREATE TABLE swatch_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  phone TEXT,
  product_id UUID REFERENCES products(id),
  variant_id UUID REFERENCES product_variants(id),
  address JSONB,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'shipped', 'delivered', 'cancelled')),
  tracking_number TEXT,
  shipped_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Alteration Requests
CREATE TABLE alteration_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  order_item_id UUID REFERENCES order_items(id),
  type TEXT CHECK (type IN ('length', 'sleeve', 'bust', 'waist', 'custom')),
  measurements JSONB, -- current + desired
  tailor_id UUID, -- partner tailor
  status TEXT DEFAULT 'requested' CHECK (status IN ('requested', 'assigned', 'in_progress', 'ready', 'delivered')),
  pickup_address JSONB,
  delivery_address JSONB,
  cost INT, -- paise
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Referral Tracking
CREATE TABLE referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  referred_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  code TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'expired')),
  referrer_reward INT DEFAULT 50000, -- 500 INR in paise
  referred_reward INT DEFAULT 50000,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Analytics Events (for funnel/cohort analysis)
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  session_id TEXT,
  event_type TEXT NOT NULL, -- page_view, add_to_cart, checkout_start, purchase, etc.
  properties JSONB,
  page_url TEXT,
  referrer TEXT,
  device_info JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_analytics_events_user_created ON analytics_events(user_id, created_at DESC);
CREATE INDEX idx_analytics_events_type_created ON analytics_events(event_type, created_at DESC);
CREATE INDEX idx_analytics_events_session ON analytics_events(session_id);

-- Campaign Tracking
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('email', 'whatsapp', 'social', 'referral', 'affiliate')),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'archived')),
  audience JSONB, -- segment rules
  content JSONB, -- template, variables
  schedule_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  stats JSONB, -- sent, delivered, opened, clicked, converted, revenue
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notification Preferences
CREATE TABLE notification_preferences (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  email_order BOOLEAN DEFAULT TRUE,
  email_shipping BOOLEAN DEFAULT TRUE,
  email_marketing BOOLEAN DEFAULT TRUE,
  email_loyalty BOOLEAN DEFAULT TRUE,
  whatsapp_order BOOLEAN DEFAULT TRUE,
  whatsapp_shipping BOOLEAN DEFAULT TRUE,
  whatsapp_marketing BOOLEAN DEFAULT FALSE,
  whatsapp_loyalty BOOLEAN DEFAULT TRUE,
  push_order BOOLEAN DEFAULT TRUE,
  push_marketing BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Size Guide Interactions (for ML training)
CREATE TABLE size_guide_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  product_id UUID REFERENCES products(id),
  variant_id UUID REFERENCES product_variants(id),
  recommended_size TEXT,
  selected_size TEXT,
  purchased_size TEXT,
  returned BOOLEAN DEFAULT FALSE,
  return_reason TEXT,
  user_measurements JSONB,
  confidence INT, -- 0-100
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies (Key Examples)
-- profiles: users see own, admins see all
-- orders: users see own, admins see all
-- carts: users see own session/user
-- wishlists: users see own
-- analytics_events: users see own, admins see all
-- All admin tables: admin/manager/designer roles only
```

---

## API Design (Server Actions + Route Handlers)

### Server Actions (Primary Mutations)
```typescript
// lib/actions/auth.ts
export async function signUpAction(formData: FormData)
export async function signInAction(formData: FormData)
export async function signInWithOtpAction(formData: FormData)
export async function signInWithOAuthAction(provider: 'google' | 'github' | 'facebook')
export async function signOutAction()
export async function resetPasswordAction(formData: FormData)
export async function updatePasswordAction(formData: FormData)
export async function updateProfileAction(formData: FormData)

// lib/actions/cart.ts
export async function addToCartAction(variantId: string, quantity: number, size?: string)
export async function updateCartQuantityAction(itemId: string, quantity: number)
export async function removeFromCartAction(itemId: string)
export async function clearCartAction()
export async function applyCouponAction(code: string)
export async function removeCouponAction()
export async function validateCartAction()
export async function syncGuestCartAction()

// lib/actions/wishlist.ts
export async function addToWishlistAction(productId: string, variantId?: string)
export async function removeFromWishlistAction(productId: string, variantId?: string)
export async function toggleWishlistAction(productId: string, variantId?: string)
export async function updateWishlistNotificationsAction(productId: string, variantId: string | undefined, notifyRestock: boolean, notifySale: boolean)

// lib/actions/checkout.ts
export async function createOrderAction(formData: FormData) -- Returns order_id + payment_data
export async function verifyPaymentAction(paymentData: PaymentVerification)
export async function processCODAction(orderId: string)
export async function applyGiftWrapAction(orderId: string, message: string)

// lib/actions/returns.ts
export async function createReturnAction(formData: FormData)
export async function schedulePickupAction(returnId: string, slot: PickupSlot)
export async function uploadReturnImagesAction(returnId: string, files: File[])

// lib/actions/wardrobe.ts
export async function addToWardrobeAction(productId: string, variantId: string)
export async function createOutfitAction(formData: FormData)
export async function packOutfitAction(outfitId: string)
export async function logWearAction(wardrobeItemId: string)

// lib/actions/size-finder.ts
export async function saveMeasurementsAction(measurements: UserMeasurements, bodyShape: BodyShape)
export async function calculateSizeRecommendationAction(productId: string)
export async function photoMeasurementsAction(files: File[]) -- WebAR endpoint

// lib/actions/stylist.ts
export async function askStylistAction(question: string, context?: StylistContext)
export async function getStyleRecommendationsAction(occasion: string)

// lib/actions/whatsapp.ts
export async function sendWhatsAppTemplateAction(phone: string, template: string, params: Record<string, string>)
export async function processWhatsAppFlowAction(flowToken: string, response: Record<string, any>)

// lib/actions/admin/content.ts
export async function createContentBlockAction(data: ContentBlockData)
export async function updateContentBlockAction(id: string, data: Partial<ContentBlockData>)
export async function deleteContentBlockAction(id: string)
export async function publishContentBlockAction(id: string)
export async function reorderContentBlocksAction(blocks: ContentBlockData[])

// lib/actions/admin/products.ts
export async function createProductAction(data: ProductEditorData)
export async function updateProductAction(id: string, data: Partial<ProductEditorData>)
export async function deleteProductAction(id: string)
export async function bulkUpdateProductsAction(ids: string[], updates: Partial<ProductEditorData>)
export async function uploadProductImagesAction(productId: string, files: File[])

// lib/actions/admin/orders.ts
export async function updateOrderStatusAction(orderId: string, status: OrderStatus)
export async function assignCourierAction(orderId: string, courier: string, tracking: string)
export async function processRefundAction(orderId: string, amount: number, reason: string)
export async function bulkOrderAction(action: BulkAction, orderIds: string[])

// lib/actions/admin/design-tokens.ts
export async function saveDesignTokensAction(tokens: DesignTokens, version: string)
export async function publishDesignTokensAction(version: string)
export async function rollbackDesignTokensAction(version: string)
```

### Route Handlers (Webhooks, Public APIs, Streaming)
```typescript
// app/api/webhooks/razorpay/route.ts
export async function POST(req: Request) -- Verify signature, update order, send WhatsApp

// app/api/webhooks/stripe/route.ts
export async function POST(req: Request) -- Handle payment_intent.succeeded, etc.

// app/api/webhooks/whatsapp/route.ts
export async function POST(req: Request) -- Incoming messages, flow responses, status updates

// app/api/search/route.ts
export async function GET(req: Request) -- Semantic search (pgvector + text search)

// app/api/recommendations/route.ts
export async function GET(req: Request) -- "Complete the look", "Similar styles"

// app/api/size-finder/route.ts
export async function POST(req: Request) -- Photo measurements (WebAR callback)

// app/api/virtual-tryon/route.ts
export async function POST(req: Request) -- Generate try-on image (async job)

// app/api/revalidate/route.ts
export async function POST(req: Request) -- ISR revalidation (secret protected)

// app/api/cron/analytics/route.ts -- Daily aggregation
// app/api/cron/inventory/route.ts -- Low stock alerts
// app/api/cron/loyalty/route.ts -- Points expiry, tier recalculation
```

---

## State Management Architecture

### Client State (React Context + useReducer)
```
AuthContext          → User, Profile, Session, Auth methods
CartContext          → Items, Totals, Coupon, Actions (syncs to Supabase + localStorage)
WishlistContext      → Items, Count, Actions (Supabase only)
SizeFinderContext    → Measurements, BodyShape, Recommendation, SizeChart
StylistContext       → Chat history, Current context, Recommendations
WardrobeContext      → Items, Outfits, Packing lists
NotificationContext  → Toasts, In-app notifications
UIContext            → Modals, Drawers, Loading states, Breakpoints
```

### Server State (TanStack Query / SWR)
```typescript
// Queries (cached, deduplicated, background refetch)
queryKeys = {
  products: (filters) => ['products', filters],
  product: (id) => ['product', id],
  categories: () => ['categories'],
  collections: (slug) => ['collections', slug],
  cart: () => ['cart'],
  wishlist: () => ['wishlist'],
  orders: (filters) => ['orders', filters],
  order: (id) => ['order', id],
  reviews: (productId) => ['reviews', productId],
  sizeChart: (categoryId) => ['sizeChart', categoryId],
  recommendations: (productId, type) => ['recommendations', productId, type],
  stylistHistory: () => ['stylist', 'history'],
  wardrobe: () => ['wardrobe'],
  outfits: () => ['outfits'],
  loyalty: () => ['loyalty'],
  referrals: () => ['referrals'],
  notifications: () => ['notifications'],
  // Admin
  adminProducts: (filters) => ['admin', 'products', filters],
  adminOrders: (filters) => ['admin', 'orders', filters],
  adminCustomers: (filters) => ['admin', 'customers', filters],
  adminAnalytics: (dateRange) => ['admin', 'analytics', dateRange],
  adminContentBlocks: () => ['admin', 'contentBlocks'],
  adminDesignTokens: () => ['admin', 'designTokens'],
}
```

### Real-time Subscriptions (Supabase Realtime)
```typescript
// Cart sync across tabs
supabase.channel('cart_changes').on('postgres_changes', { event: '*', schema: 'public', table: 'carts', filter: `user_id=eq.${userId}` }, handleCartChange)

// Order status updates
supabase.channel(`order_${orderId}`).on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders', filter: `id=eq.${orderId}` }, handleOrderUpdate)

// WhatsApp messages (admin)
supabase.channel('whatsapp_admin').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'whatsapp_conversations' }, handleNewMessage)

// Inventory alerts (admin)
supabase.channel('inventory_low').on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'product_variants', filter: 'inventory_quantity=lte.low_stock_threshold' }, handleLowStock)
```

---

## Authentication & Authorization

### Auth Flow
```
1. User visits → Middleware checks session (refreshes if needed)
2. Unauthenticated + protected route → Redirect to /login?redirect=...
3. Login → Supabase Auth → Set session cookies → Fetch profile → Redirect
4. OAuth → Supabase OAuth → Callback → Set session → Fetch/create profile
5. Admin route → Check profile.role ∈ ['admin', 'manager', 'designer']
```

### Role-Based Access Control (Middleware + RLS)
```typescript
// Middleware (current: lib/supabase/middleware.ts)
type UserRole = 'customer' | 'admin' | 'manager' | 'designer'

// RLS Policies (Supabase)
-- profiles: SELECT own, UPDATE own; admin: ALL
-- orders: SELECT own; admin: ALL
-- products: SELECT is_active; admin: ALL
-- content_blocks: SELECT is_active; admin: ALL
-- design_tokens: SELECT is_active; admin: ALL
-- admin_audit_log: admin only
```

### Session Management
- **Access Token**: JWT, 1hr expiry, stored in HttpOnly cookie
- **Refresh Token**: Rotating, stored in HttpOnly cookie
- **Middleware**: Refreshes on every request (current implementation)
- **Client**: `useAuth` hook listens to `onAuthStateChange`

---

## Payment Integration

### Razorpay (Primary - India)
```typescript
// lib/payments/razorpay.ts
export async function createOrder(amount: number, currency: string, receipt: string, notes: Record<string, string>)
export async function verifyPaymentSignature(orderId: string, paymentId: string, signature: string)
export async function createRefund(paymentId: string, amount: number, reason: string)
export async function fetchPayment(paymentId: string)
export async function createSubscriptionPlan(planData: PlanData)
// Webhook: payment.captured, payment.failed, refund.processed
```

### Stripe (International)
```typescript
// lib/payments/stripe.ts
export async function createPaymentIntent(amount: number, currency: string, metadata: Record<string, string>)
export async function confirmPaymentIntent(paymentIntentId: string, paymentMethodId: string)
export async function createRefund(paymentIntentId: string, amount: number)
export async function createSetupIntent(customerId: string) -- Save card
// Webhook: payment_intent.succeeded, payment_intent.payment_failed, charge.refunded
```

### COD (Cash on Delivery)
- Max amount: ₹10,000 (configurable)
- OTP verification on delivery
- Fee: ₹50 (configurable)
- Available only for serviceable pincodes

### UPI Intent
- Deep links for Google Pay, PhonePe, Paytm, BHIM
- Fallback to Razorpay UPI flow

---

## WhatsApp Business API Integration

### Configuration
```typescript
// lib/whatsapp/config.ts
export const WHATSAPP_CONFIG = {
  phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID!,
  accessToken: process.env.WHATSAPP_ACCESS_TOKEN!,
  appId: process.env.WHATSAPP_APP_ID!,
  appSecret: process.env.WHATSAPP_APP_SECRET!,
  webhookVerifyToken: process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN!,
  businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID!,
}
```

### Flows (Structured Inputs)
1. **Product Browse Flow**: Category → Filters → Product Card → Add to Cart
2. **Checkout Flow**: Contact → Address → Payment → Confirmation
3. **Size Finder Flow**: Measurements → Body Shape → Recommendation
4. **Support Flow**: FAQ → Human Handoff → Ticket Creation
5. **Loyalty Flow**: Points Balance → Rewards Catalog → Redeem

### Templates (Pre-approved)
- `order_confirmed` — Order number, items, total, expected delivery
- `order_shipped` — Tracking number, courier link
- `order_delivered` — Review request, referral code
- `order_cancelled` — Refund timeline
- `back_in_stock` — Product link, size available
- `price_drop` — Old price, new price, product link
- `loyalty_tier_up` — New tier, benefits
- `welcome` — First order coupon, community invite

### Message Handling
```typescript
// Incoming message processor
async function processIncomingMessage(message: WhatsAppMessage) {
  if (message.type === 'text') {
    const intent = await classifyIntent(message.text)
    switch (intent) {
      case 'product_search': return handleProductSearch(message)
      case 'order_status': return handleOrderStatus(message)
      case 'size_help': return handleSizeHelp(message)
      case 'styling_advice': return handleStylingAdvice(message)
      case 'human_handoff': return escalateToHuman(message)
      default: return sendTemplate(message.from, 'main_menu')
    }
  }
  if (message.type === 'interactive') {
    return handleFlowResponse(message.interactive.flow_response)
  }
}
```

---

## Search & Discovery

### Semantic Search (pgvector + Full Text)
```sql
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Add embedding column to products
ALTER TABLE products ADD COLUMN embedding vector(1536);

-- Create index
CREATE INDEX products_embedding_idx ON products USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Hybrid search function
CREATE OR REPLACE FUNCTION hybrid_search(
  query_text TEXT,
  query_embedding VECTOR(1536),
  category_filter UUID[] DEFAULT NULL,
  price_min INT DEFAULT NULL,
  price_max INT DEFAULT NULL,
  size_filter TEXT[] DEFAULT NULL,
  color_filter UUID[] DEFAULT NULL,
  in_stock_only BOOLEAN DEFAULT TRUE,
  limit_count INT DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  sku TEXT,
  slug TEXT,
  name TEXT,
  name_hi TEXT,
  description TEXT,
  price INT,
  compare_at_price INT,
  images JSONB,
  category_name TEXT,
  similarity FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT p.id, p.sku, p.slug, p.name, p.name_hi, p.description,
         COALESCE(pv_min.price, 0) as price,
         COALESCE(pv_min.compare_at_price, 0) as compare_at_price,
         pi.images,
         c.name as category_name,
         (0.7 * (1 - (p.embedding <=> query_embedding)) + 0.3 * ts_rank_cd(p.search_vector, plainto_tsquery('english', query_text))) as similarity
  FROM products p
  LEFT JOIN LATERAL (
    SELECT price, compare_at_price
    FROM product_variants pv
    WHERE pv.product_id = p.id AND pv.is_active = TRUE
    AND (in_stock_only = FALSE OR pv.inventory_quantity > 0)
    ORDER BY pv.price ASC
    LIMIT 1
  ) pv_min ON TRUE
  LEFT JOIN LATERAL (
    SELECT jsonb_agg(jsonb_build_object('url', url, 'alt_text', alt_text, 'type', type) ORDER BY sort_order) as images
    FROM product_images
    WHERE product_id = p.id
  ) pi ON TRUE
  LEFT JOIN categories c ON p.category_id = c.id
  WHERE p.is_active = TRUE
  AND (category_filter IS NULL OR p.category_id = ANY(category_filter))
  AND (price_min IS NULL OR COALESCE(pv_min.price, 0) >= price_min)
  AND (price_max IS NULL OR COALESCE(pv_min.price, 0) <= price_max)
  ORDER BY similarity DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;
```

### Search Features
- **Autocomplete**: Debounced 150ms, shows products + categories + suggestions
- **Typo Tolerance**: pg_trgm similarity + embedding fallback
- **Filters**: Category, size, color, price, occasion, fabric, in-stock, Vidhya's Pick, on-sale
- **Sort**: Newest, price asc/desc, popularity, rating, name
- **Facets**: Count per filter value (for filter UI)
- **Recent Searches**: LocalStorage, synced across devices
- **Trending**: "Others searched for" based on analytics

---

## Image Pipeline

### Upload Flow
```
1. Client → Presigned URL (Supabase Storage) → Direct upload
2. Webhook/Queue → Sharp processing (multiple sizes/formats)
3. CDN → Cloudflare/Vercel Edge cache
4. Database → product_images records with all variants
```

### Transformations (Sharp)
```typescript
// lib/images/transform.ts
const VARIANTS = {
  thumbnail: { width: 150, height: 188, format: 'avif', quality: 70 },      // PLP cards
  small: { width: 320, height: 400, format: 'webp', quality: 80 },          // Mobile PDP
  medium: { width: 640, height: 800, format: 'webp', quality: 85 },         // Desktop PDP
  large: { width: 1280, height: 1600, format: 'webp', quality: 90 },        // Zoom
  hero: { width: 1920, height: 2400, format: 'avif', quality: 90 },         // Hero banners
  og: { width: 1200, height: 630, format: 'webp', quality: 85 },            // Social sharing
}
```

### LQIP (Low Quality Image Placeholders)
- Base64 blur hash (20×20) stored in DB
- Inline in HTML for instant placeholder
- Blur-up animation (CSS filter)

---

## Performance Strategy

### Caching Layers
| Layer | What | TTL | Invalidation |
|-------|------|-----|--------------|
| **Vercel Edge** | Static assets, ISR pages | 1yr / 60s | Deploy / Revalidate API |
| **CDN (Cloudflare)** | Images, fonts, JS/CSS | 1yr | Cache-Tag purge |
| **Supabase** | Query results (PostgREST) | 60s | Realtime invalidation |
| **React Query** | Client queries | 5min | Mutation invalidation |
| **localStorage** | Guest cart, wishlist count | Persistent | Explicit clear |

### Code Splitting
- Route-level: Automatic (App Router)
- Component-level: `dynamic()` for heavy components (Virtual Try-On, Stylist Chat, Admin Editor)
- Library-level: `optimizePackageImports` for framer-motion, lucide-react, date-fns

### Bundle Analysis
```bash
npm run analyze  # @next/bundle-analyzer
# Targets:
# - First Load JS < 170kb (gzipped)
# - Largest page < 250kb
# - No duplicate packages
```

---

## Security Implementation

### Headers (Middleware + Next Config)
```typescript
// middleware.ts additions
const securityHeaders = [
  { key: 'Content-Security-Policy', value: cspHeader }, // Strict CSP
  { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(self)' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  { key: 'Cross-Origin-Resource-Policy', value: 'same-origin' },
]
```

### CSP Policy (Strict)
```
default-src 'self';
script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://checkout.razorpay.com https://connect.facebook.net;
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
font-src 'self' data: https://fonts.gstatic.com;
img-src 'self' data: blob: https://*.supabase.co https://images.unsplash.com https://*.googleusercontent.com https://graph.facebook.com https://*.cloudinary.com;
media-src 'self' https://*.supabase.co;
connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.razorpay.com https://api.stripe.com https://graph.facebook.com;
frame-src https://js.stripe.com https://checkout.razorpay.com;
form-action 'self';
base-uri 'self';
object-src 'none';
```

### Rate Limiting
```typescript
// lib/security/rate-limit.ts
const RATE_LIMITS = {
  auth: { max: 10, window: '15m' },           // 10 attempts per 15 min
  api: { max: 100, window: '1m' },            // 100 req/min
  search: { max: 30, window: '1m' },          // 30 searches/min
  checkout: { max: 5, window: '10m' },        // 5 checkouts/10min
  webhook: { max: 1000, window: '1m' },       // High for webhooks
}
```

### Input Validation (Zod Schemas)
```typescript
// lib/validators/*.ts - Every server action input validated
export const CreateOrderSchema = z.object({
  email: z.string().email(),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/),
  shippingAddress: AddressSchema,
  billingAddress: AddressSchema.optional(),
  paymentMethod: z.enum(['razorpay', 'stripe', 'cod', 'upi']),
  couponCode: z.string().optional(),
  giftWrap: z.boolean().default(false),
  giftMessage: z.string().max(500).optional(),
  whatsappOptIn: z.boolean().default(false),
})
```

---

## Monitoring & Observability

### Vercel Analytics + Custom
- **Web Vitals**: LCP, INP, CLS, TTFB, FCP
- **Custom Events**: Add to cart, Checkout start, Purchase, Search, Size finder use
- **Error Tracking**: Sentry (client + server)
- **Uptime**: Vercel + UptimeRobot

### Supabase Monitoring
- **Database**: Query performance, connection pool, storage
- **Auth**: Sign up/in rates, MFA adoption
- **Realtime**: Connection count, message throughput
- **Storage**: Bandwidth, API calls

### Business Metrics Dashboard (Admin)
- Real-time: Active visitors, carts, checkout, orders/min
- Hourly/Daily: Revenue, orders, AOV, conversion rate
- Cohort: Retention, LTV, repeat purchase rate
- Product: Views, add-to-cart, purchase, return rate
- Campaign: Sent, delivered, opened, clicked, revenue, ROI

---

## CI/CD Pipeline

### GitHub Actions (`.github/workflows/`)
```yaml
# ci.yml
on: [push, pull_request]
jobs:
  typecheck: tsc --noEmit
  lint: eslint + prettier
  test: vitest run --coverage
  e2e: playwright test
  build: next build
  analyze: ANALYZE=true next build
  storybook: build-storybook
  chromatic: npx chromatic --exit-once-uploaded

# deploy-preview.yml
on: pull_request (merged)
jobs:
  deploy: vercel deploy --token --scope

# deploy-production.yml
on: push to main
jobs:
  deploy: vercel deploy --prod --token --scope
  smoke-test: playwright test --project=smoke
  notify: slack/discord webhook
```

### Environment Variables (Vercel + GoDaddy)
```
# Required
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_SITE_URL
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
RAZORPAY_KEY_ID
RAZORPAY_KEY_SECRET
RAZORPAY_WEBHOOK_SECRET
WHATSAPP_PHONE_NUMBER_ID
WHATSAPP_ACCESS_TOKEN
WHATSAPP_WEBHOOK_VERIFY_TOKEN
WHATSAPP_APP_ID
WHATSAPP_APP_SECRET
SENDGRID_API_KEY / NODEMAILER_* (email)
GOOGLE_MAPS_API_KEY (places autocomplete)
SENTRY_DSN
```

---

## Scaling Considerations

### Database
- **Connection Pooling**: PgBouncer (Supabase managed)
- **Read Replicas**: For analytics queries
- **Partitioning**: `analytics_events` by month, `orders` by quarter
- **Archival**: Old orders → cold storage (yearly)

### Edge Functions (Vercel)
- Auth middleware (current)
- Geo-routing (currency/locale)
- A/B testing (edge config)
- Bot detection (Cloudflare Turnstile)

### Background Jobs
- **Supabase Cron**: Daily analytics, inventory alerts, loyalty expiry
- **Vercel Cron**: Revalidation, sitemap generation
- **Queue (Redis/Upstash)**: Email sending, image processing, WhatsApp broadcasts

---

## Disaster Recovery

### Backup Strategy
- **Supabase**: Point-in-time recovery (7 days), daily snapshots
- **Code**: GitHub (primary), Vercel deployments (immutable)
- **Environment**: Documented in 1Password/Vault
- **Runbooks**: Incident response for: payment failure, auth outage, image CDN down, database slow

### Rollback Procedure
1. `vercel rollback [deployment-url]` — Instant
2. Database migrations: Down migrations tested in staging
3. Feature flags (LaunchDarkly/Unleash) for instant kill switches