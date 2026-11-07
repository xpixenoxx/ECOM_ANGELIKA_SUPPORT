import { getAllProducts } from '@/lib/actions/shop';
import { CategoryPageClient } from './[category]/CategoryPageClient';
import type { Metadata } from 'next';
import { getSiteContent } from '@/lib/actions/site-content';

export async function generateMetadata(): Promise<Metadata> {
  const siteContent = await getSiteContent();
  const shopContent = siteContent?.['shop-page'];
  return {
    title: shopContent?.seo?.metaTitle || 'Shop All Collections | Angelika Fashions',
    description: shopContent?.seo?.metaDescription || 'Explore the complete Angelika collection of handcrafted luxury ethnic wear, kurtis, sarees, lehengas, and salwars.',
  };
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;

  const getParam = (key: string) => sp[key as keyof typeof sp];

  const categoriesParam = getParam('categories');
  const fabricsParam = getParam('fabrics');
  const colorsParam = getParam('colors');
  const sizesParam = getParam('sizes');
  const priceRangeParam = getParam('priceRange');
  const inStockOnlyParam = getParam('inStockOnly');
  const vidhyasPicksOnlyParam = getParam('vidhyasPicksOnly');
  const sortParam = getParam('sort');
  const pageParam = getParam('page');
  const searchParam = getParam('search') || getParam('q');

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
    categories: categoriesParam ? (Array.isArray(categoriesParam) ? categoriesParam : [categoriesParam]) : undefined,
    fabrics: fabricsParam ? (Array.isArray(fabricsParam) ? fabricsParam : [fabricsParam]) : undefined,
    colors: colorsParam ? (Array.isArray(colorsParam) ? colorsParam : [colorsParam]) : undefined,
    sizes: sizesParam ? (Array.isArray(sizesParam) ? sizesParam : [sizesParam]) : undefined,
    priceRange: parsePriceRange(priceRangeParam),
    inStockOnly: inStockOnlyParam === 'true',
    vidhyasPicksOnly: vidhyasPicksOnlyParam === 'true',
    search: searchParam ? (Array.isArray(searchParam) ? searchParam[0] : searchParam) : undefined,
  };

  const sortBy = (sortParam as string) || 'newest';
  const page = Number(pageParam) || 1;

  const { products, totalCount, totalPages } = await getAllProducts(
    filters,
    sortBy,
    page,
    48
  );

  const siteContent = await getSiteContent();
  const shopContent = siteContent?.['shop-page'];

  const shopCategory = {
    id: 'all',
    name: shopContent?.hero?.title || 'All Collections',
    slug: '',
    description: shopContent?.hero?.description || 'Explore our complete collection of handcrafted kurtis, sarees, salwars, lehengas, and dupattas.',
    image_url: shopContent?.hero?.backgroundImage || '/images/hero-bg.jpg',
  };

  return (
    <CategoryPageClient
      category={shopCategory}
      initialProducts={products}
      totalCount={totalCount}
      totalPages={totalPages}
      currentPage={page}
      sortBy={sortBy}
      initialFilters={filters}
      categorySlug=""
      shopContent={shopContent}
    />
  );
}
