// src/pages/Dashboard.tsx
import React, { useState, useEffect, useMemo } from 'react';
import {
  BellIcon,
  UsersIcon,
  DocumentTextIcon,
  CalendarIcon,
  TagIcon,
  StarIcon,
  UserGroupIcon,
  ChartBarIcon,
  RectangleStackIcon,
  EnvelopeIcon,
} from '@heroicons/react/24/outline';
import { ScrollArea } from '@/components/ui/scroll-area';
import SideDialog from '@/components/SideDialog';
import Modal from '@/components/Modal';

import { fetchUsers } from '@/api/user';
import { createTeam } from '@/api/team';
import type { CreateTeamDTO } from '@/api/team';
import { PublicUserFE, Regions } from '@bomber-app/database';
import { US_STATES } from '@/utils/state';
import { useToast } from '@/context/ToastProvider';
import { useAuth } from '@/context/AuthContext';

// forms kept in Modal for non-team/non-article actions
import CreateEventForm from '@/components/forms/Events/CreateEvent';
import CreateSponsorForm from '@/components/forms/Sponsor/CreateSponsor';
import CreateBannerForm from '@/components/forms/Banner/CreateBanner';
import CreateNotificationForm from '@/components/forms/Notification/createNotification';
<<<<<<< HEAD
=======
import { PublicUserFE } from '@bomber-app/database';
import { useAuth } from '@/context/AuthContext';
>>>>>>> events-tab

// NEW: createArticle for the Article SideDialog
import { createArticle } from '@/api/article';

/* ---------- Constants (match Teams.tsx) ---------- */
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

/* ---------------- Component ---------------- */
export default function Dashboard() {
  const { user, isLoading } = useAuth();
<<<<<<< HEAD
  const { addToast } = useToast();
=======
>>>>>>> events-tab

  const displayName =
    user?.fname || user?.lname
      ? `${user?.fname ?? ''} ${user?.lname ?? ''}`.trim()
      : (user?.email?.split('@')[0] ?? 'there');
<<<<<<< HEAD

=======
>>>>>>> events-tab
  // Quick Actions
  const quickActions = [
    { title: 'New Team', icon: UsersIcon },
    { title: 'New Article', icon: DocumentTextIcon },
    { title: 'New Event', icon: CalendarIcon },
    { title: 'New Sponsor', icon: TagIcon },
    { title: 'New Banner', icon: StarIcon },
    { title: 'Notification', icon: BellIcon },
  ];

  // Analytics (static)
  const stats = [
    { label: 'Total Users', value: 5671, icon: UserGroupIcon },
    { label: 'Active Users', value: 1234, icon: ChartBarIcon },
    { label: 'Total Teams', value: 123, icon: RectangleStackIcon },
    { label: 'Messages Sent', value: 201121, icon: EnvelopeIcon },
  ];

  // Users + Pagination state
  const [allUsers, setAllUsers] = useState<PublicUserFE[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 20;

  // Search state for org users (right column)
  const [userQuery, setUserQuery] = useState('');

  useEffect(() => {
    fetchUsers().then(setAllUsers);
  }, []);

  // Derived: filtered users by search
  const filteredUsers = useMemo(() => {
    const q = userQuery.trim().toLowerCase();
    if (!q) return allUsers;
    return allUsers.filter((u) => {
      const name = `${u.fname} ${u.lname}`.toLowerCase();
      return (
        name.includes(q) ||
        (u.email ?? '').toLowerCase().includes(q) ||
        (u.primaryRole ?? '').toLowerCase().includes(q)
      );
    });
  }, [allUsers, userQuery]);

  // Reset to page 1 when the search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [userQuery]);

  // Pagination calculations (on filtered set)
  const totalPages = Math.ceil(filteredUsers.length / PAGE_SIZE) || 1;
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const goPrev = () => setCurrentPage((p) => Math.max(1, p - 1));
  const goNext = () => setCurrentPage((p) => Math.min(totalPages, p + 1));

  // ---------- Legacy modal (kept) for everything except Team/Article ----------
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const openModalFor = (title: string) => {
    setSelectedAction(title);
    setModalOpen(true);
  };
  const closeModal = () => {
    setModalOpen(false);
    setSelectedAction(null);
  };

  // ---------- New Team SideDialog ----------
  const [teamDialogOpen, setTeamDialogOpen] = useState(false);

  const [coachSearch, setCoachSearch] = useState('');
  const coachOptions = useMemo(
    () =>
      allUsers.filter((u) =>
        `${u.fname} ${u.lname}`
          .toLowerCase()
          .includes(coachSearch.toLowerCase())
      ),
    [allUsers, coachSearch]
  );

  const [newTeam, setNewTeam] = useState<CreateTeamDTO>({
    name: '',
    ageGroup: 'U8',
    region: 'TEXAS',
    state: 'TX',
    headCoachUserID: null,
  });

  const closeTeamDialog = () => setTeamDialogOpen(false);

  const handleCreateTeam = async () => {
    const created = await createTeam(newTeam);
    if (created) {
      addToast('Team created', 'success');
      closeTeamDialog();
    }
  };

  // ---------- New Article SideDialog (like Team) ----------
  const [articleDialogOpen, setArticleDialogOpen] = useState(false);
  const [articleTitle, setArticleTitle] = useState('');
  const [articleBody, setArticleBody] = useState('');
  const [articleLink, setArticleLink] = useState('');
  const [articleImageUrl, setArticleImageUrl] = useState('');

  const openArticleDialog = () => {
    setArticleTitle('');
    setArticleBody('');
    setArticleLink('');
    setArticleImageUrl('');
    setArticleDialogOpen(true);
  };
  const closeArticleDialog = () => setArticleDialogOpen(false);

  const handleCreateArticle = async () => {
    if (!articleTitle.trim() || !articleBody.trim()) {
      addToast('Title and Body are required', 'error');
      return;
    }
    const saved = await createArticle({
      title: articleTitle.trim(),
      body: articleBody.trim(),
      link: articleLink.trim() || undefined,
      imageUrl: articleImageUrl.trim() || undefined,
    });
    if (saved) {
      addToast('Article created', 'success');
      closeArticleDialog();
    }
  };

  // ---------- Quick Action Router ----------
  const openQuickAction = (title: string) => {
    if (title === 'New Team') {
      setNewTeam({
        name: '',
        ageGroup: 'U8',
        region: 'TEXAS',
        state: 'TX',
        headCoachUserID: null,
      });
      setCoachSearch('');
      setTeamDialogOpen(true);
      return;
    }
    if (title === 'New Article') {
      openArticleDialog();
      return;
    }
    // everything else keeps using existing Modal & forms
    openModalFor(title);
  };

  return (
    <div className="flex flex-col relative gap-6 sm:gap-8">
      {/* Top header */}
      <div className="px-3 sm:px-4 md:px-0">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs sm:text-sm font-medium uppercase text-white/70">
              Bomber Dashboard
            </p>
            <div className="mt-1 text-2xl sm:text-3xl font-bold text-white">
              Welcome Back,&nbsp;
              {isLoading ? (
                <span className="inline-block align-middle h-6 w-28 bg-white/20 rounded animate-pulse" />
              ) : (
                displayName
              )}
            </div>
          </div>
        </div>
      </div>
<<<<<<< HEAD

      {/* Content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-6 sm:gap-8 px-3 sm:px-4 md:px-0">
          {/* Quick Actions */}
          <section className="space-y-4">
            <h2 className="text-lg sm:text-xl font-semibold text-white">
              Quick Actions
            </h2>
            <div className="grid grid-cols-2 xs:grid-cols-3 md:grid-cols-3 xl:grid-cols-3 gap-3 sm:gap-4">
              {quickActions.map(({ title, icon: Icon }) => (
                <button
                  key={title}
                  className="flex items-center justify-center sm:justify-start gap-2 px-3 sm:px-5 py-3 backdrop-blur-lg border border-white/30 text-white rounded-full hover:bg-[#5AA5FF] hover:border-[#5AA5FF] transition-colors"
                  onClick={() => openQuickAction(title)}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm sm:text-base font-medium truncate">
                    {title}
                  </span>
                </button>
              ))}
            </div>
          </section>

          {/* Analytics */}
          <section>
            <h2 className="text-lg sm:text-xl font-semibold text-white mb-4 sm:mb-6">
              Bomber Analytics
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-2 gap-4 sm:gap-6">
              {stats.map(({ label, value, icon: Icon }) => (
                <div
                  key={label}
                  className="flex items-center gap-4 p-4 sm:p-5 bg-[rgba(255,255,255,0.05)] rounded-lg border-l-4 border-[#5AA5FF] hover:shadow-md transition-shadow"
                >
                  <Icon className="w-6 h-6 text-white" />
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm text-white/70 uppercase truncate">
                      {label}
                    </p>
                    <p className="mt-1 text-xl sm:text-2xl font-bold text-white">
                      {value.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-4 sm:gap-6 px-3 sm:px-4 md:px-0">
          {/* Users Header + Search */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h2 className="text-lg sm:text-xl font-semibold text-white">
              Organization Users
            </h2>
            <input
              type="text"
              placeholder="Search users..."
              value={userQuery}
              onChange={(e) => setUserQuery(e.target.value)}
              className="w-full sm:w-72 px-4 py-2 bg-[rgba(255,255,255,0.05)] text-white placeholder-white/50 border-none rounded-lg focus:outline-none"
            />
          </div>

          {/* Users Table */}
          <div className="bg-[rgba(255,255,255,0.05)] backdrop-blur-lg rounded-xl overflow-hidden shadow-inner">
            <div className="hidden sm:block">
              <ScrollArea className="h-80 md:h-96">
                <div className="overflow-x-auto">
                  <table className="min-w-[680px] w-full table-auto text-white">
                    <thead className="sticky top-0 bg-[rgba(255,255,255,0.1)]">
                      <tr>
                        <th className="px-4 sm:px-6 py-3 sm:py-4 text-left">
                          Name
                        </th>
                        <th className="px-4 sm:px-6 py-3 sm:py-4 text-left">
                          Role
                        </th>
                        <th className="px-4 sm:px-6 py-3 sm:py-4 text-left">
                          Email
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedUsers.map((u) => (
                        <tr
                          key={u.id}
                          className="hover:bg-[rgba(255,255,255,0.1)] transition-colors"
                        >
                          <td className="px-4 sm:px-6 py-3 align-middle">
                            {u.fname} {u.lname}
                          </td>
                          <td className="px-4 sm:px-6 py-3 align-middle">
                            {u.primaryRole}
                          </td>
                          <td className="px-4 sm:px-6 py-3 align-middle">
                            {u.email}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </ScrollArea>
            </div>

            {/* Mobile list */}
            <div className="sm:hidden divide-y divide-white/10">
              {paginatedUsers.map((u) => (
                <div key={u.id} className="p-3">
                  <div className="text-white font-medium">
                    {u.fname} {u.lname}
                  </div>
                  <div className="text-white/70 text-sm">{u.primaryRole}</div>
                  <div className="text-white/70 text-sm truncate">
                    {u.email}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 sm:p-4 bg-[rgba(255,255,255,0.1)]">
              <div className="flex items-center gap-2">
                <button
                  onClick={goPrev}
                  disabled={currentPage === 1}
                  className="px-3 py-1 bg-white/20 rounded disabled:opacity-50"
                >
                  Prev
                </button>
                <button
                  onClick={goNext}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 bg-white/20 rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
              <span className="text-white text-sm sm:text-base">
                Page {currentPage} of {totalPages}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* New Team SideDialog */}
      <SideDialog
        open={teamDialogOpen}
        onClose={closeTeamDialog}
        title="Add Team"
        widthClass="w-[430px] max-w-[430px] min-w-[340px]"
      >
        <div className="space-y-3 sm:space-y-4">
          <Label>Team Name</Label>
          <Input
            value={newTeam.name}
            onChange={(e) =>
              setNewTeam((t) => ({ ...t, name: e.target.value }))
            }
          />

          <Label>Age Group</Label>
          <Select
            value={newTeam.ageGroup}
            onChange={(e) =>
              setNewTeam((t) => ({ ...t, ageGroup: e.target.value as any }))
            }
            options={AGE_OPTIONS.map((a) => ({ value: a, label: a }))}
          />

          <Label>Region</Label>
          <Select
            value={newTeam.region}
            onChange={(e) =>
              setNewTeam((t) => ({ ...t, region: e.target.value as Regions }))
            }
            options={REGION_OPTIONS}
          />

          <Label>State</Label>
          <Select
            value={newTeam.state}
            onChange={(e) =>
              setNewTeam((t) => ({
                ...t,
                state: e.target.value as CreateTeamDTO['state'],
              }))
            }
            options={US_STATES}
          />

          <Label>Head Coach</Label>
          <Input
            placeholder="Search coach…"
            value={coachSearch}
            onChange={(e) => {
              setCoachSearch(e.target.value);
              setNewTeam((t) => ({ ...t, headCoachUserID: null }));
            }}
          />
          <CoachPicker
            options={coachOptions}
            selectedId={newTeam.headCoachUserID ?? null}
            onSelect={(id) =>
              setNewTeam((t) => ({ ...t, headCoachUserID: id }))
            }
          />

          <FormActions onSave={handleCreateTeam} onCancel={closeTeamDialog} />
        </div>
      </SideDialog>

      {/* New Article SideDialog */}
      <SideDialog
        open={articleDialogOpen}
        onClose={closeArticleDialog}
        title="New Article"
        widthClass="w-[520px] max-w-[520px] min-w-[340px]"
      >
        <div className="space-y-3 sm:space-y-4">
          <Label>Title</Label>
          <Input
            placeholder="Article title"
            value={articleTitle}
            onChange={(e) => setArticleTitle(e.target.value)}
          />

          <Label>Body</Label>
          <textarea
            placeholder="Write the article body…"
            value={articleBody}
            onChange={(e) => setArticleBody(e.target.value)}
            className="w-full min-h-36 px-4 py-2 bg-white/10 text-white rounded-lg"
          />

          <Label>Link (optional)</Label>
          <Input
            placeholder="https://example.com"
            value={articleLink}
            onChange={(e) => setArticleLink(e.target.value)}
          />

          <Label>Image URL (optional)</Label>
          <Input
            placeholder="https://example.com/image.jpg"
            value={articleImageUrl}
            onChange={(e) => setArticleImageUrl(e.target.value)}
          />

          {/* Tiny live preview header (optional) */}
          {(articleTitle || articleImageUrl) && (
            <div className="rounded-xl overflow-hidden bg-white/5 border border-white/10">
              <div
                className="h-28 bg-cover bg-center"
                style={{
                  backgroundImage: articleImageUrl
                    ? `url(${articleImageUrl})`
                    : 'none',
                }}
              />
              <div className="p-3">
                <div className="text-white font-semibold line-clamp-1">
                  {articleTitle || 'Preview title'}
                </div>
                <div className="text-white/70 text-sm line-clamp-2 mt-1">
                  {articleBody || 'Preview body…'}
                </div>
              </div>
            </div>
          )}

          <FormActions
            onSave={handleCreateArticle}
            onCancel={closeArticleDialog}
          />
=======

      {/* Content grid: stacks on mobile -> two columns on lg+ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-6 sm:gap-8 px-3 sm:px-4 md:px-0">
          {/* Quick Actions */}
          <section className="space-y-4">
            <h2 className="text-lg sm:text-xl font-semibold text-white">
              Quick Actions
            </h2>
            <div className="grid grid-cols-2 xs:grid-cols-3 md:grid-cols-3 xl:grid-cols-3 gap-3 sm:gap-4">
              {quickActions.map(({ title, icon: Icon }) => (
                <button
                  key={title}
                  className="flex items-center justify-center sm:justify-start gap-2 px-3 sm:px-5 py-3 backdrop-blur-lg border border-white/30 text-white rounded-full hover:bg-[#5AA5FF] hover:border-[#5AA5FF] transition-colors"
                  onClick={() => handleQuickAction(title)}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm sm:text-base font-medium truncate">
                    {title}
                  </span>
                </button>
              ))}
            </div>
          </section>

          {/* Analytics */}
          <section>
            <h2 className="text-lg sm:text-xl font-semibold text-white mb-4 sm:mb-6">
              Bomber Analytics
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-2 gap-4 sm:gap-6">
              {stats.map(({ label, value, icon: Icon }) => (
                <div
                  key={label}
                  className="flex items-center gap-4 p-4 sm:p-5 bg-[rgba(255,255,255,0.05)] rounded-lg border-l-4 border-[#5AA5FF] hover:shadow-md transition-shadow"
                >
                  <Icon className="w-6 h-6 text-white" />
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm text-white/70 uppercase truncate">
                      {label}
                    </p>
                    <p className="mt-1 text-xl sm:text-2xl font-bold text-white">
                      {value.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
>>>>>>> events-tab
        </div>
      </SideDialog>

<<<<<<< HEAD
      {/* Existing Modal for other actions */}
      <Modal open={modalOpen} onClose={closeModal} title={selectedAction ?? ''}>
=======
        {/* RIGHT COLUMN */}
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-4 sm:gap-6 px-3 sm:px-4 md:px-0">
          {/* Users Header + Search */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h2 className="text-lg sm:text-xl font-semibold text-white">
              Organization Users
            </h2>
            <input
              type="text"
              placeholder="Search users..."
              className="w-full sm:w-72 px-4 py-2 bg-[rgba(255,255,255,0.05)] text-white placeholder-white/50 border-none rounded-lg focus:outline-none"
              // TODO: wire up search/filter
            />
          </div>

          {/* Users Table */}
          <div className="bg-[rgba(255,255,255,0.05)] backdrop-blur-lg rounded-xl overflow-hidden shadow-inner">
            {/* Make the list height adaptive across breakpoints */}
            <div className="hidden sm:block">
              <ScrollArea className="h-80 md:h-96">
                <div className="overflow-x-auto">
                  <table className="min-w-[680px] w-full table-auto text-white">
                    <thead className="sticky top-0 bg-[rgba(255,255,255,0.1)]">
                      <tr>
                        <th className="px-4 sm:px-6 py-3 sm:py-4 text-left">
                          Name
                        </th>
                        <th className="px-4 sm:px-6 py-3 sm:py-4 text-left">
                          Role
                        </th>
                        <th className="px-4 sm:px-6 py-3 sm:py-4 text-left">
                          Email
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedUsers.map((u) => (
                        <tr
                          key={u.id}
                          className="hover:bg-[rgba(255,255,255,0.1)] transition-colors"
                        >
                          <td className="px-4 sm:px-6 py-3 align-middle">
                            {u.fname} {u.lname}
                          </td>
                          <td className="px-4 sm:px-6 py-3 align-middle">
                            {u.primaryRole}
                          </td>
                          <td className="px-4 sm:px-6 py-3 align-middle">
                            {u.email}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </ScrollArea>
            </div>

            {/* Mobile list (cardified rows) */}
            <div className="sm:hidden divide-y divide-white/10">
              {paginatedUsers.map((u) => (
                <div key={u.id} className="p-3">
                  <div className="text-white font-medium">
                    {u.fname} {u.lname}
                  </div>
                  <div className="text-white/70 text-sm">{u.primaryRole}</div>
                  <div className="text-white/70 text-sm truncate">
                    {u.email}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 sm:p-4 bg-[rgba(255,255,255,0.1)]">
              <div className="flex items-center gap-2">
                <button
                  onClick={goPrev}
                  disabled={currentPage === 1}
                  className="px-3 py-1 bg-white/20 rounded disabled:opacity-50"
                >
                  Prev
                </button>
                <button
                  onClick={goNext}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 bg-white/20 rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
              <span className="text-white text-sm sm:text-base">
                Page {currentPage} of {totalPages}
              </span>
            </div>
          </div>
        </div>
      </div>

      <Modal
        open={dialogOpen}
        onClose={handleCloseDialog}
        title={selectedAction ?? ''}
      >
        {selectedAction === 'New Team' && (
          <CreateTeamForm onSuccess={handleCloseDialog} />
        )}
        {selectedAction === 'New Article' && (
          <CreateArticleForm onSuccess={handleCloseDialog} />
        )}
>>>>>>> events-tab
        {selectedAction === 'New Event' && (
          <CreateEventForm onSuccess={closeModal} />
        )}
        {selectedAction === 'New Sponsor' && (
          <CreateSponsorForm onSuccess={closeModal} />
        )}
        {selectedAction === 'New Banner' && (
          <CreateBannerForm onSuccess={closeModal} />
        )}
        {selectedAction === 'Notification' && (
          <CreateNotificationForm onSuccess={closeModal} />
        )}
        {/* Note: "New Team" and "New Article" now use SideDialogs */}
      </Modal>
    </div>
  );
}

/* ---------- Tiny UI helpers (same as Teams.tsx) ---------- */
function Label({ children }: { children: string }) {
  return (
    <label className="block text-sm text-white font-semibold">{children}</label>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full px-4 py-2 bg-white/10 text-white rounded-lg ${props.className ?? ''}`}
    />
  );
}

function Select({
  options,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & {
  options: { value: string; label: string }[];
}) {
  return (
    <select
      {...props}
      className={`w-full px-4 py-2 bg-white/10 text-white rounded-lg ${props.className ?? ''}`}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value} className="text-black">
          {o.label}
        </option>
      ))}
    </select>
  );
}

function CoachPicker({
  options,
  selectedId,
  onSelect,
}: {
  options: PublicUserFE[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}) {
  return (
    <ul className="max-h-32 overflow-auto bg-black/20 rounded-lg divide-y divide-white/10">
      <li
        className={`px-3 py-1 text-white cursor-pointer ${
          selectedId === null ? 'bg-blue-500' : ''
        }`}
        onClick={() => onSelect(null)}
      >
        — none —
      </li>
      {options.map((c) => (
        <li
          key={c.id}
          className={`px-3 py-1 text-white cursor-pointer ${
            selectedId === c.id ? 'bg-blue-500' : ''
          }`}
          onClick={() => onSelect(c.id)}
        >
          {c.fname} {c.lname}
        </li>
      ))}
    </ul>
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
    <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-4">
      <button
        onClick={onSave}
        className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg"
      >
        Save
      </button>
      <button
        onClick={onCancel}
        className="flex-1 px-4 py-2 bg-white/20 text-white rounded-lg"
      >
        Cancel
      </button>
    </div>
  );
}
