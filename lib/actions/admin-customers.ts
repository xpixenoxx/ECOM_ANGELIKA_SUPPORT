'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export interface CustomerProfile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: string;
  loyalty_points: number;
  loyalty_tier: string | null;
  created_at: string;
  updated_at: string;
  order_count?: number;
  total_spent?: number;
}

export async function getCustomers(filters?: { search?: string; role?: string }) {
  const supabase = createClient();

  let query = supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (filters?.role && filters.role !== 'all') {
    query = query.eq('role', filters.role);
  }

  if (filters?.search) {
    query = query.or(
      `full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,phone.ilike.%${filters.search}%`
    );
  }

  const { data, error } = await query;

  if (error) {
    console.error('getCustomers error:', error);
    return { customers: [], error: error.message };
  }

  const customerIds = (data || []).map((c) => c.id);
  let orderStats: Record<string, { count: number; total: number }> = {};

  if (customerIds.length > 0) {
    const { data: orders } = await supabase
      .from('orders')
      .select('user_id, total_amount')
      .in('user_id', customerIds);

    if (orders) {
      for (const o of orders) {
        if (!o.user_id) continue;
        if (!orderStats[o.user_id]) orderStats[o.user_id] = { count: 0, total: 0 };
        orderStats[o.user_id].count++;
        orderStats[o.user_id].total += Number(o.total_amount || 0);
      }
    }
  }

  const customers: CustomerProfile[] = (data || []).map((c) => ({
    ...c,
    loyalty_points: c.loyalty_points ?? 0,
    loyalty_tier: c.loyalty_tier ?? 'Bronze',
    order_count: orderStats[c.id]?.count ?? 0,
    total_spent: orderStats[c.id]?.total ?? 0,
  }));

  return { customers, error: null };
}

export async function getCustomerById(id: string) {
  const supabase = createClient();

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !profile) {
    return { customer: null, orders: [], error: error?.message ?? 'Not found' };
  }

  const { data: orders } = await supabase
    .from('orders')
    .select('id, order_number, status, payment_status, total_amount, created_at')
    .eq('user_id', id)
    .order('created_at', { ascending: false })
    .limit(10);

  return {
    customer: {
      ...profile,
      loyalty_points: profile.loyalty_points ?? 0,
      loyalty_tier: profile.loyalty_tier ?? 'Bronze',
    } as CustomerProfile,
    orders: orders || [],
    error: null,
  };
}

export async function updateCustomerRole(id: string, role: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from('profiles')
    .update({ role, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) return { error: error.message };
  revalidatePath('/admin/customers');
  revalidatePath(`/admin/customers/${id}`);
  return { error: null };
}

export async function updateLoyaltyPoints(id: string, points: number) {
  const supabase = createClient();
  const { error } = await supabase
    .from('profiles')
    .update({ loyalty_points: points, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) return { error: error.message };
  revalidatePath('/admin/customers');
  revalidatePath(`/admin/customers/${id}`);
  return { error: null };
}

export async function updateCustomerTier(id: string, tier: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from('profiles')
    .update({ loyalty_tier: tier, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) return { error: error.message };
  revalidatePath('/admin/customers');
  revalidatePath(`/admin/customers/${id}`);
  return { error: null };
}
