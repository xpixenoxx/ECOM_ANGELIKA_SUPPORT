'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import {
  ContentBlock,
  ContentBlockInput,
  ContentBlockListResult,
  ContentBlockSingleResult,
  ContentBlockMutationResult,
  ContentBlockType,
  CONTENT_BLOCK_TYPES,
  CONTENT_BLOCK_DEFAULT_CONTENT,
  CONTENT_BLOCK_DEFAULT_SETTINGS,
} from './content-blocks-types';

// ============================================
// SERVER ACTIONS
// ============================================

/**
 * Get all content blocks for admin (including drafts)
 */
export async function getContentBlocksAdmin(): Promise<ContentBlockListResult> {
  try {
    const supabase = await createClient();

    // Check admin auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: 'Unauthorized' };
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return { success: false, error: 'Forbidden - Admin only' };
    }

    const { data: blocks, error } = await supabase
      .from('content_blocks')
      .select('*')
      .order('sort_order', { ascending: true, nullsFirst: true })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Get content blocks error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, blocks: blocks || [] };
  } catch (error) {
    console.error('Get content blocks error:', error);
    return { success: false, error: 'Failed to fetch content blocks' };
  }
}

/**
 * Get published content blocks for frontend rendering
 */
export async function getPublishedContentBlocks(): Promise<ContentBlockListResult> {
  try {
    const supabase = await createClient();

    const { data: blocks, error } = await supabase
      .from('content_blocks')
      .select('*')
      .eq('is_active', true)
      .not('published_at', 'is', null)
      .lte('published_at', new Date().toISOString())
      .order('sort_order', { ascending: true, nullsFirst: true })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Get published content blocks error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, blocks: blocks || [] };
  } catch (error) {
    console.error('Get published content blocks error:', error);
    return { success: false, error: 'Failed to fetch content blocks' };
  }
}

/**
 * Get a single content block by ID
 */
export async function getContentBlock(id: string): Promise<ContentBlockSingleResult> {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: 'Unauthorized' };
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return { success: false, error: 'Forbidden - Admin only' };
    }

    const { data: block, error } = await supabase
      .from('content_blocks')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, block };
  } catch (error) {
    console.error('Get content block error:', error);
    return { success: false, error: 'Failed to fetch content block' };
  }
}

/**
 * Create a new content block
 */
export async function createContentBlock(input: ContentBlockInput): Promise<ContentBlockMutationResult> {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: 'Unauthorized' };
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return { success: false, error: 'Forbidden - Admin only' };
    }

    // Check if key already exists
    const { data: existing } = await supabase
      .from('content_blocks')
      .select('id')
      .eq('key', input.key)
      .single();

    if (existing) {
      return { success: false, error: 'A content block with this key already exists' };
    }

    const { data: block, error } = await supabase
      .from('content_blocks')
      .insert({
        ...input,
        content: input.content || CONTENT_BLOCK_DEFAULT_CONTENT[input.type as ContentBlockType] || {},
        settings: input.settings || CONTENT_BLOCK_DEFAULT_SETTINGS[input.type as ContentBlockType] || {},
        created_by: user.id,
        updated_by: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Create content block error:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/admin/content/blocks');
    revalidatePath('/');

    return { success: true, block };
  } catch (error) {
    console.error('Create content block error:', error);
    return { success: false, error: 'Failed to create content block' };
  }
}

/**
 * Update a content block
 */
export async function updateContentBlock(id: string, input: Partial<ContentBlockInput>): Promise<ContentBlockMutationResult> {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: 'Unauthorized' };
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return { success: false, error: 'Forbidden - Admin only' };
    }

    // If key is being changed, check for conflicts
    if (input.key) {
      const { data: existing } = await supabase
        .from('content_blocks')
        .select('id')
        .eq('key', input.key)
        .neq('id', id)
        .single();

      if (existing) {
        return { success: false, error: 'A content block with this key already exists' };
      }
    }

    const { data: block, error } = await supabase
      .from('content_blocks')
      .update({
        ...input,
        updated_by: user.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Update content block error:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/admin/content/blocks');
    revalidatePath('/');

    return { success: true, block };
  } catch (error) {
    console.error('Update content block error:', error);
    return { success: false, error: 'Failed to update content block' };
  }
}

/**
 * Delete a content block
 */
export async function deleteContentBlock(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: 'Unauthorized' };
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return { success: false, error: 'Forbidden - Admin only' };
    }

    const { error } = await supabase
      .from('content_blocks')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Delete content block error:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/admin/content/blocks');
    revalidatePath('/');

    return { success: true };
  } catch (error) {
    console.error('Delete content block error:', error);
    return { success: false, error: 'Failed to delete content block' };
  }
}

/**
 * Reorder content blocks (update sort_order)
 */
export async function reorderContentBlocks(blockIds: string[]): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: 'Unauthorized' };
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return { success: false, error: 'Forbidden - Admin only' };
    }

    const updates = blockIds.map((id, index) =>
      supabase
        .from('content_blocks')
        .update({ sort_order: index, updated_by: user.id })
        .eq('id', id)
    );

    const results = await Promise.all(updates);

    const errors = results.filter(r => r.error);
    if (errors.length > 0) {
      return { success: false, error: 'Some blocks failed to reorder' };
    }

    revalidatePath('/admin/content/blocks');
    revalidatePath('/');

    return { success: true };
  } catch (error) {
    console.error('Reorder content blocks error:', error);
    return { success: false, error: 'Failed to reorder content blocks' };
  }
}

/**
 * Toggle content block active/published status
 */
export async function toggleContentBlockStatus(id: string, isActive: boolean, publish: boolean = false): Promise<ContentBlockMutationResult> {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: 'Unauthorized' };
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return { success: false, error: 'Forbidden - Admin only' };
    }

    const updateData: any = {
      is_active: isActive,
      updated_by: user.id,
    };

    if (publish && isActive) {
      updateData.published_at = new Date().toISOString();
    } else if (!isActive) {
      updateData.published_at = null;
    }

    const { data: block, error } = await supabase
      .from('content_blocks')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Toggle content block status error:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/admin/content/blocks');
    revalidatePath('/');

    return { success: true, block };
  } catch (error) {
    console.error('Toggle content block status error:', error);
    return { success: false, error: 'Failed to toggle status' };
  }
}

/**
 * Duplicate a content block
 */
export async function duplicateContentBlock(id: string): Promise<ContentBlockMutationResult> {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: 'Unauthorized' };
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return { success: false, error: 'Forbidden - Admin only' };
    }

    // Get original block
    const { data: original, error: fetchError } = await supabase
      .from('content_blocks')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !original) {
      return { success: false, error: 'Content block not found' };
    }

    // Generate new key
    const baseKey = original.key;
    let newKey = `${baseKey}-copy`;
    let counter = 1;

    while (true) {
      const { data: existing } = await supabase
        .from('content_blocks')
        .select('id')
        .eq('key', newKey)
        .single();

      if (!existing) break;
      counter++;
      newKey = `${baseKey}-copy-${counter}`;
    }

    // Create duplicate
    const { data: block, error } = await supabase
      .from('content_blocks')
      .insert({
        key: newKey,
        type: original.type,
        title: original.title ? `${original.title} (Copy)` : null,
        content: original.content,
        settings: original.settings,
        is_active: false, // Duplicate starts as draft
        published_at: null,
        created_by: user.id,
        updated_by: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Duplicate content block error:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/admin/content/blocks');

    return { success: true, block };
  } catch (error) {
    console.error('Duplicate content block error:', error);
    return { success: false, error: 'Failed to duplicate content block' };
  }
}