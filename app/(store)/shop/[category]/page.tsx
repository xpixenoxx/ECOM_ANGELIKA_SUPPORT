import { notFound } from 'next/navigation';
import { getProductsByCategory, getCategoryBySlug } from '@/lib/actions/shop';
import type { ShopProductCard } from '@/lib/actions/shop-types';
import { getSiteContent, SalwarProductItem, SalwarsPageContent, LehengasPageContent, SareesPageContent, DupattasPageContent } from '@/lib/actions/site-content';
import { CategoryPageClient } from './CategoryPageClient';

export async function generateStaticParams() {
  // This is optional - for static generation of popular categories
  return [];
}

function mapSalwarItemToProductCard(item: SalwarProductItem, index: number): ShopProductCard {
  const price = typeof item.price === 'number' ? item.price : Number(item.price) || 7999;
  const originalPrice = item.originalPrice ? (typeof item.originalPrice === 'number' ? item.originalPrice : Number(item.originalPrice) || null) : null;
  const discount = item.discount || (originalPrice && originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0);

  return {
    id: item.id || `salwar-${index + 1}`,
    slug: item.slug || `salwar-${index + 1}`,
    name: item.name,
    price,
    compare_at_price: originalPrice,
    images: [
      {
        id: `img-${item.id || index}`,
        product_id: item.id || `salwar-${index + 1}`,
        url: item.image || '/images/collection-salwars.jpg',
        alt_text: item.name,
        sort_order: 0,
        is_primary: true,
        created_at: new Date().toISOString(),
        type: 'image',
        variant_id: null,
      },
    ] as any,
    image: item.image || '/images/collection-salwars.jpg',
    defaultVariantId: `var-${item.id || index}`,
    variants: (item.sizes || ['S', 'M', 'L']).map((sz, szIdx) => ({
      id: `var-${item.id || index}-${szIdx}`,
      size: sz,
      price,
      compare_at_price: originalPrice,
      inventory_quantity: item.inStock !== false ? 10 : 0,
    })),
    category: {
      id: 'cat-salwars',
      name: 'Salwars',
      slug: 'salwars',
      description: 'Salwar Kameez & Suits',
      image_url: '/images/collection-salwars.jpg',
      parent_id: null,
      sort_order: 2,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as any,
    discount,
    is_featured: Boolean((item as any).isFeatured || (item as any).is_featured),
    is_vidyas_pick: Boolean(item.isVidhyasPick),
    created_at: new Date(Date.now() - index * 86400000).toISOString(),
    rating: typeof item.rating === 'number' ? item.rating : 4.8,
    review_count: typeof item.reviewCount === 'number' ? item.reviewCount : (18 + index * 4),
    fabric: item.fabric || 'Chanderi Silk',
    tags: [item.fabric || 'Silk', item.color || 'Ivory', item.style || 'Suit', item.badge || 'New'],
    occasion: ['Festive', 'Wedding Guest', 'Celebration'],
  };
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

  const siteContent = await getSiteContent();
  let salwarsContent: SalwarsPageContent | null = null;
  let lehengasContent: LehengasPageContent | null = null;
  let sareesContent: SareesPageContent | null = null;
  let dupattasContent: DupattasPageContent | null = null;
  let kurtisContent: any = null;

  if (categorySlug === 'salwars') {
    salwarsContent = siteContent['salwars-page'] || null;
  } else if (categorySlug === 'lehengas') {
    lehengasContent = siteContent['lehengas-page'] || null;
  } else if (categorySlug === 'sarees') {
    sareesContent = siteContent['sarees-page'] || null;
  } else if (categorySlug === 'dupattas') {
    dupattasContent = siteContent['dupattas-page'] || null;
  } else if (categorySlug === 'kurtis') {
    kurtisContent = siteContent['kurtis-page'] || null;
  }

  // Get category info
  let category = await getCategoryBySlug(categorySlug);
  if (!category && categorySlug === 'salwars') {
    category = {
      id: 'cat-salwars',
      name: salwarsContent?.hero?.title || 'Salwar Kameez & Suits',
      slug: 'salwars',
      description: salwarsContent?.hero?.description || 'Graceful salwar suits crafted with royal zari, banarasi weaves, and artisanal embroidery.',
      parent_id: null,
      image_url: salwarsContent?.hero?.backgroundImage || '/images/collections/salwars-hero.jpg',
      sort_order: 2,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as any;
  } else if (!category && categorySlug === 'lehengas') {
    category = {
      id: 'cat-lehengas',
      name: lehengasContent?.hero?.title || 'Lehengas',
      slug: 'lehengas',
      description: lehengasContent?.hero?.description || 'Bridal & festive lehengas handcrafted in pure silks, organzas, and ornate zardozi embroidery.',
      parent_id: null,
      image_url: lehengasContent?.hero?.backgroundImage || '/images/collections/lehengas-hero.jpg',
      sort_order: 3,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as any;
  } else if (!category && categorySlug === 'sarees') {
    category = {
      id: 'cat-sarees',
      name: sareesContent?.hero?.title || 'Sarees',
      slug: 'sarees',
      description: sareesContent?.hero?.description || 'Silk, cotton & chiffon drapes handcrafted by heritage weavers.',
      parent_id: null,
      image_url: sareesContent?.hero?.backgroundImage || '/images/collections/sarees-hero.jpg',
      sort_order: 4,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as any;
  } else if (!category && categorySlug === 'dupattas') {
    category = {
      id: 'cat-dupattas',
      name: dupattasContent?.hero?.title || 'Dupattas',
      slug: 'dupattas',
      description: dupattasContent?.hero?.description || 'Embroidered & printed accents handcrafted by traditional artisans.',
      parent_id: null,
      image_url: dupattasContent?.hero?.backgroundImage || '/images/collection-dupattas.jpg',
      sort_order: 5,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as any;
  } else if (!category && categorySlug === 'kurtis') {
    category = {
      id: 'cat-kurtis',
      name: kurtisContent?.title || 'Kurtis',
      slug: 'kurtis',
      description: kurtisContent?.description || 'Discover our complete range of handcrafted Indian ethnic kurtis, tunics, and anarkalis, thoughtfully made with artisanal perfection.',
      parent_id: null,
      image_url: kurtisContent?.cardImage || kurtisContent?.heroImage || '/images/collection-kurtis.jpg',
      sort_order: 1,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as any;
  } else if (!category) {
    // Universal fallback for any custom category slug configured in admin Category Showcase
    const formattedName = categorySlug
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

    category = {
      id: `cat-${categorySlug}`,
      name: formattedName,
      slug: categorySlug,
      description: `Handcrafted luxury collection of ${formattedName}. Rooted in craft, elevated for today.`,
      parent_id: null,
      image_url: '/images/hero-new-couture.jpg',
      sort_order: 10,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as any;
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

  const sortBy = (sortParam as string) || 'featured';
  const page = Number(pageParam) || 1;

  let { products, totalCount, totalPages } = await getProductsByCategory(
    categorySlug,
    filters,
    sortBy,
    page,
    48
  );

  // Admin-curated content products for fallback or catalog augmentation
  let categoryContentProducts: SalwarProductItem[] | undefined;
  if (categorySlug === 'salwars') {
    categoryContentProducts = salwarsContent?.products;
  } else if (categorySlug === 'lehengas') {
    categoryContentProducts = lehengasContent?.products;
  } else if (categorySlug === 'sarees') {
    categoryContentProducts = sareesContent?.products;
  } else if (categorySlug === 'dupattas') {
    categoryContentProducts = dupattasContent?.products;
  } else if (categorySlug === 'kurtis' && kurtisContent?.productsMode !== 'database') {
    categoryContentProducts = kurtisContent?.products;
  }

  if (categoryContentProducts && categoryContentProducts.length > 0) {
    const adminProducts = categoryContentProducts.map(mapSalwarItemToProductCard);

    if (!products || products.length === 0) {
      products = adminProducts;
      totalCount = adminProducts.length;
      totalPages = 1;
    } else {
      // Database products exist (e.g. newly created products from /admin/products)
      // Deduplicate against admin-curated items by slug and ID so all database products are preserved
      const existingSlugs = new Set(products.map((p) => p.slug));
      const existingIds = new Set(products.map((p) => p.id));
      const additional = adminProducts.filter(
        (ap) => !existingSlugs.has(ap.slug) && !existingIds.has(ap.id)
      );
      if (additional.length > 0) {
        products = [...products, ...additional];
      }
      // Ensure featured products (starred by admin) appear first in the category
      products.sort((a, b) => {
        if (a.is_featured && !b.is_featured) return -1;
        if (!a.is_featured && b.is_featured) return 1;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
      totalCount = products.length;
      totalPages = Math.ceil(totalCount / 48) || 1;
    }
  }

  return (
    <CategoryPageClient
      category={category as any}
      initialProducts={products}
      totalCount={totalCount}
      totalPages={totalPages}
      currentPage={page}
      sortBy={sortBy}
      initialFilters={filters}
      categorySlug={categorySlug}
      kurtisContent={kurtisContent}
      salwarsContent={salwarsContent}
      lehengasContent={lehengasContent}
      sareesContent={sareesContent}
      dupattasContent={dupattasContent}
    />
  );
}
