'use client';

import React, { ReactNode, useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils/cn';

export interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  className?: string;
  sideOffset?: number;
  align?: 'start' | 'center' | 'end';
}

const positionStyles = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  right: 'left-full top-1/2 -translate-y-1/2 ml-2',
};

const arrowStyles = {
  top: 'bottom-[-4px] left-1/2 -translate-x-1/2 border-t-[var(--color-ink)]',
  bottom: 'top-[-4px] left-1/2 -translate-x-1/2 border-b-[var(--color-ink)]',
  left: 'right-[-4px] top-1/2 -translate-y-1/2 border-l-[var(--color-ink)]',
  right: 'left-[-4px] top-1/2 -translate-y-1/2 border-r-[var(--color-ink)]',
};

export function Tooltip({
  content,
  children,
  position = 'top',
  delay = 200,
  className = '',
  sideOffset = 8,
  align = 'center',
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const childRef = useRef<HTMLElement>(null);

  const showTooltip = () => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' || e.key === 'Tab') {
      hideTooltip();
    }
  };

  const clonedChild = React.Children.only(children) as React.ReactElement;
  const childProps = clonedChild.props;

  const tooltipContent = isVisible && childRef.current ? (
    <motion.div
      className={cn(
        'fixed z-[var(--z-tooltip)] px-3 py-2 text-sm font-medium text-white bg-[var(--color-ink)] rounded-[var(--radius-md)] shadow-[var(--shadow-lg)]',
        'whitespace-nowrap pointer-events-none',
        positionStyles[position],
        className
      )}
      style={{
        transformOrigin: position === 'top' ? 'bottom center' : position === 'bottom' ? 'top center' : 'center',
      }}
      initial={{ opacity: 0, scale: 0.9, y: position === 'top' ? 8 : position === 'bottom' ? -8 : 0, x: position === 'left' ? 8 : position === 'right' ? -8 : 0 }}
      animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.15, ease: [0.175, 0.885, 0.32, 1.275] }}
      role="tooltip"
    >
      {content}
      <div
        className={cn(
          'absolute w-0 h-0 border-4 border-transparent',
          arrowStyles[position]
        )}
      />
    </motion.div>
  ) : null;

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <span
      ref={childRef}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      className="inline-block"
    >
      {React.cloneElement(clonedChild, {
        ...childProps,
        onMouseEnter: (e: React.MouseEvent) => {
          showTooltip();
          childProps.onMouseEnter?.(e);
        },
        onMouseLeave: (e: React.MouseEvent) => {
          hideTooltip();
          childProps.onMouseLeave?.(e);
        },
        onFocus: (e: React.FocusEvent) => {
          showTooltip();
          childProps.onFocus?.(e);
        },
        onBlur: (e: React.FocusEvent) => {
          hideTooltip();
          childProps.onBlur?.(e);
        },
      })}
      {typeof window !== 'undefined' && tooltipContent && createPortal(tooltipContent, document.body)}
    </span>
  );
}

export interface TooltipTriggerProps {
  children: ReactNode;
  'aria-label'?: string;
}

export function TooltipTrigger({ children, 'aria-label': ariaLabel }: TooltipTriggerProps) {
  const child = React.Children.only(children) as React.ReactElement;
  return React.cloneElement(child, {
    'aria-label': ariaLabel || child.props['aria-label'] || child.props.children,
    'aria-describedby': child.props['aria-describedby'],
  });
}

export interface HoverCardProps {
  content: ReactNode;
  children: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  className?: string;
  sideOffset?: number;
}

export function HoverCard({
  content,
  children,
  position = 'bottom',
  delay = 150,
  className = '',
  sideOffset = 8,
}: HoverCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const triggerRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const open = () => {
    timeoutRef.current = setTimeout(() => setIsOpen(true), delay);
  };

  const close = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsOpen(false);
  };

  const handleMouseEnter = () => open();
  const handleMouseLeave = () => close();

  const handleContentMouseEnter = () => open();
  const handleContentMouseLeave = () => close();

  const trigger = React.Children.only(children) as React.ReactElement;

  const portalContent = isOpen && triggerRef.current ? (
    <motion.div
      ref={contentRef}
      className={cn(
        'fixed z-[var(--z-dropdown)] w-72 px-4 py-3 bg-[var(--color-white)] border border-[var(--color-whisper)] rounded-[var(--radius-lg)] shadow-[var(--shadow-xl)]',
        positionStyles[position],
        className
      )}
      initial={{ opacity: 0, scale: 0.95, y: position === 'top' ? 8 : -8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.15 }}
      onMouseEnter={handleContentMouseEnter}
      onMouseLeave={handleContentMouseLeave}
      role="dialog"
      aria-describedby="hover-card-content"
    >
      <div id="hover-card-content">{content}</div>
    </motion.div>
  ) : null;

  return (
    <span
      ref={triggerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      tabIndex={0}
      onFocus={handleMouseEnter}
      onBlur={handleMouseLeave}
      className="inline-block"
    >
      {React.cloneElement(trigger, {
        onMouseEnter: (e: React.MouseEvent) => {
          handleMouseEnter();
          trigger.props.onMouseEnter?.(e);
        },
        onMouseLeave: (e: React.MouseEvent) => {
          handleMouseLeave();
          trigger.props.onMouseLeave?.(e);
        },
        onFocus: (e: React.FocusEvent) => {
          handleMouseEnter();
          trigger.props.onFocus?.(e);
        },
        onBlur: (e: React.FocusEvent) => {
          handleMouseLeave();
          trigger.props.onBlur?.(e);
        },
      })}
      {typeof window !== 'undefined' && portalContent && createPortal(portalContent, document.body)}
    </span>
  );
}