// apps/web/src/pages/Coaches.tsx
import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeftIcon,
  PencilSquareIcon,
  TrashIcon,
  ArrowsUpDownIcon,
  ArrowDownTrayIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

import SideDialog from '@/components/SideDialog';
import { useToast } from '@/context/ToastProvider';
import { exportCSV, exportXLS, type ColumnDef } from '@/utils/exporter';

import {
  fetchCoaches,
  fetchRegCoaches,
  fetchCoachById,
  updateCoach,
  removeCoachFromTeam,
  type UpdateCoachPayload,
} from '@/api/coach';

import type { CoachFE, RegCoachFE } from '@bomber-app/database';

type RowType = 'COACH' | 'REGIONAL_COACH';

type Row = {
  id: string;
  type: RowType;
  name: string;
  email: string;
  phone?: string;
  teams: string; // comma-separated
  headTeams: string; // comma-separated
  region?: string; // for RegCoach
  address?: string; // flattened if present
};

const REGIONS = [
  'ACADEMY',
  'PACIFIC',
  'MOUNTAIN',
  'MIDWEST',
  'NORTHEAST',
  'SOUTHEAST',
  'TEXAS',
] as const;

const PAGE_SIZE = 15;

// Sorting
type SortKey = 'name' | 'type' | 'teams' | 'region';
type SortDir = 'asc' | 'desc';
type SortRule = { key: SortKey; dir: SortDir };

export default function Coaches() {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [rawCoaches, setRawCoaches] = useState<CoachFE[]>([]);
  const [rawRegCoaches, setRawRegCoaches] = useState<RegCoachFE[]>([]);
  const [loading, setLoading] = useState(false);

  // filters / paging
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | RowType>('all');
  const [regionFilter, setRegionFilter] = useState<'all' | string>('all');
  const [page, setPage] = useState(1);

  // sorting (multi)
  const [sortRules, setSortRules] = useState<SortRule[]>([
    { key: 'type', dir: 'asc' },
    { key: 'name', dir: 'asc' },
  ]);

  // dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'edit' | 'delete' | null>(null);
  const [selected, setSelected] = useState<Row | null>(null);

  // export dropdown
  const [exportOpen, setExportOpen] = useState(false);

  // Load
  useEffect(() => {
    setLoading(true);
    Promise.all([fetchCoaches(), fetchRegCoaches()])
      .then(([coaches, regCoaches]) => {
        setRawCoaches(coaches);
        setRawRegCoaches(regCoaches);
      })
      .catch(() => {
        setRawCoaches([]);
        setRawRegCoaches([]);
      })
      .finally(() => setLoading(false));
  }, []);

  // Map to Rows
  const rowsAll: Row[] = useMemo(() => {
    const coachRows: Row[] = rawCoaches.map((c) => ({
      id: String(c.id),
      type: 'COACH',
      name:
        `${c.user?.fname ?? ''} ${c.user?.lname ?? ''}`.trim() || '(No Name)',
      email: c.user?.email ?? '',
      phone: c.user?.phone ?? '',
      teams: (c.teams ?? []).map((t) => t.name).join(', '),
      headTeams: (c.headTeams ?? []).map((t) => t.name).join(', '),
      region: undefined,
      address: c.address
        ? [c.address.address1, c.address.city, c.address.state, c.address.zip]
            .filter(Boolean)
            .join(', ')
        : undefined,
    }));

    const regRows: Row[] = rawRegCoaches.map((r) => ({
      id: String(r.id),
      type: 'REGIONAL_COACH',
      name:
        `${r.user?.fname ?? ''} ${r.user?.lname ?? ''}`.trim() || '(No Name)',
      email: r.user?.email ?? '',
      phone: r.user?.phone ?? '',
      teams: (Array.isArray(r.teams) ? r.teams : [])
        .map((t: { name: string }) => t.name)
        .join(', '),
      headTeams: '',
      region: r.region as string | undefined,
      address: undefined,
    }));

    return [...coachRows, ...regRows];
  }, [rawCoaches, rawRegCoaches]);

  // Filters + sorting
  const filteredSorted = useMemo(() => {
    let list = rowsAll;

    if (typeFilter !== 'all') list = list.filter((r) => r.type === typeFilter);
    if (regionFilter !== 'all')
      list = list.filter((r) => (r.region ?? '') === regionFilter);

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.email.toLowerCase().includes(q) ||
          r.teams.toLowerCase().includes(q) ||
          (r.region ?? '').toLowerCase().includes(q)
      );
    }

    if (sortRules.length) {
      list = [...list].sort((a, b) => {
        for (const { key, dir } of sortRules) {
          const A =
            key === 'name'
              ? a.name
              : key === 'type'
                ? a.type
                : key === 'teams'
                  ? a.teams
                  : (a.region ?? '');
          const B =
            key === 'name'
              ? b.name
              : key === 'type'
                ? b.type
                : key === 'teams'
                  ? b.teams
                  : (b.region ?? '');
          const cmp = A.localeCompare(B);
          if (cmp !== 0) return dir === 'asc' ? cmp : -cmp;
        }
        return 0;
      });
    }

    return list;
  }, [rowsAll, search, typeFilter, regionFilter, sortRules]);

  // paging
  useEffect(() => setPage(1), [search, typeFilter, regionFilter]);
  const totalPages = Math.max(1, Math.ceil(filteredSorted.length / PAGE_SIZE));
  const paginated = filteredSorted.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  // sort control
  function toggleSort(key: SortKey) {
    setSortRules((prev) => {
      const idx = prev.findIndex((r) => r.key === key);
      if (idx === -1) return [...prev, { key, dir: 'asc' }];
      const next = prev[idx].dir === 'asc' ? 'desc' : null;
      if (!next) {
        const copy = [...prev];
        copy.splice(idx, 1);
        return copy;
      }
      const copy = [...prev];
      copy[idx] = { key, dir: next };
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

  // exports (same pattern as Users)
  const columns: ColumnDef<Row>[] = [
    { header: 'Name', accessor: (r) => r.name },
    { header: 'Email', accessor: (r) => r.email },
    { header: 'Type', accessor: (r) => r.type },
    { header: 'Teams', accessor: (r) => r.teams },
    { header: 'Head Teams', accessor: (r) => r.headTeams },
    { header: 'Region', accessor: (r) => r.region ?? '' },
    { header: 'Phone', accessor: (r) => r.phone ?? '' },
    { header: 'Address', accessor: (r) => r.address ?? '' },
  ];

  // dialog helpers (edit only for Coaches in this page; Reg Coaches are view-only here)
  const openEdit = (r: Row) => {
    if (r.type !== 'COACH') return;
    setSelected(r);
    setDialogType('edit');
    setDialogOpen(true);
  };
  const openDelete = (r: Row) => {
    if (r.type !== 'COACH') return;
    setSelected(r);
    setDialogType('delete');
    setDialogOpen(true);
  };
  const closeDialog = () => {
    setDialogOpen(false);
    setDialogType(null);
    setSelected(null);
  };

  // small inline edit form (coach only) – keep minimal, address + phone
  function EditForm({ row }: { row: Row }) {
    const coach = rawCoaches.find((c) => String(c.id) === row.id);
    const [form, setForm] = useState<UpdateCoachPayload>({
      // Prisma.CoachUpdateInput-like; we’ll only send scalar extras here
      // these top-level extras are handled in your backend
      address1: coach?.address?.address1 ?? '',
      address2: coach?.address?.address2 ?? '',
      city: coach?.address?.city ?? '',
      state: coach?.address?.state ?? '',
      zip: coach?.address?.zip ?? '',
      user: {
        update: {
          phone: coach?.user?.phone ?? '',
        },
      },
    } as UpdateCoachPayload);

    async function onSave() {
      await updateCoach(row.id, form);
      // refresh that coach row
      const fresh = await fetchCoachById(row.id);
      setRawCoaches((prev) =>
        prev.map((c) => (String(c.id) === row.id ? fresh : c))
      );
      addToast('Coach updated', 'success');
      closeDialog();
    }

    return (
      <div className="space-y-4">
        <Field label="Phone">
          <input
            className="w-full px-4 py-2 bg-white/10 text-white rounded-lg"
            value={(form.user as any)?.update?.phone ?? ''}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                user: {
                  update: { ...(f.user as any)?.update, phone: e.target.value },
                } as any,
              }))
            }
          />
        </Field>
        <Field label="Address 1">
          <input
            className="w-full px-4 py-2 bg-white/10 text-white rounded-lg"
            value={form.address1 ?? ''}
            onChange={(e) => setForm({ ...form, address1: e.target.value })}
          />
        </Field>
        <Field label="Address 2">
          <input
            className="w-full px-4 py-2 bg-white/10 text-white rounded-lg"
            value={form.address2 ?? ''}
            onChange={(e) => setForm({ ...form, address2: e.target.value })}
          />
        </Field>
        <div className="grid grid-cols-3 gap-3">
          <Field label="City">
            <input
              className="w-full px-4 py-2 bg-white/10 text-white rounded-lg"
              value={form.city ?? ''}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
            />
          </Field>
          <Field label="State">
            <input
              className="w-full px-4 py-2 bg-white/10 text-white rounded-lg"
              value={form.state ?? ''}
              onChange={(e) => setForm({ ...form, state: e.target.value })}
            />
          </Field>
          <Field label="Zip">
            <input
              className="w-full px-4 py-2 bg-white/10 text-white rounded-lg"
              value={form.zip ?? ''}
              onChange={(e) => setForm({ ...form, zip: e.target.value })}
            />
          </Field>
        </div>

        <FormActions onSave={onSave} onCancel={closeDialog} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      <div
        className={`flex-1 flex flex-col gap-6 sm:gap-8 ${dialogOpen ? 'sm:pr-[50px]' : ''}`}
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 bg-white/10 rounded-lg text-white hover:bg-white/20"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
            <div className="text-3xl lg:text-3xl font-bold text-white">
              Manage Coaches
            </div>
          </div>

          {/* Export dropdown */}
          <div className="relative">
            <button
              onClick={() => setExportOpen((v) => !v)}
              onBlur={() => setTimeout(() => setExportOpen(false), 150)}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-white/10 hover:bg白/20 border border-white/20 text-white transition"
              title="Export filtered coaches"
            >
              <ArrowDownTrayIcon className="w-5 h-5" />
              <span className="hidden sm:inline">Export</span>
              <ChevronDownIcon className="w-4 h-4 opacity-80" />
            </button>
            {exportOpen && (
              <div className="absolute md:right-0 mt-2 min-w-[200px] rounded-xl bg-black/80 backdrop-blur-xl border border-white/15 shadow-2xl overflow-hidden z-10">
                <button
                  className="w-full text-left px-4 py-2 text-white/90 hover:bg-white/10 transition"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    exportCSV(filteredSorted, columns, {
                      filenameBase: 'coaches-filtered',
                    });
                    addToast('Exported CSV', 'success');
                    setExportOpen(false);
                  }}
                >
                  CSV (filtered)
                </button>
                <button
                  className="w-full text-left px-4 py-2 text-white/90 hover:bg-white/10 transition"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    exportXLS(filteredSorted, columns, {
                      filenameBase: 'coaches-filtered',
                    });
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

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
            placeholder="Search (name, email, team, region)…"
            className="w-full px-4 py-2 bg-white/5 placeholder-white/70 text-white rounded-lg focus:outline-none"
          />
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="px-4 py-2 bg-white/10 text-white rounded-lg"
            >
              <option value="all">All Types</option>
              <option value="COACH" className="text-black">
                Coaches
              </option>
              <option value="REGIONAL_COACH" className="text-black">
                Regional Coaches
              </option>
            </select>
            <select
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value)}
              className="px-4 py-2 bg-white/10 text-white rounded-lg"
            >
              <option value="all" className="text-black">
                All Regions
              </option>
              {REGIONS.map((r) => (
                <option key={r} value={r} className="text-black">
                  {r}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white/5 backdrop-blur-lg rounded-2xl overflow-hidden shadow-inner">
          <div className="hidden xl:block">
            <div className="overflow-x-auto">
              <table className="min-w-[980px] w-full table-auto text-white">
                <thead className="sticky top-0 bg-white/10 border-b border-white/15">
                  <tr>
                    <th className="px-4 py-3 text-left">
                      Name <SortButton col="name" />
                    </th>
                    <th className="px-4 py-3 text-left">
                      Type <SortButton col="type" />
                    </th>
                    <th className="px-4 py-3 text-left">
                      Teams <SortButton col="teams" />
                    </th>
                    <th className="px-4 py-3 text-left">
                      Region <SortButton col="region" />
                    </th>
                    <th className="px-4 py-3 text-left">Email</th>
                    <th className="px-4 py-3 text-left">Head Teams</th>
                    <th className="px-4 py-3 text-left">Phone</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                  <tr className="bg-white/5">
                    <th colSpan={8} className="px-4 py-2">
                      <div className="flex items-center justify-between text-xs text-white/70">
                        <div className="truncate">
                          {sortRules.length > 0 &&
                            `Sorted by ${sortRules
                              .map((r, i) => `${i + 1}. ${r.key} ${r.dir}`)
                              .join(' → ')}`}
                        </div>
                        {sortRules.length > 0 && (
                          <button
                            onClick={() => setSortRules([])}
                            className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-white"
                            title="Clear sorts"
                          >
                            Clear sorts
                          </button>
                        )}
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-6 py-10 text-center text-white/60"
                      >
                        Loading...
                      </td>
                    </tr>
                  ) : paginated.length === 0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-6 py-10 text-center text-white/60"
                      >
                        No coaches found.
                      </td>
                    </tr>
                  ) : (
                    paginated.map((r) => (
                      <tr
                        key={`${r.type}-${r.id}`}
                        className="hover:bg-white/10"
                      >
                        <td className="px-4 py-3">{r.name}</td>
                        <td className="px-4 py-3">
                          {r.type === 'COACH' ? 'Coach' : 'Regional Coach'}
                        </td>
                        <td className="px-4 py-3">{r.teams || '—'}</td>
                        <td className="px-4 py-3">{r.region ?? '—'}</td>
                        <td className="px-4 py-3">{r.email}</td>
                        <td className="px-4 py-3">{r.headTeams || '—'}</td>
                        <td className="px-4 py-3">{r.phone || '—'}</td>
                        <td className="px-4 py-3 text-right">
                          {r.type === 'COACH' ? (
                            <div className="inline-flex gap-2">
                              <button
                                className="p-2 bg-white/10 rounded-lg hover:bg-[#5AA5FF]"
                                onClick={() => openEdit(r)}
                              >
                                <PencilSquareIcon className="w-5 h-5 text-white" />
                              </button>
                              <button
                                className="p-2 bg-white/10 rounded-lg hover:bg-red-600"
                                onClick={() => openDelete(r)}
                              >
                                <TrashIcon className="w-5 h-5 text-white" />
                              </button>
                            </div>
                          ) : (
                            <span className="text-white/50 text-sm">—</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile/Tablet list */}
          <div className="xl:hidden divide-y divide-white/10">
            {loading ? (
              <div className="p-4 text-center text-white/60">Loading...</div>
            ) : paginated.length === 0 ? (
              <div className="p-4 text-center text-white/60">
                No coaches found.
              </div>
            ) : (
              paginated.map((r) => (
                <div key={`${r.type}-${r.id}`} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-white font-semibold truncate">
                        {r.name}
                      </div>
                      <div className="text-white/80 text-sm truncate">
                        {r.type === 'COACH' ? 'Coach' : 'Regional Coach'}
                        {r.region ? ` • ${r.region}` : ''}
                      </div>
                      {r.teams && (
                        <div className="text-white/70 text-xs mt-1">
                          Teams: {r.teams}
                        </div>
                      )}
                      {r.headTeams && (
                        <div className="text-white/70 text-xs">
                          Head Teams: {r.headTeams}
                        </div>
                      )}
                      <div className="text-white/70 text-xs">
                        {r.email} {r.phone ? `• ${r.phone}` : ''}
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      {r.type === 'COACH' ? (
                        <>
                          <button
                            className="p-2 bg-white/10 rounded-lg hover:bg-[#5AA5FF]"
                            onClick={() => openEdit(r)}
                          >
                            <PencilSquareIcon className="w-5 h-5 text-white" />
                          </button>
                          <button
                            className="p-2 bg-white/10 rounded-lg hover:bg-red-600"
                            onClick={() => openDelete(r)}
                          >
                            <TrashIcon className="w-5 h-5 text-white" />
                          </button>
                        </>
                      ) : (
                        <span className="text-white/50 text-xs self-center">
                          —
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row gap-2 items-center justify-center sm:justify-between p-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 rounded bg-[#5AA5FF] text-white disabled:bg-[#5AA5FF]/40"
            >
              Prev
            </button>
            <button
              onClick={() => setPage((p) => (p < totalPages ? p + 1 : p))}
              disabled={page === totalPages}
              className="px-3 py-1 rounded bg-[#5AA5FF] text-white disabled:bg-[#5AA5FF]/40"
            >
              Next
            </button>
          </div>
          <span className="text-white/80 text-sm sm:text-base">
            Page {page} / {totalPages}
          </span>
        </div>
      </div>

      {/* Dialogs */}
      <SideDialog
        open={dialogOpen}
        onClose={closeDialog}
        title={dialogType === 'edit' ? 'Edit Coach' : 'Remove Coach'}
      >
        {dialogType === 'edit' && selected && selected.type === 'COACH' && (
          <EditForm row={selected} />
        )}

        {dialogType === 'delete' && selected && selected.type === 'COACH' && (
          <div className="space-y-4">
            <p className="text-white">
              Remove <b>{selected.name}</b> from a team?
            </p>
            <p className="text-white/70 text-sm">
              This action uses <code>removeCoachFromTeam</code>. You may want to
              expose team selection here if needed. For now this confirms you’ll
              implement the UX you prefer.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-6">
              <button
                onClick={closeDialog}
                className="flex-1 px-4 py-2 bg-[#5AA5FF] text-white rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  // TODO: pick a teamId via UI; placeholder prevents accidental call:
                  addToast('Wire up team selection for removal', 'info');
                  closeDialog();
                }}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg"
              >
                Confirm
              </button>
            </div>
          </div>
        )}
      </SideDialog>
    </div>
  );
}

/* ---------- Small presentational helpers ---------- */
function Field({
  label,
  children,
}: React.PropsWithChildren<{ label: string }>) {
  return (
    <div>
      <label className="block text-sm text-white font-semibold">{label}</label>
      {children}
    </div>
  );
}

function FormActions({
  onSave,
  onCancel,
}: {
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:space-x-4 mt-6">
      <button
        onClick={onSave}
        className="flex-1 px-4 py-2 bg-[#5AA5FF] text-white rounded-lg hover:bg-[#3C8CE7] whitespace-nowrap"
      >
        Save
      </button>
      <button
        onClick={onCancel}
        className="flex-1 mt-4 sm:mt-0 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 whitespace-nowrap"
      >
        Cancel
      </button>
    </div>
  );
}
