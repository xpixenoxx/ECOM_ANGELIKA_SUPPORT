'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
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
        colorFamily: 'white',
        category: 'Sarees',
        fabric: 'Pure Mulberry Silk',
        origin: 'Varanasi Master Weavers',
        discount: 20,
        vidhyaNote: 'The saree I wore to my own housewarming. Drapes like an absolute dream and catches subtle morning light.',
        tags: ['saree', 'sarees', 'sari', 'silk', 'ivory', 'white', 'gold', 'varanasi'],
      },
      {
        id: 'vp-jan-2',
        slug: 'chiffon-anarkali-set',
        name: 'Chiffon Anarkali Set',
        price: 5499,
        originalPrice: 6899,
        image: '/images/vp-jan-2.jpg',
        color: 'Powder Blue',
        colorFamily: 'blue',
        category: 'Kurtis',
        fabric: 'Pure Viscose Chiffon',
        origin: 'Jaipur Hand-Dye Atelier',
        discount: 20,
        vidhyaNote: 'Twirl factor: 10/10. Designed with lightweight flare for all-day festive comfort without heaviness.',
        tags: ['kurti', 'kurtis', 'kurta', 'anarkali', 'blue', 'powder blue', 'chiffon', 'flared'],
      },
      {
        id: 'vp-jan-3',
        slug: 'silk-blend-palazzo-set',
        name: 'Silk Blend Palazzo Set',
        price: 3999,
        originalPrice: 4999,
        image: '/images/vp-jan-3.jpg',
        color: 'Sage Green',
        colorFamily: 'green',
        category: 'Salwars',
        fabric: 'Chanderi Silk Blend',
        origin: 'Chanderi Artisan Cluster',
        discount: 20,
        vidhyaNote: 'My personal go-to for gallery previews and client meetings. Polished, comfortable, and never wrinkles.',
        tags: ['salwar', 'salwars', 'suit', 'palazzo', 'green', 'sage', 'silk', 'workwear'],
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
        colorFamily: 'gold',
        category: 'Sarees',
        fabric: 'Handwoven Banarasi Tissue Zari',
        origin: 'Varanasi Heritage Looms',
        discount: 18,
        vidhyaNote: 'Tissue sarees are pure magic — they catch low ambient light and glow softly from within. A true heirloom piece.',
        tags: ['saree', 'sarees', 'sari', 'gold', 'tissue', 'champagne', 'banarasi', 'zari'],
      },
      {
        id: 'vp-dec-2',
        slug: 'mirror-work-lehenga',
        name: 'Mirror Work Festive Lehenga',
        price: 18999,
        originalPrice: 22999,
        image: '/images/vp-dec-2.jpg',
        color: 'Deep Crimson Red',
        colorFamily: 'red',
        category: 'Lehengas',
        fabric: 'Raw Silk & Fine Organza',
        origin: 'Kutch Artisanal Guild',
        discount: 17,
        vidhyaNote: 'Hand-embroidered mirrors by craftswomen in Kutch. Each mirror reflects light individually for an ethereal aura.',
        tags: ['lehenga', 'lehengas', 'red', 'crimson', 'mirror work', 'raw silk', 'wedding'],
      },
      {
        id: 'vp-dec-3',
        slug: 'velvet-kurti-set',
        name: 'Velvet Kurti Set with Cigarette Pants',
        price: 6999,
        originalPrice: 8499,
        image: '/images/vp-dec-3.jpg',
        color: 'Emerald Green',
        colorFamily: 'green',
        category: 'Kurtis',
        fabric: 'Plush Micro-Velvet & Zari',
        origin: 'Kashmir Tilla Artisans',
        discount: 17,
        vidhyaNote: 'Winter wedding dressing sorted. Deep emerald velvet that feels luxurious to touch without weighing you down.',
        tags: ['kurti', 'kurtis', 'velvet', 'green', 'emerald', 'zari', 'winter'],
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
        color: 'Rose Gold & Blush Pink',
        colorFamily: 'pink',
        category: 'Sarees',
        fabric: 'Silk Organza & Micro-Sequins',
        origin: 'Surat Silk Looms',
        discount: 18,
        vidhyaNote: 'Organza with subtle hand-placed micro-sequin work. Looks ethereal in natural daylight and photographs beautifully.',
        tags: ['saree', 'sarees', 'sari', 'pink', 'rose gold', 'organza', 'blush'],
      },
      {
        id: 'vp-nov-2',
        slug: 'sharara-set-navy',
        name: 'Lucknow Chikankari Sharara Set',
        price: 7499,
        originalPrice: 9299,
        image: '/images/vp-nov-2.jpg',
        color: 'Navy Blue',
        colorFamily: 'blue',
        category: 'Salwars',
        fabric: 'Flowing Georgette & Crepe',
        origin: 'Lucknow Chikankari Cluster',
        discount: 19,
        vidhyaNote: 'Shararas are the ultimate dance-floor companion. This flare moves with every step and never catches your heels.',
        tags: ['salwar', 'salwars', 'suit', 'sharara', 'blue', 'navy', 'georgette'],
      },
      {
        id: 'vp-nov-3',
        slug: 'gota-patti-kurta',
        name: 'Jaipur Gota Patti Festive Kurta',
        price: 4299,
        originalPrice: 5299,
        image: '/images/vp-nov-3.jpg',
        color: 'Mustard Yellow',
        colorFamily: 'yellow',
        category: 'Kurtis',
        fabric: 'Chanderi Cotton',
        origin: 'Jaipur Gota Craft Center',
        discount: 18,
        vidhyaNote: 'Authentic gota patti hand-stitched in Jaipur. Sunny enough for Haldi, dressy enough for an intimate Sangeet.',
        tags: ['kurti', 'kurtis', 'kurta', 'yellow', 'mustard', 'gota patti', 'cotton', 'haldi'],
      },
    ],
  },
];

// Additional signature picks representing all navbar categories (Kurtis, Salwars, Lehengas, Sarees, Dupattas)
const additionalPicks: PickProduct[] = [
  {
    id: 'na-1',
    slug: 'royal-crimson-zari-bridal-lehenga',
    name: 'Royal Crimson Zari Bridal Lehenga Set',
    price: 28999,
    originalPrice: 34999,
    image: '/images/collection-lehengas.jpg',
    color: 'Deep Crimson & Gold',
    colorFamily: 'red',
    category: 'Lehengas',
    fabric: 'Pure Silk & Zari',
    origin: 'Banaras Heritage Looms',
    discount: 17,
    vidhyaNote: 'Pure silk and antique gold zari embroidery. Designed for breathtaking bridal grandeur.',
    month: 'Curated Signature',
    theme: 'Bridal Regalia',
    tags: ['lehenga', 'lehengas', 'choli', 'bridal', 'crimson', 'red', 'gold', 'zari', 'wedding', 'silk'],
  },
  {
    id: 'na-6',
    slug: 'heritage-temple-kanjivaram-silk-saree',
    name: 'Heritage Temple Kanjivaram Silk Saree',
    price: 22499,
    originalPrice: 26999,
    image: '/images/collection-sarees.jpg',
    color: 'Royal Gold & Magenta',
    colorFamily: 'gold',
    category: 'Sarees',
    fabric: 'Pure Kanjivaram Silk',
    origin: 'Kanchipuram Master Looms',
    discount: 17,
    vidhyaNote: 'Woven on heirloom pit looms with pure gold zari temple borders. Authentic Silk Mark certified.',
    month: 'Curated Signature',
    theme: 'Heritage Weaves',
    tags: ['saree', 'sarees', 'sari', 'kanjivaram', 'silk', 'gold', 'temple', 'magenta', 'wedding'],
  },
  {
    id: 'na-7',
    slug: 'lucknowi-mukaish-chikankari-georgette-saree',
    name: 'Lucknowi Mukaish Chikankari Georgette Saree',
    price: 15499,
    originalPrice: 18999,
    image: '/images/cat-sarees.jpg',
    color: 'Pastel Peach Pink',
    colorFamily: 'pink',
    category: 'Sarees',
    fabric: 'Pure Georgette',
    origin: 'Lucknow Master Artisans',
    discount: 18,
    vidhyaNote: 'Delicate shadow needlework with metallic mukaish sparkles for a graceful evening drape.',
    month: 'Curated Signature',
    theme: 'Heritage Weaves',
    tags: ['saree', 'sarees', 'sari', 'chikankari', 'georgette', 'pink', 'peach', 'mukaish', 'pastel'],
  },
  {
    id: 'na-4',
    slug: 'hand-block-printed-chanderi-cotton-kurti',
    name: 'Hand-Block Printed Chanderi Cotton Kurti',
    price: 6499,
    originalPrice: 7999,
    image: '/images/collection-kurtis.jpg',
    color: 'Pastel Mint Green & Indigo',
    colorFamily: 'green',
    category: 'Kurtis',
    fabric: 'Chanderi Cotton',
    origin: 'Jaipur Block Print Looms',
    discount: 19,
    vidhyaNote: 'Crafted with natural azo-free dyes and hand-carved teak wood blocks. Perfect for summer brunches.',
    month: 'Curated Signature',
    theme: 'Artisanal Daily',
    tags: ['kurti', 'kurtis', 'kurta', 'green', 'mint', 'indigo', 'block print', 'chanderi', 'cotton'],
  },
  {
    id: 'kp-2',
    slug: 'pristine-white-shadow-work-lucknowi-kurti',
    name: 'Pristine White Shadow Work Lucknowi Kurti',
    price: 3999,
    originalPrice: 4799,
    image: '/images/cat-kurtis.jpg',
    color: 'Pristine White',
    colorFamily: 'white',
    category: 'Kurtis',
    fabric: 'Mulmul Muslin',
    origin: 'Lucknow Heritage Guild',
    discount: 17,
    vidhyaNote: 'Classic Bakhiya needlework on ultra-soft pure mulmul muslin. Clean, cooling, and understated.',
    month: 'Curated Signature',
    theme: 'Pure Whites',
    tags: ['kurti', 'kurtis', 'kurta', 'white', 'lucknowi', 'chikankari', 'mulmul', 'cotton', 'summer'],
  },
  {
    id: 'na-3',
    slug: 'banarasi-silk-brocade-palazzo-churidar-set',
    name: 'Banarasi Silk Brocade Palazzo & Churidar Set',
    price: 14499,
    originalPrice: 17999,
    image: '/images/collection-salwars.jpg',
    color: 'Emerald Green & Gold',
    colorFamily: 'green',
    category: 'Salwars',
    fabric: 'Pure Banarasi Brocade Silk',
    origin: 'Varanasi Master Looms',
    discount: 19,
    vidhyaNote: 'Opulent Banarasi brocade pants paired with an effortless raw silk kurta.',
    month: 'Curated Signature',
    theme: 'Festive Separates',
    tags: ['salwar', 'salwars', 'suit', 'brocade', 'green', 'emerald', 'gold', 'banarasi', 'palazzo', 'churidar'],
  },
  {
    id: 'na-8',
    slug: 'amritsari-hand-embroidered-phulkari-dupatta',
    name: 'Amritsari Hand-Embroidered Phulkari Dupatta',
    price: 3299,
    originalPrice: 3999,
    image: '/images/collection-dupattas.jpg',
    color: 'Ruby Red & Gold Multi',
    colorFamily: 'red',
    category: 'Dupattas',
    fabric: 'Chanderi Silk',
    origin: 'Amritsar Craft Cluster',
    discount: 18,
    vidhyaNote: 'Traditional geometric flower pattern embroidered by hand with vibrant floss silk threads.',
    month: 'Curated Signature',
    theme: 'Heirloom Stoles',
    tags: ['dupatta', 'dupattas', 'scarf', 'red', 'gold', 'phulkari', 'amritsari', 'silk', 'festive'],
  },
  {
    id: 'vp-dupatta-2',
    slug: 'banarasi-katan-silk-zari-dupatta',
    name: 'Banarasi Katan Silk Zari Dupatta',
    price: 4599,
    originalPrice: 5499,
    image: '/images/artisan-workshop.jpg',
    color: 'Deep Royal Blue & Gold',
    colorFamily: 'blue',
    category: 'Dupattas',
    fabric: 'Pure Katan Silk',
    origin: 'Varanasi Heritage Looms',
    discount: 16,
    vidhyaNote: 'Lustrous katan silk adorned with antique gold zari bootis along the scalloped pallu.',
    month: 'Curated Signature',
    theme: 'Heirloom Stoles',
    tags: ['dupatta', 'dupattas', 'scarf', 'blue', 'royal blue', 'gold', 'banarasi', 'katan silk', 'zari'],
  },
];

// Unified comprehensive pool of Vidhya's picks across all categories
const allPicks: PickProduct[] = [
  ...monthlyEdits.flatMap(edit =>
    edit.products.map(p => ({
      ...p,
      month: edit.month,
      theme: edit.theme,
    }))
  ),
  ...additionalPicks,
];

const CATEGORIES = ['All', 'Sarees', 'Kurtis', 'Salwars', 'Lehengas', 'Dupattas'] as const;

const COLOR_FILTERS = [
  { label: 'All Colors', value: 'All', bgHex: '#f4f4f5' },
  { label: 'Red & Crimson', value: 'red', bgHex: '#b91c1c' },
  { label: 'Green & Emerald', value: 'green', bgHex: '#047857' },
  { label: 'Blue & Navy', value: 'blue', bgHex: '#1d4ed8' },
  { label: 'Gold & Yellow', value: 'gold', bgHex: '#d97706' },
  { label: 'Pink & Rose', value: 'pink', bgHex: '#ec4899' },
  { label: 'White & Ivory', value: 'white', bgHex: '#f5f5f4' },
] as const;

function matchesColorFilter(productColor: string, colorFamily: string | undefined, filterVal: string): boolean {
  if (filterVal === 'All') return true;
  const col = productColor.toLowerCase();
  const fam = (colorFamily || '').toLowerCase();

  if (filterVal === 'red') {
    return fam === 'red' || col.includes('red') || col.includes('crimson') || col.includes('maroon') || col.includes('ruby');
  }
  if (filterVal === 'green') {
    return fam === 'green' || col.includes('green') || col.includes('emerald') || col.includes('sage') || col.includes('mint');
  }
  if (filterVal === 'blue') {
    return fam === 'blue' || col.includes('blue') || col.includes('navy') || col.includes('indigo') || col.includes('powder blue');
  }
  if (filterVal === 'gold') {
    return fam === 'gold' || fam === 'yellow' || col.includes('gold') || col.includes('yellow') || col.includes('mustard') || col.includes('champagne') || col.includes('zari');
  }
  if (filterVal === 'pink') {
    return fam === 'pink' || col.includes('pink') || col.includes('rose') || col.includes('peach') || col.includes('blush');
  }
  if (filterVal === 'white') {
    return fam === 'white' || col.includes('white') || col.includes('ivory') || col.includes('cream');
  }

  return col.includes(filterVal.toLowerCase());
}

function matchesSearchQuery(product: PickProduct, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;

  const name = product.name.toLowerCase();
  const cat = product.category.toLowerCase();
  const color = product.color.toLowerCase();
  const fabric = product.fabric.toLowerCase();
  const origin = (product.origin || '').toLowerCase();
  const note = (product.vidhyaNote || '').toLowerCase();
  const tags = (product.tags || []).join(' ').toLowerCase();

  // Direct substring check
  if (
    name.includes(q) ||
    cat.includes(q) ||
    color.includes(q) ||
    fabric.includes(q) ||
    origin.includes(q) ||
    note.includes(q) ||
    tags.includes(q)
  ) {
    return true;
  }

  // Type synonyms
  if ((q === 'saree' || q === 'sarees' || q === 'sari') && cat === 'sarees') return true;
  if ((q === 'lehenga' || q === 'lehengas' || q === 'choli' || q === 'bridal') && cat === 'lehengas') return true;
  if ((q === 'kurti' || q === 'kurtis' || q === 'kurta' || q === 'anarkali') && cat === 'kurtis') return true;
  if ((q === 'salwar' || q === 'salwars' || q === 'palazzo' || q === 'sharara' || q === 'suit') && cat === 'salwars') return true;
  if ((q === 'dupatta' || q === 'dupattas' || q === 'scarf' || q === 'phulkari') && cat === 'dupattas') return true;

  // Color synonyms
  if (['red', 'crimson', 'maroon', 'ruby'].includes(q) && matchesColorFilter(color, product.colorFamily, 'red')) return true;
  if (['green', 'emerald', 'sage', 'mint'].includes(q) && matchesColorFilter(color, product.colorFamily, 'green')) return true;
  if (['blue', 'navy', 'indigo', 'powder blue'].includes(q) && matchesColorFilter(color, product.colorFamily, 'blue')) return true;
  if (['gold', 'yellow', 'mustard', 'champagne', 'zari'].includes(q) && matchesColorFilter(color, product.colorFamily, 'gold')) return true;
  if (['pink', 'rose', 'peach', 'blush'].includes(q) && matchesColorFilter(color, product.colorFamily, 'pink')) return true;
  if (['white', 'ivory', 'cream'].includes(q) && matchesColorFilter(color, product.colorFamily, 'white')) return true;

  return false;
}

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
    `Hi Vidhya, I saw your curated pick "${product.name}" in ${product.color} (₹${product.price.toLocaleString()}) and would love personal drape advice on sizing and fabric.`
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
            <Badge variant="gold">Vidhya&apos;s Pick</Badge>
            {product.discount > 0 && (
              <Badge variant="outline" className="bg-[var(--color-white)]/95 text-[var(--color-ink)] border-[var(--color-whisper)]">
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

        {/* Content Details */}
        <div className="p-5 flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className="text-[11px] text-[var(--color-gold)] font-bold uppercase tracking-wider">
                {product.category}
              </span>
              <span className="text-[10px] text-stone-700 bg-stone-100 px-2 py-0.5 rounded-full border border-stone-200 font-semibold">
                {product.color}
              </span>
            </div>

            <h3 className="text-[var(--font-display)] text-lg font-medium text-[var(--color-ink)] line-clamp-1 group-hover:text-[var(--color-gold)] transition-colors">
              <Link href={`/product/${product.slug || product.id}`}>
                {product.name}
              </Link>
            </h3>

            <p className="text-xs text-[var(--color-slate)] mt-1 font-medium">
              Fabric: {product.fabric} · {product.origin}
            </p>

            <div className="mt-2.5 flex items-baseline gap-2">
              <span className="text-lg font-bold text-[var(--color-ink)]">
                ₹{product.price.toLocaleString()}
              </span>
              {product.originalPrice > product.price && (
                <span className="text-xs text-[var(--color-mist)] line-through">
                  ₹{product.originalPrice.toLocaleString()}
                </span>
              )}
            </div>

            {product.vidhyaNote && (
              <p className="text-xs text-[var(--color-slate)]/90 italic mt-3 pt-3 border-t border-[var(--color-whisper)] line-clamp-2">
                &ldquo;{product.vidhyaNote}&rdquo;
              </p>
            )}
          </div>

          <div className="mt-4 pt-3 flex items-center gap-2">
            <LinkButton
              variant="outline"
              size="sm"
              className="flex-1 rounded-[var(--radius-full)] text-xs justify-center"
              href={`/product/${product.slug || product.id}`}
            >
              View Piece
            </LinkButton>
            <Link
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Ask Vidhya about fit on WhatsApp"
              className="p-2 rounded-[var(--radius-full)] border border-[var(--color-whisper)] bg-[var(--color-white)] text-[var(--color-slate)] hover:text-[var(--color-success)] hover:border-[var(--color-success)] transition-all flex items-center justify-center flex-shrink-0"
              title="Ask Vidhya on WhatsApp"
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
    `Hi Vidhya, I saw your curated pick "${product.name}" in ${product.color} (₹${product.price.toLocaleString()}) and would love styling advice on sizing and fabric.`
  )}`;

  return (
    <StaggerItem key={product.id} variant="slide" style={{ transitionDelay: `${index * 0.05}s` }}>
      <article className="group relative bg-[var(--color-white)] border border-[var(--color-whisper)] rounded-[var(--radius-2xl)] overflow-hidden hover:shadow-[var(--shadow-xl)] hover:border-[var(--color-gold)]/40 transition-all duration-500 flex flex-col sm:flex-row items-stretch">
        {/* Product Image */}
        <div className="relative aspect-[3/4] sm:aspect-auto sm:w-72 md:w-80 flex-shrink-0 min-h-[260px] overflow-hidden bg-[var(--color-whisper)]">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, 320px"
            priority={index === 0}
          />
          <div className="absolute top-3.5 left-3.5 flex flex-wrap gap-2 z-10">
            <Badge variant="gold">Vidhya&apos;s Pick</Badge>
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
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs text-[var(--color-gold)] font-bold uppercase tracking-wider">
                {product.category} · {product.month || 'Curated Edit'}
              </span>
              <span className="text-xs font-semibold text-stone-700 bg-stone-100 px-3 py-1 rounded-full border border-stone-200">
                Color: {product.color}
              </span>
            </div>

            <div>
              <h3 className="text-[var(--font-display)] text-2xl md:text-3xl font-medium text-[var(--color-ink)] leading-snug">
                <Link href={`/product/${product.slug || product.id}`} className="hover:text-[var(--color-gold)] transition-colors">
                  {product.name}
                </Link>
              </h3>
              <p className="text-sm text-[var(--color-slate)] mt-1 font-medium">
                Fabric: {product.fabric} · Origin: {product.origin}
              </p>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-2xl font-bold text-[var(--color-ink)]">
                ₹{product.price.toLocaleString()}
              </span>
              {product.originalPrice > product.price && (
                <span className="text-sm text-[var(--color-mist)] line-through">
                  ₹{product.originalPrice.toLocaleString()}
                </span>
              )}
            </div>

            {product.vidhyaNote && (
              <div className="p-4 rounded-[var(--radius-xl)] bg-[var(--color-snow)] border-l-4 border-[var(--color-gold)] text-sm text-[var(--color-slate)] italic">
                &ldquo;{product.vidhyaNote}&rdquo;
              </div>
            )}
          </div>

          {/* Action Row */}
          <div className="mt-6 pt-5 border-t border-[var(--color-whisper)] flex flex-wrap items-center gap-3">
            <LinkButton variant="primary" size="md" className="rounded-[var(--radius-full)] px-6 text-xs" href={`/product/${product.slug || product.id}`}>
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
          </div>
        </div>
      </article>
    </StaggerItem>
  );
}

function VidhyasPicksContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read URL query params
  const urlSearch = searchParams.get('search') || searchParams.get('q') || '';
  const urlCategory = searchParams.get('category') || searchParams.get('type') || 'All';
  const urlColor = searchParams.get('color') || 'All';
  const monthParam = searchParams.get('month');

  const [searchQuery, setSearchQuery] = useState(urlSearch);
  const [activeMonthIndex, setActiveMonthIndex] = useState(0);
  const [activeCategory, setActiveCategory] = useState<string>(urlCategory);
  const [activeColor, setActiveColor] = useState<string>(urlColor);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'discount'>('featured');
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [subscribedEmail, setSubscribedEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  // Sync state if URL search query changes
  useEffect(() => {
    if (urlSearch !== searchQuery) {
      setSearchQuery(urlSearch);
    }
  }, [urlSearch]);

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

  const currentEdit: MonthlyEdit = (monthlyEdits[activeMonthIndex] || monthlyEdits[0]) as MonthlyEdit;

  // Are we currently searching or filtering across all picks?
  const isSearchOrFilterActive = Boolean(
    searchQuery.trim().length > 0 || activeCategory !== 'All' || activeColor !== 'All'
  );

  // Determine base list of products to consider:
  // If searching or filtering by color/category -> use allPicks across all categories
  // If just browsing a specific month edit without filters -> use currentEdit.products
  const baseProducts = useMemo(() => {
    if (isSearchOrFilterActive) {
      return allPicks;
    }
    return currentEdit.products.map(p => ({
      ...p,
      month: currentEdit.month,
      theme: currentEdit.theme,
    }));
  }, [isSearchOrFilterActive, currentEdit]);

  // Filter products by search query, category (type), and color
  const filteredProducts = useMemo(() => {
    let list = [...baseProducts];

    // Filter by Search Query
    if (searchQuery.trim().length > 0) {
      list = list.filter(p => matchesSearchQuery(p, searchQuery));
    }

    // Filter by Category / Type
    if (activeCategory !== 'All') {
      list = list.filter(p => p.category.toLowerCase() === activeCategory.toLowerCase());
    }

    // Filter by Color
    if (activeColor !== 'All') {
      list = list.filter(p => matchesColorFilter(p.color, p.colorFamily, activeColor));
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
  }, [baseProducts, searchQuery, activeCategory, activeColor, sortBy]);

  // Dynamic counts for category pills
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: allPicks.length };
    allPicks.forEach(p => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return counts;
  }, []);

  // Dynamic counts for color pills
  const colorCounts = useMemo(() => {
    const counts: Record<string, number> = { All: allPicks.length };
    COLOR_FILTERS.forEach(f => {
      if (f.value !== 'All') {
        counts[f.value] = allPicks.filter(p => matchesColorFilter(p.color, p.colorFamily, f.value)).length;
      }
    });
    return counts;
  }, []);

  const handleClearAllFilters = () => {
    setSearchQuery('');
    setActiveCategory('All');
    setActiveColor('All');
    router.replace('/vidhyas-picks');
  };

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
              Vidhya&apos;s Picks
            </li>
          </ol>
        </div>
      </nav>

      {/* Editorial Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[var(--color-snow)] via-[var(--color-white)] to-[var(--color-snow)] border-b border-[var(--color-whisper)] py-12 md:py-20">
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
                    FOUNDER&apos;S CURATION
                  </span>
                  <span className="text-xs text-[var(--color-slate)] font-medium">
                    Updated Monthly
                  </span>
                </div>

                <h1 className="text-[var(--font-display)] text-4xl sm:text-5xl md:text-6xl font-medium text-[var(--color-ink)] leading-[1.1] mb-5 tracking-tight">
                  Vidhya&apos;s <span className="italic font-normal text-[var(--color-gold)]">Personal</span> Picks
                </h1>

                <p className="text-[var(--color-slate)] text-base sm:text-lg leading-relaxed mb-6 font-light max-w-2xl">
                  &ldquo;Every piece in this edit is an authentic favorite from my own wardrobe. Hand-selected directly from master looms across Varanasi, Kutch, and Jaipur — chosen for effortless drape, pure natural fiber, and timeless elegance.&rdquo;
                </p>

                {/* Curator Persona Card */}
                <div className="flex items-center gap-4 p-4 rounded-[var(--radius-xl)] bg-[var(--color-white)] border border-[var(--color-whisper)] shadow-sm max-w-xl mb-6">
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
              </div>
            </div>

            {/* Right Column: Hero Cover Artwork */}
            <div className="lg:col-span-5">
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
                      FEATURED CURATION
                    </span>
                    <h2 className="text-xl sm:text-2xl font-serif font-medium mt-1 text-[var(--color-white)]">
                      {currentEdit.theme}
                    </h2>
                    <p className="text-xs text-[var(--color-white)]/80 line-clamp-1 mt-0.5">
                      {currentEdit.subtitle}
                    </p>
                  </div>
                </div>

                <div className="p-4 grid grid-cols-3 gap-2 text-center bg-[var(--color-snow)] border-t border-[var(--color-whisper)]">
                  <div>
                    <p className="text-base font-bold text-[var(--color-ink)]">100%</p>
                    <p className="text-[10px] font-medium text-[var(--color-slate)] uppercase tracking-wider">Natural Silk</p>
                  </div>
                  <div className="border-x border-[var(--color-whisper)]">
                    <p className="text-base font-bold text-[var(--color-gold)]">5 Categories</p>
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
      </section>

      {/* Flipkart-Style Interactive Search & Refinement Bar */}
      <section className="sticky top-16 md:top-20 z-30 bg-[var(--color-white)]/95 backdrop-blur-md border-b border-[var(--color-whisper)] shadow-xs">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-3.5 space-y-3">
          {/* Row 1: Search Input & Active Search State */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-xl">
              <svg
                className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-mist)] pointer-events-none"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              <input
                type="search"
                placeholder="Search Vidhya's picks by type (Lehenga, Saree) or color (Red, Green, Blue)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-10 pr-10 text-xs sm:text-sm bg-[var(--color-snow)] border border-[var(--color-whisper)] rounded-full focus:border-[var(--color-gold)] focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]/20 transition-all placeholder:text-[var(--color-mist)] [&::-webkit-search-cancel-button]:hidden"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[var(--color-mist)] hover:text-[var(--color-ink)]"
                  aria-label="Clear search text"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Active Filters Clear Button & Sort Control */}
            <div className="flex items-center gap-3 self-end sm:self-auto">
              {isSearchOrFilterActive && (
                <button
                  type="button"
                  onClick={handleClearAllFilters}
                  className="text-xs text-[var(--color-error)] hover:underline font-semibold flex items-center gap-1"
                >
                  Clear All Filters ✕
                </button>
              )}

              <div className="flex items-center gap-2">
                <label htmlFor="sort-select" className="text-xs font-medium text-[var(--color-slate)]">
                  Sort:
                </label>
                <select
                  id="sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="text-xs font-medium bg-[var(--color-snow)] border border-[var(--color-whisper)] rounded-lg px-2.5 py-1.5 text-[var(--color-ink)] focus:outline-none focus:ring-1 focus:ring-[var(--color-gold)] cursor-pointer"
                >
                  <option value="featured">Featured Picks</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="discount">Highest Discount</option>
                </select>
              </div>

              {/* View Layout Toggle */}
              <div className="flex items-center bg-[var(--color-snow)] p-1 rounded-lg border border-[var(--color-whisper)]">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  aria-label="Grid view"
                  className={cn(
                    'p-1.5 rounded-md transition-colors',
                    viewMode === 'grid' ? 'bg-[var(--color-white)] text-[var(--color-gold)] shadow-xs' : 'text-[var(--color-mist)] hover:text-[var(--color-ink)]'
                  )}
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
                  className={cn(
                    'p-1.5 rounded-md transition-colors',
                    viewMode === 'list' ? 'bg-[var(--color-white)] text-[var(--color-gold)] shadow-xs' : 'text-[var(--color-mist)] hover:text-[var(--color-ink)]'
                  )}
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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

          {/* Row 2: Category / Type Filter Pills (Flipkart Style) */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-slate)] whitespace-nowrap mr-1">
              Type:
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
                    'px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 border flex items-center gap-1.5 cursor-pointer',
                    isActive
                      ? 'bg-[var(--color-gold)] text-[var(--color-ink)] border-[var(--color-gold)] shadow-xs'
                      : 'bg-[var(--color-white)] text-[var(--color-slate)] border-[var(--color-whisper)] hover:border-[var(--color-gold)] hover:text-[var(--color-ink)]'
                  )}
                >
                  <span>{cat}</span>
                  <span className={cn('text-[10px] px-1.5 py-0.2 rounded-full font-bold', isActive ? 'bg-black/10 text-[var(--color-ink)]' : 'bg-[var(--color-whisper)] text-[var(--color-mist)]')}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Row 3: Color Filter Chips (Flipkart Style with color dot) */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-slate)] whitespace-nowrap mr-1">
              Color:
            </span>
            {COLOR_FILTERS.map(f => {
              const isActive = activeColor === f.value;
              const count = colorCounts[f.value] || 0;
              return (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => setActiveColor(f.value)}
                  className={cn(
                    'px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200 border flex items-center gap-1.5 cursor-pointer',
                    isActive
                      ? 'bg-[var(--color-ink)] text-white border-[var(--color-ink)] shadow-xs'
                      : 'bg-[var(--color-white)] text-[var(--color-slate)] border-[var(--color-whisper)] hover:border-[var(--color-gold)] hover:text-[var(--color-ink)]'
                  )}
                >
                  {f.value !== 'All' && (
                    <span
                      className="w-2.5 h-2.5 rounded-full border border-black/20 shrink-0"
                      style={{ backgroundColor: f.bgHex }}
                    />
                  )}
                  <span>{f.label}</span>
                  <span className={cn('text-[10px] px-1.5 py-0.2 rounded-full', isActive ? 'bg-white/20 text-white' : 'bg-[var(--color-whisper)] text-[var(--color-mist)]')}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Search Result Feedback Banner */}
      {searchQuery.trim().length > 0 && (
        <section className="bg-amber-50/60 border-b border-amber-200 py-3">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
            <p className="text-xs sm:text-sm font-medium text-amber-950">
              Showing <span className="font-bold">{filteredProducts.length}</span> pieces matching &ldquo;<span className="font-bold text-[var(--color-ink)]">{searchQuery}</span>&rdquo; in Vidhya&apos;s Picks
            </p>
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="text-xs font-bold uppercase tracking-wider text-amber-900 hover:text-black underline"
            >
              Clear Search
            </button>
          </div>
        </section>
      )}

      {/* Main Products Grid & Showcase */}
      <section className="py-10 md:py-14 bg-[var(--color-white)]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-xs uppercase tracking-widest text-[var(--color-gold)] font-bold">
                {isSearchOrFilterActive ? 'CURATED SEARCH RESULTS' : `${currentEdit.month} EDIT`}
              </p>
              <h3 className="text-[var(--font-display)] text-2xl md:text-3xl font-medium text-[var(--color-ink)]">
                Handpicked Pieces ({filteredProducts.length})
              </h3>
            </div>
            <p className="text-xs text-[var(--color-slate)] hidden sm:block">
              Click any piece for detailed craftsmanship, color notes & drape measurements
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
            // No Products Found State -> Show explicit message + Explore Vidhya's Picks
            <div className="py-12">
              <div className="p-8 sm:p-12 text-center bg-gradient-to-b from-amber-50/70 via-white to-white rounded-[var(--radius-2xl)] border border-[var(--color-whisper)] max-w-2xl mx-auto shadow-sm">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--color-gold-light)] flex items-center justify-center text-[var(--color-gold)] shadow-sm">
                  <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" />
                    <path d="M21 21l-4.35-4.35" />
                    <line x1="8" y1="11" x2="14" y2="11" />
                  </svg>
                </div>
                <h4 className="font-display text-2xl font-semibold text-[var(--color-ink)] mb-2">
                  the product you&apos;re searching for is not present
                </h4>
                <p className="text-sm text-[var(--color-slate)] max-w-md mx-auto mb-6 leading-relaxed">
                  We couldn&apos;t find any items matching &ldquo;{searchQuery || activeCategory}&rdquo; in our ethnic wear atelier. But explore Vidhya&apos;s signature picks below:
                </p>
                <button
                  type="button"
                  onClick={handleClearAllFilters}
                  className="py-2.5 px-6 rounded-full bg-[var(--color-gold)] text-[var(--color-ink)] text-xs font-bold uppercase tracking-wider hover:bg-[var(--color-gold-hover)] transition-all shadow-sm cursor-pointer"
                >
                  Clear Search & View All Vidhya&apos;s Picks
                </button>
              </div>

              {/* Curated Fallback Recommendations */}
              <div className="mt-14">
                <div className="flex items-center gap-2 mb-6">
                  <span className="text-amber-500 text-lg">✨</span>
                  <h3 className="text-xl font-medium text-[var(--color-ink)] font-display">
                    Explore Vidhya&apos;s Signature Recommendations
                  </h3>
                </div>
                <StaggerGrid
                  items={allPicks.slice(0, 6)}
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
              </div>
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
              const isCurrent = activeMonthIndex === idx && !isSearchOrFilterActive;
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
                      setActiveColor('All');
                      setSearchQuery('');
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
