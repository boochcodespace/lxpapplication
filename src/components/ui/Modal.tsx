'use client';

import React, { useEffect, useCallback, useState } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  footer?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export default function Modal({
  open,
  onClose,
  title,
  footer,
  children,
  className,
}: ModalProps) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (open) {
      setMounted(true);
      // Trigger enter animation on next frame
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setVisible(true);
        });
      });
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      setVisible(false);
      const timer = setTimeout(() => setMounted(false), 200);
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
      return () => clearTimeout(timer);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, handleKeyDown]);

  if (!mounted) return null;

  const closeButton = (
    <button
      onClick={onClose}
      className="p-1 rounded-md text-surface-400 hover:text-surface-600 hover:bg-surface-100 transition-colors"
      aria-label="Close"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
          clipRule="evenodd"
        />
      </svg>
    </button>
  );

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
    >
      {/* Overlay */}
      <div
        className={cn(
          'fixed inset-0 bg-black transition-opacity duration-200',
          visible ? 'opacity-50' : 'opacity-0'
        )}
        onClick={onClose}
      />

      {/* Card */}
      <div
        className={cn(
          'relative z-10 w-full max-w-lg mx-4 bg-white rounded-xl shadow-xl transition-all duration-200',
          visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95',
          className
        )}
      >
        {/* Header */}
        {title ? (
          <div className="flex items-center justify-between px-6 pt-5 pb-0">
            <h2 className="text-lg font-semibold text-surface-900">{title}</h2>
            {closeButton}
          </div>
        ) : (
          <div className="absolute top-3 right-3">{closeButton}</div>
        )}

        {/* Body */}
        <div className="px-6 py-5">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="px-6 pb-5 pt-0 flex items-center justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
