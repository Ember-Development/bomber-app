import React, { useState } from 'react';
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
import SideDialog from '@/components/sideDialog';

export default function Dashboard() {
  const quickActions = [
    { title: 'New Team', icon: UsersIcon },
    { title: 'New Article', icon: DocumentTextIcon },
    { title: 'New Event', icon: CalendarIcon },
    { title: 'New Sponsor', icon: TagIcon },
    { title: 'New Banner', icon: StarIcon },
    { title: 'Notification', icon: BellIcon },
  ];

  const stats = [
    { label: 'Total Users', value: 5671, icon: UserGroupIcon },
    { label: 'Active Users', value: 1234, icon: ChartBarIcon },
    { label: 'Total Teams', value: 123, icon: RectangleStackIcon },
    { label: 'Messages Sent', value: 201121, icon: EnvelopeIcon },
  ];

  const users = [
    {
      name: 'Alice Smith',
      team: '12U',
      role: 'Player',
      email: 'alice@bombers.com',
    },
    {
      name: 'Bob Johnson',
      team: '14U',
      role: 'Coach',
      email: 'bob@bombers.com',
    },
  ];

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);

  // Handler for quick actions
  const handleQuickAction = (title: string) => {
    setSelectedAction(title);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedAction(null);
  };

  return (
    <div className="flex relative min-h-screen gap-x-8">
      {/* LEFT COLUMN */}
      <div className="flex-1 flex flex-col space-y-8 overflow-auto">
        {/* Welcome Header */}
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

        {/* Quick Actions Panel */}
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

        {/* Analytics Panel */}
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
      <div className="flex-1 flex flex-col space-y-6">
        {/* Header with Search */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">
            Organization Users
          </h2>
          <input
            type="text"
            placeholder="Search users..."
            className="w-72 px-4 py-2 bg-[rgba(255,255,255,0.05)] text-white placeholder-white/50 border-none rounded-lg focus:outline-none"
          />
        </div>

        {/* Users Table Panel */}
        <div className=" bg-[rgba(255,255,255,0.05)] backdrop-blur-lg rounded-xl overflow-hidden shadow-inner">
          <ScrollArea className="h-full">
            <table className="min-w-full table-auto text-white">
              <thead className="sticky top-0 bg-[rgba(255,255,255,0.1)]">
                <tr>
                  <th className="px-6 py-4 text-left">Name</th>
                  <th className="px-6 py-4 text-left ">Team</th>
                  <th className="px-6 py-4 text-left">Role</th>
                  <th className="px-6 py-4 text-left">Email</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr
                    key={u.email}
                    className="hover:bg-[rgba(255,255,255,0.1)] transition-colors"
                  >
                    <td className="px-6 py-3">{u.name}</td>
                    <td className="px-6 py-3">{u.team}</td>
                    <td className="px-6 py-3">{u.role}</td>
                    <td className="px-6 py-3">{u.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ScrollArea>
        </div>
      </div>

      {/* SIDEDIALOG */}
      <SideDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        title={selectedAction ?? ''}
      >
        {selectedAction && (
          <div>
            {/* TODO: Replace with form/components per quick action */}
            <p className="text-white text-lg font-semibold">
              {selectedAction} (Coming Soon)
            </p>
            <div className="mt-6">
              {/* Put quick action forms/components here */}
              <button
                className="px-4 py-2 bg-[#5AA5FF] text-white rounded-lg hover:bg-[#3C8CE7] transition"
                onClick={handleCloseDialog}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </SideDialog>
    </div>
  );
}
