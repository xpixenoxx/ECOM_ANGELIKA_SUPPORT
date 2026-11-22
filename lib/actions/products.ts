'use server';

import type { Database } from '@/types/database';
import { getProductReviewSummary, getProductReviews } from './reviews';
import {
  getRelatedProducts as fetchRelatedProducts,
  getCartRecommendations as fetchCartRecommendations,
  type ProductCardData,
} from './recommendations';
import {
  transformProductForClient,
  type ProductWithRelations,
  type ClientProductData,
} from '@/lib/utils/product-transform';

export type { ProductWithRelations, ClientProductData, ProductCardData };

export async function getRelatedProducts(
  productId: string,
  categoryId: string | null,
  limit = 4,
  tags: string[] = [],
  fabric: unknown = null
): Promise<ProductCardData[]> {
  return fetchRelatedProducts(productId, categoryId, limit, tags, fabric);
}

export async function getCartRecommendations(
  excludeIds: string[] = [],
  limit = 4
): Promise<ProductCardData[]> {
  return fetchCartRecommendations(excludeIds, limit);
}

async function getSupabaseClient() {
  const { createPublicClient } = await import('@/lib/supabase/server');
  return createPublicClient();
}

const SLUG_ALIASES: Record<string, string> = {
  'royal-crimson-zari-bridal-lehenga-set': 'royal-crimson-bridal-zardozi-lehenga',
  'royal-crimson-zari-bridal-lehenga': 'royal-crimson-bridal-zardozi-lehenga',
  'royal-crimson-bridal-lehenga': 'royal-crimson-bridal-zardozi-lehenga',
  'handcrafted-velvet-zardosi-couture-ensemble': 'velvet-kurti-set',
  'handcrafted-velvet-zardosi-kurti-ensemble': 'velvet-kurti-set',
  'velvet-kurti-set-with-cigarette-pants': 'velvet-kurti-set',
  'banarasi-silk-brocade-palazzo-churidar-set': 'silk-palazzo-set',
  'banarasi-silk-brocade-palazzo-and-churidar-set': 'silk-palazzo-set',
  'hand-block-printed-chanderi-cotton-kurti': 'hand-block-printed-kurti',
  'chanderi-cotton-kurti': 'chanderi-cotton-kurti',
  'mirror-work-festive-lehenga': 'mirror-work-lehenga',
  'jaipur-gota-patti-festive-kurta': 'gota-patti-kurta',
  'silk-blend-palazzo-set': 'silk-palazzo-set',
  'lucknow-chikankari-sharara-set': 'sharara-set-navy',
  'banarasi-katan-silk-zari-dupatta': 'royal-gold-banarasi-katan-silk-dupatta',
};

export async function getProductBySlug(slug: string): Promise<ProductWithRelations | null> {
  const supabase = await getSupabaseClient();
  const normalizedSlug = slug.toLowerCase().trim();
  const targetSlug = SLUG_ALIASES[normalizedSlug] || normalizedSlug;

  // 1. Exact slug lookup (or alias)
  let { data: product } = await supabase
    .from('products')
    .select(
      `
      *,
      category:categories!products_category_id_fkey(*),
      subcategory:categories!products_subcategory_id_fkey(*)
    `
    )
    .eq('slug', targetSlug)
    .eq('is_active', true)
    .maybeSingle();

  // 2. Keyword fallback search if exact slug not found
  if (!product) {
    const slugKeywords = normalizedSlug.split('-').filter((w) => w.length > 3);
    for (const kw of slugKeywords) {
      const { data: matched } = await supabase
        .from('products')
        .select(
          `
          *,
          category:categories!products_category_id_fkey(*),
          subcategory:categories!products_subcategory_id_fkey(*)
        `
        )
        .ilike('slug', `%${kw}%`)
        .eq('is_active', true)
        .limit(1)
        .maybeSingle();

      if (matched) {
        product = matched;
        break;
      }
    }
  }

  // 3. Fallback to store catalogue if DB has no entry
  if (!product) {
    try {
      const { STORE_CATALOGUE } = await import('@/lib/data/store-catalogue');
      const item = STORE_CATALOGUE.find((p) => {
        const itemSlug = p.href?.replace('/product/', '').split('?')[0]?.toLowerCase();
        const itemTitleSlug = p.title?.toLowerCase().replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-');
        return (
          itemSlug === normalizedSlug ||
          itemTitleSlug === normalizedSlug ||
          (p.id && p.id.toLowerCase() === normalizedSlug)
        );
      });

      if (item) {
        return {
          id: item.id || `cat-${normalizedSlug}`,
          slug: normalizedSlug,
          name: item.title,
          description: item.vidhyaNote || item.subtitle || `${item.title} — Handcrafted at the Angelika atelier.`,
          short_description: item.subtitle || null,
          fabric: item.fabric || null,
          care_instructions: ['Dry clean only recommended for fine artisanal weaves.'],
          category_id: 'cat-kurtis',
          subcategory_id: null,
          is_active: true,
          is_featured: true,
          is_vidyas_pick: Boolean(item.isVidhyasPick),
          sku: `ANG-${normalizedSlug.slice(0, 8).toUpperCase()}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          category: {
            id: 'cat-1',
            name: item.category || 'Atelier Collection',
            slug: (item.category || 'shop').toLowerCase(),
            description: null,
            image_url: null,
            parent_id: null,
            sort_order: 1,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          subcategory: null,
          images: [
            {
              id: 'img-1',
              product_id: item.id || normalizedSlug,
              url: item.image || '/images/collection-kurtis.jpg',
              alt_text: item.title,
              sort_order: 0,
              is_primary: true,
              created_at: new Date().toISOString(),
            },
          ],
          variants: [
            {
              id: `v-${item.id || normalizedSlug}-s`,
              product_id: item.id || normalizedSlug,
              size: 'S',
              price: item.price,
              compare_at_price: item.originalPrice || null,
              inventory_quantity: 10,
              sku: `ANG-${normalizedSlug.slice(0, 6).toUpperCase()}-S`,
              is_active: true,
              sort_order: 1,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              color_id: null,
              color: null,
            },
            {
              id: `v-${item.id || normalizedSlug}-m`,
              product_id: item.id || normalizedSlug,
              size: 'M',
              price: item.price,
              compare_at_price: item.originalPrice || null,
              inventory_quantity: 12,
              sku: `ANG-${normalizedSlug.slice(0, 6).toUpperCase()}-M`,
              is_active: true,
              sort_order: 2,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              color_id: null,
              color: null,
            },
            {
              id: `v-${item.id || normalizedSlug}-l`,
              product_id: item.id || normalizedSlug,
              size: 'L',
              price: item.price,
              compare_at_price: item.originalPrice || null,
              inventory_quantity: 8,
              sku: `ANG-${normalizedSlug.slice(0, 6).toUpperCase()}-L`,
              is_active: true,
              sort_order: 3,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              color_id: null,
              color: null,
            },
          ],
        } as unknown as ProductWithRelations;
      }
    } catch {
      // Non-blocking fallback
    }
    return null;
  }

  // Fetch images
  const { data: images } = await supabase
    .from('product_images')
    .select('*')
    .eq('product_id', product.id)
    .order('sort_order', { ascending: true });

  // Fetch variants with colors
  const { data: variants } = await supabase
    .from('product_variants')
    .select(
      `
      *,
      color:colors(*)
    `
    )
    .eq('product_id', product.id)
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  return {
    ...product,
    category: product.category || null,
    subcategory: product.subcategory || null,
    images: images || [],
    variants: (variants || []).map((v) => ({
      ...v,
      color: (v as any).color || null,
    })),
  };
}

export async function getProductWithReviews(slug: string): Promise<{ product: ClientProductData | null; reviews: any[]; reviewSummary: any }> {
  const productData = await getProductBySlug(slug);

  if (!productData) {
    return { product: null, reviews: [], reviewSummary: { averageRating: 0, totalReviews: 0, ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }, verifiedPurchaseCount: 0 } };
  }

  const reviewSummary = await getProductReviewSummary(productData.id);
  const { reviews } = await getProductReviews(productData.id, { limit: 10 });

  const clientProduct = transformProductForClient(productData, reviewSummary);

  return { product: clientProduct, reviews, reviewSummary };
}

export async function getProductCardData(slug: string): Promise<ProductCardData | null> {
  const supabase = await getSupabaseClient();

  const { data: product, error } = await supabase
    .from('products')
    .select(
      `
      id,
      slug,
      name,
      is_vidyas_pick,
      is_featured,
      category_id,
      category:categories!products_category_id_fkey(id, name, slug),
      product_images!product_images_product_id_fkey(id, url, alt_text, sort_order, is_primary),
      product_variants!product_variants_product_id_fkey(id, size, price, compare_at_price, inventory_quantity)
    `
    )
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (error || !product) return null;

  const primaryImage = (product as any).product_images?.find((img: any) => img.is_primary) || (product as any).product_images?.[0];
  const variants = (product as any).product_variants || [];
  const defaultVariant = variants[0];
  const price = defaultVariant ? defaultVariant.price : 2999;
  const compareAtPrice = defaultVariant ? defaultVariant.compare_at_price : null;
  const discount = compareAtPrice && compareAtPrice > price
    ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
    : 0;

  const summary = await getProductReviewSummary(product.id);

  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    price,
    compare_at_price: compareAtPrice,
    images: (product as any).product_images || [],
    category: (product as any).category,
    discount,
    is_vidyas_pick: Boolean((product as any).is_vidyas_pick),
    is_featured: Boolean((product as any).is_featured),
    rating: summary.averageRating || 0,
    review_count: summary.totalReviews || 0,
  };
}
