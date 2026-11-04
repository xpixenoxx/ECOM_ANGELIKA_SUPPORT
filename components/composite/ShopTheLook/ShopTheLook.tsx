'use client';

import { useState, useCallback, useMemo, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { AnimatePresence } from 'framer-motion';
import { HotspotPin } from './HotspotPin';
import { ProductCardPopup, LookProduct } from './ProductCardPopup';

interface LookWithHotspots {
  id: string;
  name: string;
  lifestyle_image_url: string;
  lifestyle_image_alt?: string | null;
  look_hotspots: Array<{
    id: string;
    x_percent: number;
    y_percent: number;
    display_order: number;
    products: LookProduct | null;
  }>;
}

interface ShopTheLookProps {
  look: LookWithHotspots;
  className?: string;
}

export function ShopTheLook({ look, className = '' }: ShopTheLookProps) {
  const [activeHotspotId, setActiveHotspotId] = useState<string | null>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  const validHotspots = useMemo(
    () => look.look_hotspots.filter((h) => h.products !== null),
    [look.look_hotspots]
  );

  const handlePinClick = useCallback((hotspotId: string) => {
    setActiveHotspotId((prev) => (prev === hotspotId ? null : hotspotId));
  }, []);

  const handleClosePopup = useCallback(() => {
    setActiveHotspotId(null);
  }, []);

  const handleQuickShopClick = useCallback((hotspotId: string) => {
    setActiveHotspotId(hotspotId);
    if (imageContainerRef.current) {
      imageContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, []);

  const activeHotspot = useMemo(
    () => validHotspots.find((h) => h.id === activeHotspotId),
    [validHotspots, activeHotspotId]
  );

  if (!look.lifestyle_image_url) return null;

  return (
    <section className={`relative w-full ${className}`} aria-labelledby="shop-the-look-heading">
      <div className="sr-only" id="shop-the-look-heading">
        Shop the Look: {look.name}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Lifestyle image with hotspots */}
        <div
          ref={imageContainerRef}
          className="relative w-full aspect-[4/3] md:aspect-[16/9] overflow-hidden rounded-2xl shadow-xl bg-[var(--color-whisper)] border border-[var(--color-whisper)]"
        >
          <Image
            src={look.lifestyle_image_url}
            alt={look.lifestyle_image_alt || `Shop the Look: ${look.name}`}
            fill
            className="object-cover w-full h-full select-none"
            priority
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 90vw, 1280px"
          />

          {/* Hotspot pins */}
          <div className="absolute inset-0">
            {validHotspots.map((hotspot) => (
              <HotspotPin
                key={hotspot.id}
                xPercent={Number(hotspot.x_percent)}
                yPercent={Number(hotspot.y_percent)}
                onClick={() => handlePinClick(hotspot.id)}
                isActive={activeHotspotId === hotspot.id}
                label={hotspot.products?.name}
              />
            ))}
          </div>

          {/* Floating on-image Product Detail Card (replacing fullscreen modal) */}
          <AnimatePresence>
            {activeHotspot && activeHotspot.products && (
              <ProductCardPopup
                key={activeHotspot.id}
                product={activeHotspot.products}
                hotspot={{
                  x_percent: Number(activeHotspot.x_percent),
                  y_percent: Number(activeHotspot.y_percent),
                }}
                onClose={handleClosePopup}
                isOpen={true}
              />
            )}
          </AnimatePresence>

          {/* Look title badge */}
          <div className="absolute top-4 left-4 z-10 pointer-events-auto">
            <div className="bg-white/95 backdrop-blur-md px-4 py-2 rounded-full shadow-lg border border-[var(--color-whisper)]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-gold)] block">
                Featured Ensemble
              </span>
              <h2 className="font-display text-base md:text-lg font-semibold text-[var(--color-ink)] leading-tight">
                {look.name}
              </h2>
            </div>
          </div>

          <div className="absolute bottom-4 right-4 z-10 pointer-events-none hidden sm:block">
            <span className="bg-black/60 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full font-medium shadow flex items-center gap-1.5">
              <span>✦</span>
              <span>Click pins on image to explore</span>
            </span>
          </div>
        </div>

        {/* Pieces in this look shelf */}
        {validHotspots.length > 0 && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg font-semibold text-[var(--color-ink)]">
                Items In This Look
              </h3>
              <span className="text-xs text-[var(--color-slate)]">
                {validHotspots.length} featured {validHotspots.length === 1 ? 'piece' : 'pieces'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {validHotspots.map((hotspot) => {
                const prod = hotspot.products!;
                const img = prod.thumbnail_url || prod.images?.[0] || '/images/collection-kurtis.jpg';
                const isSelected = activeHotspotId === hotspot.id;

                return (
                  <div
                    key={hotspot.id}
                    className={`flex items-center gap-3 p-3 bg-white rounded-xl border transition-all duration-200 ${
                      isSelected
                        ? 'border-[var(--color-gold)] shadow-md ring-1 ring-[var(--color-gold)]/40'
                        : 'border-[var(--color-whisper)] shadow-sm hover:border-[var(--color-gold)]/50'
                    }`}
                  >
                    <div className="relative w-16 h-20 rounded-lg overflow-hidden bg-[var(--color-whisper)] flex-shrink-0">
                      <Image
                        src={img}
                        alt={prod.name}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm text-[var(--color-ink)] line-clamp-1">
                        {prod.name}
                      </h4>
                      <p className="text-sm font-bold text-[var(--color-ink)] mt-0.5">
                        ₹{prod.price.toLocaleString('en-IN')}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          type="button"
                          onClick={() => handleQuickShopClick(hotspot.id)}
                          className={`text-xs font-semibold px-2.5 py-1 rounded transition-colors ${
                            isSelected
                              ? 'bg-[var(--color-ink)] text-[var(--color-gold)]'
                              : 'bg-[var(--color-gold)] text-[var(--color-ink)] hover:bg-[var(--color-gold-hover)]'
                          }`}
                        >
                          {isSelected ? 'Viewing on Look' : 'Quick Shop'}
                        </button>
                        <Link
                          href={`/product/${prod.slug}`}
                          className="text-xs text-[var(--color-slate)] hover:text-[var(--color-gold)] transition-colors"
                        >
                          Details &rarr;
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
