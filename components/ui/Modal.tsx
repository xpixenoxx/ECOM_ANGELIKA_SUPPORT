'use client';

import { Fragment, ReactNode, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils/cn';
import { FocusTrap } from '@/components/ui/FocusTrap';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  className?: string;
}

const sizeStyles = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-4xl',
};

const modalVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.2, ease: [0.175, 0.885, 0.32, 1.275] },
  },
  exit: { opacity: 0, transition: { duration: 0.15, ease: 'easeIn' } },
};

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

const contentVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.3, ease: [0.175, 0.885, 0.32, 1.275] },
  },
  exit: { opacity: 0, scale: 0.95, y: -20, transition: { duration: 0.2, ease: 'easeIn' } },
};

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  closeOnOverlayClick = true,
  closeOnEscape = true,
  showCloseButton = true,
  className = '',
}: ModalProps) {
  const titleId = title ? 'modal-title' : undefined;
  const descriptionId = description ? 'modal-description' : undefined;

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && closeOnEscape) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, closeOnEscape, onClose]);

  if (!isOpen) return null;

  const modalContent = (
    <AnimatePresence mode="wait">
      <motion.div
        className="fixed inset-0 z-[var(--z-modal)] flex items-center justify-center p-4"
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={modalVariants}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
      >
        <motion.div
          className="absolute inset-0 bg-[var(--color-ink)]/60 backdrop-blur-sm"
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={backdropVariants}
          onClick={closeOnOverlayClick ? onClose : undefined}
          aria-hidden="true"
        />

        <FocusTrap
          onEscape={closeOnEscape ? onClose : undefined}
          focusRef={(el) => el?.focus()}
        >
          <motion.div
            className={cn(
              'relative w-full bg-[var(--color-white)] rounded-[var(--radius-xl)] shadow-[var(--shadow-xl)]',
              'overflow-hidden',
              sizeStyles[size],
              className
            )}
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={contentVariants}
            role="document"
          >
            {(title || showCloseButton) && (
              <div className="flex items-start justify-between p-6 border-b border-[var(--color-whisper)]">
                <div>
                  {title && (
                    <h2
                      id={titleId}
                      className="text-[var(--font-display)] text-xl font-semibold text-[var(--color-ink)]"
                    >
                      {title}
                    </h2>
                  )}
                  {description && (
                    <p
                      id={descriptionId}
                      className="mt-1 text-[var(--color-slate)] text-sm"
                    >
                      {description}
                    </p>
                  )}
                </div>
                {showCloseButton && (
                  <motion.button
                    className="p-2 rounded-full text-[var(--color-mist)] hover:text-[var(--color-ink)] hover:bg-[var(--color-whisper)] transition-colors duration-150 flex-shrink-0"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={onClose}
                    aria-label="Close modal"
                  >
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </motion.button>
                )}
              </div>
            )}
            <div className="p-6">
              {children}
            </div>
          </motion.div>
        </FocusTrap>
      </motion.div>
    </AnimatePresence>
  );

  if (typeof window === 'undefined') return null;

  return createPortal(modalContent, document.body);
}

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'primary';
  loading?: boolean;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'primary',
  loading = false,
}: ConfirmModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      closeOnOverlayClick={!loading}
      closeOnEscape={!loading}
    >
      <p className="text-[var(--color-slate)] mb-6">{message}</p>
      <div className="flex justify-end gap-3">
        <button
          className="px-4 py-2 text-sm font-medium text-[var(--color-slate)] hover:text-[var(--color-ink)] transition-colors"
          onClick={onClose}
          disabled={loading}
        >
          {cancelText}
        </button>
        <button
          className={cn(
            'px-4 py-2 text-sm font-semibold uppercase tracking-wider rounded-[var(--radius-md)] transition-all duration-150',
            variant === 'danger'
              ? 'bg-[var(--color-error)] text-white hover:bg-[var(--color-error)]/90'
              : 'bg-[var(--color-gold)] text-[var(--color-ink)] hover:bg-[var(--color-gold-hover)]'
          )}
          onClick={onConfirm}
          disabled={loading}
        >
          {loading ? 'Processing...' : confirmText}
        </button>
      </div>
    </Modal>
  );
}