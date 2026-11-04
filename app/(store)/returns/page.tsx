import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Returns & Size Exchanges | Angelika Fashions',
  description: 'Our 7-day complimentary size exchange and return policy for handcrafted Indian luxury ethnic wear.',
};

export default function ReturnsPolicyPage() {
  return (
    <div className="min-h-screen bg-[#FAF8F5] py-12 md:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Breadcrumb & Title */}
        <div className="mb-10 text-center sm:text-left">
          <nav className="text-xs text-[var(--color-slate)] mb-3 flex items-center justify-center sm:justify-start gap-2" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-[var(--color-gold)] transition-colors">Home</Link>
            <span>/</span>
            <span className="text-[var(--color-ink)] font-medium">Returns & Exchanges</span>
          </nav>
          <span className="text-[11px] font-semibold tracking-[0.24em] uppercase text-[var(--color-gold)] block mb-1">
            7-Day Complimentary Assurance
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-[var(--color-ink)] font-normal tracking-tight">
            Returns & Size Exchanges
          </h1>
          <p className="mt-2 text-sm text-[var(--color-slate)] max-w-2xl font-light leading-relaxed">
            We want you to feel extraordinary in every Angelika ensemble. If the fit isn't immaculate, our atelier provides seamless doorstep size exchanges and easy returns.
          </p>
        </div>

        {/* 3 Step Exchange Process Card */}
        <div className="mb-10 rounded-2xl bg-[#FCFAF7] border border-[#E5DECF] p-6 sm:p-8 shadow-[0_4px_20px_rgba(201,168,76,0.06)]">
          <h3 className="font-serif text-lg text-[var(--color-ink)] font-normal mb-6 text-center">
            How Our 3-Step Size Exchange Works
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-full bg-[var(--color-gold-light)] text-[var(--color-gold)] font-serif font-bold text-base flex items-center justify-center mx-auto border border-[var(--color-gold)]/30">
                1
              </div>
              <h4 className="font-semibold text-xs text-[var(--color-ink)] uppercase tracking-wider">
                Initiate in 30 Seconds
              </h4>
              <p className="text-xs text-[var(--color-slate)] leading-relaxed">
                Connect with Vidhya's WhatsApp Concierge or visit your Account orders page within 7 days of delivery.
              </p>
            </div>

            <div className="space-y-2 sm:border-x sm:border-[#EAE4D9] sm:px-4">
              <div className="w-10 h-10 rounded-full bg-[var(--color-gold-light)] text-[var(--color-gold)] font-serif font-bold text-base flex items-center justify-center mx-auto border border-[var(--color-gold)]/30">
                2
              </div>
              <h4 className="font-semibold text-xs text-[var(--color-ink)] uppercase tracking-wider">
                Complimentary Pickup
              </h4>
              <p className="text-xs text-[var(--color-slate)] leading-relaxed">
                Our courier will collect the unworn garment from your doorstep with original tags and dust bag intact.
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-10 h-10 rounded-full bg-[var(--color-gold-light)] text-[var(--color-gold)] font-serif font-bold text-base flex items-center justify-center mx-auto border border-[var(--color-gold)]/30">
                3
              </div>
              <h4 className="font-semibold text-xs text-[var(--color-ink)] uppercase tracking-wider">
                Fresh Size Dispatched
              </h4>
              <p className="text-xs text-[var(--color-slate)] leading-relaxed">
                Your replacement size or custom tailored fit is dispatched via express courier with zero additional shipping charges.
              </p>
            </div>
          </div>
        </div>

        {/* Detailed Policy Accordions / Content */}
        <div className="space-y-8 bg-white border border-[#EAE4D9] rounded-2xl p-6 sm:p-10 shadow-xs">
          
          <section className="space-y-3">
            <h2 className="font-serif text-xl text-[var(--color-ink)] font-medium">
              1. 7-Day Exchange Window
            </h2>
            <p className="text-sm text-[var(--color-slate)] leading-relaxed">
              You may initiate a size exchange or return within <strong>7 calendar days</strong> from the date of confirmed delivery. To be eligible, the piece must be in its original pristine condition, unworn, unwashed, unaltered, and accompanied by the original Silk Mark / brand tags and cotton dust bag.
            </p>
          </section>

          <hr className="border-[#EAE4D9]" />

          <section className="space-y-3">
            <h2 className="font-serif text-xl text-[var(--color-ink)] font-medium">
              2. Custom Stitching & Blouse Alterations
            </h2>
            <p className="text-sm text-[var(--color-slate)] leading-relaxed">
              If you ordered custom-stitched blouses or bespoke waist adjustments and require fine-tuning, our master tailors provide <strong className="text-[var(--color-ink)]">one round of complimentary alterations</strong>. Simply share your updated measurements or photographs with Vidhya on WhatsApp.
            </p>
          </section>

          <hr className="border-[#EAE4D9]" />

          <section className="space-y-3">
            <h2 className="font-serif text-xl text-[var(--color-ink)] font-medium">
              3. Refund Options
            </h2>
            <p className="text-sm text-[var(--color-slate)] leading-relaxed">
              If you prefer a return rather than a size exchange:
            </p>
            <ul className="text-sm text-[var(--color-slate)] list-disc pl-5 space-y-1.5 mt-2">
              <li>
                <strong className="text-[var(--color-ink)]">Atelier Store Credit (Recommended):</strong> Receive 100% of your order value as lifelong store credit plus a bonus 10% styling credit for your next order.
              </li>
              <li>
                <strong className="text-[var(--color-ink)]">Original Payment Source:</strong> Refunds to original debit/credit cards or net banking are processed within 3 to 5 business days following quality verification at our atelier.
              </li>
            </ul>
          </section>

          <hr className="border-[#EAE4D9]" />

          <section className="space-y-3">
            <h2 className="font-serif text-xl text-[var(--color-ink)] font-medium">
              4. Non-Returnable Items
            </h2>
            <p className="text-sm text-[var(--color-slate)] leading-relaxed">
              Due to hygiene considerations and authentic artisan uniqueness, customized bridal couture made strictly to custom body measurements and final archive sale items marked as "Final Sale" cannot be refunded, though size adjustments can still be arranged.
            </p>
          </section>

        </div>

        {/* Quick CTA */}
        <div className="mt-10 rounded-xl bg-[#FAF8F5] border border-[#E5DECF] p-6 text-center space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-gold)]">
            Ready to exchange a size?
          </p>
          <h3 className="font-serif text-xl text-[var(--color-ink)]">
            Our Concierge Team Handles the Whole Process For You
          </h3>
          <p className="text-xs text-[var(--color-slate)] max-w-lg mx-auto">
            You don't need to fill out complex forms. Just drop a message with your Order ID and preferred size.
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-4">
            <a
              href="https://wa.me/919876543210?text=Hi%20Vidhya,%20I%20would%20like%20to%20request%20a%20size%20exchange%20for%20my%20order."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[var(--color-ink)] text-white text-xs font-medium tracking-wide hover:bg-[#25221E] transition-colors"
            >
              Start Size Exchange on WhatsApp
            </a>
            <Link
              href="/size-finder"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white border border-[#E5DFD5] text-xs font-medium text-[var(--color-ink)] hover:border-[var(--color-gold)] transition-colors"
            >
              Use Interactive Size Finder
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
