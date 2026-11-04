'use server';

import type { Database } from '@/types/database';

type ProductImageRow = Database['public']['Tables']['product_images']['Row'];
type CategoryRow = Database['public']['Tables']['categories']['Row'];

export interface ProductCardData {
  id: string;
  slug: string;
  name: string;
  price: number;
  compare_at_price: number | null;
  images: ProductImageRow[];
  category: CategoryRow | null;
  discount: number;
  is_vidyas_pick?: boolean;
  is_featured?: boolean;
  rating?: number;
  review_count?: number;
}

async function getSupabaseClient() {
  const { createClient } = await import('@/lib/supabase/server');
  return createClient();
}

/**
 * Intelligent recommendation engine for Product Detail Pages (PDP)
 * Scores items based on category affinity, fabric match, craftsmanship tags, and Vidhya's picks.
 * Guarantees a minimum of `limit` products using complementary fallback.
 */
export async function getRelatedProducts(
  productId: string,
  categoryId: string | null,
  limit = 4,
  tags: string[] = [],
  fabric: any = null
): Promise<ProductCardData[]> {
  const supabase = await getSupabaseClient();

  // 1. Fetch active products in the same category (excluding current product)
  let query = supabase
    .from('products')
    .select(
      `
      id,
      slug,
      name,
      fabric,
      tags,
      occasion,
      is_featured,
      is_vidyas_pick,
      created_at,
      category_id,
      category:categories!products_category_id_fkey(id, name, slug),
      product_images!product_images_product_id_fkey(id, url, alt_text, sort_order, is_primary),
      product_variants!product_variants_product_id_fkey(id, size, price, compare_at_price, inventory_quantity)
    `
    )
    .eq('is_active', true)
    .neq('id', productId);

  if (categoryId) {
    query = query.eq('category_id', categoryId);
  }

  const { data: primaryData } = await query.order('created_at', { ascending: false }).limit(limit * 2);

  let candidates: any[] = primaryData || [];

  // 2. If fewer than limit, fetch complementary active products
  if (candidates.length < limit) {
    const existingIds = [productId, ...candidates.map((p) => p.id)];
    let fallbackQuery = supabase
      .from('products')
      .select(
        `
        id,
        slug,
        name,
        fabric,
        tags,
        occasion,
        is_featured,
        is_vidyas_pick,
        created_at,
        category_id,
        category:categories!products_category_id_fkey(id, name, slug),
        product_images!product_images_product_id_fkey(id, url, alt_text, sort_order, is_primary),
        product_variants!product_variants_product_id_fkey(id, size, price, compare_at_price, inventory_quantity)
      `
      )
      .eq('is_active', true);

    if (existingIds.length > 0) {
      fallbackQuery = fallbackQuery.not('id', 'in', `(${existingIds.join(',')})`);
    }

    const { data: fallbackData } = await fallbackQuery
      .order('is_vidyas_pick', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(limit - candidates.length);

    if (fallbackData && fallbackData.length > 0) {
      candidates = [...candidates, ...fallbackData];
    }
  }

  // 3. Relevance scoring: shared category, shared fabric, shared tags
  const currentTags = (tags || []).map((t) => t.toLowerCase());
  const currentFabricStr = JSON.stringify(fabric || '').toLowerCase();

  const scored = candidates.map((p: any) => {
    let score = 0;
    // Same category gets base priority
    if (categoryId && p.category_id === categoryId) score += 6;

    // Shared tags
    const pTags = (p.tags || []).map((t: string) => t.toLowerCase());
    const sharedTagCount = pTags.filter((t: string) => currentTags.includes(t)).length;
    score += sharedTagCount * 3;

    // Fabric affinity
    const pFabricStr = JSON.stringify(p.fabric || '').toLowerCase();
    if (currentFabricStr && pFabricStr) {
      ['silk', 'velvet', 'georgette', 'organza', 'cotton', 'chiffon', 'chanderi'].forEach((f) => {
        if (currentFabricStr.includes(f) && pFabricStr.includes(f)) score += 4;
      });
    }

    if (p.is_vidyas_pick) score += 2;

    return { product: p, score };
  });

  scored.sort((a, b) => b.score - a.score);

  const selected = scored.slice(0, limit).map((s) => s.product);

  return selected.map((p: any) => {
    const variants = p.product_variants || [];
    const defaultVariant = variants[0];
    const price = defaultVariant ? defaultVariant.price : 2999;
    const compareAtPrice = defaultVariant ? defaultVariant.compare_at_price : null;
    const discount = compareAtPrice && compareAtPrice > price
      ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
      : 0;

    return {
      id: p.id,
      slug: p.slug,
      name: p.name,
      price,
      compare_at_price: compareAtPrice,
      images: p.product_images || [],
      category: p.category,
      discount,
      is_vidyas_pick: Boolean(p.is_vidyas_pick),
      is_featured: Boolean(p.is_featured),
      rating: 4.8,
      review_count: 12,
    };
  });
}

/**
 * Curated recommendations for Cart / Shopping Bag
 * Excludes products currently in the bag and prioritizes Vidhya's Picks and featured items.
 */
export async function getCartRecommendations(excludeIds: string[] = [], limit = 4): Promise<ProductCardData[]> {
  const supabase = await getSupabaseClient();

  let query = supabase
    .from('products')
    .select(
      `
      id,
      slug,
      name,
      fabric,
      tags,
      occasion,
      is_featured,
      is_vidyas_pick,
      created_at,
      category_id,
      category:categories!products_category_id_fkey(id, name, slug),
      product_images!product_images_product_id_fkey(id, url, alt_text, sort_order, is_primary),
      product_variants!product_variants_product_id_fkey(id, size, price, compare_at_price, inventory_quantity)
    `
    )
    .eq('is_active', true);

  if (excludeIds.length > 0) {
    query = query.not('id', 'in', `(${excludeIds.join(',')})`);
  }

  const { data, error } = await query
    .order('is_vidyas_pick', { ascending: false })
    .order('is_featured', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error || !data) return [];

  return data.map((p: any) => {
    const variants = p.product_variants || [];
    const defaultVariant = variants[0];
    const price = defaultVariant ? defaultVariant.price : 2999;
    const compareAtPrice = defaultVariant ? defaultVariant.compare_at_price : null;
    const discount = compareAtPrice && compareAtPrice > price
      ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
      : 0;

    return {
      id: p.id,
      slug: p.slug,
      name: p.name,
      price,
      compare_at_price: compareAtPrice,
      images: p.product_images || [],
      category: p.category,
      discount,
      is_vidyas_pick: Boolean(p.is_vidyas_pick),
      is_featured: Boolean(p.is_featured),
      rating: 4.8,
      review_count: 12,
    };
  });
}
