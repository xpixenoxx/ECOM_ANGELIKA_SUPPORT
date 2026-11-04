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

export function ShopTheLookClient() {
  const [look, setLook] = useState<LookWithHotspots | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
  }, []);

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