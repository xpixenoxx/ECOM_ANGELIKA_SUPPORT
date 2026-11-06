'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils/cn';
import { STORE_CATALOGUE, VIDHYAS_PICKS_LIST, CatalogueProduct } from '@/lib/data/store-catalogue';

export interface SearchResult {
  id: string;
  type?: 'product' | 'category' | 'collection' | 'page';
  title: string;
  subtitle?: string;
  image?: string;
  href: string;
  price?: number;
  originalPrice?: number;
  category?: string;
  color?: string;
  colorFamily?: string;
  isVidhyasPick?: boolean;
}

export interface SearchDropdownProps {
  query: string;
  onClose: () => void;
  onSearch?: (query: string) => void;
  results?: SearchResult[];
  loading?: boolean;
  className?: string;
}

export { STORE_CATALOGUE, VIDHYAS_PICKS_LIST };

function filterCatalogue(query: string): SearchResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const seen = new Set<string>();
  const matches: SearchResult[] = [];

  for (const item of STORE_CATALOGUE) {
    if (seen.has(item.id)) continue;

    const titleLower = item.title.toLowerCase();
    const catLower = (item.category || '').toLowerCase();
    const subLower = (item.subtitle || '').toLowerCase();
    const fabricLower = (item.fabric || '').toLowerCase();
    const colorLower = (item.color || '').toLowerCase();
    const colorFamLower = (item.colorFamily || '').toLowerCase();
    const tagsLower = (item.tags || []).join(' ').toLowerCase();

    // Check direct substring matches
    if (
      titleLower.includes(q) ||
      catLower.includes(q) ||
      subLower.includes(q) ||
      fabricLower.includes(q) ||
      colorLower.includes(q) ||
      colorFamLower.includes(q) ||
      tagsLower.includes(q)
    ) {
      matches.push(item);
      seen.add(item.id);
      continue;
    }

    // Type / category synonyms
    if (
      (q === 'kurti' || q === 'kurtis' || q === 'kurta' || q === 'anarkali' || q === 'tunic') &&
      catLower === 'kurtis'
    ) {
      matches.push(item);
      seen.add(item.id);
      continue;
    }

    if ((q === 'saree' || q === 'sarees' || q === 'sari' || q === 'saris') && catLower === 'sarees') {
      matches.push(item);
      seen.add(item.id);
      continue;
    }

    if ((q === 'lehenga' || q === 'lehengas' || q === 'choli' || q === 'bridal') && catLower === 'lehengas') {
      matches.push(item);
      seen.add(item.id);
      continue;
    }

    if ((q === 'salwar' || q === 'salwars' || q === 'palazzo' || q === 'churidar' || q === 'suit' || q === 'sharara') && catLower === 'salwars') {
      matches.push(item);
      seen.add(item.id);
      continue;
    }

    if ((q === 'dupatta' || q === 'dupattas' || q === 'scarf' || q === 'phulkari' || q === 'stole') && catLower === 'dupattas') {
      matches.push(item);
      seen.add(item.id);
      continue;
    }

    // Color synonyms
    if (['red', 'crimson', 'maroon', 'ruby'].includes(q) && (colorLower.includes('red') || colorLower.includes('crimson') || colorFamLower === 'red')) {
      matches.push(item);
      seen.add(item.id);
      continue;
    }

    if (['green', 'emerald', 'sage', 'mint'].includes(q) && (colorLower.includes('green') || colorLower.includes('emerald') || colorFamLower === 'green')) {
      matches.push(item);
      seen.add(item.id);
      continue;
    }

    if (['blue', 'navy', 'indigo', 'powder blue'].includes(q) && (colorLower.includes('blue') || colorLower.includes('navy') || colorFamLower === 'blue')) {
      matches.push(item);
      seen.add(item.id);
      continue;
    }

    if (['gold', 'yellow', 'mustard', 'champagne', 'zari'].includes(q) && (colorLower.includes('gold') || colorLower.includes('yellow') || colorFamLower === 'gold' || colorFamLower === 'yellow')) {
      matches.push(item);
      seen.add(item.id);
      continue;
    }

    if (['pink', 'rose', 'peach', 'blush'].includes(q) && (colorLower.includes('pink') || colorLower.includes('rose') || colorFamLower === 'pink')) {
      matches.push(item);
      seen.add(item.id);
      continue;
    }

    if (['white', 'ivory', 'cream'].includes(q) && (colorLower.includes('white') || colorLower.includes('ivory') || colorFamLower === 'white')) {
      matches.push(item);
      seen.add(item.id);
      continue;
    }

    // Fabric synonyms
    if (q === 'silk' && (titleLower.includes('silk') || subLower.includes('silk') || fabricLower.includes('silk'))) {
      matches.push(item);
      seen.add(item.id);
      continue;
    }

    if (q === 'cotton' && (titleLower.includes('cotton') || subLower.includes('cotton') || fabricLower.includes('cotton'))) {
      matches.push(item);
      seen.add(item.id);
      continue;
    }

    if (q === 'velvet' && (titleLower.includes('velvet') || subLower.includes('velvet') || fabricLower.includes('velvet'))) {
      matches.push(item);
      seen.add(item.id);
      continue;
    }
  }

  return matches;
}

export function SearchDropdown({
  query,
  onClose,
  onSearch,
  results: propResults,
  loading: propLoading = false,
  className = '',
}: SearchDropdownProps) {
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [apiResults, setApiResults] = useState<SearchResult[]>([]);
  const [isFetching, setIsFetching] = useState(false);

  // Debounced API search to fetch any server/DB products
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setApiResults([]);
      setIsFetching(false);
      return;
    }

    let isCancelled = false;
    setIsFetching(true);

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`);
        if (!res.ok) throw new Error('Search failed');
        const data = await res.json();
        if (!isCancelled && data.products && Array.isArray(data.products)) {
          const mapped: SearchResult[] = data.products.map((p: any) => ({
            id: p.id,
            title: p.name || p.title,
            subtitle: p.description || p.subtitle,
            image: p.image || p.images?.[0]?.url || '/images/collection-kurtis.jpg',
            href: `/vidhyas-picks?search=${encodeURIComponent(p.name || p.title)}`,
            price: p.price,
            originalPrice: p.compare_at_price || p.originalPrice,
            category: p.category?.name || p.category,
            color: p.color || '',
            isVidhyasPick: Boolean(p.is_vidyas_pick),
          }));
          setApiResults(mapped);
        }
      } catch {
        // Fall back gracefully to local catalogue search
      } finally {
        if (!isCancelled) setIsFetching(false);
      }
    }, 150);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [query]);

  // Combine prop results, local catalogue results, and API results
  const displayedResults = useMemo(() => {
    if (propResults && propResults.length > 0) {
      return propResults;
    }

    const localMatches = filterCatalogue(query);
    const seen = new Set(localMatches.map((m) => m.id));
    const combined = [...localMatches];

    for (const item of apiResults) {
      if (!seen.has(item.id)) {
        combined.push(item);
        seen.add(item.id);
      }
    }

    return combined;
  }, [query, propResults, apiResults]);

  const hasMatches = displayedResults.length > 0;
  const isLoading = propLoading || (isFetching && displayedResults.length === 0);

  // Active items for keyboard navigation
  const activeItems = hasMatches ? displayedResults : VIDHYAS_PICKS_LIST;

  useEffect(() => {
    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      if (!dropdownRef.current) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % activeItems.length);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => (prev - 1 + activeItems.length) % activeItems.length);
          break;
        case 'Enter':
          if (selectedIndex >= 0 && activeItems[selectedIndex]) {
            e.preventDefault();
            const targetItem = activeItems[selectedIndex];
            if (targetItem) handleSelect(targetItem);
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, activeItems, onClose]);

  const handleSelect = (item: SearchResult) => {
    onClose();
    if (onSearch) {
      onSearch(item.title);
    } else {
      router.push(`/vidhyas-picks?search=${encodeURIComponent(item.title)}`);
    }
  };

  const handleViewAll = () => {
    onClose();
    if (onSearch) {
      onSearch(query.trim());
    } else {
      router.push(`/vidhyas-picks?search=${encodeURIComponent(query.trim())}`);
    }
  };

  if (!query || query.trim().length === 0) {
    return null;
  }

  return (
    <motion.div
      ref={dropdownRef}
      onMouseDown={(e) => {
        // Prevent clicking inside dropdown from triggering input blur
        e.stopPropagation();
      }}
      className={cn(
        'absolute top-full right-0 mt-2 z-50 bg-white border border-[var(--color-whisper)] rounded-2xl shadow-2xl overflow-hidden',
        'w-full sm:w-[420px] md:w-[480px] max-w-[calc(100vw-24px)] text-[var(--color-ink)]',
        className
      )}
      initial={{ opacity: 0, y: -6, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6, scale: 0.98 }}
      transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
      role="listbox"
      aria-label="Search results"
    >
      {isLoading ? (
        <div className="p-6 space-y-3" role="status" aria-live="polite">
          <div className="flex items-center gap-2 text-xs font-medium text-[var(--color-gold)]">
            <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Searching Angelika Atelier...
          </div>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-2 animate-pulse">
              <div className="w-12 h-12 rounded-lg bg-[var(--color-whisper)] shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 bg-[var(--color-whisper)] rounded w-3/4" />
                <div className="h-2.5 bg-[var(--color-whisper)] rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : hasMatches ? (
        // State 1: Matching products found
        <>
          <div className="px-4 py-3 bg-[var(--color-snow)] border-b border-[var(--color-whisper)] flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-gold)]">
              Results for &ldquo;{query}&rdquo;
            </p>
            <span className="text-[11px] font-medium text-[var(--color-mist)] bg-white px-2 py-0.5 rounded-full border border-[var(--color-whisper)]">
              {displayedResults.length} {displayedResults.length === 1 ? 'product' : 'products'}
            </span>
          </div>

          <div className="max-h-[380px] overflow-y-auto divide-y divide-[var(--color-whisper)]/60" role="list">
            {displayedResults.map((result, index) => {
              const isSelected = selectedIndex === index;
              return (
                <button
                  key={result.id}
                  type="button"
                  onClick={() => handleSelect(result)}
                  className={cn(
                    'w-full p-3.5 flex items-center gap-3 text-left transition-colors group',
                    isSelected ? 'bg-[var(--color-gold-light)]/40 ring-1 ring-[var(--color-gold)] ring-inset' : 'hover:bg-amber-50/50'
                  )}
                >
                  <div className="relative w-12 h-14 shrink-0 rounded-lg overflow-hidden bg-[var(--color-whisper)] border border-[var(--color-whisper)]">
                    <img
                      src={result.image || '/images/collection-kurtis.jpg'}
                      alt={result.title}
                      className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                      {result.category && (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-gold)]">
                          {result.category}
                        </span>
                      )}
                      {result.color && (
                        <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-stone-100 text-stone-700 border border-stone-200">
                          {result.color}
                        </span>
                      )}
                      {result.isVidhyasPick && (
                        <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                          Vidhya&apos;s Pick
                        </span>
                      )}
                    </div>
                    <p className="font-medium text-sm text-[var(--color-ink)] truncate leading-snug">
                      {result.title}
                    </p>
                    {result.subtitle && (
                      <p className="text-xs text-[var(--color-slate)] truncate mt-0.5">
                        {result.subtitle}
                      </p>
                    )}
                    {typeof result.price === 'number' && (
                      <div className="mt-1 flex items-baseline gap-2">
                        <span className="font-bold text-sm text-[var(--color-ink)]">
                          ₹{result.price.toLocaleString()}
                        </span>
                        {result.originalPrice && result.originalPrice > result.price && (
                          <span className="text-xs text-[var(--color-mist)] line-through">
                            ₹{result.originalPrice.toLocaleString()}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <svg className="h-4 w-4 text-[var(--color-mist)] group-hover:text-[var(--color-gold)] group-hover:translate-x-0.5 transition-all shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </button>
              );
            })}
          </div>

          <div className="p-3 bg-[var(--color-snow)] border-t border-[var(--color-whisper)]">
            <button
              type="button"
              onClick={handleViewAll}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[var(--color-gold)] to-[var(--color-gold-hover)] text-[var(--color-ink)] font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:shadow-md transition-all cursor-pointer"
            >
              View all results for &ldquo;{query}&rdquo;
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </>
      ) : (
        // State 2: No products found -> Show specific message + Explore Vidhya's Picks
        <>
          <div className="p-5 text-center bg-gradient-to-b from-amber-50/70 via-white to-white border-b border-[var(--color-whisper)]">
            <div className="w-12 h-12 mx-auto mb-2.5 rounded-full bg-[var(--color-gold-light)] flex items-center justify-center text-[var(--color-gold)] shadow-sm">
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
                <line x1="8" y1="11" x2="14" y2="11" />
              </svg>
            </div>
            <h4 className="font-display text-base sm:text-lg font-semibold text-[var(--color-ink)] mb-1">
              the product you&apos;re searching for is not present
            </h4>
            <p className="text-xs text-[var(--color-slate)] max-w-sm mx-auto leading-relaxed">
              We couldn&apos;t find any items matching &ldquo;{query}&rdquo;. But explore Vidhya&apos;s curated picks below:
            </p>
          </div>

          <div className="px-4 py-2.5 bg-[var(--color-snow)] border-b border-[var(--color-whisper)] flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-amber-500 text-sm">✨</span>
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-ink)]">
                Explore Vidhya&apos;s Picks
              </span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[var(--color-gold-light)] text-[var(--color-gold-hover)] border border-[var(--color-gold)]/30">
              Curated by Vidhya
            </span>
          </div>

          <div className="max-h-[320px] overflow-y-auto divide-y divide-[var(--color-whisper)]/60" role="list">
            {VIDHYAS_PICKS_LIST.map((pick, index) => {
              const isSelected = selectedIndex === index;
              return (
                <button
                  key={pick.id}
                  type="button"
                  onClick={() => handleSelect(pick)}
                  className={cn(
                    'w-full p-3.5 flex items-center gap-3 text-left transition-colors group',
                    isSelected ? 'bg-[var(--color-gold-light)]/40 ring-1 ring-[var(--color-gold)] ring-inset' : 'hover:bg-amber-50/50'
                  )}
                >
                  <div className="relative w-12 h-14 shrink-0 rounded-lg overflow-hidden bg-[var(--color-whisper)] border border-[var(--color-whisper)]">
                    <img
                      src={pick.image || '/images/collection-kurtis.jpg'}
                      alt={pick.title}
                      className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                      {pick.category && (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-gold)]">
                          {pick.category}
                        </span>
                      )}
                      {pick.color && (
                        <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-stone-100 text-stone-700 border border-stone-200">
                          {pick.color}
                        </span>
                      )}
                      <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                        Vidhya&apos;s Choice
                      </span>
                    </div>
                    <p className="font-medium text-sm text-[var(--color-ink)] truncate leading-snug">
                      {pick.title}
                    </p>
                    {pick.subtitle && (
                      <p className="text-xs text-[var(--color-slate)] truncate mt-0.5">
                        {pick.subtitle}
                      </p>
                    )}
                    {typeof pick.price === 'number' && (
                      <div className="mt-1 flex items-baseline gap-2">
                        <span className="font-bold text-sm text-[var(--color-ink)]">
                          ₹{pick.price.toLocaleString()}
                        </span>
                        {pick.originalPrice && pick.originalPrice > pick.price && (
                          <span className="text-xs text-[var(--color-mist)] line-through">
                            ₹{pick.originalPrice.toLocaleString()}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <svg className="h-4 w-4 text-[var(--color-mist)] group-hover:text-[var(--color-gold)] group-hover:translate-x-0.5 transition-all shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </button>
              );
            })}
          </div>

          <div className="p-3 bg-[var(--color-snow)] border-t border-[var(--color-whisper)]">
            <Link
              href="/vidhyas-picks"
              onClick={onClose}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[var(--color-gold)] to-[var(--color-gold-hover)] text-[var(--color-ink)] font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:shadow-md transition-all text-center"
            >
              Explore All Vidhya&apos;s Picks
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </>
      )}
    </motion.div>
  );
}

export interface QuickSearchProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  className?: string;
}

export function QuickSearch({
  placeholder = 'Search products by type or color...',
  onSearch,
  className = '',
}: QuickSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setShowResults(false);
      if (onSearch) {
        onSearch(query.trim());
      } else {
        router.push(`/vidhyas-picks?search=${encodeURIComponent(query.trim())}`);
      }
    }
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
          onChange={(e) => {
            setQuery(e.target.value);
            setShowResults(e.target.value.trim().length > 0);
          }}
          onFocus={() => {
            if (query.trim().length > 0) setShowResults(true);
          }}
          className="w-full h-10 pl-10 pr-10 py-2 text-sm bg-[var(--color-white)] border border-[var(--color-whisper)] rounded-[var(--radius-md)] focus:border-[var(--color-gold)] focus:outline-none focus:ring-3 focus:ring-[var(--color-gold)]/20 transition-all duration-200 placeholder:text-[var(--color-mist)] [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden"
          aria-label="Search products"
          autoComplete="off"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setShowResults(false);
              inputRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-[var(--color-mist)] hover:text-[var(--color-ink)] hover:bg-[var(--color-whisper)] transition-colors"
            aria-label="Clear search"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        )}
      </form>
      {showResults && query.trim().length > 0 && (
        <SearchDropdown
          query={query}
          onClose={() => setShowResults(false)}
          onSearch={onSearch}
        />
      )}
    </div>
  );
}
