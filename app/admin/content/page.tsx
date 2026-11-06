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

const contentSections = [
  { id: 'hero', label: 'Homepage Hero', type: 'hero' },
  { id: 'features', label: 'Features Section', type: 'features' },
  { id: 'categories', label: 'Category Showcase', type: 'categories' },
  { id: 'new-arrivals', label: 'New Arrivals Showcase', type: 'collection' },
  { id: 'vidhyas-picks', label: "Vidhya's Picks", type: 'editorial' },
  { id: 'shop-the-look', label: 'Shop the Look', type: 'look' },
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
  { id: 'brand-story', label: 'Brand Story', type: 'richtext' },
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
      { title: 'Kurtis', subtitle: 'Hand-block printed cotton', image: '/images/collections/kurtis-hero.jpg', href: '/shop/kurtis', cta: 'Shop Kurtis' },
      { title: 'Salwars', subtitle: 'Zari embroidery and suits', image: '/images/collections/salwars-hero.jpg', href: '/shop/salwars', cta: 'Shop Salwars' },
      { title: 'Lehengas', subtitle: 'Festive silks and mirror work', image: '/images/collections/lehengas-hero.jpg', href: '/shop/lehengas', cta: 'Shop Lehengas' },
      { title: 'Sarees', subtitle: 'Kanjivaram & Banarasi weave', image: '/images/collections/sarees-hero.jpg', href: '/shop/sarees', cta: 'Shop Sarees' },
      { title: 'Dupattas', subtitle: 'Artisanal silk drapes', image: '/images/collections/dupattas-hero.jpg', href: '/shop/dupattas', cta: 'Shop Dupattas' },
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
    title: 'Artisanal Luxury, Rooted in Indian Heritage',
    story: 'Every piece in the Angelika collection is thoughtfully curated by designer Vidhya, honoring ancient weaving traditions while embracing contemporary silhouettes.',
    quote: '"Fashion that honors where you come from while embracing where you are going."',
    image: '/images/hero-luxury-couture.jpg',
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
  const [editingSection, setEditingSection] = useState<string | null>('features');
  const [contentState, setContentState] = useState<Record<string, any>>(defaultMockContent);
  const [formData, setFormData] = useState<Record<string, any>>(defaultMockContent['features']);
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
      <Tabs defaultValue="sections" onValueChange={setActiveTab} className="w-full">
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
                        {editingSection === 'features' && (
                          <div>
                            <div className="flex items-center justify-between mb-4">
                              <p className="text-sm text-[var(--color-slate)]">Edit the feature cards shown on homepage</p>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const items = [...(formData['items'] || [])];
                                  items.push({ icon: '✨', title: 'New Feature', desc: 'Feature description' });
                                  setFormData({ ...formData, items });
                                }}
                              >
                                + Add Feature Card
                              </Button>
                            </div>
                            {((formData['items'] as any[]) || []).map((item: any, i: number) => (
                              <div key={i} className="p-4 border border-[var(--color-whisper)] rounded-[var(--radius-lg)] mb-4 bg-[var(--color-snow)]/40 relative">
                                <div className="flex items-center justify-between mb-3">
                                  <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-gold)]">Card {i + 1}</span>
                                  {((formData['items'] as any[]).length > 1) && (
                                    <button
                                      type="button"
                                      className="text-xs text-rose-500 hover:text-rose-700 underline"
                                      onClick={() => {
                                        const items = (formData['items'] as any[]).filter((_, idx) => idx !== i);
                                        setFormData({ ...formData, items });
                                      }}
                                    >
                                      Remove
                                    </button>
                                  )}
                                </div>
                                <div className="space-y-4">
                                  {/* Icon Uploader & Paste Area */}
                                  <div>
                                    <label className="text-xs font-medium text-[var(--color-slate)] mb-1.5 block">
                                      Card Icon (Upload, Paste image or Emoji)
                                    </label>
                                    <FeatureIconUploader
                                      icon={item.icon || ''}
                                      onChange={(newIcon) => {
                                        const items = [...(formData['items'] as any[])];
                                        items[i] = { ...items[i], icon: newIcon };
                                        setFormData({ ...formData, items });
                                      }}
                                    />
                                  </div>

                                  <div className="grid sm:grid-cols-2 gap-4">
                                    <Input
                                      label="Title"
                                      value={item.title || ''}
                                      placeholder="Free Shipping"
                                      onChange={(e) => {
                                        const items = [...(formData['items'] as any[])];
                                        items[i] = { ...items[i], title: e.target.value };
                                        setFormData({ ...formData, items });
                                      }}
                                    />
                                    <Textarea
                                      label="Description"
                                      value={item.desc || item.description || ''}
                                      placeholder="On orders above ₹2,999 across India"
                                      onChange={(e) => {
                                        const items = [...(formData['items'] as any[])];
                                        items[i] = {
                                          ...items[i],
                                          desc: e.target.value,
                                          description: e.target.value,
                                        };
                                        setFormData({ ...formData, items });
                                      }}
                                      rows={2}
                                    />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {editingSection === 'categories' && (
                          <div className="space-y-6">
                            <div className="p-4 border border-[var(--color-whisper)] rounded-xl bg-[var(--color-snow)]/30 space-y-4">
                              <h3 className="font-semibold text-sm text-[var(--color-ink)]">Section Header</h3>
                              <div className="grid sm:grid-cols-2 gap-4">
                                <Input
                                  label="Eyebrow Badge"
                                  value={formData['badge'] ?? 'Curated Collections'}
                                  placeholder="Curated Collections"
                                  onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                                />
                                <Input
                                  label="Section Title"
                                  value={formData['title'] ?? 'Shop by Category'}
                                  placeholder="Shop by Category"
                                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                />
                              </div>
                              <Textarea
                                label="Description / Subtitle"
                                value={formData['subtitle'] ?? 'Discover our complete range of premium ethnic wear, each category handcrafted with timeless artisanal detail.'}
                                placeholder="Discover our complete range of premium ethnic wear..."
                                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                                rows={2}
                              />
                            </div>

                            <div>
                              <div className="flex items-center justify-between mb-4">
                                <div>
                                  <h3 className="font-semibold text-sm text-[var(--color-ink)]">Category Cards (5 Collections)</h3>
                                  <p className="text-xs text-[var(--color-slate)]">Kurtis, Salwars, Lehengas, Sarees, Dupattas</p>
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
                                        Category {i + 1}: {cat.title || 'Untitled'}
                                      </span>
                                    </div>
                                    <div>
                                      <label className="text-xs font-medium text-[var(--color-slate)] mb-1 block">
                                        Collection Image (Upload, Paste or URL)
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
                                    <div className="grid sm:grid-cols-2 gap-3">
                                      <Input
                                        label="Title"
                                        value={cat.title || ''}
                                        placeholder="Kurtis"
                                        onChange={(e) => {
                                          const items = [...(((formData['items'] as any[]) && (formData['items'] as any[]).length > 0) ? (formData['items'] as any[]) : defaultMockContent['categories'].items)];
                                          items[i] = { ...items[i], title: e.target.value };
                                          setFormData({ ...formData, items });
                                        }}
                                      />
                                      <Input
                                        label="Subtitle / Craft"
                                        value={cat.subtitle || ''}
                                        placeholder="Hand-block printed cotton"
                                        onChange={(e) => {
                                          const items = [...(((formData['items'] as any[]) && (formData['items'] as any[]).length > 0) ? (formData['items'] as any[]) : defaultMockContent['categories'].items)];
                                          items[i] = { ...items[i], subtitle: e.target.value };
                                          setFormData({ ...formData, items });
                                        }}
                                      />
                                      <Input
                                        label="Link / Path"
                                        value={cat.href || ''}
                                        placeholder="/shop/kurtis"
                                        onChange={(e) => {
                                          const items = [...(((formData['items'] as any[]) && (formData['items'] as any[]).length > 0) ? (formData['items'] as any[]) : defaultMockContent['categories'].items)];
                                          items[i] = { ...items[i], href: e.target.value };
                                          setFormData({ ...formData, items });
                                        }}
                                      />
                                      <Input
                                        label="Button CTA Text"
                                        value={cat.cta || ''}
                                        placeholder="Shop Kurtis"
                                        onChange={(e) => {
                                          const items = [...(((formData['items'] as any[]) && (formData['items'] as any[]).length > 0) ? (formData['items'] as any[]) : defaultMockContent['categories'].items)];
                                          items[i] = { ...items[i], cta: e.target.value };
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

                        {editingSection === 'shop-the-look' && (
                          <div className="space-y-6">
                            <div className="p-4 border border-[var(--color-whisper)] rounded-xl bg-[var(--color-snow)]/30 space-y-4">
                              <h3 className="font-semibold text-sm text-[var(--color-ink)]">Shop the Look - Section Header</h3>
                              <div className="grid sm:grid-cols-3 gap-4">
                                <Input
                                  label="Eyebrow Badge"
                                  value={formData['badge'] ?? 'Curated Ensemble'}
                                  placeholder="Curated Ensemble"
                                  onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                                />
                                <Input
                                  label="Section Title"
                                  value={formData['title'] ?? 'Festive Elegance'}
                                  placeholder="Festive Elegance"
                                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                />
                                <Input
                                  label="Subtitle / Instructions"
                                  value={formData['subtitle'] ?? 'Click pins on image to explore'}
                                  placeholder="Click pins on image to explore"
                                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                                />
                              </div>
                            </div>

                            <div className="p-4 border border-[var(--color-whisper)] rounded-xl bg-[var(--color-snow)]/30 space-y-4">
                              <h3 className="font-semibold text-sm text-[var(--color-ink)]">Lifestyle Model Image</h3>
                              <p className="text-xs text-[var(--color-slate)]">Upload or paste the large hero photograph shown in Shop the Look</p>
                              <ImageUploadField
                                aspectRatio="aspect-video"
                                imageUrl={formData['lifestyle_image_url'] || defaultMockContent['shop-the-look'].lifestyle_image_url}
                                onChange={(newUrl) => setFormData({ ...formData, lifestyle_image_url: newUrl })}
                              />
                            </div>

                            <div className="p-4 border border-[var(--color-whisper)] rounded-xl bg-[var(--color-snow)]/30 space-y-4">
                              <h3 className="font-semibold text-sm text-[var(--color-ink)]">Featured Pinned Product Details</h3>
                              <div className="grid sm:grid-cols-2 gap-4">
                                <Input
                                  label="Product Name"
                                  value={formData['productName'] ?? defaultMockContent['shop-the-look'].productName}
                                  placeholder="Mirror Work Lehenga"
                                  onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                                />
                                <Input
                                  label="Product Price (₹)"
                                  value={formData['productPrice'] ?? defaultMockContent['shop-the-look'].productPrice}
                                  placeholder="18999"
                                  onChange={(e) => setFormData({ ...formData, productPrice: Number(e.target.value.replace(/[^0-9.]/g, '')) || 0 })}
                                />
                                <Input
                                  label="Original Price / MRP (₹)"
                                  value={formData['productOriginalPrice'] ?? defaultMockContent['shop-the-look'].productOriginalPrice}
                                  placeholder="22999"
                                  onChange={(e) => setFormData({ ...formData, productOriginalPrice: Number(e.target.value.replace(/[^0-9.]/g, '')) || 0 })}
                                />
                                <Input
                                  label="Product Link / Slug"
                                  value={formData['productSlug'] ?? defaultMockContent['shop-the-look'].productSlug}
                                  placeholder="mirror-work-lehenga"
                                  onChange={(e) => setFormData({ ...formData, productSlug: e.target.value })}
                                />
                              </div>

                              <div>
                                <label className="text-xs font-medium text-[var(--color-slate)] mb-1 block">
                                  Product Thumbnail Image
                                </label>
                                <ImageUploadField
                                  aspectRatio="aspect-[3/4]"
                                  imageUrl={formData['productImage'] ?? defaultMockContent['shop-the-look'].productImage}
                                  onChange={(newUrl) => setFormData({ ...formData, productImage: newUrl })}
                                />
                              </div>

                              <div className="pt-2 border-t border-[var(--color-whisper)]">
                                <div className="flex items-center justify-between mb-2">
                                  <h4 className="font-semibold text-xs text-[var(--color-ink)]">Pin Position (Click Image or Drag Sliders)</h4>
                                  <span className="text-xs font-mono text-[var(--color-gold)] font-medium">
                                    X: {formData['pinX'] ?? defaultMockContent['shop-the-look'].pinX}% | Y: {formData['pinY'] ?? defaultMockContent['shop-the-look'].pinY}%
                                  </span>
                                </div>

                                {/* Visual Click-to-Pin Box */}
                                <div
                                  className="relative w-full max-w-lg aspect-video rounded-xl overflow-hidden border border-[var(--color-whisper)] bg-[var(--color-snow)] mb-4 cursor-crosshair group shadow-sm select-none"
                                  onClick={(e) => {
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    const x = Math.max(5, Math.min(95, Math.round(((e.clientX - rect.left) / rect.width) * 100)));
                                    const y = Math.max(5, Math.min(95, Math.round(((e.clientY - rect.top) / rect.height) * 100)));
                                    setFormData({ ...formData, pinX: x, pinY: y });
                                  }}
                                  title="Click anywhere on this image to position the hotspot pin"
                                >
                                  <img
                                    src={formData['lifestyle_image_url'] || defaultMockContent['shop-the-look'].lifestyle_image_url}
                                    alt="Lifestyle Preview"
                                    className="w-full h-full object-cover pointer-events-none"
                                  />
                                  {/* Pin indicator */}
                                  <div
                                    className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-all duration-150"
                                    style={{
                                      left: `${formData['pinX'] ?? defaultMockContent['shop-the-look'].pinX}%`,
                                      top: `${formData['pinY'] ?? defaultMockContent['shop-the-look'].pinY}%`,
                                    }}
                                  >
                                    <div className="w-6 h-6 rounded-full border-2 border-white bg-[var(--color-gold)] shadow-lg flex items-center justify-center animate-pulse">
                                      <div className="w-2 h-2 rounded-full bg-white" />
                                    </div>
                                    <div className="absolute top-7 left-1/2 -translate-x-1/2 bg-black/85 text-white text-[10px] px-2 py-0.5 rounded whitespace-nowrap shadow font-medium">
                                      {formData['productName'] || 'Pinned Product'}
                                    </div>
                                  </div>
                                  <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-xs text-white/90 text-[10px] px-2 py-0.5 rounded">
                                    Click anywhere to place pin
                                  </div>
                                </div>

                                <div className="grid sm:grid-cols-2 gap-4">
                                  <div>
                                    <label className="text-xs text-[var(--color-slate)] block mb-1">
                                      Horizontal Position X: {formData['pinX'] ?? defaultMockContent['shop-the-look'].pinX}%
                                    </label>
                                    <input
                                      type="range"
                                      min="5"
                                      max="95"
                                      value={formData['pinX'] ?? defaultMockContent['shop-the-look'].pinX}
                                      onChange={(e) => setFormData({ ...formData, pinX: Number(e.target.value) })}
                                      className="w-full accent-[var(--color-gold)]"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-xs text-[var(--color-slate)] block mb-1">
                                      Vertical Position Y: {formData['pinY'] ?? defaultMockContent['shop-the-look'].pinY}%
                                    </label>
                                    <input
                                      type="range"
                                      min="5"
                                      max="95"
                                      value={formData['pinY'] ?? defaultMockContent['shop-the-look'].pinY}
                                      onChange={(e) => setFormData({ ...formData, pinY: Number(e.target.value) })}
                                      className="w-full accent-[var(--color-gold)]"
                                    />
                                  </div>
                                </div>
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

                        {!['hero', 'features', 'categories', 'vidhyas-picks', 'shop-the-look', 'brand-story', 'newsletter', 'founder-note'].includes(editingSection) && (
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
                      <TableHead>Last Updated</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">About Us</TableCell>
                      <TableCell>/about</TableCell>
                      <TableCell>Jan 10, 2026</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Shipping Policy</TableCell>
                      <TableCell>/shipping</TableCell>
                      <TableCell>Dec 20, 2025</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Salwars Page</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span>/shop/salwars</span>
                          <button
                            onClick={() => {
                              setActiveTab('sections');
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
                              setActiveTab('sections');
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
                              setActiveTab('sections');
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
                              setActiveTab('sections');
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
                              setActiveTab('sections');
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
                              setActiveTab('sections');
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
                              setActiveTab('sections');
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
                              setActiveTab('sections');
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
                              setActiveTab('sections');
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
                              setActiveTab('sections');
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
                              setActiveTab('sections');
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
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
