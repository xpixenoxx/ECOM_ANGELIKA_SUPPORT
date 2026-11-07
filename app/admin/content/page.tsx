'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input, Textarea } from '@/components/ui/Input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { Badge } from '@/components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { cn } from '@/lib/utils/cn';
import { HomepageHeroEditor } from '@/components/admin/HomepageHeroEditor';
import { CategoryShowcaseEditor } from '@/components/admin/CategoryShowcaseEditor';
import { NewArrivalsEditor } from '@/components/admin/NewArrivalsEditor';
import { BrandStoryEditor } from '@/components/admin/BrandStoryEditor';
import { KurtisPageEditor } from '@/components/admin/KurtisPageEditor';
import { FooterEditor } from '@/components/admin/FooterEditor';
import { SalwarsPageEditor } from '@/components/admin/SalwarsPageEditor';
import { LehengasPageEditor } from '@/components/admin/LehengasPageEditor';
import { SareesPageEditor } from '@/components/admin/SareesPageEditor';
import { DupattasPageEditor } from '@/components/admin/DupattasPageEditor';
import { NewArrivalsPageEditor } from '@/components/admin/NewArrivalsPageEditor';
import { SalePageEditor } from '@/components/admin/SalePageEditor';
import { MyAngelikaLookEditor } from '@/components/admin/MyAngelikaLookEditor';
import { PrivacyPolicyPageEditor } from '@/components/admin/PrivacyPolicyPageEditor';
import { TermsPageEditor } from '@/components/admin/TermsPageEditor';
import { CookiesPageEditor } from '@/components/admin/CookiesPageEditor';
import { AccessibilityPageEditor } from '@/components/admin/AccessibilityPageEditor';
import { ShopPageEditor } from '@/components/admin/ShopPageEditor';
import { AboutPageEditor } from '@/components/admin/AboutPageEditor';
import { ShippingPageEditor } from '@/components/admin/ShippingPageEditor';
import { ReturnsPageEditor } from '@/components/admin/ReturnsPageEditor';
import { SizeFinderPageEditor } from '@/components/admin/SizeFinderPageEditor';
import { SizeGuidePageEditor } from '@/components/admin/SizeGuidePageEditor';
import { FAQPageEditor } from '@/components/admin/FAQPageEditor';
import { ContactPageEditor } from '@/components/admin/ContactPageEditor';
import { WholesalePageEditor } from '@/components/admin/WholesalePageEditor';
import { DesignerVidhyaPageEditor } from '@/components/admin/DesignerVidhyaPageEditor';

const contentSections = [
  { id: 'hero', label: 'Homepage Hero', type: 'hero' },
  { id: 'categories', label: 'Category Showcase', type: 'categories' },
  { id: 'new-arrivals', label: 'New Arrivals Showcase', type: 'collection' },
  { id: 'vidhyas-picks', label: "Vidhya's Picks", type: 'editorial' },
  {
    id: 'salwars-page',
    label: 'Salwars Page',
    type: 'page'
  },
  {
    id: 'lehengas-page',
    label: 'Lehengas Page',
    type: 'page'
  },
  {
    id: 'sarees-page',
    label: 'Sarees Page',
    type: 'page'
  },
  {
    id: 'dupattas-page',
    label: 'Dupattas Page',
    type: 'page'
  },
  {
    id: 'new-arrivals-page',
    label: 'New Arrivals Page',
    type: 'page'
  },
  {
    id: 'sale-page',
    label: 'Sale Page',
    type: 'page'
  },
  {
    id: 'my-angelika-look',
    label: '#MyAngelikaLook',
    type: 'page'
  },
  {
    id: 'privacy-policy-page',
    label: 'Privacy Policy',
    type: 'page'
  },
  {
    id: 'terms-page',
    label: 'Terms of Service',
    type: 'page'
  },
  {
    id: 'cookies-page',
    label: 'Cookie Policy',
    type: 'page'
  },
  {
    id: 'accessibility-page',
    label: 'Accessibility Statement',
    type: 'page'
  },
  {
    id: 'shop-page',
    label: 'Shop Page (All Collections)',
    type: 'page'
  },
  {
    id: 'about-page',
    label: 'About Us Page',
    type: 'page'
  },
  {
    id: 'shipping-page',
    label: 'Shipping Policy Page',
    type: 'page'
  },
  {
    id: 'returns-page',
    label: 'Returns & Size Exchanges',
    type: 'page'
  },
  {
    id: 'size-finder-page',
    label: 'Couture Fit Studio (Size Finder)',
    type: 'page'
  },
  {
    id: 'size-guide-page',
    label: 'Garment Size Guide',
    type: 'page'
  },
  {
    id: 'faq-page',
    label: 'FAQ & Help Center',
    type: 'page'
  },
  {
    id: 'contact-page',
    label: 'Contact Us & Concierge Studio',
    type: 'page'
  },
  {
    id: 'wholesale-page',
    label: 'Wholesale & B2B Inquiries',
    type: 'page'
  },
  {
    id: 'designer-vidhya-page',
    label: 'Meet Designer Vidhya',
    type: 'page'
  },
  { id: 'brand-story', label: 'Brand Story', type: 'richtext' },
  { id: 'kurtis-page', label: 'Kurtis Page', type: 'page' },
  { id: 'footer', label: 'Footer', type: 'footer' },
  { id: 'newsletter', label: 'Newsletter Signup', type: 'form' },
  { id: 'about-hero', label: 'About Page Hero', type: 'hero' },
  { id: 'founder-note', label: "Founder's Note", type: 'richtext' },
  { id: 'values', label: 'Our Values', type: 'grid' },
  { id: 'journey', label: 'Journey Timeline', type: 'timeline' },
  { id: 'team', label: 'Team Members', type: 'grid' },
  { id: 'artisan-story', label: 'Artisan Spotlight', type: 'richtext' },
];

const defaultMockContent: Record<string, any> = {
  'hero': {
    title: 'Grace in Every Drape',
    subtitle: 'Timeless traditional wear for the modern woman. Rooted in heritage, designed for your today.',
    ctaText: 'Explore Collection',
    ctaLink: '/shop',
    secondaryCtaText: "Vidhya's Picks",
    secondaryCtaLink: '/vidhyas-picks',
    backgroundImage: '/images/hero-new-couture.jpg',
  },
  'features': {
    items: [
      { icon: '🚚', title: 'Free Shipping', desc: 'On orders ₹2,999+ across India', description: 'On orders ₹2,999+ across India' },
      { icon: '🔄', title: '15-Day Returns', desc: 'Hassle-free returns & exchanges', description: 'Hassle-free returns & exchanges' },
      { icon: '💬', title: 'Personal Styling', desc: 'Chat with Vidhya on WhatsApp', description: 'Chat with Vidhya on WhatsApp' },
      { icon: '🎁', title: 'Gift Wrapping', desc: 'Complimentary on all orders', description: 'Complimentary on all orders' },
    ],
  },
  'categories': {
    badge: 'Curated Collections',
    title: 'Shop by Category',
    subtitle: 'Discover our complete range of premium ethnic wear, each category handcrafted with timeless artisanal detail.',
    items: [
      { id: 'party-wear-dresses', title: 'Party Wear Dresses', subtitle: 'Festive & Evening Ensembles', image: '/images/category-showcase/showcase-party-wear-dresses.jpg', href: '/shop?occasion=party', cta: 'Explore Dresses', row: 1 },
      { id: 'office-wear-3piece', title: 'Office Wear 3-Piece', subtitle: 'Contemporary Formal Sets', image: '/images/category-showcase/showcase-office-wear-3piece.jpg', href: '/shop/salwars?occasion=office', cta: 'Shop 3-Piece', row: 1 },
      { id: 'coord-sets', title: 'Co-ord Sets', subtitle: 'Modern Matching Ensembles', image: '/images/category-showcase/showcase-coord-sets.jpg', href: '/shop/kurtis?type=coord-sets', cta: 'Shop Co-ords', row: 1 },
      { id: 'lehengas', title: 'Lehengas', subtitle: 'Bridal & Royal Celebrations', image: '/images/category-showcase/showcase-lehengas.jpg', href: '/shop/lehengas', cta: 'Explore Lehengas', row: 2 },
      { id: 'daily-wear-sarees', title: 'Daily Wear Sarees', subtitle: 'Lightweight Tissue & Cotton', image: '/images/category-showcase/showcase-daily-wear-sarees.jpg', href: '/shop/sarees?occasion=casual', cta: 'Shop Daily Sarees', row: 3 },
      { id: 'office-wear-sarees', title: 'Office Wear Sarees', subtitle: 'Sophisticated Silk Drapes', image: '/images/category-showcase/showcase-office-wear-sarees.jpg', href: '/shop/sarees?occasion=office', cta: 'Shop Office Sarees', row: 3 },
      { id: 'party-wear-sarees', title: 'Party Wear Sarees', subtitle: 'Pure Kanjivaram & Banarasi', image: '/images/category-showcase/showcase-party-wear-sarees.jpg', href: '/shop/sarees?occasion=party', cta: 'Explore Party Sarees', row: 4 },
      { id: 'womens-frocks', title: "Women's Frocks", subtitle: 'Flared Anarkalis & Gowns', image: '/images/category-showcase/showcase-womens-frocks.jpg', href: '/shop/salwars?type=anarkali', cta: 'Shop Frocks', row: 5 },
    ],
  },
  'vidhyas-picks': {
    badge: "Vidhya's Picks",
    title: "Handpicked by Vidhya",
    titleHighlight: "Vidhya",
    ctaText: "View All Picks",
    ctaLink: "/vidhyas-picks",
    items: [
      {
        id: "vp-1",
        name: "Kutch Ajrakh Modal Silk Kurti",
        category: "Kurtis",
        price: 4999,
        originalPrice: 5999,
        image: "/images/products/kurti-ajrakh-1.jpg",
        slug: "kutch-ajrakh-modal-silk-kurti",
        badge: "VIDHYA'S PICK",
      },
      {
        id: "vp-2",
        name: "Ivory & Gold Chanderi Angrakha Suit",
        category: "Salwars",
        price: 7499,
        originalPrice: 8999,
        image: "/images/products/salwar-angrakha-1.jpg",
        slug: "ivory-gold-chanderi-angrakha-suit",
        badge: "VIDHYA'S PICK",
      },
      {
        id: "vp-3",
        name: "Heritage Temple Kanjivaram Silk Saree",
        category: "Sarees",
        price: 14999,
        originalPrice: 17999,
        image: "/images/products/saree-kanjivaram-1.jpg",
        slug: "heritage-temple-kanjivaram-silk-saree",
        badge: "VIDHYA'S PICK",
      },
      {
        id: "vp-4",
        name: "Lucknowi Mukaish Chiffon Saree",
        category: "Sarees",
        price: 6499,
        originalPrice: 7999,
        image: "/images/products/saree-chikankari-1.jpg",
        slug: "lucknowi-mukaish-chiffon-saree",
        badge: "VIDHYA'S PICK",
      },
    ],
  },
  'shop-the-look': {
    title: "Festive Elegance",
    badge: "Curated Ensemble",
    subtitle: "Click pins on image to explore",
    lifestyle_image_url: "/images/products/lehenga-bridal-1.jpg",
    lifestyle_image_alt: "Festive Elegance Ensemble",
    productName: "Mirror Work Lehenga",
    productPrice: 18999,
    productOriginalPrice: 22999,
    productImage: "/images/products/lehenga-mirror-1.jpg",
    productSlug: "mirror-work-lehenga",
    pinX: 47,
    pinY: 64,
  },
  'brand-story': {
    badge: 'Our Story',
    title: 'Crafted with Love, Worn with Pride',
    headingPrefix: 'Crafted with',
    headingHighlight: 'Love',
    headingSuffix: ', Worn with Pride',
    image: '/images/vidhya-story.jpg',
    imageAlt: 'Vidhya in her atelier',
    storyParagraphs: [
      "Angelika Fashions was born from Vidhya's passion for preserving Indian textile heritage while creating contemporary silhouettes for the modern woman.",
      "Every piece in our collection is thoughtfully designed, from selecting the finest fabrics to collaborating with skilled artisans who bring generations of expertise to each stitch.",
      "When you wear Angelika, you're not just wearing clothes — you're wearing a piece of tradition reimagined for today, made with integrity and worn with confidence.",
    ],
    story: "Angelika Fashions was born from Vidhya's passion for preserving Indian textile heritage while creating contemporary silhouettes for the modern woman.\n\nEvery piece in our collection is thoughtfully designed, from selecting the finest fabrics to collaborating with skilled artisans who bring generations of expertise to each stitch.\n\nWhen you wear Angelika, you're not just wearing clothes — you're wearing a piece of tradition reimagined for today, made with integrity and worn with confidence.",
    quote: '"Fashion that honors where you come from while embracing where you are going."',
    primaryCtaText: 'Read Our Story',
    primaryCtaLink: '/about',
    whatsappCtaText: 'Chat with Vidhya',
    whatsappLink: "https://wa.me/91XXXXXXXXXX?text=Hi%20Vidhya,%20I'd%20like%20to%20know%20more%20about%20your%20journey",
  },
  'kurtis-page': {
    badge: 'HANDCRAFTED LUXURY EDIT',
    title: 'Kurtis',
    description: 'Discover our complete range of handcrafted Indian ethnic kurtis, tunics, and anarkalis, thoughtfully made with artisanal perfection and breathable natural textiles.',
    heroImage: '/images/hero-new-couture.jpg',
    cardImage: '/images/collection-kurtis.jpg',
    cardBadge: 'CURATED BY VIDHYA',
    cardSubtitle: '48 Handcrafted Pieces',
    showPromoBanner: true,
    promoBadge: 'FESTIVE OFFER',
    promoText: 'Enjoy 15% off on all handcrafted Chanderi and Silk Kurtis. Use code: KURTI15',
    promoCtaText: 'SHOP KURTIS',
    promoCtaLink: '/shop/kurtis',
    showStylingGuide: true,
    stylingBadge: 'ATELIER NOTES & STYLING',
    stylingTitle: "Vidhya's Styling Guide for Kurtis",
    stylingNote: 'Our kurtis are cut from pure breathable Chanderi, Mulmul and Tussar silk. For a contemporary festive look, pair straight-cut kurtis with cigarette pants, or flared anarkalis with statement jhumkas.',
    stylingImage: '/images/vidhya-story.jpg',
    highlights: [
      {
        title: 'Handloom Textiles',
        description: 'Woven on authentic wooden looms using pure Chanderi silk and combed mulmul cotton.',
      },
      {
        title: 'Artisanal Block Prints',
        description: 'Hand-block printed by master artisans using organic azo-free earthen dyes.',
      },
      {
        title: 'Tailored Silhouettes',
        description: 'Comfortable relaxed drapes with thoughtful internal seam allowances for a bespoke fit.',
      },
    ],
    showCategoryStrip: true,
    showSidebar: true,
    productsMode: 'custom',
    products: [
      {
        id: 'kp-1',
        name: 'Kutch Ajrakh Modal Silk Kurti',
        category: 'KURTIS',
        price: 4999,
        originalPrice: 5999,
        discount: 17,
        image: '/images/collection-kurtis.jpg',
        href: '/product/kutch-ajrakh-modal-silk-kurti',
        isNew: true,
        isVidhyasPick: true,
        fabric: 'Silk',
        rating: 4.8,
        reviewCount: 12,
        inStock: true,
      },
      {
        id: 'kp-2',
        name: 'Pristine White Shadow Work Lucknowi Kurti',
        category: 'KURTIS',
        price: 3999,
        originalPrice: 4799,
        discount: 17,
        image: '/images/collection-lehengas.jpg',
        href: '/product/pristine-white-shadow-work-lucknowi-kurti',
        isNew: true,
        isVidhyasPick: false,
        fabric: 'Cotton',
        rating: 4.8,
        reviewCount: 12,
        inStock: true,
      },
      {
        id: 'kp-3',
        name: 'Hand Block Printed Kurti',
        category: 'KURTIS',
        price: 2499,
        originalPrice: 3299,
        discount: 24,
        image: '/images/collection-kurtis.jpg',
        href: '/product/hand-block-printed-kurti',
        isNew: true,
        isVidhyasPick: false,
        fabric: 'Cotton',
        rating: 4.8,
        reviewCount: 12,
        inStock: true,
      },
      {
        id: 'kp-4',
        name: 'Velvet Kurti Set',
        category: 'KURTIS',
        price: 6999,
        originalPrice: 8499,
        discount: 18,
        image: '/images/cat-sarees.jpg',
        href: '/product/velvet-kurti-set',
        isNew: true,
        isVidhyasPick: true,
        fabric: 'Velvet',
        rating: 4.8,
        reviewCount: 12,
        inStock: true,
      },
      {
        id: 'kp-5',
        name: 'Chanderi Cotton Kurti',
        category: 'KURTIS',
        price: 3199,
        originalPrice: 3999,
        discount: 20,
        image: '/images/cat-kurtis.jpg',
        href: '/product/chanderi-cotton-kurti',
        isNew: true,
        isVidhyasPick: false,
        fabric: 'Chanderi',
        rating: 4.8,
        reviewCount: 12,
        inStock: true,
      },
      {
        id: 'kp-6',
        name: 'Gota Patti Kurta',
        category: 'KURTIS',
        price: 4299,
        originalPrice: 5299,
        discount: 19,
        image: '/images/cat-lehengas.jpg',
        href: '/product/gota-patti-kurta',
        isNew: true,
        isVidhyasPick: false,
        fabric: 'Cotton',
        rating: 4.8,
        reviewCount: 12,
        inStock: true,
      },
    ],
    metaTitle: 'Designer Kurtis and Tunics Online | Angelika Fashions',
    metaDescription: 'Shop handcrafted Indian ethnic kurtis, anarkalis and tunics by Vidhya at Angelika Fashions. Pure Chanderi silk and mulmul cotton with express delivery.',
  },
  'newsletter': {
    title: 'Join the Angelika Circle',
    subtitle: 'Receive exclusive invitations to preview new arrivals, bespoke styling sessions, and private editorial drops.',
    buttonText: 'Subscribe',
  },
};

const mediaItems = [
  { id: 'img-1', name: 'hero-new-couture.jpg', type: 'image', size: '2.4 MB', url: '/images/hero-new-couture.jpg', usedIn: ['Homepage Hero'] },
  { id: 'img-2', name: 'logo.png', type: 'image', size: '250 KB', url: '/images/logo.png', usedIn: ['Header', 'Footer'] },
  { id: 'img-3', name: 'vidhya-founder.jpg', type: 'image', size: '1.8 MB', url: '/images/vidhya-founder.jpg', usedIn: ['About Page', 'Founder Note'] },
  { id: 'img-4', name: 'artisan-workshop.jpg', type: 'image', size: '3.1 MB', url: '/images/artisan-workshop.jpg', usedIn: ['Artisan Stories'] },
  { id: 'img-5', name: 'collection-kurtis.jpg', type: 'image', size: '890 KB', url: '/images/collection-kurtis.jpg', usedIn: ['Collections: Kurtis'] },
  { id: 'img-6', name: 'collection-sarees.jpg', type: 'image', size: '920 KB', url: '/images/collection-sarees.jpg', usedIn: ['Collections: Sarees'] },
];

function FeatureIconUploader({
  icon,
  onChange,
}: {
  icon: string;
  onChange: (newIcon: string) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [pasteSuccess, setPasteSuccess] = useState(false);

  const isImage =
    icon &&
    (icon.startsWith('/') ||
      icon.startsWith('http://') ||
      icon.startsWith('https://') ||
      icon.startsWith('data:image'));

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    setUploadError(null);

    const useLocalDataUrl = () => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          onChange(reader.result);
          setPasteSuccess(true);
          setTimeout(() => setPasteSuccess(false), 3000);
        }
      };
      reader.onerror = () => {
        setUploadError('Failed to read image file');
      };
      reader.readAsDataURL(file);
    };

    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('target', 'icon');

      let res: Response | null = null;
      try {
        res = await fetch('/api/admin/content/upload-icon', {
          method: 'POST',
          body: fd,
        });
      } catch (e) {
        // network fetch error
      }

      if (!res || !res.ok) {
        try {
          const fallbackRes = await fetch('/api/admin/content/upload', {
            method: 'POST',
            body: fd,
          });
          if (fallbackRes.ok) {
            res = fallbackRes;
          }
        } catch (e) {
          // ignore fallback error
        }
      }

      if (res && res.ok) {
        const contentType = res.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const data = await res.json();
          if (data.success && data.url) {
            onChange(data.url);
            setPasteSuccess(true);
            setTimeout(() => setPasteSuccess(false), 3000);
            return;
          }
        }
      }

      // If server returned non-JSON/error page, seamlessly fallback to local Data URL
      useLocalDataUrl();
    } catch (err: any) {
      useLocalDataUrl();
    } finally {
      setIsUploading(false);
    }
  };

  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (items) {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item && item.type.indexOf('image') !== -1) {
          e.preventDefault();
          const file = item.getAsFile();
          if (file) {
            await uploadFile(file);
            return;
          }
        }
      }
    }

    // Check if pasted plain text is an image URL
    const text = e.clipboardData?.getData('text');
    if (
      text &&
      (text.startsWith('http://') ||
        text.startsWith('https://') ||
        text.startsWith('/'))
    ) {
      onChange(text.trim());
      setPasteSuccess(true);
      setTimeout(() => setPasteSuccess(false), 3000);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadFile(file);
    }
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      uploadFile(file);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Preview Badge */}
        <div
          className="w-12 h-12 rounded-full bg-[var(--color-gold-light)] flex items-center justify-center text-[var(--color-gold)] border border-[var(--color-gold)]/40 shrink-0 shadow-2xs overflow-hidden mx-auto sm:mx-0"
          title={isImage ? 'Uploaded Custom Image' : 'Emoji Icon'}
        >
          {isImage ? (
            <img src={icon} alt="Icon preview" className="w-6 h-6 object-contain" />
          ) : (
            <span className="text-2xl leading-none select-none">{icon || '✨'}</span>
          )}
        </div>

        {/* Upload & Paste Dropzone */}
        <div
          tabIndex={0}
          onPaste={handlePaste}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            'flex-1 border-2 border-dashed rounded-xl p-3 flex flex-col sm:flex-row items-center justify-between gap-2 cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]',
            isDragging
              ? 'border-[var(--color-gold)] bg-[var(--color-gold-light)]/40'
              : 'border-[var(--color-whisper)] hover:border-[var(--color-gold)] bg-[var(--color-white)]'
          )}
        >
          <div className="flex items-center gap-2.5 text-center sm:text-left">
            <span className="text-xl">📁</span>
            <div>
              <div className="text-xs font-medium text-[var(--color-ink)] flex flex-wrap items-center gap-1.5 justify-center sm:justify-start">
                <span>Upload from device</span>
                <span className="text-[var(--color-slate)] font-normal">or</span>
                <span className="px-1.5 py-0.5 bg-[var(--color-whisper)] text-[10px] font-mono rounded text-[var(--color-ink)] border border-[var(--color-slate)]/20">
                  Ctrl+V to paste
                </span>
              </div>
              <p className="text-[10px] text-[var(--color-slate)] mt-0.5">
                PNG, JPG, SVG, WebP from your device or clipboard
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isUploading ? (
              <span className="text-xs text-[var(--color-gold)] font-medium animate-pulse">
                Uploading...
              </span>
            ) : pasteSuccess ? (
              <span className="text-xs text-emerald-600 font-medium">✓ Image added!</span>
            ) : (
              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-[var(--color-snow)] hover:bg-[var(--color-whisper)] text-[var(--color-ink)] border border-[var(--color-whisper)] transition-colors">
                Browse file
              </span>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.svg"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      </div>

      {uploadError && <p className="text-xs text-rose-500">{uploadError}</p>}

      {/* Manual Emoji / URL input row */}
      <div className="flex items-center gap-2 pt-1">
        <span className="text-[11px] text-[var(--color-slate)] shrink-0">Emoji or Image URL:</span>
        <input
          type="text"
          value={icon || ''}
          placeholder="e.g. 🚚, 🎁, or /uploads/..."
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 text-xs px-2.5 py-1 rounded-md border border-[var(--color-whisper)] bg-[var(--color-white)] text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-gold)]"
        />
        {isImage && (
          <button
            type="button"
            onClick={() => onChange('✨')}
            className="text-[11px] text-rose-500 hover:underline shrink-0"
            title="Switch back to emoji"
          >
            Clear image
          </button>
        )}
      </div>
    </div>
  );
}

function ImageUploadField({
  imageUrl,
  onChange,
  aspectRatio = 'aspect-[3/4]',
}: {
  imageUrl: string;
  onChange: (url: string) => void;
  aspectRatio?: string;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [pasteSuccess, setPasteSuccess] = useState(false);

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    setUploadError(null);

    const useLocalDataUrl = () => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          onChange(reader.result);
          setPasteSuccess(true);
          setTimeout(() => setPasteSuccess(false), 3000);
        }
      };
      reader.onerror = () => setUploadError('Failed to read image');
      reader.readAsDataURL(file);
    };

    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('target', 'content');

      let res: Response | null = null;
      try {
        res = await fetch('/api/admin/content/upload', {
          method: 'POST',
          body: fd,
        });
      } catch {
        // try fallback
      }

      if (!res || !res.ok) {
        try {
          const fallbackRes = await fetch('/api/admin/content/upload-icon', {
            method: 'POST',
            body: fd,
          });
          if (fallbackRes.ok) res = fallbackRes;
        } catch {
          // ignore
        }
      }

      if (res && res.ok && res.headers.get('content-type')?.includes('application/json')) {
        const data = await res.json();
        if (data.success && data.url) {
          onChange(data.url);
          setPasteSuccess(true);
          setTimeout(() => setPasteSuccess(false), 3000);
          return;
        }
      }

      useLocalDataUrl();
    } catch {
      useLocalDataUrl();
    } finally {
      setIsUploading(false);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (items) {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item && item.type.indexOf('image') !== -1) {
          e.preventDefault();
          const file = item.getAsFile();
          if (file) {
            uploadFile(file);
            return;
          }
        }
      }
    }
    const textVal = e.clipboardData?.getData('text');
    if (textVal && (textVal.startsWith('http') || textVal.startsWith('/') || textVal.startsWith('data:image'))) {
      onChange(textVal.trim());
      setPasteSuccess(true);
      setTimeout(() => setPasteSuccess(false), 3000);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        {/* Thumbnail Preview */}
        <div className={cn('relative w-16 h-20 rounded-lg overflow-hidden bg-[var(--color-whisper)] border border-[var(--color-whisper)] flex-shrink-0 flex items-center justify-center text-xs text-[var(--color-slate)]', aspectRatio)}>
          {imageUrl ? (
            <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
          ) : (
            <span>No Image</span>
          )}
        </div>

        {/* Dropzone & Browse button */}
        <div
          tabIndex={0}
          onPaste={handlePaste}
          onClick={() => fileInputRef.current?.click()}
          className="flex-1 border-2 border-dashed border-[var(--color-whisper)] hover:border-[var(--color-gold)] rounded-xl p-3 bg-[var(--color-white)] cursor-pointer transition-colors flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left"
        >
          <div className="flex items-center gap-2">
            <span className="text-xl">🖼️</span>
            <div>
              <p className="text-xs font-medium text-[var(--color-ink)] flex items-center gap-1.5 justify-center sm:justify-start">
                <span>Upload from device</span>
                <span className="text-[var(--color-slate)]">or</span>
                <span className="px-1.5 py-0.5 bg-[var(--color-whisper)] text-[10px] font-mono rounded border">Ctrl+V paste</span>
              </p>
              <p className="text-[10px] text-[var(--color-slate)]">PNG, JPG, WebP supported</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isUploading ? (
              <span className="text-xs text-[var(--color-gold)] font-medium animate-pulse">Uploading...</span>
            ) : pasteSuccess ? (
              <span className="text-xs text-emerald-600 font-medium">✓ Image updated!</span>
            ) : (
              <span className="px-2.5 py-1 text-xs rounded-md bg-[var(--color-snow)] hover:bg-[var(--color-whisper)] text-[var(--color-ink)] border border-[var(--color-whisper)]">Browse file</span>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) uploadFile(file);
              e.target.value = '';
            }}
          />
        </div>
      </div>

      {uploadError && <p className="text-xs text-rose-500">{uploadError}</p>}

      {/* Direct URL input */}
      <div className="flex items-center gap-2 pt-1">
        <span className="text-[11px] text-[var(--color-slate)] shrink-0">Image Path / URL:</span>
        <input
          type="text"
          value={imageUrl || ''}
          placeholder="/images/products/... or https://..."
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 text-xs px-2.5 py-1 rounded-md border border-[var(--color-whisper)] bg-[var(--color-white)] text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-gold)]"
        />
        {imageUrl && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="text-[11px] text-rose-500 hover:underline shrink-0"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}

export default function AdminContentPage() {
  const [activeTab, setActiveTab] = useState('sections');
  const [editingSection, setEditingSection] = useState<string | null>('hero');
  const [contentState, setContentState] = useState<Record<string, any>>(defaultMockContent);
  const [formData, setFormData] = useState<Record<string, any>>(defaultMockContent['hero']);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Load saved content on mount
  useEffect(() => {
    let isMounted = true;

    fetch('/api/admin/content')
      .then((res) => {
        if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
          return res.json();
        }
        return null;
      })
      .then((data) => {
        if (isMounted && data?.success && data.content) {
          setContentState(data.content);
          if (editingSection && data.content[editingSection]) {
            setFormData(JSON.parse(JSON.stringify(data.content[editingSection])));
          }
        }
      })
      .catch((err) => console.error('Error loading content:', err));

    return () => {
      isMounted = false;
    };
  }, []);

  const handleEdit = (sectionId: string) => {
    setEditingSection(sectionId);
    setStatusMessage(null);
    const currentData = contentState[sectionId] || defaultMockContent[sectionId] || {};
    setFormData(JSON.parse(JSON.stringify(currentData)));
  };

  const handleSave = async () => {
    if (!editingSection) return;
    setIsSaving(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/admin/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sectionId: editingSection,
          data: formData,
        }),
      });

      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        throw new Error('Server returned an invalid response. Please restart the dev server to reload API routes.');
      }

      const result = await res.json();
      if (result.success) {
        setContentState((prev) => ({
          ...prev,
          [editingSection]: formData,
        }));
        const sectionLabel = contentSections.find((s) => s.id === editingSection)?.label || editingSection;
        setStatusMessage({
          type: 'success',
          text: `"${sectionLabel}" updated successfully! Your changes are now live on the homepage.`,
        });
      } else {
        setStatusMessage({
          type: 'error',
          text: result.error || 'Failed to save changes. Please try again.',
        });
      }
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Network error while saving.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const renderEditorPanel = () => {
    return (
      <>
        {editingSection === 'hero' ? (
                  <Card variant="elevated" padding="lg">
                    <CardHeader className="flex flex-row items-center justify-between border-b border-[var(--color-whisper)] pb-4 mb-6">
                      <div>
                        <Badge variant="outline" className="text-xs mb-2">HERO</Badge>
                        <CardTitle className="text-[var(--font-display)] text-lg">Homepage Hero & Header Navigation</CardTitle>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setEditingSection(null)}>Close</Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <HomepageHeroEditor
                        onCancel={() => setEditingSection(null)}
                        onSaved={() => {
                          // Saved hook
                        }}
                      />
                    </CardContent>
                  </Card>
                ) : editingSection === 'categories' ? (
                  <Card variant="elevated" padding="lg">
                    <CardHeader className="flex flex-row items-center justify-between border-b border-[var(--color-whisper)] pb-4 mb-6">
                      <div>
                        <Badge variant="outline" className="text-xs mb-2">CATEGORIES</Badge>
                        <CardTitle className="text-[var(--font-display)] text-lg">Category Showcase</CardTitle>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setEditingSection(null)}>Close</Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CategoryShowcaseEditor
                        onCancel={() => setEditingSection(null)}
                        onSaved={() => {
                          setStatusMessage({
                            type: 'success',
                            text: '"Category Showcase" updated successfully! Your changes are now live on the homepage.',
                          });
                        }}
                      />
                    </CardContent>
                  </Card>
                ) : editingSection === 'new-arrivals' ? (
                  <Card variant="elevated" padding="lg">
                    <CardHeader className="flex flex-row items-center justify-between border-b border-[var(--color-whisper)] pb-4 mb-6">
                      <div>
                        <Badge variant="outline" className="text-xs mb-2">NEW ARRIVALS</Badge>
                        <CardTitle className="text-[var(--font-display)] text-lg">New Arrivals Showcase</CardTitle>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setEditingSection(null)}>Close</Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <NewArrivalsEditor
                        onCancel={() => setEditingSection(null)}
                        onSaved={() => {
                          setStatusMessage({
                            type: 'success',
                            text: '"New Arrivals" updated successfully! Your changes are now live on the homepage.',
                          });
                        }}
                      />
                    </CardContent>
                  </Card>
                ) : editingSection === 'brand-story' ? (
                  <Card variant="elevated" padding="lg">
                    <CardHeader className="flex flex-row items-center justify-between border-b border-[var(--color-whisper)] pb-4 mb-6">
                      <div>
                        <Badge variant="outline" className="text-xs mb-2">OUR STORY</Badge>
                        <CardTitle className="text-[var(--font-display)] text-lg">Our Story · About Vidhya</CardTitle>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setEditingSection(null)}>Close</Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <BrandStoryEditor
                        onCancel={() => setEditingSection(null)}
                        onSaved={(savedData) => {
                          setContentState((prev) => ({
                            ...prev,
                            'brand-story': savedData,
                          }));
                        }}
                      />
                    </CardContent>
                  </Card>
                ) : editingSection === 'kurtis-page' ? (
                  <Card variant="elevated" padding="lg">
                    <CardHeader className="flex flex-row items-center justify-between border-b border-[var(--color-whisper)] pb-4 mb-6">
                      <div>
                        <Badge variant="outline" className="text-xs mb-2">COLLECTION PAGE</Badge>
                        <CardTitle className="text-[var(--font-display)] text-lg">Kurtis Page (/shop/kurtis)</CardTitle>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setEditingSection(null)}>Close</Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <KurtisPageEditor
                        onCancel={() => setEditingSection(null)}
                        onSaved={(savedData) => {
                          setContentState((prev) => ({
                            ...prev,
                            'kurtis-page': savedData,
                          }));
                        }}
                      />
                    </CardContent>
                  </Card>
                ) : editingSection === 'footer' ? (
                  <Card variant="elevated" padding="lg">
                    <CardHeader className="flex flex-row items-center justify-between border-b border-[var(--color-whisper)] pb-4 mb-6">
                      <div>
                        <Badge variant="outline" className="text-xs mb-2">GLOBAL COMPONENT</Badge>
                        <CardTitle className="text-[var(--font-display)] text-lg">Global Site Footer</CardTitle>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setEditingSection(null)}>Close</Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <FooterEditor
                        initialContent={contentState['footer']}
                        onCancel={() => setEditingSection(null)}
                        onSaved={(savedData) => {
                          setContentState((prev) => ({
                            ...prev,
                            footer: savedData,
                          }));
                        }}
                      />
                    </CardContent>
                  </Card>
                ) : editingSection === 'salwars-page' ? (
                  <Card variant="elevated" padding="lg">
                    <SalwarsPageEditor
                      onCancel={() => setEditingSection(null)}
                      onSaved={() => {
                        setStatusMessage({
                          type: 'success',
                          text: '"Salwars Page" updated successfully! Your changes are now live on /shop/salwars.',
                        });
                      }}
                    />
                  </Card>
                ) : editingSection === 'lehengas-page' ? (
                  <Card variant="elevated" padding="lg">
                    <LehengasPageEditor
                      onCancel={() => setEditingSection(null)}
                      onSaved={() => {
                        setStatusMessage({
                          type: 'success',
                          text: '"Lehengas Page" updated successfully! Your changes are now live on /shop/lehengas.',
                        });
                      }}
                    />
                  </Card>
                ) : editingSection === 'sarees-page' ? (
                  <Card variant="elevated" padding="lg">
                    <SareesPageEditor
                      onCancel={() => setEditingSection(null)}
                      onSaved={() => {
                        setStatusMessage({
                          type: 'success',
                          text: '"Sarees Page" updated successfully! Your changes are now live on /shop/sarees.',
                        });
                      }}
                    />
                  </Card>
                ) : editingSection === 'dupattas-page' ? (
                  <Card variant="elevated" padding="lg">
                    <DupattasPageEditor
                      onCancel={() => setEditingSection(null)}
                      onSaved={() => {
                        setStatusMessage({
                          type: 'success',
                          text: '"Dupattas Page" updated successfully! Your changes are now live on /shop/dupattas.',
                        });
                      }}
                    />
                  </Card>
                ) : editingSection === 'new-arrivals-page' ? (
                  <Card variant="elevated" padding="lg">
                    <NewArrivalsPageEditor
                      onCancel={() => setEditingSection(null)}
                      onSaved={() => {
                        setStatusMessage({
                          type: 'success',
                          text: '"New Arrivals Page" updated successfully! Your changes are now live on /new-arrivals.',
                        });
                      }}
                    />
                  </Card>
                ) : editingSection === 'sale-page' ? (
                  <Card variant="elevated" padding="lg">
                    <SalePageEditor
                      onCancel={() => setEditingSection(null)}
                      onSaved={() => {
                        setStatusMessage({
                          type: 'success',
                          text: '"Sale Page" updated successfully! Your changes are now live on /sale.',
                        });
                      }}
                    />
                  </Card>
                ) : editingSection === 'my-angelika-look' ? (
                  <Card variant="elevated" padding="lg">
                    <MyAngelikaLookEditor
                      onCancel={() => setEditingSection(null)}
                      onSaved={() => {
                        setStatusMessage({
                          type: 'success',
                          text: '"#MyAngelikaLook" updated successfully! Your changes are now live on the homepage.',
                        });
                      }}
                    />
                  </Card>
                ) : editingSection === 'privacy-policy-page' ? (
                  <Card variant="elevated" padding="lg">
                    <PrivacyPolicyPageEditor
                      onCancel={() => setEditingSection(null)}
                      onSaved={() => {
                        setStatusMessage({
                          type: 'success',
                          text: '"Privacy Policy" updated successfully! Your changes are now live on /privacy.',
                        });
                      }}
                    />
                  </Card>
                ) : editingSection === 'terms-page' ? (
                  <Card variant="elevated" padding="lg">
                    <TermsPageEditor
                      onCancel={() => setEditingSection(null)}
                      onSaved={() => {
                        setStatusMessage({
                          type: 'success',
                          text: '"Terms of Service" updated successfully! Your changes are now live on /terms.',
                        });
                      }}
                    />
                  </Card>
                ) : editingSection === 'cookies-page' ? (
                  <Card variant="elevated" padding="lg">
                    <CookiesPageEditor
                      onCancel={() => setEditingSection(null)}
                      onSaved={() => {
                        setStatusMessage({
                          type: 'success',
                          text: '"Cookie Policy" updated successfully! Your changes are now live on /cookies.',
                        });
                      }}
                    />
                  </Card>
                ) : editingSection === 'accessibility-page' ? (
                  <Card variant="elevated" padding="lg">
                    <AccessibilityPageEditor
                      onCancel={() => setEditingSection(null)}
                      onSaved={() => {
                        setStatusMessage({
                          type: 'success',
                          text: '"Accessibility Statement" updated successfully! Your changes are now live on /accessibility.',
                        });
                      }}
                    />
                  </Card>
                ) : editingSection === 'shop-page' ? (
                  <Card variant="elevated" padding="lg">
                    <ShopPageEditor
                      onCancel={() => setEditingSection(null)}
                      onSaved={() => {
                        setStatusMessage({
                          type: 'success',
                          text: '"Shop Page (All Collections)" updated successfully! Your changes are now live on /shop.',
                        });
                      }}
                    />
                  </Card>
                ) : editingSection === 'about-page' ? (
                  <Card variant="elevated" padding="lg">
                    <AboutPageEditor
                      onCancel={() => setEditingSection(null)}
                      onSaved={() => {
                        setStatusMessage({
                          type: 'success',
                          text: '"About Us Page" updated successfully! Your changes are now live on /about.',
                        });
                      }}
                    />
                  </Card>
                ) : editingSection === 'shipping-page' ? (
                  <Card variant="elevated" padding="lg">
                    <ShippingPageEditor
                      onCancel={() => setEditingSection(null)}
                      onSaved={() => {
                        setStatusMessage({
                          type: 'success',
                          text: '"Shipping Policy Page" updated successfully! Your changes are now live on /shipping.',
                        });
                      }}
                    />
                  </Card>
                ) : editingSection === 'returns-page' ? (
                  <Card variant="elevated" padding="lg">
                    <ReturnsPageEditor
                      onCancel={() => setEditingSection(null)}
                      onSaved={() => {
                        setStatusMessage({
                          type: 'success',
                          text: '"Returns & Size Exchanges" updated successfully! Your changes are now live on /returns.',
                        });
                      }}
                    />
                  </Card>
                ) : editingSection === 'size-finder-page' ? (
                  <Card variant="elevated" padding="lg">
                    <SizeFinderPageEditor
                      onCancel={() => setEditingSection(null)}
                      onSaved={() => {
                        setStatusMessage({
                          type: 'success',
                          text: '"Couture Fit Studio (Size Finder)" updated successfully! Your changes are now live on /size-finder.',
                        });
                      }}
                    />
                  </Card>
                ) : editingSection === 'size-guide-page' ? (
                  <Card variant="elevated" padding="lg">
                    <SizeGuidePageEditor
                      onCancel={() => setEditingSection(null)}
                      onSaved={() => {
                        setStatusMessage({
                          type: 'success',
                          text: '"Garment Size Guide" updated successfully! Your changes are now live on /size-guide.',
                        });
                      }}
                    />
                  </Card>
                ) : editingSection === 'faq-page' ? (
                  <Card variant="elevated" padding="lg">
                    <FAQPageEditor
                      onCancel={() => setEditingSection(null)}
                      onSaved={() => {
                        setStatusMessage({
                          type: 'success',
                          text: '"FAQ & Help Center" updated successfully! Your changes are now live on /faq.',
                        });
                      }}
                    />
                  </Card>
                ) : editingSection === 'contact-page' ? (
                  <Card variant="elevated" padding="lg">
                    <ContactPageEditor
                      onCancel={() => setEditingSection(null)}
                      onSaved={() => {
                        setStatusMessage({
                          type: 'success',
                          text: '"Contact Us & Concierge Studio" updated successfully! Your changes are now live on /contact.',
                        });
                      }}
                    />
                  </Card>
                ) : editingSection === 'wholesale-page' ? (
                  <Card variant="elevated" padding="lg">
                    <WholesalePageEditor
                      onCancel={() => setEditingSection(null)}
                      onSaved={() => {
                        setStatusMessage({
                          type: 'success',
                          text: '"Wholesale & B2B Inquiries" updated successfully! Your changes are now live on /wholesale.',
                        });
                      }}
                    />
                  </Card>
                ) : editingSection === 'designer-vidhya-page' ? (
                  <Card variant="elevated" padding="lg">
                    <DesignerVidhyaPageEditor
                      onCancel={() => setEditingSection(null)}
                      onSaved={() => {
                        setStatusMessage({
                          type: 'success',
                          text: '"Meet Designer Vidhya" updated successfully! Your changes are now live on /about/vidhya.',
                        });
                      }}
                    />
                  </Card>
                ) : editingSection ? (
                  <Card variant="elevated" padding="lg">
                    <CardHeader className="flex flex-row items-center justify-between border-b border-[var(--color-whisper)] pb-4 mb-6">
                      <div>
                        <Badge variant="outline" className="text-xs mb-2">
                          {contentSections.find((s) => s.id === editingSection)?.type}
                        </Badge>
                        <CardTitle className="text-[var(--font-display)] text-lg">
                          {contentSections.find((s) => s.id === editingSection)?.label}
                        </CardTitle>
                      </div>
                      <div className="flex gap-2 items-center">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setEditingSection(null);
                            setStatusMessage(null);
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="primary"
                          onClick={handleSave}
                          disabled={isSaving}
                        >
                          {isSaving ? 'Saving Changes...' : 'Save Changes'}
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {/* Status Notification */}
                      {statusMessage && (
                        <div
                          className={cn(
                            'p-3.5 rounded-xl text-xs sm:text-sm mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border',
                            statusMessage.type === 'success'
                              ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                              : 'bg-rose-50 text-rose-900 border-rose-200'
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-base">{statusMessage.type === 'success' ? '✓' : '⚠️'}</span>
                            <span className="font-medium">{statusMessage.text}</span>
                          </div>
                          {statusMessage.type === 'success' && (
                            <Link
                              href="/"
                              target="_blank"
                              className="font-semibold text-emerald-800 underline hover:text-emerald-950 inline-flex items-center gap-1 shrink-0"
                            >
                              <span>View Homepage</span>
                              <span>↗</span>
                            </Link>
                          )}
                        </div>
                      )}

                      <div className="space-y-6">
                        {editingSection === 'categories' && (
                          <div className="space-y-6">
                            <div>
                              <div className="flex items-center justify-between mb-4">
                                <div>
                                  <h3 className="font-semibold text-sm text-[var(--color-ink)]">Category Cards (8 Categories across 5 Rows)</h3>
                                  <p className="text-xs text-[var(--color-slate)]">Configure Category Name and Image for each banner</p>
                                </div>
                              </div>

                              <div className="space-y-4">
                                {(((formData['items'] as any[]) && (formData['items'] as any[]).length > 0)
                                  ? (formData['items'] as any[])
                                  : defaultMockContent['categories'].items
                                ).map((cat: any, i: number) => (
                                  <div key={i} className="p-4 border border-[var(--color-whisper)] rounded-xl bg-[var(--color-snow)]/40 space-y-4">
                                    <div className="flex items-center justify-between border-b border-[var(--color-whisper)] pb-2">
                                      <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-gold)]">
                                        #{i + 1}. {cat.title || 'Untitled'}
                                      </span>
                                    </div>
                                    <div>
                                      <label className="text-xs font-semibold text-[var(--color-ink)] mb-1 block">
                                        Category Name
                                      </label>
                                      <Input
                                        value={cat.title || ''}
                                        placeholder="Category Name"
                                        onChange={(e) => {
                                          const items = [...(((formData['items'] as any[]) && (formData['items'] as any[]).length > 0) ? (formData['items'] as any[]) : defaultMockContent['categories'].items)];
                                          items[i] = { ...items[i], title: e.target.value };
                                          setFormData({ ...formData, items });
                                        }}
                                      />
                                    </div>
                                    <div>
                                      <label className="text-xs font-semibold text-[var(--color-ink)] mb-1 block">
                                        Category Image
                                      </label>
                                      <ImageUploadField
                                        aspectRatio="aspect-[4/3]"
                                        imageUrl={cat.image || ''}
                                        onChange={(newUrl) => {
                                          const items = [...(((formData['items'] as any[]) && (formData['items'] as any[]).length > 0) ? (formData['items'] as any[]) : defaultMockContent['categories'].items)];
                                          items[i] = { ...items[i], image: newUrl };
                                          setFormData({ ...formData, items });
                                        }}
                                      />
                                    </div>
                                    <div>
                                      <label className="text-xs font-medium text-[var(--color-slate)] mb-1 block">
                                        Link URL
                                      </label>
                                      <Input
                                        value={cat.href || ''}
                                        placeholder="/shop/salwars"
                                        onChange={(e) => {
                                          const items = [...(((formData['items'] as any[]) && (formData['items'] as any[]).length > 0) ? (formData['items'] as any[]) : defaultMockContent['categories'].items)];
                                          items[i] = { ...items[i], href: e.target.value };
                                          setFormData({ ...formData, items });
                                        }}
                                      />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                        {editingSection === 'vidhyas-picks' && (
                          <div className="space-y-6">
                            {/* Section Header */}
                            <div className="p-4 border border-[var(--color-whisper)] rounded-xl bg-[var(--color-snow)]/30 space-y-4">
                              <h3 className="font-semibold text-sm text-[var(--color-ink)]">Section Header Settings</h3>
                              <div className="grid sm:grid-cols-2 gap-4">
                                <Input
                                  label="Eyebrow Badge"
                                  value={formData['badge'] ?? "Vidhya's Picks"}
                                  placeholder="Vidhya's Picks"
                                  onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                                />
                                <Input
                                  label="Headline"
                                  value={formData['title'] ?? "Handpicked by Vidhya"}
                                  placeholder="Handpicked by Vidhya"
                                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                />
                                <Input
                                  label="Gold Highlight Word"
                                  value={formData['titleHighlight'] ?? "Vidhya"}
                                  placeholder="Vidhya"
                                  onChange={(e) => setFormData({ ...formData, titleHighlight: e.target.value })}
                                />
                                <Input
                                  label="CTA Button Text"
                                  value={formData['ctaText'] ?? "View All Picks"}
                                  placeholder="View All Picks"
                                  onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
                                />
                                <Input
                                  label="CTA Button Link"
                                  value={formData['ctaLink'] ?? "/vidhyas-picks"}
                                  placeholder="/vidhyas-picks"
                                  onChange={(e) => setFormData({ ...formData, ctaLink: e.target.value })}
                                />
                              </div>
                            </div>

                            {/* Product Cards */}
                            <div>
                              <div className="flex items-center justify-between mb-4">
                                <div>
                                  <h3 className="font-semibold text-sm text-[var(--color-ink)]">Featured Product Cards</h3>
                                  <p className="text-xs text-[var(--color-slate)]">Edit images, titles, prices, and badges shown in Vidhya's Picks on homepage</p>
                                </div>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    const currentItems = (formData['items'] as any[]) || defaultMockContent['vidhyas-picks'].items;
                                    const nextIdx = currentItems.length + 1;
                                    const items = [
                                      ...currentItems,
                                      {
                                        id: `vp-${Date.now()}`,
                                        name: `New Curated Ensemble ${nextIdx}`,
                                        category: 'Kurtis',
                                        price: 4999,
                                        originalPrice: 5999,
                                        compare_at_price: 5999,
                                        discount: 17,
                                        image: '/images/products/kurti-ajrakh-1.jpg',
                                        slug: `curated-ensemble-${nextIdx}`,
                                        badge: "VIDHYA'S PICK",
                                        isVidhyasPick: true,
                                      },
                                    ];
                                    setFormData({ ...formData, items });
                                  }}
                                >
                                  + Add Product Card
                                </Button>
                              </div>

                              <div className="space-y-4">
                                {(((formData['items'] as any[]) && (formData['items'] as any[]).length > 0)
                                  ? (formData['items'] as any[])
                                  : defaultMockContent['vidhyas-picks'].items
                                ).map((card: any, i: number) => (
                                  <div key={card.id || i} className="p-4 border border-[var(--color-whisper)] rounded-xl bg-[var(--color-snow)]/40 space-y-4">
                                    <div className="flex items-center justify-between border-b border-[var(--color-whisper)] pb-2">
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-gold)]">
                                          Card {i + 1}: {card.name || 'Untitled Product'}
                                        </span>
                                        {card.badge && (
                                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--color-gold-light)] text-[var(--color-gold)] font-medium">
                                            {card.badge}
                                          </span>
                                        )}
                                      </div>
                                      {(((formData['items'] as any[]) || defaultMockContent['vidhyas-picks'].items).length > 1) && (
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const items = [...(((formData['items'] as any[]) || defaultMockContent['vidhyas-picks'].items))];
                                            items.splice(i, 1);
                                            setFormData({ ...formData, items });
                                          }}
                                          className="text-xs text-rose-500 hover:text-rose-700 font-medium"
                                        >
                                          Remove Card
                                        </button>
                                      )}
                                    </div>

                                    <div>
                                      <label className="text-xs font-medium text-[var(--color-slate)] mb-1 block">
                                        Product Image (Upload from device, drag-and-drop, or Ctrl+V paste)
                                      </label>
                                      <ImageUploadField
                                        aspectRatio="aspect-[3/4]"
                                        imageUrl={card.image || ''}
                                        onChange={(newUrl) => {
                                          const items = [...(((formData['items'] as any[]) && (formData['items'] as any[]).length > 0) ? (formData['items'] as any[]) : defaultMockContent['vidhyas-picks'].items)];
                                          items[i] = { ...items[i], image: newUrl };
                                          setFormData({ ...formData, items });
                                        }}
                                      />
                                    </div>

                                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                      <div className="sm:col-span-2">
                                        <Input
                                          label="Product Title"
                                          value={card.name || ''}
                                          placeholder="Kutch Ajrakh Modal Silk Kurti"
                                          onChange={(e) => {
                                            const items = [...(((formData['items'] as any[]) && (formData['items'] as any[]).length > 0) ? (formData['items'] as any[]) : defaultMockContent['vidhyas-picks'].items)];
                                            items[i] = { ...items[i], name: e.target.value };
                                            setFormData({ ...formData, items });
                                          }}
                                        />
                                      </div>
                                      <div>
                                        <Input
                                          label="Category"
                                          value={card.category || ''}
                                          placeholder="Kurtis"
                                          onChange={(e) => {
                                            const items = [...(((formData['items'] as any[]) && (formData['items'] as any[]).length > 0) ? (formData['items'] as any[]) : defaultMockContent['vidhyas-picks'].items)];
                                            items[i] = { ...items[i], category: e.target.value };
                                            setFormData({ ...formData, items });
                                          }}
                                        />
                                      </div>
                                      <div>
                                        <Input
                                          label="Sale Price (₹)"
                                          value={card.price ?? ''}
                                          placeholder="4999"
                                          onChange={(e) => {
                                            const items = [...(((formData['items'] as any[]) && (formData['items'] as any[]).length > 0) ? (formData['items'] as any[]) : defaultMockContent['vidhyas-picks'].items)];
                                            const val = e.target.value.replace(/[^0-9.]/g, '');
                                            items[i] = { ...items[i], price: val ? Number(val) : '' };
                                            setFormData({ ...formData, items });
                                          }}
                                        />
                                      </div>
                                      <div>
                                        <Input
                                          label="Original Price / MRP (₹)"
                                          value={card.originalPrice ?? card.compare_at_price ?? ''}
                                          placeholder="5999"
                                          onChange={(e) => {
                                            const items = [...(((formData['items'] as any[]) && (formData['items'] as any[]).length > 0) ? (formData['items'] as any[]) : defaultMockContent['vidhyas-picks'].items)];
                                            const val = e.target.value.replace(/[^0-9.]/g, '');
                                            items[i] = {
                                              ...items[i],
                                              originalPrice: val ? Number(val) : '',
                                              compare_at_price: val ? Number(val) : '',
                                            };
                                            setFormData({ ...formData, items });
                                          }}
                                        />
                                      </div>
                                      <div>
                                        <Input
                                          label="Badge Text"
                                          value={card.badge || "VIDHYA'S PICK"}
                                          placeholder="VIDHYA'S PICK"
                                          onChange={(e) => {
                                            const items = [...(((formData['items'] as any[]) && (formData['items'] as any[]).length > 0) ? (formData['items'] as any[]) : defaultMockContent['vidhyas-picks'].items)];
                                            items[i] = { ...items[i], badge: e.target.value };
                                            setFormData({ ...formData, items });
                                          }}
                                        />
                                      </div>
                                      <div className="sm:col-span-2 lg:col-span-3">
                                        <Input
                                          label="Product Slug / URL"
                                          value={card.slug || ''}
                                          placeholder="kutch-ajrakh-modal-silk-kurti"
                                          onChange={(e) => {
                                            const items = [...(((formData['items'] as any[]) && (formData['items'] as any[]).length > 0) ? (formData['items'] as any[]) : defaultMockContent['vidhyas-picks'].items)];
                                            items[i] = { ...items[i], slug: e.target.value };
                                            setFormData({ ...formData, items });
                                          }}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                        {editingSection === 'brand-story' && (
                          <div className="space-y-4">
                            <Input
                              label="Headline"
                              value={formData['title'] || ''}
                              placeholder="Artisanal Luxury, Rooted in Indian Heritage"
                              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            />
                            <Textarea
                              label="Full Story"
                              value={formData['story'] || ''}
                              placeholder="Every piece in the Angelika collection..."
                              onChange={(e) => setFormData({ ...formData, story: e.target.value })}
                              rows={5}
                            />
                            <Input
                              label="Quote"
                              value={formData['quote'] || ''}
                              placeholder='"Fashion that honors where you come from..."'
                              onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
                            />
                            <div>
                              <label className="text-xs font-medium text-[var(--color-slate)] mb-1 block">
                                Story Image
                              </label>
                              <ImageUploadField
                                aspectRatio="aspect-video"
                                imageUrl={formData['image'] || defaultMockContent['brand-story'].image}
                                onChange={(newUrl) => setFormData({ ...formData, image: newUrl })}
                              />
                            </div>
                          </div>
                        )}

                        {editingSection === 'newsletter' && (
                          <div className="space-y-4">
                            <Input
                              label="Headline"
                              value={formData['title'] || ''}
                              placeholder="Join the Angelika Circle"
                              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            />
                            <Textarea
                              label="Subtitle"
                              value={formData['subtitle'] || ''}
                              placeholder="Receive exclusive invitations to preview new arrivals..."
                              onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                              rows={3}
                            />
                            <Input
                              label="Button Text"
                              value={formData['buttonText'] || 'Subscribe'}
                              placeholder="Subscribe"
                              onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                            />
                          </div>
                        )}

                        {editingSection === 'founder-note' && (
                          <div className="space-y-4">
                            <Textarea
                              label="Founder's Quote"
                              value={formData['quote'] || ''}
                              onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
                              rows={4}
                              placeholder='"I started Angelika because..."'
                            />
                            <Textarea
                              label="Full Story"
                              value={formData['story'] || ''}
                              onChange={(e) => setFormData({ ...formData, story: e.target.value })}
                              rows={8}
                              placeholder="Tell your story..."
                            />
                          </div>
                        )}

                        {!['hero', 'categories', 'vidhyas-picks', 'brand-story', 'newsletter', 'founder-note'].includes(editingSection) && (
                          <div className="text-center py-8">
                            <p className="text-[var(--color-slate)] mb-4">Editor for "{contentSections.find((s) => s.id === editingSection)?.label}" coming soon.</p>
                            <p className="text-sm text-[var(--color-mist)]">This will include appropriate fields for {contentSections.find((s) => s.id === editingSection)?.type} content type.</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card variant="outlined" padding="lg" className="text-center h-full min-h-[400px] flex flex-col justify-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-[var(--radius-xl)] bg-[var(--color-gold-light)] flex items-center justify-center text-3xl">✏️</div>
                    <h3 className="text-[var(--font-display)] text-xl text-[var(--color-ink)] mb-2">Select a Section to Edit</h3>
                    <p className="text-[var(--color-slate)]">Choose from the sidebar to edit homepage sections, about page content, or other site content.</p>
                  </Card>
                )}
      </>
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div
        className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1 className="text-[var(--font-display)] text-3xl font-medium text-[var(--color-ink)]">Content Management</h1>
          <p className="text-[var(--color-slate)] mt-1">Zero-code editing for Vidhya - update text, icons, and layout with instant homepage sync</p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-2 px-4 py-2 border border-[var(--color-whisper)] rounded-lg text-xs font-medium text-[var(--color-ink)] hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] transition-colors bg-[var(--color-white)] shadow-2xs"
          >
            <span>View Live Homepage</span>
            <span className="text-sm">↗</span>
          </Link>
        </div>
        <Link
          href="/"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[var(--color-snow)] hover:bg-[var(--color-whisper)] text-xs font-semibold text-[var(--color-ink)] border border-[var(--color-whisper)] transition-colors self-start sm:self-auto"
        >
          <span>View Live Storefront</span>
          <span>↗</span>
        </Link>
      </motion.div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="flex gap-2 mb-6">
          <TabsTrigger value="sections">Sections</TabsTrigger>
          <TabsTrigger value="media">Media Library</TabsTrigger>
          <TabsTrigger value="blog">Blog Posts</TabsTrigger>
          <TabsTrigger value="pages">Static Pages</TabsTrigger>
        </TabsList>

        {/* Sections Tab */}
        <TabsContent value="sections">
          <motion.div
            className="grid lg:grid-cols-3 gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Sections List */}
            <div className="lg:col-span-1">
              <Card variant="elevated" padding="none">
                <CardHeader className="p-4 border-b border-[var(--color-whisper)]">
                  <CardTitle className="text-[var(--font-display)] text-base">Editable Sections</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-[var(--color-whisper)]">
                    {contentSections.map((section) => (
                      <motion.div
                        key={section.id}
                        className={cn(
                          'p-4 hover:bg-[var(--color-snow)] transition-colors cursor-pointer border-l-4',
                          editingSection === section.id ? 'bg-[var(--color-gold-light)] border-[var(--color-gold)]' : 'border-transparent'
                        )}
                        onClick={() => handleEdit(section.id)}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.05 }}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium text-[var(--color-ink)] text-sm">{section.label}</h4>
                          <Badge variant="outline" className="text-[10px] capitalize">{section.type}</Badge>
                        </div>
                        <p className="text-xs text-[var(--color-slate)]">Click to edit</p>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Editor Panel */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                {renderEditorPanel()}
              </motion.div>
            </div>
          </motion.div>
        </TabsContent>

        {/* Media Library Tab */}
        <TabsContent value="media">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h2 className="text-[var(--font-display)] text-xl font-medium text-[var(--color-ink)]">Media Library</h2>
                <p className="text-[var(--color-slate)]">Manage images and assets used across the site</p>
              </div>
              <Button variant="primary">Upload Files</Button>
            </div>

            <Card variant="elevated" padding="none">
              <CardContent className="p-0">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-4">
                  {mediaItems.map((item) => (
                    <motion.div
                      key={item.id}
                      className="relative group"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.05 }}
                    >
                      <div className="aspect-square rounded-[var(--radius-lg)] overflow-hidden bg-[var(--color-whisper)]">
                        <Image src={item.url} alt={item.name} fill className="object-cover" sizes="200px" />
                      </div>
                      <div className="p-3">
                        <p className="font-medium text-[var(--color-ink)] truncate text-sm">{item.name}</p>
                        <p className="text-xs text-[var(--color-slate)]">{item.type} • {item.size}</p>
                        <p className="text-xs text-[var(--color-gold)] mt-1">Used in: {item.usedIn.length} places</p>
                      </div>
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="sm" className="p-1.5 bg-[var(--color-white)]/90 rounded-full">
                          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 10l-5 5-5-5M12 15V3" /></svg>
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Blog Posts Tab */}
        <TabsContent value="blog">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h2 className="text-[var(--font-display)] text-xl font-medium text-[var(--color-ink)]">Blog & Editorials</h2>
                <p className="text-[var(--color-slate)]">Styling guides, artisan stories, and brand updates</p>
              </div>
              <Button variant="primary">New Post</Button>
            </div>

            <Card variant="elevated" padding="none">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Author</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">The Art of Hand Block Printing</TableCell>
                      <TableCell>Vidhya</TableCell>
                      <TableCell>Craft & Technique</TableCell>
                      <TableCell>Jan 15, 2026</TableCell>
                      <TableCell><Badge variant="outline">Published</Badge></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Static Pages Tab */}
        <TabsContent value="pages">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {editingSection ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-4 border-b border-[var(--color-whisper)]">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingSection(null);
                      setStatusMessage(null);
                    }}
                    className="text-xs flex items-center gap-1.5 border-[var(--color-gold)] text-[var(--color-ink)] hover:bg-[var(--color-gold)]/10 font-semibold"
                  >
                    <span>←</span>
                    <span>Back to Static Pages List</span>
                  </Button>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[var(--color-slate)]">Currently Editing:</span>
                    <Badge variant="outline" className="text-xs text-amber-700 bg-amber-50 border-amber-200 font-semibold">
                      {contentSections.find((s) => s.id === editingSection)?.label || editingSection}
                    </Badge>
                  </div>
                </div>
                {renderEditorPanel()}
              </div>
            ) : (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h2 className="text-[var(--font-display)] text-xl font-medium text-[var(--color-ink)]">Static Pages</h2>
                <p className="text-[var(--color-slate)]">Manage legal pages, contact info, and policies</p>
              </div>
            </div>

            <Card variant="elevated" padding="none">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Page</TableHead>
                      <TableHead>Path</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Updated</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow className="hover:bg-[var(--color-snow)] transition-colors">
                      <TableCell className="font-medium flex items-center gap-2">
                        <span>Shop Page (All Collections)</span>
                        <Badge variant="outline" className="text-[10px] text-emerald-700 bg-emerald-50 border-emerald-200">
                          Main Catalog
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Link href="/shop" target="_blank" className="text-[var(--color-gold)] hover:underline flex items-center gap-1 font-mono text-xs">
                          <span>/shop</span>
                          <span className="text-[10px]">↗</span>
                        </Link>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Live on Storefront
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-[var(--color-slate)]">Active</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingSection('shop-page');
                          }}
                          className="text-xs border-[var(--color-gold)] text-[var(--color-ink)] hover:bg-[var(--color-gold)]/10 font-semibold"
                        >
                          Manage Page
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow className="hover:bg-[var(--color-snow)] transition-colors">
                      <TableCell className="font-medium flex items-center gap-2">
                        <span>Kurtis Page</span>
                        <Badge variant="outline" className="text-[10px] text-emerald-700 bg-emerald-50 border-emerald-200">
                          Live Catalog
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Link href="/shop/kurtis" target="_blank" className="text-[var(--color-gold)] hover:underline flex items-center gap-1 font-mono text-xs">
                          <span>/shop/kurtis</span>
                          <span className="text-[10px]">↗</span>
                        </Link>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Live on Storefront
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-[var(--color-slate)]">Active</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            handleEdit('kurtis-page');
                          }}
                          className="text-xs border-[var(--color-gold)] text-[var(--color-ink)] hover:bg-[var(--color-gold)]/10"
                        >
                          Manage Page
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow className="hover:bg-[var(--color-snow)] transition-colors">
                      <TableCell className="font-medium flex items-center gap-2">
                        <span>Footer</span>
                        <Badge variant="outline" className="text-[10px] text-amber-700 bg-amber-50 border-amber-200">
                          Global Component
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-xs text-[var(--color-slate)]">Global Site Footer</span>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Live on All Pages
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-[var(--color-slate)]">Active</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            handleEdit('footer');
                          }}
                          className="text-xs border-[var(--color-gold)] text-[var(--color-ink)] hover:bg-[var(--color-gold)]/10"
                        >
                          Manage Footer
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow className="hover:bg-[var(--color-snow)] transition-colors">
                      <TableCell className="font-medium flex items-center gap-2">
                        <span>About Us Page</span>
                        <Badge variant="outline" className="text-[10px] text-emerald-700 bg-emerald-50 border-emerald-200">
                          Brand Story
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Link href="/about" target="_blank" className="text-[var(--color-gold)] hover:underline flex items-center gap-1 font-mono text-xs">
                          <span>/about</span>
                          <span className="text-[10px]">↗</span>
                        </Link>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Live on Storefront
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-[var(--color-slate)]">Active</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingSection('about-page');
                          }}
                          className="text-xs border-[var(--color-gold)] text-[var(--color-ink)] hover:bg-[var(--color-gold)]/10 font-semibold"
                        >
                          Manage Page
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow className="hover:bg-[var(--color-snow)] transition-colors">
                      <TableCell className="font-medium flex items-center gap-2">
                        <span>Shipping Policy Page</span>
                        <Badge variant="outline" className="text-[10px] text-emerald-700 bg-emerald-50 border-emerald-200">
                          Customer Care
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Link href="/shipping" target="_blank" className="text-[var(--color-gold)] hover:underline flex items-center gap-1 font-mono text-xs">
                          <span>/shipping</span>
                          <span className="text-[10px]">↗</span>
                        </Link>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Live on Storefront
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-[var(--color-slate)]">Active</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingSection('shipping-page');
                          }}
                          className="text-xs border-[var(--color-gold)] text-[var(--color-ink)] hover:bg-[var(--color-gold)]/10 font-semibold"
                        >
                          Manage Page
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow className="hover:bg-[var(--color-snow)] transition-colors">
                      <TableCell className="font-medium flex items-center gap-2">
                        <span>Returns & Size Exchanges</span>
                        <Badge variant="outline" className="text-[10px] text-emerald-700 bg-emerald-50 border-emerald-200">
                          Customer Care
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Link href="/returns" target="_blank" className="text-[var(--color-gold)] hover:underline flex items-center gap-1 font-mono text-xs">
                          <span>/returns</span>
                          <span className="text-[10px]">↗</span>
                        </Link>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Live on Storefront
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-[var(--color-slate)]">Active</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingSection('returns-page');
                          }}
                          className="text-xs border-[var(--color-gold)] text-[var(--color-ink)] hover:bg-[var(--color-gold)]/10 font-semibold"
                        >
                          Manage Page
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow className="hover:bg-[var(--color-snow)] transition-colors">
                      <TableCell className="font-medium flex items-center gap-2">
                        <span>Couture Fit Studio</span>
                        <Badge variant="outline" className="text-[10px] text-amber-700 bg-amber-50 border-amber-200">
                          Interactive Studio
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Link href="/size-finder" target="_blank" className="text-[var(--color-gold)] hover:underline flex items-center gap-1 font-mono text-xs">
                          <span>/size-finder</span>
                          <span className="text-[10px]">↗</span>
                        </Link>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Live on Storefront
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-[var(--color-slate)]">Active</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingSection('size-finder-page');
                          }}
                          className="text-xs border-[var(--color-gold)] text-[var(--color-ink)] hover:bg-[var(--color-gold)]/10 font-semibold"
                        >
                          Manage Page
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow className="hover:bg-[var(--color-snow)] transition-colors">
                      <TableCell className="font-medium flex items-center gap-2">
                        <span>Garment Size Guide</span>
                        <Badge variant="outline" className="text-[10px] text-emerald-700 bg-emerald-50 border-emerald-200">
                          Measurement Charts
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Link href="/size-guide" target="_blank" className="text-[var(--color-gold)] hover:underline flex items-center gap-1 font-mono text-xs">
                          <span>/size-guide</span>
                          <span className="text-[10px]">↗</span>
                        </Link>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Live on Storefront
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-[var(--color-slate)]">Active</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingSection('size-guide-page');
                          }}
                          className="text-xs border-[var(--color-gold)] text-[var(--color-ink)] hover:bg-[var(--color-gold)]/10 font-semibold"
                        >
                          Manage Page
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow className="hover:bg-[var(--color-snow)] transition-colors">
                      <TableCell className="font-medium flex items-center gap-2">
                        <span>FAQ & Help Center</span>
                        <Badge variant="outline" className="text-[10px] text-blue-700 bg-blue-50 border-blue-200">
                          Customer Support
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Link href="/faq" target="_blank" className="text-[var(--color-gold)] hover:underline flex items-center gap-1 font-mono text-xs">
                          <span>/faq</span>
                          <span className="text-[10px]">↗</span>
                        </Link>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Live on Storefront
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-[var(--color-slate)]">Active</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingSection('faq-page');
                          }}
                          className="text-xs border-[var(--color-gold)] text-[var(--color-ink)] hover:bg-[var(--color-gold)]/10 font-semibold"
                        >
                          Manage Page
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow className="hover:bg-[var(--color-snow)] transition-colors">
                      <TableCell className="font-medium flex items-center gap-2">
                        <span>Contact Us & Concierge Studio</span>
                        <Badge variant="outline" className="text-[10px] text-emerald-700 bg-emerald-50 border-emerald-200">
                          Bespoke Inquiries
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Link href="/contact" target="_blank" className="text-[var(--color-gold)] hover:underline flex items-center gap-1 font-mono text-xs">
                          <span>/contact</span>
                          <span className="text-[10px]">↗</span>
                        </Link>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Live on Storefront
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-[var(--color-slate)]">Active</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingSection('contact-page');
                          }}
                          className="text-xs border-[var(--color-gold)] text-[var(--color-ink)] hover:bg-[var(--color-gold)]/10 font-semibold"
                        >
                          Manage Page
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow className="hover:bg-[var(--color-snow)] transition-colors">
                      <TableCell className="font-medium flex items-center gap-2">
                        <span>Wholesale & B2B Inquiries</span>
                        <Badge variant="outline" className="text-[10px] text-amber-700 bg-amber-50 border-amber-200">
                          B2B Partnerships
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Link href="/wholesale" target="_blank" className="text-[var(--color-gold)] hover:underline flex items-center gap-1 font-mono text-xs">
                          <span>/wholesale</span>
                          <span className="text-[10px]">↗</span>
                        </Link>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Live on Storefront
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-[var(--color-slate)]">Active</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingSection('wholesale-page');
                          }}
                          className="text-xs border-[var(--color-gold)] text-[var(--color-ink)] hover:bg-[var(--color-gold)]/10 font-semibold"
                        >
                          Manage Page
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow className="hover:bg-[var(--color-snow)] transition-colors">
                      <TableCell className="font-medium flex items-center gap-2">
                        <span>Meet Designer Vidhya</span>
                        <Badge variant="outline" className="text-[10px] text-amber-700 bg-amber-50 border-amber-200">
                          Atelier & Heritage
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Link href="/about/vidhya" target="_blank" className="text-[var(--color-gold)] hover:underline flex items-center gap-1 font-mono text-xs">
                          <span>/about/vidhya</span>
                          <span className="text-[10px]">↗</span>
                        </Link>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Live on Storefront
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-[var(--color-slate)]">Active</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingSection('designer-vidhya-page');
                          }}
                          className="text-xs border-[var(--color-gold)] text-[var(--color-ink)] hover:bg-[var(--color-gold)]/10 font-semibold"
                        >
                          Manage Page
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Salwars Page</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span>/shop/salwars</span>
                          <button
                            onClick={() => {
                              setEditingSection('salwars-page');
                            }}
                            className="text-xs px-2 py-0.5 rounded bg-[var(--color-gold)]/20 text-[var(--color-gold)] hover:bg-[var(--color-gold)]/30 font-semibold transition-colors"
                          >
                            Edit
                          </button>
                        </div>
                      </TableCell>
                      <TableCell>Live Storefront</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Lehengas Page</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span>/shop/lehengas</span>
                          <button
                            onClick={() => {
                              setEditingSection('lehengas-page');
                            }}
                            className="text-xs px-2 py-0.5 rounded bg-[var(--color-gold)]/20 text-[var(--color-gold)] hover:bg-[var(--color-gold)]/30 font-semibold transition-colors"
                          >
                            Edit
                          </button>
                        </div>
                      </TableCell>
                      <TableCell>Live Storefront</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Sarees Page</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span>/shop/sarees</span>
                          <button
                            onClick={() => {
                              setEditingSection('sarees-page');
                            }}
                            className="text-xs px-2 py-0.5 rounded bg-[var(--color-gold)]/20 text-[var(--color-gold)] hover:bg-[var(--color-gold)]/30 font-semibold transition-colors"
                          >
                            Edit
                          </button>
                        </div>
                      </TableCell>
                      <TableCell>Live Storefront</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Dupattas Page</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span>/shop/dupattas</span>
                          <button
                            onClick={() => {
                              setEditingSection('dupattas-page');
                            }}
                            className="text-xs px-2 py-0.5 rounded bg-[var(--color-gold)]/20 text-[var(--color-gold)] hover:bg-[var(--color-gold)]/30 font-semibold transition-colors"
                          >
                            Edit
                          </button>
                        </div>
                      </TableCell>
                      <TableCell>Live Storefront</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">New Arrivals Page</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span>/new-arrivals</span>
                          <button
                            onClick={() => {
                              setEditingSection('new-arrivals-page');
                            }}
                            className="text-xs px-2 py-0.5 rounded bg-[var(--color-gold)]/20 text-[var(--color-gold)] hover:bg-[var(--color-gold)]/30 font-semibold transition-colors"
                          >
                            Edit
                          </button>
                        </div>
                      </TableCell>
                      <TableCell>Live Storefront</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Sale Page</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span>/sale</span>
                          <button
                            onClick={() => {
                              setEditingSection('sale-page');
                            }}
                            className="text-xs px-2 py-0.5 rounded bg-[var(--color-gold)]/20 text-[var(--color-gold)] hover:bg-[var(--color-gold)]/30 font-semibold transition-colors"
                          >
                            Edit
                          </button>
                        </div>
                      </TableCell>
                      <TableCell>Live Storefront</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">#MyAngelikaLook</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span>/#MyAngelikaLook</span>
                          <button
                            onClick={() => {
                              setEditingSection('my-angelika-look');
                            }}
                            className="text-xs px-2 py-0.5 rounded bg-[var(--color-gold)]/20 text-[var(--color-gold)] hover:bg-[var(--color-gold)]/30 font-semibold transition-colors"
                          >
                            Edit
                          </button>
                        </div>
                      </TableCell>
                      <TableCell>Homepage Section</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Privacy Policy</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span>/privacy</span>
                          <button
                            onClick={() => {
                              setEditingSection('privacy-policy-page');
                            }}
                            className="text-xs px-2 py-0.5 rounded bg-[var(--color-gold)]/20 text-[var(--color-gold)] hover:bg-[var(--color-gold)]/30 font-semibold transition-colors"
                          >
                            Edit
                          </button>
                        </div>
                      </TableCell>
                      <TableCell>Live Storefront</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Terms of Service</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span>/terms</span>
                          <button
                            onClick={() => {
                              setEditingSection('terms-page');
                            }}
                            className="text-xs px-2 py-0.5 rounded bg-[var(--color-gold)]/20 text-[var(--color-gold)] hover:bg-[var(--color-gold)]/30 font-semibold transition-colors"
                          >
                            Edit
                          </button>
                        </div>
                      </TableCell>
                      <TableCell>Live Storefront</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Cookie Policy</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span>/cookies</span>
                          <button
                            onClick={() => {
                              setEditingSection('cookies-page');
                            }}
                            className="text-xs px-2 py-0.5 rounded bg-[var(--color-gold)]/20 text-[var(--color-gold)] hover:bg-[var(--color-gold)]/30 font-semibold transition-colors"
                          >
                            Edit
                          </button>
                        </div>
                      </TableCell>
                      <TableCell>Live Storefront</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Accessibility Statement</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span>/accessibility</span>
                          <button
                            onClick={() => {
                              setEditingSection('accessibility-page');
                            }}
                            className="text-xs px-2 py-0.5 rounded bg-[var(--color-gold)]/20 text-[var(--color-gold)] hover:bg-[var(--color-gold)]/30 font-semibold transition-colors"
                          >
                            Edit
                          </button>
                        </div>
                      </TableCell>
                      <TableCell>Live Storefront</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
              </>
            )}
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
