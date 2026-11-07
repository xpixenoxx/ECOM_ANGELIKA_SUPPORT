'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils/cn';
import type {
  FAQPageContent,
  FAQCategory,
  FAQItem,
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

const EMOJI_PRESETS = ['📦', '🚚', '↩️', '📏', '🧵', '👤', '✨', '💳', '🏷️', '👗', '💎', '🛡️', '💬', '📞'];

const DEFAULT_FAQ_DATA: FAQPageContent = {
  header: {
    badge: 'HELP CENTER',
    title: 'Frequently Asked Questions',
    description:
      "Quick answers to common questions. Can't find what you need? Chat with Vidhya or Meera on WhatsApp - they respond within hours.",
  },
  searchPlaceholder: 'Search questions...',
  categories: [
    {
      id: 'orders',
      label: 'Orders & Payments',
      icon: '📦',
      items: [
        {
          id: 'ord-1',
          q: 'What payment methods do you accept?',
          a: 'We accept all major credit/debit cards, UPI (GPay, PhonePe, Paytm), net banking, wallets, and Cash on Delivery (up to ₹5,000). For international orders, we accept cards via Stripe and PayPal. EMI options available on orders above ₹3,000.',
        },
        {
          id: 'ord-2',
          q: 'Is Cash on Delivery available everywhere?',
          a: 'COD is available in 25,000+ pincodes across India for orders up to ₹5,000. A COD fee of ₹50 applies. Check availability at checkout by entering your pincode.',
        },
        {
          id: 'ord-3',
          q: 'Can I modify or cancel my order after placing it?',
          a: "Yes, within 2 hours of placing the order. After that, it may have already been processed for shipping. Contact us immediately via WhatsApp - we'll do our best to help.",
        },
        {
          id: 'ord-4',
          q: 'Do you offer gift wrapping?',
          a: 'Yes! Gift wrapping is complimentary on all orders. Add a personal note at checkout. For special occasions, we offer premium gift boxes (₹199) with tissue paper, ribbon, and a handwritten card.',
        },
        {
          id: 'ord-5',
          q: 'My payment failed but money was deducted. What now?',
          a: "This is usually a temporary bank hold that releases within 24-48 hours. If not resolved in 2 days, contact us with your order ID and we'll escalate with our payment partner.",
        },
      ],
    },
    {
      id: 'shipping',
      label: 'Shipping & Delivery',
      icon: '🚚',
      items: [
        {
          id: 'ship-1',
          q: 'What are your shipping charges?',
          a: "Free shipping on orders ₹2,999+ within India. Below that, it's ₹99. International shipping starts at $15, free on orders $300+. Express delivery (1-2 days) available in major metros for ₹199.",
        },
        {
          id: 'ship-2',
          q: 'How long does delivery take?',
          a: 'India: 2-5 business days (1-2 days in major metros). International: 5-10 business days via DHL Express. Custom/stitch-to-order items take 2-3 weeks - timeline shown on product page.',
        },
        {
          id: 'ship-3',
          q: 'Can I change my delivery address after ordering?',
          a: "Yes, if the order hasn't shipped yet. Contact us immediately on WhatsApp with your order ID and new address. Once shipped, we can't redirect but you can reschedule delivery with the courier.",
        },
        {
          id: 'ship-4',
          q: 'Do you ship to PO Boxes / APO addresses?',
          a: 'We cannot ship to PO Boxes or APO/FPO addresses as our courier partners require a physical address with a contact number for delivery.',
        },
        {
          id: 'ship-5',
          q: "What if I'm not home during delivery?",
          a: "Our courier partners make 2 delivery attempts. If both fail, the package goes to the local hub for 5 days pickup. You'll receive SMS/email with hub details. Contact us to reschedule.",
        },
      ],
    },
    {
      id: 'returns',
      label: 'Returns & Exchanges',
      icon: '↩️',
      items: [
        {
          id: 'ret-1',
          q: 'What is your return policy?',
          a: '15-day hassle-free returns for unworn items with original tags and packaging. Free pickup in India. Refund to original payment method within 5-7 days of receiving the return.',
        },
        {
          id: 'ret-2',
          q: 'Are sale items returnable?',
          a: 'Items at 50%+ off (marked "Final Sale") are non-returnable. Other sale items (under 50% off) follow our standard 15-day return policy.',
        },
        {
          id: 'ret-3',
          q: 'How do I initiate a return?',
          a: "Go to your Account → Orders → Select order → Click \"Return\". Choose items, reason, and pickup date. Our courier will collect within 48 hours. Or WhatsApp us - we'll handle it.",
        },
        {
          id: 'ret-4',
          q: 'What about exchanges?',
          a: "Exchanges for size/color are free and prioritized. Select \"Exchange\" during return initiation. We'll ship the new item as soon as the return is scanned by the courier.",
        },
        {
          id: 'ret-5',
          q: 'I received a damaged/incorrect item. What should I do?',
          a: "We're so sorry! Please WhatsApp us a photo within 24 hours of delivery. We'll arrange immediate replacement (no return needed for damaged items) and a goodwill gesture.",
        },
      ],
    },
    {
      id: 'sizing',
      label: 'Sizing & Fit',
      icon: '📏',
      items: [
        {
          id: 'size-1',
          q: 'How do I find my size?',
          a: 'Use our Size Finder tool - enter your bust, waist, hips measurements and get personalized recommendations for each category. Or chat with Meera on WhatsApp for a guided session.',
        },
        {
          id: 'size-2',
          q: 'Do your sizes run true to size?',
          a: 'Our sizing follows standard Indian measurements. However, handcrafted pieces may have 0.5-1" variation. The Size Finder accounts for this. When in doubt, size up for comfort.',
        },
        {
          id: 'size-3',
          q: 'Can I get a custom size?',
          a: 'Yes! We offer made-to-measure on most kurtis, salwars, and lehengas. Additional ₹500-1,500 depending on complexity. 2-3 week lead time. Book a consultation via WhatsApp.',
        },
        {
          id: 'size-4',
          q: "What if the size doesn't fit?",
          a: "Free size exchanges within 15 days. We'll ship the new size as soon as the return is picked up. No questions asked - we want you to love the fit.",
        },
        {
          id: 'size-5',
          q: 'Do you have plus sizes?',
          a: "Yes, up to 3XL (bust 44\") in most categories. We're expanding to 4XL. Use the Size Finder - it works for all sizes. Custom sizing available beyond 3XL.",
        },
      ],
    },
    {
      id: 'products',
      label: 'Products & Care',
      icon: '🧵',
      items: [
        {
          id: 'prod-1',
          q: 'Are your fabrics authentic?',
          a: 'Absolutely. We source directly from artisan clusters: Banarasi silk from Varanasi, Chanderi from Madhya Pradesh, Bandhani from Gujarat/Kutch, block prints from Rajasthan. Each piece comes with an artisan story card.',
        },
        {
          id: 'prod-2',
          q: 'How do I care for silk/embroidered pieces?',
          a: 'Dry clean only for silk, zari, and heavy embroidery. Cotton/linen: gentle machine wash cold, line dry in shade. Avoid direct sunlight for colors. Care label inside each garment.',
        },
        {
          id: 'prod-3',
          q: 'Will the color match the website photos?',
          a: 'We photograph in natural light with color-calibrated equipment. However, screen calibration varies. For critical color matching (weddings), order a fabric swatch (₹99, refundable on purchase).',
        },
        {
          id: 'prod-4',
          q: 'Are pieces exactly as shown?',
          a: "Handcrafted pieces have slight variations - that's the beauty of artisan work. Motif placement, color intensity, and embroidery density may vary slightly. No two pieces are identical.",
        },
        {
          id: 'prod-5',
          q: 'Do you restock sold-out items?',
          a: "Most designs are limited edition. Popular basics (solid kurtis, plain dupattas) are restocked. Sign up for \"Notify Me\" on the product page. Vidhya's Notes subscribers get early restock alerts.",
        },
      ],
    },
    {
      id: 'account',
      label: 'Account & Loyalty',
      icon: '👤',
      items: [
        {
          id: 'acc-1',
          q: 'How do I create an account?',
          a: 'Click "Account" → "Sign Up". Use email or phone. No password needed - we send a magic link/OTP. Accounts unlock: order tracking, wishlist, size profile, loyalty points, early sale access.',
        },
        {
          id: 'acc-2',
          q: 'What is Angelika Circle loyalty program?',
          a: 'Free to join. Earn 5 points per ₹100 spent. Tiers: Silver (0 pts), Gold (1,000 pts), Platinum (5,000 pts). Benefits: cashback, free shipping, early access, birthday gifts, personal styling. Points never expire.',
        },
        {
          id: 'acc-3',
          q: 'How do I redeem loyalty points?',
          a: 'Go to Account → Loyalty. Redeem 500 pts = ₹100 off, 1,000 pts = ₹250 off, 2,500 pts = free express shipping (1 year), 5,000 pts = personal styling session with Vidhya.',
        },
        {
          id: 'acc-4',
          q: 'Can I delete my account?',
          a: 'Yes, in Account → Profile → Danger Zone. This permanently removes your data. Order history is retained for legal compliance but anonymized. Contact us if you need assistance.',
        },
      ],
    },
    {
      id: 'custom',
      label: 'Custom & Wholesale',
      icon: '✨',
      items: [
        {
          id: 'cust-1',
          q: 'Do you offer custom designs?',
          a: 'Yes! Two options: Semi-custom (color/fabric changes on existing designs, +₹500-2,000, 2 weeks) and Fully custom (from your sketch/inspiration, +₹3,000+, 3-4 weeks). Book a WhatsApp consultation.',
        },
        {
          id: 'cust-2',
          q: 'Can you replicate a design I saw elsewhere?',
          a: "We can create inspired-by pieces but don't copy other designers' work. Share your inspiration photos - Vidhya will design something unique incorporating those elements.",
        },
        {
          id: 'cust-3',
          q: 'Do you accept wholesale/bulk orders?',
          a: 'Yes, for boutiques, stylists, and corporate gifting. Minimum 10 pieces. 20-30% off MRP depending on volume. 4-6 week lead time. Email wholesale@angelikafashions.com with requirements.',
        },
        {
          id: 'cust-4',
          q: 'Can I order matching outfits for a group?',
          a: 'Absolutely! Popular for bridesmaid lehengas, family function coordination. We ensure color consistency across sizes. Group discount: 10% off 5+ pieces, 15% off 10+. WhatsApp us to coordinate.',
        },
      ],
    },
  ],
  stillNeedHelp: {
    title: 'Still Need Help?',
    description: "Couldn't find your answer? Our team is here for you. No bots, no tickets - just real people who care.",
    whatsappButtonText: 'WhatsApp Us',
    whatsappLink: 'https://wa.me/919876543210?text=Hi%20Vidhya,%20I%20have%20a%20question',
    emailButtonText: 'Email Us',
    emailLink: 'mailto:hello@angelikafashions.com',
    contactButtonText: 'Contact Form',
    contactLink: '/contact',
  },
  seo: {
    metaTitle: 'FAQ & Help Center | Angelika Fashions',
    metaDescription: 'Find answers to common questions about orders, payments, shipping, returns, custom sizing, artisan fabrics, and bulk orders at Angelika Fashions.',
  },
};

type TabKey = 'header' | 'categories' | 'help' | 'seo';

export function FAQPageEditor({
  onCancel,
  onSaved,
}: {
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [formData, setFormData] = useState<FAQPageContent>(DEFAULT_FAQ_DATA);
  const [activeTab, setActiveTab] = useState<TabKey>('categories');
  const [activeCategoryId, setActiveCategoryId] = useState<string>('orders');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Load content
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const res = await fetch('/api/admin/content');
        if (res.ok) {
          const json = await res.json();
          if (json.content && json.content['faq-page'] && isMounted) {
            const raw = json.content['faq-page'];
            setFormData({
              header: {
                ...DEFAULT_FAQ_DATA.header,
                ...(raw.header || {}),
              },
              searchPlaceholder: raw.searchPlaceholder || DEFAULT_FAQ_DATA.searchPlaceholder,
              categories: Array.isArray(raw.categories) && raw.categories.length > 0
                ? raw.categories
                : DEFAULT_FAQ_DATA.categories,
              stillNeedHelp: {
                ...DEFAULT_FAQ_DATA.stillNeedHelp,
                ...(raw.stillNeedHelp || {}),
              },
              seo: {
                ...DEFAULT_FAQ_DATA.seo,
                ...(raw.seo || {}),
              },
            });
            if (Array.isArray(raw.categories) && raw.categories.length > 0) {
              setActiveCategoryId(raw.categories[0].id);
            }
          }
        }
      } catch (err) {
        console.error('Failed to load faq-page content:', err);
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
          sectionId: 'faq-page',
          data: formData,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMessage({
          type: 'success',
          text: 'FAQ & Help Center updated successfully! Your updates are now live on /faq.',
        });
        onSaved();
      } else {
        setStatusMessage({
          type: 'error',
          text: data.error || 'Failed to save FAQ content.',
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

  const handleReset = () => {
    if (confirm('Reset all FAQ content back to defaults? Any unsaved edits will be lost.')) {
      setFormData(DEFAULT_FAQ_DATA);
      if (DEFAULT_FAQ_DATA.categories[0]) {
        setActiveCategoryId(DEFAULT_FAQ_DATA.categories[0].id);
      }
      setStatusMessage({
        type: 'success',
        text: 'Reset to default template. Click "Save Changes" to publish.',
      });
    }
  };

  // Category helpers
  const currentCategory = formData.categories.find((c) => c.id === activeCategoryId) || formData.categories[0];

  const handleUpdateCurrentCategory = (patch: Partial<FAQCategory>) => {
    if (!currentCategory) return;
    setFormData((prev) => ({
      ...prev,
      categories: prev.categories.map((c) =>
        c.id === currentCategory.id ? { ...c, ...patch } : c
      ),
    }));
  };

  const handleAddCategory = () => {
    const newId = `cat-${Date.now()}`;
    const newCat: FAQCategory = {
      id: newId,
      label: 'New Category',
      icon: '✨',
      items: [
        {
          id: `item-${Date.now()}-1`,
          q: 'Sample Question Here?',
          a: 'Add your clear, helpful answer here for customers.',
        },
      ],
    };
    setFormData((prev) => ({
      ...prev,
      categories: [...prev.categories, newCat],
    }));
    setActiveCategoryId(newId);
  };

  const handleDeleteCurrentCategory = () => {
    if (!currentCategory || formData.categories.length <= 1) {
      alert('You must have at least one FAQ category.');
      return;
    }
    if (confirm(`Delete the category "${currentCategory.label}" and all its questions?`)) {
      const remaining = formData.categories.filter((c) => c.id !== currentCategory.id);
      setFormData((prev) => ({ ...prev, categories: remaining }));
      if (remaining[0]) {
        setActiveCategoryId(remaining[0].id);
      }
    }
  };

  // Question helpers inside active category
  const handleAddQuestion = () => {
    if (!currentCategory) return;
    const newItem: FAQItem = {
      id: `item-${Date.now()}`,
      q: '',
      a: '',
    };
    handleUpdateCurrentCategory({
      items: [...currentCategory.items, newItem],
    });
  };

  const handleUpdateQuestion = (index: number, patch: Partial<FAQItem>) => {
    if (!currentCategory) return;
    const newItems = [...currentCategory.items];
    const target = newItems[index];
    if (target) {
      newItems[index] = { ...target, ...patch };
      handleUpdateCurrentCategory({ items: newItems });
    }
  };

  const handleDeleteQuestion = (index: number) => {
    if (!currentCategory) return;
    const newItems = currentCategory.items.filter((_, i) => i !== index);
    handleUpdateCurrentCategory({ items: newItems });
  };

  const handleMoveQuestion = (index: number, direction: 'up' | 'down') => {
    if (!currentCategory) return;
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= currentCategory.items.length) return;
    const itemA = currentCategory.items[index];
    const itemB = currentCategory.items[targetIdx];
    if (!itemA || !itemB) return;
    const newItems = [...currentCategory.items];
    newItems[index] = itemB;
    newItems[targetIdx] = itemA;
    handleUpdateCurrentCategory({ items: newItems });
  };

  const totalQuestionsCount = formData.categories.reduce(
    (acc, cat) => acc + (cat.items?.length || 0),
    0
  );

  if (isLoading) {
    return (
      <div className="p-12 text-center text-xs text-[var(--color-slate)]">
        Loading FAQ & Help Center editor...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner / Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--color-whisper)]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-serif text-[var(--color-ink)]">
              Frequently Asked Questions (FAQ) Editor
            </h2>
            <Badge variant="outline" className="text-[10px] text-[var(--color-gold)] border-[var(--color-gold)]">
              {formData.categories.length} Categories
            </Badge>
            <Badge variant="outline" className="text-[10px] text-emerald-700 bg-emerald-50 border-emerald-200">
              {totalQuestionsCount} Q&As
            </Badge>
          </div>
          <p className="text-xs text-[var(--color-slate)]">
            Configure questions, category tabs, search placeholder, and direct concierge contact cards for{' '}
            <Link href="/faq" target="_blank" className="text-[var(--color-gold)] hover:underline font-mono">
              /faq ↗
            </Link>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="text-xs text-[var(--color-slate)] hover:text-red-600"
          >
            Reset Defaults
          </Button>
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
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
            className="text-xs bg-[var(--color-gold)] text-[var(--color-ink)] hover:bg-[var(--color-gold-hover)] font-semibold"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {statusMessage && (
        <div
          className={cn(
            'p-3.5 rounded-lg text-xs font-medium border flex items-center justify-between',
            statusMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          )}
        >
          <span>{statusMessage.text}</span>
          <button
            onClick={() => setStatusMessage(null)}
            className="text-xs font-bold px-2 py-0.5 rounded hover:bg-black/5"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Tab Bar */}
      <div className="flex border-b border-[var(--color-whisper)] gap-2 overflow-x-auto pb-px">
        {[
          { key: 'categories', label: 'Categories & Q&As' },
          { key: 'header', label: 'Header & Search' },
          { key: 'help', label: 'Still Need Help? Card' },
          { key: 'seo', label: 'SEO & Metadata' },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key as TabKey)}
            className={cn(
              'px-4 py-2.5 text-xs font-semibold tracking-wide border-b-2 transition-colors whitespace-nowrap cursor-pointer',
              activeTab === tab.key
                ? 'border-[var(--color-gold)] text-[var(--color-gold-hover)] bg-[var(--color-snow)]/60 rounded-t-md'
                : 'border-transparent text-[var(--color-slate)] hover:text-[var(--color-ink)] hover:border-[var(--color-whisper)]'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: CATEGORIES & QUESTIONS */}
      {activeTab === 'categories' && (
        <div className="space-y-6">
          {/* Category Tabs */}
          <div className="p-4 rounded-xl bg-[var(--color-snow)] border border-[var(--color-whisper)] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-ink)]">
                Select FAQ Category to Edit
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddCategory}
                className="text-xs h-8 border-dashed border-[var(--color-gold)] text-[var(--color-gold-hover)] hover:bg-[var(--color-gold)]/10"
              >
                + Add Category
              </Button>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {formData.categories.map((cat) => {
                const isSelected = cat.id === activeCategoryId;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActiveCategoryId(cat.id)}
                    className={cn(
                      'px-3.5 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer border',
                      isSelected
                        ? 'bg-[var(--color-gold)] text-[var(--color-ink)] font-semibold border-[var(--color-gold)] shadow-xs'
                        : 'bg-white text-[var(--color-slate)] border-[var(--color-whisper)] hover:border-[var(--color-gold)]/50'
                    )}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                    <span
                      className={cn(
                        'ml-1 text-[10px] px-1.5 py-0.2 rounded-full',
                        isSelected ? 'bg-[var(--color-ink)] text-white' : 'bg-gray-100 text-gray-600'
                      )}
                    >
                      {cat.items?.length || 0}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Category Settings */}
          {currentCategory && (
            <div className="p-5 rounded-2xl bg-white border border-[var(--color-whisper)] shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--color-whisper)]">
                <div>
                  <h3 className="text-sm font-semibold text-[var(--color-ink)] flex items-center gap-2">
                    <span>{currentCategory.icon}</span>
                    <span>Editing: {currentCategory.label}</span>
                  </h3>
                  <p className="text-xs text-[var(--color-slate)]">
                    {currentCategory.items.length} question(s) in this section
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleDeleteCurrentCategory}
                    className="text-xs text-rose-600 hover:bg-rose-50 border-rose-200"
                  >
                    Delete Category
                  </Button>
                </div>
              </div>

              {/* Category details editor */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <AdminFormField
                  label="Category Label"
                  value={currentCategory.label}
                  onChange={(val) => handleUpdateCurrentCategory({ label: val })}
                  placeholder="e.g. Orders & Payments"
                  className="md:col-span-2"
                />

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[var(--color-ink)] tracking-wide">
                    Category Icon / Emoji
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={currentCategory.icon}
                      onChange={(e) => handleUpdateCurrentCategory({ icon: e.target.value })}
                      className="w-14 h-10 text-center text-base rounded-lg border border-[var(--color-whisper)] bg-white text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-gold)]"
                    />
                    <div className="flex flex-wrap gap-1">
                      {EMOJI_PRESETS.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => handleUpdateCurrentCategory({ icon: emoji })}
                          className="w-7 h-7 text-xs rounded hover:bg-[var(--color-snow)] transition-colors border border-transparent hover:border-[var(--color-whisper)]"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Questions List */}
              <div className="space-y-4 pt-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-ink)]">
                    Questions & Answers ({currentCategory.items.length})
                  </h4>
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleAddQuestion}
                    className="text-xs bg-[var(--color-gold)]/20 text-[var(--color-gold-hover)] hover:bg-[var(--color-gold)]/30 font-semibold"
                  >
                    + Add Question
                  </Button>
                </div>

                <div className="space-y-3">
                  {currentCategory.items.map((item, idx) => (
                    <div
                      key={item.id || idx}
                      className="p-4 rounded-xl border border-[var(--color-whisper)] bg-[var(--color-snow)]/40 hover:bg-white hover:border-[var(--color-gold)]/50 transition-all space-y-3"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-[var(--color-gold)]/20 text-[var(--color-gold-hover)] text-[10px] font-bold flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <span className="text-xs font-semibold text-[var(--color-ink)] truncate max-w-md">
                            {item.q || '(Empty Question)'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleMoveQuestion(idx, 'up')}
                            disabled={idx === 0}
                            className="p-1 rounded text-xs text-[var(--color-slate)] hover:bg-[var(--color-whisper)] disabled:opacity-30 disabled:hover:bg-transparent"
                            title="Move Up"
                          >
                            ▲
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveQuestion(idx, 'down')}
                            disabled={idx === currentCategory.items.length - 1}
                            className="p-1 rounded text-xs text-[var(--color-slate)] hover:bg-[var(--color-whisper)] disabled:opacity-30 disabled:hover:bg-transparent"
                            title="Move Down"
                          >
                            ▼
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteQuestion(idx)}
                            className="p-1 text-xs text-rose-600 hover:bg-rose-50 rounded ml-2"
                            title="Delete Question"
                          >
                            ✕
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <AdminFormField
                          label="Question"
                          value={item.q}
                          onChange={(val) => handleUpdateQuestion(idx, { q: val })}
                          placeholder="e.g. What payment methods do you accept?"
                        />
                        <div className="space-y-1">
                          <label className="block text-xs font-semibold text-[var(--color-ink)] tracking-wide">
                            Answer
                          </label>
                          <textarea
                            rows={3}
                            value={item.a}
                            onChange={(e) => handleUpdateQuestion(idx, { a: e.target.value })}
                            placeholder="Provide a clear, reassuring answer..."
                            className="w-full text-xs p-3 rounded-lg border border-[var(--color-whisper)] bg-white text-[var(--color-ink)] placeholder:text-[var(--color-mist)] focus:outline-none focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)] transition-colors"
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  {currentCategory.items.length === 0 && (
                    <div className="p-8 text-center border-2 border-dashed border-[var(--color-whisper)] rounded-xl text-xs text-[var(--color-slate)]">
                      No questions yet in this category. Click "+ Add Question" above to create one.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: HEADER & SEARCH */}
      {activeTab === 'header' && (
        <div className="p-6 rounded-2xl bg-white border border-[var(--color-whisper)] shadow-xs space-y-6">
          <div className="border-b border-[var(--color-whisper)] pb-3">
            <h3 className="text-sm font-semibold text-[var(--color-ink)]">Hero Header & Search Bar</h3>
            <p className="text-xs text-[var(--color-slate)]">
              Customize the banner, greeting, and search bar text at the top of /faq.
            </p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AdminFormField
                label="Eyebrow / Badge"
                value={formData.header.badge}
                onChange={(val) =>
                  setFormData((p) => ({ ...p, header: { ...p.header, badge: val } }))
                }
                placeholder="e.g. HELP CENTER"
              />
              <AdminFormField
                label="Search Bar Placeholder"
                value={formData.searchPlaceholder}
                onChange={(val) => setFormData((p) => ({ ...p, searchPlaceholder: val }))}
                placeholder="e.g. Search questions..."
              />
            </div>

            <AdminFormField
              label="Page Main Title"
              value={formData.header.title}
              onChange={(val) =>
                setFormData((p) => ({ ...p, header: { ...p.header, title: val } }))
              }
              placeholder="e.g. Frequently Asked Questions"
            />

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[var(--color-ink)] tracking-wide">
                Introductory Description
              </label>
              <textarea
                rows={3}
                value={formData.header.description}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    header: { ...p.header, description: e.target.value },
                  }))
                }
                placeholder="Short friendly intro..."
                className="w-full text-xs p-3 rounded-lg border border-[var(--color-whisper)] bg-white text-[var(--color-ink)] placeholder:text-[var(--color-mist)] focus:outline-none focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)] transition-colors"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: STILL NEED HELP? CARD */}
      {activeTab === 'help' && (
        <div className="p-6 rounded-2xl bg-white border border-[var(--color-whisper)] shadow-xs space-y-6">
          <div className="border-b border-[var(--color-whisper)] pb-3">
            <h3 className="text-sm font-semibold text-[var(--color-ink)]">
              "Still Need Help?" Concierge Card
            </h3>
            <p className="text-xs text-[var(--color-slate)]">
              Displayed at the bottom of the FAQ page for users who need personal styling or support.
            </p>
          </div>

          <div className="space-y-4">
            <AdminFormField
              label="Card Title"
              value={formData.stillNeedHelp.title}
              onChange={(val) =>
                setFormData((p) => ({
                  ...p,
                  stillNeedHelp: { ...p.stillNeedHelp, title: val },
                }))
              }
              placeholder="e.g. Still Need Help?"
            />

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[var(--color-ink)] tracking-wide">
                Card Description
              </label>
              <textarea
                rows={2}
                value={formData.stillNeedHelp.description}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    stillNeedHelp: { ...p.stillNeedHelp, description: e.target.value },
                  }))
                }
                placeholder="Description text..."
                className="w-full text-xs p-3 rounded-lg border border-[var(--color-whisper)] bg-white text-[var(--color-ink)] placeholder:text-[var(--color-mist)] focus:outline-none focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)] transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <AdminFormField
                label="WhatsApp Button Text"
                value={formData.stillNeedHelp.whatsappButtonText}
                onChange={(val) =>
                  setFormData((p) => ({
                    ...p,
                    stillNeedHelp: { ...p.stillNeedHelp, whatsappButtonText: val },
                  }))
                }
                placeholder="e.g. WhatsApp Us"
              />
              <AdminFormField
                label="WhatsApp Link URL"
                value={formData.stillNeedHelp.whatsappLink}
                onChange={(val) =>
                  setFormData((p) => ({
                    ...p,
                    stillNeedHelp: { ...p.stillNeedHelp, whatsappLink: val },
                  }))
                }
                placeholder="https://wa.me/..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AdminFormField
                label="Email Button Text"
                value={formData.stillNeedHelp.emailButtonText}
                onChange={(val) =>
                  setFormData((p) => ({
                    ...p,
                    stillNeedHelp: { ...p.stillNeedHelp, emailButtonText: val },
                  }))
                }
                placeholder="e.g. Email Us"
              />
              <AdminFormField
                label="Email Destination Link"
                value={formData.stillNeedHelp.emailLink}
                onChange={(val) =>
                  setFormData((p) => ({
                    ...p,
                    stillNeedHelp: { ...p.stillNeedHelp, emailLink: val },
                  }))
                }
                placeholder="mailto:hello@angelikafashions.com"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AdminFormField
                label="Contact Form Button Text"
                value={formData.stillNeedHelp.contactButtonText}
                onChange={(val) =>
                  setFormData((p) => ({
                    ...p,
                    stillNeedHelp: { ...p.stillNeedHelp, contactButtonText: val },
                  }))
                }
                placeholder="e.g. Contact Form"
              />
              <AdminFormField
                label="Contact Form URL"
                value={formData.stillNeedHelp.contactLink}
                onChange={(val) =>
                  setFormData((p) => ({
                    ...p,
                    stillNeedHelp: { ...p.stillNeedHelp, contactLink: val },
                  }))
                }
                placeholder="/contact"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SEO & METADATA */}
      {activeTab === 'seo' && (
        <div className="p-6 rounded-2xl bg-white border border-[var(--color-whisper)] shadow-xs space-y-6">
          <div className="border-b border-[var(--color-whisper)] pb-3">
            <h3 className="text-sm font-semibold text-[var(--color-ink)]">Search Engine Optimization</h3>
            <p className="text-xs text-[var(--color-slate)]">
              Control how the FAQ & Help Center appears in Google search results and shared social cards.
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-semibold text-[var(--color-ink)]">Meta Title</label>
                <span className="text-[10px] text-[var(--color-slate)]">
                  {formData.seo.metaTitle.length}/60 characters
                </span>
              </div>
              <input
                type="text"
                value={formData.seo.metaTitle}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    seo: { ...p.seo, metaTitle: e.target.value },
                  }))
                }
                className="w-full h-10 text-xs px-3 rounded-lg border border-[var(--color-whisper)] bg-white text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-gold)] transition-colors"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-semibold text-[var(--color-ink)]">
                  Meta Description
                </label>
                <span className="text-[10px] text-[var(--color-slate)]">
                  {formData.seo.metaDescription.length}/160 characters
                </span>
              </div>
              <textarea
                rows={3}
                value={formData.seo.metaDescription}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    seo: { ...p.seo, metaDescription: e.target.value },
                  }))
                }
                className="w-full text-xs p-3 rounded-lg border border-[var(--color-whisper)] bg-white text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-gold)] transition-colors"
              />
            </div>

            {/* Google SERP Preview */}
            <div className="mt-6 p-4 rounded-xl bg-[#F8F9FA] border border-[#DADCE0] space-y-1">
              <div className="text-[11px] text-[#202124] flex items-center gap-1.5 font-sans">
                <span className="w-4 h-4 rounded-full bg-[#E8EAED] flex items-center justify-center text-[9px] font-bold text-[#5F6368]">
                  A
                </span>
                <span className="font-medium">angelikafashions.com</span>
                <span className="text-[#5F6368]">› faq</span>
              </div>
              <h4 className="text-base text-[#1A0DAB] hover:underline cursor-pointer font-sans font-medium line-clamp-1">
                {formData.seo.metaTitle || 'FAQ & Help Center | Angelika Fashions'}
              </h4>
              <p className="text-xs text-[#4D5156] font-sans line-clamp-2 leading-relaxed">
                {formData.seo.metaDescription ||
                  'Find answers to common questions about orders, payments, shipping, returns, custom sizing, artisan fabrics, and bulk orders at Angelika Fashions.'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
