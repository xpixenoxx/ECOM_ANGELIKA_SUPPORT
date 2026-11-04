'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export interface AdminOrder {
  id: string;
  order_number: string;
  user_id: string | null;
  email: string;
  phone: string | null;
  status: string;
  payment_status: string;
  payment_method: string | null;
  subtotal: number;
  shipping_cost: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  currency: string;
  shipping_address: Record<string, any>;
  notes: string | null;
  vidyas_note: string | null;
  tracking_number: string | null;
  courier_partner: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  cancelled_at: string | null;
  cancel_reason: string | null;
  created_at: string;
  updated_at: string;
  customer_name?: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  variant_id: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
  product_name: string;
  variant_details: Record<string, any> | null;
}

export async function getOrders(filters?: {
  status?: string;
  search?: string;
}): Promise<AdminOrder[]> {
  const supabase = createClient();
  let query = supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);
  if (filters?.status && filters.status !== 'all') {
    query = query.eq('status', filters.status);
  }
  if (filters?.search) {
    query = query.or(`order_number.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
  }
  const { data } = await query;
  return data || [];
}

export async function getOrderById(id: string): Promise<{ order: AdminOrder | null; items: OrderItem[] }> {
  const supabase = createClient();
  const [orderRes, itemsRes] = await Promise.all([
    supabase.from('orders').select('*').eq('id', id).single(),
    supabase.from('order_items').select('*').eq('order_id', id),
  ]);
  return { order: orderRes.data || null, items: itemsRes.data || [] };
}

export async function updateOrderStatus(
  id: string,
  status: string,
  trackingNumber?: string,
  courierPartner?: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();
  const updates: Record<string, any> = { status, updated_at: new Date().toISOString() };
  if (trackingNumber !== undefined) updates.tracking_number = trackingNumber;
  if (courierPartner !== undefined) updates.courier_partner = courierPartner;
  if (status === 'shipped') updates.shipped_at = new Date().toISOString();
  if (status === 'delivered') updates.delivered_at = new Date().toISOString();
  if (status === 'cancelled') updates.cancelled_at = new Date().toISOString();
  const { error } = await supabase.from('orders').update(updates).eq('id', id);
  if (error) return { success: false, error: error.message };
  revalidatePath('/admin/orders');
  revalidatePath(`/admin/orders/${id}`);
  return { success: true };
}

export async function updateVidyasNote(id: string, note: string): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();
  const { error } = await supabase.from('orders').update({ vidyas_note: note }).eq('id', id);
  if (error) return { success: false, error: error.message };
  revalidatePath(`/admin/orders/${id}`);
  return { success: true };
}
