'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { cn } from '@/lib/utils/cn';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { StaggerContainer, StaggerItem, StaggerGrid } from '@/components/animations/Stagger';
import { MagneticButton } from '@/components/animations/MagneticButton';

const categoriesArr = ['Sarees', 'Lehengas', 'Kurtis', 'Salwars', 'Dupattas', 'Gowns', 'Co-ords', 'Accessories'] as const;
const fabricTypes = ['Banarasi', 'Chanderi', 'Handloom', 'Silk', 'Cotton', 'Chiffon', 'Organza', 'Velvet'] as const;
const productTypes = ['Saree', 'Lehenga Set', 'Kurti', 'Salwar Suit', 'Dupatta', 'Gown', 'Anarkali', 'Co-ord Set'] as const;
const colors = ['Crimson', 'Emerald', 'Navy', 'Gold', 'Ivory', 'Sage', 'Lavender', 'Coral', 'Charcoal', 'Rose', 'Teal', 'Amber'] as const;
const colorHexes = ['#DC143C', '#1B7A3D', '#1E3A8A', '#C9A84C', '#FFFFF0', '#8A9A5B', '#967BB6', '#FF6F61', '#36454F', '#FF66CC', '#008080', '#FFBF00'] as const;
const discountValues = [20, 25, 30, 35, 40, 45, 50, 55, 60, 65] as const;
const lowStockIndices = [3, 7, 12] as const;

const realSaleSlugs = [
  'hand-block-printed-kurti',
  'velvet-kurti-set',
  'chanderi-cotton-kurti',
  'gota-patti-kurta',
  'chiffon-anarkali-set',
  'silk-palazzo-set',
  'sharara-set-navy',
  'mirror-work-lehenga',
  'mulberry-silk-saree',
  'banarasi-tissue-saree',
  'organza-saree-set',
  'embroidered-dupatta',
];

interface SaleProduct {
  id: string;
  slug?: string;
  name: string;
  price: number;
  originalPrice: number;
  image: string;
  color: string;
  colorHex: string;
  category: string;
  discount: number;
  isFinalSale: boolean;
  inStock: boolean;
  lowStock: boolean;
}

const mockSaleProducts: SaleProduct[] = Array.from({ length: 20 }, (_, i) => {
  const category = categoriesArr[i % categoriesArr.length] as string;
  const originalPrice = 3000 + (i * 800) % 20000;
  const discount = discountValues[i % 10] as number;
  const price = Math.round(originalPrice * (1 - discount / 100));

  return {
    id: `sale-${i + 1}`,
    slug: realSaleSlugs[i % realSaleSlugs.length],
    name: `${category} ${fabricTypes[i % 8] as string} ${productTypes[i % 8] as string}`,
    price,
    originalPrice,
    image: `/images/sale-${(i % 12) + 1}.jpg`,
    color: colors[i % 12] as string,
    colorHex: colorHexes[i % 12] as string,
    category,
    discount,
    isFinalSale: discount >= 50,
    inStock: i !== 15 && i !== 18,
    lowStock: lowStockIndices.includes(i as 3 | 7 | 12),
  };
});

const saleCategories = ['All', 'Up to 30% Off', '30-50% Off', '50%+ Off', 'Final Sale'];
const sortOptions = [
  { value: 'discount-high', label: 'Highest Discount' },
  { value: 'discount-low', label: 'Lowest Discount' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest Markdowns' },
];

const saleEvents = [
  {
    title: 'End of Season Sale',
    description: 'Up to 60% off selected styles. While stocks last.',
    endDate: '2026-02-15',
    badge: 'ENDS SOON',
  },
  {
    title: 'Final Clearance',
    description: 'Last chance on discontinued designs. 50-70% off.',
    endDate: '2026-01-31',
    badge: 'FINAL DAYS',
  },
  {
    title: 'Festival Archive',
    description: 'Previous season festive wear at archive prices.',
    endDate: '2026-03-01',
    badge: 'ARCHIVE',
  },
];

function SaleCountdown({ endDate }: { endDate: string }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const end = new Date(endDate).getTime();
      const now = new Date().getTime();
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / 1000 / 60) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [endDate]);

  if (timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0) {
    return <Badge variant="error" className="text-xs">Ended</Badge>;
  }

  return (
    <div className="flex items-center gap-1">
      {timeLeft.days > 0 && (
        <>
          <span className="font-mono font-bold text-[var(--color-ink)]">{timeLeft.days}d</span>
          <span className="text-[var(--color-mist)]">:</span>
        </>
      )}
      <span className="font-mono font-bold text-[var(--color-ink)]">{timeLeft.hours.toString().padStart(2, '0')}</span>
      <span className="text-[var(--color-mist)]">:</span>
      <span className="font-mono font-bold text-[var(--color-ink)]">{timeLeft.minutes.toString().padStart(2, '0')}</span>
      <span className="text-[var(--color-mist)]">:</span>
      <span className="font-mono font-bold text-[var(--color-ink)]">{timeLeft.seconds.toString().padStart(2, '0')}</span>
    </div>
  );
}

function ProductCardGrid({ product }: { product: SaleProduct }) {
  return (
    <article className="group relative bg-[var(--color-white)] border border-[var(--color-whisper)] rounded-[var(--radius-xl)] overflow-hidden hover:shadow-[var(--shadow-lg)] transition-all duration-300">
      <div className="relative aspect-[3/4] overflow-hidden">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          <Badge variant="error" className="text-xs font-bold">-{product.discount}%</Badge>
          {product.isFinalSale && <Badge variant="warning" className="text-xs">Final Sale</Badge>}
          {product.lowStock && (
            <Badge variant="outline" className="bg-[var(--color-warning-bg)] text-[var(--color-warning)] border-[var(--color-warning)] text-xs">
              Only 2 Left
            </Badge>
          )}
        </div>
        {!product.inStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-sm font-semibold text-white bg-[var(--color-error)] px-3 py-1 rounded-[var(--radius-sm)]">Sold Out</span>
          </div>
        )}
        <div className="absolute bottom-3 left-3 right-3 flex justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Button variant="ghost" size="sm" className="bg-white rounded-full px-3 shadow-sm" asChild>
            <Link href={`/product/${product.slug || product.id}`} className="flex items-center gap-1">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
              <span className="hidden sm:inline">View</span>
            </Link>
          </Button>
          <Button variant="ghost" size="sm" className="bg-white rounded-full px-3 shadow-sm" asChild>
            <Link href="/wishlist" className="flex items-center gap-1">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              <span className="hidden sm:inline">Save</span>
            </Link>
          </Button>
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs text-[var(--color-gold)] font-medium uppercase tracking-wide">{product.category}</span>
        </div>
        <Link href={`/product/${product.slug || product.id}`} className="hover:underline">
          <h3 className="text-[var(--font-display)] text-sm md:text-base font-medium text-[var(--color-ink)] line-clamp-2 mb-1">{product.name}</h3>
        </Link>
        <div className="flex items-center gap-2 text-sm text-[var(--color-slate)] mb-2">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: product.colorHex }} aria-hidden="true" />{product.color}
          </span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="font-bold text-[var(--color-ink)]">{product.price.toLocaleString()}</span>
          {product.originalPrice > product.price && <span className="text-sm text-[var(--color-mist)] line-through">{product.originalPrice.toLocaleString()}</span>}
          <span className="text-sm font-semibold text-[var(--color-success)] ml-auto">Save ₹{(product.originalPrice - product.price).toLocaleString()}</span>
        </div>
      </div>
    </article>
  );
}

function ProductCardList({ product }: { product: any }) {
  return (
    <article className="group relative bg-[var(--color-white)] border border-[var(--color-whisper)] rounded-[var(--radius-xl)] overflow-hidden hover:shadow-[var(--shadow-lg)] transition-all duration-300 flex gap-0 p-0">
      <div className="relative aspect-[3/4] overflow-hidden w-56 flex-shrink-0 aspect-auto h-auto min-h-[280px]">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover"
          sizes="224px"
        />
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          <Badge variant="error" className="text-xs font-bold">-{product.discount}%</Badge>
          {product.isFinalSale && <Badge variant="warning" className="text-xs">Final Sale</Badge>}
          {product.lowStock && (
            <Badge variant="outline" className="bg-[var(--color-warning-bg)] text-[var(--color-warning)] border-[var(--color-warning)] text-xs">
              Only 2 Left
            </Badge>
          )}
        </div>
        {!product.inStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-sm font-semibold text-white bg-[var(--color-error)] px-3 py-1 rounded-[var(--radius-sm)]">Sold Out</span>
          </div>
        )}
        <div className="absolute bottom-3 left-3 right-3 flex justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Button variant="ghost" size="sm" className="bg-white rounded-full px-3 shadow-sm" asChild>
            <Link href={`/product/${product.slug || product.id}`} className="flex items-center gap-1">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
              <span className="hidden sm:inline">View</span>
            </Link>
          </Button>
          <Button variant="ghost" size="sm" className="bg-white rounded-full px-3 shadow-sm" asChild>
            <Link href="/wishlist" className="flex items-center gap-1">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              <span className="hidden sm:inline">Save</span>
            </Link>
          </Button>
        </div>
      </div>
      <div className="flex-1 flex flex-col justify-center py-6 px-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs text-[var(--color-gold)] font-medium uppercase tracking-wide">{product.category}</span>
        </div>
        <Link href={`/product/${product.slug || product.id}`} className="hover:underline">
          <h3 className="text-[var(--font-display)] text-sm md:text-base font-medium text-[var(--color-ink)] line-clamp-2 mb-1">{product.name}</h3>
        </Link>
        <div className="flex items-center gap-2 text-sm text-[var(--color-slate)] mb-2">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: product.colorHex }} aria-hidden="true" />{product.color}
          </span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="font-bold text-[var(--color-ink)]">{product.price.toLocaleString()}</span>
          {product.originalPrice > product.price && <span className="text-sm text-[var(--color-mist)] line-through">{product.originalPrice.toLocaleString()}</span>}
          <span className="text-sm font-semibold text-[var(--color-success)] ml-auto">Save ₹{(product.originalPrice - product.price).toLocaleString()}</span>
        </div>
        <div className="mt-4 flex items-center gap-2">
          <Button variant="gold" size="sm" className="flex-1" asChild disabled={!product.inStock}>
            <Link href={`/product/${product.id}`}>{product.inStock ? 'Add to Bag' : 'Sold Out'}</Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/product/${product.id}`}>Details</Link>
          </Button>
        </div>
      </div>
    </article>
  );
}

export default function SalePage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [sortBy, setSortBy] = useState('discount-high');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [page, setPage] = useState(1);
  const itemsPerPage = 12;

  let filteredProducts = mockSaleProducts.filter(p => p.inStock);

  if (activeCategory === 'Up to 30% Off') {
    filteredProducts = filteredProducts.filter(p => p.discount <= 30);
  } else if (activeCategory === '30-50% Off') {
    filteredProducts = filteredProducts.filter(p => p.discount > 30 && p.discount < 50);
  } else if (activeCategory === '50%+ Off') {
    filteredProducts = filteredProducts.filter(p => p.discount >= 50);
  } else if (activeCategory === 'Final Sale') {
    filteredProducts = filteredProducts.filter(p => p.isFinalSale);
  }

  filteredProducts.sort((a, b) => {
    switch (sortBy) {
      case 'discount-low': return a.discount - b.discount;
      case 'price-low': return a.price - b.price;
      case 'price-high': return b.price - a.price;
      case 'newest': return 0;
      default: return b.discount - a.discount;
    }
  });

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const savingsTotal = filteredProducts.reduce((sum, p) => sum + (p.originalPrice - p.price), 0);

  return (
    <div className="min-h-screen bg-[var(--color-white)]">
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 bg-gradient-to-b from-[var(--color-gold)]/5 via-[var(--color-white)] to-[var(--color-white)] border-b border-[var(--color-whisper)]">
        <div className="container-custom px-6">
          <ScrollReveal variant="fadeUp" className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div className="max-w-2xl">
              <span className="inline-block px-4 py-1 bg-[var(--color-error)] text-[var(--color-white)] text-sm font-semibold rounded-[var(--radius-full)] mb-4 animate-pulse">
                SALE ON NOW
              </span>
              <h1 className="text-[var(--font-display)] text-4xl md:text-6xl font-medium text-[var(--color-ink)] leading-tight mb-4">
                Seasonal <span className="text-[var(--color-gold)]">Sale</span>
              </h1>
              <p className="text-[var(--color-slate)] text-lg mb-6">
                Up to <span className="font-bold text-[var(--color-error)]">65% off</span> on handcrafted ethnic wear.
                {filteredProducts.length} pieces. Once they\'re gone, they\'re gone.
              </p>
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center gap-2 bg-[var(--color-gold-light)] px-4 py-2 rounded-[var(--radius-full)]">
                  <svg className="h-5 w-5 text-[var(--color-gold)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  <span className="font-medium text-[var(--color-gold)]">Total Savings: ₹{savingsTotal.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2 text-[var(--color-slate)]">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 6v6l4 2" />
                  </svg>
                  <span>Free shipping on orders ₹2,999+</span>
                </div>
              </div>
            </div>

            {/* Sale Events */}
            <div className="flex flex-col gap-3 w-full lg:w-80">
              {saleEvents.map((event, index) => (
                <ScrollReveal key={event.title} variant="slideUp" delay={0.2 + index * 0.1} className="p-5 bg-[var(--color-white)] border border-[var(--color-whisper)] rounded-[var(--radius-xl)] hover:shadow-[var(--shadow-lg)] transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant={event.badge === 'ENDS SOON' ? 'error' : event.badge === 'FINAL DAYS' ? 'warning' : 'outline'} className="text-xs">
                      {event.badge}
                    </Badge>
                    <SaleCountdown endDate={event.endDate} />
                  </div>
                  <h3 className="text-[var(--font-display)] text-base font-medium text-[var(--color-ink)] mb-1">{event.title}</h3>
                  <p className="text-xs text-[var(--color-slate)] mb-3">{event.description}</p>
                  <MagneticButton variant="outline" size="sm" className="w-full" strength={0.3} asChild>
                    <Link href={`/sale?event=${event.title.toLowerCase().replace(/\s+/g, '-')}`}>Shop This Event</Link>
                  </MagneticButton>
                </ScrollReveal>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Filters Bar */}
      <section className="py-6 bg-[var(--color-white)] border-b border-[var(--color-whisper)] sticky top-[72px] z-10">
        <div className="container-custom px-6">
          <motion.div
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <ScrollReveal variant="fadeUp" delay={0.1}>
              <div className="flex flex-wrap gap-2">
                {saleCategories.map((cat) => (
                  <MagneticButton
                    key={cat}
                    variant={activeCategory === cat ? 'primary' : 'ghost'}
                    size="sm"
                    strength={0.2}
                    onClick={() => { setActiveCategory(cat); setPage(1); }}
                    className="rounded-[var(--radius-full)] whitespace-nowrap"
                  >
                    {cat}
                    {cat !== 'All' && (
                      <span className="ml-1.5 px-1.5 py-0.5 text-xs bg-[var(--color-gold)]/20 text-[var(--color-gold)] rounded-full">
                        {mockSaleProducts.filter(p => {
                          if (cat === 'Up to 30% Off') return p.discount <= 30;
                          if (cat === '30-50% Off') return p.discount > 30 && p.discount < 50;
                          if (cat === '50%+ Off') return p.discount >= 50;
                          if (cat === 'Final Sale') return p.isFinalSale;
                          return false;
                        }).length}
                      </span>
                    )}
                  </MagneticButton>
                ))}
              </div>
            </ScrollReveal>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2">
                <label htmlFor="sale-sort" className="text-sm text-[var(--color-slate)]">Sort:</label>
                <Select value={sortBy} onValueChange={(v) => { setSortBy(v); setPage(1); }}>
                  <SelectTrigger id="sale-sort" className="w-[180px]">
                    <SelectValue placeholder="Sort" />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-1 bg-[var(--color-white)] border border-[var(--color-whisper)] rounded-[var(--radius-lg)] p-1">
                <MagneticButton
                  variant={viewMode === 'grid' ? 'primary' : 'ghost'}
                  size="sm"
                  strength={0.2}
                  className="rounded-[var(--radius-md)]"
                  onClick={() => setViewMode('grid')}
                  aria-label="Grid view"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <rect x="3" y="3" width="7" height="7" rx="1" />
                    <rect x="14" y="3" width="7" height="7" rx="1" />
                    <rect x="3" y="14" width="7" height="7" rx="1" />
                    <rect x="14" y="14" width="7" height="7" rx="1" />
                  </svg>
                </MagneticButton>
                <MagneticButton
                  variant={viewMode === 'list' ? 'primary' : 'ghost'}
                  size="sm"
                  strength={0.2}
                  className="rounded-[var(--radius-md)]"
                  onClick={() => setViewMode('list')}
                  aria-label="List view"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <line x1="3" y1="12" x2="21" y2="12" />
                    <line x1="3" y1="18" x2="21" y2="18" />
                    <line x1="3" y1="6" x2="3" y2="18" />
                    <line x1="21" y1="6" x2="21" y2="18" />
                  </svg>
                </MagneticButton>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Results Count */}
      <section className="py-4 bg-[var(--color-white)] border-b border-[var(--color-whisper)]">
        <div className="container-custom px-6">
          <ScrollReveal variant="fadeUp" delay={0.2}>
            <p className="text-sm text-[var(--color-slate)]">
              {filteredProducts.length} item{filteredProducts.length !== 1 ? 's' : ''} on sale
              {activeCategory !== 'All' && <span className="text-[var(--color-gold)]"> — {activeCategory}</span>}
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Product Grid */}
      <section className="py-10 bg-[var(--color-white)]">
        <div className="container-custom px-6">
          <ScrollReveal variant="fadeUp" delay={0.3}>
            {viewMode === 'grid' ? (
              <StaggerGrid
                items={paginatedProducts}
                renderItem={(product, index) => (
                  <StaggerItem key={product.id} variant="scale" style={{ transitionDelay: `${index * 0.03}s` }}>
                    <ProductCardGrid product={product} />
                  </StaggerItem>
                )}
                columns={4}
                gap={24}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              />
            ) : (
              <StaggerContainer variant="default" className="space-y-4">
                {paginatedProducts.map((product, index) => (
                  <StaggerItem key={product.id} variant="slide" style={{ transitionDelay: `${index * 0.03}s` }}>
                    <ProductCardList product={product} />
                  </StaggerItem>
                ))}
              </StaggerContainer>
            )}
          </ScrollReveal>

            {paginatedProducts.length === 0 && (
              <ScrollReveal variant="fadeUp" className="text-center py-16">
                <svg className="h-16 w-16 mx-auto text-[var(--color-mist)] mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                  <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <h3 className="text-[var(--font-display)] text-xl text-[var(--color-ink)] mb-2">Nothing Here Yet</h3>
                <p className="text-[var(--color-slate)] mb-4">No products match your current filters.</p>
                <MagneticButton variant="outline" strength={0.3} onClick={() => { setActiveCategory('All'); setSortBy('discount-high'); }}>
                  Show All Sale Items
                </MagneticButton>
              </ScrollReveal>
            )}
          </div>
        </section>

        {/* Pagination */}
        {totalPages > 1 && (
          <section className="py-10 bg-[var(--color-white)] border-t border-[var(--color-whisper)]">
            <div className="container-custom px-6">
              <ScrollReveal variant="fadeUp" delay={0.4}>
                <nav className="flex items-center justify-center gap-2" aria-label="Pagination">
                  <MagneticButton
                    variant="outline"
                    size="sm"
                    strength={0.3}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    aria-label="Previous page"
                  >
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <path d="M15 18l-6-6 6-6" />
                    </svg>
                  </MagneticButton>
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) pageNum = i + 1;
                    else if (page <= 3) pageNum = i + 1;
                    else if (page >= totalPages - 2) pageNum = totalPages - 4 + i;
                    else pageNum = page - 2 + i;

                    return (
                      <MagneticButton
                        key={pageNum}
                        variant={page === pageNum ? 'primary' : 'ghost'}
                        size="sm"
                        strength={0.3}
                        className="w-10 h-10"
                        onClick={() => setPage(pageNum)}
                        aria-label={`Page ${pageNum}`}
                        aria-current={page === pageNum ? 'page' : undefined}
                      >
                        {pageNum}
                      </MagneticButton>
                    );
                  })}
                  <MagneticButton
                    variant="outline"
                    size="sm"
                    strength={0.3}
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    aria-label="Next page"
                  >
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </MagneticButton>
                </nav>
              </ScrollReveal>
            </div>
          </section>
        )}

        {/* Sale Policy */}
        <section className="py-16 bg-[var(--color-snow)] border-t border-[var(--color-whisper)]">
          <div className="container-custom px-6">
            <ScrollReveal variant="fadeUp">
              <StaggerGrid
                items={[
                  {
                    icon: (
                      <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="16" y1="13" x2="8" y2="13" />
                        <line x1="16" y1="17" x2="8" y2="17" />
                        <polyline points="10 9 9 9 8 9" />
                      </svg>
                    ),
                    title: 'Final Sale Policy',
                    description: 'Items marked "Final Sale" (50%+ off) cannot be returned or exchanged. All other sale items follow our standard 15-day return policy.',
                  },
                  {
                    icon: (
                      <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                      </svg>
                    ),
                    title: 'Express Shipping',
                    description: 'Free shipping on orders ₹2,999+. Sale orders ship within 24 hours. COD available on sale items up to ₹5,000.',
                  },
                  {
                    icon: (
                      <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </svg>
                    ),
                    title: 'Need Help Choosing?',
                    description: 'Chat with Vidhya or Meera on WhatsApp for personalized sale picks. They know every piece.',
                  },
                ]}
                renderItem={(item, index) => (
                  <StaggerItem key={index} variant="scale">
                    <div className="text-center p-6">
                      <div className="w-14 h-14 mx-auto mb-4 rounded-[var(--radius-xl)] bg-[var(--color-gold-light)] flex items-center justify-center text-[var(--color-gold)]">
                        {item.icon}
                      </div>
                      <h3 className="text-[var(--font-display)] text-lg font-medium text-[var(--color-ink)] mb-2">{item.title}</h3>
                      <p className="text-[var(--color-slate)] text-sm">{item.description}</p>
                    </div>
                  </StaggerItem>
                )}
                columns={3}
                gap={32}
                className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto"
              />
            </ScrollReveal>
          </div>
        </section>
      </div>
    );
  }