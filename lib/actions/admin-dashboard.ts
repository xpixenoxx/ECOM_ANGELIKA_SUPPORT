'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export interface DashboardData {
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
  }>;
  revenueByDay: Array<{ date: string; revenue: number }>;
}

export async function getDashboardData(): Promise<DashboardData> {
  const supabase = createClient();
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  const [
    ordersRes,
    prevOrdersRes,
    customersRes,
    productsRes,
    pendingRes,
    recentOrdersRes,
    variantsRes,
  ] = await Promise.all([
    supabase.from('orders').select('total_amount, status, created_at').gte('created_at', thirtyDaysAgo.toISOString()),
    supabase.from('orders').select('total_amount').gte('created_at', sixtyDaysAgo.toISOString()).lt('created_at', thirtyDaysAgo.toISOString()),
    supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'customer'),
    supabase.from('products').select('id', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('orders').select('id', { count: 'exact', head: true }).in('status', ['pending', 'confirmed']),
    supabase.from('orders').select('id, order_number, email, status, payment_status, total_amount, currency, created_at').order('created_at', { ascending: false }).limit(7),
    supabase.from('product_variants').select('id, inventory_quantity, low_stock_threshold, size, products(name, sku)').lte('inventory_quantity', 5),
  ]);

  const orders = ordersRes.data || [];
  const prevOrders = prevOrdersRes.data || [];
  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total_amount), 0);
  const prevRevenue = prevOrders.reduce((sum, o) => sum + Number(o.total_amount), 0);
  const revenueChange = prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : 0;
  const ordersChange = prevOrders.length > 0 ? ((orders.length - prevOrders.length) / prevOrders.length) * 100 : 0;

  // Orders by status
  const statusMap: Record<string, number> = {};
  orders.forEach(o => { statusMap[o.status] = (statusMap[o.status] || 0) + 1; });
  const ordersByStatus = Object.entries(statusMap).map(([status, count]) => ({ status, count }));

  // Revenue by day (last 7 days)
  const revenueByDay: Array<{ date: string; revenue: number }> = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dateStr = d.toISOString().split('T')[0];
    const dayRevenue = orders
      .filter(o => o.created_at.startsWith(dateStr))
      .reduce((sum, o) => sum + Number(o.total_amount), 0);
    revenueByDay.push({ date: dateStr, revenue: dayRevenue });
  }

  // Low stock
  const lowStockItems = (variantsRes.data || []).map((v: any) => ({
    product_name: v.products?.name || 'Unknown',
    sku: v.products?.sku || '',
    size: v.size || '',
    inventory_quantity: v.inventory_quantity,
    low_stock_threshold: v.low_stock_threshold || 5,
  }));

  return {
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
  const supabase = createClient();
  const { data } = await supabase.from('coupons').select('*').order('created_at', { ascending: false });
  return data || [];
}

export async function createCoupon(data: Omit<Coupon, 'id' | 'usage_count' | 'created_at'>): Promise<{ success: boolean; error?: string; data?: Coupon }> {
  const supabase = createClient();
  const { data: created, error } = await supabase.from('coupons').insert({ ...data, usage_count: 0 }).select().single();
  if (error) return { success: false, error: error.message };
  revalidatePath('/admin/products/coupons');
  return { success: true, data: created };
}

export async function updateCoupon(id: string, updates: Partial<Coupon>): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();
  const { error } = await supabase.from('coupons').update(updates).eq('id', id);
  if (error) return { success: false, error: error.message };
  revalidatePath('/admin/products/coupons');
  return { success: true };
}

export async function deleteCoupon(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();
  const { error } = await supabase.from('coupons').delete().eq('id', id);
  if (error) return { success: false, error: error.message };
  revalidatePath('/admin/products/coupons');
  return { success: true };
}

export async function toggleCouponActive(id: string, is_active: boolean): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();
  const { error } = await supabase.from('coupons').update({ is_active }).eq('id', id);
  if (error) return { success: false, error: error.message };
  revalidatePath('/admin/products/coupons');
  return { success: true };
}

// Keep old functions for backward compat
export async function getDashboardStats() { return (await getDashboardData()).stats; }
export async function getRecentOrders(limit = 5) { return (await getDashboardData()).recentOrders.slice(0, limit); }
export async function getTopProducts(_limit = 5) { return []; }
export async function getLowStockProducts(_limit = 5) { return (await getDashboardData()).lowStockItems.slice(0, _limit); }
export async function getOrdersByStatus() { return (await getDashboardData()).ordersByStatus; }
