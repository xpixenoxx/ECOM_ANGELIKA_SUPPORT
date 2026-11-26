'use client';

import { useEffect, useState } from 'react';
import { ShopTheLook } from '@/components/composite/ShopTheLook';

interface LookWithHotspots {
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
    products: {
      id: string;
      slug: string;
      name: string;
      price: number;
      compare_at_price?: number | null;
      images: string[];
      thumbnail_url?: string | null;
      default_variant_id?: string;
      variants?: Array<{ id: string; size?: string; price: number }>;
    } | null;
  }>;
}

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

  if (loading) {
    return (
      <div className="py-12">
        <div className="animate-pulse bg-[var(--color-whisper)] rounded-[var(--radius-2xl)] aspect-[16/9] max-w-7xl mx-auto" />
      </div>
    );
  }

  if (!activeLook) {
    return (
      <div className="py-12 text-center border border-dashed border-[var(--color-whisper)] rounded-2xl bg-white/70">
        <p className="text-sm text-[var(--color-slate)]">No active Shop the Look curation at this moment.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {looksList.length > 1 && (
        <div className="flex flex-wrap items-center justify-center gap-2">
          {looksList.map((item, idx) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveIndex(idx)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer border ${
                idx === activeIndex
                  ? 'bg-[var(--color-ink)] text-[var(--color-gold)] border-[var(--color-gold)] shadow-sm'
                  : 'bg-white text-[var(--color-slate)] border-[var(--color-whisper)] hover:border-[var(--color-gold)]'
              }`}
            >
              {item.name}
            </button>
          ))}
        </div>
      )}
      <ShopTheLook key={activeLook.id} look={activeLook} className="py-4" />
    </div>
  );
}
