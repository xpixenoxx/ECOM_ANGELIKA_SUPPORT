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

export function ShopTheLookClient({ initialLook }: { initialLook?: any }) {
  const getLookFromConfig = (config: any): LookWithHotspots | null => {
    if (!config || !config.lifestyle_image_url) return null;
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
            id: 'prod-look-1',
            slug: config.productSlug || 'mirror-work-lehenga',
            name: config.productName || 'Mirror Work Lehenga',
            price: Number(String(config.productPrice || 18999).replace(/[^0-9.]/g, '')),
            compare_at_price: config.productOriginalPrice
              ? Number(String(config.productOriginalPrice).replace(/[^0-9.]/g, ''))
              : null,
            images: [config.productImage || '/images/products/lehenga-mirror-1.jpg'],
            thumbnail_url: config.productImage || '/images/products/lehenga-mirror-1.jpg',
            default_variant_id: 'var-look-1',
            variants: [{ id: 'var-look-1', price: Number(config.productPrice || 18999) }],
          },
        },
      ],
    };
  };

  const [look, setLook] = useState<LookWithHotspots | null>(() => getLookFromConfig(initialLook));
  const [loading, setLoading] = useState(!initialLook?.lifestyle_image_url);

  useEffect(() => {
    if (initialLook && initialLook.lifestyle_image_url) {
      setLook(getLookFromConfig(initialLook));
      setLoading(false);
      return;
    }

    async function fetchLook() {
      try {
        const res = await fetch('/api/looks/active');
        if (res.ok) {
          const data = await res.json();
          setLook(data);
        }
      } catch (error) {
        console.error('Failed to fetch look:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchLook();
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
      <div className="py-12 text-center">
        <p className="text-[var(--color-slate)]">No active look configured.</p>
      </div>
    );
  }

  return <ShopTheLook look={look} className="py-8" />;
}
