'use server';

import { revalidatePath } from 'next/cache';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { CONTENT_ADMIN_ROLES, logAdminAction, requireAdminRole } from '@/lib/supabase/admin-auth';
import { hasValidSupabaseConfig } from '@/lib/env';

export interface AdminLookInput {
  id?: string;
  name: string;
  lifestyle_image_url: string;
  lifestyle_image_alt?: string | null;
  is_active: boolean;
  display_order: number;
  hotspots: Array<{
    product_id: string;
    x_percent: number;
    y_percent: number;
    display_order: number;
  }>;
}

export async function createAdminLook(
  input: AdminLookInput
): Promise<{ success: boolean; lookId?: string; error?: string }> {
  const auth = await requireAdminRole(CONTENT_ADMIN_ROLES);
  if (!auth.authorized) {
    return { success: false, error: auth.error || 'Unauthorized' };
  }

  if (!hasValidSupabaseConfig()) {
    return { success: false, error: 'Database is not configured.' };
  }

  if (!input.name?.trim() || !input.lifestyle_image_url?.trim()) {
    return { success: false, error: 'Look name and lifestyle image URL are required.' };
  }

  const { data: newLook, error: lookError } = await supabaseAdmin
    .from('looks')
    .insert({
      name: input.name.trim(),
      lifestyle_image_url: input.lifestyle_image_url.trim(),
      lifestyle_image_alt: input.lifestyle_image_alt?.trim() || null,
      is_active: Boolean(input.is_active),
      display_order: Number(input.display_order) || 0,
    })
    .select('id')
    .single();

  if (lookError || !newLook) {
    return { success: false, error: lookError?.message || 'Failed to create look.' };
  }

  if (input.hotspots.length > 0) {
    const { error: hsErr } = await supabaseAdmin.from('look_hotspots').insert(
      input.hotspots.map((h, i) => ({
        look_id: newLook.id,
        product_id: h.product_id,
        x_percent: Math.max(0, Math.min(100, Number(h.x_percent))),
        y_percent: Math.max(0, Math.min(100, Number(h.y_percent))),
        display_order: i,
      }))
    );
    if (hsErr) {
      return { success: false, error: hsErr.message };
    }
  }

  await logAdminAction({
    actorId: auth.userId,
    action: 'create_look',
    entityType: 'look',
    entityId: newLook.id,
    afterState: { name: input.name, hotspots: input.hotspots.length },
  });

  revalidatePath('/admin/looks');
  revalidatePath('/');
  return { success: true, lookId: newLook.id };
}

export async function updateAdminLook(
  input: AdminLookInput & { id: string }
): Promise<{ success: boolean; error?: string }> {
  const auth = await requireAdminRole(CONTENT_ADMIN_ROLES);
  if (!auth.authorized) {
    return { success: false, error: auth.error || 'Unauthorized' };
  }

  if (!hasValidSupabaseConfig()) {
    return { success: false, error: 'Database is not configured.' };
  }

  const { error: lookError } = await supabaseAdmin
    .from('looks')
    .update({
      name: input.name.trim(),
      lifestyle_image_url: input.lifestyle_image_url.trim(),
      lifestyle_image_alt: input.lifestyle_image_alt?.trim() || null,
      is_active: Boolean(input.is_active),
      display_order: Number(input.display_order) || 0,
      updated_at: new Date().toISOString(),
    })
    .eq('id', input.id);

  if (lookError) {
    return { success: false, error: lookError.message };
  }

  const { error: delErr } = await supabaseAdmin
    .from('look_hotspots')
    .delete()
    .eq('look_id', input.id);

  if (delErr) {
    return { success: false, error: delErr.message };
  }

  if (input.hotspots.length > 0) {
    const { error: hsErr } = await supabaseAdmin.from('look_hotspots').insert(
      input.hotspots.map((h, i) => ({
        look_id: input.id,
        product_id: h.product_id,
        x_percent: Math.max(0, Math.min(100, Number(h.x_percent))),
        y_percent: Math.max(0, Math.min(100, Number(h.y_percent))),
        display_order: i,
      }))
    );
    if (hsErr) {
      return { success: false, error: hsErr.message };
    }
  }

  await logAdminAction({
    actorId: auth.userId,
    action: 'update_look',
    entityType: 'look',
    entityId: input.id,
    afterState: { name: input.name, is_active: input.is_active, hotspots: input.hotspots.length },
  });

  revalidatePath('/admin/looks');
  revalidatePath(`/admin/looks/${input.id}/edit`);
  revalidatePath('/');
  return { success: true };
}

export async function deleteAdminLook(
  lookId: string
): Promise<{ success: boolean; error?: string }> {
  const auth = await requireAdminRole(CONTENT_ADMIN_ROLES);
  if (!auth.authorized) {
    return { success: false, error: auth.error || 'Unauthorized' };
  }

  if (!hasValidSupabaseConfig()) {
    return { success: false, error: 'Database is not configured.' };
  }

  if (!lookId?.trim()) {
    return { success: false, error: 'Look ID is required.' };
  }

  await supabaseAdmin.from('look_hotspots').delete().eq('look_id', lookId);

  const { error } = await supabaseAdmin.from('looks').delete().eq('id', lookId);
  if (error) {
    return { success: false, error: error.message };
  }

  await logAdminAction({
    actorId: auth.userId,
    action: 'delete_look',
    entityType: 'look',
    entityId: lookId,
  });

  revalidatePath('/admin/looks');
  revalidatePath('/');
  return { success: true };
}
