// apps/web/src/pages/TeamDetails.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  PencilSquareIcon,
  TrashIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import {
  getTeamById,
  addPlayerToTeam,
  addCoachToTeam,
  addTrophyToTeam,
  updateTrophy,
  deleteTrophy,
  updateTeam,
  deleteTeam,
} from '@/api/team';
import { fetchUsers } from '@/api/user';
import { ScrollArea } from '@/components/ui/scroll-area';
import SideDialog from '@/components/SideDialog';
import type { TeamFE } from '@bomber-app/database/types/team';
import type { CoachFE, PlayerFE, PublicUserFE } from '@bomber-app/database';
import { US_STATES } from '@/utils/state';
import EditPlayerModal from './forms/Modals/edit-player';
import { removePlayerFromTeam } from '@/api/player';
import EditCoachModal from './forms/Modals/edit-coach';
import { removeCoachFromTeam } from '@/api/coach';

const getHeadCoachName = (team?: TeamFE) =>
  team?.headCoach?.user
    ? `${team.headCoach.user.fname} ${team.headCoach.user.lname}`
    : 'N/A';

export default function TeamDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Team state
  const [team, setTeam] = useState<TeamFE | null>(null);
  const [loading, setLoading] = useState(true);

  // Tabs
  const [tab, setTab] = useState<'roster' | 'staff' | 'trophies'>('roster');

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<
    | 'addPlayer'
    | 'addCoach'
    | 'addTrophy'
    | 'editTrophy'
    | 'removeTrophy'
    | 'editTeam'
    | 'editPlayer'
    | 'editCoach'
    | 'removeCoach'
    | 'removePlayer'
    | 'removeTeam'
    | null
  >(null);

  // Add Player dropdown
  const [playerSearch, setPlayerSearch] = useState('');
  const [allPlayers, setAllPlayers] = useState<PublicUserFE[]>([]);
  const [selectedPlayerID, setSelectedPlayerID] = useState<string | null>(null);

  // Add Coach dropdown
  const [coachSearch, setCoachSearch] = useState('');
  const [allCoaches, setAllCoaches] = useState<PublicUserFE[]>([]);
  const [selectedCoachID, setSelectedCoachID] = useState<string | null>(null);

  // Add/Edit Trophy form state
  const [trophyTitle, setTrophyTitle] = useState('');
  const [trophyImageURL, setTrophyImageURL] = useState('');
  const [editingTrophyId, setEditingTrophyId] = useState<string | null>(null);

  // Edit Team form state
  const [editName, setEditName] = useState('');
  const [editAgeGroup, setEditAgeGroup] = useState<TeamFE['ageGroup']>('U8');
  const [editRegion, setEditRegion] = useState<TeamFE['region']>('TEXAS');
  const [editState, setEditState] = useState<TeamFE['state']>('TX');
  const [editHeadCoachSearch, setEditHeadCoachSearch] = useState('');
  const [editHeadCoachOptions, setEditHeadCoachOptions] = useState<
    PublicUserFE[]
  >([]);
  const [editHeadCoachID, setEditHeadCoachID] = useState<string | null>(null);

  // Edit Player
  const [selectedPlayerForEdit, setSelectedPlayerForEdit] =
    useState<PlayerFE | null>(null);
  const [removingPlayerId, setRemovingPlayerId] = useState<string | null>(null);
  const [removingPlayerName, setRemovingPlayerName] = useState<string>('');

  const handleDeletePlayer = async () => {
    if (!removingPlayerId) return;
    const ok = await removePlayerFromTeam(removingPlayerId);
    if (ok) {
      setTeam((prev) =>
        prev
          ? {
              ...prev,
              players: prev.players.filter((pl) => pl.id !== removingPlayerId),
            }
          : prev
      );
    }
    setRemovingPlayerId(null);
    setRemovingPlayerName('');
    closeDialog();
  };

  // Edit Coach
  const [selectedCoachForEdit, setSelectedCoachForEdit] =
    useState<CoachFE | null>(null as any);
  const [selectedCoachForRemove, setSelectedCoachForRemove] =
    useState<CoachFE | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);

  const handleRemoveCoachFromTeam = async () => {
    if (!id || !selectedCoachForRemove) return;
    try {
      setIsRemoving(true);
      const updated = await removeCoachFromTeam(selectedCoachForRemove.id, id);
      if (updated) setTeam(updated);
      closeDialog();
    } finally {
      setIsRemoving(false);
    }
  };

  const refreshTeam = async () => {
    if (!id) return;
    const t = await getTeamById(id);
    setTeam(t);
  };

  // Fetch team
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getTeamById(id)
      .then((t) => {
        setTeam(t);
        // prefill edit form
        setEditName(t.name);
        setEditAgeGroup(t.ageGroup);
        setEditRegion(t.region);
        setEditState(t.state);
        if (t.headCoach?.user) {
          const full = `${t.headCoach.user.fname} ${t.headCoach.user.lname}`;
          setEditHeadCoachSearch(full);
          setEditHeadCoachID(t.headCoach.id);
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  // Fetch all users once
  useEffect(() => {
    fetchUsers().then((users) => {
      setAllPlayers(users.filter((u) => u.primaryRole === 'PLAYER'));
      setAllCoaches(
        users.filter(
          (u) =>
            u.primaryRole === 'COACH' ||
            u.primaryRole === 'REGIONAL_COACH' ||
            u.primaryRole === 'ADMIN'
        )
      );
      setEditHeadCoachOptions(
        users.filter(
          (u) =>
            u.primaryRole === 'COACH' ||
            u.primaryRole === 'REGIONAL_COACH' ||
            u.primaryRole === 'ADMIN'
        )
      );
    });
  }, []);

  // Filter dropdown lists
  const playerOptions = allPlayers.filter((u) =>
    `${u.fname} ${u.lname}`.toLowerCase().includes(playerSearch.toLowerCase())
  );
  const coachOptions = allCoaches.filter((u) =>
    `${u.fname} ${u.lname}`.toLowerCase().includes(coachSearch.toLowerCase())
  );
  const editCoachOptionsFiltered = editHeadCoachOptions.filter((u) =>
    `${u.fname} ${u.lname}`
      .toLowerCase()
      .includes(editHeadCoachSearch.toLowerCase())
  );

  // Open dialog helpers
  const openAddPlayer = () => {
    setDialogType('addPlayer');
    setPlayerSearch('');
    setSelectedPlayerID(null);
    setDialogOpen(true);
  };
  const openAddCoach = () => {
    setDialogType('addCoach');
    setCoachSearch('');
    setSelectedCoachID(null);
    setDialogOpen(true);
  };
  const openAddTrophy = () => {
    setDialogType('addTrophy');
    setTrophyTitle('');
    setTrophyImageURL('');
    setEditingTrophyId(null);
    setDialogOpen(true);
  };
  const openEditTrophy = (tID: string, title: string, url: string) => {
    setDialogType('editTrophy');
    setEditingTrophyId(tID);
    setTrophyTitle(title);
    setTrophyImageURL(url);
    setDialogOpen(true);
  };
  const openRemoveTrophy = (tID: string) => {
    setDialogType('removeTrophy');
    setEditingTrophyId(tID);
    setDialogOpen(true);
  };
  const openEditTeam = () => {
    setDialogType('editTeam');
    setDialogOpen(true);
  };
  const openRemoveTeam = () => {
    setDialogType('removeTeam');
    setDialogOpen(true);
  };
  const closeDialog = () => {
    setDialogOpen(false);
    setDialogType(null);
  };
  const openEditPlayer = (p: PlayerFE) => {
    setSelectedPlayerForEdit(p);
    setDialogType('editPlayer');
    setDialogOpen(true);
  };
  const openRemovePlayer = (p: PlayerFE) => {
    setRemovingPlayerId(p.id);
    const name = p.user ? `${p.user.fname} ${p.user.lname}` : 'this player';
    setRemovingPlayerName(name);
    setDialogType('removePlayer');
    setDialogOpen(true);
  };
  const openEditCoach = (c: CoachFE) => {
    setSelectedCoachForEdit(c);
    setDialogType('editCoach');
    setDialogOpen(true);
  };
  const openRemoveCoach = (c: CoachFE) => {
    setSelectedCoachForRemove(c);
    setDialogType('removeCoach');
    setDialogOpen(true);
  };

  // Handlers (unchanged)
  const handleAddPlayer = async () => {
    if (!id || !selectedPlayerID) return;
    const updated = await addPlayerToTeam(id, { userID: selectedPlayerID });
    if (updated) setTeam(updated);
    closeDialog();
  };
  const handleAddCoach = async () => {
    if (!id || !selectedCoachID) return;
    const updated = await addCoachToTeam(id, { userID: selectedCoachID });
    if (updated) setTeam(updated);
    closeDialog();
  };
  const handleSaveTrophy = async () => {
    if (!id) return;
    if (dialogType === 'addTrophy') {
      const newT = await addTrophyToTeam(id, {
        title: trophyTitle,
        imageURL: trophyImageURL,
      });
      if (newT && team)
        setTeam({ ...team, trophyCase: [...team.trophyCase, newT] });
    } else if (dialogType === 'editTrophy' && editingTrophyId) {
      const upd = await updateTrophy(id, editingTrophyId, {
        title: trophyTitle,
        imageURL: trophyImageURL,
      });
      if (upd && team) {
        setTeam({
          ...team,
          trophyCase: team.trophyCase.map((t) => (t.id === upd.id ? upd : t)),
        });
      }
    }
    closeDialog();
  };
  const handleDeleteTrophy = async () => {
    if (!id || !editingTrophyId || !team) return;
    const ok = await deleteTrophy(id, editingTrophyId);
    if (ok)
      setTeam({
        ...team,
        trophyCase: team.trophyCase.filter((t) => t.id !== editingTrophyId),
      });
    closeDialog();
  };
  const handleSaveEdit = async () => {
    if (!id) return;
    const payload = {
      name: editName,
      ageGroup: editAgeGroup,
      region: editRegion,
      state: editState,
      headCoachUserID: editHeadCoachID,
    };
    const updated = await updateTeam(id, payload);
    if (updated) setTeam(updated);
    closeDialog();
  };
  const handleDeleteTeam = async () => {
    if (!id) return;
    const ok = await deleteTeam(id);
    if (ok) navigate('/teams');
  };

  const ageGroupMap: Record<string, string> = {
    U8: '8U',
    U10: '10U',
    U12: '12U',
    U14: '14U',
    U16: '16U',
    U18: '18U',
    ALUMNI: 'Alumni',
  };

  return (
    <div className="px-2 pt-4">
      <div
        className={`mx-auto w-full max-w-[2000px] ${dialogOpen ? 'pr-[50px]' : ''}`}
      >
        {/* Header */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="rounded-lg bg-white/12 p-2 text-white transition hover:bg-white/20"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </button>
            <span className="truncate text-2xl font-bold tracking-tight text-white">
              {team?.name ?? 'Team'}
            </span>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
            <button
              onClick={openEditTeam}
              className="rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
            >
              Update Team
            </button>
            <button
              onClick={openRemoveTeam}
              className="rounded-lg bg-red-500 px-4 py-2 text-white hover:bg-red-600"
            >
              Remove Team
            </button>
          </div>
        </div>

        {/* Details */}
        <div className="mb-4 grid grid-cols-1 gap-2 text-base text-white/90 sm:grid-cols-2 lg:grid-cols-4">
          <span className="truncate">
            <b>Head Coach:</b> {getHeadCoachName(team)}
          </span>
          <span className="truncate">
            <b>Age Division:</b>{' '}
            {team?.ageGroup
              ? ageGroupMap[team.ageGroup] || team.ageGroup
              : 'N/A'}
          </span>
          <span className="truncate">
            <b>Location:</b> {team?.region}, {team?.state}
          </span>
          <span className="truncate">
            <b>Team Code:</b> {team?.teamCode}
          </span>
        </div>

        {/* Tabs */}
        <div className="mt-2 mb-6 border-b border-white/20">
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {(['roster', 'staff', 'trophies'] as const).map((name) => (
              <button
                key={name}
                onClick={() => setTab(name)}
                className={`whitespace-nowrap rounded-t-lg px-3 py-2 font-semibold transition ${
                  tab === name
                    ? 'bg-white/10 text-blue-500 shadow'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                {name === 'roster'
                  ? 'Roster'
                  : name === 'staff'
                    ? 'Staff'
                    : 'Trophy Case'}
              </button>
            ))}
          </div>
        </div>

        {/* Roster */}
        {tab === 'roster' && (
          <div className="rounded-2xl bg-white/5 p-4 shadow-inner sm:p-5">
            <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <input
                placeholder="Search players…"
                value={playerSearch}
                onChange={(e) => setPlayerSearch(e.target.value)}
                className="w-full rounded-lg bg-white/10 px-4 py-2 text-white placeholder:text-white/60 sm:w-72"
              />
              <button
                onClick={openAddPlayer}
                className="flex items-center justify-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
              >
                <PlusIcon className="h-5 w-5" /> Add New Player
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-[640px] w-full table-auto text-white">
                <thead className="sticky top-0 bg-white/10 font-bold">
                  <tr>
                    <th className="px-3 py-2 text-left sm:px-4 sm:py-3">
                      Player
                    </th>
                    <th className="px-3 py-2 text-left sm:px-4 sm:py-3">
                      Position
                    </th>
                    <th className="px-3 py-2 text-left sm:px-4 sm:py-3">
                      Email
                    </th>
                    <th className="px-3 py-2 text-left sm:px-4 sm:py-3">
                      Phone
                    </th>
                    <th className="px-3 py-2 text-right sm:px-4 sm:py-3">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {team?.players.length ? (
                    team.players.map((p) => (
                      <tr key={p.id} className="border-b border-white/10">
                        <td className="px-3 py-2 sm:px-4 sm:py-3">
                          {p.user ? `${p.user.fname} ${p.user.lname}` : 'N/A'}
                        </td>
                        <td className="px-3 py-2 sm:px-4 sm:py-3">
                          {p.pos1} {p.pos2 && `/ ${p.pos2}`}
                        </td>
                        <td className="px-3 py-2 sm:px-4 sm:py-3">
                          {p.user?.email}
                        </td>
                        <td className="px-3 py-2 sm:px-4 sm:py-3">
                          {p.user?.phone}
                        </td>
                        <td className="px-3 py-2 text-right sm:px-4 sm:py-3">
                          <div className="flex justify-end gap-1">
                            <button
                              className="rounded p-2 hover:bg-white/20"
                              onClick={() => openEditPlayer(p)}
                            >
                              <PencilSquareIcon className="h-5 w-5 text-white" />
                            </button>
                            <button
                              className="rounded p-2 hover:bg-red-600/50"
                              onClick={() => openRemovePlayer(p)}
                            >
                              <TrashIcon className="h-5 w-5 text-white" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={5}
                        className="py-8 text-center text-white/60"
                      >
                        No players.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Staff */}
        {tab === 'staff' && (
          <div className="rounded-2xl bg-white/5 p-4 shadow-inner sm:p-5">
            <div className="mb-3 flex justify-end">
              <button
                onClick={openAddCoach}
                className="flex items-center justify-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
              >
                <PlusIcon className="h-5 w-5" /> Add New Coach
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-[560px] w-full table-auto text-white">
                <thead className="sticky top-0 bg-white/10 font-bold">
                  <tr>
                    <th className="px-3 py-2 text-left sm:px-4 sm:py-3">
                      Coach
                    </th>
                    <th className="px-3 py-2 text-left sm:px-4 sm:py-3">
                      Email
                    </th>
                    <th className="px-3 py-2 text-left sm:px-4 sm:py-3">
                      Phone
                    </th>
                    <th className="px-3 py-2 text-right sm:px-4 sm:py-3">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {team?.coaches.length ? (
                    team.coaches.map((c) => (
                      <tr key={c.id} className="border-b border-white/10">
                        <td className="px-3 py-2 sm:px-4 sm:py-3">
                          {c.user ? `${c.user.fname} ${c.user.lname}` : 'N/A'}
                        </td>
                        <td className="px-3 py-2 sm:px-4 sm:py-3">
                          {c.user?.email}
                        </td>
                        <td className="px-3 py-2 sm:px-4 sm:py-3">
                          {c.user?.phone}
                        </td>
                        <td className="px-3 py-2 text-right sm:px-4 sm:py-3">
                          <div className="flex justify-end gap-1">
                            <button
                              className="rounded p-2 hover:bg-white/20"
                              onClick={() => openEditCoach(c)}
                            >
                              <PencilSquareIcon className="h-5 w-5 text-white" />
                            </button>
                            <button
                              className="rounded p-2 hover:bg-red-600/50"
                              onClick={() => openRemoveCoach(c)}
                            >
                              <TrashIcon className="h-5 w-5 text-white" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={4}
                        className="py-8 text-center text-white/60"
                      >
                        No coaches.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Trophies */}
        {tab === 'trophies' && (
          <div className="rounded-2xl bg-white/5 p-4 shadow-inner sm:p-5">
            <div className="mb-3 flex justify-end">
              <button
                onClick={openAddTrophy}
                className="flex items-center justify-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
              >
                <PlusIcon className="h-5 w-5" /> Add New Trophy
              </button>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 md:gap-6">
              {team?.trophyCase.length ? (
                team.trophyCase.map((t) => (
                  <div
                    key={t.id}
                    className="relative flex flex-col items-center rounded-xl bg-white/10 p-4 text-white sm:p-5"
                  >
                    <button
                      onClick={() => openEditTrophy(t.id, t.title, t.imageURL)}
                      className="absolute right-10 top-2 rounded p-1 hover:bg-white/20"
                    >
                      <PencilSquareIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => openRemoveTrophy(t.id)}
                      className="absolute right-2 top-2 rounded p-1 hover:bg-red-600/50"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                    <img
                      src={t.imageURL}
                      alt={t.title}
                      className="mb-2 h-20 w-28 rounded-lg object-contain sm:h-24 sm:w-32"
                    />
                    <div className="text-center text-lg font-semibold">
                      {t.title}
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-1 text-center text-white/60 sm:col-span-2 md:col-span-3 md:py-8">
                  No trophies.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* SideDialog */}
      <SideDialog
        open={dialogOpen}
        onClose={closeDialog}
        title={
          dialogType === 'addPlayer'
            ? 'Add New Player'
            : dialogType === 'addCoach'
              ? 'Add New Coach'
              : dialogType === 'addTrophy'
                ? editingTrophyId
                  ? 'Edit Trophy'
                  : 'Add New Trophy'
                : dialogType === 'removeTrophy'
                  ? 'Delete Trophy'
                  : dialogType === 'removePlayer'
                    ? 'Remove Player'
                    : dialogType === 'editCoach'
                      ? 'Edit Coach'
                      : dialogType === 'removeCoach'
                        ? 'Remove Coach'
                        : dialogType === 'editTeam'
                          ? 'Edit Team'
                          : dialogType === 'removeTeam'
                            ? 'Remove Team'
                            : ''
        }
      >
        {/* Add Player */}
        {dialogType === 'addPlayer' && (
          <div className="px-3 pb-6 sm:px-4 sm:pb-6">
            <label className="block font-semibold text-white">
              Select Player
            </label>
            <input
              type="text"
              placeholder="Search players..."
              value={playerSearch}
              onChange={(e) => {
                setPlayerSearch(e.target.value);
                setSelectedPlayerID(null);
              }}
              className="mt-2 w-full rounded-lg bg-white/10 px-4 py-2 text-white"
            />
            <ul className="mt-2 max-h-40 overflow-auto rounded-lg bg-black/20">
              {playerOptions.map((u) => (
                <li
                  key={u.id}
                  className={`cursor-pointer px-3 py-1 text-white ${
                    selectedPlayerID === u.id ? 'bg-blue-500' : ''
                  }`}
                  onClick={() => setSelectedPlayerID(u.id)}
                >
                  {u.fname} {u.lname}
                </li>
              ))}
            </ul>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={handleAddPlayer}
                disabled={!selectedPlayerID}
                className="rounded-lg bg-blue-500 px-4 py-2 text-white disabled:opacity-50"
              >
                Add
              </button>
              <button
                onClick={closeDialog}
                className="rounded-lg bg-white/20 px-4 py-2 text-white"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Add Coach */}
        {dialogType === 'addCoach' && (
          <div className="px-3 pb-6 sm:px-4 sm:pb-6">
            <label className="block font-semibold text-white">
              Select Coach
            </label>
            <input
              type="text"
              placeholder="Search coaches..."
              value={coachSearch}
              onChange={(e) => {
                setCoachSearch(e.target.value);
                setSelectedCoachID(null);
              }}
              className="mt-2 w-full rounded-lg bg-white/10 px-4 py-2 text-white"
            />
            <ul className="mt-2 max-h-40 overflow-auto rounded-lg bg-black/20">
              {coachOptions.map((u) => (
                <li
                  key={u.id}
                  className={`cursor-pointer px-3 py-1 ${
                    selectedCoachID === u.id
                      ? 'bg-blue-500 text-white'
                      : 'text-white'
                  }`}
                  onClick={() => setSelectedCoachID(u.id)}
                >
                  {u.fname} {u.lname}
                </li>
              ))}
            </ul>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={handleAddCoach}
                disabled={!selectedCoachID}
                className="rounded-lg bg-blue-500 px-4 py-2 text-white disabled:opacity-50"
              >
                Add
              </button>
              <button
                onClick={closeDialog}
                className="rounded-lg bg-white/20 px-4 py-2 text-white"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {dialogType === 'editCoach' && selectedCoachForEdit && (
          <EditCoachModal
            coach={selectedCoachForEdit as any}
            onCancel={() => {
              setDialogOpen(false);
              setDialogType(null);
              setSelectedCoachForEdit(null);
            }}
            onSuccess={async () => {
              await refreshTeam();
              setDialogOpen(false);
              setDialogType(null);
              setSelectedCoachForEdit(null);
            }}
          />
        )}

        {/* Add / Edit Trophy */}
        {(dialogType === 'addTrophy' || dialogType === 'editTrophy') && (
          <div className="px-3 pb-6 sm:px-4 sm:pb-6">
            <label className="block font-semibold text-white">Title</label>
            <input
              type="text"
              value={trophyTitle}
              onChange={(e) => setTrophyTitle(e.target.value)}
              className="mt-2 w-full rounded-lg bg-white/10 px-4 py-2 text-white"
            />
            <label className="mt-4 block font-semibold text-white">
              Image URL
            </label>
            <input
              type="text"
              value={trophyImageURL}
              onChange={(e) => setTrophyImageURL(e.target.value)}
              className="mt-2 w-full rounded-lg bg-white/10 px-4 py-2 text-white"
            />

            {(trophyTitle || trophyImageURL) && (
              <div className="mt-6 flex flex-col items-center gap-2">
                <div className="h-32 w-full overflow-hidden rounded-2xl bg-white/10 sm:w-1/2">
                  {trophyImageURL ? (
                    <img
                      src={trophyImageURL}
                      alt={trophyTitle || 'Preview'}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-white/50">
                      No image
                    </div>
                  )}
                </div>
                <h3 className="text-base font-semibold text-white">
                  {trophyTitle || 'Your Trophy Title'}
                </h3>
              </div>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={handleSaveTrophy}
                disabled={!trophyTitle || !trophyImageURL}
                className="rounded-lg bg-blue-500 px-4 py-2 text-white disabled:opacity-50"
              >
                {dialogType === 'addTrophy' ? 'Add' : 'Save'}
              </button>
              <button
                onClick={closeDialog}
                className="rounded-lg bg-white/20 px-4 py-2 text-white"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Remove Trophy */}
        {dialogType === 'removeTrophy' && editingTrophyId && (
          <div className="px-3 pb-6 sm:px-4 sm:pb-6">
            <p className="text-white">Delete this trophy?</p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={closeDialog}
                className="rounded-lg bg-white/20 px-4 py-2 text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteTrophy}
                className="rounded-lg bg-red-600 px-4 py-2 text-white"
              >
                Delete
              </button>
            </div>
          </div>
        )}

        {dialogType === 'editPlayer' && selectedPlayerForEdit && (
          <EditPlayerModal
            player={selectedPlayerForEdit}
            onCancel={() => {
              setDialogOpen(false);
              setDialogType(null);
              setSelectedPlayerForEdit(null);
            }}
            onSuccess={async () => {
              await refreshTeam();
              setDialogOpen(false);
              setDialogType(null);
              setSelectedPlayerForEdit(null);
            }}
          />
        )}

        {dialogType === 'removePlayer' && removingPlayerId && (
          <div className="px-3 pb-6 sm:px-4 sm:pb-6">
            <p className="text-white">
              Are you sure you want to remove <b>{removingPlayerName}</b>?
              <br />
              <span className="text-white/70 text-sm">
                This will permanently remove the player record from the team.
              </span>
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setRemovingPlayerId(null);
                  setRemovingPlayerName('');
                  closeDialog();
                }}
                className="rounded-lg bg-white/20 px-4 py-2 text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleDeletePlayer}
                className="rounded-lg bg-red-600 px-4 py-2 text-white"
              >
                Delete
              </button>
            </div>
          </div>
        )}

        {/* Edit Team */}
        {dialogType === 'editTeam' && team && (
          <div className="px-3 pb-6 sm:px-4 sm:pb-6">
            <label className="block font-semibold text-white">Team Name</label>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="mt-2 w-full rounded-lg bg-white/10 px-4 py-2 text-white"
            />

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block font-semibold text-white">
                  Age Group
                </label>
                <select
                  value={editAgeGroup}
                  onChange={(e) => setEditAgeGroup(e.target.value as any)}
                  className="mt-2 w-full rounded-lg bg-white/10 px-4 py-2 text-white"
                >
                  {['U8', 'U10', 'U12', 'U14', 'U16', 'U18', 'ALUMNI'].map(
                    (a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-white">Region</label>
                <select
                  value={editRegion}
                  onChange={(e) => setEditRegion(e.target.value as any)}
                  className="mt-2 w-full rounded-lg bg-white/10 px-4 py-2 text-white"
                >
                  {['NW', 'SW', 'S', 'SE', 'NE', 'MW'].map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-white">State</label>
                <select
                  value={editState}
                  onChange={(e) => setEditState(e.target.value as any)}
                  className="mt-2 w-full rounded-lg bg-white/10 px-4 py-2 text-white"
                >
                  {US_STATES.map(({ value, label }) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <label className="mt-4 block font-semibold text-white">
              Head Coach
            </label>
            <input
              type="text"
              placeholder="Search coaches..."
              value={editHeadCoachSearch}
              onChange={(e) => {
                setEditHeadCoachSearch(e.target.value);
                setEditHeadCoachID(null);
              }}
              className="mt-2 w-full rounded-lg bg-white/10 px-4 py-2 text-white"
            />
            <ul className="mt-2 max-h-40 overflow-auto rounded-lg bg-black/20">
              <li
                className={`cursor-pointer px-3 py-1 ${
                  editHeadCoachID === null
                    ? 'bg-blue-500 text-white'
                    : 'text-white'
                }`}
                onClick={() => setEditHeadCoachID(null)}
              >
                — none —
              </li>
              {editCoachOptionsFiltered.map((u) => (
                <li
                  key={u.id}
                  className={`cursor-pointer px-3 py-1 ${
                    editHeadCoachID === u.id
                      ? 'bg-blue-500 text-white'
                      : 'text-white'
                  }`}
                  onClick={() => setEditHeadCoachID(u.id)}
                >
                  {u.fname} {u.lname}
                </li>
              ))}
            </ul>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={handleSaveEdit}
                className="rounded-lg bg-blue-500 px-4 py-2 text-white"
              >
                Save
              </button>
              <button
                onClick={closeDialog}
                className="rounded-lg bg-white/20 px-4 py-2 text-white"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {dialogType === 'removeCoach' && selectedCoachForRemove && (
          <div className="px-3 pb-6 sm:px-4 sm:pb-6">
            <p className="text-white">
              Remove{' '}
              <b>
                {selectedCoachForRemove.user
                  ? `${selectedCoachForRemove.user.fname} ${selectedCoachForRemove.user.lname}`
                  : 'this coach'}
              </b>{' '}
              from <b>{team?.name}</b>?
              {selectedCoachForRemove.id === team?.headCoach?.id ? (
                <>
                  <br />
                  <span className="text-red-300 text-sm">
                    They are the head coach; this will clear the head coach.
                  </span>
                </>
              ) : null}
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={closeDialog}
                className="rounded-lg bg-white/20 px-4 py-2 text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleRemoveCoachFromTeam}
                disabled={isRemoving}
                className="rounded-lg bg-red-600 px-4 py-2 text-white disabled:opacity-60"
              >
                {isRemoving ? 'Removing…' : 'Remove'}
              </button>
            </div>
          </div>
        )}

        {/* Remove Team */}
        {dialogType === 'removeTeam' && team && (
          <div className="px-3 pb-6 sm:px-4 sm:pb-6">
            <p className="text-white">
              Are you sure you want to remove <b>{team.name}</b>?
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={closeDialog}
                className="rounded-lg bg-white/20 px-4 py-2 text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteTeam}
                className="rounded-lg bg-red-600 px-4 py-2 text-white"
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
