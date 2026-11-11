'use client';

import {
  ReactNode,
  useId,
  useRef,
  useState,
  useEffect,
  createContext,
  useContext,
  forwardRef,
} from 'react';
import { motion } from 'framer-motion';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils/cn';

// Context for compound components
interface SelectContextValue {
  value: string;
  onValueChange: (value: string) => void;
  disabled: boolean;
  name: string;
  triggerId: string;
  contentId: string;
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  contentRef: React.MutableRefObject<HTMLDivElement | null>;
  optionRefs: React.MutableRefObject<Map<string, HTMLLIElement>>;
  required?: boolean;
  error?: boolean;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  searchable?: boolean;
}

const SelectContext = createContext<SelectContextValue | null>(null);

function useSelectContext() {
  const context = useContext(SelectContext);
  if (!context) {
    throw new Error('Select compound components must be used within Select');
  }
  return context;
}

// Root Select component
export interface SelectProps {
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  name?: string;
  required?: boolean;
  className?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  searchable?: boolean;
  error?: boolean;
}

export const Select = forwardRef<HTMLDivElement, SelectProps>(
  (
    {
      value,
      onValueChange,
      disabled = false,
      name = '',
      required = false,
      className = '',
      children,
      size = 'md',
      fullWidth = false,
      searchable = false,
      error = false,
    },
    ref
  ) => {
    const triggerRef = useRef<HTMLButtonElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const optionRefs = useRef<Map<string, HTMLLIElement>>(new Map());
    const [open, setOpen] = useState(false);
    const triggerId = useId();
    const contentId = useId();

    const contextValue: SelectContextValue = {
      value,
      onValueChange,
      disabled,
      name,
      triggerId,
      contentId,
      open,
      setOpen,
      triggerRef,
      contentRef,
      optionRefs,
      required,
      size,
      fullWidth,
      searchable,
      error,
    };

    // Close on outside click
    useEffect(() => {
      function handleClickOutside(event: MouseEvent) {
        if (
          triggerRef.current &&
          !triggerRef.current.contains(event.target as Node) &&
          contentRef.current &&
          !contentRef.current.contains(event.target as Node)
        ) {
          setOpen(false);
        }
      }

      if (open) {
        document.addEventListener('mousedown', handleClickOutside);
      }
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [open]);

    // Close on Escape key
    useEffect(() => {
      function handleEscape(event: KeyboardEvent) {
        if (event.key === 'Escape' && open) {
          setOpen(false);
          triggerRef.current?.focus();
        }
      }

      if (open) {
        document.addEventListener('keydown', handleEscape);
      }
      return () => document.removeEventListener('keydown', handleEscape);
    }, [open]);

    return (
      <SelectContext.Provider value={contextValue}>
        <div ref={ref} className={cn('relative inline-block', fullWidth && 'w-full', className)}>
          {children}
          <input
            type="hidden"
            name={name}
            value={value}
            required={required}
            disabled={disabled}
          />
        </div>
      </SelectContext.Provider>
    );
  }
);

Select.displayName = 'Select';

// SelectTrigger component
export interface SelectTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  placeholder?: string;
  children?: ReactNode;
  className?: string;
}

export const SelectTrigger = forwardRef<HTMLButtonElement, SelectTriggerProps>(
  ({ placeholder, children, className = '', ...props }, ref) => {
    const {
      value,
      disabled,
      triggerId,
      contentId,
      open,
      setOpen,
      error,
      size = 'md',
      fullWidth = false,
    } = useSelectContext();

    const sizeStyles = {
      sm: 'px-3 py-2 text-sm',
      md: 'px-4 py-3 text-base',
      lg: 'px-5 py-4 text-lg',
    };

    const handleClick = () => {
      if (!disabled) {
        setOpen(!open);
      }
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
      if ((event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowDown') && !disabled) {
        event.preventDefault();
        setOpen(true);
      }
    };

    return (
      <button
        ref={ref}
        type="button"
        id={triggerId}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={contentId}
        aria-disabled={disabled}
        disabled={disabled}
        className={cn(
          'relative w-full flex items-center justify-between',
          'bg-[var(--color-white)] border rounded-[var(--radius-md)]',
          'font-sans font-normal text-[var(--color-ink)]',
          'transition-all duration-150 ease-[var(--ease-standard)]',
          'focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[var(--color-gold)]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-white)]',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'hover:not(:disabled):border-[var(--color-gold)]/50',
          error && 'border-[var(--color-error)] focus-visible:ring-[var(--color-error)]/40',
          sizeStyles[size],
          fullWidth && 'w-full',
          className
        )}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        {...props}
      >
        <span className={cn('truncate flex-1 text-left flex items-center gap-2', (children || value) ? '' : 'text-[var(--color-mist)]')}>
          {children || value || placeholder || 'Select...'}
        </span>
        <motion.svg
          className="w-5 h-5 text-[var(--color-slate)] flex-shrink-0 ml-2 transition-transform duration-200"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
          animate={{ rotate: open ? 180 : 0 }}
        >
          <path d="M6 9l6 6 6-6" />
        </motion.svg>
      </button>
    );
  }
);

SelectTrigger.displayName = 'SelectTrigger';

// SelectValue component
export interface SelectValueProps {
  placeholder?: string;
  children?: ReactNode;
  className?: string;
}

export function SelectValue({ placeholder, children, className = '' }: SelectValueProps) {
  const { value } = useSelectContext();

  return (
    <span className={cn('truncate block', (children || value) ? '' : 'text-[var(--color-mist)]', className)}>
      {children || value || placeholder}
    </span>
  );
}

SelectValue.displayName = 'SelectValue';

// SelectContent component
export interface SelectContentProps {
  children: ReactNode;
  className?: string;
}

export const SelectContent = forwardRef<HTMLDivElement, SelectContentProps>(
  ({ children, className = '' }, ref) => {
    const { contentId, open, disabled, triggerRef, searchable, setOpen, contentRef: contextContentRef, optionRefs } = useSelectContext();
    const [searchQuery, setSearchQuery] = useState('');
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const listboxRef = useRef<HTMLDivElement>(null);

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
      const items = Array.from(optionRefs.current.values()).filter((el) => el.offsetParent !== null);
      if (items.length === 0) return;

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          setHighlightedIndex((prev) => Math.min(prev + 1, items.length - 1));
          break;
        case 'ArrowUp':
          event.preventDefault();
          setHighlightedIndex((prev) => Math.max(prev - 1, -1));
          break;
        case 'Home':
          event.preventDefault();
          setHighlightedIndex(0);
          break;
        case 'End':
          event.preventDefault();
          setHighlightedIndex(items.length - 1);
          break;
        case 'Enter':
        case ' ':
          if (highlightedIndex >= 0) {
            event.preventDefault();
            items[highlightedIndex]?.click();
          }
          break;
        case 'Escape':
          setOpen(false);
          triggerRef.current?.focus();
          break;
        case 'Tab':
          setOpen(false);
          break;
      }
    };

    useEffect(() => {
      if (open && !disabled) {
        document.addEventListener('keydown', handleKeyDown as unknown as EventListener);
      }
      return () => document.removeEventListener('keydown', handleKeyDown as unknown as EventListener);
    }, [open, disabled]);

    if (!open || disabled) return null;

    return (
      <motion.div
        ref={(el) => {
          if (typeof ref === 'function') {
            ref(el);
          } else if (ref) {
            ref.current = el;
          }
          if (contextContentRef) {
            contextContentRef.current = el;
          }
        }}
        id={contentId}
        role="listbox"
        aria-labelledby={triggerRef.current?.id}
        className={cn(
          'absolute top-full left-0 z-[var(--z-dropdown)] w-full min-w-[180px] max-h-60 overflow-auto',
          'bg-[var(--color-white)] border border-[var(--color-whisper)] rounded-[var(--radius-lg)] shadow-[var(--shadow-xl)]',
          'mt-1.5',
          className
        )}
        initial={{ opacity: 0, y: -8, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -8, scale: 0.98 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      >
        <div className="p-1" ref={listboxRef} onKeyDown={handleKeyDown}>
          {searchable && (
            <div className="p-1 border-b border-[var(--color-whisper)] sticky top-0 bg-[var(--color-white)]">
              <input
                type="text"
                placeholder="Search..."
                className="w-full px-3 py-1.5 text-sm bg-[var(--color-whisper)] border border-transparent rounded-[var(--radius-md)] focus:border-[var(--color-gold)] focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]/20"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setHighlightedIndex(-1);
                }}
                autoFocus
              />
            </div>
          )}
          {children}
        </div>
      </motion.div>
    );
  }
);

SelectContent.displayName = 'SelectContent';

// SelectItem component
export interface SelectItemProps {
  value: string;
  children: ReactNode;
  disabled?: boolean;
  className?: string;
  icon?: ReactNode;
}

export const SelectItem = forwardRef<HTMLLIElement, SelectItemProps>(
  ({ value, children, disabled = false, className = '', icon, ...props }, ref) => {
    const { value: currentValue, onValueChange, contentId, disabled: selectDisabled, optionRefs, setOpen } = useSelectContext();

    const isSelected = currentValue === value;
    const isDisabled = selectDisabled || disabled;

    const handleClick = () => {
      if (!isDisabled) {
        onValueChange(value);
        setOpen(false);
      }
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLLIElement>) => {
      if ((event.key === 'Enter' || event.key === ' ') && !isDisabled) {
        event.preventDefault();
        onValueChange(value);
        setOpen(false);
      }
    };

    return (
      <motion.li
        ref={(el) => {
          if (typeof ref === 'function') {
            ref(el);
          } else if (ref) {
            ref.current = el;
          }
          if (el) optionRefs.current.set(value, el);
        }}
        role="option"
        id={`${contentId}-option-${value}`}
        aria-selected={isSelected}
        aria-disabled={isDisabled}
        tabIndex={isDisabled ? -1 : 0}
        className={cn(
          'relative flex items-center gap-3 cursor-pointer select-none',
          'rounded-[var(--radius-md)] transition-colors duration-150',
          isSelected
            ? 'bg-[var(--color-gold-light)] text-[var(--color-gold)] font-medium'
            : 'text-[var(--color-ink)] hover:bg-[var(--color-whisper)]',
          isDisabled && 'opacity-50 cursor-not-allowed pointer-events-none',
          className
        )}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        whileTap={!isDisabled ? { scale: 0.98 } : undefined}
        {...props}
      >
        {icon && <span className="shrink-0" aria-hidden="true">{icon}</span>}
        <span className="flex-1 truncate">{children}</span>
        {isSelected && (
          <motion.span
            className="absolute right-3 top-1/2 -translate-y-1/2"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 12, stiffness: 200 }}
          >
            <svg className="w-4 h-4 text-[var(--color-gold)]" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </motion.span>
        )}
      </motion.li>
    );
  }
);

SelectItem.displayName = 'SelectItem';

// SelectGroup component for grouping items
export interface SelectGroupProps {
  label: string;
  children: ReactNode;
  className?: string;
}

export function SelectGroup({ label, children, className = '' }: SelectGroupProps) {
  return (
    <div className={cn('py-1', className)}>
      <span className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--color-slate)] block">
        {label}
      </span>
      <ul role="group">{children}</ul>
    </div>
  );
}

SelectGroup.displayName = 'SelectGroup';

// SelectSeparator component
export interface SelectSeparatorProps {
  className?: string;
}

export function SelectSeparator({ className = '' }: SelectSeparatorProps) {
  return (
    <div
      className={cn('h-px bg-[var(--color-whisper)] my-1', className)}
      role="separator"
      aria-orientation="horizontal"
    />
  );
}

SelectSeparator.displayName = 'SelectSeparator';

// SelectScrollUpButton and SelectScrollDownButton for virtualized lists
export interface SelectScrollButtonProps {
  className?: string;
}

export function SelectScrollUpButton({ className = '' }: SelectScrollButtonProps) {
  return (
    <motion.button
      type="button"
      className={cn(
        'w-full px-3 py-1.5 flex items-center justify-center text-sm text-[var(--color-slate)]',
        'hover:text-[var(--color-ink)] hover:bg-[var(--color-whisper)]',
        'transition-colors duration-150',
        className
      )}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
    >
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M18 15l-6-6-6 6" />
      </svg>
    </motion.button>
  );
}

export function SelectScrollDownButton({ className = '' }: SelectScrollButtonProps) {
  return (
    <motion.button
      type="button"
      className={cn(
        'w-full px-3 py-1.5 flex items-center justify-center text-sm text-[var(--color-slate)]',
        'hover:text-[var(--color-ink)] hover:bg-[var(--color-whisper)]',
        'transition-colors duration-150',
        className
      )}
      whileHover={{ y: 2 }}
      whileTap={{ scale: 0.98 }}
    >
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M6 9l6 6 6-6" />
      </svg>
    </motion.button>
  );
}

// Re-export types
export type SelectSize = 'sm' | 'md' | 'lg';