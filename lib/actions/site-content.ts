'use server';

import { unstable_cache, revalidateTag } from 'next/cache';
import { createPublicClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { hasValidSupabaseConfig, isCloudServerlessEnv } from '@/lib/env';
import type { Json } from '@/types/database';

export type * from './site-content-types';
import type { SiteContent } from './site-content-types';
import { DEFAULT_SITE_CONTENT } from '@/lib/services/content/defaults';
import {
  fetchInitialSyncedCategoryProducts,
  getPageSectionToCategorySlugMap,
  syncCmsCategoryToDb,
} from './product-cms-sync';

async function readLocalSiteContentFile(): Promise<Record<string, any> | null> {
  if (isCloudServerlessEnv()) return null;
  try {
    const fs = await import('fs/promises');
    const path = await import('path');
    const filePath = path.join(process.cwd(), 'data', 'site-content.json');
    const raw = await fs.readFile(filePath, 'utf-8');
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
}

async function writeLocalSiteContentFile(content: SiteContent): Promise<void> {
  if (isCloudServerlessEnv()) return;
  try {
    const fs = await import('fs/promises');
    const path = await import('path');
    const dataDir = path.join(process.cwd(), 'data');
    await fs.mkdir(dataDir, { recursive: true });
    await fs.writeFile(path.join(dataDir, 'site-content.json'), JSON.stringify(content, null, 2), 'utf-8');
  } catch {
    // Ignore on read-only serverless/edge filesystems
  }
}

async function readSiteContentOverrides(): Promise<Record<string, any>> {
  let merged: Record<string, any> = {};

  // 1. Optional dev JSON file as lowest-priority base override
  const parsedFile = await readLocalSiteContentFile();
  if (parsedFile) {
    merged = { ...parsedFile };
  }

  // 2. Authoritative Supabase content_blocks table (only public active CMS sections)
  if (hasValidSupabaseConfig()) {
    try {
      const publicClient = createPublicClient();
      const { data: blocks } = await publicClient
        .from('content_blocks')
        .select('key, content, updated_at')
        .eq('is_active', true);

      if (Array.isArray(blocks)) {
        for (const row of blocks) {
          if (row?.key && row.key in DEFAULT_SITE_CONTENT && row.content && typeof row.content === 'object') {
            const fileTime = new Date((parsedFile?.[row.key] as any)?._updated_at || 0).getTime();
            const dbTime = new Date((row.content as any)?._updated_at || (row as any)?.updated_at || 0).getTime();
            if (!isCloudServerlessEnv() && fileTime > dbTime) {
              // Local file edit is more recent, retain it
            } else {
              merged[row.key] = row.content;
            }
          }
        }
      }
    } catch {
      // Fallback safely to defaults / local cache if Supabase is temporarily unreachable
    }
  }

  // 3. Initial product catalog sync for unsynced category CMS pages
  const pageSectionToSlug = await getPageSectionToCategorySlugMap();
  const categorySectionIds = Object.keys(pageSectionToSlug);
  const unsyncedSections = categorySectionIds.filter(
    (secId) => !merged[secId]?._products_synced_at
  );
  if (unsyncedSections.length > 0) {
    const fetchedLists = await Promise.all(
      unsyncedSections.map((secId) => fetchInitialSyncedCategoryProducts(secId))
    );
    unsyncedSections.forEach((secId, idx) => {
      const dbProducts = fetchedLists[idx];
      if (Array.isArray(dbProducts) && dbProducts.length > 0) {
        const defaultSec = (DEFAULT_SITE_CONTENT as Record<string, any>)[secId] || {};
        merged[secId] = {
          ...defaultSec,
          ...(merged[secId] || {}),
          products: dbProducts,
        };
      }
    });
  }

  return merged;
}

async function loadMergedSiteContent(): Promise<SiteContent> {
  try {
    const parsed: any = await readSiteContentOverrides();
    return {
      ...DEFAULT_SITE_CONTENT,
      ...parsed,
      hero: { ...DEFAULT_SITE_CONTENT.hero, ...(parsed.hero || {}) },
      features: {
        ...DEFAULT_SITE_CONTENT.features,
        ...(parsed.features || {}),
        items: (parsed.features?.items && parsed.features.items.length > 0)
          ? parsed.features.items
          : DEFAULT_SITE_CONTENT.features.items,
      },
      'vidhyas-picks': {
        ...DEFAULT_SITE_CONTENT['vidhyas-picks'],
        ...(parsed['vidhyas-picks'] || {}),
        hasCustomItems: Boolean(
          parsed['vidhyas-picks']?._updated_at &&
          parsed['vidhyas-picks']?.items &&
          parsed['vidhyas-picks'].items.length > 0
        ),
        items: (parsed['vidhyas-picks']?.items && parsed['vidhyas-picks'].items.length > 0)
          ? parsed['vidhyas-picks'].items
          : DEFAULT_SITE_CONTENT['vidhyas-picks']!.items,
      } as any,
      categories: {
        ...DEFAULT_SITE_CONTENT.categories,
        ...(parsed.categories || {}),
        items: (parsed.categories?.items && parsed.categories.items.length > 0)
          ? parsed.categories.items
          : (DEFAULT_SITE_CONTENT.categories?.items || []),
      },
      'new-arrivals': {
        ...DEFAULT_SITE_CONTENT['new-arrivals'],
        ...(parsed['new-arrivals'] || {}),
        items: (parsed['new-arrivals']?.items && parsed['new-arrivals'].items.length > 0)
          ? parsed['new-arrivals'].items
          : (DEFAULT_SITE_CONTENT['new-arrivals']?.items || []),
      },
      'shop-the-look': {
        ...DEFAULT_SITE_CONTENT['shop-the-look'],
        ...(parsed['shop-the-look'] || {}),
        badge: (parsed['shop-the-look']?.badge || DEFAULT_SITE_CONTENT['shop-the-look']?.badge || 'Curated Ensemble')
          .replace(/ensemblesss/gi, 'Ensemble')
          .trim(),
        title: (parsed['shop-the-look']?.title || DEFAULT_SITE_CONTENT['shop-the-look']?.title || 'Festive Elegance')
          .replace(/elegancesss/gi, 'Elegance')
          .trim(),
        subtitle: (parsed['shop-the-look']?.subtitle || DEFAULT_SITE_CONTENT['shop-the-look']?.subtitle || 'Click pins on image to explore')
          .trim(),
        productName: parsed['shop-the-look']?.productName ?? DEFAULT_SITE_CONTENT['shop-the-look']?.productName ?? 'Mirror Work Lehenga',
        productSlug: parsed['shop-the-look']?.productSlug ?? DEFAULT_SITE_CONTENT['shop-the-look']?.productSlug ?? 'mirror-work-lehenga',
      },
      'salwars-page': {
        ...DEFAULT_SITE_CONTENT['salwars-page'],
        ...(parsed['salwars-page'] || {}),
        hero: {
          ...DEFAULT_SITE_CONTENT['salwars-page']!.hero,
          ...(parsed['salwars-page']?.hero || {}),
        },
        announcement: {
          ...DEFAULT_SITE_CONTENT['salwars-page']!.announcement,
          ...(parsed['salwars-page']?.announcement || {}),
        },
        navigation: {
          ...DEFAULT_SITE_CONTENT['salwars-page']!.navigation,
          ...(parsed['salwars-page']?.navigation || {}),
        },
        sidebar: {
          ...DEFAULT_SITE_CONTENT['salwars-page']!.sidebar,
          ...(parsed['salwars-page']?.sidebar || {}),
        },
        concierge: {
          ...DEFAULT_SITE_CONTENT['salwars-page']!.concierge,
          ...(parsed['salwars-page']?.concierge || {}),
        },
        seo: {
          ...DEFAULT_SITE_CONTENT['salwars-page']!.seo,
          ...(parsed['salwars-page']?.seo || {}),
        },
        products: ((parsed['salwars-page']?._products_synced_at && Array.isArray(parsed['salwars-page']?.products)) || (parsed['salwars-page']?.products && parsed['salwars-page'].products.length > 0))
          ? parsed['salwars-page'].products
          : DEFAULT_SITE_CONTENT['salwars-page']!.products,
      },
      'lehengas-page': {
        ...DEFAULT_SITE_CONTENT['lehengas-page'],
        ...(parsed['lehengas-page'] || {}),
        hero: {
          ...DEFAULT_SITE_CONTENT['lehengas-page']!.hero,
          ...(parsed['lehengas-page']?.hero || {}),
        },
        announcement: {
          ...DEFAULT_SITE_CONTENT['lehengas-page']!.announcement,
          ...(parsed['lehengas-page']?.announcement || {}),
        },
        navigation: {
          ...DEFAULT_SITE_CONTENT['lehengas-page']!.navigation,
          ...(parsed['lehengas-page']?.navigation || {}),
        },
        sidebar: {
          ...DEFAULT_SITE_CONTENT['lehengas-page']!.sidebar,
          ...(parsed['lehengas-page']?.sidebar || {}),
        },
        concierge: {
          ...DEFAULT_SITE_CONTENT['lehengas-page']!.concierge,
          ...(parsed['lehengas-page']?.concierge || {}),
        },
        seo: {
          ...DEFAULT_SITE_CONTENT['lehengas-page']!.seo,
          ...(parsed['lehengas-page']?.seo || {}),
        },
        products: ((parsed['lehengas-page']?._products_synced_at && Array.isArray(parsed['lehengas-page']?.products)) || (parsed['lehengas-page']?.products && parsed['lehengas-page'].products.length > 0))
          ? parsed['lehengas-page'].products
          : DEFAULT_SITE_CONTENT['lehengas-page']!.products,
      },
      'sarees-page': {
        ...DEFAULT_SITE_CONTENT['sarees-page'],
        ...(parsed['sarees-page'] || {}),
        hero: {
          ...DEFAULT_SITE_CONTENT['sarees-page']!.hero,
          ...(parsed['sarees-page']?.hero || {}),
        },
        announcement: {
          ...DEFAULT_SITE_CONTENT['sarees-page']!.announcement,
          ...(parsed['sarees-page']?.announcement || {}),
        },
        navigation: {
          ...DEFAULT_SITE_CONTENT['sarees-page']!.navigation,
          ...(parsed['sarees-page']?.navigation || {}),
        },
        sidebar: {
          ...DEFAULT_SITE_CONTENT['sarees-page']!.sidebar,
          ...(parsed['sarees-page']?.sidebar || {}),
        },
        concierge: {
          ...DEFAULT_SITE_CONTENT['sarees-page']!.concierge,
          ...(parsed['sarees-page']?.concierge || {}),
        },
        seo: {
          ...DEFAULT_SITE_CONTENT['sarees-page']!.seo,
          ...(parsed['sarees-page']?.seo || {}),
        },
        products: ((parsed['sarees-page']?._products_synced_at && Array.isArray(parsed['sarees-page']?.products)) || (parsed['sarees-page']?.products && parsed['sarees-page'].products.length > 0))
          ? parsed['sarees-page'].products
          : DEFAULT_SITE_CONTENT['sarees-page']!.products,
      },
      'dupattas-page': {
        ...DEFAULT_SITE_CONTENT['dupattas-page'],
        ...(parsed['dupattas-page'] || {}),
        hero: {
          ...DEFAULT_SITE_CONTENT['dupattas-page']!.hero,
          ...(parsed['dupattas-page']?.hero || {}),
        },
        announcement: {
          ...DEFAULT_SITE_CONTENT['dupattas-page']!.announcement,
          ...(parsed['dupattas-page']?.announcement || {}),
        },
        navigation: {
          ...DEFAULT_SITE_CONTENT['dupattas-page']!.navigation,
          ...(parsed['dupattas-page']?.navigation || {}),
        },
        sidebar: {
          ...DEFAULT_SITE_CONTENT['dupattas-page']!.sidebar,
          ...(parsed['dupattas-page']?.sidebar || {}),
        },
        concierge: {
          ...DEFAULT_SITE_CONTENT['dupattas-page']!.concierge,
          ...(parsed['dupattas-page']?.concierge || {}),
        },
        seo: {
          ...DEFAULT_SITE_CONTENT['dupattas-page']!.seo,
          ...(parsed['dupattas-page']?.seo || {}),
        },
        products: ((parsed['dupattas-page']?._products_synced_at && Array.isArray(parsed['dupattas-page']?.products)) || (parsed['dupattas-page']?.products && parsed['dupattas-page'].products.length > 0))
          ? parsed['dupattas-page'].products
          : DEFAULT_SITE_CONTENT['dupattas-page']!.products,
      },
      'new-arrivals-page': {
        ...DEFAULT_SITE_CONTENT['new-arrivals-page'],
        ...(parsed['new-arrivals-page'] || {}),
        header: {
          ...DEFAULT_SITE_CONTENT['new-arrivals-page']!.header,
          ...(parsed['new-arrivals-page']?.header || {}),
        },
        categories: (parsed['new-arrivals-page']?.categories && parsed['new-arrivals-page'].categories.length > 0)
          ? parsed['new-arrivals-page'].categories
          : DEFAULT_SITE_CONTENT['new-arrivals-page']!.categories,
        seo: {
          ...DEFAULT_SITE_CONTENT['new-arrivals-page']!.seo,
          ...(parsed['new-arrivals-page']?.seo || {}),
        },
        products: (parsed['new-arrivals-page']?.products && parsed['new-arrivals-page'].products.length > 0)
          ? parsed['new-arrivals-page'].products
          : DEFAULT_SITE_CONTENT['new-arrivals-page']!.products,
      },
      'sale-page': {
        ...DEFAULT_SITE_CONTENT['sale-page'],
        ...(parsed['sale-page'] || {}),
        header: {
          ...DEFAULT_SITE_CONTENT['sale-page']!.header,
          ...(parsed['sale-page']?.header || {}),
        },
        events: (parsed['sale-page']?.events && parsed['sale-page'].events.length > 0)
          ? parsed['sale-page'].events
          : DEFAULT_SITE_CONTENT['sale-page']!.events,
        categories: (parsed['sale-page']?.categories && parsed['sale-page'].categories.length > 0)
          ? parsed['sale-page'].categories
          : DEFAULT_SITE_CONTENT['sale-page']!.categories,
        policies: (parsed['sale-page']?.policies && parsed['sale-page'].policies.length > 0)
          ? parsed['sale-page'].policies
          : DEFAULT_SITE_CONTENT['sale-page']!.policies,
        seo: {
          ...DEFAULT_SITE_CONTENT['sale-page']!.seo,
          ...(parsed['sale-page']?.seo || {}),
        },
        products: (parsed['sale-page']?.products && parsed['sale-page'].products.length > 0)
          ? parsed['sale-page'].products
          : DEFAULT_SITE_CONTENT['sale-page']!.products,
      },
      'my-angelika-look': {
        ...DEFAULT_SITE_CONTENT['my-angelika-look'],
        ...(parsed['my-angelika-look'] || {}),
        posts: (parsed['my-angelika-look']?.posts && parsed['my-angelika-look'].posts.length > 0)
          ? parsed['my-angelika-look'].posts
          : DEFAULT_SITE_CONTENT['my-angelika-look']!.posts,
      },
      'privacy-policy-page': {
        ...DEFAULT_SITE_CONTENT['privacy-policy-page'],
        ...(parsed['privacy-policy-page'] || {}),
        sections: (parsed['privacy-policy-page']?.sections && parsed['privacy-policy-page'].sections.length > 0)
          ? parsed['privacy-policy-page'].sections
          : DEFAULT_SITE_CONTENT['privacy-policy-page']!.sections,
        seo: {
          ...DEFAULT_SITE_CONTENT['privacy-policy-page']!.seo,
          ...(parsed['privacy-policy-page']?.seo || {}),
        },
      },
      'terms-page': {
        ...DEFAULT_SITE_CONTENT['terms-page'],
        ...(parsed['terms-page'] || {}),
        sections: (parsed['terms-page']?.sections && parsed['terms-page'].sections.length > 0)
          ? parsed['terms-page'].sections
          : DEFAULT_SITE_CONTENT['terms-page']!.sections,
        seo: {
          ...DEFAULT_SITE_CONTENT['terms-page']!.seo,
          ...(parsed['terms-page']?.seo || {}),
        },
      },
      'cookies-page': {
        ...DEFAULT_SITE_CONTENT['cookies-page'],
        ...(parsed['cookies-page'] || {}),
        sections: (parsed['cookies-page']?.sections && parsed['cookies-page'].sections.length > 0)
          ? parsed['cookies-page'].sections
          : DEFAULT_SITE_CONTENT['cookies-page']!.sections,
        seo: {
          ...DEFAULT_SITE_CONTENT['cookies-page']!.seo,
          ...(parsed['cookies-page']?.seo || {}),
        },
      },
      'accessibility-page': {
        ...DEFAULT_SITE_CONTENT['accessibility-page'],
        ...(parsed['accessibility-page'] || {}),
        sections: (parsed['accessibility-page']?.sections && parsed['accessibility-page'].sections.length > 0)
          ? parsed['accessibility-page'].sections
          : DEFAULT_SITE_CONTENT['accessibility-page']!.sections,
        conciergeDesk: {
          ...DEFAULT_SITE_CONTENT['accessibility-page']!.conciergeDesk,
          ...(parsed['accessibility-page']?.conciergeDesk || {}),
        },
        seo: {
          ...DEFAULT_SITE_CONTENT['accessibility-page']!.seo,
          ...(parsed['accessibility-page']?.seo || {}),
        },
      },
      'shop-page': {
        ...DEFAULT_SITE_CONTENT['shop-page'],
        ...(parsed['shop-page'] || {}),
        hero: {
          ...DEFAULT_SITE_CONTENT['shop-page']!.hero,
          ...(parsed['shop-page']?.hero || {}),
        },
        announcement: {
          ...DEFAULT_SITE_CONTENT['shop-page']!.announcement,
          ...(parsed['shop-page']?.announcement || {}),
        },
        navigation: {
          ...DEFAULT_SITE_CONTENT['shop-page']!.navigation,
          ...(parsed['shop-page']?.navigation || {}),
          items: (parsed['shop-page']?.navigation?.items && parsed['shop-page'].navigation.items.length > 0)
            ? parsed['shop-page'].navigation.items
            : DEFAULT_SITE_CONTENT['shop-page']!.navigation.items,
        },
        sidebar: {
          ...DEFAULT_SITE_CONTENT['shop-page']!.sidebar,
          ...(parsed['shop-page']?.sidebar || {}),
        },
        concierge: {
          ...DEFAULT_SITE_CONTENT['shop-page']!.concierge,
          ...(parsed['shop-page']?.concierge || {}),
        },
        seo: {
          ...DEFAULT_SITE_CONTENT['shop-page']!.seo,
          ...(parsed['shop-page']?.seo || {}),
        },
        productsMode: parsed['shop-page']?.productsMode || DEFAULT_SITE_CONTENT['shop-page']!.productsMode || 'database',
        products: (parsed['shop-page']?.products && parsed['shop-page'].products.length > 0)
          ? parsed['shop-page'].products
          : DEFAULT_SITE_CONTENT['shop-page']!.products,
      },
      'about-page': {
        ...DEFAULT_SITE_CONTENT['about-page'],
        ...(parsed['about-page'] || {}),
        hero: {
          ...DEFAULT_SITE_CONTENT['about-page']!.hero,
          ...(parsed['about-page']?.hero || {}),
        },
        founderNote: {
          ...DEFAULT_SITE_CONTENT['about-page']!.founderNote,
          ...(parsed['about-page']?.founderNote || {}),
          storyParagraphs: (parsed['about-page']?.founderNote?.storyParagraphs && parsed['about-page'].founderNote.storyParagraphs.length > 0)
            ? parsed['about-page'].founderNote.storyParagraphs
            : DEFAULT_SITE_CONTENT['about-page']!.founderNote.storyParagraphs,
        },
        values: {
          ...DEFAULT_SITE_CONTENT['about-page']!.values,
          ...(parsed['about-page']?.values || {}),
          items: (parsed['about-page']?.values?.items && parsed['about-page'].values.items.length > 0)
            ? parsed['about-page'].values.items
            : DEFAULT_SITE_CONTENT['about-page']!.values.items,
        },
        journey: {
          ...DEFAULT_SITE_CONTENT['about-page']!.journey,
          ...(parsed['about-page']?.journey || {}),
          milestones: (parsed['about-page']?.journey?.milestones && parsed['about-page'].journey.milestones.length > 0)
            ? parsed['about-page'].journey.milestones
            : DEFAULT_SITE_CONTENT['about-page']!.journey.milestones,
        },
        team: {
          ...DEFAULT_SITE_CONTENT['about-page']!.team,
          ...(parsed['about-page']?.team || {}),
          members: (parsed['about-page']?.team?.members && parsed['about-page'].team.members.length > 0)
            ? parsed['about-page'].team.members
            : DEFAULT_SITE_CONTENT['about-page']!.team.members,
        },
        artisanSpotlight: {
          ...DEFAULT_SITE_CONTENT['about-page']!.artisanSpotlight,
          ...(parsed['about-page']?.artisanSpotlight || {}),
          paragraphs: (parsed['about-page']?.artisanSpotlight?.paragraphs && parsed['about-page'].artisanSpotlight.paragraphs.length > 0)
            ? parsed['about-page'].artisanSpotlight.paragraphs
            : DEFAULT_SITE_CONTENT['about-page']!.artisanSpotlight.paragraphs,
        },
        bottomCta: {
          ...DEFAULT_SITE_CONTENT['about-page']!.bottomCta,
          ...(parsed['about-page']?.bottomCta || {}),
        },
        seo: {
          ...DEFAULT_SITE_CONTENT['about-page']!.seo,
          ...(parsed['about-page']?.seo || {}),
        },
      },
      'shipping-page': {
        ...DEFAULT_SITE_CONTENT['shipping-page'],
        ...(parsed['shipping-page'] || {}),
        header: {
          ...DEFAULT_SITE_CONTENT['shipping-page']!.header,
          ...(parsed['shipping-page']?.header || {}),
        },
        highlights: (parsed['shipping-page']?.highlights && parsed['shipping-page'].highlights.length > 0)
          ? parsed['shipping-page'].highlights
          : DEFAULT_SITE_CONTENT['shipping-page']!.highlights,
        sections: (parsed['shipping-page']?.sections && parsed['shipping-page'].sections.length > 0)
          ? parsed['shipping-page'].sections
          : DEFAULT_SITE_CONTENT['shipping-page']!.sections,
        concierge: {
          ...DEFAULT_SITE_CONTENT['shipping-page']!.concierge,
          ...(parsed['shipping-page']?.concierge || {}),
        },
        seo: {
          ...DEFAULT_SITE_CONTENT['shipping-page']!.seo,
          ...(parsed['shipping-page']?.seo || {}),
        },
      },
      'returns-page': {
        ...DEFAULT_SITE_CONTENT['returns-page'],
        ...(parsed['returns-page'] || {}),
        header: {
          ...DEFAULT_SITE_CONTENT['returns-page']!.header,
          ...(parsed['returns-page']?.header || {}),
        },
        process: {
          ...DEFAULT_SITE_CONTENT['returns-page']!.process,
          ...(parsed['returns-page']?.process || {}),
          steps: (parsed['returns-page']?.process?.steps && parsed['returns-page'].process.steps.length > 0)
            ? parsed['returns-page'].process.steps
            : DEFAULT_SITE_CONTENT['returns-page']!.process.steps,
        },
        sections: (parsed['returns-page']?.sections && parsed['returns-page'].sections.length > 0)
          ? parsed['returns-page'].sections
          : DEFAULT_SITE_CONTENT['returns-page']!.sections,
        concierge: {
          ...DEFAULT_SITE_CONTENT['returns-page']!.concierge,
          ...(parsed['returns-page']?.concierge || {}),
        },
        seo: {
          ...DEFAULT_SITE_CONTENT['returns-page']!.seo,
          ...(parsed['returns-page']?.seo || {}),
        },
      },
      'size-finder-page': {
        ...DEFAULT_SITE_CONTENT['size-finder-page'],
        ...(parsed['size-finder-page'] || {}),
        header: {
          ...DEFAULT_SITE_CONTENT['size-finder-page']!.header,
          ...(parsed['size-finder-page']?.header || {}),
        },
        studio: {
          ...DEFAULT_SITE_CONTENT['size-finder-page']!.studio,
          ...(parsed['size-finder-page']?.studio || {}),
        },
        silhouettes: (parsed['size-finder-page']?.silhouettes && parsed['size-finder-page'].silhouettes.length > 0)
          ? parsed['size-finder-page'].silhouettes
          : DEFAULT_SITE_CONTENT['size-finder-page']!.silhouettes,
        virtualCall: {
          ...DEFAULT_SITE_CONTENT['size-finder-page']!.virtualCall,
          ...(parsed['size-finder-page']?.virtualCall || {}),
        },
        guide: {
          ...DEFAULT_SITE_CONTENT['size-finder-page']!.guide,
          ...(parsed['size-finder-page']?.guide || {}),
          principles: (parsed['size-finder-page']?.guide?.principles && parsed['size-finder-page'].guide.principles.length > 0)
            ? parsed['size-finder-page'].guide.principles
            : DEFAULT_SITE_CONTENT['size-finder-page']!.guide.principles,
        },
        seo: {
          ...DEFAULT_SITE_CONTENT['size-finder-page']!.seo,
          ...(parsed['size-finder-page']?.seo || {}),
        },
      },
      'size-guide-page': {
        ...DEFAULT_SITE_CONTENT['size-guide-page'],
        ...(parsed['size-guide-page'] || {}),
        header: {
          ...DEFAULT_SITE_CONTENT['size-guide-page']!.header,
          ...(parsed['size-guide-page']?.header || {}),
        },
        promoBanner: {
          ...DEFAULT_SITE_CONTENT['size-guide-page']!.promoBanner,
          ...(parsed['size-guide-page']?.promoBanner || {}),
        },
        kurtis: {
          ...DEFAULT_SITE_CONTENT['size-guide-page']!.kurtis,
          ...(parsed['size-guide-page']?.kurtis || {}),
          rows: (parsed['size-guide-page']?.kurtis?.rows && parsed['size-guide-page'].kurtis.rows.length > 0)
            ? parsed['size-guide-page'].kurtis.rows
            : DEFAULT_SITE_CONTENT['size-guide-page']!.kurtis.rows,
        },
        lehengas: {
          ...DEFAULT_SITE_CONTENT['size-guide-page']!.lehengas,
          ...(parsed['size-guide-page']?.lehengas || {}),
          rows: (parsed['size-guide-page']?.lehengas?.rows && parsed['size-guide-page'].lehengas.rows.length > 0)
            ? parsed['size-guide-page'].lehengas.rows
            : DEFAULT_SITE_CONTENT['size-guide-page']!.lehengas.rows,
        },
        blouses: {
          ...DEFAULT_SITE_CONTENT['size-guide-page']!.blouses,
          ...(parsed['size-guide-page']?.blouses || {}),
        },
        howToMeasure: {
          ...DEFAULT_SITE_CONTENT['size-guide-page']!.howToMeasure,
          ...(parsed['size-guide-page']?.howToMeasure || {}),
          steps: (parsed['size-guide-page']?.howToMeasure?.steps && parsed['size-guide-page'].howToMeasure.steps.length > 0)
            ? parsed['size-guide-page'].howToMeasure.steps
            : DEFAULT_SITE_CONTENT['size-guide-page']!.howToMeasure.steps,
        },
        stylingDesk: {
          ...DEFAULT_SITE_CONTENT['size-guide-page']!.stylingDesk,
          ...(parsed['size-guide-page']?.stylingDesk || {}),
        },
        seo: {
          ...DEFAULT_SITE_CONTENT['size-guide-page']!.seo,
          ...(parsed['size-guide-page']?.seo || {}),
        },
      },
      'faq-page': {
        ...DEFAULT_SITE_CONTENT['faq-page'],
        ...(parsed['faq-page'] || {}),
        header: {
          ...DEFAULT_SITE_CONTENT['faq-page']!.header,
          ...(parsed['faq-page']?.header || {}),
        },
        searchPlaceholder:
          parsed['faq-page']?.searchPlaceholder ||
          DEFAULT_SITE_CONTENT['faq-page']!.searchPlaceholder,
        categories:
          (parsed['faq-page']?.categories && parsed['faq-page'].categories.length > 0)
            ? parsed['faq-page'].categories
            : DEFAULT_SITE_CONTENT['faq-page']!.categories,
        stillNeedHelp: {
          ...DEFAULT_SITE_CONTENT['faq-page']!.stillNeedHelp,
          ...(parsed['faq-page']?.stillNeedHelp || {}),
        },
        seo: {
          ...DEFAULT_SITE_CONTENT['faq-page']!.seo,
          ...(parsed['faq-page']?.seo || {}),
        },
      },
      'contact-page': {
        ...DEFAULT_SITE_CONTENT['contact-page'],
        ...(parsed['contact-page'] || {}),
        header: {
          ...DEFAULT_SITE_CONTENT['contact-page']!.header,
          ...(parsed['contact-page']?.header || {}),
        },
        contactOptions:
          (parsed['contact-page']?.contactOptions && parsed['contact-page'].contactOptions.length > 0)
            ? parsed['contact-page'].contactOptions
            : DEFAULT_SITE_CONTENT['contact-page']!.contactOptions,
        form: {
          ...DEFAULT_SITE_CONTENT['contact-page']!.form,
          ...(parsed['contact-page']?.form || {}),
          subjects:
            (parsed['contact-page']?.form?.subjects && parsed['contact-page'].form.subjects.length > 0)
              ? parsed['contact-page'].form.subjects
              : DEFAULT_SITE_CONTENT['contact-page']!.form.subjects,
        },
        quickAnswers: {
          ...DEFAULT_SITE_CONTENT['contact-page']!.quickAnswers,
          ...(parsed['contact-page']?.quickAnswers || {}),
          faqs:
            (parsed['contact-page']?.quickAnswers?.faqs && parsed['contact-page'].quickAnswers.faqs.length > 0)
              ? parsed['contact-page'].quickAnswers.faqs
              : DEFAULT_SITE_CONTENT['contact-page']!.quickAnswers.faqs,
        },
        socialProof: {
          ...DEFAULT_SITE_CONTENT['contact-page']!.socialProof,
          ...(parsed['contact-page']?.socialProof || {}),
          reviews:
            (parsed['contact-page']?.socialProof?.reviews && parsed['contact-page'].socialProof.reviews.length > 0)
              ? parsed['contact-page'].socialProof.reviews
              : DEFAULT_SITE_CONTENT['contact-page']!.socialProof.reviews,
        },
        newsletter: {
          ...DEFAULT_SITE_CONTENT['contact-page']!.newsletter,
          ...(parsed['contact-page']?.newsletter || {}),
        },
        seo: {
          ...DEFAULT_SITE_CONTENT['contact-page']!.seo,
          ...(parsed['contact-page']?.seo || {}),
        },
      },
      'wholesale-page': {
        ...DEFAULT_SITE_CONTENT['wholesale-page'],
        ...(parsed['wholesale-page'] || {}),
        header: {
          ...DEFAULT_SITE_CONTENT['wholesale-page']!.header,
          ...(parsed['wholesale-page']?.header || {}),
        },
        benefits:
          (parsed['wholesale-page']?.benefits && parsed['wholesale-page'].benefits.length > 0)
            ? parsed['wholesale-page'].benefits
            : DEFAULT_SITE_CONTENT['wholesale-page']!.benefits,
        form: {
          ...DEFAULT_SITE_CONTENT['wholesale-page']!.form,
          ...(parsed['wholesale-page']?.form || {}),
          tiers:
            (parsed['wholesale-page']?.form?.tiers && parsed['wholesale-page'].form.tiers.length > 0)
              ? parsed['wholesale-page'].form.tiers
              : DEFAULT_SITE_CONTENT['wholesale-page']!.form.tiers,
        },
        footerSupport: {
          ...DEFAULT_SITE_CONTENT['wholesale-page']!.footerSupport,
          ...(parsed['wholesale-page']?.footerSupport || {}),
        },
        seo: {
          ...DEFAULT_SITE_CONTENT['wholesale-page']!.seo,
          ...(parsed['wholesale-page']?.seo || {}),
        },
      },
      'designer-vidhya-page': {
        ...DEFAULT_SITE_CONTENT['designer-vidhya-page'],
        ...(parsed['designer-vidhya-page'] || {}),
        header: {
          ...DEFAULT_SITE_CONTENT['designer-vidhya-page']!.header,
          ...(parsed['designer-vidhya-page']?.header || {}),
        },
        story: {
          ...DEFAULT_SITE_CONTENT['designer-vidhya-page']!.story,
          ...(parsed['designer-vidhya-page']?.story || {}),
          paragraphs:
            (parsed['designer-vidhya-page']?.story?.paragraphs && parsed['designer-vidhya-page'].story.paragraphs.length > 0)
              ? parsed['designer-vidhya-page'].story.paragraphs
              : DEFAULT_SITE_CONTENT['designer-vidhya-page']!.story.paragraphs,
          metrics:
            (parsed['designer-vidhya-page']?.story?.metrics && parsed['designer-vidhya-page'].story.metrics.length > 0)
              ? parsed['designer-vidhya-page'].story.metrics
              : DEFAULT_SITE_CONTENT['designer-vidhya-page']!.story.metrics,
        },
        tenets: {
          ...DEFAULT_SITE_CONTENT['designer-vidhya-page']!.tenets,
          ...(parsed['designer-vidhya-page']?.tenets || {}),
          items:
            (parsed['designer-vidhya-page']?.tenets?.items && parsed['designer-vidhya-page'].tenets.items.length > 0)
              ? parsed['designer-vidhya-page'].tenets.items
              : DEFAULT_SITE_CONTENT['designer-vidhya-page']!.tenets.items,
        },
        consultation: {
          ...DEFAULT_SITE_CONTENT['designer-vidhya-page']!.consultation,
          ...(parsed['designer-vidhya-page']?.consultation || {}),
        },
        seo: {
          ...DEFAULT_SITE_CONTENT['designer-vidhya-page']!.seo,
          ...(parsed['designer-vidhya-page']?.seo || {}),
        },
      },
      'vidhyas-picks-page': {
        ...DEFAULT_SITE_CONTENT['vidhyas-picks-page'],
        ...(parsed['vidhyas-picks-page'] || {}),
        header: {
          ...DEFAULT_SITE_CONTENT['vidhyas-picks-page']!.header,
          ...(parsed['vidhyas-picks-page']?.header || {}),
          founder: {
            ...DEFAULT_SITE_CONTENT['vidhyas-picks-page']!.header.founder,
            ...(parsed['vidhyas-picks-page']?.header?.founder || {}),
          },
          featuredStats: {
            ...DEFAULT_SITE_CONTENT['vidhyas-picks-page']!.header.featuredStats,
            ...(parsed['vidhyas-picks-page']?.header?.featuredStats || {}),
          },
        },
        curationStandards: {
          ...DEFAULT_SITE_CONTENT['vidhyas-picks-page']!.curationStandards,
          ...(parsed['vidhyas-picks-page']?.curationStandards || {}),
          items:
            (parsed['vidhyas-picks-page']?.curationStandards?.items &&
              parsed['vidhyas-picks-page'].curationStandards.items.length > 0)
              ? parsed['vidhyas-picks-page'].curationStandards.items
              : DEFAULT_SITE_CONTENT['vidhyas-picks-page']!.curationStandards.items,
        },
        archive: {
          ...DEFAULT_SITE_CONTENT['vidhyas-picks-page']!.archive,
          ...(parsed['vidhyas-picks-page']?.archive || {}),
        },
        concierge: {
          ...DEFAULT_SITE_CONTENT['vidhyas-picks-page']!.concierge,
          ...(parsed['vidhyas-picks-page']?.concierge || {}),
        },
        newsletter: {
          ...DEFAULT_SITE_CONTENT['vidhyas-picks-page']!.newsletter,
          ...(parsed['vidhyas-picks-page']?.newsletter || {}),
        },
        monthlyEdits:
          (parsed['vidhyas-picks-page']?.monthlyEdits &&
            parsed['vidhyas-picks-page'].monthlyEdits.length > 0)
            ? parsed['vidhyas-picks-page'].monthlyEdits
            : DEFAULT_SITE_CONTENT['vidhyas-picks-page']!.monthlyEdits,
        additionalPicks:
          (parsed['vidhyas-picks-page']?.additionalPicks &&
            parsed['vidhyas-picks-page'].additionalPicks.length > 0)
            ? parsed['vidhyas-picks-page'].additionalPicks
            : DEFAULT_SITE_CONTENT['vidhyas-picks-page']!.additionalPicks,
        seo: {
          ...DEFAULT_SITE_CONTENT['vidhyas-picks-page']!.seo,
          ...(parsed['vidhyas-picks-page']?.seo || {}),
        },
      },
      'brand-story': {
        ...DEFAULT_SITE_CONTENT['brand-story'],
        ...(parsed['brand-story'] || {}),
        storyParagraphs: (parsed['brand-story']?.storyParagraphs && parsed['brand-story'].storyParagraphs.length > 0)
          ? parsed['brand-story'].storyParagraphs
          : (DEFAULT_SITE_CONTENT['brand-story']?.storyParagraphs || []),
      },
      'kurtis-page': {
        ...DEFAULT_SITE_CONTENT['kurtis-page'],
        ...(parsed['kurtis-page'] || {}),
        highlights: (parsed['kurtis-page']?.highlights && parsed['kurtis-page'].highlights.length > 0)
          ? parsed['kurtis-page'].highlights
          : (DEFAULT_SITE_CONTENT['kurtis-page']?.highlights || []),
        products: ((parsed['kurtis-page']?._products_synced_at && Array.isArray(parsed['kurtis-page']?.products)) || (parsed['kurtis-page']?.products && parsed['kurtis-page'].products.length > 0))
          ? parsed['kurtis-page'].products
          : (DEFAULT_SITE_CONTENT['kurtis-page']?.products || []),
      },
      footer: (() => {
        const parsedFooter = parsed.footer || {};
        const isLegacyV1FooterRow =
          !(Number(parsedFooter.layoutVersion) >= 2) &&
          Array.isArray(parsedFooter.columns) &&
          parsedFooter.columns.length === 4 &&
          parsedFooter.columns.some((c: any) => c?.id === 'col-shop' || c?.title === 'Shop Collections') &&
          parsedFooter.columns.some((c: any) => c?.id === 'col-concierge' || c?.title === 'Client Concierge');

        return {
          ...DEFAULT_SITE_CONTENT.footer,
          ...parsedFooter,
          layoutVersion: isLegacyV1FooterRow ? 1 : (parsedFooter.layoutVersion ?? DEFAULT_SITE_CONTENT.footer?.layoutVersion ?? 2),
          aboutText: parsedFooter.aboutText?.trim() || DEFAULT_SITE_CONTENT.footer?.aboutText,
          readMoreLabel: parsedFooter.readMoreLabel?.trim() || DEFAULT_SITE_CONTENT.footer?.readMoreLabel,
          readMoreHref: parsedFooter.readMoreHref?.trim() || DEFAULT_SITE_CONTENT.footer?.readMoreHref,
          copyright: isLegacyV1FooterRow
            ? DEFAULT_SITE_CONTENT.footer?.copyright
            : (parsedFooter.copyright || DEFAULT_SITE_CONTENT.footer?.copyright),
          showScrollTop: isLegacyV1FooterRow
            ? false
            : (parsedFooter.showScrollTop ?? DEFAULT_SITE_CONTENT.footer?.showScrollTop ?? false),
          paymentOptions: {
            ...DEFAULT_SITE_CONTENT.footer?.paymentOptions,
            ...(parsedFooter.paymentOptions || {}),
          },
          regionOptions: Array.isArray(parsedFooter.regionOptions) && parsedFooter.regionOptions.length > 0
            ? parsedFooter.regionOptions
            : (DEFAULT_SITE_CONTENT.footer?.regionOptions || []),
          socialLinks: Array.isArray(parsedFooter.socialLinks)
            ? parsedFooter.socialLinks
            : (DEFAULT_SITE_CONTENT.footer?.socialLinks || []),
          columns: (!isLegacyV1FooterRow && parsedFooter.columns && parsedFooter.columns.length > 0)
            ? parsedFooter.columns
            : (DEFAULT_SITE_CONTENT.footer?.columns || []),
          trustBadges: (parsedFooter.trustBadges && parsedFooter.trustBadges.length > 0)
            ? parsedFooter.trustBadges
            : (DEFAULT_SITE_CONTENT.footer?.trustBadges || []),
          bottomLinks: (!isLegacyV1FooterRow && parsedFooter.bottomLinks && parsedFooter.bottomLinks.length > 0)
            ? parsedFooter.bottomLinks
            : (DEFAULT_SITE_CONTENT.footer?.bottomLinks || []),
        };
      })(),
      newsletter: {
        ...DEFAULT_SITE_CONTENT.newsletter,
        ...(parsed.newsletter || {}),
      },
    };
  } catch (err) {
    return DEFAULT_SITE_CONTENT;
  }
}

export async function getSiteContent(): Promise<SiteContent> {
  return loadMergedSiteContent();
}

export async function updateSectionContent(
  sectionId: string,
  sectionData: any
): Promise<{ success: boolean; content?: SiteContent; error?: string }> {
  try {
    const { CONTENT_ADMIN_ROLES, logAdminAction, requireAdminRole } = await import('@/lib/supabase/admin-auth');
    const auth = await requireAdminRole(CONTENT_ADMIN_ROLES);
    if (!auth.authorized) {
      return { success: false, error: auth.error || 'Unauthorized' };
    }

    const currentContent = await loadMergedSiteContent();

    let normalizedData = sectionData;
    if (sectionId === 'features' && Array.isArray(sectionData?.items)) {
      normalizedData = {
        eyebrow:
          sectionData?.eyebrow !== undefined
            ? String(sectionData.eyebrow)
            : (DEFAULT_SITE_CONTENT.features.eyebrow || 'THE ANGELIKA ATELIER PROMISE'),
        showGrid: sectionData?.showGrid !== undefined ? Boolean(sectionData.showGrid) : true,
        showWaves: sectionData?.showWaves !== undefined ? Boolean(sectionData.showWaves) : true,
        items: sectionData.items.map((item: any) => ({
          icon: item.icon || 'drape',
          eyebrow: item.eyebrow || '',
          title: item.title || '',
          desc: item.desc || item.description || '',
          description: item.desc || item.description || '',
          href: item.href || '',
        })),
      };
    } else if (sectionId === 'vidhyas-picks' && Array.isArray(sectionData?.items)) {
      normalizedData = {
        ...sectionData,
        items: sectionData.items.map((item: any, idx: number) => ({
          id: item.id || `vp-${idx + 1}`,
          name: item.name || '',
          category: item.category || 'Collection',
          price: Number(String(item.price).replace(/[^0-9.]/g, '')) || 0,
          originalPrice: item.originalPrice || item.compare_at_price
            ? Number(String(item.originalPrice || item.compare_at_price).replace(/[^0-9.]/g, ''))
            : null,
          compare_at_price: item.originalPrice || item.compare_at_price
            ? Number(String(item.originalPrice || item.compare_at_price).replace(/[^0-9.]/g, ''))
            : null,
          discount: item.discount ?? (
            item.originalPrice && item.price
              ? Math.round(((Number(item.originalPrice) - Number(item.price)) / Number(item.originalPrice)) * 100)
              : 0
          ),
          image: item.image || '/images/placeholder.jpg',
          slug: item.slug || (item.name ? item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : `product-${idx + 1}`),
          badge: item.badge || "VIDHYA'S PICK",
          isVidhyasPick: item.isVidhyasPick ?? true,
        })),
      };
    } else if (sectionId === 'categories') {
      const defaultCat = DEFAULT_SITE_CONTENT.categories;
      normalizedData = {
        badge: sectionData?.badge ?? defaultCat?.badge ?? 'Curated Collections',
        title: sectionData?.title ?? defaultCat?.title ?? 'Shop by Category',
        subtitle: sectionData?.subtitle ?? defaultCat?.subtitle ?? '',
        items: Array.isArray(sectionData?.items) && sectionData.items.length > 0
          ? sectionData.items.map((item: any, idx: number) => {
              const defItem = defaultCat?.items?.[idx] || defaultCat?.items?.[0];
              return {
                id: item.id || defItem?.id || `cat-${idx + 1}`,
                title: item.title ?? defItem?.title ?? '',
                subtitle: item.subtitle ?? defItem?.subtitle ?? '',
                image: item.image || defItem?.image || '',
                href: item.href || defItem?.href || '/shop',
                cta: item.cta || defItem?.cta || 'Shop Now',
                row: item.row ?? defItem?.row ?? (idx < 3 ? 1 : idx === 3 ? 2 : idx < 6 ? 3 : idx === 6 ? 4 : 5),
                imagePosition: item.imagePosition || defItem?.imagePosition || 'object-center',
              };
            })
          : (defaultCat?.items || []),
      };
    } else if (sectionId === 'shop-the-look') {
      const defaultSTL = DEFAULT_SITE_CONTENT['shop-the-look'];
      normalizedData = {
        ...defaultSTL,
        ...sectionData,
        _updated_at: new Date().toISOString(),
        badge: (sectionData?.badge !== undefined ? sectionData.badge : (defaultSTL?.badge || 'Curated Ensemble'))
          .replace(/ensemblesss/gi, 'Ensemble')
          .trim(),
        title: (sectionData?.title !== undefined ? sectionData.title : (defaultSTL?.title || 'Festive Elegance'))
          .replace(/elegancesss/gi, 'Elegance')
          .trim(),
        subtitle: (sectionData?.subtitle !== undefined ? sectionData.subtitle : (defaultSTL?.subtitle || 'Click pins on image to explore'))
          .trim(),
        lifestyle_image_url: sectionData?.lifestyle_image_url || defaultSTL?.lifestyle_image_url,
        lifestyle_image_alt: sectionData?.lifestyle_image_alt || sectionData?.badge || sectionData?.title || 'Featured Ensemble',
        pinX: Number(sectionData?.pinX ?? defaultSTL?.pinX ?? 47),
        pinY: Number(sectionData?.pinY ?? defaultSTL?.pinY ?? 64),
        productName: (sectionData?.productName !== undefined ? sectionData.productName : (defaultSTL?.productName || 'Mirror Work Lehenga')).trim(),
        productSlug: (sectionData?.productSlug || defaultSTL?.productSlug || 'mirror-work-lehenga').trim(),
        productPrice: Number(sectionData?.productPrice ?? defaultSTL?.productPrice ?? 18999),
        productOriginalPrice: sectionData?.productOriginalPrice ? Number(sectionData.productOriginalPrice) : (defaultSTL?.productOriginalPrice ?? 22999),
        productImage: sectionData?.productImage || defaultSTL?.productImage || '/images/products/lehenga-mirror-1.jpg',
      };
    }

    // If updating brand-story, ensure all fields and paragraphs are valid
    if (sectionId === 'brand-story') {
      const defaultBS = DEFAULT_SITE_CONTENT['brand-story'];
      let paragraphs = defaultBS?.storyParagraphs || [];
      if (Array.isArray(sectionData?.storyParagraphs) && sectionData.storyParagraphs.length > 0) {
        paragraphs = sectionData.storyParagraphs;
      } else if (sectionData?.story && typeof sectionData.story === 'string') {
        const split = sectionData.story.split('\n\n').filter((s: string) => s.trim().length > 0);
        if (split.length > 0) paragraphs = split;
      }

      normalizedData = {
        badge: sectionData?.badge || defaultBS?.badge || 'Our Story',
        title: sectionData?.title || defaultBS?.title || 'Crafted with Love, Worn with Pride',
        headingPrefix: sectionData?.headingPrefix ?? defaultBS?.headingPrefix ?? 'Crafted with',
        headingHighlight: sectionData?.headingHighlight ?? defaultBS?.headingHighlight ?? 'Love',
        headingSuffix: sectionData?.headingSuffix ?? defaultBS?.headingSuffix ?? ', Worn with Pride',
        image: sectionData?.image || defaultBS?.image || '/images/vidhya-story.jpg',
        imageAlt: sectionData?.imageAlt || defaultBS?.imageAlt || 'Vidhya in her atelier',
        storyParagraphs: paragraphs,
        story: sectionData?.story || paragraphs.join('\n\n'),
        quote: sectionData?.quote || defaultBS?.quote || '',
        primaryCtaText: sectionData?.primaryCtaText || defaultBS?.primaryCtaText || 'Read Our Story',
        primaryCtaLink: sectionData?.primaryCtaLink || defaultBS?.primaryCtaLink || '/about',
        whatsappCtaText: sectionData?.whatsappCtaText || defaultBS?.whatsappCtaText || 'Chat with Vidhya',
        whatsappLink: sectionData?.whatsappLink || defaultBS?.whatsappLink || "https://wa.me/91XXXXXXXXXX?text=Hi%20Vidhya,%20I'd%20like%20to%20know%20more%20about%20your%20journey",
      };
    }

    // If updating kurtis-page, ensure all fields, highlights and products are valid
    if (sectionId === 'kurtis-page') {
      const defaultKP = DEFAULT_SITE_CONTENT['kurtis-page'];
      const highlights = Array.isArray(sectionData?.highlights) && sectionData.highlights.length > 0
        ? sectionData.highlights
        : (defaultKP?.highlights || []);
      const products = Array.isArray(sectionData?.products)
        ? sectionData.products
        : (defaultKP?.products || []);

      normalizedData = {
        badge: sectionData?.badge || defaultKP?.badge || 'Handcrafted Luxury Edit',
        title: sectionData?.title || defaultKP?.title || 'Kurtis',
        description: sectionData?.description || defaultKP?.description || '',
        heroImage: sectionData?.heroImage || defaultKP?.heroImage || '/images/hero-new-couture.jpg',
        cardImage: sectionData?.cardImage || defaultKP?.cardImage || '/images/collection-kurtis.jpg',
        cardBadge: sectionData?.cardBadge || defaultKP?.cardBadge || 'Curated by Vidhya',
        cardSubtitle: sectionData?.cardSubtitle || defaultKP?.cardSubtitle || '48 Handcrafted Pieces',
        showPromoBanner: sectionData?.showPromoBanner !== undefined ? Boolean(sectionData.showPromoBanner) : true,
        promoBadge: sectionData?.promoBadge || defaultKP?.promoBadge || 'Festive Offer',
        promoText: sectionData?.promoText || defaultKP?.promoText || '',
        promoCtaText: sectionData?.promoCtaText || defaultKP?.promoCtaText || 'Shop Kurtis',
        promoCtaLink: sectionData?.promoCtaLink || defaultKP?.promoCtaLink || '/shop/kurtis',
        showStylingGuide: sectionData?.showStylingGuide !== undefined ? Boolean(sectionData.showStylingGuide) : true,
        stylingBadge: sectionData?.stylingBadge || defaultKP?.stylingBadge || 'ATELIER NOTES & STYLING',
        stylingTitle: sectionData?.stylingTitle || defaultKP?.stylingTitle || "Vidhya's Styling Guide for Kurtis",
        stylingNote: sectionData?.stylingNote || defaultKP?.stylingNote || '',
        stylingImage: sectionData?.stylingImage || defaultKP?.stylingImage || '/images/vidhya-story.jpg',
        highlights,
        showCategoryStrip: sectionData?.showCategoryStrip !== undefined ? Boolean(sectionData.showCategoryStrip) : true,
        showSidebar: sectionData?.showSidebar !== undefined ? Boolean(sectionData.showSidebar) : true,
        productsMode: sectionData?.productsMode || defaultKP?.productsMode || 'custom',
        products,
        metaTitle: sectionData?.metaTitle || defaultKP?.metaTitle || 'Designer Kurtis and Tunics Online | Angelika Fashions',
        metaDescription: sectionData?.metaDescription || defaultKP?.metaDescription || '',
      };
    }

    // If updating footer, normalize all fields
    if (sectionId === 'footer') {
      const defaultFooter = DEFAULT_SITE_CONTENT.footer!;
      normalizedData = {
        layoutVersion: 2,
        brandName: sectionData?.brandName || defaultFooter.brandName,
        brandTagline: sectionData?.brandTagline || defaultFooter.brandTagline,
        logoUrl: sectionData?.logoUrl || defaultFooter.logoUrl,
        useLogoImage: sectionData?.useLogoImage !== undefined ? Boolean(sectionData.useLogoImage) : false,
        showWatermark: sectionData?.showWatermark !== undefined ? Boolean(sectionData.showWatermark) : true,
        watermarkText:
          sectionData?.watermarkText !== undefined
            ? String(sectionData.watermarkText)
            : (defaultFooter.watermarkText || 'ANGELIKA'),
        watermarkSubtitle:
          sectionData?.watermarkSubtitle !== undefined
            ? String(sectionData.watermarkSubtitle)
            : (defaultFooter.watermarkSubtitle || 'HANDCRAFTED INDIAN COUTURE'),
        backgroundPattern:
          sectionData?.backgroundPattern === 'champagne-grid' ||
          sectionData?.backgroundPattern === 'blush-brocade' ||
          sectionData?.backgroundPattern === 'ivory-loom' ||
          sectionData?.backgroundPattern === 'obsidian-grid'
            ? sectionData.backgroundPattern
            : 'champagne-grid',
        tagline: sectionData?.tagline || defaultFooter.tagline,
        aboutText: sectionData?.aboutText !== undefined ? String(sectionData.aboutText) : defaultFooter.aboutText,
        readMoreLabel: sectionData?.readMoreLabel !== undefined ? String(sectionData.readMoreLabel) : defaultFooter.readMoreLabel,
        readMoreHref: sectionData?.readMoreHref !== undefined ? String(sectionData.readMoreHref) : defaultFooter.readMoreHref,
        showRegionSelector: sectionData?.showRegionSelector !== undefined ? Boolean(sectionData.showRegionSelector) : true,
        regionLabel: sectionData?.regionLabel || defaultFooter.regionLabel,
        regionOptions: Array.isArray(sectionData?.regionOptions) && sectionData.regionOptions.length > 0
          ? sectionData.regionOptions
          : defaultFooter.regionOptions,
        showAtelierDesk: sectionData?.showAtelierDesk !== undefined ? Boolean(sectionData.showAtelierDesk) : defaultFooter.showAtelierDesk,
        atelierBadge: sectionData?.atelierBadge || defaultFooter.atelierBadge,
        atelierStatusText: sectionData?.atelierStatusText || defaultFooter.atelierStatusText,
        atelierTitle: sectionData?.atelierTitle || defaultFooter.atelierTitle,
        atelierDescription: sectionData?.atelierDescription || defaultFooter.atelierDescription,
        atelierWhatsappCta: sectionData?.atelierWhatsappCta || defaultFooter.atelierWhatsappCta,
        atelierWhatsappNumber: sectionData?.atelierWhatsappNumber || defaultFooter.atelierWhatsappNumber,
        atelierWhatsappMessage: sectionData?.atelierWhatsappMessage || defaultFooter.atelierWhatsappMessage,
        atelierPhone: sectionData?.atelierPhone || defaultFooter.atelierPhone,
        atelierEmail: sectionData?.atelierEmail || defaultFooter.atelierEmail,
        atelierSchedule: sectionData?.atelierSchedule || defaultFooter.atelierSchedule,
        socialTitle: sectionData?.socialTitle || defaultFooter.socialTitle,
        socialLinks: Array.isArray(sectionData?.socialLinks)
          ? sectionData.socialLinks
          : defaultFooter.socialLinks,
        columns: Array.isArray(sectionData?.columns) && sectionData.columns.length > 0
          ? sectionData.columns
          : defaultFooter.columns,
        paymentLabel: sectionData?.paymentLabel || defaultFooter.paymentLabel,
        paymentOptions: {
          ...defaultFooter.paymentOptions,
          ...(sectionData?.paymentOptions || {}),
        },
        trustBadges: Array.isArray(sectionData?.trustBadges) && sectionData.trustBadges.length > 0
          ? sectionData.trustBadges
          : defaultFooter.trustBadges,
        copyright: sectionData?.copyright || defaultFooter.copyright,
        showScrollTop: sectionData?.showScrollTop !== undefined ? Boolean(sectionData.showScrollTop) : defaultFooter.showScrollTop,
        scrollTopText: sectionData?.scrollTopText || defaultFooter.scrollTopText,
        bottomLinks: Array.isArray(sectionData?.bottomLinks) && sectionData.bottomLinks.length > 0
          ? sectionData.bottomLinks
          : defaultFooter.bottomLinks,
      };
    }

    if (sectionId === 'shop-page') {
      const defaultSP = DEFAULT_SITE_CONTENT['shop-page']!;
      normalizedData = {
        ...defaultSP,
        ...sectionData,
        hero: {
          ...defaultSP.hero,
          ...(sectionData?.hero || {}),
        },
        announcement: {
          ...defaultSP.announcement,
          ...(sectionData?.announcement || {}),
        },
        navigation: {
          ...defaultSP.navigation,
          ...(sectionData?.navigation || {}),
          items: Array.isArray(sectionData?.navigation?.items) && sectionData.navigation.items.length > 0
            ? sectionData.navigation.items
            : defaultSP.navigation.items,
        },
        sidebar: {
          ...defaultSP.sidebar,
          ...(sectionData?.sidebar || {}),
        },
        concierge: {
          ...defaultSP.concierge,
          ...(sectionData?.concierge || {}),
        },
        seo: {
          ...defaultSP.seo,
          ...(sectionData?.seo || {}),
        },
        productsMode: sectionData?.productsMode || defaultSP.productsMode || 'database',
        products: Array.isArray(sectionData?.products) && sectionData.products.length > 0
          ? sectionData.products
          : defaultSP.products,
      };
    }

    const pageSectionToSlug = await getPageSectionToCategorySlugMap();
    if (sectionId in pageSectionToSlug && Array.isArray(normalizedData?.products)) {
      const syncedProducts = await syncCmsCategoryToDb(sectionId, normalizedData.products);
      normalizedData = {
        ...normalizedData,
        products: syncedProducts,
        _products_synced_at: new Date().toISOString(),
      };
    }

    const timestamp = new Date().toISOString();
    const updatedContent: SiteContent = {
      ...currentContent,
      [sectionId]: {
        ...normalizedData,
        _updated_at: timestamp,
      },
    };

    // Standard content block types mapping compatible with Postgres content_blocks_type_check
    const SECTION_TYPE_MAP: Record<string, string> = {
      hero: 'hero',
      categories: 'category_grid',
      features: 'stats_bar',
      'vidhyas-picks': 'featured_collection',
      'new-arrivals': 'featured_collection',
      'brand-story': 'split_layout',
      'founder-note': 'text_block',
      newsletter: 'newsletter',
      'my-angelika-look': 'instagram_feed',
      'couture-fit-studio': 'split_layout',
      footer: 'text_block',
      'shop-the-look': 'image_gallery',
    };

    const SECTION_TITLE_MAP: Record<string, string> = {
      categories: 'Category Showcase (8 Categories)',
      features: 'Store Trust & Value Features',
      'vidhyas-picks': "Vidhya's Picks Showcase",
      'new-arrivals': 'New Arrivals Showcase',
      'brand-story': 'Brand Story ("Crafted with Love")',
      'founder-note': 'Founder Note',
      newsletter: 'Newsletter Subscription Banner',
      'my-angelika-look': '#MyAngelikaLook UGC Gallery',
      'couture-fit-studio': 'Couture Fit Studio',
      footer: 'Global Site Footer & Atelier Desk',
      'shop-the-look': 'Shop The Look (Interactive Pins)',
      hero: 'Homepage Hero & Navigation',
    };

    const mappedType = SECTION_TYPE_MAP[sectionId] || 'text_block';
    const sectionTitle = SECTION_TITLE_MAP[sectionId] || sectionId;

    if (hasValidSupabaseConfig()) {
      let dbErr: { message: string } | null = null;

      // Safely check for existing block by key to update or insert without ON CONFLICT constraint error
      const { data: existingBlock, error: lookupErr } = await supabaseAdmin
        .from('content_blocks')
        .select('id, type')
        .eq('key', sectionId)
        .maybeSingle();

      const blockType = existingBlock?.type || mappedType;
      const payload = {
        key: sectionId,
        type: blockType,
        title: sectionTitle,
        content: {
          ...normalizedData,
          _updated_at: timestamp,
        } as unknown as Json,
        is_active: true,
        updated_at: timestamp,
        updated_by: auth.userId,
      };

      if (!lookupErr && existingBlock?.id) {
        const updateAttempt = await supabaseAdmin
          .from('content_blocks')
          .update(payload)
          .eq('id', existingBlock.id);
        dbErr = updateAttempt.error;
      } else {
        const insertAttempt = await supabaseAdmin
          .from('content_blocks')
          .insert(payload);
        dbErr = insertAttempt.error;
      }

      // Resilient fallback: If check constraint fails, cycle through standard allowed block types
      if (dbErr && (dbErr.message?.includes('content_blocks_type_check') || dbErr.message?.includes('check constraint'))) {
        const fallbacks = ['category_grid', 'text_block', 'featured_collection', 'hero', 'banner'];
        for (const fbType of fallbacks) {
          if (fbType === mappedType) continue;
          if (existingBlock?.id) {
            const retry = await supabaseAdmin
              .from('content_blocks')
              .update({ ...payload, type: fbType })
              .eq('id', existingBlock.id);
            if (!retry.error) {
              dbErr = null;
              break;
            }
          } else {
            const retry = await supabaseAdmin
              .from('content_blocks')
              .insert({ ...payload, type: fbType });
            if (!retry.error) {
              dbErr = null;
              break;
            }
          }
        }
      }

      if (dbErr && isCloudServerlessEnv()) {
        return { success: false, error: dbErr.message };
      }

      // If updating shop-the-look, also sync the active row in the looks and products tables
      if (sectionId === 'shop-the-look') {
        try {
          const { data: activeLook } = await supabaseAdmin
            .from('looks')
            .select('id')
            .eq('is_active', true)
            .limit(1)
            .maybeSingle();

          if (activeLook?.id) {
            await supabaseAdmin
              .from('looks')
              .update({
                name: normalizedData.title,
                lifestyle_image_url: normalizedData.lifestyle_image_url,
                lifestyle_image_alt: normalizedData.badge,
                updated_at: new Date().toISOString(),
              })
              .eq('id', activeLook.id);

            await supabaseAdmin
              .from('look_hotspots')
              .update({
                x_percent: normalizedData.pinX,
                y_percent: normalizedData.pinY,
              })
              .eq('look_id', activeLook.id);

            // Also sync the pinned product's name, price, and image to the products table
            const { data: hotspot } = await supabaseAdmin
              .from('look_hotspots')
              .select('id, product_id')
              .eq('look_id', activeLook.id)
              .limit(1)
              .maybeSingle();

            if (hotspot?.product_id) {
              if (normalizedData.productName) {
                await supabaseAdmin
                  .from('products')
                  .update({
                    name: normalizedData.productName,
                    slug: normalizedData.productSlug,
                    updated_at: new Date().toISOString(),
                  })
                  .eq('id', hotspot.product_id);
              }

              if (normalizedData.productPrice) {
                await supabaseAdmin
                  .from('product_variants')
                  .update({
                    price: normalizedData.productPrice,
                    compare_at_price: normalizedData.productOriginalPrice || null,
                    updated_at: new Date().toISOString(),
                  })
                  .eq('product_id', hotspot.product_id);
              }

              if (normalizedData.productImage) {
                await supabaseAdmin
                  .from('product_images')
                  .update({
                    url: normalizedData.productImage,
                  })
                  .eq('product_id', hotspot.product_id)
                  .eq('is_primary', true);
              }
            }
          }
        } catch {
          // Non-blocking sync to looks table
        }
      }
    }

    // Always update local site-content.json backup in non-cloud environment
    if (!isCloudServerlessEnv()) {
      await writeLocalSiteContentFile(updatedContent);
    }

    try {
      const { revalidatePath } = await import('next/cache');
      await logAdminAction({
        actorId: auth.userId,
        action: 'update_site_content_section',
        entityType: 'content_block',
        entityId: sectionId,
      });
      revalidateTag('site-content');
      revalidatePath('/');
      revalidatePath('/admin/content');
      revalidatePath('/admin/products/collections');
      revalidatePath('/admin/looks');
      revalidatePath('/vidhyas-picks');
      revalidatePath('/new-arrivals');
      revalidatePath('/shop/kurtis');
      revalidatePath('/shop/salwars');
      revalidatePath('/shop/lehengas');
      revalidatePath('/shop/sarees');
      revalidatePath('/shop/dupattas');
      revalidatePath('/sale');
      revalidatePath('/privacy');
      revalidatePath('/terms');
      revalidatePath('/cookies');
      revalidatePath('/accessibility');
      revalidatePath('/shop');
      revalidatePath('/about');
      revalidatePath('/shipping');
      revalidatePath('/returns');
      revalidatePath('/size-finder');
      revalidatePath('/size-guide');
      revalidatePath('/faq');
      revalidatePath('/contact');
      revalidatePath('/wholesale');
      revalidatePath('/about/vidhya');
    } catch (e) {
      // Non-blocking
    }

    return { success: true, content: updatedContent };
  } catch (error: any) {
    console.error(`Error updating section ${sectionId}:`, error);
    return { success: false, error: error.message || 'Failed to save section content' };
  }
}

export interface AdminBlogPost {
  id: string;
  title: string;
  slug: string;
  author: string;
  category: string;
  date: string;
  status: 'Published' | 'Draft';
  excerpt: string;
}

export async function getAdminBlogPosts(): Promise<{
  success: boolean;
  posts: AdminBlogPost[];
  error?: string;
}> {
  if (!hasValidSupabaseConfig()) {
    return { success: true, posts: [] };
  }
  try {
    const { CONTENT_ADMIN_ROLES, requireAdminRole } = await import('@/lib/supabase/admin-auth');
    const auth = await requireAdminRole(CONTENT_ADMIN_ROLES);
    if (!auth.authorized) {
      return { success: false, posts: [], error: auth.error || 'Unauthorized' };
    }
    const { data, error } = await supabaseAdmin
      .from('content_blocks')
      .select('content')
      .eq('key', 'blog_posts')
      .maybeSingle();

    if (error) {
      return { success: false, posts: [], error: error.message };
    }

    const contentObj = data?.content as Record<string, unknown> | null;
    const rawPosts = Array.isArray(contentObj?.['posts'])
      ? (contentObj['posts'] as AdminBlogPost[])
      : [];
    return { success: true, posts: rawPosts };
  } catch (err: any) {
    return { success: false, posts: [], error: err?.message || 'Failed to load blog posts' };
  }
}

export async function saveAdminBlogPosts(
  posts: AdminBlogPost[]
): Promise<{ success: boolean; error?: string }> {
  try {
    const { CONTENT_ADMIN_ROLES, logAdminAction, requireAdminRole } = await import('@/lib/supabase/admin-auth');
    const auth = await requireAdminRole(CONTENT_ADMIN_ROLES);
    if (!auth.authorized) {
      return { success: false, error: auth.error || 'Unauthorized' };
    }
    if (!hasValidSupabaseConfig()) {
      return { success: false, error: 'Database is not configured for saving blog posts.' };
    }

    const { error } = await supabaseAdmin.from('content_blocks').upsert(
      {
        key: 'blog_posts',
        type: 'text_block',
        title: 'Editorial Blog Posts',
        content: { posts } as unknown as Json,
        is_active: true,
        updated_at: new Date().toISOString(),
        updated_by: auth.userId,
      },
      { onConflict: 'key' }
    );

    if (error) {
      return { success: false, error: error.message };
    }

    await logAdminAction({
      actorId: auth.userId,
      action: 'save_blog_posts',
      entityType: 'content_block',
      entityId: 'blog_posts',
      metadata: { count: posts.length },
    });

    revalidateTag('site-content');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to save blog posts' };
  }
}
