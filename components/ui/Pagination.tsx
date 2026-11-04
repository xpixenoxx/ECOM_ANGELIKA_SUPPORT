'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showFirstLast?: boolean;
  showPrevNext?: boolean;
  maxVisiblePages?: number;
  ariaLabel?: string;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  showFirstLast = true,
  showPrevNext = true,
  maxVisiblePages = 5,
  ariaLabel = 'Pagination',
  className = '',
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = getVisiblePages(currentPage, totalPages, maxVisiblePages);

  return (
    <motion.nav
      className={cn('flex items-center justify-center gap-1', className)}
      role="navigation"
      aria-label={ariaLabel}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {showFirstLast && (
        <motion.button
          className={cn(
            'p-2 rounded-[var(--radius-md)] bg-[var(--color-white)] border border-[var(--color-whisper)] text-[var(--color-ink)]',
            'hover:bg-[var(--color-gold-light)] hover:border-[var(--color-gold)] hover:text-[var(--color-gold)]',
            'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[var(--color-white)]',
            'transition-all duration-200'
          )}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          aria-label="First page"
          aria-disabled={currentPage === 1}
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M11 17l-5-5 5-5M18 17l-5-5 5-5" />
          </svg>
        </motion.button>
      )}

      {showPrevNext && (
        <motion.button
          className={cn(
            'p-2 rounded-[var(--radius-md)] bg-[var(--color-white)] border border-[var(--color-whisper)] text-[var(--color-ink)]',
            'hover:bg-[var(--color-gold-light)] hover:border-[var(--color-gold)] hover:text-[var(--color-gold)]',
            'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[var(--color-white)]',
            'transition-all duration-200'
          )}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Previous page"
          aria-disabled={currentPage === 1}
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </motion.button>
      )}

      {pages.map((page, index) => {
        if (page === 'ellipsis') {
          return (
            <span key="ellipsis" className="px-2 text-[var(--color-mist)]" aria-hidden="true">…</span>
          );
        }

        const isActive = page === currentPage;

        return (
          <motion.button
            key={page}
            className={cn(
              'h-10 w-10 min-w-[40px] rounded-[var(--radius-md)] font-semibold text-sm transition-all duration-200',
              'focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[var(--color-gold)]/40 focus-visible:ring-offset-2',
              isActive
                ? 'bg-[var(--color-gold)] text-[var(--color-ink)] shadow-[var(--shadow-gold)]'
                : 'bg-[var(--color-white)] border border-[var(--color-whisper)] text-[var(--color-ink)] hover:bg-[var(--color-gold-light)] hover:border-[var(--color-gold)] hover:text-[var(--color-gold)]'
            )}
            whileHover={!isActive ? { scale: 1.05 } : undefined}
            whileTap={!isActive ? { scale: 0.95 } : undefined}
            onClick={() => !isActive && onPageChange(page)}
            aria-label={`Page ${page}`}
            aria-current={isActive ? 'page' : undefined}
            aria-disabled={isActive}
          >
            {page}
          </motion.button>
        );
      })}

      {showPrevNext && (
        <motion.button
          className={cn(
            'p-2 rounded-[var(--radius-md)] bg-[var(--color-white)] border border-[var(--color-whisper)] text-[var(--color-ink)]',
            'hover:bg-[var(--color-gold-light)] hover:border-[var(--color-gold)] hover:text-[var(--color-gold)]',
            'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[var(--color-white)]',
            'transition-all duration-200'
          )}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Next page"
          aria-disabled={currentPage === totalPages}
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </motion.button>
      )}

      {showFirstLast && (
        <motion.button
          className={cn(
            'p-2 rounded-[var(--radius-md)] bg-[var(--color-white)] border border-[var(--color-whisper)] text-[var(--color-ink)]',
            'hover:bg-[var(--color-gold-light)] hover:border-[var(--color-gold)] hover:text-[var(--color-gold)]',
            'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[var(--color-white)]',
            'transition-all duration-200'
          )}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          aria-label="Last page"
          aria-disabled={currentPage === totalPages}
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M13 17l5-5-5-5M6 17l5-5-5-5" />
          </svg>
        </motion.button>
      )}
    </motion.nav>
  );
}

function getVisiblePages(currentPage: number, totalPages: number, maxVisible: number): (number | 'ellipsis')[] {
  if (totalPages <= maxVisible) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const halfVisible = Math.floor(maxVisible / 2);
  let start = Math.max(1, currentPage - halfVisible);
  let end = Math.min(totalPages, start + maxVisible - 1);

  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1);
  }

  const pages: (number | 'ellipsis')[] = [];

  if (start > 1) {
    pages.push(1);
    if (start > 2) pages.push('ellipsis');
  }

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (end < totalPages) {
    if (end < totalPages - 1) pages.push('ellipsis');
    pages.push(totalPages);
  }

  return pages;
}

export interface SimplePaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function SimplePagination({
  currentPage,
  totalPages,
  onPageChange,
  className = '',
}: SimplePaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className={cn('flex items-center justify-center gap-4', className)} role="navigation" aria-label="Pagination">
      <button
        className={cn(
          'px-4 py-2 text-sm font-medium text-[var(--color-slate)] hover:text-[var(--color-ink)]',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'transition-colors duration-150',
          'focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[var(--color-gold)]/40 focus-visible:ring-offset-2'
        )}
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Previous page"
      >
        Previous
      </button>

      <span className="text-sm font-medium text-[var(--color-ink)]" aria-current="page">
        Page {currentPage} of {totalPages}
      </span>

      <button
        className={cn(
          'px-4 py-2 text-sm font-medium text-[var(--color-slate)] hover:text-[var(--color-ink)]',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'transition-colors duration-150',
          'focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[var(--color-gold)]/40 focus-visible:ring-offset-2'
        )}
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Next page"
      >
        Next
      </button>
    </div>
  );
}

export interface LoadMoreProps {
  onLoadMore: () => void;
  hasMore: boolean;
  loading?: boolean;
  label?: string;
  className?: string;
}

export function LoadMore({
  onLoadMore,
  hasMore,
  loading = false,
  label = 'Load More',
  className = '',
}: LoadMoreProps) {
  if (!hasMore) return null;

  return (
    <div className={cn('text-center py-8', className)}>
      <motion.button
        className={cn(
          'px-8 py-3 text-sm font-semibold uppercase tracking-wider bg-transparent border-2 border-[var(--color-gold)] text-[var(--color-gold)] rounded-[var(--radius-md)]',
          'hover:bg-[var(--color-gold-light)] transition-all duration-200',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[var(--color-gold)]/40 focus-visible:ring-offset-2'
        )}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onLoadMore}
        disabled={loading}
      >
        {loading ? (
          <>
            <svg className="animate-spin h-4 w-4 mr-2 inline" viewBox="0 0 24 24" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Loading...
          </>
        ) : (
          label
        )}
      </motion.button>
    </div>
  );
}

export interface InfiniteScrollProps {
  children: React.ReactNode;
  onLoadMore: () => void;
  hasMore: boolean;
  loading?: boolean;
  threshold?: number;
  rootMargin?: string;
  className?: string;
}

export function InfiniteScroll({
  children,
  onLoadMore,
  hasMore,
  loading = false,
  threshold = 0.1,
  rootMargin = '100px',
  className = '',
}: InfiniteScrollProps) {
  const sentinelRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!hasMore || loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting) {
          onLoadMore();
        }
      },
      { threshold, rootMargin }
    );

    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loading, onLoadMore, threshold, rootMargin]);

  return (
    <div className={cn('space-y-6', className)}>
      {children}
      <div ref={sentinelRef} className="h-4" aria-hidden="true">
        {loading && (
          <div className="flex items-center justify-center py-8" role="status" aria-live="polite">
            <svg className="animate-spin h-8 w-8 text-[var(--color-gold)]" viewBox="0 0 24 24" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="sr-only">Loading more products...</span>
          </div>
        )}
      </div>
    </div>
  );
}