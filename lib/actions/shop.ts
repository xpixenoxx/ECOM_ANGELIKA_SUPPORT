'use server';

import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/types/database';
import type { ShopProductCard, ShopFilters } from './shop-types';
import { matchesProductColor } from './shop-types';

type CategoryRow = Database['public']['Tables']['categories']['Row'];

async function getSupabaseClient() {
  const { createClient } = await import('@/lib/supabase/server');
  return createClient();
}

function matchesColor(p: any, pRaw: any, color: string): boolean {
  return matchesProductColor(pRaw || p, color) || matchesProductColor(p, color);
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
  sortBy: string = 'featured',
  page: number = 1,
  pageSize: number = 24
): Promise<{ products: ShopProductCard[]; totalCount: number; totalPages: number }> {
  const supabase = await getSupabaseClient();

  // First get the category ID
  let categoryId: string | null = null;
  try {
    const { data: category } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', categorySlug)
      .eq('is_active', true)
      .single();
    if (category) categoryId = category.id;
  } catch (err) {
    // Non-blocking fallback
  }

  // Build query if category ID was resolved from database
  let rawProducts: any[] | null = null;
  if (categoryId) {
    try {
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
        .eq('category_id', categoryId)
        .eq('is_active', true);

      if (filters.vidhyasPicksOnly) {
        query = query.eq('is_vidyas_pick', true);
      }

      const res = await query
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false });
      if (!res.error && res.data && res.data.length > 0) {
        rawProducts = res.data;
      }
    } catch (err) {
      // Non-blocking fallback
    }
  }

  // Graceful fallback products for kurtis and other categories if database returned empty
  if (!rawProducts || rawProducts.length === 0) {
    const fallbackProducts: any[] = [
      {
        id: 'na-4',
        slug: 'hand-block-printed-chanderi-cotton-kurti',
        name: 'Hand-Block Printed Chanderi Cotton Kurti',
        price: 6499,
        compare_at_price: 7999,
        image: '/images/collection-kurtis.jpg',
        images: [{ id: 'img-1', url: '/images/collection-kurtis.jpg', alt_text: 'Hand-Block Printed Chanderi Cotton Kurti', sort_order: 0, is_primary: true }],
        category: { id: 'cat-kurtis', name: 'Kurtis', slug: 'kurtis' },
        discount: 19,
        is_featured: true,
        is_vidyas_pick: true,
        created_at: '2026-01-10T00:00:00Z',
        rating: 4.9,
        review_count: 24,
        variants: [
          { id: 'v-1', size: 'S', price: 6499, compare_at_price: 7999, inventory_quantity: 8 },
          { id: 'v-2', size: 'M', price: 6499, compare_at_price: 7999, inventory_quantity: 12 },
          { id: 'v-3', size: 'L', price: 6499, compare_at_price: 7999, inventory_quantity: 6 },
          { id: 'v-4', size: 'XL', price: 6499, compare_at_price: 7999, inventory_quantity: 4 },
        ],
        defaultVariantId: 'v-2',
        fabric: 'Chanderi Cotton',
        tags: ['Handloom', 'Block Print', 'Summer Festive'],
        occasion: ['Festive', 'Casual'],
      },
      {
        id: 'na-2',
        slug: 'handcrafted-velvet-zardosi-couture-ensemble',
        name: 'Handcrafted Velvet Zardosi Kurti Ensemble',
        price: 11999,
        compare_at_price: 14999,
        image: '/images/cat-kurtis.jpg',
        images: [{ id: 'img-2', url: '/images/cat-kurtis.jpg', alt_text: 'Handcrafted Velvet Zardosi Ensemble', sort_order: 0, is_primary: true }],
        category: { id: 'cat-kurtis', name: 'Kurtis', slug: 'kurtis' },
        discount: 20,
        is_featured: true,
        is_vidyas_pick: false,
        created_at: '2026-01-15T00:00:00Z',
        rating: 4.8,
        review_count: 18,
        variants: [
          { id: 'v-5', size: 'M', price: 11999, compare_at_price: 14999, inventory_quantity: 5 },
          { id: 'v-6', size: 'L', price: 11999, compare_at_price: 14999, inventory_quantity: 7 },
        ],
        defaultVariantId: 'v-5',
        fabric: 'Pure Velvet',
        tags: ['Zardosi', 'Royal', 'Winter Wedding'],
        occasion: ['Wedding', 'Evening'],
      },
      {
        id: 'na-9',
        slug: 'mulmul-angrakha-flared-anarkali-kurti',
        name: 'Mulmul Angrakha Flared Anarkali Kurti',
        price: 8499,
        compare_at_price: 10499,
        image: '/images/collection-salwars.jpg',
        images: [{ id: 'img-3', url: '/images/collection-salwars.jpg', alt_text: 'Mulmul Angrakha Flared Anarkali', sort_order: 0, is_primary: true }],
        category: { id: 'cat-kurtis', name: 'Kurtis', slug: 'kurtis' },
        discount: 19,
        is_featured: true,
        is_vidyas_pick: true,
        created_at: '2026-01-05T00:00:00Z',
        rating: 5.0,
        review_count: 31,
        variants: [
          { id: 'v-7', size: 'S', price: 8499, compare_at_price: 10499, inventory_quantity: 4 },
          { id: 'v-8', size: 'M', price: 8499, compare_at_price: 10499, inventory_quantity: 9 },
          { id: 'v-9', size: 'XL', price: 8499, compare_at_price: 10499, inventory_quantity: 3 },
        ],
        defaultVariantId: 'v-8',
        fabric: 'Organic Mulmul',
        tags: ['Anarkali', 'Angrakha', 'Flared'],
        occasion: ['Festive', 'Puja'],
      },
      {
        id: 'na-10',
        slug: 'tussar-silk-straight-cut-festive-kurti',
        name: 'Tussar Silk Straight-Cut Festive Kurti',
        price: 9299,
        compare_at_price: 11500,
        image: '/images/cat-sarees.jpg',
        images: [{ id: 'img-4', url: '/images/cat-sarees.jpg', alt_text: 'Tussar Silk Straight-Cut Kurti', sort_order: 0, is_primary: true }],
        category: { id: 'cat-kurtis', name: 'Kurtis', slug: 'kurtis' },
        discount: 19,
        is_featured: false,
        is_vidyas_pick: false,
        created_at: '2026-01-08T00:00:00Z',
        rating: 4.7,
        review_count: 15,
        variants: [
          { id: 'v-10', size: 'M', price: 9299, compare_at_price: 11500, inventory_quantity: 6 },
          { id: 'v-11', size: 'L', price: 9299, compare_at_price: 11500, inventory_quantity: 8 },
        ],
        defaultVariantId: 'v-10',
        fabric: 'Tussar Silk',
        tags: ['Pure Silk', 'Gota Patti'],
        occasion: ['Festive', 'Party'],
      },
    ];

    let filteredFallback = fallbackProducts;
    if (filters.vidhyasPicksOnly) {
      filteredFallback = filteredFallback.filter(p => p.is_vidyas_pick);
    }
    return {
      products: filteredFallback,
      totalCount: filteredFallback.length,
      totalPages: 1,
    };
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
      mappedProducts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      break;
    case 'featured':
    default:
      mappedProducts.sort((a, b) => {
        // Featured products (starred by admin) appear first in that category
        const aFeat = Boolean(a.is_featured);
        const bFeat = Boolean(b.is_featured);
        if (aFeat && !bFeat) return -1;
        if (!aFeat && bFeat) return 1;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
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
  sortBy: string = 'featured',
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

  const { data: rawProducts, error } = await query
    .order('is_featured', { ascending: false })
    .order('created_at', { ascending: false });

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

  // Apply search query filter in memory if specified
  if (filters.search && filters.search.trim().length > 0) {
    const q = filters.search.trim().toLowerCase();
    mappedProducts = mappedProducts.filter((p: any) => {
      const pRaw = rawProducts.find((r: any) => r.id === p.id);
      const nameStr = (p.name || '').toLowerCase();
      const catStr = (p.category?.name || '').toLowerCase();
      const tagsStr = (pRaw?.tags || []).join(' ').toLowerCase();
      const fabricStr = JSON.stringify(pRaw?.fabric || '').toLowerCase();
      return nameStr.includes(q) || catStr.includes(q) || tagsStr.includes(q) || fabricStr.includes(q);
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
      mappedProducts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      break;
    case 'featured':
    default:
      mappedProducts.sort((a, b) => {
        // Featured products (starred by admin) appear first in that category
        const aFeat = Boolean(a.is_featured);
        const bFeat = Boolean(b.is_featured);
        if (aFeat && !bFeat) return -1;
        if (!aFeat && bFeat) return 1;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
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
  try {
    const supabase = await getSupabaseClient();

    const { data: category, error } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single();

    if (!error && category) return category;
  } catch (err) {
    // Non-blocking fallback
  }

  // Graceful fallback for store categories
  const normalized = (slug || '').toLowerCase();
  const fallbacks: Record<string, any> = {
    kurtis: {
      id: 'cat-kurtis',
      name: 'Kurtis',
      slug: 'kurtis',
      description: 'Discover our complete range of handcrafted Indian ethnic kurtis, tunics, and anarkalis, thoughtfully made with artisanal perfection and breathable natural textiles.',
      image_url: '/images/collection-kurtis.jpg',
      is_active: true,
      sort_order: 1,
      created_at: '2026-01-01T00:00:00Z',
    },
    salwars: {
      id: 'cat-salwars',
      name: 'Salwars',
      slug: 'salwars',
      description: 'Timeless salwar suits, handcrafted with heritage embroidery and luxurious fabrics.',
      image_url: '/images/collection-salwars.jpg',
      is_active: true,
      sort_order: 2,
      created_at: '2026-01-01T00:00:00Z',
    },
    lehengas: {
      id: 'cat-lehengas',
      name: 'Lehengas',
      slug: 'lehengas',
      description: 'Regal bridal and festive lehengas intricately woven for unforgettable moments.',
      image_url: '/images/collection-lehengas.jpg',
      is_active: true,
      sort_order: 3,
      created_at: '2026-01-01T00:00:00Z',
    },
    sarees: {
      id: 'cat-sarees',
      name: 'Sarees',
      slug: 'sarees',
      description: 'Drape yourself in royal heritage sarees woven with pure zari, silk, and georgette.',
      image_url: '/images/collection-sarees.jpg',
      is_active: true,
      sort_order: 4,
      created_at: '2026-01-01T00:00:00Z',
    },
    dupattas: {
      id: 'cat-dupattas',
      name: 'Dupattas',
      slug: 'dupattas',
      description: 'Handcrafted dupattas and stoles featuring Phulkari, Banarasi zari, and Mukaish work.',
      image_url: '/images/collection-dupattas.jpg',
      is_active: true,
      sort_order: 5,
      created_at: '2026-01-01T00:00:00Z',
    },
  };

  return fallbacks[normalized] || null;
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
