'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

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

export async function getAdminProducts(filters?: {
  search?: string;
  category?: string;
  status?: string;
}) {
  const supabase = createClient();

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
      images: images.length > 0 ? images : ['/images/placeholder-product.jpg'],
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
  const supabase = createClient();
  const { data: product, error } = await supabase
    .from('products')
    .select(`
      *,
      categories:categories!products_category_id_fkey ( id, name, slug ),
      product_variants ( id, size, price, compare_at_price, cost_price, inventory_quantity, sku, barcode ),
      product_images ( id, url, alt_text, sort_order, is_primary )
    `)
    .eq('id', id)
    .single();

  if (error) return { product: null, error: error.message };
  return { product, error: null };
}

export async function createProduct(payload: {
  name: string;
  slug: string;
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
}) {
  const supabase = createClient();

  // 1. Insert product
  const { data: newProd, error: prodErr } = await supabase
    .from('products')
    .insert({
      name: payload.name,
      slug: payload.slug.toLowerCase().trim().replace(/[^a-z0-9-]/g, '-'),
      category_id: payload.category_id,
      description: payload.description || '',
      is_active: payload.is_active ?? true,
      is_featured: payload.is_featured ?? false,
      is_vidyas_pick: payload.is_vidyas_pick ?? false,
      tags: payload.tags || [],
    })
    .select()
    .single();

  if (prodErr) return { success: false, error: prodErr.message };

  // 2. Insert primary variant
  await supabase.from('product_variants').insert({
    product_id: newProd.id,
    size: 'Standard',
    price: payload.price,
    compare_at_price: payload.compare_at_price || null,
    inventory_quantity: payload.inventory_quantity ?? 10,
    is_active: true,
  });

  // 3. Insert images
  if (payload.images && payload.images.length > 0) {
    const imgRecords = payload.images.map((url, i) => ({
      product_id: newProd.id,
      url,
      is_primary: i === 0,
      sort_order: i + 1,
    }));
    await supabase.from('product_images').insert(imgRecords);
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
    category_id?: string;
    description?: string;
    price?: number;
    compare_at_price?: number;
    is_active?: boolean;
    is_featured?: boolean;
    is_vidyas_pick?: boolean;
    images?: string[];
    tags?: string[];
  }
) {
  const supabase = createClient();

  const prodUpdates: any = { updated_at: new Date().toISOString() };
  if (payload.name !== undefined) prodUpdates.name = payload.name;
  if (payload.slug !== undefined) prodUpdates.slug = payload.slug;
  if (payload.category_id !== undefined) prodUpdates.category_id = payload.category_id;
  if (payload.description !== undefined) prodUpdates.description = payload.description;
  if (payload.is_active !== undefined) prodUpdates.is_active = payload.is_active;
  if (payload.is_featured !== undefined) prodUpdates.is_featured = payload.is_featured;
  if (payload.is_vidyas_pick !== undefined) prodUpdates.is_vidyas_pick = payload.is_vidyas_pick;
  if (payload.tags !== undefined) prodUpdates.tags = payload.tags;

  const { error: prodErr } = await supabase.from('products').update(prodUpdates).eq('id', id);
  if (prodErr) return { success: false, error: prodErr.message };

  // Update variant price if provided
  if (payload.price !== undefined) {
    await supabase
      .from('product_variants')
      .update({
        price: payload.price,
        compare_at_price: payload.compare_at_price || null,
        updated_at: new Date().toISOString(),
      })
      .eq('product_id', id);
  }

  revalidatePath('/admin/products');
  revalidatePath(`/admin/products/${id}/edit`);
  revalidatePath('/shop');
  revalidatePath('/');
  return { success: true };
}

export async function toggleProductActive(id: string, is_active: boolean) {
  const supabase = createClient();
  const { error } = await supabase
    .from('products')
    .update({ is_active, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) return { error: error.message };
  revalidatePath('/admin/products');
  revalidatePath('/shop');
  return { error: null };
}

export async function toggleProductFeatured(id: string, is_featured: boolean) {
  const supabase = createClient();
  const { error } = await supabase
    .from('products')
    .update({ is_featured, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) return { error: error.message };
  revalidatePath('/admin/products');
  revalidatePath('/');
  return { error: null };
}

export async function toggleProductVidyasPick(id: string, is_vidyas_pick: boolean) {
  const supabase = createClient();
  const { error } = await supabase
    .from('products')
    .update({ is_vidyas_pick, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) return { error: error.message };
  revalidatePath('/admin/products');
  revalidatePath('/');
  revalidatePath('/vidhyas-picks');
  return { error: null };
}

export async function deleteProduct(id: string) {
  const supabase = createClient();
  // Delete variants and images first
  await supabase.from('product_variants').delete().eq('product_id', id);
  await supabase.from('product_images').delete().eq('product_id', id);
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) return { error: error.message };
  revalidatePath('/admin/products');
  revalidatePath('/shop');
  return { error: null };
}

// ---------------- CATEGORIES CRUD ----------------
export async function getCategories(): Promise<AdminCategory[]> {
  const supabase = createClient();
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
  const supabase = createClient();
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
  const supabase = createClient();
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
  const supabase = createClient();
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
  const supabase = createClient();
  const { error } = await supabase.from('categories').delete().eq('id', id);
  if (error) return { error: error.message };
  revalidatePath('/admin/products/categories');
  revalidatePath('/shop');
  return { error: null };
}

// ---------------- COLLECTIONS / LOOKS CRUD ----------------
export async function getAdminCollections(): Promise<AdminCollection[]> {
  const supabase = createClient();
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
  const supabase = createClient();
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
  const supabase = createClient();
  await supabase.from('look_hotspots').delete().eq('look_id', id);
  const { error } = await supabase.from('looks').delete().eq('id', id);
  if (error) return { error: error.message };
  revalidatePath('/admin/products/collections');
  revalidatePath('/');
  return { error: null };
}

// ---------------- INVENTORY ALERTS ----------------
export async function getInventoryAlerts() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('product_variants')
    .select(`
      id, sku, inventory_quantity, size,
      products ( id, name )
    `)
    .lte('inventory_quantity', 10)
    .order('inventory_quantity', { ascending: true })
    .limit(50);

  if (error) return { variants: [], error: error.message };
  return { variants: data || [], error: null };
}

export async function updateVariantInventory(variantId: string, quantity: number) {
  const supabase = createClient();
  const { error } = await supabase
    .from('product_variants')
    .update({ inventory_quantity: quantity, updated_at: new Date().toISOString() })
    .eq('id', variantId);
  if (error) return { error: error.message };
  revalidatePath('/admin/products/inventory');
  return { error: null };
}
