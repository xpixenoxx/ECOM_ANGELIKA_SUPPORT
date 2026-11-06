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
import type { HomepageProductCard, LookData } from '@/lib/actions/homepage';
import type { HomepageHeroData } from '@/lib/actions/homepage-hero-types';
import type { SiteContent } from '@/lib/actions/site-content';

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
  instagramPosts: Array<{ id: string; image_url: string }>;
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
    const priceVal = Number(product.price) || 2999;
    const isVP = Boolean(product.isVidhyasPick || product.is_vidyas_pick);
    const prodName = product.name || product.title || 'Handcrafted Ethnic Ensemble';

    await addItem(targetId, 1, 'Free Size', {
      product_id: product.id,
      product_name: prodName,
      price: priceVal,
      image: imgUrl,
      is_vidyas_pick: isVP,
    });
  };

  return (
    <div className="bg-[var(--color-sand)] text-[var(--color-ink)]">
      {/* Hero Section */}
      <section className="relative min-h-[92vh] md:min-h-[96vh] flex items-center overflow-hidden mb-[10px]" style={{ marginBottom: '10px' }}>
        <Image
          src={heroData?.backgroundImage || heroContent.backgroundImage || '/images/hero-new-couture.jpg'}
          alt={heroData?.backgroundImageAlt || (heroContent.title ? `Angelika Fashions - ${heroContent.title}` : 'Angelika Fashions - Grace in Every Drape | Luxury Indian Ethnic Wear by Vidhya')}
          fill
          priority
          className="object-cover object-[80%_center] md:object-right lg:object-center z-0"
          sizes="100vw"
        />

        

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
      <ExploreCollections className="mt-[10px]" style={{ marginTop: '10px' }} />

      {/* Vidhya's Picks */}
      <section className="section bg-[var(--color-white)]">
        <div className="container-custom px-6 py-12" style={{ padding: '48px 24px' }}>
          <motion.div
            className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12"
          >
            <div>
              <h2 className="text-[var(--font-display)] text-4xl md:text-5xl font-medium text-[var(--color-ink)]">
                Handpicked by <span className="text-gradient-gold">Vidhya</span>
              </h2>
            </div>
            <Button variant="outline" asChild className="mt-4 md:mt-0">
              <Link href="/vidhyas-picks">View All Picks <span aria-hidden="true">&rarr;</span></Link>
            </Button>
          </motion.div>
          <StaggerContainer variant="default" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 justify-items-center">
            {vidhyasPicks.length > 0 ? (
              vidhyasPicks.map((product, index) => (
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
      <section className="section bg-[var(--color-white)]">
        <div className="container-custom px-6 py-12" style={{ padding: '48px 24px' }}>
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-[var(--font-display)] text-4xl md:text-5xl font-medium text-[var(--color-ink)] mb-4">
              #MyAngelikaLook
            </h2>
            <p className="text-[var(--color-slate)] text-lg max-w-2xl mx-auto">
              See how our community styles their Angelika favorites. Tag @angelikafashions for a chance to be featured.
            </p>
          </motion.div>
          <StaggerContainer variant="fast" className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {instagramPosts.length > 0 ? (
              instagramPosts.map((post, i) => (
                <StaggerItem key={post.id} delay={i * 0.05} variant="scale" className="aspect-square relative overflow-hidden rounded-[var(--radius-lg)] group">
                  <Image
                    src={post.image_url}
                    alt="Instagram post"
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 25vw"
                  />
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
              <Link href="https://instagram.com/angelikafashions" target="_blank" rel="noopener noreferrer">
                <SocialIcon platform="instagram" size="sm" className="mr-2" />
                Follow us on Instagram
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
