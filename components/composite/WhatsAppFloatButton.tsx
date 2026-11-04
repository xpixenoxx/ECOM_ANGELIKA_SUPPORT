'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/Button';
import { SocialIcon } from '@/components/ui/SocialIcon';

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
}

function getDefaultActions(phone: string): WhatsAppAction[] {
  const clean = phone.replace(/\D/g, '') || '919876543210';
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
}: WhatsAppFloatButtonProps) {
  const [mounted, setMounted] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showPulse, setShowPulse] = useState(true);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const pulseTimeoutRef = useRef<NodeJS.Timeout>();
  const initialTimeoutRef = useRef<NodeJS.Timeout>();

  const activePhone = phoneNumber && !phoneNumber.includes('X') ? phoneNumber : '919876543210';
  const effectiveActions = actions || getDefaultActions(activePhone);

  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6',
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!showOnMobile && window.innerWidth < 768) return;
    if (!showOnDesktop && window.innerWidth >= 768) return;

    initialTimeoutRef.current = setTimeout(() => {
      setShowPulse(true);
      startPulseInterval();
    }, initialDelay);

    return () => {
      clearTimeout(initialTimeoutRef.current);
      clearTimeout(pulseTimeoutRef.current);
    };
  }, [mounted, initialDelay, pulseInterval, showOnMobile, showOnDesktop]);

  const startPulseInterval = () => {
    pulseTimeoutRef.current = setInterval(() => {
      setShowPulse(true);
      setTimeout(() => setShowPulse(false), 1000);
    }, pulseInterval);
  };

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

  if (!mounted) return null;

  return (
    <div className={cn('fixed z-[var(--z-toast)]', positionClasses[position], className)}>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="fixed inset-0 bg-[var(--color-ink)]/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsExpanded(false)}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      <div className="flex flex-col items-end gap-3" role="region" aria-label="WhatsApp actions">
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              transition={{ duration: 0.2, ease: [0.175, 0.885, 0.32, 1.275] }}
              className="w-72"
            >
              <motion.div
                className="bg-[var(--color-white)] rounded-[var(--radius-xl)] shadow-[var(--shadow-xl)] border border-[var(--color-whisper)] overflow-hidden"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
              >
                <div className="p-4 bg-[var(--color-gold)] text-[var(--color-ink)] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[var(--color-ink)] flex items-center justify-center">
                      <SocialIcon platform="whatsapp" size="lg" className="text-[var(--color-gold)]" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{businessName}</p>
                      <p className="text-xs opacity-80">Online · Replies in minutes</p>
                    </div>
                  </div>
                  <motion.button
                    onClick={() => setIsExpanded(false)}
                    className="p-1 rounded-full hover:bg-[var(--color-ink)]/10 transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    aria-label="Close WhatsApp menu"
                  >
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </motion.button>
                </div>

                <div className="p-2 space-y-1 max-h-[320px] overflow-y-auto">
                  {effectiveActions.map((action, index) => (
                    <motion.button
                      key={action.label}
                      onClick={() => handleActionClick(action)}
                      className="w-full p-3 flex items-center gap-3 text-left rounded-[var(--radius-lg)] hover:bg-[var(--color-gold-light)] transition-colors group"
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + index * 0.03 }}
                    >
                      <div className="w-10 h-10 rounded-[var(--radius-md)] bg-[var(--color-gold-light)] flex items-center justify-center text-[var(--color-gold)] flex-shrink-0 group-hover:bg-[var(--color-gold)] group-hover:text-[var(--color-ink)] transition-colors">
                        {action.icon}
                      </div>
                      <div className="flex-1 min-w-0 text-sm">
                        <p className="font-medium text-[var(--color-ink)] truncate">{action.label}</p>
                        <p className="text-xs text-[var(--color-slate)] truncate">{action.description}</p>
                      </div>
                      <svg className="h-4 w-4 text-[var(--color-mist)] group-hover:text-[var(--color-gold)] transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </motion.button>
                  ))}
                </div>

                <div className="px-4 py-3 border-t border-[var(--color-whisper)]">
                  <Button
                    variant="whatsapp"
                    className="w-full"
                    onClick={() => {
                      const url = `https://wa.me/${activePhone.replace(/\D/g, '')}?text=${encodeURIComponent(defaultMessage)}`;
                      window.open(url, '_blank');
                      setIsExpanded(false);
                    }}
                  >
                    <SocialIcon platform="whatsapp" size="sm" className="mr-2" />
                    Start a Conversation
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center">
          {/* Unified Luxury Floating Concierge Button */}
          <motion.button
            ref={buttonRef}
            onClick={handleMainClick}
            className={cn(
              'group relative flex items-center shadow-[0_10px_35px_rgba(0,0,0,0.22)] border transition-all duration-300',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gold)] focus-visible:ring-offset-2',
              isExpanded
                ? 'w-12 h-12 rounded-full bg-[var(--color-ink)] border-[var(--color-gold)] text-white justify-center'
                : 'rounded-full bg-[var(--color-ink)] hover:bg-[#25221E] border-[var(--color-gold)]/60 hover:border-[var(--color-gold)] p-1.5 md:pr-4 md:pl-2'
            )}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            aria-label={`Chat with ${businessName} Concierge on WhatsApp`}
            aria-expanded={isExpanded}
            aria-haspopup="true"
          >
            {isExpanded ? (
              <svg className="h-5 w-5 text-[var(--color-gold)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            ) : (
              <div className="flex items-center gap-2.5">
                {/* Gold WhatsApp Icon Disc */}
                <div className="relative w-10 h-10 rounded-full bg-[var(--color-gold)] text-[var(--color-ink)] flex items-center justify-center flex-shrink-0 shadow-sm transition-transform group-hover:scale-105">
                  <SocialIcon platform="whatsapp" size="md" />
                  <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#16A34A] border-2 border-[var(--color-ink)]" />
                </div>

                {/* Desktop Text Details */}
                <div className="hidden md:flex flex-col items-start text-left pr-1">
                  <span className="text-[10px] font-semibold tracking-[0.16em] uppercase text-[var(--color-gold)] leading-tight">
                    Vidhya's Concierge
                  </span>
                  <span className="text-[11px] text-[var(--color-whisper)] font-light leading-tight">
                    Bespoke Styling Chat
                  </span>
                </div>

                {/* Right Arrow on Desktop */}
                <svg className="hidden md:block h-3.5 w-3.5 text-[var(--color-gold)] transition-transform group-hover:translate-x-0.5 ml-0.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div>
            )}
          </motion.button>
        </div>
      </div>
    </div>
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
    const url = `https://wa.me/91XXXXXXXXXX?text=${encodeURIComponent(
      `Hi Vidhya, I'm interested in "${productName}" (₹${price.toLocaleString()}). Product ID: ${productId}`
    )}`;
    window.open(url, '_blank');
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
      Share on WhatsApp
    </motion.button>
  );
}