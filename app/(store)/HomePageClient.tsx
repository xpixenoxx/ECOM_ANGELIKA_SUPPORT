'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ProductCard } from '@/components/ui/Card';
import { ScrollReveal } from '@/components/composite/ScrollReveal';
import { SocialIcon } from '@/components/ui/SocialIcon';
import { MagneticButton, MagneticCard, MagneticIcon } from '@/components/animations/MagneticButton';
import { StaggerContainer, StaggerItem } from '@/components/animations/Stagger';
import { ScrollReveal as ScrollRevealAnim } from '@/components/animations/ScrollReveal';
import { ShopTheLookClient } from '@/app/(store)/components/ShopTheLookClient';
import { ExploreCollections } from '@/components/composite/ExploreCollections';
import { CoutureAssurancesStrip } from '@/components/composite/CoutureAssurancesStrip';
import { useCart } from '@/lib/hooks/useCart';
import { useWishlist } from '@/lib/hooks/useWishlist';
import { subscribeToAngelikaCircle, getLatestCircleUpdates } from '@/lib/actions/circle';
import type { CircleUpdate } from '@/lib/actions/circle-types';
import type { HomepageProductCard, LookData } from '@/lib/actions/homepage-types';
import type { HomepageHeroData } from '@/lib/actions/homepage-hero-types';
import type { SiteContent } from '@/lib/actions/site-content-types';
import type { Database } from '@/types/database';

type StorefrontCategoryRow = Database['public']['Tables']['categories']['Row'];

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

const defaultCoutureFeatures = [
  {
    icon: 'shipping',
    eyebrow: 'Complimentary Dispatch',
    title: 'Complimentary Shipping',
    desc: 'Insured pan-India express delivery on orders ₹2,999+',
    description: 'Insured pan-India express delivery on orders ₹2,999+',
    href: '/shipping',
  },
  {
    icon: 'returns',
    eyebrow: 'Effortless Care',
    title: '15-Day Exchanges',
    desc: 'Seamless size exchanges & atelier-assisted returns',
    description: 'Seamless size exchanges & atelier-assisted returns',
    href: '/returns',
  },
  {
    icon: 'styling',
    eyebrow: 'Vidhya Atelier',
    title: 'Personal Styling',
    desc: 'Private drape & trousseau guidance with Vidhya',
    description: 'Private drape & trousseau guidance with Vidhya',
    href: '/contact',
  },
  {
    icon: 'gift',
    eyebrow: 'Signature Packaging',
    title: 'Couture Gift Wrapping',
    desc: 'Hand-tied heirloom boxes complimentary on every order',
    description: 'Hand-tied heirloom boxes complimentary on every order',
    href: '/about',
  },
];

interface HomePageClientProps {
  vidhyasPicks: HomepageProductCard[];
  newArrivals: HomepageProductCard[];
  looks: LookData[];
  instagramPosts: Array<{ id: string; image_url: string; handle?: string; caption?: string; productName?: string; productLink?: string }>;
  heroData?: HomepageHeroData;
  siteContent?: SiteContent;
  storeCategories?: StorefrontCategoryRow[];
}

export default function HomePageClient({
  vidhyasPicks,
  newArrivals,
  looks,
  instagramPosts,
  heroData,
  siteContent,
  storeCategories,
}: HomePageClientProps) {
  const { addItem } = useCart();
  const { toggleItem, isInWishlist } = useWishlist();

  // Angelika Circle Newsletter Subscription State
  const [circleEmail, setCircleEmail] = useState('');
  const [circleSubmitting, setCircleSubmitting] = useState(false);
  const [circleSubscribed, setCircleSubscribed] = useState(false);
  const [circleMessage, setCircleMessage] = useState<string | null>(null);
  const [circleError, setCircleError] = useState<string | null>(null);
  const [latestCircleUpdates, setLatestCircleUpdates] = useState<CircleUpdate[]>([]);
  const [activeLookTitle, setActiveLookTitle] = useState<string | null>(null);

  useEffect(() => {
    getLatestCircleUpdates(2)
      .then((data) => {
        if (data && data.length > 0) setLatestCircleUpdates(data);
      })
      .catch(() => { });
  }, []);

  const handleCircleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = circleEmail.trim().toLowerCase();
    if (!clean || !clean.includes('@')) {
      setCircleError('Please enter a valid email address.');
      return;
    }

    setCircleSubmitting(true);
    setCircleError(null);

    try {
      const res = await subscribeToAngelikaCircle(clean);
      if (res.success) {
        setCircleSubscribed(true);
        setCircleMessage(res.message);
        setCircleEmail('');
      } else {
        setCircleError(res.message || 'Unable to subscribe. Please try again.');
      }
    } catch (err: any) {
      setCircleError(err?.message || 'Something went wrong. Please try again.');
    } finally {
      setCircleSubmitting(false);
    }
  };

  const handleToggleWishlist = async (product: any) => {
    try {
      await toggleItem(product.id, undefined, {
        id: product.id,
        slug: product.slug,
        name: product.name,
        price: Number(product.price) || 0,
        originalPrice: product.originalPrice || product.compare_at_price ? Number(product.originalPrice || product.compare_at_price) : undefined,
        discount: product.discount,
        image: product.image || (Array.isArray(product.images) ? (product.images[0]?.url || product.images[0]) : null) || '/images/placeholder.jpg',
        category: product.category?.name || product.category || 'Ethnic Wear',
        isVidhyasPick: product.is_vidyas_pick,
      });
    } catch (err) {
      console.error('Failed to toggle wishlist:', err);
    }
  };

  const heroContent = siteContent?.hero || {
    title: 'Grace in Every Drape',
    subtitle: 'Timeless traditional wear for the modern woman. Rooted in heritage, designed for your today.',
    ctaText: 'Explore Collection',
    ctaLink: '/shop',
    secondaryCtaText: "Vidhya's Picks",
    secondaryCtaLink: '/vidhyas-picks',
    backgroundImage: '/images/hero-mauve-saree.jpg',
  };

  const vidhyasPicksSection = siteContent?.['vidhyas-picks'];
  const hasCustomCmsVidhyasPicks = Boolean(
    (vidhyasPicksSection as any)?.hasCustomItems &&
    Array.isArray(vidhyasPicksSection?.items) &&
    vidhyasPicksSection.items.length > 0
  );
  const mappedCmsVidhyasPicks: HomepageProductCard[] = (vidhyasPicksSection?.items || []).map((item: any, idx: number) => {
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
  });
  const activeVidhyasPicks: HomepageProductCard[] = hasCustomCmsVidhyasPicks
    ? mappedCmsVidhyasPicks
    : (vidhyasPicks && vidhyasPicks.length > 0 ? vidhyasPicks : mappedCmsVidhyasPicks);

  const brandStorySection = siteContent?.['brand-story'];
  const myAngelikaLookContent = siteContent?.['my-angelika-look'];
  const lookTag = myAngelikaLookContent?.tag || '#MyAngelikaLook';
  const lookSubtitle = myAngelikaLookContent?.subtitle || 'See how our community styles their Angelika favorites. Tag @angelikafashions for a chance to be featured.';
  const lookInstagramUrl = myAngelikaLookContent?.instagramUrl || 'https://instagram.com/angelikafashions';
  const lookButtonText = myAngelikaLookContent?.buttonText || 'Follow us on Instagram';
  const displayPosts = (myAngelikaLookContent?.posts && myAngelikaLookContent.posts.length > 0)
    ? myAngelikaLookContent.posts
    : instagramPosts;

  const activeFeatureItems =
    siteContent?.features?.items && siteContent.features.items.length > 0
      ? siteContent.features.items
      : defaultCoutureFeatures;

  const handleAddToBag = async (product: any) => {
    const targetId = product.variant_id || product.defaultVariantId || product.id || product.slug || 'na-1';
    const imgUrl = product.image || product.images?.[0]?.url || '/images/collection-kurtis.jpg';
    const rawPrice = product.price;
    const priceVal = typeof rawPrice === 'number' && !isNaN(rawPrice) && rawPrice > 0
      ? rawPrice
      : Number(String(rawPrice || '').replace(/[^0-9.]/g, '')) || 2999;
    const isVP = Boolean(product.isVidhyasPick || product.is_vidyas_pick);
    const prodName = product.name || product.title || 'Handcrafted Ethnic Ensemble';

    return await addItem(targetId, 1, 'Free Size', {
      product_id: product.id || targetId,
      product_name: prodName,
      price: priceVal,
      image: imgUrl,
      is_vidyas_pick: isVP,
    });
  };

  // Hero dynamic configuration from Admin Panel (HomepageHeroEditor & siteContent.hero)
  const heroBg = heroData?.backgroundImage || heroContent.backgroundImage || '/images/hero-mauve-saree.jpg';
  const heroBgAlt = heroData?.backgroundImageAlt || (heroContent.title ? `Angelika Fashions - ${heroContent.title}` : 'Angelika Fashions - Grace in Every Drape | Luxury Indian Ethnic Wear by Vidhya');
  const showBadge = heroData?.showBadge ?? true;
  const badgeText = heroData?.badgeText || 'A N G E L I K A';
  const badgeTagline = heroData?.badgeTagline || 'Tradition in Every Thread';

  const headlinePrimary = heroData?.headline || (heroContent.title ? heroContent.title.split(' ')[0] : 'Grace in');
  const headlineHighlight = heroData?.headlineHighlight || (heroContent.title ? heroContent.title.split(' ').slice(1).join(' ') : 'Every Drape');

  const heroSubtitle = heroData?.subtitle || heroContent.subtitle || 'Step into the festive season with exquisite handwoven fabrics, artisanal zardozi embroidery, and timeless silhouettes crafted to perfection.';

  const primaryCtaText = heroData?.primaryCtaText || heroContent.ctaText || 'Explore Collection';
  const primaryCtaLink = heroData?.primaryCtaLink || heroContent.ctaLink || '/shop';
  const secondaryCtaText = heroData?.secondaryCtaText || heroContent.secondaryCtaText || "Vidhya's Picks";
  const secondaryCtaLink = heroData?.secondaryCtaLink || heroContent.secondaryCtaLink || '/vidhyas-picks';

  return (
    <div className="bg-[var(--color-sand)] text-[var(--color-ink)]">
      {/* Hero Section */}
      <section className="relative min-h-[580px] md:min-h-[660px] lg:min-h-[720px] max-h-[820px] flex items-center overflow-hidden mb-[10px]" style={{ marginBottom: '10px' }}>
        <Image
          src={heroBg}
          alt={heroBgAlt}
          fill
          priority
          quality={100}
          unoptimized
          className="object-cover object-left z-0"
          sizes="100vw"
        />

        {/* Crisp, Crystal-Clear Overlays: Left side (Model) is 100% clear and unblurred; subtle right-side gradient for text legibility */}
        <div className="hidden md:block absolute inset-0 bg-gradient-to-l from-black/65 via-black/25 to-transparent z-[1] pointer-events-none" />
        <div className="md:hidden absolute inset-0 bg-black/40 z-[1] pointer-events-none" />

        <div className="relative z-10 container-custom px-6 sm:px-10 py-16 md:py-24 flex justify-end w-full">
          <motion.div
            className="max-w-lg lg:max-w-xl text-left ml-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Brand Signature Headline - Exact Luxury Editorial Style */}
            <div className="flex flex-col items-start gap-1 mb-6">
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl text-white font-medium tracking-tight leading-[1.12]">
                {headlinePrimary}{' '}
                {headlineHighlight && (
                  <span className="font-serif italic font-light text-gradient-gold">
                    {headlineHighlight}
                  </span>
                )}
              </h1>
            </div>

            {/* Subtitle / Description */}
            <p
              style={{ color: '#FAF6F0' }}
              className="text-[#FAF6F0] text-sm sm:text-base md:text-[17px] leading-relaxed mb-8 max-w-lg font-sans font-normal tracking-wide whitespace-pre-line drop-shadow-[0_2px_10px_rgba(0,0,0,0.85)]"
            >
              {heroSubtitle}
            </p>

            {/* Call To Action Buttons */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              {primaryCtaText && (
                <Link
                  href={primaryCtaLink}
                  className="group relative inline-flex items-center justify-center px-7 py-3.5 text-xs uppercase tracking-[0.2em] font-semibold text-[#111111] bg-[#FBF4EC] hover:bg-white transition-all duration-300 shadow-md hover:shadow-xl"
                >
                  <span>{primaryCtaText}</span>
                  <span className="ml-2 transform group-hover:translate-x-1 transition-transform duration-300">&rarr;</span>
                </Link>
              )}
              {secondaryCtaText && (
                <Link
                  href={secondaryCtaLink}
                  style={{ color: '#FAF6F0' }}
                  className="inline-flex items-center justify-center px-7 py-3.5 text-xs uppercase tracking-[0.2em] font-medium text-[#FAF6F0] border border-white/50 hover:border-white hover:bg-white/10 transition-all duration-300 backdrop-blur-xs drop-shadow-[0_1px_4px_rgba(0,0,0,0.7)]"
                >
                  {secondaryCtaText}
                </Link>
              )}
            </div>
          </motion.div>
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

      {/* Couture Service Assurances (Woven Silk Grid & Drape Wave Strip) */}
      <CoutureAssurancesStrip
        items={activeFeatureItems}
        eyebrow={siteContent?.features?.eyebrow}
        showGrid={siteContent?.features?.showGrid !== false}
        showWaves={siteContent?.features?.showWaves !== false}
      />

      {/* Explore Collections: Editorial Magazine Grid */}
      <ExploreCollections
        categoriesContent={siteContent?.categories}
        storeCategories={storeCategories}
        className="mt-[10px]"
        style={{ marginTop: '10px' }}
      />

      {/* Vidhya's Picks */}
      <section className="section bg-[var(--color-white)]">
        <div className="max-w-[1560px] mx-auto px-4 sm:px-6 py-12">
          <motion.div
            className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12"
          >
            <div>
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
                {vidhyasPicksSection?.ctaText || "View All Picks"} <span aria-hidden="true">&rarr;</span>
              </Link>
            </Button>
          </motion.div>
          <StaggerContainer variant="default" className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-x-4 lg:gap-y-8 w-full">
            {activeVidhyasPicks.length > 0 ? (
              activeVidhyasPicks.map((product, index) => (
                <StaggerItem key={product.id} delay={index * 0.08} variant="scale" className="w-full">
                  <ProductCard
                    image={product.images[0]?.url || '/images/placeholder.jpg'}
                    name={product.name}
                    price={product.price}
                    originalPrice={product.compare_at_price || undefined}
                    category={product.category?.name || ''}
                    isVidhyasPick={product.is_vidyas_pick}
                    discount={product.discount}
                    href={
                      product.slug
                        ? `/product/${product.slug}`
                        : `/product/${(product.name || '').toLowerCase().replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-')}`
                    }
                    onAddToBag={() => handleAddToBag(product)}
                    onAddToWishlist={() => handleToggleWishlist(product)}
                    isWishlisted={isInWishlist(product.slug || product.id)}
                  />
                </StaggerItem>
              ))
            ) : (
              <div className="col-span-full w-full py-12 px-6 rounded-2xl border border-dashed border-[var(--color-whisper)] bg-[var(--color-snow)]/60 text-center space-y-3">
                <p className="text-sm text-[var(--color-slate)]">
                  Vidhya&apos;s curated seasonal picks are being updated.
                </p>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/shop">Explore Full Collection →</Link>
                </Button>
              </div>
            )}
          </StaggerContainer>
        </div>
      </section>

      {/* Shop the Look Editorial Hotspots */}
      {(() => {
        const stlContent = siteContent?.['shop-the-look'] as any;
        const hasLiveDbLooks = Array.isArray(looks) && looks.length > 0;
        const looksExplicitlySyncedEmpty = Boolean(stlContent?._looks_synced_at && !hasLiveDbLooks);
        const shouldRenderShopTheLook =
          !looksExplicitlySyncedEmpty &&
          (hasLiveDbLooks || Boolean(stlContent?.lifestyle_image_url));

        if (!shouldRenderShopTheLook) return null;

        const displayTitle = hasLiveDbLooks
          ? (activeLookTitle || looks[0]?.name || looks[0]?.title || stlContent?.title || 'Festive Elegance')
          : (stlContent?.title || 'Festive Elegance');

        return (
          <section className="section bg-[var(--color-snow)]/70 border-y border-[var(--color-whisper)]">
            <div className="container-custom px-6 py-12" style={{ padding: '48px 24px' }}>
              <div className="text-center mb-8">
                <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-gold-text)] block mb-2">
                  {(stlContent?.badge || 'Curated Ensemble').replace(/ensemblesss/gi, 'Ensemble')}
                </span>
                <h2 className="text-[var(--font-display)] text-3xl md:text-4xl font-medium text-[var(--color-ink)]">
                  {String(displayTitle).replace(/elegancesss/gi, 'Elegance')}
                </h2>
              </div>
              <ShopTheLookClient
                initialLooks={hasLiveDbLooks ? looks : undefined}
                initialLook={hasLiveDbLooks ? looks[0] : stlContent}
                onActiveLookChange={setActiveLookTitle}
              />
            </div>
          </section>
        );
      })()}

      {/* New Arrivals: Reference Style */}
      {(() => {
        const naContent = siteContent?.['new-arrivals'];
        const headingTitle = naContent?.heading
          ? `${naContent.heading} ${naContent.headingHighlight || ''}`.trim()
          : 'NEW COLLECTION: NEW ARRIVALS';
        const ctaText = naContent?.ctaText || 'OPEN';
        const ctaLink = naContent?.ctaLink || '/new-arrivals';

        // Choose between custom curated items or dynamic database items
        const isCustomMode = Boolean(
          naContent?.mode === 'custom' &&
          (naContent as any)?._updated_at &&
          Array.isArray(naContent?.items) &&
          naContent.items.length > 0
        );
        const productsToDisplay = isCustomMode
          ? (naContent?.items || [])
          : (newArrivals.length > 0 ? newArrivals : (naContent?.items || []));

        return (
          <section className="section bg-white">
            <div className="max-w-[1560px] mx-auto px-4 sm:px-6 py-12">
              <div className="flex items-center justify-between border-b border-[#EBE6DE] pb-3 mb-8">
                <h2 className="text-xs sm:text-sm font-bold uppercase tracking-[0.22em] text-[#111111]">
                  {headingTitle}
                </h2>
                <Link
                  href={ctaLink}
                  className="text-xs uppercase tracking-[0.2em] text-[#666666] hover:text-[#111111] font-medium transition-colors"
                >
                  {ctaText}
                </Link>
              </div>
              <StaggerContainer variant="fast" className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-x-4 lg:gap-y-8 w-full">
                {productsToDisplay.length > 0 ? (
                  productsToDisplay.map((product: any, index: number) => {
                    const imgUrl = product.image || product.images?.[0]?.url || '/images/placeholder.jpg';
                    const categoryName = typeof product.category === 'string'
                      ? product.category
                      : product.category?.name || '';
                    const origPrice = product.originalPrice ?? product.compare_at_price ?? undefined;
                    const isVPick = product.isVidhyasPick ?? product.is_vidyas_pick ?? false;
                    const productHref =
                      (product.href && product.href.startsWith('/product/') && product.href) ||
                      (product.slug && `/product/${product.slug}`) ||
                      (product.name && `/product/${product.name.toLowerCase().replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-')}`) ||
                      '/shop';

                    return (
                      <StaggerItem key={product.id || index} delay={index * 0.08} variant="scale" className="w-full">
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
                          onAddToWishlist={() => handleToggleWishlist(product)}
                          isWishlisted={isInWishlist(product.slug || product.id)}
                        />
                      </StaggerItem>
                    );
                  })
                ) : (
                  <div className="col-span-full w-full py-12 px-6 rounded-2xl border border-dashed border-[var(--color-whisper)] bg-[var(--color-snow)]/60 text-center space-y-3">
                    <p className="text-sm text-[var(--color-slate)]">
                      New collection pieces are arriving shortly.
                    </p>
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/shop">Browse Existing Collections →</Link>
                    </Button>
                  </div>
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
        const rawBrandWa = bs?.whatsappLink || '';
        const whatsappLink =
          rawBrandWa && !rawBrandWa.includes('XXXXXXXXXX') && !rawBrandWa.includes('919876543210')
            ? rawBrandWa
            : '/contact';
        const isExternalWa = whatsappLink.startsWith('http');

        return (
          <section className="section bg-[var(--color-white)]">
            <div className="container-custom px-6 py-12" style={{ padding: '48px 24px' }}>
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
                  <span className="inline-block px-3 py-1 rounded-full bg-[var(--color-gold-light)] text-[var(--color-gold-text)] text-xs font-semibold uppercase tracking-wider mb-4">
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
                    <Button variant={isExternalWa ? 'whatsapp' : 'outline'} asChild>
                      <Link
                        href={whatsappLink}
                        target={isExternalWa ? '_blank' : undefined}
                        rel={isExternalWa ? 'noopener noreferrer' : undefined}
                      >
                        {isExternalWa && <SocialIcon platform="whatsapp" size="sm" className="mr-2" />}
                        {isExternalWa ? whatsappCtaText : 'Message Our Stylists'}
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
        <div className="relative z-10 container-custom px-6 py-12" style={{ padding: '48px 24px' }}>
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
            {circleSubscribed ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-6 rounded-2xl bg-[var(--color-gold)]/10 border border-[var(--color-gold)]/30 text-center max-w-md mx-auto space-y-3"
              >
                <div className="w-12 h-12 rounded-full bg-[var(--color-gold)]/20 text-[var(--color-gold)] flex items-center justify-center mx-auto text-xl font-bold">
                  ✓
                </div>
                <h3 className="text-lg font-medium text-[var(--color-white)]">
                  Welcome to the Angelika Circle
                </h3>
                <p className="text-sm text-[var(--color-white)]/80 leading-relaxed">
                  {circleMessage ||
                    'You are now registered to receive our latest collections, private couture drops, and styling notes from Vidhya.'}
                </p>
                <button
                  type="button"
                  onClick={() => setCircleSubscribed(false)}
                  className="text-xs text-[var(--color-gold)] hover:underline mt-2 inline-block cursor-pointer"
                >
                  Subscribe another email
                </button>
              </motion.div>
            ) : (
              <form
                className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
                onSubmit={handleCircleSubscribe}
              >
                <div className="flex-1">
                  <label htmlFor="newsletter-email" className="sr-only">
                    Email address
                  </label>
                  <input
                    type="email"
                    id="newsletter-email"
                    name="email"
                    inputMode="email"
                    spellCheck={false}
                    enterKeyHint="send"
                    value={circleEmail}
                    onChange={(e) => setCircleEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="input w-full"
                    required
                    autoComplete="email"
                    disabled={circleSubmitting}
                  />
                </div>
                <Button
                  type="submit"
                  size="lg"
                  variant="gold"
                  className="whitespace-nowrap min-w-[120px]"
                  disabled={circleSubmitting || !circleEmail.trim()}
                >
                  {circleSubmitting ? 'Joining...' : 'Subscribe'}
                </Button>
              </form>
            )}

            {circleError && (
              <p className="text-xs text-rose-400 mt-2 font-medium">
                {circleError}
              </p>
            )}
            <p className="text-xs text-[var(--color-white)]/50 mt-4">
              By subscribing, you agree to our <a href="/privacy" className="underline hover:text-[var(--color-gold)]">Privacy Policy</a>. Unsubscribe anytime.
            </p>

            {latestCircleUpdates.length > 0 && (
              <div className="mt-10 pt-8 border-t border-[var(--color-white)]/15 max-w-2xl mx-auto text-left">
                <div className="flex items-center gap-2 mb-4 justify-center sm:justify-start">
                  <span className="w-2 h-2 rounded-full bg-[var(--color-gold)] animate-pulse" />
                  <p className="text-xs uppercase tracking-widest text-[var(--color-gold)] font-semibold">
                    Latest Atelier Broadcast &amp; Exclusive Drops
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {latestCircleUpdates.map((upd) => (
                    <div
                      key={upd.id}
                      className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-[var(--color-gold)]/40 transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between text-[11px] text-[var(--color-gold)] mb-1">
                          <span className="font-semibold uppercase tracking-wider">Broadcast Update</span>
                          <span className="text-[var(--color-white)]/50">
                            {new Date(upd.published_at).toLocaleDateString('en-IN', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                        <h4 className="text-sm font-semibold text-[var(--color-white)] mb-1">
                          {upd.title}
                        </h4>
                        <p className="text-xs text-[var(--color-white)]/70 line-clamp-2 leading-relaxed">
                          {upd.content}
                        </p>
                      </div>
                      {upd.cta_link && (
                        <a
                          href={upd.cta_link}
                          className="mt-3 inline-flex items-center gap-1 text-xs text-[var(--color-gold)] font-medium hover:underline"
                        >
                          <span>{upd.cta_text || 'Explore Drop'}</span>
                          <span>&rarr;</span>
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Instagram Feed / Social Proof */}
      <section className="section bg-[var(--color-white)]" id="MyAngelikaLook">
        <div className="container-custom px-6 py-12" style={{ padding: '48px 24px' }}>
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
                    className="object-cover"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/0 transition-colors duration-300 flex items-center justify-center">
                    <MagneticButton
                      className="px-4 py-2 rounded-full bg-white text-[var(--color-ink)] text-sm font-medium opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 [@media(hover:none)]:opacity-100 transition-all duration-300 hover:bg-[var(--color-gold-light)] shadow-sm"
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
              <div className="col-span-full py-10 px-6 rounded-2xl border border-dashed border-[var(--color-whisper)] bg-[var(--color-snow)]/60 text-center space-y-2">
                <p className="text-sm text-[var(--color-slate)]">
                  Share your Angelika look with <span className="font-semibold text-[var(--color-ink)]">{lookTag}</span> to be featured in our gallery.
                </p>
              </div>
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

// Skeleton component for placeholder products (matches 377.2x554.7 luxury card spec)
function SkeletonProductCard() {
  return (
    <div className="group relative flex flex-col w-full bg-white text-left">
      <div className="relative w-full aspect-[377.2/554.7] overflow-hidden bg-[#F7F5F0] shrink-0">
        <div className="absolute inset-0 skeleton" />
        <div className="absolute bottom-0 inset-x-0 h-[2px] bg-[#EAE5DF]">
          <div className="h-full w-12 bg-[#424242]/30 skeleton" />
        </div>
      </div>
      <div className="pt-[16px] px-[12px] pb-0 flex flex-col space-y-2">
        <div className="h-3 w-4/5 skeleton rounded" />
        <div className="h-3 w-2/3 skeleton rounded" />
      </div>
      <div className="pt-[8px] px-[12px] pb-0">
        <div className="h-3 w-1/3 skeleton rounded" />
      </div>
      <div className="mt-[8px] px-[12px] pb-[16px]">
        <div className="h-2.5 w-1/4 skeleton rounded" />
      </div>
    </div>
  );
}
