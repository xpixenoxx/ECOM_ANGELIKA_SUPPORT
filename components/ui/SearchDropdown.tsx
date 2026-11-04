'use client';

import React, { useState, useEffect, useRef, KeyboardEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils/cn';
import { ProductCard } from '@/components/ui/Card';
import { SkeletonProductCard } from '@/components/ui/Skeleton';

export interface SearchResult {
  id: string;
  type: 'product' | 'category' | 'collection' | 'page';
  title: string;
  subtitle?: string;
  image?: string;
  href: string;
  price?: number;
  originalPrice?: number;
  category?: string;
}

export interface SearchDropdownProps {
  query: string;
  onClose: () => void;
  onSearch?: (query: string) => void;
  results?: SearchResult[];
  loading?: boolean;
  className?: string;
}

export function SearchDropdown({
  query,
  onClose,
  onSearch,
  results = [],
  loading = false,
  className = '',
}: SearchDropdownProps) {
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      if (!dropdownRef.current) return;

      const items = itemsRef.current.filter((el): el is HTMLButtonElement => el !== null);
      if (items.length === 0) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % items.length);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => (prev - 1 + items.length) % items.length);
          break;
        case 'Enter':
          e.preventDefault();
          const selectedItem = items[selectedIndex];
          if (selectedIndex >= 0 && selectedItem) {
            selectedItem.click();
          }
          break;
        case 'Escape':
          onClose();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, onClose]);

  useEffect(() => {
    if (selectedIndex >= 0 && itemsRef.current[selectedIndex]) {
      itemsRef.current[selectedIndex]?.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  const handleResultClick = (result: SearchResult) => {
    onSearch?.(query);
    onClose();
  };

  if (!query || query.length < 2) {
    return null;
  }

  const dropdownContent = (
    <motion.div
      ref={dropdownRef}
      className={cn(
        'fixed left-0 right-0 z-[var(--z-dropdown)] bg-[var(--color-white)] border border-[var(--color-whisper)] rounded-b-[var(--radius-lg)] shadow-[var(--shadow-xl)] overflow-hidden',
        'md:absolute md:left-auto md:right-0 md:rounded-[var(--radius-lg)] md:mt-2 md:w-[400px] md:max-w-md',
        className
      )}
      initial={{ opacity: 0, y: -10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.98 }}
      transition={{ duration: 0.15, ease: [0.175, 0.885, 0.32, 1.275] }}
      role="listbox"
      aria-label="Search results"
      id="search-results"
    >
      {loading ? (
        <div className="p-4 space-y-3" role="status" aria-live="polite">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonProductCard key={i} />
          ))}
        </div>
      ) : results.length > 0 ? (
        <>
          <div className="p-3 border-b border-[var(--color-whisper)]">
            <p className="text-xs font-medium uppercase tracking-wider text-[var(--color-gold)]">
              Results for &ldquo;{query}&rdquo;
            </p>
          </div>
          <div className="max-h-[400px] overflow-y-auto" role="list">
            {results.map((result, index) => (
              <motion.button
                key={result.id}
                ref={(el) => { itemsRef.current[index] = el; }}
                role="option"
                aria-selected={selectedIndex === index}
                onClick={() => handleResultClick(result)}
                className={cn(
                  'w-full p-3 flex items-center gap-3 text-left hover:bg-[var(--color-gold-light)]/50 transition-colors',
                  selectedIndex === index && 'bg-[var(--color-gold-light)]/50 outline-none ring-2 ring-[var(--color-gold)] ring-inset'
                )}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
              >
                {result.image && (
                  <motion.div
                    className="w-12 h-12 flex-shrink-0 rounded-[var(--radius-md)] overflow-hidden bg-[var(--color-whisper)]"
                    whileHover={{ scale: 1.05 }}
                  >
                    <img
                      src={result.image}
                      alt={result.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </motion.div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[var(--color-ink)] truncate">{result.title}</p>
                  {result.subtitle && (
                    <p className="text-xs text-[var(--color-slate)] truncate">{result.subtitle}</p>
                  )}
                  {result.category && (
                    <span className="text-xs font-medium text-[var(--color-gold)]">{result.category}</span>
                  )}
                  {result.price && (
                    <div className="mt-1 flex items-baseline gap-2">
                      <span className="font-bold text-[var(--color-ink)]">₹{result.price.toLocaleString()}</span>
                      {result.originalPrice && (
                        <span className="text-xs text-[var(--color-mist)] line-through">₹{result.originalPrice.toLocaleString()}</span>
                      )}
                    </div>
                  )}
                </div>
                <svg className="h-5 w-5 text-[var(--color-mist)] flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </motion.button>
            ))}
          </div>
          <div className="p-3 border-t border-[var(--color-whisper)]">
            <motion.button
              className="w-full px-4 py-2 text-sm font-semibold uppercase tracking-wider text-[var(--color-gold)] hover:text-[var(--color-gold-hover)] flex items-center justify-center gap-2 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => { onSearch?.(query); onClose(); }}
            >
              View all results for &ldquo;{query}&rdquo;
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </motion.button>
          </div>
        </>
      ) : (
        <div className="p-8 text-center" role="status">
          <motion.div
            className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--color-whisper)] flex items-center justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 12, stiffness: 100 }}
          >
            <svg className="h-8 w-8 text-[var(--color-mist)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
          </motion.div>
          <p className="text-[var(--color-slate)] mb-2">No results found for &ldquo;{query}&rdquo;</p>
          <p className="text-xs text-[var(--color-mist)]">Try different keywords or check spelling</p>
        </div>
      )}
    </motion.div>
  );

  if (typeof window === 'undefined') return null;

  return createPortal(dropdownContent, document.body);
}

export interface QuickSearchProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  className?: string;
}

export function QuickSearch({
  placeholder = 'Search products...',
  onSearch,
  className = '',
}: QuickSearchProps) {
  const [query, setQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  const handleSearch = async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
        if (response.ok) {
          const data = await response.json();
          setResults(data.results || []);
        }
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 150);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setShowResults(value.length >= 2);
    handleSearch(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch?.(query.trim());
      setShowResults(false);
    }
  };

  const handleFocus = () => {
    if (query.length >= 2) setShowResults(true);
  };

  const handleBlur = () => {
    setTimeout(() => setShowResults(false), 200);
  };

  return (
    <div className={cn('relative', className)}>
      <form onSubmit={handleSubmit} className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--color-mist)] pointer-events-none"
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
          ref={inputRef}
          type="search"
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className="w-full h-12 pl-10 pr-10 py-2 text-base bg-[var(--color-white)] border border-[var(--color-whisper)] rounded-[var(--radius-md)] focus:border-[var(--color-gold)] focus:outline-none focus:ring-3 focus:ring-[var(--color-gold)]/20 transition-all duration-200 placeholder:text-[var(--color-mist)]"
          aria-label="Search products"
          aria-autocomplete="list"
          aria-controls="search-results"
          aria-expanded={showResults && query.length >= 2}
          autoComplete="off"
        />
        {query && (
          <button
            type="button"
            onClick={() => { setQuery(''); setResults([]); setShowResults(false); inputRef.current?.focus(); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-[var(--color-mist)] hover:text-[var(--color-ink)] hover:bg-[var(--color-whisper)] transition-colors"
            aria-label="Clear search"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        )}
      </form>
      <AnimatePresence>
        {showResults && query.length >= 2 && (
          <SearchDropdown
            query={query}
            onClose={() => setShowResults(false)}
            onSearch={onSearch}
            results={results}
            loading={loading}
          />
        )}
      </AnimatePresence>
    </div>
  );
}