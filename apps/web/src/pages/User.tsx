import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  PencilSquareIcon,
  TrashIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import { ScrollArea } from '@/components/ui/scroll-area';
import SideDialog from '@/components/sideDialog';
import { fetchUsers } from '@/api/user';
import type { PublicUserFE } from '@bomber-app/database/types/user';

const ALL_ROLES = [
  'ALL',
  'ADMIN',
  'COACH',
  'REGIONAL_COACH',
  'PLAYER',
  'PARENT',
  'FAN',
] as const;

export default function Users() {
  const navigate = useNavigate();

  // API + pagination
  const [users, setUsers] = useState<PublicUserFE[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Filters
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] =
    useState<(typeof ALL_ROLES)[number]>('ALL');

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<
    'create' | 'edit' | 'delete' | null
  >(null);
  const [selectedUser, setSelectedUser] = useState<PublicUserFE | null>(null);

  // Pagination constants
  const PAGE_SIZE = 10;

  // Fetch users with filters/pagination
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Get all users and filter on client for demo; for real backend use, add query params
        const allUsers = await fetchUsers();

        // Filter by role
        let filtered = allUsers;
        if (roleFilter !== 'ALL') {
          filtered = filtered.filter(
            (u: { primaryRole: string }) => u.primaryRole === roleFilter
          );
        }
        // Filter by search
        if (search) {
          const q = search.toLowerCase();
          filtered = filtered.filter(
            (u: { fname: any; lname: any; email: string }) =>
              `${u.fname} ${u.lname}`.toLowerCase().includes(q) ||
              u.email?.toLowerCase().includes(q)
          );
        }
        setTotalCount(filtered.length);

        // Paginate
        const paginated = filtered.slice(
          (page - 1) * PAGE_SIZE,
          page * PAGE_SIZE
        );
        setUsers(paginated);
      } catch (err) {
        setUsers([]);
        setTotalCount(0);
      }
      setLoading(false);
    };
    fetchData();
  }, [search, roleFilter, page]);

  // Dialog handlers
  const handleOpenCreate = () => {
    setDialogType('create');
    setSelectedUser(null);
    setDialogOpen(true);
  };
  const handleOpenEdit = (user: PublicUserFE) => {
    setDialogType('edit');
    setSelectedUser(user);
    setDialogOpen(true);
  };
  const handleOpenDelete = (user: PublicUserFE) => {
    setDialogType('delete');
    setSelectedUser(user);
    setDialogOpen(true);
  };
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedUser(null);
    setDialogType(null);
  };

  // Pagination controls
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  return (
    <div className="flex relative min-h-screen">
      <div
        className={`flex-1 flex flex-col space-y-6 transition-all duration-300 ${dialogOpen ? 'pr-[50px]' : ''}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 bg-[rgba(255,255,255,0.1)] backdrop-blur-lg rounded-lg text-white hover:bg-[rgba(255,255,255,0.2)] transition"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold text-white">Manage Users</h1>
          </div>
          <button
            onClick={handleOpenCreate}
            className="flex items-center space-x-2 px-4 py-2 bg-[rgba(255,255,255,0.15)] backdrop-blur-lg border border-white/30 rounded-full text-white hover:bg-[#5AA5FF] hover:border-[#5AA5FF] transition"
          >
            <UserIcon className="w-5 h-5" />
            <span className="font-medium">Add New User</span>
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4">
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
            placeholder="Search users..."
            className="w-64 px-4 py-2 bg-[rgba(255,255,255,0.05)] placeholder-white/70 text-white rounded-lg focus:outline-none"
          />
          <div className="flex items-center bg-[rgba(255,255,255,0.05)] backdrop-blur-lg border border-white/30 rounded-lg">
            <select
              value={roleFilter}
              onChange={(e) => {
                setPage(1);
                setRoleFilter(e.target.value as (typeof ALL_ROLES)[number]);
              }}
              className="px-3 py-2 bg-transparent text-white focus:outline-none"
            >
              <option value="ALL" className="text-black">
                All Roles
              </option>
              {ALL_ROLES.filter((r) => r !== 'ALL').map((r) => (
                <option key={r} value={r} className="text-black">
                  {r.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* User Table */}
        <div className="bg-[rgba(255,255,255,0.05)] backdrop-blur-lg rounded-2xl overflow-hidden shadow-inner">
          <ScrollArea className="h-full">
            <table className="min-w-full table-auto text-white">
              <thead className="sticky top-0 bg-[rgba(255,255,255,0.1)] text-[#5AA5FF]">
                <tr>
                  <th className="px-6 py-3 text-left text-white">Name</th>
                  <th className="px-6 py-3 text-left text-white">Email</th>
                  <th className="px-6 py-3 text-left text-white">Role</th>
                  <th className="px-6 py-3 text-left text-white">Team/Info</th>
                  <th className="px-6 py-3 text-right text-white">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-10 text-center text-white/60"
                    >
                      Loading...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-10 text-center text-white/60"
                    >
                      No users found.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr
                      key={u.id}
                      className="hover:bg-[rgba(255,255,255,0.1)] transition-colors"
                    >
                      <td className="px-6 py-3">
                        {u.fname} {u.lname}
                      </td>
                      <td className="px-6 py-3">{u.email}</td>
                      <td className="px-6 py-3">
                        <span className="inline-block bg-[#5AA5FF] text-white text-xs font-medium px-2 py-0.5 rounded-full">
                          {u.primaryRole.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        {u.player ? (
                          <>
                            <span className="font-semibold">Player:</span>{' '}
                            {u.player.pos1}, {u.player.pos2} <br />
                            <span className="text-xs text-white/70">
                              Team: {u.player.team?.name ?? '-'}
                            </span>
                          </>
                        ) : u.coach ? (
                          <>
                            <span className="font-semibold">Coach:</span> <br />
                            <span className="text-xs text-white/70">
                              Teams:{' '}
                              {u.coach.teams.map((t) => t.name).join(', ') ||
                                '-'}
                            </span>
                          </>
                        ) : (
                          <span className="text-xs text-white/60">—</span>
                        )}
                      </td>
                      <td className="px-6 py-3 text-right space-x-2">
                        <button
                          className="p-2 bg-[rgba(255,255,255,0.15)] backdrop-blur-lg rounded-lg text-white hover:bg-[#5AA5FF] transition"
                          onClick={() => handleOpenEdit(u)}
                        >
                          <PencilSquareIcon className="w-5 h-5" />
                        </button>
                        <button
                          className="p-2 bg-red-600 bg-opacity-80 rounded-lg text-white hover:bg-red-500 transition"
                          onClick={() => handleOpenDelete(u)}
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </ScrollArea>
        </div>

        {/* Pagination */}
        <div className="flex justify-center items-center mt-4 space-x-2">
          <button
            className="px-3 py-1 rounded bg-[#5AA5FF] text-white disabled:bg-[#5AA5FF]/40"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Prev
          </button>
          <span className="text-white/80">
            {page} / {totalPages}
          </span>
          <button
            className="px-3 py-1 rounded bg-[#5AA5FF] text-white disabled:bg-[#5AA5FF]/40"
            onClick={() => setPage((p) => (p < totalPages ? p + 1 : p))}
            disabled={page === totalPages || totalPages === 0}
          >
            Next
          </button>
        </div>
      </div>

      {/* SideDialog */}
      <SideDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        title={
          dialogType === 'create'
            ? 'Add User'
            : dialogType === 'edit'
              ? 'Edit User'
              : dialogType === 'delete'
                ? 'Remove User'
                : ''
        }
      >
        {dialogType === 'create' && (
          <div>
            <p className="text-white">[Add User Form]</p>
          </div>
        )}
        {dialogType === 'edit' && selectedUser && (
          <div>
            <p className="text-white">
              [Edit User: {selectedUser.fname} {selectedUser.lname}]
            </p>
          </div>
        )}
        {dialogType === 'delete' && selectedUser && (
          <div>
            <p className="text-white">
              Are you sure you want to remove{' '}
              <b>
                {selectedUser.fname} {selectedUser.lname}
              </b>
              ?
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
