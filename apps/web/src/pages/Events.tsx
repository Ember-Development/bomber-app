import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import {
  ArrowLeftIcon,
  CalendarIcon as CalendarOutlineIcon,
  ChevronRightIcon,
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { ScrollArea } from '@/components/ui/scroll-area';
import SideDialog from '@/components/sideDialog';
import { fetchEvents } from '@/api/event'; // API helper
import type { EventFE } from '@bomber-app/database';

type EventType = 'Tournament' | 'Practice' | 'Global';
type DateFilter = 'All' | 'Upcoming' | 'Past';

function toDisplayEvent(e: EventFE) {
  return {
    id: e.id,
    date: new Date(e.start),
    allDay: true,
    type: e.eventType as EventType,
    title: e.tournament?.title || e.eventType,
    location: e.tournament?.body || '',
    image: e.tournament?.imageURL || '',
    attendees: e.attendees?.length ?? 0,
    attendeeNames:
      e.attendees
        ?.map((a) => (a.user ? `${a.user.fname} ${a.user.lname}` : ''))
        .filter(Boolean)
        .join(', ') || '',
    raw: e,
  };
}

export default function Events() {
  const navigate = useNavigate();
  const calendarRef = useRef<FullCalendar>(null);

  const [events, setEvents] = useState<EventFE[]>([]);
  const [loading, setLoading] = useState(false);

  const [viewMode, setViewMode] = useState<'cards' | 'calendar'>('cards');
  const [dateFilter, setDateFilter] = useState<DateFilter>('All');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [typeFilter, setTypeFilter] = useState<'All' | EventType>('All');

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<
    'create' | 'edit' | 'delete' | null
  >(null);
  const [selectedEvent, setSelectedEvent] = useState<ReturnType<
    typeof toDisplayEvent
  > | null>(null);

  // Show more/less per month
  const [showAllByMonth, setShowAllByMonth] = useState<{
    [month: string]: boolean;
  }>({});

  useEffect(() => {
    setLoading(true);
    fetchEvents()
      .then((data) => setEvents(data))
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, []);

  const displayEvents = useMemo(() => events.map(toDisplayEvent), [events]);

  const uniqueTypes = useMemo(
    () => Array.from(new Set(displayEvents.map((e) => e.type))),
    [displayEvents]
  );

  const now = new Date();
  const next30 = new Date();
  next30.setDate(now.getDate() + 30);
  const last30 = new Date();
  last30.setDate(now.getDate() - 30);

  // Main filter logic for Upcoming/Past/All
  const filtered = useMemo(() => {
    return displayEvents
      .filter((e) => {
        if (dateFilter === 'Upcoming') {
          return e.date >= now && e.date <= next30;
        }
        if (dateFilter === 'Past') {
          return e.date < now && e.date >= last30;
        }
        // "All" = show everything
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
      const m = e.date.toLocaleString('default', {
        month: 'long',
        year: 'numeric',
      });
      map[m] = map[m] || [];
      map[m].push(e);
    });
    return Object.entries(map);
  }, [filtered]);

  const handleOpenCreate = () => {
    setDialogType('create');
    setSelectedEvent(null);
    setDialogOpen(true);
  };
  const handleOpenEdit = (event: (typeof filtered)[0]) => {
    setDialogType('edit');
    setSelectedEvent(event);
    setDialogOpen(true);
  };
  const handleOpenDelete = (event: (typeof filtered)[0]) => {
    setDialogType('delete');
    setSelectedEvent(event);
    setDialogOpen(true);
  };
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedEvent(null);
    setDialogType(null);
  };

  function handleCalendarEventClick(arg: any) {
    const ev = filtered.find((e) => e.id === arg.event.id);
    if (ev) handleOpenEdit(ev);
  }

  return (
    <div className="flex relative min-h-screen">
      <div
        className={`flex-1 flex flex-col space-y-6 transition-all duration-300 ${dialogOpen ? 'pr-[50px]' : ''}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 bg-[rgba(255,255,255,0.1)] backdrop-blur-lg rounded-lg text-white hover:bg-[rgba(255,255,255,0.2)] transition"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold text-white">Events</h1>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleOpenCreate}
              className="flex items-center space-x-2 px-4 py-2 bg-[rgba(255,255,255,0.15)] backdrop-blur-lg border border-white/30 text-white rounded-full hover:bg-[#5AA5FF] hover:border-[#5AA5FF] transition"
            >
              <PlusIcon className="w-5 h-5" />
              <span className="font-medium">Create Event</span>
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`px-4 py-2 rounded-lg transition ${viewMode === 'cards' ? 'bg-[#5AA5FF] text-white' : 'bg-[rgba(255,255,255,0.1)] text-white/70 hover:bg-[rgba(255,255,255,0.2)]'}`}
            >
              Cards
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-4 py-2 rounded-lg transition ${viewMode === 'calendar' ? 'bg-[#5AA5FF] text-white' : 'bg-[rgba(255,255,255,0.1)] text-white/70 hover:bg-[rgba(255,255,255,0.2)]'}`}
            >
              Calendar
            </button>
          </div>
        </div>

        <div className="bg-[rgba(255,255,255,0.10)] backdrop-blur-2xl rounded-2xl px-8 py-6 mb-2 shadow-md border border-white/10 flex flex-col space-y-6">
          <div className="flex flex-wrap items-end gap-8">
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-white/70 mb-1">
                Start Date
              </label>
              <div className="flex items-center bg-[rgba(255,255,255,0.05)] border border-white/20 rounded-lg px-2">
                <input
                  type="date"
                  value={start}
                  onChange={(e) => setStart(e.target.value)}
                  className="px-2 py-2 bg-transparent text-white focus:outline-none"
                />
                <CalendarOutlineIcon className="w-5 h-5 text-white/60 ml-2" />
              </div>
            </div>
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-white/70 mb-1">
                End Date
              </label>
              <div className="flex items-center bg-[rgba(255,255,255,0.05)] border border-white/20 rounded-lg px-2">
                <input
                  type="date"
                  value={end}
                  onChange={(e) => setEnd(e.target.value)}
                  className="px-2 py-2 bg-transparent text-white focus:outline-none"
                />
                <CalendarOutlineIcon className="w-5 h-5 text-white/60 ml-2" />
              </div>
            </div>
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-white/70 mb-1">
                Show Events
              </label>
              <div className="flex space-x-2">
                {['All', 'Upcoming', 'Past'].map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setDateFilter(opt as DateFilter)}
                    className={`px-3 py-1 rounded-full transition text-sm font-semibold ${
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
          <div className="flex flex-wrap gap-8">
            <div className="flex flex-col min-w-[160px]">
              <label className="text-xs font-semibold text-white/70 mb-1">
                Type
              </label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as any)}
                className="px-3 py-2 bg-[rgba(255,255,255,0.08)] rounded-lg text-white focus:outline-none border border-white/10"
              >
                <option value="All">All Types</option>
                {uniqueTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Empty State Messages */}
        {!loading && filtered.length === 0 && (
          <div className="text-white text-lg text-center py-16">
            {dateFilter === 'Upcoming' && (
              <>No Events Upcoming in the Next 30 Days</>
            )}
            {dateFilter === 'Past' && <>No Past Events in the Last 30 Days</>}
            {dateFilter === 'All' && <>No Events Found</>}
          </div>
        )}

        {loading ? (
          <div className="text-white text-lg text-center py-16">
            Loading events...
          </div>
        ) : viewMode === 'cards' ? (
          <ScrollArea className="space-y-8">
            {grouped.map(([month, evs]) => {
              const showAll = !!showAllByMonth[month];
              const showCount = 8;
              const shown = showAll ? evs : evs.slice(0, showCount);

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
                          className="flex items-center p-6 mb-6 bg-[rgba(255,255,255,0.1)] backdrop-blur-lg rounded-xl hover:bg-[rgba(255,255,255,0.2)] transition cursor-pointer"
                          onClick={() => handleOpenEdit(e)}
                        >
                          <div className="flex flex-row items-center justify-center w-20 space-x-2 text-white">
                            <span className="text-sm font-medium text-[#5AA5FF]">
                              {dayName}
                            </span>
                            <span className="text-xl font-bold">{dayNum}</span>
                          </div>
                          <div className="ml-6 flex-1 flex items-center justify-between text-white">
                            <div className="space-y-1">
                              <div>
                                {e.allDay
                                  ? 'All Day'
                                  : e.date.toLocaleTimeString([], {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}
                              </div>
                              <div className="inline-block bg-[#5AA5FF] px-2 py-0.5 rounded-full text-xs">
                                {e.type}
                              </div>
                            </div>
                            <div className="space-y-1 flex-1 px-8">
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
                                      ? e.attendeeNames.slice(0, 40) + '...'
                                      : e.attendeeNames}
                                  </span>
                                )}
                              </div>
                            </div>
                            <ChevronRightIcon className="w-6 h-6 text-white/70" />
                          </div>
                        </div>
                      );
                    })}
                    {/* Show More/Less Button */}
                    {evs.length > showCount && (
                      <button
                        className="block mx-auto mt-2 text-[#5AA5FF] hover:underline"
                        onClick={() =>
                          setShowAllByMonth((curr) => ({
                            ...curr,
                            [month]: !curr[month],
                          }))
                        }
                      >
                        {showAll
                          ? `Show Less`
                          : `Show More (${evs.length - showCount} more)`}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </ScrollArea>
        ) : (
          <div className="bg-[rgba(255,255,255,0.1)] backdrop-blur-lg rounded-2xl p-4 shadow-inner">
            <div className="flex space-x-2 mb-4">
              <button
                onClick={() => calendarRef.current?.getApi().prev()}
                className="px-3 py-1 rounded-lg bg-[rgba(255,255,255,0.15)] text-white hover:bg-[rgba(255,255,255,0.2)] transition"
              >
                ← Prev
              </button>
              <button
                onClick={() => calendarRef.current?.getApi().today()}
                className="px-3 py-1 rounded-lg bg-[rgba(255,255,255,0.15)] text-white hover:bg-[rgba(255,255,255,0.2)] transition"
              >
                Today
              </button>
              <button
                onClick={() => calendarRef.current?.getApi().next()}
                className="px-3 py-1 rounded-lg bg-[rgba(255,255,255,0.15)] text-white hover:bg-[rgba(255,255,255,0.2)] transition"
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
              eventClick={handleCalendarEventClick}
            />
          </div>
        )}
      </div>

      {/* SideDialog */}
      <SideDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        title={
          dialogType === 'create'
            ? 'Create Event'
            : dialogType === 'edit'
              ? 'Edit Event'
              : dialogType === 'delete'
                ? 'Delete Event'
                : ''
        }
      >
        {dialogType === 'create' && (
          <div>
            {/* Add Event form here */}
            <p className="text-white">[Add Event Form]</p>
          </div>
        )}
        {dialogType === 'edit' && selectedEvent && (
          <div>
            {/* Edit Event form fields */}
            <p className="text-white mb-6">
              [Edit Event: {selectedEvent.title}]
            </p>
            <div className="flex space-x-4">
              <button
                className="px-4 py-2 bg-[#5AA5FF] text-white rounded-lg hover:bg-[#3C8CE7] transition"
                onClick={handleCloseDialog}
              >
                Close
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500 transition"
                onClick={() => {
                  setDialogType('delete');
                  // Keep selectedEvent
                }}
              >
                Delete
              </button>
            </div>
          </div>
        )}
        {dialogType === 'delete' && selectedEvent && (
          <div>
            <p className="text-white">
              Are you sure you want to delete <b>{selectedEvent.title}</b>?
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
