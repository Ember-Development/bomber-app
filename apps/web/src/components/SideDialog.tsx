import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

interface SideDialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  widthClass?: string;
  children: React.ReactNode;
}

export default function SideDialog({
  open,
  onClose,
  title,
  widthClass = 'max-w-md w-full',
  children,
}: SideDialogProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on ESC
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // Prevent background scroll when open
  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  const overlay = (
    <div
      className={[
        'fixed inset-0 z-[1000] flex',
        'items-end md:items-stretch justify-center md:justify-end',
        open ? 'pointer-events-auto' : 'pointer-events-none',
      ].join(' ')}
      aria-hidden={!open}
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className={[
          'absolute inset-0 backdrop-blur-[1px] bg-black/40 transition-opacity duration-300',
          open ? 'opacity-100' : 'opacity-0',
        ].join(' ')}
        onClick={onClose}
      />

      <div
        className={[
          'relative w-full md:w-auto h-[90vh] md:h-full p-2 md:p-4',
          'transform transition-transform duration-300 ease-in-out',
          open
            ? 'translate-y-0 md:translate-x-0'
            : 'translate-y-full md:translate-x-full',
        ].join(' ')}
      >
        <div
          ref={panelRef}
          className={[
            'h-full bg-[rgba(255,255,255,0.16)] backdrop-blur-2xl shadow-2xl border border-white/10 md:border-l md:border-t-0 rounded-t-3xl md:rounded-3xl',
            'w-full md:w-auto',
            widthClass,
            'mx-auto md:mx-0',
            'max-w-[100vw] md:max-w-[430px]',
            'min-w-0 md:min-w-[340px]',
            'flex flex-col',
          ].join(' ')}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/10">
            <h2 className="text-lg sm:text-xl font-semibold text-white truncate">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="text-white hover:text-[#5AA5FF] p-2 rounded-full transition"
              aria-label="Close"
            >
              <svg width={20} height={20} viewBox="0 0 20 20" fill="none">
                <path
                  d="M6 6l8 8M14 6l-8 8"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</div>
        </div>
      </div>
    </div>
  );

  // Render to body to ensure full-viewport coverage
  return createPortal(overlay, document.body);
}
