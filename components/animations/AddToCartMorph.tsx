'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { CheckIcon, ShoppingBagIcon, AlertCircleIcon, SparklesIcon } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { animationTokens, useReducedMotion, createParticleBurst } from '@/lib/animation';

interface AddToCartMorphProps {
  onAdd: (variantId: string, quantity: number) => Promise<void>;
  variantId: string;
  quantity?: number;
  price: number;
  className?: string;
  size?: 'md' | 'lg';
  showPrice?: boolean;
  variantLabel?: string;
}

export function AddToCartMorph({
  onAdd,
  variantId,
  quantity = 1,
  price,
  className = '',
  size = 'md',
  showPrice = true,
  variantLabel,
}: AddToCartMorphProps) {
  const [state, setState] = useState<'idle' | 'adding' | 'success' | 'error'>('idle');
  const [cartCount, setCartCount] = useState(0);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const prefersReduced = useReducedMotion();

  // Sync cart count from localStorage
  useEffect(() => {
    const count = parseInt(localStorage.getItem('cart_count') || '0');
    setCartCount(count);
    window.addEventListener('storage', (e) => {
      if (e.key === 'cart_count') {
        setCartCount(parseInt(e.newValue || '0'));
      }
    });
    return () => {};
  }, []);

  const handleClick = async () => {
    if (state !== 'idle') return;
    setState('adding');

    try {
      await onAdd(variantId, quantity);
      setState('success');
      setCartCount(c => c + quantity);
      localStorage.setItem('cart_count', String(cartCount + quantity));

      // Particle burst celebration
      if (!prefersReduced) {
        createParticleBurst({
          count: 12,
          color: 'var(--color-success)',
          size: 8,
          spread: 80,
          duration: 800,
        });
      }

      // Trigger mini cart peek
      window.dispatchEvent(new CustomEvent('cart:peek', { detail: { variantId } }));

      // Auto-reset after celebration
      setTimeout(() => setState('idle'), 2500);
    } catch (error) {
      console.error('Add to cart failed:', error);
      setState('error');
      setTimeout(() => setState('idle'), 3000);
    }
  };

  const sizes = {
    md: { btn: 'px-6 py-3 text-base', icon: 20, checkSize: 24 },
    lg: { btn: 'px-8 py-4 text-lg', icon: 24, checkSize: 28 },
  };

  const s = sizes[size];

  return (
    <div className={`relative ${className}`}>
      <AnimatePresence mode="wait">
        {/* Idle / Adding State */}
        {(state === 'idle' || state === 'adding') && (
          <motion.button
            ref={buttonRef}
            onClick={handleClick}
            disabled={state === 'adding'}
            className={`
              relative inline-flex items-center justify-center gap-2
              bg-gradient-to-r from-[var(--color-gold)] to-[var(--color-gold-hover)] text-[var(--color-ink)]
              font-medium tracking-wide uppercase
              rounded-[var(--radius-md)]
              shadow-[var(--shadow-gold)]
              hover:shadow-[var(--shadow-lg)]
              focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[var(--color-gold)]/40
              transition-colors duration-150
              disabled:opacity-70 disabled:cursor-wait
              ${s.btn}
            `}
            initial={false}
            animate={{
              scale: state === 'adding' ? 0.98 : 1,
            }}
            transition={{ duration: 0.1 }}
          >
            {state === 'adding' ? (
              <>
                <motion.svg
                  className="animate-spin"
                  width={s.icon} height={s.icon}
                  viewBox="0 0 24 24"
                  initial={{ rotate: 0 }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </motion.svg>
                <span>Adding...</span>
              </>
            ) : (
              <>
                <ShoppingBagIcon width={s.icon} height={s.icon} />
                <span>Add to Bag</span>
                {showPrice && (
                  <span className="text-sm font-semibold">₹{price.toLocaleString('en-IN')}</span>
                )}
                {variantLabel && (
                  <span className="text-sm text-[var(--color-gold-light)]">{variantLabel}</span>
                )}
              </>
            )}
          </motion.button>
        )}

        {/* Success State - Morph Animation */}
        {state === 'success' && (
          <motion.button
            className={`
              relative inline-flex items-center justify-center gap-2
              bg-[var(--color-success)] text-white
              font-medium tracking-wide uppercase
              rounded-[var(--radius-md)]
              ${s.btn}
            `}
            initial={{ scale: 0.8, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0.8, rotate: 10 }}
            transition={{
              type: 'spring',
              damping: 12,
              stiffness: 200,
              duration: prefersReduced ? 0.01 : 0.6
            }}
            disabled
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                type: 'spring',
                damping: 10,
                stiffness: 150,
                delay: 0.1
              }}
            >
              <CheckIcon width={s.checkSize} height={s.checkSize} />
            </motion.div>
            <motion.span
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.3 }}
            >
              Added to Bag
            </motion.span>

            {/* Particle burst */}
            <ParticleBurst count={12} color="var(--color-success)" />
          </motion.button>
        )}

        {/* Error State */}
        {state === 'error' && (
          <motion.button
            className={`
              relative inline-flex items-center justify-center gap-2
              bg-[var(--color-error)] text-white
              font-medium tracking-wide uppercase
              rounded-[var(--radius-md)]
              ${s.btn}
            `}
            initial={{ x: -10 }}
            animate={{ x: [0, -10, 10, -10, 10, 0] }}
            transition={{ duration: 0.4 }}
            disabled
          >
            <AlertCircleIcon width={s.icon} height={s.icon} />
            <span>Try Again</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Cart Count Badge */}
      <AnimatePresence>
        {cartCount > 0 && (
          <motion.div
            className="absolute -top-2 -right-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--color-error)] text-white text-xs font-bold px-1.5"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', damping: 12, stiffness: 200 }}
          >
            {cartCount > 99 ? '99+' : cartCount}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Particle burst component
function ParticleBurst({ count = 12, color = 'var(--color-gold)' }: { count?: number; color?: string }) {
  const prefersReduced = useReducedMotion();
  if (prefersReduced) return null;

  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full pointer-events-none"
          style={{
            backgroundColor: color,
            left: '50%',
            top: '50%',
            transformOrigin: 'center',
          }}
          initial={{ scale: 0, opacity: 1 }}
          animate={{
            scale: [0, 1, 0],
            opacity: [1, 0.5, 0],
            x: Math.cos((i / count) * Math.PI * 2) * 60,
            y: Math.sin((i / count) * Math.PI * 2) * 60,
          }}
          transition={{
            duration: 0.8,
            ease: animationTokens.easing.standard,
            delay: i * 0.02
          }}
        />
      ))}
    </>
  );
}