// ============================================
// ANIMATION TYPES
// ============================================

export interface AnimationTokens {
  easing: {
    standard: [number, number, number, number];
    expressive: [number, number, number, number];
    spring: [number, number, number, number];
    decelerate: [number, number, number, number];
    accelerate: [number, number, number, number];
    magnetic: [number, number, number, number];
  };
  duration: {
    instant: number;
    fast: number;
    base: number;
    slow: number;
    slower: number;
    slowest: number;
  };
  stagger: {
    base: number;
    max: number;
  };
  magnetic: {
    strength: number;
    radius: number;
    damping: number;
    stiffness: number;
  };
}

export const defaultAnimationTokens: AnimationTokens = {
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

export interface MotionVariants {
  initial?: Record<string, any>;
  animate?: Record<string, any>;
  exit?: Record<string, any>;
  transition?: Record<string, any>;
}

export interface PageTransitionConfig {
  duration: number;
  easing: [number, number, number, number];
  enterAnimation: string;
  exitAnimation: string;
}

export interface MagneticButtonConfig {
  strength: number;
  radius: number;
  damping: number;
  stiffness: number;
}

export interface ScrollRevealConfig {
  threshold: number;
  rootMargin: string;
  once: boolean;
  y: number;
  delay: number;
}

export interface ParticleBurstConfig {
  count: number;
  color: string;
  size: number;
  spread: number;
  duration: number;
}

export interface RippleConfig {
  color: string;
  duration: number;
  scale: number;
}

export interface StaggerConfig {
  delay: number;
  maxDelay: number;
  from: 'start' | 'center' | 'end' | 'random';
}

export interface AnimationState {
  prefersReducedMotion: boolean;
  isAnimating: boolean;
  activeAnimations: Map<string, AnimationController>;
}

export interface AnimationController {
  id: string;
  play: () => Promise<void>;
  pause: () => void;
  reverse: () => Promise<void>;
  finish: () => Promise<void>;
  cancel: () => void;
  currentTime: number;
  playbackRate: number;
}

export interface ViewTransitionState {
  isTransitioning: boolean;
  fromPath: string;
  toPath: string;
  transitionName: string;
}

// Framer Motion specific types
export interface FramerMotionTransition {
  duration?: number;
  delay?: number;
  ease?: number[] | string;
  type?: 'tween' | 'spring' | 'inertia' | 'keyframes';
  repeat?: number;
  repeatDelay?: number;
  repeatType?: 'loop' | 'reverse' | 'mirror';
  stiffness?: number;
  damping?: number;
  mass?: number;
  velocity?: number;
  times?: number[];
}

// Motion One specific types
export interface MotionOneOptions {
  duration?: number;
  delay?: number;
  easing?: string | number[];
  fill?: 'none' | 'forwards' | 'backwards' | 'both' | 'auto';
  direction?: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse';
  iterations?: number;
  endDelay?: number;
  composite?: 'replace' | 'add' | 'accumulate';
  iterationComposite?: 'replace' | 'accumulate';
}

// CSS View Transitions types
export interface ViewTransitionOptions {
  types?: string[];
  updateCallbackDone?: Promise<void>;
  ready?: Promise<void>;
  finished?: Promise<void>;
  skipTransition?: boolean;
}

// Animation performance metrics
export interface AnimationMetrics {
  fps: number;
  frameTime: number;
  droppedFrames: number;
  totalFrames: number;
  longFrames: number;
  memoryUsage: number;
}

// Reduced motion preferences
export interface ReducedMotionPreferences {
  prefersReducedMotion: boolean;
  prefersReducedTransparency: boolean;
  prefersContrast: 'more' | 'less' | 'no-preference';
  prefersColorScheme: 'light' | 'dark' | 'no-preference';
}