'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Accordion } from '@/components/ui/Accordion';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils/cn';

const faqCategories = [
  { id: 'orders', label: 'Orders & Payments', icon: '📦' },
  { id: 'shipping', label: 'Shipping & Delivery', icon: '🚚' },
  { id: 'returns', label: 'Returns & Exchanges', icon: '↩️' },
  { id: 'sizing', label: 'Sizing & Fit', icon: '📏' },
  { id: 'products', label: 'Products & Care', icon: '🧵' },
  { id: 'account', label: 'Account & Loyalty', icon: '👤' },
  { id: 'custom', label: 'Custom & Wholesale', icon: '✨' },
];

const faqs = {
  orders: [
    {
      q: 'What payment methods do you accept?',
      a: 'We accept all major credit/debit cards, UPI (GPay, PhonePe, Paytm), net banking, wallets, and Cash on Delivery (up to ₹5,000). For international orders, we accept cards via Stripe and PayPal. EMI options available on orders above ₹3,000.',
    },
    {
      q: 'Is Cash on Delivery available everywhere?',
      a: 'COD is available in 25,000+ pincodes across India for orders up to ₹5,000. A COD fee of ₹50 applies. Check availability at checkout by entering your pincode.',
    },
    {
      q: 'Can I modify or cancel my order after placing it?',
      a: 'Yes, within 2 hours of placing the order. After that, it may have already been processed for shipping. Contact us immediately via WhatsApp - we\'ll do our best to help.',
    },
    {
      q: 'Do you offer gift wrapping?',
      a: 'Yes! Gift wrapping is complimentary on all orders. Add a personal note at checkout. For special occasions, we offer premium gift boxes (₹199) with tissue paper, ribbon, and a handwritten card.',
    },
    {
      q: 'My payment failed but money was deducted. What now?',
      a: 'This is usually a temporary bank hold that releases within 24-48 hours. If not resolved in 2 days, contact us with your order ID and we\'ll escalate with our payment partner.',
    },
  ],
  shipping: [
    {
      q: 'What are your shipping charges?',
      a: 'Free shipping on orders ₹2,999+ within India. Below that, it\'s ₹99. International shipping starts at $15, free on orders $300+. Express delivery (1-2 days) available in major metros for ₹199.',
    },
    {
      q: 'How long does delivery take?',
      a: 'India: 2-5 business days (1-2 days in major metros). International: 5-10 business days via DHL Express. Custom/stitch-to-order items take 2-3 weeks - timeline shown on product page.',
    },
    {
      q: 'Can I change my delivery address after ordering?',
      a: 'Yes, if the order hasn\'t shipped yet. Contact us immediately on WhatsApp with your order ID and new address. Once shipped, we can\'t redirect but you can reschedule delivery with the courier.',
    },
    {
      q: 'Do you ship to PO Boxes / APO addresses?',
      a: 'We cannot ship to PO Boxes or APO/FPO addresses as our courier partners require a physical address with a contact number for delivery.',
    },
    {
      q: 'What if I\'m not home during delivery?',
      a: 'Our courier partners make 2 delivery attempts. If both fail, the package goes to the local hub for 5 days pickup. You\'ll receive SMS/email with hub details. Contact us to reschedule.',
    },
  ],
  returns: [
    {
      q: 'What is your return policy?',
      a: '15-day hassle-free returns for unworn items with original tags and packaging. Free pickup in India. Refund to original payment method within 5-7 days of receiving the return.',
    },
    {
      q: 'Are sale items returnable?',
      a: 'Items at 50%+ off (marked "Final Sale") are non-returnable. Other sale items (under 50% off) follow our standard 15-day return policy.',
    },
    {
      q: 'How do I initiate a return?',
      a: 'Go to your Account → Orders → Select order → Click "Return". Choose items, reason, and pickup date. Our courier will collect within 48 hours. Or WhatsApp us - we\'ll handle it.',
    },
    {
      q: 'What about exchanges?',
      a: 'Exchanges for size/color are free and prioritized. Select "Exchange" during return initiation. We\'ll ship the new item as soon as the return is scanned by the courier.',
    },
    {
      q: 'I received a damaged/incorrect item. What should I do?',
      a: 'We\'re so sorry! Please WhatsApp us a photo within 24 hours of delivery. We\'ll arrange immediate replacement (no return needed for damaged items) and a goodwill gesture.',
    },
  ],
  sizing: [
    {
      q: 'How do I find my size?',
      a: 'Use our Size Finder tool - enter your bust, waist, hips measurements and get personalized recommendations for each category. Or chat with Meera on WhatsApp for a guided session.',
    },
    {
      q: 'Do your sizes run true to size?',
      a: 'Our sizing follows standard Indian measurements. However, handcrafted pieces may have 0.5-1" variation. The Size Finder accounts for this. When in doubt, size up for comfort.',
    },
    {
      q: 'Can I get a custom size?',
      a: 'Yes! We offer made-to-measure on most kurtis, salwars, and lehengas. Additional ₹500-1,500 depending on complexity. 2-3 week lead time. Book a consultation via WhatsApp.',
    },
    {
      q: 'What if the size doesn\'t fit?',
      a: 'Free size exchanges within 15 days. We\'ll ship the new size as soon as the return is picked up. No questions asked - we want you to love the fit.',
    },
    {
      q: 'Do you have plus sizes?',
      a: 'Yes, up to 3XL (bust 44") in most categories. We\'re expanding to 4XL. Use the Size Finder - it works for all sizes. Custom sizing available beyond 3XL.',
    },
  ],
  products: [
    {
      q: 'Are your fabrics authentic?',
      a: 'Absolutely. We source directly from artisan clusters: Banarasi silk from Varanasi, Chanderi from Madhya Pradesh, Bandhani from Gujarat/Kutch, block prints from Rajasthan. Each piece comes with an artisan story card.',
    },
    {
      q: 'How do I care for silk/embroidered pieces?',
      a: 'Dry clean only for silk, zari, and heavy embroidery. Cotton/linen: gentle machine wash cold, line dry in shade. Avoid direct sunlight for colors. Care label inside each garment.',
    },
    {
      q: 'Will the color match the website photos?',
      a: 'We photograph in natural light with color-calibrated equipment. However, screen calibration varies. For critical color matching (weddings), order a fabric swatch (₹99, refundable on purchase).',
    },
    {
      q: 'Are pieces exactly as shown?',
      a: 'Handcrafted pieces have slight variations - that\'s the beauty of artisan work. Motif placement, color intensity, and embroidery density may vary slightly. No two pieces are identical.',
    },
    {
      q: 'Do you restock sold-out items?',
      a: 'Most designs are limited edition. Popular basics (solid kurtis, plain dupattas) are restocked. Sign up for "Notify Me" on the product page. Vidhya\'s Notes subscribers get early restock alerts.',
    },
  ],
  account: [
    {
      q: 'How do I create an account?',
      a: 'Click "Account" → "Sign Up". Use email or phone. No password needed - we send a magic link/OTP. Accounts unlock: order tracking, wishlist, size profile, loyalty points, early sale access.',
    },
    {
      q: 'What is Angelika Circle loyalty program?',
      a: 'Free to join. Earn 5 points per ₹100 spent. Tiers: Silver (0 pts), Gold (1,000 pts), Platinum (5,000 pts). Benefits: cashback, free shipping, early access, birthday gifts, personal styling. Points never expire.',
    },
    {
      q: 'How do I redeem loyalty points?',
      a: 'Go to Account → Loyalty. Redeem 500 pts = ₹100 off, 1,000 pts = ₹250 off, 2,500 pts = free express shipping (1 year), 5,000 pts = personal styling session with Vidhya.',
    },
    {
      q: 'Can I delete my account?',
      a: 'Yes, in Account → Profile → Danger Zone. This permanently removes your data. Order history is retained for legal compliance but anonymized. Contact us if you need assistance.',
    },
  ],
  custom: [
    {
      q: 'Do you offer custom designs?',
      a: 'Yes! Two options: Semi-custom (color/fabric changes on existing designs, +₹500-2,000, 2 weeks) and Fully custom (from your sketch/inspiration, +₹3,000+, 3-4 weeks). Book a WhatsApp consultation.',
    },
    {
      q: 'Can you replicate a design I saw elsewhere?',
      a: 'We can create inspired-by pieces but don\'t copy other designers\' work. Share your inspiration photos - Vidhya will design something unique incorporating those elements.',
    },
    {
      q: 'Do you accept wholesale/bulk orders?',
      a: 'Yes, for boutiques, stylists, and corporate gifting. Minimum 10 pieces. 20-30% off MRP depending on volume. 4-6 week lead time. Email wholesale@angelikafashions.com with requirements.',
    },
    {
      q: 'Can I order matching outfits for a group?',
      a: 'Absolutely! Popular for bridesmaid lehengas, family function coordination. We ensure color consistency across sizes. Group discount: 10% off 5+ pieces, 15% off 10+. WhatsApp us to coordinate.',
    },
  ],
};

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState('orders');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFAQs = faqs[activeCategory as keyof typeof faqs]?.filter(faq =>
    faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.a.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="min-h-screen bg-[var(--color-white)]">
      {/* Hero */}
      <section className="bg-[var(--color-snow)] border-b border-[var(--color-whisper)] py-16">
        <div className="container-custom px-6">
          <motion.div
            className="max-w-3xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="inline-block px-4 py-1 bg-[var(--color-gold-light)] text-[var(--color-gold)] text-sm font-semibold rounded-[var(--radius-full)] mb-4">
              HELP CENTER
            </span>
            <h1 className="text-[var(--font-display)] text-4xl md:text-5xl font-medium text-[var(--color-ink)] leading-tight mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-[var(--color-slate)] text-lg leading-relaxed">
              Quick answers to common questions. Can't find what you need? Chat with Vidhya or Meera on WhatsApp - they respond within hours.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Search & Categories */}
      <section className="py-8 bg-[var(--color-white)] border-b border-[var(--color-whisper)] sticky top-[72px] z-10">
        <div className="container-custom px-6">
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="relative">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--color-mist)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              <Input
                type="search"
                placeholder="Search questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12"
                aria-label="Search FAQs"
              />
            </div>
            <div className="flex flex-wrap gap-2 justify-center" role="tablist" aria-label="FAQ Categories">
              {faqCategories.map((cat) => (
                <Button
                  key={cat.id}
                  variant={activeCategory === cat.id ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => { setActiveCategory(cat.id); setSearchQuery(''); }}
                  role="tab"
                  aria-selected={activeCategory === cat.id}
                  className="gap-2 rounded-[var(--radius-full)] whitespace-nowrap"
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ List */}
      <section className="py-12">
        <div className="container-custom px-6">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {filteredFAQs.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="h-16 w-16 mx-auto text-[var(--color-mist)] mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                    <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <h3 className="text-[var(--font-display)] text-xl text-[var(--color-ink)] mb-2">No Results Found</h3>
                  <p className="text-[var(--color-slate)] mb-4">Try a different search term or browse all categories.</p>
                  <Button variant="outline" onClick={() => setSearchQuery('')}>Clear Search</Button>
                </div>
              ) : (
                <Accordion
                  items={filteredFAQs.map((faq, index) => ({
                    id: `${activeCategory}-${index}`,
                    title: faq.q,
                    content: <p className="text-[var(--color-slate)] leading-relaxed">{faq.a}</p>,
                  }))}
                  allowMultiple
                  variant="bordered"
                  className="space-y-3"
                />
              )}
            </motion.div>

            {/* Still need help */}
            <motion.div
              className="mt-12 p-8 bg-[var(--color-ink)] rounded-[var(--radius-2xl)] text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h3 className="text-[var(--font-display)] text-2xl font-medium text-[var(--color-white)] mb-3">Still Need Help?</h3>
              <p className="text-[var(--color-white)]/70 mb-6 max-w-md mx-auto">Couldn't find your answer? Our team is here for you. No bots, no tickets - just real people who care.</p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button variant="primary" size="lg" asChild>
                  <a href="https://wa.me/91XXXXXXXXXX?text=Hi%20Vidhya,%20I%20have%20a%20question" target="_blank" rel="noopener noreferrer">
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.48-1.653-1.653-.173-.173-.447-.298-.644-.075-.198.199-.867.868-.967 1.164-.199.297-.247.496-.15.67.098.272.816.99 1.065 1.28.148.198.298.347.496.471.198.198.471.297.67.149l.767-.693c.272-.248.495-.373.57-.373.148 0 .297.149.372.373.149.423.448 1.272.94 1.988.463.68 1.255 1.165 1.475 1.288.198.124.272.223.397.198.149-.025.422-.248.57-.471.148-.223.172-.57.074-.766-.124-.198-.522-.692-1.018-1.307-.448-.57-1.14-1.294-1.717-1.815-.547-.5-.838-.766-.966-.866-.128-.099-.273-.099-.423 0-.15.074-.322.223-.495.372-.173.149-.347.198-.52.198-.174 0-.347-.099-.52-.247-.173-.148-.322-.247-.495-.247-.199 0-.372.098-.52.247l-.645.618c-.15.148-.173.297-.024.471.1.1.247.223.372.322.15.1.323.149.496.149.199 0 .397-.05.546-.149.148-.099.247-.248.296-.423.048-.173 0-.397-.024-.57-.024-.173-.024-.347-.074-.52-.149zM20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                    WhatsApp Us
                  </a>
                </Button>
                <Button variant="outline" size="lg" className="border-[var(--color-gold)] text-[var(--color-gold)] hover:bg-[var(--color-gold)] hover:text-[var(--color-ink)]" asChild>
                  <a href="mailto:hello@angelikafashions.com">Email Us</a>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <a href="/contact">Contact Form</a>
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}

