'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import { SocialIcon } from '@/components/ui/SocialIcon';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils/cn';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { StaggerContainer, StaggerItem, StaggerGrid } from '@/components/animations/Stagger';
import { MagneticButton } from '@/components/animations/MagneticButton';
import { LinkButton } from '@/components/ui/LinkButton';
import type {
  VidhyasPicksPageContent,
  VidhyasPicksPageProduct,
  VidhyasPicksMonthlyEdit,
} from '@/lib/actions/site-content-types';

export type PickProduct = VidhyasPicksPageProduct;
export type MonthlyEdit = VidhyasPicksMonthlyEdit;

const CATEGORIES = ['All', 'Sarees', 'Kurtis', 'Salwars', 'Lehengas', 'Dupattas'] as const;

const COLOR_FILTERS = [
  { label: 'All Colors', value: 'All', bgHex: '#f4f4f5' },
  { label: 'Red & Crimson', value: 'red', bgHex: '#b91c1c' },
  { label: 'Green & Emerald', value: 'green', bgHex: '#047857' },
  { label: 'Blue & Navy', value: 'blue', bgHex: '#1d4ed8' },
  { label: 'Gold & Yellow', value: 'gold', bgHex: '#d97706' },
  { label: 'Pink & Rose', value: 'pink', bgHex: '#ec4899' },
  { label: 'White & Ivory', value: 'white', bgHex: '#f5f5f4' },
] as const;

function matchesColorFilter(productColor: string, colorFamily: string | undefined, filterVal: string): boolean {
  if (filterVal === 'All') return true;
  const col = productColor.toLowerCase();
  const fam = (colorFamily || '').toLowerCase();

  if (filterVal === 'red') {
    return fam === 'red' || col.includes('red') || col.includes('crimson') || col.includes('maroon') || col.includes('ruby');
  }
  if (filterVal === 'green') {
    return fam === 'green' || col.includes('green') || col.includes('emerald') || col.includes('sage') || col.includes('mint');
  }
  if (filterVal === 'blue') {
    return fam === 'blue' || col.includes('blue') || col.includes('navy') || col.includes('indigo') || col.includes('powder blue');
  }
  if (filterVal === 'gold') {
    return fam === 'gold' || fam === 'yellow' || col.includes('gold') || col.includes('yellow') || col.includes('mustard') || col.includes('champagne') || col.includes('zari');
  }
  if (filterVal === 'pink') {
    return fam === 'pink' || col.includes('pink') || col.includes('rose') || col.includes('peach') || col.includes('blush');
  }
  if (filterVal === 'white') {
    return fam === 'white' || col.includes('white') || col.includes('ivory') || col.includes('cream');
  }

  return col.includes(filterVal.toLowerCase());
}

function matchesSearchQuery(product: PickProduct, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;

  const name = product.name.toLowerCase();
  const cat = product.category.toLowerCase();
  const color = product.color.toLowerCase();
  const fabric = product.fabric.toLowerCase();
  const origin = (product.origin || '').toLowerCase();
  const note = (product.vidhyaNote || '').toLowerCase();
  const tags = (product.tags || []).join(' ').toLowerCase();

  // Direct substring check
  if (
    name.includes(q) ||
    cat.includes(q) ||
    color.includes(q) ||
    fabric.includes(q) ||
    origin.includes(q) ||
    note.includes(q) ||
    tags.includes(q)
  ) {
    return true;
  }

  // Type synonyms
  if ((q === 'saree' || q === 'sarees' || q === 'sari') && cat === 'sarees') return true;
  if ((q === 'lehenga' || q === 'lehengas' || q === 'choli' || q === 'bridal') && cat === 'lehengas') return true;
  if ((q === 'kurti' || q === 'kurtis' || q === 'kurta' || q === 'anarkali') && cat === 'kurtis') return true;
  if ((q === 'salwar' || q === 'salwars' || q === 'palazzo' || q === 'sharara' || q === 'suit') && cat === 'salwars') return true;
  if ((q === 'dupatta' || q === 'dupattas' || q === 'scarf' || q === 'phulkari') && cat === 'dupattas') return true;

  // Color synonyms
  if (['red', 'crimson', 'maroon', 'ruby'].includes(q) && matchesColorFilter(color, product.colorFamily, 'red')) return true;
  if (['green', 'emerald', 'sage', 'mint'].includes(q) && matchesColorFilter(color, product.colorFamily, 'green')) return true;
  if (['blue', 'navy', 'indigo', 'powder blue'].includes(q) && matchesColorFilter(color, product.colorFamily, 'blue')) return true;
  if (['gold', 'yellow', 'mustard', 'champagne', 'zari'].includes(q) && matchesColorFilter(color, product.colorFamily, 'gold')) return true;
  if (['pink', 'rose', 'peach', 'blush'].includes(q) && matchesColorFilter(color, product.colorFamily, 'pink')) return true;
  if (['white', 'ivory', 'cream'].includes(q) && matchesColorFilter(color, product.colorFamily, 'white')) return true;

  return false;
}

function ProductCardGrid({
  product,
  index,
  isWishlisted,
  onToggleWishlist,
}: {
  product: PickProduct;
  index: number;
  isWishlisted: boolean;
  onToggleWishlist: (id: string) => void;
}) {
  const whatsappUrl = `https://wa.me/919876543210?text=${encodeURIComponent(
    `Hi Vidhya, I saw your curated pick "${product.name}" in ${product.color} (₹${product.price.toLocaleString()}) and would love personal drape advice on sizing and fabric.`
  )}`;

  return (
    <StaggerItem key={product.id} variant="scale" style={{ transitionDelay: `${index * 0.05}s` }}>
      <article className="group relative bg-[var(--color-white)] border border-[var(--color-whisper)] rounded-[var(--radius-2xl)] overflow-hidden hover:shadow-[var(--shadow-xl)] hover:border-[var(--color-gold)]/40 transition-all duration-500 flex flex-col h-full">
        {/* Product Image Container */}
        <div className="relative aspect-[3/4] w-full overflow-hidden bg-[var(--color-whisper)]">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            priority={index < 3}
          />
          {/* Top Badges */}
          <div className="absolute top-3.5 left-3.5 flex flex-wrap gap-2 z-10">
            <Badge variant="gold">Vidhya&apos;s Pick</Badge>
            {product.discount > 0 && (
              <Badge variant="outline" className="bg-[var(--color-white)]/95 text-[var(--color-ink)] border-[var(--color-whisper)]">
                -{product.discount}% OFF
              </Badge>
            )}
          </div>

          {/* Wishlist Button */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleWishlist(product.id);
            }}
            aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            className="absolute top-3.5 right-3.5 z-10 w-9 h-9 rounded-full bg-white flex items-center justify-center text-[var(--color-ink)] shadow-md transition-colors duration-200"
          >
            <svg
              className={cn('w-5 h-5 transition-colors', isWishlisted ? 'text-[var(--color-error)] fill-current' : 'text-[var(--color-ink)]')}
              viewBox="0 0 24 24"
              stroke="currentColor"
              fill={isWishlisted ? 'currentColor' : 'none'}
              strokeWidth="2"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
        </div>

        {/* Content Details */}
        <div className="p-5 flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className="text-[11px] text-[var(--color-gold)] font-bold uppercase tracking-wider">
                {product.category}
              </span>
              <span className="text-[10px] text-stone-700 bg-stone-100 px-2 py-0.5 rounded-full border border-stone-200 font-semibold">
                {product.color}
              </span>
            </div>

            <h3 className="text-[var(--font-display)] text-lg font-medium text-[var(--color-ink)] line-clamp-1 group-hover:text-[var(--color-gold)] transition-colors">
              <Link href={`/product/${product.slug || product.id}`}>
                {product.name}
              </Link>
            </h3>

            <p className="text-xs text-[var(--color-slate)] mt-1 font-medium">
              Fabric: {product.fabric} · {product.origin}
            </p>

            <div className="mt-2.5 flex items-baseline gap-2">
              <span className="text-lg font-bold text-[var(--color-ink)]">
                ₹{product.price.toLocaleString()}
              </span>
              {product.originalPrice > product.price && (
                <span className="text-xs text-[var(--color-mist)] line-through">
                  ₹{product.originalPrice.toLocaleString()}
                </span>
              )}
            </div>

            {product.vidhyaNote && (
              <p className="text-xs text-[var(--color-slate)]/90 italic mt-3 pt-3 border-t border-[var(--color-whisper)] line-clamp-2">
                &ldquo;{product.vidhyaNote}&rdquo;
              </p>
            )}
          </div>

          <div className="mt-4 pt-3 flex items-center gap-2">
            <LinkButton
              variant="outline"
              size="sm"
              className="flex-1 rounded-[var(--radius-full)] text-xs justify-center"
              href={`/product/${product.slug || product.id}`}
            >
              View Piece
            </LinkButton>
            <Link
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Ask Vidhya about fit on WhatsApp"
              className="p-2 rounded-[var(--radius-full)] border border-[var(--color-whisper)] bg-[var(--color-white)] text-[var(--color-slate)] hover:text-[var(--color-success)] hover:border-[var(--color-success)] transition-all flex items-center justify-center flex-shrink-0"
              title="Ask Vidhya on WhatsApp"
            >
              <SocialIcon platform="whatsapp" size="sm" className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </article>
    </StaggerItem>
  );
}

function ProductCardList({
  product,
  index,
  isWishlisted,
  onToggleWishlist,
}: {
  product: PickProduct;
  index: number;
  isWishlisted: boolean;
  onToggleWishlist: (id: string) => void;
}) {
  const whatsappUrl = `https://wa.me/919876543210?text=${encodeURIComponent(
    `Hi Vidhya, I saw your curated pick "${product.name}" in ${product.color} (₹${product.price.toLocaleString()}) and would love styling advice on sizing and fabric.`
  )}`;

  return (
    <StaggerItem key={product.id} variant="slide" style={{ transitionDelay: `${index * 0.05}s` }}>
      <article className="group relative bg-[var(--color-white)] border border-[var(--color-whisper)] rounded-[var(--radius-2xl)] overflow-hidden hover:shadow-[var(--shadow-xl)] hover:border-[var(--color-gold)]/40 transition-all duration-500 flex flex-col sm:flex-row items-stretch">
        {/* Product Image */}
        <div className="relative aspect-[3/4] sm:aspect-auto sm:w-72 md:w-80 flex-shrink-0 min-h-[260px] overflow-hidden bg-[var(--color-whisper)]">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 320px"
          />
          <div className="absolute top-3.5 left-3.5 flex flex-wrap gap-2 z-10">
            <Badge variant="gold">Vidhya&apos;s Pick</Badge>
            {product.discount > 0 && (
              <Badge variant="outline" className="bg-[var(--color-white)]/95 text-[var(--color-ink)] border-[var(--color-whisper)]">
                -{product.discount}% OFF
              </Badge>
            )}
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleWishlist(product.id);
            }}
            aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            className="absolute top-3.5 right-3.5 z-10 w-9 h-9 rounded-full bg-white flex items-center justify-center text-[var(--color-ink)] shadow-md transition-colors duration-200"
          >
            <svg
              className={cn('w-5 h-5 transition-colors', isWishlisted ? 'text-[var(--color-error)] fill-current' : 'text-[var(--color-ink)]')}
              viewBox="0 0 24 24"
              stroke="currentColor"
              fill={isWishlisted ? 'currentColor' : 'none'}
              strokeWidth="2"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
        </div>

        {/* Content Details */}
        <div className="p-6 flex-1 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-xs text-[var(--color-gold)] font-bold uppercase tracking-wider">
                {product.category}
              </span>
              <span className="text-[11px] text-[var(--color-slate)] bg-[var(--color-snow)] px-2.5 py-0.5 rounded-full border border-[var(--color-whisper)] font-medium">
                {product.color}
              </span>
              <span className="text-[11px] text-[var(--color-slate)]">
                Origin: {product.origin}
              </span>
            </div>

            <h3 className="text-[var(--font-display)] text-2xl font-medium text-[var(--color-ink)] group-hover:text-[var(--color-gold)] transition-colors">
              <Link href={`/product/${product.slug || product.id}`}>
                {product.name}
              </Link>
            </h3>

            <p className="text-sm text-[var(--color-slate)] font-medium">
              Fabric Composition: {product.fabric}
            </p>

            <div className="flex items-baseline gap-3">
              <span className="text-2xl font-bold text-[var(--color-ink)]">
                ₹{product.price.toLocaleString()}
              </span>
              {product.originalPrice > product.price && (
                <span className="text-sm text-[var(--color-mist)] line-through">
                  ₹{product.originalPrice.toLocaleString()}
                </span>
              )}
            </div>

            {product.vidhyaNote && (
              <div className="p-4 rounded-[var(--radius-xl)] bg-[var(--color-snow)] border-l-4 border-[var(--color-gold)] text-sm text-[var(--color-slate)] italic">
                &ldquo;{product.vidhyaNote}&rdquo;
              </div>
            )}
          </div>

          {/* Action Row */}
          <div className="mt-6 pt-5 border-t border-[var(--color-whisper)] flex flex-wrap items-center gap-3">
            <LinkButton variant="primary" size="md" className="rounded-[var(--radius-full)] px-6 text-xs" href={`/product/${product.slug || product.id}`}>
              View Product & Sizing
            </LinkButton>
            <Link
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[var(--radius-full)] border border-[var(--color-whisper)] text-xs font-medium text-[var(--color-ink)] hover:border-[var(--color-success)] hover:text-[var(--color-success)] hover:bg-[var(--color-success-bg)] transition-colors"
            >
              <SocialIcon platform="whatsapp" size="sm" className="w-4 h-4 text-[var(--color-success)]" />
              Chat with Vidhya About Fit
            </Link>
          </div>
        </div>
      </article>
    </StaggerItem>
  );
}

function VidhyasPicksContent({ initialContent }: { initialContent?: VidhyasPicksPageContent }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read URL query params
  const urlSearch = searchParams.get('search') || searchParams.get('q') || '';
  const urlCategory = searchParams.get('category') || searchParams.get('type') || 'All';
  const urlColor = searchParams.get('color') || 'All';
  const monthParam = searchParams.get('month');

  // Load content from prop with robust fallbacks
  const content = initialContent;
  const monthlyEdits = useMemo(() => content?.monthlyEdits || [], [content?.monthlyEdits]);
  const additionalPicks = useMemo(() => content?.additionalPicks || [], [content?.additionalPicks]);

  // Unified pool of products
  const allPicks: PickProduct[] = useMemo(() => {
    const fromEdits = monthlyEdits.flatMap((edit) =>
      (edit.products || []).map((p) => ({
        ...p,
        month: edit.month,
        theme: edit.theme,
      }))
    );
    return [...fromEdits, ...additionalPicks];
  }, [monthlyEdits, additionalPicks]);

  const [searchQuery, setSearchQuery] = useState(urlSearch);
  const [activeMonthIndex, setActiveMonthIndex] = useState(0);
  const [activeCategory, setActiveCategory] = useState<string>(urlCategory);
  const [activeColor, setActiveColor] = useState<string>(urlColor);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'discount'>('featured');
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [subscribedEmail, setSubscribedEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  // Sync state if URL search query changes
  useEffect(() => {
    if (urlSearch !== searchQuery) {
      setSearchQuery(urlSearch);
    }
  }, [urlSearch]);

  // Sync month from URL query if provided
  useEffect(() => {
    if (monthParam) {
      const idx = monthlyEdits.findIndex(
        (e) => e.slug === monthParam || e.month.toLowerCase().replace(/\s+/g, '-') === monthParam.toLowerCase()
      );
      if (idx !== -1) setActiveMonthIndex(idx);
    }
  }, [monthParam, monthlyEdits]);

  const currentEdit = monthlyEdits[activeMonthIndex] || monthlyEdits[0] || {
    month: 'January 2026',
    slug: 'january-2026',
    theme: 'New Beginnings in Silk',
    subtitle: 'Lustrous Mulberry Silks & Airy Chiffons for the Fresh Season',
    note: 'Starting the year with the fabrics that feel like fresh starts.',
    coverImage: '/images/vp-jan-1.jpg',
    heroStory: '',
    curatorInsight: '',
    products: [],
  };

  // Determine active base product pool
  const isSearchOrFilterActive = Boolean(
    searchQuery.trim() || activeCategory !== 'All' || activeColor !== 'All'
  );

  const baseProductList = isSearchOrFilterActive ? allPicks : (currentEdit.products || []);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let result = baseProductList.filter((product) => {
      // Category filter
      if (activeCategory !== 'All' && product.category !== activeCategory) {
        return false;
      }
      // Color filter
      if (!matchesColorFilter(product.color, product.colorFamily, activeColor)) {
        return false;
      }
      // Search query filter
      if (searchQuery.trim() && !matchesSearchQuery(product, searchQuery)) {
        return false;
      }
      return true;
    });

    // Sort order
    if (sortBy === 'price-asc') {
      result = [...result].sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      result = [...result].sort((a, b) => b.price - a.price);
    } else if (sortBy === 'discount') {
      result = [...result].sort((a, b) => b.discount - a.discount);
    }

    return result;
  }, [baseProductList, activeCategory, activeColor, searchQuery, sortBy]);

  const handleToggleWishlist = (productId: string) => {
    setWishlist((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const handleClearAllFilters = () => {
    setSearchQuery('');
    setActiveCategory('All');
    setActiveColor('All');
    router.replace('/vidhyas-picks', { scroll: false });
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (subscribedEmail) {
      setIsSubscribed(true);
      setSubscribedEmail('');
    }
  };

  // Dynamic Content Accessors
  const header = content?.header || {
    eyebrowBadge: "FOUNDER'S CURATION",
    badgeSubtitle: "Updated Monthly",
    title: "Vidhya's Personal Picks",
    titleHighlight: "Personal",
    description: "“Every piece in this edit is an authentic favorite from my own wardrobe. Hand-selected directly from master looms across Varanasi, Kutch, and Jaipur — chosen for effortless drape, pure natural fiber, and timeless elegance.”",
    founder: {
      name: "Vidhya Sharma",
      role: "Founder & Creative Director · Angelika Fashions",
      experience: "Curating pure handloom weaves since 2018",
      avatar: "/images/about/vidhya-profile.jpg",
      storyLinkText: "Read Story →",
      storyLinkHref: "/about/vidhya",
    },
    featuredStats: {
      stat1Value: "100%",
      stat1Label: "Natural Silk",
      stat2Value: "5 Categories",
      stat2Label: "Artisan Looms",
      stat3Value: "Limited",
      stat3Label: "Bespoke Batches",
    },
  };

  const curationStandards = content?.curationStandards || {
    eyebrow: "THE CURATION STANDARD",
    title: "Why Every Pick is Rare & Special",
    subtitle: "We reject mass manufacturing. Every piece in Vidhya’s Picks meets four strict artisanal principles.",
    items: [
      {
        icon: "🪡",
        title: "Direct Loom Provenance",
        description: "Directly commissioned from master weavers in Varanasi, Chanderi, and Kutch with fair-wage artisan partnerships.",
      },
      {
        icon: "👗",
        title: "Wear-Tested Drapes",
        description: "Personally styled and fitted by Vidhya to guarantee all-day comfort, zero-scratch necklines, and effortless fall.",
      },
      {
        icon: "💎",
        title: "Micro-Batch Exclusivity",
        description: "Created in limited editions of only 20–50 units per weave to ensure your look remains singular and unique.",
      },
      {
        icon: "💬",
        title: "1-on-1 Concierge Styling",
        description: "Direct WhatsApp styling advice from Vidhya’s personal team for drape options, blouse matching, and custom lengths.",
      },
    ],
  };

  const archive = content?.archive || {
    eyebrow: "CURATION ARCHIVE",
    title: "Explore Past Monthly Editions",
    subtitle: "Each month brings a distinct theme, fresh fabrics, and personal styling narratives.",
    ctaText: "Browse All Collections →",
    ctaHref: "/shop",
  };

  const concierge = content?.concierge || {
    badge: "COMPLIMENTARY CONCIERGE",
    title: "Unsure About Draping, Blouse Cuts, or Sizing?",
    description: "Connect directly with designer Vidhya Sharma and our senior bridal styling desk. We provide drape video guides, bespoke size alterations, and fabric matching for your special occasion.",
    whatsappNumber: "+91 98765 43210",
    whatsappUrl: "https://wa.me/919876543210?text=Hi%20Vidhya,%20I%20need%20styling%20advice%20for%20an%20upcoming%20event.",
    sizeGuideText: "Open Interactive Size Guide",
    sizeGuideHref: "/size-finder",
  };

  const newsletter = content?.newsletter || {
    eyebrow: "PRIVATE PREVIEWS",
    title: "Get Next Month's Edit 48 Hours Before Public Release",
    description: "Join Vidhya’s Private Notes. Receive artisanal stories, limited edition early reservations, and personal drape masterclass videos.",
    buttonText: "Join VIP List",
    disclaimer: "Zero spam. Unsubscribe at any time. We respect your private styling journey.",
  };

  // Render title with highlight word
  const renderTitle = () => {
    const fullTitle = header.title || "Vidhya's Personal Picks";
    const highlight = header.titleHighlight || "Personal";

    if (!highlight || !fullTitle.includes(highlight)) {
      return fullTitle;
    }

    const parts = fullTitle.split(highlight);
    return (
      <>
        {parts[0]}
        <span className="italic font-normal text-[var(--color-gold)] font-serif">
          {highlight}
        </span>
        {parts.slice(1).join(highlight)}
      </>
    );
  };

  return (
    <div className="min-h-screen bg-[var(--color-snow)] font-sans antialiased text-[var(--color-ink)] selection:bg-[var(--color-gold-light)] selection:text-[var(--color-ink)]">
      {/* Editorial Hero Header */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[var(--color-snow)] via-[var(--color-white)] to-[var(--color-snow)] border-b border-[var(--color-whisper)] py-12 md:py-20">
        <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 rounded-full bg-[var(--color-gold-light)]/30 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-96 h-96 rounded-full bg-[var(--color-gold)]/10 blur-3xl pointer-events-none" />

        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Editorial Headline & Personal Bio */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[var(--color-gold-light)] text-[var(--color-gold)] tracking-wide">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-gold)] animate-pulse" />
                  {header.eyebrowBadge}
                </span>
                <span className="text-xs font-medium text-[var(--color-slate)] uppercase tracking-wider">
                  {header.badgeSubtitle}
                </span>
              </div>

              <div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-medium tracking-tight font-serif text-[var(--color-ink)] leading-[1.15]">
                  {renderTitle()}
                </h1>
                <p className="mt-4 text-base sm:text-lg text-[var(--color-slate)] leading-relaxed max-w-2xl font-normal">
                  {header.description}
                </p>
              </div>

              {/* Founder Profile Snapshot Card */}
              <div className="pt-2">
                <div className="inline-flex items-center gap-4 p-3 pr-6 rounded-2xl bg-[var(--color-white)] border border-[var(--color-whisper)] shadow-xs">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-[var(--color-gold)]/40 flex-shrink-0 bg-[var(--color-gold-light)]">
                    <Image
                      src={header.founder.avatar || '/images/about/vidhya-profile.jpg'}
                      alt={header.founder.name}
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-[var(--color-ink)]">
                      {header.founder.name}
                    </h2>
                    <p className="text-xs text-[var(--color-slate)] font-medium">
                      {header.founder.role}
                    </p>
                    <p className="text-[11px] text-[var(--color-mist)]">
                      {header.founder.experience}
                    </p>
                  </div>
                  {header.founder.storyLinkText && (
                    <Link
                      href={header.founder.storyLinkHref || '/about/vidhya'}
                      className="text-xs font-semibold text-[var(--color-ink)] hover:text-[var(--color-gold)] transition-colors whitespace-nowrap hidden sm:inline-flex items-center gap-1 ml-2"
                    >
                      {header.founder.storyLinkText}
                    </Link>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Hero Cover Artwork */}
            <div className="lg:col-span-5">
              <div className="relative rounded-[var(--radius-2xl)] overflow-hidden border border-[var(--color-whisper)] shadow-[var(--shadow-xl)] bg-[var(--color-white)]">
                <div className="relative aspect-[4/3] sm:aspect-[16/11] w-full overflow-hidden bg-[var(--color-whisper)]">
                  <Image
                    src={currentEdit.coverImage || '/images/vp-jan-1.jpg'}
                    alt={currentEdit.theme}
                    fill
                    className="object-cover transition-transform duration-700 hover:scale-105"
                    sizes="(max-width: 1024px) 100vw, 500px"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent pointer-events-none" />

                  <div className="absolute bottom-4 left-4 right-4 text-[var(--color-white)]">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-gold)] bg-[var(--color-ink)]/60 px-2.5 py-1 rounded-full backdrop-blur-sm">
                      FEATURED CURATION
                    </span>
                    <h2 className="text-xl sm:text-2xl font-serif font-medium mt-1 text-[var(--color-white)]">
                      {currentEdit.theme}
                    </h2>
                    <p className="text-xs text-[var(--color-white)]/80 line-clamp-1 mt-0.5">
                      {currentEdit.subtitle}
                    </p>
                  </div>
                </div>

                <div className="p-4 grid grid-cols-3 gap-2 text-center bg-[var(--color-snow)] border-t border-[var(--color-whisper)]">
                  <div>
                    <p className="text-base font-bold text-[var(--color-ink)]">
                      {header.featuredStats.stat1Value}
                    </p>
                    <p className="text-[10px] font-medium text-[var(--color-slate)] uppercase tracking-wider">
                      {header.featuredStats.stat1Label}
                    </p>
                  </div>
                  <div className="border-x border-[var(--color-whisper)]">
                    <p className="text-base font-bold text-[var(--color-gold)]">
                      {header.featuredStats.stat2Value}
                    </p>
                    <p className="text-[10px] font-medium text-[var(--color-slate)] uppercase tracking-wider">
                      {header.featuredStats.stat2Label}
                    </p>
                  </div>
                  <div>
                    <p className="text-base font-bold text-[var(--color-ink)]">
                      {header.featuredStats.stat3Value}
                    </p>
                    <p className="text-[10px] font-medium text-[var(--color-slate)] uppercase tracking-wider">
                      {header.featuredStats.stat3Label}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Search & Refinement Bar */}
      <section className="sticky top-16 md:top-20 z-30 bg-[var(--color-white)]/95 backdrop-blur-md border-b border-[var(--color-whisper)] shadow-xs">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-3.5 space-y-3">
          {/* Row 1: Search Input & Active Search State */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-xl">
              <svg
                className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-mist)] pointer-events-none"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              <input
                type="search"
                placeholder="Search Vidhya's picks by type (Lehenga, Saree) or color (Red, Green, Blue)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-10 pr-10 text-xs sm:text-sm bg-[var(--color-snow)] border border-[var(--color-whisper)] rounded-full focus:border-[var(--color-gold)] focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]/20 transition-all placeholder:text-[var(--color-mist)] [&::-webkit-search-cancel-button]:hidden"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[var(--color-mist)] hover:text-[var(--color-ink)]"
                  aria-label="Clear search text"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Active Filters Clear Button & Sort Control */}
            <div className="flex items-center gap-3 self-end sm:self-auto">
              {isSearchOrFilterActive && (
                <button
                  type="button"
                  onClick={handleClearAllFilters}
                  className="text-xs text-[var(--color-error)] hover:underline font-semibold flex items-center gap-1"
                >
                  <span>Clear All Filters</span>
                  <span className="text-[10px]">✕</span>
                </button>
              )}

              <div className="flex items-center gap-2">
                <label htmlFor="sort-select" className="text-xs text-[var(--color-slate)] hidden md:inline">
                  Sort:
                </label>
                <select
                  id="sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="text-xs bg-[var(--color-snow)] border border-[var(--color-whisper)] rounded-lg py-1.5 px-2.5 font-medium text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-gold)]"
                >
                  <option value="featured">Featured Picks</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="discount">Highest Discount</option>
                </select>

                {/* View Mode Toggle */}
                <div className="flex items-center border border-[var(--color-whisper)] rounded-lg overflow-hidden bg-[var(--color-snow)]">
                  <button
                    type="button"
                    onClick={() => setViewMode('grid')}
                    className={cn(
                      'p-1.5 transition-colors',
                      viewMode === 'grid'
                        ? 'bg-[var(--color-gold)] text-[var(--color-ink)]'
                        : 'text-[var(--color-slate)] hover:text-[var(--color-ink)]'
                    )}
                    aria-label="Grid view"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="7" height="7" />
                      <rect x="14" y="3" width="7" height="7" />
                      <rect x="14" y="14" width="7" height="7" />
                      <rect x="3" y="14" width="7" height="7" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('list')}
                    className={cn(
                      'p-1.5 transition-colors',
                      viewMode === 'list'
                        ? 'bg-[var(--color-gold)] text-[var(--color-ink)]'
                        : 'text-[var(--color-slate)] hover:text-[var(--color-ink)]'
                    )}
                    aria-label="List view"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="8" y1="6" x2="21" y2="6" />
                      <line x1="8" y1="12" x2="21" y2="12" />
                      <line x1="8" y1="18" x2="21" y2="18" />
                      <line x1="3" y1="6" x2="3.01" y2="6" />
                      <line x1="3" y1="12" x2="3.01" y2="12" />
                      <line x1="3" y1="18" x2="3.01" y2="18" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Row 2: Category Pills & Color Swatches */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-1 border-t border-[var(--color-whisper)]/60">
            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <span className="text-[10px] font-bold text-[var(--color-slate)] uppercase tracking-wider mr-1 shrink-0">
                Type:
              </span>
              {CATEGORIES.map((cat) => {
                const count = cat === 'All'
                  ? allPicks.length
                  : allPicks.filter((p) => p.category === cat).length;
                const isSelected = activeCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActiveCategory(cat)}
                    className={cn(
                      'px-3 py-1 text-xs rounded-full whitespace-nowrap transition-all font-medium flex items-center gap-1 shrink-0',
                      isSelected
                        ? 'bg-[var(--color-gold)] text-[var(--color-ink)] font-bold shadow-xs'
                        : 'bg-[var(--color-snow)] text-[var(--color-slate)] hover:bg-[var(--color-gold-light)]/40 hover:text-[var(--color-ink)] border border-[var(--color-whisper)]'
                    )}
                  >
                    <span>{cat}</span>
                    <span className="text-[10px] opacity-75">
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Color Swatch Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <span className="text-[10px] font-bold text-[var(--color-slate)] uppercase tracking-wider mr-1 shrink-0">
                Color:
              </span>
              {COLOR_FILTERS.map((col) => {
                const isSelected = activeColor === col.value;
                const count = col.value === 'All'
                  ? allPicks.length
                  : allPicks.filter((p) => matchesColorFilter(p.color, p.colorFamily, col.value)).length;
                return (
                  <button
                    key={col.value}
                    type="button"
                    onClick={() => setActiveColor(col.value)}
                    className={cn(
                      'px-2.5 py-1 text-xs rounded-full whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 border',
                      isSelected
                        ? 'border-[var(--color-ink)] bg-[var(--color-ink)] text-[var(--color-white)] font-bold shadow-xs'
                        : 'border-[var(--color-whisper)] bg-[var(--color-white)] text-[var(--color-slate)] hover:text-[var(--color-ink)]'
                    )}
                  >
                    {col.value !== 'All' && (
                      <span
                        className="w-2.5 h-2.5 rounded-full border border-black/20"
                        style={{ backgroundColor: col.bgHex }}
                      />
                    )}
                    <span>{col.label}</span>
                    <span className="text-[10px] opacity-70">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Active Search / Filter State Indicator */}
      {isSearchOrFilterActive && (
        <section className="bg-amber-50/60 border-b border-amber-200 py-3">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
            <p className="text-xs sm:text-sm font-medium text-amber-950">
              Showing <span className="font-bold">{filteredProducts.length}</span> pieces matching{' '}
              {searchQuery && (
                <>
                  &ldquo;<span className="font-bold text-[var(--color-ink)]">{searchQuery}</span>&rdquo;{' '}
                </>
              )}
              {activeCategory !== 'All' && (
                <>in <span className="font-bold">{activeCategory}</span> </>
              )}
              {activeColor !== 'All' && (
                <>with color <span className="font-bold">{activeColor}</span> </>
              )}
              across all monthly capsules.
            </p>
            <button
              type="button"
              onClick={handleClearAllFilters}
              className="text-xs font-bold text-amber-900 underline hover:text-amber-950 shrink-0"
            >
              Reset to Current Month Edit
            </button>
          </div>
        </section>
      )}

      {/* Main Products Grid & Showcase */}
      <section className="py-10 md:py-14 bg-[var(--color-white)]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-xs uppercase tracking-widest text-[var(--color-gold)] font-bold">
                {isSearchOrFilterActive ? 'CURATED SEARCH RESULTS' : `${currentEdit.month} EDIT`}
              </p>
              <h3 className="text-[var(--font-display)] text-2xl md:text-3xl font-medium text-[var(--color-ink)]">
                Handpicked Pieces ({filteredProducts.length})
              </h3>
            </div>
            <p className="text-xs text-[var(--color-slate)] hidden sm:block">
              Click any piece for detailed craftsmanship, color notes & drape measurements
            </p>
          </div>

          {filteredProducts.length > 0 ? (
            viewMode === 'grid' ? (
              <StaggerGrid
                items={filteredProducts}
                columns={3}
                gap={24}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
                renderItem={(product, index) => (
                  <ProductCardGrid
                    key={product.id}
                    product={product}
                    index={index}
                    isWishlisted={wishlist.includes(product.id)}
                    onToggleWishlist={handleToggleWishlist}
                  />
                )}
              />
            ) : (
              <StaggerContainer variant="default" className="space-y-6">
                {filteredProducts.map((product, index) => (
                  <ProductCardList
                    key={product.id}
                    product={product}
                    index={index}
                    isWishlisted={wishlist.includes(product.id)}
                    onToggleWishlist={handleToggleWishlist}
                  />
                ))}
              </StaggerContainer>
            )
          ) : (
            // No Products Found State -> Show explicit message + Explore Vidhya's Picks
            <div className="py-12">
              <div className="p-8 sm:p-12 text-center bg-gradient-to-b from-amber-50/70 via-white to-white rounded-[var(--radius-2xl)] border border-[var(--color-whisper)] max-w-2xl mx-auto shadow-sm">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--color-gold-light)] flex items-center justify-center text-[var(--color-gold)] shadow-sm">
                  <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" />
                    <path d="M21 21l-4.35-4.35" />
                    <line x1="8" y1="11" x2="14" y2="11" />
                  </svg>
                </div>
                <h4 className="font-display text-2xl font-semibold text-[var(--color-ink)] mb-2">
                  the product you&apos;re searching for is not present
                </h4>
                <p className="text-sm text-[var(--color-slate)] max-w-md mx-auto mb-6 leading-relaxed">
                  We couldn&apos;t find any items matching &ldquo;{searchQuery || activeCategory}&rdquo; in our ethnic wear atelier. But explore Vidhya&apos;s signature picks below:
                </p>
                <button
                  type="button"
                  onClick={handleClearAllFilters}
                  className="py-2.5 px-6 rounded-full bg-[var(--color-gold)] text-[var(--color-ink)] text-xs font-bold uppercase tracking-wider hover:bg-[var(--color-gold-hover)] transition-all shadow-sm cursor-pointer"
                >
                  Clear Search & View All Vidhya&apos;s Picks
                </button>
              </div>

              {/* Curated Fallback Recommendations */}
              <div className="mt-14">
                <div className="flex items-center gap-2 mb-6">
                  <span className="text-amber-500 text-lg">✨</span>
                  <h3 className="text-xl font-medium text-[var(--color-ink)] font-display">
                    Explore Vidhya&apos;s Signature Recommendations
                  </h3>
                </div>
                <StaggerGrid
                  items={allPicks.slice(0, 6)}
                  columns={3}
                  gap={24}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
                  renderItem={(product, index) => (
                    <ProductCardGrid
                      key={product.id}
                      product={product}
                      index={index}
                      isWishlisted={wishlist.includes(product.id)}
                      onToggleWishlist={handleToggleWishlist}
                    />
                  )}
                />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Why Vidhya Curates (Artisanal Values Strip) */}
      <section className="py-16 bg-[var(--color-snow)] border-y border-[var(--color-whisper)]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-[var(--color-gold)]">
              {curationStandards.eyebrow}
            </span>
            <h2 className="text-[var(--font-display)] text-3xl font-medium text-[var(--color-ink)] mt-2">
              {curationStandards.title}
            </h2>
            <p className="text-sm text-[var(--color-slate)] mt-2">
              {curationStandards.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {curationStandards.items.map((item, idx) => (
              <div
                key={idx}
                className="p-6 rounded-[var(--radius-xl)] bg-[var(--color-white)] border border-[var(--color-whisper)] shadow-xs"
              >
                <div className="w-12 h-12 rounded-full bg-[var(--color-gold-light)] text-[var(--color-gold)] flex items-center justify-center text-xl mb-4 font-serif">
                  {item.icon}
                </div>
                <h3 className="font-semibold text-base text-[var(--color-ink)] mb-1">
                  {item.title}
                </h3>
                <p className="text-xs text-[var(--color-slate)] leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Previous Months' Editions Archive */}
      <section className="py-16 bg-[var(--color-white)]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[var(--color-gold)]">
                {archive.eyebrow}
              </span>
              <h2 className="text-[var(--font-display)] text-3xl font-medium text-[var(--color-ink)] mt-1">
                {archive.title}
              </h2>
              <p className="text-sm text-[var(--color-slate)] mt-1">
                {archive.subtitle}
              </p>
            </div>
            <LinkButton variant="outline" size="sm" href={archive.ctaHref || '/shop'}>
              {archive.ctaText}
            </LinkButton>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {monthlyEdits.map((edit, idx) => {
              const isCurrent = activeMonthIndex === idx && !isSearchOrFilterActive;
              return (
                <article
                  key={edit.month}
                  className={cn(
                    'p-6 rounded-[var(--radius-2xl)] border transition-all duration-300 flex flex-col justify-between',
                    isCurrent
                      ? 'bg-[var(--color-snow)] border-[var(--color-gold)] shadow-md ring-1 ring-[var(--color-gold)]/40'
                      : 'bg-[var(--color-white)] border-[var(--color-whisper)] hover:border-[var(--color-gold)] hover:shadow-lg'
                  )}
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="px-3 py-1 bg-[var(--color-gold-light)] text-[var(--color-gold)] text-xs font-bold rounded-full">
                        {edit.month}
                      </span>
                      {isCurrent && (
                        <span className="text-[10px] font-bold text-[var(--color-gold)] uppercase tracking-wider bg-[var(--color-gold-light)]/60 px-2 py-0.5 rounded-full">
                          Currently Viewing
                        </span>
                      )}
                    </div>

                    <h3 className="text-[var(--font-display)] text-xl font-medium text-[var(--color-ink)] mb-2">
                      {edit.theme}
                    </h3>
                    <p className="text-xs text-[var(--color-slate)] leading-relaxed mb-5 line-clamp-3">
                      {edit.note}
                    </p>

                    <div className="flex items-center gap-3 mb-6">
                      {(edit.products || []).slice(0, 3).map((p) => (
                        <div
                          key={p.id}
                          className="relative w-16 h-20 rounded-[var(--radius-lg)] overflow-hidden bg-[var(--color-whisper)] border border-[var(--color-whisper)] flex-shrink-0"
                        >
                          <Image
                            src={p.image}
                            alt={p.name}
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <MagneticButton
                    variant={isCurrent ? 'primary' : 'outline'}
                    size="sm"
                    className="w-full justify-center text-xs"
                    strength={0.2}
                    onClick={() => {
                      setActiveMonthIndex(idx);
                      setActiveCategory('All');
                      setActiveColor('All');
                      setSearchQuery('');
                      window.scrollTo({ top: 350, behavior: 'smooth' });
                    }}
                  >
                    {isCurrent ? 'Viewing This Edit' : `View ${edit.month} Edit`}
                  </MagneticButton>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Vidhya's Styling Concierge Desk Callout */}
      <section className="py-16 bg-[var(--color-snow)] border-t border-[var(--color-whisper)]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-[var(--radius-2xl)] bg-gradient-to-r from-[var(--color-charcoal)] to-[var(--color-ink)] text-[var(--color-white)] p-8 sm:p-12 md:p-16 relative overflow-hidden shadow-xl">
            <div className="max-w-2xl relative z-10">
              <span className="inline-block px-3 py-1 bg-[var(--color-gold)] text-[var(--color-ink)] text-xs font-bold uppercase tracking-widest rounded-full mb-4">
                {concierge.badge}
              </span>
              <h2 className="text-[var(--font-display)] text-3xl sm:text-4xl md:text-5xl font-medium leading-tight mb-4">
                {concierge.title}
              </h2>
              <p className="text-[var(--color-whisper)] text-sm sm:text-base leading-relaxed mb-8 opacity-90">
                {concierge.description}
              </p>
              <div className="flex flex-wrap gap-4 items-center">
                <MagneticButton variant="whatsapp" size="lg" strength={0.3} asChild>
                  <Link
                    href={concierge.whatsappUrl || 'https://wa.me/919876543210'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2.5"
                  >
                    <SocialIcon platform="whatsapp" size="sm" className="w-5 h-5 text-current" />
                    Chat With Concierge ({concierge.whatsappNumber})
                  </Link>
                </MagneticButton>
                <MagneticButton variant="outline" size="lg" strength={0.3} className="border-[var(--color-gold)] text-[var(--color-gold)] hover:bg-[var(--color-gold)] hover:text-[var(--color-ink)]" asChild>
                  <Link href={concierge.sizeGuideHref || '/size-finder'}>
                    {concierge.sizeGuideText}
                  </Link>
                </MagneticButton>
              </div>
            </div>

            <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-10 pointer-events-none flex items-center justify-center font-serif text-[240px] text-[var(--color-gold)] select-none">
              A
            </div>
          </div>
        </div>
      </section>

      {/* VIP Early Access Newsletter Subscription */}
      <section className="py-16 bg-[var(--color-ink)] text-[var(--color-white)]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ScrollReveal variant="fadeUp">
            <span className="text-xs font-bold uppercase tracking-widest text-[var(--color-gold)]">
              {newsletter.eyebrow}
            </span>
            <h2 className="text-[var(--font-display)] text-3xl sm:text-4xl font-medium mt-2 mb-4 text-[var(--color-white)]">
              {newsletter.title}
            </h2>
            <p className="text-[var(--color-whisper)] text-sm sm:text-base leading-relaxed mb-8 max-w-xl mx-auto opacity-80">
              {newsletter.description}
            </p>

            {isSubscribed ? (
              <div className="p-4 rounded-[var(--radius-xl)] bg-[var(--color-gold)]/20 border border-[var(--color-gold)] text-[var(--color-gold-light)] max-w-md mx-auto flex items-center justify-center gap-2">
                <span className="text-lg">✓</span>
                <span className="text-sm font-medium">
                  Welcome to Vidhya&apos;s Private Circle. Check your inbox for your VIP welcome note!
                </span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  required
                  placeholder="Enter your email address"
                  value={subscribedEmail}
                  onChange={(e) => setSubscribedEmail(e.target.value)}
                  className="flex-1 px-4 py-3 rounded-full bg-[var(--color-charcoal)] border border-[var(--color-slate)] text-sm text-[var(--color-white)] placeholder-[var(--color-mist)] focus:outline-none focus:border-[var(--color-gold)]"
                />
                <button
                  type="submit"
                  className="px-6 py-3 rounded-full bg-[var(--color-gold)] text-[var(--color-ink)] text-sm font-bold uppercase tracking-wider hover:bg-[var(--color-gold-hover)] transition-colors shadow-sm"
                >
                  {newsletter.buttonText}
                </button>
              </form>
            )}

            <p className="text-[11px] text-[var(--color-mist)] mt-4">
              {newsletter.disclaimer}
            </p>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}

export function VidhyasPicksClient({ initialContent }: { initialContent?: VidhyasPicksPageContent }) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[var(--color-white)] flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-3 border-[var(--color-gold)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm font-medium text-[var(--color-slate)]">Loading Vidhya&apos;s Curated Edits...</p>
          </div>
        </div>
      }
    >
      <VidhyasPicksContent initialContent={initialContent} />
    </Suspense>
  );
}

