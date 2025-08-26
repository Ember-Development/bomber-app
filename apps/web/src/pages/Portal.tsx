import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowDownTrayIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  ArrowsUpDownIcon,
} from '@heroicons/react/24/outline';

import { useToast } from '@/context/ToastProvider';
import { ColumnDef, exportCSV, exportXLS } from '@/utils/exporter';

import {
  fetchPortalLeads,
  type PortalLeadFE,
  type LeadKind,
  type AgeGroup,
} from '@/api/portal';

import CreatePortalLead from '@/components/forms/portals/CreatePortalLead';

const AGE_GROUPS: AgeGroup[] = [
  'U8',
  'U10',
  'U12',
  'U14',
  'U16',
  'U18',
  'ALUMNI',
];
const KINDS: LeadKind[] = ['PLAYER', 'PARENT'];

type SortKey =
  | 'createdAt'
  | 'kind'
  | 'player'
  | 'ageGroup'
  | 'pos'
  | 'gradYear'
  | 'parent'
  | 'contact'
  | 'converted';

type SortDir = 'asc' | 'desc';
type SortRule = { key: SortKey; dir: SortDir };

const portalColumns: ColumnDef<PortalLeadFE>[] = [
  {
    header: 'Created',
    accessor: (r) => new Date(r.createdAt).toLocaleString(),
  },
  { header: 'Kind', accessor: (r) => r.kind },
  {
    header: 'Player',
    accessor: (r) => `${r.playerFirstName} ${r.playerLastName}`.trim(),
  },
  { header: 'Age Group', accessor: (r) => r.ageGroup },
  {
    header: 'Pos',
    accessor: (r) => [r.pos1, r.pos2].filter(Boolean).join(', '),
  },
  { header: 'Grad Year', accessor: (r) => r.gradYear ?? '' },
  {
    header: 'Parent',
    accessor: (r) =>
      [r.parentFirstName, r.parentLastName].filter(Boolean).join(' '),
  },
  {
    header: 'Contact',
    accessor: (r) =>
      [r.email, r.phone].filter(Boolean).join(' / ') ||
      [r.parentEmail, r.parentPhone].filter(Boolean).join(' / '),
  },
  {
    header: 'Converted',
    accessor: (r) => (r.convertedPlayerId ? 'Yes' : 'No'),
  },
];

export default function Portal() {
  const { addToast } = useToast();

  const [loading, setLoading] = useState(false);
  const [leads, setLeads] = useState<PortalLeadFE[]>([]);

  // filters
  const [search, setSearch] = useState('');
  const [kind, setKind] = useState<LeadKind | ''>('');
  const [ageGroup, setAgeGroup] = useState<AgeGroup | ''>('');

  // sorting (multi-sort like Users.tsx)
  const [sortRules, setSortRules] = useState<SortRule[]>([
    { key: 'createdAt', dir: 'desc' },
  ]);

  // export dropdown (click-to-toggle like Users.tsx)
  const [exportOpen, setExportOpen] = useState(false);

  // create modal
  const [openCreate, setOpenCreate] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await fetchPortalLeads();
        setLeads(data);
      } catch (e: any) {
        addToast('Failed to load leads', 'error');
      } finally {
        setLoading(false);
      }
    })();
  }, [addToast]);

  // filter
  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    return leads.filter((l) => {
      if (kind && l.kind !== kind) return false;
      if (ageGroup && l.ageGroup !== ageGroup) return false;
      if (!s) return true;
      const hay = [
        l.playerFirstName,
        l.playerLastName,
        l.parentFirstName,
        l.parentLastName,
        l.email,
        l.phone,
        l.parentEmail,
        l.parentPhone,
        l.gradYear,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return hay.includes(s);
    });
  }, [leads, search, kind, ageGroup]);

  // sort (multi-rule)
  const sorted = useMemo(() => {
    const list = [...filtered];
    if (!sortRules.length) return list;

    return list.sort((a, b) => {
      for (const { key, dir } of sortRules) {
        let A = '';
        let B = '';
        switch (key) {
          case 'createdAt': {
            const dA = new Date(a.createdAt).getTime();
            const dB = new Date(b.createdAt).getTime();
            if (dA !== dB) return dir === 'asc' ? dA - dB : dB - dA;
            continue;
          }
          case 'kind':
            A = a.kind;
            B = b.kind;
            break;
          case 'player':
            A = `${a.playerFirstName} ${a.playerLastName}`;
            B = `${b.playerFirstName} ${b.playerLastName}`;
            break;
          case 'ageGroup':
            A = a.ageGroup;
            B = b.ageGroup;
            break;
          case 'pos':
            A = [a.pos1, a.pos2].filter(Boolean).join(', ');
            B = [b.pos1, b.pos2].filter(Boolean).join(', ');
            break;
          case 'gradYear':
            A = a.gradYear ?? '';
            B = b.gradYear ?? '';
            break;
          case 'parent':
            A = [a.parentFirstName, a.parentLastName].filter(Boolean).join(' ');
            B = [b.parentFirstName, b.parentLastName].filter(Boolean).join(' ');
            break;
          case 'contact':
            A = [a.email, a.phone].filter(Boolean).join(' ');
            B = [b.email, b.phone].filter(Boolean).join(' ');
            break;
          case 'converted':
            A = a.convertedPlayerId ? 'Y' : 'N';
            B = b.convertedPlayerId ? 'Y' : 'N';
            break;
        }
        const cmp = A.localeCompare(B);
        if (cmp !== 0) return dir === 'asc' ? cmp : -cmp;
      }
      return 0;
    });
  }, [filtered, sortRules]);

  // sort helpers (match Users.tsx)
  function toggleSort(key: SortKey) {
    setSortRules((prev) => {
      const idx = prev.findIndex((r) => r.key === key);
      if (idx === -1) return [...prev, { key, dir: 'asc' }];
      const nextDir = prev[idx].dir === 'asc' ? 'desc' : null;
      if (!nextDir) {
        const copy = [...prev];
        copy.splice(idx, 1);
        return copy;
      }
      const copy = [...prev];
      copy[idx] = { key, dir: nextDir };
      return copy;
    });
  }

  function SortButton({ col }: { col: SortKey }) {
    const idx = sortRules.findIndex((r) => r.key === col);
    const active = idx !== -1;
    const dir = active ? sortRules[idx].dir : null;
    const dirLabel = dir === 'asc' ? '↑' : dir === 'desc' ? '↓' : '';
    const orderBadge = active ? idx + 1 : null;
    return (
      <button
        onClick={() => toggleSort(col)}
        className={`ml-1 inline-flex items-center rounded px-1.5 py-0.5 text-xs transition ${
          active ? 'bg-blue-500/80 text-white' : 'bg-white/10 text-white/70'
        }`}
        title="Click to add/rotate multi-sort"
      >
        <ArrowsUpDownIcon className="w-3.5 h-3.5 mr-1" />
        {dirLabel}
        {orderBadge && (
          <span className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full bg-black/30 text-[10px]">
            {orderBadge}
          </span>
        )}
      </button>
    );
  }

  // export handlers (match Users.tsx)
  const onExportCSV = () => {
    exportCSV(sorted, portalColumns, { filenameBase: 'bomber-portal-leads' });
  };
  const onExportXLS = () => {
    exportXLS(sorted, portalColumns, { filenameBase: 'bomber-portal-leads' });
  };

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl md:text-2xl font-semibold">Bomber Portal</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setOpenCreate(true)}
            className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition"
          >
            <PlusIcon className="w-4 h-4" />
            New Lead
          </button>

          {/* Export dropdown: click-to-toggle */}
          <div className="relative">
            <button
              onClick={() => setExportOpen((v) => !v)}
              onBlur={() => setTimeout(() => setExportOpen(false), 150)}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition"
              title="Export filtered leads"
            >
              <ArrowDownTrayIcon className="w-4 h-4" />
              Export
              <ChevronDownIcon className="w-4 h-4" />
            </button>
            {exportOpen && (
              <div
                className="absolute right-0 mt-2 min-w-[180px] rounded-xl bg-black/80 backdrop-blur-xl border border-white/15 shadow-2xl overflow-hidden z-50"
                onMouseDown={(e) => e.preventDefault()}
              >
                <button
                  className="w-full text-left px-4 py-2 text-white/90 hover:bg-white/10 transition"
                  onClick={() => {
                    onExportCSV();
                    addToast('Exported CSV', 'success');
                    setExportOpen(false);
                  }}
                >
                  CSV (filtered)
                </button>
                <button
                  className="w-full text-left px-4 py-2 text-white/90 hover:bg-white/10 transition"
                  onClick={() => {
                    onExportXLS();
                    addToast('Exported Excel', 'success');
                    setExportOpen(false);
                  }}
                >
                  Excel (filtered)
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-2">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10">
          <MagnifyingGlassIcon className="w-4 h-4" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name/email/phone…"
            className="bg-transparent outline-none flex-1"
          />
        </div>
        <select
          value={kind}
          onChange={(e) => setKind((e.target.value || '') as LeadKind | '')}
          className="px-3 py-2 rounded-lg bg-white/10"
        >
          <option value="">All Lead Kinds</option>
          {KINDS.map((k) => (
            <option key={k} value={k}>
              {k}
            </option>
          ))}
        </select>
        <select
          value={ageGroup}
          onChange={(e) => setAgeGroup((e.target.value || '') as AgeGroup | '')}
          className="px-3 py-2 rounded-lg bg-white/10"
        >
          <option value="">All Age Groups</option>
          {AGE_GROUPS.map((ag) => (
            <option key={ag} value={ag}>
              {ag}
            </option>
          ))}
        </select>
        <div />
      </div>

      {/* Sort summary + clear (like Users.tsx) */}
      <div className="flex items-center justify-end mb-4 gap-2">
        {sortRules.length > 0 && (
          <span className="text-xs text-white/70">
            Sorted by{' '}
            {sortRules.map((r, i) => `${i + 1}. ${r.key} ${r.dir}`).join(' → ')}
          </span>
        )}
        {sortRules.length > 0 && (
          <button
            onClick={() => setSortRules([])}
            className="px-3 py-1.5 rounded bg-white/10 hover:bg-white/20 text-white/90 transition"
            title="Clear sorts"
          >
            Clear Sort
          </button>
        )}
      </div>

      {/* Desktop/Tablet table */}
      <div className="hidden sm:block bg-white/5 backdrop-blur-lg rounded-2xl overflow-hidden shadow-inner">
        <div className="overflow-x-auto">
          <table className="min-w-[1000px] w-full text-sm">
            <thead className="sticky top-0 bg-white/10">
              <tr>
                {[
                  ['Created', 'createdAt'],
                  ['Kind', 'kind'],
                  ['Player', 'player'],
                  ['Age Group', 'ageGroup'],
                  ['Pos', 'pos'],
                  ['Grad', 'gradYear'],
                  ['Parent', 'parent'],
                  ['Contact', 'contact'],
                  ['Converted', 'converted'],
                ].map(([label, key]) => (
                  <th key={key} className="text-left px-3 py-2 font-medium">
                    <div className="inline-flex items-center">
                      <span>{label}</span>
                      <SortButton col={key as SortKey} />
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-3 py-6 text-center">
                    Loading…
                  </td>
                </tr>
              ) : sorted.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-3 py-6 text-center opacity-70">
                    No leads found.
                  </td>
                </tr>
              ) : (
                sorted.map((r) => (
                  <tr
                    key={r.id}
                    className="border-t border-white/5 hover:bg-white/5"
                  >
                    <td className="px-3 py-2">
                      {new Date(r.createdAt).toLocaleString()}
                    </td>
                    <td className="px-3 py-2">{r.kind}</td>
                    <td className="px-3 py-2">
                      {r.playerFirstName} {r.playerLastName}
                    </td>
                    <td className="px-3 py-2">{r.ageGroup}</td>
                    <td className="px-3 py-2">
                      {[r.pos1, r.pos2].filter(Boolean).join(', ')}
                    </td>
                    <td className="px-3 py-2">{r.gradYear ?? ''}</td>
                    <td className="px-3 py-2">
                      {[r.parentFirstName, r.parentLastName]
                        .filter(Boolean)
                        .join(' ')}
                    </td>
                    <td className="px-3 py-2">
                      {[r.email, r.phone].filter(Boolean).join(' · ') ||
                        [r.parentEmail, r.parentPhone]
                          .filter(Boolean)
                          .join(' · ')}
                    </td>
                    <td className="px-3 py-2">
                      {r.convertedPlayerId ? 'Yes' : 'No'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile list */}
      <div className="sm:hidden divide-y divide-white/10 rounded-2xl overflow-hidden bg-white/5 backdrop-blur-lg shadow-inner">
        {loading ? (
          <div className="p-4 text-center text-white/60">Loading...</div>
        ) : sorted.length === 0 ? (
          <div className="p-4 text-center text-white/60">No leads found.</div>
        ) : (
          sorted.map((r) => {
            const contact =
              [r.email, r.phone].filter(Boolean).join(' · ') ||
              [r.parentEmail, r.parentPhone].filter(Boolean).join(' · ');
            return (
              <div key={r.id} className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-white font-medium truncate">
                      {r.playerFirstName} {r.playerLastName}
                    </div>
                    <div className="text-white/70 text-sm">
                      {r.kind} • {r.ageGroup}
                    </div>

                    <div className="mt-2 text-sm text-white/80 space-y-1">
                      <div>
                        <span className="font-semibold">Pos:</span>{' '}
                        {[r.pos1, r.pos2].filter(Boolean).join(', ') || '—'}
                      </div>
                      <div>
                        <span className="font-semibold">Grad:</span>{' '}
                        {r.gradYear || '—'}
                      </div>
                      <div className="break-words">
                        <span className="font-semibold">Contact:</span>{' '}
                        {contact || '—'}
                      </div>
                      {(r.parentFirstName || r.parentLastName) && (
                        <div className="break-words">
                          <span className="font-semibold">Parent:</span>{' '}
                          {[r.parentFirstName, r.parentLastName]
                            .filter(Boolean)
                            .join(' ')}
                        </div>
                      )}
                      <div className="text-xs text-white/60">
                        {new Date(r.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="shrink-0">
                    <span
                      className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${
                        r.convertedPlayerId
                          ? 'bg-emerald-500 text-white'
                          : 'bg-white/15 text-white'
                      }`}
                    >
                      {r.convertedPlayerId ? 'Converted' : 'Lead'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create Lead Modal */}
      <CreatePortalLead
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        onCreated={(lead: PortalLeadFE) => {
          setLeads((prev) => [lead, ...prev]);
          addToast('Lead created', 'success');
        }}
      />
    </div>
  );
}
