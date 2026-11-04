'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Checkbox } from '@/components/ui/Checkbox';
import { cn } from '@/lib/utils/cn';
import { ToastProvider, useToastHelpers } from '@/components/ui/Toast';

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  newsletter: boolean;
}

export default function ContactPage() {
  const { success, error } = useToastHelpers();

  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    newsletter: false,
  } as ContactFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData['name']?.trim()) newErrors['name'] = 'Name is required';
    if (!formData['email']?.trim()) newErrors['email'] = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData['email'] || '')) newErrors['email'] = 'Please enter a valid email';
    if (!formData['phone']?.trim()) newErrors['phone'] = 'Phone number is required';
    else if (!/^[\d\s\-\+\(\)]{10,}$/.test(formData['phone'] || '')) newErrors['phone'] = 'Please enter a valid phone number';
    if (!formData['subject']) newErrors['subject'] = 'Please select a subject';
    if (!formData['message']?.trim()) newErrors['message'] = 'Message is required';
    else if (formData['message']?.trim().length < 20) newErrors['message'] = 'Message must be at least 20 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitStatus('idle');

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    // In real app: await fetch('/api/contact', { method: 'POST', body: JSON.stringify(formData) });

    setIsSubmitting(false);
    setSubmitStatus('success');
    setFormData({ name: '', email: '', phone: '', subject: '', message: '', newsletter: false });

    success('Message Sent', 'Thank you for reaching out! Vidhya or Meera will respond within 24 hours.');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    if (errors[name as string]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const contactOptions = [
    {
      icon: (
        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      ),
      title: 'Visit Our Studio',
      description: 'By appointment only',
      detail: 'Indiranagar, Bangalore\nMon-Sat: 11 AM - 7 PM',
      cta: 'Book Appointment',
      href: '/book-appointment',
    },
    {
      icon: (
        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
          <path d="M22 6l-10 7L2 6" />
        </svg>
      ),
      title: 'Email Us',
      description: 'Response within 24 hours',
      detail: 'hello@angelikafashions.com\nstyling@angelikafashions.com',
      cta: 'Write Email',
      href: 'mailto:hello@angelikafashions.com',
    },
    {
      icon: (
        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
      ),
      title: 'Call / WhatsApp',
      description: 'Mon-Sat: 10 AM - 8 PM',
      detail: '+91 98765 43210\n+91 87654 32109',
      cta: 'Chat on WhatsApp',
      href: 'https://wa.me/919876543210',
      isWhatsApp: true,
    },
  ];

  const subjects = [
    { value: '', label: 'Select a topic' },
    { value: 'styling', label: 'Styling Advice' },
    { value: 'sizing', label: 'Size & Fit Guidance' },
    { value: 'order', label: 'Order Inquiry' },
    { value: 'return', label: 'Returns & Exchange' },
    { value: 'wholesale', label: 'Wholesale / Bulk Orders' },
    { value: 'artisan', label: 'Artisan Collaboration' },
    { value: 'media', label: 'Press & Media' },
    { value: 'career', label: 'Careers' },
    { value: 'other', label: 'Other' },
  ];

  const faqs = [
    {
      q: 'How can I get styling advice for an upcoming event?',
      a: 'You can book a free virtual styling session with Vidhya or Meera via WhatsApp. Share your event details, photos of the venue/outfit inspiration, and we\'ll curate 3-5 complete looks for you within 24 hours.',
    },
    {
      q: 'Do you ship internationally?',
      a: 'Yes, we ship to 25+ countries via DHL Express. International orders typically arrive in 5-7 business days. Duties and taxes are calculated at checkout. Free shipping on orders above $300 USD.',
    },
    {
      q: 'What is your return policy?',
      a: '15-day hassle-free returns for unworn items with original tags. Free pickup in India. For international returns, we provide a prepaid label and refund minus a $15 restocking fee. Custom/stitch-to-order items are non-returnable.',
    },
    {
      q: 'Can I customize a design?',
      a: 'Absolutely! We offer semi-custom (color/fabric changes on existing designs) and fully custom (from sketch to stitch). Minimum 3-week lead time. Book a consultation via WhatsApp to discuss.',
    },
    {
      q: 'How do I know my size?',
      a: 'Use our Size Finder tool - it takes 2 minutes and gives you personalized recommendations based on your measurements. Or chat with Meera on WhatsApp for a guided session.',
    },
    {
      q: 'Do you have a physical store?',
      a: 'We have an experience studio in Indiranagar, Bangalore - by appointment only. This ensures you get undivided attention and can try pieces at your own pace. Book via the "Book Appointment" link above.',
    },
  ];

  return (
    <ToastProvider>
      <div className="min-h-screen bg-[var(--color-white)]">
        {/* Page Header */}
      <section className="bg-[var(--color-snow)] border-b border-[var(--color-whisper)] py-16">
        <div className="container-custom px-6">
          <motion.div
            className="max-w-3xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="inline-block px-4 py-1 bg-[var(--color-gold-light)] text-[var(--color-gold)] text-sm font-semibold rounded-[var(--radius-full)] mb-4">
              GET IN TOUCH
            </span>
            <h1 className="text-[var(--font-display)] text-4xl md:text-5xl font-medium text-[var(--color-ink)] leading-tight mb-4">
              We\'d Love to Hear from You
            </h1>
            <p className="text-[var(--color-slate)] text-lg leading-relaxed">
              Whether you need styling advice, have a question about an order, or just want to say hello -
              Vidhya, Meera, and the team are here for you. No bots, no ticket numbers, just real people.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Options */}
      <section className="py-16 bg-[var(--color-white)]">
        <div className="container-custom px-6">
          <motion.div
            className="grid md:grid-cols-3 gap-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            {contactOptions.map((option, index) => (
              <motion.article
                key={option.title}
                className="p-8 bg-[var(--color-white)] border border-[var(--color-whisper)] rounded-[var(--radius-2xl)] hover:shadow-[var(--shadow-xl)] hover:border-[var(--color-gold)]/30 transition-all duration-500 h-full flex flex-col"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <div className="w-14 h-14 rounded-[var(--radius-xl)] bg-[var(--color-gold-light)] flex items-center justify-center text-[var(--color-gold)] mb-6">
                  {option.icon}
                </div>
                <h3 className="text-[var(--font-display)] text-xl font-medium text-[var(--color-ink)] mb-2">
                  {option.title}
                </h3>
                <p className="text-[var(--color-slate)] text-sm mb-3">{option.description}</p>
                <p className="text-[var(--color-ink)] font-medium whitespace-pre-line mb-6 flex-1">{option.detail}</p>
                <Button
                  variant={option.isWhatsApp ? 'whatsapp' : 'primary'}
                  className="w-full"
                  asChild
                >
                  <a href={option.href} target={option.isWhatsApp ? '_blank' : undefined} rel={option.isWhatsApp ? 'noopener noreferrer' : undefined}>
                    {option.cta}
                  </a>
                </Button>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-16 bg-[var(--color-snow)]">
        <div className="container-custom px-6">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Form */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Card variant="elevated" padding="none" className="overflow-hidden">
                <CardHeader className="p-8 border-b border-[var(--color-whisper)]">
                  <CardTitle className="text-[var(--font-display)] text-2xl">Send Us a Message</CardTitle>
                  <p className="text-[var(--color-slate)] mt-2">We typically respond within 4 hours during business hours.</p>
                </CardHeader>
                <CardContent className="p-8">
                  {submitStatus === 'success' ? (
                    <motion.div
                      className="text-center py-12"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[var(--color-success-bg)] flex items-center justify-center">
                        <svg className="h-10 w-10 text-[var(--color-success)]" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <h3 className="text-[var(--font-display)] text-2xl text-[var(--color-ink)] mb-2">Message Sent!</h3>
                      <p className="text-[var(--color-slate)] mb-6">Thank you for reaching out. We\'ll get back to you within 24 hours.</p>
                      <Button variant="outline" onClick={() => setSubmitStatus('idle')}>Send Another Message</Button>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                      <div className="grid sm:grid-cols-2 gap-6">
                        <div>
                          <label htmlFor="name" className="input-label">Full Name *</label>
                          <Input
                            id="name"
                            name="name"
                            value={formData.name || ''}
                            onChange={handleChange}
                            error={errors['name']}
                            placeholder="Your name"
                            autoComplete="name"
                          />
                        </div>
                        <div>
                          <label htmlFor="email" className="input-label">Email Address *</label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email || ''}
                            onChange={handleChange}
                            error={errors['email']}
                            placeholder="you@example.com"
                            autoComplete="email"
                          />
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-6">
                        <div>
                          <label htmlFor="phone" className="input-label">Phone Number *</label>
                          <Input
                            id="phone"
                            name="phone"
                            type="tel"
                            value={formData.phone || ''}
                            onChange={handleChange}
                            error={errors['phone']}
                            placeholder="+91 98765 43210"
                            autoComplete="tel"
                          />
                        </div>
                        <div>
                          <label htmlFor="subject" className="input-label">Subject *</label>
                          <Select
                            value={formData.subject || ''}
                            onValueChange={(value) => setFormData(prev => ({ ...prev, subject: value }))}
                            error={!!errors['subject']}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select a topic" />
                            </SelectTrigger>
                            <SelectContent>
                              {subjects.map((s) => (
                                <SelectItem key={s.value} value={s.value} disabled={!s.value}>
                                  {s.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <label htmlFor="message" className="input-label">Message *</label>
                        <Textarea
                          id="message"
                          name="message"
                          value={formData.message || ''}
                          onChange={handleChange}
                          error={errors['message']}
                          placeholder="Tell us how we can help... (minimum 20 characters)"
                          rows={5}
                          className="resize-y"
                        />
                      </div>

                      <div className="flex items-start gap-3">
                        <Checkbox
                          id="newsletter"
                          name="newsletter"
                          checked={formData.newsletter || false}
                          onChange={handleChange}
                          label="Subscribe to Vidhya's monthly style notes & early access invites"
                        />
                      </div>

                      <Button
                        variant="primary"
                        type="submit"
                        className="w-full py-4 text-lg"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <span className="flex items-center justify-center gap-2">
                            <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                              <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                              <path d="M12 2a10 10 0 0 1 10 10" strokeOpacity="1" />
                            </svg>
                            Sending...
                          </span>
                        ) : (
                          'Send Message'
                        )}
                      </Button>

                      <p className="text-xs text-[var(--color-mist)] text-center">
                        By submitting, you agree to our <a href="/privacy" className="underline hover:text-[var(--color-ink)]">Privacy Policy</a> and <a href="/terms" className="underline hover:text-[var(--color-ink)]">Terms of Service</a>.
                      </p>
                    </form>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Info & FAQ */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <Card variant="elevated" padding="lg">
                <CardTitle className="text-[var(--font-display)] text-xl mb-6">Quick Answers</CardTitle>
                <div className="space-y-4 mb-8">
                  {faqs.slice(0, 3).map((faq, index) => (
                    <details key={index} className="group border border-[var(--color-whisper)] rounded-[var(--radius-lg)] overflow-hidden">
                      <summary className="p-4 cursor-pointer list-none flex items-center justify-between">
                        <span className="font-medium text-[var(--color-ink)] pr-8">{faq.q}</span>
                        <svg className="h-5 w-5 text-[var(--color-mist)] group-open:rotate-180 transition-transform flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                          <path d="M6 9l6 6 6-6" />
                        </svg>
                      </summary>
                      <div className="px-4 pb-4 text-[var(--color-slate)] text-sm leading-relaxed border-t border-[var(--color-whisper)]">
                        {faq.a}
                      </div>
                    </details>
                  ))}
                </div>
                <Button variant="outline" className="w-full" asChild>
                  <a href="/faq">View All FAQs ({faqs.length} questions)</a>
                </Button>
              </Card>

              {/* Social Proof */}
              <Card variant="outlined" padding="lg" className="mt-6">
                <CardTitle className="text-[var(--font-display)] text-xl mb-4">Why Customers Love Us</CardTitle>
                <div className="space-y-4">
                  {[
                    { text: '"Meera helped me find the perfect lehenga for my sister\'s wedding over WhatsApp. Felt like shopping with a friend."', author: 'Priya K., Delhi' },
                    { text: '"The styling session was a game-changer. Vidhya curated 5 looks for my engagement - I wore one, gifted the others!"', author: 'Ananya S., Mumbai' },
                    { text: '"Return process was seamless. Pickup arranged next day, refund in 48 hours. No questions asked."', author: 'Rashmi T., Bangalore' },
                  ].map((review, i) => (
                    <motion.div
                      key={i}
                      className="p-4 bg-[var(--color-snow)] rounded-[var(--radius-lg)]"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.2 + i * 0.1 }}
                    >
                      <p className="text-[var(--color-ink)] mb-2 italic">"{review.text}"</p>
                      <p className="text-sm text-[var(--color-slate)]">— {review.author}</p>
                    </motion.div>
                  ))}
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="py-16 bg-[var(--color-ink)]">
        <div className="container-custom px-6">
          <motion.div
            className="max-w-3xl mx-auto text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-[var(--font-display)] text-3xl md:text-4xl font-medium text-[var(--color-white)] mb-4">
              Join Vidhya\'s Inner Circle
            </h2>
            <p className="text-[var(--color-white)]/70 text-lg mb-8">
              Monthly style edits, early access to new collections, artisan stories, and exclusive offers.
              No spam, just love. 15,000+ women already subscribed.
            </p>
            <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto" onSubmit={(e) => { e.preventDefault(); success('Subscribed!', 'Welcome to the circle! Check your inbox for a welcome gift.'); }}>
              <Input
                type="email"
                placeholder="Enter your email"
                className="flex-1"
                aria-label="Email for newsletter"
              />
              <Button variant="primary" type="submit" className="whitespace-nowrap">
                Subscribe
              </Button>
            </form>
            <p className="text-xs text-[var(--color-white)]/40 mt-4">By subscribing, you agree to our <a href="/privacy" className="underline">Privacy Policy</a>. Unsubscribe anytime.</p>
          </motion.div>
        </div>
      </section>
    </div>
  </ToastProvider>
);
}

