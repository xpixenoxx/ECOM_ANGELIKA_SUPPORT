---
name: design-system
description: "Premium design system: colors, typography, spacing, animations, component specs"
metadata: 
  node_type: memory
  type: reference
  originSessionId: 02c5ce66-d700-4b99-99d4-849096e268e2
---

# Angelika Fashions - Premium Design System

## Brand Identity
**Founder**: Vidhya
**Positioning**: Modern Indian luxury — rooted in craft, elevated for today
**Voice**: Warm, knowledgeable, personal, culturally fluent
**Promise**: "Clothes that know you" — fit, occasion, heritage

---

## Color Palette (Premium, Customized)

### Core Neutrals
| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `--color-ink` | `#0D0D0D` | `#FAFAFA` | Primary text, headings |
| `--color-charcoal` | `#1A1A1A` | `#F5F5F5` | Secondary text, borders |
| `--color-slate` | `#4A4A4A` | `#D4D4D4` | Muted text, placeholders |
| `--color-mist` | `#737373` | `#A3A3A3` | Disabled, subtle labels |
| `--color-whisper` | `#E5E5E5` | `#2A2A2A` | Borders, dividers, inputs |
| `--color-snow` | `#FAFAFA` | `#1A1A1A` | Surface backgrounds |
| `--color-white` | `#F3EEE8` | `#0D0D0D` | Card backgrounds, modals |

### Brand Gold (Signature)
| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `--color-gold` | `#C9A84C` | `#D4B85C` | Primary CTAs, links, accents |
| `--color-gold-hover` | `#B8963D` | `#E0C870` | Hover states |
| `--color-gold-light` | `#F5EBCC` | `#3D351A` | Badges, backgrounds, focus rings |
| `--color-gold-muted` | `#E8D8A8` | `#4A3E1A` | Subtle accents, disabled gold |

### Semantic Colors
| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `--color-success` | `#1B7A3D` | `#4ADE80` | Success states, added to cart |
| `--color-success-bg` | `#E8F5EB` | `#0F2A18` | Success backgrounds |
| `--color-warning` | `#B8741A` | `#FBBF24` | Low stock, pending |
| `--color-warning-bg` | `#FFF8E1` | `#3D2E0A` | Warning backgrounds |
| `--color-error` | `#C02B2B` | `#F87171` | Errors, out of stock |
| `--color-error-bg` | `#FDEDEC` | `#3D0F0F` | Error backgrounds |
| `--color-info` | `#1A73E8` | `#60A5FA` | Info, WhatsApp actions |
| `--color-info-bg` | `#E8F0FE` | `#0F1E3A` | Info backgrounds |

### Category Accents (Ethnic Wear Specific)
| Category | Token | Light | Dark | Cultural Reference |
|----------|-------|-------|------|-------------------|
| **Kurti** | `--color-kurti` | `#C9A84C` | `#D4B85C` | Gold — versatile, everyday luxury |
| **Salwar** | `--color-salwar` | `#D4A574` | `#DBAE85` | Warm sand — comfort, foundation |
| **Lehenga** | `--color-lehenga` | `#C46E6E` | `#D18585` | Deep rose — celebration, bridal |
| **Saree** | `--color-saree` | `#7A9E9E` | `#8DB5B5` | Teal — heritage, drape, elegance |
| **Dupatta** | `--color-dupatta` | `#A890C8` | `#B8A5D4` | Lavender — grace, accent piece |

> **Usage Rule**: Category accents appear ONLY on category pages, product badges, and filtering UI. Never on primary CTAs — gold owns conversion.

---

## Typography (Expressive, Readable, Premium)

### Font Families
```css
--font-display: 'Cormorant Garamond', Georgia, serif;     /* Headlines, hero, editorial */
--font-body: 'DM Sans', system-ui, sans-serif;             /* UI, body, buttons */
--font-mono: 'DM Sans', monospace;                         /* Prices, SKUs, codes */
```

### Type Scale (Fluid, Clamp-based)
| Token | Desktop | Mobile | Line Height | Weight | Letter Spacing | Transform |
|-------|---------|--------|-------------|--------|----------------|-----------|
| `display-xl` | `clamp(48px, 6vw, 72px)` | `clamp(36px, 8vw, 48px)` | 1.1 | 500 | 0.06em | — |
| `display-lg` | `clamp(40px, 5vw, 56px)` | `clamp(32px, 7vw, 40px)` | 1.15 | 500 | 0.04em | — |
| `display-md` | `clamp(32px, 4vw, 40px)` | `clamp(28px, 6vw, 32px)` | 1.2 | 400 | 0.02em | — |
| `display-sm` | `clamp(24px, 3vw, 28px)` | `clamp(22px, 5vw, 24px)` | 1.3 | 400 | — | — |
| `heading-lg` | `24px` | `22px` | 1.33 | 600 | 0.01em | — |
| `heading-md` | `20px` | `18px` | 1.4 | 500 | — | — |
| `heading-sm` | `16px` | `16px` | 1.5 | 600 | 0.02em | uppercase |
| `body-lg` | `18px` | `17px` | 1.55 | 400 | — | — |
| `body` | `16px` | `16px` | 1.5 | 400 | — | — |
| `body-sm` | `14px` | `14px` | 1.43 | 400 | — | — |
| `caption` | `12px` | `12px` | 1.33 | 400 | 0.04em | — |
| `price` | `20px` | `18px` | 1.4 | 600 | — | tabular-nums |
| `price-lg` | `28px` | `24px` | 1.3 | 700 | — | tabular-nums |
| `overline` | `11px` | `11px` | 1.45 | 600 | 0.12em | uppercase |

> **Rule**: Display faces (Cormorant) for emotional/editorial moments. Body faces (DM Sans) for functional UI. Prices always tabular-nums mono.

---

## Spacing System (4px Base, Harmonic Scale)

| Token | Value | Rem | Usage |
|-------|-------|-----|-------|
| `--space-1` | 4px | 0.25rem | Micro gaps, inline gaps |
| `--space-2` | 8px | 0.5rem | Base unit, icon gaps |
| `--space-3` | 12px | 0.75rem | Form fields, card padding |
| `--space-4` | 16px | 1rem | Standard gap, container padding |
| `--space-5` | 20px | 1.25rem | Section internal spacing |
| `--space-6` | 24px | 1.5rem | Card gaps, grid gutters |
| `--space-8` | 32px | 2rem | Section spacing, drawer padding |
| `--space-10` | 40px | 2.5rem | Large section gaps |
| `--space-12` | 48px | 3rem | Major section breaks |
| `--space-16` | 64px | 4rem | Page-level spacing |
| `--space-20` | 80px | 5rem | Hero sections |
| `--space-24` | 96px | 6rem | Major editorial breaks |
| `--space-32` | 128px | 8rem | Full-screen hero |

> **Fluid Spacing**: Use `clamp(--space-4, 3vw, --space-8)` for responsive gaps.

---

## Border Radius (Organic, Premium)

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-xs` | 4px | Tags, badges, small chips |
| `--radius-sm` | 8px | Inputs, buttons, small cards |
| `--radius-md` | 12px | Standard cards, modals, dropdowns |
| `--radius-lg` | 16px | Product cards, feature cards |
| `--radius-xl` | 20px | Hero elements, large modals |
| `--radius-2xl` | 28px | Full-screen sheets, hero images |
| `--radius-full` | 9999px | Pills, avatars, floating buttons |

---

## Shadows (Layered, Gold-Tinted)

| Token | Value | Usage |
|-------|-------|-------|
| `--shadow-xs` | `0 1px 2px rgba(13,13,13,0.04)` | Subtle dividers |
| `--shadow-sm` | `0 2px 8px rgba(13,13,13,0.06)` | Cards, dropdowns |
| `--shadow-md` | `0 4px 16px rgba(13,13,13,0.08)` | Elevated cards, modals |
| `--shadow-lg` | `0 8px 32px rgba(13,13,13,0.1)` | Drawers, sheets |
| `--shadow-xl` | `0 16px 48px rgba(13,13,13,0.12)` | Full-screen modals |
| `--shadow-2xl` | `0 24px 64px rgba(13,13,13,0.15)` | Maximum elevation |
| `--shadow-gold` | `0 8px 24px rgba(201,168,76,0.25)` | **Primary CTA, key interactions** |
| `--shadow-focus` | `0 0 0 3px rgba(201,168,76,0.4)` | Focus rings |
| `--shadow-card` | `0 2px 12px rgba(13,13,13,0.05)` | Product cards (default) |
| `--shadow-elevated` | `0 12px 40px rgba(13,13,13,0.1)` | Hovered product cards |

---

## Animation System (Premium, Purposeful)

### Easing Curves (Cubic-Bezier)
| Token | Value | Feel | Usage |
|-------|-------|------|-------|
| `--ease-standard` | `cubic-bezier(0.25, 0.46, 0.45, 0.94)` | Natural, balanced | Default transitions |
| `--ease-expressive` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Springy, lively | Entrances, celebrations |
| `--ease-spring` | `cubic-bezier(0.175, 0.885, 0.32, 1.275)` | Bouncy, playful | Success states, morphing |
| `--ease-decelerate` | `cubic-bezier(0, 0, 0.2, 1)` | Smooth exit | Exits, dismissals |
| `--ease-accelerate` | `cubic-bezier(0.4, 0, 1, 1)` | Urgent, direct | Loading, errors |
| `--ease-magnetic` | `cubic-bezier(0.23, 1, 0.32, 1)` | Magnetic pull | Magnetic buttons, cursor followers |

### Duration Scale
| Token | Value | Usage |
|-------|-------|-------|
| `--duration-instant` | 75ms | Micro-interactions (ripple, focus) |
| `--duration-fast` | 150ms | Button states, simple toggles |
| `--duration-base` | 250ms | **Default** — modals, drawers, toasts |
| `--duration-slow` | 400ms | Page transitions, complex reveals |
| `--duration-slower` | 600ms | Hero animations, onboarding |
| `--duration-slowest` | 800ms | Celebration sequences (confetti, morph) |

### Magnetic Button Config (Signature Interaction)
```css
--magnetic-strength: 0.3;     /* Pull toward cursor (0-1) */
--magnetic-radius: 60px;      /* Activation distance */
--magnetic-damping: 0.8;      /* Spring return smoothness */
--magnetic-stiffness: 300;    /* Spring tension */
```

### Stagger System
| Token | Value | Usage |
|-------|-------|-------|
| `--stagger-base` | 50ms | Item delay in lists/grids |
| `--stagger-max` | 300ms | Max total stagger duration |

---

## Breakpoints (Mobile-First, Content-Driven)

| Token | Value | Target |
|-------|-------|--------|
| `--bp-xs` | 320px | Small phones |
| `--bp-sm` | 640px | Large phones / small tablets |
| `--bp-md` | 768px | Tablets |
| `--bp-lg` | 1024px | Laptops |
| `--bp-xl` | 1280px | Desktops |
| `--bp-2xl` | 1536px | Large desktops |

### Container
```css
--container-max: 1440px;
--container-padding: 24px;  /* Mobile: 16px, Desktop: 24px */
```

---

## Z-Index Scale (Semantic, No Magic Numbers)

| Token | Value | Layer |
|-------|-------|-------|
| `--z-dropdown` | 100 | Dropdowns, popovers |
| `--z-sticky` | 200 | Sticky headers, filters |
| `--z-fixed` | 300 | Fixed headers, progress bars |
| `--z-modal-backdrop` | 400 | Modal overlays |
| `--z-modal` | 500 | Modal content |
| `--z-popover` | 600 | Popovers, tooltips |
| `--z-tooltip` | 700 | Tooltips |
| `--z-toast` | 800 | Toasts, notifications |

---

## Component Specifications (Premium Standards)

### Buttons
| Variant | Background | Text | Border | Shadow | Hover | Active |
|---------|------------|------|--------|--------|-------|--------|
| **Primary** | Gold gradient | Ink | None | Gold | Gradient reverse | Scale 0.98 |
| **Secondary** | Transparent | Gold | 2px Gold | None | Gold light bg | Scale 0.98 |
| **Ghost** | Transparent | Gold | None | None | Gold light bg | Scale 0.98 |
| **WhatsApp** | `#25D366` | White | None | Green glow | `#128C7E` | Scale 0.98 |
| **Outline** | Transparent | Ink | 2px Whisper | None | Gold border/text | Scale 0.98 |
| **Danger** | Error | White | None | Error glow | Error/90 | Scale 0.98 |

**Sizes**: `sm` (4px/2px), `md` (6px/3px), `lg` (8px/4px), `xl` (10px/5px) — all uppercase, tracking-wide, font-medium

### Inputs
- **Height**: 48px (touch-friendly)
- **Padding**: 12px 16px
- **Border**: 1px Whisper → Gold on focus (3px ring, 20% opacity)
- **Label**: Always visible (not placeholder), 14px, medium, Ink
- **Error**: Error border + ring, inline error message
- **Helper**: Mist text, 12px, below input

### Product Card (Premium)
```
Aspect Ratio: 4:5 (portrait) / 1:1 (square option)
Image: Object-cover, 700ms scale(1.05) on hover
Badge: Top-left (New, Vidhya's Pick, Limited)
Wishlist: Top-right, glass morphism, heart fill on hover
Content: Category (overline, gold), Name (heading-sm, ink), Price (price, mono)
Quick Add: Magnetic button, appears on hover (desktop) / always (mobile)
```

### Card Elevation States
1. **Default**: `--shadow-card`, border Whisper
2. **Hover**: `--shadow-md`, border Gold/30
3. **Selected/Active**: `--shadow-elevated`, border Gold, gold accent line top

### Form Components
- **Select**: Styled native, chevron icon, searchable on mobile
- **Radio/Checkbox**: Custom, 20px, Gold accent, animated check
- **Toggle**: 44px track, 28px thumb, Gold on, Whisper off
- **Slider**: Dual-handle for price range, Gold track, value labels
- **Stepper**: Icon buttons ±, mono value center, min/max enforcement

### Toast/Notifications
- **Position**: Bottom-right, stack up
- **Animation**: Slide up + fade (expressive, 300ms)
- **Types**: Success (green left border), Error (red), Info (blue), Warning (amber)
- **Action**: Optional undo/retry button
- **Duration**: 4s default, persistent for errors

### Modal/Drawer
- **Backdrop**: `rgba(13,13,13,0.4)` + `backdrop-blur-sm`
- **Animation**: Scale in (spring, 300ms) + fade
- **Focus Trap**: Required, restore on close
- **Close**: ESC, backdrop click, close button
- **Drawer**: Slide from right (mobile: full, desktop: max-w-lg)

---

## Premium Micro-Interactions (Signature Moments)

### 1. Magnetic Button (Primary CTA)
- Cursor enters radius → button follows with spring physics
- 3D tilt (rotateX/rotateY) based on cursor position
- Subtle scale (max 1.05) at center
- Ripple on click from click origin
- Respects `prefers-reduced-motion`

### 2. Add to Cart Morph
- Idle: "Add to Bag" + price
- Adding: Spinner, scale 0.98
- Success: Morph to green, checkmark pops (spring), "Added to Bag", particle burst (12 particles, gold)
- Auto-reset: 2.5s
- Error: Red, shake (x: -10, 10, -10, 10, 0)

### 3. Page Transitions
- **View Transitions API** (native) + Framer Motion fallback
- Shared element transitions (product image → PDP hero)
- Duration: 400ms, expressive easing
- Fallback: Fade + slide for unsupported browsers

### 4. Scroll Reveal (IntersectionObserver)
- Threshold: 10%, rootMargin: 0px
- Once: true (don't replay)
- Animation: Fade up (20px → 0), 400ms expressive
- Stagger: 50ms per item, max 300ms total

### 5. Cart Drawer
- Slide from right (300ms expressive)
- Stagger items (50ms each)
- Quantity stepper with magnetic buttons
- Swipe to dismiss (mobile)
- Persistent mini-cart badge (spring pop on update)

### 6. Image Gallery (PDP)
- Thumbnail strip (horizontal scroll, snap)
- Main image: pinch zoom (mobile), hover zoom (desktop)
- Video support: autoplay muted, loop, tap to expand
- Full-screen viewer with swipe navigation
- Loading: Shimmer skeleton (gold shimmer)

### 7. Size Selector
- Pill buttons, magnetic hover
- Selected: Gold bg, ink text, subtle scale
- Out of stock: Disabled, strikethrough, tooltip "Notify me"
- Size guide link: Opens modal with measurements + fit predictor

### 8. WhatsApp Float Button
- Fixed bottom-right (24px from edge)
- Entry animation: Scale 0.5 → 1, translateY 100px → 0 (view timeline)
- Pulse animation: Expanding ring (2s infinite)
- Hover: Scale 1.1, shadow glow
- Click: Opens WhatsApp Flow (catalog) or chat

### 9. Loading States
- **Skeleton**: Gold shimmer (not gray) — brand consistent
- **Progressive**: Image blur-up (LQIP → HQ)
- **Search**: Instant results dropdown (debounced 150ms)
- **Infinite Scroll**: Sentinel + spinner, no layout shift

### 10. Celebration Moments
- **First Order**: Confetti (gold particles), "Welcome to Vidhya's Circle" modal
- **Loyalty Tier Up**: Animated badge reveal, personalized note from Vidhya
- **Anniversary**: "It's been a year!" email + site banner
- **Festival**: Seasonal hero takeover (Diwali gold, Eid green, Christmas red)

---

## Dark Mode (Complete Token Inversion)
All color tokens swap via `.dark` class on `<html>`. No component-level dark mode logic.
- Test every component in both modes
- Images: Use `picture` with `prefers-color-scheme` for lifestyle shots
- Gold: Warmer in dark (`#D4B85C` vs `#C9A84C`)
- Shadows: Subtler in dark (lower opacity)

---

## Accessibility Checklist (Per Component)
- [ ] Focus visible (3px gold ring, 2px offset)
- [ ] Keyboard operable (Tab, Enter, Space, Arrows, Escape)
- [ ] ARIA labels/descriptions where needed
- [ ] Color contrast ≥ 4.5:1 (text), ≥ 3:1 (UI)
- [ ] Reduced motion respected (all animations)
- [ ] Screen reader tested (NVDA, VoiceOver)
- [ ] Touch targets ≥ 44×44px
- [ ] Error messages linked via `aria-describedby`

---

## Implementation Notes
- **CSS Custom Properties** in `:root` + `.dark` (globals.css)
- **Tailwind Config** maps tokens to utilities (e.g., `bg-gold`, `text-ink`, `rounded-md`)
- **Framer Motion** uses tokens via `animationTokens` object
- **Design Tokens in Supabase** → Admin UI → Sync to CSS build
- **Storybook** documents every component in all states
- **Chromatic** visual regression testing on every PR