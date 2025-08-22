import { useState, useEffect, useMemo, MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  TableCellsIcon,
  Squares2X2Icon,
  PencilSquareIcon,
  TrashIcon,
  UserGroupIcon,
  MapIcon,
  CalendarDaysIcon,
  MapPinIcon,
  ArrowsUpDownIcon,
} from '@heroicons/react/24/outline';
import SideDialog from '@/components/SideDialog';
import { fetchTeams, createTeam, updateTeam, deleteTeam } from '@/api/team';
import { fetchUsers } from '@/api/user';
import type { TeamFE } from '@bomber-app/database/types/team';
import { US_STATES } from '@/utils/state';
import type { CreateTeamDTO, UpdateTeamDTO } from '@/api/team';
import { PublicUserFE, Regions } from '@bomber-app/database';
import { ClipboardIcon } from '@heroicons/react/24/outline';
import { useToast } from '@/context/ToastProvider';
import { ColumnDef, exportCSV, exportXLS } from '@/utils/exporter';

// If you prefer labels for Regions in selects
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

// Sorting types
type SortKey = 'name' | 'coach' | 'state' | 'ageGroup' | 'region';
type SortDir = 'asc' | 'desc';
type SortRule = { key: SortKey; dir: SortDir };

export default function Teams() {
  const navigate = useNavigate();

  // --- Data & loading ---
  const [teams, setTeams] = useState<TeamFE[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchTeams()
      .then(setTeams)
      .finally(() => setLoading(false));
  }, []);

  // --- View mode ---
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
  const { addToast } = useToast();

  // --- Column Filters (independent, combine-able) ---
  const [nameFilter, setNameFilter] = useState(''); // Team Name text filter
  const [coachFilter, setCoachFilter] = useState(''); // Coach text filter
  const [stateFilter, setStateFilter] = useState<'all' | string>('all');
  const [ageFilter, setAgeFilter] = useState<'all' | TeamFE['ageGroup']>('all');
  const [regionFilter, setRegionFilter] = useState<'all' | Regions>('all');

  // --- Head coach users for dropdown (create/edit forms) ---
  const [allUsers, setAllUsers] = useState<PublicUserFE[]>([]);
  const [coachSearch, setCoachSearch] = useState('');
  const [pendingHeadCoachId, setPendingHeadCoachId] = useState<string | null>(
    null
  );

  useEffect(() => {
    fetchUsers().then(setAllUsers);
  }, []);

  const coachOptions = allUsers.filter((u) =>
    `${u.fname} ${u.lname}`.toLowerCase().includes(coachSearch.toLowerCase())
  );

  // --- Dialog state ---
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<
    'create' | 'edit' | 'delete' | null
  >(null);
  const [selectedTeam, setSelectedTeam] = useState<TeamFE | null>(null);

  // --- Form state for create ---
  const [newTeam, setNewTeam] = useState<CreateTeamDTO>({
    name: '',
    ageGroup: 'U8',
    region: 'TEXAS',
    state: 'TX',
    headCoachUserID: null,
  });

  // --- MULTI-COLUMN SORTING ---
  const [sortRules, setSortRules] = useState<SortRule[]>([
    { key: 'region', dir: 'asc' },
    { key: 'state', dir: 'asc' },
    { key: 'ageGroup', dir: 'desc' },
    { key: 'name', dir: 'asc' },
  ]);
  const AGE_ORDER = useMemo(
    () =>
      AGE_OPTIONS.reduce<Record<string, number>>((acc, val, idx) => {
        acc[val] = idx;
        return acc;
      }, {}),
    []
  );

  function cycleDir(current?: SortDir): SortDir | null {
    // asc -> desc -> null (remove)
    if (!current) return 'asc';
    if (current === 'asc') return 'desc';
    return null;
  }

  function toggleSort(key: SortKey) {
    setSortRules((prev) => {
      const idx = prev.findIndex((r) => r.key === key);
      if (idx === -1) {
        // Not present → add to the end as ASC
        return [...prev, { key, dir: 'asc' as const }];
      }
      // Present → cycle asc -> desc -> remove
      const current = prev[idx];
      const nextDir = current.dir === 'asc' ? 'desc' : null;

      if (!nextDir) {
        // remove this key, keep others
        const copy = [...prev];
        copy.splice(idx, 1);
        return copy;
      }

      // update direction in place, keep others
      const copy = [...prev];
      copy[idx] = { key, dir: nextDir };
      return copy;
    });
  }

  // helper to extract comparable strings/numbers per key
  function getSortable(a: TeamFE, key: SortKey): string | number {
    if (key === 'name') return a.name ?? '';
    if (key === 'coach') {
      return a.headCoach?.user
        ? `${a.headCoach.user.fname} ${a.headCoach.user.lname}`
        : '';
    }
    if (key === 'state') return a.state ?? '';
    if (key === 'ageGroup') {
      // order by AGE_ORDER, fallback to end
      const idx =
        AGE_ORDER[(a.ageGroup as string) || ''] ?? Number.MAX_SAFE_INTEGER;
      return idx;
    }
    // region
    return a.region ?? '';
  }

  // --- Open/close helpers ---
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

  // --- Options for dropdowns (derived) ---
  const stateOptions = useMemo(
    () =>
      Array.from(
        new Set(teams.map((t) => t.state).filter(Boolean) as string[])
      ).sort(),
    [teams]
  );

  // --- Combine ALL filters + apply multi-sort ---
  const filtered = useMemo(() => {
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

    if (sortRules.length > 0) {
      result = [...result].sort((a, b) => {
        for (const { key, dir } of sortRules) {
          const A = getSortable(a, key);
          const B = getSortable(b, key);

          let cmp = 0;
          if (typeof A === 'number' && typeof B === 'number') {
            cmp = A - B;
          } else {
            cmp = String(A).localeCompare(String(B));
          }

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

  // --- CRUD handlers ---
  async function handleConfirmCreate() {
    const created = await createTeam(newTeam);
    if (created) {
      setTeams((prev) => [created, ...prev]);
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
    }
  }

  async function handleConfirmDelete() {
    if (!selectedTeam) return;
    const ok = await deleteTeam(selectedTeam.id);
    if (ok) {
      setTeams((prev) => prev.filter((t) => t.id !== selectedTeam.id));
      closeDialog();
    }
  }

  // --- Helpers for header UI ---
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
    e.stopPropagation(); // prevent row click (navigation)
    if (!code) return;
    navigator.clipboard.writeText(code).then(() => {
      // optional: toast or alert
      console.log(`Copied: ${code}`);
      addToast('Code Copied.', 'success');
    });
  }

  // ------------- Exporter -------------------
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

  // ------------------- UI -------------------
  return (
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
              <button
                onClick={() => {
                  exportCSV(filtered, teamColumns, {
                    filenameBase: 'teams-filtered',
                  });
                  addToast('Exported CSV', 'success');
                }}
                className="inline-flex items-center gap-2 px-3 sm:px-4 py-[6px] rounded-full
             bg-white/10 hover:bg-white/20 border border-white/20 text-white transition"
                title="Export filtered rows to CSV"
              >
                CSV
              </button>

              <button
                onClick={() => {
                  exportXLS(filtered, teamColumns, {
                    filenameBase: 'teams-filtered',
                  });
                  addToast('Exported Excel', 'success');
                }}
                className="inline-flex items-center gap-2 px-3 sm:px-4 py-[6px] rounded-full
             bg-white/10 hover:bg-white/20 border border-white/20 text-white transition"
                title="Export filtered rows to Excel"
              >
                Excel
              </button>
              <div className="inline-flex rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-2 sm:p-2.5 transition ${
                    viewMode === 'table'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white/10 text-white/70'
                  }`}
                  aria-label="Table view"
                >
                  <TableCellsIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
                <button
                  onClick={() => setViewMode('card')}
                  className={`p-2 sm:p-2.5 transition ${
                    viewMode === 'card'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white/10 text-white/70'
                  }`}
                  aria-label="Card view"
                >
                  <Squares2X2Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>
            </div>
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

        {/* Table View with MULTI column filters + multi-sort */}
        {viewMode === 'table' && (
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl overflow-hidden shadow-inner">
            <div className="overflow-x-auto">
              <table className="min-w-[860px] w-full table-auto text-white">
                <thead className="sticky top-0 bg-white/10">
                  {/* Header labels + sort */}
                  <tr>
                    <th className="px-4 sm:px-6 py-2 text-left">
                      Team Name <SortButton col="name" />
                    </th>
                    <th className="px-4 sm:px-6 py-2 text-left">Team Code</th>
                    <th className="px-4 sm:px-6 py-2 text-left">
                      Coach <SortButton col="coach" />
                    </th>
                    <th className="px-4 sm:px-6 py-2 text-left">
                      State <SortButton col="state" />
                    </th>
                    <th className="px-4 sm:px-6 py-2 text-left">
                      Age <SortButton col="ageGroup" />
                    </th>
                    <th className="px-4 sm:px-6 py-2 text-left">
                      Region <SortButton col="region" />
                    </th>
                    <th className="px-4 sm:px-6 py-2 text-right">Actions</th>
                  </tr>
                  {/* Filter controls (second header row) */}
                  <tr className="bg-white/5">
                    <th className="px-4 sm:px-6 py-2">
                      <input
                        value={nameFilter}
                        onChange={(e) => setNameFilter(e.target.value)}
                        placeholder="Filter team name…"
                        className="w-full px-3 py-1.5 rounded bg-white/10 placeholder-white/60"
                      />
                    </th>
                    <th>{''}</th>
                    <th className="px-4 sm:px-6 py-2">
                      <input
                        value={coachFilter}
                        onChange={(e) => setCoachFilter(e.target.value)}
                        placeholder="Filter coach…"
                        className="w-full px-3 py-1.5 rounded bg-white/10 placeholder-white/60"
                      />
                    </th>
                    <th className="px-4 sm:px-6 py-2">
                      <select
                        value={stateFilter}
                        onChange={(e) => setStateFilter(e.target.value)}
                        className="w-full px-3 py-1.5 rounded bg-white/10"
                      >
                        <option value="all" className="text-black">
                          All
                        </option>
                        {stateOptions.map((s) => (
                          <option key={s} value={s} className="text-black">
                            {s}
                          </option>
                        ))}
                      </select>
                    </th>
                    <th className="px-4 sm:px-6 py-2">
                      <select
                        value={ageFilter}
                        onChange={(e) => setAgeFilter(e.target.value as any)}
                        className="w-full px-3 py-1.5 rounded bg-white/10"
                      >
                        <option value="all" className="text-black">
                          All
                        </option>
                        {AGE_OPTIONS.map((a) => (
                          <option key={a} value={a} className="text-black">
                            {a}
                          </option>
                        ))}
                      </select>
                    </th>
                    <th className="px-4 sm:px-6 py-2">
                      <select
                        value={regionFilter}
                        onChange={(e) =>
                          setRegionFilter(e.target.value as Regions | 'all')
                        }
                        className="w-full px-3 py-1.5 rounded bg-white/10"
                      >
                        <option value="all" className="text-black">
                          All
                        </option>
                        {REGION_OPTIONS.map((r) => (
                          <option
                            key={r.value}
                            value={r.value}
                            className="text-black"
                          >
                            {r.label}
                          </option>
                        ))}
                      </select>
                    </th>
                    <th className="px-4 sm:px-6 py-2 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {sortRules.length > 0 && (
                          <span className="text-xs text-white/70">
                            Sorted by{' '}
                            {sortRules
                              .map((r, i) => `${i + 1}. ${r.key} ${r.dir}`)
                              .join(' → ')}
                          </span>
                        )}
                        <button
                          onClick={() => {
                            setNameFilter('');
                            setCoachFilter('');
                            setStateFilter('all');
                            setAgeFilter('all');
                            setRegionFilter('all');
                            setSortRules([]);
                          }}
                          className="px-3 py-1.5 rounded bg-white/10 hover:bg-white/20"
                          title="Clear all filters & sorts"
                        >
                          Clear
                        </button>
                      </div>
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
                          {t.teamCode ? (
                            <button
                              onClick={(e) => copyToClipboard(e, t.teamCode)}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded bg-white/10 hover:bg-blue-500/70 transition text-xs"
                              title="Click to copy team code"
                            >
                              <span>{t.teamCode}</span>
                              <ClipboardIcon className="w-4 h-4" />
                            </button>
                          ) : (
                            <span className="italic text-white/50">N/A</span>
                          )}
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
          </div>
        )}
      </div>

      {/* SideDialog */}
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
            <label className="block text-sm text-white font-semibold">
              Team Name
            </label>
            <input
              type="text"
              value={newTeam.name}
              onChange={(e) =>
                setNewTeam((t) => ({ ...t, name: e.target.value }))
              }
              className="w-full px-4 py-2 bg-white/10 text-white rounded-lg"
            />

            <label className="block text-sm text-white font-semibold">
              Age Group
            </label>
            <select
              value={newTeam.ageGroup}
              onChange={(e) =>
                setNewTeam((t) => ({ ...t, ageGroup: e.target.value as any }))
              }
              className="w-full px-4 py-2 bg-white/10 text-white rounded-lg"
            >
              {AGE_OPTIONS.map((a) => (
                <option key={a} value={a} className="text-black">
                  {a}
                </option>
              ))}
            </select>

            <label className="block text-sm text-white font-semibold">
              Region
            </label>
            <select
              value={newTeam.region}
              onChange={(e) =>
                setNewTeam((t) => ({ ...t, region: e.target.value as Regions }))
              }
              className="w-full px-4 py-2 bg-white/10 text-white rounded-lg"
            >
              {REGION_OPTIONS.map((r) => (
                <option key={r.value} value={r.value} className="text-black">
                  {r.label}
                </option>
              ))}
            </select>

            <label className="block text-sm text-white font-semibold">
              State
            </label>
            <select
              value={newTeam.state}
              onChange={(e) =>
                setNewTeam((t) => ({
                  ...t,
                  state: e.target.value as CreateTeamDTO['state'],
                }))
              }
              className="w-full px-4 py-2 bg-white/10 text-white rounded-lg"
            >
              {US_STATES.map(({ value, label }) => (
                <option key={value} value={value} className="text-black">
                  {label}
                </option>
              ))}
            </select>

            <label className="block text-sm text-white font-semibold">
              Head Coach
            </label>
            <input
              type="text"
              placeholder="Search coach..."
              value={coachSearch}
              onChange={(e) => {
                setCoachSearch(e.target.value);
                setNewTeam((t) => ({ ...t, headCoachUserID: null }));
              }}
              className="w-full px-4 py-2 bg-white/10 text-white rounded-lg"
            />
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
          </div>
        )}

        {/* EDIT */}
        {dialogType === 'edit' && selectedTeam && (
          <div className="space-y-3 sm:space-y-4">
            <label className="block text-sm text-white font-semibold">
              Team Name
            </label>
            <input
              type="text"
              value={selectedTeam.name}
              onChange={(e) =>
                setSelectedTeam((t) => t && { ...t, name: e.target.value })
              }
              className="w-full px-4 py-2 bg-white/10 text-white rounded-lg"
            />

            <label className="block text-sm text-white font-semibold">
              Age Group
            </label>
            <select
              value={selectedTeam.ageGroup}
              onChange={(e) =>
                setSelectedTeam(
                  (t) => t && { ...t, ageGroup: e.target.value as any }
                )
              }
              className="w-full px-4 py-2 bg-white/10 text-white rounded-lg"
            >
              {AGE_OPTIONS.map((a) => (
                <option key={a} value={a} className="text-black">
                  {a}
                </option>
              ))}
            </select>

            <label className="block text-sm text-white font-semibold">
              Region
            </label>
            <select
              value={selectedTeam.region}
              onChange={(e) =>
                setSelectedTeam((t) =>
                  t ? { ...t, region: e.target.value as Regions } : t
                )
              }
              className="w-full px-4 py-2 bg-white/10 text-white rounded-lg"
            >
              {REGION_OPTIONS.map((r) => (
                <option key={r.value} value={r.value} className="text-black">
                  {r.label}
                </option>
              ))}
            </select>

            <label className="block text-sm text-white font-semibold">
              State
            </label>
            <select
              value={selectedTeam.state}
              onChange={(e) =>
                setSelectedTeam((t) =>
                  t ? { ...t, state: e.target.value as TeamFE['state'] } : t
                )
              }
              className="w-full px-4 py-2 bg-white/10 text-white rounded-lg"
            >
              {US_STATES.map(({ value, label }) => (
                <option key={value} value={value} className="text-black">
                  {label}
                </option>
              ))}
            </select>

            <label className="block text-sm text-white font-semibold">
              Head Coach
            </label>
            <input
              type="text"
              placeholder="Search coach..."
              value={coachSearch}
              onChange={(e) => {
                setCoachSearch(e.target.value);
                setPendingHeadCoachId(null);
              }}
              className="w-full px-4 py-2 bg-white/10 text-white rounded-lg"
            />

            <ul className="max-h-32 overflow-auto bg-black/20 rounded-lg divide-y divide-white/10">
              <li
                className={`px-3 py-1 text-white cursor-pointer ${pendingHeadCoachId === null ? 'bg-blue-500' : ''}`}
                onClick={() => setPendingHeadCoachId(null)}
              >
                — none —
              </li>
              {coachOptions.map((c) => (
                <li
                  key={c.id}
                  className={`px-3 py-1 text-white cursor-pointer ${pendingHeadCoachId === c.id ? 'bg-blue-500' : ''}`}
                  onClick={() => setPendingHeadCoachId(c.id)}
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
          </div>
        )}

        {/* DELETE */}
        {dialogType === 'delete' && selectedTeam && (
          <div>
            <p className="text-white">
              Are you sure you want to remove the Team{' '}
              <b className="uppercase text-red-800">{selectedTeam.name}</b>?
            </p>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-6">
              <button
                onClick={closeDialog}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg"
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
