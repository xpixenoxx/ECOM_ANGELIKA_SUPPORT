import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Shipping & Delivery Policy | Angelika Fashions',
  description: 'Learn about our domestic and international shipping policies, dispatch timelines, and complimentary delivery for handcrafted luxury ethnic wear.',
};

export default function ShippingPolicyPage() {
  return (
    <div className="min-h-screen bg-[#FAF8F5] py-12 md:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Breadcrumb & Title */}
        <div className="mb-10 text-center sm:text-left">
          <nav className="text-xs text-[var(--color-slate)] mb-3 flex items-center justify-center sm:justify-start gap-2" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-[var(--color-gold)] transition-colors">Home</Link>
            <span>/</span>
            <span className="text-[var(--color-ink)] font-medium">Shipping Policy</span>
          </nav>
          <span className="text-[11px] font-semibold tracking-[0.24em] uppercase text-[var(--color-gold)] block mb-1">
            Complimentary & Express Courier
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-[var(--color-ink)] font-normal tracking-tight">
            Shipping & Delivery Policy
          </h1>
          <p className="mt-2 text-sm text-[var(--color-slate)] max-w-2xl font-light leading-relaxed">
            Every Angelika creation is handcrafted with reverence by master weavers and individually inspected before dispatch. Here is how we ensure seamless, insured delivery to your doorstep.
          </p>
        </div>

        {/* Highlight Banner */}
        <div className="mb-10 rounded-xl bg-[#FCFAF7] border border-[#E5DECF] p-6 shadow-[0_4px_20px_rgba(201,168,76,0.06)] grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          <div className="space-y-1">
            <span className="text-xs font-semibold tracking-wider uppercase text-[var(--color-gold)] block">Pan-India Shipping</span>
            <p className="text-lg font-serif font-medium text-[var(--color-ink)]">Free on ₹999+</p>
            <p className="text-xs text-[var(--color-slate)]">Standard ₹99 under ₹999</p>
          </div>
          <div className="space-y-1 sm:border-x sm:border-[#EAE4D9] sm:px-4">
            <span className="text-xs font-semibold tracking-wider uppercase text-[var(--color-gold)] block">Dispatch Time</span>
            <p className="text-lg font-serif font-medium text-[var(--color-ink)]">24 – 48 Hours</p>
            <p className="text-xs text-[var(--color-slate)]">Ready-to-wear collections</p>
          </div>
          <div className="space-y-1">
            <span className="text-xs font-semibold tracking-wider uppercase text-[var(--color-gold)] block">Global Courier</span>
            <p className="text-lg font-serif font-medium text-[var(--color-ink)]">Worldwide Delivery</p>
            <p className="text-xs text-[var(--color-slate)]">Express via DHL / FedEx</p>
          </div>
        </div>

        {/* Content Sections */}
        <div className="space-y-8 bg-white border border-[#EAE4D9] rounded-2xl p-6 sm:p-10 shadow-xs">
          
          <section className="space-y-3">
            <h2 className="font-serif text-xl text-[var(--color-ink)] font-medium">
              1. Domestic Shipping Timelines (India)
            </h2>
            <p className="text-sm text-[var(--color-slate)] leading-relaxed">
              We partner with India's premier air express carriers (Bluedart, Delhivery, and DTDC) to deliver your heirlooms securely:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
              <div className="p-4 rounded-lg bg-[#FAF8F5] border border-[#EAE4D9]">
                <h4 className="font-semibold text-xs text-[var(--color-ink)] uppercase tracking-wider mb-1">
                  Metro Cities (Tier 1)
                </h4>
                <p className="text-xs text-[var(--color-slate)]">
                  Mumbai, Delhi NCR, Bengaluru, Chennai, Hyderabad, Kolkata: <strong className="text-[var(--color-ink)]">2 to 4 business days</strong>.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-[#FAF8F5] border border-[#EAE4D9]">
                <h4 className="font-semibold text-xs text-[var(--color-ink)] uppercase tracking-wider mb-1">
                  Non-Metro & Regional Towns
                </h4>
                <p className="text-xs text-[var(--color-slate)]">
                  Tier 2 & Tier 3 locations across India: <strong className="text-[var(--color-ink)]">4 to 7 business days</strong>.
                </p>
              </div>
            </div>
          </section>

          <hr className="border-[#EAE4D9]" />

          <section className="space-y-3">
            <h2 className="font-serif text-xl text-[var(--color-ink)] font-medium">
              2. Made-to-Order & Bridal Trousseau Orders
            </h2>
            <p className="text-sm text-[var(--color-slate)] leading-relaxed">
              Custom-tailored ensembles, custom blouses, and bridal lehengas require bespoke hand-embroidery and zari finishing. These pieces have an atelier creation window of <strong className="text-[var(--color-ink)]">10 to 14 business days</strong> before dispatch. You will receive progress photographs and status updates via WhatsApp from designer Vidhya's concierge team.
            </p>
          </section>

          <hr className="border-[#EAE4D9]" />

          <section className="space-y-3">
            <h2 className="font-serif text-xl text-[var(--color-ink)] font-medium">
              3. Cash on Delivery (COD) Guidelines
            </h2>
            <p className="text-sm text-[var(--color-slate)] leading-relaxed">
              Cash on Delivery is available across 19,000+ Indian pin codes for orders up to ₹10,000. For security and authentic verification, our automated concierge will send an OTP confirmation via SMS/WhatsApp prior to warehouse dispatch.
            </p>
          </section>

          <hr className="border-[#EAE4D9]" />

          <section className="space-y-3">
            <h2 className="font-serif text-xl text-[var(--color-ink)] font-medium">
              4. International Worldwide Shipping
            </h2>
            <p className="text-sm text-[var(--color-slate)] leading-relaxed">
              We ship to over 50 countries including the United States, United Kingdom, Canada, UAE, Singapore, and Australia. International orders are dispatched via DHL Express or FedEx International Priority (typically 5 to 8 business days). Customs duties or local import taxes, if applicable in your jurisdiction, are determined by destination customs authorities.
            </p>
          </section>

          <hr className="border-[#EAE4D9]" />

          <section className="space-y-3">
            <h2 className="font-serif text-xl text-[var(--color-ink)] font-medium">
              5. Tamper-Proof Luxury Packaging & Insurance
            </h2>
            <p className="text-sm text-[var(--color-slate)] leading-relaxed">
              Every garment is packed in breathable cotton muslin dust bags, encased in rigid magnetic keepsake boxes with branded tamper-evident security tape. All parcels are 100% insured until signed by you upon delivery.
            </p>
          </section>

        </div>

        {/* Assistance CTA */}
        <div className="mt-10 rounded-xl bg-[#FAF8F5] border border-[#E5DECF] p-6 text-center space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-gold)]">
            Need urgent event delivery?
          </p>
          <h3 className="font-serif text-xl text-[var(--color-ink)]">
            Speak with Vidhya's Concierge for Same-Day / Express Priority
          </h3>
          <p className="text-xs text-[var(--color-slate)] max-w-lg mx-auto">
            If you need your ensemble delivered urgently for a wedding, pooja, or festive gathering, reach out directly and we will coordinate priority flight dispatch.
          </p>
          <div className="pt-2 flex justify-center gap-4">
            <a
              href="https://wa.me/919876543210?text=Hi%20Vidhya,%20I%20have%20an%20urgent%20event%20shipping%20query."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[var(--color-ink)] text-white text-xs font-medium tracking-wide hover:bg-[#25221E] transition-colors"
            >
              WhatsApp Priority Dispatch Desk
            </a>
            <Link
              href="/track-order"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white border border-[#E5DFD5] text-xs font-medium text-[var(--color-ink)] hover:border-[var(--color-gold)] transition-colors"
            >
              Track Your Live Order
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
