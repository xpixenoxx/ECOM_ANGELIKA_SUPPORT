'use client';

import {
  ReactNode,
  useId,
  useState,
  createContext,
  useContext,
  forwardRef,
  useEffect,
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils/cn';

// Context for compound components
interface TabsContextValue {
  activeTab: string;
  onChange: (tabId: string) => void;
  variant: 'default' | 'pills' | 'underline' | 'card';
  orientation: 'horizontal' | 'vertical';
  tabsId: string;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext() {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('Tabs compound components must be used within Tabs');
  }
  return context;
}

// Root Tabs component
export interface TabsProps {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  variant?: 'default' | 'pills' | 'underline' | 'card';
  orientation?: 'horizontal' | 'vertical';
  className?: string;
  children: ReactNode;
}

export const Tabs = forwardRef<HTMLDivElement, TabsProps>(
  (
    {
      defaultValue,
      value: controlledValue,
      onValueChange,
      variant = 'default',
      orientation = 'horizontal',
      className = '',
      children,
    },
    ref
  ) => {
    const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue || '');
    const isControlled = controlledValue !== undefined;
    const activeTab = isControlled ? controlledValue : uncontrolledValue;
    const tabsId = useId();

    const handleChange = (tabId: string) => {
      if (!isControlled) {
        setUncontrolledValue(tabId);
      }
      onValueChange?.(tabId);
    };

    const contextValue: TabsContextValue = {
      activeTab,
      onChange: handleChange,
      variant,
      orientation,
      tabsId,
    };

    return (
      <TabsContext.Provider value={contextValue}>
        <div ref={ref} className={cn(className)} data-orientation={orientation}>
          {children}
        </div>
      </TabsContext.Provider>
    );
  }
);

Tabs.displayName = 'Tabs';

// TabsList component
export interface TabsListProps {
  children: ReactNode;
  className?: string;
  'aria-label'?: string;
}

export const TabsList = forwardRef<HTMLDivElement, TabsListProps>(
  ({ children, className = '', 'aria-label': ariaLabel }, ref) => {
    const { variant, orientation, tabsId } = useTabsContext();

    const variantStyles = {
      default: {
        list: 'flex gap-1 bg-[var(--color-whisper)] p-1 rounded-[var(--radius-lg)]',
      },
      pills: {
        list: 'flex gap-2',
      },
      underline: {
        list: 'flex gap-6 border-b border-[var(--color-whisper)]',
      },
      card: {
        list: 'grid gap-3',
      },
    };

    const styles = variantStyles[variant];

    return (
      <div
        ref={ref}
        role="tablist"
        aria-orientation={orientation}
        aria-label={ariaLabel}
        className={cn(
          styles.list,
          orientation === 'vertical' && 'flex-col',
          variant === 'card' && 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
          className
        )}
      >
        {children}
      </div>
    );
  }
);

TabsList.displayName = 'TabsList';

// TabsTrigger component
export interface TabsTriggerProps {
  value: string;
  children: ReactNode;
  disabled?: boolean;
  icon?: ReactNode;
  count?: number;
  className?: string;
}

export const TabsTrigger = forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ value, children, disabled = false, icon, count, className = '', ...props }, ref) => {
    const { activeTab, onChange, variant, orientation, tabsId } = useTabsContext();

    const variantStyles = {
      default: {
        tab: 'px-4 py-2 rounded-[var(--radius-md)] text-sm font-medium transition-all duration-200',
        active: 'bg-[var(--color-white)] text-[var(--color-gold)] shadow-[var(--shadow-sm)]',
        inactive: 'text-[var(--color-slate)] hover:text-[var(--color-ink)] hover:bg-[var(--color-white)]/50',
      },
      pills: {
        tab: 'px-5 py-2.5 rounded-[var(--radius-lg)] text-sm font-medium transition-all duration-200',
        active: 'bg-gradient-to-r from-[var(--color-gold)] to-[var(--color-gold-hover)] text-[var(--color-ink)] shadow-[var(--shadow-gold)]',
        inactive: 'text-[var(--color-slate)] hover:text-[var(--color-ink)] hover:bg-[var(--color-whisper)]',
      },
      underline: {
        tab: 'pb-3 text-sm font-medium transition-all duration-200 relative',
        active: 'text-[var(--color-gold)]',
        inactive: 'text-[var(--color-slate)] hover:text-[var(--color-ink)]',
      },
      card: {
        tab: 'p-4 rounded-[var(--radius-lg)] border-2 text-sm font-medium transition-all duration-200 text-left',
        active: 'border-[var(--color-gold)] bg-[var(--color-gold-light)] shadow-[var(--shadow-gold)]',
        inactive: 'border-[var(--color-whisper)] hover:border-[var(--color-gold)]/50',
      },
    };

    const styles = variantStyles[variant];
    const isActive = activeTab === value;

    return (
      <motion.button
        ref={ref}
        role="tab"
        aria-selected={isActive}
        aria-controls={`${tabsId}-panel-${value}`}
        id={`${tabsId}-tab-${value}`}
        disabled={disabled}
        onClick={() => !disabled && onChange(value)}
        className={cn(
          styles.tab,
          isActive ? styles.active : styles.inactive,
          disabled && 'opacity-50 cursor-not-allowed',
          'focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[var(--color-gold)]/40 focus-visible:ring-offset-2',
          className
        )}
        whileTap={!disabled ? { scale: 0.98 } : undefined}
        {...props}
      >
        <div className="flex items-center gap-2">
          {icon && <span aria-hidden="true">{icon}</span>}
          <span>{children}</span>
          {count !== undefined && (
            <span className={cn(
              'px-2 py-0.5 text-xs rounded-full',
              isActive
                ? 'bg-[var(--color-ink)] text-[var(--color-gold)]'
                : 'bg-[var(--color-whisper)] text-[var(--color-mist)]'
            )}>
              {count}
            </span>
          )}
        </div>
        {variant === 'underline' && isActive && (
          <motion.div
            className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-gold)]"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ type: 'spring', damping: 12, stiffness: 200 }}
          />
        )}
      </motion.button>
    );
  }
);

TabsTrigger.displayName = 'TabsTrigger';

// TabsContent component
export interface TabsContentProps {
  value: string;
  children: ReactNode;
  className?: string;
  forceMount?: boolean;
}

export const TabsContent = forwardRef<HTMLDivElement, TabsContentProps>(
  ({ value, children, className = '', forceMount = false }, ref) => {
    const { activeTab, tabsId, variant } = useTabsContext();
    const isActive = activeTab === value;

    if (!isActive && !forceMount) return null;

    return (
      <motion.div
        ref={ref}
        role="tabpanel"
        id={`${tabsId}-panel-${value}`}
        aria-labelledby={`${tabsId}-tab-${value}`}
        hidden={!isActive}
        className={cn('mt-4', className)}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3, ease: [0.175, 0.885, 0.32, 1.275] }}
      >
        {children}
      </motion.div>
    );
  }
);

TabsContent.displayName = 'TabsContent';

// Legacy TabPanel component for backward compatibility
export interface TabPanelProps {
  tabId: string;
  activeTab: string;
  children: ReactNode;
  className?: string;
}

export function TabPanel({ tabId, activeTab, children, className = '' }: TabPanelProps) {
  const tabsId = useId();
  const isActive = activeTab === tabId;

  return (
    <motion.div
      role="tabpanel"
      aria-labelledby={`${tabsId}-tab-${tabId}`}
      id={`${tabsId}-panel-${tabId}`}
      className={cn(className)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: [0.175, 0.885, 0.32, 1.275] }}
    >
      {isActive && children}
    </motion.div>
  );
}

TabPanel.displayName = 'TabPanel';

// Legacy Tab type and interface for backward compatibility
export interface Tab {
  id: string;
  label: string;
  icon?: ReactNode;
  disabled?: boolean;
  count?: number;
}

// Re-export types
export type TabsVariant = 'default' | 'pills' | 'underline' | 'card';
export type TabsOrientation = 'horizontal' | 'vertical';