'use client';

import React, { useRef, useEffect, useState } from 'react';
import { motion, MotionProps } from 'framer-motion';
import { cn } from '@/lib/utils/cn';

type VariantKey = 'fade-up' | 'fade-down' | 'fade-left' | 'fade-right' | 'scale' | 'flip' | 'slide-up' | 'slide-down' | 'blur';

export interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  variant?: VariantKey;
  delay?: number;
  duration?: number;
  distance?: number;
  once?: boolean;
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
  disabled?: boolean;
  as?: React.ElementType;
  style?: React.CSSProperties;
}

const variantStyles: Record<VariantKey, { initial: Record<string, unknown>; animate: Record<string, unknown> }> = {
  'fade-up': {
    initial: { opacity: 0, y: 40 },
    animate: { opacity: 1, y: 0 },
  },
  'fade-down': {
    initial: { opacity: 0, y: -40 },
    animate: { opacity: 1, y: 0 },
  },
  'fade-left': {
    initial: { opacity: 0, x: 40 },
    animate: { opacity: 1, x: 0 },
  },
  'fade-right': {
    initial: { opacity: 0, x: -40 },
    animate: { opacity: 1, x: 0 },
  },
  scale: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
  },
  flip: {
    initial: { opacity: 0, rotateY: 90 },
    animate: { opacity: 1, rotateY: 0 },
  },
  'slide-up': {
    initial: { opacity: 0, y: 60, scale: 0.95 },
    animate: { opacity: 1, y: 0, scale: 1 },
  },
  'slide-down': {
    initial: { opacity: 0, y: -60, scale: 0.95 },
    animate: { opacity: 1, y: 0, scale: 1 },
  },
  blur: {
    initial: { opacity: 0, filter: 'blur(10px)' },
    animate: { opacity: 1, filter: 'blur(0px)' },
  },
};

const defaultTransition = {
  duration: 0.6,
  ease: [0.175, 0.885, 0.32, 1.275] as const,
};

export function ScrollReveal({
  children,
  className = '',
  variant = 'fade-up',
  delay = 0,
  duration = 0.6,
  distance = 40,
  once = true,
  threshold = 0.1,
  rootMargin = '0px 0px -50px 0px',
  triggerOnce = true,
  disabled = false,
  as: Component = 'div',
  style,
}: ScrollRevealProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);

  const resolvedVariant = variant || 'fade-up';
  const variantConfig = variantStyles[resolvedVariant];
  const { initial, animate } = variantConfig;

  useEffect(() => {
    if (disabled || typeof window === 'undefined') {
      setIsVisible(true);
      return;
    }

    const element = elementRef.current;
    if (!element) return;

    if (triggerOnce && hasAnimated) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once || triggerOnce) {
            setHasAnimated(true);
            observer.unobserve(element);
          }
        } else if (!once && !triggerOnce) {
          setIsVisible(false);
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [disabled, once, triggerOnce, threshold, rootMargin, hasAnimated]);

  const transition = {
    ...defaultTransition,
    duration,
    delay,
  };

  if (!isVisible && !disabled) {
    return (
      <Component
        ref={elementRef}
        className={cn(className)}
        style={style}
        aria-hidden="true"
      >
        {React.isValidElement(children) ? React.cloneElement(children as React.ReactElement, { style: { opacity: 0 } }) : children}
      </Component>
    );
  }

  return (
    <motion.div
      ref={elementRef}
      className={cn(className)}
      style={style}
      initial={disabled || hasAnimated ? animate : initial}
      animate={animate}
      transition={transition}
    >
      {children}
    </motion.div>
  );
}

export interface StaggerContainerProps {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
  staggerDirection?: 'normal' | 'reverse';
  as?: React.ElementType;
  style?: React.CSSProperties;
}

export function StaggerContainer({
  children,
  className = '',
  staggerDelay = 0.1,
  staggerDirection = 'normal',
  as: Component = 'div',
  style,
}: StaggerContainerProps) {
  const containerRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') {
      setIsVisible(true);
      return;
    }

    const element = containerRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(element);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px',
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, []);

  const childrenArray = React.Children.toArray(children);
  const orderedChildren = staggerDirection === 'reverse' ? [...childrenArray].reverse() : childrenArray;

  return (
    <Component ref={containerRef} className={className} style={style}>
      {orderedChildren.map((child, index) => {
        if (!React.isValidElement(child)) return child;

        const childDelay = isVisible ? index * staggerDelay : 0;

        return React.cloneElement(child as React.ReactElement<MotionProps>, {
          initial: { opacity: 0, y: 30 },
          animate: isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 },
          transition: {
            ...defaultTransition,
            delay: childDelay,
            duration: 0.5,
          },
        });
      })}
    </Component>
  );
}

export interface ScrollRevealTextProps {
  children: string;
  className?: string;
  splitBy?: 'words' | 'chars' | 'lines';
  variant?: 'fade-up' | 'fade-down' | 'scale';
  delay?: number;
  staggerDelay?: number;
  duration?: number;
  as?: React.ElementType;
}

export function ScrollRevealText({
  children,
  className = '',
  splitBy = 'words',
  variant = 'fade-up',
  delay = 0,
  staggerDelay = 0.03,
  duration = 0.5,
  as: Component = 'p',
}: ScrollRevealTextProps) {
  const elementRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') {
      setIsVisible(true);
      return;
    }

    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(element);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px',
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, []);

  const splitText = () => {
    if (splitBy === 'words') {
      return children.split(' ').map((word, i) => (
        <span key={i} className="inline-block">{word} </span>
      ));
    }
    if (splitBy === 'chars') {
      return children.split('').map((char, i) => (
        <span key={i} className="inline-block">{char}</span>
      ));
    }
    return children.split('\n').map((line, i) => (
      <span key={i} className="block">{line}</span>
    ));
  };

  const { initial, animate } = variantStyles[variant];

  return (
    <Component ref={elementRef} className={className}>
      {isVisible ? (
        <motion.span
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: staggerDelay,
                delayChildren: delay,
              },
            },
          }}
        >
          {splitText().map((child, i) =>
            React.isValidElement(child)
              ? React.cloneElement(child as React.ReactElement, {
                  initial: initial,
                  animate: animate,
                  transition: { duration, ease: [0.175, 0.885, 0.32, 1.275] as const },
                })
              : child
          )}
        </motion.span>
      ) : (
        <span style={{ opacity: 0 }}>{children}</span>
      )}
    </Component>
  );
}

export interface ParallaxProps {
  children: React.ReactNode;
  className?: string;
  speed?: number;
  offset?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  as?: React.ElementType;
}

export function Parallax({
  children,
  className = '',
  speed = 0.3,
  offset = 0,
  direction = 'up',
  as: Component = 'div',
}: ParallaxProps) {
  const elementRef = useRef<HTMLElement>(null);
  const [transform, setTransform] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const element = elementRef.current;
    if (!element) return;

    const handleScroll = () => {
      const rect = element.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const elementTop = rect.top;
      const elementHeight = rect.height;

      const progress = (viewportHeight - elementTop) / (viewportHeight + elementHeight);

      if (progress >= 0 && progress <= 1) {
        const distance = (progress - 0.5) * 2 * speed * 100 + offset;
        let x = 0;
        let y = 0;

        switch (direction) {
          case 'up':
            y = -distance;
            break;
          case 'down':
            y = distance;
            break;
          case 'left':
            x = -distance;
            break;
          case 'right':
            x = distance;
            break;
        }

        setTransform({ x, y });
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [speed, offset, direction]);

  return (
    <Component
      ref={elementRef}
      className={cn('overflow-hidden', className)}
      style={{ transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`, willChange: 'transform' }}
    >
      {children}
    </Component>
  );
}

export interface MagneticHoverProps {
  children: React.ReactNode;
  className?: string;
  strength?: number;
  area?: number;
  as?: React.ElementType;
}

export function MagneticHover({
  children,
  className = '',
  strength = 0.3,
  area = 100,
  as: Component = 'div',
}: MagneticHoverProps) {
  const elementRef = useRef<HTMLElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!elementRef.current) return;

    const rect = elementRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const deltaX = (e.clientX - centerX) * strength;
    const deltaY = (e.clientY - centerY) * strength;

    const distance = Math.sqrt(deltaX ** 2 + deltaY ** 2);
    if (distance > area) {
      const angle = Math.atan2(deltaY, deltaX);
      setPosition({
        x: Math.cos(angle) * area,
        y: Math.sin(angle) * area,
      });
    } else {
      setPosition({ x: deltaX, y: deltaY });
    }
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
    setIsHovering(false);
  };

  const handleMouseEnter = () => {
    setIsHovering(true);
  };

  return (
    <Component
      ref={elementRef}
      className={cn('relative', className)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
      style={{
        transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
        transition: isHovering ? 'none' : 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        willChange: 'transform',
      }}
    >
      {React.isValidElement(children)
        ? React.cloneElement(children as React.ReactElement, {
            style: {
              ...(children as React.ReactElement).props.style,
              transform: `translate3d(${-position.x * 0.1}px, ${-position.y * 0.1}px, 0)`,
              transition: isHovering ? 'none' : 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            },
          })
        : children}
    </Component>
  );
}

export interface ViewportTrackerProps {
  children: (data: { progress: number; isVisible: boolean; direction: 'up' | 'down' | 'none' }) => React.ReactNode;
  className?: string;
  rootMargin?: string;
  threshold?: number | number[];
}

export function ViewportTracker({
  children,
  className = '',
  rootMargin = '0px',
  threshold = 0,
}: ViewportTrackerProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [direction, setDirection] = useState<'up' | 'down' | 'none'>('none');
  const lastScrollY = useRef(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        setIsVisible(entry.isIntersecting);
        if (entry.isIntersecting) {
          const ratio = entry.intersectionRatio;
          setProgress(ratio);
        }
      },
      {
        rootMargin,
        threshold: Array.isArray(threshold) ? threshold : [0, 0.25, 0.5, 0.75, 1],
      }
    );

    observer.observe(element);

    const handleScroll = () => {
      const currentY = window.scrollY;
      setDirection(currentY > lastScrollY.current ? 'down' : 'up');
      lastScrollY.current = currentY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
    };
  }, [rootMargin, threshold]);

  return (
    <div ref={elementRef} className={className}>
      {children({ progress, isVisible, direction })}
    </div>
  );
}