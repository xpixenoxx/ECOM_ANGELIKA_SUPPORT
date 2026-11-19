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

export async function getProductBySlug(slug: string): Promise<ProductWithRelations | null> {
  const supabase = await getSupabaseClient();

  const { data: product, error: productError } = await supabase
    .from('products')
    .select(
      `
      *,
      category:categories!products_category_id_fkey(*),
      subcategory:categories!products_subcategory_id_fkey(*)
    `
    )
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (productError || !product) {
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
