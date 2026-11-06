'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Header } from '@/components/composite/Header';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ProductCard } from '@/components/ui/Card';
import { ScrollReveal } from '@/components/composite/ScrollReveal';
import { SocialIcon } from '@/components/ui/SocialIcon';
import { MagneticButton, MagneticCard, MagneticIcon } from '@/components/animations/MagneticButton';
import { StaggerContainer, StaggerItem } from '@/components/animations/Stagger';
import { ScrollReveal as ScrollRevealAnim } from '@/components/animations/ScrollReveal';
import { ShopTheLookClient } from '@/app/(store)/components/ShopTheLookClient';
import { useCart } from '@/lib/hooks/useCart';
import type { HomepageProductCard, LookData } from '@/lib/actions/homepage-types';
import type { HomepageHeroData } from '@/lib/actions/homepage-hero-types';
import type { SiteContent } from '@/lib/actions/site-content-types';

const navigation = [
  { label: 'Kurtis', href: '/shop/kurtis' },
  { label: 'Salwars', href: '/shop/salwars' },
  { label: 'Lehengas', href: '/shop/lehengas' },
  { label: 'Sarees', href: '/shop/sarees' },
  { label: 'Dupattas', href: '/shop/dupattas' },
];

const featuredCollections = [
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
];

const features = [
  {
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <path d="M3.27 6.96L12 12.01l8.73-5.05" />
        <path d="M12 22.08V12" />
      </svg>
    ),
    title: 'Free Shipping',
    description: 'On orders above ₹2,999 across India',
  },
  {
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    title: 'Secure Payments',
    description: 'Razorpay, UPI, Cards, COD & EMI options',
  },
  {
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
    ),
    title: 'Easy Returns',
    description: '15-day hassle-free returns & exchanges',
  },
  {
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    title: 'Personal Styling',
    description: 'Chat with Vidhya for custom recommendations',
  },
];

interface HomePageClientProps {
  vidhyasPicks: HomepageProductCard[];
  newArrivals: HomepageProductCard[];
  looks: LookData[];
  instagramPosts: Array<{ id: string; image_url: string; handle?: string; caption?: string; productName?: string; productLink?: string }>;
  heroData?: HomepageHeroData;
  siteContent?: SiteContent;
}

export default function HomePageClient({
  vidhyasPicks,
  newArrivals,
  looks,
  instagramPosts,
  heroData,
  siteContent,
}: HomePageClientProps) {
  const { addItem } = useCart();

  const heroContent = siteContent?.hero || {
    title: 'Grace in Every Drape',
    subtitle: 'Timeless traditional wear for the modern woman. Rooted in heritage, designed for your today.',
    ctaText: 'Explore Collection',
    ctaLink: '/shop',
    secondaryCtaText: "Vidhya's Picks",
    secondaryCtaLink: '/vidhyas-picks',
    backgroundImage: '/images/hero-new-couture.jpg',
  };

  const vidhyasPicksSection = siteContent?.['vidhyas-picks'];
  const activeVidhyasPicks: HomepageProductCard[] = (vidhyasPicksSection?.items && vidhyasPicksSection.items.length > 0)
    ? vidhyasPicksSection.items.map((item: any, idx: number) => {
        const priceNum = Number(String(item.price ?? '').replace(/[^0-9.]/g, '')) || 0;
        const compareNum = item.originalPrice || item.compare_at_price
          ? Number(String(item.originalPrice || item.compare_at_price).replace(/[^0-9.]/g, ''))
          : null;
        const discountVal = item.discount ?? (
          compareNum && priceNum > 0 && compareNum > priceNum
            ? Math.round(((compareNum - priceNum) / compareNum) * 100)
            : 0
        );
        return {
          id: item.id || `vp-${idx + 1}`,
          slug: item.slug || (item.name ? item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : `product-${idx + 1}`),
          name: item.name || '',
          variant_id: null,
          price: priceNum,
          compare_at_price: compareNum,
          images: [{ url: item.image || '/images/placeholder.jpg', alt_text: item.name || 'Product' }],
          category: {
            id: `cat-${idx + 1}`,
            name: item.category || 'Collection',
            slug: (item.category || '').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          },
          discount: discountVal,
          is_vidyas_pick: item.isVidhyasPick ?? true,
          is_new: false,
        };
      })
    : vidhyasPicks;

  const brandStorySection = siteContent?.['brand-story'];
  const myAngelikaLookContent = siteContent?.['my-angelika-look'];
  const lookTag = myAngelikaLookContent?.tag || '#MyAngelikaLook';
  const lookSubtitle = myAngelikaLookContent?.subtitle || 'See how our community styles their Angelika favorites. Tag @angelikafashions for a chance to be featured.';
  const lookInstagramUrl = myAngelikaLookContent?.instagramUrl || 'https://instagram.com/angelikafashions';
  const lookButtonText = myAngelikaLookContent?.buttonText || 'Follow us on Instagram';
  const displayPosts = (myAngelikaLookContent?.posts && myAngelikaLookContent.posts.length > 0)
    ? myAngelikaLookContent.posts
    : instagramPosts;

  const activeFeatures = (siteContent?.features?.items && siteContent.features.items.length > 0)
    ? siteContent.features.items.map((item, index) => {
        let iconNode: React.ReactNode = features[index % features.length]?.icon;
        if (typeof item.icon === 'string' && item.icon.trim()) {
          const isImageUrl =
            item.icon.startsWith('/') ||
            item.icon.startsWith('http') ||
            item.icon.startsWith('data:image');

          if (isImageUrl) {
            iconNode = (
              <img
                src={item.icon}
                alt={item.title || 'Feature icon'}
                className="w-5 h-5 sm:w-6 sm:h-6 object-contain"
              />
            );
          } else {
            iconNode = (
              <span className="text-base sm:text-lg leading-none select-none inline-flex items-center justify-center" aria-hidden="true">
                {item.icon}
              </span>
            );
          }
        }
        return {
          icon: iconNode,
          title: item.title,
          description: item.desc || item.description || '',
        };
      })
    : features;

  const handleAddToBag = (product: any) => {
    const targetId = product.variant_id || product.defaultVariantId || product.id || product.slug || 'na-1';
    const imgUrl = product.image || product.images?.[0]?.url || '/images/collection-kurtis.jpg';
    const priceVal = Number(product.price) || 2999;
    const isVP = Boolean(product.isVidhyasPick || product.is_vidyas_pick);
    const prodName = product.name || product.title || 'Handcrafted Ethnic Ensemble';

    addItem(targetId, 1, 'Free Size', {
      product_name: prodName,
      price: priceVal,
      image: imgUrl,
      is_vidyas_pick: isVP,
    });
  };

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative min-h-[92vh] md:min-h-[96vh] flex items-center overflow-hidden">
        <Image
          src={heroData?.backgroundImage || heroContent.backgroundImage || '/images/hero-new-couture.jpg'}
          alt={heroData?.backgroundImageAlt || (heroContent.title ? `Angelika Fashions - ${heroContent.title}` : 'Angelika Fashions - Grace in Every Drape | Luxury Indian Ethnic Wear by Vidhya')}
          fill
          priority
          className="object-cover object-[80%_center] md:object-right lg:object-center z-0"
          sizes="100vw"
        />
        {/* Deep, rich directional scrim: solid dark contrast on the left, clear and glowing on the right */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/75 via-45% to-transparent z-[1]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/40 z-[1]" />

        <div className="relative z-10 container-custom px-6 sm:px-10 py-24 md:py-32">
          <div className="max-w-lg lg:max-w-xl">
            {/* Brand Signature - Exact Luxury Editorial Style */}
            {(heroData?.showBadge ?? true) && (
              <div className="flex flex-col items-start gap-1 mb-10">
                <div className="flex items-center gap-2 mb-1">
                  <svg className="w-5 h-5 text-[var(--color-gold)]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L14.5 9H22L16 13.5L18.5 20.5L12 16L5.5 20.5L8 13.5L2 9H9.5L12 2Z" />
                  </svg>
                  <span className="font-display tracking-[0.35em] text-sm sm:text-base uppercase text-[#FAF8F5] font-normal">
                    {heroData?.badgeText || 'A N G E L I K A'}
                  </span>
                </div>
                <span className="text-[9px] sm:text-[10px] tracking-[0.25em] text-[#C9A84C] uppercase font-medium pl-0.5">
                  {heroData?.badgeTagline || 'Tradition in Every Thread'}
                </span>
              </div>
            )}

            {/* Headline - Editorial Serif */}
            <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-normal text-[#FAF8F5] leading-[1.06] tracking-tight drop-shadow-2xl mb-6">
              {heroData?.headline ? (
                <>
                  {heroData.headline} {heroData.headlineHighlight && <br />}
                  {heroData.headlineHighlight && (
                    <span className="italic font-light text-[#FAF8F5]">{heroData.headlineHighlight}</span>
                  )}
                </>
              ) : heroContent.title ? (
                heroContent.title.includes('\n') ? (
                  heroContent.title.split('\n').map((line, idx) => (
                    <span key={idx}>
                      {line}
                      {idx === 0 && <br />}
                    </span>
                  ))
                ) : (
                  heroContent.title
                )
              ) : (
                <>
                  Grace in <br />
                  <span className="italic font-light text-[#FAF8F5]">Every Drape</span>
                </>
              )}
            </h1>

            {/* Subtitle */}
            <p className="text-[#E6DFD5]/90 text-sm sm:text-base md:text-lg font-normal leading-relaxed max-w-md drop-shadow-md mb-9 whitespace-pre-line">
              {heroData?.subtitle || heroContent.subtitle || 'Timeless traditional wear for the modern woman.\nRooted in heritage, designed for your today.'}
            </p>

            {/* CTA Button - Exact Minimalist Bordered Aesthetic */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              {(heroData?.primaryCtaText || heroContent.ctaText) && (
                <Link
                  href={heroData?.primaryCtaLink || heroContent.ctaLink || '/shop'}
                  className="inline-flex items-center justify-center gap-3 px-7 py-3.5 border border-white/60 hover:border-[var(--color-gold)] hover:bg-[var(--color-gold)] text-[#FAF8F5] hover:text-[#0D0D0D] bg-black/40 backdrop-blur-md text-xs tracking-[0.22em] uppercase font-medium transition-all duration-300 shadow-xl group"
                >
                  <span>{heroData?.primaryCtaText || heroContent.ctaText || 'Explore Collection'}</span>
                  <span className="text-sm transition-transform duration-300 group-hover:translate-x-1.5" aria-hidden="true">→</span>
                </Link>
              )}

              {(heroData?.secondaryCtaText || heroContent.secondaryCtaText) && (
                <Link
                  href={heroData?.secondaryCtaLink || heroContent.secondaryCtaLink || '/vidhyas-picks'}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 border border-white/20 hover:border-white/50 text-[#E6DFD5] hover:text-white bg-black/20 backdrop-blur-md text-xs tracking-[0.18em] uppercase font-medium transition-all duration-300"
                >
                  {heroData?.secondaryCtaText || heroContent.secondaryCtaText || "Vidhya's Picks"}
                </Link>
              )}
            </div>
          </div>
        </div>

        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce-subtle z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
        >
          <svg className="h-6 w-6 text-white/50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <path d="M12 5v14M19 12l-7 7-7-7" />
          </svg>
        </motion.div>
      </section>

      {/* Features Strip */}
      <section className="bg-[var(--color-white)] border-y border-[var(--color-whisper)] py-4 sm:py-5">
        <div className="container-custom px-4 sm:px-6">
          <StaggerContainer variant="default" className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {activeFeatures.map((feature, index) => (
              <StaggerItem key={feature.title || index} delay={index * 0.08} className="flex flex-col items-center text-center gap-1.5">
                <MagneticIcon className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[var(--color-gold-light)] flex items-center justify-center text-[var(--color-gold)] shadow-2xs">
                  {feature.icon}
                </MagneticIcon>
                <h3 className="font-display text-sm font-semibold text-[var(--color-ink)] tracking-wide">{feature.title}</h3>
                <p className="text-xs text-[var(--color-slate)] leading-tight max-w-[200px]">{feature.description}</p>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Shop by Category */}
      <section className="py-8 sm:py-12 bg-[var(--color-snow)] border-b border-[var(--color-whisper)]">
        <div className="container-custom px-4 sm:px-6">
          <div className="text-center max-w-xl mx-auto mb-6 sm:mb-8">
            <span className="inline-block text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--color-gold)] mb-1.5">
              {siteContent?.categories?.badge || 'Curated Collections'}
            </span>
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-medium text-[var(--color-ink)] mb-2">
              {siteContent?.categories?.title || 'Shop by Category'}
            </h2>
            <p className="text-[var(--color-slate)] text-xs sm:text-sm leading-relaxed">
              {siteContent?.categories?.subtitle || 'Discover our complete range of premium ethnic wear, each category handcrafted with timeless artisanal detail.'}
            </p>
          </div>

          {/* Shop by Category: 2 on Left, 1 Centerpiece, 2 on Right */}
          {(() => {
            const rawItems = siteContent?.categories?.items;
            const items = (Array.isArray(rawItems) && rawItems.length >= 5)
              ? rawItems
              : featuredCollections.map((fc, idx) => ({
                  ...fc,
                  ...(rawItems?.[idx] || {}),
                }));

            const leftCards = [items[0] || featuredCollections[0], items[1] || featuredCollections[1]];
            const centerCard = items[2] || featuredCollections[2];
            const rightCards = [items[3] || featuredCollections[3], items[4] || featuredCollections[4]];

            return (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 items-stretch">
                {/* Left Column: 2 Cards */}
                <div className="grid grid-cols-2 md:grid-cols-1 gap-4 sm:gap-6">
                  {leftCards.map((collection, idx) => {
                    if (!collection) return null;
                    return (
                      <Link
                        key={collection.title || `left-${idx}`}
                        href={collection.href || '/shop'}
                        className="group relative aspect-[4/3] w-full rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 bg-[var(--color-whisper)] block"
                      >
                        {/* Background Image */}
                        <Image
                          src={collection.image || '/images/collection-kurtis.jpg'}
                          alt={`Angelika ${collection.title || 'Collection'}`}
                          fill
                          unoptimized
                          className="object-cover transition-transform duration-700 ease-out group-hover:scale-108"
                          sizes="(max-width: 768px) 50vw, 25vw"
                        />

                        {/* Dark Gradient Overlay for Contrast */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent transition-opacity duration-300 group-hover:opacity-95" />

                        {/* Content Overlay */}
                        <div className="absolute inset-x-0 bottom-0 p-3.5 sm:p-4 md:p-5 flex flex-col justify-end z-10">
                          <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-gold)] mb-1 block drop-shadow-sm line-clamp-1">
                            {collection.subtitle}
                          </span>
                          <h3 className="font-display text-xl sm:text-2xl md:text-2xl font-medium text-white mb-2 drop-shadow-md group-hover:text-[var(--color-gold-light)] transition-colors">
                            {collection.title}
                          </h3>
                          <div className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-white/90 group-hover:text-[var(--color-gold)] transition-colors">
                            <span>{collection.cta || 'Shop Now'}</span>
                            <svg className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <path d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>

                {/* Center Column: 1 Hero Centerpiece (reduced size, matching height) */}
                <div className="w-full h-full">
                  {centerCard && (
                    <Link
                      key={centerCard.title || 'centerpiece'}
                      href={centerCard.href || '/shop'}
                      className="group relative w-full aspect-[4/3] sm:aspect-[16/10] md:aspect-auto md:h-full min-h-[380px] md:min-h-0 rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 bg-[var(--color-whisper)] block"
                    >
                      {/* Background Image */}
                      <Image
                        src={centerCard.image || '/images/collection-lehengas.jpg'}
                        alt={`Angelika ${centerCard.title || 'Collection'}`}
                        fill
                        unoptimized
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-108"
                        sizes="(max-width: 768px) 100vw, 50vw"
                        priority
                      />

                      {/* Dark Gradient Overlay for Contrast */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent transition-opacity duration-300 group-hover:opacity-95" />

                      {/* Content Overlay */}
                      <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 md:p-6 flex flex-col justify-end z-10">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold uppercase tracking-[0.18em] bg-[var(--color-gold)]/20 text-[var(--color-gold)] border border-[var(--color-gold)]/40 mb-2.5 w-fit backdrop-blur-xs">
                          <span>✦</span>
                          <span>{centerCard.subtitle}</span>
                        </span>
                        <h3 className="font-display text-2xl sm:text-3xl md:text-3xl lg:text-4xl font-medium text-white mb-2.5 drop-shadow-lg group-hover:text-[var(--color-gold-light)] transition-colors">
                          {centerCard.title}
                        </h3>
                        <div className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold uppercase tracking-wider text-white group-hover:text-[var(--color-gold)] transition-colors">
                          <span>{centerCard.cta || 'Shop Now'}</span>
                          <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M5 12h14M12 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </Link>
                  )}
                </div>

                {/* Right Column: 2 Cards */}
                <div className="grid grid-cols-2 md:grid-cols-1 gap-4 sm:gap-6">
                  {rightCards.map((collection, idx) => {
                    if (!collection) return null;
                    return (
                      <Link
                        key={collection.title || `right-${idx}`}
                        href={collection.href || '/shop'}
                        className="group relative aspect-[4/3] w-full rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 bg-[var(--color-whisper)] block"
                      >
                        {/* Background Image */}
                        <Image
                          src={collection.image || '/images/collection-sarees.jpg'}
                          alt={`Angelika ${collection.title || 'Collection'}`}
                          fill
                          unoptimized
                          className="object-cover transition-transform duration-700 ease-out group-hover:scale-108"
                          sizes="(max-width: 768px) 50vw, 25vw"
                        />

                        {/* Dark Gradient Overlay for Contrast */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent transition-opacity duration-300 group-hover:opacity-95" />

                        {/* Content Overlay */}
                        <div className="absolute inset-x-0 bottom-0 p-3.5 sm:p-4 md:p-5 flex flex-col justify-end z-10">
                          <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-gold)] mb-1 block drop-shadow-sm line-clamp-1">
                            {collection.subtitle}
                          </span>
                          <h3 className="font-display text-xl sm:text-2xl md:text-2xl font-medium text-white mb-2 drop-shadow-md group-hover:text-[var(--color-gold-light)] transition-colors">
                            {collection.title}
                          </h3>
                          <div className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-white/90 group-hover:text-[var(--color-gold)] transition-colors">
                            <span>{collection.cta || 'Shop Now'}</span>
                            <svg className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <path d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })()}
        </div>
      </section>

      {/* Vidhya's Picks */}
      <section className="section bg-[var(--color-white)]">
        <div className="container-custom px-6">
          <motion.div
            className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12"
          >
            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-[var(--color-gold-light)] text-[var(--color-gold)] text-xs font-semibold uppercase tracking-wider mb-3">
                {vidhyasPicksSection?.badge || "Vidhya's Picks"}
              </span>
              <h2 className="text-[var(--font-display)] text-4xl md:text-5xl font-medium text-[var(--color-ink)]">
                {vidhyasPicksSection?.title ? (
                  vidhyasPicksSection.titleHighlight && vidhyasPicksSection.title.includes(vidhyasPicksSection.titleHighlight) ? (
                    <>
                      {vidhyasPicksSection.title.split(vidhyasPicksSection.titleHighlight)[0]}
                      <span className="text-gradient-gold">{vidhyasPicksSection.titleHighlight}</span>
                      {vidhyasPicksSection.title.split(vidhyasPicksSection.titleHighlight)[1]}
                    </>
                  ) : (
                    vidhyasPicksSection.title
                  )
                ) : (
                  <>
                    Handpicked by <span className="text-gradient-gold">Vidhya</span>
                  </>
                )}
              </h2>
            </div>
            <Button variant="outline" asChild className="mt-4 md:mt-0">
              <Link href={vidhyasPicksSection?.ctaLink || "/vidhyas-picks"}>
                {vidhyasPicksSection?.ctaText || "View All Picks"} <span aria-hidden="true">→</span>
              </Link>
            </Button>
          </motion.div>
          <StaggerContainer variant="default" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {activeVidhyasPicks.length > 0 ? (
              activeVidhyasPicks.map((product, index) => (
                <StaggerItem key={product.id} delay={index * 0.08} variant="scale">
                  <ProductCard
                    image={product.images[0]?.url || '/images/placeholder.jpg'}
                    name={product.name}
                    price={product.price}
                    originalPrice={product.compare_at_price || undefined}
                    category={product.category?.name || ''}
                    isVidhyasPick={product.is_vidyas_pick}
                    discount={product.discount}
                    href={product.slug ? `/product/${product.slug}` : `/vidhyas-picks?search=${encodeURIComponent(product.name)}`}
                    onAddToBag={() => handleAddToBag(product)}
                  />
                </StaggerItem>
              ))
            ) : (
              Array.from({ length: 4 }).map((_, i) => (
                <StaggerItem key={`skeleton-vp-${i}`} delay={i * 0.08} variant="scale">
                  <SkeletonProductCard />
                </StaggerItem>
              ))
            )}
          </StaggerContainer>
        </div>
      </section>

      {/* Shop the Look */}
      <section className="section bg-[var(--color-snow)]">
        <div className="container-custom px-6">
          <ShopTheLookClient initialLook={siteContent?.['shop-the-look']} />
        </div>
      </section>

      {/* New Arrivals: Fresh from the Atelier */}
      {(() => {
        const naContent = siteContent?.['new-arrivals'];
        const badge = naContent?.badge || 'New Arrivals';
        const headingPrefix = naContent?.heading || 'Fresh from';
        const headingHighlight = naContent?.headingHighlight || 'the Atelier';
        const ctaText = naContent?.ctaText || 'View All New';
        const ctaLink = naContent?.ctaLink || '/new-arrivals';

        // Choose between custom curated items or dynamic database items
        const isCustomMode = naContent?.mode === 'custom' && Array.isArray(naContent?.items) && naContent.items.length > 0;
        const productsToDisplay = isCustomMode
          ? naContent.items
          : (newArrivals.length > 0 ? newArrivals : (naContent?.items || []));

        return (
          <section className="section bg-[var(--color-snow)]">
            <div className="container-custom px-6">
              <motion.div
                className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12"
              >
                <div>
                  <span className="inline-block px-3 py-1 rounded-full bg-[var(--color-gold-light)] text-[var(--color-gold)] text-xs font-semibold uppercase tracking-wider mb-3">
                    {badge}
                  </span>
                  <h2 className="text-[var(--font-display)] text-4xl md:text-5xl font-medium text-[var(--color-ink)]">
                    {headingPrefix}{' '}
                    <span className="text-gradient-gold">{headingHighlight}</span>
                  </h2>
                </div>
                <Button variant="outline" asChild className="mt-4 md:mt-0">
                  <Link href={ctaLink}>
                    {ctaText} <span aria-hidden="true">→</span>
                  </Link>
                </Button>
              </motion.div>
              <StaggerContainer variant="fast" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {productsToDisplay.length > 0 ? (
                  productsToDisplay.map((product: any, index: number) => {
                    const imgUrl = product.image || product.images?.[0]?.url || '/images/placeholder.jpg';
                    const categoryName = typeof product.category === 'string'
                      ? product.category
                      : product.category?.name || '';
                    const origPrice = product.originalPrice ?? product.compare_at_price ?? undefined;
                    const isVPick = product.isVidhyasPick ?? product.is_vidyas_pick ?? false;
                    const productHref = product.href && !product.href.includes('/undefined') ? product.href : (product.slug ? `/product/${product.slug}` : `/vidhyas-picks?search=${encodeURIComponent(product.name)}`);

                    return (
                      <StaggerItem key={product.id || index} delay={index * 0.08} variant="scale">
                        <ProductCard
                          image={imgUrl}
                          name={product.name}
                          price={Number(product.price)}
                          originalPrice={origPrice ? Number(origPrice) : undefined}
                          category={categoryName}
                          isVidhyasPick={isVPick}
                          discount={product.discount}
                          href={productHref}
                          onAddToBag={() => handleAddToBag(product)}
                        />
                      </StaggerItem>
                    );
                  })
                ) : (
                  Array.from({ length: 4 }).map((_, i) => (
                    <StaggerItem key={`skeleton-na-${i}`} delay={i * 0.08} variant="scale">
                      <SkeletonProductCard />
                    </StaggerItem>
                  ))
                )}
              </StaggerContainer>
            </div>
          </section>
        );
      })()}

      {/* About Vidhya / Brand Story */}
      {(() => {
        const bs = siteContent?.['brand-story'];
        const badge = bs?.badge || 'Our Story';
        const headingPrefix = bs?.headingPrefix ?? (bs?.title ? '' : 'Crafted with');
        const headingHighlight = bs?.headingHighlight ?? (bs?.title ? '' : 'Love');
        const headingSuffix = bs?.headingSuffix ?? (bs?.title || ', Worn with Pride');
        const imageUrl = bs?.image || '/images/vidhya-story.jpg';
        const imageAlt = bs?.imageAlt || 'Vidhya in her atelier';
        const paragraphs = Array.isArray(bs?.storyParagraphs) && bs.storyParagraphs.length > 0
          ? bs.storyParagraphs
          : (bs?.story
              ? bs.story.split('\n\n').filter(Boolean)
              : [
                  "Angelika Fashions was born from Vidhya's passion for preserving Indian textile heritage while creating contemporary silhouettes for the modern woman.",
                  "Every piece in our collection is thoughtfully designed, from selecting the finest fabrics to collaborating with skilled artisans who bring generations of expertise to each stitch.",
                  "When you wear Angelika, you're not just wearing clothes — you're wearing a piece of tradition reimagined for today, made with integrity and worn with confidence.",
                ]);
        const primaryCtaText = bs?.primaryCtaText || 'Read Our Story';
        const primaryCtaLink = bs?.primaryCtaLink || '/about';
        const whatsappCtaText = bs?.whatsappCtaText || 'Chat with Vidhya';
        const whatsappLink = bs?.whatsappLink || "https://wa.me/91XXXXXXXXXX?text=Hi%20Vidhya,%20I'd%20like%20to%20know%20more%20about%20your%20journey";

        return (
          <section className="section bg-[var(--color-white)]">
            <div className="container-custom px-6">
              <motion.div
                className="grid lg:grid-cols-2 gap-16 items-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <div className="relative aspect-[4/5] rounded-[var(--radius-2xl)] overflow-hidden">
                  <Image
                    src={imageUrl}
                    alt={imageAlt}
                    fill
                    unoptimized
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                  <div className="absolute -bottom-6 -right-6 w-48 h-48 rounded-full bg-[var(--color-gold)]/10 blur-3xl" aria-hidden="true" />
                  <div className="absolute -top-6 -left-6 w-48 h-48 rounded-full bg-[var(--color-gold)]/10 blur-3xl" aria-hidden="true" />
                </div>
                <div>
                  <span className="inline-block px-3 py-1 rounded-full bg-[var(--color-gold-light)] text-[var(--color-gold)] text-xs font-semibold uppercase tracking-wider mb-4">
                    {badge}
                  </span>
                  <h2 className="text-[var(--font-display)] text-4xl md:text-5xl font-medium text-[var(--color-ink)] mb-6">
                    {headingPrefix && `${headingPrefix} `}
                    {headingHighlight && <span className="text-gradient-gold">{headingHighlight}</span>}
                    {headingSuffix}
                  </h2>
                  <div className="space-y-4 text-[var(--color-slate)] text-lg leading-relaxed">
                    {paragraphs.map((p: string, idx: number) => (
                      <p key={idx}>{p}</p>
                    ))}
                  </div>
                  <motion.div
                    className="mt-8 flex flex-wrap gap-4"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 }}
                  >
                    <Button variant="primary" asChild>
                      <Link href={primaryCtaLink}>{primaryCtaText}</Link>
                    </Button>
                    <Button variant="whatsapp" asChild>
                      <Link href={whatsappLink} target="_blank" rel="noopener noreferrer">
                        <SocialIcon platform="whatsapp" size="sm" className="mr-2" />
                        {whatsappCtaText}
                      </Link>
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </section>
        );
      })()}

      {/* Newsletter Signup */}
      <section className="section bg-[var(--color-ink)] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-gold)]/5 via-transparent to-transparent" aria-hidden="true" />
        <div className="absolute inset-0 noise-overlay" aria-hidden="true" />
        <div className="relative z-10 container-custom px-6">
          <motion.div
            className="max-w-2xl mx-auto text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-[var(--font-display)] text-4xl md:text-5xl font-medium text-[var(--color-white)] mb-4">
              Join the <span className="text-gradient-gold">Angelika Circle</span>
            </h2>
            <p className="text-[var(--color-white)]/70 text-lg mb-8 max-w-lg mx-auto">
              Get early access to new collections, exclusive styling tips from Vidhya, and special offers — delivered straight to your inbox.
            </p>
            <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
              <div className="flex-1">
                <label htmlFor="newsletter-email" className="sr-only">Email address</label>
                <input
                  type="email"
                  id="newsletter-email"
                  placeholder="Enter your email"
                  className="input w-full"
                  required
                  autoComplete="email"
                />
              </div>
              <Button type="submit" size="lg" variant="gold" className="whitespace-nowrap">
                Subscribe
              </Button>
            </form>
            <p className="text-xs text-[var(--color-white)]/50 mt-4">
              By subscribing, you agree to our <a href="/privacy" className="underline hover:text-[var(--color-gold)]">Privacy Policy</a>. Unsubscribe anytime.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Instagram Feed / Social Proof */}
      <section className="section bg-[var(--color-white)]" id="MyAngelikaLook">
        <div className="container-custom px-6">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-[var(--font-display)] text-4xl md:text-5xl font-medium text-[var(--color-ink)] mb-4">
              {lookTag}
            </h2>
            <p className="text-[var(--color-slate)] text-lg max-w-2xl mx-auto">
              {lookSubtitle}
            </p>
          </motion.div>
          <StaggerContainer variant="fast" className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {displayPosts.length > 0 ? (
              displayPosts.map((post: any, i: number) => (
                <StaggerItem key={post.id || i} delay={i * 0.05} variant="scale" className="aspect-square relative overflow-hidden rounded-[var(--radius-lg)] group">
                  <Image
                    src={post.image_url || post.image || '/images/placeholder.jpg'}
                    alt={post.caption || post.productName || 'Instagram post'}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex flex-col items-center justify-center p-3 text-center">
                    {post.handle && (
                      <span className="text-white/90 text-xs font-semibold mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        {post.handle}
                      </span>
                    )}
                    <MagneticButton
                      className="px-4 py-2 rounded-full bg-white text-[var(--color-ink)] text-sm font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-[var(--color-gold-light)]"
                      strength={0.3}
                      asChild
                    >
                      <Link href={post.productLink || post.link || '/shop'}>
                        Shop this look
                      </Link>
                    </MagneticButton>
                  </div>
                </StaggerItem>
              ))
            ) : (
              Array.from({ length: 8 }).map((_, i) => (
                <StaggerItem key={i} delay={i * 0.05} variant="scale" className="aspect-square relative overflow-hidden rounded-[var(--radius-lg)] group">
                  <div className="absolute inset-0 bg-[var(--color-whisper)] skeleton" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                    <MagneticButton
                      className="px-4 py-2 rounded-full bg-white text-[var(--color-ink)] text-sm font-medium opacity-0 group-hover:opacity-100 transition-all duration-300"
                      strength={0.3}
                    >
                      Shop this look
                    </MagneticButton>
                  </div>
                </StaggerItem>
              ))
            )}
          </StaggerContainer>
          <div className="text-center mt-10">
            <Button variant="outline" asChild>
              <Link href={lookInstagramUrl} target="_blank" rel="noopener noreferrer">
                <SocialIcon platform="instagram" size="sm" className="mr-2" />
                {lookButtonText}
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

// Skeleton component for placeholder products
function SkeletonProductCard() {
  return (
    <Card variant="product" padding="none" hoverable className="group relative">
      <div className="relative aspect-[3/4] overflow-hidden bg-[var(--color-whisper)]">
        <div className="absolute inset-0 skeleton" />
      </div>
      <div className="p-4 space-y-2">
        <div className="h-3 w-24 skeleton rounded" />
        <div className="h-5 w-3/4 skeleton rounded" />
        <div className="h-4 w-1/2 skeleton rounded" />
        <div className="h-10 w-full skeleton rounded-[var(--radius-md)]" />
      </div>
    </Card>
  );
}
