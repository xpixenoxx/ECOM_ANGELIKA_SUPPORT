'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils/cn';

interface MorphProps {
  children: React.ReactNode;
  key: string;
  className?: string;
  mode?: 'scale' | 'opacity' | 'slide' | 'flip' | 'custom';
  customVariants?: Record<string, any>;
  transition?: any;
}

type MorphMode = NonNullable<MorphProps['mode']>;
type NonCustomMorphMode = Exclude<MorphMode, 'custom'>;

const morphVariants: Record<NonCustomMorphMode, { initial: any; animate: any; exit: any }> = {
  scale: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 1.1 },
  },
  opacity: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  slide: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  },
  flip: {
    initial: { opacity: 0, rotateY: 90 },
    animate: { opacity: 1, rotateY: 0 },
    exit: { opacity: 0, rotateY: -90 },
  },
};

export function Morph({ children, key, className, mode = 'scale', customVariants, transition }: MorphProps) {
  const selectedVariants = customVariants || (mode !== 'custom' ? morphVariants[mode] : morphVariants.scale);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={key}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={selectedVariants}
        transition={transition || { type: 'spring', stiffness: 300, damping: 25 }}
        className={cn('relative', className)}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

interface MorphTextProps {
  value: string;
  className?: string;
  mode?: 'char' | 'word' | 'line';
  delay?: number;
  stagger?: number;
}

export function MorphText({ value, className, mode = 'char', delay = 0, stagger = 0.03 }: MorphTextProps) {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDisplayValue(value);
    }, delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  const splitText = (text: string) => {
    switch (mode) {
      case 'word':
        return text.split(' ').map((word, i) => <span key={i} className="inline-block">{word} </span>);
      case 'line':
        return text.split('\n').map((line, i) => <span key={i} className="block">{line}</span>);
      default:
        return text.split('').map((char, i) => <span key={i} className="inline-block">{char === ' ' ? ' ' : char}</span>);
    }
  };

  const items = splitText(displayValue);

  return (
    <span className={cn('inline-block', className)}>
      <AnimatePresence mode="popLayout">
        {items.map((item, index) => (
          <motion.span
            key={`${index}-${displayValue}`}
            initial={{ opacity: 0, y: mode === 'char' ? 20 : 10, rotateX: -90 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            exit={{ opacity: 0, y: mode === 'char' ? -20 : -10, rotateX: 90 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25, delay: delay + index * stagger }}
            className="inline-block"
          >
            {item}
          </motion.span>
        ))}
      </AnimatePresence>
    </span>
  );
}

interface MorphNumberProps {
  value: number;
  className?: string;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  formatter?: (value: number) => string;
}

export function MorphNumber({
  value,
  className,
  decimals = 0,
  prefix = '',
  suffix = '',
  duration = 1,
  formatter,
}: MorphNumberProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const prevValueRef = useRef(value);
  const animationRef = useRef<number>();

  useEffect(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    const start = prevValueRef.current;
    const end = value;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOut cubic
      const current = start + (end - start) * eased;

      setDisplayValue(current);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);
    prevValueRef.current = value;

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [value, duration]);

  const formatted = formatter
    ? formatter(displayValue)
    : `${prefix}${displayValue.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}${suffix}`;

  return <span className={cn('inline-block', className)}>{formatted}</span>;
}

interface MorphShapeProps {
  isOpen: boolean;
  children: React.ReactNode;
  className?: string;
  direction?: 'horizontal' | 'vertical' | 'both';
  transition?: any;
}

export function MorphShape({ isOpen, children, className, direction = 'horizontal', transition }: MorphShapeProps) {
  const variants = {
    horizontal: {
      closed: { width: 0, opacity: 0 },
      open: { width: 'auto', opacity: 1 },
    },
    vertical: {
      closed: { height: 0, opacity: 0 },
      open: { height: 'auto', opacity: 1 },
    },
    both: {
      closed: { width: 0, height: 0, opacity: 0, borderRadius: '50%' },
      open: { width: 'auto', height: 'auto', opacity: 1, borderRadius: 0 },
    },
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={isOpen ? 'open' : 'closed'}
        initial="closed"
        animate={isOpen ? 'open' : 'closed'}
        variants={variants[direction]}
        transition={transition || { type: 'spring', stiffness: 400, damping: 30 }}
        className={cn('overflow-hidden', className)}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

interface MorphBackgroundProps {
  color: string;
  className?: string;
  transition?: any;
}

export function MorphBackground({ color, className, transition }: MorphBackgroundProps) {
  const [prevColor, setPrevColor] = useState(color);
  const [currentColor, setCurrentColor] = useState(color);

  useEffect(() => {
    if (color !== currentColor) {
      setPrevColor(currentColor);
      setCurrentColor(color);
    }
  }, [color]);

  return (
    <div className={cn('relative overflow-hidden', className)}>
      <AnimatePresence mode="popLayout">
        <motion.div
          key={currentColor}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={transition || { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="absolute inset-0"
          style={{ backgroundColor: currentColor }}
        />
      </AnimatePresence>
      <div className="relative z-10" />
    </div>
  );
}

interface MorphContainerProps {
  children: React.ReactNode;
  className?: string;
  layout?: boolean;
}

export function MorphContainer({ children, className, layout = true }: MorphContainerProps) {
  return (
    <motion.div
      className={cn('relative', className)}
      layout={layout}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
    >
      {children}
    </motion.div>
  );
}

interface SharedLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function SharedLayout({ children, className }: SharedLayoutProps) {
  return (
    <motion.div className={cn('relative', className)}>
      {children}
    </motion.div>
  );
}