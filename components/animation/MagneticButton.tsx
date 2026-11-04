'use client';

import { motion, useMotionValue, useSpring, useTransform, useReducedMotion, MotionValue } from 'framer-motion';
import { useRef, useEffect, forwardRef, ReactNode } from 'react';
import { animationTokens } from '@/lib/animation';
import { animate } from 'motion';

interface MagneticButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'whatsapp' | 'gold' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
  loading?: boolean;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  disableMagnetic?: boolean;
}

export const MagneticButton = forwardRef<HTMLButtonElement, MagneticButtonProps>(
  (
    {
      children,
      onClick,
      className = '',
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      disabled = false,
      loading = false,
      iconLeft,
      iconRight,
      disableMagnetic = false,
      ...props
    },
    ref
  ) => {
    const buttonRef = useRef<HTMLButtonElement>(null);
    const prefersReduced = useReducedMotion();

    // Magnetic effect values - properly typed
    const x = useMotionValue<number>(0);
    const y = useMotionValue<number>(0);

    const springConfig = {
      damping: animationTokens.magnetic.damping,
      stiffness: animationTokens.magnetic.stiffness,
    };

    const xSpring = useSpring(x, springConfig);
    const ySpring = useSpring(y, springConfig);
    const rotateX = useTransform(ySpring, [-50, 50], ['5deg', '-5deg']);
    const rotateY = useTransform(xSpring, [-50, 50], ['-5deg', '5deg']);
    const scale = useTransform(
      [xSpring, ySpring],
      (([xVal = 0, yVal = 0]: number[]) => 1 + Math.min(Math.sqrt(xVal * xVal + yVal * yVal) / 200, 0.05)) as any
    );

    const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (prefersReduced || disabled || loading || disableMagnetic) return;
      const rect = buttonRef.current!.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const distance = Math.sqrt(
        Math.pow(e.clientX - centerX, 2) + Math.pow(e.clientY - centerY, 2)
      );

      if (distance < animationTokens.magnetic.radius) {
        x.set(e.clientX - centerX);
        y.set(e.clientY - centerY);
      }
    };

    const handleMouseLeave = () => {
      if (prefersReduced || disableMagnetic) return;
      x.set(0);
      y.set(0);
    };

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled || loading) return;

      // Ripple effect
      const ripple = document.createElement('span');
      ripple.className = 'btn-ripple';
      const rect = buttonRef.current!.getBoundingClientRect();
      ripple.style.left = `${e.clientX - rect.left}px`;
      ripple.style.top = `${e.clientY - rect.top}px`;
      buttonRef.current?.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);

      onClick?.(e);
    };

    const variants = {
      primary: 'bg-gradient-to-r from-[var(--color-gold)] to-[var(--color-gold-hover)] text-[var(--color-ink)] hover:from-[var(--color-gold-hover)] hover:to-[var(--color-gold)] shadow-[var(--shadow-gold)]',
      secondary: 'bg-transparent border-2 border-[var(--color-gold)] text-[var(--color-gold)] hover:bg-[var(--color-gold-light)]',
      ghost: 'bg-transparent text-[var(--color-gold)] hover:bg-[var(--color-gold-light)]',
      whatsapp: 'bg-[#25D366] text-white hover:bg-[#128C7E] shadow-[0_8px_24px_rgba(37,211,102,0.3)]',
      gold: 'bg-[var(--color-ink)] text-[var(--color-gold)] hover:bg-[var(--color-charcoal)] border border-[var(--color-gold)]',
      outline: 'border-2 border-[var(--color-whisper)] text-[var(--color-ink)] hover:border-[var(--color-gold)] hover:text-[var(--color-gold)]',
    };

    const sizes = {
      sm: 'px-4 py-2 text-sm gap-1.5',
      md: 'px-6 py-3 text-base gap-2',
      lg: 'px-8 py-4 text-lg gap-2.5',
      xl: 'px-10 py-5 text-xl gap-3',
    };

    const mergedRef = (el: HTMLButtonElement | null) => {
      // @ts-expect-error - RefObject.current is readonly in TypeScript but mutable at runtime
      buttonRef.current = el;
      if (typeof ref === 'function') {
        ref(el);
      } else if (ref) {
        // RefObject.current is readonly in TypeScript but mutable at runtime
        (ref as { current: HTMLButtonElement | null }).current = el;
      }
    };

    return (
      // @ts-expect-error - Framer Motion v11 type conflict with whileTap/whileHover
      <motion.button
        ref={mergedRef}
        style={{
          x: xSpring,
          y: ySpring,
          rotateX,
          rotateY,
          scale,
          transformPerspective: 500,
          transformStyle: 'preserve-3d',
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        onMouseDown={() => !prefersReduced && !disabled && !loading && animate(buttonRef.current!, { scale: 0.96 }, { duration: 0.1 })}
        onMouseUp={() => !prefersReduced && !disabled && !loading && animate(buttonRef.current!, { scale: 1 }, { duration: 0.1, easing: animationTokens.easing.spring as any })}
        disabled={disabled || loading}
        className={`
          relative inline-flex items-center justify-center font-medium tracking-wide
          uppercase transition-colors duration-150
          focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[var(--color-gold)]/40
          disabled:opacity-50 disabled:cursor-not-allowed
          overflow-hidden
          ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}
        `}
        whileHover={{
          scale: prefersReduced ? 1 : 1.02,
          boxShadow: variant === 'primary' || variant === 'whatsapp' ? 'var(--shadow-lg)' : 'var(--shadow-md)'
        }}
        whileTap={{ scale: prefersReduced ? 1 : 0.98 }}
        {...props}
      >
        {loading && (
          <motion.span
            className="flex items-center gap-1.5"
            initial={{ opacity: 0, rotate: -90 }}
            animate={{ opacity: 1, rotate: 0 }}
            exit={{ opacity: 0, rotate: 90 }}
            transition={{ duration: 0.2 }}
          >
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span>Processing...</span>
          </motion.span>
        )}
        {!loading && (
          <>
            {iconLeft && <span className="shrink-0">{iconLeft}</span>}
            <span>{children}</span>
            {iconRight && <span className="shrink-0">{iconRight}</span>}
          </>
        )}
        {/* Ripple container */}
        <span className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true" />
      </motion.button>
    );
  }
);

MagneticButton.displayName = 'MagneticButton';