'use client';

import { useState, useCallback, useMemo, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { HotspotPin } from './HotspotPin';
import type { LookProduct } from './ProductCardPopup';
import { useCart } from '@/lib/hooks/useCart';
import { toast } from '@/components/ui/Toast';

export interface LookWithHotspots {
  id: string;
  name: string;
  lifestyle_image_url: string;
  lifestyle_image_alt?: string | null;
  subtitle?: string | null;
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
  lookIndex?: number;
  totalLooks?: number;
  onPrevLook?: () => void;
  onNextLook?: () => void;
}

export function ShopTheLook({
  look,
  className = '',
  lookIndex = 0,
  totalLooks = 1,
  onPrevLook,
  onNextLook,
}: ShopTheLookProps) {
  const { addItem } = useCart();
  const [activeHotspotId, setActiveHotspotId] = useState<string | null>(
    () => look.look_hotspots.find((h) => h.products !== null)?.id ?? null
  );
  const [hoveredHotspotId, setHoveredHotspotId] = useState<string | null>(null);
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});
  const [addingId, setAddingId] = useState<string | null>(null);
  const [addingEnsemble, setAddingEnsemble] = useState(false);

  // Interactive Couture Fabric Zoom Loupe state
  const [loupeEnabled, setLoupeEnabled] = useState(false);
  const [loupePos, setLoupePos] = useState<{ x: number; y: number; visible: boolean }>({
    x: 50,
    y: 50,
    visible: false,
  });
  const photoStageRef = useRef<HTMLDivElement>(null);

  const validHotspots = useMemo(
    () => look.look_hotspots.filter((h) => h.products !== null),
    [look.look_hotspots]
  );

  const handlePinClick = useCallback((hotspotId: string) => {
    setActiveHotspotId(hotspotId);
  }, []);

  const ensembleTotal = useMemo(
    () => validHotspots.reduce((sum, hs) => sum + Number(hs.products?.price || 0), 0),
    [validHotspots]
  );

  const getSelectedSize = (hotspotId: string, prod: LookProduct) => {
    return selectedSizes[hotspotId] || prod.variants?.[0]?.size || 'Free Size';
  };

  const handleAddPieceToBag = async (hotspotId: string, prod: LookProduct) => {
    if (addingId) return;
    setAddingId(hotspotId);
    try {
      const size = getSelectedSize(hotspotId, prod);
      const matchingVariant = prod.variants?.find((v) => v.size === size);
      const targetId = matchingVariant?.id || prod.default_variant_id || prod.id;
      const img = prod.thumbnail_url || prod.images?.[0] || '/images/collection-kurtis.jpg';
      await addItem(targetId, 1, size, {
        product_id: prod.id,
        product_name: prod.name,
        price: prod.price,
        image: img,
        size,
      });
      window.dispatchEvent(new CustomEvent('cart:peek'));
      toast.success(`${prod.name} added to bag`);
    } catch (err) {
      console.error('Failed to add look piece to bag:', err);
      toast.error('Unable to add piece to bag. Please try again.');
    } finally {
      setAddingId(null);
    }
  };

  const handleAddCompleteLook = async () => {
    if (addingEnsemble || validHotspots.length === 0) return;
    setAddingEnsemble(true);
    try {
      for (const hs of validHotspots) {
        const prod = hs.products;
        if (!prod) continue;
        const size = getSelectedSize(hs.id, prod);
        const matchingVariant = prod.variants?.find((v) => v.size === size);
        const targetId = matchingVariant?.id || prod.default_variant_id || prod.id;
        const img = prod.thumbnail_url || prod.images?.[0] || '/images/collection-kurtis.jpg';
        await addItem(targetId, 1, size, {
          product_id: prod.id,
          product_name: prod.name,
          price: prod.price,
          image: img,
          size,
        });
      }
      window.dispatchEvent(new CustomEvent('cart:peek'));
      toast.success(`Complete "${look.name}" ensemble added to bag`);
    } catch (err) {
      console.error('Failed to add complete look:', err);
      toast.error('Could not add all pieces. Please try individually.');
    } finally {
      setAddingEnsemble(false);
    }
  };

  const handleStageMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!loupeEnabled || !photoStageRef.current) return;
    const rect = photoStageRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    setLoupePos({ x, y, visible: true });
  };

  if (!look.lifestyle_image_url) return null;

  const lookCounter = `${String(lookIndex + 1).padStart(2, '0')} / ${String(Math.max(totalLooks, 1)).padStart(2, '0')}`;
  const cleanCaption =
    look.lifestyle_image_alt &&
    look.lifestyle_image_alt.trim().toLowerCase() !== look.name.trim().toLowerCase() &&
    look.lifestyle_image_alt.trim().toLowerCase() !== 'curated ensemble'
      ? look.lifestyle_image_alt.trim()
      : look.subtitle?.trim() || 'Hand-curated Indian couture styled by Vidhya — hover any garment pin or enable the fabric loupe to inspect the drape.';

  return (
    <motion.div
      key={look.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={`h-full grid grid-cols-1 xl:grid-cols-12 overflow-hidden rounded-2xl border-[1.5px] border-[#C5B18C] bg-[#FFFDF9] shadow-[0_22px_54px_rgba(24,18,10,0.09)] ${className}`}
    >
      {/* LEFT STAGE: Precision Uncropped Natural-Aspect Portrait Canvas (Zero Pin Drift!) */}
      <div className="xl:col-span-6 relative flex flex-col items-center justify-center bg-[#EFE6D6] p-4 sm:p-6 border-b xl:border-b-0 xl:border-r border-[#D6C4A3]">
        {/* Subtle top-bar controls over the warm silk studio mat */}
        <div className="w-full flex items-center justify-between gap-2 mb-3.5">
          <div className="inline-flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#9E7820]" aria-hidden="true" />
            <span className="text-[10.5px] font-bold uppercase tracking-[0.22em] text-[#5C4308]">
              Runway Look {lookCounter}
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              setLoupeEnabled((prev) => !prev);
              setLoupePos((prev) => ({ ...prev, visible: false }));
            }}
            aria-pressed={loupeEnabled}
            className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10.5px] font-bold uppercase tracking-[0.15em] border transition-colors cursor-pointer ${
              loupeEnabled
                ? 'bg-[#171310] text-[#F2D991] border-[#171310] shadow-xs'
                : 'bg-[#FFFDF9] text-[#4E3808] border-[#C5B18C] hover:border-[#8C6A16]'
            }`}
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4.35-4.35M11 8v6M8 11h6" />
            </svg>
            <span>{loupeEnabled ? 'Weave Loupe Active' : 'Inspect Fabric'}</span>
          </button>
        </div>

        {/* Exact Natural-Aspect Photo Frame — (x%, y%) pins ALWAYS lock 1:1 to exact fabric pixels */}
        <div
          ref={photoStageRef}
          onMouseMove={handleStageMouseMove}
          onMouseLeave={() => setLoupePos((prev) => ({ ...prev, visible: false }))}
          className={`relative inline-block max-w-full rounded-xl overflow-hidden border-[1.5px] border-[#C5B18C] bg-[#1A1612] shadow-[0_16px_38px_rgba(24,18,10,0.16)] ${
            loupeEnabled ? 'cursor-zoom-in' : ''
          }`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={look.lifestyle_image_url}
            alt={look.lifestyle_image_alt || `Shop the Look: ${look.name}`}
            className="block max-h-[540px] w-auto max-w-full h-auto select-none"
          />

          {/* Interactive 2.4x Couture Fabric Magnifying Loupe */}
          {loupeEnabled && loupePos.visible && (
            <div
              aria-hidden="true"
              style={{
                left: `${loupePos.x}%`,
                top: `${loupePos.y}%`,
                backgroundImage: `url("${look.lifestyle_image_url}")`,
                backgroundPosition: `${loupePos.x}% ${loupePos.y}%`,
                backgroundSize: '240%',
              }}
              className="pointer-events-none absolute z-30 h-36 w-36 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#E6C770] shadow-[0_16px_40px_rgba(0,0,0,0.45),inset_0_0_0_2px_rgba(255,253,249,0.7)] bg-no-repeat"
            />
          )}

          {/* Precision Garment Pins (hidden cleanly while inspecting with loupe) */}
          {!loupeEnabled && (
            <div className="absolute inset-0">
              {validHotspots.map((hotspot, idx) => (
                <HotspotPin
                  key={hotspot.id}
                  index={idx}
                  xPercent={Number(hotspot.x_percent)}
                  yPercent={Number(hotspot.y_percent)}
                  onClick={() => handlePinClick(hotspot.id)}
                  isActive={activeHotspotId === hotspot.id}
                  isHighlighted={hoveredHotspotId === hotspot.id}
                  onHover={(isHovering) => setHoveredHotspotId(isHovering ? hotspot.id : null)}
                  label={hotspot.products?.name}
                  price={hotspot.products?.price}
                />
              ))}
            </div>
          )}
        </div>

        {/* Subtle instructional footer under portrait */}
        <p className="mt-3 text-[11px] font-medium text-[#5A4F42] text-center">
          {loupeEnabled
            ? 'Move cursor over the silhouette to inspect handloom weave & embroidery up close.'
            : 'Click or hover any numbered pearl marker on the garment to inspect & shop.'}
        </p>
      </div>

      {/* RIGHT STAGE: Curated Atelier Wardrobe Panel */}
      <div className="xl:col-span-6 flex flex-col justify-between bg-[#FFFDF9]">
        {/* Editorial Title Header */}
        <div className="px-6 sm:px-7 py-5 border-b border-[#E3D5BC] bg-[#FAF4E8]">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em] text-[#6B4E08]">
              <span className="h-[1.5px] w-4 bg-[#B8922E]" aria-hidden="true" />
              <span>Styled by Vidhya</span>
            </span>

            {totalLooks > 1 && onPrevLook && onNextLook && (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={onPrevLook}
                  aria-label="Previous look"
                  className="h-8 w-8 rounded-full border border-[#C5B18C] bg-[#FFFDF9] hover:bg-[#171310] hover:text-[#F2D991] hover:border-[#171310] text-[#2F2A24] flex items-center justify-center transition-colors cursor-pointer text-xs font-bold"
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={onNextLook}
                  aria-label="Next look"
                  className="h-8 w-8 rounded-full border border-[#C5B18C] bg-[#FFFDF9] hover:bg-[#171310] hover:text-[#F2D991] hover:border-[#171310] text-[#2F2A24] flex items-center justify-center transition-colors cursor-pointer text-xs font-bold"
                >
                  →
                </button>
              </div>
            )}
          </div>

          <h3 className="font-display text-2xl sm:text-[32px] font-bold text-[#14110E] leading-[1.12]">
            {look.name}
          </h3>
          <p className="mt-1.5 text-[13px] font-medium text-[#463E34] leading-relaxed">
            {cleanCaption}
          </p>
        </div>

        {/* Synchronized Styled Pieces List */}
        <div className="flex-1 divide-y divide-[#E7DAC3] overflow-y-auto max-h-[420px] px-6 sm:px-7">
          {validHotspots.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-sm font-medium text-[#4A4238]">
                Explore our signature couture collection tailored to this look.
              </p>
              <Link
                href="/shop"
                className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#171310] text-[#FAF6F0] text-xs font-bold uppercase tracking-[0.16em]"
              >
                <span>Explore Collection</span>
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          ) : (
            validHotspots.map((hotspot, idx) => {
              const prod = hotspot.products!;
              const img = prod.thumbnail_url || prod.images?.[0] || '/images/collection-kurtis.jpg';
              const isSelected = activeHotspotId === hotspot.id;
              const isHovered = hoveredHotspotId === hotspot.id;
              const pinNumber = String(idx + 1).padStart(2, '0');
              const hasDiscount = Boolean(prod.compare_at_price && prod.compare_at_price > prod.price);
              const discountPct = hasDiscount
                ? Math.round(((prod.compare_at_price! - prod.price) / prod.compare_at_price!) * 100)
                : 0;
              const chosenSize = getSelectedSize(hotspot.id, prod);

              return (
                <div
                  key={hotspot.id}
                  onMouseEnter={() => setHoveredHotspotId(hotspot.id)}
                  onMouseLeave={() => setHoveredHotspotId(null)}
                  onClick={() => setActiveHotspotId(hotspot.id)}
                  className={`py-5 transition-colors duration-200 cursor-pointer ${
                    isSelected || isHovered
                      ? 'bg-[#FAF4E8]/85 -mx-6 sm:-mx-7 px-6 sm:px-7'
                      : ''
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="relative shrink-0">
                      <Link
                        href={prod.slug ? `/product/${prod.slug}` : '/shop'}
                        onClick={(e) => e.stopPropagation()}
                        className="block relative w-[76px] h-[98px] rounded-xl overflow-hidden border-[1.5px] border-[#CEBA96] bg-[#F3ECE0]"
                      >
                        <Image
                          src={img}
                          alt={prod.name}
                          fill
                          className="object-cover object-top"
                          sizes="80px"
                        />
                      </Link>
                      <span
                        className={`absolute -top-2 -left-2 h-6 w-6 rounded-full border-2 border-[#FFFDF9] text-[10px] font-bold flex items-center justify-center shadow-xs transition-colors ${
                          isSelected || isHovered
                            ? 'bg-[#D8B454] text-[#14110E]'
                            : 'bg-[#171310] text-[#F2D991]'
                        }`}
                      >
                        {pinNumber}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <Link
                        href={prod.slug ? `/product/${prod.slug}` : '/shop'}
                        onClick={(e) => e.stopPropagation()}
                        className="font-display text-[19px] font-bold text-[#14110E] hover:text-[#6B4E08] leading-snug line-clamp-2 transition-colors"
                      >
                        {prod.name}
                      </Link>

                      <div className="mt-1 flex items-baseline gap-2 flex-wrap">
                        <span className="text-[15px] font-bold text-[#14110E] tabular-nums">
                          ₹{prod.price.toLocaleString('en-IN')}
                        </span>
                        {hasDiscount && (
                          <>
                            <span className="text-xs font-medium text-[#7A7164] line-through tabular-nums">
                              ₹{prod.compare_at_price!.toLocaleString('en-IN')}
                            </span>
                            <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#9E2A2B]/10 text-[#9E2A2B]">
                              {discountPct}% OFF
                            </span>
                          </>
                        )}
                      </div>

                      {prod.variants && prod.variants.length > 0 && (
                        <div className="mt-2.5 flex flex-wrap gap-1.5" onClick={(e) => e.stopPropagation()}>
                          {prod.variants.slice(0, 6).map((v) => {
                            const sizeLabel = v.size || 'Free Size';
                            const sizeActive = chosenSize === sizeLabel;
                            return (
                              <button
                                key={v.id || sizeLabel}
                                type="button"
                                onClick={() =>
                                  setSelectedSizes((prev) => ({ ...prev, [hotspot.id]: sizeLabel }))
                                }
                                className={`px-2.5 py-1 text-[11px] font-bold rounded-md border transition-colors cursor-pointer ${
                                  sizeActive
                                    ? 'bg-[#171310] text-[#F2D991] border-[#171310]'
                                    : 'bg-[#FFFDF9] text-[#2F2A24] border-[#C9B38C] hover:border-[#6B4E08]'
                                }`}
                              >
                                {sizeLabel}
                              </button>
                            );
                          })}
                        </div>
                      )}

                      <div className="mt-3 flex items-center gap-2 flex-wrap" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => handleAddPieceToBag(hotspot.id, prod)}
                          disabled={addingId === hotspot.id}
                          className="min-h-[38px] px-4 py-2 rounded-lg bg-[#171310] hover:bg-[#2E261E] text-[#FAF6F0] text-[11px] font-bold uppercase tracking-[0.15em] transition-colors cursor-pointer disabled:opacity-60"
                        >
                          {addingId === hotspot.id ? 'Adding...' : 'Add to Bag'}
                        </button>
                        <Link
                          href={prod.slug ? `/product/${prod.slug}` : '/shop'}
                          className="min-h-[38px] inline-flex items-center gap-1 px-3.5 py-2 rounded-lg border-[1.5px] border-[#C5B18C] bg-[#FFFDF9] hover:border-[#6B4E08] hover:bg-[#FAF4E8] text-[11px] font-bold uppercase tracking-[0.14em] text-[#3F352A] transition-colors"
                        >
                          <span>Details</span>
                          <span aria-hidden="true">→</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Ensemble Summary Footer */}
        {validHotspots.length > 0 && (
          <div className="px-6 sm:px-7 py-4 border-t border-[#E3D5BC] bg-[#F5ECDC] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[#6B4E08]">
                {validHotspots.length > 1 ? 'Complete Ensemble Total' : 'Featured Ensemble Piece'}
              </span>
              <span className="font-display text-2xl font-bold text-[#14110E] tabular-nums">
                ₹{ensembleTotal.toLocaleString('en-IN')}
              </span>
            </div>

            {validHotspots.length > 1 ? (
              <button
                type="button"
                onClick={handleAddCompleteLook}
                disabled={addingEnsemble}
                className="min-h-[44px] px-5 py-2.5 rounded-lg bg-[#D8B454] hover:bg-[#E5C56B] text-[#14110E] border border-[#9E7820] text-xs font-bold uppercase tracking-[0.16em] transition-colors cursor-pointer disabled:opacity-60 whitespace-nowrap"
              >
                {addingEnsemble ? 'Adding Ensemble...' : 'Add Full Look to Bag'}
              </button>
            ) : (
              <Link
                href="/shop"
                className="min-h-[44px] inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[#D8B454] hover:bg-[#E5C56B] text-[#14110E] border border-[#9E7820] text-xs font-bold uppercase tracking-[0.16em] transition-colors whitespace-nowrap"
              >
                <span>Explore Collection</span>
                <span aria-hidden="true">→</span>
              </Link>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
