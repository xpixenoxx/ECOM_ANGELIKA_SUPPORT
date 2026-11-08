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
import { ExploreCollections } from '@/components/composite/ExploreCollections';
import { useCart } from '@/lib/hooks/useCart';
import { useWishlist } from '@/lib/hooks/useWishlist';
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
  const { toggleItem, isInWishlist } = useWishlist();

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
  const heroBg = heroData?.backgroundImage || heroContent.backgroundImage || '/images/hero-new-couture.jpg';
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
      <section className="relative min-h-[92vh] md:min-h-[96vh] flex items-center overflow-hidden mb-[10px]" style={{ marginBottom: '10px' }}>
        <Image
          src={heroBg}
          alt={heroBgAlt}
          fill
          priority
          className="object-cover object-[80%_center] md:object-right lg:object-center z-0"
          sizes="100vw"
        />

        {/* Editorial Cinematic Overlays for Text Legibility */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-transparent z-[1]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/30 z-[1]" />

        <div className="relative z-10 container-custom px-6 sm:px-10 py-24 md:py-32">
          <motion.div
            className="max-w-lg lg:max-w-xl text-left"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Top Brand Stamp & Tagline Badge */}
            {showBadge && (badgeText || badgeTagline) && (
              <motion.div
                className="flex flex-col items-start gap-1 mb-6"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold tracking-[0.32em] uppercase text-[#D4AF37]">
                  <span className="text-[#D4AF37]">★</span>
                  <span>{badgeText}</span>
                </div>
                {badgeTagline && (
                  <span className="text-[10px] sm:text-xs text-[#E6DFD5]/90 tracking-[0.22em] uppercase font-medium">
                    {badgeTagline}
                  </span>
                )}
              </motion.div>
            )}

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

      {/* Explore Collections: Editorial Magazine Grid */}
      <ExploreCollections
        categoriesContent={siteContent?.categories}
        className="mt-[10px]"
        style={{ marginTop: '10px' }}
      />

      {/* Vidhya's Picks */}
      <section className="section bg-[var(--color-white)]">
        <div className="container-custom px-6 py-12" style={{ padding: '48px 24px' }}>
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
          <StaggerContainer variant="default" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 justify-items-center">
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
                    onAddToWishlist={() => handleToggleWishlist(product)}
                    isWishlisted={isInWishlist(product.slug || product.id)}
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

      {/* New Arrivals: Reference Style */}
      {(() => {
        const naContent = siteContent?.['new-arrivals'];
        const headingTitle = naContent?.heading
          ? `${naContent.heading} ${naContent.headingHighlight || ''}`.trim()
          : 'NEW COLLECTION: NEW ARRIVALS';
        const ctaText = naContent?.ctaText || 'OPEN';
        const ctaLink = naContent?.ctaLink || '/new-arrivals';

        // Choose between custom curated items or dynamic database items
        const isCustomMode = naContent?.mode === 'custom' && Array.isArray(naContent?.items) && naContent.items.length > 0;
        const productsToDisplay = isCustomMode
          ? naContent.items
          : (newArrivals.length > 0 ? newArrivals : (naContent?.items || []));

        return (
          <section className="section bg-white">
            <div className="container-custom px-6 py-12" style={{ padding: '48px 24px' }}>
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
              <StaggerContainer variant="fast" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 justify-items-center">
                {productsToDisplay.length > 0 ? (
                  productsToDisplay.map((product: any, index: number) => {
                    const imgUrl = product.image || product.images?.[0]?.url || '/images/placeholder.jpg';
                    const categoryName = typeof product.category === 'string'
                      ? product.category
                      : product.category?.name || '';
                    const origPrice = product.originalPrice ?? product.compare_at_price ?? undefined;
                    const isVPick = product.isVidhyasPick ?? product.is_vidyas_pick ?? false;
                    const productHref = product.href && !product.href.includes('/undefined')
                      ? product.href
                      : (product.slug ? `/product/${product.slug}` : `/new-arrivals?search=${encodeURIComponent(product.name)}`);

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
                          onAddToWishlist={() => handleToggleWishlist(product)}
                          isWishlisted={isInWishlist(product.slug || product.id)}
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
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/0 transition-colors duration-300 flex items-center justify-center">
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
    <div className="group relative flex flex-col w-[320px] max-w-full mx-auto bg-white">
      <div style={{ width: '320px', height: '400px' }} className="relative w-[320px] h-[400px] max-w-full overflow-hidden bg-[#F7F5F0] shrink-0">
        <div className="absolute inset-0 skeleton" />
      </div>
      <div style={{ width: '320px', height: '33.8px' }} className="w-[320px] h-[33.8px] bg-[#FBF4EC] skeleton mx-auto shrink-0" />
      <div className="pt-2.5 pb-2 px-1 text-center flex flex-col items-center space-y-2">
        <div className="h-3 w-3/4 skeleton rounded" />
        <div className="h-3 w-1/2 skeleton rounded" />
      </div>
    </div>
  );
}
