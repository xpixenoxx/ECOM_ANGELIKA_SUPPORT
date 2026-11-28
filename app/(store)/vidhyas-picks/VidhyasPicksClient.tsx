'use client';

import React, { useState, useMemo, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import { SocialIcon } from '@/components/ui/SocialIcon';
import { cn } from '@/lib/utils/cn';
import { StaggerContainer, StaggerItem, StaggerGrid } from '@/components/animations/Stagger';
import { LinkButton } from '@/components/ui/LinkButton';
import { useWishlist } from '@/lib/hooks/useWishlist';
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
  const col = (productColor || '').toLowerCase();
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

  const name = (product.name || '').toLowerCase();
  const cat = (product.category || '').toLowerCase();
  const color = (product.color || '').toLowerCase();
  const fabric = typeof product.fabric === 'string' ? product.fabric.toLowerCase() : JSON.stringify(product.fabric || '').toLowerCase();
  const origin = (product.origin || '').toLowerCase();
  const note = (product.vidhyaNote || '').toLowerCase();
  const tags = (product.tags || []).join(' ').toLowerCase();

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

  if ((q === 'saree' || q === 'sarees' || q === 'sari') && cat === 'sarees') return true;
  if ((q === 'lehenga' || q === 'lehengas' || q === 'choli' || q === 'bridal') && cat === 'lehengas') return true;
  if ((q === 'kurti' || q === 'kurtis' || q === 'kurta' || q === 'anarkali') && cat === 'kurtis') return true;
  if ((q === 'salwar' || q === 'salwars' || q === 'palazzo' || q === 'sharara' || q === 'suit') && cat === 'salwars') return true;
  if ((q === 'dupatta' || q === 'dupattas' || q === 'scarf' || q === 'phulkari') && cat === 'dupattas') return true;

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
  onToggleWishlist: (product: PickProduct) => void;
}) {
  const href = `/product/${product.slug || product.id}`;
  const whatsappUrl = `https://wa.me/917207256690?text=${encodeURIComponent(
    `Hi Vidhya, I saw your curated pick "${product.name}" in ${product.color} (₹${product.price.toLocaleString('en-IN')}) and would love personal drape advice on sizing and fabric.`
  )}`;

  return (
    <StaggerItem key={product.id} variant="scale" style={{ transitionDelay: `${Math.min(index, 8) * 0.03}s` }}>
      <article className="group relative bg-[var(--color-white)] border border-[var(--color-whisper)] rounded-xl sm:rounded-2xl overflow-hidden hover:shadow-[var(--shadow-lg)] hover:border-[var(--color-gold)]/40 transition-all duration-300 flex flex-col h-full">
        {/* Product Image */}
        <div className="relative aspect-[3/4] w-full overflow-hidden bg-[var(--color-snow)]">
          <Link href={href} className="block w-full h-full">
            <Image
              src={product.image || '/images/collection-kurtis.jpg'}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              priority={index < 4}
            />
          </Link>

          {/* Top Left Discount / Curation Pill */}
          <div className="absolute top-2 left-2 sm:top-3 sm:left-3 flex flex-wrap gap-1 z-10 pointer-events-none">
            <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-semibold uppercase tracking-[0.12em] bg-[#1A1A1A]/85 text-[#E8CF86] backdrop-blur-xs">
              Curated
            </span>
            {product.discount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-semibold bg-white/95 text-[#1A1A1A] border border-black/10">
                -{product.discount}%
              </span>
            )}
          </div>

          {/* Wishlist Toggle */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleWishlist(product);
            }}
            aria-label={isWishlisted ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
            className="absolute top-2 right-2 sm:top-3 sm:right-3 z-10 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/95 backdrop-blur-xs flex items-center justify-center text-[var(--color-ink)] shadow-sm hover:scale-105 transition-transform cursor-pointer"
          >
            <svg
              className={cn(
                'w-4 h-4 sm:w-[18px] sm:h-[18px] transition-colors',
                isWishlisted ? 'text-[var(--color-error)] fill-current' : 'text-[var(--color-ink)]'
              )}
              viewBox="0 0 24 24"
              stroke="currentColor"
              fill={isWishlisted ? 'currentColor' : 'none'}
              strokeWidth="1.9"
              aria-hidden="true"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
        </div>

        {/* Details */}
        <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between gap-2.5">
          <div>
            <div className="flex items-center justify-between gap-1.5 mb-1">
              <span className="text-[10px] text-[#74590E] font-semibold uppercase tracking-[0.14em] truncate">
                {product.category}
              </span>
              {product.color && (
                <span className="hidden sm:inline-block text-[10px] text-stone-600 bg-stone-100 px-2 py-0.5 rounded-full border border-stone-200 truncate max-w-[115px]">
                  {product.color}
                </span>
              )}
            </div>

            <h3 className="font-serif text-[15px] sm:text-lg font-medium text-[var(--color-ink)] leading-snug line-clamp-2 group-hover:text-[#74590E] transition-colors">
              <Link href={href}>{product.name}</Link>
            </h3>

            <p className="text-[11px] sm:text-xs text-[var(--color-slate)] mt-0.5 line-clamp-1">
              {typeof product.fabric === 'string' ? product.fabric : String(product.fabric || 'Artisanal Weave')}
            </p>

            <div className="mt-2 flex items-baseline gap-1.5 flex-wrap">
              <span className="text-sm sm:text-base font-bold text-[var(--color-ink)]">
                ₹{Number(product.price || 0).toLocaleString('en-IN')}
              </span>
              {product.originalPrice > product.price && (
                <span className="text-[11px] sm:text-xs text-[var(--color-mist)] line-through">
                  ₹{Number(product.originalPrice || 0).toLocaleString('en-IN')}
                </span>
              )}
            </div>

            {product.vidhyaNote && (
              <p className="hidden sm:line-clamp-2 text-xs text-[var(--color-slate)]/90 italic mt-2.5 pt-2.5 border-t border-[var(--color-whisper)] leading-relaxed">
                &ldquo;{product.vidhyaNote}&rdquo;
              </p>
            )}
          </div>

          <div className="pt-1 flex items-center gap-1.5 sm:gap-2">
            <LinkButton
              variant="outline"
              size="sm"
              className="flex-1 rounded-full text-[11px] sm:text-xs py-1.5 sm:py-2 justify-center"
              href={href}
            >
              View Piece
            </LinkButton>
            <Link
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Ask Vidhya about ${product.name} on WhatsApp`}
              className="hidden sm:inline-flex p-2 rounded-full border border-[var(--color-whisper)] bg-[var(--color-white)] text-[var(--color-slate)] hover:text-[var(--color-success)] hover:border-[var(--color-success)] transition-colors items-center justify-center flex-shrink-0"
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
  onToggleWishlist: (product: PickProduct) => void;
}) {
  const href = `/product/${product.slug || product.id}`;
  const whatsappUrl = `https://wa.me/917207256690?text=${encodeURIComponent(
    `Hi Vidhya, I saw your curated pick "${product.name}" in ${product.color} (₹${product.price.toLocaleString('en-IN')}) and would love styling advice on sizing and fabric.`
  )}`;

  return (
    <StaggerItem key={product.id} variant="slide" style={{ transitionDelay: `${Math.min(index, 8) * 0.03}s` }}>
      <article className="group relative bg-[var(--color-white)] border border-[var(--color-whisper)] rounded-2xl overflow-hidden hover:shadow-[var(--shadow-lg)] hover:border-[var(--color-gold)]/40 transition-all duration-300 flex flex-col sm:flex-row items-stretch">
        <div className="relative aspect-[3/4] sm:aspect-auto sm:w-64 md:w-72 flex-shrink-0 min-h-[240px] overflow-hidden bg-[var(--color-snow)]">
          <Link href={href} className="block w-full h-full">
            <Image
              src={product.image || '/images/collection-kurtis.jpg'}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              sizes="(max-width: 640px) 100vw, 288px"
            />
          </Link>
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10 pointer-events-none">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-[0.12em] bg-[#1A1A1A]/85 text-[#E8CF86]">
              Vidhya&apos;s Pick
            </span>
            {product.discount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/95 text-[#1A1A1A] border border-black/10">
                -{product.discount}%
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleWishlist(product);
            }}
            aria-label={isWishlisted ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
            className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white/95 flex items-center justify-center text-[var(--color-ink)] shadow-sm cursor-pointer"
          >
            <svg
              className={cn('w-5 h-5 transition-colors', isWishlisted ? 'text-[var(--color-error)] fill-current' : 'text-[var(--color-ink)]')}
              viewBox="0 0 24 24"
              stroke="currentColor"
              fill={isWishlisted ? 'currentColor' : 'none'}
              strokeWidth="1.9"
              aria-hidden="true"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
        </div>

        <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-[#74590E] font-bold uppercase tracking-wider">
                {product.category}
              </span>
              {product.color && (
                <span className="text-[11px] text-[var(--color-slate)] bg-[var(--color-snow)] px-2.5 py-0.5 rounded-full border border-[var(--color-whisper)] font-medium">
                  {product.color}
                </span>
              )}
              {product.origin && (
                <span className="text-[11px] text-[var(--color-slate)]">
                  {product.origin}
                </span>
              )}
            </div>

            <h3 className="font-serif text-xl sm:text-2xl font-medium text-[var(--color-ink)] group-hover:text-[#74590E] transition-colors">
              <Link href={href}>{product.name}</Link>
            </h3>

            <p className="text-sm text-[var(--color-slate)]">
              Fabric: {typeof product.fabric === 'string' ? product.fabric : String(product.fabric || 'Artisanal Weave')}
            </p>

            <div className="flex items-baseline gap-2.5">
              <span className="text-xl font-bold text-[var(--color-ink)]">
                ₹{Number(product.price || 0).toLocaleString('en-IN')}
              </span>
              {product.originalPrice > product.price && (
                <span className="text-sm text-[var(--color-mist)] line-through">
                  ₹{Number(product.originalPrice || 0).toLocaleString('en-IN')}
                </span>
              )}
            </div>

            {product.vidhyaNote && (
              <p className="p-3.5 rounded-xl bg-[var(--color-snow)] border-l-3 border-[var(--color-gold)] text-sm text-[var(--color-slate)] italic">
                &ldquo;{product.vidhyaNote}&rdquo;
              </p>
            )}
          </div>

          <div className="mt-5 pt-4 border-t border-[var(--color-whisper)] flex flex-wrap items-center gap-3">
            <LinkButton variant="primary" size="md" className="rounded-full px-6 text-xs" href={href}>
              View Piece &amp; Sizing
            </LinkButton>
            <Link
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--color-whisper)] text-xs font-medium text-[var(--color-ink)] hover:border-[var(--color-success)] hover:text-[var(--color-success)] transition-colors"
            >
              <SocialIcon platform="whatsapp" size="sm" className="w-4 h-4 text-[var(--color-success)]" />
              Ask Vidhya About Fit
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
  const { isInWishlist, toggleItem } = useWishlist();

  const urlSearch = searchParams.get('search') || searchParams.get('q') || '';
  const urlCategory = searchParams.get('category') || searchParams.get('type') || 'All';
  const urlColor = searchParams.get('color') || 'All';

  const content = initialContent;
  const monthlyEdits = useMemo(() => content?.monthlyEdits || [], [content?.monthlyEdits]);
  const additionalPicks = useMemo(() => content?.additionalPicks || [], [content?.additionalPicks]);

  // Unified, deduplicated pool of all Vidhya's Picks (backwards-compatible with both legacy monthlyEdits and additionalPicks)
  const allPicks: PickProduct[] = useMemo(() => {
    const seen = new Set<string>();
    const combined: PickProduct[] = [];
    const pushUnique = (item: PickProduct) => {
      const key = (item.id || item.slug || item.name || '').trim().toLowerCase();
      if (!key || seen.has(key)) return;
      seen.add(key);
      combined.push(item);
    };

    for (const edit of monthlyEdits) {
      for (const p of edit.products || []) {
        pushUnique({ ...p, month: edit.month, theme: edit.theme });
      }
    }
    for (const p of additionalPicks) {
      pushUnique(p);
    }
    return combined;
  }, [monthlyEdits, additionalPicks]);

  const [searchQuery, setSearchQuery] = useState(urlSearch);
  const [activeCategory, setActiveCategory] = useState<string>(urlCategory);
  const [activeColor, setActiveColor] = useState<string>(urlColor);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'discount'>('featured');
  const filterDialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (urlSearch !== searchQuery) {
      setSearchQuery(urlSearch);
    }
  }, [urlSearch]); // eslint-disable-line react-hooks/exhaustive-deps

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (searchQuery.trim()) count += 1;
    if (activeCategory !== 'All') count += 1;
    if (activeColor !== 'All') count += 1;
    return count;
  }, [searchQuery, activeCategory, activeColor]);

  const filteredProducts = useMemo(() => {
    let result = allPicks.filter((product) => {
      if (activeCategory !== 'All' && product.category !== activeCategory) {
        return false;
      }
      if (!matchesColorFilter(product.color, product.colorFamily, activeColor)) {
        return false;
      }
      if (searchQuery.trim() && !matchesSearchQuery(product, searchQuery)) {
        return false;
      }
      return true;
    });

    if (sortBy === 'price-asc') {
      result = [...result].sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      result = [...result].sort((a, b) => b.price - a.price);
    } else if (sortBy === 'discount') {
      result = [...result].sort((a, b) => b.discount - a.discount);
    }

    return result;
  }, [allPicks, activeCategory, activeColor, searchQuery, sortBy]);

  const handleToggleWishlist = (product: PickProduct) => {
    void toggleItem({
      id: product.id,
      productId: product.id,
      slug: product.slug || product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      discount: product.discount,
      image: product.image,
      category: product.category,
      color: product.color,
      isVidhyasPick: true,
    });
  };

  const handleClearAllFilters = () => {
    setSearchQuery('');
    setActiveCategory('All');
    setActiveColor('All');
    router.replace('/vidhyas-picks', { scroll: false });
  };

  const openFilterDialog = () => {
    filterDialogRef.current?.showModal();
  };

  const closeFilterDialog = () => {
    filterDialogRef.current?.close();
  };

  // Dynamic Content Accessors with clean defaults
  const header = content?.header || {
    eyebrowBadge: "FOUNDER'S CURATION",
    badgeSubtitle: 'Handpicked Atelier Edit',
    title: "Vidhya's Personal Picks",
    titleHighlight: 'Personal',
    description:
      'Hand-selected directly from master looms across Varanasi, Kutch, and Jaipur — chosen for effortless drape, pure natural fiber, and timeless elegance.',
    founder: {
      name: 'Vidhya Sharma',
      role: 'Founder & Creative Director',
      experience: 'Curating pure handloom weaves since 2018',
      avatar: '/images/about/vidhya-profile.jpg',
      storyLinkText: 'Meet Vidhya →',
      storyLinkHref: '/about/vidhya',
    },
  };

  const concierge = content?.concierge || {
    badge: 'ATELIER CONCIERGE',
    title: 'Need Draping, Blouse Cut, or Sizing Advice?',
    description:
      'Connect directly with Vidhya’s styling desk for drape guidance, custom blouse tailoring, and fabric matching.',
    whatsappNumber: '+91 72072 56690',
    whatsappUrl:
      'https://wa.me/917207256690?text=Hi%20Vidhya,%20I%20need%20styling%20advice%20on%20Vidhya%27s%20Picks.',
    sizeGuideText: 'Open Size Finder',
    sizeGuideHref: '/size-finder',
  };

  // Normalize legacy placeholder numbers cleanly at render time too
  const resolvedWhatsappNumber =
    concierge.whatsappNumber && !concierge.whatsappNumber.includes('98765 43210')
      ? concierge.whatsappNumber
      : '+91 72072 56690';
  const resolvedWhatsappUrl =
    concierge.whatsappUrl && !concierge.whatsappUrl.includes('919876543210')
      ? concierge.whatsappUrl
      : 'https://wa.me/917207256690?text=Hi%20Vidhya,%20I%20need%20styling%20advice%20on%20Vidhya%27s%20Picks.';

  const renderTitle = () => {
    const fullTitle = header.title || "Vidhya's Personal Picks";
    const highlight = header.titleHighlight || 'Personal';
    if (!highlight || !fullTitle.includes(highlight)) {
      return fullTitle;
    }
    const parts = fullTitle.split(highlight);
    return (
      <>
        {parts[0]}
        <span className="italic font-normal text-[#74590E] font-serif">{highlight}</span>
        {parts.slice(1).join(highlight)}
      </>
    );
  };

  return (
    <div className="min-h-screen bg-[var(--color-snow)] font-sans antialiased text-[var(--color-ink)] selection:bg-[var(--color-gold-light)] selection:text-[var(--color-ink)]">
      {/* Compact Editorial Masthead — Content-first on mobile & desktop */}
      <section className="bg-gradient-to-b from-[#FAF8F5] to-white border-b border-[var(--color-whisper)] py-6 sm:py-10 md:py-12">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 lg:gap-10">
            <div className="max-w-2xl space-y-2.5 sm:space-y-3">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-semibold bg-[#F3EFEA] text-[#74590E] tracking-[0.14em] uppercase border border-[#E6DEC8]">
                  {header.eyebrowBadge}
                </span>
                {header.badgeSubtitle && (
                  <span className="text-[11px] font-medium text-[var(--color-slate)] uppercase tracking-[0.12em]">
                    {header.badgeSubtitle}
                  </span>
                )}
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight font-serif text-[var(--color-ink)] leading-[1.12]">
                {renderTitle()}
              </h1>

              {header.description && (
                <p className="text-sm sm:text-base text-[var(--color-slate)] leading-relaxed line-clamp-3 sm:line-clamp-none">
                  {header.description}
                </p>
              )}
            </div>

            {/* Compact Founder Attribution Strip */}
            <div className="flex items-center justify-between sm:justify-start gap-3.5 px-3.5 py-2.5 rounded-2xl bg-[#FAF8F5] border border-[var(--color-whisper)] lg:shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden border border-[#C9A84C]/50 flex-shrink-0 bg-[#F3EFEA]">
                  <Image
                    src={header.founder?.avatar || '/images/about/vidhya-profile.jpg'}
                    alt={header.founder?.name || 'Vidhya Sharma'}
                    fill
                    className="object-cover"
                    sizes="44px"
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-semibold text-[var(--color-ink)] truncate">
                    {header.founder?.name || 'Vidhya Sharma'}
                  </p>
                  <p className="text-[11px] text-[var(--color-slate)] truncate">
                    {header.founder?.role || 'Founder & Creative Director'}
                  </p>
                </div>
              </div>
              {header.founder?.storyLinkText && (
                <Link
                  href={header.founder.storyLinkHref || '/about/vidhya'}
                  className="text-[11px] sm:text-xs font-semibold text-[#74590E] hover:text-[var(--color-ink)] transition-colors whitespace-nowrap shrink-0 pl-2"
                >
                  {header.founder.storyLinkText}
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Non-Sticky Refinement Controls — Zero stacked sticky bars on mobile */}
      <section className="bg-white border-b border-[var(--color-whisper)]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* Mobile Compact Single-Row Control Bar (< lg) */}
          <div className="lg:hidden py-3 space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={openFilterDialog}
                  className={cn(
                    'inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full text-xs font-semibold border transition-colors cursor-pointer',
                    activeFilterCount > 0
                      ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                      : 'bg-[#FAF8F5] text-[#1A1A1A] border-[#DDD4C7] hover:border-[#C9A84C]'
                  )}
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <line x1="4" y1="6" x2="20" y2="6" />
                    <line x1="7" y1="12" x2="17" y2="12" />
                    <line x1="10" y1="18" x2="14" y2="18" />
                  </svg>
                  <span>Filter &amp; Search</span>
                  {activeFilterCount > 0 && (
                    <span className="ml-0.5 w-4 h-4 rounded-full bg-[#C9A84C] text-[#1A1A1A] text-[10px] font-bold flex items-center justify-center">
                      {activeFilterCount}
                    </span>
                  )}
                </button>

                <span className="text-xs text-[var(--color-slate)] font-medium">
                  {filteredProducts.length} {filteredProducts.length === 1 ? 'piece' : 'pieces'}
                </span>
              </div>

              <select
                aria-label="Sort Vidhya's Picks"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="h-9 text-xs bg-[#FAF8F5] border border-[#DDD4C7] rounded-full px-3 font-medium text-[#1A1A1A] focus:outline-none focus:border-[#C9A84C]"
              >
                <option value="featured">Featured</option>
                <option value="price-asc">Price: Low–High</option>
                <option value="price-desc">Price: High–Low</option>
                <option value="discount">Best Savings</option>
              </select>
            </div>

            {/* 1-Tap Horizontal Category Rail (Scrolls naturally with page, NEVER sticky) */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none -mx-4 px-4">
              {CATEGORIES.map((cat) => {
                const count =
                  cat === 'All'
                    ? allPicks.length
                    : allPicks.filter((p) => p.category === cat).length;
                if (cat !== 'All' && count === 0) return null;
                const isSelected = activeCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActiveCategory(cat)}
                    className={cn(
                      'px-3 py-1.5 text-xs rounded-full whitespace-nowrap transition-colors font-medium shrink-0 flex items-center gap-1 cursor-pointer',
                      isSelected
                        ? 'bg-[#1A1A1A] text-white'
                        : 'bg-[#FAF8F5] text-[var(--color-slate)] border border-[#E5DDD0]'
                    )}
                  >
                    <span>{cat}</span>
                    <span className={cn('text-[10px]', isSelected ? 'text-[#E8CF86]' : 'opacity-65')}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Desktop Single-Row Refined Toolbar (>= lg) */}
          <div className="hidden lg:flex items-center justify-between gap-4 py-3.5">
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
              {CATEGORIES.map((cat) => {
                const count =
                  cat === 'All'
                    ? allPicks.length
                    : allPicks.filter((p) => p.category === cat).length;
                if (cat !== 'All' && count === 0) return null;
                const isSelected = activeCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActiveCategory(cat)}
                    className={cn(
                      'px-3.5 py-1.5 text-xs rounded-full whitespace-nowrap transition-colors font-medium shrink-0 flex items-center gap-1.5 cursor-pointer',
                      isSelected
                        ? 'bg-[#1A1A1A] text-white'
                        : 'bg-[#FAF8F5] text-[var(--color-slate)] hover:text-[#1A1A1A] border border-[var(--color-whisper)]'
                    )}
                  >
                    <span>{cat}</span>
                    <span className={cn('text-[10px]', isSelected ? 'text-[#E8CF86]' : 'opacity-70')}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <div className="relative w-60">
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--color-mist)] pointer-events-none"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
                <input
                  type="search"
                  placeholder="Search silk, saree, color..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-9 pl-8 pr-7 text-xs bg-[#FAF8F5] border border-[var(--color-whisper)] rounded-full focus:border-[#C9A84C] focus:outline-none focus:bg-white transition-colors [&::-webkit-search-cancel-button]:hidden"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--color-mist)] hover:text-[var(--color-ink)] cursor-pointer"
                    aria-label="Clear search"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>

              <select
                aria-label="Filter by color"
                value={activeColor}
                onChange={(e) => setActiveColor(e.target.value)}
                className="h-9 text-xs bg-[#FAF8F5] border border-[var(--color-whisper)] rounded-full px-3 font-medium text-[var(--color-ink)] focus:outline-none focus:border-[#C9A84C]"
              >
                {COLOR_FILTERS.map((col) => (
                  <option key={col.value} value={col.value}>
                    {col.label}
                  </option>
                ))}
              </select>

              <select
                aria-label="Sort Vidhya's Picks"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="h-9 text-xs bg-[#FAF8F5] border border-[var(--color-whisper)] rounded-full px-3 font-medium text-[var(--color-ink)] focus:outline-none focus:border-[#C9A84C]"
              >
                <option value="featured">Featured Picks</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="discount">Highest Savings</option>
              </select>

              <div className="flex items-center border border-[var(--color-whisper)] rounded-full overflow-hidden bg-[#FAF8F5] p-0.5">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    'p-1.5 rounded-full transition-colors cursor-pointer',
                    viewMode === 'grid'
                      ? 'bg-[#1A1A1A] text-white'
                      : 'text-[var(--color-slate)] hover:text-[var(--color-ink)]'
                  )}
                  aria-label="Grid view"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
                    'p-1.5 rounded-full transition-colors cursor-pointer',
                    viewMode === 'list'
                      ? 'bg-[#1A1A1A] text-white'
                      : 'text-[var(--color-slate)] hover:text-[var(--color-ink)]'
                  )}
                  aria-label="List view"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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

          {/* Active Filters Chips Row (only shown when user has applied search/color filters) */}
          {activeFilterCount > 0 && (
            <div className="pb-3 flex flex-wrap items-center gap-2 text-xs">
              {searchQuery.trim() && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FAF8F5] border border-[#DDD4C7] text-[#1A1A1A] cursor-pointer"
                >
                  <span>Search: &ldquo;{searchQuery.trim()}&rdquo;</span>
                  <span aria-hidden="true">×</span>
                </button>
              )}
              {activeColor !== 'All' && (
                <button
                  type="button"
                  onClick={() => setActiveColor('All')}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FAF8F5] border border-[#DDD4C7] text-[#1A1A1A] cursor-pointer"
                >
                  <span>Color: {COLOR_FILTERS.find((c) => c.value === activeColor)?.label || activeColor}</span>
                  <span aria-hidden="true">×</span>
                </button>
              )}
              <button
                type="button"
                onClick={handleClearAllFilters}
                className="text-xs font-semibold text-[#74590E] underline hover:text-[#1A1A1A] cursor-pointer"
              >
                Reset all
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Native <dialog> Mobile Filter & Search Sheet */}
      <dialog
        ref={filterDialogRef}
        onClick={(e) => {
          if (e.target === filterDialogRef.current) closeFilterDialog();
        }}
        className="w-full max-w-md m-auto mb-0 sm:mb-auto rounded-t-3xl sm:rounded-2xl p-0 bg-white text-[var(--color-ink)] shadow-2xl backdrop:bg-black/50 backdrop:backdrop-blur-xs max-h-[85dvh] overflow-hidden"
      >
        <div className="flex flex-col max-h-[85dvh]">
          <div className="px-5 py-4 border-b border-[var(--color-whisper)] flex items-center justify-between">
            <h2 className="font-serif text-xl font-medium text-[var(--color-ink)]">
              Filter &amp; Search
            </h2>
            <button
              type="button"
              onClick={closeFilterDialog}
              aria-label="Close filter menu"
              className="w-8 h-8 rounded-full bg-[#FAF8F5] flex items-center justify-center text-[var(--color-ink)] cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="p-5 overflow-y-auto space-y-6">
            {/* Search Input */}
            <div className="space-y-2">
              <label htmlFor="mobile-vp-search" className="block text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--color-slate)]">
                Search Pieces
              </label>
              <div className="relative">
                <input
                  id="mobile-vp-search"
                  type="search"
                  placeholder="Try Saree, Banarasi, Emerald, Kurti..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-11 pl-4 pr-9 text-sm bg-[#FAF8F5] border border-[#DDD4C7] rounded-xl focus:border-[#C9A84C] focus:bg-white focus:outline-none [&::-webkit-search-cancel-button]:hidden"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    aria-label="Clear search text"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-slate)] cursor-pointer"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>

            {/* Category */}
            <div className="space-y-2.5">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--color-slate)]">
                Silhouette / Type
              </p>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => {
                  const count =
                    cat === 'All'
                      ? allPicks.length
                      : allPicks.filter((p) => p.category === cat).length;
                  if (cat !== 'All' && count === 0) return null;
                  const isSelected = activeCategory === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setActiveCategory(cat)}
                      className={cn(
                        'px-3.5 py-2 text-xs rounded-full font-medium flex items-center gap-1.5 border cursor-pointer transition-colors',
                        isSelected
                          ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                          : 'bg-[#FAF8F5] text-[var(--color-ink)] border-[#DDD4C7]'
                      )}
                    >
                      <span>{cat}</span>
                      <span className="text-[10px] opacity-75">{count}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Color Palette */}
            <div className="space-y-2.5">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--color-slate)]">
                Color Palette
              </p>
              <div className="flex flex-wrap gap-2">
                {COLOR_FILTERS.map((col) => {
                  const isSelected = activeColor === col.value;
                  const count =
                    col.value === 'All'
                      ? allPicks.length
                      : allPicks.filter((p) => matchesColorFilter(p.color, p.colorFamily, col.value)).length;
                  return (
                    <button
                      key={col.value}
                      type="button"
                      onClick={() => setActiveColor(col.value)}
                      className={cn(
                        'px-3 py-2 text-xs rounded-full font-medium flex items-center gap-1.5 border cursor-pointer transition-colors',
                        isSelected
                          ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                          : 'bg-white text-[var(--color-ink)] border-[#DDD4C7]'
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

          <div className="px-5 py-4 border-t border-[var(--color-whisper)] bg-[#FAF8F5] flex items-center gap-3">
            <button
              type="button"
              onClick={handleClearAllFilters}
              className="px-4 py-2.5 rounded-full border border-[#DDD4C7] bg-white text-xs font-semibold text-[var(--color-ink)] cursor-pointer"
            >
              Clear All
            </button>
            <button
              type="button"
              onClick={closeFilterDialog}
              className="flex-1 py-2.5 px-5 rounded-full bg-[#1A1A1A] text-white text-xs font-semibold uppercase tracking-[0.14em] cursor-pointer"
            >
              Show {filteredProducts.length} {filteredProducts.length === 1 ? 'Piece' : 'Pieces'}
            </button>
          </div>
        </div>
      </dialog>

      {/* Main Curated Pieces Grid */}
      <section className="py-6 sm:py-10 md:py-12 bg-white">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="hidden sm:flex items-center justify-between mb-6">
            <p className="text-xs uppercase tracking-[0.16em] text-[var(--color-slate)] font-medium">
              Showing <span className="font-semibold text-[var(--color-ink)]">{filteredProducts.length}</span> curated{' '}
              {filteredProducts.length === 1 ? 'piece' : 'pieces'}
              {activeCategory !== 'All' ? ` in ${activeCategory}` : ''}
            </p>
            <Link
              href="/shop"
              className="text-xs font-semibold text-[#74590E] hover:text-[var(--color-ink)] transition-colors"
            >
              Browse Full Catalog →
            </Link>
          </div>

          {filteredProducts.length > 0 ? (
            viewMode === 'grid' ? (
              <StaggerGrid
                items={filteredProducts}
                columns={4}
                gap={16}
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 lg:gap-6"
                renderItem={(product, index) => (
                  <ProductCardGrid
                    key={product.id}
                    product={product}
                    index={index}
                    isWishlisted={isInWishlist(product.slug || product.id) || isInWishlist(product.id)}
                    onToggleWishlist={handleToggleWishlist}
                  />
                )}
              />
            ) : (
              <StaggerContainer variant="default" className="space-y-5">
                {filteredProducts.map((product, index) => (
                  <ProductCardList
                    key={product.id}
                    product={product}
                    index={index}
                    isWishlisted={isInWishlist(product.slug || product.id) || isInWishlist(product.id)}
                    onToggleWishlist={handleToggleWishlist}
                  />
                ))}
              </StaggerContainer>
            )
          ) : (
            <div className="py-10">
              <div className="p-7 sm:p-10 text-center bg-[#FAF8F5] rounded-2xl border border-[var(--color-whisper)] max-w-xl mx-auto">
                <h2 className="font-serif text-2xl font-medium text-[var(--color-ink)] mb-2">
                  No Matching Pieces Found
                </h2>
                <p className="text-sm text-[var(--color-slate)] mb-5 leading-relaxed">
                  We couldn&apos;t find curated picks matching &ldquo;{searchQuery || activeCategory}&rdquo;. Reset filters to explore all of Vidhya&apos;s selections.
                </p>
                <button
                  type="button"
                  onClick={handleClearAllFilters}
                  className="py-2.5 px-6 rounded-full bg-[#1A1A1A] text-white text-xs font-semibold uppercase tracking-[0.14em] hover:bg-[#333333] transition-colors cursor-pointer"
                >
                  View All Curated Picks
                </button>
              </div>

              {allPicks.length > 0 && (
                <div className="mt-10">
                  <h3 className="text-lg sm:text-xl font-medium text-[var(--color-ink)] font-serif mb-5">
                    Explore Vidhya&apos;s Signature Picks
                  </h3>
                  <StaggerGrid
                    items={allPicks.slice(0, 4)}
                    columns={4}
                    gap={16}
                    className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 lg:gap-6"
                    renderItem={(product, index) => (
                      <ProductCardGrid
                        key={product.id}
                        product={product}
                        index={index}
                        isWishlisted={isInWishlist(product.slug || product.id) || isInWishlist(product.id)}
                        onToggleWishlist={handleToggleWishlist}
                      />
                    )}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Streamlined Atelier Styling Concierge Strip */}
      <section className="py-10 sm:py-14 bg-[#FAF8F5] border-t border-[var(--color-whisper)]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-[#1A1A1A] text-white p-6 sm:p-10 md:p-12 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="max-w-xl space-y-2">
              <span className="inline-block text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.18em] text-[#C9A84C]">
                {concierge.badge}
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-medium leading-snug text-white">
                {concierge.title}
              </h2>
              <p className="text-xs sm:text-sm text-white/75 leading-relaxed">
                {concierge.description}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <Link
                href={resolvedWhatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-[#C9A84C] text-[#1A1A1A] text-xs font-bold uppercase tracking-[0.12em] hover:bg-[#D8BA66] transition-colors"
              >
                <SocialIcon platform="whatsapp" size="sm" className="w-4 h-4 text-current" />
                <span>Concierge ({resolvedWhatsappNumber})</span>
              </Link>
              <Link
                href={concierge.sizeGuideHref || '/size-finder'}
                className="inline-flex items-center justify-center px-5 py-3 rounded-full border border-white/25 text-white text-xs font-semibold uppercase tracking-[0.12em] hover:border-[#C9A84C] hover:text-[#E8CF86] transition-colors"
              >
                {concierge.sizeGuideText || 'Open Size Finder'}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export function VidhyasPicksClient({ initialContent }: { initialContent?: VidhyasPicksPageContent }) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <div className="w-10 h-10 border-3 border-[var(--color-gold)] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm font-medium text-[var(--color-slate)]">Loading Vidhya&apos;s Picks...</p>
          </div>
        </div>
      }
    >
      <VidhyasPicksContent initialContent={initialContent} />
    </Suspense>
  );
}
