'use client';

import { Variants, Transition } from 'framer-motion';

// ============================================
// Spring Configurations
// ============================================

export const springConfig = {
  gentle: { type: 'spring' as const, stiffness: 120, damping: 18, mass: 1 },
  smooth: { type: 'spring' as const, stiffness: 200, damping: 20, mass: 1 },
  snappy: { type: 'spring' as const, stiffness: 300, damping: 25, mass: 0.8 },
  fast: { type: 'spring' as const, stiffness: 450, damping: 28, mass: 0.6 },
  bouncy: { type: 'spring' as const, stiffness: 400, damping: 18, mass: 1 },
  wobbly: { type: 'spring' as const, stiffness: 500, damping: 15, mass: 1 },
  stiff: { type: 'spring' as const, stiffness: 600, damping: 30, mass: 0.5 },
} as const;

export const transitionPresets = {
  fast: { duration: 0.15, ease: [0.25, 0.46, 0.45, 0.94] } as Transition,
  normal: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] } as Transition,
  slow: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } as Transition,
  verySlow: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] } as Transition,
} as const;

// ============================================
// Page Transition Variants
// ============================================

export const pageVariants: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export const pageTransition = {
  initial: 'initial',
  animate: 'animate',
  exit: 'exit',
  variants: pageVariants,
  transition: springConfig.smooth,
};

export const slideVariants: Variants = {
  initial: { opacity: 0, x: -30 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 30 },
};

export const fadeVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const scaleVariants: Variants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 1.05 },
};

// ============================================
// Stagger Container Variants
// ============================================

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

export const staggerContainerSlow: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.2,
    },
  },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: springConfig.smooth },
};

export const staggerItemSlide: Variants = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0, transition: springConfig.smooth },
};

export const staggerItemScale: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  show: { opacity: 1, scale: 1, transition: springConfig.bouncy },
};

// ============================================
// Scroll Reveal Variants
// ============================================

export type ScrollRevealVariantType =
  | 'fade'
  | 'fadeUp'
  | 'fadeDown'
  | 'fadeLeft'
  | 'fadeRight'
  | 'scale'
  | 'rotate'
  | 'flipX'
  | 'flipY'
  | 'slideUp'
  | 'slideDown'
  | 'blur'
  | 'perspective';

export const scrollRevealVariants: Record<ScrollRevealVariantType, Variants> = {
  fade: {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.6, ease: 'easeOut' } },
  },
  fadeUp: {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] } },
  },
  fadeDown: {
    hidden: { opacity: 0, y: -40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] } },
  },
  fadeLeft: {
    hidden: { opacity: 0, x: 40 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] } },
  },
  fadeRight: {
    hidden: { opacity: 0, x: -40 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] } },
  },
  scale: {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] } },
  },
  rotate: {
    hidden: { opacity: 0, rotate: -5 },
    visible: { opacity: 1, rotate: 0, transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] } },
  },
  flipX: {
    hidden: { opacity: 0, rotateX: -90 },
    visible: { opacity: 1, rotateX: 0, transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] } },
  },
  flipY: {
    hidden: { opacity: 0, rotateY: -90 },
    visible: { opacity: 1, rotateY: 0, transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] } },
  },
  slideUp: {
    hidden: { opacity: 0, y: 100 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] } },
  },
  slideDown: {
    hidden: { opacity: 0, y: -100 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] } },
  },
  blur: {
    hidden: { opacity: 0, filter: 'blur(20px)' },
    visible: { opacity: 1, filter: 'blur(0px)', transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] } },
  },
  perspective: {
    hidden: { opacity: 0, y: 60, rotateX: -15 },
    visible: { opacity: 1, y: 0, rotateX: 0, transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] } },
  },
};

// ============================================
// Hover & Tap Variants
// ============================================

export const hoverVariants = {
  lift: {
    scale: 1.02,
    y: -4,
    boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.15)',
    transition: springConfig.smooth,
  },
  grow: {
    scale: 1.05,
    transition: springConfig.snappy,
  },
  shrink: {
    scale: 0.98,
    transition: springConfig.snappy,
  },
  glow: {
    boxShadow: '0 0 30px 5px rgba(201, 168, 76, 0.4)',
    transition: springConfig.smooth,
  },
  rotate: {
    rotate: 3,
    transition: springConfig.snappy,
  },
  float: {
    y: -8,
    transition: { ...springConfig.gentle, duration: 0.5 },
  },
};

export const tapVariants = {
  scale: {
    scale: 0.96,
    transition: springConfig.snappy,
  },
  press: {
    scale: 0.94,
    transition: { duration: 0.05 },
  },
  ripple: {
    scale: [1, 0.95, 1],
    transition: { duration: 0.3, ease: 'easeOut' },
  },
};

export const focusVariants = {
  ring: {
    boxShadow: '0 0 0 3px rgba(201, 168, 76, 0.5)',
    transition: springConfig.fast,
  },
};

// ============================================
// Magnetic Button Variants
// ============================================

export const magneticVariants = {
  initial: { x: 0, y: 0, rotate: 0 },
  hover: (x: number, y: number, rotate: number) => ({
    x,
    y,
    rotate,
    transition: { type: 'spring', stiffness: 400, damping: 30 },
  }),
};

// ============================================
// Loading Variants
// ============================================

export const loadingVariants = {
  pulse: {
    animate: { opacity: [1, 0.5, 1] },
    transition: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' },
  },
  spin: {
    animate: { rotate: 360 },
    transition: { duration: 1, repeat: Infinity, ease: 'linear' },
  },
  bounce: {
    animate: { y: [0, -10, 0] },
    transition: { duration: 0.6, repeat: Infinity, ease: 'easeInOut' },
  },
  wave: {
    animate: { scaleX: [1, 0.5, 1] },
    transition: { duration: 1, repeat: Infinity, ease: 'easeInOut' },
  },
  shimmer: {
    animate: { x: [-100, 100] },
    transition: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' },
  },
};

export const skeletonVariants: Variants = {
  hidden: { opacity: 0.4 },
  visible: { opacity: 1, transition: { duration: 1, repeat: Infinity, ease: 'easeInOut' } },
};

// ============================================
// Modal/Drawer Variants
// ============================================

export const modalVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: springConfig.smooth,
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
    transition: springConfig.fast,
  },
};

export const drawerVariants: Variants = {
  hidden: { x: '100%' },
  visible: { x: 0, transition: springConfig.smooth },
  exit: { x: '100%', transition: springConfig.fast },
};

export const drawerLeftVariants: Variants = {
  hidden: { x: '-100%' },
  visible: { x: 0, transition: springConfig.smooth },
  exit: { x: '-100%', transition: springConfig.fast },
};

export const backdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

// ============================================
// Toast/Notification Variants
// ============================================

export const toastVariants: Variants = {
  hidden: { opacity: 0, x: 100, scale: 0.9 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: springConfig.bouncy,
  },
  exit: {
    opacity: 0,
    x: 100,
    scale: 0.9,
    transition: springConfig.fast,
  },
};

// ============================================
// List Animation Variants
// ============================================

export const listVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.03,
      staggerDirection: -1,
    },
  },
};

export const listItemVariants: Variants = {
  hidden: { opacity: 0, x: -20, height: 0 },
  visible: {
    opacity: 1,
    x: 0,
    height: 'auto',
    transition: springConfig.smooth,
  },
  exit: {
    opacity: 0,
    x: 20,
    height: 0,
    transition: springConfig.fast,
  },
};

// ============================================
// Tab/Accordion Variants
// ============================================

export const tabVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: springConfig.smooth },
  exit: { opacity: 0, y: -10, transition: springConfig.fast },
};

export const accordionVariants: Variants = {
  closed: { height: 0, opacity: 0 },
  open: {
    height: 'auto',
    opacity: 1,
    transition: { ...springConfig.smooth, duration: 0.3 },
  },
};

// ============================================
// Image Gallery Variants
// ============================================

export const galleryVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: springConfig.smooth },
  exit: { opacity: 0, scale: 1.05, transition: springConfig.fast },
};

export const thumbnailVariants: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: { ...springConfig.smooth, delay: i * 0.05 },
  }),
};

// ============================================
// Form Variants
// ============================================

export const inputVariants: Variants = {
  idle: { scale: 1, borderColor: 'var(--color-whisper)' },
  focus: {
    scale: 1.01,
    borderColor: 'var(--color-gold)',
    boxShadow: '0 0 0 3px rgba(201, 168, 76, 0.15)',
    transition: springConfig.fast,
  },
  error: {
    borderColor: 'var(--color-error)',
    boxShadow: '0 0 0 3px rgba(239, 68, 68, 0.15)',
    transition: springConfig.fast,
  },
};

export const labelVariants: Variants = {
  idle: { y: 0, scale: 1, color: 'var(--color-slate)' },
  focus: { y: -24, scale: 0.8, color: 'var(--color-gold)', transition: springConfig.fast },
  filled: { y: -24, scale: 0.8, color: 'var(--color-slate)', transition: springConfig.fast },
};

// ============================================
// Cart/Badge Variants
// ============================================

export const badgeVariants: Variants = {
  hidden: { scale: 0, opacity: 0 },
  visible: { scale: 1, opacity: 1, transition: springConfig.bouncy },
  update: {
    scale: [1, 1.3, 1],
    transition: { duration: 0.3, ease: 'easeOut' },
  },
};

export const cartVariants: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: springConfig.smooth },
  exit: { opacity: 0, y: -20, scale: 0.95, transition: springConfig.fast },
};

// ============================================
// Hero/Section Variants
// ============================================

export const heroVariants = {
  title: {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] } },
  },
  subtitle: {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.15 } },
  },
  cta: {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.3 } },
  },
  image: {
    hidden: { opacity: 0, scale: 1.05 },
    visible: { opacity: 1, scale: 1, transition: { duration: 1, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.2 } },
  },
};

export const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

// ============================================
// Product Card Variants
// ============================================

export const productCardVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: springConfig.smooth },
  hover: {
    y: -8,
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
    transition: springConfig.smooth,
  },
  tap: { scale: 0.98, transition: springConfig.snappy },
};

export const productImageVariants: Variants = {
  hidden: { opacity: 0, scale: 1.1 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] } },
  hover: { scale: 1.05, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } },
};

// ============================================
// Utility Functions
// ============================================

export function createStaggerDelay(index: number, baseDelay = 0.08, maxDelay = 0.5): number {
  return Math.min(baseDelay * index, maxDelay);
}

export function createSpringTransition(custom?: Partial<Transition>): Transition {
  return { ...springConfig.smooth, ...custom };
}

export function getScrollRevealVariant(type: ScrollRevealVariantType): Variants {
  return scrollRevealVariants[type] ?? scrollRevealVariants['fadeUp'];
}

// ============================================
// Reduced Motion Support
// ============================================

export const reducedMotionVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.01 } },
  exit: { opacity: 0, transition: { duration: 0.01 } },
};

export function getReducedMotionVariants(): Variants {
  return reducedMotionVariants;
}