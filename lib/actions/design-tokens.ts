'use server';

import { revalidatePath } from 'next/cache';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { CONTENT_ADMIN_ROLES, logAdminAction, requireAdminRole } from '@/lib/supabase/admin-auth';
import { hasValidSupabaseConfig } from '@/lib/env';
import type { Json } from '@/types/database';

export interface ActiveDesignTokensResult {
  success: boolean;
  tokens: Record<string, unknown> | null;
  version: string;
  updatedAt?: string;
  error?: string;
}

export async function getActiveDesignTokens(): Promise<ActiveDesignTokensResult> {
  if (!hasValidSupabaseConfig()) {
    return { success: true, tokens: null, version: 'default' };
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('design_tokens')
      .select('tokens, version, created_at')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      return { success: false, tokens: null, version: 'default', error: error.message };
    }

    if (!data) {
      return { success: true, tokens: null, version: 'default' };
    }

    return {
      success: true,
      tokens: (data.tokens && typeof data.tokens === 'object' ? data.tokens : null) as Record<string, unknown> | null,
      version: data.version || '1.0.0',
      updatedAt: data.created_at,
    };
  } catch (err: any) {
    return {
      success: false,
      tokens: null,
      version: 'default',
      error: err?.message || 'Failed to fetch design tokens',
    };
  }
}

export async function saveDesignTokens(input: {
  tokens: Record<string, unknown>;
  versionLabel?: string;
}): Promise<{ success: boolean; version?: string; error?: string }> {
  const auth = await requireAdminRole(CONTENT_ADMIN_ROLES);
  if (!auth.authorized) {
    return { success: false, error: auth.error || 'Unauthorized' };
  }

  if (!hasValidSupabaseConfig()) {
    return {
      success: false,
      error: 'Database is not configured. Connect Supabase before persisting design tokens.',
    };
  }

  try {
    const version = (input.versionLabel || `v${Date.now()}`).slice(0, 40);

    await supabaseAdmin
      .from('design_tokens')
      .update({ is_active: false })
      .eq('is_active', true);

    const { error } = await supabaseAdmin.from('design_tokens').insert({
      version,
      tokens: input.tokens as unknown as Json,
      is_active: true,
      created_by: auth.userId,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    await logAdminAction({
      actorId: auth.userId,
      action: 'save_design_tokens',
      entityType: 'design_tokens',
      entityId: version,
      metadata: { version },
    });

    revalidatePath('/admin/content/tokens');
    revalidatePath('/');
    return { success: true, version };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to persist design tokens' };
  }
}
