// src/pages/Dashboard.tsx
import React, { useState, useEffect } from 'react';
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
import Modal from '@/components/Modal';
import { fetchUsers } from '@/api/user';

import CreateTeamForm from '@/components/forms/Team/CreateTeam';
import CreateArticleForm from '@/components/forms/Media/CreateArticle';
import CreateEventForm from '@/components/forms/Events/CreateEvent';
import CreateSponsorForm from '@/components/forms/Sponsor/CreateSponsor';
import CreateBannerForm from '@/components/forms/Banner/CreateBanner';
import CreateNotificationForm from '@/components/forms/Notification/createNotification';
import { PublicUserFE } from '@bomber-app/database';
import { useAuth } from '@/context/AuthContext';

export default function Dashboard() {
  const { user, isLoading } = useAuth();

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

  // Analytics (hard-coded)
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

  // Modal state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);

  // Fetch users on mount
  useEffect(() => {
    fetchUsers().then(setAllUsers);
  }, []);

  // Pagination calculations
  const totalPages = Math.ceil(allUsers.length / PAGE_SIZE) || 1;
  const paginatedUsers = allUsers.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  // Handlers
  const handleQuickAction = (title: string) => {
    setSelectedAction(title);
    setDialogOpen(true);
  };
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedAction(null);
  };
  const goPrev = () => setCurrentPage((p) => Math.max(1, p - 1));
  const goNext = () => setCurrentPage((p) => Math.min(totalPages, p + 1));

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
        {selectedAction === 'New Event' && (
          <CreateEventForm onSuccess={handleCloseDialog} />
        )}
        {selectedAction === 'New Sponsor' && (
          <CreateSponsorForm onSuccess={handleCloseDialog} />
        )}
        {selectedAction === 'New Banner' && (
          <CreateBannerForm onSuccess={handleCloseDialog} />
        )}
        {selectedAction === 'Notification' && (
          <CreateNotificationForm onSuccess={handleCloseDialog} />
        )}
      </Modal>
    </div>
  );
}
