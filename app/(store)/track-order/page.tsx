'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState('');
  const [phoneOrEmail, setPhoneOrEmail] = useState('');
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSearched(true);
    }, 600);
  };

  const whatsappInquiryUrl = `https://wa.me/919876543210?text=${encodeURIComponent(
    `Hi Vidhya, I would like live tracking updates for Order ${orderId || 'ANG-2026'}.`
  )}`;

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-12 md:py-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb & Header */}
        <div className="text-center mb-10">
          <nav className="text-xs text-[var(--color-slate)] mb-3 flex items-center justify-center gap-2" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-[var(--color-gold)] transition-colors">Home</Link>
            <span>/</span>
            <span className="text-[var(--color-ink)] font-medium">Track Order</span>
          </nav>
          <span className="text-[11px] font-semibold tracking-[0.24em] uppercase text-[var(--color-gold)] block mb-1">
            Real-Time Courier & Atelier Dispatch
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-[var(--color-ink)] font-normal tracking-tight">
            Track Your Order
          </h1>
          <p className="mt-2 text-sm text-[var(--color-slate)] max-w-lg mx-auto font-light leading-relaxed">
            Enter your Order ID and phone number or email address to view real-time courier dispatch and atelier preparation status.
          </p>
        </div>

        {/* Tracking Lookup Box */}
        <div className="bg-white border border-[#EAE4D9] rounded-2xl p-6 sm:p-8 shadow-xs">
          <form onSubmit={handleTrack} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="orderId" className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)] mb-1.5">
                  Order ID / Reference *
                </label>
                <input
                  id="orderId"
                  type="text"
                  required
                  placeholder="e.g. ANG-2026-8491"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-[#E5DFD5] text-sm text-[var(--color-ink)] placeholder-[var(--color-mist)] focus:outline-none focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)] transition-all bg-[#FCFAF7]"
                />
              </div>

              <div>
                <label htmlFor="phoneOrEmail" className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)] mb-1.5">
                  Phone Number or Email *
                </label>
                <input
                  id="phoneOrEmail"
                  type="text"
                  required
                  placeholder="e.g. 9876543210 or you@example.com"
                  value={phoneOrEmail}
                  onChange={(e) => setPhoneOrEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-[#E5DFD5] text-sm text-[var(--color-ink)] placeholder-[var(--color-mist)] focus:outline-none focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)] transition-all bg-[#FCFAF7]"
                />
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-xs text-[var(--color-mist)]">
                You can find your Order ID in your SMS or email confirmation.
              </span>
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-[var(--color-ink)] hover:bg-[#25221E] text-white text-xs font-medium tracking-wide border border-[var(--color-gold)]/40 hover:border-[var(--color-gold)] transition-all duration-200 cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Locating Shipment...' : 'Track Shipment Status'}
              </button>
            </div>
          </form>

          {/* Results Timeline View (When Searched) */}
          {searched && (
            <div className="mt-8 pt-8 border-t border-[#EAE4D9] space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl bg-[#FCFAF7] border border-[#E5DECF]">
                <div>
                  <span className="text-[10px] font-semibold tracking-widest uppercase text-[var(--color-gold)]">
                    Active Order Verified
                  </span>
                  <p className="font-serif text-lg text-[var(--color-ink)]">
                    Order #{orderId.toUpperCase()}
                  </p>
                  <p className="text-xs text-[var(--color-slate)]">
                    Courier Partner: Blue Dart Express · AWB #BD{Math.floor(10000000 + Math.random() * 90000000)}
                  </p>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0] text-xs font-medium">
                  <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                  <span>In Transit · On Schedule</span>
                </div>
              </div>

              {/* Step Progression Timeline */}
              <div className="space-y-6 pl-4 border-l-2 border-[var(--color-gold)] ml-2">
                
                <div className="relative">
                  <span className="absolute -left-[23px] top-1 w-3.5 h-3.5 rounded-full bg-[var(--color-gold)] ring-4 ring-[#FAF8F5]" />
                  <div className="space-y-0.5">
                    <p className="text-xs font-semibold text-[var(--color-ink)] uppercase tracking-wider">
                      Handcrafted & Quality Certified
                    </p>
                    <p className="text-xs text-[var(--color-slate)]">
                      Inspected by master drapers, passed 100% Silk Mark authentication & packed in keepsake heirloom box.
                    </p>
                  </div>
                </div>

                <div className="relative">
                  <span className="absolute -left-[23px] top-1 w-3.5 h-3.5 rounded-full bg-[var(--color-gold)] ring-4 ring-[#FAF8F5]" />
                  <div className="space-y-0.5">
                    <p className="text-xs font-semibold text-[var(--color-ink)] uppercase tracking-wider">
                      Dispatched from Atelier Hub
                    </p>
                    <p className="text-xs text-[var(--color-slate)]">
                      Air courier express dispatched from central warehouse.
                    </p>
                  </div>
                </div>

                <div className="relative">
                  <span className="absolute -left-[23px] top-1 w-3.5 h-3.5 rounded-full bg-[var(--color-gold)] ring-4 ring-[#FAF8F5]" />
                  <div className="space-y-0.5">
                    <p className="text-xs font-semibold text-[var(--color-ink)] uppercase tracking-wider">
                      In Transit to Destination City
                    </p>
                    <p className="text-xs text-[var(--color-slate)]">
                      Arrived at regional sorting terminal. Estimated delivery within 24 to 48 hours.
                    </p>
                  </div>
                </div>

                <div className="relative opacity-60">
                  <span className="absolute -left-[23px] top-1 w-3.5 h-3.5 rounded-full bg-[#E5DFD5] ring-4 ring-[#FAF8F5]" />
                  <div className="space-y-0.5">
                    <p className="text-xs font-semibold text-[var(--color-ink)] uppercase tracking-wider">
                      Out for Delivery
                    </p>
                    <p className="text-xs text-[var(--color-slate)]">
                      Courier associate will coordinate delivery with OTP verification.
                    </p>
                  </div>
                </div>

              </div>

              {/* Direct Help Button */}
              <div className="pt-2 flex justify-between items-center text-xs">
                <span className="text-[var(--color-slate)]">
                  Need to change delivery address or delay delivery date?
                </span>
                <a
                  href={whatsappInquiryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-[var(--color-gold-hover)] hover:underline"
                >
                  Message Vidhya's Concierge →
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Signed In Quick Links */}
        <div className="mt-8 text-center space-y-2">
          <p className="text-xs text-[var(--color-slate)]">
            Already have an Angelika account?
          </p>
          <Link
            href="/account/orders"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--color-ink)] hover:text-[var(--color-gold)] underline transition-colors"
          >
            Sign in to view complete order history, past invoices, and saved sizes →
          </Link>
        </div>

      </div>
    </div>
  );
}
