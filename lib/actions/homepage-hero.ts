'use server';

import { createPublicClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { hasValidSupabaseConfig, hasValidServiceRoleKey, isCloudServerlessEnv } from '@/lib/env';
import { CONTENT_ADMIN_ROLES, logAdminAction, requireAdminRole } from '@/lib/supabase/admin-auth';
import type { Json } from '@/types/database';
import { revalidatePath, revalidateTag } from 'next/cache';
import {
  HomepageHeroData,
  defaultHeroData,
} from './homepage-hero-types';

export type { HomepageHeroData, NavItemEdit } from './homepage-hero-types';

async function readLocalBackup(): Promise<HomepageHeroData | null> {
  if (isCloudServerlessEnv()) return null;
  try {
    const fs = await import('fs/promises');
    const path = await import('path');
    const filePath = path.join(process.cwd(), 'data', 'homepage-hero.json');
    const content = await fs.readFile(filePath, 'utf8');
    return JSON.parse(content);
  } catch {
    return null;
  }
}

async function writeLocalBackup(data: HomepageHeroData): Promise<void> {
  if (isCloudServerlessEnv()) return;
  try {
    const fs = await import('fs/promises');
    const path = await import('path');
    const dataDir = path.join(process.cwd(), 'data');
    await fs.mkdir(dataDir, { recursive: true });
    await fs.writeFile(path.join(dataDir, 'homepage-hero.json'), JSON.stringify(data, null, 2), 'utf8');

    const siteContentPath = path.join(dataDir, 'site-content.json');
    try {
      const scRaw = await fs.readFile(siteContentPath, 'utf8');
      const scContent = JSON.parse(scRaw);
      const combinedTitle =
        data.headline && data.headlineHighlight
          ? `${data.headline} ${data.headlineHighlight}`.trim()
          : data.headline || data.headlineHighlight || scContent.hero?.title || 'Grace in Every Drape';
      scContent.hero = {
        ...(scContent.hero || {}),
        title: combinedTitle,
        subtitle: data.subtitle || scContent.hero?.subtitle || '',
        ctaText: data.primaryCtaText || scContent.hero?.ctaText || 'Explore Collection',
        ctaLink: data.primaryCtaLink || scContent.hero?.ctaLink || '/shop',
        secondaryCtaText: data.secondaryCtaText || scContent.hero?.secondaryCtaText || "Vidhya's Picks",
        secondaryCtaLink: data.secondaryCtaLink || scContent.hero?.secondaryCtaLink || '/vidhyas-picks',
        backgroundImage: data.backgroundImage || scContent.hero?.backgroundImage || '/images/hero-new-couture.jpg',
      };
      await fs.writeFile(siteContentPath, JSON.stringify(scContent, null, 2), 'utf8');
    } catch {
      // Ignore if site-content.json doesn't exist locally
    }
  } catch {
    // Ignore on read-only serverless/edge filesystems
  }
}

/**
 * Fetch default Homepage Hero data
 */
export async function getDefaultHeroData(): Promise<HomepageHeroData> {
  return defaultHeroData;
}

/**
 * Fetch Homepage Hero & Header settings (Cloudflare Edge & ISR compatible)
 */
export async function getHomepageHeroData(): Promise<HomepageHeroData> {
  let heroData: HomepageHeroData = { ...defaultHeroData };

  // 1. Optional local JSON backup as lowest-priority base in local dev
  const localBackup = await readLocalBackup();
  if (localBackup) {
    heroData = { ...heroData, ...localBackup };
  }

  if (!hasValidSupabaseConfig()) {
    return heroData;
  }

  const client = hasValidServiceRoleKey() ? supabaseAdmin : createPublicClient();

  // 2. Authoritative Supabase queries in parallel
  try {
    const [blockRes, settingsRes, navRes] = await Promise.all([
      client
        .from('content_blocks')
        .select('content')
        .eq('key', 'homepage_hero')
        .eq('is_active', true)
        .maybeSingle(),
      client.from('store_settings').select('*').limit(1).maybeSingle(),
      client
        .from('navbar_items')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true }),
    ]);

    if (!blockRes.error && blockRes.data?.content && typeof blockRes.data.content === 'object') {
      heroData = {
        ...heroData,
        ...(blockRes.data.content as Record<string, any>),
      };
    }

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
    console.warn('Could not fetch homepage_hero from Supabase, using fallback:', err);
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
    const auth = await requireAdminRole(CONTENT_ADMIN_ROLES);
    if (!auth.authorized) {
      return { success: false, error: auth.error || 'Unauthorized' };
    }

    // 1. Write to local JSON backup in local dev only
    await writeLocalBackup(data);

    // 2. Upsert to Supabase content_blocks table
    try {
      const { data: existing } = await supabaseAdmin
        .from('content_blocks')
        .select('id')
        .eq('key', 'homepage_hero')
        .maybeSingle();

      if (existing?.id) {
        await supabaseAdmin
          .from('content_blocks')
          .update({
            title: 'Homepage Hero & Header',
            type: 'hero',
            content: data as unknown as Json,
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
            content: data as unknown as Json,
            is_active: true,
            published_at: new Date().toISOString(),
          });
      }
    } catch (dbErr) {
      console.warn('Failed to save to content_blocks:', dbErr);
    }

    // 3. Sync to store_settings table
    try {
      const { data: storeSetting } = await supabaseAdmin.from('store_settings').select('id').limit(1).maybeSingle();
      if (storeSetting?.id) {
        await supabaseAdmin
          .from('store_settings')
          .update({
            site_name: data.brandName,
            site_tagline: data.brandTagline,
            logo_url: data.logoUrl || null,
            contact_whatsapp: data.conciergeWhatsApp || '+917207256690',
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

    // 5. Audit & revalidate storefront and admin paths
    await logAdminAction({
      actorId: auth.userId,
      action: 'update_homepage_hero',
      entityType: 'content_block',
      entityId: 'homepage_hero',
    });

    revalidateTag('homepage-hero');
    revalidateTag('site-content');
    revalidateTag('store-settings');
    revalidatePath('/');
    revalidatePath('/admin/content');
    revalidatePath('/admin');

    return { success: true, data };
  } catch (err: any) {
    console.error('Error in saveHomepageHeroData:', err);
    return { success: false, error: err?.message || 'Failed to save hero data' };
  }
}
