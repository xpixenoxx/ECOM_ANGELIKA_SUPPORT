import { notFound } from 'next/navigation';
import { getProductsByCategory, getCategoryBySlug } from '@/lib/actions/shop';
import type { ShopProductCard } from '@/lib/actions/shop-types';
import { CategoryPageClient } from './CategoryPageClient';

export async function generateStaticParams() {
  // This is optional - for static generation of popular categories
  return [];
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { category: categorySlug } = await params;
  const sp = await searchParams;

  // Get category info
  const category = await getCategoryBySlug(categorySlug);
  if (!category) {
    notFound();
  }

  // Parse filters from search params
  const getParam = (key: string) => sp[key as keyof typeof sp];

  const categoriesParam = getParam('categories');
  const fabricsParam = getParam('fabrics') || getParam('fabric');
  const colorsParam = getParam('colors') || getParam('color');
  const sizesParam = getParam('sizes') || getParam('size');
  const occasionParam = getParam('occasion');
  const typeParam = getParam('type');
  const lengthParam = getParam('length');
  const priceRangeParam = getParam('priceRange');
  const inStockOnlyParam = getParam('inStockOnly');
  const vidhyasPicksOnlyParam = getParam('vidhyasPicksOnly');
  const sortParam = getParam('sort');
  const pageParam = getParam('page');

  const toArray = (param: string | string[] | undefined) =>
    param ? (Array.isArray(param) ? param : [param]) : undefined;

  const parsePriceRange = (param: string | string[] | undefined): [number, number] | undefined => {
    if (!param) return undefined;
    const str = Array.isArray(param) ? param[0] : param;
    if (!str) return undefined;
    const parts = str.split(',').map(Number).filter((n) => !isNaN(n));
    if (parts.length === 0) return undefined;
    const first = parts[0] ?? 0;
    if (parts.length === 1) return [0, first];
    const second = parts[1] ?? 25000;
    return [first, second];
  };

  const filters = {
    categories: toArray(categoriesParam),
    fabrics: toArray(fabricsParam),
    colors: toArray(colorsParam),
    sizes: toArray(sizesParam),
    occasion: toArray(occasionParam),
    type: toArray(typeParam),
    length: toArray(lengthParam),
    priceRange: parsePriceRange(priceRangeParam),
    inStockOnly: inStockOnlyParam === 'true',
    vidhyasPicksOnly: vidhyasPicksOnlyParam === 'true',
  };

  const sortBy = (sortParam as string) || 'newest';
  const page = Number(pageParam) || 1;

  const { products, totalCount, totalPages } = await getProductsByCategory(
    categorySlug,
    filters,
    sortBy,
    page,
    48
  );

  return (
    <CategoryPageClient
      category={category}
      initialProducts={products}
      totalCount={totalCount}
      totalPages={totalPages}
      currentPage={page}
      sortBy={sortBy}
      initialFilters={filters}
      categorySlug={categorySlug}
    />
  );
}