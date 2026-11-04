'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { getOrderById, convertGuestToAccount } from '@/lib/actions/checkout';
import { formatINR } from '@/lib/utils/currency';

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id');
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // VIP 1-click account conversion state
  const [vipPassword, setVipPassword] = useState('');
  const [vipSubmitting, setVipSubmitting] = useState(false);
  const [vipStatus, setVipStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    // Clear any guest cart from localStorage
    try {
      localStorage.removeItem('guest_cart');
      localStorage.setItem('cart_count', '0');
      window.dispatchEvent(new CustomEvent('cart:updated', { detail: { items: [], totals: { itemCount: 0, total: 0 } } }));
    } catch {
      // Ignore
    }

    async function loadOrder() {
      if (!orderId) {
        setLoading(false);
        return;
      }
      try {
        const data = await getOrderById(orderId);
        if (data) {
          setOrder(data);
        }
      } catch (err) {
        console.error('Failed to load order:', err);
      } finally {
        setLoading(false);
      }
    }

    loadOrder();
  }, [orderId]);

  const copyOrderId = () => {
    const idToCopy = order?.order_number || orderId;
    if (idToCopy) {
      navigator.clipboard.writeText(idToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCreateVipAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vipPassword || vipPassword.length < 6) {
      setVipStatus({ type: 'error', message: 'Password must be at least 6 characters' });
      return;
    }
    const emailToUse = order?.email || order?.shipping_address?.email;
    if (!emailToUse || !orderId) {
      setVipStatus({ type: 'error', message: 'Missing order contact email' });
      return;
    }

    setVipSubmitting(true);
    setVipStatus(null);
    try {
      const res = await convertGuestToAccount({
        orderId,
        email: emailToUse,
        password: vipPassword,
      });

      if (res.success) {
        setVipStatus({
          type: 'success',
          message: '✨ VIP Account Activated! 500 Loyalty points credited. You can now log in anytime to track your orders.',
        });
      } else {
        setVipStatus({ type: 'error', message: res.error || 'Failed to create VIP account' });
      }
    } catch {
      setVipStatus({ type: 'error', message: 'An unexpected error occurred' });
    } finally {
      setVipSubmitting(false);
    }
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  const displayTotal = order?.total_amount
    ? formatINR(order.total_amount)
    : null;

  const orderNumber = order?.order_number || orderId || 'Processing';
  const customerName = order?.shipping_address?.firstName
    ? `${order.shipping_address.firstName} ${order.shipping_address.lastName || ''}`.trim()
    : 'Valued Patron';

  const whatsappMessage = encodeURIComponent(
    `Hello Angelika Atelier Concierge, I would like to track my order ${orderNumber}. Customer: ${customerName}.`
  );

  return (
    <div className="min-h-screen bg-[var(--color-snow)] py-12 px-4 sm:px-6 lg:px-8 print:bg-white print:py-4">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          {/* Animated Luxury Gold Checkmark Badge */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 14, stiffness: 180, delay: 0.1 }}
            className="w-20 h-20 mx-auto rounded-full bg-gradient-to-tr from-[var(--color-gold-hover)] to-[var(--color-gold)] flex items-center justify-center shadow-xl shadow-[var(--color-gold)]/25 mb-6 relative print:hidden"
          >
            <motion.svg
              className="w-10 h-10 text-[var(--color-ink)]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2.8"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.45, delay: 0.2 }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </motion.svg>
            <span className="absolute -inset-1 rounded-full border border-[var(--color-gold)]/40 animate-ping pointer-events-none opacity-40" />
          </motion.div>

          <span className="text-xs uppercase tracking-[0.2em] text-[var(--color-gold)] font-bold">
            ✦ Haute Couture Order Confirmed
          </span>
          <h1 className="text-3xl sm:text-4xl font-display font-medium text-[var(--color-ink)] mt-2 mb-2">
            Thank You, {customerName}
          </h1>
          <p className="text-[var(--color-slate)] max-w-lg mx-auto text-sm sm:text-base mb-8">
            Your handcrafted couture piece has been registered in our atelier queue. An official confirmation email with your invoice has been sent to{' '}
            <strong className="text-[var(--color-ink)] font-semibold">{order?.email || 'your email'}</strong>.
          </p>

          {/* Luxury Order Reference Pill */}
          <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-[var(--color-white)] border border-[var(--color-gold)]/40 rounded-full shadow-sm mb-8 text-sm">
            <span className="text-xs uppercase tracking-wider text-[var(--color-slate)] font-semibold">
              Order Reference:
            </span>
            <span className="font-mono font-bold text-[var(--color-ink)] tracking-wider">
              {orderNumber}
            </span>
            <button
              onClick={copyOrderId}
              type="button"
              className="px-2 py-0.5 rounded text-xs font-semibold bg-[var(--color-gold-light)]/60 text-[var(--color-gold)] hover:bg-[var(--color-gold)] hover:text-[var(--color-ink)] transition-colors"
              title="Copy Reference Number"
            >
              {copied ? '✓ Copied' : 'Copy'}
            </button>
          </div>

          {/* Interactive Order Journey Tracker */}
          <Card variant="elevated" padding="md" className="mb-8 text-left border-[var(--color-whisper)] bg-[var(--color-white)] shadow-sm print:hidden">
            <CardContent className="p-6">
              <h4 className="text-xs uppercase tracking-wider text-[var(--color-gold)] font-bold mb-6">
                Garment Journey &amp; Atelier Progress
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 relative">
                {/* Stage 1 */}
                <div className="flex sm:flex-col items-center gap-3 sm:text-center">
                  <div className="w-9 h-9 rounded-full bg-[var(--color-gold)] text-[var(--color-ink)] flex items-center justify-center font-bold text-sm shadow-sm flex-shrink-0">
                    ✓
                  </div>
                  <div>
                    <p className="font-semibold text-xs text-[var(--color-ink)]">Order Confirmed</p>
                    <p className="text-[11px] text-[var(--color-slate)]">Order placed</p>
                  </div>
                </div>

                {/* Stage 2 */}
                <div className="flex sm:flex-col items-center gap-3 sm:text-center">
                  <div className="w-9 h-9 rounded-full bg-[var(--color-gold-light)] border border-[var(--color-gold)] text-[var(--color-gold)] flex items-center justify-center font-bold text-sm flex-shrink-0">
                    2
                  </div>
                  <div>
                    <p className="font-semibold text-xs text-[var(--color-ink)]">Atelier Handcrafting</p>
                    <p className="text-[11px] text-[var(--color-slate)]">Embroidery &amp; tailoring</p>
                  </div>
                </div>

                {/* Stage 3 */}
                <div className="flex sm:flex-col items-center gap-3 sm:text-center">
                  <div className="w-9 h-9 rounded-full bg-[var(--color-snow)] border border-[var(--color-whisper)] text-[var(--color-slate)] flex items-center justify-center font-bold text-sm flex-shrink-0">
                    3
                  </div>
                  <div>
                    <p className="font-medium text-xs text-[var(--color-slate)]">White-Glove QC</p>
                    <p className="text-[11px] text-[var(--color-slate)]">Signature packaging</p>
                  </div>
                </div>

                {/* Stage 4 */}
                <div className="flex sm:flex-col items-center gap-3 sm:text-center">
                  <div className="w-9 h-9 rounded-full bg-[var(--color-snow)] border border-[var(--color-whisper)] text-[var(--color-slate)] flex items-center justify-center font-bold text-sm flex-shrink-0">
                    4
                  </div>
                  <div>
                    <p className="font-medium text-xs text-[var(--color-slate)]">Express Delivery</p>
                    <p className="text-[11px] text-[var(--color-slate)]">Dispatched to courier</p>
                  </div>
                </div>
              </div>

              {/* Delivery ETA pill */}
              <div className="mt-6 pt-4 border-t border-[var(--color-whisper)] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[var(--color-slate)]">
                <div className="flex items-center gap-2">
                  <span className="text-base">⚡</span>
                  <span>
                    Estimated Arrival: <strong className="text-[var(--color-ink)] font-semibold">3 – 5 Business Days</strong> via Express Air Courier
                  </span>
                </div>
                {order?.shipping_address?.city && (
                  <span className="text-[var(--color-gold)] font-medium">
                    Delivering to {order.shipping_address.city}, {order.shipping_address.state}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 1-Click Guest to VIP Upgrade Card (For frictionless post-purchase account creation) */}
          {(!order?.user_id || vipStatus?.type !== 'success') && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="mb-8 print:hidden"
            >
              <Card variant="elevated" padding="lg" className="border-[var(--color-gold)]/40 bg-gradient-to-br from-[var(--color-white)] to-[var(--color-gold-light)]/15 text-left shadow-sm">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-[var(--color-gold)] text-[var(--color-ink)] text-[10px] font-bold uppercase rounded-full mb-2">
                        ✦ Exclusive Guest Privilege
                      </div>
                      <h3 className="text-lg font-display font-semibold text-[var(--color-ink)]">
                        Turn this order into an Angelika VIP Account in 1-Click
                      </h3>
                      <p className="text-xs text-[var(--color-slate)] mt-1">
                        Enjoy effortless order tracking, priority concierge previews, and immediately claim{' '}
                        <strong className="text-[var(--color-gold)] font-bold">500 Royal Reward Points (₹500 value)</strong>.
                      </p>
                    </div>
                  </div>

                  {vipStatus ? (
                    <div
                      className={`p-3.5 rounded-[var(--radius-md)] text-xs font-medium ${
                        vipStatus.type === 'success'
                          ? 'bg-[#25D366]/10 border border-[#25D366]/30 text-[#137333]'
                          : 'bg-red-50 border border-red-200 text-red-700'
                      }`}
                    >
                      {vipStatus.message}
                    </div>
                  ) : (
                    <form onSubmit={handleCreateVipAccount} className="space-y-3 pt-2">
                      <div className="grid sm:grid-cols-3 gap-3 items-end">
                        <div className="sm:col-span-1">
                          <label className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-slate)] block mb-1">
                            Account Email
                          </label>
                          <input
                            type="text"
                            value={order?.email || ''}
                            disabled
                            className="w-full px-3 py-2 bg-[var(--color-whisper)]/60 border border-[var(--color-whisper)] rounded-[var(--radius-md)] text-xs text-[var(--color-slate)] cursor-not-allowed"
                          />
                        </div>
                        <div className="sm:col-span-1">
                          <label className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-slate)] block mb-1">
                            Set a Password *
                          </label>
                          <Input
                            type="password"
                            value={vipPassword}
                            onChange={(e) => setVipPassword(e.target.value)}
                            placeholder="At least 6 characters"
                            className="text-xs py-2"
                            required
                            minLength={6}
                          />
                        </div>
                        <div className="sm:col-span-1">
                          <Button
                            type="submit"
                            variant="primary"
                            className="w-full py-2.5 text-xs font-semibold"
                            disabled={vipSubmitting}
                          >
                            {vipSubmitting ? 'Activating VIP...' : 'Activate VIP Account'}
                          </Button>
                        </div>
                      </div>
                      <p className="text-[10px] text-[var(--color-mist)]">
                        No credit card or payment needed. Your order will automatically link to your personal dashboard.
                      </p>
                    </form>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Full Order & Garment Breakdown Card */}
          <Card variant="elevated" padding="lg" className="text-left mb-8 shadow-sm bg-[var(--color-white)]">
            <CardContent className="space-y-6 p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-[var(--color-whisper)] gap-3">
                <div>
                  <span className="text-xs text-[var(--color-slate)] uppercase tracking-wider block font-medium">
                    Order Reference
                  </span>
                  <span className="font-mono text-base font-semibold text-[var(--color-ink)] mt-0.5 block">
                    {orderNumber}
                  </span>
                  <span className="text-xs text-[var(--color-slate)]">
                    Payment Method: <strong className="text-[var(--color-ink)] capitalize">{order?.payment_method === 'cod' ? 'Cash on Delivery (COD)' : 'Online Payment (Razorpay)'}</strong>
                  </span>
                </div>

                {displayTotal && (
                  <div className="sm:text-right">
                    <span className="text-xs text-[var(--color-slate)] uppercase tracking-wider block font-medium">
                      Total Paid / Due
                    </span>
                    <span className="text-2xl font-bold text-[var(--color-ink)] mt-0.5 block">
                      {displayTotal}
                    </span>
                    <span className="text-[11px] text-[#137333] font-semibold">
                      GST 100% Inclusive • Free Luxury Delivery
                    </span>
                  </div>
                )}
              </div>

              {/* Destination & Contact Information */}
              {order?.shipping_address && (
                <div className="grid sm:grid-cols-2 gap-4 pb-6 border-b border-[var(--color-whisper)] text-xs">
                  <div>
                    <h5 className="font-bold uppercase tracking-wider text-[var(--color-gold)] mb-1.5">
                      Shipping Destination
                    </h5>
                    <p className="font-semibold text-sm text-[var(--color-ink)]">
                      {order.shipping_address.firstName} {order.shipping_address.lastName}
                    </p>
                    <p className="text-[var(--color-slate)] mt-0.5">
                      {order.shipping_address.address1}
                      {order.shipping_address.address2 ? `, ${order.shipping_address.address2}` : ''}
                    </p>
                    <p className="text-[var(--color-slate)]">
                      {order.shipping_address.city}, {order.shipping_address.state} - {order.shipping_address.postalCode}
                    </p>
                    <p className="text-[var(--color-slate)] mt-1">
                      🇮🇳 India
                    </p>
                  </div>
                  <div>
                    <h5 className="font-bold uppercase tracking-wider text-[var(--color-gold)] mb-1.5">
                      Contact &amp; Notification
                    </h5>
                    <p className="text-[var(--color-slate)]">
                      Phone: <strong className="text-[var(--color-ink)]">+91 {order.phone || order.shipping_address.phone}</strong>
                    </p>
                    <p className="text-[var(--color-slate)] mt-0.5">
                      Email: <strong className="text-[var(--color-ink)]">{order.email || order.shipping_address.email}</strong>
                    </p>
                    {order.whatsapp_opt_in && (
                      <p className="text-[#25D366] font-medium flex items-center gap-1.5 mt-2">
                        <span>📲</span> WhatsApp tracking alerts enabled
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Complimentary Gift Packaging Card if requested */}
              {order?.gift_wrap && (
                <div className="p-4 bg-[var(--color-gold-light)]/20 border border-[var(--color-gold)]/40 rounded-[var(--radius-lg)] text-xs">
                  <div className="flex items-center gap-2 font-bold text-[var(--color-gold)] mb-1">
                    <span>🎁</span>
                    <span className="uppercase tracking-wider">Complimentary Luxury Gift Packaging Enclosed</span>
                  </div>
                  {order.metadata?.gift_recipient && (
                    <p className="text-[var(--color-ink)] font-semibold mt-1">
                      Recipient: {order.metadata.gift_recipient}
                    </p>
                  )}
                  {order.gift_message && (
                    <p className="text-[var(--color-slate)] italic mt-1 font-serif text-sm">
                      "{order.gift_message}"
                    </p>
                  )}
                </div>
              )}

              {/* Order items list */}
              {order?.order_items && order.order_items.length > 0 && (
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-slate)]">
                    Purchased Pieces ({order.order_items.length})
                  </h4>
                  <div className="divide-y divide-[var(--color-whisper)]">
                    {order.order_items.map((item: any) => {
                      const image = item.variant_details?.image || item.image;
                      const size = item.variant_details?.size || item.size;
                      const color = item.variant_details?.color || item.color;
                      const price = item.total_price || (item.unit_price * item.quantity);
                      return (
                        <div key={item.id} className="py-3 flex items-center justify-between text-sm gap-4">
                          <div className="flex items-center gap-3">
                            {image && (
                              <img
                                src={image}
                                alt={item.product_name}
                                className="w-14 h-16 object-cover rounded-[var(--radius-md)] bg-[var(--color-whisper)] flex-shrink-0"
                              />
                            )}
                            <div>
                              <p className="font-semibold text-[var(--color-ink)]">{item.product_name}</p>
                              <div className="flex items-center gap-2 text-xs text-[var(--color-slate)] mt-0.5">
                                <span>Qty: {item.quantity}</span>
                                {size && <span>• Size: {size}</span>}
                                {color && <span>• Color: {color}</span>}
                              </div>
                            </div>
                          </div>
                          <span className="font-bold text-[var(--color-ink)]">
                            {formatINR(price)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Summary line */}
              <div className="pt-4 border-t border-[var(--color-whisper)] flex flex-wrap items-center justify-between text-xs text-[var(--color-slate)] gap-2">
                <span>Payment Status: <strong className="capitalize text-[var(--color-gold)] font-bold">{order?.payment_status || 'Confirmed'}</strong></span>
                <span>Fulfillment: <strong className="text-[var(--color-ink)]">White-Glove Dispatched</strong></span>
              </div>
            </CardContent>
          </Card>

          {/* Luxury CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 print:hidden">
            <Button variant="primary" asChild className="w-full sm:w-auto px-8 shadow-md">
              <Link href="/shop">Explore New Arrivals</Link>
            </Button>
            <a
              href={`https://wa.me/919876543210?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-[var(--radius-md)] bg-[#25D366] text-white font-semibold text-xs hover:bg-[#1ebe5b] transition-colors shadow-sm"
            >
              <span>📲</span> Track Live on WhatsApp
            </a>
            <Button
              variant="outline"
              onClick={handlePrintReceipt}
              className="w-full sm:w-auto px-6 text-xs"
            >
              Print Receipt
            </Button>
          </div>

          <div className="mt-8 text-xs text-[var(--color-slate)] print:hidden">
            Questions regarding your order or bespoke alterations? Reach our luxury concierge at{' '}
            <a href="mailto:care@angelikafashions.com" className="text-[var(--color-gold)] underline font-medium">
              care@angelikafashions.com
            </a>{' '}
            or call{' '}
            <a href="tel:+919876543210" className="text-[var(--color-ink)] font-semibold">
              +91 98765 43210
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[var(--color-snow)] flex items-center justify-center">
          <div className="w-10 h-10 border-3 border-[var(--color-gold)] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <OrderSuccessContent />
    </Suspense>
  );
}
