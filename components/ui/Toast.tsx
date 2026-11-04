'use client';

import { useState, useCallback, useEffect, ReactNode, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast as hotToast } from 'react-hot-toast';
import { cn } from '@/lib/utils/cn';
import { generateId } from '@/lib/utils/id';

export type ToastType = 'success' | 'error' | 'info' | 'warning' | 'loading';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  duration?: number;
  dismissible?: boolean;
  icon?: ReactNode;
}

export interface ToastContextValue {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => string;
  removeToast: (id: string) => void;
  updateToast: (id: string, updates: Partial<Toast>) => void;
  clearToasts: () => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = generateId();
    const newToast = { ...toast, id };
    setToasts((prev) => [...prev, newToast]);
    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const updateToast = useCallback((id: string, updates: Partial<Toast>) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
  }, []);

  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, updateToast, clearToasts }}>
      {children}
      <Toaster toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

const typeStyles = {
  success: 'bg-[var(--color-success)] text-white border-[var(--color-success)]',
  error: 'bg-[var(--color-error)] text-white border-[var(--color-error)]',
  info: 'bg-[var(--color-info)] text-white border-[var(--color-info)]',
  warning: 'bg-[var(--color-warning)] text-[var(--color-ink)] border-[var(--color-warning)]',
  loading: 'bg-[var(--color-ink)] text-[var(--color-gold)] border-[var(--color-gold)]',
};

const typeIcons = {
  success: (
    <svg className="h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
  ),
  error: (
    <svg className="h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
    </svg>
  ),
  info: (
    <svg className="h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
    </svg>
  ),
  warning: (
    <svg className="h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
  ),
  loading: (
    <svg className="h-5 w-5 shrink-0 animate-spin" viewBox="0 0 24 24" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  ),
};

function Toaster({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: string) => void }) {
  if (toasts.length === 0) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed bottom-6 right-6 z-[var(--z-toast)] flex flex-col gap-3 w-full max-w-sm sm:max-w-md pointer-events-none"
        role="region"
        aria-live="polite"
        aria-label="Notifications"
      >
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
        ))}
      </div>
    </AnimatePresence>
  );
}

interface ToastItemProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

function ToastItem({ toast, onRemove }: ToastItemProps) {
  const { type, title, message, action, duration = 5000, dismissible = true, icon } = toast;

  useEffect(() => {
    if (duration === 0 || duration === Infinity) return;
    const timer = setTimeout(() => onRemove(toast.id), duration);
    return () => clearTimeout(timer);
  }, [toast.id, duration, onRemove]);

  return (
    <motion.div
      className={cn(
        'pointer-events-auto relative flex items-start gap-3 p-4 rounded-[var(--radius-lg)] shadow-[var(--shadow-xl)]',
        'border',
        typeStyles[type],
        'overflow-hidden'
      )}
      initial={{ opacity: 0, x: 300, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 300, scale: 0.95 }}
      transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      role="alert"
      aria-live={type === 'error' ? 'assertive' : 'polite'}
    >
      <div className="flex-1 min-w-0">
        {icon || typeIcons[type]}
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <p className="font-semibold text-sm">{title}</p>
            {message && <p className="mt-0.5 text-sm opacity-90">{message}</p>}
          </div>
          {dismissible && (
            <motion.button
              className="p-1 rounded opacity-60 hover:opacity-100 transition-opacity flex-shrink-0"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onRemove(toast.id)}
              aria-label="Dismiss"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </motion.button>
          )}
        </div>
        {action && (
          <motion.button
            className="mt-3 text-sm font-semibold underline hover:no-underline transition-colors"
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              action.onClick();
              onRemove(toast.id);
            }}
          >
            {action.label}
          </motion.button>
        )}
      </div>
      <motion.div
        className="absolute bottom-0 left-0 h-1"
        initial={{ scaleX: 1 }}
        animate={{ scaleX: 0 }}
        transition={{ duration: duration || 5000, ease: 'linear' }}
        style={{
          backgroundColor: type === 'loading' ? 'var(--color-gold)' : 'currentColor',
          opacity: 0.3,
        }}
        aria-hidden="true"
      />
    </motion.div>
  );
}

// Convenience functions for common toast patterns (safe to call anywhere, inside or outside React lifecycle)
export const toast = {
  success: (title: string, message?: string) =>
    hotToast.success(message ? `${title}: ${message}` : title),
  error: (title: string, message?: string) =>
    hotToast.error(message ? `${title}: ${message}` : title),
  info: (title: string, message?: string) =>
    hotToast(message ? `${title}: ${message}` : title, { icon: 'ℹ️' }),
  warning: (title: string, message?: string) =>
    hotToast(message ? `${title}: ${message}` : title, { icon: '⚠️' }),
  loading: (title: string, message?: string) =>
    hotToast.loading(message ? `${title}: ${message}` : title),
  dismiss: (id?: string) => hotToast.dismiss(id),
  update: (_id: string, _updates: Partial<Toast>) => {},
};

// Hook for programmatic toast access (use inside components)
export function useToastHelpers() {
  const { addToast, removeToast, updateToast, clearToasts } = useToast();

  return {
    success: (title: string, message?: string, options?: Partial<Toast>) =>
      addToast({ type: 'success', title, message, ...options }),
    error: (title: string, message?: string, options?: Partial<Toast>) =>
      addToast({ type: 'error', title, message, ...options }),
    info: (title: string, message?: string, options?: Partial<Toast>) =>
      addToast({ type: 'info', title, message, ...options }),
    warning: (title: string, message?: string, options?: Partial<Toast>) =>
      addToast({ type: 'warning', title, message, ...options }),
    loading: (title: string, message?: string, options?: Partial<Toast>) =>
      addToast({ type: 'loading', title, message, duration: 0, ...options }),
    dismiss: removeToast,
    update: updateToast,
    clear: clearToasts,
  };
}