// apps/web/src/pages/Players.tsx
import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeftIcon,
  PencilSquareIcon,
  TrashIcon,
  EyeIcon,
  ArrowsUpDownIcon,
  ArrowDownTrayIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';
import type {
  PlayerFE,
  // NEW
  PublicUserFE,
} from '@bomber-app/database';
import { useNavigate } from 'react-router-dom';
import SideDialog from '@/components/SideDialog';
import {
  fetchPlayers,
  updatePlayer,
  UpdatePlayerPayload,
  detachParentFromPlayer,
  attachParentToPlayer,
  removePlayerFromTeam,
  fetchPlayerById,
  AttachParentPayload,
} from '@/api/player';
import { POSITIONS, SHORTS_SIZES } from '@/utils/enum';
import EditPlayerModal from '@/components/forms/Modals/edit-player';
import { useToast } from '@/context/ToastProvider';
import { ColumnDef, exportCSV, exportXLS } from '@/utils/exporter';

// NEW: bring in a users fetcher (rename if your module differs)
import { fetchUsers } from '@/api/user';
import {
  AgeGroup,
  JerseySize,
  PantsSize,
  Position,
  StirrupSize,
} from '@bomber-app/database/generated/client';

// ---- Sorting types (same pattern as Teams) ----
type SortKey =
  | 'name'
  | 'team'
  | 'ageGroup'
  | 'pos1'
  | 'pos2'
  | 'college'
  | 'gradYear'
  | 'state'
  | 'jerseyNum';
type SortDir = 'asc' | 'desc';
type SortRule = { key: SortKey; dir: SortDir };

type Player = {
  id: string;
  name: string;
  email: string;
  team: string;
  pos1: Position;
  pos2: Position;
  ageGroup: AgeGroup;
  jerseyNum: string;
  gradYear: string;
  jerseySize: JerseySize;
  pantSize: PantsSize;
  stirrupSize: StirrupSize;
  shortSize: (typeof SHORTS_SIZES)[number];
  practiceShortSize: (typeof SHORTS_SIZES)[number];
  commitId?: string;
  college?: string;
  isTrusted: boolean;
  addressID?: string;
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  zip?: string;
};

// ---------- Parent preview type + cache ----------
type ParentPreview = {
  id: string | number;
  name: string;
  email?: string | null;
  phone?: string | null;
  address?: string;
};

const PAGE_SIZE = 15;

// For age sorting (U18 -> U8)
const AGE_ORDER_ARRAY = [
  'U8',
  'U10',
  'U12',
  'U14',
  'U16',
  'U18',
  'ALUMNI',
] as const;
const AGE_ORDER: Record<string, number> = AGE_ORDER_ARRAY.reduce(
  (acc, v, i) => {
    acc[v] = i;
    return acc;
  },
  {} as Record<string, number>
);

export default function Players() {
  const navigate = useNavigate();
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  // ---------- NEW: public users for dropdown ----------
  const [users, setUsers] = useState<PublicUserFE[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setUsersLoading(true);
        const list = await fetchUsers();
        if (!mounted) return;
        setUsers(Array.isArray(list) ? list : []);
      } catch (e: any) {
        if (!mounted) return;
        setUsersError(e?.message || 'Failed to load users');
        setUsers([]);
      } finally {
        if (!mounted) return;
        setUsersLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Eligible parents = users with a parent relation (and with an email we can send to backend)
  const parentUserOptions = useMemo(() => {
    return (users || [])
      .filter((u) => !!u.parent)
      .map((u) => ({
        value: u.parent?.id?.toString() ?? u.id.toString(), // prefer Parent.id
        label: `${u.fname ?? ''} ${u.lname ?? ''}`.trim() || 'Unnamed',
        email: u.email ?? '',
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [users]);
  // filters / paging
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [teamFilter, setTeamFilter] = useState('all');
  const [ageGroupFilter, setAgeGroupFilter] = useState('all');
  const [posFilter, setPosFilter] = useState('all');
  const [trustedFilter, setTrustedFilter] = useState<'all' | 'yes' | 'no'>(
    'all'
  );
  const [geradYearFilter, setGradYearFilter] = useState<'all' | string>('all');
  const [stateFilter, setStateFilter] = useState<'all' | string>('all');
  const [collegeFilter, setCollegeFilter] = useState<'all' | 'yes' | 'no'>(
    'all'
  );
  const [jerseySizeFilter, setJerseySizeFilter] = useState('all');
  const [pantSizeFilter, setPantSizeFilter] = useState('all');

  // dialogs
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'edit' | 'delete' | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  // external edit modal state
  const [editPlayerFE, setEditPlayerFE] = useState<PlayerFE | null>(null);
  const [editLoading, setEditLoading] = useState(false);

  // ----- Multi-sort: default similar to Teams -----
  const [sortRules, setSortRules] = useState<SortRule[]>([
    { key: 'team', dir: 'asc' },
    { key: 'ageGroup', dir: 'desc' }, // shows U18 -> U8
    { key: 'name', dir: 'asc' },
  ]);

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

  // ----- Data load -----
  useEffect(() => {
    setLoading(true);
    fetchPlayers()
      .then((data: any[]) => {
        setPlayers(
          data.map((p: any) => ({
            id: p.id,
            name: p.name,
            email: p.email,
            team: p.team,
            pos1: p.pos1,
            pos2: p.pos2,
            ageGroup: p.ageGroup,
            jerseyNum: p.jerseyNum?.toString?.() ?? '',
            gradYear: p.gradYear?.toString?.() ?? '',
            jerseySize: p.jerseySize,
            pantSize: p.pantSize,
            stirrupSize: p.stirrupSize,
            shortSize: p.shortSize,
            practiceShortSize: p.practiceShortSize,
            commitId: p.commitId,
            college: p.college,
            isTrusted: !!p.isTrusted,
            addressID: p.addressID,
            address1: p.address1,
            address2: p.address2,
            city: p.city,
            state: p.state,
            zip: p.zip,
          }))
        );
      })
      .catch(() => setPlayers([]))
      .finally(() => setLoading(false));
  }, []);

  // ----- Filter options -----
  const teams = useMemo(
    () => Array.from(new Set(players.map((p) => p.team).filter(Boolean))),
    [players]
  );
  const ageGroups = useMemo(
    () => Array.from(new Set(players.map((p) => p.ageGroup).filter(Boolean))),
    [players]
  );
  const gradYears = useMemo(
    () => Array.from(new Set(players.map((p) => p.gradYear))).sort(),
    [players]
  );
  const states = useMemo(
    () =>
      Array.from(new Set(players.map((p) => p.state).filter(Boolean))).sort(),
    [players]
  );

  // ----- Filtering + Sorting -----
  const filteredSorted = useMemo(() => {
    const result = players.filter((p) => {
      if (teamFilter !== 'all' && p.team !== teamFilter) return false;
      if (ageGroupFilter !== 'all' && p.ageGroup !== ageGroupFilter)
        return false;
      if (posFilter !== 'all' && p.pos1 !== posFilter) return false;
      if (trustedFilter === 'yes' && !p.isTrusted) return false;
      if (trustedFilter === 'no' && p.isTrusted) return false;
      if (collegeFilter === 'yes' && !p.college) return false;
      if (collegeFilter === 'no' && p.college) return false;
      if (stateFilter !== 'all' && p.state !== stateFilter) return false;
      if (geradYearFilter !== 'all' && p.gradYear !== geradYearFilter)
        return false;
      if (jerseySizeFilter !== 'all' && p.jerseySize !== jerseySizeFilter)
        return false;
      if (pantSizeFilter !== 'all' && p.pantSize !== pantSizeFilter)
        return false;
      if (search) {
        const q = search.toLowerCase();
        if (
          !(
            p.name.toLowerCase().includes(q) || p.team.toLowerCase().includes(q)
          )
        )
          return false;
      }
      return true;
    });

    if (sortRules.length === 0) return result;

    return [...result].sort((a, b) => {
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
  }, [
    players,
    teamFilter,
    ageGroupFilter,
    posFilter,
    jerseySizeFilter,
    pantSizeFilter,
    trustedFilter,
    search,
    collegeFilter,
    stateFilter,
    geradYearFilter,
    sortRules,
  ]);

  // helper to normalize values for sort
  function getSortable(p: Player, key: SortKey): string | number {
    switch (key) {
      case 'name':
        return p.name || '';
      case 'team':
        return p.team || '';
      case 'ageGroup': {
        const idx = AGE_ORDER[p.ageGroup] ?? Number.MAX_SAFE_INTEGER;
        return idx;
      }
      case 'pos1':
        return p.pos1 || '';
      case 'pos2':
        return p.pos2 || '';
      case 'college':
        return p.college || '';
      case 'gradYear':
        return Number(p.gradYear) || 0;
      case 'state':
        return p.state || '';
      case 'jerseyNum':
        return Number(p.jerseyNum) || 0;
      default:
        return '';
    }
  }

  // reset page on filter changes
  useEffect(() => {
    setPage(1);
  }, [
    search,
    teamFilter,
    ageGroupFilter,
    posFilter,
    trustedFilter,
    jerseySizeFilter,
    pantSizeFilter,
    collegeFilter,
    stateFilter,
    geradYearFilter,
  ]);

  const totalPages = Math.max(1, Math.ceil(filteredSorted.length / PAGE_SIZE));
  const paginated = filteredSorted.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  // ----- Edit / Delete -----
  const mapFEToRow = (p: PlayerFE): Player => ({
    id: p.id as unknown as string,
    name: p.user ? `${p.user.fname} ${p.user.lname}` : '(No Name)',
    email: p.user?.email || '',
    team: p.team?.name || '',
    pos1: p.pos1 as Position,
    pos2: p.pos2 as Position,
    ageGroup: p.ageGroup as AgeGroup,
    jerseyNum: String(p.jerseyNum),
    gradYear: String(p.gradYear),
    jerseySize: p.jerseySize as JerseySize,
    pantSize: p.pantSize as PantsSize,
    stirrupSize: p.stirrupSize as StirrupSize,
    shortSize: p.shortSize as any,
    practiceShortSize: p.practiceShortSize as any,
    college: p.college || '',
    isTrusted: !!p.isTrusted,
    addressID: p.address?.id as any,
    address1: p.address?.address1 || '',
    address2: p.address?.address2 || '',
    city: p.address?.city || '',
    state: p.address?.state || '',
    zip: p.address?.zip || '',
  });

  const openEdit = async (p: Player) => {
    setDialogType('edit');
    setSelectedPlayer(p);
    setEditPlayerFE(null);
    setEditLoading(true);
    setDialogOpen(true);

    try {
      const full = await fetchPlayerById(p.id);
      setEditPlayerFE(full);
    } catch (err) {
      console.error('Failed to fetch player', err);
      setEditPlayerFE(null);
    } finally {
      setEditLoading(false);
    }
  };

  const openDelete = (p: Player) => {
    setDialogType('delete');
    setSelectedPlayer(p);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setDialogType(null);
    setSelectedPlayer(null);
    setEditPlayerFE(null);
    setEditLoading(false);
  };

  // ----- Export (CSV / XLSX) from the filtered list -----
  const exportRows = filteredSorted.map((p) => ({
    Name: p.name,
    Email: p.email,
    Team: p.team,
    'Age Group': p.ageGroup,
    Positions: `${p.pos1} / ${p.pos2}`,
    College: p.college ?? '',
    'Jersey #': p.jerseyNum,
    'Grad Year': p.gradYear,
    State: p.state ?? '',
    'Jersey Size': p.jerseySize,
    'Pant Size': p.pantSize,
    'Stirrup Size': p.stirrupSize,
    'Shorts Size':
      typeof p.shortSize === 'object' && p.shortSize !== null
        ? ((p.shortSize as any).label ?? (p.shortSize as any).value)
        : (p.shortSize as string),
    'Practice Shorts':
      typeof p.practiceShortSize === 'object' && p.practiceShortSize !== null
        ? ((p.practiceShortSize as any).label ??
          (p.practiceShortSize as any).value)
        : (p.practiceShortSize as string),
    Trusted: p.isTrusted ? 'YES' : 'NO',
    Address: [p.address1, p.city, p.state, p.zip].filter(Boolean).join(', '),
  }));

  // --- exports
  const [exportOpen, setExportOpen] = useState(false);

  const columns: ColumnDef<Player>[] = [
    { header: 'Name', accessor: (p) => p.name },
    { header: 'Email', accessor: (p) => p.email },
    { header: 'Team', accessor: (p) => p.team },
    { header: 'Age Group', accessor: (p) => p.ageGroup },
    { header: 'Positions', accessor: (p) => `${p.pos1} / ${p.pos2}` },
    { header: 'College', accessor: (p) => p.college ?? '' },
    { header: 'Jersey #', accessor: (p) => p.jerseyNum },
    { header: 'Grad Year', accessor: (p) => p.gradYear },
    { header: 'State', accessor: (p) => p.state ?? '' },
    { header: 'Jersey Size', accessor: (p) => p.jerseySize },
    { header: 'Pant Size', accessor: (p) => p.pantSize },
    { header: 'Stirrup Size', accessor: (p) => p.stirrupSize },
    {
      header: 'Shorts Size',
      accessor: (p) =>
        typeof p.shortSize === 'object' && p.shortSize !== null
          ? ((p.shortSize as any).label ?? (p.shortSize as any).value)
          : (p.shortSize as string),
    },
    {
      header: 'Practice Shorts',
      accessor: (p) =>
        typeof p.practiceShortSize === 'object' && p.practiceShortSize !== null
          ? ((p.practiceShortSize as any).label ??
            (p.practiceShortSize as any).value)
          : (p.practiceShortSize as string),
    },
    { header: 'Trusted', accessor: (p) => (p.isTrusted ? 'YES' : 'NO') },
    {
      header: 'Address',
      accessor: (p) =>
        [p.address1, p.city, p.state, p.zip].filter(Boolean).join(', '),
    },
  ];

  // -------- parents lazy-load cache + loader state --------
  const [parentsByPlayerId, setParentsByPlayerId] = useState<
    Record<string, ParentPreview[] | 'EMPTY'>
  >({});
  const [loadingParentsFor, setLoadingParentsFor] = useState<string | null>(
    null
  );

  const [showAttachParentFor, setShowAttachParentFor] = useState<string | null>(
    null
  );
  // selected parent email from dropdown
  const [attachSelectedParentId, setAttachSelectedParentId] =
    useState<string>('');
  const [attachBusy, setAttachBusy] = useState(false);

  const onAttachParent = async (playerId: string) => {
    if (!attachSelectedParentId) return;
    try {
      setAttachBusy(true);
      await attachParentToPlayer(playerId, {
        parentId: attachSelectedParentId,
      });

      setParentsByPlayerId((m) => {
        const clone = { ...m };
        delete clone[playerId];
        return clone;
      });
      await loadParentsIfNeeded(playerId);

      setAttachSelectedParentId('');
      setShowAttachParentFor(null);
      addToast('Parent attached', 'success');
    } catch (e: any) {
      addToast(e?.message || 'Failed to attach parent', 'error');
    } finally {
      setAttachBusy(false);
    }
  };

  const onRemoveParent = async (
    playerId: string,
    parentId: string | number
  ) => {
    try {
      await detachParentFromPlayer(playerId, parentId);

      setParentsByPlayerId((m) => {
        const clone = { ...m };
        delete clone[playerId];
        return clone;
      });
      await loadParentsIfNeeded(playerId);

      addToast('Parent removed', 'success');
    } catch (e: any) {
      addToast(e?.message || 'Failed to remove parent', 'error');
    }
  };

  const formatAddr = (a?: {
    address1?: string | null;
    address2?: string | null;
    city?: string | null;
    state?: string | null;
    zip?: string | null;
  }) =>
    a
      ? [a.address1, a.address2, a.city, a.state, a.zip]
          .filter(Boolean)
          .join(', ')
      : undefined;

  const loadParentsIfNeeded = async (playerId: string) => {
    if (parentsByPlayerId[playerId] !== undefined) return;
    try {
      setLoadingParentsFor(playerId);
      const full: PlayerFE = await fetchPlayerById(playerId);
      const parents =
        full.parents && full.parents.length
          ? full.parents.map((par: any) => ({
              id: par.id,
              name:
                par.user?.fname || par.user?.lname
                  ? `${par.user?.fname ?? ''} ${par.user?.lname ?? ''}`.trim()
                  : 'Parent',
              email: par.user?.email ?? null,
              phone: par.user?.phone ?? null,
              address: formatAddr(par.address ?? undefined),
            }))
          : 'EMPTY';
      setParentsByPlayerId((m) => ({ ...m, [playerId]: parents }));
    } catch (err) {
      console.error('Failed to load parents', err);
      setParentsByPlayerId((m) => ({ ...m, [playerId]: 'EMPTY' }));
    } finally {
      setLoadingParentsFor((cur) => (cur === playerId ? null : cur));
    }
  };

  const toggleExpand = async (playerId: string) => {
    const willExpand = expanded !== playerId;
    setExpanded(willExpand ? playerId : null);
    if (willExpand) {
      await loadParentsIfNeeded(playerId);
    }
  };

  // ---------------- UI ----------------
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
              className="p-2 bg-[rgba(255,255,255,0.1)] rounded-lg text-white hover:bg-[rgba(255,255,255,0.2)]"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
            <div className="text-3xl lg:text-3xl font-bold text-white">
              Manage Players
            </div>
          </div>
          <div className="relative">
            <button
              onClick={() => setExportOpen((v) => !v)}
              onBlur={() => setTimeout(() => setExportOpen(false), 150)}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-white/10 hover:bgwhite/20 border border-white/20 text-white transition"
              title="Export filtered users"
            >
              <ArrowDownTrayIcon className="w-5 h-5" />
              <span className="hidden sm:inline">Export</span>
              <ChevronDownIcon className="w-4 h-4 opacity-80" />
            </button>
            {/* Export buttons */}
            {exportOpen && (
              <div className="absolute md:right-0 mt-2 min-w-[180px] rounded-xl bg-black/80 backdrop-blur-xl border border-white/15 shadow-2xl overflow-hidden">
                <button
                  className="w-full text-left px-4 py-2 text-white/90 hover:bg-white/10 transition"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    exportCSV(filteredSorted, columns, {
                      filenameBase: 'players-filtered',
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
                      filenameBase: 'players-filtered',
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
            placeholder="Search players…"
            className="w-full px-4 py-2 bg-[rgba(255,255,255,0.05)] placeholder-white/70 text-white rounded-lg focus:outline-none"
          />
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <select
              value={teamFilter}
              onChange={(e) => setTeamFilter(e.target.value)}
              className="px-4 py-2 bg-white/10 text-white rounded-lg"
            >
              <option value="all">All Teams</option>
              {teams.map((t) => (
                <option key={t} value={t} className="text-black">
                  {t}
                </option>
              ))}
            </select>
            <select
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
              className="px-4 py-2 bg-white/10 text-white rounded-lg"
            >
              <option value="all">All States</option>
              {states.map((s) => (
                <option key={s} value={s} className="text-black">
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <select
              value={geradYearFilter}
              onChange={(e) => setGradYearFilter(e.target.value as any)}
              className="px-4 py-2 bg-white/10 text-white rounded-lg"
            >
              <option value="all">All Grad Years</option>
              {gradYears.map((y) => (
                <option key={y} value={y} className="text-black">
                  {y}
                </option>
              ))}
            </select>
            <select
              value={ageGroupFilter}
              onChange={(e) => setAgeGroupFilter(e.target.value)}
              className="px-4 py-2 bg-white/10 text-white rounded-lg"
            >
              <option value="all">All Age Groups</option>
              {ageGroups.map((a) => (
                <option key={a} value={a} className="text-black">
                  {a}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <select
              value={posFilter}
              onChange={(e) => setPosFilter(e.target.value)}
              className="px-4 py-2 bg-white/10 text-white rounded-lg"
            >
              <option value="all">All Positions</option>
              {POSITIONS.map((p) => (
                <option key={p.value} value={p.value} className="text-black">
                  {p.label}
                </option>
              ))}
            </select>
            <select
              value={collegeFilter}
              onChange={(e) => setCollegeFilter(e.target.value as any)}
              className="px-4 py-2 bg-white/10 text-white rounded-lg"
            >
              <option value="all" className="text-black">
                All College
              </option>
              <option value="yes" className="text-black">
                Committed
              </option>
              <option value="no" className="text-black">
                Not Committed
              </option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <select
              value={jerseySizeFilter}
              onChange={(e) => setJerseySizeFilter(e.target.value)}
              className="px-4 py-2 bg-white/10 text-white rounded-lg"
            >
              <option value="all">All Jersey Sizes</option>
              {Array.from(new Set(players.map((p) => p.jerseySize))).map(
                (j) => (
                  <option key={j} value={j} className="text-black">
                    {j}
                  </option>
                )
              )}
            </select>
            <select
              value={pantSizeFilter}
              onChange={(e) => setPantSizeFilter(e.target.value)}
              className="px-4 py-2 bg-white/10 text-white rounded-lg"
            >
              <option value="all">All Pant Sizes</option>
              {Array.from(new Set(players.map((p) => p.pantSize))).map((p) => (
                <option key={p} value={p} className="text-black">
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Data table */}
        <div className="bg-[rgba(255,255,255,0.05)] backdrop-blur-lg rounded-2xl overflow-hidden shadow-inner">
          {/* xl table */}
          <div className="hidden xl:block">
            <div className="overflow-x-auto">
              <table className="min-w-[980px] w-full table-auto text-white">
                <thead className="sticky top-0 bg-[rgba(255,255,255,0.1)] border-b border-white/15">
                  <tr>
                    <th className="px-4 py-3 text-left">
                      Name <SortButton col="name" />
                    </th>
                    <th className="px-4 py-3 text-left">
                      Team <SortButton col="team" />
                    </th>
                    <th className="px-4 py-3 text-left">
                      Age Group <SortButton col="ageGroup" />
                    </th>
                    <th className="px-4 py-3 text-left">
                      Positions <SortButton col="pos1" />
                    </th>
                    <th className="px-4 py-3 text-left">
                      College <SortButton col="college" />
                    </th>
                    <th className="px-4 py-3 text-left">
                      Grad Year <SortButton col="gradYear" />
                    </th>
                    <th className="px-4 py-3 text-left">
                      State <SortButton col="state" />
                    </th>
                    <th className="px-4 py-3 text-left">
                      Jersey # <SortButton col="jerseyNum" />
                    </th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                  <tr className="bg-white/5">
                    <th colSpan={9} className="px-4 py-2">
                      <div className="flex items-center justify-between text-xs text-white/70">
                        <div className="truncate">
                          {sortRules.length > 0 &&
                            `Sorted by ${sortRules
                              .map((r, i) => `${i + 1}. ${r.key} ${r.dir}`)
                              .join(' → ')}`}
                        </div>
                        <button
                          onClick={() => setSortRules([])}
                          className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-white"
                          title="Clear sorts"
                        >
                          Clear sorts
                        </button>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td
                        colSpan={9}
                        className="px-6 py-10 text-center text-white/60"
                      >
                        Loading...
                      </td>
                    </tr>
                  ) : paginated.length === 0 ? (
                    <tr>
                      <td
                        colSpan={9}
                        className="px-6 py-10 text-center text-white/60"
                      >
                        No players found.
                      </td>
                    </tr>
                  ) : (
                    paginated.map((p) => (
                      <React.Fragment key={p.id}>
                        <tr
                          onClick={() => toggleExpand(p.id)}
                          className="hover:bg-[rgba(255,255,255,0.07)] cursor-pointer"
                        >
                          <td className="px-4 py-3">{p.name}</td>
                          <td className="px-4 py-3">{p.team}</td>
                          <td className="px-4 py-3">{p.ageGroup}</td>
                          <td className="px-4 py-3">
                            {p.pos1} / {p.pos2}
                          </td>
                          <td className="px-4 py-3">{p.college}</td>
                          <td className="px-4 py-3">{p.gradYear}</td>
                          <td className="px-4 py-3">{p.state}</td>
                          <td className="px-4 py-3">{p.jerseyNum}</td>
                          <td className="px-4 py-3 text-right space-x-2">
                            <button
                              onClick={async (e) => {
                                e.stopPropagation();
                                await openEdit(p);
                              }}
                              className="p-2 bg-white/10 rounded-lg hover:bg-[#5AA5FF]"
                            >
                              <PencilSquareIcon className="w-5 h-5 text-white" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openDelete(p);
                              }}
                              className="p-2 bg-white/10 rounded-lg hover:bg-red-600"
                            >
                              <TrashIcon className="w-5 h-5 text-white" />
                            </button>
                            <button
                              onClick={async (e) => {
                                e.stopPropagation();
                                await toggleExpand(p.id);
                              }}
                              className={`p-2 rounded-lg transition ${
                                expanded === p.id
                                  ? 'bg-[#5AA5FF] text-white'
                                  : 'bg-white/10 hover:bg-[#5AA5FF]/70 text-white'
                              }`}
                            >
                              <EyeIcon className="w-5 h-5" />
                            </button>
                          </td>
                        </tr>
                        {expanded === p.id && (
                          <tr>
                            <td colSpan={9} className="p-0 bg-transparent">
                              <div className="bg-[rgba(90,165,255,0.10)] rounded-b-xl m-2 p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 text-sm text-white">
                                {/* Column 1 */}
                                <div>
                                  <div>
                                    <span className="font-semibold">
                                      Jersey #:
                                    </span>{' '}
                                    {p.jerseyNum}
                                  </div>
                                  <div>
                                    <span className="font-semibold">
                                      Jersey Size:
                                    </span>{' '}
                                    {p.jerseySize}
                                  </div>
                                  <div>
                                    <span className="font-semibold">
                                      Pant Size:
                                    </span>{' '}
                                    {p.pantSize}
                                  </div>
                                  <div>
                                    <span className="font-semibold">
                                      Stirrup Size:
                                    </span>{' '}
                                    {p.stirrupSize}
                                  </div>
                                </div>
                                {/* Column 2 */}
                                <div>
                                  <div>
                                    <span className="font-semibold">
                                      Shorts Size:
                                    </span>{' '}
                                    {typeof p.shortSize === 'object' &&
                                    p.shortSize !== null
                                      ? ((p.shortSize as any).label ??
                                        (p.shortSize as any).value)
                                      : (p.shortSize as string)}
                                  </div>
                                  <div>
                                    <span className="font-semibold">
                                      Practice Shorts:
                                    </span>{' '}
                                    {typeof p.practiceShortSize === 'object' &&
                                    p.practiceShortSize !== null
                                      ? ((p.practiceShortSize as any).label ??
                                        (p.practiceShortSize as any).value)
                                      : (p.practiceShortSize as string)}
                                  </div>
                                  <div>
                                    <span className="font-semibold">
                                      Address:
                                    </span>{' '}
                                    {p.address1}, {p.city}, {p.state} {p.zip}
                                  </div>
                                </div>
                                {/* Column 3 */}
                                <div>
                                  <div>
                                    <span className="font-semibold">
                                      Trusted:
                                    </span>
                                    <span
                                      className={`ml-2 inline-block px-2 py-0.5 rounded-full text-xs ${
                                        p.isTrusted
                                          ? 'bg-green-200 text-green-700'
                                          : 'bg-red-200 text-red-700'
                                      }`}
                                    >
                                      {p.isTrusted ? 'YES' : 'NO'}
                                    </span>
                                  </div>
                                  {p.email && (
                                    <div className="mt-2">
                                      <span className="font-semibold">
                                        Email:
                                      </span>{' '}
                                      {p.email}
                                    </div>
                                  )}
                                </div>

                                {/* ---------- Parents panel (TABLE) ---------- */}
                                <div className="sm:col-span-2 md:col-span-3">
                                  <div className="mt-4 p-3 rounded-xl bg-white/5 border border-white/10">
                                    <div className="flex items-center justify-between">
                                      <div className="font-semibold">
                                        Parents
                                      </div>
                                      <div className="flex items-center gap-2">
                                        {loadingParentsFor === p.id && (
                                          <div className="text-xs text-white/70">
                                            Loading…
                                          </div>
                                        )}
                                        <button
                                          className="px-2 py-1 text-xs rounded bg-white/10 hover:bg-white/20"
                                          onClick={() =>
                                            setShowAttachParentFor(
                                              showAttachParentFor === p.id
                                                ? null
                                                : p.id
                                            )
                                          }
                                        >
                                          {showAttachParentFor === p.id
                                            ? 'Cancel'
                                            : 'Attach Parent'}
                                        </button>
                                      </div>
                                    </div>

                                    {showAttachParentFor === p.id && (
                                      <form
                                        className="mt-2 flex flex-col sm:flex-row gap-2"
                                        onSubmit={(e) => {
                                          e.preventDefault();
                                          onAttachParent(p.id);
                                        }}
                                      >
                                        <select
                                          className="flex-1 px-3 py-2 rounded bg-white/10 text-white outline-none"
                                          value={attachSelectedParentId}
                                          onChange={(e) =>
                                            setAttachSelectedParentId(
                                              e.target.value
                                            )
                                          }
                                          required
                                        >
                                          <option
                                            value=""
                                            disabled
                                            className="text-black"
                                          >
                                            {usersLoading
                                              ? 'Loading users…'
                                              : usersError
                                                ? 'Failed to load users'
                                                : 'Select a parent user'}
                                          </option>
                                          {parentUserOptions.map((opt) => (
                                            <option
                                              key={opt.value}
                                              value={opt.value}
                                              className="text-black"
                                            >
                                              {opt.label}{' '}
                                              {opt.email
                                                ? `(${opt.email})`
                                                : ''}
                                            </option>
                                          ))}
                                        </select>
                                        <button
                                          type="submit"
                                          disabled={
                                            attachBusy ||
                                            usersLoading ||
                                            !!usersError
                                          }
                                          className="px-3 py-2 rounded bg-[#5AA5FF] text-white disabled:opacity-60"
                                        >
                                          {attachBusy ? 'Attaching…' : 'Attach'}
                                        </button>
                                      </form>
                                    )}

                                    {/* Content */}
                                    <div className="mt-2">
                                      {parentsByPlayerId[p.id] === 'EMPTY' && (
                                        <span className="inline-block text-xs px-2 py-1 rounded-full bg-white/10 text-white/70">
                                          No parents linked
                                        </span>
                                      )}

                                      {Array.isArray(
                                        parentsByPlayerId[p.id]
                                      ) && (
                                        <div className="grid gap-2 md:grid-cols-2">
                                          {(
                                            parentsByPlayerId[
                                              p.id
                                            ] as ParentPreview[]
                                          ).map((par) => (
                                            <div
                                              key={par.id}
                                              className="p-2 rounded-lg bg-black/20 border border-white/10 flex justify-between items-start"
                                            >
                                              <div>
                                                <div className="text-sm font-medium">
                                                  {par.name}
                                                </div>
                                                <div className="text-xs text-white/80">
                                                  {par.email || '—'}
                                                </div>
                                                <div className="text-xs text-white/80">
                                                  {par.phone || '—'}
                                                </div>
                                                {par.address && (
                                                  <div className="text-xs text-white/70 mt-1">
                                                    {par.address}
                                                  </div>
                                                )}
                                              </div>
                                              <button
                                                onClick={() =>
                                                  onRemoveParent(p.id, par.id)
                                                }
                                                className="ml-2 px-2 py-1 text-xs rounded bg-red-600 hover:bg-red-700 text-white"
                                              >
                                                Remove
                                              </button>
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                {/* ---------- /Parents panel (TABLE) ---------- */}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* xs / lg card list */}
          <div className="xl:hidden divide-y divide-white/10">
            {loading ? (
              <div className="p-4 text-center text-white/60">Loading...</div>
            ) : paginated.length === 0 ? (
              <div className="p-4 text-center text-white/60">
                No players found.
              </div>
            ) : (
              paginated.map((p) => (
                <div key={p.id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-white font-semibold truncate">
                        {p.name}
                      </div>
                      <div className="text-white/80 text-sm truncate">
                        {p.team}
                      </div>
                      <div className="text-white/70 text-xs mt-1">
                        {p.ageGroup} • {p.pos1}/{p.pos2}
                      </div>
                      {p.college && (
                        <div className="text-white/80 text-xs mt-1">
                          College: {p.college}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-2 shrink-0">
                      <button
                        className="p-2 bg-white/10 rounded-lg hover:bg-[#5AA5FF]"
                        onClick={async () => await openEdit(p)}
                      >
                        <PencilSquareIcon className="w-5 h-5 text-white" />
                      </button>
                      <button
                        className="p-2 bg-white/10 rounded-lg hover:bg-red-600"
                        onClick={() => openDelete(p)}
                      >
                        <TrashIcon className="w-5 h-5 text-white" />
                      </button>
                      <button
                        className={`p-2 rounded-lg transition ${
                          expanded === p.id
                            ? 'bg-[#5AA5FF] text-white'
                            : 'bg-white/10 hover:bg-[#5AA5FF]/70 text-white'
                        }`}
                        onClick={async () => await toggleExpand(p.id)}
                      >
                        <EyeIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  {expanded === p.id && (
                    <div className="mt-3 grid grid-cols-2 gap-3 text-xs text-white/90">
                      <div>
                        <span className="font-semibold">Jersey #:</span>{' '}
                        {p.jerseyNum}
                      </div>
                      <div>
                        <span className="font-semibold">Grad:</span>{' '}
                        {p.gradYear}
                      </div>
                      <div>
                        <span className="font-semibold">Jersey Size:</span>{' '}
                        {p.jerseySize}
                      </div>
                      <div>
                        <span className="font-semibold">Pant Size:</span>{' '}
                        {p.pantSize}
                      </div>
                      <div>
                        <span className="font-semibold">Stirrup Size:</span>{' '}
                        {p.stirrupSize}
                      </div>
                      <div>
                        <span className="font-semibold">Shorts Size:</span>{' '}
                        {typeof p.shortSize === 'object' && p.shortSize !== null
                          ? ((p.shortSize as any).label ??
                            (p.shortSize as any).value)
                          : (p.shortSize as string)}
                      </div>
                      <div>
                        <span className="font-semibold">Practice Shorts:</span>{' '}
                        {typeof p.practiceShortSize === 'object' &&
                        p.practiceShortSize !== null
                          ? ((p.practiceShortSize as any).label ??
                            (p.practiceShortSize as any).value)
                          : (p.practiceShortSize as string)}
                      </div>
                      <div className="col-span-2">
                        <span className="font-semibold">Address:</span>{' '}
                        {p.address1}, {p.city}, {p.state} {p.zip}
                      </div>
                      <div className="col-span-2">
                        <span className="font-semibold">Trusted:</span>
                        <span
                          className={`ml-2 inline-block px-2 py-0.5 rounded-full ${
                            p.isTrusted
                              ? 'bg-green-200 text-green-700'
                              : 'bg-red-200 text-red-700'
                          }`}
                        >
                          {p.isTrusted ? 'YES' : 'NO'}
                        </span>
                      </div>

                      {/* Parents panel (MOBILE) */}
                      <div className="col-span-2 mt-1">
                        <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                          <div className="flex items-center justify-between">
                            <div className="font-semibold">Parents</div>
                            <div className="flex items-center gap-2">
                              {loadingParentsFor === p.id && (
                                <div className="text-xs text-white/70">
                                  Loading…
                                </div>
                              )}
                              <button
                                className="px-2 py-1 text-xs rounded bg-white/10 hover:bg-white/20"
                                onClick={() =>
                                  setShowAttachParentFor(
                                    showAttachParentFor === p.id ? null : p.id
                                  )
                                }
                              >
                                {showAttachParentFor === p.id
                                  ? 'Cancel'
                                  : 'Attach Parent'}
                              </button>
                            </div>
                          </div>

                          {showAttachParentFor === p.id && (
                            <form
                              className="mt-2 flex flex-col sm:flex-row gap-2"
                              onSubmit={(e) => {
                                e.preventDefault();
                                onAttachParent(p.id);
                              }}
                            >
                              <select
                                className="flex-1 px-3 py-2 rounded bg-white/10 text-white outline-none"
                                value={attachSelectedParentId}
                                onChange={(e) =>
                                  setAttachSelectedParentId(e.target.value)
                                }
                                required
                              >
                                <option
                                  value=""
                                  disabled
                                  className="text-black"
                                >
                                  {usersLoading
                                    ? 'Loading users…'
                                    : usersError
                                      ? 'Failed to load users'
                                      : 'Select a parent user'}
                                </option>
                                {parentUserOptions.map((opt) => (
                                  <option
                                    key={opt.value}
                                    value={opt.value}
                                    className="text-black"
                                  >
                                    {opt.label}{' '}
                                    {opt.email ? `(${opt.email})` : ''}
                                  </option>
                                ))}
                              </select>
                              <button
                                type="submit"
                                disabled={
                                  attachBusy || usersLoading || !!usersError
                                }
                                className="px-3 py-2 rounded bg-[#5AA5FF] text-white disabled:opacity-60"
                              >
                                {attachBusy ? 'Attaching…' : 'Attach'}
                              </button>
                            </form>
                          )}

                          <div className="mt-2">
                            {parentsByPlayerId[p.id] === 'EMPTY' && (
                              <span className="inline-block text-xs px-2 py-1 rounded-full bg-white/10 text-white/70">
                                No parents linked
                              </span>
                            )}
                            {Array.isArray(parentsByPlayerId[p.id]) && (
                              <div className="grid gap-2">
                                {(
                                  parentsByPlayerId[p.id] as ParentPreview[]
                                ).map((par) => (
                                  <div
                                    key={par.id}
                                    className="p-2 rounded-lg bg-black/20 border border-white/10 flex justify-between items-start"
                                  >
                                    <div>
                                      <div className="text-sm font-medium">
                                        {par.name}
                                      </div>
                                      <div className="text-xs text-white/80">
                                        {par.email || '—'}
                                      </div>
                                      <div className="text-xs text-white/80">
                                        {par.phone || '—'}
                                      </div>
                                      {par.address && (
                                        <div className="text-xs text-white/70 mt-1">
                                          {par.address}
                                        </div>
                                      )}
                                    </div>
                                    <button
                                      onClick={() =>
                                        onRemoveParent(p.id, par.id)
                                      }
                                      className="ml-2 px-2 py-1 text-xs rounded bg-red-600 hover:bg-red-700 text-white"
                                    >
                                      Remove
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      {/* /Parents panel (MOBILE) */}
                    </div>
                  )}
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

      <SideDialog
        open={dialogOpen}
        onClose={closeDialog}
        title={dialogType === 'edit' ? 'Edit Player' : 'Remove Player'}
      >
        {dialogType === 'edit' && (
          <>
            {!editPlayerFE || editLoading ? (
              <div className="p-4 text-white/80">Loading player…</div>
            ) : (
              <EditPlayerModal
                player={editPlayerFE}
                onSuccess={async () => {
                  const fresh = await fetchPlayerById(editPlayerFE.id as any);
                  setPlayers((ps) =>
                    ps.map((row) =>
                      row.id === (fresh.id as any) ? mapFEToRow(fresh) : row
                    )
                  );
                  closeDialog();
                }}
                onCancel={closeDialog}
              />
            )}
          </>
        )}

        {dialogType === 'delete' && selectedPlayer && (
          <div className="space-y-4">
            <p className="text-white">
              Are you sure you want to remove <b>{selectedPlayer.name}</b>?
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
                  const ok = await removePlayerFromTeam(selectedPlayer.id);
                  if (ok) {
                    setPlayers((ps) =>
                      ps.filter((p) => p.id !== selectedPlayer.id)
                    );
                    closeDialog();
                  }
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
