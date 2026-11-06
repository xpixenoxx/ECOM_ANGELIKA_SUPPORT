'use server';

import { createClient } from '@/lib/supabase/server';

async function getSupabaseClient() {
  return createClient();
}

export type { HomepageProductCard, LookData } from './homepage-types';
import type { HomepageProductCard, LookData } from './homepage-types';

// ─── helper: cheapest active variant ─────────────────────────────────────────
function cheapestVariant(variants: any[]): { id: string | null; price: number; compare_at_price: number | null } {
  if (!variants || variants.length === 0) return { id: null, price: 0, compare_at_price: null };
  const active = variants.filter((v) => v.is_active !== false);
  const sorted = [...active].sort((a, b) => Number(a.price) - Number(b.price));
  const v = sorted[0];
  if (!v) return { id: null, price: 0, compare_at_price: null };
  return {
    id: v.id ?? null,
    price: Number(v.price),
    compare_at_price: v.compare_at_price ? Number(v.compare_at_price) : null,
  };
}

function sortImages(images: any[]): Array<{ url: string; alt_text: string | null }> {
  return (images ?? []).sort((a: any, b: any) => {
    if (a.is_primary) return -1;
    if (b.is_primary) return 1;
    return (a.sort_order ?? 0) - (b.sort_order ?? 0);
  });
}

// ─── getNewArrivals ───────────────────────────────────────────────────────────
export async function getNewArrivals(limit = 8): Promise<HomepageProductCard[]> {
  const supabase = await getSupabaseClient();

  const { data: products, error } = await supabase
    .from('products')
    .select(`
      id, slug, name, is_vidyas_pick, created_at,
      category:categories!products_category_id_fkey(id, name, slug),
      product_images!product_images_product_id_fkey(id, url, alt_text, sort_order, is_primary),
      product_variants!product_variants_product_id_fkey(id, price, compare_at_price, is_active)
    `)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error || !products) return [];

  return products.map((p: any): HomepageProductCard => {
    const { id: variantId, price, compare_at_price } = cheapestVariant(p.product_variants ?? []);
    const discount = compare_at_price
      ? Math.round(((compare_at_price - price) / compare_at_price) * 100)
      : 0;
    const isNew = p.created_at
      ? new Date(p.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      : false;

    return {
      id: p.id,
      slug: p.slug,
      name: p.name,
      variant_id: variantId,
      price,
      compare_at_price,
      images: sortImages(p.product_images),
      category: p.category,
      discount,
      is_vidyas_pick: p.is_vidyas_pick || false,
      is_new: isNew,
    };
  });
}

// ─── getVidhyasPicks ──────────────────────────────────────────────────────────
export async function getVidhyasPicks(limit = 4): Promise<HomepageProductCard[]> {
  const supabase = await getSupabaseClient();

  const { data: products, error } = await supabase
    .from('products')
    .select(`
      id, slug, name, is_vidyas_pick, created_at,
      category:categories!products_category_id_fkey(id, name, slug),
      product_images!product_images_product_id_fkey(id, url, alt_text, sort_order, is_primary),
      product_variants!product_variants_product_id_fkey(id, price, compare_at_price, is_active)
    `)
    .eq('is_active', true)
    .eq('is_vidyas_pick', true)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error || !products) return [];

  return products.map((p: any): HomepageProductCard => {
    const { id: variantId, price, compare_at_price } = cheapestVariant(p.product_variants ?? []);
    const discount = compare_at_price
      ? Math.round(((compare_at_price - price) / compare_at_price) * 100)
      : 0;

    return {
      id: p.id,
      slug: p.slug,
      name: p.name,
      variant_id: variantId,
      price,
      compare_at_price,
      images: sortImages(p.product_images),
      category: p.category,
      discount,
      is_vidyas_pick: true,
      is_new: false,
    };
  });
}

// ─── getLooks ─────────────────────────────────────────────────────────────────
export async function getLooks(limit = 3): Promise<LookData[]> {
  const supabase = await getSupabaseClient();

  const { data: looks, error } = await supabase
    .from('looks')
    .select(`
      id, name, lifestyle_image_url, lifestyle_image_alt,
      look_hotspots!look_hotspots_look_id_fkey(
        x_percent, y_percent, display_order,
        product:products!look_hotspots_product_id_fkey(
          id, slug, name,
          product_variants!product_variants_product_id_fkey(price, is_active),
          product_images!product_images_product_id_fkey(url, is_primary)
        )
      )
    `)
    .eq('is_active', true)
    .order('display_order', { ascending: true })
    .limit(limit);

  if (error || !looks) return [];

  return looks.map((look: any) => ({
    id: look.id,
    title: look.name,
    description: look.lifestyle_image_alt ?? null,
    cover_image: look.lifestyle_image_url,
    products: (look.look_hotspots ?? [])
      .map((hotspot: any): any => {
        const prod = hotspot.product;
        if (!prod?.id) return null;
        const { price } = cheapestVariant(prod.product_variants ?? []);
        const primaryImg =
          (prod.product_images ?? []).find((i: any) => i.is_primary)?.url ||
          prod.product_images?.[0]?.url ||
          '/images/placeholder.jpg';
        return {
          id: prod.id,
          slug: prod.slug,
          name: prod.name,
          price,
          image: primaryImg,
          x_position: Number(hotspot.x_percent),
          y_position: Number(hotspot.y_percent),
        };
      })
      .filter(Boolean),
  }));
}

// ─── getInstagramPosts ────────────────────────────────────────────────────────
export async function getInstagramPosts(limit = 8): Promise<Array<{ id: string; image_url: string; handle?: string; caption?: string; productName?: string; productLink?: string }>> {
  try {
    const { getSiteContent } = await import('@/lib/actions/site-content');
    const siteContent = await getSiteContent();
    if (siteContent['my-angelika-look']?.posts && siteContent['my-angelika-look'].posts.length > 0) {
      return siteContent['my-angelika-look'].posts.slice(0, limit);
    }
  } catch (err) {
    // Non-blocking fallback
  }
  return [
    { id: 'ig-1', image_url: '/images/insta-1.jpg' },
    { id: 'ig-2', image_url: '/images/insta-2.jpg' },
    { id: 'ig-3', image_url: '/images/insta-3.jpg' },
    { id: 'ig-4', image_url: '/images/insta-4.jpg' },
    { id: 'ig-5', image_url: '/images/insta-5.jpg' },
    { id: 'ig-6', image_url: '/images/insta-6.jpg' },
    { id: 'ig-7', image_url: '/images/insta-7.jpg' },
    { id: 'ig-8', image_url: '/images/insta-8.jpg' },
  ].slice(0, limit);
}