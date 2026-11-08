'use server';

import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';

// Helper to get administrative database client that bypasses RLS
function getAdminDb() {
  if (process.env['SUPABASE_SERVICE_ROLE_KEY']) {
    return supabaseAdmin;
  }
  return createClient();
}

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
  last_order_at?: string | null;
}

export async function getCustomers(filters?: { search?: string; role?: string }): Promise<{
  customers: CustomerProfile[];
  error: string | null;
}> {
  const supabase = getAdminDb();

  let query = supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (filters?.role && filters.role !== 'all') {
    query = query.eq('role', filters.role);
  }

  if (filters?.search) {
    const s = filters.search.trim();
    query = query.or(
      `full_name.ilike.%${s}%,email.ilike.%${s}%,phone.ilike.%${s}%`
    );
  }

  const { data, error } = await query;

  if (error) {
    console.error('getCustomers error:', error);
    return { customers: [], error: error.message };
  }

  const rawProfiles = data || [];
  const customerIds = rawProfiles.map((c) => c.id);
  const customerEmails = rawProfiles.map((c) => (c.email || '').toLowerCase()).filter(Boolean);

  let orderStats: Record<string, { count: number; total: number; lastOrderAt: string | null }> = {};

  if (customerIds.length > 0) {
    // Fetch orders to calculate accurate order_count, total_spent, and last_order_at
    const { data: orders, error: ordersErr } = await supabase
      .from('orders')
      .select('id, user_id, email, total_amount, payment_status, status, created_at')
      .order('created_at', { ascending: false });

    if (!ordersErr && orders) {
      for (const o of orders) {
        // Match either by user_id or by email address
        let matchingId = o.user_id;
        if (!matchingId && o.email) {
          const matchedProfile = rawProfiles.find(
            (p) => (p.email || '').toLowerCase() === o.email.toLowerCase()
          );
          if (matchedProfile) matchingId = matchedProfile.id;
        }

        if (!matchingId) continue;

        const stat = orderStats[matchingId] || { count: 0, total: 0, lastOrderAt: null };
        stat.count++;
        if (o.status !== 'cancelled') {
          stat.total += Number(o.total_amount || 0);
        }
        if (!stat.lastOrderAt || new Date(o.created_at) > new Date(stat.lastOrderAt)) {
          stat.lastOrderAt = o.created_at;
        }
        orderStats[matchingId] = stat;
      }
    }
  }

  const customers: CustomerProfile[] = rawProfiles.map((c) => {
    const rawTier = c.loyalty_tier || 'Bronze';
    const normalizedTier =
      rawTier.charAt(0).toUpperCase() + rawTier.slice(1).toLowerCase();

    return {
      ...c,
      loyalty_points: Number(c.loyalty_points ?? 0),
      loyalty_tier: normalizedTier,
      order_count: orderStats[c.id]?.count ?? 0,
      total_spent: orderStats[c.id]?.total ?? 0,
      last_order_at: orderStats[c.id]?.lastOrderAt ?? null,
    };
  });

  return { customers, error: null };
}

export async function getCustomerById(id: string): Promise<{
  customer: CustomerProfile | null;
  orders: any[];
  error: string | null;
}> {
  const supabase = getAdminDb();

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error || !profile) {
    console.error('getCustomerById error:', error);
    return { customer: null, orders: [], error: error?.message ?? 'Customer not found' };
  }

  // Get orders by user_id or email
  const { data: orders, error: ordersErr } = await supabase
    .from('orders')
    .select('id, order_number, status, payment_status, total_amount, created_at, currency')
    .or(`user_id.eq.${id},email.eq.${profile.email}`)
    .order('created_at', { ascending: false })
    .limit(30);

  const rawTier = profile.loyalty_tier || 'Bronze';
  const normalizedTier =
    rawTier.charAt(0).toUpperCase() + rawTier.slice(1).toLowerCase();

  const totalSpent = (orders || [])
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + Number(o.total_amount || 0), 0);

  return {
    customer: {
      ...profile,
      loyalty_points: Number(profile.loyalty_points ?? 0),
      loyalty_tier: normalizedTier,
      order_count: (orders || []).length,
      total_spent: totalSpent,
    } as CustomerProfile,
    orders: orders || [],
    error: null,
  };
}

export async function updateCustomerRole(id: string, role: string): Promise<{
  success: boolean;
  error: string | null;
}> {
  const supabase = getAdminDb();
  const validRoles = ['customer', 'manager', 'designer', 'admin'];
  if (!validRoles.includes(role)) {
    return { success: false, error: 'Invalid role specified' };
  }

  const { error } = await supabase
    .from('profiles')
    .update({ role, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    console.error('updateCustomerRole error:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/customers');
  revalidatePath(`/admin/customers/${id}`);
  revalidatePath('/admin');
  return { success: true, error: null };
}

export async function updateLoyaltyPoints(id: string, points: number): Promise<{
  success: boolean;
  error: string | null;
}> {
  const supabase = getAdminDb();
  if (typeof points !== 'number' || isNaN(points) || points < 0) {
    return { success: false, error: 'Points must be a valid non-negative number' };
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      loyalty_points: Math.floor(points),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) {
    console.error('updateLoyaltyPoints error:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/customers');
  revalidatePath(`/admin/customers/${id}`);
  revalidatePath('/admin/customers/loyalty');
  return { success: true, error: null };
}

export async function updateCustomerTier(id: string, tier: string): Promise<{
  success: boolean;
  error: string | null;
}> {
  const supabase = getAdminDb();
  const normalized = tier.toLowerCase();
  const validTiers = ['bronze', 'silver', 'gold', 'platinum'];
  if (!validTiers.includes(normalized)) {
    return { success: false, error: 'Invalid tier specified' };
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      loyalty_tier: normalized,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) {
    console.error('updateCustomerTier error:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/customers');
  revalidatePath(`/admin/customers/${id}`);
  revalidatePath('/admin/customers/loyalty');
  return { success: true, error: null };
}
