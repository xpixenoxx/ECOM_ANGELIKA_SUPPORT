'use client';

import { motion, AnimatePresence, LayoutGroup, MotionConfig, useMotionValue, useSpring, useTransform, useReducedMotion as useFramerReducedMotion } from 'framer-motion';
import { animate, stagger, timeline, glide, spring, scroll, inView } from 'motion';
import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Children, isValidElement, cloneElement } from 'react';
import type { AnimationTokens, MotionVariants, ScrollRevealConfig, MagneticButtonConfig, ParticleBurstConfig } from '@/types/animation';

// ============================================
// EXPORT FRAMER MOTION PRIMITIVES
// ============================================
export { motion, AnimatePresence, LayoutGroup, MotionConfig };
export { useMotionValue, useSpring, useTransform };

// ============================================
// EXPORT MOTION ONE PRIMITIVES
// ============================================
export { animate, stagger, timeline, glide, spring, scroll, inView };

// ============================================
// DEFAULT TOKENS
// ============================================
export const animationTokens: AnimationTokens = {
  easing: {
    standard: [0.25, 0.46, 0.45, 0.94],
    expressive: [0.34, 1.56, 0.64, 1],
    spring: [0.175, 0.885, 0.32, 1.275],
    decelerate: [0, 0, 0.2, 1],
    accelerate: [0.4, 0, 1, 1],
    magnetic: [0.23, 1, 0.32, 1],
  },
  duration: {
    instant: 75,
    fast: 150,
    base: 250,
    slow: 400,
    slower: 600,
    slowest: 800,
  },
  stagger: {
    base: 50,
    max: 300,
  },
  magnetic: {
    strength: 0.3,
    radius: 60,
    damping: 0.8,
    stiffness: 300,
  },
};

// ============================================
// REDUCED MOTION HOOK
// ============================================
export function useReducedMotion(): boolean {
  const framerReduced = useFramerReducedMotion();
  const [cssReduced, setCssReduced] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setCssReduced(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setCssReduced(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return framerReduced || cssReduced;
}

// ============================================
// VIEW TRANSITIONS API WRAPPER
// ============================================
export function ViewTransitionWrapper({ children }: { children: React.ReactNode }) {
  const prefersReduced = useReducedMotion();

  if (prefersReduced) return <>{children}</>;

  return (
    <MotionConfig
      transition={{
        type: 'keyframes',
        ease: animationTokens.easing.expressive,
        duration: animationTokens.duration.slow / 1000,
      }}
    >
      {children}
    </MotionConfig>
  );
}

// Page transition using View Transitions API
export function PageTransition({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const prefersReduced = useReducedMotion();

  // @ts-expect-error startViewTransition is not yet in TypeScript lib
  if (prefersReduced || !document.startViewTransition) {
    return <>{children}</>;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{
          duration: animationTokens.duration.slow / 1000,
          ease: animationTokens.easing.expressive,
        }}
        style={{ viewTransitionName: 'page-content' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

// ============================================
// COMMON VARIANTS
// ============================================
export const fadeInUp: MotionVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3, ease: animationTokens.easing.expressive },
};

export const fadeIn: MotionVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.2, ease: animationTokens.easing.standard },
};

export const scaleIn: MotionVariants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
  transition: { duration: 0.2, ease: animationTokens.easing.spring },
};

export const slideInRight: MotionVariants = {
  initial: { opacity: 0, x: 30 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -30 },
  transition: { duration: 0.3, ease: animationTokens.easing.expressive },
};

export const slideInLeft: MotionVariants = {
  initial: { opacity: 0, x: -30 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 30 },
  transition: { duration: 0.3, ease: animationTokens.easing.expressive },
};

export const staggerContainer: MotionVariants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
  exit: {
    transition: {
      staggerChildren: 0.03,
      staggerDirection: -1,
    },
  },
};

export const staggerItem: MotionVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3, ease: animationTokens.easing.expressive },
};

// ============================================
// SCROLL-DRIVEN ANIMATIONS (CSS Native)
// ============================================
export function useScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(scrollTop / docHeight);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return progress;
}

export function useElementInView(options: IntersectionObserverInit = {}) {
  const [isInView, setIsInView] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry) setIsInView(entry.isIntersecting);
      },
      { threshold: 0.1, rootMargin: '0px', ...options }
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [options.threshold, options.rootMargin]);

  return { ref, isInView };
}

// ============================================
// MAGNETIC BUTTON HOOK
// ============================================
export function useMagnetic(config: Partial<MagneticButtonConfig> = {}) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const prefersReduced = useReducedMotion();

  const mergedConfig = { ...animationTokens.magnetic, ...config };

  const xSpring = useSpring(x, {
    damping: mergedConfig.damping,
    stiffness: mergedConfig.stiffness,
  });

  const ySpring = useSpring(y, {
    damping: mergedConfig.damping,
    stiffness: mergedConfig.stiffness,
  });

  const rotateX = useTransform(ySpring, [-mergedConfig.radius, mergedConfig.radius], ['5deg', '-5deg']);
  const rotateY = useTransform(xSpring, [-mergedConfig.radius, mergedConfig.radius], ['-5deg', '5deg']);
  const scale = useTransform(
    [xSpring, ySpring],
    (values: number[]) => {
      const x = values[0]!;
      const y = values[1]!;
      return 1 + Math.min(Math.sqrt(x * x + y * y) / 200, 0.05);
    }
  );

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (prefersReduced) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const distance = Math.sqrt(
      Math.pow(e.clientX - centerX, 2) + Math.pow(e.clientY - centerY, 2)
    );

    if (distance < mergedConfig.radius) {
      x.set((e.clientX - centerX) * mergedConfig.strength);
      y.set((e.clientY - centerY) * mergedConfig.strength);
    }
  };

  const handleMouseLeave = () => {
    if (prefersReduced) return;
    x.set(0);
    y.set(0);
  };

  return {
    x: xSpring,
    y: ySpring,
    rotateX,
    rotateY,
    scale,
    handleMouseMove,
    handleMouseLeave,
    style: {
      x: xSpring,
      y: ySpring,
      rotateX,
      rotateY,
      scale,
      transformPerspective: 500,
      transformStyle: 'preserve-3d' as const,
    },
  };
}

// ============================================
// PARTICLE BURST
// ============================================
export function createParticleBurst(config: ParticleBurstConfig) {
  const particles: HTMLElement[] = [];
  const container = document.createElement('div');
  container.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 9999;
  `;
  document.body.appendChild(container);

  for (let i = 0; i < config.count; i++) {
    const particle = document.createElement('div');
    const angle = (i / config.count) * Math.PI * 2;
    const distance = config.spread * (0.5 + Math.random() * 0.5);

    particle.style.cssText = `
      position: absolute;
      width: ${config.size}px;
      height: ${config.size}px;
      border-radius: 50%;
      background: ${config.color};
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      pointer-events: none;
    `;

    container.appendChild(particle);
    particles.push(particle);

    // Animate with Motion One (uses x/y for transform)
    animate(
      particle,
      {
        x: [0, Math.cos(angle) * distance],
        y: [0, Math.sin(angle) * distance],
        scale: [0, 1, 0],
        opacity: [1, 0.5, 0],
      },
      {
        duration: config.duration / 1000,
        easing: 'ease-out',
      }
    ).finished.then(() => {
      particle.remove();
    });
  }

  // Cleanup container
  setTimeout(() => container.remove(), config.duration + 100);
}

// ============================================
// RIPPLE EFFECT
// ============================================
export function createRipple(event: React.MouseEvent<HTMLElement>, config: Partial<{ color: string; duration: number; scale: number }> = {}) {
  const { color = 'currentColor', duration = 600, scale = 2 } = config;
  const element = event.currentTarget;
  const rect = element.getBoundingClientRect();

  const ripple = document.createElement('span');
  ripple.style.cssText = `
    position: absolute;
    border-radius: 50%;
    background: ${color};
    opacity: 0.3;
    pointer-events: none;
    width: ${Math.max(rect.width, rect.height) * scale}px;
    height: ${Math.max(rect.width, rect.height) * scale}px;
    left: ${event.clientX - rect.left - Math.max(rect.width, rect.height) * scale / 2}px;
    top: ${event.clientY - rect.top - Math.max(rect.width, rect.height) * scale / 2}px;
    transform: scale(0);
  `;

  element.appendChild(ripple);

  animate(
    ripple,
    { transform: ['scale(0)', 'scale(1)'], opacity: [0.3, 0] },
    { duration: duration / 1000, easing: 'ease-out' }
  ).finished.then(() => ripple.remove());
}

// ============================================
// SCROLL REVEAL HOOK (IntersectionObserver)
// ============================================
export function useScrollReveal(config: Partial<ScrollRevealConfig> = {}) {
  const ref = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const prefersReduced = useReducedMotion();

  const mergedConfig: ScrollRevealConfig = {
    threshold: 0.1,
    rootMargin: '0px',
    once: true,
    y: 40,
    delay: 0,
    ...config,
  };

  useEffect(() => {
    if (prefersReduced || !ref.current) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry && entry.isIntersecting) {
          setIsVisible(true);
          if (mergedConfig.once) observer.unobserve(entry.target);
        } else if (!mergedConfig.once) {
          setIsVisible(false);
        }
      },
      { threshold: mergedConfig.threshold, rootMargin: mergedConfig.rootMargin }
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [prefersReduced, mergedConfig.threshold, mergedConfig.rootMargin, mergedConfig.once]);

  return {
    ref,
    isVisible,
    style: {
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? 'translateY(0)' : `translateY(${mergedConfig.y}px)`,
      transition: `all ${animationTokens.duration.slow}ms ${animationTokens.easing.expressive}`,
      transitionDelay: `${mergedConfig.delay}ms`,
    } as React.CSSProperties,
  };
}

// ============================================
// CURSOR FOLLOWER
// ============================================
export function useCursorFollower() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    if (prefersReduced) return;

    const handleMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, [prefersReduced]);

  return position;
}

// ============================================
// NUMBER ANIMATION (Count Up)
// ============================================
export function useCountUp(end: number, duration = 1000, start = 0) {
  const [count, setCount] = useState(start);
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    if (prefersReduced) {
      setCount(end);
      return;
    }

    let startTime: number;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      setCount(Math.round(start + (end - start) * eased));
      if (progress < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, [end, duration, start, prefersReduced]);

  return count;
}

// ============================================
// TEXT REVEAL (Character by character)
// ============================================
export function useTextReveal(text: string, speed = 30) {
  const [displayText, setDisplayText] = useState('');
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    if (prefersReduced) {
      setDisplayText(text);
      return;
    }

    let i = 0;
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayText(text.slice(0, i + 1));
        i++;
      } else {
        clearInterval(timer);
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed, prefersReduced]);

  return displayText;
}

// ============================================
// PARALLAX HOOK
// ============================================
export function useParallax(speed = 0.5) {
  const [offset, setOffset] = useState(0);
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    if (prefersReduced) return;

    const handleScroll = () => {
      setOffset(window.scrollY * speed);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed, prefersReduced]);

  return offset;
}

// ============================================
// STAGGER CHILDREN
// ============================================
export function staggerChildren(
  children: React.ReactNode,
  options: { delay?: number; maxDelay?: number; from?: 'start' | 'center' | 'end' | 'random' } = {}
) {
  const { delay = animationTokens.stagger.base, maxDelay = animationTokens.stagger.max, from = 'start' } = options;

  return Children.map(children, (child, index) => {
    if (!isValidElement(child)) return child;

    let childDelay = delay * index;
    if (from === 'center') {
      const center = Children.count(children) / 2;
      childDelay = delay * Math.abs(index - center);
    } else if (from === 'end') {
      childDelay = delay * (Children.count(children) - 1 - index);
    } else if (from === 'random') {
      childDelay = Math.random() * maxDelay;
    }

    return cloneElement(child as React.ReactElement, {
      style: {
        ...(child as React.ReactElement).props.style,
        animationDelay: `${childDelay}ms`,
      },
    });
  });
}

// ============================================
// EXPORTS
// ============================================
export type { AnimationTokens, MotionVariants, ScrollRevealConfig, MagneticButtonConfig, ParticleBurstConfig };