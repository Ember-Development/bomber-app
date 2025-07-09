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
  // YYYY-MM-DD for input[type="date"]
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

  // Date range filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Row expansion state
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

  // Map and filter
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
        const matchesSearch =
          msg.content.toLowerCase().includes(search.toLowerCase()) ||
          msg.sender.toLowerCase().includes(search.toLowerCase()) ||
          msg.group.toLowerCase().includes(search.toLowerCase());
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

  // Pagination logic
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  // Reset page if filter/search/pagesize changes
  useEffect(() => {
    setPage(1);
  }, [search, groupFilter, senderFilter, pageSize, startDate, endDate]);

  // Optionally, set min/max dates for date pickers
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
    <div className="flex flex-col space-y-6 text-white min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-2xl font-bold">Group Message Logs</h1>
        <div className="flex gap-4 flex-wrap">
          <input
            type="text"
            placeholder="Search messages…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64 px-4 py-2 bg-[rgba(255,255,255,0.08)] placeholder-white/70 text-white rounded-lg focus:outline-none border border-white/20"
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
            placeholder="Start"
            style={{ minWidth: 120 }}
          />
          <input
            type="date"
            value={endDate}
            min={startDate || earliest}
            max={latest}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-3 py-2 bg-[rgba(255,255,255,0.08)] rounded-lg text-white border border-white/20"
            placeholder="End"
            style={{ minWidth: 120 }}
          />
          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="px-3 py-2 bg-[rgba(255,255,255,0.08)] rounded-lg text-white border border-white/20"
            style={{ minWidth: 90 }}
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
      <div className="flex flex-wrap justify-between items-center">
        <span className="text-white/60">
          Showing {paginated.length} of {filtered.length} messages
          {filtered.length !== messages.length && (
            <> (filtered from {messages.length} total)</>
          )}
        </span>
        <span className="text-white/50 text-xs italic">
          Page {page} / {totalPages}
        </span>
      </div>

      {/* Glass Table */}
      <div className="flex-1 bg-[rgba(255,255,255,0.06)] backdrop-blur-2xl rounded-2xl shadow-inner p-4 flex flex-col">
        {loading ? (
          <div className="text-center text-white/70 py-12">Loading...</div>
        ) : (
          <>
            <div className="overflow-auto max-h-full rounded-lg">
              <table className="min-w-full table-auto text-white">
                <thead className="sticky top-0 z-10 backdrop-blur-md bg-[#5AA5FF]">
                  <tr>
                    <th className="px-4 py-3 text-left">Date</th>
                    <th className="px-4 py-3 text-left">Time</th>
                    <th className="px-4 py-3 text-left">Group</th>
                    <th className="px-4 py-3 text-left">Sender</th>
                    <th className="px-4 py-3 text-left">Message</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.length === 0 && (
                    <tr>
                      <td
                        colSpan={7}
                        className="text-center text-white/60 py-6"
                      >
                        No group messages found.
                      </td>
                    </tr>
                  )}
                  {paginated.map((msg) => (
                    <React.Fragment key={msg.id}>
                      <tr
                        className={`hover:bg-[rgba(90,165,255,0.08)] transition ${expanded === msg.id ? 'border-b-0' : ''}`}
                      >
                        <td className="px-4 py-3">
                          {msg.createdAt.toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          {msg.createdAt.toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="px-4 py-3 font-semibold">{msg.group}</td>
                        <td className="px-4 py-3">{msg.sender}</td>
                        <td className="px-4 py-3 max-w-xs truncate">
                          {msg.content}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${STATUS_COLORS[msg.status] || 'bg-gray-400'}`}
                          >
                            {msg.status.charAt(0).toUpperCase() +
                              msg.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            className={`px-2 py-1 bg-[rgba(255,255,255,0.13)] rounded-lg hover:bg-[#5AA5FF] transition text-xs ${
                              expanded === msg.id ? 'font-bold underline' : ''
                            }`}
                            title="Expand"
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
                        <tr className="bg-[rgba(90,165,255,0.08)] border-t-0">
                          <td colSpan={7} className="px-6 py-4 text-sm">
                            <div className="flex flex-col md:flex-row md:space-x-8">
                              <div className="flex-1 mb-2 md:mb-0">
                                <div>
                                  <b>Full Message:</b>
                                  <div className="mt-1 p-2 bg-black/20 rounded">
                                    {msg.content}
                                  </div>
                                </div>
                                <div className="mt-2">
                                  <b>Status:</b>{' '}
                                  <span
                                    className={
                                      STATUS_COLORS[msg.status] +
                                      ' px-2 py-1 rounded'
                                    }
                                  >
                                    {msg.status}
                                  </span>
                                </div>
                              </div>
                              <div className="flex-1">
                                <div>
                                  <b>Message ID:</b> {msg.id}
                                </div>
                                <div>
                                  <b>Sender:</b> {msg.sender}
                                </div>
                                <div>
                                  <b>Group:</b> {msg.group}
                                </div>
                                <div>
                                  <b>Date:</b> {msg.createdAt.toLocaleString()}
                                </div>
                                <div>
                                  <b>Failed to Send:</b>{' '}
                                  {msg.raw.failedToSend ? 'Yes' : 'No'}
                                </div>
                                <div>
                                  <b>Retry Count:</b> {msg.raw.retryCount}
                                </div>
                                <div>
                                  <b>Chat ID:</b> {msg.raw.chatID}
                                </div>
                                <div>
                                  <b>User ID:</b> {msg.raw.userID}
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Pagination Controls */}
            <div className="flex items-center justify-center mt-4 space-x-2">
              <button
                className="px-3 py-1 rounded bg-[#5AA5FF] text-white disabled:bg-[#5AA5FF]/40"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Prev
              </button>
              <span className="text-white/80">
                Page {page} / {totalPages}
              </span>
              <button
                className="px-3 py-1 rounded bg-[#5AA5FF] text-white disabled:bg-[#5AA5FF]/40"
                onClick={() => setPage((p) => (p < totalPages ? p + 1 : p))}
                disabled={page === totalPages}
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
