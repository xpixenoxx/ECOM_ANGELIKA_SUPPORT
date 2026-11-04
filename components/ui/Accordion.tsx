'use client';

import { ReactNode, useId, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils/cn';

export interface AccordionItem {
  id: string;
  title: string;
  content: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
}

export interface AccordionProps {
  items: AccordionItem[];
  allowMultiple?: boolean;
  defaultOpen?: string[];
  onChange?: (openIds: string[]) => void;
  variant?: 'default' | 'bordered' | 'card';
  className?: string;
}

const variantStyles = {
  default: {
    container: 'border border-[var(--color-whisper)] rounded-[var(--radius-lg)] overflow-hidden',
    item: 'border-t border-[var(--color-whisper)] first:border-t-0',
    trigger: 'w-full px-6 py-4 text-left flex items-center justify-between gap-4',
    content: 'px-6 pb-4',
  },
  bordered: {
    container: 'space-y-3',
    item: 'border border-[var(--color-whisper)] rounded-[var(--radius-lg)] overflow-hidden',
    trigger: 'w-full px-5 py-4 text-left flex items-center justify-between gap-4 bg-[var(--color-white)]',
    content: 'px-5 pb-4',
  },
  card: {
    container: 'space-y-3',
    item: 'bg-[var(--color-white)] border border-[var(--color-whisper)] rounded-[var(--radius-lg)] overflow-hidden shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-shadow',
    trigger: 'w-full px-5 py-4 text-left flex items-center justify-between gap-4',
    content: 'px-5 pb-4',
  },
};

export function Accordion({
  items,
  allowMultiple = false,
  defaultOpen = [],
  onChange,
  variant = 'default',
  className = '',
}: AccordionProps) {
  const accordionId = useId();
  const styles = variantStyles[variant];
  const [openIds, setOpenIds] = useState<string[]>(defaultOpen);

  const toggleItem = (id: string) => {
    const item = items.find((i) => i.id === id);
    if (item?.disabled) return;

    setOpenIds((prev) => {
      const isOpen = prev.includes(id);
      let newOpen: string[];

      if (allowMultiple) {
        newOpen = isOpen ? prev.filter((i) => i !== id) : [...prev, id];
      } else {
        newOpen = isOpen ? [] : [id];
      }

      onChange?.(newOpen);
      return newOpen;
    });
  };

  return (
    <div className={cn(styles.container, className)} role="region" aria-label="Accordion">
      {items.map((item, index) => (
        <motion.div
          key={item.id}
          className={cn(styles.item, item.disabled && 'opacity-50')}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <button
            role="button"
            aria-expanded={openIds.includes(item.id)}
            aria-controls={`${accordionId}-content-${item.id}`}
            id={`${accordionId}-trigger-${item.id}`}
            disabled={item.disabled}
            onClick={() => toggleItem(item.id)}
            className={cn(
              styles.trigger,
              'focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[var(--color-gold)]/40 focus-visible:ring-offset-2',
              item.disabled && 'cursor-not-allowed'
            )}
          >
            <div className="flex items-center gap-3 flex-1">
              {item.icon && (
                <span className="shrink-0 text-[var(--color-gold)]" aria-hidden="true">
                  {item.icon}
                </span>
              )}
              <span className={cn(
                'font-medium text-[var(--color-ink)]',
                item.disabled && 'text-[var(--color-mist)]'
              )}>
                {item.title}
              </span>
            </div>
            <motion.svg
              className="h-5 w-5 text-[var(--color-slate)] flex-shrink-0 transition-transform duration-200"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
              animate={{ rotate: openIds.includes(item.id) ? 180 : 0 }}
            >
              <path d="M6 9l6 6 6-6" />
            </motion.svg>
          </button>

          <AnimatePresence>
            {openIds.includes(item.id) && (
              <motion.div
                id={`${accordionId}-content-${item.id}`}
                role="region"
                aria-labelledby={`${accordionId}-trigger-${item.id}`}
                className={styles.content}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: [0.175, 0.885, 0.32, 1.275] }}
              >
                <div className="text-[var(--color-slate)] leading-relaxed">
                  {item.content}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  );
}

export interface AccordionSectionProps {
  title: string;
  children: ReactNode;
  icon?: ReactNode;
  defaultOpen?: boolean;
  disabled?: boolean;
  className?: string;
}

export function AccordionSection({
  title,
  children,
  icon,
  defaultOpen = false,
  disabled = false,
  className = '',
}: AccordionSectionProps) {
  const sectionId = useId();
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={cn('border border-[var(--color-whisper)] rounded-[var(--radius-lg)] overflow-hidden', className)}>
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls={`${sectionId}-content`}
        id={`${sectionId}-trigger`}
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[var(--color-gold)]/40 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <div className="flex items-center gap-3">
          {icon && <span className="shrink-0 text-[var(--color-gold)]" aria-hidden="true">{icon}</span>}
          <span className={cn('font-medium text-[var(--color-ink)]', disabled && 'text-[var(--color-mist)]')}>
            {title}
          </span>
        </div>
        <motion.svg
          className="h-5 w-5 text-[var(--color-slate)] flex-shrink-0"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
          animate={{ rotate: isOpen ? 180 : 0 }}
        >
          <path d="M6 9l6 6 6-6" />
        </motion.svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            id={`${sectionId}-content`}
            role="region"
            aria-labelledby={`${sectionId}-trigger`}
            className="px-6 pb-4"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.175, 0.885, 0.32, 1.275] }}
          >
            <div className="text-[var(--color-slate)] leading-relaxed">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}