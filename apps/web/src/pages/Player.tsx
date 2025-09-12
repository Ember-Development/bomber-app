// apps/web/src/pages/Players.tsx
import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeftIcon,
  PencilSquareIcon,
  TrashIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import type {
  PlayerFE,
  JerseySize,
  PantsSize,
  StirrupSize,
  Position,
  AgeGroup,
} from '@bomber-app/database';
import { useNavigate } from 'react-router-dom';
import SideDialog from '@/components/SideDialog';
import {
  fetchPlayers,
  updatePlayer,
  UpdatePlayerPayload,
  removePlayerFromTeam,
  fetchPlayerById,
} from '@/api/player';
import { POSITIONS, SHORTS_SIZES } from '@/utils/enum';
import EditPlayerModal from '@/components/forms/Modals/edit-player';

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

const PAGE_SIZE = 15;

export default function Players() {
  const navigate = useNavigate();
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(false);
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

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'edit' | 'delete' | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  // state for the external edit content
  const [editPlayerFE, setEditPlayerFE] = useState<PlayerFE | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchPlayers()
      .then((data) => {
        setPlayers(
          data.map((p: any) => ({
            id: p.id,
            name: p.name,
            email: p.email,
            team: p.team,
            pos1: p.pos1,
            pos2: p.pos2,
            ageGroup: p.ageGroup,
            jerseyNum: p.jerseyNum,
            gradYear: p.gradYear,
            jerseySize: p.jerseySize,
            pantSize: p.pantSize,
            stirrupSize: p.stirrupSize,
            shortSize: p.shortSize,
            practiceShortSize: p.practiceShortSize,
            commitId: p.commitId,
            college: p.college,
            isTrusted: p.isTrusted,
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

  const filtered = useMemo(
    () =>
      players.filter((p) => {
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
              p.name.toLowerCase().includes(q) ||
              p.team.toLowerCase().includes(q)
            )
          )
            return false;
        }
        return true;
      }),
    [
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
    ]
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

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
  ]);

  const mapFEToRow = (p: PlayerFE): Player => ({
    id: p.id,
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
    addressID: p.address?.id,
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
    setSaveLoading(false);
  };

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

        {/* Data table on sm+, mobile card list on xs */}
        <div className="bg-[rgba(255,255,255,0.05)] backdrop-blur-lg rounded-2xl overflow-hidden shadow-inner">
          {/* sm+ table */}
          <div className="hidden xl:block">
            <div className="overflow-x-auto">
              <table className="min-w-[900px] w-full table-auto text-white">
                <thead className="sticky top-0 bg-[rgba(90,165,255,0.18)] border-b border-white/15">
                  <tr>
                    <th className="px-4 py-4 text-left">Name</th>
                    <th className="px-4 py-4 text-left">Team</th>
                    <th className="px-4 py-4 text-left">Age Group</th>
                    <th className="px-4 py-4 text-left">Positions</th>
                    <th className="px-4 py-4 text-left">College</th>
                    <th className="px-4 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-6 py-10 text-center text-white/60"
                      >
                        Loading...
                      </td>
                    </tr>
                  ) : paginated.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-6 py-10 text-center text-white/60"
                      >
                        No players found.
                      </td>
                    </tr>
                  ) : (
                    paginated.map((p) => (
                      <React.Fragment key={p.id}>
                        <tr
                          onClick={() =>
                            setExpanded(expanded === p.id ? null : p.id)
                          }
                          className="hover:bg-[rgba(255,255,255,0.07)] cursor-pointer"
                        >
                          <td className="px-4 py-3">{p.name}</td>
                          <td className="px-4 py-3">{p.team}</td>
                          <td className="px-4 py-3">{p.ageGroup}</td>
                          <td className="px-4 py-3">
                            {p.pos1} / {p.pos2}
                          </td>
                          <td className="px-4 py-3">{p.college}</td>
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
                              onClick={(e) => {
                                e.stopPropagation();
                                setExpanded(expanded === p.id ? null : p.id);
                              }}
                              className={`p-2 rounded-lg transition ${expanded === p.id ? 'bg-[#5AA5FF] text-white' : 'bg-white/10 hover:bg-[#5AA5FF]/70 text-white'}`}
                            >
                              <EyeIcon className="w-5 h-5" />
                            </button>
                          </td>
                        </tr>
                        {expanded === p.id && (
                          <tr>
                            <td colSpan={6} className="p-0 bg-transparent">
                              <div className="bg-[rgba(90,165,255,0.10)] rounded-b-xl m-2 p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 text-sm text-white">
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
                                <div>
                                  <div>
                                    <span className="font-semibold">
                                      Shorts Size:
                                    </span>{' '}
                                    {typeof p.shortSize === 'object' &&
                                    p.shortSize !== null
                                      ? (p.shortSize.label ?? p.shortSize.value)
                                      : p.shortSize}
                                  </div>
                                  <div>
                                    <span className="font-semibold">
                                      Practice Shorts:
                                    </span>{' '}
                                    {typeof p.practiceShortSize === 'object' &&
                                    p.practiceShortSize !== null
                                      ? (p.practiceShortSize.label ??
                                        p.practiceShortSize.value)
                                      : p.practiceShortSize}
                                  </div>
                                  <div>
                                    <span className="font-semibold">
                                      Graduation:
                                    </span>{' '}
                                    {p.gradYear}
                                  </div>
                                  <div>
                                    <span className="font-semibold">
                                      Address:
                                    </span>{' '}
                                    {p.address1}, {p.city}, {p.state} {p.zip}
                                  </div>
                                </div>
                                <div>
                                  <div>
                                    <span className="font-semibold">
                                      Trusted:
                                    </span>
                                    <span
                                      className={`ml-2 inline-block px-2 py-0.5 rounded-full text-xs ${p.isTrusted ? 'bg-green-200 text-green-700' : 'bg-red-200 text-red-700'}`}
                                    >
                                      {p.isTrusted ? 'YES' : 'NO'}
                                    </span>
                                  </div>
                                </div>
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

          {/* xs mobile card list */}
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
                        className={`p-2 rounded-lg transition ${expanded === p.id ? 'bg-[#5AA5FF] text-white' : 'bg-white/10 hover:bg-[#5AA5FF]/70 text-white'}`}
                        onClick={() =>
                          setExpanded(expanded === p.id ? null : p.id)
                        }
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

                      <div className="">
                        <span className="font-semibold">Stirrup Size:</span>{' '}
                        {p.stirrupSize}
                      </div>
                      <div className="">
                        <span className="font-semibold">Shorts Size:</span>{' '}
                        {typeof p.shortSize === 'object' && p.shortSize !== null
                          ? (p.shortSize.label ?? p.shortSize.value)
                          : p.shortSize}
                      </div>
                      <div className="">
                        <span className="font-semibold">Practice Shorts:</span>{' '}
                        {typeof p.practiceShortSize === 'object' &&
                        p.practiceShortSize !== null
                          ? (p.practiceShortSize.label ??
                            p.practiceShortSize.value)
                          : p.practiceShortSize}
                      </div>
                      <div className="col-span-2">
                        <span className="font-semibold">Address:</span>{' '}
                        {p.address1}, {p.city}, {p.state} {p.zip}
                      </div>
                      <div className="col-span-2">
                        <span className="font-semibold">Trusted:</span>
                        <span
                          className={`ml-2 inline-block px-2 py-0.5 rounded-full ${p.isTrusted ? 'bg-green-200 text-green-700' : 'bg-red-200 text-red-700'}`}
                        >
                          {p.isTrusted ? 'YES' : 'NO'}
                        </span>
                      </div>
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
                  // Re-fetch the freshly saved player and update the table row
                  const fresh = await fetchPlayerById(editPlayerFE.id);
                  setPlayers((ps) =>
                    ps.map((row) =>
                      row.id === fresh.id ? mapFEToRow(fresh) : row
                    )
                  );
                  closeDialog();
                }}
                onCancel={closeDialog}
                // If you want to override the default PATCH:
                // updatePlayerApi={async (playerId, payload) => updatePlayer(playerId, payload)}
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
