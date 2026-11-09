'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Modal } from '@/components/ui/Modal';
import { MagneticButton } from '@/components/animations/MagneticButton';
import type { ClientProductData, ProductCardData } from '@/lib/actions/products';

export interface ProductCompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProduct: ClientProductData;
  relatedProducts?: ProductCardData[];
  onAddToBag: (item: {
    id: string;
    name: string;
    price: number;
    originalPrice?: number;
    image: string;
    size: string;
  }) => void;
}

export function ProductCompareModal({
  isOpen,
  onClose,
  currentProduct,
  relatedProducts = [],
  onAddToBag,
}: ProductCompareModalProps) {
  const [selectedComparisonIdx, setSelectedComparisonIdx] = useState(0);
  const [selectedCurrentSize, setSelectedCurrentSize] = useState<string>(
    currentProduct.sizes[0] || 'Free Size'
  );
  const [selectedCompareSize, setSelectedCompareSize] = useState<string>('Free Size');
  const [addedItemName, setAddedItemName] = useState<string | null>(null);

  const compareItem: ProductCardData | undefined = relatedProducts[selectedComparisonIdx];

  const handleAddCurrent = () => {
    onAddToBag({
      id: currentProduct.id,
      name: currentProduct.name,
      price: currentProduct.price,
      originalPrice: currentProduct.originalPrice,
      image: currentProduct.images[0] || '/images/placeholder.jpg',
      size: selectedCurrentSize,
    });
    setAddedItemName(currentProduct.name);
    setTimeout(() => setAddedItemName(null), 2500);
  };

  const handleAddCompare = () => {
    if (!compareItem) return;
    onAddToBag({
      id: compareItem.id,
      name: compareItem.name,
      price: compareItem.price,
      originalPrice: compareItem.compare_at_price ?? undefined,
      image: compareItem.images[0]?.url || '/images/placeholder.jpg',
      size: selectedCompareSize,
    });
    setAddedItemName(compareItem.name);
    setTimeout(() => setAddedItemName(null), 2500);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="full"
      className="max-w-5xl max-h-[92vh] overflow-y-auto p-4 sm:p-8 bg-[#FAF8F5] border border-[#E5DFD5]"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center max-w-xl mx-auto border-b border-[#E5DECF] pb-5">
          <span className="text-[10px] font-semibold tracking-[0.24em] uppercase text-[var(--color-gold)] block mb-1">
            ⚜ Ensemble Comparison Studio
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl text-[var(--color-ink)] font-normal tracking-tight">
            Compare Silhouettes & Fabrics
          </h2>
          <p className="mt-1 text-xs text-[var(--color-slate)] font-light leading-relaxed">
            Side-by-side examination of handcrafted textiles, sizing margins, and artisanal details.
          </p>
        </div>

        {/* Comparison Selector if multiple related products */}
        {relatedProducts.length > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-[#EAE4D9]">
            <span className="text-xs font-semibold text-[var(--color-ink)] tracking-wide">
              Compare Current Ensemble With:
            </span>
            <div className="flex flex-wrap gap-2">
              {relatedProducts.slice(0, 4).map((rel, idx) => (
                <button
                  key={rel.id}
                  type="button"
                  onClick={() => {
                    setSelectedComparisonIdx(idx);
                    setSelectedCompareSize('Free Size');
                  }}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                    selectedComparisonIdx === idx
                      ? 'bg-[var(--color-ink)] text-white shadow-xs font-semibold'
                      : 'bg-[#FAF8F5] text-[var(--color-slate)] border border-[#E5DECF] hover:text-[var(--color-ink)]'
                  }`}
                >
                  {rel.name.length > 22 ? `${rel.name.slice(0, 22)}…` : rel.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Added Notification Toast */}
        {addedItemName && (
          <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs text-center font-medium">
            ✓ Added "{addedItemName}" to your bag!
          </div>
        )}

        {/* Side-by-Side Comparison Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* COLUMN 1: CURRENT PRODUCT */}
          <div className="bg-white rounded-2xl border-2 border-[var(--color-gold)]/60 p-5 shadow-xs flex flex-col justify-between relative">
            <span className="absolute -top-3 left-4 bg-[var(--color-gold)] text-[var(--color-ink)] text-[10px] font-bold uppercase tracking-wider px-3 py-0.5 rounded-full shadow-2xs">
              Current Ensemble
            </span>

            <div className="space-y-4 pt-2">
              {/* Image & Title */}
              <div className="relative w-full aspect-[4/5] rounded-xl overflow-hidden bg-stone-100">
                <Image
                  src={currentProduct.images[0] || '/images/placeholder.jpg'}
                  alt={currentProduct.name}
                  fill
                  className="object-cover object-center"
                />
              </div>

              <div>
                <span className="text-[10px] uppercase tracking-wider font-semibold text-[var(--color-gold)]">
                  {currentProduct.category}
                </span>
                <h3 className="font-serif text-lg text-[var(--color-ink)] font-normal mt-0.5">
                  {currentProduct.name}
                </h3>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-xl font-bold text-[var(--color-ink)] tabular-nums">
                    ₹{currentProduct.price.toLocaleString()}
                  </span>
                  {currentProduct.originalPrice && (
                    <span className="text-xs text-[var(--color-mist)] line-through tabular-nums">
                      ₹{currentProduct.originalPrice.toLocaleString()}
                    </span>
                  )}
                  {currentProduct.originalPrice && (
                    <span className="text-[10px] font-bold text-[var(--color-error)] bg-red-50 px-1.5 py-0.5 rounded">
                      Save {Math.round(((currentProduct.originalPrice - currentProduct.price) / currentProduct.originalPrice) * 100)}%
                    </span>
                  )}
                </div>
              </div>

              {/* Spec Rows */}
              <div className="divide-y divide-[#F0ECE1] text-xs border-t border-[#F0ECE1] pt-2 space-y-2.5">
                <div className="pt-2 flex justify-between gap-2">
                  <span className="text-[var(--color-slate)] font-medium">Fabric & Weave</span>
                  <span className="text-[var(--color-ink)] text-right font-medium max-w-[65%]">
                    {currentProduct.fabric || 'Pure Artisanal Handloom'}
                  </span>
                </div>

                <div className="pt-2 flex justify-between gap-2">
                  <span className="text-[var(--color-slate)] font-medium">SKU / Code</span>
                  <span className="font-mono text-[var(--color-ink)]">{currentProduct.sku}</span>
                </div>

                <div className="pt-2 flex justify-between gap-2 items-center">
                  <span className="text-[var(--color-slate)] font-medium">Available Sizes</span>
                  <div className="flex flex-wrap gap-1 justify-end max-w-[65%]">
                    {currentProduct.sizes.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSelectedCurrentSize(s)}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-all cursor-pointer ${
                          selectedCurrentSize === s
                            ? 'bg-[var(--color-gold)] text-[var(--color-ink)] border-[var(--color-gold)]'
                            : 'bg-white border-[#E5DECF] text-[var(--color-slate)] hover:border-[var(--color-gold)]'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex justify-between gap-2">
                  <span className="text-[var(--color-slate)] font-medium">Return Window</span>
                  <span className="text-emerald-700 font-medium">
                    {currentProduct.returnWindowDays || 7}-Day Doorstep Pickup
                  </span>
                </div>

                <div className="pt-2 flex justify-between gap-2">
                  <span className="text-[var(--color-slate)] font-medium">Care Instructions</span>
                  <span className="text-[var(--color-ink)] text-right">
                    {currentProduct.care?.[0] || 'Dry clean recommended'}
                  </span>
                </div>

                <div className="pt-2 flex justify-between gap-2">
                  <span className="text-[var(--color-slate)] font-medium">Authenticity</span>
                  <span className="text-[var(--color-gold)] font-semibold">100% Certified Handloom</span>
                </div>
              </div>
            </div>

            {/* Action */}
            <div className="mt-6 pt-4 border-t border-[#F0ECE1]">
              <MagneticButton
                size="md"
                variant="gold"
                className="w-full text-xs font-semibold uppercase tracking-wider py-2.5 cursor-pointer"
                onClick={handleAddCurrent}
                strength={0.2}
              >
                Add Size {selectedCurrentSize} to Bag
              </MagneticButton>
            </div>
          </div>

          {/* COLUMN 2: COMPARISON PRODUCT */}
          {compareItem ? (
            <div className="bg-white rounded-2xl border border-[#E5DFD5] p-5 shadow-xs flex flex-col justify-between relative">
              <span className="absolute -top-3 left-4 bg-stone-100 text-[var(--color-slate)] text-[10px] font-bold uppercase tracking-wider px-3 py-0.5 rounded-full border border-stone-200">
                Alternative Silhouette
              </span>

              <div className="space-y-4 pt-2">
                {/* Image & Title */}
                <div className="relative w-full aspect-[4/5] rounded-xl overflow-hidden bg-stone-100">
                  <Image
                    src={compareItem.images[0]?.url || '/images/placeholder.jpg'}
                    alt={compareItem.name}
                    fill
                    className="object-cover object-center"
                  />
                </div>

                <div>
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-[var(--color-gold)]">
                    {compareItem.category?.name || currentProduct.category}
                  </span>
                  <h3 className="font-serif text-lg text-[var(--color-ink)] font-normal mt-0.5">
                    {compareItem.name}
                  </h3>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-xl font-bold text-[var(--color-ink)] tabular-nums">
                      ₹{compareItem.price.toLocaleString()}
                    </span>
                    {compareItem.compare_at_price && (
                      <span className="text-xs text-[var(--color-mist)] line-through tabular-nums">
                        ₹{compareItem.compare_at_price.toLocaleString()}
                      </span>
                    )}
                    {compareItem.discount && compareItem.discount > 0 && (
                      <span className="text-[10px] font-bold text-[var(--color-error)] bg-red-50 px-1.5 py-0.5 rounded">
                        Save {compareItem.discount}%
                      </span>
                    )}
                  </div>
                </div>

                {/* Spec Rows */}
                <div className="divide-y divide-[#F0ECE1] text-xs border-t border-[#F0ECE1] pt-2 space-y-2.5">
                  <div className="pt-2 flex justify-between gap-2">
                    <span className="text-[var(--color-slate)] font-medium">Fabric & Weave</span>
                    <span className="text-[var(--color-ink)] text-right font-medium max-w-[65%]">
                      {compareItem.category?.name} Couture Handloom
                    </span>
                  </div>

                  <div className="pt-2 flex justify-between gap-2">
                    <span className="text-[var(--color-slate)] font-medium">Rating</span>
                    <span className="text-[var(--color-ink)] font-medium">
                      ★ {compareItem.rating || 4.8} ({compareItem.review_count || 12} reviews)
                    </span>
                  </div>

                  <div className="pt-2 flex justify-between gap-2 items-center">
                    <span className="text-[var(--color-slate)] font-medium">Available Sizes</span>
                    <div className="flex flex-wrap gap-1 justify-end max-w-[65%]">
                      {['S', 'M', 'L', 'XL'].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setSelectedCompareSize(s)}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-all cursor-pointer ${
                            selectedCompareSize === s
                              ? 'bg-[var(--color-gold)] text-[var(--color-ink)] border-[var(--color-gold)]'
                              : 'bg-white border-[#E5DECF] text-[var(--color-slate)] hover:border-[var(--color-gold)]'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 flex justify-between gap-2">
                    <span className="text-[var(--color-slate)] font-medium">Return Window</span>
                    <span className="text-emerald-700 font-medium">7-Day Doorstep Pickup</span>
                  </div>

                  <div className="pt-2 flex justify-between gap-2">
                    <span className="text-[var(--color-slate)] font-medium">Care Instructions</span>
                    <span className="text-[var(--color-ink)] text-right">Dry clean recommended</span>
                  </div>

                  <div className="pt-2 flex justify-between gap-2">
                    <span className="text-[var(--color-slate)] font-medium">Authenticity</span>
                    <span className="text-[var(--color-gold)] font-semibold">100% Certified Handloom</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 pt-4 border-t border-[#F0ECE1] flex flex-col sm:flex-row gap-2">
                <MagneticButton
                  size="md"
                  variant="gold"
                  className="flex-1 text-xs font-semibold uppercase tracking-wider py-2.5 cursor-pointer"
                  onClick={handleAddCompare}
                  strength={0.2}
                >
                  Add to Bag
                </MagneticButton>
                <Link
                  href={`/product/${compareItem.slug}`}
                  onClick={onClose}
                  className="px-4 py-2.5 text-xs text-center font-semibold text-[var(--color-ink)] border border-[#E5DECF] rounded-[var(--radius-md)] hover:bg-[#FAF8F5] transition-colors"
                >
                  View Details →
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-[#E5DFD5] p-8 text-center flex flex-col items-center justify-center space-y-3">
              <span className="text-2xl">⚜</span>
              <h4 className="font-serif text-base text-[var(--color-ink)]">
                More Pairings Available
              </h4>
              <p className="text-xs text-[var(--color-slate)] max-w-xs leading-relaxed">
                Explore our complete artisanal collection to compare across sarees, lehengas, and anarkali sets.
              </p>
              <Link
                href="/shop"
                onClick={onClose}
                className="mt-2 text-xs font-semibold text-[var(--color-gold)] underline"
              >
                Browse All Collections →
              </Link>
            </div>
          )}
        </div>

        {/* Footer Note */}
        <div className="text-center pt-2 text-[11px] text-[var(--color-slate)]">
          Need bespoke drape consultation or custom blouse tailoring?{' '}
          <Link
            href="https://wa.me/919876543210?text=Hi%20Vidhya,%20I%20would%20like%20guidance%20comparing%20ensembles."
            target="_blank"
            className="text-[var(--color-gold)] hover:underline font-semibold"
          >
            Chat with Vidhya on WhatsApp ↗
          </Link>
        </div>
      </div>
    </Modal>
  );
}

