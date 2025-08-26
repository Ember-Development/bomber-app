// apps/web/src/pages/Teams.tsx
import { useState, useEffect, useMemo, MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  PencilSquareIcon,
  TrashIcon,
  ClipboardIcon,
  ArrowsUpDownIcon,
  ChevronDownIcon,
  ArrowDownTrayIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import SideDialog from '@/components/SideDialog';
import { fetchTeams, createTeam, updateTeam, deleteTeam } from '@/api/team';
import type { TeamFE } from '@bomber-app/database/types/team';
import { US_STATES } from '@/utils/state';
import type { CreateTeamDTO, UpdateTeamDTO } from '@/api/team';
import { PublicUserFE, Regions } from '@bomber-app/database';
import { useToast } from '@/context/ToastProvider';
import { ColumnDef, exportCSV, exportXLS } from '@/utils/exporter';
import { fetchUsers } from '@/api/user';

/* ---------- Constants ---------- */

const REGION_OPTIONS: { value: Regions; label: string }[] = [
  { value: 'ACADEMY', label: 'Academy' },
  { value: 'PACIFIC', label: 'Pacific' },
  { value: 'MOUNTAIN', label: 'Mountain' },
  { value: 'MIDWEST', label: 'Midwest' },
  { value: 'NORTHEAST', label: 'Northeast' },
  { value: 'SOUTHEAST', label: 'Southeast' },
  { value: 'TEXAS', label: 'Texas' },
];

const AGE_OPTIONS = [
  'U8',
  'U10',
  'U12',
  'U14',
  'U16',
  'U18',
  'ALUMNI',
] as const;

type SortKey = 'name' | 'coach' | 'state' | 'ageGroup' | 'region';
type SortDir = 'asc' | 'desc';
type SortRule = { key: SortKey; dir: SortDir };

const PAGE_SIZE = 12;

/* ---------- Component ---------- */

export default function Teams() {
  const navigate = useNavigate();
  const { addToast } = useToast();

  // Data
  const [teams, setTeams] = useState<TeamFE[]>([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [nameFilter, setNameFilter] = useState('');
  const [coachFilter, setCoachFilter] = useState('');
  const [stateFilter, setStateFilter] = useState<'all' | string>('all');
  const [ageFilter, setAgeFilter] = useState<'all' | TeamFE['ageGroup']>('all');
  const [regionFilter, setRegionFilter] = useState<'all' | Regions>('all');

  // Sorting
  const [sortRules, setSortRules] = useState<SortRule[]>([
    { key: 'region', dir: 'asc' },
    { key: 'ageGroup', dir: 'desc' },
  ]);

  // Pagination
  const [page, setPage] = useState(1);

  // Dialogs
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<
    'create' | 'edit' | 'delete' | null
  >(null);
  const [selectedTeam, setSelectedTeam] = useState<TeamFE | null>(null);

  // Head coach search (for forms)
  const [allUsers, setAllUsers] = useState<PublicUserFE[]>([]);
  const [coachSearch, setCoachSearch] = useState('');
  const [pendingHeadCoachId, setPendingHeadCoachId] = useState<string | null>(
    null
  );

  // Create form state
  const [newTeam, setNewTeam] = useState<CreateTeamDTO>({
    name: '',
    ageGroup: 'U8',
    region: 'TEXAS',
    state: 'TX',
    headCoachUserID: null,
  });

  // Age sort order
  const AGE_ORDER = useMemo(
    () =>
      AGE_OPTIONS.reduce<Record<string, number>>((acc, val, idx) => {
        acc[val] = idx;
        return acc;
      }, {}),
    []
  );

  /* ---------- Effects ---------- */

  useEffect(() => {
    setLoading(true);
    fetchTeams()
      .then(setTeams)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchUsers().then(setAllUsers);
  }, []);

  // Reset page when inputs change
  useEffect(() => {
    setPage(1);
  }, [
    nameFilter,
    coachFilter,
    stateFilter,
    ageFilter,
    regionFilter,
    sortRules,
  ]);

  /* ---------- Helpers ---------- */

  const coachOptions = useMemo(
    () =>
      allUsers.filter((u) =>
        `${u.fname} ${u.lname}`
          .toLowerCase()
          .includes(coachSearch.toLowerCase())
      ),
    [allUsers, coachSearch]
  );

  const stateOptions = useMemo(
    () =>
      Array.from(
        new Set(teams.map((t) => t.state).filter(Boolean) as string[])
      ).sort(),
    [teams]
  );

  function toggleSort(key: SortKey) {
    setSortRules((prev) => {
      const idx = prev.findIndex((r) => r.key === key);
      if (idx === -1) return [...prev, { key, dir: 'asc' }];
      const current = prev[idx];
      const nextDir = current.dir === 'asc' ? 'desc' : null;
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

  function getSortable(a: TeamFE, key: SortKey): string | number {
    if (key === 'name') return a.name ?? '';
    if (key === 'coach') {
      return a.headCoach?.user
        ? `${a.headCoach.user.fname} ${a.headCoach.user.lname}`
        : '';
    }
    if (key === 'state') return a.state ?? '';
    if (key === 'ageGroup') {
      const idx =
        AGE_ORDER[(a.ageGroup as string) || ''] ?? Number.MAX_SAFE_INTEGER;
      return idx;
    }
    return a.region ?? '';
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

  function copyToClipboard(e: MouseEvent, code?: string | null) {
    e.stopPropagation();
    if (!code) return;
    navigator.clipboard
      .writeText(code)
      .then(() => addToast('Code Copied.', 'success'));
  }

  /* ---------- Filter + Sort + Paginate ---------- */

  const filteredSorted = useMemo(() => {
    const nf = nameFilter.trim().toLowerCase();
    const cf = coachFilter.trim().toLowerCase();

    let result = teams.filter((t) => {
      const coachName = t.headCoach?.user
        ? `${t.headCoach.user.fname} ${t.headCoach.user.lname}`.toLowerCase()
        : '';
      const byName = nf ? t.name.toLowerCase().includes(nf) : true;
      const byCoach = cf ? coachName.includes(cf) : true;
      const byState = stateFilter === 'all' ? true : t.state === stateFilter;
      const byAge = ageFilter === 'all' ? true : t.ageGroup === ageFilter;
      const byRegion =
        regionFilter === 'all' ? true : t.region === regionFilter;
      return byName && byCoach && byState && byAge && byRegion;
    });

    if (sortRules.length) {
      result = [...result].sort((a, b) => {
        for (const { key, dir } of sortRules) {
          const A = getSortable(a, key);
          const B = getSortable(b, key);
          const cmp =
            typeof A === 'number' && typeof B === 'number'
              ? A - B
              : String(A).localeCompare(String(B));
          if (cmp !== 0) return dir === 'asc' ? cmp : -cmp;
        }
        return 0;
      });
    }
    return result;
  }, [
    teams,
    nameFilter,
    coachFilter,
    stateFilter,
    ageFilter,
    regionFilter,
    sortRules,
  ]);

  const totalPages = Math.max(1, Math.ceil(filteredSorted.length / PAGE_SIZE));
  const paginated = filteredSorted.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  /* ---------- CRUD ---------- */

  function openCreate() {
    setDialogType('create');
    setNewTeam({
      name: '',
      ageGroup: 'U8',
      region: 'TEXAS',
      state: 'TX',
      headCoachUserID: null,
    });
    setCoachSearch('');
    setDialogOpen(true);
  }

  function openEdit(team: TeamFE) {
    setDialogType('edit');
    setSelectedTeam(team);
    setCoachSearch(
      team.headCoach?.user
        ? `${team.headCoach.user.fname} ${team.headCoach.user.lname}`
        : ''
    );
    setPendingHeadCoachId(team.headCoach?.user?.id ?? null);
    setDialogOpen(true);
  }

  function openDelete(team: TeamFE) {
    setDialogType('delete');
    setSelectedTeam(team);
    setDialogOpen(true);
  }

  function closeDialog() {
    setDialogOpen(false);
    setDialogType(null);
    setSelectedTeam(null);
    setPendingHeadCoachId(null);
  }

  async function handleConfirmCreate() {
    const created = await createTeam(newTeam);
    if (created) {
      setTeams((prev) => [created, ...prev]);
      closeDialog();
      addToast('Team created', 'success');
    }
  }

  async function handleSaveEdit() {
    if (!selectedTeam) return;
    const payload: UpdateTeamDTO = {
      name: selectedTeam.name,
      ageGroup: selectedTeam.ageGroup,
      region: selectedTeam.region,
      state: selectedTeam.state,
      headCoachUserID: pendingHeadCoachId,
    };
    const updated = await updateTeam(selectedTeam.id, payload);
    if (updated) {
      setTeams((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      closeDialog();
      addToast('Team updated', 'success');
    }
  }

  async function handleConfirmDelete() {
    if (!selectedTeam) return;
    const ok = await deleteTeam(selectedTeam.id);
    if (ok) {
      setTeams((prev) => prev.filter((t) => t.id !== selectedTeam.id));
      closeDialog();
      addToast('Team removed', 'success');
    }
  }

  /* ---------- Export ---------- */
  const [exportOpen, setExportOpen] = useState(false);

  const teamColumns: ColumnDef<TeamFE>[] = [
    { header: 'Team Name', accessor: (t) => t.name },
    { header: 'Team Code', accessor: (t) => t.teamCode ?? '' },
    {
      header: 'Coach',
      accessor: (t) =>
        t.headCoach?.user
          ? `${t.headCoach.user.fname} ${t.headCoach.user.lname}`
          : '',
    },
    { header: 'State', accessor: (t) => t.state ?? '' },
    { header: 'Age', accessor: (t) => t.ageGroup },
    { header: 'Region', accessor: (t) => t.region },
  ];

  /* ---------- UI ---------- */

  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 text-white hover:bg-white/10 rounded"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          <h1 className="text-3xl font-bold text-white">Bomber Teams</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-white/15 backdrop-blur-lg border border-white/30 text-white rounded-full hover:bg-blue-500 transition"
          >
            {' '}
            <UserGroupIcon className="w-5 h-5" />{' '}
            <span className="hidden xs:inline">Add New Team</span>{' '}
          </button>
          <div className="relative">
            <button
              onClick={() => setExportOpen((v) => !v)}
              onBlur={() => setTimeout(() => setExportOpen(false), 150)}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white transition"
              title="Export filtered teams"
            >
              <ArrowDownTrayIcon className="w-5 h-5" />
              <span className="hidden sm:inline">Export</span>
              <ChevronDownIcon className="w-4 h-4 opacity-80" />
            </button>

            {exportOpen && (
              <div className="absolute md:right-0 mt-2 min-w-[180px] rounded-xl bg-black/80 backdrop-blur-xl border border-white/15 shadow-2xl overflow-hidden z-10">
                <button
                  className="w-full text-left px-4 py-2 text-white/90 hover:bg-white/10 transition"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    exportCSV(filteredSorted, teamColumns, {
                      filenameBase: 'teams-filtered',
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
                    exportXLS(filteredSorted, teamColumns, {
                      filenameBase: 'teams-filtered',
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
      </div>

      {/* Filters */}
      <div className="bg-white/5 backdrop-blur-lg rounded-2xl overflow-hidden shadow-inner">
        <div className="p-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <input
            value={nameFilter}
            onChange={(e) => setNameFilter(e.target.value)}
            placeholder="Filter team name…"
            className="w-full px-3 py-2 rounded bg-white/10 placeholder-white/60 text-white"
          />
          <input
            value={coachFilter}
            onChange={(e) => setCoachFilter(e.target.value)}
            placeholder="Filter coach…"
            className="w-full px-3 py-2 rounded bg-white/10 placeholder-white/60 text-white"
          />
          <select
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value)}
            className="w-full px-3 py-2 rounded bg-white/10 text-white"
          >
            <option value="all" className="text-black">
              All States
            </option>
            {stateOptions.map((s) => (
              <option key={s} value={s} className="text-black">
                {s}
              </option>
            ))}
          </select>
          <select
            value={ageFilter}
            onChange={(e) => setAgeFilter(e.target.value as any)}
            className="w-full px-3 py-2 rounded bg-white/10 text-white"
          >
            <option value="all" className="text-black">
              All Ages
            </option>
            {AGE_OPTIONS.map((a) => (
              <option key={a} value={a} className="text-black">
                {a}
              </option>
            ))}
          </select>
          <select
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value as Regions | 'all')}
            className="w-full px-3 py-2 rounded bg-white/10 text-white"
          >
            <option value="all" className="text-black">
              All Regions
            </option>
            {REGION_OPTIONS.map((r) => (
              <option key={r.value} value={r.value} className="text-black">
                {r.label}
              </option>
            ))}
          </select>
        </div>
        {/* Sort summary */}
        {sortRules.length > 0 && (
          <div className="px-3 pb-3 text-xs text-white/70">
            Sorted by{' '}
            {sortRules.map((r, i) => `${i + 1}. ${r.key} ${r.dir}`).join(' → ')}
            <button
              onClick={() => setSortRules([])}
              className="ml-3 px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-white/90"
              title="Clear sorts"
            >
              Clear Sort
            </button>
          </div>
        )}
      </div>

      {/* Mobile/Tablet list */}
      <div className="xl:hidden divide-y divide-white/10 bg-white/5 backdrop-blur-lg rounded-2xl shadow-inner">
        {loading ? (
          <div className="p-4 text-center text-white/60">Loading…</div>
        ) : paginated.length === 0 ? (
          <div className="p-4 text-center text-white/60">No teams found.</div>
        ) : (
          paginated.map((t) => (
            <div
              key={t.id}
              className="p-4 hover:bg-white/10 cursor-pointer"
              onClick={() => navigate(`/teams/${t.id}`)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-white font-semibold truncate">
                    {t.name}
                  </div>
                  <div className="mt-1 text-xs text-white/70 flex flex-wrap gap-x-2 gap-y-1">
                    <span>
                      Coach:{' '}
                      {t.headCoach?.user
                        ? `${t.headCoach.user.fname} ${t.headCoach.user.lname}`
                        : 'N/A'}
                    </span>
                    <span>• Age: {t.ageGroup}</span>
                    <span>• Region: {t.region}</span>
                    <span>• State: {t.state ?? 'N/A'}</span>
                  </div>
                  {t.teamCode && (
                    <button
                      onClick={(e) => copyToClipboard(e, t.teamCode!)}
                      className="mt-2 inline-flex items-center gap-1 px-2 py-1 rounded bg-white/10 hover:bg-blue-500/70 text-xs"
                    >
                      {t.teamCode}
                      <ClipboardIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  <button
                    className="p-2 bg-white/15 rounded-lg hover:bg-blue-500"
                    onClick={(e) => {
                      e.stopPropagation();
                      openEdit(t);
                    }}
                  >
                    <PencilSquareIcon className="w-5 h-5 text-white" />
                  </button>
                  <button
                    className="p-2 bg-red-600 rounded-lg hover:bg-red-500"
                    onClick={(e) => {
                      e.stopPropagation();
                      openDelete(t);
                    }}
                  >
                    <TrashIcon className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop table */}
      <div className="hidden xl:block bg-white/5 backdrop-blur-lg rounded-2xl shadow-inner overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-[860px] w-full text-white">
            <thead className="bg-white/10">
              <tr>
                <th className="px-4 py-2 text-left">
                  Team Name <SortButton col="name" />
                </th>
                <th className="px-4 py-2 text-left">Team Code</th>
                <th className="px-4 py-2 text-left">
                  Coach <SortButton col="coach" />
                </th>
                <th className="px-4 py-2 text-left">
                  State <SortButton col="state" />
                </th>
                <th className="px-4 py-2 text-left">
                  Age <SortButton col="ageGroup" />
                </th>
                <th className="px-4 py-2 text-left">
                  Region <SortButton col="region" />
                </th>
                <th className="px-4 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-white/60">
                    Loading…
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-white/60">
                    No teams found.
                  </td>
                </tr>
              ) : (
                paginated.map((t) => (
                  <tr key={t.id} className="hover:bg-white/10">
                    <td className="px-4 py-3">{t.name}</td>
                    <td className="px-4 py-3">
                      {t.teamCode ? (
                        <button
                          onClick={(e) => copyToClipboard(e, t.teamCode)}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded bg-white/10 hover:bg-blue-500/70 text-xs"
                        >
                          {t.teamCode}
                          <ClipboardIcon className="w-4 h-4" />
                        </button>
                      ) : (
                        <span className="italic text-white/50">N/A</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {t.headCoach?.user
                        ? `${t.headCoach.user.fname} ${t.headCoach.user.lname}`
                        : 'N/A'}
                    </td>
                    <td className="px-4 py-3">{t.state ?? 'N/A'}</td>
                    <td className="px-4 py-3">{t.ageGroup}</td>
                    <td className="px-4 py-3">{t.region}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex gap-2">
                        <button
                          className="p-2 bg-white/15 rounded-lg hover:bg-blue-500"
                          onClick={() => openEdit(t)}
                        >
                          <PencilSquareIcon className="w-5 h-5 text-white" />
                        </button>
                        <button
                          className="p-2 bg-red-600 rounded-lg hover:bg-red-500"
                          onClick={() => openDelete(t)}
                        >
                          <TrashIcon className="w-5 h-5 text-white" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row gap-2 items-center justify-center sm:justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1 rounded bg-[#5AA5FF] text-white disabled:bg-[#5AA5FF]/40"
          >
            Prev
          </button>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1 rounded bg-[#5AA5FF] text-white disabled:bg-[#5AA5FF]/40"
          >
            Next
          </button>
        </div>
        <span className="text-white/80 text-sm sm:text-base">
          Page {page} / {totalPages} • {filteredSorted.length} total
        </span>
      </div>

      {/* Dialogs */}
      <SideDialog
        open={dialogOpen}
        onClose={closeDialog}
        title={
          dialogType === 'create'
            ? 'Add Team'
            : dialogType === 'edit'
              ? 'Edit Team'
              : 'Remove Team'
        }
        widthClass="w-[430px] max-w-[430px] min-w-[340px]"
      >
        {/* CREATE */}
        {dialogType === 'create' && (
          <div className="space-y-3 sm:space-y-4">
            <Label>Team Name</Label>
            <Input
              value={newTeam.name}
              onChange={(e) =>
                setNewTeam((t) => ({ ...t, name: e.target.value }))
              }
            />

            <Label>Age Group</Label>
            <Select
              value={newTeam.ageGroup}
              onChange={(e) =>
                setNewTeam((t) => ({ ...t, ageGroup: e.target.value as any }))
              }
              options={AGE_OPTIONS.map((a) => ({ value: a, label: a }))}
            />

            <Label>Region</Label>
            <Select
              value={newTeam.region}
              onChange={(e) =>
                setNewTeam((t) => ({ ...t, region: e.target.value as Regions }))
              }
              options={REGION_OPTIONS}
            />

            <Label>State</Label>
            <Select
              value={newTeam.state}
              onChange={(e) =>
                setNewTeam((t) => ({
                  ...t,
                  state: e.target.value as CreateTeamDTO['state'],
                }))
              }
              options={US_STATES}
            />

            <Label>Head Coach</Label>
            <Input
              placeholder="Search coach…"
              value={coachSearch}
              onChange={(e) => {
                setCoachSearch(e.target.value);
                setNewTeam((t) => ({ ...t, headCoachUserID: null }));
              }}
            />
            <CoachPicker
              options={coachOptions}
              selectedId={newTeam.headCoachUserID ?? null}
              onSelect={(id) =>
                setNewTeam((t) => ({ ...t, headCoachUserID: id }))
              }
            />

            <FormActions onSave={handleConfirmCreate} onCancel={closeDialog} />
          </div>
        )}

        {/* EDIT */}
        {dialogType === 'edit' && selectedTeam && (
          <div className="space-y-3 sm:space-y-4">
            <Label>Team Name</Label>
            <Input
              value={selectedTeam.name}
              onChange={(e) =>
                setSelectedTeam((t) => t && { ...t, name: e.target.value })
              }
            />

            <Label>Age Group</Label>
            <Select
              value={selectedTeam.ageGroup}
              onChange={(e) =>
                setSelectedTeam(
                  (t) => t && { ...t, ageGroup: e.target.value as any }
                )
              }
              options={AGE_OPTIONS.map((a) => ({ value: a, label: a }))}
            />

            <Label>Region</Label>
            <Select
              value={selectedTeam.region}
              onChange={(e) =>
                setSelectedTeam((t) =>
                  t ? { ...t, region: e.target.value as Regions } : t
                )
              }
              options={REGION_OPTIONS}
            />

            <Label>State</Label>
            <Select
              value={selectedTeam.state}
              onChange={(e) =>
                setSelectedTeam((t) =>
                  t ? { ...t, state: e.target.value as TeamFE['state'] } : t
                )
              }
              options={US_STATES}
            />

            <Label>Head Coach</Label>
            <Input
              placeholder="Search coach…"
              value={coachSearch}
              onChange={(e) => {
                setCoachSearch(e.target.value);
                setPendingHeadCoachId(null);
              }}
            />
            <CoachPicker
              options={coachOptions}
              selectedId={pendingHeadCoachId}
              onSelect={setPendingHeadCoachId}
            />

            <FormActions onSave={handleSaveEdit} onCancel={closeDialog} />
          </div>
        )}

        {/* DELETE */}
        {dialogType === 'delete' && selectedTeam && (
          <div className="space-y-4">
            <p className="text-white">
              Are you sure you want to remove the Team{' '}
              <b className="uppercase text-red-300">{selectedTeam.name}</b>?
            </p>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-6">
              <button
                onClick={closeDialog}
                className="px-4 py-2 bg-[#5AA5FF] text-white rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg"
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

/* ---------- Tiny UI helpers ---------- */

function Label({ children }: { children: string }) {
  return (
    <label className="block text-sm text-white font-semibold">{children}</label>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full px-4 py-2 bg-white/10 text-white rounded-lg ${props.className ?? ''}`}
    />
  );
}

function Select({
  options,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & {
  options: { value: string; label: string }[];
}) {
  return (
    <select
      {...props}
      className={`w-full px-4 py-2 bg-white/10 text-white rounded-lg ${props.className ?? ''}`}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value} className="text-black">
          {o.label}
        </option>
      ))}
    </select>
  );
}

function CoachPicker({
  options,
  selectedId,
  onSelect,
}: {
  options: PublicUserFE[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}) {
  return (
    <ul className="max-h-32 overflow-auto bg-black/20 rounded-lg divide-y divide-white/10">
      <li
        className={`px-3 py-1 text-white cursor-pointer ${
          selectedId === null ? 'bg-blue-500' : ''
        }`}
        onClick={() => onSelect(null)}
      >
        — none —
      </li>
      {options.map((c) => (
        <li
          key={c.id}
          className={`px-3 py-1 text-white cursor-pointer ${
            selectedId === c.id ? 'bg-blue-500' : ''
          }`}
          onClick={() => onSelect(c.id)}
        >
          {c.fname} {c.lname}
        </li>
      ))}
    </ul>
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
    <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-4">
      <button
        onClick={onSave}
        className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg"
      >
        Save
      </button>
      <button
        onClick={onCancel}
        className="flex-1 px-4 py-2 bg-white/20 text-white rounded-lg"
      >
        Cancel
      </button>
    </div>
  );
}
