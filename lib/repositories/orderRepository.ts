import { supabaseAdmin } from '@/lib/supabase/admin';

export interface OrderFilterOptions {
  status?: string;
  search?: string;
  limit?: number;
  offset?: number;
  startDate?: Date | null;
  endDate?: Date | null;
}

export const orderRepository = {
  async findMany(options?: OrderFilterOptions) {
    let query = supabaseAdmin
      .from('orders')
      .select(`
        id,
        order_number,
        user_id,
        email,
        phone,
        status,
        payment_status,
        payment_method,
        subtotal,
        shipping_cost,
        tax_amount,
        discount_amount,
        total_amount,
        currency,
        shipping_address,
        billing_address,
        notes,
        vidyas_note,
        tracking_number,
        courier_partner,
        shipped_at,
        delivered_at,
        cancelled_at,
        cancel_reason,
        created_at,
        updated_at,
        order_items (
          id,
          product_id,
          variant_id,
          quantity,
          unit_price,
          total_price,
          product_name,
          variant_details
        )
      `)
      .order('created_at', { ascending: false });

    if (options?.status && options.status !== 'all') {
      query = query.eq('status', options.status);
    }

    if (options?.startDate) {
      query = query.gte('created_at', options.startDate.toISOString());
    }

    if (options?.endDate) {
      query = query.lte('created_at', options.endDate.toISOString());
    }

    if (options?.search) {
      query = query.or(`order_number.ilike.%${options.search}%,email.ilike.%${options.search}%`);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async findById(orderId: string) {
    const { data, error } = await supabaseAdmin
      .from('orders')
      .select(`
        *,
        order_items (
          id,
          order_id,
          product_id,
          variant_id,
          quantity,
          unit_price,
          total_price,
          product_name,
          variant_details
        )
      `)
      .eq('id', orderId)
      .single();

    if (error) throw error;
    return data;
  },

  async update(orderId: string, patch: Record<string, any>) {
    const { data, error } = await supabaseAdmin
      .from('orders')
      .update({
        ...patch,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async countByStatus() {
    const { data, error } = await supabaseAdmin
      .from('orders')
      .select('status');

    if (error) throw error;
    return data || [];
  },

  async fetchRevenueMetrics(startDate?: Date | null) {
    let query = supabaseAdmin
      .from('orders')
      .select('id, total_amount, status, payment_status, created_at');

    if (startDate) {
      query = query.gte('created_at', startDate.toISOString());
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },
};

