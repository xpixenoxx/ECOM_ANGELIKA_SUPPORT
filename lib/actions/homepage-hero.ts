'use server';

import { supabaseAdmin } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';
import fs from 'fs';
import path from 'path';
import {
  HomepageHeroData,
  defaultHeroData,
} from './homepage-hero-types';

export type { HomepageHeroData, NavItemEdit } from './homepage-hero-types';

const DATA_FILE_PATH = path.join(process.cwd(), 'data', 'homepage-hero.json');

function readLocalBackup(): HomepageHeroData | null {
  try {
    if (fs.existsSync(DATA_FILE_PATH)) {
      const content = fs.readFileSync(DATA_FILE_PATH, 'utf8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error('Failed to read local backup:', err);
  }
  return null;
}

function writeLocalBackup(data: HomepageHeroData) {
  try {
    const dir = path.dirname(DATA_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to write local backup:', err);
  }
}

/**
 * Fetch default Homepage Hero data
 */
export async function getDefaultHeroData(): Promise<HomepageHeroData> {
  return defaultHeroData;
}

/**
 * Fetch Homepage Hero & Header settings
 */
export async function getHomepageHeroData(): Promise<HomepageHeroData> {
  let heroData: HomepageHeroData = { ...defaultHeroData };

  // 1. Try to read local file backup first for instant offline/fast load
  const localBackup = readLocalBackup();
  if (localBackup) {
    heroData = { ...heroData, ...localBackup };
  }

  // 2. Try Supabase content_blocks table
  try {
    const { data, error } = await supabaseAdmin
      .from('content_blocks')
      .select('content')
      .eq('key', 'homepage_hero')
      .single();

    if (!error && data?.content && typeof data.content === 'object') {
      heroData = {
        ...heroData,
        ...data.content,
      };
      // Keep local backup updated
      writeLocalBackup(heroData);
      return heroData;
    }
  } catch (err) {
    console.warn('Could not fetch homepage_hero from Supabase, using fallback:', err);
  }

  // 3. Fallback: check store_settings and navbar_items if content_blocks had no record
  try {
    const [settingsRes, navRes] = await Promise.all([
      supabaseAdmin.from('store_settings').select('*').limit(1).single(),
      supabaseAdmin.from('navbar_items').select('*').order('sort_order', { ascending: true }),
    ]);

    if (!settingsRes.error && settingsRes.data) {
      if (settingsRes.data.site_name) heroData.brandName = settingsRes.data.site_name;
      if (settingsRes.data.site_tagline) heroData.brandTagline = settingsRes.data.site_tagline;
      if (settingsRes.data.logo_url) heroData.logoUrl = settingsRes.data.logo_url;
      if (settingsRes.data.contact_whatsapp) heroData.conciergeWhatsApp = settingsRes.data.contact_whatsapp;
    }

    if (!navRes.error && navRes.data && navRes.data.length > 0) {
      heroData.navigation = navRes.data.map((item: any) => ({
        id: item.id,
        label: item.label,
        href: item.href,
        is_active: item.is_active ?? true,
      }));
    }
  } catch (err) {
    console.warn('Could not query fallback store_settings:', err);
  }

  return heroData;
}

/**
 * Save Homepage Hero & Header settings
 */
export async function saveHomepageHeroData(
  data: HomepageHeroData
): Promise<{ success: boolean; data?: HomepageHeroData; error?: string }> {
  try {
    // 1. Always write to local JSON backup
    writeLocalBackup(data);

    // 2. Upsert to Supabase content_blocks table
    try {
      const { data: existing } = await supabaseAdmin
        .from('content_blocks')
        .select('id')
        .eq('key', 'homepage_hero')
        .single();

      if (existing?.id) {
        await supabaseAdmin
          .from('content_blocks')
          .update({
            title: 'Homepage Hero & Header',
            type: 'hero',
            content: data,
            is_active: true,
            published_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id);
      } else {
        await supabaseAdmin
          .from('content_blocks')
          .insert({
            key: 'homepage_hero',
            type: 'hero',
            title: 'Homepage Hero & Header',
            content: data,
            is_active: true,
            published_at: new Date().toISOString(),
          });
      }
    } catch (dbErr) {
      console.warn('Failed to save to content_blocks:', dbErr);
    }

    // 3. Sync to store_settings table
    try {
      const { data: storeSetting } = await supabaseAdmin.from('store_settings').select('id').limit(1).single();
      if (storeSetting?.id) {
        await supabaseAdmin
          .from('store_settings')
          .update({
            site_name: data.brandName,
            site_tagline: data.brandTagline,
            logo_url: data.logoUrl || null,
            contact_whatsapp: data.conciergeWhatsApp || '+91 98765 43210',
            updated_at: new Date().toISOString(),
          })
          .eq('id', storeSetting.id);
      }
    } catch (sErr) {
      console.warn('Failed to sync store_settings:', sErr);
    }

    // 4. Sync navbar_items
    try {
      if (Array.isArray(data.navigation) && data.navigation.length > 0) {
        await supabaseAdmin.from('navbar_items').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        const rows = data.navigation.map((item, index) => ({
          label: item.label,
          href: item.href,
          sort_order: index + 1,
          is_active: item.is_active ?? true,
          badge_color: '#C9A84C',
        }));
        await supabaseAdmin.from('navbar_items').insert(rows);
      }
    } catch (nErr) {
      console.warn('Failed to sync navbar_items:', nErr);
    }

    // 5. Revalidate storefront and admin paths
    revalidatePath('/');
    revalidatePath('/admin/content');
    revalidatePath('/admin');

    return { success: true, data };
  } catch (err: any) {
    console.error('Error in saveHomepageHeroData:', err);
    return { success: false, error: err?.message || 'Failed to save hero data' };
  }
}
