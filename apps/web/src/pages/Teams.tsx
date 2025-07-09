import React, { useState, useEffect } from 'react';
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
import SideDialog from '@/components/sideDialog';
import { fetchTeams } from '@/api/team';
import type { TeamFE } from '@bomber-app/database/types/team';

export default function Teams() {
  const navigate = useNavigate();
  const [teams, setTeams] = useState<TeamFE[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
  const [search, setSearch] = useState('');
  const [ageFilter, setAgeFilter] = useState('all');
  const [stateFilter, setStateFilter] = useState('all');

  // Dialog State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<
    'create' | 'edit' | 'delete' | null
  >(null);
  const [selectedTeam, setSelectedTeam] = useState<TeamFE | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchTeams()
      .then((data) => setTeams(data))
      .catch(() => setTeams([]))
      .finally(() => setLoading(false));
  }, []);

  // Filter teams
  const filtered = teams.filter((t) => {
    // Head coach name (might be null if missing)
    const coachName = t.headCoach?.user
      ? `${t.headCoach.user.fname} ${t.headCoach.user.lname}`
      : '';
    return (
      (t.name.toLowerCase().includes(search.toLowerCase()) ||
        coachName.toLowerCase().includes(search.toLowerCase())) &&
      (ageFilter === 'all' || t.ageGroup === ageFilter) &&
      (stateFilter === 'all' ||
        t.players.some((p) => p.user?.player?.address?.state === stateFilter))
    );
  });

  // Dialog Handlers
  const handleOpenCreate = () => {
    setDialogType('create');
    setSelectedTeam(null);
    setDialogOpen(true);
  };
  const handleOpenEdit = (team: TeamFE) => {
    setDialogType('edit');
    setSelectedTeam(team);
    setDialogOpen(true);
  };
  const handleOpenDelete = (team: TeamFE) => {
    setDialogType('delete');
    setSelectedTeam(team);
    setDialogOpen(true);
  };
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedTeam(null);
    setDialogType(null);
  };

  // Get unique list of states from teams (for state filter dropdown)
  const stateOptions = Array.from(
    new Set(
      teams.flatMap((t) =>
        t.players.map((p) => p.user?.player?.address?.state).filter(Boolean)
      )
    )
  ).filter(Boolean) as string[];

  return (
    <div className="flex flex-row h-full min-h-screen bg-transparent relative">
      <div
        className={`flex-1 flex flex-col space-y-6 transition-all duration-300 ${dialogOpen ? 'pr-[50px]' : ''}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 text-white hover:bg-[rgba(255,255,255,0.2)] transition"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold text-white">Bomber Teams</h1>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={handleOpenCreate}
              className="flex items-center space-x-2 px-4 py-2 bg-[rgba(255,255,255,0.15)] backdrop-blur-lg border border-white/30 text-white rounded-full hover:bg-[#5AA5FF] hover:border-[#5AA5FF] transition"
            >
              <UserGroupIcon className="w-5 h-5" />
              <span className="font-medium">Add New Team</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-lg transition ${viewMode === 'table' ? 'bg-[#5AA5FF] text-white' : 'bg-[rgba(255,255,255,0.1)] text-white/70 hover:bg-[rgba(255,255,255,0.2)]'}`}
            >
              <TableCellsIcon className="w-6 h-6" />
            </button>
            <button
              onClick={() => setViewMode('card')}
              className={`p-2 rounded-lg transition ${viewMode === 'card' ? 'bg-[#5AA5FF] text-white' : 'bg-[rgba(255,255,255,0.1)] text-white/70 hover:bg-[rgba(255,255,255,0.2)]'}`}
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
            className="w-64 px-4 py-2 bg-[rgba(255,255,255,0.05)] text-white placeholder-white/70 rounded-lg focus:outline-none"
          />
          <div className="flex items-center bg-[rgba(255,255,255,0.05)] rounded-lg backdrop-blur-lg border border-white/30">
            <select
              value={ageFilter}
              onChange={(e) => setAgeFilter(e.target.value)}
              className="px-3 py-2 bg-transparent text-white focus:outline-none"
            >
              <option value="all" className="text-black">
                All Ages
              </option>
              {['U8', 'U10', 'U12', 'U14', 'U16', 'U18', 'ALUMNI'].map((a) => (
                <option key={a} value={a} className="text-black">
                  {a}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center bg-[rgba(255,255,255,0.05)] rounded-lg backdrop-blur-lg border border-white/30">
            <select
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
              className="px-3 py-2 bg-transparent text-white focus:outline-none"
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
          </div>
        </div>

        {/* Card View */}
        {viewMode === 'card' && (
          <div className="grid grid-cols-3 gap-6">
            {filtered.map((t) => (
              <div
                key={t.id}
                className="bg-[rgba(255,255,255,0.05)] backdrop-blur-lg rounded-2xl shadow-inner hover:shadow-md transition overflow-hidden"
              >
                <div className="h-2 bg-gradient-to-r from-[#5AA5FF] to-[#3C8CE7]" />
                <div className="p-6 space-y-4 text-white">
                  <h3 className="text-xl font-bold">{t.name}</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <UserGroupIcon className="w-5 h-5 text-[#5AA5FF]" />
                      <span>
                        {t.headCoach?.user ? (
                          `${t.headCoach.user.fname} ${t.headCoach.user.lname}`
                        ) : (
                          <span className="italic text-white/50">N/A</span>
                        )}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapIcon className="w-5 h-5 text-[#5AA5FF]" />
                      <span>
                        {t.players[0]?.user?.player?.address?.state ?? (
                          <span className="italic text-white/50">N/A</span>
                        )}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CalendarDaysIcon className="w-5 h-5 text-[#5AA5FF]" />
                      <span>{t.ageGroup}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPinIcon className="w-5 h-5 text-[#5AA5FF]" />
                      <span>{t.region}</span>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <button
                      className="p-2 bg-[rgba(255,255,255,0.15)] backdrop-blur-lg rounded-lg hover:bg-[#5AA5FF] transition"
                      onClick={() => handleOpenEdit(t)}
                    >
                      <PencilSquareIcon className="w-5 h-5 text-white" />
                    </button>
                    <button
                      className="p-2 bg-red-600 bg-opacity-80 rounded-lg hover:bg-red-500 transition"
                      onClick={() => handleOpenDelete(t)}
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
          <div className="bg-[rgba(255,255,255,0.05)] backdrop-blur-lg rounded-2xl overflow-auto shadow-inner">
            <ScrollArea className="h-full">
              <table className="min-w-full table-auto text-white">
                <thead className="sticky top-0 bg-[rgba(255,255,255,0.1)] text-[#5AA5FF]">
                  <tr>
                    <th className="px-6 py-4 text-left text-white">
                      Team Name
                    </th>
                    <th className="px-6 py-4 text-left text-white">Coach</th>
                    <th className="px-6 py-4 text-left text-white">State</th>
                    <th className="px-6 py-4 text-left text-white">Age</th>
                    <th className="px-6 py-4 text-left text-white">Region</th>
                    <th className="px-6 py-4 text-right text-white">Actions</th>
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
                        className="hover:bg-[rgba(255,255,255,0.1)]"
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
                          {t.players[0]?.user?.player?.address?.state ?? (
                            <span className="italic text-white/50">N/A</span>
                          )}
                        </td>
                        <td className="px-6 py-3">{t.ageGroup}</td>
                        <td className="px-6 py-3">{t.region}</td>
                        <td className="px-6 py-3 text-right space-x-2">
                          <button
                            className="p-2 bg-[rgba(255,255,255,0.15)] backdrop-blur-lg rounded-lg hover:bg-[#5AA5FF] transition"
                            onClick={() => handleOpenEdit(t)}
                          >
                            <PencilSquareIcon className="w-5 h-5 text-white" />
                          </button>
                          <button
                            className="p-2 bg-red-600 bg-opacity-80 rounded-lg hover:bg-red-500 transition"
                            onClick={() => handleOpenDelete(t)}
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

      {/* SideDialog Panel */}
      <SideDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        title={
          dialogType === 'create'
            ? 'Add Team'
            : dialogType === 'edit'
              ? 'Edit Team'
              : dialogType === 'delete'
                ? 'Remove Team'
                : ''
        }
        widthClass="w-[430px] max-w-[430px] min-w-[340px]"
      >
        {dialogType === 'create' && (
          <div>
            {/* Add team form fields here */}
            <p className="text-white">[Add Team Form]</p>
          </div>
        )}
        {dialogType === 'edit' && selectedTeam && (
          <div>
            {/* Edit team form fields */}
            <p className="text-white">[Edit Team: {selectedTeam.name}]</p>
          </div>
        )}
        {dialogType === 'delete' && selectedTeam && (
          <div>
            <p className="text-white">
              Are you sure you want to remove <b>{selectedTeam.name}</b>?
            </p>
            <div className="flex space-x-4 mt-6">
              <button
                className="px-4 py-2 bg-[#5AA5FF] text-white rounded-lg hover:bg-[#3C8CE7] transition"
                onClick={handleCloseDialog}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500 transition"
                onClick={handleCloseDialog}
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
