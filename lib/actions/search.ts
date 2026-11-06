'use server';

import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/types/database';

type ProductRow = Database['public']['Tables']['products']['Row'];
type ProductImageRow = Database['public']['Tables']['product_images']['Row'];
type CategoryRow = Database['public']['Tables']['categories']['Row'];

export interface SearchProductCard {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  compare_at_price: number | null;
  images: ProductImageRow[];
  category: CategoryRow | null;
  discount: number;
}

export interface SearchFilters {
  query?: string;
  category?: string;
  subcategory?: string;
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
  sortBy?: 'relevance' | 'newest' | 'price-asc' | 'price-desc' | 'popularity';
  page?: number;
  pageSize?: number;
}

export interface SearchResult {
  products: SearchProductCard[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  query: string;
  suggestions: SearchSuggestion[];
  took: number; // milliseconds
}

export interface SearchSuggestion {
  suggestion: string;
  type: 'product' | 'category' | 'tag' | 'occasion';
  count: number;
}

export interface SemanticSearchParams {
  embedding: number[]; // 1536 dimensions for text-embedding-3-small
  filters?: SearchFilters;
  similarityThreshold?: number;
  limit?: number;
  offset?: number;
}

async function getSupabaseClient() {
  const { createClient } = await import('@/lib/supabase/server');
  return createClient();
}

// ============================================
// FULL-TEXT SEARCH
// ============================================

export async function searchProductsFullText(
  query: string,
  filters: SearchFilters = {}
): Promise<SearchResult> {
  const startTime = Date.now();
  const supabase = await getSupabaseClient();

  const {
    category,
    subcategory,
    minPrice,
    maxPrice,
    inStockOnly = false,
    page = 1,
    pageSize = 20,
  } = filters;

  const offset = (page - 1) * pageSize;

  try {
    // Call the full-text search RPC function
    const { data: results, error } = await supabase.rpc('search_products_fulltext', {
      query_text: query,
      category_filter: category || null,
      subcategory_filter: subcategory || null,
      min_price: minPrice || null,
      max_price: maxPrice || null,
      in_stock_only: inStockOnly,
      limit_count: pageSize,
      offset_count: offset,
    });

    if (error) {
      console.error('Full-text search error:', error);
      // Fallback to simple search
      return fallbackSearch(query, filters, startTime);
    }

    const products = (results || []).map((p: any) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description,
      price: p.price,
      compare_at_price: p.compare_at_price,
      images: p.images || [],
      category: p.category_name ? { id: p.category_id, name: p.category_name, slug: p.category_slug } : null,
      discount: p.compare_at_price ? Math.round(((p.compare_at_price - p.price) / p.compare_at_price) * 100) : 0,
    }));

    // Get total count (separate query for pagination)
    const { count } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
      .textSearch('search_vector', query, { type: 'websearch' });

    const totalCount = count || 0;
    const totalPages = Math.ceil(totalCount / pageSize);

    // Get suggestions
    const suggestions = await getSearchSuggestions(query, 5);

    if (formattedProducts.length === 0) {
    const { STORE_CATALOGUE, VIDHYAS_PICKS_LIST } = await import('@/lib/data/store-catalogue');
    const q = query.trim().toLowerCase();
    const localMatches = q
      ? STORE_CATALOGUE.filter((item) => {
          const titleLower = item.title.toLowerCase();
          const catLower = (item.category || '').toLowerCase();
          const subLower = (item.subtitle || '').toLowerCase();
          return titleLower.includes(q) || catLower.includes(q) || subLower.includes(q);
        })
      : [];

    if (localMatches.length > 0) {
      const catalogueProducts = localMatches.map((p) => ({
        id: p.id,
        name: p.title,
        slug: p.href ? p.href.replace('/product/', '').replace('/shop/', '') : p.id,
        description: p.subtitle || null,
        price: p.price,
        compare_at_price: p.originalPrice || null,
        images: [{ id: `img-${p.id}`, url: p.image || '/images/collection-kurtis.jpg', alt_text: p.title, sort_order: 0, is_primary: true }] as any,
        category: p.category ? ({ id: `cat-${p.category}`, name: p.category, slug: p.category.toLowerCase() } as any) : null,
        discount: p.originalPrice && p.price ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100) : 0,
      }));

      return {
        products: catalogueProducts,
        totalCount: catalogueProducts.length,
        totalPages: Math.ceil(catalogueProducts.length / pageSize) || 0,
        currentPage: page,
        query,
        suggestions: [],
        took: Date.now() - startTime,
        vidhyasPicks: VIDHYAS_PICKS_LIST as any,
      };
    }
  }

  return {
      products,
      totalCount,
      totalPages,
      currentPage: page,
      query,
      suggestions,
      took: Date.now() - startTime,
    };
  } catch (error) {
    console.error('Full-text search exception:', error);
    return fallbackSearch(query, filters, startTime);
  }
}

// ============================================
// SEMANTIC (VECTOR) SEARCH
// ============================================

export async function searchProductsSemantic(
  params: SemanticSearchParams
): Promise<SearchResult> {
  const startTime = Date.now();
  const supabase = await getSupabaseClient();

  const { embedding, filters = {}, similarityThreshold = 0.5, limit = 20, offset = 0 } = params;

  // Validate embedding dimension
  if (!embedding || embedding.length !== 1536) {
    if (formattedProducts.length === 0) {
    const { STORE_CATALOGUE, VIDHYAS_PICKS_LIST } = await import('@/lib/data/store-catalogue');
    const q = query.trim().toLowerCase();
    const localMatches = q
      ? STORE_CATALOGUE.filter((item) => {
          const titleLower = item.title.toLowerCase();
          const catLower = (item.category || '').toLowerCase();
          const subLower = (item.subtitle || '').toLowerCase();
          return titleLower.includes(q) || catLower.includes(q) || subLower.includes(q);
        })
      : [];

    if (localMatches.length > 0) {
      const catalogueProducts = localMatches.map((p) => ({
        id: p.id,
        name: p.title,
        slug: p.href ? p.href.replace('/product/', '').replace('/shop/', '') : p.id,
        description: p.subtitle || null,
        price: p.price,
        compare_at_price: p.originalPrice || null,
        images: [{ id: `img-${p.id}`, url: p.image || '/images/collection-kurtis.jpg', alt_text: p.title, sort_order: 0, is_primary: true }] as any,
        category: p.category ? ({ id: `cat-${p.category}`, name: p.category, slug: p.category.toLowerCase() } as any) : null,
        discount: p.originalPrice && p.price ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100) : 0,
      }));

      return {
        products: catalogueProducts,
        totalCount: catalogueProducts.length,
        totalPages: Math.ceil(catalogueProducts.length / pageSize) || 0,
        currentPage: page,
        query,
        suggestions: [],
        took: Date.now() - startTime,
        vidhyasPicks: VIDHYAS_PICKS_LIST as any,
      };
    }
  }

  return {
      products: [],
      totalCount: 0,
      totalPages: 0,
      currentPage: 1,
      query: '',
      suggestions: [],
      took: Date.now() - startTime,
    };
  }

  try {
    const { data: results, error } = await supabase.rpc('search_products_semantic', {
      query_embedding: embedding,
      category_filter: filters.category || null,
      subcategory_filter: filters.subcategory || null,
      min_price: filters.minPrice || null,
      max_price: filters.maxPrice || null,
      in_stock_only: filters.inStockOnly || false,
      similarity_threshold: similarityThreshold,
      limit_count: limit,
      offset_count: offset,
    });

    if (error) {
      console.error('Semantic search error:', error);
      if (formattedProducts.length === 0) {
    const { STORE_CATALOGUE, VIDHYAS_PICKS_LIST } = await import('@/lib/data/store-catalogue');
    const q = query.trim().toLowerCase();
    const localMatches = q
      ? STORE_CATALOGUE.filter((item) => {
          const titleLower = item.title.toLowerCase();
          const catLower = (item.category || '').toLowerCase();
          const subLower = (item.subtitle || '').toLowerCase();
          return titleLower.includes(q) || catLower.includes(q) || subLower.includes(q);
        })
      : [];

    if (localMatches.length > 0) {
      const catalogueProducts = localMatches.map((p) => ({
        id: p.id,
        name: p.title,
        slug: p.href ? p.href.replace('/product/', '').replace('/shop/', '') : p.id,
        description: p.subtitle || null,
        price: p.price,
        compare_at_price: p.originalPrice || null,
        images: [{ id: `img-${p.id}`, url: p.image || '/images/collection-kurtis.jpg', alt_text: p.title, sort_order: 0, is_primary: true }] as any,
        category: p.category ? ({ id: `cat-${p.category}`, name: p.category, slug: p.category.toLowerCase() } as any) : null,
        discount: p.originalPrice && p.price ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100) : 0,
      }));

      return {
        products: catalogueProducts,
        totalCount: catalogueProducts.length,
        totalPages: Math.ceil(catalogueProducts.length / pageSize) || 0,
        currentPage: page,
        query,
        suggestions: [],
        took: Date.now() - startTime,
        vidhyasPicks: VIDHYAS_PICKS_LIST as any,
      };
    }
  }

  return {
        products: [],
        totalCount: 0,
        totalPages: 0,
        currentPage: 1,
        query: '',
        suggestions: [],
        took: Date.now() - startTime,
      };
    }

    const products = (results || []).map((p: any) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description,
      price: p.price,
      compare_at_price: p.compare_at_price,
      images: p.images || [],
      category: p.category_name ? { id: p.category_id, name: p.category_name, slug: p.category_slug } : null,
      discount: p.compare_at_price ? Math.round(((p.compare_at_price - p.price) / p.compare_at_price) * 100) : 0,
    }));

    if (formattedProducts.length === 0) {
    const { STORE_CATALOGUE, VIDHYAS_PICKS_LIST } = await import('@/lib/data/store-catalogue');
    const q = query.trim().toLowerCase();
    const localMatches = q
      ? STORE_CATALOGUE.filter((item) => {
          const titleLower = item.title.toLowerCase();
          const catLower = (item.category || '').toLowerCase();
          const subLower = (item.subtitle || '').toLowerCase();
          return titleLower.includes(q) || catLower.includes(q) || subLower.includes(q);
        })
      : [];

    if (localMatches.length > 0) {
      const catalogueProducts = localMatches.map((p) => ({
        id: p.id,
        name: p.title,
        slug: p.href ? p.href.replace('/product/', '').replace('/shop/', '') : p.id,
        description: p.subtitle || null,
        price: p.price,
        compare_at_price: p.originalPrice || null,
        images: [{ id: `img-${p.id}`, url: p.image || '/images/collection-kurtis.jpg', alt_text: p.title, sort_order: 0, is_primary: true }] as any,
        category: p.category ? ({ id: `cat-${p.category}`, name: p.category, slug: p.category.toLowerCase() } as any) : null,
        discount: p.originalPrice && p.price ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100) : 0,
      }));

      return {
        products: catalogueProducts,
        totalCount: catalogueProducts.length,
        totalPages: Math.ceil(catalogueProducts.length / pageSize) || 0,
        currentPage: page,
        query,
        suggestions: [],
        took: Date.now() - startTime,
        vidhyasPicks: VIDHYAS_PICKS_LIST as any,
      };
    }
  }

  return {
      products,
      totalCount: products.length,
      totalPages: 1,
      currentPage: 1,
      query: '',
      suggestions: [],
      took: Date.now() - startTime,
    };
  } catch (error) {
    console.error('Semantic search exception:', error);
    if (formattedProducts.length === 0) {
    const { STORE_CATALOGUE, VIDHYAS_PICKS_LIST } = await import('@/lib/data/store-catalogue');
    const q = query.trim().toLowerCase();
    const localMatches = q
      ? STORE_CATALOGUE.filter((item) => {
          const titleLower = item.title.toLowerCase();
          const catLower = (item.category || '').toLowerCase();
          const subLower = (item.subtitle || '').toLowerCase();
          return titleLower.includes(q) || catLower.includes(q) || subLower.includes(q);
        })
      : [];

    if (localMatches.length > 0) {
      const catalogueProducts = localMatches.map((p) => ({
        id: p.id,
        name: p.title,
        slug: p.href ? p.href.replace('/product/', '').replace('/shop/', '') : p.id,
        description: p.subtitle || null,
        price: p.price,
        compare_at_price: p.originalPrice || null,
        images: [{ id: `img-${p.id}`, url: p.image || '/images/collection-kurtis.jpg', alt_text: p.title, sort_order: 0, is_primary: true }] as any,
        category: p.category ? ({ id: `cat-${p.category}`, name: p.category, slug: p.category.toLowerCase() } as any) : null,
        discount: p.originalPrice && p.price ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100) : 0,
      }));

      return {
        products: catalogueProducts,
        totalCount: catalogueProducts.length,
        totalPages: Math.ceil(catalogueProducts.length / pageSize) || 0,
        currentPage: page,
        query,
        suggestions: [],
        took: Date.now() - startTime,
        vidhyasPicks: VIDHYAS_PICKS_LIST as any,
      };
    }
  }

  return {
      products: [],
      totalCount: 0,
      totalPages: 0,
      currentPage: 1,
      query: '',
      suggestions: [],
      took: Date.now() - startTime,
    };
  }
}

// ============================================
// HYBRID SEARCH (Full-text + Semantic)
// ============================================

export async function searchProductsHybrid(
  query: string,
  embedding: number[],
  filters: SearchFilters = {}
): Promise<SearchResult> {
  const startTime = Date.now();
  const supabase = await getSupabaseClient();

  const {
    category,
    subcategory,
    minPrice,
    maxPrice,
    inStockOnly = false,
    page = 1,
    pageSize = 20,
  } = filters;

  const offset = (page - 1) * pageSize;

  // Validate embedding dimension
  if (!embedding || embedding.length !== 1536) {
    // Fall back to full-text only
    return searchProductsFullText(query, filters);
  }

  try {
    const { data: results, error } = await supabase.rpc('search_products_hybrid', {
      query_text: query,
      query_embedding: embedding,
      category_filter: category || null,
      subcategory_filter: subcategory || null,
      min_price: minPrice || null,
      max_price: maxPrice || null,
      in_stock_only: inStockOnly,
      fulltext_weight: 0.5,
      semantic_weight: 0.5,
      similarity_threshold: 0.3,
      limit_count: pageSize,
      offset_count: offset,
    });

    if (error) {
      console.error('Hybrid search error:', error);
      return fallbackSearch(query, filters, startTime);
    }

    const products = (results || []).map((p: any) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description,
      price: p.price,
      compare_at_price: p.compare_at_price,
      images: p.images || [],
      category: p.category_name ? { id: p.category_id, name: p.category_name, slug: p.category_slug } : null,
      discount: p.compare_at_price ? Math.round(((p.compare_at_price - p.price) / p.compare_at_price) * 100) : 0,
    }));

    // Get total count estimate
    const { count } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
      .textSearch('search_vector', query, { type: 'websearch' });

    const totalCount = count || products.length;
    const totalPages = Math.ceil(totalCount / pageSize);

    const suggestions = await getSearchSuggestions(query, 5);

    if (formattedProducts.length === 0) {
    const { STORE_CATALOGUE, VIDHYAS_PICKS_LIST } = await import('@/lib/data/store-catalogue');
    const q = query.trim().toLowerCase();
    const localMatches = q
      ? STORE_CATALOGUE.filter((item) => {
          const titleLower = item.title.toLowerCase();
          const catLower = (item.category || '').toLowerCase();
          const subLower = (item.subtitle || '').toLowerCase();
          return titleLower.includes(q) || catLower.includes(q) || subLower.includes(q);
        })
      : [];

    if (localMatches.length > 0) {
      const catalogueProducts = localMatches.map((p) => ({
        id: p.id,
        name: p.title,
        slug: p.href ? p.href.replace('/product/', '').replace('/shop/', '') : p.id,
        description: p.subtitle || null,
        price: p.price,
        compare_at_price: p.originalPrice || null,
        images: [{ id: `img-${p.id}`, url: p.image || '/images/collection-kurtis.jpg', alt_text: p.title, sort_order: 0, is_primary: true }] as any,
        category: p.category ? ({ id: `cat-${p.category}`, name: p.category, slug: p.category.toLowerCase() } as any) : null,
        discount: p.originalPrice && p.price ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100) : 0,
      }));

      return {
        products: catalogueProducts,
        totalCount: catalogueProducts.length,
        totalPages: Math.ceil(catalogueProducts.length / pageSize) || 0,
        currentPage: page,
        query,
        suggestions: [],
        took: Date.now() - startTime,
        vidhyasPicks: VIDHYAS_PICKS_LIST as any,
      };
    }
  }

  return {
      products,
      totalCount,
      totalPages,
      currentPage: page,
      query,
      suggestions,
      took: Date.now() - startTime,
    };
  } catch (error) {
    console.error('Hybrid search exception:', error);
    return fallbackSearch(query, filters, startTime);
  }
}

// ============================================
// UNIFIED SEARCH (Auto-detects best method)
// ============================================

export async function searchProducts(
  query: string,
  filters: SearchFilters = {}
): Promise<SearchResult> {
  // If query is empty, return empty results
  if (!query || query.trim().length === 0) {
    if (formattedProducts.length === 0) {
    const { STORE_CATALOGUE, VIDHYAS_PICKS_LIST } = await import('@/lib/data/store-catalogue');
    const q = query.trim().toLowerCase();
    const localMatches = q
      ? STORE_CATALOGUE.filter((item) => {
          const titleLower = item.title.toLowerCase();
          const catLower = (item.category || '').toLowerCase();
          const subLower = (item.subtitle || '').toLowerCase();
          return titleLower.includes(q) || catLower.includes(q) || subLower.includes(q);
        })
      : [];

    if (localMatches.length > 0) {
      const catalogueProducts = localMatches.map((p) => ({
        id: p.id,
        name: p.title,
        slug: p.href ? p.href.replace('/product/', '').replace('/shop/', '') : p.id,
        description: p.subtitle || null,
        price: p.price,
        compare_at_price: p.originalPrice || null,
        images: [{ id: `img-${p.id}`, url: p.image || '/images/collection-kurtis.jpg', alt_text: p.title, sort_order: 0, is_primary: true }] as any,
        category: p.category ? ({ id: `cat-${p.category}`, name: p.category, slug: p.category.toLowerCase() } as any) : null,
        discount: p.originalPrice && p.price ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100) : 0,
      }));

      return {
        products: catalogueProducts,
        totalCount: catalogueProducts.length,
        totalPages: Math.ceil(catalogueProducts.length / pageSize) || 0,
        currentPage: page,
        query,
        suggestions: [],
        took: Date.now() - startTime,
        vidhyasPicks: VIDHYAS_PICKS_LIST as any,
      };
    }
  }

  return {
      products: [],
      totalCount: 0,
      totalPages: 0,
      currentPage: filters.page || 1,
      query: '',
      suggestions: [],
      took: 0,
    };
  }

  // For now, use full-text search as primary
  // Semantic search requires embedding generation which would need an Edge Function
  return searchProductsFullText(query, filters);
}

// ============================================
// SEARCH SUGGESTIONS (Autocomplete)
// ============================================

export async function getSearchSuggestions(
  prefix: string,
  limit = 10
): Promise<SearchSuggestion[]> {
  if (!prefix || prefix.trim().length < 2) {
    return [];
  }

  const supabase = await getSupabaseClient();

  try {
    const { data, error } = await supabase.rpc('get_search_suggestions', {
      prefix_text: prefix,
      limit_count: limit,
    });

    if (error) {
      console.error('Search suggestions error:', error);
      return [];
    }

    return (data || []) as SearchSuggestion[];
  } catch (error) {
    console.error('Search suggestions exception:', error);
    return [];
  }
}

// ============================================
// POPULAR SEARCHES / TRENDING
// ============================================

export async function getPopularSearches(limit = 10): Promise<SearchSuggestion[]> {
  // This would typically come from analytics
  // For now, return popular categories/tags
  const supabase = await getSupabaseClient();

  try {
    const { data: categories } = await supabase
      .from('categories')
      .select('name, products(count)')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .limit(limit);

    return (categories || []).map((c: any) => ({
      suggestion: c.name,
      type: 'category' as const,
      count: c.products?.length || 0,
    }));
  } catch (error) {
    console.error('Popular searches error:', error);
    return [];
  }
}

// ============================================
// FALLBACK SIMPLE SEARCH
// ============================================

async function fallbackSearch(
  query: string,
  filters: SearchFilters,
  startTime: number
): Promise<SearchResult> {
  const supabase = await getSupabaseClient();

  const {
    category,
    subcategory,
    minPrice,
    maxPrice,
    inStockOnly = false,
    page = 1,
    pageSize = 20,
  } = filters;

  const offset = (page - 1) * pageSize;

  let queryBuilder = supabase
    .from('products')
    .select(
      `
      id,
      name,
      slug,
      description,
      price,
      compare_at_price,
      category_id,
      category:categories(id, name, slug),
      product_images!product_images_product_id_fkey(id, url, alt_text, sort_order, is_primary)
    `,
      { count: 'exact' }
    )
    .eq('is_active', true)
    .or(`name.ilike.%${query}%,description.ilike.%${query}%,short_description.ilike.%${query}%`);

  if (category) queryBuilder = queryBuilder.eq('category_id', category);
  if (subcategory) queryBuilder = queryBuilder.eq('subcategory_id', subcategory);
  if (minPrice) queryBuilder = queryBuilder.gte('price', minPrice);
  if (maxPrice) queryBuilder = queryBuilder.lte('price', maxPrice);

  if (inStockOnly) {
    // This would require a more complex query - skip for fallback
  }

  queryBuilder = queryBuilder
    .order('created_at', { ascending: false })
    .range(offset, offset + pageSize - 1);

  const { data: products, error, count } = await queryBuilder;

  if (error) {
    console.error('Fallback search error:', error);
    const { STORE_CATALOGUE, VIDHYAS_PICKS_LIST } = await import('@/lib/data/store-catalogue');
    const q = query.trim().toLowerCase();
    const localMatches = q
      ? STORE_CATALOGUE.filter((item) => {
          const titleLower = item.title.toLowerCase();
          const catLower = (item.category || '').toLowerCase();
          const subLower = (item.subtitle || '').toLowerCase();
          return titleLower.includes(q) || catLower.includes(q) || subLower.includes(q);
        })
      : [];

    const catalogueProducts = localMatches.map((p) => ({
      id: p.id,
      name: p.title,
      slug: p.href ? p.href.replace('/product/', '').replace('/shop/', '') : p.id,
      description: p.subtitle || null,
      price: p.price,
      compare_at_price: p.originalPrice || null,
      images: [{ id: `img-${p.id}`, url: p.image || '/images/collection-kurtis.jpg', alt_text: p.title, sort_order: 0, is_primary: true }] as any,
      category: p.category ? ({ id: `cat-${p.category}`, name: p.category, slug: p.category.toLowerCase() } as any) : null,
      discount: p.originalPrice && p.price ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100) : 0,
    }));

    if (formattedProducts.length === 0) {
    const { STORE_CATALOGUE, VIDHYAS_PICKS_LIST } = await import('@/lib/data/store-catalogue');
    const q = query.trim().toLowerCase();
    const localMatches = q
      ? STORE_CATALOGUE.filter((item) => {
          const titleLower = item.title.toLowerCase();
          const catLower = (item.category || '').toLowerCase();
          const subLower = (item.subtitle || '').toLowerCase();
          return titleLower.includes(q) || catLower.includes(q) || subLower.includes(q);
        })
      : [];

    if (localMatches.length > 0) {
      const catalogueProducts = localMatches.map((p) => ({
        id: p.id,
        name: p.title,
        slug: p.href ? p.href.replace('/product/', '').replace('/shop/', '') : p.id,
        description: p.subtitle || null,
        price: p.price,
        compare_at_price: p.originalPrice || null,
        images: [{ id: `img-${p.id}`, url: p.image || '/images/collection-kurtis.jpg', alt_text: p.title, sort_order: 0, is_primary: true }] as any,
        category: p.category ? ({ id: `cat-${p.category}`, name: p.category, slug: p.category.toLowerCase() } as any) : null,
        discount: p.originalPrice && p.price ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100) : 0,
      }));

      return {
        products: catalogueProducts,
        totalCount: catalogueProducts.length,
        totalPages: Math.ceil(catalogueProducts.length / pageSize) || 0,
        currentPage: page,
        query,
        suggestions: [],
        took: Date.now() - startTime,
        vidhyasPicks: VIDHYAS_PICKS_LIST as any,
      };
    }
  }

  return {
      products: catalogueProducts,
      totalCount: catalogueProducts.length,
      totalPages: Math.ceil(catalogueProducts.length / pageSize) || 0,
      currentPage: page,
      query,
      suggestions: [],
      took: Date.now() - startTime,
      vidhyasPicks: VIDHYAS_PICKS_LIST as any,
    };
    /* original return */
    if (formattedProducts.length === 0) {
    const { STORE_CATALOGUE, VIDHYAS_PICKS_LIST } = await import('@/lib/data/store-catalogue');
    const q = query.trim().toLowerCase();
    const localMatches = q
      ? STORE_CATALOGUE.filter((item) => {
          const titleLower = item.title.toLowerCase();
          const catLower = (item.category || '').toLowerCase();
          const subLower = (item.subtitle || '').toLowerCase();
          return titleLower.includes(q) || catLower.includes(q) || subLower.includes(q);
        })
      : [];

    if (localMatches.length > 0) {
      const catalogueProducts = localMatches.map((p) => ({
        id: p.id,
        name: p.title,
        slug: p.href ? p.href.replace('/product/', '').replace('/shop/', '') : p.id,
        description: p.subtitle || null,
        price: p.price,
        compare_at_price: p.originalPrice || null,
        images: [{ id: `img-${p.id}`, url: p.image || '/images/collection-kurtis.jpg', alt_text: p.title, sort_order: 0, is_primary: true }] as any,
        category: p.category ? ({ id: `cat-${p.category}`, name: p.category, slug: p.category.toLowerCase() } as any) : null,
        discount: p.originalPrice && p.price ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100) : 0,
      }));

      return {
        products: catalogueProducts,
        totalCount: catalogueProducts.length,
        totalPages: Math.ceil(catalogueProducts.length / pageSize) || 0,
        currentPage: page,
        query,
        suggestions: [],
        took: Date.now() - startTime,
        vidhyasPicks: VIDHYAS_PICKS_LIST as any,
      };
    }
  }

  return {
      products: [],
      totalCount: 0,
      totalPages: 0,
      currentPage: page,
      query,
      suggestions: [],
      took: Date.now() - startTime,
    };
  }

  const formattedProducts = (products || []).map((p: any) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    price: p.price,
    compare_at_price: p.compare_at_price,
    images: p.product_images || [],
    category: p.category,
    discount: p.compare_at_price ? Math.round(((p.compare_at_price - p.price) / p.compare_at_price) * 100) : 0,
  }));

  const totalCount = count || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  if (formattedProducts.length === 0) {
    const { STORE_CATALOGUE, VIDHYAS_PICKS_LIST } = await import('@/lib/data/store-catalogue');
    const q = query.trim().toLowerCase();
    const localMatches = q
      ? STORE_CATALOGUE.filter((item) => {
          const titleLower = item.title.toLowerCase();
          const catLower = (item.category || '').toLowerCase();
          const subLower = (item.subtitle || '').toLowerCase();
          return titleLower.includes(q) || catLower.includes(q) || subLower.includes(q);
        })
      : [];

    if (localMatches.length > 0) {
      const catalogueProducts = localMatches.map((p) => ({
        id: p.id,
        name: p.title,
        slug: p.href ? p.href.replace('/product/', '').replace('/shop/', '') : p.id,
        description: p.subtitle || null,
        price: p.price,
        compare_at_price: p.originalPrice || null,
        images: [{ id: `img-${p.id}`, url: p.image || '/images/collection-kurtis.jpg', alt_text: p.title, sort_order: 0, is_primary: true }] as any,
        category: p.category ? ({ id: `cat-${p.category}`, name: p.category, slug: p.category.toLowerCase() } as any) : null,
        discount: p.originalPrice && p.price ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100) : 0,
      }));

      return {
        products: catalogueProducts,
        totalCount: catalogueProducts.length,
        totalPages: Math.ceil(catalogueProducts.length / pageSize) || 0,
        currentPage: page,
        query,
        suggestions: [],
        took: Date.now() - startTime,
        vidhyasPicks: VIDHYAS_PICKS_LIST as any,
      };
    }
  }

  return {
    products: formattedProducts,
    totalCount,
    totalPages,
    currentPage: page,
    query,
    suggestions: [],
    took: Date.now() - startTime,
  };
}

// ============================================
// GENERATE EMBEDDINGS (for admin use)
// ============================================

export interface EmbeddingResult {
  success: boolean;
  processed: number;
  failed: number;
  errors?: string[];
}

export async function generateProductEmbeddings(
  productIds?: string[]
): Promise<EmbeddingResult> {
  // This would typically call an Edge Function or external API
  // to generate OpenAI embeddings for products
  // For now, return not implemented
  if (formattedProducts.length === 0) {
    const { STORE_CATALOGUE, VIDHYAS_PICKS_LIST } = await import('@/lib/data/store-catalogue');
    const q = query.trim().toLowerCase();
    const localMatches = q
      ? STORE_CATALOGUE.filter((item) => {
          const titleLower = item.title.toLowerCase();
          const catLower = (item.category || '').toLowerCase();
          const subLower = (item.subtitle || '').toLowerCase();
          return titleLower.includes(q) || catLower.includes(q) || subLower.includes(q);
        })
      : [];

    if (localMatches.length > 0) {
      const catalogueProducts = localMatches.map((p) => ({
        id: p.id,
        name: p.title,
        slug: p.href ? p.href.replace('/product/', '').replace('/shop/', '') : p.id,
        description: p.subtitle || null,
        price: p.price,
        compare_at_price: p.originalPrice || null,
        images: [{ id: `img-${p.id}`, url: p.image || '/images/collection-kurtis.jpg', alt_text: p.title, sort_order: 0, is_primary: true }] as any,
        category: p.category ? ({ id: `cat-${p.category}`, name: p.category, slug: p.category.toLowerCase() } as any) : null,
        discount: p.originalPrice && p.price ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100) : 0,
      }));

      return {
        products: catalogueProducts,
        totalCount: catalogueProducts.length,
        totalPages: Math.ceil(catalogueProducts.length / pageSize) || 0,
        currentPage: page,
        query,
        suggestions: [],
        took: Date.now() - startTime,
        vidhyasPicks: VIDHYAS_PICKS_LIST as any,
      };
    }
  }

  return {
    success: false,
    processed: 0,
    failed: 0,
    errors: ['Embedding generation not yet implemented - requires Edge Function with OpenAI API'],
  };
}
