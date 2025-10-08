// src/pages/event.tsx
import React, { useState, useEffect, useMemo, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { ChevronRightIcon, PlusIcon } from '@heroicons/react/24/outline';
import { ScrollArea } from '@/components/ui/scroll-area';
import SideDialog from '@/components/SideDialog';
import {
  fetchEvents,
  fetchEventById,
  fetchEventAttendees,
  createEvent,
  updateEvent,
  deleteEvent,
  addEventAttendees,
  removeEventAttendee,
} from '@/api/event';
import { fetchUsers } from '@/api/user';
import type { EventFE, UserFE } from '@bomber-app/database';

type EventType = 'TOURNAMENT' | 'PRACTICE' | 'GLOBAL';
type DateFilter = 'All' | 'Upcoming' | 'Past';

function toDisplayEvent(e: EventFE) {
  return {
    id: e.id,
    date: new Date(e.start),
    allDay: true,
    type: e.eventType as EventType,
    title: e.title || e.tournament?.title || e.eventType,
    // show event.body (details) and location, like mobile
    location: e.location || '',
    details: e.body || '',
    attendees: e.attendees?.length ?? 0,
    attendeeNames:
      e.attendees
        ?.map((a) =>
          a.user ? `${a.user.fname ?? ''} ${a.user.lname ?? ''}`.trim() : ''
        )
        .filter(Boolean)
        .join(', ') || '',
    raw: e,
  };
}

/** tiny helpers like mobile */
const US_STATES: { label: string; value: string }[] = [
  { label: 'Alabama', value: 'Alabama' },
  { label: 'Alaska', value: 'Alaska' } /* ... fill yours ... */,
];
const toAbbr = (stateName?: string) => {
  // you likely already have util; keep this inline or import from utils/state
  const m: Record<string, string> = {
    Alabama: 'AL',
    Alaska: 'AK' /* ... */,
  };
  return stateName && m[stateName] ? m[stateName] : '';
};
const getStateName = (input: string) => {
  // normalize from abbr to full; minimal logic (you can import your utils)
  const pairs: Array<[string, string]> = [
    ['AL', 'Alabama'],
    ['AK', 'Alaska'] /* ... */,
  ];
  const byAbbr = new Map(pairs);
  const byName = new Map(pairs.map(([a, n]) => [n.toLowerCase(), n]));
  const t = input.trim();
  if (byAbbr.has(t.toUpperCase())) return byAbbr.get(t.toUpperCase())!;
  return byName.get(t.toLowerCase()) ?? input;
};
const splitLocation = (
  loc?: string | null
): { city: string; state: string } => {
  if (!loc) return { city: '', state: '' };
  const parts = loc.split(',').map((s) => s.trim());
  if (parts.length === 2)
    return { city: parts[0], state: getStateName(parts[1]) };
  return { city: loc, state: '' };
};

export default function Events() {
  const calendarRef = useRef<FullCalendar>(null);

  const [events, setEvents] = useState<EventFE[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'cards' | 'calendar'>('cards');
  const [dateFilter, setDateFilter] = useState<DateFilter>('All');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [typeFilter, setTypeFilter] = useState<'All' | EventType>('All');

  // dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<
    'create' | 'edit' | 'view' | 'delete' | null
  >(null);
  const [selectedEvent, setSelectedEvent] = useState<ReturnType<
    typeof toDisplayEvent
  > | null>(null);

  // users for attendee pickers (mirrors mobile)
  const [allUsers, setAllUsers] = useState<UserFE[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);

  const [showAllByMonth, setShowAllByMonth] = useState<Record<string, boolean>>(
    {}
  );

  useEffect(() => {
    setLoading(true);
    fetchEvents()
      .then(setEvents)
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setUsersLoading(true);
    fetchUsers()
      .then((list) =>
        setAllUsers(
          (list as unknown as UserFE[]).filter((u) => u.primaryRole !== 'FAN')
        )
      )
      .catch(() => setAllUsers([]))
      .finally(() => setUsersLoading(false));
  }, []);

  const displayEvents = useMemo(() => events.map(toDisplayEvent), [events]);
  const uniqueTypes = useMemo(
    () => Array.from(new Set(displayEvents.map((e) => e.type))),
    [displayEvents]
  );

  const now = new Date();
  const next30 = new Date(now);
  next30.setDate(now.getDate() + 30);
  const last30 = new Date(now);
  last30.setDate(now.getDate() - 30);

  const filtered = useMemo(() => {
    return displayEvents
      .filter((e) => {
        if (dateFilter === 'Upcoming') return e.date >= now && e.date <= next30;
        if (dateFilter === 'Past') return e.date < now && e.date >= last30;
        return true;
      })
      .filter((e) => {
        if (start && new Date(start) > e.date) return false;
        if (end && new Date(end) < e.date) return false;
        if (typeFilter !== 'All' && e.type !== typeFilter) return false;
        return true;
      });
  }, [dateFilter, start, end, typeFilter, displayEvents]);

  const grouped = useMemo(() => {
    const map: Record<string, typeof filtered> = {};
    filtered.forEach((e) => {
      const key = e.date.toLocaleString('default', {
        month: 'long',
        year: 'numeric',
      });
      map[key] = map[key] || [];
      map[key].push(e);
    });
    return Object.entries(map);
  }, [filtered]);

  const openCreate = () => {
    setDialogType('create');
    setSelectedEvent(null);
    setDialogOpen(true);
  };
  const openEdit = (e: ReturnType<typeof toDisplayEvent>) => {
    setDialogType('edit');
    setSelectedEvent(e);
    setDialogOpen(true);
  };
  const openView = async (e: ReturnType<typeof toDisplayEvent>) => {
    // load fresh for details/attendees; keep same look
    const fresh = await fetchEventById(e.id);
    const enriched = toDisplayEvent(fresh);
    setSelectedEvent(enriched);
    setDialogType('view');
    setDialogOpen(true);
  };
  const openDelete = (e: ReturnType<typeof toDisplayEvent>) => {
    setDialogType('delete');
    setSelectedEvent(e);
    setDialogOpen(true);
  };
  const closeDialog = () => {
    setDialogOpen(false);
    setDialogType(null);
    setSelectedEvent(null);
  };

  function handleCalendarEventClick(arg: any) {
    const ev = filtered.find((e) => e.id === arg.event.id);
    if (ev) openView(ev); // view first, can click "Edit" inside
  }

  // --- Forms that mirror mobile ---

  function CreateForm() {
    const [eventType, setEventType] = useState<EventType>('PRACTICE');
    const [title, setTitle] = useState('');
    const [city, setCity] = useState('');
    const [stateVal, setStateVal] = useState('');
    const [body, setBody] = useState('');
    const [startIso, setStartIso] = useState('');
    const [endIso, setEndIso] = useState('');

    // Attendees pick (simple: multi-select by checkbox)
    const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(
      new Set()
    );

    const location = useMemo(() => {
      const c = city.trim();
      const s = toAbbr(getStateName(stateVal || ''));
      if (c && s) return `${c}, ${s}`;
      if (c) return c;
      if (s) return s;
      return '';
    }, [city, stateVal]);

    const [userQuery, setUserQuery] = useState('');
    const inviteableUsers = useMemo(
      () =>
        allUsers
          .filter((u) => u.primaryRole !== 'FAN')
          .filter((u) => {
            const name =
              `${u.fname ?? ''} ${u.lname ?? ''} ${u.email ?? ''}`.toLowerCase();
            return name.includes(userQuery.toLowerCase());
          }),
      [allUsers, userQuery]
    );

    const toggle = (id: string) =>
      setSelectedUserIds((prev) => {
        const next = new Set(prev);
        next.has(id) ? next.delete(id) : next.add(id);
        return next;
      });

    const selectAll = () => {
      setSelectedUserIds(new Set(inviteableUsers.map((u) => u.id)));
    };
    const clearAll = () => setSelectedUserIds(new Set());

    const onSave = async () => {
      // Only include attendees for non-GLOBAL events
      const attendees =
        eventType !== 'GLOBAL'
          ? Array.from(selectedUserIds).map((userID) => ({
              userID,
              status: 'PENDING' as const,
            }))
          : [];

      const payload = {
        event: {
          eventType,
          start: new Date(startIso).toISOString(),
          end: new Date(endIso).toISOString(),
          title:
            title.trim() ||
            (eventType === 'PRACTICE' ? 'Practice' : 'Tournament'),
          body: body.trim() || null,
          location: location || null,
        },
        attendees,
        tournamentID: null,
      };

      try {
        const created = await createEvent(payload);
        // Refresh list
        const fresh = await fetchEvents();
        setEvents(fresh);
        closeDialog();
      } catch (error) {
        console.error('Failed to create event:', error);
        // Optionally show user feedback (e.g., toast notification)
        alert(
          'Failed to create event: ' +
            (error instanceof Error ? error.message : String(error))
        );
      }
    };

    return (
      <div className="space-y-4">
        {/* Type */}
        <div>
          <label className="block text-sm text-white font-semibold">Type</label>
          <div className="flex gap-2 mt-1">
            {(['PRACTICE', 'TOURNAMENT', 'GLOBAL'] as EventType[]).map((t) => (
              <button
                key={t}
                onClick={() => setEventType(t)}
                className={`px-3 py-1 rounded-lg text-sm ${
                  eventType === t
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
            value={title}
            onChange={(e) => setTitle(e.target.value)}
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
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="City (e.g., College Station)"
              className="w-full px-4 py-2 bg-white/10 text-white rounded-lg"
            />
            <select
              value={stateVal}
              onChange={(e) => setStateVal(e.target.value)}
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
            value={body}
            onChange={(e) => setBody(e.target.value)}
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
              value={startIso}
              onChange={(e) => setStartIso(e.target.value)}
              className="w-full px-4 py-2 bg-white/10 text-white rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm text-white font-semibold">
              End
            </label>
            <input
              type="datetime-local"
              value={endIso}
              onChange={(e) => setEndIso(e.target.value)}
              className="w-full px-4 py-2 bg-white/10 text-white rounded-lg"
            />
          </div>
        </div>

        {/* Invitees (hidden for GLOBAL events) */}
        {eventType !== 'GLOBAL' && (
          <div>
            <div className="flex items-center justify-between gap-4">
              <label className="text-sm text-white font-semibold whitespace-nowrap">
                Invitees
              </label>
              <div className="flex items-center gap-2 w-full max-w-md">
                <input
                  type="text"
                  value={userQuery}
                  onChange={(e) => setUserQuery(e.target.value)}
                  placeholder="Search name or email"
                  className="px-2 py-1 bg-white/10 text-white rounded-md text-sm w-full focus:outline-none focus:ring-2 focus:ring-[#5AA5FF]/50"
                />
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={selectAll}
                    className="px-2 py-1 bg-[#5AA5FF] text-white rounded-md text-sm hover:bg-[#4A95EF] transition-colors"
                  >
                    Select all
                  </button>
                  <button
                    type="button"
                    onClick={clearAll}
                    className="px-2 py-1 bg-white/20 text-white rounded-md text-sm hover:bg-white/30 transition-colors"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>
            <span className="text-white/60 text-xs">
              {selectedUserIds.size} selected
            </span>
            <div className="max-h-48 overflow-auto mt-2 rounded-lg border border-white/10">
              {usersLoading && (
                <div className="p-3 text-white/70">Loading users…</div>
              )}
              {!usersLoading && inviteableUsers.length === 0 && (
                <div className="p-3 text-white/70">No users</div>
              )}
              {!usersLoading && inviteableUsers.length > 0 && (
                <ul className="divide-y divide-white/10">
                  {inviteableUsers.map((u) => {
                    const id = u.id;
                    const name =
                      `${u.fname ?? ''} ${u.lname ?? ''}`.trim() ||
                      u.email ||
                      id;
                    const on = selectedUserIds.has(id);
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
                            onChange={() => toggle(id)}
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
        {eventType === 'GLOBAL' && (
          <div className="text-white/70 text-sm">
            Global events are visible to all users and do not require specific
            invitees.
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row sm:space-x-4 mt-6">
          <button
            onClick={onSave}
            className="flex-1 px-4 py-2 bg-[#5AA5FF] text-white rounded-lg hover:bg-[#3C8CE7] whitespace-nowrap"
          >
            Save
          </button>
          <button
            onClick={closeDialog}
            className="flex-1 mt-4 sm:mt-0 px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-[#5AA5FF] whitespace-nowrap"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  function EditForm({ event }: { event: ReturnType<typeof toDisplayEvent> }) {
    const { city: initCity, state: initState } = splitLocation(event.location);
    const [eventType, setEventType] = useState<EventType>(event.type);
    const [title, setTitle] = useState(event.title ?? '');
    const [city, setCity] = useState(initCity);
    const [stateVal, setStateVal] = useState(initState);
    const [body, setBody] = useState(event.details ?? '');
    const [startIso, setStartIso] = useState(
      new Date(event.raw.start).toISOString().slice(0, 16)
    );
    const [endIso, setEndIso] = useState(
      new Date(event.raw.end).toISOString().slice(0, 16)
    );

    const [attendees, setAttendees] = useState<
      Array<{ userId: string; name: string }>
    >([]);
    const [addIds, setAddIds] = useState<Set<string>>(new Set()); // to add
    const [removeIds, setRemoveIds] = useState<Set<string>>(new Set()); // to remove
    const [addQuery, setAddQuery] = useState('');

    useEffect(() => {
      // load attendees list
      fetchEventAttendees(event.id).then((rows) => {
        const mapped = rows
          .map((r) => ({
            userId: r.user?.id,
            name: `${r.user?.fname ?? ''} ${r.user?.lname ?? ''}`.trim(),
          }))
          .filter((x) => x.userId) as Array<{ userId: string; name: string }>;
        setAttendees(mapped);
        setAddIds(new Set());
        setRemoveIds(new Set());
      });
    }, [event.id]);

    const location = useMemo(() => {
      const c = city.trim();
      const s = toAbbr(getStateName(stateVal || ''));
      if (c && s) return `${c}, ${s}`;
      if (c) return c;
      if (s) return s;
      return '';
    }, [city, stateVal]);

    const addList = useMemo(
      () =>
        allUsers
          .filter((u) => u.primaryRole !== 'FAN')
          // optional: exclude already-attending users from "add" list:
          .filter((u) => !attendees.some((a) => a.userId === u.id))
          .filter((u) => {
            const hay =
              `${u.fname ?? ''} ${u.lname ?? ''} ${u.email ?? ''}`.toLowerCase();
            return hay.includes(addQuery.toLowerCase());
          }),
      [allUsers, attendees, addQuery]
    );

    const addSelectAll = () => setAddIds(new Set(addList.map((u) => u.id)));
    const addClearAll = () => setAddIds(new Set());

    const toggleAdd = (id: string) =>
      setAddIds((prev) => {
        const next = new Set(prev);
        next.has(id) ? next.delete(id) : next.add(id);
        return next;
      });
    const toggleRemove = (id: string) =>
      setRemoveIds((prev) => {
        const next = new Set(prev);
        next.has(id) ? next.delete(id) : next.add(id);
        return next;
      });

    const onSave = async () => {
      // 1) update event core fields (like mobile)
      await updateEvent(event.id, {
        eventType,
        start: new Date(startIso).toISOString(),
        end: new Date(endIso).toISOString(),
        title: title.trim() || null,
        body: body.trim() || null,
        location: location || null,
      });

      // 2) apply attendee diffs
      if (addIds.size > 0) {
        await addEventAttendees(event.id, Array.from(addIds), 'PENDING');
      }
      for (const rid of Array.from(removeIds)) {
        await removeEventAttendee(event.id, rid);
      }

      // refresh page data
      const fresh = await fetchEvents();
      setEvents(fresh);

      // if we are on "view", also refresh selected
      const freshDetail = await fetchEventById(event.id);
      setSelectedEvent(toDisplayEvent(freshDetail));

      closeDialog();
    };

    return (
      <div className="space-y-4">
        {/* Type */}
        <div>
          <label className="block text-sm text-white font-semibold">Type</label>
          <div className="flex gap-2 mt-1">
            {(['PRACTICE', 'TOURNAMENT', 'GLOBAL'] as EventType[]).map((t) => (
              <button
                key={t}
                onClick={() => setEventType(t)}
                className={`px-3 py-1 rounded-lg text-sm ${
                  eventType === t
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
            value={title}
            onChange={(e) => setTitle(e.target.value)}
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
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="City"
              className="w-full px-4 py-2 bg-white/10 text-white rounded-lg"
            />
            <select
              value={stateVal}
              onChange={(e) => setStateVal(e.target.value)}
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
            Details
          </label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Facility / address / notes"
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
              value={startIso}
              onChange={(e) => setStartIso(e.target.value)}
              className="w-full px-4 py-2 bg-white/10 text-white rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm text-white font-semibold">
              End
            </label>
            <input
              type="datetime-local"
              value={endIso}
              onChange={(e) => setEndIso(e.target.value)}
              className="w-full px-4 py-2 bg-white/10 text-white rounded-lg"
            />
          </div>
        </div>

        {/* Attendees – add */}
        <div>
          <div className="flex items-center justify-between">
            <label className="block text-sm text-white font-semibold">
              Add People
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={addQuery}
                onChange={(e) => setAddQuery(e.target.value)}
                placeholder="Search name or email"
                className="px-2 py-1 bg-white/10 text-white rounded"
              />
              <button
                type="button"
                onClick={addSelectAll}
                className="px-2 py-1 bg-[#5AA5FF] text-white rounded"
              >
                Select all
              </button>
              <button
                type="button"
                onClick={addClearAll}
                className="px-2 py-1 bg-white/20 text-white rounded"
              >
                Clear
              </button>
              <span className="text-white/60 text-xs ml-2">
                {addIds.size} to add
              </span>
            </div>
          </div>

          <div className="max-h-40 overflow-auto mt-2 rounded-lg border border-white/10">
            <ul className="divide-y divide-white/10">
              {addList.map((u) => {
                const id = u.id;
                const name =
                  `${u.fname ?? ''} ${u.lname ?? ''}`.trim() || u.email || id;
                const on = addIds.has(id);
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
                        onChange={() => toggleAdd(id)}
                      />
                      Add
                    </label>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
        {/* Attendees – existing removable */}
        <div>
          <div className="flex items-center justify-between">
            <label className="block text-sm text-white font-semibold">
              Current Attendees
            </label>
            <span className="text-white/60 text-xs">{attendees.length}</span>
          </div>
          <div className="max-h-40 overflow-auto mt-2 rounded-lg border border-white/10">
            <ul className="divide-y divide-white/10">
              {attendees.map((a) => {
                const on = removeIds.has(a.userId);
                return (
                  <li
                    key={a.userId}
                    className="flex items-center justify-between p-2 hover:bg-white/5"
                  >
                    <span className="text-white">{a.name || a.userId}</span>
                    <label className="text-white/80 text-sm flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={on}
                        onChange={() => toggleRemove(a.userId)}
                      />
                      Remove
                    </label>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row sm:space-x-4 mt-6">
          <button
            onClick={onSave}
            className="flex-1 px-4 py-2 bg-[#5AA5FF] text-white rounded-lg hover:bg-[#3C8CE7] whitespace-nowrap"
          >
            Save
          </button>
          <button
            onClick={closeDialog}
            className="flex-1 mt-4 sm:mt-0 px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-[#5AA5FF] whitespace-nowrap"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  function ViewPanel({ event }: { event: ReturnType<typeof toDisplayEvent> }) {
    const [attRows, setAttRows] = useState<
      Array<{
        status: string;
        user: { id: string; fname?: string | null; lname?: string | null };
      }>
    >([]);

    useEffect(() => {
      fetchEventAttendees(event.id)
        .then(setAttRows)
        .catch(() => setAttRows([]));
    }, [event.id]);

    const when = useMemo(() => {
      const start = new Date(event.raw.start);
      const end = new Date(event.raw.end);
      const sameDay = start.toDateString() === end.toDateString();
      const dateStr = sameDay
        ? start.toLocaleDateString(undefined, {
            weekday: 'long',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })
        : `${start.toLocaleDateString()} – ${end.toLocaleDateString()}`;
      const timeStr = `${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} – ${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
      return `${dateStr}\n${timeStr}`;
    }, [event]);

    return (
      <div className="space-y-4">
        <div className="text-xl font-semibold text-white">{event.title}</div>
        <div className="flex gap-2">
          <span className="inline-block bg-[#5AA5FF] px-2 py-0.5 rounded-full text-xs text-white">
            {event.type}
          </span>
        </div>
        <div className="h-px bg-white/10 my-2" />
        <div className="text-white/80 whitespace-pre-line">
          <div className="mb-2">
            <b className="text-white">When</b>
            <br />
            {when}
          </div>
          <div className="mb-2">
            <b className="text-white">Where</b>
            <br />
            {event.location || '—'}
          </div>
          {event.details && (
            <div className="mb-2">
              <b className="text-white">Details</b>
              <br />
              {event.details}
            </div>
          )}
        </div>

        <div className="h-px bg-white/10 my-2" />
        <div>
          <div className="text-white font-semibold mb-2">Attendees</div>
          {attRows.length === 0 && (
            <div className="text-white/60">No attendees</div>
          )}
          {attRows.length > 0 && (
            <ul className="space-y-1">
              {attRows.slice(0, 12).map((a, idx) => (
                <li key={idx} className="text-white/90 flex justify-between">
                  <span>
                    {`${a.user.fname ?? ''} ${a.user.lname ?? ''}`.trim() ||
                      a.user.id}
                  </span>
                  <span className="text-white/50 text-xs">{a.status}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex gap-2 mt-4">
          <button
            onClick={() => setDialogType('edit')}
            className="px-4 py-2 bg-[#5AA5FF] rounded-lg text-white"
          >
            Edit Event
          </button>
          <button
            onClick={() => setDialogType('delete')}
            className="px-4 py-2 bg-red-600 rounded-lg text-white"
          >
            Delete
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex relative min-h-screen">
      <div
        className={`flex-1 flex flex-col space-y-6 ${dialogOpen ? 'pr-[50px]' : ''}`}
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <button
            onClick={openCreate}
            className="flex-shrink-0 flex items-center justify-center space-x-2 px-4 py-2 bg-[rgba(255,255,255,0.15)] backdrop-blur-lg border border-white/30 text-white rounded-full hover:bg-[#5AA5FF] hover:border-[#5AA5FF] transition whitespace-nowrap"
          >
            <PlusIcon className="w-5 h-5" />
            <span className="font-medium">Create Event</span>
          </button>

          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('cards')}
              className={`px-4 py-2 rounded-lg transition whitespace-nowrap ${
                viewMode === 'cards'
                  ? 'bg-[#5AA5FF] text-white'
                  : 'bg-[rgba(255,255,255,0.1)] text-white/70 hover:bg-[rgba(255,255,255,0.2)]'
              }`}
            >
              Cards
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-4 py-2 rounded-lg transition whitespace-nowrap ${
                viewMode === 'calendar'
                  ? 'bg-[#5AA5FF] text-white'
                  : 'bg-[rgba(255,255,255,0.1)] text-white/70 hover:bg-[rgba(255,255,255,0.2)]'
              }`}
            >
              Calendar
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-[rgba(255,255,255,0.10)] backdrop-blur-2xl rounded-2xl px-4 sm:px-8 py-6 mb-2 shadow-md border border-white/10">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-white/70 mb-1 block">
                Start Date
              </label>
              <div className="flex items-center bg-[rgba(255,255,255,0.05)] border border-white/20 rounded-lg px-2">
                <input
                  type="date"
                  value={start}
                  onChange={(e) => setStart(e.target.value)}
                  className="w-full px-2 py-2 bg-transparent text-white focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-white/70 mb-1 block">
                End Date
              </label>
              <div className="flex items-center bg-[rgba(255,255,255,0.05)] border border-white/20 rounded-lg px-2">
                <input
                  type="date"
                  value={end}
                  onChange={(e) => setEnd(e.target.value)}
                  className="w-full px-2 py-2 bg-transparent text-white focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-white/70 mb-1 block">
                Show Events
              </label>
              <div className="flex flex-wrap gap-2">
                {(['All', 'Upcoming', 'Past'] as DateFilter[]).map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setDateFilter(opt)}
                    className={`px-3 py-1 rounded-full transition text-sm font-semibold whitespace-nowrap ${
                      dateFilter === opt
                        ? 'bg-[#5AA5FF] text-white shadow'
                        : 'bg-[rgba(255,255,255,0.08)] text-white/70 hover:bg-[#5AA5FF]/30'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-white/70 mb-1 block">
                Type
              </label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as any)}
                className="w-full px-3 py-2 bg-[rgba(255,255,255,0.08)] rounded-lg text-white focus:outline-none border border-white/10"
              >
                <option value="All" className="text-black">
                  All Types
                </option>
                {uniqueTypes.map((t) => (
                  <option key={t} value={t} className="text-black">
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Empty / Loading */}
        {!loading && filtered.length === 0 && (
          <div className="text-white text-lg text-center py-16">
            {dateFilter === 'Upcoming'
              ? 'No upcoming events'
              : dateFilter === 'Past'
                ? 'No recent past events'
                : 'No events found'}
          </div>
        )}
        {loading && (
          <div className="text-white text-lg text-center py-16">
            Loading events…
          </div>
        )}

        {/* Cards vs Calendar – SAME LOOK */}
        {!loading && viewMode === 'cards' ? (
          <ScrollArea className="space-y-8">
            {grouped.map(([month, evs]) => {
              const showAll = !!showAllByMonth[month];
              const limit = 8;
              const shown = showAll ? evs : evs.slice(0, limit);
              return (
                <div key={month} className="text-white">
                  <h3 className="text-xl font-semibold mb-2">{month}</h3>
                  <div className="space-y-4">
                    {shown.map((e) => {
                      const dayName = e.date.toLocaleString('default', {
                        weekday: 'short',
                      });
                      const dayNum = e.date.getDate();
                      return (
                        <div
                          key={e.id}
                          onClick={() => openView(e)}
                          className="flex flex-col sm:flex-row items-start sm:items-center p-4 sm:p-6 bg-[rgba(255,255,255,0.1)] backdrop-blur-lg rounded-xl hover:bg-[rgba(255,255,255,0.2)] transition cursor-pointer"
                        >
                          <div className="w-full sm:w-20 text-white flex flex-row sm:flex-col items-center sm:items-center mb-4 sm:mb-0">
                            <span className="text-sm font-medium text-[#5AA5FF] mr-2 sm:mr-0">
                              {dayName}
                            </span>
                            <span className="text-xl font-bold">{dayNum}</span>
                          </div>
                          <div className="flex-1 ml-0 sm:ml-6 flex flex-col sm:flex-row justify-between text-white w-full">
                            <div className="mb-4 sm:mb-0">
                              <div>All Day</div>
                              <div className="inline-block bg-[#5AA5FF] px-2 py-0.5 rounded-full text-xs mt-1">
                                {e.type}
                              </div>
                            </div>
                            <div className="flex-1 px-0 sm:px-8 space-y-1">
                              <div className="font-semibold text-lg">
                                {e.title}
                              </div>
                              <div className="text-sm text-white/70">
                                {e.location}
                              </div>
                              <div className="text-xs text-white/50">
                                {e.attendees} attending
                                {e.attendeeNames && (
                                  <span className="ml-2 text-white/30">
                                    {e.attendeeNames.length > 40
                                      ? e.attendeeNames.slice(0, 40) + '…'
                                      : e.attendeeNames}
                                  </span>
                                )}
                              </div>
                            </div>
                            <ChevronRightIcon className="w-6 h-6 text-white/70 mt-2 sm:mt-0" />
                          </div>
                        </div>
                      );
                    })}
                    {evs.length > limit && (
                      <button
                        onClick={() =>
                          setShowAllByMonth((curr) => ({
                            ...curr,
                            [month]: !curr[month],
                          }))
                        }
                        className="block mx-auto text-[#5AA5FF] hover:underline"
                      >
                        {showAll
                          ? 'Show Less'
                          : `Show More (${evs.length - limit} more)`}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </ScrollArea>
        ) : (
          !loading && (
            <div className="bg-[rgba(255,255,255,0.1)] backdrop-blur-lg rounded-2xl p-4 sm:p-6 shadow-inner overflow-x-auto">
              <div className="flex flex-wrap sm:flex-nowrap space-x-0 sm:space-x-2 mb-4">
                <button
                  onClick={() => calendarRef.current?.getApi().prev()}
                  className="px-3 py-1 rounded-lg bg-[rgba(255,255,255,0.15)] text-white hover:bg-[rgba(255,255,255,0.2)] transition whitespace-nowrap"
                >
                  ← Prev
                </button>
                <button
                  onClick={() => calendarRef.current?.getApi().today()}
                  className="px-3 py-1 rounded-lg bg-[rgba(255,255,255,0.15)] text-white hover:bg-[rgba(255,255,255,0.2)] transition whitespace-nowrap"
                >
                  Today
                </button>
                <button
                  onClick={() => calendarRef.current?.getApi().next()}
                  className="px-3 py-1 rounded-lg bg-[rgba(255,255,255,0.15)] text-white hover:bg-[rgba(255,255,255,0.2)] transition whitespace-nowrap"
                >
                  Next →
                </button>
              </div>
              <FullCalendar
                ref={calendarRef}
                plugins={[dayGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                events={filtered.map((e) => ({
                  id: e.id,
                  title: e.title,
                  date: e.date.toISOString().slice(0, 10),
                  allDay: e.allDay,
                  backgroundColor: '#5AA5FF',
                  borderColor: '#5AA5FF',
                  textColor: '#fff',
                }))}
                headerToolbar={{ left: '', center: 'title', right: '' }}
                height="auto"
                eventClassNames={() => 'rounded-full px-2 py-1 text-xs'}
                eventClick={(arg) => handleCalendarEventClick(arg)}
              />
            </div>
          )
        )}
      </div>

      {/* Right Side Dialog (same look, mobile behavior) */}
      <SideDialog
        open={dialogOpen}
        onClose={closeDialog}
        title={
          dialogType === 'create'
            ? 'Create Event'
            : dialogType === 'edit'
              ? 'Edit Event'
              : dialogType === 'view'
                ? 'Event'
                : 'Delete Event'
        }
      >
        {dialogType === 'create' && <CreateForm />}

        {dialogType === 'view' && selectedEvent && (
          <ViewPanel event={selectedEvent} />
        )}

        {dialogType === 'edit' && selectedEvent && (
          <EditForm event={selectedEvent} />
        )}

        {dialogType === 'delete' && selectedEvent && (
          <div className="space-y-4">
            <p className="text-white">
              Are you sure you want to delete <b>{selectedEvent.title}</b>?
            </p>
            <div className="flex flex-col sm:flex-row sm:space-x-4 mt-6">
              <button
                onClick={closeDialog}
                className="flex-1 px-4 py-2 bg-[#5AA5FF] text-white rounded-lg hover:bg-[#3C8CE7] whitespace-nowrap"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await deleteEvent(selectedEvent.id);
                  setEvents((ev) =>
                    ev.filter((e) => e.id !== selectedEvent.id)
                  );
                  closeDialog();
                }}
                className="flex-1 mt-4 sm:mt-0 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500 whitespace-nowrap"
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
