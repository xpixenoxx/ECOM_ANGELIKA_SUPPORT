'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils/cn';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
  showFirstLast?: boolean;
  showPrevNext?: boolean;
  maxVisiblePages?: number;
  className?: string;
  ariaLabel?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  baseUrl,
  showFirstLast = true,
  showPrevNext = true,
  maxVisiblePages = 5,
  className,
  ariaLabel = 'Pagination',
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const half = Math.floor(maxVisiblePages / 2);
  let start = Math.max(1, currentPage - half);
  let end = Math.min(totalPages, start + maxVisiblePages - 1);

  if (end - start + 1 < maxVisiblePages) {
    start = Math.max(1, end - maxVisiblePages + 1);
  }

  const pages: number[] = [];
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return (
    <nav
      role="navigation"
      aria-label={ariaLabel}
      className={cn('flex items-center justify-center gap-1', className)}
    >
      {showFirstLast && currentPage > 1 && (
        <Link
          href={`${baseUrl}?page=1`}
          className={cn(
            'px-4 py-2 text-sm font-medium text-[var(--color-slate)]',
            'hover:text-[var(--color-ink)] hover:bg-[var(--color-whisper)]',
            'rounded-[var(--radius-md)] transition-colors duration-150',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gold)]'
          )}
          aria-label="Go to first page"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </Link>
      )}

      {showPrevNext && currentPage > 1 && (
        <Link
          href={`${baseUrl}?page=${currentPage - 1}`}
          className={cn(
            'px-4 py-2 text-sm font-medium text-[var(--color-slate)]',
            'hover:text-[var(--color-ink)] hover:bg-[var(--color-whisper)]',
            'rounded-[var(--radius-md)] transition-colors duration-150',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gold)]'
          )}
          aria-label="Go to previous page"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </Link>
      )}

      {pages.length > 0 && (pages[0] as number) > 1 && (
        <span className="px-2 py-2 text-sm text-[var(--color-mist)]" aria-hidden="true">…</span>
      )}

      {pages.map((page) => (
        <Link
          key={page}
          href={`${baseUrl}?page=${page}`}
          className={cn(
            'px-4 py-2 text-sm font-medium rounded-[var(--radius-md)] transition-all duration-150',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gold)]',
            page === currentPage
              ? 'bg-[var(--color-gold)] text-[var(--color-ink)] shadow-[var(--shadow-md)]'
              : 'text-[var(--color-slate)] hover:text-[var(--color-ink)] hover:bg-[var(--color-whisper)]'
          )}
          aria-label={`Go to page ${page}`}
          aria-current={page === currentPage ? 'page' : undefined}
        >
          {page}
        </Link>
      ))}

      {pages.length > 0 && (pages[pages.length - 1] as number) < totalPages && (
        <span className="px-2 py-2 text-sm text-[var(--color-mist)]" aria-hidden="true">…</span>
      )}

      {showPrevNext && currentPage < totalPages && (
        <Link
          href={`${baseUrl}?page=${currentPage + 1}`}
          className={cn(
            'px-4 py-2 text-sm font-medium text-[var(--color-slate)]',
            'hover:text-[var(--color-ink)] hover:bg-[var(--color-whisper)]',
            'rounded-[var(--radius-md)] transition-colors duration-150',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gold)]'
          )}
          aria-label="Go to next page"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </Link>
      )}

      {showFirstLast && currentPage < totalPages && (
        <Link
          href={`${baseUrl}?page=${totalPages}`}
          className={cn(
            'px-4 py-2 text-sm font-medium text-[var(--color-slate)]',
            'hover:text-[var(--color-ink)] hover:bg-[var(--color-whisper)]',
            'rounded-[var(--radius-md)] transition-colors duration-150',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gold)]'
          )}
          aria-label="Go to last page"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Link>
      )}
    </nav>
  );
}