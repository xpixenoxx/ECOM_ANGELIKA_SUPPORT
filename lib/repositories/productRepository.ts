import { supabaseAdmin } from '@/lib/supabase/admin';

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
        price,
        compare_at_price,
        category_id,
        is_active,
        is_featured,
        is_vidyas_pick,
        images,
        tags,
        return_window_days,
        created_at,
        updated_at,
        categories (
          id,
          name,
          slug
        ),
        product_variants (
          id,
          inventory_quantity
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
      query = query.or(`name.ilike.%${options.search}%,sku.ilike.%${options.search}%`);
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
        categories (
          id,
          name,
          slug
        ),
        product_variants (
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
        sku,
        size,
        inventory_quantity,
        low_stock_threshold,
        products (
          id,
          name,
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

