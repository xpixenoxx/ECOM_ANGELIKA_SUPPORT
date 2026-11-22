import type { Database } from '@/types/database';

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

export interface ClientProductData {
  id: string;
  slug?: string;
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
  returnWindowDays?: number;
  rawFabric?: unknown;
  variants?: Array<{
    id: string;
    size: string;
    price: number;
    compare_at_price?: number | null;
    inventory_quantity?: number;
    colorName?: string | null;
  }>;
}

const CANONICAL_SIZE_ORDER = ['FREE SIZE', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '2XL', '3XL', '4XL'];

export function sortGarmentSizes(sizes: string[]): string[] {
  return [...sizes].sort((a, b) => {
    const ia = CANONICAL_SIZE_ORDER.indexOf(a.trim().toUpperCase());
    const ib = CANONICAL_SIZE_ORDER.indexOf(b.trim().toUpperCase());
    if (ia === -1 && ib === -1) return a.localeCompare(b);
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });
}

export function transformProductForClient(
  product: ProductWithRelations,
  reviewSummary?: { averageRating: number; totalReviews: number }
): ClientProductData {
  const colorMap = new Map<
    string,
    { name: string; value: string; hex: string; images: string[]; sizes: string[] }
  >();

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

    colorMap.get(colorKey)!.sizes.push(variant.size);
  }

  const productImages = product.images
    .filter((img) => !img.variant_id)
    .sort((a, b) => {
      if (a.is_primary !== b.is_primary) return a.is_primary ? -1 : 1;
      return a.sort_order - b.sort_order;
    })
    .map((img) => img.url);

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

  for (const colorData of colorMap.values()) {
    if (colorData.images.length === 0) {
      colorData.images = productImages;
    }
  }

  const colors = Array.from(colorMap.values());
  const allSizes = sortGarmentSizes(Array.from(new Set(product.variants.map((v) => v.size))));
  const inStock = product.variants.some((v) => v.inventory_quantity > 0);

  const sizeChart: Record<string, { bust: string; waist: string; hips: string; length: string }> = {};
  if (product.fabric && typeof product.fabric === 'object' && product.fabric !== null) {
    const fabric = product.fabric as Record<string, any>;
    if (fabric['sizeChart']) {
      Object.assign(sizeChart, fabric['sizeChart']);
    }
  }

  if (Object.keys(sizeChart).length === 0) {
    const defaultSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
    for (const size of defaultSizes) {
      if (allSizes.includes(size)) {
        const idx = defaultSizes.indexOf(size);
        sizeChart[size] = {
          bust: `${32 + idx * 2}"`,
          waist: `${26 + idx * 2}"`,
          hips: `${34 + idx * 2}"`,
          length: `${50 + idx}"`,
        };
      }
    }
  }

  const primaryVariant = product.variants.find((v) => v.is_active !== false) ?? product.variants[0];

  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    price: Number(primaryVariant?.price || 0),
    originalPrice: primaryVariant?.compare_at_price ? Number(primaryVariant.compare_at_price) : undefined,
    category: product.category?.name || 'Uncategorized',
    description: product.description,
    shortDescription: product.short_description,
    images: productImages.length > 0 ? productImages : ['/images/placeholder.jpg'],
    colors,
    sizes: allSizes,
    sizeChart,
    fabric:
      typeof product.fabric === 'string'
        ? product.fabric
        : typeof product.fabric === 'object' && product.fabric !== null
          ? ('name' in product.fabric && typeof (product.fabric as any).name === 'string'
              ? String((product.fabric as any).name)
              : [
                  (product.fabric as any).main ? `Top: ${(product.fabric as any).main}` : null,
                  (product.fabric as any).bottom ? `Bottom: ${(product.fabric as any).bottom}` : null,
                  (product.fabric as any).dupatta ? `Dupatta: ${(product.fabric as any).dupatta}` : null,
                ].filter(Boolean).join(', ') ||
                Object.values(product.fabric as Record<string, unknown>).filter((v) => typeof v === 'string').join(', ') ||
                'Premium Fabric')
          : 'Premium Fabric',
    care:
      typeof product.fabric === 'object' &&
      product.fabric !== null &&
      Array.isArray((product.fabric as Record<string, unknown>)['care'])
        ? ((product.fabric as Record<string, unknown>)['care'] as string[])
        : ['Dry clean recommended', 'Do not bleach', 'Iron on low heat'],
    details:
      typeof product.fabric === 'object' &&
      product.fabric !== null &&
      Array.isArray((product.fabric as Record<string, unknown>)['details'])
        ? ((product.fabric as Record<string, unknown>)['details'] as string[])
        : ['Handcrafted with care', 'Premium quality materials', 'Designed in India'],
    sku: product.sku,
    rating: reviewSummary?.averageRating || 0,
    reviewCount: reviewSummary?.totalReviews || 0,
    inStock,
    isVidhyasPick: product.is_vidyas_pick,
    isNew: product.created_at
      ? new Date(product.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      : false,
    categoryId: product.category_id || undefined,
    categorySlug: product.category?.slug || undefined,
    tags: product.tags || [],
    returnWindowDays: (() => {
      const tag = (product.tags || []).find(
        (t: string) => typeof t === 'string' && t.startsWith('return-days:')
      );
      if (tag) {
        const val = parseInt(tag.replace('return-days:', ''), 10);
        return Number.isNaN(val) ? 7 : val;
      }
      return 7;
    })(),
    rawFabric: product.fabric,
    variants: (product.variants || []).map((v) => ({
      id: v.id,
      size: v.size,
      price: Number(v.price) || 0,
      compare_at_price: v.compare_at_price ? Number(v.compare_at_price) : null,
      inventory_quantity: Number(v.inventory_quantity) || 0,
      colorName: v.color?.name || null,
    })),
  };
}
