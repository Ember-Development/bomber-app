// src/components/ui/Modal.tsx
import React, { ReactNode, useEffect } from 'react';
import ReactDOM from 'react-dom';

interface ModalProps {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
}

export default function Modal({ open, title, children, onClose }: ModalProps) {
  // Prevent background scrolling
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open) return null;

  // Ensure #modal-root exists
  let modalRoot = document.getElementById('modal-root');
  if (!modalRoot) {
    modalRoot = document.createElement('div');
    modalRoot.id = 'modal-root';
    document.body.appendChild(modalRoot);
  }

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/90" onClick={onClose} />

      {/* Glassmorphic Modal */}
      <div
        className="
          relative 
          w-full max-w-6xl 
          max-h-[80vh] 
          p-6 
          bg-white/20 
          backdrop-blur-xl 
          border border-white/30 
          rounded-2xl 
          shadow-2xl 
          overflow-auto 
          z-[10000]
        "
      >
        <header className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white">{title}</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 text-2xl leading-none"
            aria-label="Close modal"
          >
            ×
          </button>
        </header>

        <div className="text-white">{children}</div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, modalRoot);
}
