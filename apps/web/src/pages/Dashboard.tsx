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

export default function Dashboard() {
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
    <div className="flex relative gap-x-8">
      {/* LEFT COLUMN */}
      <div className="flex-1 flex flex-col space-y-8 overflow-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium uppercase text-white/70">
              Bomber Dashboard
            </p>
            <h1 className="mt-1 text-3xl font-bold text-white">
              Welcome Back, Scott Smith
            </h1>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4 mb-12">
          <h2 className="text-xl font-semibold text-white">Quick Actions</h2>
          <div className="flex flex-wrap gap-4">
            {quickActions.map(({ title, icon: Icon }) => (
              <div
                key={title}
                className="flex items-center cursor-pointer space-x-2 px-5 py-3 backdrop-blur-lg border border-white/30 text-white rounded-full hover:bg-[#5AA5FF] hover:border-[#5AA5FF] transition-colors"
                onClick={() => handleQuickAction(title)}
              >
                <Icon className="w-5 h-5" />
                <span className="text-base font-medium">{title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Analytics */}
        <div>
          <h2 className="text-xl font-semibold text-white mb-6">
            Bomber Analytics
          </h2>
          <div className="grid grid-cols-2 gap-6">
            {stats.map(({ label, value, icon: Icon }) => (
              <div
                key={label}
                className="flex items-center space-x-4 p-4 bg-[rgba(255,255,255,0.05)] rounded-lg border-l-4 border-[#5AA5FF] hover:shadow-md transition-shadow"
              >
                <Icon className="w-6 h-6 text-white" />
                <div>
                  <p className="text-sm text-white/70 uppercase">{label}</p>
                  <p className="mt-1 text-2xl font-bold text-white">
                    {value.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN */}
      <div className="flex-1 flex flex-col space-y-6 px-4 py-6">
        {/* Users Header + Search */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">
            Organization Users
          </h2>
          <input
            type="text"
            placeholder="Search users..."
            className="w-72 px-4 py-2 bg-[rgba(255,255,255,0.05)] text-white placeholder-white/50 border-none rounded-lg focus:outline-none"
            // TODO: wire up search/filter
          />
        </div>

        {/* Users Table */}
        <div className="bg-[rgba(255,255,255,0.05)] backdrop-blur-lg rounded-xl overflow-hidden shadow-inner">
          <ScrollArea className="h-96">
            <table className="min-w-full table-auto text-white">
              <thead className="sticky top-0 bg-[rgba(255,255,255,0.1)]">
                <tr>
                  <th className="px-6 py-4 text-left">Name</th>
                  <th className="px-6 py-4 text-left">Role</th>
                  <th className="px-6 py-4 text-left">Email</th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.map((u) => (
                  <tr
                    key={u.id}
                    className="hover:bg-[rgba(255,255,255,0.1)] transition-colors"
                  >
                    <td className="px-6 py-3">
                      {u.fname} {u.lname}
                    </td>
                    <td className="px-6 py-3">{u.primaryRole}</td>
                    <td className="px-6 py-3">{u.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ScrollArea>

          {/* Pagination Controls */}
          <div className="flex items-center justify-between p-4 bg-[rgba(255,255,255,0.1)]">
            <button
              onClick={goPrev}
              disabled={currentPage === 1}
              className="px-3 py-1 bg-white/20 rounded disabled:opacity-50"
            >
              Prev
            </button>
            <span className="text-white">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={goNext}
              disabled={currentPage === totalPages}
              className="px-3 py-1 bg-white/20 rounded disabled:opacity-50"
            >
              Next
            </button>
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
