'use server';

import { createPublicClient } from '@/lib/supabase/server';
import type { Database } from '@/types/database';
import type { ShopProductCard, ShopFilters } from './shop-types';
import { STORE_CATALOGUE, type CatalogueProduct } from '@/lib/data/store-catalogue';

type CategoryRow = Database['public']['Tables']['categories']['Row'];

async function getSupabaseClient() {
  return createPublicClient();
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

function formatFabricString(fabric: unknown): string | null {
  if (!fabric) return null;
  if (typeof fabric === 'string') return fabric;
  if (typeof fabric === 'object' && fabric !== null) {
    const f = fabric as Record<string, any>;
    if (f['name'] && typeof f['name'] === 'string') return f['name'];
    const parts = [
      f['main'] ? `Top: ${f['main']}` : null,
      f['bottom'] ? `Bottom: ${f['bottom']}` : null,
      f['dupatta'] ? `Dupatta: ${f['dupatta']}` : null,
    ].filter(Boolean);
    if (parts.length > 0) return parts.join(', ');
    const values = Object.values(f).filter((v) => typeof v === 'string' && v.trim().length > 0);
    if (values.length > 0) return values.join(', ');
  }
  return String(fabric);
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

  const publishedReviews = Array.isArray(p.reviews)
    ? p.reviews.filter((r: any) => r?.is_published === true && typeof r?.rating === 'number')
    : [];
  const reviewCount = publishedReviews.length;
  const avgRating =
    reviewCount > 0
      ? Number(
          (
            publishedReviews.reduce((sum: number, r: any) => sum + Number(r.rating), 0) /
            reviewCount
          ).toFixed(1)
        )
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
    rating: avgRating,
    review_count: reviewCount,
    variants,
    defaultVariantId: defaultVariant?.id,
    fabric: formatFabricString(p.fabric),
    tags: p.tags || [],
    occasion: p.occasion || [],
  };
}

function mapCatalogueProductToCard(p: CatalogueProduct): ShopProductCard {
  const catSlug = (p.category || 'kurtis').toLowerCase();
  const slug = p.href ? p.href.replace(/^\/product\//, '') : p.id;
  const price = p.price || 4999;
  const compareAt = p.originalPrice || null;
  const discount = p.discount || (compareAt && compareAt > price ? Math.round(((compareAt - price) / compareAt) * 100) : 0);
  const img = p.image || `/images/collection-${catSlug}.jpg`;

  const tags = p.tags || [];
  const text = `${p.title} ${tags.join(' ')} ${p.fabric || ''} ${p.category}`.toLowerCase();
  const occasions: string[] = p.occasion ? [...p.occasion] : [];
  if (occasions.length === 0) {
    if (text.includes('party') || text.includes('evening') || text.includes('sangeet') || text.includes('wedding') || text.includes('reception') || text.includes('zari') || text.includes('zardozi') || text.includes('kanjivaram') || text.includes('banarasi') || text.includes('tissue') || text.includes('organza') || text.includes('velvet') || text.includes('cocktail')) {
      occasions.push('Party', 'Festive');
    }
    if (text.includes('wedding') || text.includes('bridal') || text.includes('zari') || text.includes('kanjivaram') || text.includes('zardozi')) {
      occasions.push('Wedding', 'Reception');
    }
    if (text.includes('office') || text.includes('workwear') || text.includes('palazzo') || text.includes('cotton') || text.includes('mulberry') || text.includes('chanderi') || text.includes('ajrakh')) {
      occasions.push('Office', 'Workwear', 'Formal');
    }
    if (text.includes('daily') || text.includes('casual') || text.includes('summer') || text.includes('block print') || text.includes('mulmul')) {
      occasions.push('Casual', 'Daily Wear');
    }
    if (occasions.length === 0) {
      occasions.push('Festive', 'Celebration');
    }
  }

  return {
    id: p.id,
    slug,
    name: p.title,
    price,
    compare_at_price: compareAt,
    image: img,
    images: [{
      id: `img-${p.id}`,
      product_id: p.id,
      url: img,
      alt_text: p.title,
      sort_order: 0,
      is_primary: true,
      created_at: new Date().toISOString(),
      type: 'image',
      variant_id: null,
    }] as any,
    category: {
      id: `cat-${catSlug}`,
      name: p.category,
      slug: catSlug,
      description: null,
      image_url: img,
      parent_id: null,
      sort_order: 1,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as any,
    discount,
    is_featured: Boolean(p.isVidhyasPick),
    is_vidyas_pick: Boolean(p.isVidhyasPick),
    created_at: new Date().toISOString(),
    rating: 4.8,
    review_count: 12,
    variants: ['S', 'M', 'L', 'XL'].map((sz, idx) => ({
      id: `var-${p.id}-${idx}`,
      size: sz,
      price,
      compare_at_price: compareAt,
      inventory_quantity: 10,
    })),
    defaultVariantId: `var-${p.id}-0`,
    fabric: p.fabric || 'Pure Silk',
    tags: Array.from(new Set([...tags, p.fabric || '', p.category, ...occasions])),
    occasion: Array.from(new Set(occasions)),
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
          product_variants!product_variants_product_id_fkey(id, size, price, compare_at_price, inventory_quantity),
          reviews!reviews_product_id_fkey(rating, is_published)
        `,
          { count: 'exact' }
        )
        .eq('category_id', categoryId)
        .eq('is_active', true);

      if (filters.vidhyasPicksOnly) {
        query = query.eq('is_vidyas_pick', true);
      }

      const res = await query.order('created_at', { ascending: false });
      if (!res.error && res.data && res.data.length > 0) {
        rawProducts = res.data;
      }
    } catch (err) {
      // Non-blocking fallback
    }
  }

  // Graceful fallback products from catalogue if database returned empty
  if (!rawProducts || rawProducts.length === 0) {
    const matchingCatalogue = STORE_CATALOGUE.filter(
      (p) => (p.category || '').toLowerCase() === categorySlug.toLowerCase()
    );
    let mappedCatalogue = (matchingCatalogue.length > 0 ? matchingCatalogue : STORE_CATALOGUE).map(mapCatalogueProductToCard);

    if (filters.vidhyasPicksOnly) {
      mappedCatalogue = mappedCatalogue.filter((p) => p.is_vidyas_pick);
    }
    if (filters.occasion && filters.occasion.length > 0) {
      const wanted = filters.occasion.map((o) => o.toLowerCase());
      mappedCatalogue = mappedCatalogue.filter((p) =>
        wanted.some((w) => {
          const hay = `${(p.occasion || []).join(' ')} ${(p.tags || []).join(' ')} ${p.name}`.toLowerCase();
          if (w === 'casual' && (hay.includes('casual') || hay.includes('daily'))) return true;
          if (w === 'office' && (hay.includes('office') || hay.includes('work') || hay.includes('formal'))) return true;
          if (w === 'party' && (hay.includes('party') || hay.includes('festive') || hay.includes('wedding') || hay.includes('reception') || hay.includes('evening') || hay.includes('sangeet') || hay.includes('cocktail'))) return true;
          return hay.includes(w);
        })
      );
    }
    if (filters.type && filters.type.length > 0) {
      const wantedTypes = filters.type.map((t) => t.toLowerCase());
      mappedCatalogue = mappedCatalogue.filter((p) => {
        const hay = `${(p.tags || []).join(' ')} ${p.name} ${p.slug}`.toLowerCase();
        return wantedTypes.some((t) => {
          if (t === 'anarkali' && (hay.includes('anarkali') || hay.includes('frock') || hay.includes('flared'))) return true;
          if (t === 'frock' && (hay.includes('frock') || hay.includes('anarkali') || hay.includes('flared'))) return true;
          if (t === 'coord-sets' && (hay.includes('coord') || hay.includes('co-ord') || hay.includes('set') || hay.includes('pants'))) return true;
          return hay.includes(t);
        });
      });
    }
    if (filters.fabrics && filters.fabrics.length > 0) {
      const selectedFabrics = filters.fabrics.map((f) => f.toLowerCase());
      mappedCatalogue = mappedCatalogue.filter((p) => {
        const fText = `${p.fabric || ''} ${(p.tags || []).join(' ')}`.toLowerCase();
        return selectedFabrics.some((f) => fText.includes(f));
      });
    }
    if (filters.priceRange) {
      const [minP, maxP] = filters.priceRange;
      mappedCatalogue = mappedCatalogue.filter((p) => p.price >= minP && p.price <= maxP);
    }

    switch (sortBy) {
      case 'price-asc':
        mappedCatalogue.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        mappedCatalogue.sort((a, b) => b.price - a.price);
        break;
      case 'popularity':
        mappedCatalogue.sort((a, b) => b.review_count - a.review_count);
        break;
      case 'discount':
        mappedCatalogue.sort((a, b) => b.discount - a.discount);
        break;
      case 'newest':
      default:
        mappedCatalogue.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
    }

    const totalCount = mappedCatalogue.length;
    const totalPages = Math.ceil(totalCount / pageSize) || 1;
    const paginated = mappedCatalogue.slice((page - 1) * pageSize, page * pageSize);

    return {
      products: paginated,
      totalCount,
      totalPages,
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
      product_variants!product_variants_product_id_fkey(id, size, price, compare_at_price, inventory_quantity),
      reviews!reviews_product_id_fkey(rating, is_published)
    `,
      { count: 'exact' }
    )
    .eq('is_active', true);

  if (filters.vidhyasPicksOnly) {
    query = query.eq('is_vidyas_pick', true);
  }

  const { data: rawProducts, error } = await query.order('created_at', { ascending: false });

  if (error || !rawProducts || rawProducts.length === 0) {
    let mapped = STORE_CATALOGUE.map(mapCatalogueProductToCard);

    if (filters.categories && filters.categories.length > 0) {
      mapped = mapped.filter((p) => p.category && filters.categories?.includes(p.category.slug));
    }
    if (filters.vidhyasPicksOnly) {
      mapped = mapped.filter((p) => p.is_vidyas_pick);
    }
    if (filters.occasion && filters.occasion.length > 0) {
      const wanted = filters.occasion.map((o) => o.toLowerCase());
      mapped = mapped.filter((p) =>
        wanted.some((w) => {
          const hay = `${(p.occasion || []).join(' ')} ${(p.tags || []).join(' ')} ${p.name}`.toLowerCase();
          if (w === 'casual' && (hay.includes('casual') || hay.includes('daily'))) return true;
          if (w === 'office' && (hay.includes('office') || hay.includes('work') || hay.includes('formal'))) return true;
          if (w === 'party' && (hay.includes('party') || hay.includes('festive') || hay.includes('wedding') || hay.includes('reception') || hay.includes('evening') || hay.includes('sangeet') || hay.includes('cocktail'))) return true;
          return hay.includes(w);
        })
      );
    }
    if (filters.search && filters.search.trim().length > 0) {
      const q = filters.search.toLowerCase().trim();
      mapped = mapped.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.tags || []).some((t) => t.toLowerCase().includes(q)) ||
          (p.fabric || '').toLowerCase().includes(q)
      );
    }
    if (filters.priceRange) {
      const [minP, maxP] = filters.priceRange;
      mapped = mapped.filter((p) => p.price >= minP && p.price <= maxP);
    }

    switch (sortBy) {
      case 'price-asc':
        mapped.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        mapped.sort((a, b) => b.price - a.price);
        break;
      case 'popularity':
        mapped.sort((a, b) => b.review_count - a.review_count);
        break;
      case 'discount':
        mapped.sort((a, b) => b.discount - a.discount);
        break;
      case 'newest':
      default:
        mapped.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
    }

    const totalCount = mapped.length;
    const totalPages = Math.ceil(totalCount / pageSize) || 1;
    const paginated = mapped.slice((page - 1) * pageSize, page * pageSize);

    return {
      products: paginated,
      totalCount,
      totalPages,
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
