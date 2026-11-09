'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input, Textarea } from '@/components/ui/Input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { Badge } from '@/components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { cn } from '@/lib/utils/cn';
import toast from 'react-hot-toast';
import {
  Search,
  Plus,
  Trash2,
  ExternalLink,
  Copy,
  Check,
  Download,
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  X,
  Sparkles,
  BookOpen,
  Layers,
  Globe,
  Clock,
  ChevronRight,
  Eye,
} from 'lucide-react';

// Admin Editors
import { HomepageHeroEditor } from '@/components/admin/HomepageHeroEditor';
import { CategoryShowcaseEditor } from '@/components/admin/CategoryShowcaseEditor';
import { NewArrivalsEditor } from '@/components/admin/NewArrivalsEditor';
import { BrandStoryEditor } from '@/components/admin/BrandStoryEditor';
import { KurtisPageEditor } from '@/components/admin/KurtisPageEditor';
import { FooterEditor } from '@/components/admin/FooterEditor';
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
import { VidhyasPicksPageEditor } from '@/components/admin/VidhyasPicksPageEditor';

// Modular Homepage & Global Layout Sections (ONLY modular sections on homepage)
interface ContentSectionMeta {
  id: string;
  label: string;
  type: string;
  description: string;
}

const homepageSections: ContentSectionMeta[] = [
  {
    id: 'hero',
    label: 'Homepage Hero & Navigation',
    type: 'hero',
    description: 'Header announcement, slide carousels, headlines, and primary CTA buttons',
  },
  {
    id: 'categories',
    label: 'Category Showcase',
    type: 'categories',
    description: '8 artisanal category cards across 5 grid rows with custom imagery',
  },
  {
    id: 'new-arrivals',
    label: 'New Arrivals Showcase',
    type: 'collection',
    description: 'Latest product catalog drops and seasonal festive spotlight',
  },
  {
    id: 'vidhyas-picks',
    label: "Vidhya's Picks Showcase",
    type: 'editorial',
    description: 'Homepage featured ensembles curated personally by designer Vidhya',
  },
  {
    id: 'shop-the-look',
    label: 'Shop The Look (Interactive Pins)',
    type: 'interactive',
    description: 'Interactive lifestyle model image with clickable product hotspot coordinates',
  },
  {
    id: 'brand-story',
    label: 'Brand Story ("Crafted with Love")',
    type: 'story',
    description: 'Heritage textile narrative, atelier craftsmanship, and founder quote',
  },
  {
    id: 'my-angelika-look',
    label: '#MyAngelikaLook UGC Gallery',
    type: 'social',
    description: 'Customer community Instagram styling gallery and photo submissions',
  },
  {
    id: 'footer',
    label: 'Global Site Footer & Atelier Desk',
    type: 'global',
    description: 'Atelier live WhatsApp concierge desk, store policies, social links, and copyright',
  },
];

// Standalone Storefront Static Pages (All full-page routes)
interface StaticPageMeta {
  id: string;
  name: string;
  path: string;
  category: 'Catalog' | 'Brand Heritage' | 'Interactive Studio' | 'Customer Care' | 'Legal Policy';
  description: string;
}

const staticPagesList: StaticPageMeta[] = [
  {
    id: 'shop-page',
    name: 'Shop Page (All Collections)',
    path: '/shop',
    category: 'Catalog',
    description: 'Primary public storefront catalog with filterable product grid',
  },
  {
    id: 'kurtis-page',
    name: 'Kurtis Collection Page',
    path: '/shop/kurtis',
    category: 'Catalog',
    description: 'Dedicated handcrafted Kurtis, tunics, and anarkali showcase',
  },
  {
    id: 'about-page',
    name: 'About Us Page (Full Heritage)',
    path: '/about',
    category: 'Brand Heritage',
    description: 'Complete brand story, founder note, artisanal values, team, and timeline',
  },
  {
    id: 'designer-vidhya-page',
    name: 'Meet Designer Vidhya',
    path: '/about/vidhya',
    category: 'Brand Heritage',
    description: 'Creative director profile, atelier heritage, and styling philosophy',
  },
  {
    id: 'vidhyas-picks-page',
    name: "Vidhya's Picks Editorial Page",
    path: '/vidhyas-picks',
    category: 'Brand Heritage',
    description: 'Full-page editorial showcase of Vidhya curated couture garments',
  },
  {
    id: 'sale-page',
    name: 'Sale & Festive Offers Page',
    path: '/sale',
    category: 'Catalog',
    description: 'Seasonal promotions, festival discounts, and clearance collections',
  },
  {
    id: 'size-finder-page',
    name: 'Couture Fit Studio (Size Finder)',
    path: '/size-finder',
    category: 'Interactive Studio',
    description: 'Interactive garment fitting studio with personalized size recommendation',
  },
  {
    id: 'size-guide-page',
    name: 'Garment Size Guide',
    path: '/size-guide',
    category: 'Customer Care',
    description: 'Comprehensive bust, waist, and hip measurement charts in inches and cm',
  },
  {
    id: 'faq-page',
    name: 'FAQ & Help Center',
    path: '/faq',
    category: 'Customer Care',
    description: 'Categorized customer questions on orders, custom stitching, and delivery',
  },
  {
    id: 'contact-page',
    name: 'Contact Us & Concierge Studio',
    path: '/contact',
    category: 'Customer Care',
    description: 'Atelier hotline, WhatsApp concierge, email, and bespoke inquiry form',
  },
  {
    id: 'wholesale-page',
    name: 'Wholesale & B2B Inquiries',
    path: '/wholesale',
    category: 'Customer Care',
    description: 'B2B boutique partnerships, corporate gifting, and bulk tier pricing',
  },
  {
    id: 'shipping-page',
    name: 'Shipping & Delivery Policy',
    path: '/shipping',
    category: 'Customer Care',
    description: 'Free express shipping thresholds, courier partners, and transit timelines',
  },
  {
    id: 'returns-page',
    name: 'Returns & Size Exchanges',
    path: '/returns',
    category: 'Customer Care',
    description: '15-day return window, step-by-step reverse pickup, and refund policy',
  },
  {
    id: 'privacy-policy-page',
    name: 'Privacy Policy',
    path: '/privacy',
    category: 'Legal Policy',
    description: 'Data protection standards, cookies, customer rights, and GDPR compliance',
  },
  {
    id: 'terms-page',
    name: 'Terms of Service',
    path: '/terms',
    category: 'Legal Policy',
    description: 'E-commerce terms, payments, orders, cancellation, and intellectual property',
  },
  {
    id: 'cookies-page',
    name: 'Cookie Policy',
    path: '/cookies',
    category: 'Legal Policy',
    description: 'Detailed disclosure of essential, analytical, and marketing cookies',
  },
  {
    id: 'accessibility-page',
    name: 'Accessibility Statement',
    path: '/accessibility',
    category: 'Legal Policy',
    description: 'WCAG 2.1 AA digital accessibility commitments and assistive tech support',
  },
];

// Default Mock Content for modular sections
const defaultMockContent: Record<string, any> = {
  hero: {
    title: 'Grace in Every Drape',
    subtitle: 'Timeless traditional wear for the modern woman. Rooted in heritage, designed for your today.',
    ctaText: 'Explore Collection',
    ctaLink: '/shop',
    secondaryCtaText: "Vidhya's Picks",
    secondaryCtaLink: '/vidhyas-picks',
    backgroundImage: '/images/hero-new-couture.jpg',
  },
  'vidhyas-picks': {
    badge: "Vidhya's Picks",
    title: 'Handpicked by Vidhya',
    titleHighlight: 'Vidhya',
    ctaText: 'View All Picks',
    ctaLink: '/vidhyas-picks',
    items: [
      {
        id: 'vp-1',
        name: 'Kutch Ajrakh Modal Silk Kurti',
        category: 'Kurtis',
        price: 4999,
        originalPrice: 5999,
        image: '/images/products/kurti-ajrakh-1.jpg',
        slug: 'kutch-ajrakh-modal-silk-kurti',
        badge: "VIDHYA'S PICK",
      },
      {
        id: 'vp-2',
        name: 'Ivory & Gold Chanderi Angrakha Suit',
        category: 'Salwars',
        price: 7499,
        originalPrice: 8999,
        image: '/images/products/salwar-angrakha-1.jpg',
        slug: 'ivory-gold-chanderi-angrakha-suit',
        badge: "VIDHYA'S PICK",
      },
      {
        id: 'vp-3',
        name: 'Heritage Temple Kanjivaram Silk Saree',
        category: 'Sarees',
        price: 14999,
        originalPrice: 17999,
        image: '/images/products/saree-kanjivaram-1.jpg',
        slug: 'heritage-temple-kanjivaram-silk-saree',
        badge: "VIDHYA'S PICK",
      },
      {
        id: 'vp-4',
        name: 'Lucknowi Mukaish Chiffon Saree',
        category: 'Sarees',
        price: 6499,
        originalPrice: 7999,
        image: '/images/products/saree-chikankari-1.jpg',
        slug: 'lucknowi-mukaish-chiffon-saree',
        badge: "VIDHYA'S PICK",
      },
    ],
  },
  'shop-the-look': {
    title: 'Festive Elegance',
    badge: 'Curated Ensemble',
    subtitle: 'Click pins on image to explore',
    lifestyle_image_url: '/images/products/lehenga-bridal-1.jpg',
    lifestyle_image_alt: 'Festive Elegance Ensemble',
    productName: 'Mirror Work Lehenga',
    productPrice: 18999,
    productOriginalPrice: 22999,
    productImage: '/images/products/lehenga-mirror-1.jpg',
    productSlug: 'mirror-work-lehenga',
    pinX: 47,
    pinY: 64,
  },
};

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  author: string;
  category: string;
  date: string;
  status: 'Published' | 'Draft';
  excerpt: string;
}

const initialBlogPosts: BlogPost[] = [
  {
    id: 'post-1',
    title: 'The Art of Hand Block Printing: Centuries of Indian Heritage',
    slug: 'the-art-of-hand-block-printing',
    author: 'Vidhya',
    category: 'Craft & Technique',
    date: 'Jan 15, 2026',
    status: 'Published',
    excerpt: 'Explore how master artisans in Bagru and Sanganer craft organic wooden blocks with natural earthen dyes.',
  },
  {
    id: 'post-2',
    title: 'Chanderi Silk: The Royal Weave of Madhya Pradesh',
    slug: 'chanderi-silk-royal-weave',
    author: 'Vidhya',
    category: 'Textile Heritage',
    date: 'Feb 02, 2026',
    status: 'Published',
    excerpt: 'Lightweight luxury drapes featuring pure zari borders, woven since the Vedic era for royalty.',
  },
  {
    id: 'post-3',
    title: 'Festive Styling Guide: Straight-Cut Suits vs Flared Anarkalis',
    slug: 'festive-styling-guide',
    author: 'Vidhya',
    category: 'Styling & Fit',
    date: 'Feb 18, 2026',
    status: 'Published',
    excerpt: 'Vidhya reveals tailoring secrets to achieve the most flattering silhouette for traditional ceremonies.',
  },
];

// Helper Image Uploader with Drag-and-Drop and Paste
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

      const res = await fetch('/api/admin/content/upload', {
        method: 'POST',
        body: fd,
      });

      if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
        const data = await res.json();
        if (data.success && data.url) {
          onChange(data.url);
          setPasteSuccess(true);
          toast.success('Image uploaded successfully!');
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
        <div
          className={cn(
            'relative w-16 h-20 rounded-lg overflow-hidden bg-[var(--color-whisper)] border border-[var(--color-whisper)] flex-shrink-0 flex items-center justify-center text-xs text-[var(--color-slate)]',
            aspectRatio
          )}
        >
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
                <span className="px-1.5 py-0.5 bg-[var(--color-whisper)] text-[10px] font-mono rounded border">
                  Ctrl+V paste
                </span>
              </p>
              <p className="text-[10px] text-[var(--color-slate)]">PNG, JPG, WebP supported</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isUploading ? (
              <span className="text-xs text-[var(--color-gold)] font-medium animate-pulse">
                Uploading...
              </span>
            ) : pasteSuccess ? (
              <span className="text-xs text-emerald-600 font-medium">✓ Image added!</span>
            ) : (
              <span className="px-2.5 py-1 text-xs rounded-md bg-[var(--color-snow)] hover:bg-[var(--color-whisper)] text-[var(--color-ink)] border border-[var(--color-whisper)]">
                Browse file
              </span>
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
  const [activeTab, setActiveTab] = useState<'sections' | 'pages' | 'blog'>('sections');
  const [editingSection, setEditingSection] = useState<string | null>('hero');
  const [editingStaticPage, setEditingStaticPage] = useState<string | null>(null);

  // Content state for inline sections
  const [contentState, setContentState] = useState<Record<string, any>>(defaultMockContent);
  const [formData, setFormData] = useState<Record<string, any>>(defaultMockContent['hero']);
  const [isSaving, setIsSaving] = useState(false);

  // Static Pages search & category filter
  const [pageSearch, setPageSearch] = useState('');
  const [pageCategoryFilter, setPageCategoryFilter] = useState<string>('all');

  // Blog posts state
  const [blogList, setBlogList] = useState<BlogPost[]>(initialBlogPosts);
  const [blogSearch, setBlogSearch] = useState('');
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [newPostData, setNewPostData] = useState<Omit<BlogPost, 'id'>>({
    title: '',
    slug: '',
    author: 'Vidhya',
    category: 'Craft & Technique',
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
    status: 'Published',
    excerpt: '',
  });

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

  const handleSelectSection = (sectionId: string) => {
    setEditingSection(sectionId);
    const currentData = contentState[sectionId] || defaultMockContent[sectionId] || {};
    setFormData(JSON.parse(JSON.stringify(currentData)));
  };

  const handleSaveInlineSection = async () => {
    if (!editingSection) return;
    setIsSaving(true);

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
        const sectionLabel =
          homepageSections.find((s) => s.id === editingSection)?.label || editingSection;
        toast.success(`"${sectionLabel}" updated and synced live!`);
      } else {
        toast.error(result.error || 'Failed to save changes.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Network error while saving.');
    } finally {
      setIsSaving(false);
    }
  };

  // Blog creation handler
  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostData.title.trim()) {
      toast.error('Post title is required');
      return;
    }

    const post: BlogPost = {
      id: `post-${Date.now()}`,
      ...newPostData,
      slug:
        newPostData.slug.trim() ||
        newPostData.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, ''),
    };

    setBlogList((prev) => [post, ...prev]);
    setIsCreatingPost(false);
    setNewPostData({
      title: '',
      slug: '',
      author: 'Vidhya',
      category: 'Craft & Technique',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      status: 'Published',
      excerpt: '',
    });
    toast.success(`Article "${post.title}" published!`);
  };

  const handleDeletePost = (id: string, title: string) => {
    if (confirm(`Delete blog post "${title}"?`)) {
      setBlogList((prev) => prev.filter((p) => p.id !== id));
      toast.success(`Deleted "${title}"`);
    }
  };

  // Render the active Section Editor
  const renderHomepageSectionEditor = () => {
    if (editingSection === 'hero') {
      return (
        <Card variant="elevated" padding="lg">
          <HomepageHeroEditor
            onCancel={() => setEditingSection(null)}
            onSaved={() => toast.success('Homepage Hero saved successfully!')}
          />
        </Card>
      );
    }

    if (editingSection === 'categories') {
      return (
        <Card variant="elevated" padding="lg">
          <CategoryShowcaseEditor
            onCancel={() => setEditingSection(null)}
            onSaved={() => toast.success('Category Showcase saved successfully!')}
          />
        </Card>
      );
    }

    if (editingSection === 'new-arrivals') {
      return (
        <Card variant="elevated" padding="lg">
          <NewArrivalsEditor
            onCancel={() => setEditingSection(null)}
            onSaved={() => toast.success('New Arrivals saved successfully!')}
          />
        </Card>
      );
    }

    if (editingSection === 'brand-story') {
      return (
        <Card variant="elevated" padding="lg">
          <BrandStoryEditor
            onCancel={() => setEditingSection(null)}
            onSaved={() => toast.success('Brand Story saved successfully!')}
          />
        </Card>
      );
    }

    if (editingSection === 'my-angelika-look') {
      return (
        <Card variant="elevated" padding="lg">
          <MyAngelikaLookEditor
            onCancel={() => setEditingSection(null)}
            onSaved={() => toast.success('#MyAngelikaLook saved successfully!')}
          />
        </Card>
      );
    }

    if (editingSection === 'footer') {
      return (
        <Card variant="elevated" padding="lg">
          <FooterEditor
            onCancel={() => setEditingSection(null)}
            onSaved={() => toast.success('Footer saved successfully!')}
          />
        </Card>
      );
    }

    // Vidhya's Picks Homepage Showcase Editor
    if (editingSection === 'vidhyas-picks') {
      return (
        <Card variant="elevated" padding="lg">
          <CardHeader className="flex flex-row items-center justify-between border-b border-[var(--color-whisper)] pb-4 mb-6">
            <div>
              <Badge variant="outline" className="text-xs mb-2">
                HOMEPAGE EDITORIAL
              </Badge>
              <CardTitle className="text-[var(--font-display)] text-lg">
                Vidhya's Picks Showcase (Homepage)
              </CardTitle>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setEditingSection(null)}>
                Close
              </Button>
              <Button variant="primary" onClick={handleSaveInlineSection} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 border border-[var(--color-whisper)] rounded-xl bg-[var(--color-snow)]/30 space-y-4">
              <h3 className="font-semibold text-sm text-[var(--color-ink)]">
                Section Header Settings
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <Input
                  label="Eyebrow Badge"
                  value={formData['badge'] ?? "Vidhya's Picks"}
                  placeholder="Vidhya's Picks"
                  onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                />
                <Input
                  label="Headline"
                  value={formData['title'] ?? 'Handpicked by Vidhya'}
                  placeholder="Handpicked by Vidhya"
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
                <Input
                  label="Highlight Word"
                  value={formData['titleHighlight'] ?? 'Vidhya'}
                  placeholder="Vidhya"
                  onChange={(e) => setFormData({ ...formData, titleHighlight: e.target.value })}
                />
                <Input
                  label="CTA Button Text"
                  value={formData['ctaText'] ?? 'View All Picks'}
                  placeholder="View All Picks"
                  onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
                />
                <Input
                  label="CTA Link"
                  value={formData['ctaLink'] ?? '/vidhyas-picks'}
                  placeholder="/vidhyas-picks"
                  onChange={(e) => setFormData({ ...formData, ctaLink: e.target.value })}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-sm text-[var(--color-ink)]">
                    Curated Garment Cards
                  </h3>
                  <p className="text-xs text-[var(--color-slate)]">
                    Featured couture ensembles showcased in this homepage block
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const currentItems =
                      (formData['items'] as any[]) ||
                      defaultMockContent['vidhyas-picks'].items;
                    const nextIdx = currentItems.length + 1;
                    const items = [
                      ...currentItems,
                      {
                        id: `vp-${Date.now()}`,
                        name: `Curated Ensemble ${nextIdx}`,
                        category: 'Kurtis',
                        price: 4999,
                        originalPrice: 5999,
                        discount: 17,
                        image: '/images/products/kurti-ajrakh-1.jpg',
                        slug: `curated-ensemble-${nextIdx}`,
                        badge: "VIDHYA'S PICK",
                      },
                    ];
                    setFormData({ ...formData, items });
                  }}
                  className="text-xs border-[var(--color-gold)] text-[var(--color-ink)]"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Add Garment Card
                </Button>
              </div>

              <div className="space-y-4">
                {(((formData['items'] as any[]) && (formData['items'] as any[]).length > 0)
                  ? (formData['items'] as any[])
                  : defaultMockContent['vidhyas-picks'].items
                ).map((item: any, i: number) => (
                  <div
                    key={i}
                    className="p-4 border border-[var(--color-whisper)] rounded-xl bg-[var(--color-snow)]/40 space-y-4"
                  >
                    <div className="flex items-center justify-between border-b border-[var(--color-whisper)] pb-2">
                      <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-gold)]">
                        Garment #{i + 1}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const currentItems =
                            (formData['items'] as any[]) ||
                            defaultMockContent['vidhyas-picks'].items;
                          if (currentItems.length <= 1) {
                            toast.error('You must keep at least 1 garment card');
                            return;
                          }
                          const updated = currentItems.filter((_: any, idx: number) => idx !== i);
                          setFormData({ ...formData, items: updated });
                        }}
                        className="text-xs text-rose-500 hover:text-rose-700 hover:bg-rose-50 h-7 px-2"
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-1" />
                        Remove
                      </Button>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <Input
                        label="Product Title"
                        value={item.name || ''}
                        onChange={(e) => {
                          const items = [
                            ...((formData['items'] as any[]) ||
                              defaultMockContent['vidhyas-picks'].items),
                          ];
                          items[i].name = e.target.value;
                          setFormData({ ...formData, items });
                        }}
                      />
                      <Input
                        label="Category / Tag"
                        value={item.category || ''}
                        onChange={(e) => {
                          const items = [
                            ...((formData['items'] as any[]) ||
                              defaultMockContent['vidhyas-picks'].items),
                          ];
                          items[i].category = e.target.value;
                          setFormData({ ...formData, items });
                        }}
                      />
                      <Input
                        label="Selling Price (₹)"
                        type="number"
                        value={item.price || ''}
                        onChange={(e) => {
                          const items = [
                            ...((formData['items'] as any[]) ||
                              defaultMockContent['vidhyas-picks'].items),
                          ];
                          items[i].price = Number(e.target.value);
                          setFormData({ ...formData, items });
                        }}
                      />
                      <Input
                        label="Compare Price / MRP (₹)"
                        type="number"
                        value={item.originalPrice || ''}
                        onChange={(e) => {
                          const items = [
                            ...((formData['items'] as any[]) ||
                              defaultMockContent['vidhyas-picks'].items),
                          ];
                          items[i].originalPrice = Number(e.target.value);
                          setFormData({ ...formData, items });
                        }}
                      />
                      <Input
                        label="Product Slug"
                        value={item.slug || ''}
                        onChange={(e) => {
                          const items = [
                            ...((formData['items'] as any[]) ||
                              defaultMockContent['vidhyas-picks'].items),
                          ];
                          items[i].slug = e.target.value;
                          setFormData({ ...formData, items });
                        }}
                      />
                      <Input
                        label="Badge Text"
                        value={item.badge || "VIDHYA'S PICK"}
                        onChange={(e) => {
                          const items = [
                            ...((formData['items'] as any[]) ||
                              defaultMockContent['vidhyas-picks'].items),
                          ];
                          items[i].badge = e.target.value;
                          setFormData({ ...formData, items });
                        }}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[var(--color-ink)] mb-1.5">
                        Garment Image
                      </label>
                      <ImageUploadField
                        imageUrl={item.image || ''}
                        onChange={(url) => {
                          const items = [
                            ...((formData['items'] as any[]) ||
                              defaultMockContent['vidhyas-picks'].items),
                          ];
                          items[i].image = url;
                          setFormData({ ...formData, items });
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    // Shop The Look Interactive Pin Editor
    if (editingSection === 'shop-the-look') {
      const lookData = (formData || defaultMockContent['shop-the-look']) as Record<string, any>;

      return (
        <Card variant="elevated" padding="lg">
          <CardHeader className="flex flex-row items-center justify-between border-b border-[var(--color-whisper)] pb-4 mb-6">
            <div>
              <Badge variant="outline" className="text-xs mb-2">
                INTERACTIVE HOTSPOTS
              </Badge>
              <CardTitle className="text-[var(--font-display)] text-lg">
                Shop The Look (Interactive Pin & Hotspot Editor)
              </CardTitle>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setEditingSection(null)}>
                Close
              </Button>
              <Button variant="primary" onClick={handleSaveInlineSection} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 border border-[var(--color-whisper)] rounded-xl bg-[var(--color-snow)]/30 space-y-4">
              <h3 className="font-semibold text-sm text-[var(--color-ink)]">
                Banner Headline & Subtitle
              </h3>
              <div className="grid sm:grid-cols-3 gap-4">
                <Input
                  label="Eyebrow Badge"
                  value={lookData['badge'] ?? 'Curated Ensemble'}
                  onChange={(e) => setFormData({ ...lookData, badge: e.target.value })}
                />
                <Input
                  label="Main Title"
                  value={lookData['title'] ?? 'Festive Elegance'}
                  onChange={(e) => setFormData({ ...lookData, title: e.target.value })}
                />
                <Input
                  label="Subtitle Instruction"
                  value={lookData['subtitle'] ?? 'Click pins on image to explore'}
                  onChange={(e) => setFormData({ ...lookData, subtitle: e.target.value })}
                />
              </div>
            </div>

            {/* Model Lifestyle Image & Hotspot Pin Position */}
            <div className="grid lg:grid-cols-2 gap-6 p-4 border border-[var(--color-whisper)] rounded-xl bg-white">
              <div className="space-y-4">
                <h3 className="font-semibold text-sm text-[var(--color-ink)]">
                  1. Lifestyle Model Image
                </h3>
                <ImageUploadField
                  imageUrl={lookData['lifestyle_image_url'] || '/images/products/lehenga-bridal-1.jpg'}
                  onChange={(url) => setFormData({ ...lookData, lifestyle_image_url: url })}
                  aspectRatio="aspect-[4/5]"
                />

                <div className="pt-2 space-y-3">
                  <h4 className="font-semibold text-xs text-[var(--color-ink)]">
                    Pin Hotspot Coordinates (0% to 100%)
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-medium text-[var(--color-slate)]">
                        Horizontal (X): {lookData['pinX'] ?? 47}%
                      </label>
                      <input
                        type="range"
                        min="5"
                        max="95"
                        value={lookData['pinX'] ?? 47}
                        onChange={(e) => setFormData({ ...lookData, pinX: Number(e.target.value) })}
                        className="w-full accent-[var(--color-gold)] cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-medium text-[var(--color-slate)]">
                        Vertical (Y): {lookData['pinY'] ?? 64}%
                      </label>
                      <input
                        type="range"
                        min="5"
                        max="95"
                        value={lookData['pinY'] ?? 64}
                        onChange={(e) => setFormData({ ...lookData, pinY: Number(e.target.value) })}
                        className="w-full accent-[var(--color-gold)] cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Hotspot Preview */}
              <div className="space-y-2">
                <h3 className="font-semibold text-sm text-[var(--color-ink)]">
                  2. Interactive Pin Visual Preview
                </h3>
                <p className="text-xs text-[var(--color-slate)]">
                  The pulsing pin appears over the lifestyle photo at the selected coordinates
                </p>
                <div className="relative aspect-[4/5] rounded-xl overflow-hidden bg-stone-100 border border-[var(--color-whisper)]">
                  <img
                    src={lookData['lifestyle_image_url'] || '/images/products/lehenga-bridal-1.jpg'}
                    alt="Lifestyle model"
                    className="w-full h-full object-cover"
                  />
                  {/* Pin overlay */}
                  <div
                    style={{
                      left: `${lookData['pinX'] ?? 47}%`,
                      top: `${lookData['pinY'] ?? 64}%`,
                    }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 z-10 flex items-center justify-center pointer-events-none"
                  >
                    <span className="animate-ping absolute inline-flex h-8 w-8 rounded-full bg-amber-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-5 w-5 bg-[var(--color-gold)] border-2 border-white shadow-lg text-[10px] text-white font-bold items-center justify-center">
                      1
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Featured Product Details */}
            <div className="p-4 border border-[var(--color-whisper)] rounded-xl bg-[var(--color-snow)]/30 space-y-4">
              <h3 className="font-semibold text-sm text-[var(--color-ink)]">
                3. Pinned Product Popover Card
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <Input
                  label="Product Name"
                  value={lookData['productName'] ?? 'Mirror Work Lehenga'}
                  onChange={(e) => setFormData({ ...lookData, productName: e.target.value })}
                />
                <Input
                  label="Product Slug"
                  value={lookData['productSlug'] ?? 'mirror-work-lehenga'}
                  onChange={(e) => setFormData({ ...lookData, productSlug: e.target.value })}
                />
                <Input
                  label="Selling Price (₹)"
                  type="number"
                  value={lookData['productPrice'] ?? 18999}
                  onChange={(e) =>
                    setFormData({ ...lookData, productPrice: Number(e.target.value) })
                  }
                />
                <Input
                  label="Compare Price (₹)"
                  type="number"
                  value={lookData['productOriginalPrice'] ?? 22999}
                  onChange={(e) =>
                    setFormData({ ...lookData, productOriginalPrice: Number(e.target.value) })
                  }
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--color-ink)] mb-1.5">
                  Product Thumbnail Image
                </label>
                <ImageUploadField
                  imageUrl={lookData['productImage'] || '/images/products/lehenga-mirror-1.jpg'}
                  onChange={(url) => setFormData({ ...lookData, productImage: url })}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card variant="outlined" padding="lg" className="text-center h-full min-h-[400px] flex flex-col justify-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[var(--color-gold-light)] flex items-center justify-center text-3xl">
          ✏️
        </div>
        <h3 className="text-[var(--font-display)] text-xl text-[var(--color-ink)] mb-2">
          Select a Section to Edit
        </h3>
        <p className="text-sm text-[var(--color-slate)] max-w-md mx-auto">
          Choose a section from the left sidebar to edit hero sliders, product showcases, or interactive pins.
        </p>
      </Card>
    );
  };

  // Render Static Page Editor
  const renderStaticPageEditor = (pageId: string) => {
    switch (pageId) {
      case 'shop-page':
        return (
          <ShopPageEditor
            onCancel={() => setEditingStaticPage(null)}
            onSaved={() => toast.success('Shop Page updated successfully!')}
          />
        );
      case 'kurtis-page':
        return (
          <KurtisPageEditor
            onCancel={() => setEditingStaticPage(null)}
            onSaved={() => toast.success('Kurtis Page updated successfully!')}
          />
        );
      case 'about-page':
        return (
          <AboutPageEditor
            onCancel={() => setEditingStaticPage(null)}
            onSaved={() => toast.success('About Us Page updated successfully!')}
          />
        );
      case 'designer-vidhya-page':
        return (
          <DesignerVidhyaPageEditor
            onCancel={() => setEditingStaticPage(null)}
            onSaved={() => toast.success('Meet Designer Vidhya updated successfully!')}
          />
        );
      case 'vidhyas-picks-page':
        return (
          <VidhyasPicksPageEditor
            onCancel={() => setEditingStaticPage(null)}
            onSaved={() => toast.success("Vidhya's Picks Page updated successfully!")}
          />
        );
      case 'sale-page':
        return (
          <SalePageEditor
            onCancel={() => setEditingStaticPage(null)}
            onSaved={() => toast.success('Sale Page updated successfully!')}
          />
        );
      case 'size-finder-page':
        return (
          <SizeFinderPageEditor
            onCancel={() => setEditingStaticPage(null)}
            onSaved={() => toast.success('Size Finder Studio updated successfully!')}
          />
        );
      case 'size-guide-page':
        return (
          <SizeGuidePageEditor
            onCancel={() => setEditingStaticPage(null)}
            onSaved={() => toast.success('Size Guide updated successfully!')}
          />
        );
      case 'faq-page':
        return (
          <FAQPageEditor
            onCancel={() => setEditingStaticPage(null)}
            onSaved={() => toast.success('FAQ & Help Center updated successfully!')}
          />
        );
      case 'contact-page':
        return (
          <ContactPageEditor
            onCancel={() => setEditingStaticPage(null)}
            onSaved={() => toast.success('Contact Page updated successfully!')}
          />
        );
      case 'wholesale-page':
        return (
          <WholesalePageEditor
            onCancel={() => setEditingStaticPage(null)}
            onSaved={() => toast.success('Wholesale Page updated successfully!')}
          />
        );
      case 'shipping-page':
        return (
          <ShippingPageEditor
            onCancel={() => setEditingStaticPage(null)}
            onSaved={() => toast.success('Shipping Policy updated successfully!')}
          />
        );
      case 'returns-page':
        return (
          <ReturnsPageEditor
            onCancel={() => setEditingStaticPage(null)}
            onSaved={() => toast.success('Returns Policy updated successfully!')}
          />
        );
      case 'privacy-policy-page':
        return (
          <PrivacyPolicyPageEditor
            onCancel={() => setEditingStaticPage(null)}
            onSaved={() => toast.success('Privacy Policy updated successfully!')}
          />
        );
      case 'terms-page':
        return (
          <TermsPageEditor
            onCancel={() => setEditingStaticPage(null)}
            onSaved={() => toast.success('Terms of Service updated successfully!')}
          />
        );
      case 'cookies-page':
        return (
          <CookiesPageEditor
            onCancel={() => setEditingStaticPage(null)}
            onSaved={() => toast.success('Cookie Policy updated successfully!')}
          />
        );
      case 'accessibility-page':
        return (
          <AccessibilityPageEditor
            onCancel={() => setEditingStaticPage(null)}
            onSaved={() => toast.success('Accessibility Statement updated successfully!')}
          />
        );
      default:
        return null;
    }
  };

  // Filtered Static Pages
  const filteredPages = staticPagesList.filter((page) => {
    const matchesSearch =
      page.name.toLowerCase().includes(pageSearch.toLowerCase()) ||
      page.path.toLowerCase().includes(pageSearch.toLowerCase()) ||
      page.description.toLowerCase().includes(pageSearch.toLowerCase());
    const matchesCat = pageCategoryFilter === 'all' || page.category === pageCategoryFilter;
    return matchesSearch && matchesCat;
  });

  // Filtered Blog Posts
  const filteredBlogPosts = blogList.filter(
    (post) =>
      post.title.toLowerCase().includes(blogSearch.toLowerCase()) ||
      post.category.toLowerCase().includes(blogSearch.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(blogSearch.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header with Single Clean Storefront Preview */}
      <motion.div
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1
            className="text-[var(--font-display)] text-2xl sm:text-3xl font-semibold text-[var(--color-ink)]"
          >
            Content Management
          </h1>
          <p className="text-xs sm:text-sm text-[var(--color-slate)] mt-1">
            Zero-code storefront management for Vidhya — update homepage banners, curate editorial drops, and edit legal policies.
          </p>
        </div>

        {/* Clean, Non-Duplicate Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-[var(--color-whisper)] rounded-xl text-xs font-semibold text-[var(--color-ink)] hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] transition-colors bg-white shadow-2xs"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>View Live Storefront</span>
            <ExternalLink className="w-3 h-3 text-[var(--color-slate)]" />
          </Link>

          <Link
            href="/shop"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-[var(--color-whisper)] rounded-xl text-xs font-semibold text-[var(--color-ink)] hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] transition-colors bg-white shadow-2xs"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Browse Catalog</span>
            <ExternalLink className="w-3 h-3 text-[var(--color-slate)]" />
          </Link>
        </div>
      </motion.div>

      {/* Main Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(val: any) => {
          setActiveTab(val);
          setEditingStaticPage(null);
        }}
        className="w-full"
      >
        <TabsList className="flex gap-2 mb-6 p-1 bg-stone-100 rounded-xl border border-stone-200 text-xs sm:text-sm">
          <TabsTrigger value="sections" className="flex items-center gap-1.5 font-medium">
            <Layers className="w-4 h-4" />
            <span>Homepage Sections</span>
            <Badge variant="outline" className="ml-1 text-[10px] bg-white border-stone-200">
              {homepageSections.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="pages" className="flex items-center gap-1.5 font-medium">
            <Globe className="w-4 h-4" />
            <span>Static Pages</span>
            <Badge variant="outline" className="ml-1 text-[10px] bg-white border-stone-200">
              {staticPagesList.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="blog" className="flex items-center gap-1.5 font-medium">
            <BookOpen className="w-4 h-4" />
            <span>Blog & Editorials</span>
            <Badge variant="outline" className="ml-1 text-[10px] bg-white border-stone-200">
              {blogList.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        {/* ============================================================== */}
        {/* TAB 1: HOMEPAGE SECTIONS ONLY                                  */}
        {/* ============================================================== */}
        <TabsContent value="sections">
          <motion.div
            className="grid lg:grid-cols-3 gap-6"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Sections Sidebar */}
            <div className="lg:col-span-1">
              <Card variant="elevated" padding="none" className="overflow-hidden">
                <CardHeader className="p-4 border-b border-[var(--color-whisper)] bg-stone-50/70">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-[var(--font-display)] text-base">
                        Homepage Blocks
                      </CardTitle>
                      <p className="text-xs text-[var(--color-slate)] mt-0.5">
                        Modular sections rendered on the storefront homepage
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-[var(--color-whisper)]">
                    {homepageSections.map((section) => (
                      <div
                        key={section.id}
                        className={cn(
                          'p-3.5 hover:bg-[var(--color-snow)] transition-all cursor-pointer border-l-4 group',
                          editingSection === section.id
                            ? 'bg-[var(--color-gold-light)]/60 border-[var(--color-gold)] shadow-2xs'
                            : 'border-transparent'
                        )}
                        onClick={() => handleSelectSection(section.id)}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-semibold text-[var(--color-ink)] text-sm group-hover:text-[var(--color-gold)] transition-colors">
                            {section.label}
                          </h4>
                          <Badge variant="outline" className="text-[10px] capitalize bg-white">
                            {section.type}
                          </Badge>
                        </div>
                        <p className="text-xs text-[var(--color-slate)] line-clamp-1">
                          {section.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Editor Panel */}
            <div className="lg:col-span-2">
              <motion.div
                key={editingSection || 'none'}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
              >
                {renderHomepageSectionEditor()}
              </motion.div>
            </div>
          </motion.div>
        </TabsContent>

        {/* ============================================================== */}
        {/* TAB 2: STATIC PAGES (All 17 Full Page Routes)                  */}
        {/* ============================================================== */}
        <TabsContent value="pages">
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
            {editingStaticPage ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-4 border-b border-[var(--color-whisper)]">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingStaticPage(null)}
                    className="text-xs flex items-center gap-1.5 border-[var(--color-gold)] text-[var(--color-ink)] hover:bg-[var(--color-gold)]/10 font-semibold"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Static Pages List</span>
                  </Button>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[var(--color-slate)]">Currently Editing:</span>
                    <Badge
                      variant="outline"
                      className="text-xs text-amber-700 bg-amber-50 border-amber-200 font-semibold"
                    >
                      {staticPagesList.find((p) => p.id === editingStaticPage)?.name ||
                        editingStaticPage}
                    </Badge>
                  </div>
                </div>
                {renderStaticPageEditor(editingStaticPage)}
              </div>
            ) : (
              <div className="space-y-4">
                {/* Search & Filter Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h2 className="text-[var(--font-display)] text-xl font-medium text-[var(--color-ink)]">
                      Storefront Pages
                    </h2>
                    <p className="text-xs text-[var(--color-slate)] mt-0.5">
                      Configure metadata, rich layouts, FAQ items, and legal policy pages
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Search */}
                    <div className="relative w-full sm:w-64">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search pages or paths..."
                        value={pageSearch}
                        onChange={(e) => setPageSearch(e.target.value)}
                        className="w-full text-xs pl-8 pr-3 py-1.5 rounded-xl border border-stone-200 bg-white focus:outline-none focus:border-[var(--color-gold)]"
                      />
                    </div>

                    {/* Category Filter */}
                    <div className="flex items-center bg-stone-100 p-1 rounded-xl border border-stone-200 text-xs">
                      {['all', 'Catalog', 'Brand Heritage', 'Customer Care', 'Legal Policy'].map(
                        (cat) => (
                          <button
                            key={cat}
                            onClick={() => setPageCategoryFilter(cat)}
                            className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                              pageCategoryFilter === cat
                                ? 'bg-white text-[var(--color-ink)] font-semibold shadow-2xs'
                                : 'text-[var(--color-slate)] hover:text-[var(--color-ink)]'
                            }`}
                          >
                            {cat === 'all' ? 'All Pages' : cat}
                          </button>
                        )
                      )}
                    </div>
                  </div>
                </div>

                {/* Static Pages Table with 100% Consistent 5 Columns */}
                <Card variant="elevated" padding="none" className="overflow-hidden">
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader className="bg-stone-50">
                        <TableRow>
                          <TableHead className="w-[30%]">Page Name</TableHead>
                          <TableHead className="w-[20%]">Route Path</TableHead>
                          <TableHead className="w-[18%]">Status</TableHead>
                          <TableHead className="w-[18%]">Category</TableHead>
                          <TableHead className="w-[14%] text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredPages.map((page) => (
                          <TableRow
                            key={page.id}
                            className="hover:bg-[var(--color-snow)]/60 transition-colors"
                          >
                            <TableCell>
                              <div>
                                <p className="font-semibold text-sm text-[var(--color-ink)]">
                                  {page.name}
                                </p>
                                <p className="text-xs text-[var(--color-slate)] line-clamp-1 mt-0.5">
                                  {page.description}
                                </p>
                              </div>
                            </TableCell>

                            <TableCell>
                              <Link
                                href={page.path}
                                target="_blank"
                                className="text-[var(--color-gold)] hover:underline inline-flex items-center gap-1 font-mono text-xs font-medium"
                              >
                                <span>{page.path}</span>
                                <ExternalLink className="w-3 h-3 text-[var(--color-slate)]" />
                              </Link>
                            </TableCell>

                            <TableCell>
                              <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 font-medium bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                Live on Storefront
                              </span>
                            </TableCell>

                            <TableCell>
                              <Badge variant="outline" className="text-[10px] capitalize bg-white">
                                {page.category}
                              </Badge>
                            </TableCell>

                            <TableCell className="text-right">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setEditingStaticPage(page.id)}
                                className="text-xs border-[var(--color-gold)] text-[var(--color-ink)] hover:bg-[var(--color-gold)]/10 font-semibold"
                              >
                                Manage Page
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}

                        {filteredPages.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-8 text-xs text-[var(--color-slate)]">
                              No pages matching "{pageSearch}".
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            )}
          </motion.div>
        </TabsContent>

        {/* ============================================================== */}
        {/* TAB 3: BLOG & EDITORIALS (Manage & Publish Articles)          */}
        {/* ============================================================== */}
        <TabsContent value="blog">
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-[var(--font-display)] text-xl font-medium text-[var(--color-ink)]">
                  Blog Posts & Editorial Stories
                </h2>
                <p className="text-xs text-[var(--color-slate)] mt-0.5">
                  Publish weaving techniques, styling edits, and textile artisan stories
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative w-48 sm:w-60">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search articles..."
                    value={blogSearch}
                    onChange={(e) => setBlogSearch(e.target.value)}
                    className="w-full text-xs pl-8 pr-3 py-1.5 rounded-xl border border-stone-200 bg-white focus:outline-none focus:border-[var(--color-gold)]"
                  />
                </div>

                <Button
                  variant="primary"
                  onClick={() => setIsCreatingPost(true)}
                  className="flex items-center gap-1.5 text-xs px-3.5 py-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Post</span>
                </Button>
              </div>
            </div>

            {/* New Post Drawer/Modal */}
            {isCreatingPost && (
              <Card variant="elevated" padding="lg" className="border-2 border-[var(--color-gold)]">
                <form onSubmit={handleCreatePost} className="space-y-4">
                  <div className="flex items-center justify-between border-b pb-3">
                    <h3 className="font-semibold text-sm text-[var(--color-ink)]">
                      Create New Editorial Article
                    </h3>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsCreatingPost(false)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <Input
                      label="Article Title"
                      placeholder="e.g. Pure Zari Embroidery Traditions"
                      value={newPostData.title}
                      onChange={(e) =>
                        setNewPostData({
                          ...newPostData,
                          title: e.target.value,
                          slug: e.target.value
                            .toLowerCase()
                            .replace(/[^a-z0-9]+/g, '-')
                            .replace(/^-|-$/g, ''),
                        })
                      }
                      required
                    />
                    <Input
                      label="URL Slug"
                      placeholder="pure-zari-embroidery-traditions"
                      value={newPostData.slug}
                      onChange={(e) => setNewPostData({ ...newPostData, slug: e.target.value })}
                    />
                    <Input
                      label="Author Name"
                      value={newPostData.author}
                      onChange={(e) => setNewPostData({ ...newPostData, author: e.target.value })}
                    />
                    <div>
                      <label className="block text-xs font-semibold text-[var(--color-ink)] mb-1">
                        Category
                      </label>
                      <select
                        value={newPostData.category}
                        onChange={(e) =>
                          setNewPostData({ ...newPostData, category: e.target.value })
                        }
                        className="w-full text-xs px-3 py-2 rounded-xl border border-stone-200 bg-white focus:outline-none focus:border-[var(--color-gold)]"
                      >
                        <option value="Craft & Technique">Craft & Technique</option>
                        <option value="Textile Heritage">Textile Heritage</option>
                        <option value="Styling & Fit">Styling & Fit</option>
                        <option value="Artisan Stories">Artisan Stories</option>
                      </select>
                    </div>
                  </div>

                  <Textarea
                    label="Article Summary / Excerpt"
                    rows={3}
                    placeholder="Brief 1-2 sentence overview shown in blog lists..."
                    value={newPostData.excerpt}
                    onChange={(e) => setNewPostData({ ...newPostData, excerpt: e.target.value })}
                  />

                  <div className="flex justify-end gap-2 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsCreatingPost(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" variant="primary" size="sm">
                      Publish Article
                    </Button>
                  </div>
                </form>
              </Card>
            )}

            {/* Blog Posts Table */}
            <Card variant="elevated" padding="none" className="overflow-hidden">
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-stone-50">
                    <TableRow>
                      <TableHead>Article Title</TableHead>
                      <TableHead>Author</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Publish Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBlogPosts.map((post) => (
                      <TableRow key={post.id} className="hover:bg-stone-50/70 transition-colors">
                        <TableCell>
                          <div>
                            <p className="font-semibold text-sm text-[var(--color-ink)]">
                              {post.title}
                            </p>
                            <p className="text-xs text-[var(--color-slate)] line-clamp-1 mt-0.5">
                              {post.excerpt}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs font-medium text-[var(--color-ink)]">
                          {post.author}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[10px] bg-white">
                            {post.category}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-[var(--color-slate)]">
                          {post.date}
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 font-medium bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            {post.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeletePost(post.id, post.title)}
                            className="text-xs text-rose-500 hover:text-rose-700 hover:bg-rose-50 h-7 px-2"
                          >
                            <Trash2 className="w-3.5 h-3.5 mr-1" />
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}

                    {filteredBlogPosts.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-xs text-[var(--color-slate)]">
                          No blog posts found matching "{blogSearch}".
                        </TableCell>
                      </TableRow>
                    )}
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
