import { NextRequest, NextResponse } from 'next/server';
import { searchProducts, getSearchSuggestions, getPopularSearches } from '@/lib/actions/search';
import { STORE_CATALOGUE, VIDHYAS_PICKS_LIST } from '@/lib/data/store-catalogue';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'search';
    const query = searchParams.get('q') || '';

    switch (action) {
      case 'search': {
        const category = searchParams.get('category') || undefined;
        const subcategory = searchParams.get('subcategory') || undefined;
        const minPrice = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined;
        const maxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined;
        const inStockOnly = searchParams.get('inStockOnly') === 'true';
        const sortBy = (searchParams.get('sortBy') as any) || 'relevance';
        const page = Number(searchParams.get('page')) || 1;
        const pageSize = Number(searchParams.get('pageSize')) || 20;

        let result = await searchProducts(query, {
          category,
          subcategory,
          minPrice,
          maxPrice,
          inStockOnly,
          sortBy,
          page,
          pageSize,
        });

        // If DB returned 0 products, search the fallback store catalogue
        if (!result || !result.products || result.products.length === 0) {
          const q = query.trim().toLowerCase();
          const localMatches = q
            ? STORE_CATALOGUE.filter((item) => {
                const titleLower = item.title.toLowerCase();
                const catLower = (item.category || '').toLowerCase();
                const subLower = (item.subtitle || '').toLowerCase();
                return (
                  titleLower.includes(q) ||
                  catLower.includes(q) ||
                  subLower.includes(q)
                );
              })
            : [];

          result = {
            products: localMatches.map((p) => ({
              id: p.id,
              name: p.title,
              slug: p.href ? p.href.replace('/product/', '').replace('/shop/', '') : p.id,
              description: p.subtitle || null,
              price: p.price || 0,
              compare_at_price: p.originalPrice || null,
              images: [{ id: `img-${p.id}`, url: p.image || '/images/collection-kurtis.jpg', alt_text: p.title, sort_order: 0, is_primary: true }],
              category: p.category ? { id: `cat-${p.category}`, name: p.category, slug: p.category.toLowerCase() } : null,
              discount: p.originalPrice && p.price ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100) : 0,
            })),
            totalCount: localMatches.length,
            totalPages: Math.ceil(localMatches.length / pageSize) || 0,
            currentPage: page,
            query,
            suggestions: [],
            took: 0,
            vidhyasPicks: VIDHYAS_PICKS_LIST,
          } as any;
        } else {
          (result as any).vidhyasPicks = VIDHYAS_PICKS_LIST;
        }

        return NextResponse.json(result);
      }

      case 'suggestions': {
        const limit = Number(searchParams.get('limit')) || 10;
        const suggestions = await getSearchSuggestions(query, limit);
        return NextResponse.json({ suggestions });
      }

      case 'popular': {
        const limit = Number(searchParams.get('limit')) || 10;
        const popular = await getPopularSearches(limit);
        return NextResponse.json({ popular });
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, filters, embedding } = body;

    if (!query && !embedding) {
      return NextResponse.json({ error: 'Query or embedding required' }, { status: 400 });
    }

    // If embedding provided, use semantic/hybrid search
    if (embedding) {
      if (query) {
        // Hybrid search
        const { searchProductsHybrid } = await import('@/lib/actions/search');
        const result = await searchProductsHybrid(query, embedding, filters);
        return NextResponse.json(result);
      } else {
        // Pure semantic search
        const { searchProductsSemantic } = await import('@/lib/actions/search');
        const result = await searchProductsSemantic({ embedding, filters: filters || {} });
        return NextResponse.json(result);
      }
    }

    // Default to full-text search
    const result = await searchProducts(query, filters);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Search API POST error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
