import fs from 'fs/promises';
import path from 'path';

export interface FeatureItem {
  icon: string;
  title: string;
  desc?: string;
  description?: string;
}

export interface HeroContent {
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  secondaryCtaText: string;
  secondaryCtaLink: string;
  backgroundImage: string;
}

export interface CategoryCollectionItem {
  title: string;
  subtitle: string;
  image: string;
  href: string;
  cta: string;
  color?: string;
}

export interface CategoriesContent {
  badge: string;
  title: string;
  subtitle: string;
  items: CategoryCollectionItem[];
}

export interface NewArrivalProductItem {
  id?: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  image: string;
  href: string;
  isVidhyasPick?: boolean;
  discount?: number;
}

export interface NewArrivalsContent {
  badge: string;
  heading: string;
  headingHighlight: string;
  ctaText: string;
  ctaLink: string;
  mode: 'auto' | 'custom';
  limit?: number;
  items: NewArrivalProductItem[];
}

export interface SiteContent {
  hero: HeroContent;
  features: {
    items: FeatureItem[];
  };
  'vidhyas-picks'?: {
    title: string;
    subtitle: string;
    currentMonth: string;
    theme: string;
    note: string;
    products: string[];
  };
  categories?: CategoriesContent;
  'new-arrivals'?: NewArrivalsContent;
  'brand-story'?: {
    title?: string;
    story?: string;
    quote?: string;
  };
  'founder-note'?: {
    quote?: string;
    story?: string;
  };
  newsletter?: {
    title: string;
    subtitle: string;
  };
  [key: string]: any;
}

export const DEFAULT_SITE_CONTENT: SiteContent = {
  hero: {
    title: 'Grace in Every Drape',
    subtitle: 'Timeless traditional wear for the modern woman. Rooted in heritage, designed for your today.',
    ctaText: 'Explore Collection',
    ctaLink: '/shop',
    secondaryCtaText: "Vidhya's Picks",
    secondaryCtaLink: '/vidhyas-picks',
    backgroundImage: '/images/hero-new-couture.jpg',
  },
  features: {
    items: [
      { icon: '🚚', title: 'Free Shipping', desc: 'On orders ₹2,999+ across India', description: 'On orders ₹2,999+ across India' },
      { icon: '🔄', title: '15-Day Returns', desc: 'Hassle-free returns & exchanges', description: 'Hassle-free returns & exchanges' },
      { icon: '💬', title: 'Personal Styling', desc: 'Chat with Vidhya on WhatsApp', description: 'Chat with Vidhya on WhatsApp' },
      { icon: '🎁', title: 'Gift Wrapping', desc: 'Complimentary on all orders', description: 'Complimentary on all orders' },
    ],
  },
  'vidhyas-picks': {
    title: "Vidhya's Monthly Edit",
    subtitle: 'Handpicked favorites with personal styling notes',
    currentMonth: 'January 2026',
    theme: 'New Beginnings in Silk',
    note: 'Starting the year with fabrics that feel like fresh starts...',
    products: ['prod-1', 'prod-2', 'prod-3'],
  },
  categories: {
    badge: 'Curated Collections',
    title: 'Shop by Category',
    subtitle: 'Discover our complete range of premium ethnic wear, each category handcrafted with timeless artisanal detail.',
    items: [
      {
        title: 'Kurtis',
        subtitle: 'Hand-block printed cotton',
        image: '/images/collection-kurtis.jpg',
        href: '/shop/kurtis',
        cta: 'Shop Kurtis',
        color: 'from-[var(--color-kurti)] to-[var(--color-gold-hover)]',
      },
      {
        title: 'Salwars',
        subtitle: 'Elegant palazzo & churidar sets',
        image: '/images/collection-salwars.jpg',
        href: '/shop/salwars',
        cta: 'Shop Salwars',
        color: 'from-[var(--color-salwar)] to-[var(--color-gold-hover)]',
      },
      {
        title: 'Lehengas',
        subtitle: 'Bridal & festive wear',
        image: '/images/collection-lehengas.jpg',
        href: '/shop/lehengas',
        cta: 'Shop Lehengas',
        color: 'from-[var(--color-lehenga)] to-[var(--color-gold-hover)]',
      },
      {
        title: 'Sarees',
        subtitle: 'Silk, cotton & chiffon drapes',
        image: '/images/collection-sarees.jpg',
        href: '/shop/sarees',
        cta: 'Shop Sarees',
        color: 'from-[var(--color-saree)] to-[var(--color-gold-hover)]',
      },
      {
        title: 'Dupattas',
        subtitle: 'Embroidered & printed accents',
        image: '/images/collection-dupattas.jpg',
        href: '/shop/dupattas',
        cta: 'Shop Dupattas',
        color: 'from-[var(--color-dupatta)] to-[var(--color-gold-hover)]',
      },
    ],
  },
  'new-arrivals': {
    badge: 'New Arrivals',
    heading: 'Fresh from',
    headingHighlight: 'the Atelier',
    ctaText: 'View All New',
    ctaLink: '/new-arrivals',
    mode: 'custom',
    limit: 8,
    items: [
      {
        id: 'na-1',
        name: 'Royal Crimson Zari Bridal Lehenga Set',
        category: 'Salwars',
        price: 28999,
        originalPrice: 34999,
        image: '/images/collection-lehengas.jpg',
        href: '/shop/salwars',
        isVidhyasPick: true,
        discount: 17,
      },
      {
        id: 'na-2',
        name: 'Handcrafted Velvet Zardosi Couture Ensemble',
        category: 'Kurtis',
        price: 11999,
        originalPrice: 14999,
        image: '/images/cat-lehengas.jpg',
        href: '/shop/kurtis',
        isVidhyasPick: false,
        discount: 20,
      },
      {
        id: 'na-3',
        name: 'Banarasi Silk Brocade Palazzo & Churidar Set',
        category: 'Salwars',
        price: 14499,
        originalPrice: 17999,
        image: '/images/collection-salwars.jpg',
        href: '/shop/salwars',
        isVidhyasPick: false,
        discount: 19,
      },
      {
        id: 'na-4',
        name: 'Hand-Block Printed Chanderi Cotton Kurti',
        category: 'Kurtis',
        price: 6499,
        originalPrice: 7999,
        image: '/images/collection-kurtis.jpg',
        href: '/shop/kurtis',
        isVidhyasPick: true,
        discount: 19,
      },
      {
        id: 'na-5',
        name: 'Handwoven Gold Zari Chanderi Saree',
        category: 'Sarees',
        price: 12999,
        originalPrice: 15499,
        image: '/images/artisan-workshop.jpg',
        href: '/product/handwoven-gold-zari-chanderi-saree',
        isVidhyasPick: false,
        discount: 16,
      },
      {
        id: 'na-6',
        name: 'Heritage Temple Kanjivaram Silk Saree',
        category: 'Sarees',
        price: 22499,
        originalPrice: 26999,
        image: '/images/collection-sarees.jpg',
        href: '/product/heritage-temple-kanjivaram-silk-saree',
        isVidhyasPick: true,
        discount: 17,
      },
      {
        id: 'na-7',
        name: 'Lucknowi Mukaish Chikankari Georgette Saree',
        category: 'Sarees',
        price: 15499,
        originalPrice: 18999,
        image: '/images/cat-sarees.jpg',
        href: '/product/lucknowi-mukaish-chikankari-georgette-saree',
        isVidhyasPick: true,
        discount: 18,
      },
      {
        id: 'na-8',
        name: 'Amritsari Hand-Embroidered Phulkari Dupatta',
        category: 'Dupattas',
        price: 3299,
        originalPrice: 3999,
        image: '/images/collection-dupattas.jpg',
        href: '/product/amritsari-hand-embroidered-phulkari-dupatta',
        isVidhyasPick: false,
        discount: 18,
      },
    ],
  },
  'brand-story': {
    title: 'Artisanal Luxury, Rooted in Indian Heritage',
    story: 'Every piece in the Angelika collection is thoughtfully curated by designer Vidhya, honoring ancient weaving traditions while embracing contemporary silhouettes.',
    quote: '"Fashion that honors where you come from while embracing where you are going."',
  },
  newsletter: {
    title: 'Join the Angelika Circle',
    subtitle: 'Receive exclusive invitations to preview new arrivals, bespoke styling sessions, and private editorial drops.',
  },
};

const DATA_DIR = path.join(process.cwd(), 'data');
const CONTENT_FILE = path.join(DATA_DIR, 'site-content.json');

/**
 * Ensures data directory exists
 */
async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (err) {
    // Ignore if already exists
  }
}

/**
 * Get all site content.
 * Falls back to DEFAULT_SITE_CONTENT if file doesn't exist yet.
 */
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
    };
  } catch (err) {
    return DEFAULT_SITE_CONTENT;
  }
}

/**
 * Update a specific section of site content (e.g. 'features', 'hero', 'categories').
 * Persists to data/site-content.json, tries Supabase sync, and revalidates Next.js cache.
 */
export async function updateSectionContent(
  sectionId: string,
  sectionData: any
): Promise<{ success: boolean; content?: SiteContent; error?: string }> {
  try {
    await ensureDataDir();
    const currentContent = await getSiteContent();

    // If updating features, normalize items to have both desc and description
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
    }

    // If updating categories, ensure items array is valid
    if (sectionId === 'categories') {
      const defaultCategories = DEFAULT_SITE_CONTENT.categories;
      const items = Array.isArray(sectionData?.items) && sectionData.items.length > 0
        ? sectionData.items
        : (defaultCategories?.items || []);
      normalizedData = {
        badge: sectionData?.badge || defaultCategories?.badge || 'Curated Collections',
        title: sectionData?.title || defaultCategories?.title || 'Shop by Category',
        subtitle: sectionData?.subtitle || defaultCategories?.subtitle || '',
        items,
      };
    }

    // If updating new-arrivals, ensure items and fields are valid
    if (sectionId === 'new-arrivals') {
      const defaultNA = DEFAULT_SITE_CONTENT['new-arrivals'];
      const items = Array.isArray(sectionData?.items) && sectionData.items.length > 0
        ? sectionData.items
        : (defaultNA?.items || []);
      normalizedData = {
        badge: sectionData?.badge || defaultNA?.badge || 'New Arrivals',
        heading: sectionData?.heading || defaultNA?.heading || 'Fresh from',
        headingHighlight: sectionData?.headingHighlight || defaultNA?.headingHighlight || 'the Atelier',
        ctaText: sectionData?.ctaText || defaultNA?.ctaText || 'View All New',
        ctaLink: sectionData?.ctaLink || defaultNA?.ctaLink || '/new-arrivals',
        mode: sectionData?.mode || defaultNA?.mode || 'custom',
        limit: sectionData?.limit || defaultNA?.limit || 8,
        items,
      };
    }

    const updatedContent: SiteContent = {
      ...currentContent,
      [sectionId]: normalizedData,
    };

    await fs.writeFile(CONTENT_FILE, JSON.stringify(updatedContent, null, 2), 'utf-8');

    // Optionally try syncing with Supabase if accessible
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
      // Non-blocking fallback: Supabase may not be running locally
    }

    // Purge cached pages so changes reflect immediately
    try {
      const { revalidatePath } = await import('next/cache');
      revalidatePath('/');
      revalidatePath('/admin/content');
    } catch (e) {
      // Non-blocking in non-Next runtime or build environments
    }

    return { success: true, content: updatedContent };
  } catch (error: any) {
    console.error(`Error updating section ${sectionId}:`, error);
    return { success: false, error: error.message || 'Failed to save section content' };
  }
}
