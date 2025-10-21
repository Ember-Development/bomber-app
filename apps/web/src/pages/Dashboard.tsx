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
import { PublicUserFE } from '@bomber-app/database';
import { US_STATES } from '@/utils/state';
import { useToast } from '@/context/ToastProvider';
import { useAuth } from '@/context/AuthContext';
import { fetchAnalytics, type AnalyticsData } from '@/api/analytics';

// All quick actions now use SideDialogs - no modal forms needed

// NEW: createArticle for the Article SideDialog, createEvent for Event SideDialog, createSponsor for Sponsor SideDialog, createBanner for Banner SideDialog, and createNotification for Notification SideDialog
import { createArticle } from '@/api/article';
import { createEvent } from '@/api/event';
import { createSponsor } from '@/api/sponsor';
import { createBanner } from '@/api/banner';
import { createNotification } from '@/api/notification';
import { Regions } from '@bomber-app/database/generated/client';

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
  const { addToast } = useToast();

  const displayName =
    user?.fname || user?.lname
      ? `${user?.fname ?? ''} ${user?.lname ?? ''}`.trim()
      : (user?.email?.split('@')[0] ?? 'there');

  // Quick Actions
  const quickActions = [
    { title: 'New Team', icon: UsersIcon },
    { title: 'New Article', icon: DocumentTextIcon },
    { title: 'New Event', icon: CalendarIcon },
    { title: 'New Sponsor', icon: TagIcon },
    { title: 'New Banner', icon: StarIcon },
    { title: 'Notification', icon: BellIcon },
  ];

  // Analytics (dynamic)
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  const stats = [
    {
      label: 'Total Users',
      value: analytics?.totalUsers || 0,
      icon: UserGroupIcon,
    },
    {
      label: 'Total Players',
      value: analytics?.totalPlayers || 0,
      icon: ChartBarIcon,
    },
    {
      label: 'Total Teams',
      value: analytics?.totalTeams || 0,
      icon: RectangleStackIcon,
    },
    {
      label: 'Notifications Sent',
      value: analytics?.totalNotificationsSent || 0,
      icon: EnvelopeIcon,
    },
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

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setAnalyticsLoading(true);
        const data = await fetchAnalytics();
        setAnalytics(data);
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
        addToast('Failed to load analytics data', 'error');
      } finally {
        setAnalyticsLoading(false);
      }
    };

    loadAnalytics();
  }, [addToast]);

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

  // ---------- New Event SideDialog ----------
  const [eventDialogOpen, setEventDialogOpen] = useState(false);

  const [newEvent, setNewEvent] = useState({
    eventType: 'PRACTICE' as 'PRACTICE' | 'TOURNAMENT' | 'GLOBAL',
    title: '',
    city: '',
    state: '',
    body: '',
    startIso: '',
    endIso: '',
    selectedUserIds: new Set<string>(),
  });

  const [eventUserQuery, setEventUserQuery] = useState('');
  const inviteableUsers = useMemo(
    () =>
      allUsers
        .filter((u) => u.primaryRole !== 'FAN')
        .filter((u) => {
          const name =
            `${u.fname ?? ''} ${u.lname ?? ''} ${u.email ?? ''}`.toLowerCase();
          return name.includes(eventUserQuery.toLowerCase());
        }),
    [allUsers, eventUserQuery]
  );

  const closeEventDialog = () => setEventDialogOpen(false);

  const handleCreateEvent = async () => {
    try {
      const location = (() => {
        const c = newEvent.city.trim();
        const s = newEvent.state.trim();
        if (c && s) return `${c}, ${s}`;
        if (c) return c;
        if (s) return s;
        return '';
      })();

      const attendees =
        newEvent.eventType !== 'GLOBAL'
          ? Array.from(newEvent.selectedUserIds).map((userID) => ({
              userID,
              status: 'PENDING' as const,
            }))
          : [];

      const payload = {
        event: {
          eventType: newEvent.eventType,
          start: new Date(newEvent.startIso).toISOString(),
          end: new Date(newEvent.endIso).toISOString(),
          title:
            newEvent.title.trim() ||
            (newEvent.eventType === 'PRACTICE' ? 'Practice' : 'Tournament'),
          body: newEvent.body.trim() || null,
          location: location || null,
        },
        attendees,
        tournamentID: null,
      };

      const created = await createEvent(payload);
      if (created) {
        addToast('Event created', 'success');
        closeEventDialog();
      }
    } catch (error) {
      console.error('Failed to create event:', error);
      addToast('Failed to create event', 'error');
    }
  };

  // ---------- New Sponsor SideDialog ----------
  const [sponsorDialogOpen, setSponsorDialogOpen] = useState(false);

  const [newSponsor, setNewSponsor] = useState({
    title: '',
    url: '',
    logoUrl: '',
  });

  const closeSponsorDialog = () => setSponsorDialogOpen(false);

  const handleCreateSponsor = async () => {
    try {
      if (!newSponsor.title || !newSponsor.url) {
        addToast('Title and URL are required', 'error');
        return;
      }

      const payload = {
        title: newSponsor.title.trim(),
        url: newSponsor.url.trim(),
        logoUrl: newSponsor.logoUrl.trim() || undefined,
      };

      const created = await createSponsor(payload);
      if (created) {
        addToast('Sponsor created', 'success');
        closeSponsorDialog();
      }
    } catch (error) {
      console.error('Failed to create sponsor:', error);
      addToast('Failed to create sponsor', 'error');
    }
  };

  // ---------- New Banner SideDialog ----------
  const [bannerDialogOpen, setBannerDialogOpen] = useState(false);

  const [newBanner, setNewBanner] = useState({
    imageUrl: '',
    duration: 1,
    expiresAt: '',
  });

  const closeBannerDialog = () => setBannerDialogOpen(false);

  const handleCreateBanner = async () => {
    try {
      if (!newBanner.imageUrl || !newBanner.expiresAt) {
        addToast('Image URL and expiration date are required', 'error');
        return;
      }

      const payload = {
        imageUrl: newBanner.imageUrl.trim(),
        duration: newBanner.duration,
        expiresAt: new Date(newBanner.expiresAt).toISOString(),
      };

      const created = await createBanner(payload);
      if (created) {
        addToast('Banner created', 'success');
        closeBannerDialog();
      }
    } catch (error) {
      console.error('Failed to create banner:', error);
      addToast('Failed to create banner', 'error');
    }
  };

  const handleDurationChange = (hrs: number) => {
    setNewBanner((b) => ({ ...b, duration: hrs }));
    const now = new Date();
    now.setHours(now.getHours() + hrs);
    setNewBanner((b) => ({ ...b, expiresAt: now.toISOString().slice(0, 16) }));
  };

  // ---------- New Notification SideDialog ----------
  const [notificationDialogOpen, setNotificationDialogOpen] = useState(false);

  const [newNotification, setNewNotification] = useState({
    title: '',
    body: '',
    imageUrl: '',
    deepLink: '',
    platform: 'both' as 'both' | 'ios' | 'android',
    audience: 'all' as 'all' | 'specific',
    selectedUserIds: new Set<string>(),
  });

  const [notificationUserQuery, setNotificationUserQuery] = useState('');
  const notificationInviteableUsers = useMemo(
    () =>
      allUsers
        .filter((u) => u.primaryRole !== 'FAN')
        .filter((u) => {
          const name =
            `${u.fname ?? ''} ${u.lname ?? ''} ${u.email ?? ''}`.toLowerCase();
          return name.includes(notificationUserQuery.toLowerCase());
        }),
    [allUsers, notificationUserQuery]
  );

  const closeNotificationDialog = () => setNotificationDialogOpen(false);

  const handleCreateNotification = async () => {
    try {
      if (!newNotification.title.trim() || !newNotification.body.trim()) {
        addToast('Title and body are required', 'error');
        return;
      }

      if (
        newNotification.audience === 'specific' &&
        newNotification.selectedUserIds.size === 0
      ) {
        addToast('Please select at least one user', 'error');
        return;
      }

      const audience =
        newNotification.audience === 'all'
          ? { all: true }
          : { userIds: Array.from(newNotification.selectedUserIds) };

      const payload = {
        title: newNotification.title.trim(),
        body: newNotification.body.trim(),
        imageUrl: newNotification.imageUrl.trim() || undefined,
        deepLink: newNotification.deepLink.trim() || undefined,
        platform: newNotification.platform,
        audience,
      };

      const created = await createNotification(payload);
      if (created) {
        addToast('Notification draft created', 'success');
        closeNotificationDialog();
      }
    } catch (error) {
      console.error('Failed to create notification:', error);
      addToast('Failed to create notification', 'error');
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
    if (title === 'New Event') {
      setNewEvent({
        eventType: 'PRACTICE',
        title: '',
        city: '',
        state: '',
        body: '',
        startIso: '',
        endIso: '',
        selectedUserIds: new Set<string>(),
      });
      setEventUserQuery('');
      setEventDialogOpen(true);
      return;
    }
    if (title === 'New Sponsor') {
      setNewSponsor({
        title: '',
        url: '',
        logoUrl: '',
      });
      setSponsorDialogOpen(true);
      return;
    }
    if (title === 'New Banner') {
      setNewBanner({
        imageUrl: '',
        duration: 1,
        expiresAt: '',
      });
      setBannerDialogOpen(true);
      return;
    }
    if (title === 'Notification') {
      setNewNotification({
        title: '',
        body: '',
        imageUrl: '',
        deepLink: '',
        platform: 'both',
        audience: 'all',
        selectedUserIds: new Set<string>(),
      });
      setNotificationUserQuery('');
      setNotificationDialogOpen(true);
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
                      {analyticsLoading ? (
                        <span className="inline-block align-middle h-6 w-16 bg-white/20 rounded animate-pulse" />
                      ) : (
                        value.toLocaleString()
                      )}
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

      {/* New Event SideDialog */}
      <SideDialog
        open={eventDialogOpen}
        onClose={closeEventDialog}
        title="Create Event"
        widthClass="w-[520px] max-w-[520px] min-w-[340px]"
      >
        <div className="space-y-4">
          {/* Type */}
          <div>
            <label className="block text-sm text-white font-semibold">
              Type
            </label>
            <div className="flex gap-2 mt-1">
              {(['PRACTICE', 'TOURNAMENT', 'GLOBAL'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setNewEvent((e) => ({ ...e, eventType: t }))}
                  className={`px-3 py-1 rounded-lg text-sm ${
                    newEvent.eventType === t
                      ? 'bg-[#5AA5FF] text-white'
                      : 'bg-white/10 text-white/80'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm text-white font-semibold">
              Title
            </label>
            <input
              value={newEvent.title}
              onChange={(e) =>
                setNewEvent((ev) => ({ ...ev, title: e.target.value }))
              }
              placeholder="Event title"
              className="w-full px-4 py-2 bg-white/10 text-white rounded-lg"
            />
          </div>

          {/* Location: City/State */}
          <div>
            <label className="block text-sm text-white font-semibold">
              Location
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                value={newEvent.city}
                onChange={(e) =>
                  setNewEvent((ev) => ({ ...ev, city: e.target.value }))
                }
                placeholder="City (e.g., College Station)"
                className="w-full px-4 py-2 bg-white/10 text-white rounded-lg"
              />
              <select
                value={newEvent.state}
                onChange={(e) =>
                  setNewEvent((ev) => ({ ...ev, state: e.target.value }))
                }
                className="w-full px-4 py-2 bg-white/10 text-white rounded-lg"
              >
                <option value="" className="text-black">
                  Select State
                </option>
                {US_STATES.map((s) => (
                  <option key={s.value} value={s.value} className="text-black">
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Details (body) */}
          <div>
            <label className="block text-sm text-white font-semibold">
              Details (facility/address/notes)
            </label>
            <textarea
              value={newEvent.body}
              onChange={(e) =>
                setNewEvent((ev) => ({ ...ev, body: e.target.value }))
              }
              placeholder="e.g. Veterans Park & Athletic Complex, Field 3"
              className="w-full min-h-[90px] px-4 py-2 bg-white/10 text-white rounded-lg"
            />
          </div>

          {/* Start/End */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-white font-semibold">
                Start
              </label>
              <input
                type="datetime-local"
                value={newEvent.startIso}
                onChange={(e) =>
                  setNewEvent((ev) => ({ ...ev, startIso: e.target.value }))
                }
                className="w-full px-4 py-2 bg-white/10 text-white rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm text-white font-semibold">
                End
              </label>
              <input
                type="datetime-local"
                value={newEvent.endIso}
                onChange={(e) =>
                  setNewEvent((ev) => ({ ...ev, endIso: e.target.value }))
                }
                className="w-full px-4 py-2 bg-white/10 text-white rounded-lg"
              />
            </div>
          </div>

          {/* Invitees (hidden for GLOBAL events) */}
          {newEvent.eventType !== 'GLOBAL' && (
            <div>
              <div className="flex items-center justify-between gap-4">
                <label className="text-sm text-white font-semibold whitespace-nowrap">
                  Invitees
                </label>
                <div className="flex items-center gap-2 w-full max-w-md">
                  <input
                    type="text"
                    value={eventUserQuery}
                    onChange={(e) => setEventUserQuery(e.target.value)}
                    placeholder="Search name or email"
                    className="px-2 py-1 bg-white/10 text-white rounded-md text-sm w-full focus:outline-none focus:ring-2 focus:ring-[#5AA5FF]/50"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setNewEvent((ev) => ({
                          ...ev,
                          selectedUserIds: new Set(
                            inviteableUsers.map((u) => u.id)
                          ),
                        }))
                      }
                      className="px-2 py-1 bg-[#5AA5FF] text-white rounded-md text-sm hover:bg-[#4A95EF] transition-colors"
                    >
                      Select all
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setNewEvent((ev) => ({
                          ...ev,
                          selectedUserIds: new Set(),
                        }))
                      }
                      className="px-2 py-1 bg-white/20 text-white rounded-md text-sm hover:bg-white/30 transition-colors"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              </div>
              <span className="text-white/60 text-xs">
                {newEvent.selectedUserIds.size} selected
              </span>
              <div className="max-h-48 overflow-auto mt-2 rounded-lg border border-white/10">
                {inviteableUsers.length === 0 && (
                  <div className="p-3 text-white/70">No users</div>
                )}
                {inviteableUsers.length > 0 && (
                  <ul className="divide-y divide-white/10">
                    {inviteableUsers.map((u) => {
                      const id = u.id;
                      const name =
                        `${u.fname ?? ''} ${u.lname ?? ''}`.trim() ||
                        u.email ||
                        id;
                      const on = newEvent.selectedUserIds.has(id);
                      return (
                        <li
                          key={id}
                          className="flex items-center justify-between p-2 hover:bg-white/5"
                        >
                          <span className="text-white">{name}</span>
                          <label className="text-white/80 text-sm flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={on}
                              onChange={() =>
                                setNewEvent((ev) => {
                                  const newSet = new Set(ev.selectedUserIds);
                                  if (newSet.has(id)) {
                                    newSet.delete(id);
                                  } else {
                                    newSet.add(id);
                                  }
                                  return { ...ev, selectedUserIds: newSet };
                                })
                              }
                            />
                            Invite
                          </label>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>
          )}
          {newEvent.eventType === 'GLOBAL' && (
            <div className="text-white/70 text-sm">
              Global events are visible to all users and do not require specific
              invitees.
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-6">
            <button
              onClick={handleCreateEvent}
              className="flex-1 px-4 py-2 bg-[#5AA5FF] text-white rounded-lg hover:bg-[#3C8CE7] whitespace-nowrap"
            >
              Save
            </button>
            <button
              onClick={closeEventDialog}
              className="flex-1 px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-[#5AA5FF] whitespace-nowrap"
            >
              Cancel
            </button>
          </div>
        </div>
      </SideDialog>

      {/* New Sponsor SideDialog */}
      <SideDialog
        open={sponsorDialogOpen}
        onClose={closeSponsorDialog}
        title="Add Sponsor"
        widthClass="w-[520px] max-w-[520px] min-w-[340px]"
      >
        <div className="space-y-4">
          {/* Sponsor Name */}
          <div>
            <label className="block text-sm text-white font-semibold">
              Sponsor Name
            </label>
            <input
              value={newSponsor.title}
              onChange={(e) =>
                setNewSponsor((s) => ({ ...s, title: e.target.value }))
              }
              placeholder="Sponsor Name"
              className="w-full px-4 py-2 bg-white/10 text-white rounded-lg"
            />
          </div>

          {/* Website URL */}
          <div>
            <label className="block text-sm text-white font-semibold">
              Website URL
            </label>
            <input
              value={newSponsor.url}
              onChange={(e) =>
                setNewSponsor((s) => ({ ...s, url: e.target.value }))
              }
              placeholder="Website URL"
              className="w-full px-4 py-2 bg-white/10 text-white rounded-lg"
            />
          </div>

          {/* Logo Image URL */}
          <div>
            <label className="block text-sm text-white font-semibold">
              Logo Image URL (optional)
            </label>
            <input
              value={newSponsor.logoUrl}
              onChange={(e) =>
                setNewSponsor((s) => ({ ...s, logoUrl: e.target.value }))
              }
              placeholder="Logo Image URL"
              className="w-full px-4 py-2 bg-white/10 text-white rounded-lg"
            />
          </div>

          {/* Logo Preview */}
          {newSponsor.logoUrl && (
            <div className="mt-4">
              <label className="block text-sm text-white font-semibold mb-2">
                Logo Preview
              </label>
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <img
                  src={newSponsor.logoUrl}
                  alt="Logo preview"
                  className="max-h-24 object-contain mx-auto"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-6">
            <button
              onClick={handleCreateSponsor}
              className="flex-1 px-4 py-2 bg-[#5AA5FF] text-white rounded-lg hover:bg-[#3C8CE7] whitespace-nowrap"
            >
              Save
            </button>
            <button
              onClick={closeSponsorDialog}
              className="flex-1 px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-[#5AA5FF] whitespace-nowrap"
            >
              Cancel
            </button>
          </div>
        </div>
      </SideDialog>

      {/* New Banner SideDialog */}
      <SideDialog
        open={bannerDialogOpen}
        onClose={closeBannerDialog}
        title="Create Banner"
        widthClass="w-[520px] max-w-[520px] min-w-[340px]"
      >
        <div className="space-y-4">
          {/* Banner Image URL */}
          <div>
            <label className="block text-sm text-white font-semibold">
              Banner Image URL
            </label>
            <input
              value={newBanner.imageUrl}
              onChange={(e) =>
                setNewBanner((b) => ({ ...b, imageUrl: e.target.value }))
              }
              placeholder="Banner Image URL"
              className="w-full px-4 py-2 bg-white/10 text-white rounded-lg"
            />
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm text-white font-semibold mb-2">
              Duration
            </label>
            <div className="flex flex-wrap gap-2">
              {[1, 6, 12, 24].map((hrs) => (
                <button
                  key={hrs}
                  onClick={() => handleDurationChange(hrs)}
                  className={`px-3 py-1.5 rounded-full text-sm font-semibold transition ${
                    newBanner.duration === hrs
                      ? 'bg-[#5AA5FF] text-white shadow'
                      : 'bg-white/10 text-white/75 hover:bg-[#5AA5FF]/30'
                  }`}
                >
                  {hrs} hr
                </button>
              ))}
            </div>
          </div>

          {/* Expires At */}
          <div>
            <label className="block text-sm text-white font-semibold">
              Expires At
            </label>
            <input
              type="datetime-local"
              value={newBanner.expiresAt}
              onChange={(e) =>
                setNewBanner((b) => ({ ...b, expiresAt: e.target.value }))
              }
              className="w-full px-4 py-2 bg-white/10 text-white rounded-lg"
            />
          </div>

          {/* Banner Preview */}
          {newBanner.imageUrl && (
            <div className="mt-4">
              <label className="block text-sm text-white font-semibold mb-2">
                Banner Preview
              </label>
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="aspect-video w-full overflow-hidden rounded-xl bg-black/40">
                  <img
                    src={newBanner.imageUrl}
                    alt="Banner preview"
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-6">
            <button
              onClick={handleCreateBanner}
              className="flex-1 px-4 py-2 bg-[#5AA5FF] text-white rounded-lg hover:bg-[#3C8CE7] whitespace-nowrap"
            >
              Save
            </button>
            <button
              onClick={closeBannerDialog}
              className="flex-1 px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-[#5AA5FF] whitespace-nowrap"
            >
              Cancel
            </button>
          </div>
        </div>
      </SideDialog>

      {/* New Notification SideDialog */}
      <SideDialog
        open={notificationDialogOpen}
        onClose={closeNotificationDialog}
        title="Create Notification"
        widthClass="w-[600px] max-w-[600px] min-w-[400px]"
      >
        <div className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm text-white font-semibold">
              Title
            </label>
            <input
              value={newNotification.title}
              onChange={(e) =>
                setNewNotification((n) => ({ ...n, title: e.target.value }))
              }
              placeholder="Notification title"
              className="w-full px-4 py-2 bg-white/10 text-white rounded-lg"
            />
          </div>

          {/* Body */}
          <div>
            <label className="block text-sm text-white font-semibold">
              Message
            </label>
            <textarea
              value={newNotification.body}
              onChange={(e) =>
                setNewNotification((n) => ({ ...n, body: e.target.value }))
              }
              placeholder="Notification message"
              className="w-full min-h-[100px] px-4 py-2 bg-white/10 text-white rounded-lg"
            />
          </div>

          {/* Image URL and Deep Link */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-white font-semibold">
                Image URL (optional)
              </label>
              <input
                value={newNotification.imageUrl}
                onChange={(e) =>
                  setNewNotification((n) => ({
                    ...n,
                    imageUrl: e.target.value,
                  }))
                }
                placeholder="https://example.com/image.jpg"
                className="w-full px-4 py-2 bg-white/10 text-white rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm text-white font-semibold">
                Deep Link (optional)
              </label>
              <input
                value={newNotification.deepLink}
                onChange={(e) =>
                  setNewNotification((n) => ({
                    ...n,
                    deepLink: e.target.value,
                  }))
                }
                placeholder="bomber:// or https://"
                className="w-full px-4 py-2 bg-white/10 text-white rounded-lg"
              />
            </div>
          </div>

          {/* Platform */}
          <div>
            <label className="block text-sm text-white font-semibold mb-2">
              Platform
            </label>
            <div className="flex gap-2">
              {(['both', 'ios', 'android'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() =>
                    setNewNotification((n) => ({ ...n, platform: p }))
                  }
                  className={`px-3 py-1.5 rounded-full text-sm font-semibold transition ${
                    newNotification.platform === p
                      ? 'bg-[#5AA5FF] text-white shadow'
                      : 'bg-white/10 text-white/75 hover:bg-[#5AA5FF]/30'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Audience */}
          <div>
            <label className="block text-sm text-white font-semibold mb-2">
              Audience
            </label>
            <div className="flex gap-2 mb-3">
              <button
                onClick={() =>
                  setNewNotification((n) => ({ ...n, audience: 'all' }))
                }
                className={`px-3 py-1.5 rounded-full text-sm font-semibold transition ${
                  newNotification.audience === 'all'
                    ? 'bg-[#5AA5FF] text-white shadow'
                    : 'bg-white/10 text-white/75 hover:bg-[#5AA5FF]/30'
                }`}
              >
                All Users
              </button>
              <button
                onClick={() =>
                  setNewNotification((n) => ({ ...n, audience: 'specific' }))
                }
                className={`px-3 py-1.5 rounded-full text-sm font-semibold transition ${
                  newNotification.audience === 'specific'
                    ? 'bg-[#5AA5FF] text-white shadow'
                    : 'bg-white/10 text-white/75 hover:bg-[#5AA5FF]/30'
                }`}
              >
                Specific Users
              </button>
            </div>

            {/* User Selection (only shown for specific audience) */}
            {newNotification.audience === 'specific' && (
              <div>
                <div className="flex items-center justify-between gap-4">
                  <label className="text-sm text-white font-semibold whitespace-nowrap">
                    Select Users
                  </label>
                  <div className="flex items-center gap-2 w-full max-w-md">
                    <input
                      type="text"
                      value={notificationUserQuery}
                      onChange={(e) => setNotificationUserQuery(e.target.value)}
                      placeholder="Search name or email"
                      className="px-2 py-1 bg-white/10 text-white rounded-md text-sm w-full focus:outline-none focus:ring-2 focus:ring-[#5AA5FF]/50"
                    />
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setNewNotification((n) => ({
                            ...n,
                            selectedUserIds: new Set(
                              notificationInviteableUsers.map((u) => u.id)
                            ),
                          }))
                        }
                        className="px-2 py-1 bg-[#5AA5FF] text-white rounded-md text-sm hover:bg-[#4A95EF] transition-colors"
                      >
                        Select all
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setNewNotification((n) => ({
                            ...n,
                            selectedUserIds: new Set(),
                          }))
                        }
                        className="px-2 py-1 bg-white/20 text-white rounded-md text-sm hover:bg-white/30 transition-colors"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                </div>
                <span className="text-white/60 text-xs">
                  {newNotification.selectedUserIds.size} selected
                </span>
                <div className="max-h-48 overflow-auto mt-2 rounded-lg border border-white/10">
                  {notificationInviteableUsers.length === 0 && (
                    <div className="p-3 text-white/70">No users</div>
                  )}
                  {notificationInviteableUsers.length > 0 && (
                    <ul className="divide-y divide-white/10">
                      {notificationInviteableUsers.map((u) => {
                        const id = u.id;
                        const name =
                          `${u.fname ?? ''} ${u.lname ?? ''}`.trim() ||
                          u.email ||
                          id;
                        const on = newNotification.selectedUserIds.has(id);
                        return (
                          <li
                            key={id}
                            className="flex items-center justify-between p-2 hover:bg-white/5"
                          >
                            <span className="text-white">{name}</span>
                            <label className="text-white/80 text-sm flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={on}
                                onChange={() =>
                                  setNewNotification((n) => {
                                    const newSet = new Set(n.selectedUserIds);
                                    if (newSet.has(id)) {
                                      newSet.delete(id);
                                    } else {
                                      newSet.add(id);
                                    }
                                    return { ...n, selectedUserIds: newSet };
                                  })
                                }
                              />
                              Select
                            </label>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-6">
            <button
              onClick={handleCreateNotification}
              className="flex-1 px-4 py-2 bg-[#5AA5FF] text-white rounded-lg hover:bg-[#3C8CE7] whitespace-nowrap"
            >
              Create Draft
            </button>
            <button
              onClick={closeNotificationDialog}
              className="flex-1 px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-[#5AA5FF] whitespace-nowrap"
            >
              Cancel
            </button>
          </div>
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
        </div>
      </SideDialog>

      {/* Existing Modal for other actions */}
      <Modal open={modalOpen} onClose={closeModal} title={selectedAction ?? ''}>
        <div className="text-white">
          {/* Note: All quick actions now use SideDialogs */}
        </div>
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
