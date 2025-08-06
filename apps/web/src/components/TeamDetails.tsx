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
import type { PublicUserFE } from '@bomber-app/database';
import { US_STATES } from '@/utils/state';

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
  const [editRegion, setEditRegion] = useState<TeamFE['region']>('NW');
  const [editState, setEditState] = useState<TeamFE['state']>('TX');
  const [editHeadCoachSearch, setEditHeadCoachSearch] = useState('');
  const [editHeadCoachOptions, setEditHeadCoachOptions] = useState<
    PublicUserFE[]
  >([]);
  const [editHeadCoachID, setEditHeadCoachID] = useState<string | null>(null);

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
      setAllCoaches(users.filter((u) => u.primaryRole === 'COACH'));
      setEditHeadCoachOptions(users.filter((u) => u.primaryRole === 'COACH'));
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

  // Handlers
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

  return (
    <div className="flex justify-center items-start px-2 pt-4">
      <div className={`max-w-full w-full ${dialogOpen ? 'pr-[50px]' : ''}`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-lg bg-white/12 hover:bg-white/20 transition text-white"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
            <span className="text-2xl font-bold text-white tracking-tight">
              {team?.name ?? 'Team'}
            </span>
          </div>
          <div className="flex gap-3">
            <button
              onClick={openEditTeam}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Update Team
            </button>
            <button
              onClick={openRemoveTeam}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              Remove Team
            </button>
          </div>
        </div>

        {/* Details */}
        <div className="flex flex-wrap gap-x-12 gap-y-1 items-center mb-4 text-white/90 text-base">
          <span>
            <b>Head Coach:</b> {getHeadCoachName(team)}
          </span>
          <span>
            <b>Age Division:</b> {team?.ageGroup}
          </span>
          <span>
            <b>Location:</b> {team?.region}, {team?.state}
          </span>
          <span>
            <b>Team Code:</b> {team?.teamCode}
          </span>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mt-2 mb-6 border-b border-white/20">
          {(['roster', 'staff', 'trophies'] as const).map((name) => (
            <button
              key={name}
              onClick={() => setTab(name)}
              className={`px-3 py-2 rounded-t-lg font-semibold transition ${
                tab === name
                  ? 'text-blue-500 bg-white/10 shadow'
                  : 'text-white/60 hover:text-white'
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

        {/* Roster */}
        {tab === 'roster' && (
          <div className="bg-white/5 rounded-2xl p-5 shadow-inner">
            <div className="flex justify-between mb-3">
              <input
                placeholder="Search players…"
                value={playerSearch}
                onChange={(e) => setPlayerSearch(e.target.value)}
                className="w-72 px-4 py-2 rounded-lg bg-white/10 text-white"
              />
              <button
                onClick={openAddPlayer}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 rounded-lg text-white"
              >
                <PlusIcon className="w-5 h-5" /> Add New Player
              </button>
            </div>
            <ScrollArea className="max-h-[320px]">
              <table className="min-w-full table-auto text-white">
                <thead className="sticky top-0 bg-white/10 font-bold">
                  <tr>
                    <th className="px-4 py-3 text-left">Player</th>
                    <th className="px-4 py-3 text-left">Position</th>
                    <th className="px-4 py-3 text-left">Email</th>
                    <th className="px-4 py-3 text-left">Phone</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {team?.players.length ? (
                    team.players.map((p) => (
                      <tr key={p.id}>
                        <td className="px-4 py-3">
                          {p.user ? `${p.user.fname} ${p.user.lname}` : 'N/A'}
                        </td>
                        <td className="px-4 py-3">
                          {p.pos1} {p.pos2 && `/ ${p.pos2}`}
                        </td>
                        <td className="px-4 py-3">{p.user?.email}</td>
                        <td className="px-4 py-3">{p.user?.phone}</td>
                        <td className="px-4 py-3 text-right">
                          <button className="p-2 rounded hover:bg-white/20">
                            <PencilSquareIcon className="w-5 h-5 text-white" />
                          </button>
                          <button className="p-2 rounded hover:bg-red-600/50">
                            <TrashIcon className="w-5 h-5 text-white" />
                          </button>
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
            </ScrollArea>
          </div>
        )}

        {/* Staff */}
        {tab === 'staff' && (
          <div className="bg-white/5 rounded-2xl p-5 shadow-inner">
            <div className="flex justify-end mb-3">
              <button
                onClick={openAddCoach}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 rounded-lg text-white"
              >
                <PlusIcon className="w-5 h-5" /> Add New Coach
              </button>
            </div>
            <ScrollArea className="max-h-[320px]">
              <table className="min-w-full table-auto text-white">
                <thead className="sticky top-0 bg-white/10 font-bold">
                  <tr>
                    <th className="px-4 py-3 text-left">Coach</th>
                    <th className="px-4 py-3 text-left">Email</th>
                    <th className="px-4 py-3 text-left">Phone</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {team?.coaches.length ? (
                    team.coaches.map((c) => (
                      <tr key={c.id}>
                        <td className="px-4 py-3">
                          {c.user ? `${c.user.fname} ${c.user.lname}` : 'N/A'}
                        </td>
                        <td className="px-4 py-3">{c.user?.email}</td>
                        <td className="px-4 py-3">{c.user?.phone}</td>
                        <td className="px-4 py-3 text-right">
                          <button className="p-2 rounded hover:bg-white/20">
                            <PencilSquareIcon className="w-5 h-5 text-white" />
                          </button>
                          <button className="p-2 rounded hover:bg-red-600/50">
                            <TrashIcon className="w-5 h-5 text-white" />
                          </button>
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
            </ScrollArea>
          </div>
        )}

        {/* Trophies */}
        {tab === 'trophies' && (
          <div className="bg-white/5 rounded-2xl p-5 shadow-inner">
            <div className="flex justify-end mb-3">
              <button
                onClick={openAddTrophy}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 rounded-lg text-white"
              >
                <PlusIcon className="w-5 h-5" /> Add New Trophy
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {team?.trophyCase.length ? (
                team.trophyCase.map((t) => (
                  <div
                    key={t.id}
                    className="relative bg-white/10 rounded-xl p-5 flex flex-col items-center text-white"
                  >
                    <button
                      onClick={() => openEditTrophy(t.id, t.title, t.imageURL)}
                      className="absolute top-2 right-8 p-1 hover:bg-white/20 rounded"
                    >
                      <PencilSquareIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => openRemoveTrophy(t.id)}
                      className="absolute top-2 right-2 p-1 hover:bg-red-600/50 rounded"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                    <img
                      src={t.imageURL}
                      alt={t.title}
                      className="w-28 h-20 mb-2 rounded-lg object-contain"
                    />
                    <div className="font-semibold text-lg">{t.title}</div>
                  </div>
                ))
              ) : (
                <div className="col-span-3 text-center text-white/60 py-8">
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
                  : dialogType === 'editTeam'
                    ? 'Edit Team'
                    : dialogType === 'removeTeam'
                      ? 'Remove Team'
                      : ''
        }
      >
        {/* Add Player */}
        {dialogType === 'addPlayer' && (
          <div className="space-y-4 px-4 pb-6">
            <label className="block text-white font-semibold">
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
              className="w-full px-4 py-2 bg-white/10 text-white rounded-lg"
            />
            <ul className="max-h-40 overflow-auto bg-black/20 rounded-lg">
              {playerOptions.map((u) => (
                <li
                  key={u.id}
                  className={`px-3 py-1 cursor-pointer text-white ${
                    selectedPlayerID === u.id ? 'bg-blue-500' : ''
                  }`}
                  onClick={() => setSelectedPlayerID(u.id)}
                >
                  {u.fname} {u.lname}
                </li>
              ))}
            </ul>
            <div className="flex justify-end space-x-4 mt-6">
              <button
                onClick={handleAddPlayer}
                disabled={!selectedPlayerID}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50"
              >
                Add
              </button>
              <button
                onClick={closeDialog}
                className="px-4 py-2 bg-white/20 text-white rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Add Coach */}
        {dialogType === 'addCoach' && (
          <div className="space-y-4 px-4 pb-6">
            <label className="block text-white font-semibold">
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
              className="w-full px-4 py-2 bg-white/10 text-white rounded-lg"
            />
            <ul className="max-h-40 overflow-auto bg-black/20 rounded-lg">
              {coachOptions.map((u) => (
                <li
                  key={u.id}
                  className={`px-3 py-1 cursor-pointer text-white ${
                    selectedCoachID === u.id ? 'bg-blue-500' : ''
                  }`}
                  onClick={() => setSelectedCoachID(u.id)}
                >
                  {u.fname} {u.lname}
                </li>
              ))}
            </ul>
            <div className="flex justify-end space-x-4 mt-6">
              <button
                onClick={handleAddCoach}
                disabled={!selectedCoachID}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50"
              >
                Add
              </button>
              <button
                onClick={closeDialog}
                className="px-4 py-2 bg-white/20 text-white rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Add / Edit Trophy */}
        {(dialogType === 'addTrophy' || dialogType === 'editTrophy') && (
          <div className="space-y-4 px-4 pb-6">
            <label className="block text-white font-semibold">Title</label>
            <input
              type="text"
              value={trophyTitle}
              onChange={(e) => setTrophyTitle(e.target.value)}
              className="w-full px-4 py-2 bg-white/10 text-white rounded-lg"
            />
            <label className="block text-white font-semibold">Image URL</label>
            <input
              type="text"
              value={trophyImageURL}
              onChange={(e) => setTrophyImageURL(e.target.value)}
              className="w-full px-4 py-2 bg-white/10 text-white rounded-lg"
            />

            {(trophyTitle || trophyImageURL) && (
              <div className="mt-6 flex flex-col items-center space-y-2">
                {/* Preview Card */}
                <div className="bg-white/10 rounded-2xl w-[50%] h-30 overflow-hidden">
                  {trophyImageURL ? (
                    <img
                      src={trophyImageURL}
                      alt={trophyTitle || 'Preview'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-white/20 flex items-center justify-center text-white/50">
                      No image
                    </div>
                  )}
                </div>

                {/* Title Below */}
                <h3 className="text-white font-semibold text-base">
                  {trophyTitle || 'Your Trophy Title'}
                </h3>
              </div>
            )}

            <div className="flex justify-end space-x-4 mt-6">
              <button
                onClick={handleSaveTrophy}
                disabled={!trophyTitle || !trophyImageURL}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50"
              >
                {dialogType === 'addTrophy' ? 'Add' : 'Save'}
              </button>
              <button
                onClick={closeDialog}
                className="px-4 py-2 bg-white/20 text-white rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Remove Trophy */}
        {dialogType === 'removeTrophy' && editingTrophyId && (
          <div className="px-4 pb-6">
            <p className="text-white">Delete this trophy?</p>
            <div className="flex justify-end space-x-4 mt-6">
              <button
                onClick={closeDialog}
                className="px-4 py-2 bg-white/20 text-white rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteTrophy}
                className="px-4 py-2 bg-red-600 text-white rounded-lg"
              >
                Delete
              </button>
            </div>
          </div>
        )}

        {/* Edit Team */}
        {dialogType === 'editTeam' && team && (
          <div className="space-y-4 px-4 pb-6">
            <label className="block text-white font-semibold">Team Name</label>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full px-4 py-2 bg-white/10 text-white rounded-lg"
            />
            <label className="block text-white font-semibold">Age Group</label>
            <select
              value={editAgeGroup}
              onChange={(e) => setEditAgeGroup(e.target.value as any)}
              className="w-full px-4 py-2 bg-white/10 text-white rounded-lg"
            >
              {['U8', 'U10', 'U12', 'U14', 'U16', 'U18', 'ALUMNI'].map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
            <label className="block text-white font-semibold">Region</label>
            <select
              value={editRegion}
              onChange={(e) => setEditRegion(e.target.value as any)}
              className="w-full px-4 py-2 bg-white/10 text-white rounded-lg"
            >
              {['NW', 'SW', 'S', 'SE', 'NE', 'MW'].map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            <label className="block text-white font-semibold">State</label>
            <select
              value={editState}
              onChange={(e) => setEditState(e.target.value as any)}
              className="w-full px-4 py-2 bg-white/10 text-white rounded-lg"
            >
              {US_STATES.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <label className="block text-white font-semibold">Head Coach</label>
            <input
              type="text"
              placeholder="Search coaches..."
              value={editHeadCoachSearch}
              onChange={(e) => {
                setEditHeadCoachSearch(e.target.value);
                setEditHeadCoachID(null);
              }}
              className="w-full px-4 py-2 bg-white/10 text-white rounded-lg"
            />
            <ul className="max-h-40 overflow-auto bg-black/20 rounded-lg">
              <li
                className={`px-3 py-1 cursor-pointer ${
                  editHeadCoachID === null ? 'bg-blue-500' : ''
                }`}
                onClick={() => setEditHeadCoachID(null)}
              >
                — none —
              </li>
              {editCoachOptionsFiltered.map((u) => (
                <li
                  key={u.id}
                  className={`px-3 py-1 cursor-pointer ${
                    editHeadCoachID === u.id ? 'bg-blue-500' : ''
                  }`}
                  onClick={() => setEditHeadCoachID(u.id)}
                >
                  {u.fname} {u.lname}
                </li>
              ))}
            </ul>
            <div className="flex justify-end space-x-4 mt-6">
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg"
              >
                Save
              </button>
              <button
                onClick={closeDialog}
                className="px-4 py-2 bg-white/20 text-white rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Remove Team */}
        {dialogType === 'removeTeam' && team && (
          <div className="px-4 pb-6">
            <p className="text-white">
              Are you sure you want to remove <b>{team.name}</b>?
            </p>
            <div className="flex justify-end space-x-4 mt-6">
              <button
                onClick={closeDialog}
                className="px-4 py-2 bg-white/20 text-white rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteTeam}
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
