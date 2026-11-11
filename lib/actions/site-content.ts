import fs from 'fs/promises';
import path from 'path';

export * from './site-content-types';
import type { SiteContent } from './site-content-types';

import { DEFAULT_SITE_CONTENT } from '@/lib/services/content/defaults';
export { DEFAULT_SITE_CONTENT };

const DATA_DIR = path.join(process.cwd(), 'data');
const CONTENT_FILE = path.join(DATA_DIR, 'site-content.json');

async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (err) {
    // Ignore if already exists
  }
}

export async function getSiteContent(): Promise<SiteContent> {
  try {
    await ensureDataDir();
    const raw = await fs.readFile(CONTENT_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_SITE_CONTENT,
      ...parsed,
      hero: { ...DEFAULT_SITE_CONTENT.hero, ...(parsed.hero || {}) },
      features: {
        items: (parsed.features?.items && parsed.features.items.length > 0)
          ? parsed.features.items
          : DEFAULT_SITE_CONTENT.features.items,
      },
      'vidhyas-picks': {
        ...DEFAULT_SITE_CONTENT['vidhyas-picks'],
        ...(parsed['vidhyas-picks'] || {}),
        items: (parsed['vidhyas-picks']?.items && parsed['vidhyas-picks'].items.length > 0)
          ? parsed['vidhyas-picks'].items
          : DEFAULT_SITE_CONTENT['vidhyas-picks']!.items,
      },
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
        products: (parsed['salwars-page']?.products && parsed['salwars-page'].products.length > 0)
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
        products: (parsed['lehengas-page']?.products && parsed['lehengas-page'].products.length > 0)
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
        products: (parsed['sarees-page']?.products && parsed['sarees-page'].products.length > 0)
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
        products: (parsed['dupattas-page']?.products && parsed['dupattas-page'].products.length > 0)
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
        products: (parsed['kurtis-page']?.products && parsed['kurtis-page'].products.length > 0)
          ? parsed['kurtis-page'].products
          : (DEFAULT_SITE_CONTENT['kurtis-page']?.products || []),
      },
      footer: {
        ...DEFAULT_SITE_CONTENT.footer,
        ...(parsed.footer || {}),
        socialLinks: Array.isArray(parsed.footer?.socialLinks)
          ? parsed.footer.socialLinks
          : (DEFAULT_SITE_CONTENT.footer?.socialLinks || []),
        columns: (parsed.footer?.columns && parsed.footer.columns.length > 0)
          ? parsed.footer.columns
          : (DEFAULT_SITE_CONTENT.footer?.columns || []),
        trustBadges: (parsed.footer?.trustBadges && parsed.footer.trustBadges.length > 0)
          ? parsed.footer.trustBadges
          : (DEFAULT_SITE_CONTENT.footer?.trustBadges || []),
        bottomLinks: (parsed.footer?.bottomLinks && parsed.footer.bottomLinks.length > 0)
          ? parsed.footer.bottomLinks
          : (DEFAULT_SITE_CONTENT.footer?.bottomLinks || []),
      },
      newsletter: {
        ...DEFAULT_SITE_CONTENT.newsletter,
        ...(parsed.newsletter || {}),
      },
      'checkout-address-page': {
        ...DEFAULT_SITE_CONTENT['checkout-address-page']!,
        ...(parsed['checkout-address-page'] || {}),
        header: {
          ...DEFAULT_SITE_CONTENT['checkout-address-page']!.header,
          ...(parsed['checkout-address-page']?.header || {}),
        },
        contact: {
          ...DEFAULT_SITE_CONTENT['checkout-address-page']!.contact,
          ...(parsed['checkout-address-page']?.contact || {}),
        },
        shipping: {
          ...DEFAULT_SITE_CONTENT['checkout-address-page']!.shipping,
          ...(parsed['checkout-address-page']?.shipping || {}),
          addressTypes: Array.isArray(parsed['checkout-address-page']?.shipping?.addressTypes) && parsed['checkout-address-page'].shipping.addressTypes.length > 0
            ? parsed['checkout-address-page'].shipping.addressTypes
            : DEFAULT_SITE_CONTENT['checkout-address-page']!.shipping.addressTypes,
        },
        deliveryAndGifting: {
          ...DEFAULT_SITE_CONTENT['checkout-address-page']!.deliveryAndGifting,
          ...(parsed['checkout-address-page']?.deliveryAndGifting || {}),
        },
        buttonsAndSecurity: {
          ...DEFAULT_SITE_CONTENT['checkout-address-page']!.buttonsAndSecurity,
          ...(parsed['checkout-address-page']?.buttonsAndSecurity || {}),
        },
      },
    };
  } catch (err) {
    return DEFAULT_SITE_CONTENT;
  }
}

export async function updateSectionContent(
  sectionId: string,
  sectionData: any
): Promise<{ success: boolean; content?: SiteContent; error?: string }> {
  try {
    await ensureDataDir();
    const currentContent = await getSiteContent();

    let normalizedData = sectionData;
    if (sectionId === 'features' && Array.isArray(sectionData?.items)) {
      normalizedData = {
        items: sectionData.items.map((item: any) => ({
          icon: item.icon || '✨',
          title: item.title || '',
          desc: item.desc || item.description || '',
          description: item.desc || item.description || '',
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
      const products = Array.isArray(sectionData?.products) && sectionData.products.length > 0
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
        brandName: sectionData?.brandName || defaultFooter.brandName,
        brandTagline: sectionData?.brandTagline || defaultFooter.brandTagline,
        logoUrl: sectionData?.logoUrl || defaultFooter.logoUrl,
        tagline: sectionData?.tagline || defaultFooter.tagline,
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

    const updatedContent: SiteContent = {
      ...currentContent,
      [sectionId]: normalizedData,
    };

    await fs.writeFile(CONTENT_FILE, JSON.stringify(updatedContent, null, 2), 'utf-8');

    try {
      const { createClient } = await import('@/lib/supabase/server');
      const supabase = await createClient();
      await supabase
        .from('content_blocks')
        .upsert(
          {
            key: sectionId,
            type: sectionId,
            title: sectionId,
            content: normalizedData,
            is_active: true,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'key' }
        );
    } catch (sbErr) {
      // Non-blocking fallback
    }

    try {
      const { revalidatePath } = await import('next/cache');
      revalidatePath('/');
      revalidatePath('/admin/content');
      revalidatePath('/vidhyas-picks');
      revalidatePath('/new-arrivals');
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
      revalidatePath('/checkout');
    } catch (e) {
      // Non-blocking
    }

    return { success: true, content: updatedContent };
  } catch (error: any) {
    console.error(`Error updating section ${sectionId}:`, error);
    return { success: false, error: error.message || 'Failed to save section content' };
  }
}

export async function getCheckoutAddressPageContent() {
  const content = await getSiteContent();
  return content['checkout-address-page'] || DEFAULT_SITE_CONTENT['checkout-address-page']!;
}
