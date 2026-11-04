'use client';

import { motion, HTMLMotionProps } from 'framer-motion';
import React, { ReactNode, isValidElement, cloneElement, Children, useRef, useState, useEffect, forwardRef } from 'react';
import { cn } from '@/lib/utils/cn';
import { staggerContainer, staggerItem, staggerItemSlide, staggerItemScale, listVariants, listItemVariants } from '@/lib/animations';

type IntrinsicElement = keyof JSX.IntrinsicElements;

function createMotionComponent(component: IntrinsicElement) {
  return motion[component as keyof typeof motion] as React.ComponentType<any>;
}

interface StaggerContainerProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'slow' | 'fast';
  delayChildren?: number;
  staggerChildren?: number;
  direction?: 'vertical' | 'horizontal';
  as?: IntrinsicElement;
}

export const StaggerContainer = forwardRef<HTMLDivElement, StaggerContainerProps>(function StaggerContainer({
  children,
  className,
  variant = 'default',
  delayChildren,
  staggerChildren,
  direction = 'vertical',
  as: Component = 'div',
}: StaggerContainerProps, ref) {
  const variants = {
    default: {
      hidden: { opacity: 0 },
      show: {
        opacity: 1,
        transition: {
          staggerChildren: staggerChildren ?? 0.08,
          delayChildren: delayChildren ?? 0.1,
        },
      },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: staggerChildren ?? 0.08,
          delayChildren: delayChildren ?? 0.1,
        },
      },
    },
    slow: {
      hidden: { opacity: 0 },
      show: {
        opacity: 1,
        transition: {
          staggerChildren: staggerChildren ?? 0.12,
          delayChildren: delayChildren ?? 0.2,
        },
      },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: staggerChildren ?? 0.12,
          delayChildren: delayChildren ?? 0.2,
        },
      },
    },
    fast: {
      hidden: { opacity: 0 },
      show: {
        opacity: 1,
        transition: {
          staggerChildren: staggerChildren ?? 0.04,
          delayChildren: delayChildren ?? 0.05,
        },
      },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: staggerChildren ?? 0.04,
          delayChildren: delayChildren ?? 0.05,
        },
      },
    },
  };

  const itemVariants = {
    hidden: direction === 'horizontal' ? { opacity: 0, x: -20 } : { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: { type: 'spring', stiffness: 300, damping: 25 },
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: { type: 'spring', stiffness: 300, damping: 25 },
    },
  };

  const MotionComponent = createMotionComponent(Component);

  return (
    <MotionComponent
      ref={ref}
      initial="show"
      animate="show"
      whileInView="show"
      viewport={{ once: true, margin: '0px 0px -80px 0px' }}
      variants={variants[variant]}
      className={cn(className)}
    >
      {typeof children === 'function' ? (children as (variants: typeof itemVariants) => ReactNode)(itemVariants) : children}
    </MotionComponent>
  );
});

interface StaggerItemProps extends HTMLMotionProps<'div'> {
  variant?: 'default' | 'slide' | 'scale';
  delay?: number;
  children: ReactNode;
}

export function StaggerItem({ children, variant = 'default', delay = 0, className, style, ...props }: StaggerItemProps) {
  const variants = {
    default: {
      hidden: { opacity: 0, y: 20 },
      show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 25, delay } },
      visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 25, delay } },
    },
    slide: {
      hidden: { opacity: 0, x: -20 },
      show: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 300, damping: 25, delay } },
      visible: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 300, damping: 25, delay } },
    },
    scale: {
      hidden: { opacity: 0, scale: 0.9 },
      show: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 400, damping: 20, delay } },
      visible: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 400, damping: 20, delay } },
    },
  };

  return (
    <motion.div
      initial="visible"
      animate="visible"
      variants={variants[variant]}
      className={cn(className)}
      style={style}
      {...props}
    >
      {children}
    </motion.div>
  );
}

interface StaggerListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  className?: string;
  itemClassName?: string;
  variant?: 'default' | 'slide' | 'scale';
  staggerDelay?: number;
  initialDelay?: number;
  as?: keyof JSX.IntrinsicElements;
}

export function StaggerList<T>({
  items,
  renderItem,
  className,
  itemClassName,
  variant = 'default',
  staggerDelay = 0.06,
  initialDelay = 0.1,
  as: Component = 'div',
}: StaggerListProps<T>) {
  const MotionComponent = createMotionComponent(Component);

  return (
    <MotionComponent
      initial="hidden"
      animate="visible"
      variants={listVariants}
      className={cn(className)}
    >
      {items.map((item, index) => (
        <motion.div
          key={index}
          variants={listItemVariants}
          custom={index}
          className={cn(itemClassName)}
        >
          {renderItem(item, index)}
        </motion.div>
      ))}
    </MotionComponent>
  );
}

interface StaggerGridProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  className?: string;
  itemClassName?: string;
  columns?: number;
  gap?: number;
  variant?: 'default' | 'scale' | 'fade';
  staggerDelay?: number;
  initialDelay?: number;
}

export const StaggerGrid = forwardRef<HTMLDivElement, StaggerGridProps<any>>(function StaggerGrid<T>({
  items,
  renderItem,
  className,
  itemClassName,
  columns = 4,
  gap = 24,
  variant = 'default',
  staggerDelay = 0.05,
  initialDelay = 0.1,
}: StaggerGridProps<T>, ref: React.Ref<HTMLDivElement>) {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: initialDelay,
      },
    },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: initialDelay,
      },
    },
  };

  const itemVariants = {
    default: {
      hidden: { opacity: 0, y: 20 },
      show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 25 } },
      visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 25 } },
    },
    scale: {
      hidden: { opacity: 0, scale: 0.9 },
      show: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 400, damping: 20 } },
      visible: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 400, damping: 20 } },
    },
    fade: {
      hidden: { opacity: 0 },
      show: { opacity: 1, transition: { duration: 0.4 } },
      visible: { opacity: 1, transition: { duration: 0.4 } },
    },
  };

  const colClassMap: Record<number, string> = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
    5: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5',
    6: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6',
  };
  const hasColClass = className && /grid-cols-/.test(className);
  const defaultCols = hasColClass ? '' : (colClassMap[columns] || 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3');

  const gapClassMap: Record<number, string> = {
    2: 'gap-2',
    3: 'gap-3',
    4: 'gap-4',
    6: 'gap-6',
    8: 'gap-8',
    12: 'gap-3',
    16: 'gap-4',
    20: 'gap-5',
    24: 'gap-6',
    32: 'gap-8',
  };
  const hasGapClass = className && /\bgap-/.test(className);
  const defaultGap = hasGapClass ? '' : (gapClassMap[gap] || 'gap-6');

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate="show"
      variants={containerVariants}
      className={cn('grid', defaultCols, defaultGap, className)}
    >
      {items.map((item, index) => (
        <motion.div
          key={index}
          variants={itemVariants[variant]}
          className={cn(itemClassName)}
        >
          {renderItem(item, index)}
        </motion.div>
      ))}
    </motion.div>
  );
});

interface StaggerRevealProps {
  children: ReactNode;
  className?: string;
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
  variant?: 'fade' | 'fadeUp' | 'fadeDown' | 'fadeLeft' | 'fadeRight' | 'scale' | 'rotate' | 'flipX' | 'flipY' | 'slideUp' | 'slideDown' | 'blur' | 'perspective';
  delay?: number;
}

export function StaggerReveal({
  children,
  className,
  threshold = 0.1,
  rootMargin = '0px 0px -50px 0px',
  triggerOnce = true,
  variant = 'fadeUp',
  delay = 0,
}: StaggerRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry && entry.isIntersecting) {
          setIsVisible(true);
          if (triggerOnce) observer.unobserve(element);
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold, rootMargin, triggerOnce]);

  const scrollVariants = {
    fade: { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.6, delay } } },
    fadeUp: { hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0, transition: { duration: 0.7, delay, ease: [0.25, 0.46, 0.45, 0.94] } } },
    fadeDown: { hidden: { opacity: 0, y: -40 }, visible: { opacity: 1, y: 0, transition: { duration: 0.7, delay, ease: [0.25, 0.46, 0.45, 0.94] } } },
    fadeLeft: { hidden: { opacity: 0, x: 40 }, visible: { opacity: 1, x: 0, transition: { duration: 0.7, delay, ease: [0.25, 0.46, 0.45, 0.94] } } },
    fadeRight: { hidden: { opacity: 0, x: -40 }, visible: { opacity: 1, x: 0, transition: { duration: 0.7, delay, ease: [0.25, 0.46, 0.45, 0.94] } } },
    scale: { hidden: { opacity: 0, scale: 0.9 }, visible: { opacity: 1, scale: 1, transition: { duration: 0.6, delay, ease: [0.25, 0.46, 0.45, 0.94] } } },
    rotate: { hidden: { opacity: 0, rotate: -5 }, visible: { opacity: 1, rotate: 0, transition: { duration: 0.7, delay, ease: [0.25, 0.46, 0.45, 0.94] } } },
    flipX: { hidden: { opacity: 0, rotateX: -90 }, visible: { opacity: 1, rotateX: 0, transition: { duration: 0.8, delay, ease: [0.25, 0.46, 0.45, 0.94] } } },
    flipY: { hidden: { opacity: 0, rotateY: -90 }, visible: { opacity: 1, rotateY: 0, transition: { duration: 0.8, delay, ease: [0.25, 0.46, 0.45, 0.94] } } },
    slideUp: { hidden: { opacity: 0, y: 100 }, visible: { opacity: 1, y: 0, transition: { duration: 0.8, delay, ease: [0.25, 0.46, 0.45, 0.94] } } },
    slideDown: { hidden: { opacity: 0, y: -100 }, visible: { opacity: 1, y: 0, transition: { duration: 0.8, delay, ease: [0.25, 0.46, 0.45, 0.94] } } },
    blur: { hidden: { opacity: 0, filter: 'blur(20px)' }, visible: { opacity: 1, filter: 'blur(0px)', transition: { duration: 0.7, delay, ease: [0.25, 0.46, 0.45, 0.94] } } },
    perspective: { hidden: { opacity: 0, y: 60, rotateX: -15 }, visible: { opacity: 1, y: 0, rotateX: 0, transition: { duration: 0.8, delay, ease: [0.25, 0.46, 0.45, 0.94] } } },
  };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isVisible ? 'visible' : 'hidden'}
      variants={scrollVariants[variant]}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}

interface StaggerSectionProps {
  children: ReactNode;
  className?: string;
  variant?: 'fade' | 'fadeUp' | 'fadeDown' | 'scale';
  staggerDelay?: number;
}

export function StaggerSection({
  children,
  className,
  variant = 'fadeUp',
  staggerDelay = 0.08,
}: StaggerSectionProps) {
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
      { threshold: 0.1, rootMargin: '0px 0px -100px 0px' }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

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
  };

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