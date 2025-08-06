// src/pages/MessageLogs.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { fetchMessages } from '@/api/message';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageFE } from '@bomber-app/database';

const STATUS_COLORS: Record<string, string> = {
  delivered: 'bg-green-500',
  failed: 'bg-red-500',
  pending: 'bg-yellow-400',
  system: 'bg-blue-500',
};
const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

function formatDateInput(date: Date) {
  return date.toISOString().slice(0, 10);
}

export default function MessageLogs() {
  const [messages, setMessages] = useState<MessageFE[]>([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState('');
  const [groupFilter, setGroupFilter] = useState('all');
  const [senderFilter, setSenderFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchMessages()
      .then(setMessages)
      .finally(() => setLoading(false));
  }, []);

  const groups = useMemo(
    () =>
      Array.from(
        new Set(messages.map((m) => m.chat?.title || 'Unknown Group'))
      ),
    [messages]
  );
  const senders = useMemo(
    () =>
      Array.from(
        new Set(
          messages.map((m) =>
            m.sender
              ? `${m.sender.fname} ${m.sender.lname}`.trim() || 'Unknown'
              : 'System'
          )
        )
      ),
    [messages]
  );

  const filtered = useMemo(() => {
    return messages
      .map((m) => ({
        id: m.id,
        sender: m.sender
          ? `${m.sender.fname} ${m.sender.lname}`.trim()
          : 'System',
        group: m.chat?.title || 'Unknown Group',
        content: m.text,
        status: m.failedToSend ? 'failed' : m.sender ? 'delivered' : 'system',
        createdAt: new Date(m.createdAt),
        raw: m,
      }))
      .filter((msg) => {
        const q = search.toLowerCase();
        const matchesSearch =
          msg.content.toLowerCase().includes(q) ||
          msg.sender.toLowerCase().includes(q) ||
          msg.group.toLowerCase().includes(q);
        const matchesSender =
          senderFilter === 'all' || msg.sender === senderFilter;
        const matchesGroup = groupFilter === 'all' || msg.group === groupFilter;
        const matchesStart =
          !startDate || msg.createdAt >= new Date(startDate + 'T00:00:00');
        const matchesEnd =
          !endDate || msg.createdAt <= new Date(endDate + 'T23:59:59');
        return (
          matchesSearch &&
          matchesSender &&
          matchesGroup &&
          matchesStart &&
          matchesEnd
        );
      });
  }, [messages, search, senderFilter, groupFilter, startDate, endDate]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    setPage(1);
  }, [search, groupFilter, senderFilter, pageSize, startDate, endDate]);

  const earliest = useMemo(
    () =>
      messages.length
        ? formatDateInput(
            new Date(
              Math.min(...messages.map((m) => new Date(m.createdAt).getTime()))
            )
          )
        : '',
    [messages]
  );
  const latest = useMemo(
    () =>
      messages.length
        ? formatDateInput(
            new Date(
              Math.max(...messages.map((m) => new Date(m.createdAt).getTime()))
            )
          )
        : '',
    [messages]
  );

  return (
    <div className="flex flex-col space-y-6 text-white min-h-screen p-4">
      {/* Header & Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Group Message Logs</h1>
        <div className="flex flex-wrap gap-3 items-center">
          <input
            type="text"
            placeholder="Search messages…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-[150px] px-3 py-2 bg-[rgba(255,255,255,0.08)] placeholder-white/70 text-white rounded-lg border border-white/20"
          />
          <select
            value={groupFilter}
            onChange={(e) => setGroupFilter(e.target.value)}
            className="px-3 py-2 bg-[rgba(255,255,255,0.08)] rounded-lg text-white border border-white/20"
          >
            <option value="all">All Groups</option>
            {groups.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
          <select
            value={senderFilter}
            onChange={(e) => setSenderFilter(e.target.value)}
            className="px-3 py-2 bg-[rgba(255,255,255,0.08)] rounded-lg text-white border border-white/20"
          >
            <option value="all">All Senders</option>
            {senders.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={startDate}
            min={earliest}
            max={endDate || latest}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-3 py-2 bg-[rgba(255,255,255,0.08)] rounded-lg text-white border border-white/20"
          />
          <input
            type="date"
            value={endDate}
            min={startDate || earliest}
            max={latest}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-3 py-2 bg-[rgba(255,255,255,0.08)] rounded-lg text-white border border-white/20"
          />
          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="px-3 py-2 bg-[rgba(255,255,255,0.08)] rounded-lg text-white border border-white/20"
          >
            {PAGE_SIZE_OPTIONS.map((n) => (
              <option key={n} value={n}>
                Show {n}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Meta info */}
      <div className="flex flex-col sm:flex-row justify-between text-sm text-white/60">
        <span>
          Showing {paginated.length} of {filtered.length} messages
          {filtered.length !== messages.length &&
            ` (filtered from ${messages.length})`}
        </span>
        <span>
          Page {page} / {totalPages}
        </span>
      </div>

      {/* Table */}
      <div className="flex-1 bg-[rgba(255,255,255,0.06)] backdrop-blur-2xl rounded-2xl shadow-inner p-4 flex flex-col">
        {loading ? (
          <div className="text-center text-white/70 py-12">Loading…</div>
        ) : (
          <>
            <div className="overflow-x-auto flex-1 rounded-lg">
              <table className="min-w-full table-auto text-white">
                <thead className="bg-[#5AA5FF] sticky top-0">
                  <tr>
                    <th className="p-2 text-left text-xs">Date</th>
                    <th className="p-2 text-left text-xs">Time</th>
                    <th className="p-2 text-left text-xs hidden md:table-cell">
                      Group
                    </th>
                    <th className="p-2 text-left text-xs hidden lg:table-cell">
                      Sender
                    </th>
                    <th className="p-2 text-left text-xs">Message</th>
                    <th className="p-2 text-center text-xs">Status</th>
                    <th className="p-2 text-center text-xs">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="text-center py-6 text-white/60"
                      >
                        No messages found.
                      </td>
                    </tr>
                  ) : (
                    paginated.map((msg) => (
                      <React.Fragment key={msg.id}>
                        <tr className="hover:bg-[rgba(90,165,255,0.08)] transition">
                          <td className="p-2 text-sm">
                            {msg.createdAt.toLocaleDateString()}
                          </td>
                          <td className="p-2 text-sm">
                            {msg.createdAt.toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </td>
                          <td className="p-2 text-sm hidden md:table-cell">
                            {msg.group}
                          </td>
                          <td className="p-2 text-sm hidden lg:table-cell">
                            {msg.sender}
                          </td>
                          <td className="p-2 text-sm max-w-xs truncate">
                            {msg.content}
                          </td>
                          <td className="p-2 text-center">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-bold ${STATUS_COLORS[msg.status]}`}
                            >
                              {msg.status.charAt(0).toUpperCase() +
                                msg.status.slice(1)}
                            </span>
                          </td>
                          <td className="p-2 text-center">
                            <button
                              className="px-2 py-1 text-xs bg-[rgba(255,255,255,0.13)] rounded hover:bg-[#5AA5FF] transition"
                              onClick={() =>
                                setExpanded((curr) =>
                                  curr === msg.id ? null : msg.id
                                )
                              }
                            >
                              {expanded === msg.id ? 'Hide' : 'Details'}
                            </button>
                          </td>
                        </tr>
                        {expanded === msg.id && (
                          <tr className="bg-[rgba(90,165,255,0.08)]">
                            <td colSpan={7} className="p-4 text-sm">
                              <div className="space-y-2">
                                <div>
                                  <b>Full Message:</b> {msg.content}
                                </div>
                                <div>
                                  <b>Status:</b> {msg.status}
                                </div>
                                <div>
                                  <b>Message ID:</b> {msg.id}
                                </div>
                                <div>
                                  <b>Sender:</b> {msg.sender}
                                </div>
                                <div>
                                  <b>Group:</b> {msg.group}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-center items-center space-x-4 py-3">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 bg-[#5AA5FF] rounded disabled:opacity-50"
              >
                Prev
              </button>
              <span className="text-white/70">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page === totalPages}
                className="px-3 py-1 bg-[#5AA5FF] rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
