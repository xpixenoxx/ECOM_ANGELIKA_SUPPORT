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
  id?: string;
  title: string;
  subtitle?: string;
  image: string;
  href: string;
  cta?: string;
  color?: string;
  imagePosition?: string;
  row?: number;
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
  id?: string;
  platform: 'instagram' | 'whatsapp' | 'facebook' | 'pinterest' | 'youtube' | 'twitter' | 'threads' | 'telegram' | 'tiktok' | 'linkedin' | 'snapchat' | 'spotify' | 'globe' | 'website' | 'email' | 'sms' | string;
  icon?: string;
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

export interface BrandStoryContent {
  badge?: string;
  title?: string;
  headingPrefix?: string;
  headingHighlight?: string;
  headingSuffix?: string;
  image?: string;
  imageAlt?: string;
  storyParagraphs?: string[];
  story?: string;
  quote?: string;
  primaryCtaText?: string;
  primaryCtaLink?: string;
  whatsappCtaText?: string;
  whatsappLink?: string;
  readStoryLink?: string;
  chatWhatsappLink?: string;
  [key: string]: any;
}

export interface ShopPageContent {
  hero: {
    badge: string;
    title: string;
    titleHighlight?: string;
    description: string;
    backgroundImage?: string;
    showFeaturedCard?: boolean;
    featuredCardImage?: string;
    featuredCardTag?: string;
    featuredCardText?: string;
  };
  announcement?: {
    enabled?: boolean;
    badge?: string;
    headline?: string;
    code?: string;
    link?: string;
    linkText?: string;
    text?: string;
  };
  navigation: {
    enabled?: boolean;
    label?: string;
    title?: string;
    items: SalwarsCollectionNavItem[];
  };
  sidebar: {
    title: string;
    categoryTitle?: string;
    activeTag?: string;
    viewAllText?: string;
    viewAllHref?: string;
    inStockLabel?: string;
    vidhyasPicksLabel?: string;
    showCategories?: boolean;
    showFabrics?: boolean;
    showColors?: boolean;
    showPrices?: boolean;
    showOccasions?: boolean;
  };
  concierge: {
    enabled?: boolean;
    badge?: string;
    title: string;
    subtitle?: string;
    description?: string;
    link?: string;
    whatsappText?: string;
    whatsappLink?: string;
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
  };
  productsMode: 'custom' | 'database';
  products: SalwarProductItem[];
}

export interface AboutValueItem {
  icon: string;
  title: string;
  description: string;
}

export interface AboutMilestoneItem {
  year: string;
  title: string;
  description: string;
  icon?: string;
}

export interface AboutTeamMember {
  name: string;
  role: string;
  image: string;
  bio?: string;
}

export interface AboutPageContent {
  hero: {
    badge: string;
    title: string;
    titleHighlight1?: string;
    titleHighlight2?: string;
    description: string;
    backgroundImage: string;
    primaryCtaText?: string;
    primaryCtaLink?: string;
    secondaryCtaText?: string;
    secondaryCtaLink?: string;
    scrollText?: string;
  };
  founderNote: {
    badge: string;
    title: string;
    image: string;
    quotePart1?: string;
    quotePart2?: string;
    quotePart3?: string;
    quoteAuthor?: string;
    storyParagraphs: string[];
    ctaText?: string;
    ctaLink?: string;
  };
  values: {
    badge: string;
    title: string;
    items: AboutValueItem[];
  };
  journey: {
    badge: string;
    title: string;
    milestones: AboutMilestoneItem[];
  };
  team: {
    badge: string;
    title: string;
    description?: string;
    members: AboutTeamMember[];
  };
  artisanSpotlight: {
    badge: string;
    title: string;
    image: string;
    paragraphs: string[];
    statNumber?: string;
    statLabel?: string;
    ctaText?: string;
    ctaLink?: string;
  };
  bottomCta: {
    title: string;
    subtitle?: string;
    description?: string;
    primaryCtaText?: string;
    primaryCtaLink?: string;
    secondaryCtaText?: string;
    secondaryCtaLink?: string;
    whatsappText?: string;
    whatsappLink?: string;
    ctaText?: string;
    ctaLink?: string;
    chatWhatsappText?: string;
    chatWhatsappLink?: string;
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
  };
}

export interface ShippingHighlightCard {
  label: string;
  value: string;
  subtext: string;
}

export interface ShippingTierBox {
  title: string;
  description: string;
}

export interface ShippingPolicySection {
  id: string;
  title: string;
  content: string;
  tierBoxes?: ShippingTierBox[];
}

export interface ShippingPageContent {
  header: {
    eyebrow: string;
    title: string;
    description: string;
  };
  highlights: ShippingHighlightCard[];
  sections: ShippingPolicySection[];
  concierge: {
    eyebrow: string;
    title: string;
    description: string;
    whatsappText: string;
    whatsappLink: string;
    trackOrderText: string;
    trackOrderLink: string;
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
  };
}

export interface ReturnsExchangeStep {
  stepNumber: number;
  title: string;
  description: string;
}

export interface ReturnsPolicySection {
  id: string;
  title: string;
  content: string;
  bulletPoints?: string[];
}

export interface ReturnsPageContent {
  header: {
    eyebrow: string;
    title: string;
    description: string;
  };
  process: {
    title: string;
    steps: ReturnsExchangeStep[];
  };
  sections: ReturnsPolicySection[];
  concierge: {
    eyebrow: string;
    title: string;
    description: string;
    whatsappText: string;
    whatsappLink: string;
    secondaryCtaText: string;
    secondaryCtaLink: string;
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
  };
}

export interface SizeFinderSizeSpec {
  size: string;
  bust: number;
  waist: number;
  hips: number;
  length: number;
  shoulder: number;
  label: string;
}

export interface SizeFinderSilhouette {
  id: string;
  name: string;
  tagline: string;
  image: string;
  isFreeSize?: boolean;
  freeSizeNote?: string;
  defaultLengthInches?: number;
  sizes: SizeFinderSizeSpec[];
}

export interface SizeFinderGuidePrinciple {
  step: string;
  title: string;
  description: string;
}

export interface SizeFinderPageContent {
  header: {
    badge: string;
    title: string;
    description: string;
  };
  studio: {
    step1Title: string;
    step1Subtitle: string;
    step2Title: string;
  };
  silhouettes: SizeFinderSilhouette[];
  virtualCall: {
    badge: string;
    description: string;
    ctaText: string;
    whatsappLink: string;
  };
  guide: {
    title: string;
    principles: SizeFinderGuidePrinciple[];
    whatsappTitle: string;
    whatsappDescription: string;
    whatsappButtonText: string;
    whatsappLink: string;
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
  };
}

export interface SizeGuideKurtiRow {
  size: string;
  bust: string;
  waist: string;
  hip: string;
  shoulder: string;
  kurtiLength: string;
}

export interface SizeGuideLehengaRow {
  size: string;
  waist: string;
  hip: string;
  skirtLength: string;
  flare: string;
}

export interface SizeGuideMeasurementStep {
  title: string;
  description: string;
}

export interface SizeGuidePageContent {
  header: {
    eyebrow: string;
    title: string;
    description: string;
  };
  promoBanner: {
    eyebrow: string;
    title: string;
    description: string;
    buttonText: string;
    buttonLink: string;
  };
  kurtis: {
    title: string;
    subtitle: string;
    rows: SizeGuideKurtiRow[];
  };
  lehengas: {
    title: string;
    subtitle: string;
    rows: SizeGuideLehengaRow[];
  };
  blouses: {
    title: string;
    description: string;
    paddingNote: string;
    seamNote: string;
  };
  howToMeasure: {
    title: string;
    steps: SizeGuideMeasurementStep[];
  };
  stylingDesk: {
    eyebrow: string;
    title: string;
    description: string;
    buttonText: string;
    whatsappLink: string;
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
  };
}

export interface FAQItem {
  id: string;
  q: string;
  a: string;
}

export interface FAQCategory {
  id: string;
  label: string;
  icon: string;
  items: FAQItem[];
}

export interface FAQPageContent {
  header: {
    badge: string;
    title: string;
    description: string;
  };
  searchPlaceholder: string;
  categories: FAQCategory[];
  stillNeedHelp: {
    title: string;
    description: string;
    whatsappButtonText: string;
    whatsappLink: string;
    emailButtonText: string;
    emailLink: string;
    contactButtonText: string;
    contactLink: string;
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
  };
}

export interface ContactOptionItem {
  id: string;
  icon: 'studio' | 'email' | 'whatsapp' | 'phone';
  title: string;
  description: string;
  detail: string;
  cta: string;
  href: string;
  isWhatsApp?: boolean;
}

export interface ContactSubjectOption {
  value: string;
  label: string;
}

export interface ContactFaqItem {
  q: string;
  a: string;
}

export interface ContactReviewItem {
  text: string;
  author: string;
}

export interface ContactPageContent {
  header: {
    badge: string;
    title: string;
    description: string;
  };
  contactOptions: ContactOptionItem[];
  form: {
    title: string;
    description: string;
    subjects: ContactSubjectOption[];
    newsletterLabel: string;
    submitButtonText: string;
    successTitle: string;
    successDescription: string;
  };
  quickAnswers: {
    title: string;
    faqs: ContactFaqItem[];
    viewAllText: string;
    viewAllLink: string;
  };
  socialProof: {
    title: string;
    reviews: ContactReviewItem[];
  };
  newsletter: {
    title: string;
    description: string;
    buttonText: string;
    placeholder: string;
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
  };
}

export interface WholesaleBenefitItem {
  icon: string;
  title: string;
  description: string;
}

export interface WholesaleTierOption {
  value: string;
  label: string;
}

export interface WholesalePageContent {
  header: {
    eyebrow: string;
    title: string;
    description: string;
  };
  benefits: WholesaleBenefitItem[];
  form: {
    title: string;
    moqNote: string;
    submitButtonText: string;
    tiers: WholesaleTierOption[];
    successTitle: string;
    successDescription: string;
    whatsappDeskButtonText: string;
    whatsappDeskLink: string;
  };
  footerSupport: {
    prefixText: string;
    linkText: string;
    whatsappLink: string;
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
  };
}

export interface DesignerVidhyaMetric {
  value: string;
  label: string;
}

export interface DesignerVidhyaTenet {
  number: string;
  title: string;
  description: string;
}

export interface DesignerVidhyaPageContent {
  header: {
    breadcrumbHome: string;
    breadcrumbAbout: string;
    breadcrumbCurrent: string;
    eyebrow: string;
    title: string;
    quote: string;
  };
  story: {
    eyebrow: string;
    title: string;
    paragraphs: string[];
    image: string;
    imageAlt: string;
    designerName: string;
    designerRole: string;
    metrics: DesignerVidhyaMetric[];
  };
  tenets: {
    title: string;
    items: DesignerVidhyaTenet[];
  };
  consultation: {
    eyebrow: string;
    title: string;
    description: string;
    buttonText: string;
    whatsappUrl: string;
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
  };
}

export interface VidhyasPicksPageProduct {
  id: string;
  slug: string;
  name: string;
  price: number;
  originalPrice: number;
  image: string;
  color: string;
  colorFamily?: 'red' | 'green' | 'blue' | 'gold' | 'yellow' | 'pink' | 'white' | 'black';
  category: 'Sarees' | 'Lehengas' | 'Kurtis' | 'Salwars' | 'Dupattas';
  fabric: string;
  origin: string;
  discount: number;
  vidhyaNote: string;
  month?: string;
  theme?: string;
  tags?: string[];
}

export interface VidhyasPicksMonthlyEdit {
  month: string;
  slug: string;
  theme: string;
  subtitle: string;
  note: string;
  coverImage: string;
  heroStory: string;
  curatorInsight: string;
  products: VidhyasPicksPageProduct[];
}

export interface VidhyasPicksStandardItem {
  icon: string;
  title: string;
  description: string;
}

export interface VidhyasPicksPageContent {
  header: {
    eyebrowBadge: string;
    badgeSubtitle: string;
    title: string;
    titleHighlight: string;
    description: string;
    founder: {
      name: string;
      role: string;
      experience: string;
      avatar: string;
      storyLinkText: string;
      storyLinkHref: string;
    };
    featuredStats: {
      stat1Value: string;
      stat1Label: string;
      stat2Value: string;
      stat2Label: string;
      stat3Value: string;
      stat3Label: string;
    };
  };
  monthlyEdits: VidhyasPicksMonthlyEdit[];
  additionalPicks: VidhyasPicksPageProduct[];
  curationStandards: {
    eyebrow: string;
    title: string;
    subtitle: string;
    items: VidhyasPicksStandardItem[];
  };
  archive: {
    eyebrow: string;
    title: string;
    subtitle: string;
    ctaText: string;
    ctaHref: string;
  };
  concierge: {
    badge: string;
    title: string;
    description: string;
    whatsappNumber: string;
    whatsappUrl: string;
    sizeGuideText: string;
    sizeGuideHref: string;
  };
  newsletter: {
    eyebrow: string;
    title: string;
    description: string;
    buttonText: string;
    disclaimer: string;
  };
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
  'vidhyas-picks-page'?: VidhyasPicksPageContent;
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
  'shop-page'?: ShopPageContent;
  'about-page'?: AboutPageContent;
  'shipping-page'?: ShippingPageContent;
  'returns-page'?: ReturnsPageContent;
  'size-finder-page'?: SizeFinderPageContent;
  'size-guide-page'?: SizeGuidePageContent;
  'faq-page'?: FAQPageContent;
  'contact-page'?: ContactPageContent;
  'wholesale-page'?: WholesalePageContent;
  'designer-vidhya-page'?: DesignerVidhyaPageContent;
  'kurtis-page'?: KurtisPageContent;
  footer?: FooterContent;
  'brand-story'?: BrandStoryContent;
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
