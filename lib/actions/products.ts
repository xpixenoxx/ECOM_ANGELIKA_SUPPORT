import type { Database } from '@/types/database';
import { getProductReviewSummary, getProductReviews } from './reviews';

type ProductRow = Database['public']['Tables']['products']['Row'];
type ProductVariantRow = Database['public']['Tables']['product_variants']['Row'];
type ProductImageRow = Database['public']['Tables']['product_images']['Row'];
type ColorRow = Database['public']['Tables']['colors']['Row'];
type CategoryRow = Database['public']['Tables']['categories']['Row'];

export interface ProductWithRelations extends ProductRow {
  category?: CategoryRow | null;
  subcategory?: CategoryRow | null;
  images: ProductImageRow[];
  variants: (ProductVariantRow & {
    color?: ColorRow | null;
  })[];
}

export { getRelatedProducts, getCartRecommendations } from './recommendations';
export type { ProductCardData } from './recommendations';

// Helper to transform product data for the client component
export interface ClientProductData {
  id: string;
  name: string;
  price: number;
  originalPrice: number | undefined;
  category: string;
  description: string | null;
  shortDescription: string | null;
  images: string[];
  colors: {
    name: string;
    value: string;
    hex: string;
    images: string[];
  }[];
  sizes: string[];
  sizeChart: Record<string, { bust: string; waist: string; hips: string; length: string }>;
  fabric: string | null;
  care: string[];
  details: string[];
  sku: string;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  isVidhyasPick: boolean;
  isNew: boolean;
  categoryId?: string;
  categorySlug?: string;
  tags?: string[];
  rawFabric?: any;
}

export function transformProductForClient(
  product: ProductWithRelations,
  reviewSummary?: { averageRating: number; totalReviews: number }
): ClientProductData {
  // Group variants by color
  const colorMap = new Map<string, { name: string; value: string; hex: string; images: string[]; sizes: string[] }>();

  for (const variant of product.variants) {
    const colorKey = variant.color_id || 'default';
    const color = variant.color;

    if (!colorMap.has(colorKey)) {
      colorMap.set(colorKey, {
        name: color?.name || 'Default',
        value: color?.name?.toLowerCase().replace(/\s+/g, '-') || 'default',
        hex: color?.hex || '#CCCCCC',
        images: [],
        sizes: [],
      });
    }

    const colorData = colorMap.get(colorKey)!;
    colorData.sizes.push(variant.size);
  }

  // Get product-level images (not variant-specific)
  const productImages = product.images
    .filter((img) => !img.variant_id)
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((img) => img.url);

  // Get variant-specific images and assign to colors
  for (const variant of product.variants) {
    if (variant.color_id) {
      const variantImages = product.images
        .filter((img) => img.variant_id === variant.id)
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((img) => img.url);

      const colorData = colorMap.get(variant.color_id);
      if (colorData && variantImages.length > 0) {
        colorData.images = variantImages;
      }
    }
  }

  // If a color has no variant-specific images, use product images
  for (const colorData of colorMap.values()) {
    if (colorData.images.length === 0) {
      colorData.images = productImages;
    }
  }

  const colors = Array.from(colorMap.values());
  const allSizes = Array.from(new Set(product.variants.map((v) => v.size))).sort();
  const inStock = product.variants.some((v) => v.inventory_quantity > 0);

  // Build size chart from fabric JSON or use default
  const sizeChart: Record<string, { bust: string; waist: string; hips: string; length: string }> = {};
  if (product.fabric && typeof product.fabric === 'object' && product.fabric !== null) {
    const fabric = product.fabric as Record<string, any>;
    if (fabric['sizeChart']) {
      Object.assign(sizeChart, fabric['sizeChart']);
    }
  }
  // Default size chart if not in fabric
  if (Object.keys(sizeChart).length === 0) {
    const defaultSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
    for (const size of defaultSizes) {
      if (allSizes.includes(size)) {
        sizeChart[size] = {
          bust: `${32 + defaultSizes.indexOf(size) * 2}"`,
          waist: `${26 + defaultSizes.indexOf(size) * 2}"`,
          hips: `${34 + defaultSizes.indexOf(size) * 2}"`,
          length: `${50 + defaultSizes.indexOf(size)}"`,
        };
      }
    }
  }

  return {
    id: product.id,
    name: product.name,
    price: product.variants[0]?.price || 0,
    originalPrice: product.variants[0]?.compare_at_price ?? undefined,
    category: product.category?.name || 'Uncategorized',
    description: product.description,
    shortDescription: product.short_description,
    images: productImages.length > 0 ? productImages : ['/images/placeholder.jpg'],
    colors,
    sizes: allSizes,
    sizeChart,
    fabric: typeof product.fabric === 'object' && product.fabric !== null && 'name' in product.fabric
      ? (product.fabric as any).name
      : 'Premium Fabric',
    care: typeof product.fabric === 'object' && product.fabric !== null && 'care' in product.fabric
      ? (product.fabric as any).care
      : ['Dry clean recommended', 'Do not bleach', 'Iron on low heat'],
    details: typeof product.fabric === 'object' && product.fabric !== null && 'details' in product.fabric
      ? (product.fabric as any).details
      : ['Handcrafted with care', 'Premium quality materials', 'Designed in India'],
    sku: product.sku,
    rating: reviewSummary?.averageRating || 0,
    reviewCount: reviewSummary?.totalReviews || 0,
    inStock,
    isVidhyasPick: product.is_vidyas_pick,
    isNew: product.created_at ? new Date(product.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) : false,
    categoryId: product.category_id,
    categorySlug: product.category?.slug,
    tags: product.tags || [],
    rawFabric: product.fabric,
  };
}

async function getSupabaseClient() {
  const { createClient } = await import('@/lib/supabase/server');
  return createClient();
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
    rating: 4.8,
    review_count: 12,
  };
}
