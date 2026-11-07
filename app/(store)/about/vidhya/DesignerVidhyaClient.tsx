'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import type { DesignerVidhyaPageContent } from '@/lib/actions/site-content-types';

export function DesignerVidhyaClient({
  initialContent,
}: {
  initialContent: DesignerVidhyaPageContent;
}) {
  const [imgSrc, setImgSrc] = useState(
    initialContent?.story?.image || '/images/categories/sarees.jpg'
  );

  const header = initialContent?.header || {
    breadcrumbHome: 'Home',
    breadcrumbAbout: 'About Us',
    breadcrumbCurrent: 'Meet Designer Vidhya',
    eyebrow: 'THE CREATIVE SOUL BEHIND ANGELIKA',
    title: 'Meet Designer Vidhya',
    quote:
      '"Ethnic wear shouldn\'t just be worn for an occasion; it should feel like an heirloom that holds the memory of the celebration and honors the hands that wove it."',
  };

  const story = initialContent?.story || {
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
  };

  const tenets = initialContent?.tenets || {
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
  };

  const consultation = initialContent?.consultation || {
    eyebrow: 'CONSULT DIRECTLY WITH VIDHYA',
    title: 'Book a Personal WhatsApp Styling Session',
    description:
      'Need advice on which silhouette suits your body type or which color palette matches your bridal celebration? Designer Vidhya is available for complimentary styling consultations.',
    buttonText: 'Chat with Designer Vidhya on WhatsApp →',
    whatsappUrl:
      'https://wa.me/919876543210?text=Hi%20Vidhya,%20I%20would%20love%20a%20personal%20styling%20session%20with%20you.',
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
              {header.breadcrumbHome || 'Home'}
            </Link>
            <span>/</span>
            <Link href="/about" className="hover:text-[var(--color-gold)] transition-colors">
              {header.breadcrumbAbout || 'About Us'}
            </Link>
            <span>/</span>
            <span className="text-[var(--color-ink)] font-medium">
              {header.breadcrumbCurrent || 'Meet Designer Vidhya'}
            </span>
          </nav>
          <span className="text-[11px] font-semibold tracking-[0.24em] uppercase text-[var(--color-gold)] block mb-1">
            {header.eyebrow || 'THE CREATIVE SOUL BEHIND ANGELIKA'}
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-[var(--color-ink)] font-normal tracking-tight">
            {header.title || 'Meet Designer Vidhya'}
          </h1>
          {header.quote && (
            <p className="mt-2 text-sm text-[var(--color-slate)] max-w-2xl font-light leading-relaxed">
              {header.quote}
            </p>
          )}
        </div>

        {/* Hero Designer Profile Card */}
        <div className="mb-10 rounded-2xl bg-white border border-[#EAE4D9] p-6 sm:p-10 shadow-xs grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-5 relative">
            <div className="aspect-3/4 rounded-xl overflow-hidden bg-[#FAF8F5] border border-[#E5DFD5] shadow-sm relative group">
              <img
                src={imgSrc}
                alt={story.imageAlt || 'Designer Vidhya draping handloom silk'}
                onError={() => {
                  if (imgSrc !== '/images/categories/sarees.jpg') {
                    setImgSrc('/images/categories/sarees.jpg');
                  }
                }}
                className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-ink)]/60 via-transparent to-transparent flex items-end p-4">
                <div className="text-white">
                  <p className="font-serif text-lg leading-tight">
                    {story.designerName || 'Vidhya'}
                  </p>
                  <p className="text-[10px] tracking-widest uppercase text-[var(--color-gold)]">
                    {story.designerRole || 'Founder & Creative Director'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-7 space-y-4">
            <span className="text-[10px] font-semibold tracking-widest uppercase text-[var(--color-gold)]">
              {story.eyebrow || 'HERITAGE & ATELIER PHILOSOPHY'}
            </span>
            <h2 className="font-serif text-2xl text-[var(--color-ink)] font-normal">
              {story.title || 'Reinventing Handloom Couture for the Contemporary Woman'}
            </h2>
            {story.paragraphs && story.paragraphs.length > 0 ? (
              story.paragraphs.map((para, i) => (
                <p key={i} className="text-sm text-[var(--color-slate)] leading-relaxed">
                  {para}
                </p>
              ))
            ) : (
              <p className="text-sm text-[var(--color-slate)] leading-relaxed">
                Trained in the historic weaving heartlands of Varanasi, Chanderi, and Kanchipuram, Vidhya established Angelika Fashions to bridge the generational divide between timeless Indian textiles and effortless modern silhouettes.
              </p>
            )}

            {story.metrics && story.metrics.length > 0 && (
              <div className="pt-2 flex flex-wrap gap-4">
                {story.metrics.map((metric, i) => (
                  <div key={i} className="p-3 rounded-lg bg-[#FCFAF7] border border-[#E5DECF] text-xs">
                    <span className="font-serif font-bold text-base text-[var(--color-gold)] block">
                      {metric.value}
                    </span>
                    <span className="text-[var(--color-slate)]">{metric.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 3 Pillars of Vidhya's Craft */}
        {tenets?.items && tenets.items.length > 0 && (
          <div className="space-y-6 bg-white border border-[#EAE4D9] rounded-2xl p-6 sm:p-10 shadow-xs mb-10">
            <h3 className="font-serif text-xl text-[var(--color-ink)] font-normal">
              {tenets.title || "The Three Tenets of Vidhya's Atelier"}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
              {tenets.items.map((tenet, idx) => (
                <div key={idx} className="space-y-2">
                  <h4 className="font-semibold text-xs text-[var(--color-ink)] uppercase tracking-wider">
                    {tenet.number ? `${tenet.number} ` : ''}
                    {tenet.title}
                  </h4>
                  <p className="text-xs text-[var(--color-slate)] leading-relaxed">
                    {tenet.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Direct Concierge Callout */}
        <div className="rounded-xl bg-[#FAF8F5] border border-[#E5DECF] p-6 text-center space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-gold)]">
            {consultation.eyebrow || 'CONSULT DIRECTLY WITH VIDHYA'}
          </p>
          <h3 className="font-serif text-xl text-[var(--color-ink)]">
            {consultation.title || 'Book a Personal WhatsApp Styling Session'}
          </h3>
          <p className="text-xs text-[var(--color-slate)] max-w-lg mx-auto">
            {consultation.description ||
              'Need advice on which silhouette suits your body type or which color palette matches your bridal celebration? Designer Vidhya is available for complimentary styling consultations.'}
          </p>
          <div className="pt-2 flex justify-center gap-4">
            <a
              href={
                consultation.whatsappUrl ||
                'https://wa.me/919876543210?text=Hi%20Vidhya,%20I%20would%20love%20a%20personal%20styling%20session%20with%20you.'
              }
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[var(--color-ink)] text-white text-xs font-medium tracking-wide hover:bg-[#25221E] transition-colors"
            >
              {consultation.buttonText || 'Chat with Designer Vidhya on WhatsApp →'}
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}

