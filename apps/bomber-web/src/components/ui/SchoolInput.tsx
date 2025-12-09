import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSchools } from '@/hooks/useSchools';
import type { FlatSchool } from '@/utils/school';

type Props = {
  label: string;
  value?: FlatSchool | null;
  onChange: (school: FlatSchool | null) => void;
  placeholder?: string;
  debounceMs?: number;
  className?: string;
  error?: string;
};

export default function SchoolInput({
  label,
  value,
  onChange,
  placeholder = 'Search schools…',
  debounceMs = 250,
  className = '',
  error,
}: Props) {
  const [query, setQuery] = useState(value?.name ?? '');
  const [open, setOpen] = useState(false);
  const [term, setTerm] = useState(query);
  const [activeIdx, setActiveIdx] = useState<number>(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Fetch schools from API
  const { data: schools = [], isLoading } = useSchools();

  // Keep input in sync if parent changes value
  useEffect(() => {
    setQuery(value?.name ?? '');
  }, [value?.name]);

  // Debounce query
  useEffect(() => {
    const t = setTimeout(() => setTerm(query), debounceMs);
    return () => clearTimeout(t);
  }, [query, debounceMs]);

  const filtered = useMemo(() => {
    const key = term.trim().toLowerCase();
    if (!key) return schools.slice(0, 50); // Limit initial results

    return schools.filter((s) => s.searchKey.includes(key)).slice(0, 100);
  }, [term, schools]);

  // Click outside to close
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const select = (school: FlatSchool) => {
    onChange(school);
    setQuery(school.name);
    setOpen(false);
    setActiveIdx(-1);
  };

  const clear = () => {
    onChange(null);
    setQuery('');
    setOpen(true);
    setActiveIdx(-1);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open && ['ArrowDown', 'ArrowUp'].includes(e.key)) {
      setOpen(true);
      setActiveIdx(0);
      return;
    }
    if (!open) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, Math.min(filtered.length, 100) - 1));
      scrollIntoView(activeIdx + 1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
      scrollIntoView(activeIdx - 1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const item = filtered[activeIdx];
      if (item) select(item);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  const scrollIntoView = (idx: number) => {
    const list = listRef.current;
    if (!list) return;
    const el = list.children.item(idx) as HTMLElement | null;
    if (el) el.scrollIntoView({ block: 'nearest' });
  };

  return (
    <div className={`relative ${className}`} ref={wrapperRef}>
      <label className="block text-sm font-bold text-white/80 mb-2 uppercase tracking-wider">
        {label}
      </label>

      <div className="relative">
        {/* Icon */}
        <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2">
          <svg
            className="h-5 w-5 text-white/60"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
        </div>

        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!open) setOpen(true);
            setActiveIdx(-1);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          disabled={isLoading}
          className={`w-full pl-12 pr-12 py-3 bg-neutral-950/50 border ${
            error ? 'border-red-500/50' : 'border-[#57a4ff]/30'
          } rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-[#57a4ff] focus:ring-1 focus:ring-[#57a4ff] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed`}
          autoComplete="off"
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls="school-dropdown"
        />

        {/* Clear button */}
        {query.length > 0 && !isLoading && (
          <button
            type="button"
            onClick={clear}
            aria-label="Clear"
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}

        {/* Loading indicator */}
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <svg
              className="animate-spin h-5 w-5 text-white/60"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Error message */}
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}

      {/* Dropdown */}
      {open && !isLoading && (
        <div
          className="absolute z-50 mt-2 w-full max-h-64 overflow-auto bg-neutral-900/95 backdrop-blur-sm border border-[#57a4ff]/30 rounded-lg shadow-2xl"
          role="listbox"
          id="school-dropdown"
        >
          <ul ref={listRef}>
            {filtered.length === 0 ? (
              <li className="px-4 py-3 text-white/60 text-center">
                {term.trim() ? 'No matches found' : 'Start typing to search...'}
              </li>
            ) : (
              filtered.map((s, i) => {
                const cityState = [s.city, s.state].filter(Boolean).join(', ');
                const active = i === activeIdx;
                return (
                  <li
                    key={`${s.name}-${i}`}
                    role="option"
                    aria-selected={active}
                    className={`px-4 py-3 cursor-pointer transition-colors ${
                      active
                        ? 'bg-[#57a4ff]/20 text-white'
                        : 'text-white/90 hover:bg-white/10'
                    }`}
                    onMouseEnter={() => setActiveIdx(i)}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => select(s)}
                  >
                    <div className="flex items-center gap-3">
                      {/* School logo */}
                      {s.imageUrl && (
                        <img
                          src={s.imageUrl}
                          alt={s.name}
                          className="w-8 h-8 object-contain rounded"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display =
                              'none';
                          }}
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-white truncate">
                          {s.name}
                        </div>
                        {cityState && (
                          <div className="text-xs text-white/60 mt-0.5">
                            {cityState}
                          </div>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
