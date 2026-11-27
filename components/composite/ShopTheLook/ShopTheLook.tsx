'use client';

import { useState, useCallback, useMemo, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { AnimatePresence } from 'framer-motion';
import { HotspotPin } from './HotspotPin';
import { ProductCardPopup, LookProduct } from './ProductCardPopup';
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
  const [activeHotspotId, setActiveHotspotId] = useState<string | null>(null);
  const [hoveredHotspotId, setHoveredHotspotId] = useState<string | null>(null);
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});
  const [addingId, setAddingId] = useState<string | null>(null);
  const [addingEnsemble, setAddingEnsemble] = useState(false);
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

  const activeHotspot = useMemo(
    () => validHotspots.find((h) => h.id === activeHotspotId),
    [validHotspots, activeHotspotId]
  );

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

  if (!look.lifestyle_image_url) return null;

  const lookCounter = `${String(lookIndex + 1).padStart(2, '0')} / ${String(Math.max(totalLooks, 1)).padStart(2, '0')}`;
  const cleanCaption =
    look.lifestyle_image_alt &&
    look.lifestyle_image_alt.trim().toLowerCase() !== look.name.trim().toLowerCase() &&
    look.lifestyle_image_alt.trim().toLowerCase() !== 'curated ensemble'
      ? look.lifestyle_image_alt.trim()
      : look.subtitle?.trim() || 'Hand-curated Indian couture styled by Vidhya — click any numbered pin or select a piece to shop.';

  return (
    <div className={`relative w-full ${className}`}>
      <div className="max-w-[1440px] mx-auto">
        {/* Asymmetric Couture Lookbook Stage */}
        <div className="grid grid-cols-1 lg:grid-cols-12 overflow-hidden rounded-2xl border-[1.5px] border-[#C5B18C] bg-[#FFFDF9] shadow-[0_24px_60px_rgba(20,16,12,0.09)]">
          {/* LEFT STAGE: Full Portrait-Framed Editorial Photo with Numbered Pins */}
          <div className="lg:col-span-7 relative bg-[#161310] border-b lg:border-b-0 lg:border-r border-[#C9B38C]">
            <div
              ref={imageContainerRef}
              className="relative w-full aspect-[4/5] sm:aspect-[5/5.5] lg:aspect-auto lg:h-full lg:min-h-[600px] lg:max-h-[680px] overflow-hidden bg-[#161310]"
            >
              <Image
                src={look.lifestyle_image_url}
                alt={look.lifestyle_image_alt || `Shop the Look: ${look.name}`}
                fill
                unoptimized
                className="object-cover object-top w-full h-full select-none transition-transform duration-700"
                priority
                sizes="(max-width: 1024px) 100vw, 58vw"
              />

              {/* Subtle bottom scrim so pins & caption read crisply */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#120F0D]/80 via-[#120F0D]/30 to-transparent"
              />

              {/* Numbered Atelier Hotspot Pins */}
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

              {/* Floating Quick-Shop Card when a pin is clicked directly on the photo */}
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

              {/* Editorial Footer Strip inside Portrait Canvas */}
              <div className="absolute bottom-4 inset-x-4 z-10 flex items-center justify-between gap-3 pointer-events-none">
                <div className="inline-flex items-center gap-2.5 rounded-full bg-[#161310]/85 backdrop-blur-md border border-[#D8B454]/45 px-3.5 py-1.5 shadow-lg">
                  <span className="h-2 w-2 rounded-full bg-[#E5C56B]" aria-hidden="true" />
                  <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#FAF6F0]">
                    Look {lookCounter}
                  </span>
                  <span className="text-[#D8B454]/60" aria-hidden="true">·</span>
                  <span className="text-[11px] font-medium text-[#E8DFD2] hidden sm:inline">
                    Tap numbered pins to inspect
                  </span>
                </div>

                {totalLooks > 1 && onPrevLook && onNextLook && (
                  <div className="flex items-center gap-1.5 pointer-events-auto">
                    <button
                      type="button"
                      onClick={onPrevLook}
                      aria-label="Previous look"
                      className="h-9 w-9 rounded-full bg-[#161310]/85 hover:bg-[#D8B454] text-[#FAF6F0] hover:text-[#14110E] border border-[#D8B454]/55 flex items-center justify-center transition-colors cursor-pointer shadow-md"
                    >
                      <span aria-hidden="true">←</span>
                    </button>
                    <button
                      type="button"
                      onClick={onNextLook}
                      aria-label="Next look"
                      className="h-9 w-9 rounded-full bg-[#161310]/85 hover:bg-[#D8B454] text-[#FAF6F0] hover:text-[#14110E] border border-[#D8B454]/55 flex items-center justify-center transition-colors cursor-pointer shadow-md"
                    >
                      <span aria-hidden="true">→</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT STAGE: Curated "Shop This Ensemble" Atelier Panel */}
          <div className="lg:col-span-5 flex flex-col justify-between bg-[#FFFDF9]">
            {/* Panel Header */}
            <div className="px-6 sm:px-7 py-5 sm:py-6 border-b border-[#DFD0B5] bg-[#FAF4E8]">
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em] text-[#6B4E08]">
                  <span className="h-[1.5px] w-4 bg-[#B8922E]" aria-hidden="true" />
                  <span>Shop This Ensemble</span>
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#161310] text-[#E6C770] tracking-wider uppercase">
                  {validHotspots.length} {validHotspots.length === 1 ? 'Piece' : 'Pieces'}
                </span>
              </div>

              <h3 className="font-display text-2xl sm:text-[30px] font-bold text-[#11100E] leading-[1.15]">
                {look.name}
              </h3>
              <p className="mt-2 text-[13px] font-medium text-[#3D362E] leading-relaxed">
                {cleanCaption}
              </p>
            </div>

            {/* Interactive Styled Pieces List */}
            <div className="flex-1 divide-y divide-[#E5D7BF] overflow-y-auto max-h-[430px] px-6 sm:px-7">
              {validHotspots.length === 0 ? (
                <div className="py-10 text-center">
                  <p className="text-sm font-medium text-[#4A4238]">
                    Explore our signature couture collection tailored to this look.
                  </p>
                  <Link
                    href="/shop"
                    className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#161310] text-[#FAF6F0] text-xs font-bold uppercase tracking-[0.16em] hover:bg-[#2B241C] transition-colors"
                  >
                    <span>Explore Collection</span>
                    <span aria-hidden="true">→</span>
                  </Link>
                </div>
              ) : (
                validHotspots.map((hotspot, idx) => {
                  const prod = hotspot.products!;
                  const img = prod.thumbnail_url || prod.images?.[0] || '/images/collection-kurtis.jpg';
                  const isHighlighted = activeHotspotId === hotspot.id || hoveredHotspotId === hotspot.id;
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
                      className={`py-5 transition-colors duration-200 ${
                        isHighlighted ? 'bg-[#FAF4E8]/70 -mx-6 sm:-mx-7 px-6 sm:px-7' : ''
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        {/* Numbered Pin + Portrait Product Thumb */}
                        <div className="relative shrink-0">
                          <Link
                            href={prod.slug ? `/product/${prod.slug}` : '/shop'}
                            className="block relative w-[78px] h-[102px] rounded-xl overflow-hidden border-[1.5px] border-[#CEBA96] bg-[#F3ECE0] shadow-xs"
                          >
                            <Image
                              src={img}
                              alt={prod.name}
                              fill
                              className="object-cover object-top"
                              sizes="80px"
                            />
                          </Link>
                          <button
                            type="button"
                            onClick={() => handlePinClick(hotspot.id)}
                            title="Highlight on look"
                            aria-label={`Highlight piece ${pinNumber} on look`}
                            className={`absolute -top-2 -left-2 h-6 w-6 rounded-full border-2 border-[#FFFDF9] text-[10px] font-bold flex items-center justify-center shadow-sm cursor-pointer transition-colors ${
                              isHighlighted
                                ? 'bg-[#D8B454] text-[#14110E]'
                                : 'bg-[#161310] text-[#E6C770]'
                            }`}
                          >
                            {pinNumber}
                          </button>
                        </div>

                        {/* Piece Details, Size Selector & Direct Actions */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <Link
                              href={prod.slug ? `/product/${prod.slug}` : '/shop'}
                              className="font-display text-[19px] font-bold text-[#11100E] hover:text-[#6B4E08] leading-snug line-clamp-2 transition-colors"
                            >
                              {prod.name}
                            </Link>
                          </div>

                          {/* Price Row */}
                          <div className="mt-1 flex items-baseline gap-2 flex-wrap">
                            <span className="text-[15px] font-bold text-[#11100E] tabular-nums">
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

                          {/* Quick Size Pills */}
                          {prod.variants && prod.variants.length > 0 && (
                            <div className="mt-2.5 flex flex-wrap gap-1.5">
                              {prod.variants.slice(0, 6).map((v) => {
                                const sizeLabel = v.size || 'Free Size';
                                const isSelected = chosenSize === sizeLabel;
                                return (
                                  <button
                                    key={v.id || sizeLabel}
                                    type="button"
                                    onClick={() =>
                                      setSelectedSizes((prev) => ({ ...prev, [hotspot.id]: sizeLabel }))
                                    }
                                    className={`px-2.5 py-1 text-[11px] font-bold rounded-md border transition-colors cursor-pointer ${
                                      isSelected
                                        ? 'bg-[#161310] text-[#E6C770] border-[#161310]'
                                        : 'bg-[#FFFDF9] text-[#2F2A24] border-[#C9B38C] hover:border-[#6B4E08]'
                                    }`}
                                  >
                                    {sizeLabel}
                                  </button>
                                );
                              })}
                            </div>
                          )}

                          {/* Direct Bag & Details CTA Row */}
                          <div className="mt-3 flex items-center gap-2 flex-wrap">
                            <button
                              type="button"
                              onClick={() => handleAddPieceToBag(hotspot.id, prod)}
                              disabled={addingId === hotspot.id}
                              className="min-h-[38px] px-4 py-2 rounded-lg bg-[#161310] hover:bg-[#2B241C] text-[#FAF6F0] text-[11px] font-bold uppercase tracking-[0.15em] transition-colors cursor-pointer disabled:opacity-60"
                            >
                              {addingId === hotspot.id ? 'Adding...' : 'Add to Bag'}
                            </button>
                            <Link
                              href={prod.slug ? `/product/${prod.slug}` : '/shop'}
                              className="min-h-[38px] inline-flex items-center gap-1 px-3.5 py-2 rounded-lg border-[1.5px] border-[#C5B18C] bg-[#FFFDF9] hover:border-[#6B4E08] hover:bg-[#FAF4E8] text-[11px] font-bold uppercase tracking-[0.14em] text-[#3F352A] transition-colors"
                            >
                              <span>View Piece</span>
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

            {/* Bottom Ensemble Total & One-Click Shop Bar */}
            {validHotspots.length > 0 && (
              <div className="px-6 sm:px-7 py-4 border-t-[1.5px] border-[#DFD0B5] bg-[#F5ECDC] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[#6B4E08]">
                    {validHotspots.length > 1 ? 'Complete Ensemble Total' : 'Featured Ensemble Piece'}
                  </span>
                  <span className="font-display text-2xl font-bold text-[#11100E] tabular-nums">
                    ₹{ensembleTotal.toLocaleString('en-IN')}
                  </span>
                </div>

                {validHotspots.length > 1 ? (
                  <button
                    type="button"
                    onClick={handleAddCompleteLook}
                    disabled={addingEnsemble}
                    className="min-h-[44px] px-5 py-2.5 rounded-lg bg-[#D8B454] hover:bg-[#E5C56B] text-[#14110E] border border-[#9E7820] text-xs font-bold uppercase tracking-[0.16em] transition-colors cursor-pointer disabled:opacity-60 whitespace-nowrap shadow-xs"
                  >
                    {addingEnsemble ? 'Adding Ensemble...' : 'Add Full Look to Bag'}
                  </button>
                ) : (
                  <Link
                    href="/shop"
                    className="min-h-[44px] inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[#D8B454] hover:bg-[#E5C56B] text-[#14110E] border border-[#9E7820] text-xs font-bold uppercase tracking-[0.16em] transition-colors whitespace-nowrap shadow-xs"
                  >
                    <span>Explore All Looks</span>
                    <span aria-hidden="true">→</span>
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
