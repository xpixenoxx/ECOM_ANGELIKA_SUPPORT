'use client';

import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { cn } from '@/lib/utils/cn';

const statusStyles: Record<string, string> = {
  Delivered: 'bg-[var(--color-success-bg)] text-[var(--color-success)]',
  Shipped: 'bg-[var(--color-info-bg)] text-[var(--color-info)]',
  Processing: 'bg-[var(--color-warning-bg)] text-[var(--color-warning)]',
  Cancelled: 'bg-[var(--color-error-bg)] text-[var(--color-error)]',
  Returned: 'bg-[var(--color-slate)]/10 text-[var(--color-slate)]',
  'Return Requested': 'bg-[var(--color-warning-bg)] text-[var(--color-warning)]',
};

const mockOrder = {
  id: 'ORD-2026-001',
  date: '2026-01-15',
  status: 'Delivered',
  statusHistory: [
    { status: 'Order Placed', date: '2026-01-10', time: '14:32', completed: true },
    { status: 'Confirmed', date: '2026-01-10', time: '14:35', completed: true },
    { status: 'Processing', date: '2026-01-11', time: '10:15', completed: true },
    { status: 'Shipped', date: '2026-01-12', time: '16:45', completed: true },
    { status: 'Out for Delivery', date: '2026-01-15', time: '09:30', completed: true },
    { status: 'Delivered', date: '2026-01-15', time: '13:22', completed: true },
  ],
  items: [
    { id: 'item-1', productId: 'prod-1', name: 'Cotton Anarkali Set with Hand Block Print', price: 3499, originalPrice: 4299, image: '/images/product-1.jpg', color: 'Maroon', colorHex: '#8B0000', size: 'M', quantity: 1 },
    { id: 'item-2', productId: 'prod-2', name: 'Silk Palazzo Set', price: 4799, originalPrice: 5999, image: '/images/product-2.jpg', color: 'Emerald Green', colorHex: '#1B7A3D', size: 'L', quantity: 1 },
  ],
  shipping: {
    name: 'Vidhya R.',
    address: '123 Indiranagar 1st Stage',
    city: 'Bangalore',
    state: 'Karnataka',
    pincode: '560038',
    phone: '9876543210',
    email: 'vidhya@angelikafashions.com',
  },
  billing: {
    name: 'Vidhya R.',
    address: '123 Indiranagar 1st Stage',
    city: 'Bangalore',
    state: 'Karnataka',
    pincode: '560038',
    phone: '9876543210',
  },
  payment: {
    method: 'Razorpay (UPI)',
    transactionId: 'pay_K8x9mN2pQ4rT5w',
    status: 'Paid',
    paidAt: '2026-01-10 14:35',
  },
  pricing: {
    subtotal: 8298,
    discount: 0,
    shipping: 0,
    tax: 747,
    total: 9045,
    savings: 2000,
  },
  tracking: {
    carrier: 'Delhivery',
    trackingNumber: 'DHV1234567890',
    trackingUrl: 'https://track.delhivery.com/DHV1234567890',
    estimatedDelivery: '2026-01-15',
    deliveredAt: '2026-01-15 13:22',
  },
  canReturn: true,
  returnWindowEnds: '2026-01-30',
};

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params['id'] as string;

  const order = mockOrder;

  const subtotal = order.pricing.subtotal;
  const discount = order.pricing.discount;
  const shipping = order.pricing.shipping;
  const tax = order.pricing.tax;
  const total = order.pricing.total;

  return (
    <div className="min-h-screen bg-[var(--color-white)]">
      {/* Page Header */}
      <section className="bg-[var(--color-snow)] border-b border-[var(--color-whisper)] py-8">
        <div className="container-custom px-6">
          <motion.div
            className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div>
              <Link href="/account/orders" className="text-sm text-[var(--color-slate)] hover:text-[var(--color-ink)] mb-2 inline-flex items-center gap-1">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                Back to Orders
              </Link>
              <h1 className="text-[var(--font-display)] text-3xl font-medium text-[var(--color-ink)]">
                Order {orderId}
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <span className={cn('px-4 py-2 text-sm font-semibold rounded-[var(--radius-full)]', statusStyles[order.status])}>
                {order.status}
              </span>
              <Button variant="outline" asChild>
                <Link href={`/account/orders/${orderId}/invoice`} target="_blank" rel="noopener noreferrer">
                  Download Invoice
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-10">
        <div className="container-custom px-6">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Order Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Order Summary Card */}
              <Card variant="elevated" padding="none">
                <CardHeader className="p-6 border-b border-[var(--color-whisper)]">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-[var(--font-display)] text-lg">Order Summary</CardTitle>
                    <span className="text-sm text-[var(--color-slate)]">Placed {new Date(order.date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-[var(--color-whisper)]">
                    {order.items.map((item, index) => (
                      <motion.div
                        key={item.id}
                        className="flex gap-4 p-4"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <div className="relative w-20 h-24 flex-shrink-0 rounded-[var(--radius-lg)] overflow-hidden bg-[var(--color-whisper)]">
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                            sizes="80px"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <Link href={`/product/${item.productId}`} className="hover:underline">
                            <h3 className="text-[var(--font-display)] text-sm font-medium text-[var(--color-ink)] line-clamp-2 mb-1">
                              {item.name}
                            </h3>
                          </Link>
                          <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--color-slate)] mb-1">
                            <span className="flex items-center gap-1">
                              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.colorHex }} aria-hidden="true" />
                              {item.color}
                            </span>
                            <span>Size: {item.size}</span>
                            <span>Qty: {item.quantity}</span>
                          </div>
                          <div className="flex items-baseline gap-2">
                            <span className="font-medium text-[var(--color-ink)]">₹{(item.price * item.quantity).toLocaleString()}</span>
                            {item.originalPrice > item.price && (
                              <span className="text-sm text-[var(--color-mist)] line-through">₹{(item.originalPrice * item.quantity).toLocaleString()}</span>
                            )}
                          </div>
                        </div>
                        {order.canReturn && (
                          <Button variant="ghost" size="sm" className="text-[var(--color-error)] hover:text-[var(--color-error)]" onClick={() => {}}>
                            Return
                          </Button>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Order Timeline */}
              <Card variant="elevated" padding="lg">
                <CardTitle className="text-[var(--font-display)] text-lg mb-6">Order Timeline</CardTitle>
                <div className="relative">
                  <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-[var(--color-whisper)]" />
                  {order.statusHistory.map((step, index) => (
                    <motion.div
                      key={step.status}
                      className="relative flex items-start gap-4 pb-8 last:pb-0"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <div className={cn(
                        'relative z-10 flex-shrink-0 w-3 h-3 rounded-full border-2 border-[var(--color-white)]',
                        step.completed ? 'bg-[var(--color-gold)] border-[var(--color-gold)]' : 'bg-[var(--color-white)] border-[var(--color-whisper)]'
                      )} />
                      <div className="flex-1 pt-1">
                        <div className="flex items-baseline gap-2">
                          <span className={cn('font-medium text-[var(--color-ink)]', step.completed && 'text-[var(--color-gold)]')}>
                            {step.status}
                          </span>
                          {step.completed && (
                            <span className="text-xs text-[var(--color-success)] font-medium">✓</span>
                          )}
                        </div>
                        <div className="text-sm text-[var(--color-slate)]">
                          {new Date(step.date).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })} at {step.time}
                        </div>
                        {step.status === 'Delivered' && order.tracking.deliveredAt && (
                          <p className="text-xs text-[var(--color-success)] mt-1">Delivered on {new Date(order.tracking.deliveredAt).toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </Card>

              {/* Tracking */}
              {order.tracking.trackingNumber && (
                <Card variant="elevated" padding="lg">
                  <CardTitle className="text-[var(--font-display)] text-lg mb-4">Shipment Tracking</CardTitle>
                  <div className="p-4 bg-[var(--color-snow)] rounded-[var(--radius-xl)]">
                    <div className="grid sm:grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-[var(--color-slate)] mb-1">Carrier</p>
                        <p className="font-medium text-[var(--color-ink)]">{order.tracking.carrier}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[var(--color-slate)] mb-1">Tracking Number</p>
                        <p className="font-mono text-sm text-[var(--color-ink)]">{order.tracking.trackingNumber}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[var(--color-slate)] mb-1">Estimated Delivery</p>
                        <p className="font-medium text-[var(--color-ink)]">{new Date(order.tracking.estimatedDelivery).toLocaleDateString('en-IN')}</p>
                      </div>
                    </div>
                    <Button variant="primary" size="sm" asChild>
                      <a href={order.tracking.trackingUrl} target="_blank" rel="noopener noreferrer" className="w-full">
                        Track on {order.tracking.carrier}
                      </a>
                    </Button>
                  </div>
                </Card>
              )}

              {/* Return Section */}
              {order.canReturn && (
                <Card variant="outlined" padding="lg" className="border-[var(--color-gold)]/30">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="gold">Return Eligible</Badge>
                        <span className="text-sm text-[var(--color-slate)]">Until {new Date(order.returnWindowEnds).toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                      <p className="text-[var(--color-slate)]">Items unworn with original tags. Free pickup in India. Refund to original payment method within 5-7 days.</p>
                    </div>
                    <Button variant="primary" onClick={() => {}}>Initiate Return</Button>
                  </div>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Order Totals */}
              <Card variant="elevated" padding="lg" className="sticky top-24">
                <CardTitle className="text-[var(--font-display)] text-lg mb-6">Order Total</CardTitle>
                <dl className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-[var(--color-slate)]">Subtotal ({order.items.length} items)</dt>
                    <dd className="font-medium text-[var(--color-ink)]">₹{subtotal.toLocaleString()}</dd>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-[var(--color-success)]">
                      <dt>Discount</dt>
                      <dd className="font-medium">-₹{discount.toLocaleString()}</dd>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <dt className="text-[var(--color-slate)]">Shipping</dt>
                    <dd className="font-medium">{shipping === 0 ? <span className="text-[var(--color-success)]">Free</span> : `₹${shipping.toLocaleString()}`}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-[var(--color-slate)]">Tax (GST)</dt>
                    <dd className="font-medium">₹{tax.toLocaleString()}</dd>
                  </div>
                  <div className="border-t border-[var(--color-whisper)] pt-3">
                    <div className="flex justify-between text-lg font-bold">
                      <dt className="text-[var(--color-ink)]">Total</dt>
                      <dd className="text-[var(--color-ink)]">₹{total.toLocaleString()}</dd>
                    </div>
                  </div>
                  {order.pricing.savings > 0 && (
                    <p className="text-xs text-[var(--color-success)] mt-2 text-center">You saved ₹{order.pricing.savings.toLocaleString()}</p>
                  )}
                </dl>
              </Card>

              {/* Shipping Address */}
              <Card variant="elevated" padding="lg">
                <CardTitle className="text-[var(--font-display)] text-lg mb-4">Shipping Address</CardTitle>
                <address className="text-sm text-[var(--color-slate)] not-italic space-y-1">
                  <p className="font-medium text-[var(--color-ink)]">{order.shipping.name}</p>
                  <p>{order.shipping.address}</p>
                  <p>{order.shipping.city}, {order.shipping.state} - {order.shipping.pincode}</p>
                  <p>Phone: {order.shipping.phone}</p>
                  <p>Email: {order.shipping.email}</p>
                </address>
              </Card>

              {/* Payment Info */}
              <Card variant="elevated" padding="lg">
                <CardTitle className="text-[var(--font-display)] text-lg mb-4">Payment Details</CardTitle>
                <dl className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-[var(--color-slate)]">Method</dt>
                    <dd className="font-medium text-[var(--color-ink)]">{order.payment.method}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-[var(--color-slate)]">Transaction ID</dt>
                    <dd className="font-mono text-[var(--color-ink)]">{order.payment.transactionId}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-[var(--color-slate)]">Status</dt>
                    <dd className={cn('font-medium', order.payment.status === 'Paid' ? 'text-[var(--color-success)]' : 'text-[var(--color-warning)]')}>{order.payment.status}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-[var(--color-slate)]">Paid On</dt>
                    <dd className="font-medium text-[var(--color-ink)]">{order.payment.paidAt}</dd>
                  </div>
                </dl>
              </Card>

              {/* Actions */}
              <Card variant="elevated" padding="lg">
                <CardTitle className="text-[var(--font-display)] text-lg mb-4">Need Help?</CardTitle>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start gap-3" asChild>
                    <Link href="https://wa.me/91XXXXXXXXXX?text=Hi%20Vidhya,%20I%20have%20a%20question%20about%20order%20ORD-2026-001" target="_blank" rel="noopener noreferrer">
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.48-1.653-1.653-.173-.173-.447-.298-.644-.075-.198.199-.867.868-.967 1.164-.199.297-.247.496-.15.67.098.272.816.99 1.065 1.28.148.198.298.347.496.471.198.198.471.297.67.149l.767-.693c.272-.248.495-.373.57-.373.148 0 .297.149.372.373.149.423.448 1.272.94 1.988.463.68 1.255 1.165 1.475 1.288.198.124.272.223.397.198.149-.025.422-.248.57-.471.148-.223.172-.57.074-.766-.124-.198-.522-.692-1.018-1.307-.448-.57-1.14-1.294-1.717-1.815-.547-.5-.838-.766-.966-.866-.128-.099-.273-.099-.423 0-.15.074-.322.223-.495.372-.173.149-.347.198-.52.198-.174 0-.347-.099-.52-.247-.173-.148-.322-.247-.495-.247-.199 0-.372.098-.52.247l-.645.618c-.15.148-.173.297-.024.471.1.1.247.223.372.322.15.1.323.149.496.149.199 0 .397-.05.546-.149.148-.099.247-.248.296-.423.048-.173 0-.397-.024-.57-.024-.173-.024-.347-.074-.52-.149zM20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </svg>
                      Chat with Support
                    </Link>
                  </Button>
                  <Button variant="whatsapp" className="w-full justify-center gap-2" asChild>
                    <Link href="https://wa.me/91XXXXXXXXXX?text=Hi%20Vidhya,%20I%20need%20help%20with%20order%20ORD-2026-001" target="_blank" rel="noopener noreferrer">
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.48-1.653-1.653-.173-.173-.447-.298-.644-.075-.198.199-.867.868-.967 1.164-.199.297-.247.496-.15.67.098.272.816.99 1.065 1.28.148.198.298.347.496.471.198.198.471.297.67.149l.767-.693c.272-.248.495-.373.57-.373.148 0 .297.149.372.373.149.423.448 1.272.94 1.988.463.68 1.255 1.165 1.475 1.288.198.124.272.223.397.198.149-.025.422-.248.57-.471.148-.223.172-.57.074-.766-.124-.198-.522-.692-1.018-1.307-.448-.57-1.14-1.294-1.717-1.815-.547-.5-.838-.766-.966-.866-.128-.099-.273-.099-.423 0-.15.074-.322.223-.495.372-.173.149-.347.198-.52.198-.174 0-.347-.099-.52-.247-.173-.148-.322-.247-.495-.247-.199 0-.372.098-.52.247l-.645.618c-.15.148-.173.297-.024.471.1.1.247.223.372.322.15.1.323.149.496.149.199 0 .397-.05.546-.149.148-.099.247-.248.296-.423.048-.173 0-.397-.024-.57-.024-.173-.024-.347-.074-.52-.149zM20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </svg>
                      WhatsApp Vidhya
                    </Link>
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}