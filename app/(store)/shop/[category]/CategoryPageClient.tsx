'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card, ProductCard } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select, SelectTrigger, SelectContent, SelectValue, SelectItem } from '@/components/ui/Select';
import { Checkbox } from '@/components/ui/Checkbox';
import { Slider } from '@/components/ui/Slider';
import { Drawer } from '@/components/ui/Drawer';
import { ScrollReveal } from '@/components/composite/ScrollReveal';
import { Pagination } from '@/components/composite/Pagination';
import { cn } from '@/lib/utils/cn';
import { StaggerContainer, StaggerItem, StaggerGrid } from '@/components/animations/Stagger';
import { ScrollReveal as ScrollRevealAnim } from '@/components/animations/ScrollReveal';
import { MagneticButton } from '@/components/animations/MagneticButton';
import { MagneticCard } from '@/components/animations/MagneticButton';
import { useCart } from '@/lib/hooks/useCart';
import { useWishlist } from '@/lib/hooks/useWishlist';
import type { ShopProductCard, ShopFilters } from '@/lib/actions/shop-types';
import type { SalwarsPageContent, LehengasPageContent, SareesPageContent, DupattasPageContent, ShopPageContent } from '@/lib/actions/site-content-types';
import { SHOP_SORT_OPTIONS, SHOP_CATEGORIES, SHOP_FABRICS, SHOP_COLORS, SHOP_SIZES } from '@/lib/actions/shop-types';
import type { KurtisPageContent } from '@/lib/actions/site-content';

interface CategoryPageClientProps {
  category: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    image_url: string | null;
  };
  initialProducts: ShopProductCard[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  sortBy: string;
  initialFilters: ShopFilters;
  categorySlug: string;
  kurtisContent?: KurtisPageContent;
  salwarsContent?: SalwarsPageContent | null;
  lehengasContent?: LehengasPageContent | null;
  sareesContent?: SareesPageContent | null;
  dupattasContent?: DupattasPageContent | null;
  shopContent?: ShopPageContent | null;
}

const CATEGORIES_NAVIGATION = [
  { slug: '', name: 'All Collections', image: '/images/hero-new-couture.jpg', href: '/shop' },
  { slug: 'kurtis', name: 'Kurtis', image: '/images/collection-kurtis.jpg', href: '/shop/kurtis' },
  { slug: 'salwars', name: 'Salwars', image: '/images/collection-salwars.jpg', href: '/shop/salwars' },
  { slug: 'lehengas', name: 'Lehengas', image: '/images/collection-lehengas.jpg', href: '/shop/lehengas' },
  { slug: 'sarees', name: 'Sarees', image: '/images/collection-sarees.jpg', href: '/shop/sarees' },
  { slug: 'dupattas', name: 'Dupattas', image: '/images/collection-dupattas.jpg', href: '/shop/dupattas' },
];

export function CategoryPageClient({
  category,
  initialProducts,
  totalCount,
  totalPages,
  currentPage,
  sortBy,
  initialFilters,
  categorySlug,
  kurtisContent,
  salwarsContent,
  lehengasContent,
  sareesContent,
  dupattasContent,
  shopContent,
}: CategoryPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addItem } = useCart();
  const { toggleItem, isInWishlist } = useWishlist();

  const handleToggleWishlist = async (product: any) => {
    try {
      await toggleItem(product.id, undefined, {
        id: product.id,
        slug: product.slug,
        name: product.name,
        price: product.price,
        originalPrice: product.originalPrice || product.compare_at_price,
        discount: product.discount,
        image: product.image || product.images?.[0]?.url || product.images?.[0] || '/images/collection-kurtis.jpg',
        category: product.category?.name || product.category || 'Ethnic Wear',
        isVidhyasPick: product.isVidhyasPick || product.is_vidyas_pick,
      });
    } catch (err) {
      console.error('Failed to toggle wishlist:', err);
    }
  };
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filters, setFilters] = useState<ShopFilters>(initialFilters);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [localSortBy, setLocalSortBy] = useState(sortBy);
  const [isClientLoaded, setIsClientLoaded] = useState(false);
  const activeCategoryContent = shopContent || salwarsContent || lehengasContent || sareesContent || dupattasContent;

  // Dynamic Kurtis Page configurations from admin panel
  const isKurtis = (categorySlug || '').toLowerCase() === 'kurtis';
  const pageBadge = isKurtis && kurtisContent?.badge
    ? kurtisContent.badge
    : activeCategoryContent?.hero?.badge || 'Handcrafted Luxury Edit';
  const pageTitle = isKurtis && kurtisContent?.title
    ? kurtisContent.title
    : (activeCategoryContent?.hero?.title || category.name || 'All Collections');
  const pageDesc = isKurtis && kurtisContent?.description
    ? kurtisContent.description
    : (activeCategoryContent?.hero?.description || category.description || 'Discover our curated collection of handcrafted Indian ethnic couture.');
  const heroBg = isKurtis && kurtisContent?.heroImage
    ? kurtisContent.heroImage
    : (activeCategoryContent?.hero?.backgroundImage || category.image_url || '/images/hero-new-couture.jpg');
  const cardImg = isKurtis && kurtisContent?.cardImage
    ? kurtisContent.cardImage
    : (activeCategoryContent?.hero?.featuredCardImage || category.image_url || '/images/collection-kurtis.jpg');
  const cardBadgeText = isKurtis && kurtisContent?.cardBadge
    ? kurtisContent.cardBadge
    : (activeCategoryContent?.hero?.featuredCardTag || 'Curated by Vidhya');
  const cardSubtitleText = isKurtis && kurtisContent?.cardSubtitle
    ? kurtisContent.cardSubtitle
    : (activeCategoryContent?.hero?.featuredCardText || `${totalCount} Pieces`);
  const showPromo = isKurtis && kurtisContent?.showPromoBanner !== false && Boolean(kurtisContent?.promoText);
  const showCategoryNav = isKurtis ? kurtisContent?.showCategoryStrip !== false : true;
  const showSidebar = isKurtis ? kurtisContent?.showSidebar !== false : true;
  const showStyling = isKurtis && kurtisContent?.showStylingGuide !== false;
  const stylingBadge = isKurtis && kurtisContent?.stylingBadge ? kurtisContent.stylingBadge : 'ATELIER NOTES & STYLING';

  // Convert custom Kurtis products from admin panel into ShopProductCard format
  const resolvedInitialProducts: ShopProductCard[] = useMemo(() => {
    if (isKurtis && Array.isArray(kurtisContent?.products) && kurtisContent.products.length > 0 && kurtisContent?.productsMode !== 'database') {
      return kurtisContent.products.map((p) => ({
        id: p.id,
        slug: p.href ? p.href.replace('/product/', '') : p.id,
        name: p.name,
        price: p.price,
        compare_at_price: p.originalPrice ?? null,
        image: p.image || '/images/collection-kurtis.jpg',
        images: [{ id: `img-${p.id}`, product_id: p.id, url: p.image || '/images/collection-kurtis.jpg', alt_text: p.name, sort_order: 0, is_primary: true, created_at: '' }] as any,
        category: { id: 'cat-kurtis', name: p.category || 'Kurtis', slug: 'kurtis', description: null, image_url: null, parent_id: null, sort_order: 1, is_active: true, created_at: '', updated_at: '' },
        discount: p.discount || (p.originalPrice && p.originalPrice > p.price ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100) : 0),
        is_featured: Boolean(p.isNew),
        is_vidyas_pick: Boolean(p.isVidhyasPick),
        created_at: p.isNew ? new Date().toISOString() : '2026-01-01T00:00:00Z',
        rating: p.rating || 4.8,
        review_count: p.reviewCount || 12,
        variants: [
          { id: `var-${p.id}-s`, size: 'S', price: p.price, compare_at_price: p.originalPrice ?? null, inventory_quantity: p.inStock !== false ? 5 : 0 },
          { id: `var-${p.id}-m`, size: 'M', price: p.price, compare_at_price: p.originalPrice ?? null, inventory_quantity: p.inStock !== false ? 8 : 0 },
          { id: `var-${p.id}-l`, size: 'L', price: p.price, compare_at_price: p.originalPrice ?? null, inventory_quantity: p.inStock !== false ? 4 : 0 },
        ],
        defaultVariantId: `var-${p.id}-m`,
        fabric: p.fabric || 'Cotton',
        tags: [p.fabric || 'Cotton', p.isVidhyasPick ? "Vidhya's Pick" : '', p.isNew ? 'New' : ''].filter(Boolean),
        occasion: ['Festive', 'Casual'],
      } as ShopProductCard));
    }

    if (shopContent?.productsMode === 'custom' && Array.isArray(shopContent.products) && shopContent.products.length > 0) {
      return shopContent.products.map((p, idx) => {
        const itemPrice = typeof p.price === 'number' ? p.price : Number(p.price) || 4999;
        const origPrice = p.originalPrice ? (typeof p.originalPrice === 'number' ? p.originalPrice : Number(p.originalPrice) || null) : null;
        const discount = p.discount || (origPrice && origPrice > itemPrice ? Math.round(((origPrice - itemPrice) / origPrice) * 100) : 0);

        return ({
          id: p.id || `shop-item-${idx + 1}`,
          slug: p.slug || p.id || `shop-item-${idx + 1}`,
          name: p.name,
          price: itemPrice,
          compare_at_price: origPrice,
          image: p.image || '/images/collection-kurtis.jpg',
          images: [{ id: `img-${p.id || idx}`, product_id: p.id || `shop-${idx}`, url: p.image || '/images/collection-kurtis.jpg', alt_text: p.name, sort_order: 0, is_primary: true, created_at: '' }] as any,
          category: { id: `cat-${p.category?.toLowerCase() || 'shop'}`, name: p.category || 'Collection', slug: p.category?.toLowerCase() || '', description: null, image_url: null, parent_id: null, sort_order: 1, is_active: true, created_at: '', updated_at: '' } as any,
          discount,
          is_featured: Boolean(p.badge),
          is_vidyas_pick: Boolean(p.isVidhyasPick),
          created_at: new Date(Date.now() - idx * 86400000).toISOString(),
          rating: p.rating || 4.8,
          review_count: p.reviewCount || 12,
          variants: (p.sizes || ['S', 'M', 'L']).map((sz, szIdx) => ({
            id: `var-${p.id || idx}-${szIdx}`,
            size: sz,
            price: itemPrice,
            compare_at_price: origPrice,
            inventory_quantity: p.inStock !== false ? 8 : 0,
          })),
          defaultVariantId: `var-${p.id || idx}-0`,
          fabric: p.fabric || 'Silk',
          color: p.color || 'Ivory',
          tags: [p.fabric, p.color, p.badge].filter(Boolean) as string[],
          occasion: ['Festive', 'Celebration'],
        } as unknown as ShopProductCard);
      });
    }

    return initialProducts;
  }, [isKurtis, kurtisContent?.products, kurtisContent?.productsMode, shopContent?.products, shopContent?.productsMode, initialProducts]);

  const [allProducts, setAllProducts] = useState<ShopProductCard[]>(resolvedInitialProducts);

  const handleAddToBag = async (product: any) => {
    try {
      const targetId = product.defaultVariantId || product.variant_id || product.id || product.slug || 'prod-1';
      const imgUrl = product.image || product.images?.[0]?.url || product.images?.[0] || '/images/collection-kurtis.jpg';
      const rawPrice = product.price;
      const priceVal = typeof rawPrice === 'number' && !isNaN(rawPrice) && rawPrice > 0
        ? rawPrice
        : Number(String(rawPrice || '').replace(/[^0-9.]/g, '')) || 2999;
      const isVP = Boolean(product.isVidhyasPick || product.is_vidyas_pick);
      const prodName = product.name || product.title || 'Handcrafted Luxury Ensemble';

      return await addItem(targetId, 1, 'Free Size', {
        product_id: product.id || targetId,
        product_name: prodName,
        price: priceVal,
        image: imgUrl,
        is_vidyas_pick: isVP,
      });
    } catch (err) {
      console.error('Failed to add to bag:', err);
      return false;
    }
  };

  // Sync initial state when server props update
  useEffect(() => {
    setIsClientLoaded(true);
    setFilters(initialFilters);
    setAllProducts(resolvedInitialProducts);
  }, [initialFilters, resolvedInitialProducts]);

  // Real-time instant filtering across the loaded catalog
  const filteredProducts = useMemo(() => {
    return allProducts.filter((product) => {
      // 1. Category filter
      if (filters.categories && filters.categories.length > 0) {
        if (!product.category || !filters.categories.includes(product.category.slug)) {
          return false;
        }
      }

      // 2. In Stock Only
      if (filters.inStockOnly) {
        const variants = product.variants || [];
        const hasStock = variants.length === 0 || variants.some((v: any) => (v.inventory_quantity ?? 1) > 0);
        if (!hasStock) return false;
      }

      // 3. Vidhya's Picks Only
      if (filters.vidhyasPicksOnly) {
        if (!product.is_vidyas_pick) return false;
      }

      // 4. Fabric filter
      if (filters.fabrics && filters.fabrics.length > 0) {
        const selected = filters.fabrics.map((f: string) => f.toLowerCase());
        const fabricStr = JSON.stringify(product.fabric || '').toLowerCase();
        const tagsStr = (product.tags || []).join(' ').toLowerCase();
        const nameStr = (product.name || '').toLowerCase();
        const matches = selected.some((f: string) => fabricStr.includes(f) || tagsStr.includes(f) || nameStr.includes(f));
        if (!matches) return false;
      }

      // 5. Color filter
      if (filters.colors && filters.colors.length > 0) {
        const selected = filters.colors.map((c: string) => c.toLowerCase());
        const text = `${product.name} ${product.slug} ${(product.tags || []).join(' ')} ${JSON.stringify(product.fabric || '')}`.toLowerCase();
        const matches = selected.some((color: string) => {
          if (text.includes(color)) return true;
          if (color === 'red' && (text.includes('crimson') || text.includes('ruby') || text.includes('maroon') || text.includes('scarlet'))) return true;
          if (color === 'blue' && (text.includes('indigo') || text.includes('navy') || text.includes('sapphire') || text.includes('teal'))) return true;
          if (color === 'green' && (text.includes('emerald') || text.includes('olive') || text.includes('mint') || text.includes('pista'))) return true;
          if (color === 'pink' && (text.includes('blush') || text.includes('rose') || text.includes('peach') || text.includes('coral'))) return true;
          if (color === 'yellow' && (text.includes('mustard') || text.includes('haldi') || text.includes('gold') || text.includes('lemon'))) return true;
          if (color === 'white' && (text.includes('ivory') || text.includes('cream') || text.includes('pearl') || text.includes('off-white'))) return true;
          if (color === 'black' && (text.includes('noir') || text.includes('charcoal'))) return true;
          if (color === 'purple' && (text.includes('lavender') || text.includes('violet') || text.includes('plum') || text.includes('mauve'))) return true;
          if (color === 'gold' && (text.includes('zari') || text.includes('gota') || text.includes('golden') || text.includes('metallic'))) return true;
          return false;
        });
        if (!matches) return false;
      }

      // 6. Size filter
      if (filters.sizes && filters.sizes.length > 0) {
        const selected = filters.sizes.map((s: string) => s.toLowerCase());
        const variants = product.variants || [];
        const matches = variants.some((v: any) => {
          const vSize = (v.size || '').toLowerCase();
          const isInStock = (v.inventory_quantity ?? 1) > 0;
          return isInStock && selected.includes(vSize);
        });
        if (!matches) return false;
      }

      // 7. Price Range filter
      if (filters.priceRange) {
        const rangeArr = Array.isArray(filters.priceRange)
          ? filters.priceRange
          : [0, Number(filters.priceRange) || 25000];
        const [min, max] = rangeArr;
        if (typeof min === 'number' && typeof max === 'number') {
          if (product.price < min || product.price > max) return false;
        }
      }

      return true;
    });
  }, [allProducts, filters]);

  // Sort filtered products client-side immediately
  const sortedProducts = useMemo(() => {
    const sorted = [...filteredProducts];
    switch (localSortBy) {
      case 'price-asc':
        return sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
      case 'price-desc':
        return sorted.sort((a, b) => (b.price || 0) - (a.price || 0));
      case 'popularity':
        return sorted.sort((a, b) => (b.review_count || 0) - (a.review_count || 0));
      case 'discount':
        return sorted.sort((a, b) => (b.discount || 0) - (a.discount || 0));
      case 'newest':
      default:
        return sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
  }, [filteredProducts, localSortBy]);

  // Compute live counts for each filter option
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    SHOP_CATEGORIES.forEach((cat) => {
      counts[cat.value] = allProducts.filter((p) => p.category?.slug === cat.value).length;
    });
    return counts;
  }, [allProducts]);

  const fabricCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    SHOP_FABRICS.forEach((fab) => {
      counts[fab.value] = allProducts.filter((p) => {
        const fabricStr = JSON.stringify(p.fabric || '').toLowerCase();
        const tagsStr = (p.tags || []).join(' ').toLowerCase();
        const nameStr = (p.name || '').toLowerCase();
        return fabricStr.includes(fab.value) || tagsStr.includes(fab.value) || nameStr.includes(fab.value);
      }).length;
    });
    return counts;
  }, [allProducts]);

  const inStockCount = useMemo(() => {
    return allProducts.filter((p) => {
      const variants = p.variants || [];
      return variants.length === 0 || variants.some((v: any) => (v.inventory_quantity ?? 1) > 0);
    }).length;
  }, [allProducts]);

  const vidhyasCount = useMemo(() => {
    return allProducts.filter((p) => Boolean(p.is_vidyas_pick)).length;
  }, [allProducts]);

  const handleFilterChange = (key: string, value: any) => {
    let sanitizedValue = value;
    if (key === 'priceRange') {
      sanitizedValue = Array.isArray(value) ? value : [0, Number(value) || 25000];
    }
    setFilters((prev) => ({ ...prev, [key]: sanitizedValue }));
  };

  const handleRemoveFilter = (key: keyof ShopFilters, valueToRemove?: any) => {
    setFilters((prev) => {
      if (key === 'categories' || key === 'fabrics' || key === 'colors' || key === 'sizes') {
        const current = (prev[key] || []) as string[];
        return { ...prev, [key]: current.filter((item) => item !== valueToRemove) };
      }
      if (key === 'inStockOnly' || key === 'vidhyasPicksOnly') {
        return { ...prev, [key]: false };
      }
      if (key === 'priceRange') {
        return { ...prev, priceRange: [0, 25000] };
      }
      return prev;
    });
  };

  const handleSortChange = (value: string) => {
    setLocalSortBy(value);
  };

  // Sync URL search params when filters change (debounced without page reload)
  useEffect(() => {
    if (!isClientLoaded) return;
    const timer = setTimeout(() => {
      const params = new URLSearchParams();
      if (filters.categories && filters.categories.length > 0) {
        params.set('categories', filters.categories.join(','));
      }
      if (filters.fabrics && filters.fabrics.length > 0) {
        params.set('fabrics', filters.fabrics.join(','));
      }
      if (filters.colors && filters.colors.length > 0) {
        params.set('colors', filters.colors.join(','));
      }
      if (filters.sizes && filters.sizes.length > 0) {
        params.set('sizes', filters.sizes.join(','));
      }
      if (filters.priceRange && Array.isArray(filters.priceRange) && (filters.priceRange[0] > 0 || filters.priceRange[1] < 25000)) {
        params.set('priceRange', filters.priceRange.join(','));
      }
      if (filters.inStockOnly) {
        params.set('inStockOnly', 'true');
      }
      if (filters.vidhyasPicksOnly) {
        params.set('vidhyasPicksOnly', 'true');
      }
      if (localSortBy && localSortBy !== 'newest') {
        params.set('sort', localSortBy);
      }
      const basePath = categorySlug && categorySlug !== 'all' ? `/shop/${categorySlug}` : '/shop';
      const qs = params.toString();
      const newUrl = qs ? `${basePath}?${qs}` : basePath;
      window.history.replaceState(null, '', newUrl);
    }, 120);
    return () => clearTimeout(timer);
  }, [filters, localSortBy, categorySlug, isClientLoaded]);

  const handleClearFilters = () => {
    const emptyFilters: ShopFilters = {
      categories: [],
      fabrics: [],
      colors: [],
      sizes: [],
      priceRange: [0, 25000],
      inStockOnly: false,
      vidhyasPicksOnly: false,
    };
    setFilters(emptyFilters);
    const basePath = categorySlug && categorySlug !== 'all' ? `/shop/${categorySlug}` : '/shop';
    window.history.replaceState(null, '', basePath);
  };

  const activeFilterCount = useMemo(() => {
    return Object.entries(filters).reduce((count, [key, value]) => {
      if (key === 'priceRange') {
        if (Array.isArray(value) && (value[0] > 0 || value[1] < 25000)) return count + 1;
        return count;
      }
      if (Array.isArray(value) && value.length > 0) return count + value.length;
      if (typeof value === 'boolean' && value === true) return count + 1;
      return count;
    }, 0);
  }, [filters]);

  // Convert products to ProductCard format
  const productsForGrid = sortedProducts.map((p) => ({
    ...p,
    image: p.images[0]?.url || p.image || '/images/collection-kurtis.jpg',
    originalPrice: p.compare_at_price,
    category: p.category?.name || '',
    isNew: new Date(p.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    isSale: (p.discount || 0) > 0,
    isVidhyasPick: p.is_vidyas_pick,
    rating: p.rating,
    reviewCount: p.review_count,
    discount: p.discount,
  }));

  return (
    <div className="min-h-screen bg-[var(--color-white)]">
      {/* Page Header with Hero Banner */}
      <section className="relative bg-gradient-to-r from-[#171412] via-[#2A231C] to-[#171412] text-white border-b border-[var(--color-whisper)] py-12 md:py-16 overflow-hidden">
        {/* Subtle background ambient image */}
        <div className="absolute inset-0 opacity-20 mix-blend-overlay">
          <img
            src={heroBg}
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/30" />

        <div className="container-custom px-6 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            <ScrollRevealAnim variant="fadeUp" className="max-w-2xl">
              <nav className="flex items-center gap-2 text-xs uppercase tracking-wider text-white/60 mb-4" aria-label="Breadcrumb">
                <Link href="/" className="hover:text-[var(--color-gold)] transition-colors">Home</Link>
                <span aria-hidden="true">/</span>
                <Link href="/shop" className="hover:text-[var(--color-gold)] transition-colors">Shop</Link>
                <span aria-hidden="true">/</span>
                <span className="text-[var(--color-gold)] font-medium capitalize">{pageTitle}</span>
              </nav>

              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-gold)]/20 border border-[var(--color-gold)]/40 text-[var(--color-gold)] text-xs uppercase tracking-widest font-semibold mb-3">
                <span>{pageBadge}</span>
              </div>

              <h1 className="text-[var(--font-display)] text-4xl md:text-5xl lg:text-6xl font-normal text-white mb-3 capitalize">
                {pageTitle}
              </h1>
              <p className="text-white/80 text-base md:text-lg max-w-xl font-light leading-relaxed">
                {pageDesc}
              </p>
            </ScrollRevealAnim>

            {/* Featured category banner card */}
            {(activeCategoryContent?.hero?.showFeaturedCard ?? true) && (
              <ScrollRevealAnim variant="fadeLeft" delay={0.2} className="hidden md:block w-72 flex-shrink-0">
                <div className="relative rounded-[var(--radius-lg)] overflow-hidden border border-[var(--color-gold)]/40 shadow-2xl bg-black/40 backdrop-blur-sm group">
                  <div className="aspect-[4/3] overflow-hidden">
                    <img
                      src={cardImg}
                      alt={pageTitle}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-3 bg-black/80 backdrop-blur-md flex items-center justify-between">
                    <span className="text-xs uppercase tracking-wider text-[var(--color-gold)] font-medium">{cardBadgeText}</span>
                    <span className="text-xs text-white/70">{cardSubtitleText}</span>
                  </div>
                </div>
              </ScrollRevealAnim>
            )}
          </div>
        </div>
      </section>

      {/* Promotional Announcement Banner */}
      {showPromo ? (
        <section className="bg-gradient-to-r from-[var(--color-ink)] via-[#2b241c] to-[var(--color-ink)] text-white border-b border-[var(--color-gold)]/40 py-3 px-6 shadow-md">
          <div className="container-custom flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {kurtisContent?.promoBadge && (
                <span className="px-2.5 py-0.5 rounded-full bg-[var(--color-gold)] text-[var(--color-ink)] text-xs font-bold uppercase tracking-wider">
                  {kurtisContent.promoBadge}
                </span>
              )}
              <p className="text-xs sm:text-sm text-white/95 font-medium">
                {kurtisContent?.promoText}
              </p>
            </div>
            {kurtisContent?.promoCtaText && (
              <Link
                href={kurtisContent.promoCtaLink || '/shop/kurtis'}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-gold)] hover:text-white uppercase tracking-wider transition-colors shrink-0"
              >
                <span>{kurtisContent.promoCtaText}</span>
                <span>→</span>
              </Link>
            )}
          </div>
        </section>
      ) : activeCategoryContent?.announcement?.enabled ? (
        <section className="bg-gradient-to-r from-[#1b1714] via-[#2A231C] to-[#1b1714] text-white py-3 px-4 border-b border-[var(--color-gold)]/30 shadow-inner">
          <div className="container-custom px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <span className="px-2.5 py-0.5 rounded-full bg-[var(--color-gold)] text-[var(--color-ink)] font-bold text-[10px] uppercase tracking-wider shadow-xs">
                {activeCategoryContent?.announcement?.badge || 'Offer'}
              </span>
              <span className="text-white/90 font-medium">
                {activeCategoryContent.announcement.headline}
              </span>
            </div>
            <div className="flex items-center gap-3">
              {activeCategoryContent.announcement.code && (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-black/60 border border-[var(--color-gold)]/40 shadow-xs">
                  <span className="text-white/60 text-[10px] uppercase tracking-wider font-semibold">CODE:</span>
                  <span className="font-mono font-bold text-[var(--color-gold)] text-xs tracking-wider">
                    {activeCategoryContent.announcement.code}
                  </span>
                </div>
              )}
              {activeCategoryContent.announcement.link && (
                <Link
                  href={activeCategoryContent.announcement.link}
                  className="text-[var(--color-gold)] hover:text-white transition-colors font-medium text-xs flex items-center gap-1"
                >
                  <span>{activeCategoryContent?.announcement?.linkText || 'Shop Offer →'}</span>
                  <span>→</span>
                </Link>
              )}
            </div>
          </div>
        </section>
      ) : null}

      {/* Visual Category Quick-Browse Strip */}
      {(showCategoryNav && (activeCategoryContent?.navigation?.enabled ?? true)) && (
        <section className="bg-[var(--color-snow)] border-b border-[var(--color-whisper)] py-4 overflow-x-auto no-scrollbar">
          <div className="container-custom px-6">
            <div className="flex items-center gap-3 sm:gap-4 min-w-max">
              <span className="text-xs uppercase tracking-wider text-[var(--color-slate)] font-semibold mr-2 hidden sm:inline">
                {activeCategoryContent?.navigation?.label || 'Collections:'}
              </span>
              {(activeCategoryContent?.navigation?.items && activeCategoryContent.navigation.items.length > 0 ? activeCategoryContent.navigation.items : CATEGORIES_NAVIGATION).map((cat) => {
                const isActive = (cat.slug === '' && (!categorySlug || categorySlug === 'all')) || categorySlug === cat.slug;
                return (
                  <Link
                    key={cat.name}
                    href={cat.href}
                    className={cn(
                      "flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border transition-all text-xs font-medium uppercase tracking-wider",
                      isActive
                        ? "bg-[var(--color-ink)] text-white border-[var(--color-gold)] shadow-md"
                        : "bg-white text-[var(--color-slate)] border-[var(--color-whisper)] hover:border-[var(--color-gold)] hover:text-[var(--color-ink)]"
                    )}
                  >
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-6 h-6 rounded-full object-cover border border-[var(--color-gold)]/40"
                    />
                    <span>{cat.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Main Content */}
      <section className="py-10">
        <div className="container-custom px-6">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Mobile Filter Button */}
            {showSidebar && (
              <MagneticButton variant="outline" className="lg:hidden w-full justify-between" strength={0.3} onClick={() => setSidebarOpen(true)}>
                <span className="flex items-center gap-2">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <line x1="4" y1="6" x2="20" y2="6" />
                    <line x1="4" y1="12" x2="20" y2="12" />
                    <line x1="4" y1="18" x2="20" y2="18" />
                  </svg>
                  Filters
                </span>
                {activeFilterCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-[var(--color-gold)] text-[var(--color-ink)] text-xs font-bold flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </MagneticButton>
            )}

            {/* Desktop Sidebar */}
            {showSidebar && (
              <ScrollRevealAnim variant="fadeUp" delay={0.2} className="lg:block hidden w-full lg:w-64 flex-shrink-0">
                <div className="bg-[var(--color-snow)]/70 rounded-[var(--radius-lg)] p-5 border border-[var(--color-whisper)] sticky top-28 shadow-sm">
                  <CategoryFilterFields
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    activeFilterCount={activeFilterCount}
                    onClearFilters={handleClearFilters}
                    categorySlug={categorySlug}
                    categoryName={category.name}
                    categoryCounts={categoryCounts}
                    fabricCounts={fabricCounts}
                    inStockCount={inStockCount}
                    vidhyasCount={vidhyasCount}
                    sidebarContent={activeCategoryContent?.sidebar}
                  />
                </div>
              </ScrollRevealAnim>
            )}

            {/* Mobile Sidebar Drawer */}
            <Drawer
              isOpen={sidebarOpen}
              onClose={() => setSidebarOpen(false)}
              title="Filters"
              description="Refine your collection"
              size="lg"
              position="right"
              className="max-w-sm flex flex-col"
            >
              <div className="flex-1 overflow-y-auto p-6 max-h-[calc(100vh-140px)]">
                <CategoryFilterFields
                  filters={filters}
                  onFilterChange={handleFilterChange}
                  activeFilterCount={activeFilterCount}
                  onClearFilters={handleClearFilters}
                  categorySlug={categorySlug}
                  categoryName={category.name}
                  categoryCounts={categoryCounts}
                  fabricCounts={fabricCounts}
                  inStockCount={inStockCount}
                  vidhyasCount={vidhyasCount}
                />
              </div>
              <div className="p-4 border-t border-[var(--color-whisper)] bg-white flex items-center gap-3">
                {activeFilterCount > 0 && (
                  <Button variant="outline" size="sm" onClick={handleClearFilters} className="flex-1">
                    Reset
                  </Button>
                )}
                <Button variant="primary" size="sm" className="flex-1" onClick={() => setSidebarOpen(false)}>
                  Show {sortedProducts.length} Pieces
                </Button>
              </div>
            </Drawer>

            {/* Product Grid & Active Filters Bar */}
            <ScrollRevealAnim variant="fadeUp" delay={0.1} className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                <p className="text-sm text-[var(--color-slate)]">
                  Showing <span className="font-semibold text-[var(--color-ink)]">{sortedProducts.length}</span> of {allProducts.length} products
                </p>
                <div className="flex items-center gap-3">
                  <Select value={localSortBy} onValueChange={handleSortChange} className="w-48">
                    <SelectTrigger placeholder="Sort by" />
                    <SelectContent>
                      {SHOP_SORT_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Active Filter Pills Strip */}
              {activeFilterCount > 0 && (
                <div className="flex flex-wrap items-center gap-2 mb-6 p-3 bg-[var(--color-snow)]/90 rounded-[var(--radius-md)] border border-[var(--color-whisper)]">
                  <span className="text-xs uppercase tracking-wider text-[var(--color-slate)] font-semibold mr-1">
                    Active Filters:
                  </span>
                  {/* Category Pills */}
                  {filters.categories?.map((catVal) => {
                    const label = SHOP_CATEGORIES.find((c) => c.value === catVal)?.label || catVal;
                    return (
                      <button
                        key={`pill-cat-${catVal}`}
                        onClick={() => handleRemoveFilter('categories', catVal)}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[var(--color-gold)] text-[var(--color-ink)] text-xs font-medium hover:bg-[var(--color-gold)]/10 transition-colors group shadow-sm"
                      >
                        <span>{label}</span>
                        <span className="text-[var(--color-gold)] group-hover:text-[var(--color-ink)] font-bold text-xs">✕</span>
                      </button>
                    );
                  })}
                  {/* Fabric Pills */}
                  {filters.fabrics?.map((fabVal) => {
                    const label = SHOP_FABRICS.find((f) => f.value === fabVal)?.label || fabVal;
                    return (
                      <button
                        key={`pill-fab-${fabVal}`}
                        onClick={() => handleRemoveFilter('fabrics', fabVal)}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[var(--color-gold)] text-[var(--color-ink)] text-xs font-medium hover:bg-[var(--color-gold)]/10 transition-colors group shadow-sm"
                      >
                        <span>{label}</span>
                        <span className="text-[var(--color-gold)] group-hover:text-[var(--color-ink)] font-bold text-xs">✕</span>
                      </button>
                    );
                  })}
                  {/* Color Pills */}
                  {filters.colors?.map((colVal) => {
                    const label = SHOP_COLORS.find((c) => c.value === colVal)?.label || colVal;
                    return (
                      <button
                        key={`pill-col-${colVal}`}
                        onClick={() => handleRemoveFilter('colors', colVal)}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[var(--color-gold)] text-[var(--color-ink)] text-xs font-medium hover:bg-[var(--color-gold)]/10 transition-colors group shadow-sm"
                      >
                        <span>Color: {label}</span>
                        <span className="text-[var(--color-gold)] group-hover:text-[var(--color-ink)] font-bold text-xs">✕</span>
                      </button>
                    );
                  })}
                  {/* Size Pills */}
                  {filters.sizes?.map((sizeVal) => (
                    <button
                      key={`pill-size-${sizeVal}`}
                      onClick={() => handleRemoveFilter('sizes', sizeVal)}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[var(--color-gold)] text-[var(--color-ink)] text-xs font-medium hover:bg-[var(--color-gold)]/10 transition-colors group shadow-sm"
                    >
                      <span>Size: {sizeVal}</span>
                      <span className="text-[var(--color-gold)] group-hover:text-[var(--color-ink)] font-bold text-xs">✕</span>
                    </button>
                  ))}
                  {/* In Stock Pill */}
                  {filters.inStockOnly && (
                    <button
                      onClick={() => handleFilterChange('inStockOnly', false)}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[var(--color-gold)] text-[var(--color-ink)] text-xs font-medium hover:bg-[var(--color-gold)]/10 transition-colors group shadow-sm"
                    >
                      <span>In Stock Only</span>
                      <span className="text-[var(--color-gold)] group-hover:text-[var(--color-ink)] font-bold text-xs">✕</span>
                    </button>
                  )}
                  {/* Vidhya's Picks Pill */}
                  {filters.vidhyasPicksOnly && (
                    <button
                      onClick={() => handleFilterChange('vidhyasPicksOnly', false)}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[var(--color-gold)] text-[var(--color-ink)] text-xs font-medium hover:bg-[var(--color-gold)]/10 transition-colors group shadow-sm"
                    >
                      <span>Vidhya's Picks</span>
                      <span className="text-[var(--color-gold)] group-hover:text-[var(--color-ink)] font-bold text-xs">✕</span>
                    </button>
                  )}
                  {/* Price Pill */}
                  {filters.priceRange && Array.isArray(filters.priceRange) && (filters.priceRange[0] > 0 || filters.priceRange[1] < 25000) && (
                    <button
                      onClick={() => handleFilterChange('priceRange', [0, 25000])}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[var(--color-gold)] text-[var(--color-ink)] text-xs font-medium hover:bg-[var(--color-gold)]/10 transition-colors group shadow-sm"
                    >
                      <span>₹{filters.priceRange[0].toLocaleString()} - ₹{filters.priceRange[1].toLocaleString()}</span>
                      <span className="text-[var(--color-gold)] group-hover:text-[var(--color-ink)] font-bold text-xs">✕</span>
                    </button>
                  )}
                  {/* Clear All Link */}
                  <button
                    onClick={handleClearFilters}
                    className="ml-auto text-xs font-semibold text-[var(--color-gold)] hover:text-[var(--color-ink)] hover:underline uppercase tracking-wider"
                  >
                    Clear All
                  </button>
                </div>
              )}

              {productsForGrid.length > 0 ? (
                <ProductGridView
                  products={productsForGrid}
                  viewMode={viewMode}
                  onViewModeChange={setViewMode}
                  filters={filters}
                  onFilterChange={handleFilterChange}
                  onAddToBag={handleAddToBag}
                />
              ) : (
                <ScrollRevealAnim variant="fadeUp" className="text-center py-20 px-6 border border-dashed border-[var(--color-gold)]/40 rounded-[var(--radius-lg)] bg-[var(--color-snow)]/40">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--color-gold)]/10 border border-[var(--color-gold)]/30 flex items-center justify-center text-[var(--color-gold)]">
                    <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                      <circle cx="11" cy="11" r="8" />
                      <path d="M21 21l-4.35-4.35" />
                    </svg>
                  </div>
                  <h3 className="text-[var(--font-display)] text-2xl text-[var(--color-ink)] mb-2">No pieces match your filters</h3>
                  <p className="text-[var(--color-slate)] max-w-md mx-auto mb-6 text-sm">
                    We could not find any items matching your selected criteria. Try removing some filters to discover our exquisite designs.
                  </p>
                  <Button variant="outline" size="sm" onClick={handleClearFilters} className="border-[var(--color-gold)] text-[var(--color-ink)] hover:bg-[var(--color-gold)]/10">
                    Reset All Filters
                  </Button>
                </ScrollRevealAnim>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-10">
                  <ScrollRevealAnim variant="fadeUp" delay={0.3}>
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      baseUrl={`/shop/${categorySlug}`}
                    />
                  </ScrollRevealAnim>
                </div>
              )}
            </ScrollRevealAnim>
          </div>
        </div>
      </section>

      {/* Vidhya's Styling Guide & Story (Kurtis Editorial Section) */}
      {showStyling && (
        <section className="bg-[var(--color-snow)]/80 border-t border-[var(--color-whisper)] py-14 md:py-20">
          <div className="container-custom px-6">
            <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              <div className="lg:col-span-5 relative aspect-[4/3] rounded-[var(--radius-xl)] overflow-hidden border border-[var(--color-whisper)] shadow-lg bg-black/10">
                <img
                  src={kurtisContent?.stylingImage || '/images/vidhya-story.jpg'}
                  alt={kurtisContent?.stylingTitle || "Vidhya's Styling Guide"}
                  className="w-full h-full object-cover"
                />
                <div className="absolute -bottom-6 -right-6 w-36 h-36 rounded-full bg-[var(--color-gold)]/10 blur-2xl" aria-hidden="true" />
              </div>
              <div className="lg:col-span-7 space-y-4">
                <span className="inline-block px-3 py-1 rounded-full bg-[var(--color-gold)]/15 text-[var(--color-gold)] text-xs font-semibold uppercase tracking-wider">
                  {stylingBadge}
                </span>
                <h2 className="text-[var(--font-display)] text-2xl md:text-3xl font-medium text-[var(--color-ink)]">
                  {kurtisContent?.stylingTitle || "Vidhya's Styling Guide for Kurtis"}
                </h2>
                <p className="text-[var(--color-slate)] text-sm md:text-base leading-relaxed">
                  {kurtisContent?.stylingNote || "Our kurtis are cut from pure breathable Chanderi, Mulmul and Tussar silk. For a contemporary festive look, pair straight-cut kurtis with cigarette pants, or flared anarkalis with statement jhumkas."}
                </p>
                {Array.isArray(kurtisContent?.highlights) && kurtisContent.highlights.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3">
                    {kurtisContent.highlights.map((h, i) => (
                      <div key={i} className="p-3.5 bg-white rounded-xl border border-[var(--color-whisper)] shadow-sm space-y-1">
                        <h4 className="text-xs font-bold text-[var(--color-ink)]">{h.title}</h4>
                        <p className="text-xs text-[var(--color-slate)] leading-snug">{h.description}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

// Reusable CategoryFilterFields component
function CategoryFilterFields({
  filters,
  onFilterChange,
  activeFilterCount,
  onClearFilters,
  categorySlug,
  categoryName,
  categoryCounts,
  fabricCounts,
  inStockCount,
  vidhyasCount,
  sidebarContent,
}: {
  filters: ShopFilters;
  onFilterChange: (key: string, value: any) => void;
  activeFilterCount: number;
  onClearFilters: () => void;
  categorySlug?: string;
  categoryName?: string;
  categoryCounts?: Record<string, number>;
  fabricCounts?: Record<string, number>;
  inStockCount?: number;
  vidhyasCount?: number;
  sidebarContent?: any;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-[var(--color-whisper)]">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-4 bg-[var(--color-gold)] rounded-full" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-ink)]">
            Filter Collection
          </h3>
        </div>
        {activeFilterCount > 0 && (
          <button
            onClick={onClearFilters}
            className="text-xs text-[var(--color-gold)] hover:text-[var(--color-ink)] transition-colors font-medium hover:underline"
          >
            Reset All
          </button>
        )}
      </div>

      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-slate)] mb-3 flex items-center justify-between">
          <span>{sidebarContent?.categoryTitle || 'Category'}</span>
          {filters.categories && filters.categories.length > 0 && (
            <span className="text-[10px] font-bold text-[var(--color-gold)]">
              {filters.categories.length} selected
            </span>
          )}
        </h4>
        {(!categorySlug || categorySlug === 'all') ? (
          <div className="space-y-2.5">
            {SHOP_CATEGORIES.map((cat) => {
              const isChecked = Boolean(filters.categories?.includes(cat.value));
              const count = categoryCounts?.[cat.value] ?? 0;
              return (
                <div key={cat.value} className="flex items-center justify-between group">
                  <Checkbox
                    checked={isChecked}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      const current = filters.categories || [];
                      const updated = checked
                        ? Array.from(new Set([...current, cat.value]))
                        : current.filter((c: string) => c !== cat.value);
                      onFilterChange('categories', updated);
                    }}
                    label={cat.label}
                  />
                  <span className="text-xs text-[var(--color-slate)]/70 tabular-nums">
                    ({count})
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-2">
            <div className="p-2.5 rounded-[var(--radius-md)] bg-[var(--color-gold)]/10 border border-[var(--color-gold)]/40 flex items-center justify-between">
              <span className="text-xs font-semibold text-[var(--color-ink)] capitalize">
                {categoryName || categorySlug}
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--color-gold)] bg-black px-2 py-0.5 rounded-full">
                Active Collection
              </span>
            </div>
            <Link
              href="/shop"
              className="inline-flex items-center gap-1 text-xs text-[var(--color-gold)] hover:underline font-medium pt-1"
            >
              <span>{sidebarContent?.viewAllText || '← View All Collections'}</span>
            </Link>
          </div>
        )}
      </div>

      <div className="border-t border-[var(--color-whisper)] pt-4">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-slate)] mb-3 flex items-center justify-between">
          <span>Fabric</span>
          {filters.fabrics && filters.fabrics.length > 0 && (
            <span className="text-[10px] font-bold text-[var(--color-gold)]">
              {filters.fabrics.length} selected
            </span>
          )}
        </h4>
        <div className="space-y-2.5">
          {SHOP_FABRICS.map((fabric) => {
            const isChecked = Boolean(filters.fabrics?.includes(fabric.value));
            const count = fabricCounts?.[fabric.value] ?? 0;
            return (
              <div key={fabric.value} className="flex items-center justify-between group">
                <Checkbox
                  checked={isChecked}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    const current = filters.fabrics || [];
                    const updated = checked
                      ? Array.from(new Set([...current, fabric.value]))
                      : current.filter((f: string) => f !== fabric.value);
                    onFilterChange('fabrics', updated);
                  }}
                  label={fabric.label}
                />
                <span className="text-xs text-[var(--color-slate)]/70 tabular-nums">
                  ({count})
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="border-t border-[var(--color-whisper)] pt-4">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-slate)] mb-3 flex items-center justify-between">
          <span>Color</span>
          {filters.colors && filters.colors.length > 0 && (
            <span className="text-[10px] font-bold text-[var(--color-gold)]">
              {filters.colors.length} selected
            </span>
          )}
        </h4>
        <div className="flex flex-wrap gap-2.5">
          {SHOP_COLORS.map((color) => {
            const isSelected = Boolean(filters.colors?.includes(color.value));
            return (
              <button
                key={color.value}
                type="button"
                onClick={() => {
                  const current = filters.colors || [];
                  const updated = isSelected
                    ? current.filter((c: string) => c !== color.value)
                    : Array.from(new Set([...current, color.value]));
                  onFilterChange('colors', updated);
                }}
                className={cn(
                  'relative w-7 h-7 rounded-full border transition-all duration-200 flex items-center justify-center cursor-pointer',
                  isSelected
                    ? 'ring-2 ring-[var(--color-gold)] ring-offset-2 scale-110 shadow-md border-transparent'
                    : 'border-[var(--color-whisper)] hover:border-[var(--color-gold)] hover:scale-105'
                )}
                style={color.color.includes('gradient') ? { background: color.color } : { backgroundColor: color.color }}
                title={color.label}
                aria-label={color.label}
              >
                {isSelected && (
                  <span
                    className={cn(
                      'text-[10px] font-bold leading-none',
                      color.value === 'white' || color.value === 'yellow' || color.value === 'gold' ? 'text-black' : 'text-white'
                    )}
                  >
                    ✓
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="border-t border-[var(--color-whisper)] pt-4">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-slate)] mb-3 flex items-center justify-between">
          <span>Size</span>
          {filters.sizes && filters.sizes.length > 0 && (
            <span className="text-[10px] font-bold text-[var(--color-gold)]">
              {filters.sizes.length} selected
            </span>
          )}
        </h4>
        <div className="flex flex-wrap gap-1.5">
          {SHOP_SIZES.map((size) => {
            const isSelected = Boolean(filters.sizes?.includes(size));
            return (
              <button
                key={size}
                type="button"
                onClick={() => {
                  const current = filters.sizes || [];
                  const updated = isSelected
                    ? current.filter((s: string) => s !== size)
                    : Array.from(new Set([...current, size]));
                  onFilterChange('sizes', updated);
                }}
                className={cn(
                  'h-8 px-2.5 flex items-center justify-center rounded-[var(--radius-sm)] text-xs font-medium transition-all duration-200 cursor-pointer',
                  isSelected
                    ? 'bg-[var(--color-ink)] text-[var(--color-gold)] border border-[var(--color-gold)] font-bold shadow-sm'
                    : 'bg-[var(--color-white)] text-[var(--color-slate)] border border-[var(--color-whisper)] hover:border-[var(--color-gold)] hover:text-[var(--color-gold)]'
                )}
              >
                {size}
              </button>
            );
          })}
        </div>
      </div>

      <div className="border-t border-[var(--color-whisper)] pt-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-slate)]">
            Price Range
          </h4>
          <span className="text-xs font-semibold text-[var(--color-gold)]">
            ₹{((Array.isArray(filters.priceRange) ? filters.priceRange[0] : 0) ?? 0).toLocaleString()} - ₹{((Array.isArray(filters.priceRange) ? filters.priceRange[1] : 25000) ?? 25000).toLocaleString()}
          </span>
        </div>
        <Slider
          min={0}
          max={25000}
          step={500}
          range={true}
          value={Array.isArray(filters.priceRange) ? filters.priceRange : [0, 25000]}
          onChange={(value) => onFilterChange('priceRange', Array.isArray(value) ? value : [0, Number(value) || 25000])}
          className="w-full"
        />
      </div>

      <div className="border-t border-[var(--color-whisper)] pt-4 space-y-2.5">
        <div className="flex items-center justify-between">
          <Checkbox
            checked={Boolean(filters.inStockOnly)}
            onChange={(e) => onFilterChange('inStockOnly', e.target.checked)}
            label={sidebarContent?.inStockLabel || 'In Stock Only'}
          />
          {typeof inStockCount === 'number' && (
            <span className="text-xs text-[var(--color-slate)]/70 tabular-nums">
              ({inStockCount})
            </span>
          )}
        </div>
        <div className="flex items-center justify-between">
          <Checkbox
            checked={Boolean(filters.vidhyasPicksOnly)}
            onChange={(e) => onFilterChange('vidhyasPicksOnly', e.target.checked)}
            label={sidebarContent?.vidhyasPicksLabel || "Vidhya's Picks Only"}
          />
          {typeof vidhyasCount === 'number' && (
            <span className="text-xs text-[var(--color-slate)]/70 tabular-nums">
              ({vidhyasCount})
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ProductGridView component
function ProductGridView({ products, viewMode, onViewModeChange, filters, onFilterChange, onAddToBag }: {
  products: any[];
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  filters: any;
  onFilterChange: (key: string, value: any) => void;
  onAddToBag: (product: any) => void;
}) {
  const { toggleItem, isInWishlist } = useWishlist();

  const handleToggleWishlist = async (product: any) => {
    try {
      await toggleItem(product.id, undefined, {
        id: product.id,
        slug: product.slug,
        name: product.name,
        price: product.price,
        originalPrice: product.originalPrice || product.compare_at_price,
        discount: product.discount,
        image: product.image || product.images?.[0]?.url || product.images?.[0] || '/images/collection-kurtis.jpg',
        category: product.category?.name || product.category || 'Ethnic Wear',
        isVidhyasPick: product.isVidhyasPick || product.is_vidyas_pick,
      });
    } catch (err) {
      console.error('Failed to toggle wishlist:', err);
    }
  };
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <span className="text-sm text-[var(--color-slate)]">View:</span>
          <div className="flex bg-[var(--color-snow)] rounded-[var(--radius-md)] p-1">
            <MagneticButton
              variant="ghost"
              size="sm"
              strength={0.3}
              onClick={() => onViewModeChange('grid')}
              className={cn(
                'p-2 rounded-[var(--radius-sm)] transition-colors',
                viewMode === 'grid' ? 'bg-white text-[var(--color-ink)] shadow-[var(--shadow-sm)]' : 'text-[var(--color-mist)] hover:text-[var(--color-ink)]'
              )}
              aria-label="Grid view"
              aria-pressed={viewMode === 'grid'}
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
              </svg>
            </MagneticButton>
            <MagneticButton
              variant="ghost"
              size="sm"
              strength={0.3}
              onClick={() => onViewModeChange('list')}
              className={cn(
                'p-2 rounded-[var(--radius-sm)] transition-colors',
                viewMode === 'list' ? 'bg-white text-[var(--color-ink)] shadow-[var(--shadow-sm)]' : 'text-[var(--color-mist)] hover:text-[var(--color-ink)]'
              )}
              aria-label="List view"
              aria-pressed={viewMode === 'list'}
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </MagneticButton>
          </div>
        </div>
      </div>

      <AnimatePresence mode="popLayout">
        {viewMode === 'grid' ? (
          <StaggerGrid
            key="grid"
            items={products}
            renderItem={(product, index) => (
              <StaggerItem variant="scale" style={{ transitionDelay: `${index * 0.05}s` }}>
                <div className="group">
                  <ProductCard
                    {...product}
                    image={product.image || product.images?.[0]?.url || '/images/collection-kurtis.jpg'}
                    name={product.name}
                    price={product.price}
                    originalPrice={product.originalPrice || product.compare_at_price}
                    category={product.category?.name || product.category || 'Ethnic Wear'}
                    isNew={product.isNew || product.is_featured}
                    isSale={product.isSale || (product.discount && product.discount > 0)}
                    isVidhyasPick={product.isVidhyasPick || product.is_vidyas_pick}
                    discount={product.discount}
                    rating={product.rating || 4.8}
                    reviewCount={product.reviewCount || 12}
                    href={product.slug ? `/product/${product.slug}` : '/shop'}
                    onAddToBag={() => onAddToBag(product)}
                    onAddToWishlist={() => handleToggleWishlist(product)}
                    isWishlisted={isInWishlist(product.slug || product.id)}
                  />
                </div>
              </StaggerItem>
            )}
            columns={4}
            gap={6}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center"
          />
        ) : (
          <StaggerContainer key="list" variant="default" className="space-y-4">
            {products.map((product, index) => (
              <StaggerItem key={product.id} variant="slide" style={{ transitionDelay: `${index * 0.05}s` }}>
                <Card variant="product" padding="none" className="flex flex-col sm:flex-row group">
                  <div className="relative w-full sm:w-48 sm:flex-shrink-0 aspect-[3/4] sm:aspect-auto overflow-hidden bg-[var(--color-whisper)]">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    {product.isNew && (
                      <span className="absolute top-3 left-3 px-2 py-0.5 text-xs font-semibold uppercase tracking-wider bg-[var(--color-gold)] text-[var(--color-ink)] rounded-[var(--radius-sm)]">
                        New
                      </span>
                    )}
                    {product.isSale && product.discount && (
                      <span className="absolute top-3 right-3 px-2 py-0.5 text-xs font-semibold uppercase tracking-wider bg-[var(--color-error)] text-white rounded-[var(--radius-sm)]">
                        -{product.discount}%
                      </span>
                    )}
                  </div>
                  <div className="p-4 sm:p-6 flex flex-col justify-between sm:flex-1">
                    <div>
                      <span className="text-xs font-medium uppercase tracking-wider text-[var(--color-gold)]">{product.category}</span>
                      <h3 className="text-[var(--font-display)] text-lg font-medium text-[var(--color-ink)] mt-1 mb-2">{product.name}</h3>
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-bold text-[var(--color-ink)] tabular-nums">₹{product.price.toLocaleString()}</span>
                        {product.originalPrice && (
                          <span className="text-base text-[var(--color-mist)] line-through tabular-nums">₹{product.originalPrice.toLocaleString()}</span>
                        )}
                      </div>
                    </div>
                    <MagneticButton
                      variant="primary"
                      className="w-full sm:w-auto mt-4 sm:mt-0"
                      strength={0.3}
                      onClick={() => onAddToBag(product)}
                    >
                      Add to Bag
                    </MagneticButton>
                  </div>
                </Card>
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}
      </AnimatePresence>

      {products.length === 0 && (
        <ScrollRevealAnim variant="fadeUp" className="text-center py-20">
          <svg className="h-16 w-16 mx-auto text-[var(--color-mist)] mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <h3 className="text-[var(--font-display)] text-2xl text-[var(--color-ink)] mb-2">No products found</h3>
          <p className="text-[var(--color-slate)] mb-6">Try adjusting your filters or search for something else.</p>
          <MagneticButton variant="outline" strength={0.3} onClick={() => Object.keys(filters).forEach(key => onFilterChange(key, []))}>
            Clear All Filters
          </MagneticButton>
        </ScrollRevealAnim>
      )}
    </div>
  );
}