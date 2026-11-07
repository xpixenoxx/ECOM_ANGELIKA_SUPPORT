'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils/cn';
import type {
  VidhyasPicksPageContent,
  VidhyasPicksMonthlyEdit,
  VidhyasPicksPageProduct,
  VidhyasPicksStandardItem,
} from '@/lib/actions/site-content-types';

function AdminFormField({
  label,
  value,
  onChange,
  placeholder = '',
  type = 'text',
  prefix,
  helperText,
  disabled = false,
  className = '',
}: {
  label: string;
  value?: string | number;
  onChange: (val: string) => void;
  placeholder?: string;
  type?: string;
  prefix?: string;
  helperText?: string;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <div className={cn('space-y-1', className)}>
      <label className="block text-xs font-semibold text-[var(--color-ink)] tracking-wide">
        {label}
      </label>
      <div className="relative flex items-center">
        {prefix && (
          <span className="absolute left-3 text-xs font-medium text-[var(--color-slate)] select-none pointer-events-none">
            {prefix}
          </span>
        )}
        <input
          type={type}
          disabled={disabled}
          value={value ?? ''}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            'w-full h-10 text-xs px-3 rounded-lg border border-[var(--color-whisper)] bg-[var(--color-white)] text-[var(--color-ink)] placeholder:text-[var(--color-mist)] focus:outline-none focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)] transition-colors',
            prefix && 'pl-7',
            disabled && 'opacity-60 cursor-not-allowed bg-[var(--color-snow)]'
          )}
        />
      </div>
      {helperText && (
        <p className="text-[10px] text-[var(--color-slate)] leading-tight">{helperText}</p>
      )}
    </div>
  );
}

function AdminTextArea({
  label,
  value,
  onChange,
  placeholder = '',
  rows = 3,
  helperText,
  disabled = false,
  className = '',
}: {
  label: string;
  value?: string;
  onChange: (val: string) => void;
  placeholder?: string;
  rows?: number;
  helperText?: string;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <div className={cn('space-y-1', className)}>
      <label className="block text-xs font-semibold text-[var(--color-ink)] tracking-wide">
        {label}
      </label>
      <textarea
        rows={rows}
        disabled={disabled}
        value={value ?? ''}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          'w-full text-xs p-3 rounded-lg border border-[var(--color-whisper)] bg-[var(--color-white)] text-[var(--color-ink)] placeholder:text-[var(--color-mist)] focus:outline-none focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)] transition-colors resize-y',
          disabled && 'opacity-60 cursor-not-allowed bg-[var(--color-snow)]'
        )}
      />
      {helperText && (
        <p className="text-[10px] text-[var(--color-slate)] leading-tight">{helperText}</p>
      )}
    </div>
  );
}

const DEFAULT_PAGE_DATA: VidhyasPicksPageContent = {
  header: {
    eyebrowBadge: "FOUNDER'S CURATION",
    badgeSubtitle: 'Updated Monthly',
    title: "Vidhya's Personal Picks",
    titleHighlight: 'Personal',
    description:
      '“Every piece in this edit is an authentic favorite from my own wardrobe. Hand-selected directly from master looms across Varanasi, Kutch, and Jaipur — chosen for effortless drape, pure natural fiber, and timeless elegance.”',
    founder: {
      name: 'Vidhya Sharma',
      role: 'Founder & Creative Director · Angelika Fashions',
      experience: 'Curating pure handloom weaves since 2018',
      avatar: '/images/about/vidhya-profile.jpg',
      storyLinkText: 'Read Story →',
      storyLinkHref: '/about/vidhya',
    },
    featuredStats: {
      stat1Value: '100%',
      stat1Label: 'Natural Silk',
      stat2Value: '5 Categories',
      stat2Label: 'Artisan Looms',
      stat3Value: 'Limited',
      stat3Label: 'Bespoke Batches',
    },
  },
  curationStandards: {
    eyebrow: 'THE CURATION STANDARD',
    title: 'Why Every Pick is Rare & Special',
    subtitle:
      'We reject mass manufacturing. Every piece in Vidhya’s Picks meets four strict artisanal principles.',
    items: [
      {
        icon: '🪡',
        title: 'Direct Loom Provenance',
        description:
          'Directly commissioned from master weavers in Varanasi, Chanderi, and Kutch with fair-wage artisan partnerships.',
      },
      {
        icon: '👗',
        title: 'Wear-Tested Drapes',
        description:
          'Personally styled and fitted by Vidhya to guarantee all-day comfort, zero-scratch necklines, and effortless fall.',
      },
      {
        icon: '💎',
        title: 'Micro-Batch Exclusivity',
        description:
          'Created in limited editions of only 20–50 units per weave to ensure your look remains singular and unique.',
      },
      {
        icon: '💬',
        title: '1-on-1 Concierge Styling',
        description:
          'Direct WhatsApp styling advice from Vidhya’s personal team for drape options, blouse matching, and custom lengths.',
      },
    ],
  },
  archive: {
    eyebrow: 'CURATION ARCHIVE',
    title: 'Explore Past Monthly Editions',
    subtitle:
      'Each month brings a distinct theme, fresh fabrics, and personal styling narratives.',
    ctaText: 'Browse All Collections →',
    ctaHref: '/shop',
  },
  concierge: {
    badge: 'COMPLIMENTARY CONCIERGE',
    title: 'Unsure About Draping, Blouse Cuts, or Sizing?',
    description:
      'Connect directly with designer Vidhya Sharma and our senior bridal styling desk. We provide drape video guides, bespoke size alterations, and fabric matching for your special occasion.',
    whatsappNumber: '+91 98765 43210',
    whatsappUrl:
      'https://wa.me/919876543210?text=Hi%20Vidhya,%20I%20need%20styling%20advice%20for%20an%20upcoming%20event.',
    sizeGuideText: 'Open Interactive Size Guide',
    sizeGuideHref: '/size-finder',
  },
  newsletter: {
    eyebrow: 'PRIVATE PREVIEWS',
    title: "Get Next Month's Edit 48 Hours Before Public Release",
    description:
      'Join Vidhya’s Private Notes. Receive artisanal stories, limited edition early reservations, and personal drape masterclass videos.',
    buttonText: 'Join VIP List',
    disclaimer: 'Zero spam. Unsubscribe at any time. We respect your private styling journey.',
  },
  monthlyEdits: [
    {
      month: 'January 2026',
      slug: 'january-2026',
      theme: 'New Beginnings in Silk',
      subtitle: 'Lustrous Mulberry Silks & Airy Chiffons for the Fresh Season',
      note: 'Starting the year with the fabrics that feel like fresh starts — lightweight silks, soft chiffons, and the kind of pieces that make you feel ready for anything.',
      coverImage: '/images/vp-jan-1.jpg',
      heroStory:
        'As the light shifts into the new year, this edit celebrates purity of form and effortless movement. We sourced unadulterated mulberry silks from Varanasi weavers and featherlight chiffons crafted for fluid draping from morning rituals to evening soirées.',
      curatorInsight:
        '“When silk drapes true to your natural posture, you never have to adjust it twice. That ease is what luxury really means.” — Vidhya',
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
          vidhyaNote:
            'The saree I wore to my own housewarming. Drapes like an absolute dream and catches subtle morning light.',
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
          vidhyaNote:
            'Twirl factor: 10/10. Designed with lightweight flare for all-day festive comfort without heaviness.',
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
          vidhyaNote:
            'My personal go-to for gallery previews and client meetings. Polished, comfortable, and never wrinkles.',
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
      heroStory:
        'December in Indian tradition is a tapestry of weddings, celebrations, and winter galas. For this edit, we partnered with Kutch mirror artisans and Banaras master weavers to create festive pieces that radiate warmth.',
      curatorInsight:
        '“Real zari never glares loudly; it glows warmly from within like candlelight.” — Vidhya',
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
          vidhyaNote:
            'Tissue sarees are pure magic — they catch low ambient light and glow softly from within. A true heirloom piece.',
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
          vidhyaNote:
            'Hand-embroidered mirrors by craftswomen in Kutch. Each mirror reflects light individually for an ethereal aura.',
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
          vidhyaNote:
            'Winter wedding dressing sorted. Deep emerald velvet that feels luxurious to touch without weighing you down.',
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
      heroStory:
        'Wedding guest fashion often forces a choice between grandeur and ease. This edit was conceived to eradicate that compromise with airy organzas and featherlight shararas.',
      curatorInsight:
        '“The best wedding outfits are the ones where you forget you are wearing couture and just dance.” — Vidhya',
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
          vidhyaNote:
            'Organza with subtle hand-placed micro-sequin work. Looks ethereal in natural daylight and photographs beautifully.',
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
          vidhyaNote:
            'Shararas are the ultimate dance-floor companion. This flare moves with every step and never catches your heels.',
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
          vidhyaNote:
            'Authentic gota patti hand-stitched in Jaipur. Sunny enough for Haldi, dressy enough for an intimate Sangeet.',
          tags: ['kurti', 'kurtis', 'kurta', 'yellow', 'mustard', 'gota patti', 'cotton', 'haldi'],
        },
      ],
    },
  ],
  additionalPicks: [
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
  ],
  seo: {
    metaTitle: "Vidhya's Picks | Founder's Curated Handloom Ethnic Wear | Angelika",
    metaDescription:
      "Explore Vidhya's personal curation of handwoven sarees, artisanal kurtis, festive lehengas, and elegant salwars direct from master looms.",
  },
};

type TabKey = 'header' | 'edits' | 'standards' | 'archive' | 'concierge' | 'newsletter' | 'seo';

export function VidhyasPicksPageEditor({
  onCancel,
  onSaved,
}: {
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [formData, setFormData] = useState<VidhyasPicksPageContent>(DEFAULT_PAGE_DATA);
  const [activeTab, setActiveTab] = useState<TabKey>('header');
  const [selectedEditIndex, setSelectedEditIndex] = useState<number>(0);
  const [selectedProductIndex, setSelectedProductIndex] = useState<number>(0);
  const [editingAdditionalPicks, setEditingAdditionalPicks] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Load existing content from api
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const res = await fetch('/api/admin/content');
        if (res.ok) {
          const json = await res.json();
          if (json.content && json.content['vidhyas-picks-page'] && isMounted) {
            const raw = json.content['vidhyas-picks-page'];
            setFormData({
              header: {
                ...DEFAULT_PAGE_DATA.header,
                ...(raw.header || {}),
                founder: {
                  ...DEFAULT_PAGE_DATA.header.founder,
                  ...(raw.header?.founder || {}),
                },
                featuredStats: {
                  ...DEFAULT_PAGE_DATA.header.featuredStats,
                  ...(raw.header?.featuredStats || {}),
                },
              },
              curationStandards: {
                ...DEFAULT_PAGE_DATA.curationStandards,
                ...(raw.curationStandards || {}),
                items:
                  Array.isArray(raw.curationStandards?.items) && raw.curationStandards.items.length > 0
                    ? raw.curationStandards.items
                    : DEFAULT_PAGE_DATA.curationStandards.items,
              },
              archive: {
                ...DEFAULT_PAGE_DATA.archive,
                ...(raw.archive || {}),
              },
              concierge: {
                ...DEFAULT_PAGE_DATA.concierge,
                ...(raw.concierge || {}),
              },
              newsletter: {
                ...DEFAULT_PAGE_DATA.newsletter,
                ...(raw.newsletter || {}),
              },
              monthlyEdits:
                Array.isArray(raw.monthlyEdits) && raw.monthlyEdits.length > 0
                  ? raw.monthlyEdits
                  : DEFAULT_PAGE_DATA.monthlyEdits,
              additionalPicks:
                Array.isArray(raw.additionalPicks) && raw.additionalPicks.length > 0
                  ? raw.additionalPicks
                  : DEFAULT_PAGE_DATA.additionalPicks,
              seo: {
                ...DEFAULT_PAGE_DATA.seo,
                ...(raw.seo || {}),
              },
            });
          }
        }
      } catch (err) {
        console.error('Failed to load vidhyas-picks-page content:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setStatusMessage(null);
    try {
      const res = await fetch('/api/admin/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sectionId: 'vidhyas-picks-page',
          data: formData,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMessage({
          type: 'success',
          text: "Vidhya's Picks page updated successfully! Your updates are now live on /vidhyas-picks.",
        });
        onSaved();
      } else {
        setStatusMessage({
          type: 'error',
          text: data.error || "Failed to save Vidhya's Picks content.",
        });
      }
    } catch {
      setStatusMessage({
        type: 'error',
        text: 'An unexpected network error occurred while saving.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetDefaults = () => {
    if (confirm("Reset Vidhya's Picks page to factory defaults? Any unsaved edits will be discarded.")) {
      setFormData(DEFAULT_PAGE_DATA);
      setStatusMessage({
        type: 'success',
        text: 'Content restored to factory defaults. Click "Save Changes" to publish.',
      });
    }
  };

  // Helper to update current monthly edit
  const updateCurrentEdit = (updater: (edit: VidhyasPicksMonthlyEdit) => VidhyasPicksMonthlyEdit) => {
    setFormData((prev) => {
      const nextEdits = [...prev.monthlyEdits];
      const target = nextEdits[selectedEditIndex];
      if (target) {
        nextEdits[selectedEditIndex] = updater(target);
      }
      return { ...prev, monthlyEdits: nextEdits };
    });
  };

  // Helper to update a product in current monthly edit
  const updateCurrentEditProduct = (prodIdx: number, updater: (prod: VidhyasPicksPageProduct) => VidhyasPicksPageProduct) => {
    updateCurrentEdit((edit) => {
      const nextProds = [...edit.products];
      const target = nextProds[prodIdx];
      if (target) {
        nextProds[prodIdx] = updater(target);
      }
      return { ...edit, products: nextProds };
    });
  };

  // Helper to add product to current monthly edit
  const addProductToCurrentEdit = () => {
    updateCurrentEdit((edit) => {
      const newProduct: VidhyasPicksPageProduct = {
        id: `vp-${Date.now()}`,
        slug: `new-curation-piece-${Date.now()}`,
        name: 'New Handloom Curation Piece',
        price: 4999,
        originalPrice: 5999,
        discount: 17,
        image: '/images/vp-jan-1.jpg',
        color: 'Ivory & Gold',
        colorFamily: 'white',
        category: 'Sarees',
        fabric: 'Pure Mulberry Silk',
        origin: 'Varanasi Master Weavers',
        vidhyaNote: "Personally curated for effortless drape and luxurious handloom feel.",
        tags: ['saree', 'silk', 'handloom', 'curated'],
      };
      return { ...edit, products: [...edit.products, newProduct] };
    });
  };

  // Helper to remove product from current monthly edit
  const removeProductFromCurrentEdit = (prodIdx: number) => {
    updateCurrentEdit((edit) => {
      return { ...edit, products: edit.products.filter((_, i) => i !== prodIdx) };
    });
    setSelectedProductIndex(0);
  };

  // Helper for additional signature picks
  const updateAdditionalPick = (prodIdx: number, updater: (prod: VidhyasPicksPageProduct) => VidhyasPicksPageProduct) => {
    setFormData((prev) => {
      const nextPicks = [...prev.additionalPicks];
      const target = nextPicks[prodIdx];
      if (target) {
        nextPicks[prodIdx] = updater(target);
      }
      return { ...prev, additionalPicks: nextPicks };
    });
  };

  // Helper to update curation standard item
  const updateStandardItem = (index: number, updater: (item: VidhyasPicksStandardItem) => VidhyasPicksStandardItem) => {
    setFormData((prev) => {
      const nextItems = [...prev.curationStandards.items];
      const target = nextItems[index];
      if (target) {
        nextItems[index] = updater(target);
      }
      return {
        ...prev,
        curationStandards: { ...prev.curationStandards, items: nextItems },
      };
    });
  };

  const currentEdit = formData.monthlyEdits[selectedEditIndex] || formData.monthlyEdits[0];
  const activeProducts = editingAdditionalPicks ? formData.additionalPicks : (currentEdit?.products || []);
  const currentProduct = activeProducts[selectedProductIndex] || activeProducts[0];

  if (isLoading) {
    return (
      <div className="p-8 text-center text-xs text-[var(--color-slate)]">
        <div className="w-8 h-8 border-2 border-[var(--color-gold)] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        Loading Vidhya&apos;s Picks Editor...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[var(--color-whisper)]">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="gold" size="sm">
              STANDALONE PAGE
            </Badge>
            <span className="text-[10px] text-[var(--color-slate)] font-mono">/vidhyas-picks</span>
          </div>
          <h2 className="text-lg font-serif font-bold text-[var(--color-ink)] mt-1">
            Vidhya&apos;s Picks Page Editor
          </h2>
          <p className="text-xs text-[var(--color-slate)]">
            Full zero-code management of Vidhya&apos;s personal curation, monthly capsules, product notes, and styling concierge.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href="/vidhyas-picks"
            target="_blank"
            className="text-xs text-[var(--color-gold)] hover:underline font-medium px-3 py-1.5 border border-[var(--color-gold)]/30 rounded-lg bg-[var(--color-gold-light)]/20 transition-colors inline-flex items-center gap-1"
          >
            <span>View Live Page</span>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </Link>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onCancel}
            className="text-xs"
          >
            Close
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleResetDefaults}
            className="text-xs text-[var(--color-slate)] hover:text-[var(--color-ink)]"
          >
            Reset Defaults
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            disabled={isSaving}
            onClick={handleSave}
            className="text-xs bg-[var(--color-gold)] hover:bg-[#967637] text-white font-medium px-4 shadow-sm"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Status Alert */}
      {statusMessage && (
        <div
          className={cn(
            'p-3 rounded-lg text-xs font-medium flex items-center justify-between border',
            statusMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          )}
        >
          <span>{statusMessage.text}</span>
          <button
            type="button"
            onClick={() => setStatusMessage(null)}
            className="text-xs opacity-60 hover:opacity-100"
          >
            ✕
          </button>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex border-b border-[var(--color-whisper)] overflow-x-auto gap-1 pb-1">
        {[
          { key: 'header', label: '1. Header & Hero' },
          { key: 'edits', label: '2. Monthly Edits & Products' },
          { key: 'standards', label: '3. Curation Standards' },
          { key: 'archive', label: '4. Archive Section' },
          { key: 'concierge', label: '5. Concierge Callout' },
          { key: 'newsletter', label: '6. VIP Note & Previews' },
          { key: 'seo', label: '7. SEO & Metadata' },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key as TabKey)}
            className={cn(
              'px-3.5 py-2 text-xs font-medium rounded-t-lg transition-colors whitespace-nowrap',
              activeTab === tab.key
                ? 'bg-[var(--color-gold-light)]/40 text-[var(--color-ink)] border-b-2 border-[var(--color-gold)] font-semibold'
                : 'text-[var(--color-slate)] hover:text-[var(--color-ink)] hover:bg-[var(--color-snow)]'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: HEADER & HERO */}
      {activeTab === 'header' && (
        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-[var(--color-snow)] border border-[var(--color-whisper)] space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-gold)]">
              Hero Section Typography & Badges
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AdminFormField
                label="Eyebrow Badge"
                value={formData.header.eyebrowBadge}
                onChange={(val) =>
                  setFormData((prev) => ({
                    ...prev,
                    header: { ...prev.header, eyebrowBadge: val },
                  }))
                }
                placeholder="FOUNDER'S CURATION"
              />
              <AdminFormField
                label="Badge Subtitle"
                value={formData.header.badgeSubtitle}
                onChange={(val) =>
                  setFormData((prev) => ({
                    ...prev,
                    header: { ...prev.header, badgeSubtitle: val },
                  }))
                }
                placeholder="Updated Monthly"
              />
              <AdminFormField
                label="Main Title"
                value={formData.header.title}
                onChange={(val) =>
                  setFormData((prev) => ({
                    ...prev,
                    header: { ...prev.header, title: val },
                  }))
                }
                placeholder="Vidhya's Personal Picks"
              />
              <AdminFormField
                label="Highlighted Word in Title"
                value={formData.header.titleHighlight}
                onChange={(val) =>
                  setFormData((prev) => ({
                    ...prev,
                    header: { ...prev.header, titleHighlight: val },
                  }))
                }
                placeholder="Personal"
                helperText="Will render in italic gold serif typeface"
              />
            </div>

            <AdminTextArea
              label="Description Quote"
              rows={3}
              value={formData.header.description}
              onChange={(val) =>
                setFormData((prev) => ({
                  ...prev,
                  header: { ...prev.header, description: val },
                }))
              }
              placeholder="Every piece in this edit is an authentic favorite from my own wardrobe..."
            />
          </div>

          {/* Founder Profile Card */}
          <div className="p-4 rounded-xl bg-[var(--color-snow)] border border-[var(--color-whisper)] space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-gold)]">
              Founder Profile Card (Left Column)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AdminFormField
                label="Founder Name"
                value={formData.header.founder.name}
                onChange={(val) =>
                  setFormData((prev) => ({
                    ...prev,
                    header: {
                      ...prev.header,
                      founder: { ...prev.header.founder, name: val },
                    },
                  }))
                }
                placeholder="Vidhya Sharma"
              />
              <AdminFormField
                label="Founder Role & Brand"
                value={formData.header.founder.role}
                onChange={(val) =>
                  setFormData((prev) => ({
                    ...prev,
                    header: {
                      ...prev.header,
                      founder: { ...prev.header.founder, role: val },
                    },
                  }))
                }
                placeholder="Founder & Creative Director · Angelika Fashions"
              />
              <AdminFormField
                label="Experience / Bio Note"
                value={formData.header.founder.experience}
                onChange={(val) =>
                  setFormData((prev) => ({
                    ...prev,
                    header: {
                      ...prev.header,
                      founder: { ...prev.header.founder, experience: val },
                    },
                  }))
                }
                placeholder="Curating pure handloom weaves since 2018"
              />
              <AdminFormField
                label="Avatar Image Path"
                value={formData.header.founder.avatar}
                onChange={(val) =>
                  setFormData((prev) => ({
                    ...prev,
                    header: {
                      ...prev.header,
                      founder: { ...prev.header.founder, avatar: val },
                    },
                  }))
                }
                placeholder="/images/about/vidhya-profile.jpg"
              />
              <AdminFormField
                label="Link Button Text"
                value={formData.header.founder.storyLinkText}
                onChange={(val) =>
                  setFormData((prev) => ({
                    ...prev,
                    header: {
                      ...prev.header,
                      founder: { ...prev.header.founder, storyLinkText: val },
                    },
                  }))
                }
                placeholder="Read Story →"
              />
              <AdminFormField
                label="Link Target URL"
                value={formData.header.founder.storyLinkHref}
                onChange={(val) =>
                  setFormData((prev) => ({
                    ...prev,
                    header: {
                      ...prev.header,
                      founder: { ...prev.header.founder, storyLinkHref: val },
                    },
                  }))
                }
                placeholder="/about/vidhya"
              />
            </div>
          </div>

          {/* Featured Stats Bar (Right Column Card Bottom) */}
          <div className="p-4 rounded-xl bg-[var(--color-snow)] border border-[var(--color-whisper)] space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-gold)]">
              Featured Card Bottom Stats (3 Pillars)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2 p-3 bg-white rounded-lg border border-[var(--color-whisper)]">
                <AdminFormField
                  label="Stat 1 Value"
                  value={formData.header.featuredStats.stat1Value}
                  onChange={(val) =>
                    setFormData((prev) => ({
                      ...prev,
                      header: {
                        ...prev.header,
                        featuredStats: { ...prev.header.featuredStats, stat1Value: val },
                      },
                    }))
                  }
                  placeholder="100%"
                />
                <AdminFormField
                  label="Stat 1 Label"
                  value={formData.header.featuredStats.stat1Label}
                  onChange={(val) =>
                    setFormData((prev) => ({
                      ...prev,
                      header: {
                        ...prev.header,
                        featuredStats: { ...prev.header.featuredStats, stat1Label: val },
                      },
                    }))
                  }
                  placeholder="Natural Silk"
                />
              </div>

              <div className="space-y-2 p-3 bg-white rounded-lg border border-[var(--color-whisper)]">
                <AdminFormField
                  label="Stat 2 Value"
                  value={formData.header.featuredStats.stat2Value}
                  onChange={(val) =>
                    setFormData((prev) => ({
                      ...prev,
                      header: {
                        ...prev.header,
                        featuredStats: { ...prev.header.featuredStats, stat2Value: val },
                      },
                    }))
                  }
                  placeholder="5 Categories"
                />
                <AdminFormField
                  label="Stat 2 Label"
                  value={formData.header.featuredStats.stat2Label}
                  onChange={(val) =>
                    setFormData((prev) => ({
                      ...prev,
                      header: {
                        ...prev.header,
                        featuredStats: { ...prev.header.featuredStats, stat2Label: val },
                      },
                    }))
                  }
                  placeholder="Artisan Looms"
                />
              </div>

              <div className="space-y-2 p-3 bg-white rounded-lg border border-[var(--color-whisper)]">
                <AdminFormField
                  label="Stat 3 Value"
                  value={formData.header.featuredStats.stat3Value}
                  onChange={(val) =>
                    setFormData((prev) => ({
                      ...prev,
                      header: {
                        ...prev.header,
                        featuredStats: { ...prev.header.featuredStats, stat3Value: val },
                      },
                    }))
                  }
                  placeholder="Limited"
                />
                <AdminFormField
                  label="Stat 3 Label"
                  value={formData.header.featuredStats.stat3Label}
                  onChange={(val) =>
                    setFormData((prev) => ({
                      ...prev,
                      header: {
                        ...prev.header,
                        featuredStats: { ...prev.header.featuredStats, stat3Label: val },
                      },
                    }))
                  }
                  placeholder="Bespoke Batches"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MONTHLY EDITS & PRODUCTS */}
      {activeTab === 'edits' && (
        <div className="space-y-6">
          {/* Top Switcher: Monthly Edit vs Additional Signature Picks */}
          <div className="flex items-center justify-between flex-wrap gap-2 pb-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[var(--color-ink)]">Select Collection:</span>
              <button
                type="button"
                onClick={() => {
                  setEditingAdditionalPicks(false);
                  setSelectedProductIndex(0);
                }}
                className={cn(
                  'px-3 py-1.5 text-xs rounded-lg font-medium transition-colors border',
                  !editingAdditionalPicks
                    ? 'bg-[var(--color-gold)] text-white border-[var(--color-gold)]'
                    : 'bg-white text-[var(--color-slate)] border-[var(--color-whisper)] hover:bg-[var(--color-snow)]'
                )}
              >
                Monthly Capsules ({formData.monthlyEdits.length})
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditingAdditionalPicks(true);
                  setSelectedProductIndex(0);
                }}
                className={cn(
                  'px-3 py-1.5 text-xs rounded-lg font-medium transition-colors border',
                  editingAdditionalPicks
                    ? 'bg-[var(--color-gold)] text-white border-[var(--color-gold)]'
                    : 'bg-white text-[var(--color-slate)] border-[var(--color-whisper)] hover:bg-[var(--color-snow)]'
                )}
              >
                Additional Signature Picks ({formData.additionalPicks.length})
              </button>
            </div>
          </div>

          {!editingAdditionalPicks && (
            <div className="p-4 rounded-xl bg-[var(--color-snow)] border border-[var(--color-whisper)] space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-gold)]">
                  Monthly Capsules Selector
                </h3>
                <div className="flex items-center gap-2">
                  {formData.monthlyEdits.map((edit, idx) => (
                    <button
                      key={edit.slug || idx}
                      type="button"
                      onClick={() => {
                        setSelectedEditIndex(idx);
                        setSelectedProductIndex(0);
                      }}
                      className={cn(
                        'px-3 py-1 text-xs rounded-full font-medium transition-colors border',
                        selectedEditIndex === idx
                          ? 'bg-[var(--color-ink)] text-white border-[var(--color-ink)]'
                          : 'bg-white text-[var(--color-ink)] border-[var(--color-whisper)] hover:bg-[var(--color-gold-light)]/20'
                      )}
                    >
                      {edit.month}
                    </button>
                  ))}
                </div>
              </div>

              {currentEdit && (
                <div className="space-y-4 pt-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <AdminFormField
                      label="Month Name"
                      value={currentEdit.month}
                      onChange={(val) => updateCurrentEdit((e) => ({ ...e, month: val }))}
                      placeholder="January 2026"
                    />
                    <AdminFormField
                      label="URL Slug"
                      value={currentEdit.slug}
                      onChange={(val) => updateCurrentEdit((e) => ({ ...e, slug: val }))}
                      placeholder="january-2026"
                    />
                    <AdminFormField
                      label="Theme Title"
                      value={currentEdit.theme}
                      onChange={(val) => updateCurrentEdit((e) => ({ ...e, theme: val }))}
                      placeholder="New Beginnings in Silk"
                    />
                    <AdminFormField
                      label="Subtitle"
                      value={currentEdit.subtitle}
                      onChange={(val) => updateCurrentEdit((e) => ({ ...e, subtitle: val }))}
                      placeholder="Lustrous Mulberry Silks & Airy Chiffons..."
                    />
                    <AdminFormField
                      label="Cover Artwork Image Path"
                      value={currentEdit.coverImage}
                      onChange={(val) => updateCurrentEdit((e) => ({ ...e, coverImage: val }))}
                      placeholder="/images/vp-jan-1.jpg"
                    />
                    <AdminFormField
                      label="Curator Insight Quote"
                      value={currentEdit.curatorInsight}
                      onChange={(val) => updateCurrentEdit((e) => ({ ...e, curatorInsight: val }))}
                      placeholder="“When silk drapes true...” — Vidhya"
                    />
                  </div>
                  <AdminTextArea
                    label="Editorial Note / Introduction"
                    rows={2}
                    value={currentEdit.note}
                    onChange={(val) => updateCurrentEdit((e) => ({ ...e, note: val }))}
                    placeholder="Starting the year with fabrics that feel like fresh starts..."
                  />
                  <AdminTextArea
                    label="Hero Story Narrative"
                    rows={3}
                    value={currentEdit.heroStory}
                    onChange={(val) => updateCurrentEdit((e) => ({ ...e, heroStory: val }))}
                    placeholder="As the light shifts into the new year, this edit celebrates purity..."
                  />
                </div>
              )}
            </div>
          )}

          {/* Products List & Editor */}
          <div className="p-4 rounded-xl bg-[var(--color-snow)] border border-[var(--color-whisper)] space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-gold)]">
                  {editingAdditionalPicks
                    ? 'Signature Picks Across All Categories'
                    : `Products in ${currentEdit?.month || 'Current Edit'} (${activeProducts.length})`}
                </h3>
                <p className="text-[11px] text-[var(--color-slate)]">
                  Click a product to edit its details, price, fabric, and Vidhya&apos;s personal note.
                </p>
              </div>

              {!editingAdditionalPicks && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addProductToCurrentEdit}
                  className="text-xs text-[var(--color-gold)] border-[var(--color-gold)] hover:bg-[var(--color-gold-light)]/20"
                >
                  + Add Product to {currentEdit?.month}
                </Button>
              )}
            </div>

            {/* Product Pill Selector */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {activeProducts.map((prod, idx) => (
                <button
                  key={prod.id || idx}
                  type="button"
                  onClick={() => setSelectedProductIndex(idx)}
                  className={cn(
                    'px-3 py-1.5 text-xs rounded-lg font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 border',
                    selectedProductIndex === idx
                      ? 'bg-[var(--color-gold)] text-white border-[var(--color-gold)] shadow-xs'
                      : 'bg-white text-[var(--color-ink)] border-[var(--color-whisper)] hover:bg-[var(--color-snow)]'
                  )}
                >
                  <span className="font-semibold">{idx + 1}.</span>
                  <span className="max-w-[140px] truncate">{prod.name}</span>
                  <span className="text-[10px] opacity-80">({prod.category})</span>
                </button>
              ))}
            </div>

            {/* Selected Product Form */}
            {currentProduct && (
              <div className="p-4 bg-white rounded-lg border border-[var(--color-whisper)] space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-[var(--color-whisper)]">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[var(--color-ink)]">
                      Editing: {currentProduct.name}
                    </span>
                    <Badge variant="outline" size="sm">
                      ID: {currentProduct.id}
                    </Badge>
                  </div>

                  {!editingAdditionalPicks && activeProducts.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeProductFromCurrentEdit(selectedProductIndex)}
                      className="text-xs text-[var(--color-error)] hover:underline"
                    >
                      Delete Product
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <AdminFormField
                    label="Product Name"
                    value={currentProduct.name}
                    onChange={(val) => {
                      if (editingAdditionalPicks) {
                        updateAdditionalPick(selectedProductIndex, (p) => ({ ...p, name: val }));
                      } else {
                        updateCurrentEditProduct(selectedProductIndex, (p) => ({ ...p, name: val }));
                      }
                    }}
                    placeholder="Mulberry Silk Saree"
                  />
                  <AdminFormField
                    label="Slug / URL Path"
                    value={currentProduct.slug}
                    onChange={(val) => {
                      if (editingAdditionalPicks) {
                        updateAdditionalPick(selectedProductIndex, (p) => ({ ...p, slug: val }));
                      } else {
                        updateCurrentEditProduct(selectedProductIndex, (p) => ({ ...p, slug: val }));
                      }
                    }}
                    placeholder="mulberry-silk-saree"
                  />
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-[var(--color-ink)]">
                      Category
                    </label>
                    <select
                      value={currentProduct.category}
                      onChange={(e) => {
                        const val = e.target.value as any;
                        if (editingAdditionalPicks) {
                          updateAdditionalPick(selectedProductIndex, (p) => ({ ...p, category: val }));
                        } else {
                          updateCurrentEditProduct(selectedProductIndex, (p) => ({ ...p, category: val }));
                        }
                      }}
                      className="w-full h-10 text-xs px-3 rounded-lg border border-[var(--color-whisper)] bg-white text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-gold)]"
                    >
                      <option value="Sarees">Sarees</option>
                      <option value="Kurtis">Kurtis</option>
                      <option value="Salwars">Salwars</option>
                      <option value="Lehengas">Lehengas</option>
                      <option value="Dupattas">Dupattas</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <AdminFormField
                    label="Selling Price (₹)"
                    type="number"
                    value={currentProduct.price}
                    onChange={(val) => {
                      const num = Number(val) || 0;
                      if (editingAdditionalPicks) {
                        updateAdditionalPick(selectedProductIndex, (p) => ({ ...p, price: num }));
                      } else {
                        updateCurrentEditProduct(selectedProductIndex, (p) => ({ ...p, price: num }));
                      }
                    }}
                    placeholder="7999"
                  />
                  <AdminFormField
                    label="Original Price (₹)"
                    type="number"
                    value={currentProduct.originalPrice}
                    onChange={(val) => {
                      const num = Number(val) || 0;
                      if (editingAdditionalPicks) {
                        updateAdditionalPick(selectedProductIndex, (p) => ({ ...p, originalPrice: num }));
                      } else {
                        updateCurrentEditProduct(selectedProductIndex, (p) => ({ ...p, originalPrice: num }));
                      }
                    }}
                    placeholder="9999"
                  />
                  <AdminFormField
                    label="Discount Percentage (%)"
                    type="number"
                    value={currentProduct.discount}
                    onChange={(val) => {
                      const num = Number(val) || 0;
                      if (editingAdditionalPicks) {
                        updateAdditionalPick(selectedProductIndex, (p) => ({ ...p, discount: num }));
                      } else {
                        updateCurrentEditProduct(selectedProductIndex, (p) => ({ ...p, discount: num }));
                      }
                    }}
                    placeholder="20"
                  />
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-[var(--color-ink)]">
                      Color Family
                    </label>
                    <select
                      value={currentProduct.colorFamily || 'white'}
                      onChange={(e) => {
                        const val = e.target.value as any;
                        if (editingAdditionalPicks) {
                          updateAdditionalPick(selectedProductIndex, (p) => ({ ...p, colorFamily: val }));
                        } else {
                          updateCurrentEditProduct(selectedProductIndex, (p) => ({ ...p, colorFamily: val }));
                        }
                      }}
                      className="w-full h-10 text-xs px-3 rounded-lg border border-[var(--color-whisper)] bg-white text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-gold)]"
                    >
                      <option value="white">White & Ivory</option>
                      <option value="red">Red & Crimson</option>
                      <option value="green">Green & Emerald</option>
                      <option value="blue">Blue & Navy</option>
                      <option value="gold">Gold & Yellow</option>
                      <option value="pink">Pink & Rose</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <AdminFormField
                    label="Color Display Name"
                    value={currentProduct.color}
                    onChange={(val) => {
                      if (editingAdditionalPicks) {
                        updateAdditionalPick(selectedProductIndex, (p) => ({ ...p, color: val }));
                      } else {
                        updateCurrentEditProduct(selectedProductIndex, (p) => ({ ...p, color: val }));
                      }
                    }}
                    placeholder="Ivory & Antique Gold"
                  />
                  <AdminFormField
                    label="Fabric"
                    value={currentProduct.fabric}
                    onChange={(val) => {
                      if (editingAdditionalPicks) {
                        updateAdditionalPick(selectedProductIndex, (p) => ({ ...p, fabric: val }));
                      } else {
                        updateCurrentEditProduct(selectedProductIndex, (p) => ({ ...p, fabric: val }));
                      }
                    }}
                    placeholder="Pure Mulberry Silk"
                  />
                  <AdminFormField
                    label="Artisan Origin / Looms"
                    value={currentProduct.origin}
                    onChange={(val) => {
                      if (editingAdditionalPicks) {
                        updateAdditionalPick(selectedProductIndex, (p) => ({ ...p, origin: val }));
                      } else {
                        updateCurrentEditProduct(selectedProductIndex, (p) => ({ ...p, origin: val }));
                      }
                    }}
                    placeholder="Varanasi Master Weavers"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <AdminFormField
                    label="Product Image Path"
                    value={currentProduct.image}
                    onChange={(val) => {
                      if (editingAdditionalPicks) {
                        updateAdditionalPick(selectedProductIndex, (p) => ({ ...p, image: val }));
                      } else {
                        updateCurrentEditProduct(selectedProductIndex, (p) => ({ ...p, image: val }));
                      }
                    }}
                    placeholder="/images/vp-jan-1.jpg"
                  />
                  <AdminFormField
                    label="Search Tags (comma separated)"
                    value={Array.isArray(currentProduct.tags) ? currentProduct.tags.join(', ') : ''}
                    onChange={(val) => {
                      const tags = val.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean);
                      if (editingAdditionalPicks) {
                        updateAdditionalPick(selectedProductIndex, (p) => ({ ...p, tags }));
                      } else {
                        updateCurrentEditProduct(selectedProductIndex, (p) => ({ ...p, tags }));
                      }
                    }}
                    placeholder="saree, silk, ivory, gold, varanasi"
                  />
                </div>

                <AdminTextArea
                  label="Vidhya's Personal Note (Crucial for Founder Signature Badge)"
                  rows={3}
                  value={currentProduct.vidhyaNote}
                  onChange={(val) => {
                    if (editingAdditionalPicks) {
                      updateAdditionalPick(selectedProductIndex, (p) => ({ ...p, vidhyaNote: val }));
                    } else {
                      updateCurrentEditProduct(selectedProductIndex, (p) => ({ ...p, vidhyaNote: val }));
                    }
                  }}
                  placeholder="The saree I wore to my own housewarming. Drapes like an absolute dream..."
                  helperText="Appears directly on the product card in italic styling with Vidhya's signature seal."
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: CURATION STANDARDS */}
      {activeTab === 'standards' && (
        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-[var(--color-snow)] border border-[var(--color-whisper)] space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-gold)]">
              Curation Standard Section Header
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AdminFormField
                label="Section Eyebrow"
                value={formData.curationStandards.eyebrow}
                onChange={(val) =>
                  setFormData((prev) => ({
                    ...prev,
                    curationStandards: { ...prev.curationStandards, eyebrow: val },
                  }))
                }
                placeholder="THE CURATION STANDARD"
              />
              <AdminFormField
                label="Section Title"
                value={formData.curationStandards.title}
                onChange={(val) =>
                  setFormData((prev) => ({
                    ...prev,
                    curationStandards: { ...prev.curationStandards, title: val },
                  }))
                }
                placeholder="Why Every Pick is Rare & Special"
              />
            </div>
            <AdminTextArea
              label="Subtitle / Manifesto"
              rows={2}
              value={formData.curationStandards.subtitle}
              onChange={(val) =>
                setFormData((prev) => ({
                  ...prev,
                  curationStandards: { ...prev.curationStandards, subtitle: val },
                }))
              }
              placeholder="We reject mass manufacturing. Every piece in Vidhya’s Picks meets four strict artisanal principles."
            />
          </div>

          <div className="p-4 rounded-xl bg-[var(--color-snow)] border border-[var(--color-whisper)] space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-gold)]">
              The 4 Core Artisanal Pillars
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {formData.curationStandards.items.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-white rounded-lg border border-[var(--color-whisper)] space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[var(--color-gold)] uppercase tracking-wider">
                      Pillar #{idx + 1}
                    </span>
                    <AdminFormField
                      label="Icon Emoji"
                      value={item.icon}
                      onChange={(val) => updateStandardItem(idx, (it) => ({ ...it, icon: val }))}
                      placeholder="🪡"
                      className="w-20"
                    />
                  </div>
                  <AdminFormField
                    label="Title"
                    value={item.title}
                    onChange={(val) => updateStandardItem(idx, (it) => ({ ...it, title: val }))}
                    placeholder="Direct Loom Provenance"
                  />
                  <AdminTextArea
                    label="Description"
                    rows={2}
                    value={item.description}
                    onChange={(val) => updateStandardItem(idx, (it) => ({ ...it, description: val }))}
                    placeholder="Directly commissioned from master weavers..."
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: ARCHIVE */}
      {activeTab === 'archive' && (
        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-[var(--color-snow)] border border-[var(--color-whisper)] space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-gold)]">
              Curation Archive Section Header & Controls
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AdminFormField
                label="Section Eyebrow"
                value={formData.archive.eyebrow}
                onChange={(val) =>
                  setFormData((prev) => ({
                    ...prev,
                    archive: { ...prev.archive, eyebrow: val },
                  }))
                }
                placeholder="CURATION ARCHIVE"
              />
              <AdminFormField
                label="Section Title"
                value={formData.archive.title}
                onChange={(val) =>
                  setFormData((prev) => ({
                    ...prev,
                    archive: { ...prev.archive, title: val },
                  }))
                }
                placeholder="Explore Past Monthly Editions"
              />
              <AdminFormField
                label="CTA Button Text"
                value={formData.archive.ctaText}
                onChange={(val) =>
                  setFormData((prev) => ({
                    ...prev,
                    archive: { ...prev.archive, ctaText: val },
                  }))
                }
                placeholder="Browse All Collections →"
              />
              <AdminFormField
                label="CTA Button Link"
                value={formData.archive.ctaHref}
                onChange={(val) =>
                  setFormData((prev) => ({
                    ...prev,
                    archive: { ...prev.archive, ctaHref: val },
                  }))
                }
                placeholder="/shop"
              />
            </div>
            <AdminTextArea
              label="Subtitle"
              rows={2}
              value={formData.archive.subtitle}
              onChange={(val) =>
                setFormData((prev) => ({
                  ...prev,
                  archive: { ...prev.archive, subtitle: val },
                }))
              }
              placeholder="Each month brings a distinct theme, fresh fabrics, and personal styling narratives."
            />
          </div>
        </div>
      )}

      {/* TAB 5: CONCIERGE CALLOUT */}
      {activeTab === 'concierge' && (
        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-[var(--color-snow)] border border-[var(--color-whisper)] space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-gold)]">
              Vidhya&apos;s Complimentary Concierge Desk Callout
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AdminFormField
                label="Badge"
                value={formData.concierge.badge}
                onChange={(val) =>
                  setFormData((prev) => ({
                    ...prev,
                    concierge: { ...prev.concierge, badge: val },
                  }))
                }
                placeholder="COMPLIMENTARY CONCIERGE"
              />
              <AdminFormField
                label="Title"
                value={formData.concierge.title}
                onChange={(val) =>
                  setFormData((prev) => ({
                    ...prev,
                    concierge: { ...prev.concierge, title: val },
                  }))
                }
                placeholder="Unsure About Draping, Blouse Cuts, or Sizing?"
              />
              <AdminFormField
                label="WhatsApp Phone Number"
                value={formData.concierge.whatsappNumber}
                onChange={(val) =>
                  setFormData((prev) => ({
                    ...prev,
                    concierge: { ...prev.concierge, whatsappNumber: val },
                  }))
                }
                placeholder="+91 98765 43210"
              />
              <AdminFormField
                label="WhatsApp Direct Chat URL"
                value={formData.concierge.whatsappUrl}
                onChange={(val) =>
                  setFormData((prev) => ({
                    ...prev,
                    concierge: { ...prev.concierge, whatsappUrl: val },
                  }))
                }
                placeholder="https://wa.me/919876543210?text=..."
              />
              <AdminFormField
                label="Secondary Button Text"
                value={formData.concierge.sizeGuideText}
                onChange={(val) =>
                  setFormData((prev) => ({
                    ...prev,
                    concierge: { ...prev.concierge, sizeGuideText: val },
                  }))
                }
                placeholder="Open Interactive Size Guide"
              />
              <AdminFormField
                label="Secondary Button Link"
                value={formData.concierge.sizeGuideHref}
                onChange={(val) =>
                  setFormData((prev) => ({
                    ...prev,
                    concierge: { ...prev.concierge, sizeGuideHref: val },
                  }))
                }
                placeholder="/size-finder"
              />
            </div>

            <AdminTextArea
              label="Description"
              rows={3}
              value={formData.concierge.description}
              onChange={(val) =>
                setFormData((prev) => ({
                  ...prev,
                  concierge: { ...prev.concierge, description: val },
                }))
              }
              placeholder="Connect directly with designer Vidhya Sharma and our senior bridal styling desk..."
            />
          </div>
        </div>
      )}

      {/* TAB 6: VIP NOTE & PREVIEWS */}
      {activeTab === 'newsletter' && (
        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-[var(--color-snow)] border border-[var(--color-whisper)] space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-gold)]">
              VIP Early Access & Private Previews Subscription
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AdminFormField
                label="Eyebrow"
                value={formData.newsletter.eyebrow}
                onChange={(val) =>
                  setFormData((prev) => ({
                    ...prev,
                    newsletter: { ...prev.newsletter, eyebrow: val },
                  }))
                }
                placeholder="PRIVATE PREVIEWS"
              />
              <AdminFormField
                label="Headline"
                value={formData.newsletter.title}
                onChange={(val) =>
                  setFormData((prev) => ({
                    ...prev,
                    newsletter: { ...prev.newsletter, title: val },
                  }))
                }
                placeholder="Get Next Month's Edit 48 Hours Before Public Release"
              />
              <AdminFormField
                label="Button Text"
                value={formData.newsletter.buttonText}
                onChange={(val) =>
                  setFormData((prev) => ({
                    ...prev,
                    newsletter: { ...prev.newsletter, buttonText: val },
                  }))
                }
                placeholder="Join VIP List"
              />
              <AdminFormField
                label="Disclaimer / Privacy Micro-copy"
                value={formData.newsletter.disclaimer}
                onChange={(val) =>
                  setFormData((prev) => ({
                    ...prev,
                    newsletter: { ...prev.newsletter, disclaimer: val },
                  }))
                }
                placeholder="Zero spam. Unsubscribe at any time."
              />
            </div>
            <AdminTextArea
              label="Description"
              rows={2}
              value={formData.newsletter.description}
              onChange={(val) =>
                setFormData((prev) => ({
                  ...prev,
                  newsletter: { ...prev.newsletter, description: val },
                }))
              }
              placeholder="Join Vidhya’s Private Notes. Receive artisanal stories..."
            />
          </div>
        </div>
      )}

      {/* TAB 7: SEO */}
      {activeTab === 'seo' && (
        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-[var(--color-snow)] border border-[var(--color-whisper)] space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-gold)]">
              SEO & Social Sharing Metadata
            </h3>
            <AdminFormField
              label="Browser Title (meta title)"
              value={formData.seo.metaTitle}
              onChange={(val) =>
                setFormData((prev) => ({
                  ...prev,
                  seo: { ...prev.seo, metaTitle: val },
                }))
              }
              placeholder="Vidhya's Picks | Founder's Curated Handloom Ethnic Wear | Angelika"
              helperText={`${(formData.seo.metaTitle || '').length} characters (ideal: 50-65)`}
            />
            <AdminTextArea
              label="Meta Description"
              rows={3}
              value={formData.seo.metaDescription}
              onChange={(val) =>
                setFormData((prev) => ({
                  ...prev,
                  seo: { ...prev.seo, metaDescription: val },
                }))
              }
              placeholder="Explore Vidhya's personal curation of handwoven sarees..."
              helperText={`${(formData.seo.metaDescription || '').length} characters (ideal: 140-160)`}
            />
          </div>
        </div>
      )}

      {/* Bottom Save Bar */}
      <div className="pt-4 border-t border-[var(--color-whisper)] flex items-center justify-between">
        <p className="text-xs text-[var(--color-slate)]">
          Updates made here sync instantly with <span className="font-mono text-[var(--color-ink)]">/vidhyas-picks</span> upon saving.
        </p>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onCancel}
            className="text-xs"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            disabled={isSaving}
            onClick={handleSave}
            className="text-xs bg-[var(--color-gold)] hover:bg-[#967637] text-white font-medium px-5 shadow-sm"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  );
}
