'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils/cn';
import type {
  DesignerVidhyaPageContent,
  DesignerVidhyaMetric,
  DesignerVidhyaTenet,
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

const DEFAULT_VIDHYA_PAGE_DATA: DesignerVidhyaPageContent = {
  header: {
    breadcrumbHome: 'Home',
    breadcrumbAbout: 'About Us',
    breadcrumbCurrent: 'Meet Designer Vidhya',
    eyebrow: 'THE CREATIVE SOUL BEHIND ANGELIKA',
    title: 'Meet Designer Vidhya',
    quote:
      '"Ethnic wear shouldn\'t just be worn for an occasion; it should feel like an heirloom that holds the memory of the celebration and honors the hands that wove it."',
  },
  story: {
    eyebrow: 'HERITAGE & ATELIER PHILOSOPHY',
    title: 'Reinventing Handloom Couture for the Contemporary Woman',
    paragraphs: [
      'Trained in the historic weaving heartlands of Varanasi, Chanderi, and Kanchipuram, Vidhya established Angelika Fashions to bridge the generational divide between timeless Indian textiles and effortless modern silhouettes.',
      'Every drape is conceived around comfort, movement, and genuine pure silk authenticity. Rejecting synthetic polyester copies and mass production, Vidhya works directly with over 40 artisan master weaving families across India.',
    ],
    image: '/images/categories/sarees.jpg',
    imageAlt: 'Designer Vidhya draping handloom silk',
    designerName: 'Vidhya',
    designerRole: 'Founder & Creative Director',
    metrics: [
      { value: '100%', label: 'Certified Pure Handloom' },
      { value: '40+', label: 'Weaving Families Supported' },
      { value: '12k+', label: 'Global Drapes Styled' },
    ],
  },
  tenets: {
    title: "The Three Tenets of Vidhya's Atelier",
    items: [
      {
        number: '1.',
        title: 'Ethical Loom Direct',
        description:
          'Fair living wages and direct artisan profit sharing without distributor commissions.',
      },
      {
        number: '2.',
        title: 'Weightless Grandeur',
        description:
          'Re-engineering traditional heavy zari into breathable, feather-light drapes you can dance in.',
      },
      {
        number: '3.',
        title: 'Private Client Styling',
        description:
          'Complimentary direct consultation with Vidhya to personalize blouse cuts, dupatta styling, and trousseau curation.',
      },
    ],
  },
  consultation: {
    eyebrow: 'CONSULT DIRECTLY WITH VIDHYA',
    title: 'Book a Personal WhatsApp Styling Session',
    description:
      'Need advice on which silhouette suits your body type or which color palette matches your bridal celebration? Designer Vidhya is available for complimentary styling consultations.',
    buttonText: 'Chat with Designer Vidhya on WhatsApp →',
    whatsappUrl:
      'https://wa.me/919876543210?text=Hi%20Vidhya,%20I%20would%20love%20a%20personal%20styling%20session%20with%20you.',
  },
  seo: {
    metaTitle: 'Meet Designer Vidhya | Angelika Fashions Atelier',
    metaDescription:
      'Discover the artisanal journey, design philosophy, and master craft heritage of Designer Vidhya at Angelika Fashions.',
  },
};

const SUGGESTED_PORTRAITS = [
  { label: 'Category Sarees Portrait', path: '/images/categories/sarees.jpg' },
  { label: 'Vidhya Founder Portrait', path: '/images/vidhya-founder.jpg' },
  { label: 'Vidhya Story Atelier', path: '/images/vidhya-story.jpg' },
  { label: 'Team Vidhya Atelier', path: '/images/team-vidhya.jpg' },
  { label: 'Hero Couture Drape', path: '/images/hero-new-couture.jpg' },
];

type TabKey = 'header' | 'story' | 'tenets' | 'consultation' | 'seo';

export function DesignerVidhyaPageEditor({
  onCancel,
  onSaved,
}: {
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [formData, setFormData] = useState<DesignerVidhyaPageContent>(DEFAULT_VIDHYA_PAGE_DATA);
  const [activeTab, setActiveTab] = useState<TabKey>('header');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Load existing content
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const res = await fetch('/api/admin/content');
        if (res.ok) {
          const json = await res.json();
          if (json.content && json.content['designer-vidhya-page'] && isMounted) {
            const raw = json.content['designer-vidhya-page'];
            setFormData({
              header: {
                ...DEFAULT_VIDHYA_PAGE_DATA.header,
                ...(raw.header || {}),
              },
              story: {
                ...DEFAULT_VIDHYA_PAGE_DATA.story,
                ...(raw.story || {}),
                paragraphs:
                  Array.isArray(raw.story?.paragraphs) && raw.story.paragraphs.length > 0
                    ? raw.story.paragraphs
                    : DEFAULT_VIDHYA_PAGE_DATA.story.paragraphs,
                metrics:
                  Array.isArray(raw.story?.metrics) && raw.story.metrics.length > 0
                    ? raw.story.metrics
                    : DEFAULT_VIDHYA_PAGE_DATA.story.metrics,
              },
              tenets: {
                ...DEFAULT_VIDHYA_PAGE_DATA.tenets,
                ...(raw.tenets || {}),
                items:
                  Array.isArray(raw.tenets?.items) && raw.tenets.items.length > 0
                    ? raw.tenets.items
                    : DEFAULT_VIDHYA_PAGE_DATA.tenets.items,
              },
              consultation: {
                ...DEFAULT_VIDHYA_PAGE_DATA.consultation,
                ...(raw.consultation || {}),
              },
              seo: {
                ...DEFAULT_VIDHYA_PAGE_DATA.seo,
                ...(raw.seo || {}),
              },
            });
          }
        }
      } catch (err) {
        console.error('Failed to load designer-vidhya-page content:', err);
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
          sectionId: 'designer-vidhya-page',
          data: formData,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMessage({
          type: 'success',
          text: 'Designer Vidhya page updated successfully! Your updates are now live on /about/vidhya.',
        });
        onSaved();
      } else {
        setStatusMessage({
          type: 'error',
          text: data.error || 'Failed to save Designer Vidhya content.',
        });
      }
    } catch {
      setStatusMessage({
        type: 'error',
        text: 'Network error occurred while saving.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetToDefaults = () => {
    if (
      confirm(
        'Are you sure you want to restore the default designer content and editorial copy for Meet Designer Vidhya?'
      )
    ) {
      setFormData(DEFAULT_VIDHYA_PAGE_DATA);
      setStatusMessage({
        type: 'success',
        text: 'Content restored to factory defaults. Click "Save Changes" to publish.',
      });
    }
  };

  // Paragraph helpers
  const handleAddParagraph = () => {
    setFormData((prev) => ({
      ...prev,
      story: {
        ...prev.story,
        paragraphs: [...prev.story.paragraphs, ''],
      },
    }));
  };

  const handleUpdateParagraph = (idx: number, val: string) => {
    setFormData((prev) => {
      const copy = [...prev.story.paragraphs];
      copy[idx] = val;
      return {
        ...prev,
        story: {
          ...prev.story,
          paragraphs: copy,
        },
      };
    });
  };

  const handleRemoveParagraph = (idx: number) => {
    setFormData((prev) => ({
      ...prev,
      story: {
        ...prev.story,
        paragraphs: prev.story.paragraphs.filter((_, i) => i !== idx),
      },
    }));
  };

  // Metric helpers
  const handleAddMetric = () => {
    setFormData((prev) => ({
      ...prev,
      story: {
        ...prev.story,
        metrics: [...prev.story.metrics, { value: 'New', label: 'Metric Description' }],
      },
    }));
  };

  const handleUpdateMetric = (idx: number, field: keyof DesignerVidhyaMetric, val: string) => {
    setFormData((prev) => {
      const copy = [...prev.story.metrics];
      const current = copy[idx] || { value: '', label: '' };
      copy[idx] = {
        value: field === 'value' ? val : current.value,
        label: field === 'label' ? val : current.label,
      };
      return {
        ...prev,
        story: {
          ...prev.story,
          metrics: copy,
        },
      };
    });
  };

  const handleRemoveMetric = (idx: number) => {
    setFormData((prev) => ({
      ...prev,
      story: {
        ...prev.story,
        metrics: prev.story.metrics.filter((_, i) => i !== idx),
      },
    }));
  };

  // Tenet helpers
  const handleAddTenet = () => {
    const nextNum = `${formData.tenets.items.length + 1}.`;
    setFormData((prev) => ({
      ...prev,
      tenets: {
        ...prev.tenets,
        items: [
          ...prev.tenets.items,
          {
            number: nextNum,
            title: 'New Tenet Title',
            description: 'Provide an inspiring description of this atelier design pillar.',
          },
        ],
      },
    }));
  };

  const handleUpdateTenet = (idx: number, field: keyof DesignerVidhyaTenet, val: string) => {
    setFormData((prev) => {
      const copy = [...prev.tenets.items];
      const current = copy[idx] || { number: '', title: '', description: '' };
      copy[idx] = {
        number: field === 'number' ? val : current.number,
        title: field === 'title' ? val : current.title,
        description: field === 'description' ? val : current.description,
      };
      return {
        ...prev,
        tenets: {
          ...prev.tenets,
          items: copy,
        },
      };
    });
  };

  const handleRemoveTenet = (idx: number) => {
    setFormData((prev) => ({
      ...prev,
      tenets: {
        ...prev.tenets,
        items: prev.tenets.items.filter((_, i) => i !== idx),
      },
    }));
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center text-xs text-[var(--color-slate)] space-y-3">
        <div className="w-6 h-6 border-2 border-[var(--color-gold)] border-t-transparent rounded-full animate-spin mx-auto" />
        <p>Loading Meet Designer Vidhya editor...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[var(--color-whisper)]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-base font-serif font-semibold text-[var(--color-ink)]">
              Meet Designer Vidhya Page Editor
            </span>
            <Badge variant="outline" className="text-[10px] text-amber-700 bg-amber-50 border-amber-200">
              Atelier & Heritage
            </Badge>
          </div>
          <p className="text-xs text-[var(--color-slate)]">
            Manage the biography, design philosophy, artisanal pillars, and WhatsApp consultation desk on{' '}
            <Link
              href="/about/vidhya"
              target="_blank"
              className="text-[var(--color-gold)] hover:underline font-mono inline-flex items-center gap-1"
            >
              /about/vidhya <span>↗</span>
            </Link>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetToDefaults}
            className="text-xs border-[var(--color-whisper)] text-[var(--color-slate)] hover:text-red-700 hover:border-red-200"
          >
            Reset Defaults
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onCancel}
            className="text-xs border-[var(--color-whisper)] text-[var(--color-slate)]"
          >
            Cancel
          </Button>
          <Button
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
            'p-3 rounded-lg text-xs flex items-center justify-between',
            statusMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          )}
        >
          <span>{statusMessage.text}</span>
          <button
            onClick={() => setStatusMessage(null)}
            className="text-xs opacity-60 hover:opacity-100 font-bold ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* Tabs Bar */}
      <div className="flex items-center gap-1 border-b border-[var(--color-whisper)] pb-px overflow-x-auto">
        {(
          [
            { id: 'header', label: '1. Header & Quote' },
            { id: 'story', label: '2. Atelier Story & Metrics' },
            { id: 'tenets', label: '3. Three Tenets' },
            { id: 'consultation', label: '4. WhatsApp Desk' },
            { id: 'seo', label: '5. SEO & Meta' },
          ] as { id: TabKey; label: string }[]
        ).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'px-4 py-2 text-xs font-medium whitespace-nowrap transition-colors border-b-2',
              activeTab === tab.id
                ? 'border-[var(--color-gold)] text-[var(--color-ink)] font-semibold'
                : 'border-transparent text-[var(--color-slate)] hover:text-[var(--color-ink)]'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: Header & Quote */}
      {activeTab === 'header' && (
        <div className="space-y-6">
          <div className="bg-[#FAF8F5] border border-[#EAE4D9] rounded-xl p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-gold)]">
              Hero Header & Philosophical Quote
            </h3>
            <p className="text-xs text-[var(--color-slate)]">
              Customize the page title, gold eyebrow badge, breadcrumbs, and Vidhya's signature quote displayed at the very top of the page.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <AdminFormField
                label="Breadcrumb: Home Link"
                value={formData.header.breadcrumbHome}
                onChange={(val) =>
                  setFormData((prev) => ({
                    ...prev,
                    header: { ...prev.header, breadcrumbHome: val },
                  }))
                }
              />
              <AdminFormField
                label="Breadcrumb: About Link"
                value={formData.header.breadcrumbAbout}
                onChange={(val) =>
                  setFormData((prev) => ({
                    ...prev,
                    header: { ...prev.header, breadcrumbAbout: val },
                  }))
                }
              />
              <AdminFormField
                label="Breadcrumb: Current Page"
                value={formData.header.breadcrumbCurrent}
                onChange={(val) =>
                  setFormData((prev) => ({
                    ...prev,
                    header: { ...prev.header, breadcrumbCurrent: val },
                  }))
                }
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <AdminFormField
                label="Eyebrow Badge"
                value={formData.header.eyebrow}
                placeholder="THE CREATIVE SOUL BEHIND ANGELIKA"
                onChange={(val) =>
                  setFormData((prev) => ({
                    ...prev,
                    header: { ...prev.header, eyebrow: val },
                  }))
                }
                helperText="Appears in gold uppercase above the main heading."
              />
              <AdminFormField
                label="Main Page Title"
                value={formData.header.title}
                placeholder="Meet Designer Vidhya"
                onChange={(val) =>
                  setFormData((prev) => ({
                    ...prev,
                    header: { ...prev.header, title: val },
                  }))
                }
                helperText="Primary H1 font-serif headline."
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[var(--color-ink)] tracking-wide">
                Signature Designer Quote
              </label>
              <textarea
                rows={3}
                value={formData.header.quote}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    header: { ...prev.header, quote: e.target.value },
                  }))
                }
                className="w-full text-xs p-3 rounded-lg border border-[var(--color-whisper)] bg-[var(--color-white)] text-[var(--color-ink)] placeholder:text-[var(--color-mist)] focus:outline-none focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)] transition-colors"
                placeholder="Ethnic wear shouldn't just be worn for an occasion..."
              />
              <p className="text-[10px] text-[var(--color-slate)]">
                Emphasizes Vidhya's personal dedication to traditional handloom storytelling.
              </p>
            </div>
          </div>

          {/* Live Header Preview */}
          <div className="border border-[#EAE4D9] rounded-xl p-6 bg-white space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-slate)] block mb-1">
              Live Header Preview
            </span>
            <div className="text-xs text-[var(--color-slate)] flex items-center gap-2 mb-2 font-light">
              <span>{formData.header.breadcrumbHome || 'Home'}</span>
              <span>/</span>
              <span>{formData.header.breadcrumbAbout || 'About Us'}</span>
              <span>/</span>
              <span className="text-[var(--color-ink)] font-medium">
                {formData.header.breadcrumbCurrent || 'Meet Designer Vidhya'}
              </span>
            </div>
            <span className="text-[11px] font-semibold tracking-[0.24em] uppercase text-[var(--color-gold)] block">
              {formData.header.eyebrow || 'THE CREATIVE SOUL BEHIND ANGELIKA'}
            </span>
            <h2 className="font-serif text-3xl text-[var(--color-ink)] font-normal">
              {formData.header.title || 'Meet Designer Vidhya'}
            </h2>
            <p className="text-sm text-[var(--color-slate)] font-light leading-relaxed max-w-2xl italic">
              {formData.header.quote}
            </p>
          </div>
        </div>
      )}

      {/* TAB 2: Atelier Story & Metrics */}
      {activeTab === 'story' && (
        <div className="space-y-6">
          <div className="bg-[#FAF8F5] border border-[#EAE4D9] rounded-xl p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-gold)]">
              Heritage & Atelier Philosophy Card
            </h3>
            <p className="text-xs text-[var(--color-slate)]">
              Manage the 2-column hero profile card: designer portrait image, founder tag, story narrative, and verifiable atelier metrics.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <AdminFormField
                label="Section Eyebrow"
                value={formData.story.eyebrow}
                placeholder="HERITAGE & ATELIER PHILOSOPHY"
                onChange={(val) =>
                  setFormData((prev) => ({
                    ...prev,
                    story: { ...prev.story, eyebrow: val },
                  }))
                }
              />
              <AdminFormField
                label="Philosophy Title"
                value={formData.story.title}
                placeholder="Reinventing Handloom Couture for the Contemporary Woman"
                onChange={(val) =>
                  setFormData((prev) => ({
                    ...prev,
                    story: { ...prev.story, title: val },
                  }))
                }
              />
            </div>

            {/* Designer Image & Details */}
            <div className="p-4 rounded-lg bg-white border border-[#EAE4D9] space-y-4">
              <span className="text-xs font-bold text-[var(--color-ink)] block">
                Designer Portrait & Caption Overlay
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <AdminFormField
                  label="Portrait Image Path / URL"
                  value={formData.story.image}
                  placeholder="/images/categories/sarees.jpg"
                  onChange={(val) =>
                    setFormData((prev) => ({
                      ...prev,
                      story: { ...prev.story, image: val },
                    }))
                  }
                  helperText="Local public image path or secure HTTPS photo."
                />
                <AdminFormField
                  label="Image Alt Text"
                  value={formData.story.imageAlt}
                  placeholder="Designer Vidhya draping handloom silk"
                  onChange={(val) =>
                    setFormData((prev) => ({
                      ...prev,
                      story: { ...prev.story, imageAlt: val },
                    }))
                  }
                />
              </div>

              {/* Quick Image Picker */}
              <div>
                <label className="block text-[11px] font-semibold text-[var(--color-slate)] mb-1.5">
                  Suggested Atelier Imagery
                </label>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTED_PORTRAITS.map((img) => (
                    <button
                      key={img.path}
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          story: { ...prev.story, image: img.path },
                        }))
                      }
                      className={cn(
                        'text-[10px] px-2.5 py-1 rounded border transition-colors',
                        formData.story.image === img.path
                          ? 'border-[var(--color-gold)] bg-[var(--color-gold)]/10 text-[var(--color-gold)] font-bold'
                          : 'border-[var(--color-whisper)] text-[var(--color-slate)] hover:bg-[#FAF8F5]'
                      )}
                    >
                      {img.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <AdminFormField
                  label="Overlay Name Tag"
                  value={formData.story.designerName}
                  placeholder="Vidhya"
                  onChange={(val) =>
                    setFormData((prev) => ({
                      ...prev,
                      story: { ...prev.story, designerName: val },
                    }))
                  }
                />
                <AdminFormField
                  label="Overlay Role Tag"
                  value={formData.story.designerRole}
                  placeholder="Founder & Creative Director"
                  onChange={(val) =>
                    setFormData((prev) => ({
                      ...prev,
                      story: { ...prev.story, designerRole: val },
                    }))
                  }
                />
              </div>
            </div>

            {/* Story Paragraphs */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-[var(--color-ink)]">
                  Story Paragraphs ({formData.story.paragraphs.length})
                </label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddParagraph}
                  className="text-xs border-[var(--color-gold)] text-[var(--color-gold)] hover:bg-[var(--color-gold)]/10"
                >
                  + Add Paragraph
                </Button>
              </div>

              {formData.story.paragraphs.map((p, idx) => (
                <div key={idx} className="p-3 bg-white rounded-lg border border-[#EAE4D9] space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-[var(--color-slate)]">
                    <span>Paragraph {idx + 1}</span>
                    {formData.story.paragraphs.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveParagraph(idx)}
                        className="text-red-600 hover:text-red-800 text-[11px]"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <textarea
                    rows={3}
                    value={p}
                    onChange={(e) => handleUpdateParagraph(idx, e.target.value)}
                    className="w-full text-xs p-2.5 rounded border border-[var(--color-whisper)] bg-[var(--color-white)] text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-gold)]"
                    placeholder="Enter story text..."
                  />
                </div>
              ))}
            </div>

            {/* Metrics Badges */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-[var(--color-ink)]">
                  Atelier Metric Badges ({formData.story.metrics.length})
                </label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddMetric}
                  className="text-xs border-[var(--color-gold)] text-[var(--color-gold)] hover:bg-[var(--color-gold)]/10"
                >
                  + Add Metric
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {formData.story.metrics.map((metric, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-white border border-[#EAE4D9] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-[var(--color-gold)]">
                        Badge #{idx + 1}
                      </span>
                      {formData.story.metrics.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveMetric(idx)}
                          className="text-red-600 hover:text-red-800 text-[10px]"
                        >
                          ✕ Delete
                        </button>
                      )}
                    </div>
                    <AdminFormField
                      label="Metric Value"
                      value={metric.value}
                      placeholder="100%"
                      onChange={(val) => handleUpdateMetric(idx, 'value', val)}
                    />
                    <AdminFormField
                      label="Metric Description"
                      value={metric.label}
                      placeholder="Certified Pure Handloom"
                      onChange={(val) => handleUpdateMetric(idx, 'label', val)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Live Card Preview */}
          <div className="border border-[#EAE4D9] rounded-2xl p-6 bg-white shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-slate)] block mb-4">
              Live Atelier Card Preview
            </span>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              <div className="md:col-span-5 relative">
                <div className="aspect-3/4 rounded-xl overflow-hidden bg-[#FAF8F5] border border-[#E5DFD5] relative">
                  <img
                    src={formData.story.image || '/images/categories/sarees.jpg'}
                    alt={formData.story.imageAlt || 'Designer portrait'}
                    className="w-full h-full object-cover object-top"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = '/images/categories/sarees.jpg';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-ink)]/70 via-transparent to-transparent flex items-end p-4">
                    <div className="text-white">
                      <p className="font-serif text-base leading-tight">
                        {formData.story.designerName || 'Vidhya'}
                      </p>
                      <p className="text-[9px] tracking-widest uppercase text-[var(--color-gold)]">
                        {formData.story.designerRole || 'Founder & Creative Director'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="md:col-span-7 space-y-3">
                <span className="text-[10px] font-semibold tracking-widest uppercase text-[var(--color-gold)]">
                  {formData.story.eyebrow}
                </span>
                <h3 className="font-serif text-xl text-[var(--color-ink)] font-normal">
                  {formData.story.title}
                </h3>
                {formData.story.paragraphs.map((para, i) => (
                  <p key={i} className="text-xs text-[var(--color-slate)] leading-relaxed">
                    {para}
                  </p>
                ))}

                <div className="pt-2 flex flex-wrap gap-2">
                  {formData.story.metrics.map((m, i) => (
                    <div key={i} className="p-2.5 rounded-lg bg-[#FCFAF7] border border-[#E5DECF] text-xs">
                      <span className="font-serif font-bold text-sm text-[var(--color-gold)] block">
                        {m.value}
                      </span>
                      <span className="text-[10px] text-[var(--color-slate)]">{m.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Three Tenets */}
      {activeTab === 'tenets' && (
        <div className="space-y-6">
          <div className="bg-[#FAF8F5] border border-[#EAE4D9] rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-gold)]">
                  Atelier Pillars & Tenets
                </h3>
                <p className="text-xs text-[var(--color-slate)]">
                  The three core artisanal commitments of Designer Vidhya's atelier.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddTenet}
                className="text-xs border-[var(--color-gold)] text-[var(--color-gold)] hover:bg-[var(--color-gold)]/10"
              >
                + Add Pillar
              </Button>
            </div>

            <AdminFormField
              label="Tenets Section Heading"
              value={formData.tenets.title}
              placeholder="The Three Tenets of Vidhya's Atelier"
              onChange={(val) =>
                setFormData((prev) => ({
                  ...prev,
                  tenets: { ...prev.tenets, title: val },
                }))
              }
            />

            <div className="space-y-3 pt-2">
              {formData.tenets.items.map((tenet, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-white border border-[#EAE4D9] space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-[var(--color-gold)]/10 text-[var(--color-gold)] font-bold text-xs flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="text-xs font-bold text-[var(--color-ink)]">
                        Pillar #{idx + 1}
                      </span>
                    </div>
                    {formData.tenets.items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveTenet(idx)}
                        className="text-red-600 hover:text-red-800 text-xs"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <AdminFormField
                      label="Numeral / Index"
                      value={tenet.number}
                      placeholder="1."
                      onChange={(val) => handleUpdateTenet(idx, 'number', val)}
                      className="sm:col-span-1"
                    />
                    <AdminFormField
                      label="Pillar Title"
                      value={tenet.title}
                      placeholder="Ethical Loom Direct"
                      onChange={(val) => handleUpdateTenet(idx, 'title', val)}
                      className="sm:col-span-3"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-[var(--color-ink)]">
                      Description & Artisan Guarantee
                    </label>
                    <textarea
                      rows={2}
                      value={tenet.description}
                      onChange={(e) => handleUpdateTenet(idx, 'description', e.target.value)}
                      className="w-full text-xs p-2.5 rounded-lg border border-[var(--color-whisper)] bg-[var(--color-white)] text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-gold)]"
                      placeholder="Fair living wages and direct artisan profit sharing without distributor commissions."
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Live Tenets Preview */}
          <div className="border border-[#EAE4D9] rounded-2xl p-6 bg-white shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-slate)] block mb-3">
              Live Tenets Preview
            </span>
            <h3 className="font-serif text-xl text-[var(--color-ink)] font-normal mb-4">
              {formData.tenets.title}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {formData.tenets.items.map((tenet, idx) => (
                <div key={idx} className="space-y-2">
                  <h4 className="font-semibold text-xs text-[var(--color-ink)] uppercase tracking-wider">
                    {tenet.number} {tenet.title}
                  </h4>
                  <p className="text-xs text-[var(--color-slate)] leading-relaxed">
                    {tenet.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: WhatsApp Consultation Desk */}
      {activeTab === 'consultation' && (
        <div className="space-y-6">
          <div className="bg-[#FAF8F5] border border-[#EAE4D9] rounded-xl p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-gold)]">
              Direct Concierge & WhatsApp Consultation Desk
            </h3>
            <p className="text-xs text-[var(--color-slate)]">
              Configure the callout box inviting clients to book a personal styling chat with Vidhya.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <AdminFormField
                label="Eyebrow"
                value={formData.consultation.eyebrow}
                placeholder="CONSULT DIRECTLY WITH VIDHYA"
                onChange={(val) =>
                  setFormData((prev) => ({
                    ...prev,
                    consultation: { ...prev.consultation, eyebrow: val },
                  }))
                }
              />
              <AdminFormField
                label="Heading"
                value={formData.consultation.title}
                placeholder="Book a Personal WhatsApp Styling Session"
                onChange={(val) =>
                  setFormData((prev) => ({
                    ...prev,
                    consultation: { ...prev.consultation, title: val },
                  }))
                }
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[var(--color-ink)]">
                Description Copy
              </label>
              <textarea
                rows={3}
                value={formData.consultation.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    consultation: { ...prev.consultation, description: e.target.value },
                  }))
                }
                className="w-full text-xs p-3 rounded-lg border border-[var(--color-whisper)] bg-[var(--color-white)] text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-gold)]"
                placeholder="Need advice on which silhouette suits your body type..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <AdminFormField
                label="CTA Button Text"
                value={formData.consultation.buttonText}
                placeholder="Chat with Designer Vidhya on WhatsApp →"
                onChange={(val) =>
                  setFormData((prev) => ({
                    ...prev,
                    consultation: { ...prev.consultation, buttonText: val },
                  }))
                }
              />
              <AdminFormField
                label="WhatsApp Direct Link / Action"
                value={formData.consultation.whatsappUrl}
                placeholder="https://wa.me/919876543210?text=Hi%20Vidhya..."
                onChange={(val) =>
                  setFormData((prev) => ({
                    ...prev,
                    consultation: { ...prev.consultation, whatsappUrl: val },
                  }))
                }
                helperText="Must be a valid wa.me URL with phone number and optional prefilled message."
              />
            </div>

            <div className="pt-2 flex items-center gap-2">
              <a
                href={formData.consultation.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs px-3 py-1.5 rounded bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition-colors inline-flex items-center gap-1.5"
              >
                <span>💬 Test WhatsApp Link</span>
                <span className="text-[10px]">↗</span>
              </a>
              <span className="text-[11px] text-[var(--color-slate)]">
                Click to verify the link opens WhatsApp with your prefilled greeting.
              </span>
            </div>
          </div>

          {/* Live Consultation Preview */}
          <div className="border border-[#EAE4D9] rounded-xl p-8 bg-[#FAF8F5] text-center space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-slate)] block mb-1">
              Live Callout Box Preview
            </span>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-gold)]">
              {formData.consultation.eyebrow}
            </p>
            <h3 className="font-serif text-xl text-[var(--color-ink)]">
              {formData.consultation.title}
            </h3>
            <p className="text-xs text-[var(--color-slate)] max-w-lg mx-auto">
              {formData.consultation.description}
            </p>
            <div className="pt-2 flex justify-center">
              <button
                type="button"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[var(--color-ink)] text-white text-xs font-medium tracking-wide pointer-events-none"
              >
                {formData.consultation.buttonText}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: SEO & Meta */}
      {activeTab === 'seo' && (
        <div className="space-y-6">
          <div className="bg-[#FAF8F5] border border-[#EAE4D9] rounded-xl p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-gold)]">
              Search Engine Optimization (SEO) & Social Graph
            </h3>
            <p className="text-xs text-[var(--color-slate)]">
              Manage how the Designer Vidhya story page appears on Google search results and shared social cards.
            </p>

            <AdminFormField
              label="Meta Title"
              value={formData.seo.metaTitle}
              placeholder="Meet Designer Vidhya | Angelika Fashions Atelier"
              onChange={(val) =>
                setFormData((prev) => ({
                  ...prev,
                  seo: { ...prev.seo, metaTitle: val },
                }))
              }
              helperText={`${formData.seo.metaTitle.length}/60 characters (recommended 50-60).`}
            />

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[var(--color-ink)]">
                Meta Description
              </label>
              <textarea
                rows={3}
                value={formData.seo.metaDescription}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    seo: { ...prev.seo, metaDescription: e.target.value },
                  }))
                }
                className="w-full text-xs p-3 rounded-lg border border-[var(--color-whisper)] bg-[var(--color-white)] text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-gold)]"
                placeholder="Discover the artisanal journey, design philosophy..."
              />
              <p className="text-[10px] text-[var(--color-slate)]">
                {formData.seo.metaDescription.length}/160 characters (recommended 140-160).
              </p>
            </div>
          </div>

          {/* Google SERP Preview */}
          <div className="border border-[#EAE4D9] rounded-xl p-5 bg-white space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-slate)] block mb-1">
              Google Search Result Snippet Preview
            </span>
            <div className="font-sans text-xs text-[#202124] space-y-1">
              <div className="text-[11px] text-[#202124] flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-[var(--color-gold)] text-white text-[9px] flex items-center justify-center font-serif">
                  A
                </span>
                <span>angelikafashions.com › about › vidhya</span>
              </div>
              <p className="text-base text-[#1a0dab] hover:underline cursor-pointer font-medium leading-snug">
                {formData.seo.metaTitle || 'Meet Designer Vidhya | Angelika Fashions Atelier'}
              </p>
              <p className="text-xs text-[#4d5156] leading-relaxed max-w-xl">
                {formData.seo.metaDescription ||
                  'Discover the artisanal journey, design philosophy, and master craft heritage of Designer Vidhya at Angelika Fashions.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Footer Bottom Bar */}
      <div className="flex items-center justify-between pt-4 border-t border-[var(--color-whisper)]">
        <Link
          href="/about/vidhya"
          target="_blank"
          className="text-xs text-[var(--color-gold)] hover:underline inline-flex items-center gap-1"
        >
          <span>Preview Live Storefront Page (/about/vidhya)</span>
          <span>↗</span>
        </Link>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onCancel}
            className="text-xs border-[var(--color-whisper)] text-[var(--color-slate)]"
          >
            Cancel
          </Button>
          <Button
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
