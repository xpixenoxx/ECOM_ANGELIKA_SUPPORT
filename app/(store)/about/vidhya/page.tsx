import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Meet Designer Vidhya | Angelika Fashions Atelier',
  description: 'Discover the artisanal journey, design philosophy, and master craft heritage of Designer Vidhya at Angelika Fashions.',
};

export default function DesignerVidhyaPage() {
  return (
    <div className="min-h-screen bg-[#FAF8F5] py-12 md:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Breadcrumb & Title */}
        <div className="mb-10 text-center sm:text-left">
          <nav className="text-xs text-[var(--color-slate)] mb-3 flex items-center justify-center sm:justify-start gap-2" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-[var(--color-gold)] transition-colors">Home</Link>
            <span>/</span>
            <Link href="/about" className="hover:text-[var(--color-gold)] transition-colors">About Us</Link>
            <span>/</span>
            <span className="text-[var(--color-ink)] font-medium">Meet Designer Vidhya</span>
          </nav>
          <span className="text-[11px] font-semibold tracking-[0.24em] uppercase text-[var(--color-gold)] block mb-1">
            The Creative Soul Behind Angelika
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-[var(--color-ink)] font-normal tracking-tight">
            Meet Designer Vidhya
          </h1>
          <p className="mt-2 text-sm text-[var(--color-slate)] max-w-2xl font-light leading-relaxed">
            "Ethnic wear shouldn't just be worn for an occasion; it should feel like an heirloom that holds the memory of the celebration and honors the hands that wove it."
          </p>
        </div>

        {/* Hero Designer Profile Card */}
        <div className="mb-10 rounded-2xl bg-white border border-[#EAE4D9] p-6 sm:p-10 shadow-xs grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-5 relative">
            <div className="aspect-3/4 rounded-xl overflow-hidden bg-[#FAF8F5] border border-[#E5DFD5] shadow-sm relative group">
              <img
                src="/images/categories/sarees.jpg"
                alt="Designer Vidhya draping handloom silk"
                className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-ink)]/60 via-transparent to-transparent flex items-end p-4">
                <div className="text-white">
                  <p className="font-serif text-lg leading-tight">Vidhya</p>
                  <p className="text-[10px] tracking-widest uppercase text-[var(--color-gold)]">
                    Founder & Creative Director
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-7 space-y-4">
            <span className="text-[10px] font-semibold tracking-widest uppercase text-[var(--color-gold)]">
              Heritage & Atelier Philosophy
            </span>
            <h2 className="font-serif text-2xl text-[var(--color-ink)] font-normal">
              Reinventing Handloom Couture for the Contemporary Woman
            </h2>
            <p className="text-sm text-[var(--color-slate)] leading-relaxed">
              Trained in the historic weaving heartlands of Varanasi, Chanderi, and Kanchipuram, Vidhya established Angelika Fashions to bridge the generational divide between timeless Indian textiles and effortless modern silhouettes.
            </p>
            <p className="text-sm text-[var(--color-slate)] leading-relaxed">
              Every drape is conceived around comfort, movement, and genuine pure silk authenticity. Rejecting synthetic polyester copies and mass production, Vidhya works directly with over 40 artisan master weaving families across India.
            </p>

            <div className="pt-2 flex flex-wrap gap-4">
              <div className="p-3 rounded-lg bg-[#FCFAF7] border border-[#E5DECF] text-xs">
                <span className="font-serif font-bold text-base text-[var(--color-gold)] block">100%</span>
                <span className="text-[var(--color-slate)]">Certified Pure Handloom</span>
              </div>
              <div className="p-3 rounded-lg bg-[#FCFAF7] border border-[#E5DECF] text-xs">
                <span className="font-serif font-bold text-base text-[var(--color-gold)] block">40+</span>
                <span className="text-[var(--color-slate)]">Weaving Families Supported</span>
              </div>
              <div className="p-3 rounded-lg bg-[#FCFAF7] border border-[#E5DECF] text-xs">
                <span className="font-serif font-bold text-base text-[var(--color-gold)] block">12k+</span>
                <span className="text-[var(--color-slate)]">Global Drapes Styled</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3 Pillars of Vidhya's Craft */}
        <div className="space-y-6 bg-white border border-[#EAE4D9] rounded-2xl p-6 sm:p-10 shadow-xs mb-10">
          <h3 className="font-serif text-xl text-[var(--color-ink)] font-normal">
            The Three Tenets of Vidhya's Atelier
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
            <div className="space-y-2">
              <h4 className="font-semibold text-xs text-[var(--color-ink)] uppercase tracking-wider">
                1. Ethical Loom Direct
              </h4>
              <p className="text-xs text-[var(--color-slate)] leading-relaxed">
                Fair living wages and direct artisan profit sharing without distributor commissions.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-xs text-[var(--color-ink)] uppercase tracking-wider">
                2. Weightless Grandeur
              </h4>
              <p className="text-xs text-[var(--color-slate)] leading-relaxed">
                Re-engineering traditional heavy zari into breathable, feather-light drapes you can dance in.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-xs text-[var(--color-ink)] uppercase tracking-wider">
                3. Private Client Styling
              </h4>
              <p className="text-xs text-[var(--color-slate)] leading-relaxed">
                Complimentary direct consultation with Vidhya to personalize blouse cuts, dupatta styling, and trousseau curation.
              </p>
            </div>
          </div>
        </div>

        {/* Direct Concierge Callout */}
        <div className="rounded-xl bg-[#FAF8F5] border border-[#E5DECF] p-6 text-center space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-gold)]">
            Consult Directly with Vidhya
          </p>
          <h3 className="font-serif text-xl text-[var(--color-ink)]">
            Book a Personal WhatsApp Styling Session
          </h3>
          <p className="text-xs text-[var(--color-slate)] max-w-lg mx-auto">
            Need advice on which silhouette suits your body type or which color palette matches your bridal celebration? Designer Vidhya is available for complimentary styling consultations.
          </p>
          <div className="pt-2 flex justify-center gap-4">
            <a
              href="https://wa.me/919876543210?text=Hi%20Vidhya,%20I%20would%20love%20a%20personal%20styling%20session%20with%20you."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[var(--color-ink)] text-white text-xs font-medium tracking-wide hover:bg-[#25221E] transition-colors"
            >
              Chat with Designer Vidhya on WhatsApp →
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
