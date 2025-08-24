// apps/web/src/pages/Users.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  PencilSquareIcon,
  TrashIcon,
  UserIcon,
  ArrowsUpDownIcon,
  ArrowDownTrayIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';

import {
  fetchUsers,
  createUser,
  updateUser,
  deleteUser,
  CreateUserInput,
} from '@/api/user';
import type { PublicUserFE } from '@bomber-app/database/types/user';

import SideDialog from '@/components/SideDialog';
import { createOrUpdateRegCoach, deleteRegCoach } from '@/api/regCoach';

import { useToast } from '@/context/ToastProvider';
import { exportCSV, exportXLS, type ColumnDef } from '@/utils/exporter';

const ALL_ROLES = [
  'ALL',
  'ADMIN',
  'COACH',
  'REGIONAL_COACH',
  'PLAYER',
  'PARENT',
  'FAN',
] as const;

const REGIONS = [
  'ACADEMY',
  'PACIFIC',
  'MOUNTAIN',
  'MIDWEST',
  'NORTHEAST',
  'SOUTHEAST',
  'TEXAS',
] as const;

// ---- Sorting (multi) ----
type SortKey = 'name' | 'email' | 'role';
type SortDir = 'asc' | 'desc';
type SortRule = { key: SortKey; dir: SortDir };

export default function Users() {
  const navigate = useNavigate();
  const { addToast } = useToast();

  // Raw data + UI state
  const [all, setAll] = useState<PublicUserFE[]>([]);
  const [users, setUsers] = useState<PublicUserFE[]>([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] =
    useState<(typeof ALL_ROLES)[number]>('ALL');

  // Sorting (default similar to Teams: Role → Name)
  const [sortRules, setSortRules] = useState<SortRule[]>([
    { key: 'role', dir: 'asc' },
    { key: 'name', dir: 'asc' },
  ]);

  // Pagination
  const PAGE_SIZE = 10;
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<
    'create' | 'edit' | 'delete' | null
  >(null);
  const [selectedUser, setSelectedUser] = useState<PublicUserFE | null>(null);

  // Export dropdown
  const [exportOpen, setExportOpen] = useState(false);

  // Fetch once
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await fetchUsers();
        setAll(data);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Helpers: sorting
  function toggleSort(key: SortKey) {
    setSortRules((prev) => {
      const idx = prev.findIndex((r) => r.key === key);
      if (idx === -1) return [...prev, { key, dir: 'asc' }];
      const nextDir = prev[idx].dir === 'asc' ? 'desc' : null;
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
  function getSortable(u: PublicUserFE, key: SortKey): string {
    if (key === 'name') return `${u.fname ?? ''} ${u.lname ?? ''}`.trim();
    if (key === 'email') return u.email ?? '';
    return u.primaryRole ?? '';
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

  // Derive: filtered → sorted → paginated
  const { filteredAll, pageItems, totalPages } = useMemo(() => {
    let list = all;

    if (roleFilter !== 'ALL')
      list = list.filter((u) => u.primaryRole === roleFilter);

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (u) =>
          `${u.fname} ${u.lname}`.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q)
      );
    }

    if (sortRules.length) {
      list = [...list].sort((a, b) => {
        for (const { key, dir } of sortRules) {
          const A = getSortable(a, key);
          const B = getSortable(b, key);
          const cmp = A.localeCompare(B);
          if (cmp !== 0) return dir === 'asc' ? cmp : -cmp;
        }
        return 0;
      });
    }

    const total = list.length;
    const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    const start = (page - 1) * PAGE_SIZE;
    const slice = list.slice(start, start + PAGE_SIZE);

    return { filteredAll: list, pageItems: slice, totalPages: pages };
  }, [all, roleFilter, search, sortRules, page]);

  useEffect(() => {
    setUsers(pageItems);
    setTotalCount(filteredAll.length);
  }, [pageItems, filteredAll]);

  // Export columns
  const columns: ColumnDef<PublicUserFE>[] = [
    { header: 'Name', accessor: (u) => `${u.fname} ${u.lname}`.trim() },
    { header: 'Email', accessor: (u) => u.email },
    { header: 'Role', accessor: (u) => u.primaryRole },
    {
      header: 'Teams',
      accessor: (u) =>
        u.coach?.teams?.map((t) => t.name).join(', ') ||
        u.player?.team?.name ||
        '',
    },
  ];

  // Dialog helpers
  const openCreate = () => {
    setDialogType('create');
    setSelectedUser(null);
    setDialogOpen(true);
  };
  const openEdit = (u: PublicUserFE) => {
    setDialogType('edit');
    setSelectedUser(u);
    setDialogOpen(true);
  };
  const openDelete = (u: PublicUserFE) => {
    setDialogType('delete');
    setSelectedUser(u);
    setDialogOpen(true);
  };
  const closeDialog = () => {
    setDialogOpen(false);
    setDialogType(null);
    setSelectedUser(null);
  };

  // Forms
  const CreateForm = () => {
    const [form, setForm] = useState<CreateUserInput>({
      fname: '',
      lname: '',
      email: '',
      pass: '',
      phone: '',
      primaryRole: 'PLAYER',
    });

    const onSave = async () => {
      const created = await createUser(form);
      if (created) {
        setAll((u) => [created, ...u]); // add to raw
        closeDialog();
        addToast('User created', 'success');
      }
    };

    return (
      <div className="space-y-4">
        <Field label="First Name">
          <input
            type="text"
            placeholder="First Name"
            value={form.fname}
            onChange={(e) => setForm({ ...form, fname: e.target.value })}
            className="w-full px-4 py-2 bg-white/10 text-white rounded-lg"
          />
        </Field>
        <Field label="Last Name">
          <input
            type="text"
            placeholder="Last Name"
            value={form.lname}
            onChange={(e) => setForm({ ...form, lname: e.target.value })}
            className="w-full px-4 py-2 bg-white/10 text-white rounded-lg"
          />
        </Field>
        <Field label="Email">
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full px-4 py-2 bg-white/10 text-white rounded-lg"
          />
        </Field>
        <Field label="Password">
          <input
            type="password"
            placeholder="Password"
            value={form.pass}
            onChange={(e) => setForm({ ...form, pass: e.target.value })}
            className="w-full px-4 py-2 bg-white/10 text-white rounded-lg"
          />
        </Field>
        <Field label="Phone">
          <input
            type="text"
            placeholder="Phone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="w-full px-4 py-2 bg-white/10 text-white rounded-lg"
          />
        </Field>
        <Field label="Role">
          <select
            value={form.primaryRole}
            onChange={(e) =>
              setForm({ ...form, primaryRole: e.target.value as any })
            }
            className="w-full px-4 py-2 bg-white/10 text-white rounded-lg"
          >
            {ALL_ROLES.filter((r) => r !== 'ALL').map((r) => (
              <option key={r} value={r} className="text-black">
                {r.replace('_', ' ')}
              </option>
            ))}
          </select>
        </Field>

        <FormActions onSave={onSave} onCancel={closeDialog} />
      </div>
    );
  };

  const EditForm = ({ user }: { user: PublicUserFE }) => {
    const [form, setForm] = useState<Partial<CreateUserInput>>({
      fname: user.fname,
      lname: user.lname,
      email: user.email,
      phone: user.phone || '',
      primaryRole: user.primaryRole,
    });
    const [region, setRegion] = useState<string | null>(
      user.primaryRole === 'REGIONAL_COACH'
        ? ((user as any)?.regCoach?.region ?? null)
        : null
    );

    const onSave = async () => {
      const updated = await updateUser(user.id, form);
      if (!updated) return;

      if (form.primaryRole === 'REGIONAL_COACH') {
        if (!region) {
          alert('Please select a region for the Regional Coach.');
          return;
        }
        try {
          await createOrUpdateRegCoach(user.id, region);
        } catch (e: any) {
          alert(
            e?.message || 'Could not assign region (it may already be taken).'
          );
          return;
        }
      } else if (user.primaryRole === 'REGIONAL_COACH') {
        try {
          await deleteRegCoach(user.id);
        } catch {}
      }

      setAll((u) => u.map((x) => (x.id === updated.id ? updated : x)));
      closeDialog();
      addToast('User updated', 'success');
    };

    return (
      <div className="space-y-4">
        <Field label="First Name">
          <input
            type="text"
            value={form.fname}
            onChange={(e) => setForm({ ...form, fname: e.target.value })}
            className="w-full px-4 py-2 bg-white/10 text-white rounded-lg"
          />
        </Field>
        <Field label="Last Name">
          <input
            type="text"
            value={form.lname}
            onChange={(e) => setForm({ ...form, lname: e.target.value })}
            className="w-full px-4 py-2 bg-white/10 text-white rounded-lg"
          />
        </Field>
        <Field label="Email">
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full px-4 py-2 bg-white/10 text-white rounded-lg"
          />
        </Field>
        <Field label="Phone">
          <input
            type="text"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="w-full px-4 py-2 bg-white/10 text-white rounded-lg"
          />
        </Field>
        <Field label="Role">
          <select
            value={form.primaryRole}
            onChange={(e) =>
              setForm({ ...form, primaryRole: e.target.value as any })
            }
            className="w-full px-4 py-2 bg-white/10 text-white rounded-lg"
          >
            {ALL_ROLES.filter((r) => r !== 'ALL').map((r) => (
              <option key={r} value={r} className="text-black">
                {r.replace('_', ' ')}
              </option>
            ))}
          </select>
        </Field>

        {form.primaryRole === 'REGIONAL_COACH' && (
          <Field label="Region">
            <select
              value={region ?? ''}
              onChange={(e) => setRegion(e.target.value)}
              className="w-full px-4 py-2 bg-white/10 text-white rounded-lg"
            >
              <option value="" className="text-black">
                Select a region…
              </option>
              {REGIONS.map((r) => (
                <option key={r} value={r} className="text-black">
                  {r}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-white/70">
              One Regional Coach per region.
            </p>
          </Field>
        )}

        <FormActions onSave={onSave} onCancel={closeDialog} />
      </div>
    );
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
              className="p-2 bg-white/10 backdrop-blur-lg rounded-lg text-white hover:bg-white/20 transition"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
            <div className="text-3xl lg:text-3xl font-bold text-white">
              Manage Users
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Export dropdown */}
            <div className="relative">
              <button
                onClick={() => setExportOpen((v) => !v)}
                onBlur={() => setTimeout(() => setExportOpen(false), 150)}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white transition"
                title="Export filtered users"
              >
                <ArrowDownTrayIcon className="w-5 h-5" />
                <span className="hidden sm:inline">Export</span>
                <ChevronDownIcon className="w-4 h-4 opacity-80" />
              </button>
              {exportOpen && (
                <div className="absolute md:right-0 mt-2 min-w-[180px] rounded-xl bg-black/80 backdrop-blur-xl border border-white/15 shadow-2xl overflow-hidden">
                  <button
                    className="w-full text-left px-4 py-2 text-white/90 hover:bg-white/10 transition"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      exportCSV(filteredAll, columns, {
                        filenameBase: 'users-filtered',
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
                      exportXLS(filteredAll, columns, {
                        filenameBase: 'users-filtered',
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

            {/* Add user */}
            <button
              onClick={openCreate}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/15 backdrop-blur-lg border border-white/30 rounded-full text-white hover:bg-[#5AA5FF] hover:border-[#5AA5FF] transition whitespace-nowrap"
            >
              <UserIcon className="w-5 h-5" />
              <span className="font-medium">Add New User</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 sm:gap-4">
          <div className="flex md:flex-row flex-col items-center gap-2">
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setPage(1);
                setSearch(e.target.value);
              }}
              placeholder="Search users..."
              className="w-full sm:w-64 px-4 py-2 bg-white/5 placeholder-white/70 text-white rounded-lg focus:outline-none"
            />
            <div className="flex sm:ml-auto w-full items-center bg-white/5 backdrop-blur-lg border border-white/30 rounded-lg">
              <select
                value={roleFilter}
                onChange={(e) => {
                  setPage(1);
                  setRoleFilter(e.target.value as any);
                }}
                className="px-3 py-2 bg-transparent w-full text-white focus:outline-none"
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
          {/* Sort summary + clear */}
          <div className="flex items-center gap-2 sm:ml-auto">
            {sortRules.length > 0 && (
              <span className="text-xs text-white/70">
                Sorted by{' '}
                {sortRules
                  .map((r, i) => `${i + 1}. ${r.key} ${r.dir}`)
                  .join(' → ')}
              </span>
            )}
            {sortRules.length > 0 && (
              <button
                onClick={() => setSortRules([])}
                className="px-3 py-1.5 rounded bg-white/10 hover:bg-white/20 text-white/90 transition"
                title="Clear sorts"
              >
                Clear Sort
              </button>
            )}
          </div>
        </div>

        {/* Data */}
        <div className="bg-white/5 backdrop-blur-lg rounded-2xl overflow-hidden shadow-inner">
          {/* Desktop/Tablet */}
          <div className="hidden sm:block">
            <div className="overflow-x-auto">
              <table className="min-w-[800px] w-full table-auto text-white">
                <thead className="sticky top-0 bg-white/10 text-white">
                  <tr>
                    <th className="px-4 sm:px-6 py-3 text-left">
                      Name <SortButton col="name" />
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left">
                      Email <SortButton col="email" />
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left">
                      Role <SortButton col="role" />
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left">Team/Info</th>
                    <th className="px-4 sm:px-6 py-3 text-right">Actions</th>
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
                        className="hover:bg-white/10 transition-colors"
                      >
                        <td className="px-4 sm:px-6 py-3 align-middle">
                          {u.fname} {u.lname}
                        </td>
                        <td className="px-4 sm:px-6 py-3 align-middle">
                          {u.email}
                        </td>
                        <td className="px-4 sm:px-6 py-3 align-middle">
                          <span className="inline-block flex-shrink-0 whitespace-nowrap bg-[#5AA5FF] text-white text-xs font-medium px-2 py-0.5 rounded-full">
                            {u.primaryRole.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-3 align-middle">
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
                              <span className="font-semibold">Coach:</span>{' '}
                              <br />
                              <span className="text-xs text-white/70">
                                Teams:{' '}
                                {(u.coach?.teams ?? [])
                                  .map((t) => t.name)
                                  .join(', ') || '-'}
                              </span>
                            </>
                          ) : (
                            <span className="text-xs text-white/60">—</span>
                          )}
                        </td>
                        <td className="px-4 sm:px-6 py-3 text-right align-middle">
                          <div className="inline-flex justify-end gap-2">
                            <button
                              className="p-2 bg-white/15 backdrop-blur-lg rounded-lg text-white hover:bg-[#5AA5FF] transition"
                              onClick={() => openEdit(u)}
                            >
                              <PencilSquareIcon className="w-5 h-5" />
                            </button>
                            <button
                              className="p-2 bg-red-600/80 rounded-lg text-white hover:bg-red-500 transition"
                              onClick={() => openDelete(u)}
                            >
                              <TrashIcon className="w-5 h-5" />
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

          {/* Mobile list */}
          <div className="sm:hidden divide-y divide-white/10">
            {loading ? (
              <div className="p-4 text-center text-white/60">Loading...</div>
            ) : users.length === 0 ? (
              <div className="p-4 text-center text-white/60">
                No users found.
              </div>
            ) : (
              users.map((u) => (
                <div key={u.id} className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-white font-medium truncate">
                        {u.fname} {u.lname}
                      </div>
                      <div className="text-white/70 text-sm truncate">
                        {u.email}
                      </div>
                      <div className="mt-1">
                        <span className="inline-block bg-[#5AA5FF] text-white text-[10px] font-medium px-2 py-0.5 rounded-full">
                          {u.primaryRole.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="mt-2 text-sm text-white/80">
                        {u.player ? (
                          <>
                            <span className="font-semibold">Player:</span>{' '}
                            {u.player.pos1}, {u.player.pos2}
                            <div className="text-xs text-white/70">
                              Team: {u.player.team?.name ?? '-'}
                            </div>
                          </>
                        ) : u.coach ? (
                          <>
                            <span className="font-semibold">Coach:</span>
                            <div className="text-xs text-white/70">
                              Teams:{' '}
                              {u.coach.teams.map((t) => t.name).join(', ') ||
                                '-'}
                            </div>
                          </>
                        ) : (
                          <span className="text-xs text-white/60">—</span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 shrink-0">
                      <button
                        className="p-2 bg-white/15 backdrop-blur-lg rounded-lg text-white hover:bg-[#5AA5FF] transition"
                        onClick={() => openEdit(u)}
                      >
                        <PencilSquareIcon className="w-5 h-5" />
                      </button>
                      <button
                        className="p-2 bg-red-600/80 rounded-lg text-white hover:bg-red-500 transition"
                        onClick={() => openDelete(u)}
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row gap-2 items-center justify-center sm:justify-between mt-4">
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
            {page} / {totalPages}
          </span>
        </div>
      </div>

      {/* Dialog */}
      <SideDialog
        open={dialogOpen}
        onClose={closeDialog}
        title={
          dialogType === 'create'
            ? 'Add User'
            : dialogType === 'edit'
              ? 'Edit User'
              : 'Remove User'
        }
      >
        {dialogType === 'create' && <CreateForm />}
        {dialogType === 'edit' && selectedUser && (
          <EditForm user={selectedUser} />
        )}
        {dialogType === 'delete' && selectedUser && (
          <div className="space-y-4">
            <p className="text-white">
              Are you sure you want to remove{' '}
              <b>
                {selectedUser.fname} {selectedUser.lname}
              </b>
              ?
            </p>
            <div className="flex flex-col sm:flex-row sm:space-x-4 mt-6">
              <button
                onClick={closeDialog}
                className="flex-1 px-4 py-2 bg-[#5AA5FF] rounded-lg text-white hover:bg-[#3C8CE7] whitespace-nowrap"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (selectedUser) {
                    const ok = await deleteUser(selectedUser.id);
                    if (ok) {
                      setAll((u) => u.filter((x) => x.id !== selectedUser.id));
                      closeDialog();
                      addToast('User deleted', 'success');
                    }
                  }
                }}
                className="flex-1 mt-4 sm:mt-0 px-4 py-2 bg-red-600 rounded-lg text-white hover:bg-red-500 whitespace-nowrap"
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

/* ---------- Small presentational helpers ---------- */

function Field({
  label,
  children,
}: React.PropsWithChildren<{ label: string }>) {
  return (
    <div>
      <label className="block text-sm text-white font-semibold">{label}</label>
      {children}
    </div>
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
    <div className="flex flex-col sm:flex-row sm:space-x-4 mt-6">
      <button
        onClick={onSave}
        className="flex-1 px-4 py-2 bg-[#5AA5FF] text-white rounded-lg hover:bg-[#3C8CE7] whitespace-nowrap"
      >
        Save
      </button>
      <button
        onClick={onCancel}
        className="flex-1 mt-4 sm:mt-0 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 whitespace-nowrap"
      >
        Cancel
      </button>
    </div>
  );
}
