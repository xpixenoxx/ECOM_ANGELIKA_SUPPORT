'use client';

import { motion, AnimatePresence, HTMLMotionProps } from 'framer-motion';
import { forwardRef, ReactNode, useState, useEffect, useRef, isValidElement, cloneElement } from 'react';
import { cn } from '@/lib/utils/cn';
import { hoverVariants, tapVariants, focusVariants, loadingVariants, badgeVariants, skeletonVariants } from '@/lib/animations';

// ============================================
// Ripple Effect
// ============================================

interface RippleProps {
  children: ReactNode;
  className?: string;
  color?: string;
  onClick?: () => void;
}

export function Ripple({ children, className, color = 'currentColor', onClick }: RippleProps) {
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([]);

  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();

    setRipples((prev) => [...prev, { x, y, id }]);
    onClick?.();

    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    }, 600);
  };

  return (
    <div className={cn('relative overflow-hidden', className)} onClick={handleClick}>
      {children}
      {ripples.map((ripple) => (
        <motion.div
          key={ripple.id}
          className="absolute pointer-events-none rounded-full"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: 0,
            height: 0,
            backgroundColor: color,
            opacity: 0.3,
            transform: 'translate(-50%, -50%)',
          }}
          initial={{ scale: 0, opacity: 0.3 }}
          animate={{ scale: 20, opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      ))}
    </div>
  );
}

// ============================================
// Hover Reveal
// ============================================

interface HoverRevealProps {
  children: ReactNode;
  reveal: ReactNode;
  className?: string;
  direction?: 'up' | 'down' | 'left' | 'right' | 'fade';
  speed?: number;
}

export function HoverReveal({
  children,
  reveal,
  className,
  direction = 'up',
  speed = 300,
}: HoverRevealProps) {
  const [isHovered, setIsHovered] = useState(false);

  const transforms = {
    up: { hidden: { y: '100%', opacity: 0 }, visible: { y: 0, opacity: 1 } },
    down: { hidden: { y: '-100%', opacity: 0 }, visible: { y: 0, opacity: 1 } },
    left: { hidden: { x: '100%', opacity: 0 }, visible: { x: 0, opacity: 1 } },
    right: { hidden: { x: '-100%', opacity: 0 }, visible: { x: 0, opacity: 1 } },
    fade: { hidden: { opacity: 0 }, visible: { opacity: 1 } },
  };

  return (
    <div
      className={cn('relative overflow-hidden', className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div
        animate={isHovered ? { y: direction === 'up' ? -8 : direction === 'down' ? 8 : 0 } : { y: 0 }}
        transition={{ duration: speed / 1000, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        {children}
      </motion.div>
      <AnimatePresence>
        {isHovered && (
          <motion.div
            key="reveal"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={transforms[direction]}
            transition={{ duration: speed / 1000, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="absolute inset-0 flex items-center justify-center"
          >
            {reveal}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================
// Animated Counter
// ============================================

interface CounterProps {
  value: number;
  className?: string;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  separator?: string;
  onComplete?: () => void;
}

export function Counter({
  value,
  className,
  duration = 1.5,
  decimals = 0,
  prefix = '',
  suffix = '',
  separator = ',',
  onComplete,
}: CounterProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting && !hasAnimated) {
          animateValue();
          setHasAnimated(true);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [hasAnimated]);

  const animateValue = () => {
    const startTime = performance.now();
    const startValue = 0;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOut cubic
      const current = startValue + (value - startValue) * eased;

      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayValue(value);
        onComplete?.();
      }
    };

    requestAnimationFrame(animate);
  };

  const formatted = displayValue.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    useGrouping: true,
  });

  return (
    <div ref={ref} className={cn('inline-block', className)}>
      {prefix}
      <span className="font-mono tabular-nums">{formatted}</span>
      {suffix}
    </div>
  );
}

// ============================================
// Progress Ring
// ============================================

interface ProgressRingProps {
  progress: number; // 0-1
  size?: number;
  strokeWidth?: number;
  className?: string;
  color?: string;
  backgroundColor?: string;
  showValue?: boolean;
  animate?: boolean;
}

export function ProgressRing({
  progress,
  size = 60,
  strokeWidth = 4,
  className,
  color = 'var(--color-gold)',
  backgroundColor = 'var(--color-whisper)',
  showValue = false,
  animate = true,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - progress);

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={animate ? circumference : offset}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
          style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
        />
      </svg>
      {showValue && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-mono font-medium text-[var(--color-ink)]">{Math.round(progress * 100)}%</span>
        </div>
      )}
    </div>
  );
}

// ============================================
// Floating Label Input
// ============================================

interface FloatingLabelProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
  icon?: ReactNode;
}

export function FloatingLabel({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  error,
  disabled,
  className,
  icon,
}: FloatingLabelProps) {
  const [isFocused, setIsFocused] = useState(false);
  const hasValue = value.length > 0;

  return (
    <div className={cn('relative', className)}>
      {icon && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-mist)] transition-colors duration-200 peer-focus:text-[var(--color-gold)]">
          {icon}
        </div>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={hasValue || isFocused ? '' : placeholder}
        disabled={disabled}
        className={cn(
          'w-full px-4 py-3.5 bg-[var(--color-white)] border rounded-[var(--radius-lg)]',
          'text-[var(--color-ink)] placeholder-transparent',
          'transition-all duration-200 ease-[0.25,0.46,0.45,0.94]',
          'focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]/20 focus:border-[var(--color-gold)]',
          'disabled:bg-[var(--color-cream)] disabled:cursor-not-allowed',
          icon && 'pl-12',
          error && 'border-[var(--color-error)] focus:border-[var(--color-error)] focus:ring-[var(--color-error)]/20',
          className
        )}
      />
      <label
        className={cn(
          'absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-slate)] pointer-events-none transition-all duration-200 ease-[0.25,0.46,0.45,0.94]',
          'origin-left',
          hasValue || isFocused
            ? 'top-0 -translate-y-1/2 scale-75 text-[var(--color-gold)]'
            : 'text-[var(--color-slate)]',
          error && 'text-[var(--color-error)]'
        )}
      >
        {label}
      </label>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-1.5 text-sm text-[var(--color-error)]"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}

// ============================================
// Toggle Switch with Animation
// ============================================

interface AnimatedToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
}

export function AnimatedToggle({
  checked,
  onChange,
  label,
  description,
  size = 'md',
  className,
  disabled,
}: AnimatedToggleProps) {
  const sizes = {
    sm: { track: 'w-8 h-5', thumb: 'w-4 h-4', translate: 'translate-x-4' },
    md: { track: 'w-11 h-6', thumb: 'w-5 h-5', translate: 'translate-x-5' },
    lg: { track: 'w-14 h-7', thumb: 'w-6 h-6', translate: 'translate-x-7' },
  };

  const s = sizes[size];

  return (
    <label className={cn('flex items-center gap-3 cursor-pointer', disabled && 'opacity-50 cursor-not-allowed', className)}>
      <motion.button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={cn('relative flex-shrink-0 rounded-full', s.track)}
        style={{
          backgroundColor: checked ? 'var(--color-gold)' : 'var(--color-whisper)',
        }}
      >
        <motion.span
          className={cn('absolute top-1/2 left-1 -translate-y-1/2 rounded-full bg-white shadow-[0_2px_4px_rgba(0,0,0,0.1)]', s.thumb)}
          animate={{ x: checked ? s.translate : 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </motion.button>
      {(label || description) && (
        <div className="flex flex-col">
          {label && <span className="font-medium text-[var(--color-ink)]">{label}</span>}
          {description && <span className="text-sm text-[var(--color-slate)]">{description}</span>}
        </div>
      )}
    </label>
  );
}

// ============================================
// Heart/like Button
// ============================================

interface LikeButtonProps {
  liked: boolean;
  count?: number;
  onChange: (liked: boolean) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function LikeButton({ liked, count = 0, onChange, className, size = 'md' }: LikeButtonProps) {
  const sizes = {
    sm: { icon: 18, count: 'text-xs' },
    md: { icon: 22, count: 'text-sm' },
    lg: { icon: 28, count: 'text-base' },
  };

  const s = sizes[size];

  return (
    <motion.button
      onClick={() => onChange(!liked)}
      whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
      whileTap={{ scale: 0.9 }}
      className={cn('flex items-center gap-1.5 p-1.5 rounded-[var(--radius-lg)]', className)}
      style={{
        backgroundColor: liked ? 'rgba(239, 68, 68, 0.1)' : 'transparent',
        color: liked ? 'var(--color-error)' : 'var(--color-slate)',
      }}
    >
      <motion.svg
        width={s.icon}
        height={s.icon}
        viewBox="0 0 24 24"
        fill={liked ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth={liked ? 0 : 2}
        strokeLinecap="round"
        strokeLinejoin="round"
        animate={{ scale: liked ? [1, 1.3, 1] : 1 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="transition-all duration-200"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </motion.svg>
      {count > 0 && (
        <motion.span
          className={cn('font-mono font-medium', s.count)}
          animate={{ scale: liked ? 1.2 : 1 }}
          transition={{ duration: 0.2 }}
        >
          {count}
        </motion.span>
      )}
    </motion.button>
  );
}

// ============================================
// Shimmer Loading
// ============================================

interface ShimmerProps {
  className?: string;
  variant?: 'text' | 'card' | 'circle' | 'rect';
  width?: string | number;
  height?: string | number;
  style?: React.CSSProperties;
}

export function Shimmer({ className, variant = 'text', width = '100%', height = '1rem' }: ShimmerProps) {
  const variants = {
    text: { borderRadius: 'var(--radius-sm)' },
    card: { borderRadius: 'var(--radius-xl)' },
    circle: { borderRadius: '50%' },
    rect: { borderRadius: 'var(--radius-lg)' },
  };

  return (
    <motion.div
      className={cn('bg-[var(--color-whisper)] overflow-hidden', className)}
      style={{
        width,
        height,
        ...variants[variant],
      }}
      animate={{ backgroundColor: ['var(--color-whisper)', 'var(--color-cream)', 'var(--color-whisper)'] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
    />
  );
}

interface ShimmerTextProps {
  lines?: number;
  className?: string;
  maxWidth?: string;
}

export function ShimmerText({ lines = 3, className, maxWidth = '80%' }: ShimmerTextProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Shimmer
          key={i}
          variant="text"
          width={i === lines - 1 ? maxWidth : '100%'}
          height={16}
        />
      ))}
    </div>
  );
}

interface ShimmerCardProps {
  className?: string;
  aspectRatio?: string;
}

export function ShimmerCard({ className, aspectRatio = '4/5' }: ShimmerCardProps) {
  return (
    <div className={cn('space-y-3', className)}>
      <Shimmer variant="card" width="100%" style={{ aspectRatio }} />
      <Shimmer variant="text" width="70%" />
      <Shimmer variant="text" width="50%" />
      <Shimmer variant="text" width="40%" />
    </div>
  );
}

// ============================================
// Floating Action Button
// ============================================

interface FloatingActionProps {
  children: ReactNode;
  className?: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  offset?: number;
  onClick?: () => void;
}

const positions = {
  'bottom-right': 'bottom-6 right-6',
  'bottom-left': 'bottom-6 left-6',
  'top-right': 'top-6 right-6',
  'top-left': 'top-6 left-6',
};

export function FloatingAction({
  children,
  className,
  position = 'bottom-right',
  offset = 24,
  onClick,
}: FloatingActionProps) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.1, boxShadow: '0 10px 30px -5px rgba(201, 168, 76, 0.4)' }}
      whileTap={{ scale: 0.95 }}
      initial={{ scale: 0, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0, opacity: 0, y: 20 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25, delay: 0.3 }}
      className={cn(
        'fixed z-50 flex items-center justify-center rounded-full',
        'bg-[var(--color-gold)] text-[var(--color-white)] shadow-[0_4px_20px_rgba(201,168,76,0.4)]',
        'transition-all duration-300',
        positions[position],
        className
      )}
      style={{ width: 56, height: 56 }}
    >
      {children}
    </motion.button>
  );
}

// ============================================
// Parallax Scroll
// ============================================

interface ParallaxProps {
  children: ReactNode;
  className?: string;
  speed?: number;
  offset?: number;
}

export function Parallax({ children, className, speed = 0.5, offset = 0 }: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [y, setY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const scrollY = (viewportHeight - rect.top) / (viewportHeight + rect.height);
        setY((scrollY - 0.5) * 200 * speed + offset);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed, offset]);

  return (
    <div ref={ref} className={cn('relative overflow-hidden', className)}>
      <motion.div
        style={{ transform: `translateY(${y}px)`, willChange: 'transform' }}
        className="absolute inset-0 z-0"
      >
        {children}
      </motion.div>
    </div>
  );
}

// ============================================
// Tilt Effect
// ============================================

interface TiltProps {
  children: ReactNode;
  className?: string;
  maxTilt?: number;
  perspective?: number;
  scale?: number;
  glare?: boolean;
  maxGlare?: number;
}

export function Tilt({
  children,
  className,
  maxTilt = 10,
  perspective = 1000,
  scale = 1.02,
  glare = true,
  maxGlare = 0.2,
}: TiltProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = (e.clientX - centerX) / (rect.width / 2);
      const deltaY = (e.clientY - centerY) / (rect.height / 2);

      setTilt({
        x: deltaY * maxTilt,
        y: -deltaX * maxTilt,
      });
    };

    const handleMouseLeave = () => {
      setTilt({ x: 0, y: 0 });
    };

    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [maxTilt]);

  const glareStyle = glare
    ? {
        background: `linear-gradient(135deg, rgba(255,255,255,${maxGlare * (tilt.y / maxTilt + 1) / 2}) 0%, transparent 50%)`,
        opacity: 0.5,
      }
    : {};

  return (
    <div
      ref={ref}
      className={cn('relative transform-gpu', className)}
      style={{
        perspective,
        transformStyle: 'preserve-3d',
      }}
    >
      <motion.div
        className="relative z-10"
        style={{
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale3d(${scale}, ${scale}, ${scale})`,
          transformStyle: 'preserve-3d',
          willChange: 'transform',
        }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      >
        {children}
      </motion.div>
      {glare && (
        <motion.div
          className="absolute inset-0 pointer-events-none rounded-inherit"
          style={glareStyle}
          animate={{ opacity: tilt.x !== 0 || tilt.y !== 0 ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        />
      )}
    </div>
  );
}

// ============================================
// Scroll Progress
// ============================================

interface ScrollProgressProps {
  className?: string;
  color?: string;
  height?: number;
}

export function ScrollProgress({ className, color = 'var(--color-gold)', height = 3 }: ScrollProgressProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(scrollTop / docHeight);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.div
      className={cn('fixed top-0 left-0 right-0 z-50', className)}
      style={{ height, transformOrigin: 'left center' }}
      animate={{ scaleX: progress }}
      transition={{ duration: 0.1, ease: 'linear' }}
    >
      <div className="h-full rounded-full" style={{ backgroundColor: color }} />
    </motion.div>
  );
}

// ============================================
// Typewriter Effect
// ============================================

interface TypewriterProps {
  text: string;
  className?: string;
  speed?: number;
  delay?: number;
  cursor?: boolean;
  cursorChar?: string;
  onComplete?: () => void;
}

export function Typewriter({
  text,
  className,
  speed = 50,
  delay = 0,
  cursor = true,
  cursorChar = '|',
  onComplete,
}: TypewriterProps) {
  const [displayText, setDisplayText] = useState('');
  const [showCursor, setShowCursor] = useState(cursor);
  const indexRef = useRef(0);

  useEffect(() => {
    setDisplayText('');
    indexRef.current = 0;

    const timer = setTimeout(() => {
      const type = () => {
        if (indexRef.current < text.length) {
          setDisplayText(text.slice(0, indexRef.current + 1));
          indexRef.current++;
          setTimeout(type, speed);
        } else {
          if (cursor) {
            setInterval(() => setShowCursor((prev) => !prev), 530);
          }
          onComplete?.();
        }
      };
      type();
    }, delay);

    return () => clearTimeout(timer);
  }, [text, speed, delay, cursor, onComplete]);

  return (
    <span className={cn('inline-block', className)}>
      {displayText}
      {cursor && showCursor && (
        <motion.span
          className="ml-1 font-mono"
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          {cursorChar}
        </motion.span>
      )}
    </span>
  );
}

// ============================================
// Confetti Burst
// ============================================

interface ConfettiProps {
  trigger: boolean;
  colors?: string[];
  count?: number;
  className?: string;
}

export function Confetti({ trigger, colors = ['var(--color-gold)', 'var(--color-success)', 'var(--color-info)', 'var(--color-warning)', 'var(--color-primary)'], count = 50, className }: ConfettiProps) {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; color: string; rotation: number; size: number }>>([]);

  useEffect(() => {
    if (trigger && colors.length > 0) {
      const newParticles = Array.from({ length: count }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: -10,
        color: colors[Math.floor(Math.random() * colors.length)] as string,
        rotation: Math.random() * 360,
        size: Math.random() * 8 + 4,
      }));
      setParticles(newParticles);

      setTimeout(() => setParticles([]), 3000);
    }
  }, [trigger, count, colors]);

  return (
    <div className={cn('fixed inset-0 pointer-events-none z-50 overflow-hidden', className)}>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: Math.random() > 0.5 ? '50%' : '0',
            transform: `rotate(${p.rotation}deg)`,
            opacity: 1,
          }}
          initial={{ opacity: 1, y: 0, rotate: p.rotation }}
          animate={{ y: '120vh', opacity: 0, rotate: p.rotation + 720 }}
          transition={{ duration: 2 + Math.random() * 2, ease: 'easeIn' }}
        />
      ))}
    </div>
  );
}

// ============================================
// Tooltip with Animation
// ============================================

interface AnimatedTooltipProps {
  children: ReactNode;
  content: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
  delay?: number;
}

export function AnimatedTooltip({
  children,
  content,
  position = 'top',
  className,
  delay = 200,
}: AnimatedTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const positions = {
    top: { x: 0, y: -8, arrow: 'bottom-0 left-1/2 -translate-x-1/2 translate-y-full rotate-45' },
    bottom: { x: 0, y: 8, arrow: 'top-0 left-1/2 -translate-x-1/2 -translate-y-full rotate-45' },
    left: { x: -8, y: 0, arrow: 'right-0 top-1/2 -translate-y-1/2 translate-x-full rotate-45' },
    right: { x: 8, y: 0, arrow: 'left-0 top-1/2 -translate-y-1/2 -translate-x-full rotate-45' },
  };

  const pos = positions[position];

  return (
    <div className={cn('relative inline-block', className)}>
      {isValidElement(children) ? cloneElement(children as any, {
        onMouseEnter: () => {
          timeoutRef.current = setTimeout(() => setIsVisible(true), delay);
        },
        onMouseLeave: () => {
          clearTimeout(timeoutRef.current);
          setIsVisible(false);
        },
      }) : children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            key="tooltip"
            initial={{ opacity: 0, scale: 0.9, [position === 'top' || position === 'bottom' ? 'y' : 'x']: pos[position === 'top' || position === 'bottom' ? 'y' : 'x'] * 2 }}
            animate={{ opacity: 1, scale: 1, [position === 'top' || position === 'bottom' ? 'y' : 'x']: pos[position === 'top' || position === 'bottom' ? 'y' : 'x'] }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className={cn(
              'absolute z-50 px-3 py-2 text-sm font-medium text-[var(--color-white)] bg-[var(--color-ink)] rounded-[var(--radius-lg)]',
              'whitespace-nowrap shadow-[0_10px_30px_rgba(0,0,0,0.2)]',
              position === 'top' && 'bottom-full left-1/2 -translate-x-1/2 mb-2',
              position === 'bottom' && 'top-full left-1/2 -translate-x-1/2 mt-2',
              position === 'left' && 'right-full top-1/2 -translate-y-1/2 mr-2',
              position === 'right' && 'left-full top-1/2 -translate-y-1/2 ml-2'
            )}
          >
            {content}
            <motion.div
              className={cn('absolute w-2 h-2 bg-[var(--color-ink)] rotate-45', pos.arrow)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}