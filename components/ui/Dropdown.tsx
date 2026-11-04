'use client';

import React, { ReactNode, useId, useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils/cn';
import { FocusTrap } from '@/components/ui/FocusTrap';

export interface DropdownItem {
  label: string;
  value: string;
  icon?: ReactNode;
  disabled?: boolean;
  danger?: boolean;
  divider?: boolean;
  shortcut?: string;
  description?: string;
}

export interface DropdownProps {
  trigger: ReactNode;
  items: DropdownItem[];
  onSelect: (value: string) => void;
  position?: 'bottom' | 'top' | 'left' | 'right';
  align?: 'start' | 'center' | 'end';
  width?: 'trigger' | 'auto' | 'max' | number;
  closeOnSelect?: boolean;
  disabled?: boolean;
  className?: string;
}

const positionStyles = {
  bottom: 'top-full mt-1.5',
  top: 'bottom-full mb-1.5',
  left: 'right-full mr-1.5',
  right: 'left-full ml-1.5',
};

export function Dropdown({
  trigger,
  items,
  onSelect,
  position = 'bottom',
  align = 'start',
  width = 'auto',
  closeOnSelect = true,
  disabled = false,
  className = '',
}: DropdownProps) {
  const dropdownId = useId();
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Map<number, HTMLButtonElement>>(new Map());

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (containerRef.current && !containerRef.current.contains(target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const filteredItems = items.filter((item, index) => {
    if (!item.divider) return true;
    const prevItem = items[index - 1];
    const nextItem = items[index + 1];
    return !!(prevItem && !prevItem.divider && nextItem && !nextItem.divider);
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
          e.preventDefault();
          setIsOpen(true);
        }
        return;
      }

      const enabledItems = items
        .map((item, index) => ({ item, index }))
        .filter(({ item }) => !item.disabled && !item.divider);

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setHighlightedIndex((prev) => {
            const next = enabledItems.findIndex(({ index }) => index > prev);
            const nextItem = next >= 0 ? enabledItems[next] : undefined;
            return nextItem ? nextItem.index : (enabledItems[0]?.index ?? -1);
          });
          break;
        case 'ArrowUp':
          e.preventDefault();
          setHighlightedIndex((prev) => {
            const prevIndex = enabledItems.findIndex(({ index }) => index < prev);
            const prevItem = prevIndex >= 0 ? enabledItems[prevIndex] : undefined;
            return prevItem ? prevItem.index : (enabledItems[enabledItems.length - 1]?.index ?? -1);
          });
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          if (highlightedIndex >= 0) {
            const item = items[highlightedIndex];
            if (item && !item.disabled && !item.divider) {
              onSelect(item.value);
              if (closeOnSelect) setIsOpen(false);
            }
          }
          break;
        case 'Escape':
          setIsOpen(false);
          triggerRef.current?.focus();
          break;
        case 'Tab':
          setIsOpen(false);
          break;
        default:
          if (e.key.length === 1) {
            const searchChar = e.key.toLowerCase();
            const nextItem = enabledItems.find(({ item, index }) =>
              index > highlightedIndex && item.label.toLowerCase().startsWith(searchChar)
            );
            if (nextItem) {
              setHighlightedIndex(nextItem.index);
            }
          }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, items, highlightedIndex, onSelect, closeOnSelect]);

  useEffect(() => {
    if (isOpen) {
      setHighlightedIndex(
        items.findIndex((item) => !item.disabled && !item.divider)
      );
    } else {
      setHighlightedIndex(-1);
    }
  }, [isOpen, items]);

  const handleItemClick = (item: DropdownItem, index: number) => {
    if (item.disabled || item.divider) return;
    onSelect(item.value);
    if (closeOnSelect) setIsOpen(false);
  };

  const handleTriggerClick = () => {
    if (!disabled) setIsOpen(!isOpen);
  };

  const menuWidth = width === 'trigger'
    ? triggerRef.current?.offsetWidth
    : width === 'max'
    ? '28rem'
    : typeof width === 'number'
    ? `${width}px`
    : 'auto';

  const triggerElement = React.Children.only(trigger) as React.ReactElement;

  return (
    <div ref={containerRef} className={cn('relative inline-block', className)}>
      {React.cloneElement(triggerElement, {
        ref: triggerRef,
        id: `${dropdownId}-trigger`,
        'aria-haspopup': 'menu',
        'aria-expanded': isOpen,
        onClick: (e: React.MouseEvent) => {
          handleTriggerClick();
          triggerElement.props.onClick?.(e);
        },
        disabled: disabled || triggerElement.props.disabled,
      })}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={menuRef}
            id={`${dropdownId}-menu`}
            role="menu"
            aria-labelledby={`${dropdownId}-trigger`}
            className={cn(
              'absolute z-50 min-w-[12rem] max-w-[28rem]',
              'bg-[var(--color-white)] border border-[var(--color-whisper)] rounded-[var(--radius-lg)] shadow-[var(--shadow-xl)]',
              'overflow-hidden py-1',
              positionStyles[position],
              align === 'start' && 'left-0',
              align === 'center' && 'left-1/2 -translate-x-1/2',
              align === 'end' && 'right-0'
            )}
            style={{ width: menuWidth }}
            initial={{ opacity: 0, scale: 0.95, y: position === 'top' ? 8 : -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: position === 'top' ? 8 : -8 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
          >
            {items.map((item, index) => (
              item.divider ? (
                <div key={`divider-${index}`} className="my-1 border-t border-[var(--color-whisper)]" role="separator" />
              ) : (
                <motion.button
                  key={item.value}
                  ref={(el) => { if (el) itemRefs.current.set(index, el); }}
                  type="button"
                  role="menuitem"
                  aria-disabled={item.disabled}
                  id={`${dropdownId}-item-${item.value}`}
                  disabled={item.disabled}
                  onClick={() => handleItemClick(item, index)}
                  onMouseEnter={() => !item.disabled && setHighlightedIndex(index)}
                  className={cn(
                    'w-full px-4 py-2.5 text-sm flex items-center gap-3',
                    'transition-colors duration-150',
                    'focus-visible:outline-none focus-visible:bg-[var(--color-gold-light)]',
                    highlightedIndex === index && !item.disabled && 'bg-[var(--color-gold-light)]',
                    item.disabled && 'opacity-50 cursor-not-allowed',
                    item.danger && 'text-[var(--color-error)] hover:bg-[var(--color-error)]/10',
                    !item.danger && !item.disabled && 'text-[var(--color-ink)] hover:bg-[var(--color-gold-light)]'
                  )}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ delay: index * 0.02 }}
                >
                  {item.icon && <span className="shrink-0" aria-hidden="true">{item.icon}</span>}
                  <div className="flex-1 min-w-0">
                    <span className="truncate block">{item.label}</span>
                    {item.description && (
                      <span className="text-xs text-[var(--color-slate)] block truncate">{item.description}</span>
                    )}
                  </div>
                  {item.shortcut && (
                    <kbd className="px-2 py-0.5 text-xs font-mono text-[var(--color-mist)] bg-[var(--color-whisper)] rounded-[var(--radius-sm)]">
                      {item.shortcut}
                    </kbd>
                  )}
                </motion.button>
              )
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export interface DropdownMenuProps extends Omit<DropdownProps, 'trigger'> {
  triggerLabel: string;
  triggerIcon?: ReactNode;
}

export function DropdownMenu({
  triggerLabel,
  triggerIcon,
  items,
  onSelect,
  position = 'bottom',
  align = 'start',
  width = 'auto',
  closeOnSelect = true,
  disabled = false,
  className = '',
}: DropdownMenuProps) {
  const trigger = (
    <button
      type="button"
      className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-medium text-[var(--color-ink)] bg-[var(--color-white)] border border-[var(--color-whisper)] rounded-[var(--radius-md)] hover:border-[var(--color-gold)]/50 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[var(--color-gold)]/40 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
    >
      {triggerIcon && <span aria-hidden="true">{triggerIcon}</span>}
      <span className="hidden sm:inline">{triggerLabel}</span>
      <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[var(--color-mist)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M6 9l6 6 6-6" />
      </svg>
    </button>
  );

  return (
    <Dropdown
      trigger={trigger}
      items={items}
      onSelect={onSelect}
      position={position}
      align={align}
      width={width}
      closeOnSelect={closeOnSelect}
      disabled={disabled}
      className={className}
    />
  );
}