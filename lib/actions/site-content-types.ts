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

export interface VidhyasPickItem {
  id: string;
  name: string;
  category: string;
  price: number | string;
  originalPrice?: number | string;
  compare_at_price?: number | string;
  discount?: number;
  image: string;
  slug?: string;
  badge?: string;
  isVidhyasPick?: boolean;
}

export interface VidhyasPicksSection {
  badge?: string;
  title?: string;
  titleHighlight?: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
  items: VidhyasPickItem[];
  currentMonth?: string;
  theme?: string;
  note?: string;
  products?: string[];
}

export interface ShopTheLookSection {
  title: string;
  badge: string;
  subtitle?: string;
  lifestyle_image_url: string;
  lifestyle_image_alt?: string;
  productName: string;
  productPrice: number | string;
  productOriginalPrice?: number | string;
  productImage: string;
  productSlug: string;
  pinX: number;
  pinY: number;
}

export interface SalwarProductItem {
  id: string;
  name: string;
  category: string;
  style?: string;
  price: number | string;
  originalPrice?: number | string;
  compare_at_price?: number | string;
  discount?: number;
  image: string;
  slug: string;
  badge?: string;
  fabric?: string;
  color?: string;
  sizes?: string[];
  inStock?: boolean;
  isVidhyasPick?: boolean;
  rating?: number;
  reviewCount?: number;
}

export interface SalwarsCollectionNavItem {
  slug: string;
  name: string;
  image: string;
  href: string;
}

export type LehengasPageContent = SalwarsPageContent;
export type SareesPageContent = SalwarsPageContent;
export type SareeProductItem = SalwarProductItem;
export type DupattasPageContent = SalwarsPageContent;
export type DupattaProductItem = SalwarProductItem;
export type LehengaProductItem = SalwarProductItem;
export interface SalwarsPageContent {
  hero: {
    badge: string;
    title: string;
    titleHighlight?: string;
    description: string;
    backgroundImage: string;
    showFeaturedCard?: boolean;
    featuredCardImage: string;
    featuredCardTag: string;
    featuredCardText: string;
  };
  announcement: {
    enabled: boolean;
    badge?: string;
    headline: string;
    code?: string;
    link?: string;
    linkText?: string;
  };
  navigation: {
    enabled: boolean;
    label: string;
    items: SalwarsCollectionNavItem[];
  };
  sidebar: {
    title: string;
    categoryTitle: string;
    activeTag: string;
    viewAllText: string;
    viewAllHref: string;
    inStockLabel?: string;
    vidhyasPicksLabel?: string;
  };
  concierge: {
    enabled: boolean;
    title: string;
    subtitle: string;
    link: string;
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
  };
  products: SalwarProductItem[];
}


export interface NewArrivalProductItemPage {
  id: string;
  slug?: string;
  name: string;
  price: number;
  originalPrice: number;
  image: string;
  color: string;
  colorHex: string;
  category: string;
  discount: number;
  isNew: boolean;
  isTrending: boolean;
  inStock: boolean;
  tags: string[];
}

export interface NewArrivalsPageContent {
  header: {
    badge: string;
    title: string;
    description: string;
  };
  categories: string[];
  itemsPerPage?: number;
  seo: {
    metaTitle: string;
    metaDescription: string;
  };
  products: NewArrivalProductItemPage[];
}

export interface SaleEventItem {
  id?: string;
  title: string;
  description: string;
  endDate: string;
  badge: string;
  link?: string;
}

export interface SaleProductItemPage {
  id: string;
  slug?: string;
  name: string;
  price: number;
  originalPrice: number;
  image: string;
  color: string;
  colorHex: string;
  category: string;
  discount: number;
  isFinalSale: boolean;
  inStock: boolean;
  lowStock: boolean;
}

export interface SalePolicyItem {
  id?: string;
  icon?: string;
  title: string;
  description: string;
}

export interface SalePageContent {
  header: {
    badge: string;
    title: string;
    titleHighlight?: string;
    description: string;
    freeShippingThresholdText?: string;
  };
  events: SaleEventItem[];
  categories: string[];
  itemsPerPage?: number;
  policies?: SalePolicyItem[];
  seo: {
    metaTitle: string;
    metaDescription: string;
  };
  products: SaleProductItemPage[];
}

export interface MyAngelikaLookPost {
  id: string;
  image_url: string;
  handle?: string;
  caption?: string;
  productName?: string;
  productLink?: string;
  likes?: number;
  isFeatured?: boolean;
}

export interface MyAngelikaLookContent {
  tag: string;
  title?: string;
  subtitle: string;
  instagramUrl: string;
  instagramHandle: string;
  buttonText: string;
  posts: MyAngelikaLookPost[];
}

export interface PrivacyPolicySectionItem {
  id?: string;
  title: string;
  content: string;
}

export interface PrivacyPolicyPageContent {
  badge: string;
  title: string;
  lastUpdated: string;
  contactEmail?: string;
  contactLink?: string;
  sections: PrivacyPolicySectionItem[];
  seo: {
    metaTitle: string;
    metaDescription: string;
  };
}

export interface TermsOfServiceSectionItem {
  id?: string;
  title: string;
  content: string;
}

export interface TermsOfServicePageContent {
  badge: string;
  title: string;
  lastUpdated: string;
  contactLink?: string;
  faqLink?: string;
  sections: TermsOfServiceSectionItem[];
  seo: {
    metaTitle: string;
    metaDescription: string;
  };
}

export interface CookiePolicySectionItem {
  id?: string;
  title: string;
  content: string;
}

export interface CookiePolicyPageContent {
  badge: string;
  title: string;
  lastUpdated: string;
  conciergeEmail?: string;
  contactLink?: string;
  sections: CookiePolicySectionItem[];
  seo: {
    metaTitle: string;
    metaDescription: string;
  };
}

export interface AccessibilitySectionItem {
  id?: string;
  title: string;
  content: string;
}

export interface AccessibilityConciergeDesk {
  showCard?: boolean;
  title: string;
  email: string;
  phone: string;
  phoneRaw?: string;
  hours: string;
}

export interface AccessibilityPageContent {
  badge: string;
  title: string;
  lastUpdated: string;
  sections: AccessibilitySectionItem[];
  conciergeDesk: AccessibilityConciergeDesk;
  seo: {
    metaTitle: string;
    metaDescription: string;
  };
}

export interface SiteContent {
  hero: HeroContent;
  features: {
    items: FeatureItem[];
  };
  'vidhyas-picks'?: VidhyasPicksSection;
  categories?: CategoriesContent;
  'new-arrivals'?: NewArrivalsContent;
  'shop-the-look'?: ShopTheLookSection;
  'salwars-page'?: SalwarsPageContent;
  'lehengas-page'?: SalwarsPageContent;
  'sarees-page'?: SalwarsPageContent;
  'dupattas-page'?: SalwarsPageContent;
  'new-arrivals-page'?: NewArrivalsPageContent;
  'sale-page'?: SalePageContent;
  'my-angelika-look'?: MyAngelikaLookContent;
  'privacy-policy-page'?: PrivacyPolicyPageContent;
  'terms-page'?: TermsOfServicePageContent;
  'cookies-page'?: CookiePolicyPageContent;
  'accessibility-page'?: AccessibilityPageContent;
  'brand-story'?: {
    badge?: string;
    title?: string;
    story?: string;
    quote?: string;
    image?: string;
    readStoryLink?: string;
    chatWhatsappLink?: string;
  };
  'founder-note'?: {
    quote?: string;
    story?: string;
  };
  newsletter?: {
    title: string;
    subtitle: string;
    buttonText?: string;
  };
  [key: string]: any;
}
