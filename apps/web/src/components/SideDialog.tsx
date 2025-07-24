// components/SideDialog.tsx
import React from 'react';

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
  return (
    <div
      className={`h-[80%] transition-all rounded-2xl duration-300 ease-in-out ${
        open ? widthClass : 'w-0'
      }`}
      style={{
        minWidth: open ? 340 : 0,
        maxWidth: 430,
        overflow: open ? 'visible' : 'hidden',
        pointerEvents: open ? 'auto' : 'none',
      }}
    >
      <div
        className={`h-full bg-[rgba(255,255,255,0.16)] backdrop-blur-2xl shadow-2xl rounded-3xl border-l border-white/10 flex flex-col ${
          open ? 'translate-x-0' : 'translate-x-full'
        } transition-transform duration-300`}
        style={{ minWidth: open ? 340 : 0 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-xl font-semibold text-white">{title}</h2>
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
        <div className="flex-1 overflow-y-auto p-6">{children}</div>
      </div>
    </div>
  );
}
