---
name: admin-panel-spec
description: Admin panel specification for non-technical content management by Vidhya
metadata: 
  node_type: memory
  type: project
  originSessionId: 02c5ce66-d700-4b99-99d4-849096e268e2
---

# Angelika Fashions - Admin Panel Specification

## Design Philosophy
**Zero-Code for Vidhya** — Every content, design, and commerce decision manageable without developer involvement. Visual, intuitive, instant preview.

---

## Information Architecture

### Navigation (Left Sidebar, Collapsible)
```
🏠 Dashboard
📝 Content
   ├── Pages
   ├── Blocks
   └── Design Tokens
🛍️ Commerce
   ├── Products
   ├── Categories
   ├── Collections
   ├── Coupons
   └── Inventory
📦 Orders
   ├── All Orders
   ├── Returns
   └── Shipments
👥 Customers
   ├── All Customers
   ├── Segments
   ├── Loyalty
   └── Referrals
💬 WhatsApp
   ├── Conversations
   ├── Templates
   └── Flows
📊 Analytics
   ├── Overview
   ├── Funnel
   ├── Cohorts
   ├── Products
   └── Campaigns
⚙️ Settings
   ├── General
   ├── Payments
   ├── Shipping
   ├── Taxes
   ├── Emails
   ├── Webhooks
   └── Notifications
🔐 Audit Log
```

---

## Module Specifications

### 1. Dashboard (Real-Time Pulse)
```
┌─────────────────────────────────────────────────────────────────────────┐
│  📈 Overview                    [Today] [Week] [Month] [Custom]        │
├──────────────┬──────────────┬──────────────┬──────────────┬────────────┤
│  💰 Revenue  │  📦 Orders   │  👥 Visitors │  🛒 Active   │  📱 WA     │
│  ₹2,45,670   │  47          │  1,234       │  Carts: 23   │  Msgs: 12  │
│  ▲ +12%      │  ▲ +8%       │  ▼ -3%       │  Checkout: 5 │  ▲ +15%    │
├─────────────────────────────────────────────────────────────────────────┤
│  📊 Real-Time Funnel                                                │
│  Homepage 1,234 → PLP 567 → PDP 234 → Cart 89 → Checkout 67 → ✅ 47 │
│  ████████████  ███████  ██████  ████  ████  ████                    │
├─────────────────────────────────────────────────────────────────────────┤
│  🔔 Alerts                    │  📅 Today's Schedule                │
│  ⚠ 3 products low stock      │  10:00 - WhatsApp broadcast         │
│  ⚠ 2 orders pending >24h     │  14:00 - Vidhya's Edit recording    │
│  ✅ 5 new reviews to moderate │  16:00 - Styling session (Platinum) │
└─────────────────────────────────────────────────────────────────────────┘
```

### 2. Content Management (Block Editor) — **Vidhya's Primary Tool**

#### Page Builder Interface
```
┌─────────────────────────────────────────────────────────────────────────┐
│  Pages                    [+ New Page]  [Device: 💻 📱 📲] [Preview]    │
├─────────────────────────────────────────────────────────────────────────┤
│  🏠 Homepage          │  Published  │  Updated 2h ago  │  [Edit] [⋮]   │
│  📄 Collections       │  Published  │  Updated 1d ago  │  [Edit] [⋮]   │
│  📝 Editorial         │  Draft      │  Updated 3h ago  │  [Edit] [⋮]   │
│  🎁 Festival: Diwali  │  Scheduled  │  Oct 24 10:00    │  [Edit] [⋮]   │
└─────────────────────────────────────────────────────────────────────────┘
```

#### Block Editor (Drag-Drop, Visual)
```
┌─────────────────────────────────────────────────────────────────────────┐
│  ← Blocks Palette                    Canvas (Live Preview)       →     │
│  ┌─────────────────────────┐  ┌─────────────────────────────────────┐ │
│  │ 🎨 LAYOUT               │  │  ┌───────────────────────────────┐  │ │
│  │   Container             │  │  │  🎬 HERO VIDEO                 │  │ │
│  │   Grid                  │  │  │  [Video thumbnail]             │  │ │
│  │   Columns               │  │  │  "Festival Collection Launch"  │  │ │
│  │   Section               │  │  │  [CTA: Shop Now]               │  │ │
│  │   Spacer                │  │  └───────────────────────────────┘  │ │
│  │                         │  │  ┌───────────────────────────────┐  │ │
│  │ 📝 CONTENT              │  │  │  ✏️ RICH TEXT                  │  │ │
│  │   Heading               │  │  │  "Vidhya's Note: This season..."│  │ │
│  │   Text                  │  │  └───────────────────────────────┘  │ │
│  │   Rich Text (TipTap)    │  │  ┌───────────────────────────────┐  │ │
│  │                         │  │  │  🛍️ PRODUCT GRID               │  │ │
│  │ 🛍️ COMMERCE             │  │  │  [Collection: Festive Kurti]   │  │ │
│  │   Product Grid          │  │  │  [4 columns, infinite scroll]  │  │ │
│  │   Product Card          │  │  └───────────────────────────────┘  │ │
│  │   Collection Banner     │  │                                     │ │
│  │   Featured Product      │  │  [+] Add Block                     │ │
│  │   Cart Drawer Trigger   │  └─────────────────────────────────────┘ │
│  │                         │                                         │
│  │ 📱 SOCIAL               │  📱 Mobile Preview (375px)              │
│  │   Instagram Feed        │  ┌─────────────┐                        │
│  │   WhatsApp Button       │  │  [Content]  │                        │
│  │                         │  └─────────────┘                        │
│  │ 🌟 BRAND                │                                         │
│  │   Vidhya's Note         │  ⚙️ Selected Block Settings (Right)     │
│  │   Size Guide            │  ┌─────────────────────────────────┐    │
│  │   Fabric Swatch         │  │ Block: Hero Video               │    │
│  │   Story Timeline        │  │ ─────────────────────────────   │    │
│  │                         │  │ Video URL: [________________]   │    │
│  │ 🔧 ADVANCED             │  │ Poster: [Upload]                │    │
│  │   Custom HTML           │  │ Headline: [________________]    │    │
│  │   Custom React          │  │ Subtitle: [________________]    │    │
│  │   Form                  │  │ CTA Text: [Shop Now]            │    │
│  │   Accordion             │  │ CTA Link: [/collections/festive]│    │
│  │   Tabs                  │  │ Aspect: [16:9 ▼]                │    │
│  └─────────────────────────┘  │ Autoplay: [☑] Muted: [☑]       │    │
│                               │ Padding: [T:32 B:32 L:24 R:24] │    │
│                               │ BG Color: [Color Picker]        │    │
│                               │ ─────────────────────────────   │    │
│                               │ [Duplicate] [Delete] [Move ↑↓]  │    │
│                               └─────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────┘
```

#### Block Types & Settings Schema
```typescript
// Each block has: type, label, icon, category, defaultContent, settingsSchema
const BLOCK_DEFINITIONS = {
  // Layout
  container: { children: [], maxWidth: 'container', padding: 'md' },
  grid: { columns: { desktop: 4, tablet: 2, mobile: 1 }, gap: 'md', children: [] },
  columns: { ratios: [1,1], gap: 'lg', children: [] },
  section: { background: 'none', padding: 'xl', children: [] },
  spacer: { height: 'md' },

  // Content
  heading: { level: 2, text: '', alignment: 'center', color: 'ink' },
  text: { content: '', size: 'body', alignment: 'left', color: 'slate' },
  rich_text: { content: '', html: '' }, // TipTap editor

  // Media
  image: { src: '', alt: '', aspect: '4:5', link: '', overlay: '' },
  video: { src: '', poster: '', autoplay: true, muted: true, loop: true, aspect: '16:9', cta: {} },

  // Commerce
  product_grid: { collectionId: '', limit: 8, columns: 4, showFilters: false, loadMore: true },
  product_card: { productId: '', variant: 'default', showQuickAdd: true },
  collection_banner: { collectionId: '', image: '', headline: '', subtext: '', cta: {} },
  featured_product: { productId: '', variantId: '', layout: 'side-by-side' },
  cart_drawer_trigger: { showCount: true, iconOnly: false },

  // Social
  instagram_feed: { hashtag: '', limit: 6, columns: 3, showCaption: false },
  whatsapp_button: { text: 'Chat with Vidhya', prefilledMessage: '' },

  // Brand
  vidyas_note: { title: "Vidhya's Note", content: '', contentHi: '', image: '', signature: true },
  size_guide: { categoryId: '', showMeasurements: true, showFitPredictor: true },
  fabric_swatch: { productId: '', requestEnabled: true },
  story_timeline: { events: [{date, title, description, image}] },

  // Advanced
  custom_html: { html: '', css: '' },
  custom_react: { componentName: '', props: {} },
  form: { fields: [], submitAction: '', successMessage: '' },
  accordion: { items: [{title, content}], allowMultiple: false },
  tabs: { tabs: [{label, content}], defaultTab: 0 },
}
```

#### Design Tokens UI (Live Theme Editor)
```
┌─────────────────────────────────────────────────────────────────────────┐
│  Design Tokens                    [Version: v2.3.1] [History] [Publish] │
├─────────────────────────────────────────────────────────────────────────┤
│  Tabs: 🎨 Colors  📝 Typography  📏 Spacing  🌫️ Shadows  🔘 Radius      │
│           ⏱️ Animations  📐 Breakpoints  📦 Z-Index                     │
├─────────────────────────────────────────────────────────────────────────┤
│  Colors → Groups: Core, Brand, Semantic, Category                      │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ Core Neutrals                              │  Light  │  Dark   │   │
│  │  --color-ink        ████████ #0D0D0D      │  #0D0D0D│ #FAFAFA │   │
│  │  --color-charcoal   ████████ #1A1A1A      │  #1A1A1A│ #F5F5F5 │   │
│  │  --color-slate      ████████ #4A4A4A      │  #4A4A4A│ #D4D4D4 │   │
│  │  ...                                        │         │         │   │
│  ├─────────────────────────────────────────────────────────────────┤   │
│  │ Brand Gold                                  │  Light  │  Dark   │   │
│  │  --color-gold       ████████ #C9A84C      │  #C9A84C│ #D4B85C │   │
│  │  --color-gold-hover ████████ #B8963D      │  #B8963D│ #E0C870 │   │
│  │  ...                                        │         │         │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  [+ Add Token]  [Import JSON]  [Export JSON]  [Generate CSS Variables] │
│                                                                         │
│  🔴 LIVE PREVIEW (Right panel updates instantly as you change tokens)  │
└─────────────────────────────────────────────────────────────────────────┘
```

---

### 3. Product Management

#### Product List
```
┌─────────────────────────────────────────────────────────────────────────┐
│  Products                    [+ New Product]  [Import CSV] [Export]     │
│  Filters: [Search] [Category ▼] [Status ▼] [Stock ▼] [Price Range]     │
├────┬──────────┬──────────┬────────┬────────┬────────┬────────┬────────┤
│ ✓  │ Image    │ Name/SKU │ Category│ Price  │ Stock  │ Status │ Actions│
├────┼──────────┼──────────┼────────┼────────┼────────┼────────┼────────┤
│ ☐  │ [img]    │ Chikan.. │ Kurti   │ ₹2,499 │  47    │ Active │ [⋮]    │
│    │          │ SKU: CK001│         │        │        │        │        │
├────┼──────────┼──────────┼────────┼────────┼────────┼────────┼────────┤
│ ☐  │ [img]    │ Silk Leh.│ Lehenga │ ₹18,999│  3     │ Low    │ [⋮]    │
│    │          │ SKU: SL042│         │        │ ⚠ Low  │        │        │
└────┴──────────┴──────────┴────────┴────────┴────────┴────────┴────────┘
Bulk Actions: [Status ▼] [Category ▼] [Delete] [Export Selected] [Apply]
```

#### Product Editor (Tabbed, Comprehensive)
```
Tabs: 📝 Basics  🎨 Variants  🖼️ Images  🔍 SEO  📅 Schedule  📦 Inventory  🏷️ Attributes

┌─────────────────────────────────────────────────────────────────────────┐
│  BASICS                                                                 │
├─────────────────────────────────────────────────────────────────────────┤
│  SKU: [CK001]          Slug: [chikankari-kurti-ivory]  [Generate]      │
│  Name: [Chikankari Kurti - Ivory]    Name (Hindi): [चिकनकारी कुर्ती]  │
│  Description: [Rich Text Editor - TipTap]                              │
│  Short Description: [200 chars max]                                    │
│  Description (Hindi): [Rich Text Editor]                               │
│                                                                         │
│  Category: [Kurti ▼]    Subcategory: [Chikankari ▼]                   │
│  Fabric: [Primary: Cotton] [Composition: 100% Cotton] [Origin: Lucknow]│
│  [Care: ☑ Gentle wash ☑ Iron low ☐ Dry clean ☐ Shade dry]             │
│  Certifications: [☐ GOTS ☐ OEKO-TEX ☐ Handloom Mark]                  │
│                                                                         │
│  Occasion: [☑ Daily ☑ Office ☑ Festive ☐ Wedding ☐ Bridal]           │
│  Tags: [chikankari, hand-embroidered, summer, breathable, vidyas-pick]│
│                                                                         │
│  Vidhya's Note: [Rich Text - Her personal styling tips]               │
│  Vidhya's Note (Hindi): [Rich Text]                                    │
│                                                                         │
│  Status: [☑ Active] [☑ Featured] [☑ Vidhya's Pick]                    │
│  GST Slab: [5% ▼]    HSN Code: [6109]                                 │
│                                                                         │
│  Meta Title: [Chikankari Kurti Ivory | Angelika Fashions]             │
│  Meta Description: [Hand-embroidered cotton kurti...]                 │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│  VARIANTS (Matrix Editor)                                               │
├─────────────────────────────────────────────────────────────────────────┤
│  Sizes: [XS] [S] [M] [L] [XL] [XXL] [+ Add Size]                       │
│  Colors: [Ivory █] [Blush █] [Sage █] [+ Add Color]                    │
├────────┬──────┬──────┬──────┬──────┬──────┬──────┬──────┬──────┬──────┤
│        │ Ivory│ Blush│ Sage │      │      │      │      │      │      │
├────────┼──────┼──────┼──────┼──────┼──────┼──────┼──────┼──────┼──────┤
│ XS     │ 🟢 12│ 🟢 8 │ 🔴 0 │      │      │      │      │      │      │
│ S      │ 🟢 24│ 🟢 15│ 🟢 5 │      │      │      │      │      │      │
│ M      │ 🟢 31│ 🟢 22│ 🟢 10│      │      │      │      │      │      │
│ L      │ 🟢 18│ 🟢 12│ 🟡 3 │      │      │      │      │      │      │
│ XL     │ 🟢 9 │ 🟡 2 │ 🔴 0 │      │      │      │      │      │      │
│ XXL    │ 🟡 2 │ 🔴 0 │ 🔴 0 │      │      │      │      │      │      │
├────────┴──────┴──────┴──────┴──────┴──────┴──────┴──────┴──────┴──────┤
│  Cell click → Inline edit: Price, Compare At, Cost, Stock, Low Thresh, │
│  Weight, Barcode, Active, Sort Order                                   │
│  [Bulk Edit Row] [Bulk Edit Col] [Generate SKUs] [Sync Inventory]      │
└─────────────────────────────────────────────────────────────────────────┘
```

---

### 4. Order Management

#### Order List
```
┌─────────────────────────────────────────────────────────────────────────┐
│  Orders                      Filters: [Status] [Payment] [Date] [Search]│
├────┬──────────┬──────────┬────────┬────────┬────────┬────────┬────────┤
│ ✓  │ Order #  │ Customer │ Items  │ Total  │ Status │ Payment │ Actions│
├────┼──────────┼──────────┼────────┼────────┼────────┼────────┼────────┤
│ ☐  │ ORD-2024 │ Priya S. │ 3      │ ₹8,499 │ Shipped│ Paid    │ [View] │
│    │ 001234   │ priya@.. │        │        │ 📦     │ 💳      │        │
├────┼──────────┼──────────┼────────┼────────┼────────┼────────┼────────┤
│ ☐  │ ORD-2024 │ Rahul K. │ 1      │ ₹18,999│ Pending│ COD     │ [View] │
│    │ 001233   │ rahul@.. │        │        │ ⏳     │ 💰      │        │
└────┴──────────┴──────────┴────────┴────────┴────────┴────────┴────────┘
Bulk: [Update Status ▼] [Assign Courier ▼] [Print Invoices] [Export CSV] [Bulk Refund]
```

#### Order Detail (Comprehensive)
```
┌─────────────────────────────────────────────────────────────────────────┐
│  ORD-2024001234  [Print Invoice] [Shipping Label] [Status: Shipped ▼]   │
├─────────────────────────┬───────────────────────────────────────────────┤
│  👤 CUSTOMER            │  📦 ITEMS                                     │
│  Priya Sharma           │  ┌─────────────────────────────────────────┐  │
│  priya.sharma@email.com │  │ Chikankari Kurti - Ivory                │  │
│  +91 98765 43210        │  │ Size: M  Color: Ivory  Qty: 1  ₹2,499   │  │
│  Gold Member (1,200 pts)│  │ Silk Lehenga - Blush                    │  │
│  12 orders • ₹1.2L spent │  │ Size: L  Color: Blush  Qty: 1  ₹18,999  │  │
│  [View Profile]         │  │ Cotton Dupatta - Sage                   │  │
│                         │  │ Size: -  Color: Sage   Qty: 1  ₹1,499   │  │
├─────────────────────────┼───────────────────────────────────────────────┤
│  📍 SHIPPING            │  💳 PAYMENT                                   │
│  Priya Sharma           │  Method: Razorpay (UPI)                     │
│  123 MG Road, Apt 4B    │  Status: Paid                               │
│  Bangalore, KA 560001   │  Payment ID: pay_abc123                     │
│  +91 98765 43210        │  Amount: ₹22,997                            │
│  [Edit Address]         │  [View Transaction] [Refund ₹]              │
├─────────────────────────┼───────────────────────────────────────────────┤
│  📋 TIMELINE            │  📝 NOTES                                     │
│  ● Oct 20 10:30  Order Placed          Vidhya's Note: "Perfect for    │
│  ● Oct 20 10:31  Payment Confirmed      Diwali morning pooja!"        │
│  ● Oct 21 09:15  Processing             [Add Internal Note]           │
│  ● Oct 22 14:20  Shipped (Delhivery)    [Customer Note: "Gift wrap"]  │
│  ● Oct 24 11:00  Out for Delivery       │                              │
│  ○ Oct 25        Estimated Delivery     │                              │
│  [Add Timeline Event]                    │                              │
├─────────────────────────┴───────────────────────────────────────────────┤
│  🔄 RETURNS/EXCHANGES                                                   │
│  [+ New Return]  [View All Returns for this Order]                     │
└─────────────────────────────────────────────────────────────────────────┘
```

---

### 5. Customer Management

#### Customer List
```
┌─────────────────────────────────────────────────────────────────────────┐
│  Customers                [Segments ▼] [Filters] [Export]               │
├────┬──────────┬──────────┬────────┬────────┬────────┬────────┬────────┤
│ ✓  │ Name     │ Email    │ Tier   │ Orders │ Spent  │ Last   │ Status │
├────┼──────────┼──────────┼────────┼────────┼────────┼────────┼────────┤
│ ☐  │ Priya S. │ priya@.. │ Gold   │ 12     │ ₹1.2L  │ 2d ago │ Active │
│ ☐  │ Rahul K. │ rahul@.. │ Silver │ 3      │ ₹24,999│ 15d ago│ Active │
│ ☐  │ Anjali M.| anjali@..│ Plat.  │ 47     │ ₹8.4L  │ 1d ago │ Active │
└────┴──────────┴──────────┴────────┴────────┴────────┴────────┴────────┘
```

#### Customer 360 (Single View)
```
┌─────────────────────────────────────────────────────────────────────────┐
│  Anjali Mehta (Platinum)  [Edit] [Notes] [WhatsApp] [Block]            │
├─────────────────────────────────────────────────────────────────────────┤
│  📊 SUMMARY          │  📦 ORDERS (47)    │  ❤️ WISHLIST (12)          │
│  Total Spent: ₹8.4L  │  [Table with      │  [Grid with product cards]  │
│  Avg Order: ₹18,000  │   status, date,   │                              │
│  Lifetime: 2.3 yrs  │   amount, items]   │                              │
│  Last Order: 1d ago │                    │                              │
│  Referrals: 8       │                    │                              │
├─────────────────────────────────────────────────────────────────────────┤
│  📏 MEASUREMENTS    │  ⭐ REVIEWS (15)   │  💬 WHATSAPP (23 convos)    │
│  Bust: 92cm         │  [List with       │  [Recent messages,           │
│  Waist: 76cm        │   ratings, photos]│   AI summary, tags]         │
│  Hip: 98cm          │                    │                              │
│  Shape: Hourglass   │                    │                              │
│  [Edit]             │                    │                              │
├─────────────────────────────────────────────────────────────────────────┤
│  🎁 LOYALTY         │  🎯 REFERRALS      │  📝 NOTES                   │
│  Tier: Platinum     │  Code: ANJALI2024  │  "Prefers pastel colors,    │
│  Points: 24,500     │  Referred: 8       │  loves chikankari,          │
│  Next: N/A (max)    │  Earned: ₹4,000     │  size M usually,           │
│  History: [View]    │  Pending: 2        │  WhatsApp preferred"        │
│                     │                    │  [Add Note]                 │
└─────────────────────────────────────────────────────────────────────────┘
```

---

### 6. WhatsApp Management

#### Conversations (Inbox Style)
```
┌─────────────────────────────────────────────────────────────────────────┐
│  Conversations          [Status: All ▼] [Assignee: All ▼] [Search]      │
├─────────────────────────────────────────────────────────────────────────┤
│  🟢 +91 98765 43210  Priya Sharma     "What's my order status?"  2m ago│
│  🟡 +91 87654 32109  Rahul Kumar      "Need help with size"      15m ago│
│  🔴 +91 76543 21098  (Unknown)        "Hi"                       1h ago │
└─────────────────────────────────────────────────────────────────────────┘
```

#### Conversation Detail (Split View)
```
┌─────────────────────────────────────────────────────────────────────────┐
│  +91 98765 43210 • Priya Sharma (Gold)  [Status: Open ▼] [Assign: Me]  │
├──────────────────────────────────┬──────────────────────────────────────┤
│  MESSAGES                        │  CONTEXT                             │
│  ┌────────────────────────────┐  │  👤 Customer: Priya Sharma           │
│  │ 🤖 Bot  10:30  Welcome!    │  │  📦 Recent Order: ORD-001234       │
│  │ 👤 User 10:31  Order status│  │  📍 Shipping: Bangalore            │
│  │ 🤖 Bot 10:31  Your order...│  │  ❤️ Wishlist: 3 items              │
│  │ 👤 User 10:32  Thanks!     │  │  📏 Measurements: Saved            │
│  │ 🟢 You  10:33  Happy to help│  │  🎁 Loyalty: Gold (5,200 pts)      │
│  └────────────────────────────┘  │  🏷️ Tags: [VIP] [Repeat] [Size Help]│
│  [Type message...] [📎] [😊]    │  [Add Tag] [Create Ticket]           │
│  Quick Replies: [Order Status] [Size Help] [Return] [Talk to Vidhya]   │
├──────────────────────────────────┴──────────────────────────────────────┤
│  AI SUGGESTION: "Customer asking about order ORD-001234. Shipped Oct 22 │
│  via Delhivery. Tracking: 1234567890. Estimated delivery: Oct 24."     │
│  [Use Suggestion] [Dismiss]                                             │
└─────────────────────────────────────────────────────────────────────────┘
```

#### Templates & Flows Manager
```
Tabs: 📋 Templates  🔄 Flows

TEMPLATES:
┌─────────────────────────────────────────────────────────────────────────┐
│  Name              │ Category     │ Language │ Status    │ Actions     │
├────────────────────┼──────────────┼──────────┼───────────┼─────────────┤
│  order_confirmed   │ Utility      │ en_IN    │ Approved  │ [Edit] [⋮]  │
│  order_shipped     │ Utility      │ en_IN    │ Approved  │ [Edit] [⋮]  │
│  back_in_stock     │ Marketing    │ en_IN    │ Pending   │ [Edit] [⋮]  │
│  festive_collection│ Marketing    │ hi_IN    │ Approved  │ [Edit] [⋮]  │
└─────────────────────────────────────────────────────────────────────────┘
[+ New Template] → Category → Language → Components (Header/Body/Footer/Buttons)

FLOWS:
┌─────────────────────────────────────────────────────────────────────────┐
│  Name              │ Status    │ Screens │ Last Edited │ Actions       │
├────────────────────┼───────────┼─────────┼─────────────┼───────────────┤
│  Product Browse    │ Published │ 4       │ 2d ago      │ [Edit] [⋮]    │
│  Checkout          │ Published │ 6       │ 1d ago      │ [Edit] [⋮]    │
│  Size Finder       │ Draft     │ 3       │ 3h ago      │ [Edit] [⋮]    │
└─────────────────────────────────────────────────────────────────────────┘
```

---

### 7. Analytics Dashboard

#### Overview
```
┌─────────────────────────────────────────────────────────────────────────┐
│  Analytics                    [Last 7d ▼] [Compare to Previous]         │
├──────────────┬──────────────┬──────────────┬──────────────┬────────────┤
│  💰 Revenue  │  📦 Orders   │  👥 Customers│  🛍️ AOV     │  🔄 Repeat │
│  ₹12.4L      │  342         │  287         │  ₹3,626     │  38%       │
│  ▲ +15%      │  ▲ +12%      │  ▲ +8%       │  ▲ +3%      │  ▲ +2%     │
├─────────────────────────────────────────────────────────────────────────┤
│  📈 Revenue Trend (Line chart: Daily, WoW, MoM)                        │
│  📊 Funnel: Homepage → PLP → PDP → Cart → Checkout → Purchase          │
│  100%     45%      28%      12%      8%        3.5%                    │
├─────────────────────────────────────────────────────────────────────────┤
│  🏆 Top Products          │  📱 Channel Attribution                   │
│  1. Chikankari Kurti  ₹3.2L│  Direct 35%  Organic 25%  WhatsApp 20%  │
│  2. Silk Lehenga     ₹2.8L│  Email 10%   Referral 5%   Social 5%      │
│  3. Cotton Dupatta   ₹1.1L│                                             │
├─────────────────────────────────────────────────────────────────────────┤
│  🌍 Geographic (India Map)  │  📱 Device: Mobile 78%  Desktop 20%  Tab 2%│
└─────────────────────────────────────────────────────────────────────────┘
```

---

### 8. Settings (Comprehensive)

#### General
- Site name, description, URL, contact info, address
- Currency (INR primary, USD/EUR support), timezone, language
- Maintenance mode + custom message

#### Payments
- Razorpay: Key ID, Secret, Webhook Secret, Test/Live toggle
- Stripe: Publishable, Secret, Webhook Secret, Test/Live
- COD: Enabled, Max Amount (₹10,000), Fee (₹50)
- UPI: Enabled, supported apps

#### Shipping
- Free shipping threshold (₹999)
- Default shipping cost (₹99)
- Shipping zones (states → cost, days, free threshold)
- Courier partners (Delhivery, BlueDart, Ecom, XpressBees) with API keys
- Pickup points enable/disable

#### Taxes
- GST enabled, slabs (5%, 12%, 18%), HSN codes
- Inclusive pricing toggle
- Invoice prefix/series

#### Emails
- SMTP config (host, port, user, pass)
- From name/email
- Templates: Order confirmed, Shipped, Delivered, Cancelled, Return, Welcome, Abandoned cart, Review request, Loyalty tier up, Referral, Newsletter

#### Webhooks
- URLs for: Order created/confirmed/shipped/delivered/cancelled, Payment received/failed, Return requested/completed, Inventory low, Customer created

#### Notifications
- Email/WhatsApp/Slack/Discord toggles per event
- Webhook URLs for Slack/Discord

---

## Technical Implementation

### Admin Route Structure (Next.js App Router)
```
app/(admin)/
├── layout.tsx           # AdminLayout + Auth check (role: admin/manager/designer)
├── page.tsx             # Dashboard
├── content/
│   ├── page.tsx         # Pages list
│   ├── [id]/page.tsx    # Block editor
│   └── tokens/page.tsx  # Design tokens UI
├── products/
│   ├── page.tsx         # List + filters
│   ├── new/page.tsx     # Create (redirects to [id])
│   └── [id]/page.tsx    # Editor (tabs)
├── orders/
│   ├── page.tsx
│   └── [id]/page.tsx
├── customers/
│   ├── page.tsx
│   └── [id]/page.tsx
├── whatsapp/
│   ├── page.tsx
│   ├── templates/page.tsx
│   └── flows/page.tsx
├── analytics/page.tsx
└── settings/page.tsx
```

### Admin Providers
```typescript
// lib/admin/AdminProvider.tsx
export function AdminProvider({ children }) {
  const { user, profile } = useAuth()
  const [designTokens, setDesignTokens] = useState<DesignTokens>()
  const [blocks, setBlocks] = useState<ContentBlockData[]>()
  
  // Fetch on mount
  useEffect(() => {
    fetchDesignTokens()
    fetchContentBlocks()
  }, [])
  
  // Real-time sync
  useEffect(() => {
    const channel = supabaseAdmin
      .channel('admin_tokens')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'design_tokens' }, 
        () => fetchDesignTokens())
      .subscribe()
    return () => channel.unsubscribe()
  }, [])
  
  return (
    <AdminContext.Provider value={{ designTokens, blocks, user, profile, refreshTokens, refreshBlocks }}>
      {children}
    </AdminContext.Provider>
  )
}
```

### Component Library (Admin-Specific)
- `DataTable` — Sortable, filterable, paginated, selectable, bulk actions
- `FormBuilder` — Dynamic forms from Zod schemas
- `BlockEditor` — Drag-drop (dnd-kit), live preview, settings panel
- `TokenEditor` — Grouped inputs, color pickers, live preview
- `VariantMatrix` — Size×Color grid with inline editing
- `OrderTimeline` — Visual status tracker, editable events
- `Customer360` — Tabbed sections, real-time data
- `WhatsAppInbox` — Split view, AI suggestions, quick replies
- `AnalyticsCharts` — Recharts + Vercel Analytics integration

---

## Accessibility & UX Standards
- **Keyboard-first**: Every action via Tab/Enter/Escape
- **Screen reader**: ARIA labels, live regions for dynamic content
- **Focus management**: Trap in modals, restore on close
- **Loading states**: Skeletons for all async data
- **Empty states**: Illustrated, actionable ("Create your first product")
- **Error states**: Inline + toast, retry actions
- **Confirmation**: Destructive actions require typed confirmation
- **Undo**: Toast with undo for delete/archive actions (5s)
- **Responsive**: Works on tablet (Vidhya may use iPad)

---

## Deployment & Sync
- **Design Tokens**: Admin UI → Supabase `design_tokens` → Build script → CSS variables → Vercel deploy
- **Content Blocks**: Admin UI → Supabase `content_blocks` → ISR revalidate → Live instantly
- **Products**: Admin UI → Supabase → Search index rebuild (pgvector) → Live
- **Version Control**: Every token/content change = new version in DB, rollback one-click
- **Audit Trail**: Every admin action logged to `admin_audit_log` (who, what, when, old/new)