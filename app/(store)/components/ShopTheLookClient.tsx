'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { ShopTheLook, type LookWithHotspots } from '@/components/composite/ShopTheLook';

function normalizeLookInput(config: any): LookWithHotspots | null {
  if (!config) return null;
  const imageUrl = config.lifestyle_image_url || config.cover_image;
  if (!imageUrl) return null;

  // Real DB LookData or LookWithHotspots shape (supports 0 or more hotspots)
  if (Array.isArray(config.look_hotspots)) {
    return {
      id: config.id || 'db-look',
      name: config.name || config.title || 'Curated Ensemble',
      lifestyle_image_url: imageUrl,
      lifestyle_image_alt: config.lifestyle_image_alt || config.description || config.name || config.title || 'Featured Ensemble',
      subtitle: config.subtitle || config.description || null,
      look_hotspots: config.look_hotspots
        .map((hs: any, idx: number) => {
          const prod = hs.products;
          if (!prod) return null;
          const activeVariants = (prod.product_variants || prod.variants || []).filter(
            (v: any) => v.is_active !== false
          );
          const cheapest = [...activeVariants].sort(
            (a: any, b: any) => Number(a.price) - Number(b.price)
          )[0];
          const rawImages = Array.isArray(prod.product_images)
            ? prod.product_images.map((i: any) => i.url)
            : Array.isArray(prod.images)
              ? prod.images.map((i: any) => (typeof i === 'string' ? i : i.url))
              : [];

          return {
            id: hs.id || `hs-${idx}`,
            x_percent: Number(hs.x_percent ?? 50),
            y_percent: Number(hs.y_percent ?? 50),
            display_order: Number(hs.display_order ?? idx),
            products: {
              id: prod.id,
              slug: prod.slug,
              name: prod.name,
              price: Number(cheapest?.price ?? prod.price ?? 0),
              compare_at_price:
                cheapest?.compare_at_price ?? prod.compare_at_price ?? null,
              images: rawImages.length > 0 ? rawImages : ['/images/placeholder.jpg'],
              thumbnail_url: prod.thumbnail_url || rawImages[0] || '/images/placeholder.jpg',
              default_variant_id: cheapest?.id || prod.default_variant_id || prod.id,
              variants: activeVariants.map((v: any) => ({
                id: v.id,
                size: v.size,
                price: Number(v.price),
              })),
            },
          };
        })
        .filter(Boolean),
    };
  }

  // LookData `{ cover_image, products }` shape
  if (Array.isArray(config.products)) {
    return {
      id: config.id || 'db-look',
      name: config.title || config.name || 'Curated Ensemble',
      lifestyle_image_url: imageUrl,
      lifestyle_image_alt: config.description || config.title || 'Featured Ensemble',
      look_hotspots: config.products.map((prod: any, idx: number) => ({
        id: `hs-${config.id || 'look'}-${idx}`,
        x_percent: Number(prod.x_position ?? 50),
        y_percent: Number(prod.y_position ?? 50),
        display_order: idx,
        products: {
          id: prod.id,
          slug: prod.slug,
          name: prod.name,
          price: Number(prod.price ?? 0),
          compare_at_price: prod.compare_at_price ?? null,
          images: [prod.image || '/images/placeholder.jpg'],
          thumbnail_url: prod.image || '/images/placeholder.jpg',
          default_variant_id: prod.id,
          variants: [],
        },
      })),
    };
  }

  // CMS site-content fallback look (displays curated look; links cleanly to product page)
  const parsedPrice = Number(String(config.productPrice || 0).replace(/[^0-9.]/g, ''));
  const cleanTitle = (config.title || 'Festive Elegance')
    .replace(/elegancesss/gi, 'Elegance')
    .replace(/sss$/gi, '')
    .trim();
  const cleanSubtitle = (config.subtitle || 'Click pins on image to explore')
    .replace(/sss$/gi, '')
    .trim();
  const prodName = config.productName || 'Mirror Work Lehenga';

  return {
    id: 'site-look-1',
    name: cleanTitle,
    lifestyle_image_url: imageUrl,
    lifestyle_image_alt: config.badge || config.lifestyle_image_alt || cleanTitle || 'Featured Ensemble',
    subtitle: cleanSubtitle,
    look_hotspots: [
      {
        id: 'hotspot-1',
        x_percent: Number(config.pinX ?? 47),
        y_percent: Number(config.pinY ?? 64),
        display_order: 1,
        products: {
          id: config.productSlug || 'featured-look',
          slug: config.productSlug || 'mirror-work-lehenga',
          name: prodName,
          price: parsedPrice,
          compare_at_price: config.productOriginalPrice
            ? Number(String(config.productOriginalPrice).replace(/[^0-9.]/g, ''))
            : null,
          images: [config.productImage || '/images/products/lehenga-mirror-1.jpg'],
          thumbnail_url: config.productImage || '/images/products/lehenga-mirror-1.jpg',
          default_variant_id: config.variantId || undefined,
          variants: config.variantId
            ? [{ id: config.variantId, price: parsedPrice }]
            : [],
        },
      },
    ],
  };
}

export function ShopTheLookClient({
  initialLook,
  initialLooks,
  onActiveLookChange,
}: {
  initialLook?: any;
  initialLooks?: any[];
  onActiveLookChange?: (lookName: string) => void;
}) {
  const normalizedList: LookWithHotspots[] = (
    Array.isArray(initialLooks) && initialLooks.length > 0
      ? initialLooks
      : initialLook
        ? [initialLook]
        : []
  )
    .map(normalizeLookInput)
    .filter((item): item is LookWithHotspots => item !== null);

  const [looksList, setLooksList] = useState<LookWithHotspots[]>(normalizedList);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(normalizedList.length === 0);

  useEffect(() => {
    if (normalizedList.length > 0) {
      setLooksList(normalizedList);
      setActiveIndex((prev) => (prev < normalizedList.length ? prev : 0));
      setLoading(false);
      return;
    }

    let cancelled = false;
    async function fetchLook() {
      try {
        const res = await fetch('/api/looks/active');
        if (res.ok && !cancelled) {
          const data = await res.json();
          if (data?.lifestyle_image_url) {
            setLooksList([data]);
          }
        }
      } catch (error) {
        console.error('Failed to fetch active look:', error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchLook();
    return () => {
      cancelled = true;
    };
  }, [initialLook, initialLooks]);

  const activeLook = looksList[activeIndex] || looksList[0] || null;

  useEffect(() => {
    if (activeLook?.name) {
      onActiveLookChange?.(activeLook.name);
    }
  }, [activeLook?.name, onActiveLookChange]);

  const handlePrevLook = () => {
    setActiveIndex((prev) => (prev - 1 + looksList.length) % looksList.length);
  };

  const handleNextLook = () => {
    setActiveIndex((prev) => (prev + 1) % looksList.length);
  };

  if (loading) {
    return (
      <div className="py-8 max-w-[1440px] mx-auto">
        <div className="animate-pulse bg-[#E8DCCA] rounded-2xl h-[560px] w-full" />
      </div>
    );
  }

  if (!activeLook) {
    return (
      <div className="py-12 text-center border-[1.5px] border-dashed border-[#C9B38C] rounded-2xl bg-[#FFFDF9]">
        <p className="text-sm font-medium text-[#4A4238]">No active Shop the Look curation at this moment.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Architectural Numbered Lookbook Switcher with Mini Portrait Previews */}
      {looksList.length > 1 && (
        <div
          role="tablist"
          aria-label="Curated Couture Looks"
          className="flex items-stretch justify-start sm:justify-center gap-3 overflow-x-auto pb-1 no-scrollbar"
        >
          {looksList.map((item, idx) => {
            const isSelected = idx === activeIndex;
            const num = String(idx + 1).padStart(2, '0');
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => setActiveIndex(idx)}
                className={`group shrink-0 flex items-center gap-3 pl-2 pr-4 py-2 rounded-xl border-[1.5px] transition-all duration-200 cursor-pointer text-left ${
                  isSelected
                    ? 'bg-[#161310] text-[#FAF6F0] border-[#161310] shadow-[0_10px_24px_rgba(22,19,16,0.18)]'
                    : 'bg-[#FFFDF9] text-[#2F2A24] border-[#C9B38C] hover:border-[#8C6A16] hover:bg-[#FAF4E8]'
                }`}
              >
                <div className="relative h-11 w-9 rounded-lg overflow-hidden shrink-0 border border-[#D8B454]/40 bg-[#24201B]">
                  <Image
                    src={item.lifestyle_image_url}
                    alt=""
                    fill
                    unoptimized
                    className="object-cover object-top"
                    sizes="36px"
                  />
                </div>
                <div className="min-w-0">
                  <span
                    className={`block text-[10px] font-bold uppercase tracking-[0.2em] ${
                      isSelected ? 'text-[#E5C56B]' : 'text-[#7A5B10]'
                    }`}
                  >
                    Look {num}
                  </span>
                  <span
                    className={`block font-display text-base font-bold leading-tight whitespace-nowrap ${
                      isSelected ? 'text-[#FAF6F0]' : 'text-[#11100E]'
                    }`}
                  >
                    {item.name}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      <ShopTheLook
        key={activeLook.id}
        look={activeLook}
        lookIndex={activeIndex}
        totalLooks={looksList.length}
        onPrevLook={handlePrevLook}
        onNextLook={handleNextLook}
      />
    </div>
  );
}
