import { supabaseAdmin } from '@/lib/supabase/admin';
import { sanitizePostgrestSearchTerm } from '@/lib/validators/commerce';

export interface ProductFilterOptions {
  categoryId?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  isVidyasPick?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
}

export const productRepository = {
  async findMany(options?: ProductFilterOptions) {
    let query = supabaseAdmin
      .from('products')
      .select(`
        id,
        sku,
        name,
        slug,
        description,
        category_id,
        is_active,
        is_featured,
        is_vidyas_pick,
        tags,
        created_at,
        updated_at,
        categories!products_category_id_fkey (
          id,
          name,
          slug
        ),
        product_images!product_images_product_id_fkey (
          id,
          url,
          alt_text,
          is_primary,
          sort_order
        ),
        product_variants!product_variants_product_id_fkey (
          id,
          size,
          price,
          compare_at_price,
          inventory_quantity,
          is_active
        )
      `)
      .order('created_at', { ascending: false });

    if (options?.isActive !== undefined) {
      query = query.eq('is_active', options.isActive);
    }

    if (options?.isFeatured !== undefined) {
      query = query.eq('is_featured', options.isFeatured);
    }

    if (options?.isVidyasPick !== undefined) {
      query = query.eq('is_vidyas_pick', options.isVidyasPick);
    }

    if (options?.categoryId) {
      query = query.eq('category_id', options.categoryId);
    }

    if (options?.search) {
      const clean = sanitizePostgrestSearchTerm(options.search);
      if (clean) {
        query = query.or(`name.ilike.%${clean}%,sku.ilike.%${clean}%`);
      }
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async findById(productId: string) {
    const { data, error } = await supabaseAdmin
      .from('products')
      .select(`
        *,
        categories!products_category_id_fkey (
          id,
          name,
          slug
        ),
        product_images!product_images_product_id_fkey (
          *
        ),
        product_variants!product_variants_product_id_fkey (
          *
        )
      `)
      .eq('id', productId)
      .single();

    if (error) throw error;
    return data;
  },

  async countActive() {
    const { count, error } = await supabaseAdmin
      .from('products')
      .select('id', { count: 'exact', head: true })
      .eq('is_active', true);

    if (error) throw error;
    return count ?? 0;
  },

  async findLowStockVariants(threshold = 5) {
    const { data, error } = await supabaseAdmin
      .from('product_variants')
      .select(`
        id,
        product_id,
        barcode,
        size,
        inventory_quantity,
        low_stock_threshold,
        products (
          id,
          name,
          sku,
          is_active
        )
      `)
      .lte('inventory_quantity', threshold)
      .order('inventory_quantity', { ascending: true })
      .limit(20);

    if (error) throw error;
    return data || [];
  },
};

