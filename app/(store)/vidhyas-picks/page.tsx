'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { SocialIcon } from '@/components/ui/SocialIcon';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils/cn';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { StaggerContainer, StaggerItem, StaggerGrid } from '@/components/animations/Stagger';
import { MagneticButton } from '@/components/animations/MagneticButton';
import { LinkButton } from '@/components/ui/LinkButton';

export interface PickProduct {
  id: string;
  slug: string;
  name: string;
  price: number;
  originalPrice: number;
  image: string;
  color: string;
  category: 'Sarees' | 'Lehengas' | 'Kurtis' | 'Salwars' | 'Dupattas';
  fabric: string;
  origin: string;
  discount: number;
  vidhyaNote: string;
  month?: string;
  theme?: string;
}

export interface MonthlyEdit {
  month: string;
  slug: string;
  theme: string;
  subtitle: string;
  note: string;
  coverImage: string;
  heroStory: string;
  curatorInsight: string;
  products: PickProduct[];
}

const monthlyEdits: MonthlyEdit[] = [
  {
    month: 'January 2026',
    slug: 'january-2026',
    theme: 'New Beginnings in Silk',
    subtitle: 'Lustrous Mulberry Silks & Airy Chiffons for the Fresh Season',
    note: 'Starting the year with the fabrics that feel like fresh starts — lightweight silks, soft chiffons, and the kind of pieces that make you feel ready for anything.',
    coverImage: '/images/vp-jan-1.jpg',
    heroStory: 'As the light shifts into the new year, this edit celebrates purity of form and effortless movement. We sourced unadulterated mulberry silks from Varanasi weavers and featherlight chiffons crafted for fluid draping from morning rituals to evening soirées.',
    curatorInsight: '“When silk drapes true to your natural posture, you never have to adjust it twice. That ease is what luxury really means.” — Vidhya',
    products: [
      {
        id: 'vp-jan-1',
        slug: 'mulberry-silk-saree',
        name: 'Mulberry Silk Saree',
        price: 7999,
        originalPrice: 9999,
        image: '/images/vp-jan-1.jpg',
        color: 'Ivory & Antique Gold',
        category: 'Sarees',
        fabric: 'Pure Mulberry Silk',
        origin: 'Varanasi Master Weavers',
        discount: 20,
        vidhyaNote: 'The saree I wore to my own housewarming. Drapes like an absolute dream and catches subtle morning light.',
      },
      {
        id: 'vp-jan-2',
        slug: 'chiffon-anarkali-set',
        name: 'Chiffon Anarkali Set',
        price: 5499,
        originalPrice: 6899,
        image: '/images/vp-jan-2.jpg',
        color: 'Powder Blue',
        category: 'Kurtis',
        fabric: 'Pure Viscose Chiffon',
        origin: 'Jaipur Hand-Dye Atelier',
        discount: 20,
        vidhyaNote: 'Twirl factor: 10/10. Designed with lightweight flare for all-day festive comfort without heaviness.',
      },
      {
        id: 'vp-jan-3',
        slug: 'silk-palazzo-set',
        name: 'Silk Blend Palazzo Set',
        price: 3999,
        originalPrice: 4999,
        image: '/images/vp-jan-3.jpg',
        color: 'Sage Green',
        category: 'Salwars',
        fabric: 'Chanderi Silk Blend',
        origin: 'Chanderi Artisan Cluster',
        discount: 20,
        vidhyaNote: 'My personal go-to for gallery previews and client meetings. Polished, comfortable, and never wrinkles.',
      },
    ],
  },
  {
    month: 'December 2025',
    slug: 'december-2025',
    theme: 'Festive Finery',
    subtitle: 'Gold Zari, Hand-Cut Mirrors, and Opulent Jewel Tones',
    note: 'The season of light calls for pieces that catch it. Gold zari, mirror work, deep jewel tones — everything you need to shine with understated grandeur.',
    coverImage: '/images/vp-dec-1.jpg',
    heroStory: 'December in Indian tradition is a tapestry of weddings, celebrations, and winter galas. For this edit, we partnered with Kutch mirror artisans and Banaras master weavers to create festive pieces that radiate warmth.',
    curatorInsight: '“Real zari never glares loudly; it glows warmly from within like candlelight.” — Vidhya',
    products: [
      {
        id: 'vp-dec-1',
        slug: 'banarasi-tissue-saree',
        name: 'Banarasi Tissue Saree',
        price: 12999,
        originalPrice: 15999,
        image: '/images/vp-dec-1.jpg',
        color: 'Champagne Gold',
        category: 'Sarees',
        fabric: 'Handwoven Banarasi Tissue Zari',
        origin: 'Varanasi Heritage Looms',
        discount: 18,
        vidhyaNote: 'Tissue sarees are pure magic — they catch low ambient light and glow softly from within. A true heirloom piece.',
      },
      {
        id: 'vp-dec-2',
        slug: 'mirror-work-lehenga',
        name: 'Mirror Work Lehenga',
        price: 18999,
        originalPrice: 22999,
        image: '/images/vp-dec-2.jpg',
        color: 'Deep Crimson',
        category: 'Lehengas',
        fabric: 'Raw Silk & Fine Organza',
        origin: 'Kutch Artisanal Guild',
        discount: 17,
        vidhyaNote: 'Hand-embroidered mirrors by craftswomen in Kutch. Each mirror reflects light individually for an ethereal aura.',
      },
      {
        id: 'vp-dec-3',
        slug: 'velvet-kurti-set',
        name: 'Velvet Kurti Set',
        price: 6999,
        originalPrice: 8499,
        image: '/images/vp-dec-3.jpg',
        color: 'Emerald Green',
        category: 'Kurtis',
        fabric: 'Plush Micro-Velvet & Zari',
        origin: 'Kashmir Tilla Artisans',
        discount: 17,
        vidhyaNote: 'Winter wedding dressing sorted. Deep emerald velvet that feels luxurious to touch without weighing you down.',
      },
    ],
  },
  {
    month: 'November 2025',
    slug: 'november-2025',
    theme: 'Wedding Guest Edit',
    subtitle: 'Effortless Versatility for High-Energy Sangeets & Haldis',
    note: 'When the wedding invitations stack high, you need pieces that look breathtaking in photographs yet let you dance until 3 AM in total ease.',
    coverImage: '/images/vp-nov-1.jpg',
    heroStory: 'Wedding guest fashion often forces a choice between grandeur and ease. This edit was conceived to eradicate that compromise with airy organzas and featherlight shararas.',
    curatorInsight: '“The best wedding outfits are the ones where you forget you are wearing couture and just dance.” — Vidhya',
    products: [
      {
        id: 'vp-nov-1',
        slug: 'organza-saree-set',
        name: 'Organza Saree Set',
        price: 8999,
        originalPrice: 10999,
        image: '/images/vp-nov-1.jpg',
        color: 'Rose Gold',
        category: 'Sarees',
        fabric: 'Silk Organza & Micro-Sequins',
        origin: 'Surat Silk Looms',
        discount: 18,
        vidhyaNote: 'Organza with subtle hand-placed micro-sequin work. Looks ethereal in natural daylight and photographs beautifully.',
      },
      {
        id: 'vp-nov-2',
        slug: 'sharara-set-navy',
        name: 'Sharara Set',
        price: 7499,
        originalPrice: 9299,
        image: '/images/vp-nov-2.jpg',
        color: 'Navy Blue',
        category: 'Salwars',
        fabric: 'Flowing Georgette & Crepe',
        origin: 'Lucknow Chikankari Cluster',
        discount: 19,
        vidhyaNote: 'Shararas are the ultimate dance-floor companion. This flare moves with every step and never catches your heels.',
      },
      {
        id: 'vp-nov-3',
        slug: 'gota-patti-kurta',
        name: 'Gota Patti Kurta',
        price: 4299,
        originalPrice: 5299,
        image: '/images/vp-nov-3.jpg',
        color: 'Mustard Yellow',
        category: 'Kurtis',
        fabric: 'Chanderi Cotton',
        origin: 'Jaipur Gota Craft Center',
        discount: 18,
        vidhyaNote: 'Authentic gota patti hand-stitched in Jaipur. Sunny enough for Haldi, dressy enough for an intimate Sangeet.',
      },
    ],
  },
];

const allPicks: PickProduct[] = monthlyEdits.flatMap(edit =>
  edit.products.map(p => ({
    ...p,
    month: edit.month,
    theme: edit.theme,
  }))
);

const CATEGORIES = ['All', 'Sarees', 'Kurtis', 'Salwars', 'Lehengas'] as const;

function ProductCardGrid({
  product,
  index,
  isWishlisted,
  onToggleWishlist,
}: {
  product: PickProduct;
  index: number;
  isWishlisted: boolean;
  onToggleWishlist: (id: string) => void;
}) {
  const whatsappUrl = `https://wa.me/919876543210?text=${encodeURIComponent(
    `Hi Vidhya, I saw your curated pick "${product.name}" (₹${product.price.toLocaleString()}) and would love personal drape advice on sizing and fabric.`
  )}`;

  return (
    <StaggerItem key={product.id} variant="scale" style={{ transitionDelay: `${index * 0.05}s` }}>
      <article className="group relative bg-[var(--color-white)] border border-[var(--color-whisper)] rounded-[var(--radius-2xl)] overflow-hidden hover:shadow-[var(--shadow-xl)] hover:border-[var(--color-gold)]/40 transition-all duration-500 flex flex-col h-full">
        {/* Product Image Container */}
        <div className="relative aspect-[3/4] w-full overflow-hidden bg-[var(--color-whisper)]">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            priority={index < 3}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-ink)]/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

          {/* Top Badges */}
          <div className="absolute top-3.5 left-3.5 flex flex-wrap gap-2 z-10">
            <Badge variant="gold" className="shadow-sm font-semibold tracking-wide">
              Vidhya's Pick
            </Badge>
            {product.discount > 0 && (
              <Badge variant="outline" className="bg-[var(--color-white)]/95 text-[var(--color-ink)] border-[var(--color-whisper)] font-medium">
                -{product.discount}% OFF
              </Badge>
            )}
          </div>

          {/* Wishlist Button */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleWishlist(product.id);
            }}
            aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            className="absolute top-3.5 right-3.5 z-10 w-9 h-9 rounded-full bg-[var(--color-white)]/90 backdrop-blur-md flex items-center justify-center text-[var(--color-ink)] shadow-md hover:bg-[var(--color-white)] hover:scale-110 active:scale-95 transition-all duration-200"
          >
            <svg
              className={cn('w-5 h-5 transition-colors', isWishlisted ? 'text-[var(--color-error)] fill-current' : 'text-[var(--color-ink)]')}
              viewBox="0 0 24 24"
              stroke="currentColor"
              fill={isWishlisted ? 'currentColor' : 'none'}
              strokeWidth="2"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>

          {/* Origin Pill at bottom of image */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none">
            <span className="text-[11px] font-medium tracking-wide bg-[var(--color-white)]/90 backdrop-blur-md text-[var(--color-ink)] px-2.5 py-1 rounded-full shadow-sm">
              📍 {product.origin}
            </span>
            <span className="text-[11px] font-medium bg-[var(--color-ink)]/80 text-[var(--color-white)] px-2.5 py-1 rounded-full backdrop-blur-md">
              {product.fabric}
            </span>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-5 flex-1 flex flex-col justify-between">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[var(--color-gold)] font-semibold uppercase tracking-wider">
                {product.month || 'Curated Edit'}
              </span>
              <span className="text-[var(--color-slate)] font-medium">
                {product.color}
              </span>
            </div>

            <h3 className="text-[var(--font-display)] text-xl font-medium text-[var(--color-ink)] leading-snug line-clamp-1 group-hover:text-[var(--color-gold)] transition-colors">
              <Link href={`/product/${product.slug || product.id}`}>
                {product.name}
              </Link>
            </h3>

            {/* Pricing */}
            <div className="flex items-baseline gap-2.5 pt-1">
              <span className="text-xl font-bold text-[var(--color-ink)] tracking-tight">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
              {product.originalPrice > product.price && (
                <span className="text-sm text-[var(--color-mist)] line-through">
                  ₹{product.originalPrice.toLocaleString('en-IN')}
                </span>
              )}
              {product.discount > 0 && (
                <span className="text-xs font-semibold text-[var(--color-success)] bg-[var(--color-success-bg)] px-2 py-0.5 rounded-full">
                  Save ₹{(product.originalPrice - product.price).toLocaleString('en-IN')}
                </span>
              )}
            </div>

            {/* Vidhya's Styling Note Quote Card */}
            <div className="mt-3.5 p-3 rounded-[var(--radius-lg)] bg-[var(--color-snow)] border border-[var(--color-whisper)] flex items-start gap-2.5">
              <span className="text-[var(--color-gold)] font-serif text-2xl leading-none select-none">“</span>
              <p className="text-xs text-[var(--color-slate)] italic leading-relaxed flex-1">
                {product.vidhyaNote}
                <span className="block mt-1 not-italic font-semibold text-[10px] uppercase tracking-wider text-[var(--color-gold)]">
                  — Vidhya Sharma
                </span>
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-5 pt-4 border-t border-[var(--color-whisper)] flex items-center gap-2">
            <LinkButton
              variant="primary"
              className="flex-1 text-xs py-2.5 rounded-[var(--radius-full)] font-medium tracking-wide justify-center shadow-sm"
              href={`/product/${product.slug || product.id}`}
            >
              View Details
            </LinkButton>
            <Link
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Ask Vidhya about this piece on WhatsApp"
              className="p-2.5 rounded-[var(--radius-full)] border border-[var(--color-whisper)] bg-[var(--color-white)] text-[var(--color-slate)] hover:text-[var(--color-success)] hover:border-[var(--color-success)] hover:bg-[var(--color-success-bg)] transition-all flex items-center justify-center flex-shrink-0"
              title="Ask Vidhya about fit & drape"
            >
              <SocialIcon platform="whatsapp" size="sm" className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </article>
    </StaggerItem>
  );
}

function ProductCardList({
  product,
  index,
  isWishlisted,
  onToggleWishlist,
}: {
  product: PickProduct;
  index: number;
  isWishlisted: boolean;
  onToggleWishlist: (id: string) => void;
}) {
  const whatsappUrl = `https://wa.me/919876543210?text=${encodeURIComponent(
    `Hi Vidhya, I saw your curated pick "${product.name}" (₹${product.price.toLocaleString()}) and would love styling advice on sizing and fabric.`
  )}`;

  return (
    <StaggerItem key={product.id} variant="slide" style={{ transitionDelay: `${index * 0.05}s` }}>
      <article className="group relative bg-[var(--color-white)] border border-[var(--color-whisper)] rounded-[var(--radius-2xl)] overflow-hidden hover:shadow-[var(--shadow-xl)] hover:border-[var(--color-gold)]/40 transition-all duration-500 flex flex-col sm:flex-row items-stretch">
        {/* Product Image */}
        <div className="relative aspect-[3/4] sm:aspect-auto sm:w-72 md:w-80 flex-shrink-0 min-h-[300px] overflow-hidden bg-[var(--color-whisper)]">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, 320px"
            priority={index === 0}
          />
          <div className="absolute top-3.5 left-3.5 flex flex-wrap gap-2 z-10">
            <Badge variant="gold">Vidhya's Pick</Badge>
            {product.discount > 0 && (
              <Badge variant="outline" className="bg-[var(--color-white)]/95 text-[var(--color-ink)] border-[var(--color-whisper)]">
                -{product.discount}% OFF
              </Badge>
            )}
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleWishlist(product.id);
            }}
            aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            className="absolute top-3.5 right-3.5 z-10 w-9 h-9 rounded-full bg-[var(--color-white)]/90 backdrop-blur-md flex items-center justify-center text-[var(--color-ink)] shadow-md hover:bg-[var(--color-white)] transition-all"
          >
            <svg
              className={cn('w-5 h-5 transition-colors', isWishlisted ? 'text-[var(--color-error)] fill-current' : 'text-[var(--color-ink)]')}
              viewBox="0 0 24 24"
              stroke="currentColor"
              fill={isWishlisted ? 'currentColor' : 'none'}
              strokeWidth="2"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
        </div>

        {/* Content Side */}
        <div className="p-6 md:p-8 flex-1 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs text-[var(--color-gold)] font-semibold uppercase tracking-wider">
                {product.month || 'Curated Edit'} · {product.category}
              </span>
              <span className="text-xs text-[var(--color-slate)] bg-[var(--color-snow)] px-3 py-1 rounded-full border border-[var(--color-whisper)]">
                Origin: {product.origin}
              </span>
            </div>

            <div>
              <h3 className="text-[var(--font-display)] text-2xl md:text-3xl font-medium text-[var(--color-ink)] leading-snug">
                <Link href={`/product/${product.slug || product.id}`} className="hover:text-[var(--color-gold)] transition-colors">
                  {product.name}
                </Link>
              </h3>
              <p className="text-sm text-[var(--color-slate)] mt-1 font-medium">
                Color: {product.color} · Fabric: {product.fabric}
              </p>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-2xl font-bold text-[var(--color-ink)]">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
              {product.originalPrice > product.price && (
                <span className="text-base text-[var(--color-mist)] line-through">
                  ₹{product.originalPrice.toLocaleString('en-IN')}
                </span>
              )}
              {product.discount > 0 && (
                <span className="text-xs font-semibold text-[var(--color-success)] bg-[var(--color-success-bg)] px-2.5 py-1 rounded-full">
                  Save ₹{(product.originalPrice - product.price).toLocaleString('en-IN')} ({product.discount}% Off)
                </span>
              )}
            </div>

            {/* Vidhya's Detailed Styling Note */}
            <div className="p-4 rounded-[var(--radius-xl)] bg-[var(--color-snow)] border border-[var(--color-whisper)] relative">
              <div className="flex items-start gap-3">
                <span className="text-[var(--color-gold)] font-serif text-3xl leading-none">“</span>
                <div className="flex-1">
                  <p className="text-sm text-[var(--color-slate)] italic leading-relaxed">
                    {product.vidhyaNote}
                  </p>
                  <p className="mt-2 text-xs font-semibold text-[var(--color-ink)] not-italic uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-gold)]" />
                    Vidhya Sharma · Founder & Creative Director
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="mt-6 pt-5 border-t border-[var(--color-whisper)] flex flex-wrap items-center gap-3">
            <LinkButton variant="primary" size="lg" className="rounded-[var(--radius-full)] px-6" href={`/product/${product.slug || product.id}`}>
              View Product & Sizing
            </LinkButton>
            <Link
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[var(--radius-full)] border border-[var(--color-whisper)] text-xs font-medium text-[var(--color-ink)] hover:border-[var(--color-success)] hover:text-[var(--color-success)] hover:bg-[var(--color-success-bg)] transition-colors"
            >
              <SocialIcon platform="whatsapp" size="sm" className="w-4 h-4 text-[var(--color-success)]" />
              Chat with Vidhya About Fit
            </Link>
            <LinkButton variant="ghost" size="sm" href={`/shop/${product.category.toLowerCase()}`}>
              More in {product.category} →
            </LinkButton>
          </div>
        </div>
      </article>
    </StaggerItem>
  );
}

function VidhyasPicksContent() {
  const searchParams = useSearchParams();
  const monthParam = searchParams.get('month');

  const [activeMonthIndex, setActiveMonthIndex] = useState(0);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'discount'>('featured');
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [subscribedEmail, setSubscribedEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  // Sync month from URL query if provided
  useEffect(() => {
    if (monthParam) {
      const idx = monthlyEdits.findIndex(
        e => e.month.toLowerCase() === monthParam.toLowerCase() || e.slug === monthParam.toLowerCase()
      );
      if (idx !== -1) {
        setActiveMonthIndex(idx);
      }
    }
  }, [monthParam]);

  // Load wishlist from localStorage safely on client
  useEffect(() => {
    try {
      const saved = localStorage.getItem('angelika_wishlist');
      if (saved) {
        setWishlist(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
  }, []);

  const handleToggleWishlist = (id: string) => {
    setWishlist(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      try {
        localStorage.setItem('angelika_wishlist', JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (subscribedEmail && subscribedEmail.includes('@')) {
      setIsSubscribed(true);
    }
  };

  const currentEdit = monthlyEdits[activeMonthIndex] || monthlyEdits[0];

  // Filter products by category
  const filteredProducts = useMemo(() => {
    let list = currentEdit.products.map(p => ({
      ...p,
      month: currentEdit.month,
      theme: currentEdit.theme,
    }));

    if (activeCategory !== 'All') {
      list = list.filter(p => p.category.toLowerCase() === activeCategory.toLowerCase());
    }

    // Sort
    if (sortBy === 'price-asc') {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      list.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'discount') {
      list.sort((a, b) => b.discount - a.discount);
    }

    return list;
  }, [currentEdit, activeCategory, sortBy]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: currentEdit.products.length };
    currentEdit.products.forEach(p => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return counts;
  }, [currentEdit]);

  return (
    <div className="min-h-screen bg-[var(--color-white)] text-[var(--color-ink)]">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="bg-[var(--color-snow)] border-b border-[var(--color-whisper)] py-3">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <ol className="flex items-center space-x-2 text-xs text-[var(--color-slate)]">
            <li>
              <Link href="/" className="hover:text-[var(--color-gold)] transition-colors">
                Home
              </Link>
            </li>
            <li>
              <span className="text-[var(--color-mist)]">/</span>
            </li>
            <li>
              <Link href="/shop" className="hover:text-[var(--color-gold)] transition-colors">
                Curation
              </Link>
            </li>
            <li>
              <span className="text-[var(--color-mist)]">/</span>
            </li>
            <li className="font-semibold text-[var(--color-ink)]" aria-current="page">
              Vidhya's Picks
            </li>
          </ol>
        </div>
      </nav>

      {/* Luxury Editorial Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[var(--color-snow)] via-[var(--color-white)] to-[var(--color-snow)] border-b border-[var(--color-whisper)] py-16 md:py-24">
        {/* Subtle decorative background watermark */}
        <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 rounded-full bg-[var(--color-gold-light)]/30 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-96 h-96 rounded-full bg-[var(--color-gold)]/10 blur-3xl pointer-events-none" />

        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Column: Title & Manifesto */}
            <div className="lg:col-span-7">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[var(--color-gold-light)] text-[var(--color-gold)] text-xs font-bold uppercase tracking-widest rounded-full border border-[var(--color-gold)]/20 shadow-xs">
                    <span className="w-2 h-2 rounded-full bg-[var(--color-gold)] animate-pulse" />
                    FOUNDER'S CURATION
                  </span>
                  <span className="text-xs text-[var(--color-slate)] font-medium">
                    Updated Monthly
                  </span>
                </div>

                <h1 className="text-[var(--font-display)] text-4xl sm:text-5xl md:text-6xl font-medium text-[var(--color-ink)] leading-[1.1] mb-5 tracking-tight">
                  Vidhya's <span className="italic font-normal text-[var(--color-gold)]">Personal</span> Picks
                </h1>

                <p className="text-[var(--color-slate)] text-base sm:text-lg md:text-xl leading-relaxed mb-6 font-light max-w-2xl">
                  “Every piece in this edit is an authentic favorite from my own wardrobe. Hand-selected directly from master looms across Varanasi, Kutch, and Jaipur — chosen for effortless drape, pure natural fiber, and timeless elegance.”
                </p>

                {/* Curator Persona Card */}
                <div className="flex items-center gap-4 p-4 rounded-[var(--radius-xl)] bg-[var(--color-white)] border border-[var(--color-whisper)] shadow-sm max-w-xl mb-8">
                  <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-[var(--color-gold)] flex-shrink-0">
                    <Image
                      src="/images/avatar-vidhya.jpg"
                      alt="Designer Vidhya Sharma"
                      fill
                      className="object-cover"
                      sizes="56px"
                      priority
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[var(--color-ink)] leading-tight">
                      Vidhya Sharma
                    </p>
                    <p className="text-xs text-[var(--color-gold)] font-medium">
                      Founder & Creative Director · Angelika Fashions
                    </p>
                    <p className="text-xs text-[var(--color-slate)] truncate mt-0.5">
                      Curating pure handloom weaves since 2018
                    </p>
                  </div>
                  <Link
                    href="/about#vidhya"
                    className="text-xs font-semibold text-[var(--color-ink)] hover:text-[var(--color-gold)] transition-colors whitespace-nowrap hidden sm:inline-flex items-center gap-1"
                  >
                    Read Story →
                  </Link>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-4">
                  <MagneticButton variant="whatsapp" size="lg" strength={0.25} asChild>
                    <Link
                      href="https://wa.me/919876543210?text=Hi%20Vidhya,%20I%20would%20love%20personal%20styling%20advice%20for%20this%20month%27s%20picks"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2.5 shadow-sm"
                    >
                      <SocialIcon platform="whatsapp" size="sm" className="w-5 h-5 text-current" />
                      Consult Vidhya on WhatsApp
                    </Link>
                  </MagneticButton>

                  <MagneticButton variant="outline" size="lg" strength={0.25} asChild>
                    <Link href="/shop">Explore Full Catalog</Link>
                  </MagneticButton>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Cover Artwork & Stats */}
            <div className="lg:col-span-5">
              <div>
                <div className="relative rounded-[var(--radius-2xl)] overflow-hidden border border-[var(--color-whisper)] shadow-[var(--shadow-xl)] bg-[var(--color-white)]">
                  <div className="relative aspect-[4/3] sm:aspect-[16/11] w-full overflow-hidden bg-[var(--color-whisper)]">
                    <Image
                      src={currentEdit.coverImage}
                      alt={currentEdit.theme}
                      fill
                      className="object-cover transition-transform duration-700 hover:scale-105"
                      sizes="(max-width: 1024px) 100vw, 500px"
                      priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent pointer-events-none" />

                    <div className="absolute bottom-4 left-4 right-4 text-[var(--color-white)]">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-gold)] bg-[var(--color-ink)]/60 px-2.5 py-1 rounded-full backdrop-blur-sm">
                        CURRENT THEME EDIT
                      </span>
                      <h2 className="text-xl sm:text-2xl font-serif font-medium mt-1 text-[var(--color-white)]">
                        {currentEdit.theme}
                      </h2>
                      <p className="text-xs text-[var(--color-white)]/80 line-clamp-1 mt-0.5">
                        {currentEdit.subtitle}
                      </p>
                    </div>
                  </div>

                  {/* Curation Guarantee Badges */}
                  <div className="p-4 grid grid-cols-3 gap-2 text-center bg-[var(--color-snow)] border-t border-[var(--color-whisper)]">
                    <div>
                      <p className="text-base font-bold text-[var(--color-ink)]">100%</p>
                      <p className="text-[10px] font-medium text-[var(--color-slate)] uppercase tracking-wider">Natural Silk</p>
                    </div>
                    <div className="border-x border-[var(--color-whisper)]">
                      <p className="text-base font-bold text-[var(--color-gold)]">3 Master</p>
                      <p className="text-[10px] font-medium text-[var(--color-slate)] uppercase tracking-wider">Artisan Looms</p>
                    </div>
                    <div>
                      <p className="text-base font-bold text-[var(--color-ink)]">Limited</p>
                      <p className="text-[10px] font-medium text-[var(--color-slate)] uppercase tracking-wider">Bespoke Batches</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Monthly Timeline Selector Tabs */}
      <section className="sticky top-16 md:top-20 z-30 bg-[var(--color-white)]/95 backdrop-blur-md border-b border-[var(--color-whisper)] shadow-xs">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between gap-4 overflow-x-auto no-scrollbar">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-slate)] whitespace-nowrap hidden sm:inline-block">
              Select Edit:
            </span>

            <div className="flex items-center gap-2 flex-nowrap min-w-0">
              {monthlyEdits.map((edit, idx) => {
                const isActive = activeMonthIndex === idx;
                return (
                  <button
                    key={edit.month}
                    type="button"
                    onClick={() => {
                      setActiveMonthIndex(idx);
                      setActiveCategory('All');
                    }}
                    className={cn(
                      'px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 flex items-center gap-2 border',
                      isActive
                        ? 'bg-[var(--color-ink)] text-[var(--color-white)] border-[var(--color-ink)] shadow-sm'
                        : 'bg-[var(--color-snow)] text-[var(--color-slate)] border-[var(--color-whisper)] hover:border-[var(--color-gold)] hover:text-[var(--color-ink)]'
                    )}
                  >
                    <span>{edit.month}</span>
                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-gold)]" />
                    )}
                  </button>
                );
              })}
            </div>

            <span className="text-xs text-[var(--color-gold)] font-medium whitespace-nowrap hidden md:inline-block">
              Theme: {currentEdit.theme}
            </span>
          </div>
        </div>
      </section>

      {/* Current Month Story & Curatorial Statement */}
      <section className="py-10 bg-[var(--color-snow)] border-b border-[var(--color-whisper)]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal variant="fadeUp">
            <div className="p-6 md:p-10 rounded-[var(--radius-2xl)] bg-[var(--color-white)] border border-[var(--color-whisper)] shadow-xs relative overflow-hidden">
              <div className="max-w-4xl">
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <Badge variant="gold">
                    {currentEdit.month} THEME
                  </Badge>
                  <span className="text-xs text-[var(--color-slate)] font-medium">
                    Curated by Vidhya Sharma
                  </span>
                </div>

                <h2 className="text-[var(--font-display)] text-2xl md:text-3xl font-medium text-[var(--color-ink)] mb-3">
                  {currentEdit.theme}: <span className="text-[var(--color-slate)] font-normal text-xl md:text-2xl">{currentEdit.subtitle}</span>
                </h2>

                <p className="text-[var(--color-slate)] text-base md:text-lg leading-relaxed font-light mb-4">
                  {currentEdit.heroStory}
                </p>

                <div className="p-4 rounded-[var(--radius-xl)] bg-[var(--color-snow)] border-l-4 border-[var(--color-gold)] text-sm text-[var(--color-ink)] italic font-medium">
                  {currentEdit.curatorInsight}
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Curator Controls Bar: Category Filter, View Mode, Sorting */}
      <section className="py-6 bg-[var(--color-white)] border-b border-[var(--color-whisper)]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-[var(--color-slate)] uppercase tracking-wider mr-1">
                Category:
              </span>
              {CATEGORIES.map(cat => {
                const isActive = activeCategory === cat;
                const count = categoryCounts[cat] || 0;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActiveCategory(cat)}
                    className={cn(
                      'px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border flex items-center gap-1.5',
                      isActive
                        ? 'bg-[var(--color-gold)] text-[var(--color-ink)] border-[var(--color-gold)] font-semibold shadow-xs'
                        : 'bg-[var(--color-white)] text-[var(--color-slate)] border-[var(--color-whisper)] hover:border-[var(--color-gold)] hover:text-[var(--color-ink)]'
                    )}
                  >
                    <span>{cat}</span>
                    <span className={cn('text-[10px] px-1.5 py-0.2 rounded-full', isActive ? 'bg-[var(--color-ink)]/10 text-[var(--color-ink)]' : 'bg-[var(--color-whisper)] text-[var(--color-mist)]')}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Right Controls: Sort & View Mode */}
            <div className="flex items-center gap-3 self-end md:self-auto">
              {/* Sort Selector */}
              <div className="flex items-center gap-2">
                <label htmlFor="sort-select" className="text-xs font-medium text-[var(--color-slate)]">
                  Sort:
                </label>
                <select
                  id="sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="text-xs font-medium bg-[var(--color-snow)] border border-[var(--color-whisper)] rounded-lg px-3 py-1.5 text-[var(--color-ink)] focus:outline-none focus:ring-1 focus:ring-[var(--color-gold)] cursor-pointer"
                >
                  <option value="featured">Featured Picks</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="discount">Highest Discount</option>
                </select>
              </div>

              {/* View Mode Toggle Buttons */}
              <div className="flex items-center bg-[var(--color-snow)] p-1 rounded-lg border border-[var(--color-whisper)]" role="group" aria-label="View layout">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  aria-label="Grid view"
                  aria-pressed={viewMode === 'grid'}
                  className={cn(
                    'p-1.5 rounded-md transition-colors',
                    viewMode === 'grid'
                      ? 'bg-[var(--color-white)] text-[var(--color-gold)] shadow-xs'
                      : 'text-[var(--color-mist)] hover:text-[var(--color-ink)]'
                  )}
                  title="Grid View (3 Columns)"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <rect x="3" y="3" width="7" height="7" rx="1" />
                    <rect x="14" y="3" width="7" height="7" rx="1" />
                    <rect x="14" y="14" width="7" height="7" rx="1" />
                    <rect x="3" y="14" width="7" height="7" rx="1" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  aria-label="List view"
                  aria-pressed={viewMode === 'list'}
                  className={cn(
                    'p-1.5 rounded-md transition-colors',
                    viewMode === 'list'
                      ? 'bg-[var(--color-white)] text-[var(--color-gold)] shadow-xs'
                      : 'text-[var(--color-mist)] hover:text-[var(--color-ink)]'
                  )}
                  title="Editorial Detailed List View"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <line x1="8" y1="6" x2="21" y2="6" />
                    <line x1="8" y1="12" x2="21" y2="12" />
                    <line x1="8" y1="18" x2="21" y2="18" />
                    <line x1="3" y1="6" x2="3.01" y2="6" strokeWidth="3" />
                    <line x1="3" y1="12" x2="3.01" y2="12" strokeWidth="3" />
                    <line x1="3" y1="18" x2="3.01" y2="18" strokeWidth="3" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Products Grid & Showcase */}
      <section className="py-12 md:py-16 bg-[var(--color-white)]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-xs uppercase tracking-widest text-[var(--color-gold)] font-bold">
                {currentEdit.month} COLLECTION
              </p>
              <h3 className="text-[var(--font-display)] text-2xl md:text-3xl font-medium text-[var(--color-ink)]">
                Handpicked Pieces ({filteredProducts.length})
              </h3>
            </div>
            <p className="text-xs text-[var(--color-slate)] hidden sm:block">
              Click any piece for detailed craftsmanship & drape measurements
            </p>
          </div>

          {filteredProducts.length > 0 ? (
            viewMode === 'grid' ? (
              <StaggerGrid
                items={filteredProducts}
                columns={3}
                gap={24}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
                renderItem={(product, index) => (
                  <ProductCardGrid
                    key={product.id}
                    product={product}
                    index={index}
                    isWishlisted={wishlist.includes(product.id)}
                    onToggleWishlist={handleToggleWishlist}
                  />
                )}
              />
            ) : (
              <StaggerContainer variant="default" className="space-y-6">
                {filteredProducts.map((product, index) => (
                  <ProductCardList
                    key={product.id}
                    product={product}
                    index={index}
                    isWishlisted={wishlist.includes(product.id)}
                    onToggleWishlist={handleToggleWishlist}
                  />
                ))}
              </StaggerContainer>
            )
          ) : (
            <div className="text-center py-20 px-4 bg-[var(--color-snow)] rounded-[var(--radius-2xl)] border border-[var(--color-whisper)]">
              <span className="text-4xl mb-3 block">🪡</span>
              <h4 className="text-xl font-medium text-[var(--color-ink)] mb-2">
                No items match category &quot;{activeCategory}&quot; in this edit
              </h4>
              <p className="text-sm text-[var(--color-slate)] max-w-md mx-auto mb-6">
                Vidhya curates only 3–5 signature pieces per month to ensure uncompromised quality.
              </p>
              <MagneticButton
                variant="outline"
                size="md"
                onClick={() => setActiveCategory('All')}
              >
                View All {currentEdit.month} Pieces
              </MagneticButton>
            </div>
          )}
        </div>
      </section>

      {/* Why Vidhya Curates (Artisanal Values Strip) */}
      <section className="py-16 bg-[var(--color-snow)] border-y border-[var(--color-whisper)]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-[var(--color-gold)]">
              THE CURATION STANDARD
            </span>
            <h2 className="text-[var(--font-display)] text-3xl font-medium text-[var(--color-ink)] mt-2">
              Why Every Pick is Rare & Special
            </h2>
            <p className="text-sm text-[var(--color-slate)] mt-2">
              We reject mass manufacturing. Every piece in Vidhya&apos;s Picks meets four strict artisanal principles.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-[var(--radius-xl)] bg-[var(--color-white)] border border-[var(--color-whisper)] shadow-xs">
              <div className="w-12 h-12 rounded-full bg-[var(--color-gold-light)] text-[var(--color-gold)] flex items-center justify-center text-xl mb-4 font-serif">
                🪡
              </div>
              <h3 className="font-semibold text-base text-[var(--color-ink)] mb-1">
                Direct Loom Provenance
              </h3>
              <p className="text-xs text-[var(--color-slate)] leading-relaxed">
                Directly commissioned from master weavers in Varanasi, Chanderi, and Kutch with fair-wage artisan partnerships.
              </p>
            </div>

            <div className="p-6 rounded-[var(--radius-xl)] bg-[var(--color-white)] border border-[var(--color-whisper)] shadow-xs">
              <div className="w-12 h-12 rounded-full bg-[var(--color-gold-light)] text-[var(--color-gold)] flex items-center justify-center text-xl mb-4 font-serif">
                👗
              </div>
              <h3 className="font-semibold text-base text-[var(--color-ink)] mb-1">
                Wear-Tested Drapes
              </h3>
              <p className="text-xs text-[var(--color-slate)] leading-relaxed">
                Personally styled and fitted by Vidhya to guarantee all-day comfort, zero-scratch necklines, and effortless fall.
              </p>
            </div>

            <div className="p-6 rounded-[var(--radius-xl)] bg-[var(--color-white)] border border-[var(--color-whisper)] shadow-xs">
              <div className="w-12 h-12 rounded-full bg-[var(--color-gold-light)] text-[var(--color-gold)] flex items-center justify-center text-xl mb-4 font-serif">
                💎
              </div>
              <h3 className="font-semibold text-base text-[var(--color-ink)] mb-1">
                Micro-Batch Exclusivity
              </h3>
              <p className="text-xs text-[var(--color-slate)] leading-relaxed">
                Created in limited editions of only 20–50 units per weave to ensure your look remains singular and unique.
              </p>
            </div>

            <div className="p-6 rounded-[var(--radius-xl)] bg-[var(--color-white)] border border-[var(--color-whisper)] shadow-xs">
              <div className="w-12 h-12 rounded-full bg-[var(--color-gold-light)] text-[var(--color-gold)] flex items-center justify-center text-xl mb-4 font-serif">
                💬
              </div>
              <h3 className="font-semibold text-base text-[var(--color-ink)] mb-1">
                1-on-1 Concierge Styling
              </h3>
              <p className="text-xs text-[var(--color-slate)] leading-relaxed">
                Direct WhatsApp styling advice from Vidhya&apos;s personal team for drape options, blouse matching, and custom lengths.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Previous Months' Editions Archive */}
      <section className="py-16 bg-[var(--color-white)]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[var(--color-gold)]">
                CURATION ARCHIVE
              </span>
              <h2 className="text-[var(--font-display)] text-3xl font-medium text-[var(--color-ink)] mt-1">
                Explore Past Monthly Editions
              </h2>
              <p className="text-sm text-[var(--color-slate)] mt-1">
                Each month brings a distinct theme, fresh fabrics, and personal styling narratives.
              </p>
            </div>
            <LinkButton variant="outline" size="sm" href="/shop">
              Browse All Collections →
            </LinkButton>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {monthlyEdits.map((edit, idx) => {
              const isCurrent = activeMonthIndex === idx;
              return (
                <article
                  key={edit.month}
                  className={cn(
                    'p-6 rounded-[var(--radius-2xl)] border transition-all duration-300 flex flex-col justify-between',
                    isCurrent
                      ? 'bg-[var(--color-snow)] border-[var(--color-gold)] shadow-md ring-1 ring-[var(--color-gold)]/40'
                      : 'bg-[var(--color-white)] border-[var(--color-whisper)] hover:border-[var(--color-gold)] hover:shadow-lg'
                  )}
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="px-3 py-1 bg-[var(--color-gold-light)] text-[var(--color-gold)] text-xs font-bold rounded-full">
                        {edit.month}
                      </span>
                      {isCurrent && (
                        <span className="text-[10px] font-bold text-[var(--color-gold)] uppercase tracking-wider bg-[var(--color-gold-light)]/60 px-2 py-0.5 rounded-full">
                          Currently Viewing
                        </span>
                      )}
                    </div>

                    <h3 className="text-[var(--font-display)] text-xl font-medium text-[var(--color-ink)] mb-2">
                      {edit.theme}
                    </h3>
                    <p className="text-xs text-[var(--color-slate)] leading-relaxed mb-5 line-clamp-3">
                      {edit.note}
                    </p>

                    {/* Thumbnail previews with proper relative parent */}
                    <div className="flex items-center gap-3 mb-6">
                      {edit.products.slice(0, 3).map(p => (
                        <div
                          key={p.id}
                          className="relative w-16 h-20 rounded-[var(--radius-lg)] overflow-hidden bg-[var(--color-whisper)] border border-[var(--color-whisper)] flex-shrink-0"
                        >
                          <Image
                            src={p.image}
                            alt={p.name}
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        </div>
                      ))}
                      {edit.products.length > 3 && (
                        <div className="w-16 h-20 rounded-[var(--radius-lg)] bg-[var(--color-whisper)] flex items-center justify-center text-xs font-bold text-[var(--color-gold)]">
                          +{edit.products.length - 3}
                        </div>
                      )}
                    </div>
                  </div>

                  <MagneticButton
                    variant={isCurrent ? 'primary' : 'outline'}
                    size="sm"
                    className="w-full justify-center text-xs"
                    strength={0.2}
                    onClick={() => {
                      setActiveMonthIndex(idx);
                      setActiveCategory('All');
                      window.scrollTo({ top: 350, behavior: 'smooth' });
                    }}
                  >
                    {isCurrent ? 'Viewing This Edit' : `View ${edit.month} Edit`}
                  </MagneticButton>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Vidhya's Styling Concierge Desk Callout */}
      <section className="py-16 bg-[var(--color-snow)] border-t border-[var(--color-whisper)]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-[var(--radius-2xl)] bg-gradient-to-r from-[var(--color-charcoal)] to-[var(--color-ink)] text-[var(--color-white)] p-8 sm:p-12 md:p-16 relative overflow-hidden shadow-xl">
            <div className="max-w-2xl relative z-10">
              <span className="inline-block px-3 py-1 bg-[var(--color-gold)] text-[var(--color-ink)] text-xs font-bold uppercase tracking-widest rounded-full mb-4">
                COMPLIMENTARY CONCIERGE
              </span>
              <h2 className="text-[var(--font-display)] text-3xl sm:text-4xl md:text-5xl font-medium leading-tight mb-4">
                Unsure About Draping, Blouse Cuts, or Sizing?
              </h2>
              <p className="text-[var(--color-whisper)] text-sm sm:text-base leading-relaxed mb-8 opacity-90">
                Connect directly with designer Vidhya Sharma and our senior bridal styling desk. We provide drape video guides, bespoke size alterations, and fabric matching for your special occasion.
              </p>
              <div className="flex flex-wrap gap-4 items-center">
                <MagneticButton variant="whatsapp" size="lg" strength={0.3} asChild>
                  <Link
                    href="https://wa.me/919876543210?text=Hi%20Vidhya,%20I%20need%20styling%20advice%20for%20an%20upcoming%20event."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2.5"
                  >
                    <SocialIcon platform="whatsapp" size="sm" className="w-5 h-5 text-current" />
                    Chat With Concierge (+91 98765 43210)
                  </Link>
                </MagneticButton>
                <MagneticButton variant="outline" size="lg" strength={0.3} className="border-[var(--color-gold)] text-[var(--color-gold)] hover:bg-[var(--color-gold)] hover:text-[var(--color-ink)]" asChild>
                  <Link href="/size-finder">Open Interactive Size Guide</Link>
                </MagneticButton>
              </div>
            </div>

            {/* Decorative background monogram */}
            <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-10 pointer-events-none flex items-center justify-center font-serif text-[240px] text-[var(--color-gold)] select-none">
              A
            </div>
          </div>
        </div>
      </section>

      {/* VIP Early Access Newsletter Subscription */}
      <section className="py-16 bg-[var(--color-ink)] text-[var(--color-white)]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ScrollReveal variant="fadeUp">
            <span className="text-xs font-bold uppercase tracking-widest text-[var(--color-gold)]">
              PRIVATE PREVIEWS
            </span>
            <h2 className="text-[var(--font-display)] text-3xl sm:text-4xl font-medium mt-2 mb-4 text-[var(--color-white)]">
              Get Next Month&apos;s Edit 48 Hours Before Public Release
            </h2>
            <p className="text-[var(--color-whisper)] text-sm sm:text-base leading-relaxed mb-8 max-w-xl mx-auto opacity-80">
              Join Vidhya&apos;s Private Notes. Receive artisanal stories, limited edition early reservations, and personal drape masterclass videos.
            </p>

            {isSubscribed ? (
              <div className="p-4 rounded-[var(--radius-xl)] bg-[var(--color-gold)]/20 border border-[var(--color-gold)] text-[var(--color-gold-light)] max-w-md mx-auto flex items-center justify-center gap-2">
                <span className="text-lg">✓</span>
                <span className="text-sm font-medium">
                  Welcome to Vidhya&apos;s Private Circle. Check your inbox for your VIP welcome note!
                </span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  required
                  placeholder="Enter your email address"
                  value={subscribedEmail}
                  onChange={(e) => setSubscribedEmail(e.target.value)}
                  className="flex-1 px-4 py-3 rounded-full bg-[var(--color-charcoal)] border border-[var(--color-slate)] text-sm text-[var(--color-white)] placeholder-[var(--color-mist)] focus:outline-none focus:border-[var(--color-gold)]"
                />
                <button
                  type="submit"
                  className="px-6 py-3 rounded-full bg-[var(--color-gold)] text-[var(--color-ink)] text-sm font-bold uppercase tracking-wider hover:bg-[var(--color-gold-hover)] transition-colors shadow-sm"
                >
                  Join VIP List
                </button>
              </form>
            )}

            <p className="text-[11px] text-[var(--color-mist)] mt-4">
              Zero spam. Unsubscribe at any time. We respect your private styling journey.
            </p>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}

export default function VidhyasPicksPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[var(--color-white)] flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-3 border-[var(--color-gold)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm font-medium text-[var(--color-slate)]">Loading Vidhya&apos;s Curated Edits...</p>
          </div>
        </div>
      }
    >
      <VidhyasPicksContent />
    </Suspense>
  );
}
