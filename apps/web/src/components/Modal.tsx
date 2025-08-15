// src/components/ui/Modal.tsx
import React, { ReactNode, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
}

/**
 * Responsive modal that behaves like SideDialog's overlay mechanics.
 * - Mobile (<md): full-width bottom sheet that slides up/down
 * - Desktop (md+): centered modal (keeps your glass look/colors)
 * Also: ESC to close, scroll lock, portal to <body> so overlay always covers viewport.
 */
export default function Modal({ open, title, children, onClose }: ModalProps) {
  // ESC to close
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  // Prevent background scrolling while open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  const node = (
    <div
      className={[
        'fixed inset-0 z-[1000] flex',
        // mobile sheet sits at bottom; desktop centers
        'items-end md:items-center justify-center',
        'pointer-events-auto',
      ].join(' ')}
      role="dialog"
      aria-modal="true"
      aria-hidden={!open}
    >
      {/* Backdrop (keeps your darker 90% tone) */}
      <div
        className={[
          'absolute inset-0 bg-black/90 backdrop-blur-[1px] transition-opacity duration-300',
          open ? 'opacity-100' : 'opacity-0',
        ].join(' ')}
        onClick={onClose}
      />

      {/* Panel wrapper to control motion per breakpoint */}
      <div
        className={[
          'relative w-full md:w-auto p-2 md:p-4',
          'transform transition-transform duration-300 ease-in-out',
          // slide up on mobile; subtle scale on desktop
          open ? 'translate-y-0 md:scale-100' : 'translate-y-full md:scale-95',
        ].join(' ')}
      >
        {/* Panel (glass look preserved) */}
        <div
          className={[
            'w-full max-w-6xl max-h-[90vh] md:max-h-[80vh]',
            'bg-white/20 backdrop-blur-xl border border-white/30 rounded-t-2xl md:rounded-2xl shadow-2xl',
            'overflow-hidden flex flex-col',
          ].join(' ')}
        >
          {/* Header */}
          <header className="flex justify-between items-center px-4 md:px-6 py-3 md:py-4 border-b border-white/10">
            <h2 className="text-lg md:text-xl font-semibold text-white truncate">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 text-2xl leading-none px-2"
              aria-label="Close modal"
            >
              ×
            </button>
          </header>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 text-white">
            {children}
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(node, document.body);
}
