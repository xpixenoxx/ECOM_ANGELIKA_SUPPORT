'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils/cn';

export interface ViewTransitionProps {
  children: React.ReactNode;
  className?: string;
  transitionName?: string;
  fallback?: React.ReactNode;
}

export interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
  mode?: 'fade' | 'slide' | 'scale' | 'flip' | 'morph';
  duration?: number;
  ease?: number[];
  enterDelay?: number;
  exitDelay?: number;
}

export interface SharedElementProps {
  id: string;
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
}

export interface MorphTransitionProps {
  children: React.ReactNode;
  className?: string;
  key: string;
  mode?: 'scale' | 'position' | 'full';
}

function supportsViewTransitions(): boolean {
  return typeof document !== 'undefined' && 'startViewTransition' in document;
}

export function ViewTransitionWrapper({
  children,
  className = '',
  transitionName = 'page',
  fallback,
}: ViewTransitionProps) {
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (!supportsViewTransitions()) return;

    const handleTransition = (e: Event) => {
      const transitionEvent = e as TransitionEvent;
      if (transitionEvent.pseudoElement === '::view-transition-old(root)') {
        setIsTransitioning(true);
      }
    };

    document.addEventListener('transitionstart', handleTransition);
    return () => document.removeEventListener('transitionstart', handleTransition);
  }, []);

  if (!supportsViewTransitions() || isTransitioning) {
    return <>{fallback || children}</>;
  }

  return (
    <motion.div
      className={cn('relative', className)}
      style={{ viewTransitionName: transitionName }}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            duration: 0,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

export function PageTransition({
  children,
  className = '',
  mode = 'fade',
  duration = 0.4,
  ease = [0.175, 0.885, 0.32, 1.275],
  enterDelay = 0,
  exitDelay = 0,
}: PageTransitionProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const variants = {
    fade: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
    },
    slide: {
      initial: { opacity: 0, x: -40 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: 40 },
    },
    scale: {
      initial: { opacity: 0, scale: 0.95 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 1.05 },
    },
    flip: {
      initial: { opacity: 0, rotateY: 90 },
      animate: { opacity: 1, rotateY: 0 },
      exit: { opacity: 0, rotateY: -90 },
    },
    morph: {
      initial: { opacity: 0, scale: 0.9, filter: 'blur(10px)' },
      animate: { opacity: 1, scale: 1, filter: 'blur(0px)' },
      exit: { opacity: 0, scale: 1.1, filter: 'blur(10px)' },
    },
  };

  const transition = {
    duration,
    ease,
    delay: enterDelay,
  };

  const exitTransition = {
    duration: duration * 0.5,
    ease,
    delay: exitDelay,
  };

  if (!isMounted) {
    return <div className={cn('opacity-0', className)} aria-hidden="true">{children}</div>;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="page-transition"
        className={cn('w-full', className)}
        initial={variants[mode].initial}
        animate={variants[mode].animate}
        exit={variants[mode].exit}
        transition={transition}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

const sharedElementRegistry = new Map<string, { rect: DOMRect; element: HTMLElement }>();

export function registerSharedElement(id: string, element: HTMLElement) {
  if (typeof window === 'undefined') return;
  const rect = element.getBoundingClientRect();
  sharedElementRegistry.set(id, { rect, element });
}

export function unregisterSharedElement(id: string) {
  sharedElementRegistry.delete(id);
}

export function getSharedElementRect(id: string): DOMRect | null {
  return sharedElementRegistry.get(id)?.rect || null;
}

export function SharedElement({
  id,
  children,
  className = '',
  as: Component = 'div',
}: SharedElementProps) {
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (elementRef.current) {
      registerSharedElement(id, elementRef.current);
    }
    return () => unregisterSharedElement(id);
  }, [id]);

  return (
    <Component
      ref={elementRef}
      className={cn('relative', className)}
      style={{
        viewTransitionName: `shared-${id}`,
        contain: 'paint',
      }}
    >
      {children}
    </Component>
  );
}

export function useSharedElement(id: string) {
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (elementRef.current) {
      registerSharedElement(id, elementRef.current);
    }
    return () => unregisterSharedElement(id);
  }, [id]);

  return elementRef;
}

export function MorphTransition({
  children,
  className = '',
  key,
  mode = 'full',
}: MorphTransitionProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, [key]);

  const variants = {
    scale: {
      initial: { opacity: 0, scale: 0.95 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 1.05 },
    },
    position: {
      initial: { opacity: 0, x: 20, y: 20 },
      animate: { opacity: 1, x: 0, y: 0 },
      exit: { opacity: 0, x: -20, y: -20 },
    },
    full: {
      initial: { opacity: 0, scale: 0.9, x: 20, y: 20, filter: 'blur(8px)' },
      animate: { opacity: 1, scale: 1, x: 0, y: 0, filter: 'blur(0px)' },
      exit: { opacity: 0, scale: 1.1, x: -20, y: -20, filter: 'blur(8px)' },
    },
  };

  const transition = {
    duration: 0.5,
    ease: [0.175, 0.885, 0.32, 1.275] as const,
  };

  if (!isMounted) {
    return <div className={cn('opacity-0', className)} aria-hidden="true">{children}</div>;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={key}
        className={cn('relative', className)}
        initial={variants[mode].initial}
        animate={variants[mode].animate}
        exit={variants[mode].exit}
        transition={transition}
        style={{
          viewTransitionName: `morph-${key}`,
          contain: 'paint',
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

export interface LayoutTransitionProps {
  children: React.ReactNode;
  className?: string;
  type?: 'layout' | 'position' | 'size' | 'opacity';
  duration?: number;
}

export function LayoutTransition({
  children,
  className = '',
  type = 'layout',
  duration = 0.3,
}: LayoutTransitionProps) {
  return (
    <motion.div
      className={cn(className)}
      layout
      layoutId={type === 'layout' ? 'shared-layout' : undefined}
      transition={{
        duration,
        ease: [0.175, 0.885, 0.32, 1.275] as const,
        type: type === 'layout' ? 'spring' : 'tween',
      }}
    >
      {children}
    </motion.div>
  );
}

export interface PresenceTransitionProps {
  children: React.ReactNode;
  className?: string;
  mode?: 'fade' | 'slide' | 'scale' | 'collapse';
  duration?: number;
  unmountOnExit?: boolean;
}

export function PresenceTransition({
  children,
  className = '',
  mode = 'fade',
  duration = 0.3,
  unmountOnExit = true,
}: PresenceTransitionProps) {
  const variants = {
    fade: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
    },
    slide: {
      initial: { opacity: 0, height: 0, y: -20 },
      animate: { opacity: 1, height: 'auto', y: 0 },
      exit: { opacity: 0, height: 0, y: -20 },
    },
    scale: {
      initial: { opacity: 0, scale: 0.95 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.95 },
    },
    collapse: {
      initial: { opacity: 0, height: 0 },
      animate: { opacity: 1, height: 'auto' },
      exit: { opacity: 0, height: 0 },
    },
  };

  return (
    <AnimatePresence mode={unmountOnExit ? 'wait' : 'popLayout'}>
      {children && (
        <motion.div
          className={cn(className)}
          initial={variants[mode].initial}
          animate={variants[mode].animate}
          exit={variants[mode].exit}
          transition={{ duration, ease: [0.175, 0.885, 0.32, 1.275] as const }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export interface TransitionGroupProps {
  children: React.ReactNode;
  className?: string;
  tag?: React.ElementType;
  enter?: boolean;
  exit?: boolean;
  childFactory?: (child: React.ReactElement) => React.ReactElement;
}

export function TransitionGroup({
  children,
  className = '',
  tag: Component = 'div',
  enter = true,
  exit = true,
  childFactory,
}: TransitionGroupProps) {
  return (
    <AnimatePresence mode="popLayout">
      <Component className={className}>
        {React.Children.map(children, (child) => {
          if (!React.isValidElement(child)) return child;

          const enhancedChild = React.cloneElement(child as React.ReactElement, {
            initial: enter ? (child.props.initial || { opacity: 0, y: 20 }) : false,
            animate: child.props.animate || { opacity: 1, y: 0 },
            exit: exit ? (child.props.exit || { opacity: 0, y: -20 }) : undefined,
            transition: child.props.transition || {
              duration: 0.3,
              ease: [0.175, 0.885, 0.32, 1.275] as const,
            },
          });

          return childFactory ? childFactory(enhancedChild) : enhancedChild;
        })}
      </Component>
    </AnimatePresence>
  );
}

export function usePageTransition() {
  const [isTransitioning, setIsTransitioning] = useState(false);

  const startTransition = useCallback(async (callback: () => Promise<void> | void) => {
    if (!supportsViewTransitions()) {
      await Promise.resolve(callback());
      return;
    }

    setIsTransitioning(true);
    try {
      const wrappedCallback = () => Promise.resolve(callback());
      await (document as unknown as { startViewTransition: (callback: () => Promise<void>) => { ready: Promise<void> } })
        .startViewTransition(wrappedCallback).ready;
    } finally {
      setIsTransitioning(false);
    }
  }, []);

  return { isTransitioning, startTransition };
}

export function createTransitionStyles(name: string) {
  return {
    [`::view-transition-old(${name})`]: {
      animation: `${name}-exit 0.3s ease-in-out`,
    },
    [`::view-transition-new(${name})`]: {
      animation: `${name}-enter 0.3s ease-in-out`,
    },
    [`@keyframes ${name}-enter`]: {
      from: { opacity: 0, transform: 'translateX(40px)' },
      to: { opacity: 1, transform: 'translateX(0)' },
    },
    [`@keyframes ${name}-exit`]: {
      from: { opacity: 1, transform: 'translateX(0)' },
      to: { opacity: 0, transform: 'translateX(-40px)' },
    },
  };
}

export interface TransitionLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  transitionName?: string;
  prefetch?: boolean;
}

export function TransitionLink({
  children,
  href,
  transitionName = 'page',
  prefetch = true,
  className = '',
  onClick,
  ...props
}: TransitionLinkProps) {
  const handleClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onClick) onClick(e);
    if (e.defaultPrevented) return;

    if (!href || typeof href !== 'string') return;
    if (supportsViewTransitions() && href.startsWith('/')) {
      e.preventDefault();
      const targetHref = href;
      await (document as unknown as { startViewTransition: (callback: () => void) => { ready: Promise<void> } })
        .startViewTransition(() => {
          window.location.href = targetHref;
        }).ready;
    }
  };

  return (
    <a
      href={href}
      onClick={handleClick}
      className={cn(className)}
      style={{
        viewTransitionName: transitionName,
      }}
      {...props}
    >
      {children}
    </a>
  );
}

export function useReducedMotion(): boolean {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setReducedMotion(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return reducedMotion;
}

export function useReducedMotionConfig() {
  const reducedMotion = useReducedMotion();

  return {
    transition: reducedMotion
      ? { duration: 0 }
      : { duration: 0.4, ease: [0.175, 0.885, 0.32, 1.275] as const },
    initial: reducedMotion ? false : undefined,
    animate: reducedMotion ? undefined : undefined,
  };
}