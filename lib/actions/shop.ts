'use server';

import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/types/database';
import type { ShopProductCard, ShopFilters } from './shop-types';

type CategoryRow = Database['public']['Tables']['categories']['Row'];

async function getSupabaseClient() {
  const { createClient } = await import('@/lib/supabase/server');
  return createClient();
}

function matchesColor(p: any, pRaw: any, color: string): boolean {
  const text = `${p.name} ${p.slug} ${(pRaw?.tags || []).join(' ')} ${JSON.stringify(pRaw?.fabric || '')}`.toLowerCase();
  if (text.includes(color)) return true;
  if (color === 'red' && (text.includes('crimson') || text.includes('ruby') || text.includes('maroon') || text.includes('scarlet'))) return true;
  if (color === 'blue' && (text.includes('indigo') || text.includes('navy') || text.includes('sapphire') || text.includes('teal'))) return true;
  if (color === 'green' && (text.includes('emerald') || text.includes('olive') || text.includes('mint') || text.includes('pista'))) return true;
  if (color === 'pink' && (text.includes('blush') || text.includes('rose') || text.includes('peach') || text.includes('coral'))) return true;
  if (color === 'yellow' && (text.includes('mustard') || text.includes('haldi') || text.includes('gold') || text.includes('lemon'))) return true;
  if (color === 'white' && (text.includes('ivory') || text.includes('cream') || text.includes('pearl') || text.includes('off-white'))) return true;
  if (color === 'black' && (text.includes('noir') || text.includes('charcoal'))) return true;
  if (color === 'purple' && (text.includes('lavender') || text.includes('violet') || text.includes('plum') || text.includes('mauve'))) return true;
  if (color === 'gold' && (text.includes('zari') || text.includes('gota') || text.includes('golden') || text.includes('metallic'))) return true;
  return false;
}

function matchesSize(pRaw: any, size: string): boolean {
  const variants = pRaw?.product_variants || [];
  const normalizedSize = size.toLowerCase();
  return variants.some((v: any) => {
    const vSize = (v.size || '').toLowerCase();
    const isInStock = (v.inventory_quantity ?? 1) > 0;
    return isInStock && vSize === normalizedSize;
  });
}

function mapProductToCard(p: any): ShopProductCard {
  const primaryImage = p.product_images?.find((img: any) => img.is_primary) || p.product_images?.[0];
  const imageUrl = primaryImage?.url || '/images/collection-kurtis.jpg';
  
  // Find lowest price variant or default variant
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
    image: imageUrl,
    category: p.category || null,
    discount,
    is_featured: Boolean(p.is_featured),
    is_vidyas_pick: Boolean(p.is_vidyas_pick),
    created_at: p.created_at,
    rating: 4.8,
    review_count: 12,
    variants,
    defaultVariantId: defaultVariant?.id,
    fabric: p.fabric || null,
    tags: p.tags || [],
    occasion: p.occasion || [],
  };
}

export async function getProductsByCategory(
  categorySlug: string,
  filters: ShopFilters = {},
  sortBy: string = 'newest',
  page: number = 1,
  pageSize: number = 24
): Promise<{ products: ShopProductCard[]; totalCount: number; totalPages: number }> {
  const supabase = await getSupabaseClient();

  // First get the category ID
  const { data: category } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', categorySlug)
    .eq('is_active', true)
    .single();

  if (!category) {
    return { products: [], totalCount: 0, totalPages: 0 };
  }

  // Build query
  let query = supabase
    .from('products')
    .select(
      `
      id,
      slug,
      name,
      fabric,
      occasion,
      tags,
      is_featured,
      is_vidyas_pick,
      created_at,
      category_id,
      category:categories!products_category_id_fkey(id, name, slug),
      product_images!product_images_product_id_fkey(id, url, alt_text, sort_order, is_primary),
      product_variants!product_variants_product_id_fkey(id, size, price, compare_at_price, inventory_quantity)
    `,
      { count: 'exact' }
    )
    .eq('category_id', category.id)
    .eq('is_active', true);

  // Apply filters
  if (filters.vidhyasPicksOnly) {
    query = query.eq('is_vidyas_pick', true);
  }

  const { data: rawProducts, error } = await query.order('created_at', { ascending: false });

  if (error || !rawProducts) {
    console.error('Error fetching products by category:', error);
    return { products: [], totalCount: 0, totalPages: 0 };
  }

  let mappedProducts = rawProducts.map(mapProductToCard);

  // Apply in-stock filter
  if (filters.inStockOnly) {
    mappedProducts = mappedProducts.filter((p: any) => {
      const pRaw = rawProducts.find((r: any) => r.id === p.id);
      const variants = pRaw?.product_variants || [];
      if (variants.length === 0) return true;
      return variants.some((v: any) => (v.inventory_quantity ?? 1) > 0);
    });
  }

  // Apply fabric filter in memory
  if (filters.fabrics && filters.fabrics.length > 0) {
    const selectedFabrics = filters.fabrics.map((f: string) => f.toLowerCase());
    const filtered = mappedProducts.filter((p: any) => {
      const pRaw = rawProducts.find((r: any) => r.id === p.id);
      const fabricStr = JSON.stringify(pRaw?.fabric || '').toLowerCase();
      const tagsStr = (pRaw?.tags || []).join(' ').toLowerCase();
      const nameStr = p.name.toLowerCase();
      return selectedFabrics.some((f: string) => fabricStr.includes(f) || tagsStr.includes(f) || nameStr.includes(f));
    });
    if (filtered.length > 0) {
      mappedProducts = filtered;
    }
  }

  // Apply occasion filter in memory
  if (filters.occasion && filters.occasion.length > 0) {
    const selectedOccasions = filters.occasion.map((o: string) => o.toLowerCase());
    const filtered = mappedProducts.filter((p: any) => {
      const pRaw = rawProducts.find((r: any) => r.id === p.id);
      const occStr = (pRaw?.occasion || []).join(' ').toLowerCase();
      const tagsStr = (pRaw?.tags || []).join(' ').toLowerCase();
      return selectedOccasions.some((o: string) => occStr.includes(o) || tagsStr.includes(o));
    });
    if (filtered.length > 0) {
      mappedProducts = filtered;
    }
  }

  // Apply type / length subcategory filter in memory
  const subFilters = [...(filters.type || []), ...(filters.length || [])].map((s: string) => s.toLowerCase());
  if (subFilters.length > 0) {
    const filtered = mappedProducts.filter((p: any) => {
      const pRaw = rawProducts.find((r: any) => r.id === p.id);
      const text = `${p.name} ${p.slug} ${(pRaw?.tags || []).join(' ')}`.toLowerCase();
      return subFilters.some((s: string) => text.includes(s));
    });
    if (filtered.length > 0) {
      mappedProducts = filtered;
    }
  }

  // Apply color filter in memory
  if (filters.colors && filters.colors.length > 0) {
    const selectedColors = filters.colors.map((c: string) => c.toLowerCase());
    mappedProducts = mappedProducts.filter((p: any) => {
      const pRaw = rawProducts.find((r: any) => r.id === p.id);
      return selectedColors.some((c: string) => matchesColor(p, pRaw, c));
    });
  }

  // Apply size filter in memory
  if (filters.sizes && filters.sizes.length > 0) {
    const selectedSizes = filters.sizes.map((s: string) => s.toLowerCase());
    mappedProducts = mappedProducts.filter((p: any) => {
      const pRaw = rawProducts.find((r: any) => r.id === p.id);
      return selectedSizes.some((s: string) => matchesSize(pRaw, s));
    });
  }

  // Apply in-memory price filter if requested
  if (filters.priceRange) {
    const range = Array.isArray(filters.priceRange)
      ? filters.priceRange
      : [0, Number(filters.priceRange) || 25000];
    const minPrice = typeof range[0] === 'number' && !isNaN(range[0]) ? range[0] : 0;
    const maxPrice = typeof range[1] === 'number' && !isNaN(range[1]) ? range[1] : 25000;
    mappedProducts = mappedProducts.filter(p => (p.price || 0) >= minPrice && (p.price || 0) <= maxPrice);
  }

  // Apply sorting
  switch (sortBy) {
    case 'price-asc':
      mappedProducts.sort((a, b) => a.price - b.price);
      break;
    case 'price-desc':
      mappedProducts.sort((a, b) => b.price - a.price);
      break;
    case 'popularity':
      mappedProducts.sort((a, b) => b.review_count - a.review_count);
      break;
    case 'discount':
      mappedProducts.sort((a, b) => b.discount - a.discount);
      break;
    case 'newest':
    default:
      mappedProducts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      break;
  }

  const totalCount = mappedProducts.length;
  const totalPages = Math.ceil(totalCount / pageSize);
  const paginatedProducts = mappedProducts.slice((page - 1) * pageSize, page * pageSize);

  return {
    products: paginatedProducts,
    totalCount,
    totalPages,
  };
}

export async function getAllProducts(
  filters: ShopFilters = {},
  sortBy: string = 'newest',
  page: number = 1,
  pageSize: number = 24
): Promise<{ products: ShopProductCard[]; totalCount: number; totalPages: number }> {
  const supabase = await getSupabaseClient();

  let query = supabase
    .from('products')
    .select(
      `
      id,
      slug,
      name,
      fabric,
      occasion,
      tags,
      is_featured,
      is_vidyas_pick,
      created_at,
      category_id,
      category:categories!products_category_id_fkey(id, name, slug),
      product_images!product_images_product_id_fkey(id, url, alt_text, sort_order, is_primary),
      product_variants!product_variants_product_id_fkey(id, size, price, compare_at_price, inventory_quantity)
    `,
      { count: 'exact' }
    )
    .eq('is_active', true);

  if (filters.vidhyasPicksOnly) {
    query = query.eq('is_vidyas_pick', true);
  }

  const { data: rawProducts, error } = await query.order('created_at', { ascending: false });

  if (error || !rawProducts) {
    console.error('Error fetching all products:', error);
    return { products: [], totalCount: 0, totalPages: 0 };
  }

  let mappedProducts = rawProducts.map(mapProductToCard);

  // Apply in-stock filter
  if (filters.inStockOnly) {
    mappedProducts = mappedProducts.filter((p: any) => {
      const pRaw = rawProducts.find((r: any) => r.id === p.id);
      const variants = pRaw?.product_variants || [];
      if (variants.length === 0) return true;
      return variants.some((v: any) => (v.inventory_quantity ?? 1) > 0);
    });
  }

  // Apply category filter if specified
  if (filters.categories && filters.categories.length > 0) {
    mappedProducts = mappedProducts.filter(p => p.category && filters.categories?.includes(p.category.slug));
  }

  // Apply fabric filter in memory
  if (filters.fabrics && filters.fabrics.length > 0) {
    const selectedFabrics = filters.fabrics.map((f: string) => f.toLowerCase());
    const filtered = mappedProducts.filter((p: any) => {
      const pRaw = rawProducts.find((r: any) => r.id === p.id);
      const fabricStr = JSON.stringify(pRaw?.fabric || '').toLowerCase();
      const tagsStr = (pRaw?.tags || []).join(' ').toLowerCase();
      const nameStr = p.name.toLowerCase();
      return selectedFabrics.some((f: string) => fabricStr.includes(f) || tagsStr.includes(f) || nameStr.includes(f));
    });
    if (filtered.length > 0) {
      mappedProducts = filtered;
    }
  }

  // Apply occasion filter in memory
  if (filters.occasion && filters.occasion.length > 0) {
    const selectedOccasions = filters.occasion.map((o: string) => o.toLowerCase());
    const filtered = mappedProducts.filter((p: any) => {
      const pRaw = rawProducts.find((r: any) => r.id === p.id);
      const occStr = (pRaw?.occasion || []).join(' ').toLowerCase();
      const tagsStr = (pRaw?.tags || []).join(' ').toLowerCase();
      return selectedOccasions.some((o: string) => occStr.includes(o) || tagsStr.includes(o));
    });
    if (filtered.length > 0) {
      mappedProducts = filtered;
    }
  }

  // Apply type / length filter in memory
  const subFilters = [...(filters.type || []), ...(filters.length || [])].map((s: string) => s.toLowerCase());
  if (subFilters.length > 0) {
    const filtered = mappedProducts.filter((p: any) => {
      const pRaw = rawProducts.find((r: any) => r.id === p.id);
      const text = `${p.name} ${p.slug} ${(pRaw?.tags || []).join(' ')}`.toLowerCase();
      return subFilters.some((s: string) => text.includes(s));
    });
    if (filtered.length > 0) {
      mappedProducts = filtered;
    }
  }

  // Apply color filter in memory
  if (filters.colors && filters.colors.length > 0) {
    const selectedColors = filters.colors.map((c: string) => c.toLowerCase());
    mappedProducts = mappedProducts.filter((p: any) => {
      const pRaw = rawProducts.find((r: any) => r.id === p.id);
      return selectedColors.some((c: string) => matchesColor(p, pRaw, c));
    });
  }

  // Apply size filter in memory
  if (filters.sizes && filters.sizes.length > 0) {
    const selectedSizes = filters.sizes.map((s: string) => s.toLowerCase());
    mappedProducts = mappedProducts.filter((p: any) => {
      const pRaw = rawProducts.find((r: any) => r.id === p.id);
      return selectedSizes.some((s: string) => matchesSize(pRaw, s));
    });
  }

  // Apply in-memory price filter if requested
  if (filters.priceRange) {
    const range = Array.isArray(filters.priceRange)
      ? filters.priceRange
      : [0, Number(filters.priceRange) || 25000];
    const minPrice = typeof range[0] === 'number' && !isNaN(range[0]) ? range[0] : 0;
    const maxPrice = typeof range[1] === 'number' && !isNaN(range[1]) ? range[1] : 25000;
    mappedProducts = mappedProducts.filter(p => (p.price || 0) >= minPrice && (p.price || 0) <= maxPrice);
  }

  // Apply sorting
  switch (sortBy) {
    case 'price-asc':
      mappedProducts.sort((a, b) => a.price - b.price);
      break;
    case 'price-desc':
      mappedProducts.sort((a, b) => b.price - a.price);
      break;
    case 'popularity':
      mappedProducts.sort((a, b) => b.review_count - a.review_count);
      break;
    case 'discount':
      mappedProducts.sort((a, b) => b.discount - a.discount);
      break;
    case 'newest':
    default:
      mappedProducts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      break;
  }

  const totalCount = mappedProducts.length;
  const totalPages = Math.ceil(totalCount / pageSize);
  const paginatedProducts = mappedProducts.slice((page - 1) * pageSize, page * pageSize);

  return {
    products: paginatedProducts,
    totalCount,
    totalPages,
  };
}

export async function getCategoryBySlug(slug: string): Promise<CategoryRow | null> {
  const supabase = await getSupabaseClient();

  const { data: category, error } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (error || !category) return null;
  return category;
}

export async function getAllCategories(): Promise<CategoryRow[]> {
  const supabase = await getSupabaseClient();

  const { data: categories, error } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error || !categories) return [];
  return categories;
}
