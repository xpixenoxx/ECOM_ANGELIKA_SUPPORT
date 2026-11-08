'use client';

import { Fragment, ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils/cn';
import { FocusTrap } from '@/components/ui/FocusTrap';
import { Input } from '@/components/ui/Input';

function formatCurrency(amount: any): string {
  const num = typeof amount === 'number' && !isNaN(amount)
    ? amount
    : parseFloat(String(amount || '').replace(/[^0-9.]/g, '')) || 0;
  if (!num || num <= 0) return '0';
  return Math.round(num).toLocaleString('en-IN');
}

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'full';
  position?: 'right' | 'left' | 'bottom';
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  className?: string;
}

const sizeStyles = {
  sm: 'w-72',
  md: 'w-96',
  lg: 'w-[400px]',
  full: 'w-full max-w-md',
};

const positionStyles = {
  right: 'right-0',
  left: 'left-0',
  bottom: 'bottom-0 left-0 right-0 max-h-[80vh]',
};

const drawerVariants = {
  right: {
    hidden: { x: '100%' },
    visible: { x: 0, transition: { type: 'spring', damping: 25, stiffness: 300 } },
    exit: { x: '100%', transition: { duration: 0.2, ease: 'easeIn' } },
  },
  left: {
    hidden: { x: '-100%' },
    visible: { x: 0, transition: { type: 'spring', damping: 25, stiffness: 300 } },
    exit: { x: '-100%', transition: { duration: 0.2, ease: 'easeIn' } },
  },
  bottom: {
    hidden: { y: '100%' },
    visible: { y: 0, transition: { type: 'spring', damping: 25, stiffness: 300 } },
    exit: { y: '100%', transition: { duration: 0.2, ease: 'easeIn' } },
  },
};

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

export function Drawer({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  position = 'right',
  closeOnOverlayClick = true,
  closeOnEscape = true,
  showCloseButton = true,
  className = '',
}: DrawerProps) {
  const titleId = title ? 'drawer-title' : undefined;
  const descriptionId = description ? 'drawer-description' : undefined;

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape' && closeOnEscape) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, closeOnEscape, onClose]);

  if (!isOpen) return null;

  const drawerContent = (
    <AnimatePresence mode="wait">
      <motion.div
        className="fixed inset-0 z-50 z-[var(--z-drawer,80)] overflow-hidden"
        initial="hidden"
        animate="visible"
        exit="exit"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
      >
        <motion.div
          className="absolute inset-0 bg-[var(--color-ink)]/50 backdrop-blur-sm"
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={backdropVariants}
          onClick={closeOnOverlayClick ? onClose : undefined}
          aria-hidden="true"
        />

        <FocusTrap
          onEscape={closeOnEscape ? onClose : undefined}
          focusRef={(el) => el?.focus()}
        >
          <motion.div
            className={cn(
              'fixed bg-[var(--color-white)] shadow-[var(--shadow-2xl)]',
              'flex flex-col h-full max-h-screen',
              sizeStyles[size],
              position === 'right' && 'inset-y-0 right-0 rounded-l-[var(--radius-xl)]',
              position === 'left' && 'inset-y-0 left-0 rounded-r-[var(--radius-xl)]',
              position === 'bottom' && 'bottom-0 inset-x-0 max-h-[85vh] rounded-t-[var(--radius-xl)]',
              className
            )}
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={drawerVariants[position]}
            role="document"
          >
            {(title || showCloseButton) && (
              <div className="flex items-start justify-between p-6 border-b border-[var(--color-whisper)] sticky top-0 bg-[var(--color-white)] z-10 flex-shrink-0">
                <div>
                  {title && (
                    <h2
                      id={titleId}
                      className="text-[var(--font-display)] text-xl font-semibold text-[var(--color-ink)]"
                    >
                      {title}
                    </h2>
                  )}
                  {description && (
                    <p
                      id={descriptionId}
                      className="mt-1 text-[var(--color-slate)] text-sm"
                    >
                      {description}
                    </p>
                  )}
                </div>
                {showCloseButton && (
                  <motion.button
                    className="p-2 rounded-full text-[var(--color-mist)] hover:text-[var(--color-ink)] hover:bg-[var(--color-whisper)] transition-colors duration-150 flex-shrink-0"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={onClose}
                    aria-label="Close drawer"
                  >
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </motion.button>
                )}
              </div>
            )}
            <div className="flex-1 p-6 overflow-y-auto flex flex-col min-h-0">
              {children}
            </div>
          </motion.div>
        </FocusTrap>
      </motion.div>
    </AnimatePresence>
  );

  if (typeof window === 'undefined') return null;

  return createPortal(drawerContent, document.body);
}

const modalVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

export interface CartDrawerProps extends Omit<DrawerProps, 'position' | 'size' | 'children'> {
  items: CartItem[];
  subtotal: number;
  discount?: number;
  shipping?: number;
  tax?: number;
  total: number;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemoveItem: (id: string) => void;
  onProceedToCheckout: () => void;
  couponCode?: string;
  onApplyCoupon: (code: string) => void;
  onRemoveCoupon: () => void;
  isLoading?: boolean;
}

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
  maxQuantity?: number;
}

export function CartDrawer({
  isOpen,
  onClose,
  items,
  subtotal,
  discount = 0,
  shipping = 0,
  tax = 0,
  total,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
  couponCode,
  onApplyCoupon,
  onRemoveCoupon,
  isLoading = false,
}: CartDrawerProps) {
  const router = useRouter();
  const [storedGuestItems, setStoredGuestItems] = useState<CartItem[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('guest_cart');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setStoredGuestItems(parsed);
          }
        }
      } catch {}
    }
  }, [isOpen]);

  const effectiveDrawerItems = (items && items.length > 0) ? items : storedGuestItems;
  const effectiveSubtotal = subtotal > 0
    ? subtotal
    : effectiveDrawerItems.reduce((sum, item) => {
        const p = typeof item.price === 'number' && !isNaN(item.price) ? item.price : Number(String(item.price || '').replace(/[^0-9.]/g, '')) || 0;
        return sum + p * (item.quantity || 1);
      }, 0);
  const effectiveTotal = total > 0 ? total : Math.max(0, effectiveSubtotal + shipping - discount);

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Shopping Bag"
      description={`${effectiveDrawerItems.length} item${effectiveDrawerItems.length !== 1 ? 's' : ''}`}
      size="lg"
      position="right"
      className="flex flex-col"
    >
      <div className="flex-1 overflow-y-auto space-y-4">
        {effectiveDrawerItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
            <motion.div
              className="w-20 h-20 rounded-full bg-[var(--color-gold-light)]/60 border border-[var(--color-gold)]/20 flex items-center justify-center mb-5 text-[var(--color-gold)] shadow-xs"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 12, stiffness: 100 }}
            >
              <svg className="h-10 w-10 text-[var(--color-gold)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <path d="M3 6h18" />
                <path d="M16 10a4 4 0 0 1 0 8" />
              </svg>
            </motion.div>
            <h3 className="text-[var(--font-display)] text-xl font-medium text-[var(--color-ink)] mb-2">
              Your Bag is Empty
            </h3>
            <p className="text-[var(--color-slate)] text-sm max-w-xs mb-6 leading-relaxed">
              Explore our handcrafted kurtis, pure silk sarees, and festive designer wear.
            </p>

            {/* Interactive Category Chips */}
            <div className="w-full pt-5 border-t border-[var(--color-whisper)]">
              <p className="text-xs uppercase tracking-wider text-[var(--color-slate)] font-semibold mb-3">
                Discover by Category
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {[
                  { label: 'Kurtis & Sets', href: '/shop?category=Kurtis' },
                  { label: 'Pure Sarees', href: '/shop?category=Sarees' },
                  { label: 'Festive Lehengas', href: '/shop?category=Lehengas' },
                  { label: 'New Arrivals', href: '/shop?sort=newest' },
                  { label: "Vidhya's Picks", href: '/vidhyas-picks' },
                ].map((cat) => (
                  <button
                    key={cat.label}
                    type="button"
                    onClick={() => {
                      onClose();
                      router.push(cat.href);
                    }}
                    className="px-3 py-1.5 text-xs font-medium bg-[var(--color-snow)] hover:bg-[var(--color-gold-light)] hover:text-[var(--color-ink)] text-[var(--color-charcoal)] border border-[var(--color-whisper)] rounded-full transition-all duration-150 cursor-pointer shadow-2xs hover:border-[var(--color-gold)]/40"
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            <ul className="space-y-4" role="list" aria-label="Cart items">
              {effectiveDrawerItems.map((item, index) => {
                const itemName = (item as any).name || (item as any).product_name || 'Product';
                const itemImage = (item as any).image || (item as any).image_url || '/images/collection-kurtis.jpg';
                return (
                  <motion.li
                    key={item.id}
                    className="flex gap-4"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.08 }}
                    exit={{ opacity: 0, x: -20, transition: { duration: 0.15 } }}
                  >
                    <motion.div
                      className="relative w-20 h-24 flex-shrink-0 rounded-[var(--radius-md)] overflow-hidden bg-[var(--color-whisper)]"
                      whileHover={{ scale: 1.02 }}
                    >
                      <img
                        src={itemImage}
                        alt={itemName}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </motion.div>
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <h4 className="font-medium text-[var(--color-ink)] line-clamp-1">{itemName}</h4>
                        <div className="mt-1 flex items-center gap-2 text-sm text-[var(--color-slate)]">
                          {item.size && <span>Size: {item.size}</span>}
                          {item.color && <span>Color: {item.color}</span>}
                        </div>
                        <p className="mt-1 font-semibold text-[var(--color-ink)]">
                          ₹{formatCurrency(item.price)}
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center border border-[var(--color-whisper)] rounded-[var(--radius-md)] overflow-hidden">
                          <button
                            className="p-2 text-[var(--color-slate)] hover:text-[var(--color-ink)] hover:bg-[var(--color-whisper)] transition-colors disabled:opacity-50"
                            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                            disabled={!!(item.quantity <= 1)}
                            aria-label="Decrease quantity"
                          >
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                              <path d="M5 12h14" />
                            </svg>
                          </button>
                          <span className="px-3 text-center font-medium text-[var(--color-ink)] min-w-[2.5rem]">
                            {item.quantity}
                          </span>
                          <button
                            className="p-2 text-[var(--color-slate)] hover:text-[var(--color-ink)] hover:bg-[var(--color-whisper)] transition-colors disabled:opacity-50"
                            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                            disabled={!!(item.maxQuantity && item.quantity >= item.maxQuantity)}
                            aria-label="Increase quantity"
                          >
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                              <path d="M12 5v14M5 12h14" />
                            </svg>
                          </button>
                        </div>
                        <motion.button
                          className="p-2 text-[var(--color-mist)] hover:text-[var(--color-error)] transition-colors"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => onRemoveItem(item.id)}
                          aria-label={`Remove ${itemName}`}
                        >
                          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                            <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                        </motion.button>
                      </div>
                    </div>
                  </motion.li>
                );
              })}
            </ul>

            <div className="pt-4 border-t border-[var(--color-whisper)] space-y-3">
              {couponCode ? (
                <div className="flex items-center justify-between p-3 bg-[var(--color-gold-light)] rounded-[var(--radius-md)]">
                  <span className="text-sm font-medium text-[var(--color-ink)]">Coupon applied: <span className="font-bold text-[var(--color-gold)]">{couponCode}</span></span>
                  <button
                    className="text-sm text-[var(--color-gold)] hover:text-[var(--color-gold-hover)] font-medium"
                    onClick={onRemoveCoupon}
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    placeholder="Coupon code"
                    size="sm"
                    className="flex-1"
                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && e.currentTarget.value && onApplyCoupon(e.currentTarget.value)}
                  />
                  <button
                    className="px-4 py-2 text-sm font-medium uppercase tracking-wider bg-[var(--color-ink)] text-[var(--color-gold)] border border-[var(--color-gold)] rounded-[var(--radius-md)] hover:bg-[var(--color-charcoal)] transition-colors"
                    onClick={() => {
                      const input = document.querySelector('input[placeholder="Coupon code"]') as HTMLInputElement;
                      if (input?.value) onApplyCoupon(input.value);
                    }}
                  >
                    Apply
                  </button>
                </div>
              )}

              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-[var(--color-slate)]">
                  <span>Subtotal</span>
                  <span>₹{formatCurrency(effectiveSubtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-[var(--color-success)]">
                    <span>Discount</span>
                    <span>-₹{formatCurrency(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-[var(--color-slate)]">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? 'Free' : `₹${formatCurrency(shipping)}`}</span>
                </div>
                <div className="flex justify-between text-[var(--color-slate)]">
                  <span>Tax (GST)</span>
                  <span>{tax === 0 ? '₹0 (Included)' : `₹${formatCurrency(tax)}`}</span>
                </div>
                <div className="flex justify-between text-base font-semibold text-[var(--color-ink)] pt-2 border-t border-[var(--color-whisper)]">
                  <span>Total</span>
                  <span>₹{formatCurrency(effectiveTotal)}</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {effectiveDrawerItems.length === 0 ? (
        <motion.button
          className="w-full px-6 py-4 text-base font-semibold uppercase tracking-wider bg-[var(--color-gold)] text-[var(--color-ink)] rounded-[var(--radius-md)] shadow-[var(--shadow-gold)] hover:bg-[var(--color-gold-hover)] hover:shadow-[var(--shadow-lg)] transition-all duration-200 flex items-center justify-center gap-2 group cursor-pointer mt-4 flex-shrink-0"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            onClose();
            router.push('/shop');
          }}
        >
          <span>Explore Collections</span>
          <span className="transition-transform group-hover:translate-x-1">&rarr;</span>
        </motion.button>
      ) : (
        <div className="pt-4 border-t border-[var(--color-whisper)] mt-auto flex-shrink-0">
          <motion.button
            className="w-full px-6 py-4 text-base font-semibold uppercase tracking-wider bg-[var(--color-gold)] text-[var(--color-ink)] rounded-[var(--radius-md)] shadow-[var(--shadow-gold)] hover:bg-[var(--color-gold-hover)] hover:shadow-[var(--shadow-lg)] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onProceedToCheckout}
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : `Proceed to Checkout — ₹${formatCurrency(effectiveTotal)}`}
          </motion.button>
        </div>
      )}
    </Drawer>
  );
}