'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/lib/hooks/useCart';
import { toast } from '@/components/ui/Toast';

export interface LookProduct {
  id: string;
  slug: string;
  name: string;
  price: number;
  compare_at_price?: number | null;
  images: string[];
  thumbnail_url?: string | null;
  default_variant_id?: string;
  variants?: Array<{ id: string; size?: string; price: number }>;
}

interface ProductCardPopupProps {
  product: LookProduct;
  hotspot?: { x_percent: number; y_percent: number };
  onClose: () => void;
  isOpen?: boolean;
}

export function ProductCardPopup({
  product,
  hotspot = { x_percent: 50, y_percent: 50 },
  onClose,
  isOpen = true,
}: ProductCardPopupProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const { addItem } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string>(() => {
    return product.variants?.[0]?.size || 'Free Size';
  });

  const imageUrl = product.thumbnail_url || product.images?.[0] || '/images/collection-kurtis.jpg';

  // Handle escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Handle click outside to dismiss
  useEffect(() => {
    if (!isOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (cardRef.current && !cardRef.current.contains(e.target as Node)) {
        const target = e.target as HTMLElement;
        // Don't close if clicking another pin or quick shop button
        if (!target.closest('button[aria-label]') && !target.closest('.hotspot-trigger')) {
          onClose();
        }
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  const handleAddToBag = async () => {
    setIsAdding(true);
    try {
      const selectedVariant = product.variants?.find((v) => v.size === selectedSize);
      const targetId = selectedVariant?.id || product.default_variant_id || product.id;
      await addItem(targetId, 1, selectedSize, {
        product_id: product.id,
        product_name: product.name,
        price: product.price,
        image: imageUrl,
        size: selectedSize,
      });
      window.dispatchEvent(new CustomEvent('cart:peek'));
      toast.success(`${product.name} added to bag!`);
      onClose();
    } catch (err) {
      console.error('Failed to add to bag:', err);
      toast.error('Unable to add item to bag. Please try again.');
    } finally {
      setIsAdding(false);
    }
  };

  const hasDiscount = product.compare_at_price && product.compare_at_price > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.compare_at_price! - product.price) / product.compare_at_price!) * 100)
    : 0;

  // Determine smart placement relative to the pin dot on desktop
  const isRightSide = hotspot.x_percent > 55;
  const clampedY = Math.max(8, Math.min(62, hotspot.y_percent - 12));

  if (!isOpen) return null;

  return (
    <>
      {/* =========================================================================
          DESKTOP FLOATING DETAIL CARD (Right beside the hotspot pin on the photo)
         ========================================================================= */}
      <motion.div
        ref={cardRef}
        initial={{ opacity: 0, scale: 0.92, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 8 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        style={{
          left: isRightSide ? undefined : `calc(${hotspot.x_percent}% + 18px)`,
          right: isRightSide ? `calc(${100 - hotspot.x_percent}% + 18px)` : undefined,
          top: `${clampedY}%`,
        }}
        className="hidden sm:block absolute z-30 w-[310px] bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.25)] border border-[var(--color-whisper)] p-4 text-left"
        role="dialog"
        aria-label={`${product.name} look details`}
      >
        {/* Pointer Arrow pointing to the pin */}
        <div
          className={`absolute top-6 w-3.5 h-3.5 bg-white border-[var(--color-whisper)] rotate-45 pointer-events-none shadow-xs ${
            isRightSide
              ? '-right-2 border-r border-t'
              : '-left-2 border-l border-b'
          }`}
        />

        {/* Header: Eyebrow + Close */}
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-[var(--color-whisper)]">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-gold)] flex items-center gap-1">
            <span>✦</span>
            <span>Featured Piece</span>
          </span>
          <button
            onClick={onClose}
            className="w-5 h-5 rounded-full flex items-center justify-center text-[var(--color-mist)] hover:text-[var(--color-ink)] hover:bg-[var(--color-whisper)] transition-colors cursor-pointer"
            aria-label="Close"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Product Row: Thumbnail + Info */}
        <div className="flex items-start gap-3">
          <div className="relative w-16 h-20 rounded-xl overflow-hidden bg-[var(--color-whisper)] flex-shrink-0 border border-[var(--color-whisper)] shadow-xs">
            <Image
              src={imageUrl}
              alt={product.name}
              fill
              className="object-cover"
              sizes="64px"
            />
            {hasDiscount && (
              <span className="absolute top-1 left-1 px-1.5 py-0.5 text-[9px] font-bold uppercase bg-[var(--color-error)] text-white rounded">
                -{discountPercent}%
              </span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="font-display text-sm font-semibold text-[var(--color-ink)] leading-snug truncate">
              {product.name}
            </h4>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="font-bold text-base text-[var(--color-ink)]">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
              {hasDiscount && (
                <span className="text-xs text-[var(--color-mist)] line-through">
                  ₹{product.compare_at_price!.toLocaleString('en-IN')}
                </span>
              )}
            </div>

            {/* Quick Size Pills */}
            {product.variants && product.variants.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {product.variants.map((v) => {
                  const sizeLabel = v.size || 'Free Size';
                  const isSelected = selectedSize === sizeLabel;
                  return (
                    <button
                      key={v.id || sizeLabel}
                      type="button"
                      onClick={() => setSelectedSize(sizeLabel)}
                      className={`px-2 py-0.5 text-[10px] font-semibold rounded border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[var(--color-gold)] bg-[var(--color-gold-light)] text-[var(--color-ink)]'
                          : 'border-[var(--color-whisper)] text-[var(--color-slate)] hover:border-[var(--color-gold)]/40 bg-[var(--color-snow)]/60'
                      }`}
                    >
                      {sizeLabel}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-3 pt-2.5 border-t border-[var(--color-whisper)] flex items-center gap-2">
          <button
            type="button"
            onClick={handleAddToBag}
            disabled={isAdding}
            className="flex-1 py-2 px-3 text-xs font-semibold uppercase tracking-wider bg-[var(--color-gold)] text-[var(--color-ink)] rounded-xl hover:bg-[var(--color-gold-hover)] shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <path d="M3 6h18" />
              <path d="M16 10a4 4 0 0 1 0 8" />
            </svg>
            <span>{isAdding ? 'Adding...' : 'Add to Bag'}</span>
          </button>
          <Link
            href={product.slug ? `/product/${product.slug}` : '/shop'}
            onClick={onClose}
            className="py-2 px-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-slate)] hover:text-[var(--color-ink)] border border-[var(--color-whisper)] rounded-xl hover:bg-[var(--color-snow)] transition-colors"
          >
            Details &rarr;
          </Link>
        </div>
      </motion.div>

      {/* =========================================================================
          MOBILE FLOATING DETAIL BANNER (Docked at the bottom of the photo)
         ========================================================================= */}
      <motion.div
        ref={cardRef}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 16 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="sm:hidden absolute bottom-3 inset-x-3 z-30 bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-[var(--color-whisper)] p-3.5 text-left"
        role="dialog"
        aria-label={`${product.name} look details`}
      >
        <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-[var(--color-whisper)]">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-gold)] flex items-center gap-1">
            <span>✦</span>
            <span>Featured Piece</span>
          </span>
          <button
            onClick={onClose}
            className="w-5 h-5 rounded-full flex items-center justify-center text-[var(--color-mist)] hover:text-[var(--color-ink)] cursor-pointer"
            aria-label="Close"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-14 h-16 rounded-xl overflow-hidden bg-[var(--color-whisper)] flex-shrink-0 border border-[var(--color-whisper)]">
            <Image
              src={imageUrl}
              alt={product.name}
              fill
              className="object-cover"
              sizes="56px"
            />
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="font-display text-sm font-semibold text-[var(--color-ink)] truncate">
              {product.name}
            </h4>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="font-bold text-sm text-[var(--color-ink)]">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
              {hasDiscount && (
                <span className="text-[10px] text-[var(--color-mist)] line-through">
                  ₹{product.compare_at_price!.toLocaleString('en-IN')}
                </span>
              )}
            </div>
            {/* Quick Size Pills */}
            {product.variants && product.variants.length > 0 && (
              <div className="mt-1 flex flex-wrap gap-1">
                {product.variants.map((v) => {
                  const sizeLabel = v.size || 'Free Size';
                  const isSelected = selectedSize === sizeLabel;
                  return (
                    <button
                      key={v.id || sizeLabel}
                      type="button"
                      onClick={() => setSelectedSize(sizeLabel)}
                      className={`px-1.5 py-0.5 text-[9px] font-semibold rounded border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[var(--color-gold)] bg-[var(--color-gold-light)] text-[var(--color-ink)]'
                          : 'border-[var(--color-whisper)] text-[var(--color-slate)] bg-[var(--color-snow)]/60'
                      }`}
                    >
                      {sizeLabel}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="mt-2.5 pt-2 border-t border-[var(--color-whisper)] flex items-center gap-2">
          <button
            type="button"
            onClick={handleAddToBag}
            disabled={isAdding}
            className="flex-1 py-1.5 px-3 text-xs font-semibold uppercase tracking-wider bg-[var(--color-gold)] text-[var(--color-ink)] rounded-xl hover:bg-[var(--color-gold-hover)] transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <span>{isAdding ? 'Adding...' : 'Add to Bag'}</span>
          </button>
          <Link
            href={product.slug ? `/product/${product.slug}` : '/shop'}
            onClick={onClose}
            className="py-1.5 px-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-slate)] border border-[var(--color-whisper)] rounded-xl hover:bg-[var(--color-snow)] transition-colors"
          >
            Details &rarr;
          </Link>
        </div>
      </motion.div>
    </>
  );
}

