'use server';

import { createPublicClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { hasValidSupabaseConfig, getServiceHealthFlags, type ServiceHealthFlags } from '@/lib/env';
import { CONTENT_ADMIN_ROLES, OWNER_ADMIN_ROLES, logAdminAction, requireAdminRole } from '@/lib/supabase/admin-auth';
import { TaxSettingsSchema } from '@/lib/validators/commerce';
import type { Json } from '@/types/database';
import { revalidatePath, revalidateTag, unstable_cache } from 'next/cache';

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
  if (!hasValidSupabaseConfig()) return null;
  const supabase = createPublicClient();
  const { data, error } = await supabase.from('store_settings').select('*').limit(1).maybeSingle();
  if (error) return null;
  return data as StoreSettings | null;
}

export async function updateStoreSettings(
  id: string,
  updates: Partial<Omit<StoreSettings, 'id' | 'updated_at'>>
): Promise<{ success: boolean; error?: string }> {
  const auth = await requireAdminRole(OWNER_ADMIN_ROLES);
  if (!auth.authorized) {
    return { success: false, error: auth.error || 'Forbidden' };
  }
  const { error } = await supabaseAdmin
    .from('store_settings')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) return { success: false, error: error.message };
  await logAdminAction({
    actorId: auth.userId,
    action: 'update_store_settings',
    entityType: 'store_settings',
    entityId: id,
    afterState: updates,
  });
  revalidateTag('store-settings');
  revalidatePath('/admin/settings');
  revalidatePath('/');
  return { success: true };
}

export async function getNavbarItems(): Promise<NavbarItem[]> {
  if (!hasValidSupabaseConfig()) return [];
  const supabase = createPublicClient();
  const { data } = await supabase
    .from('navbar_items')
    .select('*')
    .order('sort_order', { ascending: true });
  return (data || []) as NavbarItem[];
}

export async function createNavbarItem(
  item: Pick<NavbarItem, 'label' | 'href' | 'sort_order' | 'badge_text' | 'badge_color' | 'is_active'>
): Promise<{ success: boolean; error?: string; data?: NavbarItem }> {
  const auth = await requireAdminRole(CONTENT_ADMIN_ROLES);
  if (!auth.authorized) {
    return { success: false, error: auth.error || 'Forbidden' };
  }
  const { data, error } = await supabaseAdmin.from('navbar_items').insert(item).select().single();
  if (error) return { success: false, error: error.message };
  await logAdminAction({
    actorId: auth.userId,
    action: 'create_navbar_item',
    entityType: 'navbar_item',
    entityId: data.id,
    afterState: item,
  });
  revalidateTag('navbar-items');
  revalidatePath('/admin/settings');
  revalidatePath('/');
  return { success: true, data };
}

export async function updateNavbarItem(
  id: string,
  updates: Partial<Omit<NavbarItem, 'id' | 'created_at' | 'updated_at'>>
): Promise<{ success: boolean; error?: string }> {
  const auth = await requireAdminRole(CONTENT_ADMIN_ROLES);
  if (!auth.authorized) {
    return { success: false, error: auth.error || 'Forbidden' };
  }
  const { error } = await supabaseAdmin
    .from('navbar_items')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) return { success: false, error: error.message };
  await logAdminAction({
    actorId: auth.userId,
    action: 'update_navbar_item',
    entityType: 'navbar_item',
    entityId: id,
    afterState: updates,
  });
  revalidateTag('navbar-items');
  revalidatePath('/admin/settings');
  revalidatePath('/');
  return { success: true };
}

export async function deleteNavbarItem(id: string): Promise<{ success: boolean; error?: string }> {
  const auth = await requireAdminRole(CONTENT_ADMIN_ROLES);
  if (!auth.authorized) {
    return { success: false, error: auth.error || 'Forbidden' };
  }
  const { error } = await supabaseAdmin.from('navbar_items').delete().eq('id', id);
  if (error) return { success: false, error: error.message };
  await logAdminAction({
    actorId: auth.userId,
    action: 'delete_navbar_item',
    entityType: 'navbar_item',
    entityId: id,
  });
  revalidateTag('navbar-items');
  revalidatePath('/admin/settings');
  revalidatePath('/');
  return { success: true };
}

export async function reorderNavbarItems(
  items: { id: string; sort_order: number }[]
): Promise<{ success: boolean; error?: string }> {
  const auth = await requireAdminRole(CONTENT_ADMIN_ROLES);
  if (!auth.authorized) {
    return { success: false, error: auth.error || 'Forbidden' };
  }
  const updates = items.map(({ id, sort_order }) =>
    supabaseAdmin.from('navbar_items').update({ sort_order }).eq('id', id)
  );
  await Promise.all(updates);
  await logAdminAction({
    actorId: auth.userId,
    action: 'reorder_navbar_items',
    entityType: 'navbar_item',
    afterState: { items },
  });
  revalidateTag('navbar-items');
  revalidatePath('/admin/settings');
  revalidatePath('/');
  return { success: true };
}

export interface ExtendedStoreConfig {
  shipping: {
    standardRate: number;
    expressRate: number;
    defaultPartner: string;
    estimatedDays: string;
  };
  payments: {
    codEnabled: boolean;
    codFee: number;
    upiEnabled: boolean;
    intlEnabled: boolean;
  };
  taxes: {
    gstin: string | null;
    pricesIncludeTax: boolean;
    apparelLowRate: number;
    apparelHighRate: number;
    thresholdAmount: number;
  };
  emails: {
    senderName: string;
    senderEmail: string;
    orderConfirmationEnabled: boolean;
    shipmentNotificationEnabled: boolean;
  };
  notifications: {
    orderSound: boolean;
    vipSmsAlert: boolean;
    lowStockAlert: boolean;
    dailyDigest: boolean;
    lowStockThreshold: number;
  };
}

const DEFAULT_EXTENDED_CONFIG: ExtendedStoreConfig = {
  shipping: {
    standardRate: 99,
    expressRate: 249,
    defaultPartner: 'Delhivery Express',
    estimatedDays: '5-7 business days',
  },
  payments: {
    codEnabled: true,
    codFee: 49,
    upiEnabled: true,
    intlEnabled: false,
  },
  taxes: {
    gstin: null,
    pricesIncludeTax: true,
    apparelLowRate: 5,
    apparelHighRate: 12,
    thresholdAmount: 1000,
  },
  emails: {
    senderName: 'Angelika Fashions',
    senderEmail: '',
    orderConfirmationEnabled: true,
    shipmentNotificationEnabled: true,
  },
  notifications: {
    orderSound: true,
    vipSmsAlert: false,
    lowStockAlert: true,
    dailyDigest: true,
    lowStockThreshold: 5,
  },
};

export async function getExtendedStoreSettings(): Promise<{
  success: boolean;
  settingsId: string | null;
  freeShippingThreshold: number;
  codMaxAmount: number;
  extended: ExtendedStoreConfig;
  serviceHealth: ServiceHealthFlags;
  error?: string;
}> {
  const auth = await requireAdminRole(OWNER_ADMIN_ROLES);
  const serviceHealth = getServiceHealthFlags();
  if (!auth.authorized) {
    return {
      success: false,
      settingsId: null,
      freeShippingThreshold: 2999,
      codMaxAmount: 10000,
      extended: DEFAULT_EXTENDED_CONFIG,
      serviceHealth,
      error: auth.error || 'Unauthorized',
    };
  }

  if (!hasValidSupabaseConfig()) {
    return {
      success: true,
      settingsId: null,
      freeShippingThreshold: 2999,
      codMaxAmount: 10000,
      extended: DEFAULT_EXTENDED_CONFIG,
      serviceHealth,
    };
  }

  const { data, error } = await supabaseAdmin
    .from('store_settings')
    .select('id, free_shipping_threshold, cod_max_amount, extended_settings')
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    return {
      success: false,
      settingsId: null,
      freeShippingThreshold: 2999,
      codMaxAmount: 10000,
      extended: DEFAULT_EXTENDED_CONFIG,
      serviceHealth,
      error: error?.message,
    };
  }

  const ext = (data.extended_settings && typeof data.extended_settings === 'object'
    ? data.extended_settings
    : {}) as Record<string, any>;

  return {
    success: true,
    settingsId: data.id,
    freeShippingThreshold: Number(data.free_shipping_threshold ?? 2999),
    codMaxAmount: Number(data.cod_max_amount ?? 10000),
    extended: {
      shipping: { ...DEFAULT_EXTENDED_CONFIG.shipping, ...(ext['shipping'] || {}) },
      payments: { ...DEFAULT_EXTENDED_CONFIG.payments, ...(ext['payments'] || {}) },
      taxes: { ...DEFAULT_EXTENDED_CONFIG.taxes, ...(ext['taxes'] || {}) },
      emails: { ...DEFAULT_EXTENDED_CONFIG.emails, ...(ext['emails'] || {}) },
      notifications: { ...DEFAULT_EXTENDED_CONFIG.notifications, ...(ext['notifications'] || {}) },
    },
    serviceHealth,
  };
}

export async function saveExtendedStoreSettings(
  section: keyof ExtendedStoreConfig,
  payload: Record<string, unknown> & {
    freeShippingThreshold?: number;
    codMaxAmount?: number;
  }
): Promise<{ success: boolean; error?: string }> {
  const auth = await requireAdminRole(OWNER_ADMIN_ROLES);
  if (!auth.authorized) {
    return { success: false, error: auth.error || 'Only store owners can modify configuration.' };
  }

  if (section === 'taxes') {
    const parsedTax = TaxSettingsSchema.safeParse(payload);
    if (!parsedTax.success) {
      return {
        success: false,
        error: parsedTax.error.issues[0]?.message || 'Invalid GST / tax settings.',
      };
    }
  }

  if (!hasValidSupabaseConfig()) {
    return {
      success: false,
      error: 'Database is not configured. Connect Supabase environment credentials first.',
    };
  }

  const { data: row, error: fetchErr } = await supabaseAdmin
    .from('store_settings')
    .select('id, extended_settings')
    .limit(1)
    .maybeSingle();

  if (fetchErr || !row) {
    return { success: false, error: fetchErr?.message || 'Store settings record not found.' };
  }

  const currentExt =
    row.extended_settings && typeof row.extended_settings === 'object'
      ? (row.extended_settings as Record<string, any>)
      : {};

  const { freeShippingThreshold, codMaxAmount, ...sectionFields } = payload;
  const mergedExt = {
    ...DEFAULT_EXTENDED_CONFIG,
    ...currentExt,
    [section]: {
      ...DEFAULT_EXTENDED_CONFIG[section],
      ...(currentExt[section] || {}),
      ...sectionFields,
    },
  };

  const updateFields: Record<string, unknown> = {
    extended_settings: mergedExt as unknown as Json,
    updated_at: new Date().toISOString(),
  };

  if (typeof freeShippingThreshold === 'number' && !Number.isNaN(freeShippingThreshold) && freeShippingThreshold >= 0) {
    updateFields['free_shipping_threshold'] = freeShippingThreshold;
  }
  if (typeof codMaxAmount === 'number' && !Number.isNaN(codMaxAmount) && codMaxAmount >= 0) {
    updateFields['cod_max_amount'] = codMaxAmount;
  }

  const { error: updateErr } = await supabaseAdmin
    .from('store_settings')
    .update(updateFields)
    .eq('id', row.id);

  if (updateErr) {
    return { success: false, error: updateErr.message };
  }

  await logAdminAction({
    actorId: auth.userId,
    action: `update_store_settings_${section}`,
    entityType: 'store_settings',
    entityId: row.id,
    afterState: payload,
  });

  revalidateTag('store-settings');
  revalidatePath('/admin/settings');
  revalidatePath(`/admin/settings/${section}`);
  revalidatePath('/checkout');
  return { success: true };
}
