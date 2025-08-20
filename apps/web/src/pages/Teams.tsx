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
    region: 'TEXAS',
    state: 'TX',
    headCoachUserID: null,
  });

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
          </div>
        </div>

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
          </div>
        )}
      </div>

      {/* SideDialog (unchanged logic/colors) */}
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
              {['U8', 'U10', 'U12', 'U14', 'U16', 'U18', 'ALUMNI'].map((a) => (
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

        {/* EDIT FORM */}
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
              {['U8', 'U10', 'U12', 'U14', 'U16', 'U18', 'ALUMNI'].map((a) => (
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
              {['NW', 'SW', 'S', 'SE', 'NE', 'MW'].map((r) => (
                <option key={r} value={r} className="text-black">
                  {r}
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
                setSelectedTeam((t) => t && { ...t, headCoachUserID: null });
              }}
              className="w-full px-4 py-2 bg-white/10 text-white rounded-lg"
            />
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
          </div>
        )}

        {/* DELETE CONFIRM */}
        {dialogType === 'delete' && selectedTeam && (
          <div>
            <p className="text-white">
              Are you sure you want to remove the Team{' '}
              <b className=" uppercase text-red-800">{selectedTeam.name}</b>?
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
