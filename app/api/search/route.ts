import { NextRequest, NextResponse } from 'next/server';
import { searchProducts, getSearchSuggestions, getPopularSearches } from '@/lib/actions/search';

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

        const result = await searchProducts(query, {
          category,
          subcategory,
          minPrice,
          maxPrice,
          inStockOnly,
          sortBy,
          page,
          pageSize,
        });

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