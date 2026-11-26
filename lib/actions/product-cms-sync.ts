'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { hasValidSupabaseConfig, isCloudServerlessEnv } from '@/lib/env';
import { DEFAULT_SITE_CONTENT } from '@/lib/services/content/defaults';
import type { Json } from '@/types/database';

const CATEGORY_SLUG_TO_PAGE_SECTION: Record<string, string> = {
  kurtis: 'kurtis-page',
  salwars: 'salwars-page',
  lehengas: 'lehengas-page',
  sarees: 'sarees-page',
  dupattas: 'dupattas-page',
};

const PAGE_SECTION_TO_CATEGORY_SLUG: Record<string, string> = {
  'kurtis-page': 'kurtis',
  'salwars-page': 'salwars',
  'lehengas-page': 'lehengas',
  'sarees-page': 'sarees',
  'dupattas-page': 'dupattas',
};

export async function getCategoryPageSectionMap(): Promise<Record<string, string>> {
  return CATEGORY_SLUG_TO_PAGE_SECTION;
}

export async function getPageSectionToCategorySlugMap(): Promise<Record<string, string>> {
  return PAGE_SECTION_TO_CATEGORY_SLUG;
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function normalizeSlug(raw: string, fallback = 'garment'): string {
  const cleaned = (raw || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '');
  return cleaned || fallback;
}

function extractCmsSlug(item: any): string {
  if (typeof item?.slug === 'string' && item.slug.trim()) {
    return normalizeSlug(item.slug);
  }
  if (typeof item?.href === 'string' && item.href.trim()) {
    const stripped = item.href.replace(/^\/product\//i, '').replace(/^\//, '');
    if (stripped) return normalizeSlug(stripped);
  }
  return normalizeSlug(String(item?.name || 'product'));
}

async function readLocalSiteJson(): Promise<Record<string, any>> {
  if (isCloudServerlessEnv()) return {};
  try {
    const fsModule = await import('fs/promises');
    const fs = (fsModule as any).default || fsModule;
    const pathModule = await import('path');
    const path = (pathModule as any).default || pathModule;
    const raw = await fs.readFile(path.join(process.cwd(), 'data', 'site-content.json'), 'utf-8');
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

async function writeLocalSiteJson(content: Record<string, any>): Promise<void> {
  if (isCloudServerlessEnv()) return;
  try {
    const fsModule = await import('fs/promises');
    const fs = (fsModule as any).default || fsModule;
    const pathModule = await import('path');
    const path = (pathModule as any).default || pathModule;
    const dir = path.join(process.cwd(), 'data');
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(path.join(dir, 'site-content.json'), JSON.stringify(content, null, 2), 'utf-8');
  } catch {
    // Non-blocking on read-only environments
  }
}

function formatFabricLabel(rawFabric: unknown, fallback = 'Cotton & Silk'): string {
  if (typeof rawFabric === 'string') {
    const trimmed = rawFabric.trim();
    if (trimmed && trimmed !== '[object Object]') return trimmed;
    return fallback;
  }
  if (rawFabric && typeof rawFabric === 'object') {
    const obj = rawFabric as Record<string, unknown>;
    if (typeof obj['name'] === 'string' && obj['name'].trim()) return obj['name'].trim();
    const parts = [
      typeof obj['main'] === 'string' && obj['main'].trim() ? `Top: ${obj['main'].trim()}` : null,
      typeof obj['bottom'] === 'string' && obj['bottom'].trim() ? `Bottom: ${obj['bottom'].trim()}` : null,
      typeof obj['dupatta'] === 'string' && obj['dupatta'].trim() ? `Dupatta: ${obj['dupatta'].trim()}` : null,
    ].filter(Boolean);
    if (parts.length > 0) return parts.join(', ');
    const candidate = obj['main'] ?? obj['label'] ?? obj['type'];
    if (typeof candidate === 'string' && candidate.trim()) return candidate.trim();
  }
  return fallback;
}

/**
 * Maps a Supabase product row (with variants + images) to the CMS section item shape.
 */
function mapDbProductToCmsItem(
  prod: any,
  categorySlug: string,
  existingById: Map<string, any>,
  existingBySlug: Map<string, any>
) {
  const existing = existingById.get(prod.id) || existingBySlug.get((prod.slug || '').toLowerCase());
  const variants = Array.isArray(prod.product_variants) ? prod.product_variants : [];
  const activeVariants = variants.filter((v: any) => v.is_active !== false);
  const pool = activeVariants.length > 0 ? activeVariants : variants;

  const prices = pool.map((v: any) => Number(v.price)).filter((n: number) => !isNaN(n) && n > 0);
  const price = prices.length > 0 ? Math.min(...prices) : (existing?.price ?? 3999);

  const comparePrices = pool
    .map((v: any) => Number(v.compare_at_price))
    .filter((n: number) => !isNaN(n) && n > 0);
  const originalPrice = comparePrices.length > 0
    ? Math.min(...comparePrices)
    : (existing?.originalPrice ?? undefined);

  const discount =
    originalPrice && originalPrice > price
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : 0;

  const totalStock = variants.reduce((sum: number, v: any) => sum + Number(v.inventory_quantity || 0), 0);
  const inStock = variants.length === 0 ? true : totalStock > 0;

  const sortedImages = [...(prod.product_images || [])].sort(
    (a: any, b: any) => (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0) || (a.sort_order ?? 0) - (b.sort_order ?? 0)
  );
  const primaryImage = sortedImages[0]?.url || existing?.image || `/images/collection-${categorySlug}.jpg`;

  const sizes = Array.from(
    new Set(
      pool
        .map((v: any) => (typeof v.size === 'string' ? v.size.trim() : ''))
        .filter(Boolean)
    )
  );

  if (categorySlug === 'kurtis') {
    return {
      id: prod.id,
      name: prod.name,
      category: 'KURTIS',
      slug: prod.slug,
      price,
      originalPrice: originalPrice || null,
      discount,
      image: primaryImage,
      href: `/product/${prod.slug}`,
      isNew: Boolean(prod.is_featured),
      isVidhyasPick: Boolean(prod.is_vidyas_pick),
      fabric: formatFabricLabel(prod.fabric, formatFabricLabel(existing?.fabric, 'Cotton & Silk')),
      rating: existing?.rating ?? 4.8,
      reviewCount: existing?.reviewCount ?? 12,
      inStock,
    };
  }

  const labelMap: Record<string, string> = {
    salwars: 'Salwars',
    lehengas: 'Lehengas',
    sarees: 'Sarees',
    dupattas: 'Dupattas',
  };

  return {
    id: prod.id,
    name: prod.name,
    category: labelMap[categorySlug] || categorySlug,
    slug: prod.slug,
    price,
    originalPrice: originalPrice || price,
    discount,
    image: primaryImage,
    style: existing?.style || `${labelMap[categorySlug] || 'Couture'} Ensemble`,
    fabric: formatFabricLabel(prod.fabric, formatFabricLabel(existing?.fabric, 'Pure Silk')),
    color: existing?.color || 'Signature Gold',
    sizes: sizes.length > 0 ? sizes : (existing?.sizes || ['S', 'M', 'L', 'XL']),
    badge: prod.is_featured ? 'NEW' : (existing?.badge || ''),
    inStock,
    isVidhyasPick: Boolean(prod.is_vidyas_pick),
    rating: existing?.rating ?? 4.8,
    reviewCount: existing?.reviewCount ?? 12,
  };
}

/**
 * Direction 1: Syncs active products in Supabase for a category slug into its
 * corresponding Static Page CMS section (`kurtis-page`, `salwars-page`, etc.).
 */
export async function syncDbCategoryToCmsSection(categorySlug: string | null | undefined): Promise<void> {
  if (!categorySlug || !hasValidSupabaseConfig()) return;
  const slug = categorySlug.toLowerCase().trim();
  const sectionId = CATEGORY_SLUG_TO_PAGE_SECTION[slug];
  if (!sectionId) return;

  try {
    const { data: catRow } = await supabaseAdmin
      .from('categories')
      .select('id, name, slug')
      .eq('slug', slug)
      .maybeSingle();

    if (!catRow?.id) return;

    const { data: dbProducts, error: prodErr } = await supabaseAdmin
      .from('products')
      .select(`
        id, name, slug, fabric, is_active, is_featured, is_vidyas_pick, tags, created_at, updated_at,
        product_variants ( id, size, price, compare_at_price, inventory_quantity, is_active, sort_order ),
        product_images ( url, is_primary, sort_order )
      `)
      .eq('category_id', catRow.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (prodErr || !dbProducts) return;

    const { data: existingBlock } = await supabaseAdmin
      .from('content_blocks')
      .select('id, type, content')
      .eq('key', sectionId)
      .maybeSingle();

    const localData = await readLocalSiteJson();
    const defaultSec = (DEFAULT_SITE_CONTENT as any)[sectionId] || {};
    const currentSec =
      (existingBlock?.content && typeof existingBlock.content === 'object' ? existingBlock.content : null) ||
      localData[sectionId] ||
      defaultSec;

    const existingList = Array.isArray((currentSec as any)?.products) ? (currentSec as any).products : [];
    const existingById = new Map<string, any>();
    const existingBySlug = new Map<string, any>();
    for (const item of existingList) {
      if (item?.id) existingById.set(String(item.id), item);
      const itemSlug = extractCmsSlug(item);
      if (itemSlug) existingBySlug.set(itemSlug, item);
    }

    const syncedProducts = dbProducts.map((p: any) =>
      mapDbProductToCmsItem(p, slug, existingById, existingBySlug)
    );

    const timestamp = new Date().toISOString();
    const nextSection = {
      ...defaultSec,
      ...currentSec,
      products: syncedProducts,
      _products_synced_at: timestamp,
      _updated_at: timestamp,
    };

    const payload = {
      key: sectionId,
      type: existingBlock?.type || 'text_block',
      title: sectionId,
      content: nextSection as unknown as Json,
      is_active: true,
      updated_at: timestamp,
    };

    if (existingBlock?.id) {
      await supabaseAdmin.from('content_blocks').update(payload).eq('id', existingBlock.id);
    } else {
      await supabaseAdmin.from('content_blocks').insert(payload);
    }

    localData[sectionId] = nextSection;
    await writeLocalSiteJson(localData);

    try {
      revalidateTag('site-content');
      revalidatePath('/');
      revalidatePath('/shop');
      revalidatePath(`/shop/${slug}`);
      revalidatePath('/admin/content');
      revalidatePath('/admin/products');
      revalidatePath('/new-arrivals');
      revalidatePath('/vidhyas-picks');
    } catch {
      // Non-blocking outside request context
    }
  } catch (err) {
    console.warn(`[syncDbCategoryToCmsSection] failed for ${slug}:`, err);
  }
}

/**
 * Resolves live active products from Supabase for all 5 CMS category sections when
 * a CMS section has not yet been synced (initial load alignment).
 */
export async function fetchInitialSyncedCategoryProducts(sectionId: string): Promise<any[] | null> {
  const slug = PAGE_SECTION_TO_CATEGORY_SLUG[sectionId];
  if (!slug || !hasValidSupabaseConfig()) return null;

  try {
    const { data: catRow } = await supabaseAdmin
      .from('categories')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();

    if (!catRow?.id) return null;

    const { data: dbProducts, error } = await supabaseAdmin
      .from('products')
      .select(`
        id, name, slug, fabric, is_active, is_featured, is_vidyas_pick, tags, created_at, updated_at,
        product_variants ( id, size, price, compare_at_price, inventory_quantity, is_active, sort_order ),
        product_images ( url, is_primary, sort_order )
      `)
      .eq('category_id', catRow.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error || !dbProducts || dbProducts.length === 0) return null;

    const defaultSec = (DEFAULT_SITE_CONTENT as any)[sectionId] || {};
    const defaultList = Array.isArray(defaultSec.products) ? defaultSec.products : [];
    const byId = new Map<string, any>();
    const bySlug = new Map<string, any>();
    for (const item of defaultList) {
      if (item?.id) byId.set(String(item.id), item);
      bySlug.set(extractCmsSlug(item), item);
    }

    return dbProducts.map((p: any) => mapDbProductToCmsItem(p, slug, byId, bySlug));
  } catch {
    return null;
  }
}

/**
 * Direction 2: Syncs products edited inside a Static Page category editor
 * (`kurtis-page`, `salwars-page`, `lehengas-page`, `sarees-page`, `dupattas-page`)
 * back into Supabase `products`, `product_variants`, and `product_images`.
 */
export async function syncCmsCategoryToDb(
  sectionId: string,
  cmsProducts: any[]
): Promise<any[]> {
  const categorySlug = PAGE_SECTION_TO_CATEGORY_SLUG[sectionId];
  if (!categorySlug || !hasValidSupabaseConfig() || !Array.isArray(cmsProducts)) {
    return cmsProducts;
  }

  try {
    const { data: catRow } = await supabaseAdmin
      .from('categories')
      .select('id, name, slug')
      .eq('slug', categorySlug)
      .maybeSingle();

    if (!catRow?.id) return cmsProducts;

    const { data: existingDbProducts } = await supabaseAdmin
      .from('products')
      .select('id, slug, name, fabric, is_active, tags')
      .eq('category_id', catRow.id);

    const dbById = new Map<string, any>();
    const dbBySlug = new Map<string, any>();
    for (const row of existingDbProducts || []) {
      dbById.set(row.id, row);
      if (row.slug) dbBySlug.set(row.slug.toLowerCase(), row);
    }

    const syncedIds = new Set<string>();
    const normalizedItems: any[] = [];
    const now = new Date().toISOString();

    for (let idx = 0; idx < cmsProducts.length; idx++) {
      const item = cmsProducts[idx];
      if (!item || !item.name) continue;

      const desiredSlug = extractCmsSlug(item);
      const matched =
        (typeof item.id === 'string' && UUID_REGEX.test(item.id) ? dbById.get(item.id) : undefined) ||
        dbBySlug.get(desiredSlug);

      const price = Math.max(0, Number(item.price) || 0);
      const compareAt =
        item.originalPrice && Number(item.originalPrice) > price ? Number(item.originalPrice) : null;
      const inStock = item.inStock !== false;
      const isVidhyasPick = Boolean(item.isVidhyasPick);
      const isFeatured = Boolean(item.isNew || item.badge === 'NEW');
      const sizes: string[] =
        Array.isArray(item.sizes) && item.sizes.length > 0 ? item.sizes : ['S', 'M', 'L', 'XL'];
      const imageUrl = (item.image || `/images/collection-${categorySlug}.jpg`).trim();

      const cleanFabricText =
        typeof item.fabric === 'string' && item.fabric.trim() && item.fabric.trim() !== '[object Object]'
          ? item.fabric.trim()
          : (item.fabric && typeof item.fabric === 'object' ? formatFabricLabel(item.fabric, '') : '');

      if (matched) {
        syncedIds.add(matched.id);

        let nextFabric: any = undefined;
        if (cleanFabricText) {
          if (matched.fabric && typeof matched.fabric === 'object' && !Array.isArray(matched.fabric)) {
            nextFabric = { ...matched.fabric, main: cleanFabricText };
          } else {
            nextFabric = cleanFabricText;
          }
        }

        await supabaseAdmin
          .from('products')
          .update({
            name: String(item.name).trim(),
            slug: matched.slug || desiredSlug,
            ...(nextFabric !== undefined ? { fabric: nextFabric } : {}),
            is_active: true,
            is_featured: isFeatured,
            is_vidyas_pick: isVidhyasPick,
            updated_at: now,
          })
          .eq('id', matched.id);

        // Sync variants pricing & stock
        const { data: existingVars } = await supabaseAdmin
          .from('product_variants')
          .select('id, size, inventory_quantity')
          .eq('product_id', matched.id);

        if (existingVars && existingVars.length > 0) {
          for (const v of existingVars) {
            const nextQty = !inStock
              ? 0
              : (Number(v.inventory_quantity) || 0) > 0
                ? Number(v.inventory_quantity)
                : 10;
            await supabaseAdmin
              .from('product_variants')
              .update({
                price,
                compare_at_price: compareAt,
                inventory_quantity: nextQty,
                is_active: true,
                updated_at: now,
              })
              .eq('id', v.id);
          }
        } else {
          await supabaseAdmin.from('product_variants').insert(
            sizes.map((sz, sIdx) => ({
              product_id: matched.id,
              size: sz,
              price,
              compare_at_price: compareAt,
              inventory_quantity: inStock ? 15 : 0,
              is_active: true,
              sort_order: sIdx + 1,
            }))
          );
        }

        // Sync primary image reliably: set uploaded imageUrl as sole primary (sort_order: 1), preserving secondary gallery images
        const { data: existingImgs } = await supabaseAdmin
          .from('product_images')
          .select('id, url, is_primary, sort_order')
          .eq('product_id', matched.id)
          .order('is_primary', { ascending: false })
          .order('sort_order', { ascending: true });

        const currentPrimary = existingImgs?.[0];
        const hasMultiplePrimaries = (existingImgs || []).filter((img: any) => img.is_primary).length > 1;

        if (!currentPrimary || currentPrimary.url !== imageUrl || !currentPrimary.is_primary || hasMultiplePrimaries) {
          const secondaryUrls = (existingImgs || [])
            .slice(1)
            .map((img: any) => img.url)
            .filter((u: string) => Boolean(u) && u !== imageUrl);

          const { error: delImgErr } = await supabaseAdmin
            .from('product_images')
            .delete()
            .eq('product_id', matched.id);

          if (!delImgErr) {
            const imgRows = [imageUrl, ...secondaryUrls].map((url, imgIdx) => ({
              product_id: matched.id,
              url,
              is_primary: imgIdx === 0,
              sort_order: imgIdx + 1,
            }));
            const { error: insImgErr } = await supabaseAdmin
              .from('product_images')
              .insert(imgRows);
            if (insImgErr) {
              console.warn(`[syncCmsCategoryToDb] product_images insert failed for ${matched.id}:`, insImgErr.message);
            }
          } else if (currentPrimary) {
            await supabaseAdmin
              .from('product_images')
              .update({ is_primary: false })
              .eq('product_id', matched.id);
            await supabaseAdmin
              .from('product_images')
              .update({ url: imageUrl, is_primary: true, sort_order: 1 })
              .eq('id', currentPrimary.id);
          }
        }

        const resolvedSlug = matched.slug || desiredSlug;
        normalizedItems.push({
          ...item,
          id: matched.id,
          slug: resolvedSlug,
          fabric: formatFabricLabel(nextFabric ?? matched.fabric, cleanFabricText || 'Cotton & Silk'),
          ...(categorySlug === 'kurtis' ? { href: `/product/${resolvedSlug}` } : {}),
        });
      } else {
        // Check global slug collision before insert
        const { data: slugCollision } = await supabaseAdmin
          .from('products')
          .select('id')
          .eq('slug', desiredSlug)
          .maybeSingle();

        const finalSlug = slugCollision ? `${desiredSlug}-${Date.now().toString().slice(-4)}` : desiredSlug;
        const prefix =
          String(item.name)
            .split(' ')
            .slice(0, 2)
            .map((w: string) => w.substring(0, 2).toUpperCase())
            .join('')
            .replace(/[^A-Z]/g, '') || 'GAR';
        const sku = `AF-${prefix}-${Math.floor(1000 + Math.random() * 9000)}`;

        const { data: insertedProd, error: insErr } = await supabaseAdmin
          .from('products')
          .insert({
            name: String(item.name).trim(),
            slug: finalSlug,
            sku,
            category_id: catRow.id,
            description: `Handcrafted ${String(item.name).trim()} from Angelika Fashions ${catRow.name} collection.`,
            fabric: cleanFabricText || null,
            is_active: true,
            is_featured: isFeatured,
            is_vidyas_pick: isVidhyasPick,
            tags: ['handcrafted', categorySlug, 'return-days:7'],
          })
          .select('id, slug')
          .single();

        if (!insErr && insertedProd) {
          syncedIds.add(insertedProd.id);

          await supabaseAdmin.from('product_variants').insert(
            sizes.map((sz, sIdx) => ({
              product_id: insertedProd.id,
              size: sz,
              price,
              compare_at_price: compareAt,
              inventory_quantity: inStock ? 15 : 0,
              is_active: true,
              sort_order: sIdx + 1,
            }))
          );

          await supabaseAdmin.from('product_images').insert({
            product_id: insertedProd.id,
            url: imageUrl,
            is_primary: true,
            sort_order: 1,
          });

          normalizedItems.push({
            ...item,
            id: insertedProd.id,
            slug: insertedProd.slug,
            ...(categorySlug === 'kurtis' ? { href: `/product/${insertedProd.slug}` } : {}),
          });
        } else {
          normalizedItems.push(item);
        }
      }
    }

    // Handle removals: any active DB product in this category omitted from cmsProducts is deleted (or deactivated if FK-linked)
    const toRemoveIds = (existingDbProducts || [])
      .filter((row: any) => row.is_active && !syncedIds.has(row.id))
      .map((row: any) => row.id);

    for (const delId of toRemoveIds) {
      await supabaseAdmin.from('product_variants').delete().eq('product_id', delId);
      await supabaseAdmin.from('product_images').delete().eq('product_id', delId);
      const { error: delErr } = await supabaseAdmin.from('products').delete().eq('id', delId);
      if (delErr) {
        // Safely archive if referenced by past orders
        await supabaseAdmin
          .from('products')
          .update({ is_active: false, updated_at: now })
          .eq('id', delId);
      }
    }

    try {
      revalidatePath('/admin/products');
      revalidatePath('/');
      revalidatePath('/shop');
      revalidatePath(`/shop/${categorySlug}`);
      revalidatePath('/new-arrivals');
      revalidatePath('/vidhyas-picks');
    } catch {
      // Non-blocking
    }

    return normalizedItems;
  } catch (err) {
    console.warn(`[syncCmsCategoryToDb] failed for ${sectionId}:`, err);
    return cmsProducts;
  }
}

/**
 * Syncs changes made in Admin -> Collections & Looks (`looks` + `look_hotspots`)
 * back into the `shop-the-look` CMS block and `data/site-content.json`, and
 * revalidates both `/` and admin content pages.
 */
export async function syncLooksToSiteContent(): Promise<void> {
  if (!hasValidSupabaseConfig()) return;

  try {
    const { data: activeLooks } = await supabaseAdmin
      .from('looks')
      .select(`
        id,
        name,
        lifestyle_image_url,
        lifestyle_image_alt,
        display_order,
        look_hotspots!look_hotspots_look_id_fkey (
          id,
          x_percent,
          y_percent,
          display_order,
          product:products!look_hotspots_product_id_fkey (
            id,
            name,
            slug,
            product_variants!product_variants_product_id_fkey ( price, compare_at_price, is_active ),
            product_images!product_images_product_id_fkey ( url, is_primary, sort_order )
          )
        )
      `)
      .eq('is_active', true)
      .order('display_order', { ascending: true })
      .order('updated_at', { ascending: false })
      .limit(1);

    const topLook: any = activeLooks?.[0] || null;
    const { data: existingBlock } = await supabaseAdmin
      .from('content_blocks')
      .select('id, type, content')
      .eq('key', 'shop-the-look')
      .maybeSingle();

    const localData = await readLocalSiteJson();
    const defaultSec = (DEFAULT_SITE_CONTENT as any)['shop-the-look'] || {};
    const currentSec =
      (existingBlock?.content && typeof existingBlock.content === 'object' ? existingBlock.content : null) ||
      localData['shop-the-look'] ||
      defaultSec;

    const timestamp = new Date().toISOString();
    let nextSection: Record<string, any>;

    if (topLook) {
      const sortedHotspots = [...(topLook.look_hotspots || [])].sort(
        (a: any, b: any) => (a.display_order ?? 0) - (b.display_order ?? 0)
      );
      const firstHs = sortedHotspots[0];
      const hsProd = firstHs?.product;
      const activeVars = (hsProd?.product_variants || []).filter((v: any) => v.is_active !== false);
      const cheapestVar = [...activeVars].sort((a: any, b: any) => Number(a.price) - Number(b.price))[0];
      const sortedImgs = [...(hsProd?.product_images || [])].sort(
        (a: any, b: any) => (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0) || (a.sort_order ?? 0) - (b.sort_order ?? 0)
      );

      nextSection = {
        ...defaultSec,
        ...currentSec,
        title: topLook.name || currentSec.title || defaultSec.title,
        lifestyle_image_url: topLook.lifestyle_image_url || currentSec.lifestyle_image_url || defaultSec.lifestyle_image_url,
        lifestyle_image_alt: topLook.lifestyle_image_alt || topLook.name || currentSec.lifestyle_image_alt,
        ...(firstHs
          ? {
              pinX: Number(firstHs.x_percent ?? currentSec.pinX ?? 47),
              pinY: Number(firstHs.y_percent ?? currentSec.pinY ?? 64),
            }
          : {}),
        ...(hsProd
          ? {
              productName: hsProd.name,
              productSlug: hsProd.slug,
              productPrice: cheapestVar ? Number(cheapestVar.price) : currentSec.productPrice,
              productOriginalPrice: cheapestVar?.compare_at_price
                ? Number(cheapestVar.compare_at_price)
                : currentSec.productOriginalPrice,
              productImage: sortedImgs[0]?.url || currentSec.productImage,
            }
          : {}),
        _looks_synced_at: timestamp,
        _updated_at: timestamp,
      };
    } else {
      nextSection = {
        ...defaultSec,
        ...currentSec,
        lifestyle_image_url: '',
        _looks_synced_at: timestamp,
        _updated_at: timestamp,
      };
    }

    const payload = {
      key: 'shop-the-look',
      type: existingBlock?.type || 'image_gallery',
      title: 'Shop The Look (Interactive Pins)',
      content: nextSection as unknown as Json,
      is_active: Boolean(topLook),
      updated_at: timestamp,
    };

    if (existingBlock?.id) {
      await supabaseAdmin.from('content_blocks').update(payload).eq('id', existingBlock.id);
    } else {
      await supabaseAdmin.from('content_blocks').insert(payload);
    }

    localData['shop-the-look'] = nextSection;
    await writeLocalSiteJson(localData);

    try {
      revalidateTag('site-content');
      revalidatePath('/');
      revalidatePath('/admin/content');
      revalidatePath('/admin/products/collections');
      revalidatePath('/admin/looks');
    } catch {
      // Non-blocking outside request context
    }
  } catch (err) {
    console.warn('[syncLooksToSiteContent] failed:', err);
  }
}
