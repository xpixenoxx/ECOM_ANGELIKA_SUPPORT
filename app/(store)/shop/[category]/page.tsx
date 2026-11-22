export const runtime = 'edge';

import { notFound } from 'next/navigation';
import { getProductsByCategory, getCategoryBySlug } from '@/lib/actions/shop';
import type { ShopProductCard } from '@/lib/actions/shop-types';
import { getSiteContent, SalwarProductItem, SalwarsPageContent, LehengasPageContent, SareesPageContent, DupattasPageContent } from '@/lib/actions/site-content';
import { CategoryPageClient } from './CategoryPageClient';

// ISR: rebuilds at most every 120s. For immediate updates, POST /api/revalidate
export const dynamic = 'force-dynamic';

async function _disabledStaticParams() {
  // Pre-build common categories at deploy time
  return [
    { category: 'kurtis' },
    { category: 'sarees' },
    { category: 'lehengas' },
    { category: 'salwars' },
    { category: 'dupattas' },
  ];
}

function inferCategoryOccasions(item: any, categorySlug: string): string[] {
  if (Array.isArray(item.occasion) && item.occasion.length > 0) {
    return item.occasion;
  }
  if (typeof item.occasion === 'string' && item.occasion.trim().length > 0) {
    return [item.occasion.trim()];
  }
  const text = `${item.name || ''} ${item.style || ''} ${item.tags ? (Array.isArray(item.tags) ? item.tags.join(' ') : item.tags) : ''} ${item.fabric || ''} ${categorySlug}`.toLowerCase();
  const occasions = new Set<string>();

  // Wedding & Bridal
  if (text.includes('bridal') || text.includes('zari') || text.includes('zardozi') || text.includes('kanjivaram') || text.includes('banarasi') || text.includes('wedding') || text.includes('brocade')) {
    occasions.add('Wedding');
    occasions.add('Party');
    occasions.add('Festive');
    occasions.add('Reception');
  }

  // Party & Evening
  if (text.includes('party') || text.includes('evening') || text.includes('mukaish') || text.includes('chikankari') || text.includes('sequin') || text.includes('organza') || text.includes('velvet') || text.includes('sharara') || text.includes('cocktail')) {
    occasions.add('Party');
    occasions.add('Festive');
    occasions.add('Celebration');
  }

  // Office & Formal
  if (text.includes('office') || text.includes('work') || text.includes('straight') || text.includes('mulberry') || text.includes('cotton') || text.includes('chanderi') || text.includes('ajrakh') || text.includes('suit') || text.includes('palazzo') || text.includes('3-piece') || text.includes('formal')) {
    occasions.add('Office');
    occasions.add('Workwear');
    occasions.add('Formal');
  }

  // Casual & Daily Wear
  if (text.includes('daily') || text.includes('casual') || text.includes('cotton') || text.includes('mulmul') || text.includes('block print') || text.includes('summer')) {
    occasions.add('Casual');
    occasions.add('Daily Wear');
  }

  if (occasions.size === 0) {
    occasions.add('Festive');
    occasions.add('Celebration');
  }

  return Array.from(occasions);
}

function mapCategoryItemToProductCard(
  item: any,
  index: number,
  categorySlug: string,
  categoryName: string
): ShopProductCard {
  const price = typeof item.price === 'number' ? item.price : Number(item.price) || 7999;
  const originalPrice = item.originalPrice ? (typeof item.originalPrice === 'number' ? item.originalPrice : Number(item.originalPrice) || null) : null;
  const discount = item.discount || (originalPrice && originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0);
  const occasions = inferCategoryOccasions(item, categorySlug);
  const rawTags = Array.isArray(item.tags) ? item.tags : (typeof item.tags === 'string' ? [item.tags] : []);
  const tags = Array.from(new Set([
    ...rawTags,
    item.fabric || '',
    item.color || '',
    item.style || '',
    item.badge || '',
    categoryName,
    ...occasions,
  ])).filter(Boolean);

  const fallbackImg = `/images/collection-${categorySlug}.jpg`;
  const primaryImg = item.image || item.images?.[0]?.url || item.images?.[0] || fallbackImg;

  return {
    id: item.id || `${categorySlug}-${index + 1}`,
    slug: item.slug || `${categorySlug}-${index + 1}`,
    name: item.name,
    price,
    compare_at_price: originalPrice,
    images: [
      {
        id: `img-${item.id || index}`,
        product_id: item.id || `${categorySlug}-${index + 1}`,
        url: primaryImg,
        alt_text: item.name,
        sort_order: 0,
        is_primary: true,
        created_at: new Date().toISOString(),
        type: 'image',
        variant_id: null,
      },
    ] as any,
    image: primaryImg,
    defaultVariantId: `var-${item.id || index}`,
    variants: (item.sizes || ['Free Size']).map((sz: string, szIdx: number) => ({
      id: `var-${item.id || index}-${szIdx}`,
      size: sz,
      price,
      compare_at_price: originalPrice,
      inventory_quantity: item.inStock !== false ? 10 : 0,
    })),
    category: {
      id: `cat-${categorySlug}`,
      name: categoryName,
      slug: categorySlug,
      description: null,
      image_url: primaryImg,
      parent_id: null,
      sort_order: 1,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as any,
    discount,
    is_featured: true,
    is_vidyas_pick: Boolean(item.isVidhyasPick),
    created_at: new Date(Date.now() - index * 86400000).toISOString(),
    rating: typeof item.rating === 'number' ? item.rating : 4.8,
    review_count: typeof item.reviewCount === 'number' ? item.reviewCount : 12,
    fabric: item.fabric || 'Pure Silk',
    tags,
    occasion: occasions,
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

  const [initialCategory, siteContent] = await Promise.all([
    getCategoryBySlug(categorySlug),
    getSiteContent(),
  ]);

  let salwarsContent: SalwarsPageContent | null = null;
  let lehengasContent: LehengasPageContent | null = null;
  let sareesContent: SareesPageContent | null = null;
  let dupattasContent: DupattasPageContent | null = null;
  if (categorySlug === 'salwars') {
    salwarsContent = siteContent['salwars-page'] || null;
  } else if (categorySlug === 'lehengas') {
    lehengasContent = siteContent['lehengas-page'] || null;
  } else if (categorySlug === 'sarees') {
    sareesContent = siteContent['sarees-page'] || null;
  } else if (categorySlug === 'dupattas') {
    dupattasContent = siteContent['dupattas-page'] || null;
  }

  // Get category info
  let category = initialCategory;
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
  } else if (!category) {
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

  const toArray = (param: string | string[] | undefined) => {
    if (!param) return undefined;
    const raw = Array.isArray(param) ? param : [param];
    const split = raw.flatMap((s) => s.split(',')).map((s) => s.trim()).filter(Boolean);
    return split.length > 0 ? split : undefined;
  };

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

  let { products, totalCount, totalPages } = await getProductsByCategory(
    categorySlug,
    filters,
    sortBy,
    page,
    48
  );

  const kurtisContent = (categorySlug || '').toLowerCase() === 'kurtis' ? (siteContent as any)?.['kurtis-page'] : undefined;

  const cmsProductMap: Record<string, any[] | undefined> = {
    salwars: salwarsContent?.products,
    lehengas: lehengasContent?.products,
    sarees: sareesContent?.products,
    dupattas: dupattasContent?.products,
    kurtis: kurtisContent?.products,
  };
  const cmsList = cmsProductMap[categorySlug];
  const hasRealDbProducts = products.some(
    (p) => typeof p.defaultVariantId === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-/i.test(p.defaultVariantId)
  );
  if (!hasRealDbProducts && cmsList && cmsList.length > 0) {
    const categoryName = category?.name || categorySlug;
    let adminProducts = cmsList.map((item, idx) =>
      mapCategoryItemToProductCard(item, idx, categorySlug, categoryName)
    );
    if (filters.vidhyasPicksOnly) {
      adminProducts = adminProducts.filter((p) => p.is_vidyas_pick);
    }
    if (filters.inStockOnly) {
      adminProducts = adminProducts.filter((p) =>
        (p.variants || []).some((v: any) => (v.inventory_quantity ?? 1) > 0)
      );
    }
    if (filters.priceRange) {
      const [minP, maxP] = filters.priceRange;
      adminProducts = adminProducts.filter((p) => p.price >= minP && p.price <= maxP);
    }
    if (filters.occasion && filters.occasion.length > 0) {
      const wanted = filters.occasion.map((o) => o.toLowerCase());
      adminProducts = adminProducts.filter((p) =>
        wanted.some((w) => {
          const hay = `${(p.occasion || []).join(' ')} ${(p.tags || []).join(' ')} ${p.name || ''} ${(p as any).style || ''}`.toLowerCase();
          if (w === 'casual' && (hay.includes('casual') || hay.includes('daily'))) return true;
          if (w === 'office' && (hay.includes('office') || hay.includes('work') || hay.includes('formal'))) return true;
          if (w === 'party' && (hay.includes('party') || hay.includes('festive') || hay.includes('wedding') || hay.includes('reception') || hay.includes('evening') || hay.includes('sangeet') || hay.includes('cocktail'))) return true;
          return hay.includes(w);
        })
      );
    }
    if (filters.type && filters.type.length > 0) {
      const wantedTypes = filters.type.map((t) => t.toLowerCase());
      adminProducts = adminProducts.filter((p) => {
        const hay = `${(p.tags || []).join(' ')} ${p.name || ''} ${p.slug || ''} ${(p as any).style || ''}`.toLowerCase();
        return wantedTypes.some((t) => {
          if (t === 'anarkali' && (hay.includes('anarkali') || hay.includes('frock') || hay.includes('flared'))) return true;
          if (t === 'frock' && (hay.includes('frock') || hay.includes('anarkali') || hay.includes('flared'))) return true;
          if (t === 'coord-sets' && (hay.includes('coord') || hay.includes('co-ord') || hay.includes('set') || hay.includes('pants'))) return true;
          return hay.includes(t);
        });
      });
    }
    if (sortBy === 'price-asc') adminProducts.sort((a, b) => a.price - b.price);
    else if (sortBy === 'price-desc') adminProducts.sort((a, b) => b.price - a.price);
    else if (sortBy === 'discount') adminProducts.sort((a, b) => b.discount - a.discount);

    products = adminProducts;
    totalCount = adminProducts.length;
    totalPages = 1;
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
