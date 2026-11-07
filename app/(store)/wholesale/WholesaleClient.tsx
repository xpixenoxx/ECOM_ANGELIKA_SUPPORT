'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils/cn';
import type { WholesalePageContent } from '@/lib/actions/site-content-types';

interface WholesaleClientProps {
  content: WholesalePageContent;
}

export function WholesaleClient({ content }: WholesaleClientProps) {
  const {
    header = {
      eyebrow: 'GLOBAL BOUTIQUE & RETAIL PARTNERSHIPS',
      title: 'Wholesale & B2B Inquiries',
      description:
        'Partner with Angelika Fashions to curate handcrafted Indian haute couture, pure silk handloom sarees, and bridal lehengas for your luxury boutique, overseas salon, or festive corporate curation.',
    },
    benefits = [],
    form = {
      title: 'Wholesale Partner Registration',
      moqNote: 'MOQ starts from 15 pieces per order across assorted styles.',
      submitButtonText: 'Submit Wholesale Request',
      tiers: [],
      successTitle: 'Thank You for Your Wholesale Inquiry',
      successDescription:
        "Our wholesale director and designer Vidhya's team will review your boutique requirements and reach out with our seasonal lookbook and B2B line sheets within 24 hours.",
      whatsappDeskButtonText: 'Expedite Inquiry via WhatsApp B2B Desk →',
      whatsappDeskLink: 'https://wa.me/919876543210',
    },
    footerSupport = {
      prefixText: 'Prefer direct communication?',
      linkText: 'Connect directly with our B2B Director on WhatsApp →',
      whatsappLink:
        'https://wa.me/919876543210?text=Hi%20Vidhya,%20I%20would%20like%20to%20discuss%20a%20wholesale%20partnership.',
    },
  } = content || {};

  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    businessName: '',
    contactName: '',
    email: '',
    phone: '',
    cityCountry: '',
    approxQuantity: form.tiers[0]?.value || '15 – 30 pieces',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-12 md:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Breadcrumb & Title */}
        <div className="mb-10 text-center sm:text-left">
          <nav
            className="text-xs text-[var(--color-slate)] mb-3 flex items-center justify-center sm:justify-start gap-2"
            aria-label="Breadcrumb"
          >
            <Link href="/" className="hover:text-[var(--color-gold)] transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-[var(--color-ink)] font-medium">Wholesale & B2B</span>
          </nav>
          {header.eyebrow && (
            <span className="text-[11px] font-semibold tracking-[0.24em] uppercase text-[var(--color-gold)] block mb-1">
              {header.eyebrow}
            </span>
          )}
          <h1 className="font-serif text-3xl sm:text-4xl text-[var(--color-ink)] font-normal tracking-tight">
            {header.title}
          </h1>
          {header.description && (
            <p className="mt-2 text-sm text-[var(--color-slate)] max-w-2xl font-light leading-relaxed">
              {header.description}
            </p>
          )}
        </div>

        {/* Benefits Grid */}
        {benefits.length > 0 && (
          <div className="mb-10 rounded-2xl bg-[#FCFAF7] border border-[#E5DECF] p-6 sm:p-8 shadow-[0_4px_20px_rgba(201,168,76,0.06)] grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            {benefits.map((benefit, idx) => (
              <div
                key={idx}
                className={cn(
                  'space-y-1.5',
                  idx === 1 && 'sm:border-x sm:border-[#EAE4D9] sm:px-4'
                )}
              >
                <div className="w-10 h-10 rounded-full bg-[var(--color-gold-light)] text-[var(--color-gold)] flex items-center justify-center mx-auto border border-[var(--color-gold)]/30 font-serif font-bold text-sm">
                  {benefit.icon || '⚜'}
                </div>
                <h4 className="font-semibold text-xs text-[var(--color-ink)] uppercase tracking-wider">
                  {benefit.title}
                </h4>
                <p className="text-xs text-[var(--color-slate)] leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Form Container */}
        <div className="bg-white border border-[#EAE4D9] rounded-2xl p-6 sm:p-10 shadow-xs">
          {submitted ? (
            <div className="text-center py-10 space-y-4">
              <div className="w-14 h-14 rounded-full bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0] flex items-center justify-center mx-auto text-xl">
                ✓
              </div>
              <h3 className="font-serif text-2xl text-[var(--color-ink)]">
                {form.successTitle || 'Thank You for Your Wholesale Inquiry'}
              </h3>
              <p className="text-sm text-[var(--color-slate)] max-w-md mx-auto leading-relaxed">
                {form.successDescription ||
                  "Our wholesale director and designer Vidhya's team will review your boutique requirements and reach out with our seasonal lookbook and B2B line sheets within 24 hours."}
              </p>
              <div className="pt-2">
                <a
                  href={`https://wa.me/919876543210?text=${encodeURIComponent(
                    `Hi Vidhya, I submitted a B2B wholesale inquiry for ${formData.businessName || 'my boutique'}.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[var(--color-ink)] text-white text-xs font-medium tracking-wide hover:bg-[#25221E] transition-colors"
                >
                  {form.whatsappDeskButtonText || 'Expedite Inquiry via WhatsApp B2B Desk →'}
                </a>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <h3 className="font-serif text-xl text-[var(--color-ink)] font-normal border-b border-[#EAE4D9] pb-3">
                {form.title || 'Wholesale Partner Registration'}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="businessName"
                    className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)] mb-1"
                  >
                    Boutique / Company Name *
                  </label>
                  <input
                    id="businessName"
                    type="text"
                    required
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    placeholder="e.g. Saffron Bridal Salon"
                    className="w-full px-4 py-2.5 rounded-lg border border-[#E5DFD5] text-sm text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)] bg-[#FCFAF7]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="contactName"
                    className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)] mb-1"
                  >
                    Contact Person Name *
                  </label>
                  <input
                    id="contactName"
                    type="text"
                    required
                    value={formData.contactName}
                    onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                    placeholder="e.g. Priya Sharma"
                    className="w-full px-4 py-2.5 rounded-lg border border-[#E5DFD5] text-sm text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)] bg-[#FCFAF7]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)] mb-1"
                  >
                    Business Email *
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="you@boutique.com"
                    className="w-full px-4 py-2.5 rounded-lg border border-[#E5DFD5] text-sm text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)] bg-[#FCFAF7]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)] mb-1"
                  >
                    Phone / WhatsApp Number *
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 (555) 000-0000 or +91 98765 43210"
                    className="w-full px-4 py-2.5 rounded-lg border border-[#E5DFD5] text-sm text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)] bg-[#FCFAF7]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="cityCountry"
                    className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)] mb-1"
                  >
                    City & Country *
                  </label>
                  <input
                    id="cityCountry"
                    type="text"
                    required
                    value={formData.cityCountry}
                    onChange={(e) => setFormData({ ...formData, cityCountry: e.target.value })}
                    placeholder="e.g. London, UK or Fremont, CA"
                    className="w-full px-4 py-2.5 rounded-lg border border-[#E5DFD5] text-sm text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)] bg-[#FCFAF7]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="approxQuantity"
                    className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)] mb-1"
                  >
                    Initial Order Quantity
                  </label>
                  <select
                    id="approxQuantity"
                    value={formData.approxQuantity}
                    onChange={(e) =>
                      setFormData({ ...formData, approxQuantity: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-lg border border-[#E5DFD5] text-sm text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)] bg-[#FCFAF7]"
                  >
                    {form.tiers.map((tier) => (
                      <option key={tier.value} value={tier.value}>
                        {tier.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)] mb-1"
                >
                  Specific Collection Preferences & Timeline
                </label>
                <textarea
                  id="message"
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Share details about your boutique aesthetic, bridal season timeline, and preferred fabrics (Silk, Chanderi, Georgette)..."
                  className="w-full px-4 py-2.5 rounded-lg border border-[#E5DFD5] text-sm text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)] bg-[#FCFAF7]"
                />
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                <span className="text-xs text-[var(--color-mist)]">
                  {form.moqNote || 'MOQ starts from 15 pieces per order across assorted styles.'}
                </span>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-8 py-3 rounded-lg bg-[var(--color-ink)] hover:bg-[#25221E] text-white text-xs font-medium tracking-wide border border-[var(--color-gold)]/40 hover:border-[var(--color-gold)] transition-all duration-200 cursor-pointer"
                >
                  {form.submitButtonText || 'Submit Wholesale Request'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Instant WhatsApp Support */}
        {footerSupport && (
          <div className="mt-8 text-center">
            <p className="text-xs text-[var(--color-slate)]">
              {footerSupport.prefixText || 'Prefer direct communication?'}{' '}
              <a
                href={footerSupport.whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-[var(--color-gold-hover)] underline hover:text-[var(--color-gold)]"
              >
                {footerSupport.linkText ||
                  'Connect directly with our B2B Director on WhatsApp →'}
              </a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
