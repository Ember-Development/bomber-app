// src/context/ToastProvider.tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  ReactNode,
} from 'react';

type ToastType = 'success' | 'error' | 'info';

type Toast = {
  id: number;
  message: string;
  type: ToastType;
};

type ToastContextType = {
  addToast: (message: string, type?: ToastType) => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Public API: same signature you already use
  const addToast = (message: string, type: ToastType = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}

      {/* Container: bottom-right on desktop, bottom-center on mobile */}
      <div className="fixed inset-x-0 bottom-4 z-[9999] pointer-events-none px-3 sm:inset-auto sm:right-4 sm:bottom-4 sm:left-auto sm:px-0">
        <div className="flex flex-col gap-3 items-center sm:items-end">
          {toasts.map((t, index) => (
            <ToastItem
              key={t.id}
              toast={t}
              index={index}
              duration={3000}
              onRequestClose={() => removeToast(t.id)}
            />
          ))}
        </div>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};

/* ------------------ Internal: Toast Item ------------------ */

const typeStyles: Record<
  ToastType,
  { ring: string; grad: string; glow: string; dot: string; bar: string }
> = {
  success: {
    ring: 'ring-emerald-300/40',
    grad: 'from-emerald-500/25 via-emerald-400/15 to-emerald-300/10',
    glow: 'shadow-[0_10px_30px_-10px_rgba(16,185,129,0.45)]',
    dot: 'bg-emerald-400',
    bar: 'bg-emerald-300/80',
  },
  error: {
    ring: 'ring-rose-300/40',
    grad: 'from-rose-500/25 via-rose-400/15 to-rose-300/10',
    glow: 'shadow-[0_10px_30px_-10px_rgba(244,63,94,0.45)]',
    dot: 'bg-rose-400',
    bar: 'bg-rose-300/80',
  },
  info: {
    ring: 'ring-sky-300/40',
    grad: 'from-sky-500/25 via-sky-400/15 to-sky-300/10',
    glow: 'shadow-[0_10px_30px_-10px_rgba(56,189,248,0.45)]',
    dot: 'bg-sky-400',
    bar: 'bg-sky-300/80',
  },
};

const ENTER_MS = 220;
const EXIT_MS = 220;

function ToastItem({
  toast,
  index,
  duration,
  onRequestClose,
}: {
  toast: Toast;
  index: number;
  duration: number;
  onRequestClose: () => void;
}) {
  const { type, message } = toast;
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<number | null>(null);
  const startRef = useRef<number>(Date.now());
  const remainingRef = useRef<number>(duration);

  // mount: play enter animation, start auto-close timer
  useEffect(() => {
    const t = window.setTimeout(() => setOpen(true), 10); // next tick -> transition in
    startAutoClose();
    return () => {
      window.clearTimeout(t);
      if (closeTimer.current) window.clearTimeout(closeTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startAutoClose = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    startRef.current = Date.now();
    closeTimer.current = window.setTimeout(
      () => handleClose(),
      remainingRef.current
    );
  };

  const pauseAutoClose = () => {
    if (!closeTimer.current) return;
    const elapsed = Date.now() - startRef.current;
    remainingRef.current = Math.max(0, remainingRef.current - elapsed);
    window.clearTimeout(closeTimer.current);
    closeTimer.current = null;
  };

  const handleClose = () => {
    setOpen(false);
    window.setTimeout(onRequestClose, EXIT_MS); // wait for exit transition
  };

  const style = typeStyles[type];

  return (
    <div
      role="status"
      aria-live="polite"
      className={[
        'pointer-events-auto w-full sm:w-[360px] transition-all ease-out',
        open
          ? 'opacity-100 translate-y-0 scale-100'
          : 'opacity-0 translate-y-2 scale-[0.98]',
      ].join(' ')}
      style={{
        transitionDuration: `${open ? ENTER_MS : EXIT_MS}ms`,
        zIndex: 1 + (100 - index),
      }}
      onMouseEnter={pauseAutoClose}
      onMouseLeave={() => {
        if (remainingRef.current <= 0) return;
        startAutoClose();
      }}
    >
      <div
        className={[
          'relative overflow-hidden rounded-2xl backdrop-blur-xl',
          'border border-white/15 ring-1',
          style.ring,
          'bg-gradient-to-br',
          style.grad,
          'text-white px-4 py-3',
          'shadow-2xl',
          style.glow,
        ].join(' ')}
      >
        {/* subtle top shine */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-12 -left-12 w-48 h-48 rounded-full bg-white/8 blur-3xl" />
        </div>

        {/* content */}
        <div className="flex items-start gap-3">
          <span
            className={[
              'mt-1 inline-block h-2.5 w-2.5 rounded-full ring-2 ring-white/30',
              style.dot,
            ].join(' ')}
          />
          <p className="text-sm leading-5 flex-1">{message}</p>
          <button
            onClick={handleClose}
            className="ml-2 shrink-0 rounded-lg px-2 py-1 text-xs/4 bg-white/10 hover:bg-white/20 transition"
            aria-label="Close toast"
          >
            ✕
          </button>
        </div>

        {/* progress bar (pure CSS width transition tied to remaining time) */}
        <ProgressBar key={toast.id} type={type} duration={duration} />
      </div>
    </div>
  );
}

/** Progress bar using a CSS transition (no JS animation libs). */
function ProgressBar({
  type,
  duration,
}: {
  type: ToastType;
  duration: number;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = window.setTimeout(() => setMounted(true), 10);
    return () => window.clearTimeout(t);
  }, []);
  const style = typeStyles[type];

  return (
    <div className="mt-3 h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
      <div
        className={['h-full rounded-full', style.bar].join(' ')}
        style={{
          width: mounted ? '0%' : '100%',
          transitionProperty: 'width',
          transitionDuration: `${duration}ms`,
          transitionTimingFunction: 'linear',
        }}
      />
    </div>
  );
}
