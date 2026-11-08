'use server';

import { supabaseAdmin } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// Helper to get administrative database client that bypasses RLS
function getAdminDb() {
  if (process.env['SUPABASE_SERVICE_ROLE_KEY']) {
    return supabaseAdmin;
  }
  return createClient();
}

export interface AdminProduct {
  id: string;
  sku: string | null;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  compare_at_price: number | null;
  category_id: string | null;
  category_name: string | null;
  category_slug: string | null;
  is_active: boolean;
  is_featured: boolean;
  is_vidyas_pick: boolean;
  images: string[];
  tags: string[] | null;
  variant_count: number;
  total_inventory: number;
  created_at: string;
  updated_at: string;
}

export interface AdminCategory {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  description: string | null;
  image_url: string | null;
  is_active: boolean;
  sort_order: number;
  product_count?: number;
  created_at?: string;
}

export interface AdminCollection {
  id: string;
  name: string;
  lifestyle_image_url: string | null;
  lifestyle_image_alt: string | null;
  is_active: boolean;
  display_order: number;
  created_at?: string;
  hotspots_count?: number;
}

export interface ProductFilters {
  search?: string;
  category?: string;
  status?: string;
  sortBy?: 'newest' | 'name' | 'price-low' | 'price-high' | 'stock' | 'oldest';
  pageSize?: number;
}

export async function getAdminProducts(filters?: {
  search?: string;
  category?: string;
  status?: string;
}) {
  const supabase = getAdminDb();

  const { data: rawProducts, error } = await supabase
    .from('products')
    .select(`
      id, sku, name, slug, description,
      category_id, is_active, is_featured, is_vidyas_pick, tags,
      created_at, updated_at,
      categories:categories!products_category_id_fkey ( name, slug ),
      product_variants ( id, size, price, compare_at_price, inventory_quantity ),
      product_images ( url, is_primary, sort_order )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('getAdminProducts error:', error);
    return { products: [], error: error.message };
  }

  let result: AdminProduct[] = (rawProducts || []).map((p: any) => {
    const variants = p.product_variants || [];
    const images = (p.product_images || [])
      .sort((a: any, b: any) => (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0) || a.sort_order - b.sort_order)
      .map((img: any) => img.url)
      .filter(Boolean);

    // Calculate minimum price among active variants
    const validPrices = variants.map((v: any) => Number(v.price)).filter((n: number) => !isNaN(n) && n > 0);
    const minPrice = validPrices.length > 0 ? Math.min(...validPrices) : 0;

    const comparePrices = variants.map((v: any) => Number(v.compare_at_price)).filter((n: number) => !isNaN(n) && n > 0);
    const comparePrice = comparePrices.length > 0 ? Math.min(...comparePrices) : null;

    const totalInventory = variants.reduce((sum: number, v: any) => sum + Number(v.inventory_quantity || 0), 0);

    return {
      id: p.id,
      sku: p.sku || null,
      name: p.name,
      slug: p.slug,
      description: p.description,
      price: minPrice,
      compare_at_price: comparePrice,
      category_id: p.category_id,
      category_name: p.categories?.name || 'Uncategorized',
      category_slug: p.categories?.slug || null,
      is_active: Boolean(p.is_active),
      is_featured: Boolean(p.is_featured),
      is_vidyas_pick: Boolean(p.is_vidyas_pick),
      images: images.length > 0 ? images : ['/images/placeholder.jpg'],
      tags: p.tags || [],
      variant_count: variants.length,
      total_inventory: totalInventory,
      created_at: p.created_at,
      updated_at: p.updated_at,
    };
  });

  if (filters?.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.description ?? '').toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q) ||
        (p.sku ?? '').toLowerCase().includes(q)
    );
  }

  if (filters?.category && filters.category !== 'all') {
    result = result.filter((p) => p.category_id === filters.category);
  }

  if (filters?.status === 'active') result = result.filter((p) => p.is_active);
  if (filters?.status === 'inactive') result = result.filter((p) => !p.is_active);
  if (filters?.status === 'featured') result = result.filter((p) => p.is_featured);
  if (filters?.status === 'vidyas_pick') result = result.filter((p) => p.is_vidyas_pick);
  if (filters?.status === 'low_stock') result = result.filter((p) => p.total_inventory <= 5);

  return { products: result, error: null };
}

export async function getProductById(id: string) {
  const supabase = getAdminDb();
  const { data: product, error } = await supabase
    .from('products')
    .select(`
      *,
      categories:categories!products_category_id_fkey ( id, name, slug ),
      product_variants ( id, size, price, compare_at_price, cost_price, inventory_quantity, barcode ),
      product_images ( id, url, alt_text, sort_order, is_primary )
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error('getProductById error:', error, 'ID:', id);
    return { product: null, error: error.message };
  }
  return { product, error: null };
}

// Helper to generate SKU
function generateSKU(name: string, categoryId?: string): string {
  const prefix = name
    .split(' ')
    .slice(0, 2)
    .map((w) => w.substring(0, 2).toUpperCase())
    .join('')
    .replace(/[^A-Z]/g, '') || 'GAR';
  const num = Math.floor(1000 + Math.random() * 9000);
  return `AF-${prefix}-${num}`;
}

export async function createProduct(payload: {
  name: string;
  slug: string;
  sku?: string;
  category_id: string;
  description?: string;
  price: number;
  compare_at_price?: number;
  inventory_quantity?: number;
  is_active?: boolean;
  is_featured?: boolean;
  is_vidyas_pick?: boolean;
  images?: string[];
  tags?: string[];
  sizes?: string[];
}) {
  const supabase = getAdminDb();

  const cleanSlug = payload.slug.toLowerCase().trim().replace(/[^a-z0-9-]/g, '-').replace(/(^-|-$)/g, '');
  const sku = (payload.sku && payload.sku.trim()) || generateSKU(payload.name, payload.category_id);

  // 1. Insert product
  const { data: newProd, error: prodErr } = await supabase
    .from('products')
    .insert({
      name: payload.name.trim(),
      slug: cleanSlug,
      sku: sku,
      category_id: payload.category_id,
      description: payload.description || '',
      is_active: payload.is_active ?? true,
      is_featured: payload.is_featured ?? false,
      is_vidyas_pick: payload.is_vidyas_pick ?? false,
      tags: payload.tags || [],
    })
    .select()
    .single();

  if (prodErr) {
    console.error('createProduct error:', prodErr);
    return { success: false, error: prodErr.message };
  }

  // 2. Insert variants (support multi-size or standard)
  const sizes = payload.sizes && payload.sizes.length > 0 ? payload.sizes : ['Standard'];
  const totalStock = payload.inventory_quantity ?? 25;
  const stockPerSize = Math.max(1, Math.floor(totalStock / sizes.length));

  const variantRecords = sizes.map((size, idx) => ({
    product_id: newProd.id,
    size: size,
    price: payload.price,
    compare_at_price: payload.compare_at_price || null,
    inventory_quantity: idx === 0 ? totalStock - stockPerSize * (sizes.length - 1) : stockPerSize,
    is_active: true,
    sort_order: idx + 1,
  }));

  const { error: varErr } = await supabase.from('product_variants').insert(variantRecords);
  if (varErr) {
    console.warn('createProduct variant insert error:', varErr);
  }

  // 3. Insert images
  if (payload.images && payload.images.length > 0) {
    const imgRecords = payload.images.filter(Boolean).map((url, i) => ({
      product_id: newProd.id,
      url: url.trim(),
      is_primary: i === 0,
      sort_order: i + 1,
    }));
    if (imgRecords.length > 0) {
      await supabase.from('product_images').insert(imgRecords);
    }
  }

  revalidatePath('/admin/products');
  revalidatePath('/shop');
  revalidatePath('/');
  return { success: true, data: newProd };
}

export async function updateProduct(
  id: string,
  payload: {
    name?: string;
    slug?: string;
    sku?: string;
    category_id?: string;
    description?: string;
    price?: number;
    compare_at_price?: number;
    inventory_quantity?: number;
    is_active?: boolean;
    is_featured?: boolean;
    is_vidyas_pick?: boolean;
    images?: string[];
    tags?: string[];
    sizes?: string[];
  }
) {
  const supabase = getAdminDb();

  // 1. Update product table
  const prodUpdates: any = { updated_at: new Date().toISOString() };
  if (payload.name !== undefined) prodUpdates.name = payload.name.trim();
  if (payload.slug !== undefined) prodUpdates.slug = payload.slug.toLowerCase().trim().replace(/[^a-z0-9-]/g, '-');
  if (payload.sku !== undefined && payload.sku.trim()) prodUpdates.sku = payload.sku.trim();
  if (payload.category_id !== undefined) prodUpdates.category_id = payload.category_id;
  if (payload.description !== undefined) prodUpdates.description = payload.description;
  if (payload.is_active !== undefined) prodUpdates.is_active = payload.is_active;
  if (payload.is_featured !== undefined) prodUpdates.is_featured = payload.is_featured;
  if (payload.is_vidyas_pick !== undefined) prodUpdates.is_vidyas_pick = payload.is_vidyas_pick;
  if (payload.tags !== undefined) prodUpdates.tags = payload.tags;

  const { error: prodErr } = await supabase.from('products').update(prodUpdates).eq('id', id);
  if (prodErr) {
    console.error('updateProduct error:', prodErr);
    return { success: false, error: prodErr.message };
  }

  // 2. Update variants (pricing, inventory, sizes)
  if (payload.price !== undefined || payload.compare_at_price !== undefined || payload.inventory_quantity !== undefined) {
    const { data: existingVariants } = await supabase.from('product_variants').select('*').eq('product_id', id);

    if (existingVariants && existingVariants.length > 0) {
      const varUpdates: any = { updated_at: new Date().toISOString() };
      if (payload.price !== undefined) varUpdates.price = payload.price;
      if (payload.compare_at_price !== undefined) varUpdates.compare_at_price = payload.compare_at_price || null;

      if (payload.inventory_quantity !== undefined) {
        // Distribute stock across variants
        const stockPerVar = Math.max(0, Math.floor(payload.inventory_quantity / existingVariants.length));
        for (let i = 0; i < existingVariants.length; i++) {
          const v = existingVariants[i];
          const stock = i === 0 ? payload.inventory_quantity - stockPerVar * (existingVariants.length - 1) : stockPerVar;
          await supabase
            .from('product_variants')
            .update({ ...varUpdates, inventory_quantity: stock })
            .eq('id', v.id);
        }
      } else {
        await supabase.from('product_variants').update(varUpdates).eq('product_id', id);
      }
    } else {
      // Create primary variant if none existed
      await supabase.from('product_variants').insert({
        product_id: id,
        size: 'Standard',
        price: payload.price ?? 3999,
        compare_at_price: payload.compare_at_price || null,
        inventory_quantity: payload.inventory_quantity ?? 10,
        is_active: true,
      });
    }
  }

  // 3. Sync images
  if (payload.images !== undefined) {
    // Delete existing product images and re-insert new ones
    await supabase.from('product_images').delete().eq('product_id', id);

    const validImages = payload.images.filter(Boolean);
    if (validImages.length > 0) {
      const imgRecords = validImages.map((url, i) => ({
        product_id: id,
        url: url.trim(),
        is_primary: i === 0,
        sort_order: i + 1,
      }));
      await supabase.from('product_images').insert(imgRecords);
    }
  }

  revalidatePath('/admin/products');
  revalidatePath(`/admin/products/${id}/edit`);
  revalidatePath('/shop');
  revalidatePath('/');
  return { success: true };
}

export async function toggleProductActive(id: string, is_active: boolean) {
  const supabase = getAdminDb();
  const { error } = await supabase
    .from('products')
    .update({ is_active, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) {
    console.error('toggleProductActive error:', error);
    return { error: error.message };
  }
  revalidatePath('/admin/products');
  revalidatePath('/shop');
  return { error: null };
}

export async function toggleProductFeatured(id: string, is_featured: boolean) {
  const supabase = getAdminDb();
  const { error } = await supabase
    .from('products')
    .update({ is_featured, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) {
    console.error('toggleProductFeatured error:', error);
    return { error: error.message };
  }
  revalidatePath('/admin/products');
  revalidatePath('/');
  return { error: null };
}

export async function toggleProductVidyasPick(id: string, is_vidyas_pick: boolean) {
  const supabase = getAdminDb();
  const { error } = await supabase
    .from('products')
    .update({ is_vidyas_pick, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) {
    console.error('toggleProductVidyasPick error:', error);
    return { error: error.message };
  }
  revalidatePath('/admin/products');
  revalidatePath('/');
  revalidatePath('/vidhyas-picks');
  return { error: null };
}

export async function deleteProduct(id: string) {
  const supabase = getAdminDb();
  try {
    // Delete variants and images first to honor foreign keys
    await supabase.from('product_variants').delete().eq('product_id', id);
    await supabase.from('product_images').delete().eq('product_id', id);
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw error;

    revalidatePath('/admin/products');
    revalidatePath('/shop');
    return { success: true, error: null };
  } catch (err: any) {
    console.error('deleteProduct error:', err);
    return { success: false, error: err.message };
  }
}

export async function bulkDeleteProducts(ids: string[]) {
  if (!ids || ids.length === 0) return { success: true, count: 0 };
  const supabase = getAdminDb();
  try {
    await supabase.from('product_variants').delete().in('product_id', ids);
    await supabase.from('product_images').delete().in('product_id', ids);
    const { error } = await supabase.from('products').delete().in('id', ids);
    if (error) throw error;

    revalidatePath('/admin/products');
    revalidatePath('/shop');
    return { success: true, count: ids.length };
  } catch (err: any) {
    console.error('bulkDeleteProducts error:', err);
    return { success: false, error: err.message };
  }
}

export async function bulkUpdateProducts(
  ids: string[],
  updates: { is_active?: boolean; is_featured?: boolean; is_vidyas_pick?: boolean }
) {
  if (!ids || ids.length === 0) return { success: true, count: 0 };
  const supabase = getAdminDb();
  try {
    const payload: any = { updated_at: new Date().toISOString() };
    if (updates.is_active !== undefined) payload.is_active = updates.is_active;
    if (updates.is_featured !== undefined) payload.is_featured = updates.is_featured;
    if (updates.is_vidyas_pick !== undefined) payload.is_vidyas_pick = updates.is_vidyas_pick;

    const { error } = await supabase.from('products').update(payload).in('id', ids);
    if (error) throw error;

    revalidatePath('/admin/products');
    revalidatePath('/shop');
    return { success: true, count: ids.length };
  } catch (err: any) {
    console.error('bulkUpdateProducts error:', err);
    return { success: false, error: err.message };
  }
}

export async function duplicateProduct(id: string) {
  const supabase = getAdminDb();
  try {
    const { product } = await getProductById(id);
    if (!product) throw new Error('Original product not found');

    const newSlug = `${product.slug}-copy-${Date.now().toString().slice(-4)}`;
    const newSku = `${product.sku || 'AF-COPY'}-${Math.floor(100 + Math.random() * 900)}`;

    const { data: newProd, error: pErr } = await supabase
      .from('products')
      .insert({
        name: `${product.name} (Copy)`,
        slug: newSlug,
        sku: newSku,
        category_id: product.category_id,
        description: product.description,
        is_active: false,
        is_featured: false,
        is_vidyas_pick: false,
        tags: product.tags || [],
      })
      .select()
      .single();

    if (pErr) throw pErr;

    // Duplicate variants
    if (product.product_variants && product.product_variants.length > 0) {
      const vars = product.product_variants.map((v: any) => ({
        product_id: newProd.id,
        size: v.size,
        price: v.price,
        compare_at_price: v.compare_at_price,
        inventory_quantity: v.inventory_quantity,
        is_active: v.is_active,
      }));
      await supabase.from('product_variants').insert(vars);
    }

    // Duplicate images
    if (product.product_images && product.product_images.length > 0) {
      const imgs = product.product_images.map((img: any) => ({
        product_id: newProd.id,
        url: img.url,
        is_primary: img.is_primary,
        sort_order: img.sort_order,
      }));
      await supabase.from('product_images').insert(imgs);
    }

    revalidatePath('/admin/products');
    return { success: true, data: newProd };
  } catch (err: any) {
    console.error('duplicateProduct error:', err);
    return { success: false, error: err.message };
  }
}

export interface BulkProductInput {
  name: string;
  slug?: string;
  sku?: string;
  category_id?: string;
  category_name?: string;
  description?: string;
  price: number;
  compare_at_price?: number;
  inventory_quantity?: number;
  is_active?: boolean;
  is_featured?: boolean;
  is_vidyas_pick?: boolean;
  images?: string[];
  tags?: string[];
  sizes?: string[];
}

// Bulk insert products (efficient batching for 50, 100, 500+ items)
export async function bulkCreateProducts(products: BulkProductInput[]) {
  if (!products || products.length === 0) return { success: true, count: 0 };
  const supabase = getAdminDb();

  try {
    // 1. Fetch categories map
    const { data: allCategories } = await supabase.from('categories').select('id, name, slug');
    const defaultCategoryId = allCategories?.[0]?.id || null;
    const catNameToId: Record<string, string> = {};
    (allCategories || []).forEach((c) => {
      catNameToId[c.name.toLowerCase()] = c.id;
      catNameToId[c.slug.toLowerCase()] = c.id;
    });

    let totalInserted = 0;
    const BATCH_SIZE = 50;

    for (let i = 0; i < products.length; i += BATCH_SIZE) {
      const batch = products.slice(i, i + BATCH_SIZE);

      const productsToInsert = batch.map((p, idx) => {
        let catId = p.category_id;
        if (!catId && p.category_name) {
          catId = catNameToId[p.category_name.toLowerCase()] || defaultCategoryId;
        }
        if (!catId) catId = defaultCategoryId;

        const baseSlug = (p.slug || p.name)
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
        const uniqueSlug = `${baseSlug}-${Date.now().toString().slice(-4)}-${i + idx}`;
        const sku = p.sku || `AF-${p.name.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, 'X')}-${1000 + i + idx}`;

        return {
          name: p.name.trim(),
          slug: uniqueSlug,
          sku: sku,
          category_id: catId,
          description: p.description || '',
          is_active: p.is_active ?? true,
          is_featured: p.is_featured ?? false,
          is_vidyas_pick: p.is_vidyas_pick ?? false,
          tags: p.tags || ['ethnic-wear', 'handcrafted'],
        };
      });

      const { data: insertedProds, error: pErr } = await supabase
        .from('products')
        .insert(productsToInsert)
        .select('id, sku');

      if (pErr) throw pErr;

      // Prepare variants and images for inserted batch
      const variantRows: any[] = [];
      const imageRows: any[] = [];

      (insertedProds || []).forEach((newP, bIdx) => {
        const orig = batch[bIdx];
        if (!orig) return;
        const sizes = orig.sizes && orig.sizes.length > 0 ? orig.sizes : ['S', 'M', 'L', 'XL'];
        const stock = orig.inventory_quantity ?? 20;
        const stockPerSize = Math.max(1, Math.floor(stock / sizes.length));

        sizes.forEach((sz, sIdx) => {
          variantRows.push({
            product_id: newP.id,
            size: sz,
            price: orig.price,
            compare_at_price: orig.compare_at_price || null,
            inventory_quantity: sIdx === 0 ? stock - stockPerSize * (sizes.length - 1) : stockPerSize,
            is_active: true,
            sort_order: sIdx + 1,
          });
        });

        const imgs = orig.images && orig.images.length > 0 ? orig.images : ['/images/placeholder.jpg'];
        imgs.forEach((url, imgIdx) => {
          imageRows.push({
            product_id: newP.id,
            url: url.trim(),
            is_primary: imgIdx === 0,
            sort_order: imgIdx + 1,
          });
        });
      });

      if (variantRows.length > 0) {
        await supabase.from('product_variants').insert(variantRows);
      }
      if (imageRows.length > 0) {
        await supabase.from('product_images').insert(imageRows);
      }

      totalInserted += (insertedProds || []).length;
    }

    revalidatePath('/admin/products');
    revalidatePath('/shop');
    return { success: true, count: totalInserted };
  } catch (err: any) {
    console.error('bulkCreateProducts error:', err);
    return { success: false, error: err.message };
  }
}

// ---------------- 1-CLICK BULK CATALOG GENERATOR (500+ Garments) ----------------
const MOCK_FABRICS = ['Banarasi Silk', 'Chanderi Zari', 'Lucknowi Chikankari', 'Kanjivaram Silk', 'Pure Raw Silk', 'Georgette Gota', 'Organza Embroidered', 'Velvet Zardozi', 'Bandhani Silk', 'Modal Silk Ajrakh', 'Chiffon Handpainted'];
const MOCK_COLORS = ['Royal Indigo', 'Crimson Red', 'Emerald Green', 'Pastel Peach', 'Ivory & Gold', 'Mustard Yellow', 'Powder Blue', 'Rani Pink', 'Terracotta Rust', 'Plum Wine', 'Mint Green', 'Deep Ochre'];
const MOCK_TYPES = [
  { name: 'Anarkali Suit Set', cat: 'Salwars', price: 6499, compare: 7999, img: '/images/products/salwar-anarkali-1.jpg' },
  { name: 'Pure Raw Silk Straight Suit', cat: 'Salwars', price: 8999, compare: 10499, img: '/images/products/salwar-rawsilk-1.jpg' },
  { name: 'Chanderi Angrakha Suit', cat: 'Salwars', price: 7499, compare: 8999, img: '/images/products/salwar-angrakha-1.jpg' },
  { name: 'Sharara Set with Zari Embroidery', cat: 'Salwars', price: 9499, compare: 11999, img: '/images/products/salwar-sharara-1.jpg' },
  { name: 'Palazzo Kurta Ensemble', cat: 'Salwars', price: 5999, compare: 7499, img: '/images/products/salwar-palazzo-1.jpg' },
  { name: 'Handcrafted Zari Woven Saree', cat: 'Sarees', price: 14999, compare: 18999, img: '/images/products/saree-banarasi-1.jpg' },
  { name: 'Kanjivaram Pure Silk Saree', cat: 'Sarees', price: 21999, compare: 27999, img: '/images/products/saree-kanjivaram-1.jpg' },
  { name: 'Chanderi Tissue Saree', cat: 'Sarees', price: 8499, compare: 10999, img: '/images/products/saree-chanderi-1.jpg' },
  { name: 'Organza Floral Zari Saree', cat: 'Sarees', price: 9999, compare: 12499, img: '/images/products/saree-organza-1.jpg' },
  { name: 'Lucknowi Shadow Work Chikankari Saree', cat: 'Sarees', price: 12499, compare: 15999, img: '/images/products/saree-chikankari-1.jpg' },
  { name: 'Mulberry Silk Festive Saree', cat: 'Sarees', price: 11499, compare: 14499, img: '/images/products/saree-mulberry-1.jpg' },
  { name: 'Bridal Heritage Zardozi Lehenga', cat: 'Lehengas', price: 34999, compare: 42999, img: '/images/products/lehenga-bridal-1.jpg' },
  { name: 'Sangeet Mirror Work Lehenga', cat: 'Lehengas', price: 24999, compare: 29999, img: '/images/products/lehenga-sangeet-1.jpg' },
  { name: 'Velvet Royal Court Lehenga', cat: 'Lehengas', price: 29999, compare: 36999, img: '/images/products/lehenga-velvet-1.jpg' },
  { name: 'Organza Pastel Floral Lehenga', cat: 'Lehengas', price: 19999, compare: 24999, img: '/images/products/lehenga-organza-1.jpg' },
  { name: 'Lucknowi Chikankari Modal Silk Kurti', cat: 'Kurtis', price: 3999, compare: 4799, img: '/images/products/kurti-lucknowi-1.jpg' },
  { name: 'Kutch Ajrakh Modal Silk Kurti', cat: 'Kurtis', price: 4999, compare: 5999, img: '/images/products/kurti-modal-silk-1.jpg' },
  { name: 'Hand Block Printed Cotton Silk Kurti', cat: 'Kurtis', price: 2499, compare: 3299, img: '/images/products/kurti-block-print-1.jpg' },
  { name: 'Velvet Zari Embroidered Kurti', cat: 'Kurtis', price: 6999, compare: 8499, img: '/images/products/kurti-velvet-1.jpg' },
  { name: 'Chanderi Straight Cut Kurti', cat: 'Kurtis', price: 3499, compare: 4299, img: '/images/products/kurti-chanderi-1.jpg' },
  { name: 'Banarasi Brocade Silk Dupatta', cat: 'Dupattas', price: 4499, compare: 5499, img: '/images/products/dupatta-banarasi-1.jpg' },
  { name: 'Phulkari Hand Embroidered Dupatta', cat: 'Dupattas', price: 3299, compare: 3999, img: '/images/products/dupatta-phulkari-1.jpg' },
  { name: 'Chanderi Gota Patti Dupatta', cat: 'Dupattas', price: 2999, compare: 3799, img: '/images/products/dupatta-chanderi-1.jpg' },
  { name: 'Bandhani Silk Festive Dupatta', cat: 'Dupattas', price: 3499, compare: 4299, img: '/images/products/dupatta-bandhani-1.jpg' },
];

export async function generateBulkDemoProducts(count: number = 50, categoryId?: string) {
  const supabase = getAdminDb();
  const { data: cats } = await supabase.from('categories').select('id, name');
  const catMap: Record<string, string> = {};
  (cats || []).forEach((c) => {
    catMap[c.name.toLowerCase()] = c.id;
  });

  const generated: BulkProductInput[] = [];

  for (let i = 0; i < count; i++) {
    const template = MOCK_TYPES[i % MOCK_TYPES.length]!;
    const fabric = MOCK_FABRICS[(i * 3) % MOCK_FABRICS.length]!;
    const color = MOCK_COLORS[(i * 7) % MOCK_COLORS.length]!;
    const serial = Math.floor(100 + (i % 900));

    const name = `${color} ${fabric} ${template.name} (Vol. ${serial})`;
    const priceVariance = ((i % 5) - 2) * 200;
    const basePrice = Math.max(1499, template.price + priceVariance);
    const comparePrice = basePrice + 1000 + ((i % 3) * 500);
    const stock = 10 + (i % 40);

    const targetCatId = categoryId || catMap[template.cat.toLowerCase()] || cats?.[0]?.id;

    generated.push({
      name,
      category_id: targetCatId,
      description: `Exquisitely crafted ${name.toLowerCase()}. Handwoven with pure ${fabric} fibers, ornate zari borders, and meticulous hand-embroidery. Designed for weddings, festive galas, and bespoke cultural celebrations.`,
      price: basePrice,
      compare_at_price: comparePrice,
      inventory_quantity: stock,
      is_active: true,
      is_featured: i % 4 === 0,
      is_vidyas_pick: i % 5 === 0,
      images: [template.img, template.img.replace('-1.jpg', '-2.jpg')],
      tags: [template.cat.toLowerCase(), fabric.toLowerCase().split(' ')[0] || 'luxury', 'luxury', 'handcrafted'],
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    });
  }

  return await bulkCreateProducts(generated);
}

// ---------------- CATEGORIES CRUD ----------------
export async function getCategories(): Promise<AdminCategory[]> {
  const supabase = getAdminDb();
  const { data: categories, error } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('getCategories error:', error);
    return [];
  }

  // Count products in each category
  const { data: prods } = await supabase.from('products').select('category_id');
  const countMap: Record<string, number> = {};
  (prods || []).forEach((p) => {
    if (p.category_id) countMap[p.category_id] = (countMap[p.category_id] || 0) + 1;
  });

  return (categories || []).map((c) => ({
    ...c,
    product_count: countMap[c.id] || 0,
  }));
}

export async function createCategory(payload: {
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  is_active?: boolean;
}) {
  const supabase = getAdminDb();
  const slug = payload.slug.toLowerCase().trim().replace(/[^a-z0-9-]/g, '-');

  // get max sort_order
  const { data: existing } = await supabase.from('categories').select('sort_order').order('sort_order', { ascending: false }).limit(1);
  const nextOrder = (existing?.[0]?.sort_order || 0) + 1;

  const { data, error } = await supabase
    .from('categories')
    .insert({
      name: payload.name,
      slug,
      description: payload.description || null,
      image_url: payload.image_url || '/images/collection-kurtis.jpg',
      is_active: payload.is_active ?? true,
      sort_order: nextOrder,
    })
    .select()
    .single();

  if (error) return { success: false, error: error.message };
  revalidatePath('/admin/products/categories');
  revalidatePath('/shop');
  revalidatePath('/');
  return { success: true, data };
}

export async function updateCategory(
  id: string,
  payload: {
    name?: string;
    slug?: string;
    description?: string;
    image_url?: string;
    is_active?: boolean;
  }
) {
  const supabase = getAdminDb();
  const updates: any = { updated_at: new Date().toISOString() };
  if (payload.name !== undefined) updates.name = payload.name;
  if (payload.slug !== undefined) updates.slug = payload.slug.toLowerCase().trim().replace(/[^a-z0-9-]/g, '-');
  if (payload.description !== undefined) updates.description = payload.description;
  if (payload.image_url !== undefined) updates.image_url = payload.image_url;
  if (payload.is_active !== undefined) updates.is_active = payload.is_active;

  const { error } = await supabase.from('categories').update(updates).eq('id', id);
  if (error) return { success: false, error: error.message };
  revalidatePath('/admin/products/categories');
  revalidatePath('/shop');
  revalidatePath('/');
  return { success: true };
}

export async function toggleCategoryActive(id: string, is_active: boolean) {
  const supabase = getAdminDb();
  const { error } = await supabase
    .from('categories')
    .update({ is_active, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) return { error: error.message };
  revalidatePath('/admin/products/categories');
  revalidatePath('/shop');
  return { error: null };
}

export async function deleteCategory(id: string) {
  const supabase = getAdminDb();
  const { error } = await supabase.from('categories').delete().eq('id', id);
  if (error) return { error: error.message };
  revalidatePath('/admin/products/categories');
  revalidatePath('/shop');
  return { error: null };
}

// ---------------- COLLECTIONS / LOOKS CRUD ----------------
export async function getAdminCollections(): Promise<AdminCollection[]> {
  const supabase = getAdminDb();
  const { data: looks, error } = await supabase
    .from('looks')
    .select('*, look_hotspots(id)')
    .order('display_order', { ascending: true });

  if (error) {
    console.error('getAdminCollections error:', error);
    return [];
  }

  return (looks || []).map((l: any) => ({
    id: l.id,
    name: l.name,
    lifestyle_image_url: l.lifestyle_image_url,
    lifestyle_image_alt: l.lifestyle_image_alt,
    is_active: l.is_active,
    display_order: l.display_order,
    created_at: l.created_at,
    hotspots_count: (l.look_hotspots || []).length,
  }));
}

export async function toggleCollectionActive(id: string, is_active: boolean) {
  const supabase = getAdminDb();
  const { error } = await supabase
    .from('looks')
    .update({ is_active, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) return { error: error.message };
  revalidatePath('/admin/products/collections');
  revalidatePath('/');
  return { error: null };
}

export async function deleteCollection(id: string) {
  const supabase = getAdminDb();
  await supabase.from('look_hotspots').delete().eq('look_id', id);
  const { error } = await supabase.from('looks').delete().eq('id', id);
  if (error) return { error: error.message };
  revalidatePath('/admin/products/collections');
  revalidatePath('/');
  return { error: null };
}

// ---------------- INVENTORY ALERTS ----------------
export async function getInventoryAlerts() {
  const supabase = getAdminDb();
  const { data, error } = await supabase
    .from('product_variants')
    .select(`
      id, inventory_quantity, size,
      products ( id, name, sku )
    `)
    .lte('inventory_quantity', 10)
    .order('inventory_quantity', { ascending: true })
    .limit(50);

  if (error) return { variants: [], error: error.message };
  return { variants: data || [], error: null };
}

export async function updateVariantInventory(variantId: string, quantity: number) {
  const supabase = getAdminDb();
  const { error } = await supabase
    .from('product_variants')
    .update({ inventory_quantity: quantity, updated_at: new Date().toISOString() })
    .eq('id', variantId);
  if (error) return { error: error.message };
  revalidatePath('/admin/products/inventory');
  return { error: null };
}
