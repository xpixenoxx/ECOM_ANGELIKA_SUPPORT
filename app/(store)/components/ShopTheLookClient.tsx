'use client';

import { useEffect, useState } from 'react';
import { ShopTheLook } from '@/components/composite/ShopTheLook';

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
  if (!config || !config.lifestyle_image_url) return null;

  // Real DB LookData shape from getLooks()
  if (Array.isArray(config.look_hotspots) && config.look_hotspots.length > 0) {
    return {
      id: config.id || 'db-look',
      name: config.name || 'Curated Ensemble',
      lifestyle_image_url: config.lifestyle_image_url,
      lifestyle_image_alt: config.lifestyle_image_alt || config.name || 'Featured Ensemble',
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

  // CMS site-content fallback look (displays curated look; links cleanly to product page)
  if (!config.productName) return null;
  const parsedPrice = Number(String(config.productPrice || 0).replace(/[^0-9.]/g, ''));
  return {
    id: 'site-look-1',
    name: config.title || 'Festive Elegance',
    lifestyle_image_url: config.lifestyle_image_url,
    lifestyle_image_alt: config.lifestyle_image_alt || config.title || 'Featured Ensemble',
    look_hotspots: [
      {
        id: 'hotspot-1',
        x_percent: Number(config.pinX ?? 47),
        y_percent: Number(config.pinY ?? 64),
        display_order: 1,
        products: {
          id: config.productSlug || 'featured-look',
          slug: config.productSlug || 'mirror-work-lehenga',
          name: config.productName,
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

export function ShopTheLookClient({ initialLook }: { initialLook?: any }) {
  const normalizedInitial = normalizeLookInput(initialLook);
  const [look, setLook] = useState<LookWithHotspots | null>(normalizedInitial);
  const [loading, setLoading] = useState(!normalizedInitial);

  useEffect(() => {
    // If initialLook has real DB hotspots, use it directly
    if (Array.isArray(initialLook?.look_hotspots) && initialLook.look_hotspots.length > 0) {
      setLook(normalizeLookInput(initialLook));
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
            setLook(data);
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
  }, [initialLook]);

  if (loading) {
    return (
      <div className="py-12">
        <div className="animate-pulse bg-[var(--color-whisper)] rounded-[var(--radius-2xl)] aspect-[16/9] max-w-7xl mx-auto" />
      </div>
    );
  }

  if (!look) {
    return (
      <div className="py-12 text-center border border-dashed border-[var(--color-whisper)] rounded-2xl bg-white/70">
        <p className="text-sm text-[var(--color-slate)]">No active Shop the Look curation at this moment.</p>
      </div>
    );
  }

  return <ShopTheLook look={look} className="py-4" />;
}
