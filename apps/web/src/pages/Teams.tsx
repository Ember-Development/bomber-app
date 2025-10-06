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
import { createNotification, sendNotificationNow } from '@/api/notification';

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

const REGION_OPTIONS: { value: Regions; label: string }[] = [
  { value: 'ACADEMY', label: 'Academy' },
  { value: 'PACIFIC', label: 'Pacific' },
  { value: 'MOUNTAIN', label: 'Mountain' },
  { value: 'MIDWEST', label: 'Midwest' },
  { value: 'NORTHEAST', label: 'Northeast' },
  { value: 'SOUTHEAST', label: 'Southeast' },
  { value: 'TEXAS', label: 'Texas' },
];

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

  // Create Notification
  async function createAndSendTeamCreatedNotification(team: TeamFE) {
    const title = 'New Bomber Team!';
    const bits = [team.ageGroup, team.region, team.state]
      .filter(Boolean)
      .join(' • ');
    const body = `${team.name} (${bits}) has been created.`;
    const deepLink = `bomber://teams/${team.id}`;

    const draft = await createNotification({
      title,
      body,
      deepLink,
      platform: 'both',
      audience: { all: true },
    });

    if (draft?.id) {
      await sendNotificationNow(draft.id);
    }
  }

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

<<<<<<< HEAD
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
=======
  // --- Form state for create ---
  const [newTeam, setNewTeam] = useState<CreateTeamDTO>({
    name: '',
    ageGroup: 'U8',
    region: 'TEXAS',
    state: 'TX',
    headCoachUserID: null,
  });
>>>>>>> events-tab

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
      addToast('Team created', 'success');

      // fire off notification
      try {
        await createAndSendTeamCreatedNotification(created);
        addToast('Announcement sent: "New Team!"', 'success');
      } catch (e) {
        console.error('Failed to send New Team notification', e);
        addToast('Team created (push failed)', 'error');
      }

      closeDialog();
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
<<<<<<< HEAD
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
=======
    <div className="flex flex-col bg-transparent relative">
      <div
        className={`flex-1 flex flex-col gap-4 sm:gap-6 ${dialogOpen ? 'sm:pr-[50px]' : ''}`}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 -mx-2 sm:mx-0 px-2 sm:px-0 py-2 sm:py-0 bg-transparent/40 backdrop-blur-sm">
          <div className="flex flex-wrap items-center gap-3 justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => navigate(-1)}
                className="p-2 text-white hover:bg-white/10 rounded"
              >
                <ArrowLeftIcon className="w-5 h-5" />
              </button>
              <div className="text-3xl lg:text-3xl font-bold text-white">
                Bomber Teams
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={openCreate}
                className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-white/15 backdrop-blur-lg border border-white/30 text-white rounded-full hover:bg-blue-500 transition"
              >
                <UserGroupIcon className="w-5 h-5" />
                <span className="hidden xs:inline">Add New Team</span>
              </button>
              <div className="inline-flex rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-2 sm:p-2.5 transition ${viewMode === 'table' ? 'bg-blue-500 text-white' : 'bg-white/10 text-white/70'}`}
                  aria-label="Table view"
                >
                  <TableCellsIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
                <button
                  onClick={() => setViewMode('card')}
                  className={`p-2 sm:p-2.5 transition ${viewMode === 'card' ? 'bg-blue-500 text-white' : 'bg-white/10 text-white/70'}`}
                  aria-label="Card view"
                >
                  <Squares2X2Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>
            </div>
>>>>>>> events-tab
          </div>
        </div>
      </div>

<<<<<<< HEAD
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
=======
        {/* Filters */}
        <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 sm:gap-4">
          <input
            type="text"
            placeholder="Search for team or coach..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-64 px-4 py-2 bg-white/10 text-white placeholder-white/70 rounded-lg"
          />
          <div className="flex gap-3 sm:gap-4 w-full sm:w-auto">
            <select
              value={ageFilter}
              onChange={(e) => setAgeFilter(e.target.value as any)}
              className="flex-1 sm:flex-none px-3 py-2 bg-white/10 text-white rounded-lg"
            >
              <option value="all">All Ages</option>
              {['U8', 'U10', 'U12', 'U14', 'U16', 'U18', 'ALUMNI'].map((a) => (
                <option key={a} value={a} className="text-black">
                  {a}
                </option>
              ))}
            </select>
            <select
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
              className="flex-1 sm:flex-none px-3 py-2 bg-white/10 text-white rounded-lg"
            >
              <option value="all">All States</option>
              {stateOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Card View */}
        {viewMode === 'card' && (
          <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {filtered.map((t) => (
              <div
                key={t.id}
                className="bg-white/5 backdrop-blur-lg rounded-2xl shadow-inner hover:shadow-md transition cursor-pointer"
                onClick={() => navigate(`/teams/${t.id}`)}
              >
                <div className="h-2 bg-gradient-to-r from-blue-500 to-blue-300" />
                <div className="p-4 sm:p-6 space-y-4 text-white">
                  <h3 className="text-lg sm:text-xl font-bold line-clamp-1">
                    {t.name}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <UserGroupIcon className="w-5 h-5 text-blue-500 shrink-0" />
                      <span className="line-clamp-1">
                        {t.headCoach?.user ? (
                          `${t.headCoach.user.fname} ${t.headCoach.user.lname}`
                        ) : (
                          <span className="italic text-white/50">N/A</span>
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapIcon className="w-5 h-5 text-blue-500 shrink-0" />
                      <span>
                        {t.state ?? (
                          <span className="italic text-white/50">N/A</span>
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CalendarDaysIcon className="w-5 h-5 text-blue-500 shrink-0" />
                      <span>{t.ageGroup}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPinIcon className="w-5 h-5 text-blue-500 shrink-0" />
                      <span>{t.region}</span>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openEdit(t);
                      }}
                      className="p-2 bg-white/15 rounded-lg hover:bg-blue-500 transition"
                    >
                      <PencilSquareIcon className="w-5 h-5 text-white" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openDelete(t);
                      }}
                      className="p-2 bg-red-600 rounded-lg hover:bg-red-500 transition"
                    >
                      <TrashIcon className="w-5 h-5 text-white" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Table View */}
        {viewMode === 'table' && (
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl overflow-hidden shadow-inner">
            {/* Horizontal scroll on small screens */}
            <div className="overflow-x-auto">
              <table className="min-w-[720px] w-full table-auto text-white">
                <thead className="sticky top-0 bg-white/10">
                  <tr>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-left">
                      Team Name
                    </th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-left">
                      Coach
                    </th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-left">
                      State
                    </th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-left">Age</th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-left">
                      Region
                    </th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-6 py-10 text-center text-white/60"
                      >
                        Loading…
                      </td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-6 py-10 text-center text-white/60"
                      >
                        No teams found.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((t) => (
                      <tr
                        key={t.id}
                        className="hover:bg-white/10 cursor-pointer"
                        onClick={() => navigate(`/teams/${t.id}`)}
                      >
                        <td className="px-4 sm:px-6 py-3 align-middle">
                          {t.name}
                        </td>
                        <td className="px-4 sm:px-6 py-3 align-middle">
                          {t.headCoach?.user ? (
                            `${t.headCoach.user.fname} ${t.headCoach.user.lname}`
                          ) : (
                            <span className="italic text-white/50">N/A</span>
                          )}
                        </td>
                        <td className="px-4 sm:px-6 py-3 align-middle">
                          {t.state ?? (
                            <span className="italic text-white/50">N/A</span>
                          )}
                        </td>
                        <td className="px-4 sm:px-6 py-3 align-middle">
                          {t.ageGroup}
                        </td>
                        <td className="px-4 sm:px-6 py-3 align-middle">
                          {t.region}
                        </td>
                        <td className="px-4 sm:px-6 py-3 text-right align-middle">
                          <div className="inline-flex gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openEdit(t);
                              }}
                              className="p-2 bg-white/15 rounded-lg hover:bg-blue-500 transition"
                            >
                              <PencilSquareIcon className="w-5 h-5 text-white" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openDelete(t);
                              }}
                              className="p-2 bg-red-600 rounded-lg hover:bg-red-500 transition"
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
>>>>>>> events-tab
          </div>
        )}
      </div>

<<<<<<< HEAD
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
=======
      {/* SideDialog (unchanged logic/colors) */}
>>>>>>> events-tab
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
<<<<<<< HEAD
            <Label>Team Name</Label>
            <Input
=======
            <label className="block text-sm text-white font-semibold">
              Team Name
            </label>
            <input
              type="text"
>>>>>>> events-tab
              value={newTeam.name}
              onChange={(e) =>
                setNewTeam((t) => ({ ...t, name: e.target.value }))
              }
            />

<<<<<<< HEAD
            <Label>Age Group</Label>
            <Select
=======
            <label className="block text-sm text-white font-semibold">
              Age Group
            </label>
            <select
>>>>>>> events-tab
              value={newTeam.ageGroup}
              onChange={(e) =>
                setNewTeam((t) => ({ ...t, ageGroup: e.target.value as any }))
              }
              options={AGE_OPTIONS.map((a) => ({ value: a, label: a }))}
            />

<<<<<<< HEAD
            <Label>Region</Label>
            <Select
=======
            <label className="block text-sm text-white font-semibold">
              Region
            </label>
            <select
>>>>>>> events-tab
              value={newTeam.region}
              onChange={(e) =>
                setNewTeam((t) => ({ ...t, region: e.target.value as Regions }))
              }
<<<<<<< HEAD
              options={REGION_OPTIONS}
            />

            <Label>State</Label>
            <Select
=======
              className="w-full px-4 py-2 bg-white/10 text-white rounded-lg"
            >
              {[
                'ACADEMY',
                'PACIFIC',
                'MOUNTAIN',
                'MIDWEST',
                'NORTHEAST',
                'SOUTHEAST',
                'TEXAS',
              ].map((r) => (
                <option key={r} value={r} className="text-black">
                  {r}
                </option>
              ))}
            </select>

            <label className="block text-sm text-white font-semibold">
              State
            </label>
            <select
>>>>>>> events-tab
              value={newTeam.state}
              onChange={(e) =>
                setNewTeam((t) => ({
                  ...t,
                  state: e.target.value as CreateTeamDTO['state'],
                }))
              }
              options={US_STATES}
            />

<<<<<<< HEAD
            <Label>Head Coach</Label>
            <Input
              placeholder="Search coach…"
=======
            <label className="block text-sm text-white font-semibold">
              Head Coach
            </label>
            <input
              type="text"
              placeholder="Search coach..."
>>>>>>> events-tab
              value={coachSearch}
              onChange={(e) => {
                setCoachSearch(e.target.value);
                setNewTeam((t) => ({ ...t, headCoachUserID: null }));
              }}
            />
<<<<<<< HEAD
            <CoachPicker
              options={coachOptions}
              selectedId={newTeam.headCoachUserID ?? null}
              onSelect={(id) =>
                setNewTeam((t) => ({ ...t, headCoachUserID: id }))
              }
            />

            <FormActions onSave={handleConfirmCreate} onCancel={closeDialog} />
=======
            <ul className="max-h-32 overflow-auto bg-black/20 rounded-lg divide-y divide-white/10">
              <li
                className={`px-3 py-1 text-white cursor-pointer ${newTeam.headCoachUserID === null ? 'bg-blue-500' : ''}`}
                onClick={() =>
                  setNewTeam((t) => ({ ...t, headCoachUserID: null }))
                }
              >
                — none —
              </li>
              {coachOptions.map((c) => (
                <li
                  key={c.id}
                  className={`px-3 py-1 text-white cursor-pointer ${newTeam.headCoachUserID === c.id ? 'bg-blue-500' : ''}`}
                  onClick={() =>
                    setNewTeam((t) => ({ ...t, headCoachUserID: c.id }))
                  }
                >
                  {c.fname} {c.lname}
                </li>
              ))}
            </ul>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-4">
              <button
                onClick={handleConfirmCreate}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg"
              >
                Save
              </button>
              <button
                onClick={closeDialog}
                className="flex-1 px-4 py-2 bg-white/20 text-white rounded-lg"
              >
                Cancel
              </button>
            </div>
>>>>>>> events-tab
          </div>
        )}

        {/* EDIT */}
        {dialogType === 'edit' && selectedTeam && (
          <div className="space-y-3 sm:space-y-4">
<<<<<<< HEAD
            <Label>Team Name</Label>
            <Input
=======
            <label className="block text-sm text-white font-semibold">
              Team Name
            </label>
            <input
              type="text"
>>>>>>> events-tab
              value={selectedTeam.name}
              onChange={(e) =>
                setSelectedTeam((t) => t && { ...t, name: e.target.value })
              }
            />

<<<<<<< HEAD
            <Label>Age Group</Label>
            <Select
=======
            <label className="block text-sm text-white font-semibold">
              Age Group
            </label>
            <select
>>>>>>> events-tab
              value={selectedTeam.ageGroup}
              onChange={(e) =>
                setSelectedTeam(
                  (t) => t && { ...t, ageGroup: e.target.value as any }
                )
              }
              options={AGE_OPTIONS.map((a) => ({ value: a, label: a }))}
            />

<<<<<<< HEAD
            <Label>Region</Label>
            <Select
=======
            <label className="block text-sm text-white font-semibold">
              Region
            </label>
            <select
>>>>>>> events-tab
              value={selectedTeam.region}
              onChange={(e) =>
                setSelectedTeam((t) =>
                  t ? { ...t, region: e.target.value as Regions } : t
                )
              }
              options={REGION_OPTIONS}
            />

<<<<<<< HEAD
            <Label>State</Label>
            <Select
=======
            <label className="block text-sm text-white font-semibold">
              State
            </label>
            <select
>>>>>>> events-tab
              value={selectedTeam.state}
              onChange={(e) =>
                setSelectedTeam((t) =>
                  t ? { ...t, state: e.target.value as TeamFE['state'] } : t
                )
              }
              options={US_STATES}
            />

<<<<<<< HEAD
            <Label>Head Coach</Label>
            <Input
              placeholder="Search coach…"
=======
            <label className="block text-sm text-white font-semibold">
              Head Coach
            </label>
            <input
              type="text"
              placeholder="Search coach..."
>>>>>>> events-tab
              value={coachSearch}
              onChange={(e) => {
                setCoachSearch(e.target.value);
                setPendingHeadCoachId(null);
              }}
            />
<<<<<<< HEAD
            <CoachPicker
              options={coachOptions}
              selectedId={pendingHeadCoachId}
              onSelect={setPendingHeadCoachId}
            />

            <FormActions onSave={handleSaveEdit} onCancel={closeDialog} />
=======
            <ul className="max-h-32 overflow-auto bg-black/20 rounded-lg divide-y divide-white/10">
              <li
                className={`px-3 py-1 text-white cursor-pointer ${selectedTeam.headCoachID === null ? 'bg-blue-500' : ''}`}
                onClick={() =>
                  setSelectedTeam((t) => t && { ...t, headCoachUserID: null })
                }
              >
                — none —
              </li>
              {coachOptions.map((c) => (
                <li
                  key={c.id}
                  className={`px-3 py-1 text-white cursor-pointer ${selectedTeam.headCoachID === c.id ? 'bg-blue-500' : ''}`}
                  onClick={() =>
                    setSelectedTeam((t) => t && { ...t, headCoachUserID: c.id })
                  }
                >
                  {c.fname} {c.lname}
                </li>
              ))}
            </ul>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-4">
              <button
                onClick={handleSaveEdit}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg"
              >
                Save
              </button>
              <button
                onClick={closeDialog}
                className="flex-1 px-4 py-2 bg-white/20 text-white rounded-lg"
              >
                Cancel
              </button>
            </div>
>>>>>>> events-tab
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
