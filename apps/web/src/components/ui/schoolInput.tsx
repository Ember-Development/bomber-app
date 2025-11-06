import React, { useEffect, useMemo, useRef, useState } from 'react';
import rawSchools from '@/assets/data/schools.json'; // adjust if needed
import { XMarkIcon, BuildingLibraryIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { FlatSchool, flattenSchools } from '@/utils/school';
import { useSchools } from '@/hooks/useSchools';

// Fallback schools in case API is unavailable
const fallbackSchools: FlatSchool[] = flattenSchools(rawSchools);

type Props = {
  label: string;
  value?: FlatSchool;
  onChange: (school: FlatSchool) => void;
  placeholder?: string;
  debounceMs?: number;
  fullWidth?: boolean;
  className?: string;
};

const GLASS = {
  input:
    'rounded-xl border border-white/30 bg-white/10 text-white placeholder-white/50',
  panel:
    'rounded-xl border border-white/30 bg-black/90 backdrop-blur-md shadow-xl',
  row: 'px-3 py-2 cursor-pointer hover:bg-white/10',
  rowActive: 'bg-white/15',
};

export default function SchoolInputWeb({
  label,
  value,
  onChange,
  placeholder = 'Search schools…',
  debounceMs = 250,
  fullWidth = false,
  className,
}: Props) {
  const [query, setQuery] = useState(value?.name ?? '');
  const [open, setOpen] = useState(false);
  const [term, setTerm] = useState(query);
  const [activeIdx, setActiveIdx] = useState<number>(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Fetch schools from API, with fallback to bundled data
  const { schools } = useSchools();
  const allSchools = schools.length > 0 ? schools : fallbackSchools;

  // keep input in sync if parent changes value
  useEffect(() => {
    setQuery(value?.name ?? '');
  }, [value?.name]);

  // debounce query
  useEffect(() => {
    const t = setTimeout(() => setTerm(query), debounceMs);
    return () => clearTimeout(t);
  }, [query, debounceMs]);

  const filtered = useMemo(() => {
    const key = term.trim().toLowerCase();
    if (!key) return allSchools;
    return allSchools.filter((s) => s.searchKey.includes(key));
  }, [term, allSchools]);

  // click outside to close
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
    <div
      className={clsx('relative', fullWidth && 'w-full', className)}
      ref={wrapperRef}
    >
      <label className="mb-1 block text-sm font-semibold text-white">
        {label}
      </label>

      <div className="flex items-center gap-2">
        <div className="pointer-events-none absolute ml-3 mt-[9px]">
          <BuildingLibraryIcon className="h-5 w-5 text-white" />
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
          className={clsx(
            GLASS.input,
            'w-full pl-10 pr-10 py-2.5 outline-none focus:ring-2 focus:ring-white/30'
          )}
          autoComplete="off"
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls="school-dropdown"
        />

        {query?.length ? (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setOpen(true);
              setActiveIdx(-1);
            }}
            aria-label="Clear"
            className="absolute right-2 mt-[6px] rounded p-1 text-white/90 hover:bg-white/10"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        ) : null}
      </div>

      {open && (
        <div
          className={clsx(
            GLASS.panel,
            'absolute z-50 mt-2 max-h-64 w-full overflow-auto'
          )}
          role="listbox"
          id="school-dropdown"
        >
          <ul ref={listRef}>
            {filtered.slice(0, 100).map((s, i) => {
              const cityState = [s.city, s.state].filter(Boolean).join(', ');
              const active = i === activeIdx;
              return (
                <li
                  key={`${s.name}-${i}`}
                  role="option"
                  aria-selected={active}
                  className={clsx(
                    GLASS.row,
                    'flex flex-col',
                    active && GLASS.rowActive
                  )}
                  onMouseEnter={() => setActiveIdx(i)}
                  onMouseDown={(e) => e.preventDefault()} // avoid blurring input
                  onClick={() => select(s)}
                >
                  <span className="text-white font-semibold">{s.name}</span>
                  {cityState ? (
                    <span className="text-xs text-white/60 mt-0.5">
                      {cityState}
                    </span>
                  ) : null}
                </li>
              );
            })}

            {filtered.length === 0 && (
              <li className="px-3 py-3 text-white/60">No matches</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
