'use client';

import { motion, HTMLMotionProps } from 'framer-motion';
import { useRef, useState, useEffect, ReactNode, isValidElement, cloneElement, Children } from 'react';
import { cn } from '@/lib/utils/cn';
import { scrollRevealVariants } from '@/lib/animations';

type ScrollRevealVariant = keyof typeof scrollRevealVariants;

interface ScrollRevealProps extends Omit<HTMLMotionProps<'div'>, 'initial' | 'animate' | 'variants' | 'transition'> {
  children: ReactNode;
  variant?: ScrollRevealVariant;
  threshold?: number | number[];
  rootMargin?: string;
  triggerOnce?: boolean;
  delay?: number;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
  onReveal?: () => void;
}

export function ScrollReveal({
  children,
  variant = 'fadeUp',
  threshold = 0.1,
  rootMargin = '0px 0px -50px 0px',
  triggerOnce = true,
  delay = 0,
  className,
  as: Component = 'div',
  onReveal,
  ...props
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry && entry.isIntersecting) {
          if (!hasTriggered) {
            setIsVisible(true);
            setHasTriggered(true);
            onReveal?.();
          }
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold, rootMargin, triggerOnce, onReveal, hasTriggered]);

  const variants = scrollRevealVariants[variant];

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isVisible ? 'visible' : 'hidden'}
      variants={variants}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}

interface ScrollRevealTextProps {
  children: ReactNode;
  className?: string;
  variant?: 'chars' | 'words' | 'lines';
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
  delay?: number;
  stagger?: number;
}

export function ScrollRevealText({
  children,
  className,
  variant = 'words',
  threshold = 0.1,
  rootMargin = '0px 0px -50px 0px',
  triggerOnce = true,
  delay = 0,
  stagger = 0.03,
}: ScrollRevealTextProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry && entry.isIntersecting) {
          if (!hasTriggered) {
            setIsVisible(true);
            setHasTriggered(true);
          }
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold, rootMargin, triggerOnce, hasTriggered]);

  const text = typeof children === 'string' ? children : String(children);
  const splitText = (str: string) => {
    switch (variant) {
      case 'chars':
        return str.split('').map((char, i) => <span key={i} className="inline-block">{char === ' ' ? ' ' : char}</span>);
      case 'words':
        return str.split(' ').map((word, i) => <span key={i} className="inline-block">{word} </span>);
      case 'lines':
        return str.split('\n').map((line, i) => <span key={i} className="block">{line}</span>);
    }
  };

  const items = splitText(text);

  return (
    <div ref={ref} className={cn(className)}>
      {items.map((item, index) => (
        <motion.span
          key={index}
          initial={{ opacity: 0, y: variant === 'chars' ? 30 : 20, rotateX: -90 }}
          animate={isVisible ? { opacity: 1, y: 0, rotateX: 0 } : { opacity: 0, y: variant === 'chars' ? 30 : 20, rotateX: -90 }}
          transition={{
            type: 'spring',
            stiffness: 400,
            damping: 25,
            delay: delay + index * stagger,
          }}
          className="inline-block"
        >
          {item}
        </motion.span>
      ))}
    </div>
  );
}

interface ScrollProgressProps {
  className?: string;
  color?: string;
  height?: number;
  zIndex?: number;
}

export function ScrollProgress({ className, color = 'var(--color-gold)', height = 3, zIndex = 50 }: ScrollProgressProps) {
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
      className={cn('fixed top-0 left-0 right-0', className)}
      style={{ height, zIndex, transformOrigin: 'left center' }}
      animate={{ scaleX: progress }}
      transition={{ duration: 0.1, ease: 'linear' }}
      aria-hidden="true"
    >
      <div className="h-full rounded-full" style={{ backgroundColor: color }} />
    </motion.div>
  );
}

interface ParallaxProps {
  children: ReactNode;
  className?: string;
  speed?: number;
  offset?: number;
  direction?: 'vertical' | 'horizontal';
}

export function Parallax({ children, className, speed = 0.3, offset = 0, direction = 'vertical' }: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState(0);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleScroll = () => {
      const rect = element.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const scrollProgress = (viewportHeight - rect.top) / (viewportHeight + rect.height);
      const clampedProgress = Math.max(0, Math.min(1, scrollProgress));
      setTransform((clampedProgress - 0.5) * 200 * speed + offset);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed, offset]);

  return (
    <div ref={ref} className={cn('relative overflow-hidden', className)}>
      <motion.div
        style={{
          transform: direction === 'vertical' ? `translateY(${transform}px)` : `translateX(${transform}px)`,
          willChange: 'transform',
        }}
        className="absolute inset-0 z-0"
      >
        {children}
      </motion.div>
    </div>
  );
}

interface ParallaxLayerProps {
  children: ReactNode;
  speed: number;
  offset?: number;
  className?: string;
}

export function ParallaxLayer({ children, speed, offset = 0, className }: ParallaxLayerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [y, setY] = useState(0);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleScroll = () => {
      const rect = element.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const scrollProgress = (viewportHeight - rect.top) / (viewportHeight + rect.height);
      const clampedProgress = Math.max(0, Math.min(1, scrollProgress));
      setY((clampedProgress - 0.5) * 300 * speed + offset);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed, offset]);

  return (
    <motion.div
      ref={ref}
      style={{ transform: `translateY(${y}px)`, willChange: 'transform' }}
      className={cn('absolute inset-0', className)}
    >
      {children}
    </motion.div>
  );
}

interface ScrollIndicatorProps {
  className?: string;
  color?: string;
  size?: number;
  bounce?: boolean;
}

export function ScrollIndicator({ className, color = 'var(--color-slate)', size = 24, bounce = true }: ScrollIndicatorProps) {
  return (
    <motion.div
      className={cn('flex flex-col items-center animate-bounce', bounce && 'animate-bounce', className)}
      style={{ animationDuration: bounce ? '2s' : '0s' }}
      aria-hidden="true"
    >
      <motion.svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <path d="M12 5v14M19 12l-7 7-7-7" />
      </motion.svg>
      <span className="text-xs text-[var(--color-mist)] mt-1 uppercase tracking-wider">Scroll</span>
    </motion.div>
  );
}

interface ViewportSpyProps {
  children: (isInView: boolean, entry: IntersectionObserverEntry | null) => ReactNode;
  threshold?: number | number[];
  rootMargin?: string;
  triggerOnce?: boolean;
  onEnter?: () => void;
  onLeave?: () => void;
}

export function ViewportSpy({
  children,
  threshold = 0.1,
  rootMargin = '0px',
  triggerOnce = false,
  onEnter,
  onLeave,
}: ViewportSpyProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        const inView = entry.isIntersecting;
        setIsInView(inView);
        setEntry(entry);

        if (inView) {
          onEnter?.();
          if (triggerOnce) observer.unobserve(element);
        } else {
          onLeave?.();
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold, rootMargin, triggerOnce, onEnter, onLeave]);

  return <div ref={ref}>{children(isInView, entry)}</div>;
}

interface ScrollSnapProps {
  children: ReactNode;
  className?: string;
  direction?: 'x' | 'y';
  mandatory?: boolean;
}

export function ScrollSnap({ children, className, direction = 'y', mandatory = true }: ScrollSnapProps) {
  return (
    <div
      className={cn(
        'snap-mandatory overflow-auto',
        direction === 'x' ? 'flex snap-x' : 'snap-y',
        className
      )}
      style={{
        scrollSnapType: `${direction} ${mandatory ? 'mandatory' : 'proximity'}`,
      }}
    >
      {Children.map(children, (child) =>
        isValidElement(child)
          ? cloneElement(child as any, {
              className: cn(child.props.className, 'snap-start', direction === 'x' ? 'flex-shrink-0' : ''),
            })
          : child
      )}
    </div>
  );
}

interface ScrollToTopProps {
  threshold?: number;
  className?: string;
  children?: ReactNode;
}

export function ScrollToTop({ threshold = 300, className, children }: ScrollToTopProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > threshold);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          onClick={scrollToTop}
          initial={{ opacity: 0, scale: 0, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0, y: 20 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className={cn(
            'fixed bottom-6 right-6 z-40 flex items-center justify-center rounded-full',
            'bg-[var(--color-gold)] text-[var(--color-white)] shadow-[0_4px_20px_rgba(201,168,76,0.4)]',
            'p-3 transition-all duration-200',
            className
          )}
          aria-label="Scroll to top"
        >
          {children || (
            <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path d="M18 15l-6-6-6 6" />
            </svg>
          )}
        </motion.button>
      )}
    </AnimatePresence>
  );
}

import { AnimatePresence } from 'framer-motion';

// ============================================
// Reveal on Scroll (Section Level)
// ============================================

interface RevealSectionProps {
  children: ReactNode;
  className?: string;
  variant?: ScrollRevealVariant;
  staggerDelay?: number;
  threshold?: number;
  rootMargin?: string;
}

export function RevealSection({
  children,
  className,
  variant = 'fadeUp',
  staggerDelay = 0.08,
  threshold = 0.1,
  rootMargin = '0px 0px -100px 0px',
}: RevealSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry && entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(element);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  const sectionVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    fade: { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.5 } } },
    fadeUp: { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] } } },
    fadeDown: { hidden: { opacity: 0, y: -30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] } } },
    scale: { hidden: { opacity: 0, scale: 0.95 }, visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } } },
  } as const;

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isVisible ? 'visible' : 'hidden'}
      variants={sectionVariants}
      className={cn(className)}
    >
      {Children.map(children, (child, index) =>
        isValidElement(child)
          ? cloneElement(child as any, {
              variants: itemVariants[variant as keyof typeof itemVariants],
              custom: index,
            })
          : child
      )}
    </motion.div>
  );
}