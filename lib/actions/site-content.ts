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

export interface BrandStoryContent {
  badge: string;
  title: string;
  headingPrefix?: string;
  headingHighlight?: string;
  headingSuffix?: string;
  image: string;
  imageAlt: string;
  storyParagraphs: string[];
  story: string;
  quote?: string;
  primaryCtaText: string;
  primaryCtaLink: string;
  whatsappCtaText: string;
  whatsappLink: string;
}

export interface KurtisHighlightItem {
  title: string;
  description: string;
}

export interface KurtisProductItem {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  image: string;
  href?: string;
  isNew?: boolean;
  isVidhyasPick?: boolean;
  fabric?: string;
  rating?: number;
  reviewCount?: number;
  inStock?: boolean;
}

export interface KurtisPageContent {
  badge: string;
  title: string;
  description: string;
  heroImage: string;
  cardImage: string;
  cardBadge: string;
  cardSubtitle: string;
  showPromoBanner: boolean;
  promoBadge: string;
  promoText: string;
  promoCtaText: string;
  promoCtaLink: string;
  showStylingGuide: boolean;
  stylingBadge: string;
  stylingTitle: string;
  stylingNote: string;
  stylingImage: string;
  highlights: KurtisHighlightItem[];
  showCategoryStrip: boolean;
  showSidebar: boolean;
  productsMode: 'custom' | 'database';
  products: KurtisProductItem[];
  metaTitle: string;
  metaDescription: string;
}

export interface FooterLinkItem {
  label: string;
  href: string;
  badge?: string;
  external?: boolean;
}

export interface FooterColumnItem {
  id: string;
  title: string;
  links: FooterLinkItem[];
}

export interface FooterSocialItem {
  platform: 'instagram' | 'whatsapp' | 'facebook' | 'pinterest' | 'youtube' | 'twitter';
  href: string;
  label: string;
  handle?: string;
  enabled: boolean;
}

export interface FooterTrustBadgeItem {
  id: string;
  text: string;
  icon: 'ssl' | 'handloom' | 'shipping' | 'exchange';
  enabled: boolean;
}

export interface FooterPaymentOptions {
  upi: boolean;
  visa: boolean;
  mastercard: boolean;
  rupay: boolean;
  netbanking: boolean;
  cod: boolean;
  amex: boolean;
}

export interface FooterContent {
  brandName: string;
  brandTagline: string;
  logoUrl: string;
  tagline: string;
  showAtelierDesk: boolean;
  atelierBadge: string;
  atelierStatusText: string;
  atelierTitle: string;
  atelierDescription: string;
  atelierWhatsappCta: string;
  atelierWhatsappNumber: string;
  atelierWhatsappMessage: string;
  atelierPhone: string;
  atelierEmail: string;
  atelierSchedule: string;
  socialTitle: string;
  socialLinks: FooterSocialItem[];
  columns: FooterColumnItem[];
  paymentLabel: string;
  paymentOptions: FooterPaymentOptions;
  trustBadges: FooterTrustBadgeItem[];
  copyright: string;
  showScrollTop: boolean;
  scrollTopText: string;
  bottomLinks: FooterLinkItem[];
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
  'brand-story'?: BrandStoryContent;
  'kurtis-page'?: KurtisPageContent;
  footer?: FooterContent;
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
    badge: 'Our Story',
    title: 'Crafted with Love, Worn with Pride',
    headingPrefix: 'Crafted with',
    headingHighlight: 'Love',
    headingSuffix: ', Worn with Pride',
    image: '/images/vidhya-story.jpg',
    imageAlt: 'Vidhya in her atelier',
    storyParagraphs: [
      "Angelika Fashions was born from Vidhya's passion for preserving Indian textile heritage while creating contemporary silhouettes for the modern woman.",
      "Every piece in our collection is thoughtfully designed, from selecting the finest fabrics to collaborating with skilled artisans who bring generations of expertise to each stitch.",
      "When you wear Angelika, you're not just wearing clothes — you're wearing a piece of tradition reimagined for today, made with integrity and worn with confidence.",
    ],
    story: "Angelika Fashions was born from Vidhya's passion for preserving Indian textile heritage while creating contemporary silhouettes for the modern woman.\n\nEvery piece in our collection is thoughtfully designed, from selecting the finest fabrics to collaborating with skilled artisans who bring generations of expertise to each stitch.\n\nWhen you wear Angelika, you're not just wearing clothes — you're wearing a piece of tradition reimagined for today, made with integrity and worn with confidence.",
    quote: '"Fashion that honors where you come from while embracing where you are going."',
    primaryCtaText: 'Read Our Story',
    primaryCtaLink: '/about',
    whatsappCtaText: 'Chat with Vidhya',
    whatsappLink: "https://wa.me/91XXXXXXXXXX?text=Hi%20Vidhya,%20I'd%20like%20to%20know%20more%20about%20your%20journey",
  },
  'kurtis-page': {
    badge: 'Handcrafted Luxury Edit',
    title: 'Kurtis',
    description: 'Discover our complete range of handcrafted Indian ethnic kurtis, tunics, and anarkalis, thoughtfully made with artisanal perfection and breathable natural textiles.',
    heroImage: '/images/hero-new-couture.jpg',
    cardImage: '/images/collection-kurtis.jpg',
    cardBadge: 'Curated by Vidhya',
    cardSubtitle: '48 Handcrafted Pieces',
    showPromoBanner: true,
    promoBadge: 'Festive Offer',
    promoText: 'Enjoy 15% off on all handcrafted Chanderi and Silk Kurtis. Use code: KURTI15',
    promoCtaText: 'Shop Kurtis',
    promoCtaLink: '/shop/kurtis',
    showStylingGuide: true,
    stylingBadge: 'ATELIER NOTES & STYLING',
    stylingTitle: "Vidhya's Styling Guide for Kurtis",
    stylingNote: "Our kurtis are cut from pure breathable Chanderi, Mulmul and Tussar silk. For a contemporary festive look, pair straight-cut kurtis with cigarette pants, or flared anarkalis with statement jhumkas.",
    stylingImage: '/images/vidhya-story.jpg',
    highlights: [
      {
        title: 'Handloom Textiles',
        description: 'Woven on authentic wooden looms using pure Chanderi silk and combed mulmul cotton.',
      },
      {
        title: 'Artisanal Block Prints',
        description: 'Hand-block printed by master artisans using organic azo-free earthen dyes.',
      },
      {
        title: 'Tailored Silhouettes',
        description: 'Comfortable relaxed drapes with thoughtful internal seam allowances for a bespoke fit.',
      },
    ],
    showCategoryStrip: true,
    showSidebar: true,
    productsMode: 'custom',
    products: [
      {
        id: 'kp-1',
        name: 'Kutch Ajrakh Modal Silk Kurti',
        category: 'KURTIS',
        price: 4999,
        originalPrice: 5999,
        discount: 17,
        image: '/images/collection-kurtis.jpg',
        href: '/product/kutch-ajrakh-modal-silk-kurti',
        isNew: true,
        isVidhyasPick: true,
        fabric: 'Silk',
        rating: 4.8,
        reviewCount: 12,
        inStock: true,
      },
      {
        id: 'kp-2',
        name: 'Pristine White Shadow Work Lucknowi Kurti',
        category: 'KURTIS',
        price: 3999,
        originalPrice: 4799,
        discount: 17,
        image: '/images/collection-lehengas.jpg',
        href: '/product/pristine-white-shadow-work-lucknowi-kurti',
        isNew: true,
        isVidhyasPick: false,
        fabric: 'Cotton',
        rating: 4.8,
        reviewCount: 12,
        inStock: true,
      },
      {
        id: 'kp-3',
        name: 'Hand Block Printed Kurti',
        category: 'KURTIS',
        price: 2499,
        originalPrice: 3299,
        discount: 24,
        image: '/images/collection-kurtis.jpg',
        href: '/product/hand-block-printed-kurti',
        isNew: true,
        isVidhyasPick: false,
        fabric: 'Cotton',
        rating: 4.8,
        reviewCount: 12,
        inStock: true,
      },
      {
        id: 'kp-4',
        name: 'Velvet Kurti Set',
        category: 'KURTIS',
        price: 6999,
        originalPrice: 8499,
        discount: 18,
        image: '/images/cat-sarees.jpg',
        href: '/product/velvet-kurti-set',
        isNew: true,
        isVidhyasPick: true,
        fabric: 'Velvet',
        rating: 4.8,
        reviewCount: 12,
        inStock: true,
      },
      {
        id: 'kp-5',
        name: 'Chanderi Cotton Kurti',
        category: 'KURTIS',
        price: 3199,
        originalPrice: 3999,
        discount: 20,
        image: '/images/cat-kurtis.jpg',
        href: '/product/chanderi-cotton-kurti',
        isNew: true,
        isVidhyasPick: false,
        fabric: 'Chanderi',
        rating: 4.8,
        reviewCount: 12,
        inStock: true,
      },
      {
        id: 'kp-6',
        name: 'Gota Patti Kurta',
        category: 'KURTIS',
        price: 4299,
        originalPrice: 5299,
        discount: 19,
        image: '/images/cat-lehengas.jpg',
        href: '/product/gota-patti-kurta',
        isNew: true,
        isVidhyasPick: false,
        fabric: 'Cotton',
        rating: 4.8,
        reviewCount: 12,
        inStock: true,
      },
    ],
    metaTitle: 'Designer Kurtis and Tunics Online | Angelika Fashions',
    metaDescription: 'Shop handcrafted Indian ethnic kurtis, anarkalis and tunics by Vidhya at Angelika Fashions. Pure Chanderi silk and mulmul cotton with express delivery.',
  },
  footer: {
    brandName: 'Angelika',
    brandTagline: 'Fashions',
    logoUrl: '/images/logo.png',
    tagline: 'Modern Indian luxury — rooted in craft, elevated for today.',
    showAtelierDesk: true,
    atelierBadge: "VIDHYA'S STYLING ATELIER",
    atelierStatusText: 'Concierge Active',
    atelierTitle: 'Personal Styling & Drape Consultation',
    atelierDescription: 'Complimentary bespoke drape guidance, custom blouse measurements & festive trousseau curation directly with designer Vidhya.',
    atelierWhatsappCta: 'Connect with Vidhya on WhatsApp',
    atelierWhatsappNumber: '+91 98765 43210',
    atelierWhatsappMessage: 'Hi Vidhya, I would love personal styling guidance and drape consultation for my order.',
    atelierPhone: '+91 98765 43210',
    atelierEmail: 'hallo@angelikafashions.com',
    atelierSchedule: 'Mon - Sat: 10:00 AM - 7:00 PM IST · Direct atelier response',
    socialTitle: 'Connect With Us',
    socialLinks: [
      { platform: 'instagram', href: 'https://instagram.com/angelikafashions', label: 'Instagram', handle: '@angelikafashions', enabled: true },
      { platform: 'whatsapp', href: 'https://wa.me/919876543210', label: 'WhatsApp Concierge', handle: 'Chat with Vidhya', enabled: true },
      { platform: 'facebook', href: 'https://facebook.com/angelikafashions', label: 'Facebook', handle: 'Angelika Fashions', enabled: true },
      { platform: 'pinterest', href: 'https://pinterest.com/angelikafashions', label: 'Pinterest', handle: 'Angelika Haute Couture', enabled: true },
      { platform: 'youtube', href: 'https://youtube.com/angelikafashions', label: 'YouTube', handle: 'Angelika Atelier', enabled: true },
    ],
    columns: [
      {
        id: 'col-shop',
        title: 'Shop Collections',
        links: [
          { label: 'Handcrafted Kurtis', href: '/shop/kurtis' },
          { label: 'Salwars & Palazzo Sets', href: '/shop/salwars' },
          { label: 'Bridal & Festive Lehengas', href: '/shop/lehengas' },
          { label: 'Pure Silk & Chanderi Sarees', href: '/shop/sarees' },
          { label: 'Artisanal Dupattas', href: '/shop/dupattas' },
          { label: 'New Arrivals', href: '/new-arrivals', badge: 'New' },
          { label: "Vidhya's Curated Picks", href: '/vidhyas-picks', badge: 'Curated' },
          { label: 'Festive Archive Sale', href: '/sale', badge: 'Sale' },
        ],
      },
      {
        id: 'col-concierge',
        title: 'Client Concierge',
        links: [
          { label: 'Track Your Order', href: '/track-order' },
          { label: 'Shipping & Delivery Policy', href: '/shipping' },
          { label: 'Returns & Size Exchanges', href: '/returns' },
          { label: 'Interactive Size Finder', href: '/size-finder' },
          { label: 'Garment Size Guide', href: '/size-guide' },
          { label: 'Frequently Asked Questions', href: '/faq' },
          { label: 'Contact Our Concierge', href: '/contact' },
          { label: 'Wholesale & B2B Inquiries', href: '/wholesale' },
        ],
      },
      {
        id: 'col-story',
        title: 'The Atelier Story',
        links: [
          { label: 'Our Heritage & Philosophy', href: '/about' },
          { label: 'Meet Designer Vidhya', href: '/about/vidhya' },
          { label: 'Master Weaving Traditions', href: '/about#craft' },
          { label: 'Ethical & Sustainable Craft', href: '/about#sustainability' },
          { label: 'Editorial Style Journal', href: '/new-arrivals' },
          { label: 'Press & Celebrity Spotlights', href: '/about#press' },
          { label: 'Careers at Angelika', href: '/contact?subject=careers' },
        ],
      },
      {
        id: 'col-trust',
        title: 'Policies & Trust',
        links: [
          { label: 'Privacy Policy', href: '/privacy' },
          { label: 'Terms of Service', href: '/terms' },
          { label: 'Cookie Policy', href: '/cookies' },
          { label: 'Accessibility Commitment', href: '/accessibility' },
          { label: 'Client Account & Profile', href: '/account' },
          { label: 'My Saved Wishlist', href: '/wishlist' },
          { label: '100% Silk Mark Authenticity', href: '/about#authenticity' },
        ],
      },
    ],
    paymentLabel: 'Payment Options:',
    paymentOptions: {
      upi: true,
      visa: true,
      mastercard: true,
      rupay: true,
      netbanking: true,
      cod: true,
      amex: true,
    },
    trustBadges: [
      { id: 'tb-ssl', text: '256-Bit SSL Encrypted Checkout', icon: 'ssl', enabled: true },
      { id: 'tb-handloom', text: '100% Certified Authentic Handloom', icon: 'handloom', enabled: true },
      { id: 'tb-shipping', text: 'Pan-India Express & Global Shipping', icon: 'shipping', enabled: true },
      { id: 'tb-exchange', text: '7-Day Complimentary Size Exchange', icon: 'exchange', enabled: true },
    ],
    copyright: '© 2026 Angelika. All rights reserved. Handcrafted with reverence for Indian heritage.',
    showScrollTop: true,
    scrollTopText: 'Top',
    bottomLinks: [
      { label: 'Privacy', href: '/privacy' },
      { label: 'Terms', href: '/terms' },
      { label: 'Cookies', href: '/cookies' },
      { label: 'Accessibility', href: '/accessibility' },
    ],
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
        socialLinks: (parsed.footer?.socialLinks && parsed.footer.socialLinks.length > 0)
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
        socialLinks: Array.isArray(sectionData?.socialLinks) && sectionData.socialLinks.length > 0
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
