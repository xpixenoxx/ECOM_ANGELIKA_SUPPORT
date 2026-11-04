export interface NavItemEdit {
  id?: string;
  label: string;
  href: string;
  is_active?: boolean;
}

export interface HomepageHeroData {
  // Brand & Header
  brandName: string;
  brandTagline: string;
  logoUrl: string;
  logoHref: string;
  navigation: NavItemEdit[];

  // Hero Badge
  badgeText: string;
  badgeTagline: string;
  showBadge: boolean;

  // Hero Headlines
  headline: string;
  headlineHighlight: string;
  subtitle: string;

  // Hero CTAs
  primaryCtaText: string;
  primaryCtaLink: string;
  secondaryCtaText: string;
  secondaryCtaLink: string;

  // Hero Background Image
  backgroundImage: string;
  backgroundImageAlt: string;

  // Floating Concierge Badge
  conciergeTitle: string;
  conciergeSubtitle: string;
  conciergeWhatsApp: string;
}

export const defaultHeroData: HomepageHeroData = {
  brandName: 'Angelika',
  brandTagline: 'Fashions',
  logoUrl: '/images/logo.png',
  logoHref: '/',
  navigation: [
    { label: 'KURTIS', href: '/shop/kurtis', is_active: true },
    { label: 'SALWARS', href: '/shop/salwars', is_active: true },
    { label: 'LEHENGAS', href: '/shop/lehengas', is_active: true },
    { label: 'SAREES', href: '/shop/sarees', is_active: true },
    { label: 'DUPATTAS', href: '/shop/dupattas', is_active: true },
    { label: 'NEW ARRIVALS', href: '/new-arrivals', is_active: true },
    { label: 'SALE', href: '/sale', is_active: true },
  ],
  badgeText: 'A N G E L I K A',
  badgeTagline: 'Tradition in Every Thread',
  showBadge: true,
  headline: 'Grace in',
  headlineHighlight: 'Every Drape',
  subtitle: 'Timeless traditional wear for the modern woman.\nRooted in heritage, designed for your today.',
  primaryCtaText: 'Explore Collection',
  primaryCtaLink: '/shop',
  secondaryCtaText: "Vidhya's Picks",
  secondaryCtaLink: '/vidhyas-picks',
  backgroundImage: '/images/hero-new-couture.jpg',
  backgroundImageAlt: 'Angelika Fashions - Grace in Every Drape | Luxury Indian Ethnic Wear by Vidhya',
  conciergeTitle: "Vidhya's Concierge",
  conciergeSubtitle: 'Bespoke Styling Chat',
  conciergeWhatsApp: '919876543210',
};

