'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/Button';
import { SocialIcon } from '@/components/ui/SocialIcon';
import { WhatsAppIcon } from '@/components/ui/WhatsAppIcon';

export interface WhatsAppAction {
  label: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
  flowId?: string;
  flowAction?: 'navigate' | 'data_exchange';
}

export interface WhatsAppFloatButtonProps {
  phoneNumber: string;
  defaultMessage?: string;
  businessName?: string;
  actions?: WhatsAppAction[];
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  className?: string;
  showOnMobile?: boolean;
  showOnDesktop?: boolean;
  pulseInterval?: number;
  initialDelay?: number;
  conciergeTitle?: string;
  conciergeSubtitle?: string;
}

function getDefaultActions(phone: string): WhatsAppAction[] {
  const clean = phone.replace(/\D/g, '');
  if (!clean) return [];
  return [
    {
      label: 'Shop Collection',
      description: 'Browse our latest ethnic wear',
      icon: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <circle cx="9" cy="21" r="1" />
          <circle cx="20" cy="21" r="1" />
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
        </svg>
      ),
      onClick: () => window.open(`https://wa.me/${clean}?text=Hi%20Vidhya,%20I%27d%20like%20to%20browse%20your%20collection`, '_blank'),
    },
    {
      label: 'Size Guide Help',
      description: 'Get personalized size recommendations',
      icon: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      ),
      onClick: () => window.open(`https://wa.me/${clean}?text=Hi%20Vidhya,%20I%20need%20help%20with%20size%20guide`, '_blank'),
    },
    {
      label: 'Track Order',
      description: 'Check your order status',
      icon: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M22 18.3a2 2 0 0 0-1.64-.82 9 9 0 0 1-11.72 0 2 2 0 0 0-1.64.82" />
          <path d="M12 2v4" />
          <path d="M12 18v4" />
          <path d="M4.93 6.93l1.41 1.41" />
          <path d="M17.66 17.66l1.41 1.41" />
          <path d="M2 12h4" />
          <path d="M18 12h4" />
        </svg>
      ),
      onClick: () => window.open(`https://wa.me/${clean}?text=Hi%20Vidhya,%20I%20want%20to%20track%20my%20order`, '_blank'),
    },
    {
      label: 'Talk to Vidhya',
      description: 'Personal styling consultation',
      icon: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
      onClick: () => window.open(`https://wa.me/${clean}?text=Hi%20Vidhya,%20I%27d%20like%20a%20personal%20styling%20consultation`, '_blank'),
    },
  ];
}

export function WhatsAppFloatButton({
  phoneNumber,
  defaultMessage = 'Hi Vidhya, I\'d like to know more about your collection',
  businessName = 'Angelika Fashions',
  actions,
  position = 'bottom-right',
  className = '',
  showOnMobile = true,
  showOnDesktop = true,
  pulseInterval = 8000,
  initialDelay = 3000,
  conciergeTitle = "Vidhya's Concierge",
  conciergeSubtitle = "Bespoke Styling Chat",
}: WhatsAppFloatButtonProps) {
  const [mounted, setMounted] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showPulse, setShowPulse] = useState(true);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const pulseTimeoutRef = useRef<NodeJS.Timeout>();
  const initialTimeoutRef = useRef<NodeJS.Timeout>();

  const normalizedDigits = (phoneNumber || '').replace(/\D/g, '');
  const isConfigured = normalizedDigits.length >= 8 && !(phoneNumber || '').includes('X');
  const effectiveActions = actions || getDefaultActions(normalizedDigits);

  const positionClasses = {
    'bottom-right': 'bottom-20 md:bottom-6 right-4 sm:right-6',
    'bottom-left': 'bottom-20 md:bottom-6 left-4 sm:left-6',
    'top-right': 'top-6 right-4 sm:right-6',
    'top-left': 'top-6 left-4 sm:left-6',
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!showOnMobile && window.innerWidth < 768) return;
    if (!showOnDesktop && window.innerWidth >= 768) return;

    const startPulseInterval = () => {
      pulseTimeoutRef.current = setInterval(() => {
        setShowPulse(true);
        setTimeout(() => setShowPulse(false), 1000);
      }, pulseInterval);
    };

    initialTimeoutRef.current = setTimeout(() => {
      setShowPulse(true);
      startPulseInterval();
    }, initialDelay);

    return () => {
      clearTimeout(initialTimeoutRef.current);
      clearTimeout(pulseTimeoutRef.current);
    };
  }, [mounted, initialDelay, pulseInterval, showOnMobile, showOnDesktop]);

  const handleMainClick = () => {
    setIsExpanded((prev) => !prev);
    setShowPulse(false);
    if (pulseTimeoutRef.current) {
      clearTimeout(pulseTimeoutRef.current);
    }
  };

  const handleActionClick = (action: WhatsAppAction) => {
    action.onClick();
    setIsExpanded(false);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsExpanded(false);
    }
  };

  useEffect(() => {
    if (isExpanded) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isExpanded]);

  if (!mounted || !isConfigured) return null;

  return (
    <>
      {/* Blurred Backdrop behind popup */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsExpanded(false)}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Floating Concierge & Popup Container */}
      <div className={cn('fixed z-50 pointer-events-auto', positionClasses[position], className)}>
        <div className="relative z-50 flex flex-col items-end gap-3" role="region" aria-label="WhatsApp actions">
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, y: 16, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 16, scale: 0.95 }}
                transition={{ duration: 0.2, ease: [0.175, 0.885, 0.32, 1.275] }}
                className="w-80 max-w-[calc(100vw-2rem)]"
              >
                <div className="bg-[#FAF7F2] dark:bg-[#18181B] rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden">
                  {/* Card Header */}
                  <div className="p-4 bg-[#C9A84C] text-[#0D0D0D] flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0">
                        <WhatsAppIcon className="w-10 h-10" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm leading-tight text-[#0D0D0D]">{businessName}</p>
                        <p className="text-xs text-[#0D0D0D]/80 font-medium">Online · Replies in minutes</p>
                      </div>
                    </div>
                    <motion.button
                      onClick={() => setIsExpanded(false)}
                      className="p-1.5 rounded-full hover:bg-black/15 text-[#0D0D0D] transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      aria-label="Close WhatsApp menu"
                    >
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    </motion.button>
                  </div>

                  {/* Card Action Items */}
                  <div className="p-3 space-y-2 max-h-[320px] overflow-y-auto bg-white/60 dark:bg-stone-900/40">
                    {effectiveActions.map((action, index) => (
                      <motion.button
                        key={action.label}
                        onClick={() => handleActionClick(action)}
                        className="w-full p-3 flex items-center gap-3 text-left rounded-xl bg-white dark:bg-stone-800/80 hover:bg-[#F5EBCC]/70 dark:hover:bg-stone-700/80 border border-stone-200/60 dark:border-stone-700/60 shadow-sm transition-all group"
                        whileHover={{ x: 3 }}
                        whileTap={{ scale: 0.98 }}
                        initial={{ opacity: 0, x: -16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.06 + index * 0.03 }}
                      >
                        <div className="w-10 h-10 rounded-lg bg-[#F5EBCC] dark:bg-[#3D351A] flex items-center justify-center text-[#74590E] dark:text-[#D4B85C] flex-shrink-0 group-hover:bg-[#C9A84C] group-hover:text-[#0D0D0D] transition-colors shadow-xs">
                          {action.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-stone-900 dark:text-stone-100 truncate group-hover:text-[#74590E] dark:group-hover:text-[#D4B85C] transition-colors">
                            {action.label}
                          </p>
                          <p className="text-xs text-stone-500 dark:text-stone-400 truncate">
                            {action.description}
                          </p>
                        </div>
                        <svg className="h-4 w-4 text-stone-400 group-hover:text-[#74590E] dark:group-hover:text-[#D4B85C] transition-colors flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                          <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      </motion.button>
                    ))}
                  </div>

                  {/* Card Footer */}
                  <div className="p-3 border-t border-stone-200 dark:border-stone-800 bg-[#FAF7F2] dark:bg-[#18181B]">
                    <Button
                      variant="whatsapp"
                      className="w-full font-semibold shadow-md py-2.5"
                      onClick={() => {
                        const url = `https://wa.me/${normalizedDigits}?text=${encodeURIComponent(defaultMessage)}`;
                        window.open(url, '_blank');
                        setIsExpanded(false);
                      }}
                    >
                      <SocialIcon platform="whatsapp" size="sm" className="mr-2" />
                      Start a Conversation
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center">
            {/* Floating WhatsApp Action Button */}
            <motion.button
              ref={buttonRef}
              onClick={handleMainClick}
              className={cn(
                'group relative flex items-center justify-center rounded-full transition-all duration-300 cursor-pointer',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2',
                'drop-shadow-[0_4px_16px_rgba(0,0,0,0.18)] hover:drop-shadow-[0_8px_24px_rgba(37,211,102,0.45)]',
                isExpanded
                  ? 'w-12 h-12 md:w-14 md:h-14 bg-[var(--color-ink)] border border-[var(--color-gold)] text-white'
                  : 'w-12 h-12 md:w-14 md:h-14 bg-transparent p-0'
              )}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.94 }}
              aria-label={`Chat with ${businessName} Concierge on WhatsApp`}
              aria-expanded={isExpanded}
              aria-haspopup="true"
            >
              {isExpanded ? (
                <svg className="h-6 w-6 text-[var(--color-gold)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              ) : (
                <div className="relative w-full h-full flex items-center justify-center flex-shrink-0 transition-transform">
                  <WhatsAppIcon className="w-12 h-12 md:w-14 md:h-14" />
                </div>
              )}
            </motion.button>
          </div>
        </div>
      </div>
    </>
  );
}

export interface WhatsAppFlowButtonProps {
  flowId: string;
  flowAction: 'navigate' | 'data_exchange';
  flowData?: Record<string, unknown>;
  label: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function WhatsAppFlowButton({
  flowId,
  flowAction,
  flowData,
  label,
  variant = 'primary',
  size = 'md',
  className = '',
}: WhatsAppFlowButtonProps) {
  const handleClick = () => {
    const url = new URL('https://wa.me/');
    url.searchParams.set('flow_id', flowId);
    url.searchParams.set('flow_action', flowAction);
    if (flowData) {
      url.searchParams.set('flow_data', JSON.stringify(flowData));
    }
    window.open(url.toString(), '_blank');
  };

  const variantClasses = {
    primary: 'bg-[var(--color-gold)] text-[var(--color-ink)] hover:bg-[var(--color-gold-hover)]',
    secondary: 'bg-[var(--color-white)] border-2 border-[var(--color-gold)] text-[var(--color-gold)] hover:bg-[var(--color-gold-light)]',
    ghost: 'text-[var(--color-gold)] hover:bg-[var(--color-gold-light)]',
  };

  return (
    <motion.button
      onClick={handleClick}
      className={cn(
        'inline-flex items-center gap-2 font-semibold uppercase tracking-wider rounded-[var(--radius-md)] transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[var(--color-gold)]/40 focus-visible:ring-offset-2',
        variantClasses[variant],
        {
          'px-4 py-2 text-sm': size === 'sm',
          'px-6 py-3 text-base': size === 'md',
          'px-8 py-4 text-lg': size === 'lg',
        },
        className
      )}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <SocialIcon platform="whatsapp" size={size === 'sm' ? 'sm' : 'md'} />
      {label}
    </motion.button>
  );
}

export interface WhatsAppCatalogButtonProps {
  productId: string;
  productName: string;
  price: number;
  currency?: string;
  image?: string;
  className?: string;
}

export function WhatsAppCatalogButton({
  productId,
  productName,
  price,
  currency = 'INR',
  image,
  className = '',
}: WhatsAppCatalogButtonProps) {
  const handleClick = () => {
    window.location.assign(`/contact?inquiry=${encodeURIComponent(productName)}`);
  };

  return (
    <motion.button
      onClick={handleClick}
      className={cn(
        'inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold uppercase tracking-wider bg-[var(--color-white)] border-2 border-[var(--color-gold)] text-[var(--color-gold)] rounded-[var(--radius-md)] hover:bg-[var(--color-gold-light)] transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[var(--color-gold)]/40 focus-visible:ring-offset-2',
        className
      )}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <SocialIcon platform="whatsapp" size="sm" />
      Inquire About Piece
    </motion.button>
  );
}