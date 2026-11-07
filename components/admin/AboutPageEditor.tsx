'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils/cn';
import type {
  AboutPageContent,
  AboutValueItem,
  AboutMilestoneItem,
  AboutTeamMember,
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

function ImageUploader({
  imageUrl,
  onChange,
  aspectRatio = 'aspect-[16/9]',
  title = 'Image',
}: {
  imageUrl: string;
  onChange: (url: string) => void;
  aspectRatio?: string;
  title?: string;
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
      reader.onerror = () => setUploadError('Failed to read image file');
      reader.readAsDataURL(file);
    };

    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('category', 'about');

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: fd,
      });

      if (res.ok) {
        const data = await res.json();
        if (data.url) {
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setUploadError('Only image files are allowed');
        return;
      }
      uploadFile(file);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-[var(--color-ink)]">
          {title}
        </label>
        {pasteSuccess && (
          <span className="text-[10px] text-emerald-600 font-medium">✓ Image loaded!</span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-start">
        <div className="sm:col-span-4 lg:col-span-3">
          <div className={cn(
            'relative w-full rounded-xl overflow-hidden border border-[var(--color-whisper)] bg-[var(--color-snow)] shadow-inner group',
            aspectRatio
          )}>
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center text-[var(--color-slate)]">
                <span className="text-xl mb-1">🖼️</span>
                <span className="text-[10px]">No image selected</span>
              </div>
            )}
            {isUploading && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-xs font-medium">
                Uploading...
              </div>
            )}
          </div>
        </div>

        <div className="sm:col-span-8 lg:col-span-9 space-y-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="px-3.5 py-2 text-xs font-medium rounded-lg bg-[var(--color-ink)] text-white hover:bg-[var(--color-ink)]/90 transition-all flex items-center gap-1.5 shadow-xs"
            >
              <span>📁</span>
              <span>Upload New File</span>
            </button>
            <span className="text-[11px] text-[var(--color-slate)]">
              Supports JPG, PNG, WebP up to 10MB
            </span>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-[var(--color-slate)] tracking-wider">
              Or Paste Direct Image URL
            </label>
            <input
              type="text"
              value={imageUrl || ''}
              onChange={(e) => onChange(e.target.value)}
              placeholder="https://... or /images/..."
              className="w-full h-9 text-xs px-3 rounded-lg border border-[var(--color-whisper)] bg-[var(--color-white)] text-[var(--color-ink)] font-mono placeholder:font-sans placeholder:text-[var(--color-mist)] focus:outline-none focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)] transition-colors"
            />
          </div>

          {uploadError && (
            <p className="text-[11px] text-rose-600 font-medium">{uploadError}</p>
          )}
        </div>
      </div>
    </div>
  );
}

const DEFAULT_ABOUT_DATA: AboutPageContent = {
  hero: {
    badge: 'OUR STORY',
    title: 'Crafted with Intention, Worn with Pride',
    titleHighlight1: 'Intention',
    titleHighlight2: 'Pride',
    description: 'Angelika Fashions began with a simple belief: ethnic wear should make you feel like the best version of yourself - rooted, radiant, and entirely you.',
    backgroundImage: '/images/about-hero.jpg',
    primaryCtaText: 'Explore Collection',
    primaryCtaLink: '/shop',
    secondaryCtaText: "View Vidhya's Picks",
    secondaryCtaLink: '/vidhyas-picks',
    scrollText: 'Scroll to discover our journey →',
  },
  founderNote: {
    badge: 'A Note from Vidhya',
    title: 'Why Angelika Exists',
    image: '/images/vidhya-founder.jpg',
    quotePart1: '"I started Angelika"',
    quotePart2: "because I couldn't find",
    quotePart3: 'ethnic wear that felt like me."',
    quoteAuthor: '— Vidhya R., Founder',
    storyParagraphs: [
      "Growing up in a family where textiles were dinner table conversation, I learned early that fabric carries memory. My grandmother's Banarasi sarees, my mother's hand-block printed kurtas - each piece held a story.",
      "But when I started shopping for myself, I found a gap. Mass-market ethnic wear felt impersonal - synthetic fabrics, generic prints, sizing that never quite worked. The luxury boutiques were beautiful but intimidating, with price tags that didn't reflect the craft.",
      "Angelika was born from that gap. We work directly with artisan clusters - no middlemen, no markup games. I personally approve every design, every colorway, every stitch. When you wear Angelika, you're wearing something I'd proudly wear to my own cousin's wedding.",
      "This isn't just a brand. It's a promise: authentic craftsmanship, honest pricing, and a personal relationship with every woman who chooses us. Welcome to the family.",
    ],
    ctaText: 'Chat with Vidhya',
    ctaLink: 'https://wa.me/91XXXXXXXXXX?text=Hi%20Vidhya',
  },
  values: {
    badge: 'OUR VALUES',
    title: 'What We Stand For',
    items: [
      {
        icon: 'shield',
        title: 'Authentic Craftsmanship',
        description: 'Every piece is sourced directly from artisan clusters across India - Banaras, Chanderi, Jaipur, and beyond. We honor generations of handloom weaving, block printing, and embroidery traditions.',
      },
      {
        icon: 'heart',
        title: 'Personal Curation',
        description: 'Vidhya personally selects every design, fabric, and color. No mass-produced trends - only pieces she would wear herself and gift to the women in her life.',
      },
      {
        icon: 'clock',
        title: 'Timeless Over Trendy',
        description: 'We create heirlooms, not fast fashion. Our silhouettes transcend seasons - a Banarasi saree today will be just as beautiful twenty years from now.',
      },
      {
        icon: 'users',
        title: 'Community First',
        description: 'Every purchase supports artisan livelihoods. We work on fair-trade principles, ensuring craftspeople receive recognition and fair compensation for their mastery.',
      },
    ],
  },
  journey: {
    badge: 'OUR JOURNEY',
    title: 'Milestones Along the Way',
    milestones: [
      { year: '2019', title: 'The Beginning', description: 'Vidhya starts curating ethnic wear for friends and family from her living room in Bangalore.', icon: '🏠' },
      { year: '2020', title: 'First Pop-Up', description: 'First physical pop-up at a Bangalore boutique - 200 pieces sold in 3 days.', icon: '🛍️' },
      { year: '2021', title: 'Artisan Partnerships', description: 'Direct partnerships established with 12 weaving clusters across Banaras, Chanderi, and Maheshwar.', icon: '🤝' },
      { year: '2022', title: 'Online Launch', description: 'Angelika Fashions website goes live. First order shipped to Chennai within 4 hours.', icon: '💻' },
      { year: '2023', title: "Vidhya's Picks", description: 'Monthly curated edit launches - personal styling notes from Vidhya for each piece.', icon: '✨' },
      { year: '2024', title: '10,000+ Customers', description: 'Community grows to 10,000+ women across India and 15 countries. Angelika Circle loyalty program launches.', icon: '👑' },
      { year: '2025', title: 'Flagship Studio', description: 'First experience studio opens in Indiranagar, Bangalore - by appointment only.', icon: '🏪' },
      { year: '2026', title: 'Today', description: 'Continuing the journey - new collections, deeper artisan relationships, and more ways to serve our community.', icon: '🌟' },
    ],
  },
  team: {
    badge: 'MEET THE TEAM',
    title: 'The People Behind Angelika',
    members: [
      { name: 'Vidhya R.', role: 'Founder & Creative Director', bio: 'Former textile designer turned entrepreneur. Believes every woman deserves to feel like royalty in her ethnic wear.', image: '/images/team-vidhya.jpg' },
      { name: 'Priya S.', role: 'Head of Artisan Relations', bio: 'Travels to weaving villages monthly. Speaks 4 languages. Ensures every artisan feels valued and heard.', image: '/images/team-priya.jpg' },
      { name: 'Meera K.', role: 'Customer Experience Lead', bio: 'Knows 500+ customers by name. Your styling questions, size doubts, gift dilemmas - she solves them all.', image: '/images/team-meera.jpg' },
      { name: 'Arjun M.', role: 'Operations & Logistics', bio: 'Makes sure your order reaches you before the occasion. 99.2% on-time delivery rate. Obsessed with packaging.', image: '/images/team-arjun.jpg' },
    ],
  },
  artisanSpotlight: {
    badge: 'ARTISAN STORIES',
    title: 'Hands That Create Magic',
    image: '/images/artisan-workshop.jpg',
    paragraphs: [
      "Behind every Angelika piece are hands that have inherited generations of knowledge. In the narrow lanes of Banaras, master weavers like Ramesh-ji spend 14 days on a single saree, each thread placed with intention.",
      "In Chanderi, Meera-behen leads a collective of 40 women who hand-block print our cotton kurtis using natural dyes - a skill passed from mother to daughter for three centuries.",
      "These aren't suppliers. They're partners. We visit their workshops, share chai with their families, and celebrate their festivals. When you wear Angelika, you carry their stories, their patience, and their pride.",
    ],
    ctaText: 'Read More Artisan Stories',
    ctaLink: '/artisan-stories',
  },
  bottomCta: {
    title: 'Ready to Find Your Perfect Piece?',
    description: "Whether it's for a wedding, a festival, or simply because you deserve beauty in your everyday - we're here to help you discover it.",
    primaryCtaText: 'Shop Collection',
    primaryCtaLink: '/shop',
    secondaryCtaText: 'Find My Size',
    secondaryCtaLink: '/size-finder',
    whatsappText: 'Chat with Vidhya',
    whatsappLink: 'https://wa.me/91XXXXXXXXXX?text=Hi%20Vidhya,%20I%20need%20styling%20help',
  },
  seo: {
    metaTitle: 'Our Story | Angelika Fashions',
    metaDescription: 'Discover the story behind Angelika Fashions - founded by Vidhya, bringing premium ethnic wear with a personal touch.',
  },
};

const PRESET_HERO_IMAGES = [
  { label: 'Boutique Studio (Default)', url: '/images/about-hero.jpg' },
  { label: 'Vidhya in Atelier', url: '/images/vidhya-story.jpg' },
  { label: 'Artisan Workshop', url: '/images/artisan-workshop.jpg' },
  { label: 'Luxury Couture Drape', url: '/images/hero-new-couture.jpg' },
];

export function AboutPageEditor({
  onCancel,
  onSaved,
}: {
  onCancel?: () => void;
  onSaved: () => void;
}) {
  const [formData, setFormData] = useState<AboutPageContent>(DEFAULT_ABOUT_DATA);
  const [activeTab, setActiveTab] = useState<'hero' | 'founder' | 'values' | 'journey' | 'team' | 'artisan' | 'cta' | 'seo'>('hero');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        setIsLoading(true);
        const res = await fetch('/api/admin/content');
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.content?.['about-page']) {
            const raw = json.content['about-page'];
            if (isMounted) {
              setFormData({
                hero: {
                  ...DEFAULT_ABOUT_DATA.hero,
                  ...(raw.hero || {}),
                },
                founderNote: {
                  ...DEFAULT_ABOUT_DATA.founderNote,
                  ...(raw.founderNote || {}),
                  storyParagraphs: Array.isArray(raw.founderNote?.storyParagraphs) && raw.founderNote.storyParagraphs.length > 0
                    ? raw.founderNote.storyParagraphs
                    : DEFAULT_ABOUT_DATA.founderNote.storyParagraphs,
                },
                values: {
                  ...DEFAULT_ABOUT_DATA.values,
                  ...(raw.values || {}),
                  items: Array.isArray(raw.values?.items) && raw.values.items.length > 0
                    ? raw.values.items
                    : DEFAULT_ABOUT_DATA.values.items,
                },
                journey: {
                  ...DEFAULT_ABOUT_DATA.journey,
                  ...(raw.journey || {}),
                  milestones: Array.isArray(raw.journey?.milestones) && raw.journey.milestones.length > 0
                    ? raw.journey.milestones
                    : DEFAULT_ABOUT_DATA.journey.milestones,
                },
                team: {
                  ...DEFAULT_ABOUT_DATA.team,
                  ...(raw.team || {}),
                  members: Array.isArray(raw.team?.members) && raw.team.members.length > 0
                    ? raw.team.members
                    : DEFAULT_ABOUT_DATA.team.members,
                },
                artisanSpotlight: {
                  ...DEFAULT_ABOUT_DATA.artisanSpotlight,
                  ...(raw.artisanSpotlight || {}),
                  paragraphs: Array.isArray(raw.artisanSpotlight?.paragraphs) && raw.artisanSpotlight.paragraphs.length > 0
                    ? raw.artisanSpotlight.paragraphs
                    : DEFAULT_ABOUT_DATA.artisanSpotlight.paragraphs,
                },
                bottomCta: {
                  ...DEFAULT_ABOUT_DATA.bottomCta,
                  ...(raw.bottomCta || {}),
                },
                seo: {
                  ...DEFAULT_ABOUT_DATA.seo,
                  ...(raw.seo || {}),
                },
              });
            }
          }
        }
      } catch (err) {
        console.error('Failed to load about-page content:', err);
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
          sectionId: 'about-page',
          data: formData,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMessage({
          type: 'success',
          text: '✓ About Us Page updates saved live! Refresh /about to see changes.',
        });
        onSaved();
      } else {
        setStatusMessage({
          type: 'error',
          text: data.error || 'Failed to save changes. Please try again.',
        });
      }
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err?.message || 'Network error saving changes.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Value item helpers
  const handleUpdateValueItem = (index: number, field: keyof AboutValueItem, val: string) => {
    setFormData((prev) => {
      const items = [...prev.values.items];
      const target = items[index];
      if (!target) return prev;
      items[index] = { ...target, [field]: val };
      return {
        ...prev,
        values: { ...prev.values, items },
      };
    });
  };

  const handleAddValueItem = () => {
    const newItem: AboutValueItem = {
      icon: 'shield',
      title: 'New Core Value',
      description: 'Describe the core belief or ethical commitment here.',
    };
    setFormData((prev) => ({
      ...prev,
      values: { ...prev.values, items: [...prev.values.items, newItem] },
    }));
  };

  const handleRemoveValueItem = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      values: { ...prev.values, items: prev.values.items.filter((_, i) => i !== index) },
    }));
  };

  // Milestone helpers
  const handleUpdateMilestone = (index: number, field: keyof AboutMilestoneItem, val: string) => {
    setFormData((prev) => {
      const milestones = [...prev.journey.milestones];
      const target = milestones[index];
      if (!target) return prev;
      milestones[index] = { ...target, [field]: val };
      return {
        ...prev,
        journey: { ...prev.journey, milestones },
      };
    });
  };

  const handleAddMilestone = () => {
    const newMilestone: AboutMilestoneItem = {
      year: new Date().getFullYear().toString(),
      title: 'New Milestone',
      description: 'Detail the achievement or milestone reached.',
      icon: '✨',
    };
    setFormData((prev) => ({
      ...prev,
      journey: { ...prev.journey, milestones: [...prev.journey.milestones, newMilestone] },
    }));
  };

  const handleRemoveMilestone = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      journey: { ...prev.journey, milestones: prev.journey.milestones.filter((_, i) => i !== index) },
    }));
  };

  // Team helpers
  const handleUpdateTeamMember = (index: number, field: keyof AboutTeamMember, val: string) => {
    setFormData((prev) => {
      const members = [...prev.team.members];
      const target = members[index];
      if (!target) return prev;
      members[index] = { ...target, [field]: val };
      return {
        ...prev,
        team: { ...prev.team, members },
      };
    });
  };

  const handleAddTeamMember = () => {
    const newMember: AboutTeamMember = {
      name: 'New Team Member',
      role: 'Atelier Specialist',
      bio: 'Brief background highlighting passion and craftsmanship.',
      image: '/images/avatar-vidhya.jpg',
    };
    setFormData((prev) => ({
      ...prev,
      team: { ...prev.team, members: [...prev.team.members, newMember] },
    }));
  };

  const handleRemoveTeamMember = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      team: { ...prev.team, members: prev.team.members.filter((_, i) => i !== index) },
    }));
  };

  if (isLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 rounded-full border-2 border-[var(--color-gold)] border-t-transparent animate-spin" />
        <p className="text-xs font-medium text-[var(--color-slate)]">Loading About Page content...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-[var(--color-ink)] via-[#2B231C] to-[var(--color-ink)] text-white shadow-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border border-[var(--color-gold)]/30">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-full bg-[var(--color-gold)] text-[var(--color-ink)] text-[10px] font-bold uppercase tracking-wider">
              Brand Atelier Story
            </span>
            <Badge variant="outline" className="text-white/80 border-white/20 text-[10px]">
              /about
            </Badge>
          </div>
          <h2 className="text-lg font-serif font-medium tracking-tight text-white flex items-center gap-2">
            <span>About Us Page Editor</span>
          </h2>
          <p className="text-xs text-white/70">
            Customize the brand story, Vidhya&apos;s founder note, values, journey milestones, team, and artisan spotlight.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/about"
            target="_blank"
            className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors flex items-center gap-1.5"
          >
            <span>Live Storefront</span>
            <span className="text-[11px]">↗</span>
          </Link>
          {onCancel && (
            <Button variant="outline" size="sm" onClick={onCancel} className="text-xs text-white border-white/30 hover:bg-white/10">
              Close
            </Button>
          )}
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
            className="text-xs bg-[var(--color-gold)] text-[var(--color-ink)] hover:bg-[var(--color-gold)]/90 font-semibold"
          >
            {isSaving ? 'Saving Changes...' : 'Save All Changes'}
          </Button>
        </div>
      </div>

      {/* Status notification */}
      {statusMessage && (
        <div
          className={cn(
            'p-3.5 rounded-xl text-xs font-medium flex items-center justify-between shadow-xs',
            statusMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          )}
        >
          <span>{statusMessage.text}</span>
          <button
            onClick={() => setStatusMessage(null)}
            className="text-[11px] underline opacity-70 hover:opacity-100"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Editor Sub-Navigation Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-[var(--color-snow)] rounded-xl border border-[var(--color-whisper)] overflow-x-auto no-scrollbar">
        {[
          { id: 'hero', label: 'Hero Banner', icon: '✨' },
          { id: 'founder', label: "Founder's Note", icon: '🖋️' },
          { id: 'values', label: `Our Values (${formData.values.items.length})`, icon: '🛡️' },
          { id: 'journey', label: `Journey Milestones (${formData.journey.milestones.length})`, icon: '⏳' },
          { id: 'team', label: `Team Members (${formData.team.members.length})`, icon: '👥' },
          { id: 'artisan', label: 'Artisan Spotlight', icon: '🧵' },
          { id: 'cta', label: 'Bottom CTA Bar', icon: '💬' },
          { id: 'seo', label: 'SEO Metadata', icon: '🔍' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              'px-3.5 py-2 text-xs font-medium rounded-lg transition-all shrink-0 flex items-center gap-1.5',
              activeTab === tab.id
                ? 'bg-white text-[var(--color-ink)] shadow-xs font-semibold border border-[var(--color-whisper)]'
                : 'text-[var(--color-slate)] hover:text-[var(--color-ink)] hover:bg-white/60'
            )}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* TAB 1: HERO BANNER */}
      {activeTab === 'hero' && (
        <div className="p-6 rounded-2xl bg-white border border-[var(--color-whisper)] shadow-xs space-y-6">
          <div className="border-b border-[var(--color-whisper)] pb-3">
            <h3 className="text-sm font-semibold text-[var(--color-ink)]">Hero Banner</h3>
            <p className="text-xs text-[var(--color-slate)]">
              Top atmospheric full-screen banner on /about.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <AdminFormField
              label="Eyebrow Badge"
              value={formData.hero.badge}
              onChange={(val) => setFormData((p) => ({ ...p, hero: { ...p.hero, badge: val } }))}
              placeholder="e.g. OUR STORY"
            />
            <AdminFormField
              label="Title Highlight Word 1"
              value={formData.hero.titleHighlight1 || ''}
              onChange={(val) => setFormData((p) => ({ ...p, hero: { ...p.hero, titleHighlight1: val } }))}
              placeholder="e.g. Intention"
            />
            <AdminFormField
              label="Title Highlight Word 2"
              value={formData.hero.titleHighlight2 || ''}
              onChange={(val) => setFormData((p) => ({ ...p, hero: { ...p.hero, titleHighlight2: val } }))}
              placeholder="e.g. Pride"
            />
          </div>

          <AdminFormField
            label="Hero Main Title"
            value={formData.hero.title}
            onChange={(val) => setFormData((p) => ({ ...p, hero: { ...p.hero, title: val } }))}
            placeholder="e.g. Crafted with Intention, Worn with Pride"
          />

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-[var(--color-ink)]">
              Hero Subtitle / Description
            </label>
            <textarea
              rows={3}
              value={formData.hero.description}
              onChange={(e) => setFormData((p) => ({ ...p, hero: { ...p.hero, description: e.target.value } }))}
              className="w-full text-xs p-3 rounded-lg border border-[var(--color-whisper)] bg-[var(--color-white)] text-[var(--color-ink)] placeholder:text-[var(--color-mist)] focus:outline-none focus:border-[var(--color-gold)] transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AdminFormField
              label="Primary CTA Text"
              value={formData.hero.primaryCtaText}
              onChange={(val) => setFormData((p) => ({ ...p, hero: { ...p.hero, primaryCtaText: val } }))}
            />
            <AdminFormField
              label="Primary CTA Link"
              value={formData.hero.primaryCtaLink}
              onChange={(val) => setFormData((p) => ({ ...p, hero: { ...p.hero, primaryCtaLink: val } }))}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AdminFormField
              label="Secondary CTA Text"
              value={formData.hero.secondaryCtaText}
              onChange={(val) => setFormData((p) => ({ ...p, hero: { ...p.hero, secondaryCtaText: val } }))}
            />
            <AdminFormField
              label="Secondary CTA Link"
              value={formData.hero.secondaryCtaLink}
              onChange={(val) => setFormData((p) => ({ ...p, hero: { ...p.hero, secondaryCtaLink: val } }))}
            />
          </div>

          <AdminFormField
            label="Scroll Prompt Indicator Text"
            value={formData.hero.scrollText || ''}
            onChange={(val) => setFormData((p) => ({ ...p, hero: { ...p.hero, scrollText: val } }))}
            placeholder="e.g. Scroll to discover our journey →"
          />

          <div className="space-y-3 pt-2">
            <ImageUploader
              title="Hero Background Image"
              aspectRatio="aspect-[16/7]"
              imageUrl={formData.hero.backgroundImage}
              onChange={(url) => setFormData((p) => ({ ...p, hero: { ...p.hero, backgroundImage: url } }))}
            />
            <div className="flex flex-wrap gap-2">
              {PRESET_HERO_IMAGES.map((preset) => (
                <button
                  key={preset.url}
                  type="button"
                  onClick={() => setFormData((p) => ({ ...p, hero: { ...p.hero, backgroundImage: preset.url } }))}
                  className={cn(
                    'px-2.5 py-1 text-[11px] rounded-md border transition-all',
                    formData.hero.backgroundImage === preset.url
                      ? 'border-[var(--color-gold)] bg-[var(--color-gold)]/10 text-[var(--color-ink)] font-semibold'
                      : 'border-[var(--color-whisper)] bg-[var(--color-snow)] text-[var(--color-slate)] hover:bg-white'
                  )}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: FOUNDER'S NOTE */}
      {activeTab === 'founder' && (
        <div className="p-6 rounded-2xl bg-white border border-[var(--color-whisper)] shadow-xs space-y-6">
          <div className="border-b border-[var(--color-whisper)] pb-3">
            <h3 className="text-sm font-semibold text-[var(--color-ink)]">Founder&apos;s Note Section</h3>
            <p className="text-xs text-[var(--color-slate)]">
              Personal letter from Vidhya with floating quote card and artisan story.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AdminFormField
              label="Section Badge"
              value={formData.founderNote.badge}
              onChange={(val) => setFormData((p) => ({ ...p, founderNote: { ...p.founderNote, badge: val } }))}
              placeholder="e.g. A Note from Vidhya"
            />
            <AdminFormField
              label="Section Title"
              value={formData.founderNote.title}
              onChange={(val) => setFormData((p) => ({ ...p, founderNote: { ...p.founderNote, title: val } }))}
              placeholder="e.g. Why Angelika Exists"
            />
          </div>

          <ImageUploader
            title="Founder Portrait Image"
            aspectRatio="aspect-[3/4]"
            imageUrl={formData.founderNote.image}
            onChange={(url) => setFormData((p) => ({ ...p, founderNote: { ...p.founderNote, image: url } }))}
          />

          {/* Floating Quote Card */}
          <div className="p-4 rounded-xl bg-[var(--color-snow)] border border-[var(--color-whisper)] space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-ink)]">
              Floating Quote Card Overlay
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <AdminFormField
                label="Quote Line 1"
                value={formData.founderNote.quotePart1}
                onChange={(val) => setFormData((p) => ({ ...p, founderNote: { ...p.founderNote, quotePart1: val } }))}
              />
              <AdminFormField
                label="Quote Line 2"
                value={formData.founderNote.quotePart2}
                onChange={(val) => setFormData((p) => ({ ...p, founderNote: { ...p.founderNote, quotePart2: val } }))}
              />
              <AdminFormField
                label="Quote Line 3"
                value={formData.founderNote.quotePart3}
                onChange={(val) => setFormData((p) => ({ ...p, founderNote: { ...p.founderNote, quotePart3: val } }))}
              />
            </div>
            <AdminFormField
              label="Quote Author"
              value={formData.founderNote.quoteAuthor}
              onChange={(val) => setFormData((p) => ({ ...p, founderNote: { ...p.founderNote, quoteAuthor: val } }))}
            />
          </div>

          {/* Story Paragraphs */}
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-[var(--color-ink)]">
              Story Paragraphs (Separated by Blank Lines)
            </label>
            <textarea
              rows={8}
              value={formData.founderNote.storyParagraphs.join('\n\n')}
              onChange={(e) => {
                const paragraphs = e.target.value.split('\n\n').filter((p) => p.trim().length > 0);
                setFormData((p) => ({
                  ...p,
                  founderNote: { ...p.founderNote, storyParagraphs: paragraphs },
                }));
              }}
              className="w-full text-xs p-3 rounded-lg border border-[var(--color-whisper)] bg-[var(--color-white)] text-[var(--color-ink)] font-sans leading-relaxed focus:outline-none focus:border-[var(--color-gold)] transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AdminFormField
              label="WhatsApp CTA Text"
              value={formData.founderNote.ctaText}
              onChange={(val) => setFormData((p) => ({ ...p, founderNote: { ...p.founderNote, ctaText: val } }))}
            />
            <AdminFormField
              label="WhatsApp CTA Link"
              value={formData.founderNote.ctaLink}
              onChange={(val) => setFormData((p) => ({ ...p, founderNote: { ...p.founderNote, ctaLink: val } }))}
            />
          </div>
        </div>
      )}

      {/* TAB 3: OUR VALUES */}
      {activeTab === 'values' && (
        <div className="p-6 rounded-2xl bg-white border border-[var(--color-whisper)] shadow-xs space-y-6">
          <div className="border-b border-[var(--color-whisper)] pb-3">
            <h3 className="text-sm font-semibold text-[var(--color-ink)]">Our Core Values</h3>
            <p className="text-xs text-[var(--color-slate)]">
              The four pillars defining Angelika Fashions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AdminFormField
              label="Section Badge"
              value={formData.values.badge}
              onChange={(val) => setFormData((p) => ({ ...p, values: { ...p.values, badge: val } }))}
            />
            <AdminFormField
              label="Section Title"
              value={formData.values.title}
              onChange={(val) => setFormData((p) => ({ ...p, values: { ...p.values, title: val } }))}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-ink)]">
                Value Cards ({formData.values.items.length})
              </span>
              <button
                type="button"
                onClick={handleAddValueItem}
                className="text-xs text-[var(--color-gold)] hover:underline font-semibold"
              >
                + Add Value Card
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {formData.values.items.map((item, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-[var(--color-whisper)] bg-[var(--color-snow)] space-y-3 relative">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-[var(--color-gold)] uppercase tracking-wider">
                      Card #{idx + 1}
                    </span>
                    {formData.values.items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveValueItem(idx)}
                        className="text-[11px] text-rose-500 hover:text-rose-700 underline"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-1">
                      <AdminFormField
                        label="Icon Style"
                        value={item.icon}
                        onChange={(val) => handleUpdateValueItem(idx, 'icon', val)}
                        placeholder="shield, heart, clock, users"
                      />
                    </div>
                    <div className="col-span-2">
                      <AdminFormField
                        label="Card Title"
                        value={item.title}
                        onChange={(val) => handleUpdateValueItem(idx, 'title', val)}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[var(--color-ink)] block">
                      Description
                    </label>
                    <textarea
                      rows={3}
                      value={item.description}
                      onChange={(e) => handleUpdateValueItem(idx, 'description', e.target.value)}
                      className="w-full text-xs p-2.5 rounded-lg border border-[var(--color-whisper)] bg-white text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-gold)]"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: JOURNEY MILESTONES */}
      {activeTab === 'journey' && (
        <div className="p-6 rounded-2xl bg-white border border-[var(--color-whisper)] shadow-xs space-y-6">
          <div className="border-b border-[var(--color-whisper)] pb-3">
            <h3 className="text-sm font-semibold text-[var(--color-ink)]">Journey Timeline Milestones</h3>
            <p className="text-xs text-[var(--color-slate)]">
              Chronological milestones displayed on the vertical timeline.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AdminFormField
              label="Section Badge"
              value={formData.journey.badge}
              onChange={(val) => setFormData((p) => ({ ...p, journey: { ...p.journey, badge: val } }))}
            />
            <AdminFormField
              label="Section Title"
              value={formData.journey.title}
              onChange={(val) => setFormData((p) => ({ ...p, journey: { ...p.journey, title: val } }))}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-ink)]">
                Milestones ({formData.journey.milestones.length})
              </span>
              <button
                type="button"
                onClick={handleAddMilestone}
                className="text-xs text-[var(--color-gold)] hover:underline font-semibold"
              >
                + Add Milestone
              </button>
            </div>

            <div className="space-y-3">
              {formData.journey.milestones.map((ms, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-[var(--color-whisper)] bg-[var(--color-snow)] flex flex-col sm:flex-row items-start gap-4">
                  <div className="flex items-center gap-2 w-full sm:w-36 shrink-0">
                    <input
                      type="text"
                      value={ms.icon}
                      onChange={(e) => handleUpdateMilestone(idx, 'icon', e.target.value)}
                      className="w-10 h-9 text-center text-lg rounded border border-[var(--color-whisper)] bg-white"
                      placeholder="🏠"
                    />
                    <input
                      type="text"
                      value={ms.year}
                      onChange={(e) => handleUpdateMilestone(idx, 'year', e.target.value)}
                      className="w-20 h-9 text-center font-mono font-bold text-xs rounded border border-[var(--color-whisper)] bg-white text-[var(--color-gold)]"
                      placeholder="Year"
                    />
                  </div>

                  <div className="flex-1 w-full space-y-2">
                    <input
                      type="text"
                      value={ms.title}
                      onChange={(e) => handleUpdateMilestone(idx, 'title', e.target.value)}
                      className="w-full h-8 text-xs font-semibold px-2.5 rounded border border-[var(--color-whisper)] bg-white text-[var(--color-ink)]"
                      placeholder="Milestone Title"
                    />
                    <textarea
                      rows={2}
                      value={ms.description}
                      onChange={(e) => handleUpdateMilestone(idx, 'description', e.target.value)}
                      className="w-full text-xs p-2 rounded border border-[var(--color-whisper)] bg-white text-[var(--color-slate)]"
                      placeholder="Description"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveMilestone(idx)}
                    className="text-xs text-rose-500 hover:text-rose-700 underline shrink-0 mt-2 sm:mt-0"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: TEAM MEMBERS */}
      {activeTab === 'team' && (
        <div className="p-6 rounded-2xl bg-white border border-[var(--color-whisper)] shadow-xs space-y-6">
          <div className="border-b border-[var(--color-whisper)] pb-3">
            <h3 className="text-sm font-semibold text-[var(--color-ink)]">Meet the Team</h3>
            <p className="text-xs text-[var(--color-slate)]">
              Circular cards showing the core leadership and team members.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AdminFormField
              label="Section Badge"
              value={formData.team.badge}
              onChange={(val) => setFormData((p) => ({ ...p, team: { ...p.team, badge: val } }))}
            />
            <AdminFormField
              label="Section Title"
              value={formData.team.title}
              onChange={(val) => setFormData((p) => ({ ...p, team: { ...p.team, title: val } }))}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-ink)]">
                Team Members ({formData.team.members.length})
              </span>
              <button
                type="button"
                onClick={handleAddTeamMember}
                className="text-xs text-[var(--color-gold)] hover:underline font-semibold"
              >
                + Add Member
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {formData.team.members.map((member, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-[var(--color-whisper)] bg-[var(--color-snow)] space-y-3 relative">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-[var(--color-gold)] uppercase tracking-wider">
                      Member #{idx + 1}
                    </span>
                    {formData.team.members.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveTeamMember(idx)}
                        className="text-[11px] text-rose-500 hover:text-rose-700 underline"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <AdminFormField
                      label="Full Name"
                      value={member.name}
                      onChange={(val) => handleUpdateTeamMember(idx, 'name', val)}
                    />
                    <AdminFormField
                      label="Role / Title"
                      value={member.role}
                      onChange={(val) => handleUpdateTeamMember(idx, 'role', val)}
                    />
                  </div>

                  <ImageUploader
                    title="Profile Image"
                    aspectRatio="aspect-square"
                    imageUrl={member.image}
                    onChange={(url) => handleUpdateTeamMember(idx, 'image', url)}
                  />

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[var(--color-ink)] block">
                      Bio
                    </label>
                    <textarea
                      rows={2}
                      value={member.bio}
                      onChange={(e) => handleUpdateTeamMember(idx, 'bio', e.target.value)}
                      className="w-full text-xs p-2.5 rounded-lg border border-[var(--color-whisper)] bg-white text-[var(--color-ink)]"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: ARTISAN SPOTLIGHT */}
      {activeTab === 'artisan' && (
        <div className="p-6 rounded-2xl bg-white border border-[var(--color-whisper)] shadow-xs space-y-6">
          <div className="border-b border-[var(--color-whisper)] pb-3">
            <h3 className="text-sm font-semibold text-[var(--color-ink)]">Artisan Spotlight</h3>
            <p className="text-xs text-[var(--color-slate)]">
              Dark luxury showcase dedicated to the master weavers and craftspeople.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AdminFormField
              label="Section Badge"
              value={formData.artisanSpotlight.badge}
              onChange={(val) => setFormData((p) => ({ ...p, artisanSpotlight: { ...p.artisanSpotlight, badge: val } }))}
            />
            <AdminFormField
              label="Section Title"
              value={formData.artisanSpotlight.title}
              onChange={(val) => setFormData((p) => ({ ...p, artisanSpotlight: { ...p.artisanSpotlight, title: val } }))}
            />
          </div>

          <ImageUploader
            title="Workshop Atelier Image"
            aspectRatio="aspect-[4/3]"
            imageUrl={formData.artisanSpotlight.image}
            onChange={(url) => setFormData((p) => ({ ...p, artisanSpotlight: { ...p.artisanSpotlight, image: url } }))}
          />

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-[var(--color-ink)]">
              Artisan Stories (Separated by Blank Lines)
            </label>
            <textarea
              rows={6}
              value={formData.artisanSpotlight.paragraphs.join('\n\n')}
              onChange={(e) => {
                const paragraphs = e.target.value.split('\n\n').filter((p) => p.trim().length > 0);
                setFormData((p) => ({
                  ...p,
                  artisanSpotlight: { ...p.artisanSpotlight, paragraphs },
                }));
              }}
              className="w-full text-xs p-3 rounded-lg border border-[var(--color-whisper)] bg-white text-[var(--color-ink)]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AdminFormField
              label="CTA Button Text"
              value={formData.artisanSpotlight.ctaText}
              onChange={(val) => setFormData((p) => ({ ...p, artisanSpotlight: { ...p.artisanSpotlight, ctaText: val } }))}
            />
            <AdminFormField
              label="CTA Button Link"
              value={formData.artisanSpotlight.ctaLink}
              onChange={(val) => setFormData((p) => ({ ...p, artisanSpotlight: { ...p.artisanSpotlight, ctaLink: val } }))}
            />
          </div>
        </div>
      )}

      {/* TAB 7: BOTTOM CTA */}
      {activeTab === 'cta' && (
        <div className="p-6 rounded-2xl bg-white border border-[var(--color-whisper)] shadow-xs space-y-6">
          <div className="border-b border-[var(--color-whisper)] pb-3">
            <h3 className="text-sm font-semibold text-[var(--color-ink)]">Bottom Call to Action</h3>
            <p className="text-xs text-[var(--color-slate)]">
              Closing call to action block leading users to the shop, size finder, or WhatsApp concierge.
            </p>
          </div>

          <AdminFormField
            label="Section Title"
            value={formData.bottomCta.title}
            onChange={(val) => setFormData((p) => ({ ...p, bottomCta: { ...p.bottomCta, title: val } }))}
          />

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-[var(--color-ink)]">
              Description
            </label>
            <textarea
              rows={3}
              value={formData.bottomCta.description}
              onChange={(e) => setFormData((p) => ({ ...p, bottomCta: { ...p.bottomCta, description: e.target.value } }))}
              className="w-full text-xs p-3 rounded-lg border border-[var(--color-whisper)] bg-white text-[var(--color-ink)]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AdminFormField
              label="Primary CTA Text"
              value={formData.bottomCta.primaryCtaText}
              onChange={(val) => setFormData((p) => ({ ...p, bottomCta: { ...p.bottomCta, primaryCtaText: val } }))}
            />
            <AdminFormField
              label="Primary CTA Link"
              value={formData.bottomCta.primaryCtaLink}
              onChange={(val) => setFormData((p) => ({ ...p, bottomCta: { ...p.bottomCta, primaryCtaLink: val } }))}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AdminFormField
              label="Secondary CTA Text"
              value={formData.bottomCta.secondaryCtaText}
              onChange={(val) => setFormData((p) => ({ ...p, bottomCta: { ...p.bottomCta, secondaryCtaText: val } }))}
            />
            <AdminFormField
              label="Secondary CTA Link"
              value={formData.bottomCta.secondaryCtaLink}
              onChange={(val) => setFormData((p) => ({ ...p, bottomCta: { ...p.bottomCta, secondaryCtaLink: val } }))}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AdminFormField
              label="WhatsApp CTA Text"
              value={formData.bottomCta.whatsappText}
              onChange={(val) => setFormData((p) => ({ ...p, bottomCta: { ...p.bottomCta, whatsappText: val } }))}
            />
            <AdminFormField
              label="WhatsApp CTA Link"
              value={formData.bottomCta.whatsappLink}
              onChange={(val) => setFormData((p) => ({ ...p, bottomCta: { ...p.bottomCta, whatsappLink: val } }))}
            />
          </div>
        </div>
      )}

      {/* TAB 8: SEO METADATA */}
      {activeTab === 'seo' && (
        <div className="p-6 rounded-2xl bg-white border border-[var(--color-whisper)] shadow-xs space-y-6">
          <div className="border-b border-[var(--color-whisper)] pb-3">
            <h3 className="text-sm font-semibold text-[var(--color-ink)]">Search Engine Optimization (SEO)</h3>
            <p className="text-xs text-[var(--color-slate)]">
              Configure meta tags and descriptions for Google and social previews on /about.
            </p>
          </div>

          <div className="space-y-1">
            <AdminFormField
              label="Meta Title"
              value={formData.seo.metaTitle}
              onChange={(val) => setFormData((p) => ({ ...p, seo: { ...p.seo, metaTitle: val } }))}
              helperText={`${formData.seo.metaTitle.length} / 60 recommended characters`}
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-[var(--color-ink)]">
              Meta Description
            </label>
            <textarea
              rows={3}
              value={formData.seo.metaDescription}
              onChange={(e) => setFormData((p) => ({ ...p, seo: { ...p.seo, metaDescription: e.target.value } }))}
              className="w-full text-xs p-3 rounded-lg border border-[var(--color-whisper)] bg-[var(--color-white)] text-[var(--color-ink)]"
            />
            <p className="text-[10px] text-[var(--color-slate)]">
              {formData.seo.metaDescription.length} / 160 recommended characters
            </p>
          </div>
        </div>
      )}

      {/* Bottom Save Bar */}
      <div className="p-4 rounded-xl bg-[var(--color-snow)] border border-[var(--color-whisper)] flex items-center justify-between">
        <span className="text-xs text-[var(--color-slate)]">
          All modifications are saved live into your store content.
        </span>
        <div className="flex items-center gap-2">
          {onCancel && (
            <Button variant="outline" size="sm" onClick={onCancel} className="text-xs">
              Cancel
            </Button>
          )}
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
            className="text-xs bg-[var(--color-gold)] text-[var(--color-ink)] hover:bg-[var(--color-gold)]/90 font-semibold"
          >
            {isSaving ? 'Saving Changes...' : 'Save All Changes'}
          </Button>
        </div>
      </div>
    </div>
  );
}

