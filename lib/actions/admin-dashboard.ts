'use server';

import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';

export type DashboardTimeRange = '7d' | '30d' | '90d' | 'all';

export interface DashboardData {
  timeRange?: DashboardTimeRange;
  stats: {
    totalRevenue: number;
    totalOrders: number;
    totalCustomers: number;
    activeProducts: number;
    pendingOrders: number;
    lowStockCount: number;
    revenueChange: number;
    ordersChange: number;
  };
  recentOrders: Array<{
    id: string;
    order_number: string;
    email: string;
    status: string;
    payment_status: string;
    total_amount: number;
    currency: string;
    created_at: string;
  }>;
  ordersByStatus: Array<{ status: string; count: number }>;
  lowStockItems: Array<{
    product_name: string;
    sku: string;
    size: string;
    inventory_quantity: number;
    low_stock_threshold: number;
    product_id?: string;
  }>;
  revenueByDay: Array<{ date: string; revenue: number; ordersCount?: number }>;
}

export async function getDashboardData(timeRange: DashboardTimeRange = '30d'): Promise<DashboardData> {
  const supabase = supabaseAdmin;
  const now = new Date();

  let days = 30;
  if (timeRange === '7d') days = 7;
  else if (timeRange === '90d') days = 90;
  else if (timeRange === 'all') days = 0;

  const startDate = days > 0 ? new Date(now.getTime() - days * 24 * 60 * 60 * 1000) : null;
  const prevStartDate = days > 0 ? new Date(now.getTime() - 2 * days * 24 * 60 * 60 * 1000) : null;
  const prevEndDate = startDate;

  let currentOrdersQuery = supabase
    .from('orders')
    .select('id, total_amount, status, payment_status, created_at');
  if (startDate) {
    currentOrdersQuery = currentOrdersQuery.gte('created_at', startDate.toISOString());
  }

  let prevOrdersQuery = supabase
    .from('orders')
    .select('id, total_amount, status, created_at');
  if (prevStartDate && prevEndDate) {
    prevOrdersQuery = prevOrdersQuery
      .gte('created_at', prevStartDate.toISOString())
      .lt('created_at', prevEndDate.toISOString());
  }

  const [
    ordersRes,
    prevOrdersRes,
    customersRes,
    productsRes,
    pendingRes,
    recentOrdersRes,
    variantsRes,
  ] = await Promise.all([
    currentOrdersQuery,
    days > 0 ? prevOrdersQuery : Promise.resolve({ data: [], error: null }),
    supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'customer'),
    supabase.from('products').select('id', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('orders').select('id', { count: 'exact', head: true }).in('status', ['pending', 'confirmed']),
    supabase
      .from('orders')
      .select('id, order_number, email, status, payment_status, total_amount, currency, created_at')
      .order('created_at', { ascending: false })
      .limit(7),
    supabase
      .from('product_variants')
      .select('id, product_id, inventory_quantity, low_stock_threshold, size, products(id, name, sku)')
      .lte('inventory_quantity', 10)
      .order('inventory_quantity', { ascending: true }),
  ]);

  const orders = ordersRes.data || [];
  const prevOrders = (prevOrdersRes as any)?.data || [];

  // Exclude cancelled orders from revenue calculation
  const validOrders = orders.filter(o => o.status !== 'cancelled');
  const validPrevOrders = prevOrders.filter((o: any) => o.status !== 'cancelled');

  const totalRevenue = validOrders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
  const prevRevenue = validPrevOrders.reduce((sum: number, o: any) => sum + Number(o.total_amount || 0), 0);

  let revenueChange = 0;
  if (prevRevenue > 0) {
    revenueChange = ((totalRevenue - prevRevenue) / prevRevenue) * 100;
  } else if (totalRevenue > 0 && days > 0) {
    revenueChange = 100;
  }

  let ordersChange = 0;
  if (prevOrders.length > 0) {
    ordersChange = ((orders.length - prevOrders.length) / prevOrders.length) * 100;
  } else if (orders.length > 0 && days > 0) {
    ordersChange = 100;
  }

  // Orders by status
  const statusOrder = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled', 'returned'];
  const statusMap: Record<string, number> = {};
  orders.forEach(o => {
    const s = o.status || 'pending';
    statusMap[s] = (statusMap[s] || 0) + 1;
  });
  const ordersByStatus = Object.entries(statusMap)
    .sort(([a], [b]) => {
      const idxA = statusOrder.indexOf(a);
      const idxB = statusOrder.indexOf(b);
      return (idxA === -1 ? 99 : idxA) - (idxB === -1 ? 99 : idxB);
    })
    .map(([status, count]) => ({ status, count }));

  // Revenue by day (last 7 days breakdown for chart)
  const revenueByDay: Array<{ date: string; revenue: number; ordersCount: number }> = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    const isoDatePrefix = d.toISOString().split('T')[0] || '';

    const matchingDayOrders = validOrders.filter(o => {
      if (!o.created_at) return false;
      const orderD = new Date(o.created_at);
      const oYear = orderD.getFullYear();
      const oMonth = String(orderD.getMonth() + 1).padStart(2, '0');
      const oDay = String(orderD.getDate()).padStart(2, '0');
      const oDateStr = `${oYear}-${oMonth}-${oDay}`;
      return oDateStr === dateStr || o.created_at.startsWith(isoDatePrefix);
    });

    const dayRevenue = matchingDayOrders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
    revenueByDay.push({
      date: dateStr,
      revenue: dayRevenue,
      ordersCount: matchingDayOrders.length,
    });
  }

  // Low stock
  const lowStockItems = (variantsRes.data || [])
    .filter((v: any) => Number(v.inventory_quantity ?? 0) <= Number(v.low_stock_threshold || 5))
    .map((v: any) => ({
      product_name: v.products?.name || 'Unknown Product',
      sku: v.products?.sku || '',
      size: v.size || '',
      inventory_quantity: Number(v.inventory_quantity ?? 0),
      low_stock_threshold: Number(v.low_stock_threshold || 5),
      product_id: v.product_id || v.products?.id,
    }));

  return {
    timeRange,
    stats: {
      totalRevenue,
      totalOrders: orders.length,
      totalCustomers: customersRes.count || 0,
      activeProducts: productsRes.count || 0,
      pendingOrders: pendingRes.count || 0,
      lowStockCount: lowStockItems.length,
      revenueChange: Math.round(revenueChange * 10) / 10,
      ordersChange: Math.round(ordersChange * 10) / 10,
    },
    recentOrders: recentOrdersRes.data || [],
    ordersByStatus,
    lowStockItems,
    revenueByDay,
  };
}

// Coupons
export interface Coupon {
  id: string;
  code: string;
  name: string;
  type: 'percentage' | 'fixed';
  value: number;
  min_order_amount: number | null;
  max_discount_amount: number | null;
  usage_limit: number | null;
  usage_count: number;
  user_limit: number | null;
  valid_from: string | null;
  valid_until: string | null;
  first_order_only: boolean;
  is_active: boolean;
  created_at: string;
}

export async function getCoupons(): Promise<Coupon[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('getCoupons error:', error);
      return [];
    }
    return (data as Coupon[]) || [];
  } catch (err) {
    console.error('getCoupons error:', err);
    return [];
  }
}

export async function createCoupon(data: Omit<Coupon, 'id' | 'usage_count' | 'created_at'>): Promise<{ success: boolean; error?: string; data?: Coupon }> {
  try {
    const code = (data.code || '').trim().toUpperCase();
    if (!code) {
      return { success: false, error: 'Coupon code is required' };
    }

    // Check if code already exists
    const { data: existing, error: checkErr } = await supabaseAdmin
      .from('coupons')
      .select('id')
      .eq('code', code)
      .maybeSingle();

    if (checkErr) {
      console.warn('Check coupon existence error:', checkErr);
    }

    if (existing) {
      return { success: false, error: `Coupon code "${code}" already exists` };
    }

    const { data: created, error } = await supabaseAdmin
      .from('coupons')
      .insert({
        ...data,
        code,
        usage_count: 0,
      })
      .select()
      .single();

    if (error) {
      console.error('createCoupon error:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/admin/products/coupons');
    return { success: true, data: created as Coupon };
  } catch (err: any) {
    console.error('createCoupon unexpected error:', err);
    return { success: false, error: err?.message || 'Failed to create coupon' };
  }
}

export async function updateCoupon(id: string, updates: Partial<Coupon>): Promise<{ success: boolean; error?: string; data?: Coupon }> {
  try {
    if (updates.code) {
      const code = updates.code.trim().toUpperCase();
      updates.code = code;

      // Check if code conflicts with another coupon
      const { data: existing } = await supabaseAdmin
        .from('coupons')
        .select('id')
        .eq('code', code)
        .neq('id', id)
        .maybeSingle();

      if (existing) {
        return { success: false, error: `Coupon code "${code}" already exists` };
      }
    }

    const { data: updated, error } = await supabaseAdmin
      .from('coupons')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('updateCoupon error:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/admin/products/coupons');
    return { success: true, data: updated as Coupon };
  } catch (err: any) {
    console.error('updateCoupon unexpected error:', err);
    return { success: false, error: err?.message || 'Failed to update coupon' };
  }
}

export async function deleteCoupon(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabaseAdmin
      .from('coupons')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('deleteCoupon error:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/admin/products/coupons');
    return { success: true };
  } catch (err: any) {
    console.error('deleteCoupon unexpected error:', err);
    return { success: false, error: err?.message || 'Failed to delete coupon' };
  }
}

export async function toggleCouponActive(id: string, is_active: boolean): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabaseAdmin
      .from('coupons')
      .update({ is_active })
      .eq('id', id);

    if (error) {
      console.error('toggleCouponActive error:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/admin/products/coupons');
    return { success: true };
  } catch (err: any) {
    console.error('toggleCouponActive unexpected error:', err);
    return { success: false, error: err?.message || 'Failed to toggle coupon status' };
  }
}

// Keep old functions for backward compat
export async function getDashboardStats() { return (await getDashboardData()).stats; }
export async function getRecentOrders(limit = 5) { return (await getDashboardData()).recentOrders.slice(0, limit); }
export async function getTopProducts(_limit = 5) { return []; }
export async function getLowStockProducts(_limit = 5) { return (await getDashboardData()).lowStockItems.slice(0, _limit); }
export async function getOrdersByStatus() { return (await getDashboardData()).ordersByStatus; }
