'use client';

import React, { ReactNode, useId, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';
import { ProductCard } from '@/components/ui/Card';
import { SkeletonProductCard } from '@/components/ui/Skeleton';
import { Pagination } from '@/components/ui/Pagination';

export interface ProductGridItem {
  id: string;
  image: string;
  name: string;
  price: number;
  originalPrice?: number;
  category: string;
  colors?: string[];
  sizes?: string[];
  isNew?: boolean;
  isSale?: boolean;
  isVidhyasPick?: boolean;
  rating?: number;
  reviewCount?: number;
  badge?: 'new' | 'sale' | 'limited' | 'exclusive';
  href?: string;
}

export interface ProductGridProps {
  products: ProductGridItem[];
  loading?: boolean;
  emptyMessage?: string;
  emptyAction?: ReactNode;
  columns?: { base: number; sm: number; md: number; lg: number; xl: number };
  gap?: 'sm' | 'md' | 'lg';
  onQuickView?: (productId: string) => void;
  onAddToBag?: (productId: string) => void;
  onAddToWishlist?: (productId: string) => void;
  pagination?: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  };
  className?: string;
}

const gapStyles = {
  sm: 'gap-4',
  md: 'gap-6',
  lg: 'gap-8',
};

const columnStyles = {
  base: 'grid-cols-1',
  sm: 'sm:grid-cols-2',
  md: 'md:grid-cols-3',
  lg: 'lg:grid-cols-4',
  xl: 'xl:grid-cols-5',
};

export function ProductGrid({
  products,
  loading = false,
  emptyMessage = 'No products found',
  emptyAction,
  columns = { base: 1, sm: 2, md: 3, lg: 4, xl: 4 },
  gap = 'md',
  onQuickView,
  onAddToBag,
  onAddToWishlist,
  pagination,
  className = '',
}: ProductGridProps) {
  const gridId = useId();

  if (loading) {
    return (
      <motion.div
        className={cn('grid', gapStyles[gap], columnStyles.base, columnStyles.sm, columnStyles.md, columnStyles.lg, columnStyles.xl, className)}
        role="list"
        aria-label="Products loading"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {Array.from({ length: columns.lg }).map((_, i) => (
          <SkeletonProductCard key={i} />
        ))}
      </motion.div>
    );
  }

  if (products.length === 0) {
    return (
      <motion.div
        className={cn('text-center py-16', className)}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <motion.div
          className="w-20 h-20 mx-auto mb-6 rounded-full bg-[var(--color-whisper)] flex items-center justify-center"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', damping: 12, stiffness: 100 }}
        >
          <svg className="h-10 w-10 text-[var(--color-mist)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <path d="M20 7L9 16l-4-4" />
            <path d="M6 9l6 6 6-6" />
          </svg>
        </motion.div>
        <h3 className="text-[var(--font-display)] text-xl font-medium text-[var(--color-ink)] mb-2">
          {emptyMessage}
        </h3>
        <p className="text-[var(--color-slate)] mb-6 max-w-sm mx-auto">
          We couldn't find any products matching your criteria. Try adjusting your filters or search terms.
        </p>
        {emptyAction}
      </motion.div>
    );
  }

  return (
    <div className={cn('space-y-8', className)}>
      <motion.div
        className={cn('grid', gapStyles[gap], columnStyles.base, columnStyles.sm, columnStyles.md, columnStyles.lg, columnStyles.xl)}
        role="list"
        aria-label="Product grid"
      >
        {products.map((product, index) => (
          <motion.article
            key={product.id}
            className="group"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(index * 0.05, 0.3), type: 'spring', damping: 20, stiffness: 100 }}
            role="listitem"
          >
            <ProductCard
              {...product}
              onQuickView={() => onQuickView?.(product.id)}
              onAddToBag={() => onAddToBag?.(product.id)}
              onAddToWishlist={() => onAddToWishlist?.(product.id)}
            />
          </motion.article>
        ))}
      </motion.div>

      {pagination && pagination.totalPages > 1 && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPageChange={pagination.onPageChange}
          ariaLabel="Product pages"
        />
      )}
    </div>
  );
}

export interface FeaturedProductGridProps extends Omit<ProductGridProps, 'columns'> {
  title?: string;
  subtitle?: string;
  viewAllHref?: string;
  viewAllLabel?: string;
}

export function FeaturedProductGrid({
  title,
  subtitle,
  viewAllHref,
  viewAllLabel = 'View All',
  products,
  loading,
  emptyMessage,
  onQuickView,
  onAddToBag,
  onAddToWishlist,
  gap = 'md',
  className = '',
}: FeaturedProductGridProps) {
  return (
    <section className={cn('space-y-6', className)} aria-labelledby={title ? 'featured-title' : undefined}>
      {(title || viewAllHref) && (
        <motion.div
          className="flex items-center justify-between"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div>
            {title && (
              <h2 id="featured-title" className="text-[var(--font-display)] text-2xl md:text-3xl font-medium text-[var(--color-ink)]">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="mt-1 text-[var(--color-slate)]">{subtitle}</p>
            )}
          </div>
          {viewAllHref && (
            <a
              href={viewAllHref}
              className="text-sm font-semibold uppercase tracking-wider text-[var(--color-gold)] hover:text-[var(--color-gold-hover)] flex items-center gap-1 transition-colors"
            >
              {viewAllLabel}
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
          )}
        </motion.div>
      )}
      <ProductGrid
        products={products}
        loading={loading}
        emptyMessage={emptyMessage}
        onQuickView={onQuickView}
        onAddToBag={onAddToBag}
        onAddToWishlist={onAddToWishlist}
        gap={gap}
      />
    </section>
  );
}

export interface ProductCarouselProps {
  products: ProductGridItem[];
  title?: string;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  onQuickView?: (productId: string) => void;
  onAddToBag?: (productId: string) => void;
  onAddToWishlist?: (productId: string) => void;
  className?: string;
}

export function ProductCarousel({
  products,
  title,
  autoPlay = false,
  autoPlayInterval = 5000,
  onQuickView,
  onAddToBag,
  onAddToWishlist,
  className = '',
}: ProductCarouselProps) {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const carouselId = useId();
  const itemsPerView = typeof window !== 'undefined' && window.innerWidth >= 1024 ? 4 : typeof window !== 'undefined' && window.innerWidth >= 768 ? 3 : 2;
  const maxIndex = Math.max(0, products.length - itemsPerView);

  React.useEffect(() => {
    if (!autoPlay || products.length <= itemsPerView) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    }, autoPlayInterval);
    return () => clearInterval(interval);
  }, [autoPlay, autoPlayInterval, maxIndex, products.length, itemsPerView]);

  const handleResize = () => {
    const newItemsPerView = window.innerWidth >= 1024 ? 4 : window.innerWidth >= 768 ? 3 : 2;
    const newMaxIndex = Math.max(0, products.length - newItemsPerView);
    setCurrentIndex(Math.min(currentIndex, newMaxIndex));
  };

  React.useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [currentIndex, products.length]);

  const visibleProducts = products.slice(currentIndex, currentIndex + itemsPerView);

  return (
    <section className={cn('relative', className)} aria-labelledby={title ? `${carouselId}-title` : undefined}>
      {title && (
        <h2 id={`${carouselId}-title`} className="text-[var(--font-display)] text-2xl md:text-3xl font-medium text-[var(--color-ink)] mb-6">
          {title}
        </h2>
      )}
      <div className="overflow-hidden">
        <motion.div
          className="flex gap-6 transition-transform duration-500 ease-[var(--ease-expressive)]"
          style={{ transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)` }}
        >
          {visibleProducts.map((product, index) => (
            <motion.div
              key={product.id}
              className="flex-shrink-0 w-full sm:w-1/2 lg:w-1/3 xl:w-1/4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.08 }}
            >
              <ProductCard
                {...product}
                onQuickView={() => onQuickView?.(product.id)}
                onAddToBag={() => onAddToBag?.(product.id)}
                onAddToWishlist={() => onAddToWishlist?.(product.id)}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
      {products.length > itemsPerView && (
        <div className="flex items-center justify-center gap-3 mt-6">
          <motion.button
            className="p-2 rounded-full bg-[var(--color-white)] border border-[var(--color-whisper)] text-[var(--color-ink)] hover:bg-[var(--color-gold-light)] hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] transition-all duration-200"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
            disabled={currentIndex === 0}
            aria-label="Previous"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </motion.button>
          <div className="flex gap-1.5" role="tablist" aria-label="Carousel pages">
            {Array.from({ length: maxIndex + 1 }).map((_, i) => (
              <motion.button
                key={i}
                role="tab"
                aria-selected={i === currentIndex}
                aria-label={`Go to page ${i + 1}`}
                onClick={() => setCurrentIndex(i)}
                className={cn(
                  'w-2 h-2 rounded-full transition-all duration-300',
                  i === currentIndex
                    ? 'bg-[var(--color-gold)] w-6'
                    : 'bg-[var(--color-mist)] hover:bg-[var(--color-slate)]'
                )}
                whileTap={{ scale: 1.2 }}
              />
            ))}
          </div>
          <motion.button
            className="p-2 rounded-full bg-[var(--color-white)] border border-[var(--color-whisper)] text-[var(--color-ink)] hover:bg-[var(--color-gold-light)] hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] transition-all duration-200"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setCurrentIndex((prev) => Math.min(maxIndex, prev + 1))}
            disabled={currentIndex >= maxIndex}
            aria-label="Next"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </motion.button>
        </div>
      )}
    </section>
  );
}