// apps/web/src/pages/Teams.tsx
import { useState, useEffect } from 'react';
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
} from '@heroicons/react/24/outline';
import { ScrollArea } from '@/components/ui/scroll-area';
import SideDialog from '@/components/SideDialog';
import { fetchTeams, createTeam, updateTeam, deleteTeam } from '@/api/team';
import { fetchUsers } from '@/api/user';
import type { TeamFE } from '@bomber-app/database/types/team';
import { US_STATES } from '@/utils/state';
import type { CreateTeamDTO, UpdateTeamDTO } from '@/api/team';
import { PublicUserFE, Regions } from '@bomber-app/database';

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

  // --- Filters & view mode ---
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
  const [search, setSearch] = useState('');
  const [ageFilter, setAgeFilter] = useState<'all' | TeamFE['ageGroup']>('all');
  const [stateFilter, setStateFilter] = useState<'all' | string>('all');

  // --- Head coach users for dropdown ---
  const [allUsers, setAllUsers] = useState<PublicUserFE[]>([]);
  const [coachSearch, setCoachSearch] = useState('');
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
    region: 'NW',
    state: 'TX',
    headCoachUserID: null,
  });

  // --- Open/close helpers ---
  function openCreate() {
    setDialogType('create');
    setNewTeam({
      name: '',
      ageGroup: 'U8',
      region: 'NW',
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
  }

  // --- Filtered list ---
  const filtered = teams.filter((t) => {
    const coachName = t.headCoach?.user
      ? `${t.headCoach.user.fname} ${t.headCoach.user.lname}`.toLowerCase()
      : '';
    return (
      (t.name.toLowerCase().includes(search.toLowerCase()) ||
        coachName.includes(search.toLowerCase())) &&
      (ageFilter === 'all' || t.ageGroup === ageFilter) &&
      (stateFilter === 'all' ||
        t.players.some((p) => p.user?.player?.address?.state === stateFilter))
    );
  });
  const stateOptions = Array.from(
    new Set(
      teams.flatMap(
        (t) =>
          t.players
            .map((p) => p.user?.player?.address?.state)
            .filter(Boolean) as string[]
      )
    )
  );

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
      headCoachUserID: selectedTeam.headCoachID ?? null,
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

  return (
    <div className="flex flex-row bg-transparent relative">
      <div
        className={`flex-1 flex flex-col space-y-6 ${dialogOpen ? 'pr-[50px]' : ''}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 text-white hover:bg-white/10 rounded"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold text-white">Bomber Teams</h1>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={openCreate}
              className="flex items-center space-x-2 px-4 py-2 bg-white/15 backdrop-blur-lg border border-white/30 text-white rounded-full hover:bg-blue-500 transition"
            >
              <UserGroupIcon className="w-5 h-5" />
              <span>Add New Team</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-lg transition ${viewMode === 'table' ? 'bg-blue-500 text-white' : 'bg-white/10 text-white/70'}`}
            >
              <TableCellsIcon className="w-6 h-6" />
            </button>
            <button
              onClick={() => setViewMode('card')}
              className={`p-2 rounded-lg transition ${viewMode === 'card' ? 'bg-blue-500 text-white' : 'bg-white/10 text-white/70'}`}
            >
              <Squares2X2Icon className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4">
          <input
            type="text"
            placeholder="Search for team or coach..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64 px-4 py-2 bg-white/10 text-white placeholder-white/70 rounded-lg"
          />
          <select
            value={ageFilter}
            onChange={(e) => setAgeFilter(e.target.value as any)}
            className="px-3 py-2 bg-white/10 text-white rounded-lg"
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
            className="px-3 py-2 bg-white/10 text-white rounded-lg"
          >
            <option value="all">All States</option>
            {stateOptions.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* Card View */}
        {viewMode === 'card' && (
          <div className="grid grid-cols-3 gap-6">
            {filtered.map((t) => (
              <div
                key={t.id}
                className="bg-white/5 backdrop-blur-lg rounded-2xl shadow-inner hover:shadow-md transition cursor-pointer"
                onClick={() => navigate(`/teams/${t.id}`)}
              >
                <div className="h-2 bg-gradient-to-r from-blue-500 to-blue-300" />
                <div className="p-6 space-y-4 text-white">
                  <h3 className="text-xl font-bold">{t.name}</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <UserGroupIcon className="w-5 h-5 text-blue-500" />
                      <span>
                        {t.headCoach?.user ? (
                          `${t.headCoach.user.fname} ${t.headCoach.user.lname}`
                        ) : (
                          <span className="italic text-white/50">N/A</span>
                        )}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapIcon className="w-5 h-5 text-blue-500" />
                      <span>
                        {t.state ?? (
                          <span className="italic text-white/50">N/A</span>
                        )}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CalendarDaysIcon className="w-5 h-5 text-blue-500" />
                      <span>{t.ageGroup}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPinIcon className="w-5 h-5 text-blue-500" />
                      <span>{t.region}</span>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2">
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
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl overflow-auto shadow-inner">
            <ScrollArea className="h-full">
              <table className="min-w-full table-auto text-white">
                <thead className="sticky top-0 bg-white/10">
                  <tr>
                    <th className="px-6 py-4 text-left">Team Name</th>
                    <th className="px-6 py-4 text-left">Coach</th>
                    <th className="px-6 py-4 text-left">State</th>
                    <th className="px-6 py-4 text-left">Age</th>
                    <th className="px-6 py-4 text-left">Region</th>
                    <th className="px-6 py-4 text-right">Actions</th>
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
                        <td className="px-6 py-3">{t.name}</td>
                        <td className="px-6 py-3">
                          {t.headCoach?.user ? (
                            `${t.headCoach.user.fname} ${t.headCoach.user.lname}`
                          ) : (
                            <span className="italic text-white/50">N/A</span>
                          )}
                        </td>
                        <td className="px-6 py-3">
                          {t.state ?? (
                            <span className="italic text-white/50">N/A</span>
                          )}
                        </td>
                        <td className="px-6 py-3">{t.ageGroup}</td>
                        <td className="px-6 py-3">{t.region}</td>
                        <td className="px-6 py-3 text-right space-x-2">
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
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </ScrollArea>
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
        {/* CREATE FORM */}
        {dialogType === 'create' && (
          <div className="space-y-4">
            {/* Team Name */}
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

            {/* Age Group */}
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
              {['U8', 'U10', 'U12', 'U14', 'U16', 'U18', 'ALUMNI'].map((a) => (
                <option key={a} value={a} className="text-black">
                  {a}
                </option>
              ))}
            </select>

            {/* Region */}
            <label className="block text-sm text-white font-semibold">
              Region
            </label>
            <select
              value={newTeam.region}
              onChange={(e) =>
                setNewTeam((t) => ({ ...t, region: e.target.value }))
              }
              className="w-full px-4 py-2 bg-white/10 text-white rounded-lg"
            >
              {['NW', 'SW', 'S', 'SE', 'NE', 'MW'].map((r) => (
                <option key={r} value={r} className="text-black">
                  {r}
                </option>
              ))}
            </select>

            {/* State */}
            <label className="block text-sm text-white font-semibold">
              State
            </label>
            <select
              value={newTeam.state}
              onChange={(e) =>
                setNewTeam((t) => ({ ...t, state: e.target.value }))
              }
              className="w-full px-4 py-2 bg-white/10 text-white rounded-lg"
            >
              {US_STATES.map(({ value, label }) => (
                <option key={value} value={value} className="text-black">
                  {label}
                </option>
              ))}
            </select>

            {/* Head Coach */}
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
            <ul className="max-h-32 overflow-auto bg-black/20 rounded-lg">
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

            <div className="flex space-x-4 mt-6">
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

        {/* EDIT FORM */}
        {dialogType === 'edit' && selectedTeam && (
          <div className="space-y-4">
            {/* Team Name */}
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

            {/* Age Group */}
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
              {['U8', 'U10', 'U12', 'U14', 'U16', 'U18', 'ALUMNI'].map((a) => (
                <option key={a} value={a} className="text-black">
                  {a}
                </option>
              ))}
            </select>

            {/* Region */}
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
              {['NW', 'SW', 'S', 'SE', 'NE', 'MW'].map((r) => (
                <option key={r} value={r} className="text-black">
                  {r}
                </option>
              ))}
            </select>

            {/* State */}
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

            {/* Head Coach */}
            <label className="block text-sm text-white font-semibold">
              Head Coach
            </label>
            <input
              type="text"
              placeholder="Search coach..."
              value={coachSearch}
              onChange={(e) => {
                setCoachSearch(e.target.value);
                setSelectedTeam((t) => t && { ...t, headCoachUserID: null });
              }}
              className="w-full px-4 py-2 bg-white/10 text-white rounded-lg"
            />
            <ul className="max-h-32 overflow-auto bg-black/20 rounded-lg">
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

            <div className="flex space-x-4 mt-6">
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

        {/* DELETE CONFIRM */}
        {dialogType === 'delete' && selectedTeam && (
          <div>
            <p className="text-white">
              Are you sure you want to remove the Team{' '}
              <b className=" uppercase text-red-800">{selectedTeam.name}</b>?
            </p>
            <div className="flex space-x-4 mt-6">
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
