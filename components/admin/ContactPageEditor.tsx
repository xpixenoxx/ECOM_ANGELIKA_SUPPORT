'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils/cn';
import type {
  ContactPageContent,
  ContactOptionItem,
  ContactSubjectOption,
  ContactFaqItem,
  ContactReviewItem,
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

const DEFAULT_CONTACT_DATA: ContactPageContent = {
  header: {
    badge: 'GET IN TOUCH',
    title: "We'd Love to Hear from You",
    description:
      'Whether you need styling advice, have a question about an order, or just want to say hello - Vidhya, Meera, and the team are here for you. No bots, no ticket numbers, just real people.',
  },
  contactOptions: [
    {
      id: 'studio',
      icon: 'studio',
      title: 'Visit Our Studio',
      description: 'By appointment only',
      detail: 'Indiranagar, Bangalore\nMon-Sat: 11 AM - 7 PM',
      cta: 'Book Appointment',
      href: '/book-appointment',
      isWhatsApp: false,
    },
    {
      id: 'email',
      icon: 'email',
      title: 'Email Us',
      description: 'Response within 24 hours',
      detail: 'hello@angelikafashions.com\nstyling@angelikafashions.com',
      cta: 'Write Email',
      href: 'mailto:hello@angelikafashions.com',
      isWhatsApp: false,
    },
    {
      id: 'whatsapp',
      icon: 'whatsapp',
      title: 'Call / WhatsApp',
      description: 'Mon-Sat: 10 AM - 8 PM',
      detail: '+91 98765 43210\n+91 87654 32109',
      cta: 'Chat on WhatsApp',
      href: 'https://wa.me/919876543210',
      isWhatsApp: true,
    },
  ],
  form: {
    title: 'Send Us a Message',
    description: 'We typically respond within 4 hours during business hours.',
    subjects: [
      { value: 'styling', label: 'Styling Advice' },
      { value: 'sizing', label: 'Size & Fit Guidance' },
      { value: 'order', label: 'Order Inquiry' },
      { value: 'return', label: 'Returns & Exchange' },
      { value: 'wholesale', label: 'Wholesale / Bulk Orders' },
      { value: 'artisan', label: 'Artisan Collaboration' },
      { value: 'media', label: 'Press & Media' },
      { value: 'career', label: 'Careers' },
      { value: 'other', label: 'Other' },
    ],
    newsletterLabel: "Subscribe to Vidhya's monthly style notes & early access invites",
    submitButtonText: 'Send Message',
    successTitle: 'Message Sent!',
    successDescription: "Thank you for reaching out. We'll get back to you within 24 hours.",
  },
  quickAnswers: {
    title: 'Quick Answers',
    faqs: [
      {
        q: 'How can I get styling advice for an upcoming event?',
        a: "You can book a free virtual styling session with Vidhya or Meera via WhatsApp. Share your event details, photos of the venue/outfit inspiration, and we'll curate 3-5 complete looks for you within 24 hours.",
      },
      {
        q: 'Do you ship internationally?',
        a: 'Yes, we ship to 25+ countries via DHL Express. International orders typically arrive in 5-7 business days. Duties and taxes are calculated at checkout. Free shipping on orders above $300 USD.',
      },
      {
        q: 'What is your return policy?',
        a: '15-day hassle-free returns for unworn items with original tags. Free pickup in India. For international returns, we provide a prepaid label and refund minus a $15 restocking fee. Custom/stitch-to-order items are non-returnable.',
      },
    ],
    viewAllText: 'View All FAQs (6 questions)',
    viewAllLink: '/faq',
  },
  socialProof: {
    title: 'Why Customers Love Us',
    reviews: [
      {
        text: "Meera helped me find the perfect lehenga for my sister's wedding over WhatsApp. Felt like shopping with a friend.",
        author: 'Priya K., Delhi',
      },
      {
        text: 'The styling session was a game-changer. Vidhya curated 3 looks for my engagement - I wore one, gifted the others!',
        author: 'Ananya S., Mumbai',
      },
      {
        text: 'Return process was seamless. Pickup arranged next day, refund in 48 hours. No questions asked.',
        author: 'Rashmi T., Bangalore',
      },
    ],
  },
  newsletter: {
    title: "Join Vidhya's Inner Circle",
    description:
      'Monthly style edits, early access to new collections, artisan stories, and exclusive offers. No spam, just love. 15,000+ women already subscribed.',
    buttonText: 'Subscribe',
    placeholder: 'Enter your email',
  },
  seo: {
    metaTitle: 'Contact Us | Concierge & Styling Studio | Angelika Fashions',
    metaDescription:
      'Get in touch with Angelika Fashions - styling advice, order support, wholesale inquiries, or just say hello. Real people, real responses.',
  },
};

type TabKey = 'header' | 'channels' | 'form' | 'sidebar' | 'newsletter' | 'seo';

export function ContactPageEditor({
  onCancel,
  onSaved,
}: {
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [formData, setFormData] = useState<ContactPageContent>(DEFAULT_CONTACT_DATA);
  const [activeTab, setActiveTab] = useState<TabKey>('channels');
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
          if (json.content && json.content['contact-page'] && isMounted) {
            const raw = json.content['contact-page'];
            setFormData({
              header: {
                ...DEFAULT_CONTACT_DATA.header,
                ...(raw.header || {}),
              },
              contactOptions: Array.isArray(raw.contactOptions) && raw.contactOptions.length > 0
                ? raw.contactOptions
                : DEFAULT_CONTACT_DATA.contactOptions,
              form: {
                ...DEFAULT_CONTACT_DATA.form,
                ...(raw.form || {}),
                subjects: Array.isArray(raw.form?.subjects) && raw.form.subjects.length > 0
                  ? raw.form.subjects
                  : DEFAULT_CONTACT_DATA.form.subjects,
              },
              quickAnswers: {
                ...DEFAULT_CONTACT_DATA.quickAnswers,
                ...(raw.quickAnswers || {}),
                faqs: Array.isArray(raw.quickAnswers?.faqs) && raw.quickAnswers.faqs.length > 0
                  ? raw.quickAnswers.faqs
                  : DEFAULT_CONTACT_DATA.quickAnswers.faqs,
              },
              socialProof: {
                ...DEFAULT_CONTACT_DATA.socialProof,
                ...(raw.socialProof || {}),
                reviews: Array.isArray(raw.socialProof?.reviews) && raw.socialProof.reviews.length > 0
                  ? raw.socialProof.reviews
                  : DEFAULT_CONTACT_DATA.socialProof.reviews,
              },
              newsletter: {
                ...DEFAULT_CONTACT_DATA.newsletter,
                ...(raw.newsletter || {}),
              },
              seo: {
                ...DEFAULT_CONTACT_DATA.seo,
                ...(raw.seo || {}),
              },
            });
          }
        }
      } catch (err) {
        console.error('Failed to load contact-page content:', err);
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
          sectionId: 'contact-page',
          data: formData,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMessage({
          type: 'success',
          text: 'Contact & Concierge Studio page updated successfully! Your updates are now live on /contact.',
        });
        onSaved();
      } else {
        setStatusMessage({
          type: 'error',
          text: data.error || 'Failed to save contact content.',
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
    if (confirm('Reset all Contact page content back to defaults? Any unsaved edits will be lost.')) {
      setFormData(DEFAULT_CONTACT_DATA);
      setStatusMessage({
        type: 'success',
        text: 'Reset to default template. Click "Save Changes" to publish.',
      });
    }
  };

  // Option Card helpers
  const handleUpdateOption = (index: number, patch: Partial<ContactOptionItem>) => {
    const updated = [...formData.contactOptions];
    const target = updated[index];
    if (target) {
      updated[index] = { ...target, ...patch };
      setFormData((p) => ({ ...p, contactOptions: updated }));
    }
  };

  const handleAddOption = () => {
    const newOption: ContactOptionItem = {
      id: `opt-${Date.now()}`,
      icon: 'phone',
      title: 'New Contact Channel',
      description: 'Available Mon-Fri',
      detail: '+91 00000 00000\nsupport@angelikafashions.com',
      cta: 'Contact Us',
      href: 'tel:+910000000000',
      isWhatsApp: false,
    };
    setFormData((p) => ({ ...p, contactOptions: [...p.contactOptions, newOption] }));
  };

  const handleDeleteOption = (index: number) => {
    if (formData.contactOptions.length <= 1) {
      alert('You must retain at least one contact channel card.');
      return;
    }
    const updated = formData.contactOptions.filter((_, i) => i !== index);
    setFormData((p) => ({ ...p, contactOptions: updated }));
  };

  // Subject dropdown helpers
  const handleAddSubject = () => {
    const newSubj: ContactSubjectOption = {
      value: `topic-${Date.now()}`,
      label: 'New Inquiry Topic',
    };
    setFormData((p) => ({
      ...p,
      form: { ...p.form, subjects: [...p.form.subjects, newSubj] },
    }));
  };

  const handleUpdateSubject = (index: number, patch: Partial<ContactSubjectOption>) => {
    const updated = [...formData.form.subjects];
    const target = updated[index];
    if (target) {
      updated[index] = { ...target, ...patch };
      setFormData((p) => ({ ...p, form: { ...p.form, subjects: updated } }));
    }
  };

  const handleDeleteSubject = (index: number) => {
    const updated = formData.form.subjects.filter((_, i) => i !== index);
    setFormData((p) => ({ ...p, form: { ...p.form, subjects: updated } }));
  };

  // Quick Answers helpers
  const handleAddFaq = () => {
    const newFaq: ContactFaqItem = {
      q: 'Common Question?',
      a: 'Helpful answer...',
    };
    setFormData((p) => ({
      ...p,
      quickAnswers: { ...p.quickAnswers, faqs: [...p.quickAnswers.faqs, newFaq] },
    }));
  };

  const handleUpdateFaq = (index: number, patch: Partial<ContactFaqItem>) => {
    const updated = [...formData.quickAnswers.faqs];
    const target = updated[index];
    if (target) {
      updated[index] = { ...target, ...patch };
      setFormData((p) => ({
        ...p,
        quickAnswers: { ...p.quickAnswers, faqs: updated },
      }));
    }
  };

  const handleDeleteFaq = (index: number) => {
    const updated = formData.quickAnswers.faqs.filter((_, i) => i !== index);
    setFormData((p) => ({
      ...p,
      quickAnswers: { ...p.quickAnswers, faqs: updated },
    }));
  };

  // Testimonial helpers
  const handleAddReview = () => {
    const newRev: ContactReviewItem = {
      text: 'Wonderful experience with the styling concierge team!',
      author: 'Happy Customer, Mumbai',
    };
    setFormData((p) => ({
      ...p,
      socialProof: { ...p.socialProof, reviews: [...p.socialProof.reviews, newRev] },
    }));
  };

  const handleUpdateReview = (index: number, patch: Partial<ContactReviewItem>) => {
    const updated = [...formData.socialProof.reviews];
    const target = updated[index];
    if (target) {
      updated[index] = { ...target, ...patch };
      setFormData((p) => ({
        ...p,
        socialProof: { ...p.socialProof, reviews: updated },
      }));
    }
  };

  const handleDeleteReview = (index: number) => {
    const updated = formData.socialProof.reviews.filter((_, i) => i !== index);
    setFormData((p) => ({
      ...p,
      socialProof: { ...p.socialProof, reviews: updated },
    }));
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center text-xs text-[var(--color-slate)]">
        Loading Contact Page editor...
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
              Contact & Concierge Studio Page Editor
            </h2>
            <Badge variant="outline" className="text-[10px] text-[var(--color-gold)] border-[var(--color-gold)]">
              {formData.contactOptions.length} Channels
            </Badge>
            <Badge variant="outline" className="text-[10px] text-emerald-700 bg-emerald-50 border-emerald-200">
              Live Storefront
            </Badge>
          </div>
          <p className="text-xs text-[var(--color-slate)]">
            Configure contact cards, inquiry subjects, quick answers sidebar, and styling reviews for{' '}
            <Link href="/contact" target="_blank" className="text-[var(--color-gold)] hover:underline font-mono">
              /contact ↗
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
          { key: 'channels', label: 'Contact Channel Cards' },
          { key: 'header', label: 'Header & Eyebrow' },
          { key: 'form', label: 'Inquiry Form & Topics' },
          { key: 'sidebar', label: 'Sidebar: FAQs & Reviews' },
          { key: 'newsletter', label: 'Inner Circle Banner' },
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

      {/* TAB 1: CONTACT CHANNELS */}
      {activeTab === 'channels' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-[var(--color-whisper)] pb-3">
            <div>
              <h3 className="text-sm font-semibold text-[var(--color-ink)]">
                Direct Contact Cards ({formData.contactOptions.length})
              </h3>
              <p className="text-xs text-[var(--color-slate)]">
                The 3 prominent cards shown beneath the page title (Studio, Email, WhatsApp).
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddOption}
              className="text-xs border-[var(--color-gold)] text-[var(--color-gold-hover)] hover:bg-[var(--color-gold)]/10"
            >
              + Add Channel
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {formData.contactOptions.map((opt, idx) => (
              <div
                key={opt.id || idx}
                className="p-5 rounded-2xl bg-white border border-[var(--color-whisper)] shadow-xs hover:border-[var(--color-gold)]/50 transition-all space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[var(--color-gold-hover)] uppercase tracking-wider">
                      Card #{idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteOption(idx)}
                      className="text-xs text-rose-600 hover:bg-rose-50 px-2 py-0.5 rounded"
                      title="Delete card"
                    >
                      Delete
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <AdminFormField
                      label="Card Title"
                      value={opt.title}
                      onChange={(val) => handleUpdateOption(idx, { title: val })}
                      placeholder="e.g. Visit Our Studio"
                    />
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-[var(--color-ink)] tracking-wide">
                        Icon Type
                      </label>
                      <select
                        value={opt.icon}
                        onChange={(e) => handleUpdateOption(idx, { icon: e.target.value as any })}
                        className="w-full h-10 text-xs px-3 rounded-lg border border-[var(--color-whisper)] bg-white text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-gold)]"
                      >
                        <option value="studio">Location / Studio</option>
                        <option value="email">Email / Mail</option>
                        <option value="whatsapp">WhatsApp / Phone</option>
                        <option value="phone">Standard Phone</option>
                      </select>
                    </div>
                  </div>

                  <AdminFormField
                    label="Subtitle / Response Window"
                    value={opt.description}
                    onChange={(val) => handleUpdateOption(idx, { description: val })}
                    placeholder="e.g. By appointment only"
                  />

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-[var(--color-ink)] tracking-wide">
                      Address / Contact Details
                    </label>
                    <textarea
                      rows={2}
                      value={opt.detail}
                      onChange={(e) => handleUpdateOption(idx, { detail: e.target.value })}
                      placeholder="Multi-line address or timings..."
                      className="w-full text-xs p-2.5 rounded-lg border border-[var(--color-whisper)] bg-white text-[var(--color-ink)] placeholder:text-[var(--color-mist)] focus:outline-none focus:border-[var(--color-gold)]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <AdminFormField
                      label="Button Text"
                      value={opt.cta}
                      onChange={(val) => handleUpdateOption(idx, { cta: val })}
                      placeholder="e.g. Book Appointment"
                    />
                    <AdminFormField
                      label="Button Link URL"
                      value={opt.href}
                      onChange={(val) => handleUpdateOption(idx, { href: val })}
                      placeholder="/book-appointment"
                    />
                  </div>

                  <label className="flex items-center gap-2 pt-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(opt.isWhatsApp)}
                      onChange={(e) => handleUpdateOption(idx, { isWhatsApp: e.target.checked })}
                      className="rounded text-[var(--color-gold)] focus:ring-[var(--color-gold)]"
                    />
                    <span className="text-xs text-[var(--color-slate)]">
                      Apply Green WhatsApp button style
                    </span>
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: HEADER */}
      {activeTab === 'header' && (
        <div className="p-6 rounded-2xl bg-white border border-[var(--color-whisper)] shadow-xs space-y-5">
          <div className="border-b border-[var(--color-whisper)] pb-3">
            <h3 className="text-sm font-semibold text-[var(--color-ink)]">Hero Header & Intro</h3>
            <p className="text-xs text-[var(--color-slate)]">
              Edit the welcoming header banner at the top of /contact.
            </p>
          </div>

          <div className="space-y-4">
            <AdminFormField
              label="Eyebrow Badge"
              value={formData.header.badge}
              onChange={(val) =>
                setFormData((p) => ({ ...p, header: { ...p.header, badge: val } }))
              }
              placeholder="e.g. GET IN TOUCH"
            />

            <AdminFormField
              label="Page Main Title"
              value={formData.header.title}
              onChange={(val) =>
                setFormData((p) => ({ ...p, header: { ...p.header, title: val } }))
              }
              placeholder="e.g. We'd Love to Hear from You"
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
                placeholder="Warm welcoming paragraph..."
                className="w-full text-xs p-3 rounded-lg border border-[var(--color-whisper)] bg-white text-[var(--color-ink)] placeholder:text-[var(--color-mist)] focus:outline-none focus:border-[var(--color-gold)] transition-colors"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: INQUIRY FORM & TOPICS */}
      {activeTab === 'form' && (
        <div className="p-6 rounded-2xl bg-white border border-[var(--color-whisper)] shadow-xs space-y-6">
          <div className="border-b border-[var(--color-whisper)] pb-3">
            <h3 className="text-sm font-semibold text-[var(--color-ink)]">
              Inquiry Form Configuration
            </h3>
            <p className="text-xs text-[var(--color-slate)]">
              Customize the form labels, submit button text, and dropdown inquiry topics.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AdminFormField
              label="Form Card Heading"
              value={formData.form.title}
              onChange={(val) =>
                setFormData((p) => ({ ...p, form: { ...p.form, title: val } }))
              }
              placeholder="e.g. Send Us a Message"
            />
            <AdminFormField
              label="Form Subtitle / Response Time"
              value={formData.form.description}
              onChange={(val) =>
                setFormData((p) => ({ ...p, form: { ...p.form, description: val } }))
              }
              placeholder="e.g. We typically respond within 4 hours..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AdminFormField
              label="Submit Button Label"
              value={formData.form.submitButtonText}
              onChange={(val) =>
                setFormData((p) => ({ ...p, form: { ...p.form, submitButtonText: val } }))
              }
              placeholder="e.g. Send Message"
            />
            <AdminFormField
              label="Newsletter Checkbox Label"
              value={formData.form.newsletterLabel}
              onChange={(val) =>
                setFormData((p) => ({ ...p, form: { ...p.form, newsletterLabel: val } }))
              }
              placeholder="Subscribe to Vidhya's monthly style notes..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-[var(--color-whisper)]">
            <AdminFormField
              label="Success State Title"
              value={formData.form.successTitle}
              onChange={(val) =>
                setFormData((p) => ({ ...p, form: { ...p.form, successTitle: val } }))
              }
              placeholder="e.g. Message Sent!"
            />
            <AdminFormField
              label="Success State Description"
              value={formData.form.successDescription}
              onChange={(val) =>
                setFormData((p) => ({ ...p, form: { ...p.form, successDescription: val } }))
              }
              placeholder="e.g. Thank you for reaching out..."
            />
          </div>

          {/* Inquiry Topics Dropdown Options */}
          <div className="pt-4 border-t border-[var(--color-whisper)] space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-ink)]">
                  Subject / Topic Dropdown Options ({formData.form.subjects.length})
                </h4>
                <p className="text-[11px] text-[var(--color-slate)]">
                  Choices available in the "Subject *" dropdown on the contact form.
                </p>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleAddSubject}
                className="text-xs text-[var(--color-gold-hover)] border-[var(--color-gold)]"
              >
                + Add Topic
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-1">
              {formData.form.subjects.map((subj, idx) => (
                <div
                  key={subj.value || idx}
                  className="flex items-center gap-1.5 p-2 rounded-lg border border-[var(--color-whisper)] bg-[var(--color-snow)]"
                >
                  <input
                    type="text"
                    value={subj.label}
                    onChange={(e) => handleUpdateSubject(idx, { label: e.target.value })}
                    placeholder="Topic Label"
                    className="flex-1 h-8 text-xs px-2 rounded border border-[var(--color-whisper)] bg-white text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-gold)]"
                  />
                  <button
                    type="button"
                    onClick={() => handleDeleteSubject(idx)}
                    className="w-7 h-8 text-xs text-rose-600 hover:bg-rose-50 rounded"
                    title="Delete topic"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SIDEBAR: FAQS & REVIEWS */}
      {activeTab === 'sidebar' && (
        <div className="space-y-6">
          {/* Quick Answers Card */}
          <div className="p-6 rounded-2xl bg-white border border-[var(--color-whisper)] shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-[var(--color-whisper)] pb-3">
              <div>
                <h3 className="text-sm font-semibold text-[var(--color-ink)]">
                  Quick Answers (FAQ Sidebar Accordion)
                </h3>
                <p className="text-xs text-[var(--color-slate)]">
                  FAQ snippets displayed alongside the message form.
                </p>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleAddFaq}
                className="text-xs border-[var(--color-gold)] text-[var(--color-gold-hover)]"
              >
                + Add FAQ
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AdminFormField
                label="Card Title"
                value={formData.quickAnswers.title}
                onChange={(val) =>
                  setFormData((p) => ({ ...p, quickAnswers: { ...p.quickAnswers, title: val } }))
                }
                placeholder="e.g. Quick Answers"
              />
              <div className="grid grid-cols-2 gap-2">
                <AdminFormField
                  label="View All Button Text"
                  value={formData.quickAnswers.viewAllText}
                  onChange={(val) =>
                    setFormData((p) => ({
                      ...p,
                      quickAnswers: { ...p.quickAnswers, viewAllText: val },
                    }))
                  }
                  placeholder="View All FAQs"
                />
                <AdminFormField
                  label="View All Button Link"
                  value={formData.quickAnswers.viewAllLink}
                  onChange={(val) =>
                    setFormData((p) => ({
                      ...p,
                      quickAnswers: { ...p.quickAnswers, viewAllLink: val },
                    }))
                  }
                  placeholder="/faq"
                />
              </div>
            </div>

            <div className="space-y-3 pt-2">
              {formData.quickAnswers.faqs.map((faq, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-[var(--color-whisper)] bg-[var(--color-snow)]/50 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[var(--color-ink)]">
                      Question #{idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteFaq(idx)}
                      className="text-xs text-rose-600 hover:bg-rose-50 px-2 py-0.5 rounded"
                    >
                      Delete
                    </button>
                  </div>
                  <AdminFormField
                    label="Question"
                    value={faq.q}
                    onChange={(val) => handleUpdateFaq(idx, { q: val })}
                    placeholder="Question..."
                  />
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-[var(--color-ink)]">
                      Answer
                    </label>
                    <textarea
                      rows={2}
                      value={faq.a}
                      onChange={(e) => handleUpdateFaq(idx, { a: e.target.value })}
                      className="w-full text-xs p-2.5 rounded-lg border border-[var(--color-whisper)] bg-white text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-gold)]"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Social Proof / Testimonials Card */}
          <div className="p-6 rounded-2xl bg-white border border-[var(--color-whisper)] shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-[var(--color-whisper)] pb-3">
              <div>
                <h3 className="text-sm font-semibold text-[var(--color-ink)]">
                  Why Customers Love Us (Testimonials)
                </h3>
                <p className="text-xs text-[var(--color-slate)]">
                  Customer trust quotes shown below the quick answers card.
                </p>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleAddReview}
                className="text-xs border-[var(--color-gold)] text-[var(--color-gold-hover)]"
              >
                + Add Review
              </Button>
            </div>

            <AdminFormField
              label="Card Title"
              value={formData.socialProof.title}
              onChange={(val) =>
                setFormData((p) => ({ ...p, socialProof: { ...p.socialProof, title: val } }))
              }
              placeholder="e.g. Why Customers Love Us"
            />

            <div className="space-y-3">
              {formData.socialProof.reviews.map((rev, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-[var(--color-whisper)] bg-[var(--color-snow)]/50 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[var(--color-ink)]">
                      Review #{idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteReview(idx)}
                      className="text-xs text-rose-600 hover:bg-rose-50 px-2 py-0.5 rounded"
                    >
                      Delete
                    </button>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-[var(--color-ink)]">
                      Review Quote
                    </label>
                    <textarea
                      rows={2}
                      value={rev.text}
                      onChange={(e) => handleUpdateReview(idx, { text: e.target.value })}
                      className="w-full text-xs p-2.5 rounded-lg border border-[var(--color-whisper)] bg-white text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-gold)]"
                    />
                  </div>
                  <AdminFormField
                    label="Customer Author & City"
                    value={rev.author}
                    onChange={(val) => handleUpdateReview(idx, { author: val })}
                    placeholder="e.g. Priya K., Delhi"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: INNER CIRCLE NEWSLETTER */}
      {activeTab === 'newsletter' && (
        <div className="p-6 rounded-2xl bg-white border border-[var(--color-whisper)] shadow-xs space-y-5">
          <div className="border-b border-[var(--color-whisper)] pb-3">
            <h3 className="text-sm font-semibold text-[var(--color-ink)]">
              "Join Vidhya's Inner Circle" Footer Section
            </h3>
            <p className="text-xs text-[var(--color-slate)]">
              Dark luxury banner at the bottom of the contact page inviting newsletter signups.
            </p>
          </div>

          <div className="space-y-4">
            <AdminFormField
              label="Banner Title"
              value={formData.newsletter.title}
              onChange={(val) =>
                setFormData((p) => ({ ...p, newsletter: { ...p.newsletter, title: val } }))
              }
              placeholder="e.g. Join Vidhya's Inner Circle"
            />

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[var(--color-ink)] tracking-wide">
                Description Paragraph
              </label>
              <textarea
                rows={3}
                value={formData.newsletter.description}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    newsletter: { ...p.newsletter, description: e.target.value },
                  }))
                }
                placeholder="Monthly style edits, early access to new collections..."
                className="w-full text-xs p-3 rounded-lg border border-[var(--color-whisper)] bg-white text-[var(--color-ink)] placeholder:text-[var(--color-mist)] focus:outline-none focus:border-[var(--color-gold)] transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AdminFormField
                label="Subscribe Button Text"
                value={formData.newsletter.buttonText}
                onChange={(val) =>
                  setFormData((p) => ({ ...p, newsletter: { ...p.newsletter, buttonText: val } }))
                }
                placeholder="e.g. Subscribe"
              />
              <AdminFormField
                label="Input Placeholder"
                value={formData.newsletter.placeholder}
                onChange={(val) =>
                  setFormData((p) => ({ ...p, newsletter: { ...p.newsletter, placeholder: val } }))
                }
                placeholder="e.g. Enter your email"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: SEO & METADATA */}
      {activeTab === 'seo' && (
        <div className="p-6 rounded-2xl bg-white border border-[var(--color-whisper)] shadow-xs space-y-6">
          <div className="border-b border-[var(--color-whisper)] pb-3">
            <h3 className="text-sm font-semibold text-[var(--color-ink)]">Search Engine Optimization</h3>
            <p className="text-xs text-[var(--color-slate)]">
              Control the browser title and description displayed in Google searches for /contact.
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
                <span className="text-[#5F6368]">› contact</span>
              </div>
              <h4 className="text-base text-[#1A0DAB] hover:underline cursor-pointer font-sans font-medium line-clamp-1">
                {formData.seo.metaTitle || 'Contact Us | Concierge & Styling Studio | Angelika Fashions'}
              </h4>
              <p className="text-xs text-[#4D5156] font-sans line-clamp-2 leading-relaxed">
                {formData.seo.metaDescription ||
                  'Get in touch with Angelika Fashions - styling advice, order support, wholesale inquiries, or just say hello. Real people, real responses.'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

