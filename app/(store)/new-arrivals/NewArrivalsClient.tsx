'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils/cn';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { StaggerContainer, StaggerItem, StaggerGrid } from '@/components/animations/Stagger';
import { MagneticButton } from '@/components/animations/MagneticButton';
import type { NewArrivalsPageContent } from '@/lib/actions/site-content-types';

const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'discount', label: 'Best Discount' },
];

const categories = ['All', 'Sarees', 'Lehengas', 'Kurtis', 'Salwars', 'Dupattas', 'Gowns', 'Co-ords', 'Accessories'] as const;

const fabricTypes = ['Silk', 'Cotton', 'Chiffon', 'Organza', 'Velvet', 'Banarasi', 'Chanderi', 'Handloom'] as const;
const productTypes = ['Saree', 'Lehenga Set', 'Kurti', 'Salwar Suit', 'Dupatta', 'Gown', 'Anarkali', 'Co-ord Set'] as const;
const colors = ['Crimson', 'Emerald', 'Navy', 'Gold', 'Ivory', 'Sage', 'Lavender', 'Coral', 'Charcoal', 'Rose', 'Teal', 'Amber'] as const;
const colorHexes = ['#DC143C', '#1B7A3D', '#1E3A8A', '#C9A84C', '#FFFFF0', '#8A9A5B', '#967BB6', '#FF6F61', '#36454F', '#FF66CC', '#008080', '#FFBF00'] as const;
const discountValues = [0, 10, 15, 20, 25, 30] as const;
const tags = ['Handwoven', 'Natural Dyes', 'Artisan Made', 'Limited Edition', 'Exclusive'] as const;

const realNewArrivalSlugs = [
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

interface NewArrivalProduct {
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
  isNew: boolean;
  isTrending: boolean;
  inStock: boolean;
  tags: string[];
}

const mockNewArrivals: NewArrivalProduct[] = Array.from({ length: 24 }, (_, i) => {
  const catIndex = i % categories.length;
  const category = categories[catIndex] || 'Sarees';
  const basePrice = 2000 + (i * 500) % 15000;
  const discount = discountValues[i % 6] as number;
  const originalPrice = discount > 0 ? Math.round(basePrice / (1 - discount / 100)) : basePrice;

  return {
    id: `new-${i + 1}`,
    slug: realNewArrivalSlugs[i % realNewArrivalSlugs.length],
    name: `${category} ${fabricTypes[i % 8] as string} ${productTypes[i % 8] as string}`,
    price: basePrice,
    originalPrice,
    image: `/images/new-${(i % 12) + 1}.jpg`,
    color: colors[i % 12] as string,
    colorHex: colorHexes[i % 12] as string,
    category,
    discount,
    isNew: i < 8,
    isTrending: i % 7 === 0,
    inStock: i !== 20,
    tags: tags.slice(0, 2 + (i % 3)) as string[],
  };
});

function ProductCardGrid({ product }: { product: NewArrivalProduct }) {
  return (
    <article className="group relative bg-[var(--color-white)] border border-[var(--color-whisper)] rounded-[var(--radius-xl)] overflow-hidden hover:shadow-[var(--shadow-lg)] transition-all duration-300">
      <div className="relative aspect-[3/4] overflow-hidden">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.isNew && <Badge variant="gold" className="text-xs">New</Badge>}
          {product.isTrending && <Badge variant="gold" className="text-xs">Trending</Badge>}
          {product.discount > 0 && (
            <Badge variant="outline" className="bg-[var(--color-gold)] text-[var(--color-ink)] border-[var(--color-gold)] text-xs">
              -{product.discount}%
            </Badge>
          )}
        </div>
        {!product.inStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-sm font-semibold text-white bg-[var(--color-error)] px-3 py-1 rounded-[var(--radius-sm)]">Out of Stock</span>
          </div>
        )}
        <div className="absolute bottom-3 left-3 right-3 flex justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Button variant="ghost" size="sm" className="bg-[var(--color-white)]/90 backdrop-blur-sm rounded-full px-3" asChild>
            <Link href={`/product/${product.slug || product.id}`} className="flex items-center gap-1">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
              <span className="hidden sm:inline">View</span>
            </Link>
          </Button>
          <Button variant="ghost" size="sm" className="bg-[var(--color-white)]/90 backdrop-blur-sm rounded-full px-3" asChild>
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
          {product.tags.map((tag: string, ti: number) => <Badge key={tag} variant="outline" className="text-xs px-2 py-0.5">{tag}</Badge>)}
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
        </div>
      </div>
    </article>
  );
}

function ProductCardList({ product }: { product: NewArrivalProduct }) {
  return (
    <article className="group relative bg-[var(--color-white)] border border-[var(--color-whisper)] rounded-[var(--radius-xl)] overflow-hidden hover:shadow-[var(--shadow-lg)] transition-all duration-300 flex gap-0 p-0">
      <div className="relative aspect-[3/4] overflow-hidden w-56 flex-shrink-0 aspect-auto h-auto min-h-[280px]">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="224px"
        />
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.isNew && <Badge variant="gold" className="text-xs">New</Badge>}
          {product.isTrending && <Badge variant="gold" className="text-xs">Trending</Badge>}
          {product.discount > 0 && (
            <Badge variant="outline" className="bg-[var(--color-gold)] text-[var(--color-ink)] border-[var(--color-gold)] text-xs">
              -{product.discount}%
            </Badge>
          )}
        </div>
        {!product.inStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-sm font-semibold text-white bg-[var(--color-error)] px-3 py-1 rounded-[var(--radius-sm)]">Out of Stock</span>
          </div>
        )}
        <div className="absolute bottom-3 left-3 right-3 flex justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Button variant="ghost" size="sm" className="bg-[var(--color-white)]/90 backdrop-blur-sm rounded-full px-3" asChild>
            <Link href={`/product/${product.slug || product.id}`} className="flex items-center gap-1">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
              <span className="hidden sm:inline">View</span>
            </Link>
          </Button>
          <Button variant="ghost" size="sm" className="bg-[var(--color-white)]/90 backdrop-blur-sm rounded-full px-3" asChild>
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
          {product.tags.map((tag: string, ti: number) => <Badge key={tag} variant="outline" className="text-xs px-2 py-0.5">{tag}</Badge>)}
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
        </div>
        <div className="mt-4 flex items-center gap-2">
          <Button variant="gold" size="sm" className="flex-1" asChild disabled={!product.inStock}>
            <Link href={`/product/${product.slug || product.id}`}>{product.inStock ? 'Add to Bag' : 'Notify Me'}</Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/product/${product.slug || product.id}`}>Details</Link>
          </Button>
        </div>
      </div>
    </article>
  );
}

export default function NewArrivalsClient({ initialContent }: { initialContent?: NewArrivalsPageContent | null }) {
    const content = initialContent;
  const pageCategories = content?.categories && content.categories.length > 0 ? content.categories : categories;
  const productsList = content?.products && content.products.length > 0 ? content.products : mockNewArrivals;

  const [activeCategory, setActiveCategory] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [page, setPage] = useState(1);
  const itemsPerPage = content?.itemsPerPage || 12;

  let filteredProducts = productsList.filter(p => activeCategory === 'All' || p.category === activeCategory);

  if (!filteredProducts.some(p => p.inStock)) {
    filteredProducts = filteredProducts.filter(p => p.inStock);
  }

  filteredProducts.sort((a, b) => {
    switch (sortBy) {
      case 'price-low': return a.price - b.price;
      case 'price-high': return b.price - a.price;
      case 'popular': return (b.isTrending ? 1 : 0) - (a.isTrending ? 1 : 0);
      case 'discount': return b.discount - a.discount;
      default: return 0;
    }
  });

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    setPage(1);
  };

  const handleSortChange = (sort: string) => {
    setSortBy(sort);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-[var(--color-white)]">
      {/* Page Header */}
      <section className="bg-[var(--color-snow)] border-b border-[var(--color-whisper)] py-12">
        <div className="container-custom px-6">
          <ScrollReveal variant="fadeUp" className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <span className="inline-block px-4 py-1 bg-[var(--color-gold-light)] text-[var(--color-gold)] text-sm font-semibold rounded-[var(--radius-full)] mb-3">
                JUST LANDED
              </span>
              <h1 className="text-[var(--font-display)] text-4xl md:text-5xl font-medium text-[var(--color-ink)] leading-tight">
                New Arrivals
              </h1>
              <p className="text-[var(--color-slate)] mt-2">
                Fresh drops every week. Handcrafted pieces from our artisan partners across India.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="hidden sm:flex items-center gap-2">
                <label htmlFor="sort" className="text-sm text-[var(--color-slate)]">Sort by:</label>
                <Select value={sortBy} onValueChange={handleSortChange}>
                  <SelectTrigger id="sort" className="w-[180px]">
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
          </ScrollReveal>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-6 bg-[var(--color-white)] border-b border-[var(--color-whisper)] sticky top-[72px] z-10">
        <div className="container-custom px-6">
          <ScrollReveal variant="fadeUp" delay={0.1}>
            <div className="flex flex-wrap justify-center gap-2">
              {pageCategories.map((cat) => (
                <MagneticButton
                  key={cat}
                  variant={activeCategory === cat ? 'primary' : 'ghost'}
                  size="sm"
                  strength={0.2}
                  onClick={() => handleCategoryChange(cat)}
                  className="rounded-[var(--radius-full)] whitespace-nowrap"
                >
                  {cat}
                  {cat !== 'All' && (
                    <span className="ml-1.5 px-1.5 py-0.5 text-xs bg-[var(--color-gold)]/20 text-[var(--color-gold)] rounded-full">
                      {productsList.filter(p => p.category === cat).length}
                    </span>
                  )}
                </MagneticButton>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Results Info */}
      <section className="py-4 bg-[var(--color-white)] border-b border-[var(--color-whisper)]">
        <div className="container-custom px-6">
          <ScrollReveal variant="fadeUp" delay={0.2}>
            <p className="text-sm text-[var(--color-slate)]">
              Showing <span className="font-medium text-[var(--color-ink)]">{paginatedProducts.length}</span> of{' '}
              <span className="font-medium text-[var(--color-ink)]">{filteredProducts.length}</span> products
              {activeCategory !== 'All' && <span className="text-[var(--color-gold)]"> in {activeCategory}</span>}
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
                <h3 className="text-[var(--font-display)] text-xl text-[var(--color-ink)] mb-2">No Products Found</h3>
                <p className="text-[var(--color-slate)] mb-4">Try adjusting your filters or browse all categories.</p>
                <MagneticButton variant="outline" strength={0.3} onClick={() => { setActiveCategory('All'); setSortBy('newest'); }}>
                  Reset Filters
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

        {/* Newsletter CTA */}
        <section className="py-16 bg-[var(--color-ink)]">
          <div className="container-custom px-6">
            <ScrollReveal variant="fadeUp" className="max-w-3xl mx-auto text-center">
              <h2 className="text-[var(--font-display)] text-3xl md:text-4xl font-medium text-[var(--color-white)] mb-4">
                Never Miss a Drop
              </h2>
              <p className="text-[var(--color-white)]/70 text-lg mb-8">
                Get early access to new arrivals, exclusive pre-orders, and behind-the-scenes stories from our artisan partners.
              </p>
              <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto" onSubmit={(e) => { e.preventDefault(); alert('Subscribed! Check your email for confirmation.'); }}>
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1"
                  aria-label="Email for new arrival alerts"
                />
                <MagneticButton variant="primary" type="submit" strength={0.3} className="whitespace-nowrap">
                  Notify Me
                </MagneticButton>
              </form>
            </ScrollReveal>
          </div>
        </section>
      </div>
    );
  }