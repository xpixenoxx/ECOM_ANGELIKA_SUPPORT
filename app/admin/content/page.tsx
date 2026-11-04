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

const contentSections = [
  { id: 'hero', label: 'Homepage Hero', type: 'hero' },
  { id: 'features', label: 'Features Section', type: 'features' },
  { id: 'categories', label: 'Category Showcase', type: 'categories' },
  { id: 'new-arrivals', label: 'New Arrivals (Fresh from Atelier)', type: 'products' },
  { id: 'vidhyas-picks', label: "Vidhya's Picks", type: 'editorial' },
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
    ],
  },
  'new-arrivals': {
    badge: 'New Arrivals',
    heading: 'Fresh from',
    headingHighlight: 'the Atelier',
    ctaText: 'View All New',
    ctaLink: '/new-arrivals',
    mode: 'custom',
    limit: 8,
    items: [
      {
        id: 'na-1',
        name: 'Royal Crimson Zari Bridal Lehenga Set',
        category: 'Salwars',
        price: 28999,
        originalPrice: 34999,
        image: '/images/collection-lehengas.jpg',
        href: '/shop/salwars',
        isVidhyasPick: true,
        discount: 17,
      },
      {
        id: 'na-2',
        name: 'Handcrafted Velvet Zardosi Couture Ensemble',
        category: 'Kurtis',
        price: 11999,
        originalPrice: 14999,
        image: '/images/cat-lehengas.jpg',
        href: '/shop/kurtis',
        isVidhyasPick: false,
        discount: 20,
      },
      {
        id: 'na-3',
        name: 'Banarasi Silk Brocade Palazzo & Churidar Set',
        category: 'Salwars',
        price: 14499,
        originalPrice: 17999,
        image: '/images/collection-salwars.jpg',
        href: '/shop/salwars',
        isVidhyasPick: false,
        discount: 19,
      },
      {
        id: 'na-4',
        name: 'Hand-Block Printed Chanderi Cotton Kurti',
        category: 'Kurtis',
        price: 6499,
        originalPrice: 7999,
        image: '/images/collection-kurtis.jpg',
        href: '/shop/kurtis',
        isVidhyasPick: true,
        discount: 19,
      },
      {
        id: 'na-5',
        name: 'Handwoven Gold Zari Chanderi Saree',
        category: 'Sarees',
        price: 12999,
        originalPrice: 15499,
        image: '/images/artisan-workshop.jpg',
        href: '/product/handwoven-gold-zari-chanderi-saree',
        isVidhyasPick: false,
        discount: 16,
      },
      {
        id: 'na-6',
        name: 'Heritage Temple Kanjivaram Silk Saree',
        category: 'Sarees',
        price: 22499,
        originalPrice: 26999,
        image: '/images/collection-sarees.jpg',
        href: '/product/heritage-temple-kanjivaram-silk-saree',
        isVidhyasPick: true,
        discount: 17,
      },
      {
        id: 'na-7',
        name: 'Lucknowi Mukaish Chikankari Georgette Saree',
        category: 'Sarees',
        price: 15499,
        originalPrice: 18999,
        image: '/images/cat-sarees.jpg',
        href: '/product/lucknowi-mukaish-chikankari-georgette-saree',
        isVidhyasPick: true,
        discount: 18,
      },
      {
        id: 'na-8',
        name: 'Amritsari Hand-Embroidered Phulkari Dupatta',
        category: 'Dupattas',
        price: 3299,
        originalPrice: 3999,
        image: '/images/collection-dupattas.jpg',
        href: '/product/amritsari-hand-embroidered-phulkari-dupatta',
        isVidhyasPick: false,
        discount: 18,
      },
    ],
  },
  'vidhyas-picks': {
    title: "Vidhya's Monthly Edit",
    subtitle: 'Handpicked favorites with personal styling notes',
    currentMonth: 'January 2026',
    theme: 'New Beginnings in Silk',
    note: 'Starting the year with fabrics that feel like fresh starts...',
    products: ['prod-1', 'prod-2', 'prod-3'],
  },
  'brand-story': {
    title: 'Artisanal Luxury, Rooted in Indian Heritage',
    story: 'Every piece in the Angelika collection is thoughtfully curated by designer Vidhya, honoring ancient weaving traditions while embracing contemporary silhouettes.',
    quote: '"Fashion that honors where you come from while embracing where you are going."',
  },
  'newsletter': {
    title: 'Join the Angelika Circle',
    subtitle: 'Receive exclusive invitations to preview new arrivals, bespoke styling sessions, and private editorial drops.',
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

export default function AdminContentPage() {
  const [activeTab, setActiveTab] = useState('sections');
  const [editingSection, setEditingSection] = useState<string | null>('features');
  const [contentState, setContentState] = useState<Record<string, any>>(defaultMockContent);
  const [formData, setFormData] = useState<Record<string, any>>(defaultMockContent['features']);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Load saved content from API on mount
  useEffect(() => {
    let isMounted = true;
    fetch('/api/admin/content')
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data.success && data.content) {
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
                        <CardTitle className="text-[var(--font-display)] text-lg">Category Showcase & Curated Collections</CardTitle>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setEditingSection(null)}>Close</Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CategoryShowcaseEditor
                        onCancel={() => setEditingSection(null)}
                        onSaved={(savedData) => {
                          setContentState((prev) => ({
                            ...prev,
                            categories: savedData,
                          }));
                        }}
                      />
                    </CardContent>
                  </Card>
                ) : editingSection === 'new-arrivals' ? (
                  <Card variant="elevated" padding="lg">
                    <CardHeader className="flex flex-row items-center justify-between border-b border-[var(--color-whisper)] pb-4 mb-6">
                      <div>
                        <Badge variant="outline" className="text-xs mb-2">NEW ARRIVALS</Badge>
                        <CardTitle className="text-[var(--font-display)] text-lg">Fresh from the Atelier · New Arrivals</CardTitle>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setEditingSection(null)}>Close</Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <NewArrivalsEditor
                        onCancel={() => setEditingSection(null)}
                        onSaved={(savedData) => {
                          setContentState((prev) => ({
                            ...prev,
                            'new-arrivals': savedData,
                          }));
                        }}
                      />
                    </CardContent>
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
                          <div className="space-y-4">
                            <Input
                              label="Badge / Eyebrow Text"
                              value={formData['badge'] || ''}
                              placeholder="Curated Collections"
                              onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                            />
                            <Input
                              label="Section Title"
                              value={formData['title'] || ''}
                              placeholder="Shop by Category"
                              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            />
                            <Textarea
                              label="Description / Subtitle"
                              value={formData['subtitle'] || ''}
                              placeholder="Discover our complete range of premium ethnic wear..."
                              onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                              rows={3}
                            />
                          </div>
                        )}

                        {editingSection === 'vidhyas-picks' && (
                          <div className="space-y-4">
                            <Input
                              label="Section Title"
                              value={formData['title'] || ''}
                              placeholder="Vidhya's Monthly Edit"
                              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            />
                            <Textarea
                              label="Subtitle"
                              value={formData['subtitle'] || ''}
                              placeholder="Handpicked favorites with personal styling notes"
                              onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                              rows={2}
                            />
                            <div className="grid sm:grid-cols-2 gap-4">
                              <Input
                                label="Current Month"
                                value={formData['currentMonth'] || ''}
                                placeholder="January 2026"
                                onChange={(e) => setFormData({ ...formData, currentMonth: e.target.value })}
                              />
                              <Input
                                label="Theme"
                                value={formData['theme'] || ''}
                                placeholder="New Beginnings in Silk"
                                onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                              />
                            </div>
                            <Textarea
                              label="Vidhya's Note"
                              value={formData['note'] || ''}
                              placeholder="Starting the year with fabrics that feel like fresh starts..."
                              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                              rows={4}
                            />
                            <div>
                              <label className="text-xs font-medium text-[var(--color-slate)] mb-1 block">Featured Product IDs (comma-separated)</label>
                              <Input
                                value={Array.isArray(formData['products']) ? formData['products'].join(', ') : (formData['products'] || '')}
                                placeholder="prod-1, prod-2, prod-3"
                                onChange={(e) => setFormData({ ...formData, products: e.target.value.split(',').map((s: string) => s.trim()) })}
                              />
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
                              rows={6}
                            />
                            <Input
                              label="Quote"
                              value={formData['quote'] || ''}
                              placeholder='"Fashion that honors where you come from..."'
                              onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
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

                        {!['hero', 'features', 'categories', 'vidhyas-picks', 'brand-story', 'founder-note'].includes(editingSection) && (
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
