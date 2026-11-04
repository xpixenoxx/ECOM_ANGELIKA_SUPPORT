'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export interface StoreSettings {
  id: string;
  site_name: string;
  site_tagline: string;
  logo_url: string | null;
  favicon_url: string | null;
  announcement_bar_enabled: boolean;
  announcement_bar_text: string;
  announcement_bar_link: string;
  announcement_bar_bg_color: string;
  announcement_bar_text_color: string;
  contact_email: string;
  contact_phone: string;
  contact_whatsapp: string;
  address: string;
  social_instagram: string;
  social_facebook: string;
  social_whatsapp: string;
  social_youtube: string;
  currency: string;
  currency_symbol: string;
  free_shipping_threshold: number;
  cod_max_amount: number;
  return_policy_days: number;
  meta_title: string;
  meta_description: string;
  updated_at: string;
}

export interface NavbarItem {
  id: string;
  label: string;
  href: string;
  parent_id: string | null;
  sort_order: number;
  is_active: boolean;
  badge_text: string | null;
  badge_color: string;
  created_at: string;
  updated_at: string;
}

export async function getStoreSettings(): Promise<StoreSettings | null> {
  const supabase = createClient();
  const { data, error } = await supabase.from('store_settings').select('*').single();
  if (error) return null;
  return data;
}

export async function updateStoreSettings(
  id: string,
  updates: Partial<Omit<StoreSettings, 'id' | 'updated_at'>>
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();
  const { error } = await supabase
    .from('store_settings')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) return { success: false, error: error.message };
  revalidatePath('/admin/settings');
  revalidatePath('/');
  return { success: true };
}

export async function getNavbarItems(): Promise<NavbarItem[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from('navbar_items')
    .select('*')
    .order('sort_order', { ascending: true });
  return data || [];
}

export async function createNavbarItem(
  item: Pick<NavbarItem, 'label' | 'href' | 'sort_order' | 'badge_text' | 'badge_color' | 'is_active'>
): Promise<{ success: boolean; error?: string; data?: NavbarItem }> {
  const supabase = createClient();
  const { data, error } = await supabase.from('navbar_items').insert(item).select().single();
  if (error) return { success: false, error: error.message };
  revalidatePath('/admin/settings');
  revalidatePath('/');
  return { success: true, data };
}

export async function updateNavbarItem(
  id: string,
  updates: Partial<Omit<NavbarItem, 'id' | 'created_at' | 'updated_at'>>
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();
  const { error } = await supabase
    .from('navbar_items')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) return { success: false, error: error.message };
  revalidatePath('/admin/settings');
  revalidatePath('/');
  return { success: true };
}

export async function deleteNavbarItem(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();
  const { error } = await supabase.from('navbar_items').delete().eq('id', id);
  if (error) return { success: false, error: error.message };
  revalidatePath('/admin/settings');
  revalidatePath('/');
  return { success: true };
}

export async function reorderNavbarItems(
  items: { id: string; sort_order: number }[]
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();
  const updates = items.map(({ id, sort_order }) =>
    supabase.from('navbar_items').update({ sort_order }).eq('id', id)
  );
  await Promise.all(updates);
  revalidatePath('/admin/settings');
  revalidatePath('/');
  return { success: true };
}
