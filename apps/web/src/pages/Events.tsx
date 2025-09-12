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
import SideDialog from '@/components/SideDialog';
import {
  fetchEvents,
  createEvent,
  updateEvent,
  deleteEvent,
} from '@/api/event';
import type { EventFE } from '@bomber-app/database';

type EventType = 'TOURNAMENT' | 'PRACTICE' | 'GLOBAL';
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
    if (ev) openEdit(ev);
  }

  function CreateForm() {
    const [form, setForm] = useState<{
      eventType: EventType;
      start: string;
      end: string;
      tournamentID?: string;
    }>({
      eventType: 'GLOBAL',
      start: '',
      end: '',
    });
    const onSave = async () => {
      const created = await createEvent(form);
      setEvents((prev) => [created, ...prev]);
      closeDialog();
    };
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-white font-semibold">Type</label>
          <select
            value={form.eventType}
            onChange={(e) =>
              setForm((f) => ({ ...f, eventType: e.target.value as EventType }))
            }
            className="w-full px-4 py-2 bg-[rgba(255,255,255,0.1)] text-white rounded-lg"
          >
            {(['GLOBAL', 'TOURNAMENT', 'PRACTICE'] as EventType[]).map((t) => (
              <option key={t} value={t} className="text-black">
                {t}
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-white font-semibold">
              Start
            </label>
            <input
              type="datetime-local"
              value={form.start}
              onChange={(e) =>
                setForm((f) => ({ ...f, start: e.target.value }))
              }
              className="w-full px-4 py-2 bg-[rgba(255,255,255,0.1)] text-white rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm text-white font-semibold">
              End
            </label>
            <input
              type="datetime-local"
              value={form.end}
              onChange={(e) => setForm((f) => ({ ...f, end: e.target.value }))}
              className="w-full px-4 py-2 bg-[rgba(255,255,255,0.1)] text-white rounded-lg"
            />
          </div>
        </div>
        {form.eventType === 'TOURNAMENT' && (
          <div>
            <label className="block text-sm text-white font-semibold">
              Tournament ID
            </label>
            <input
              type="text"
              value={form.tournamentID || ''}
              onChange={(e) =>
                setForm((f) => ({ ...f, tournamentID: e.target.value }))
              }
              className="w-full px-4 py-2 bg-[rgba(255,255,255,0.1)] text-white rounded-lg"
            />
          </div>
        )}
        <div className="flex flex-col sm:flex-row sm:space-x-4 mt-6">
          <button
            onClick={onSave}
            className="flex-1 px-4 py-2 bg-[#5AA5FF] text-white rounded-lg hover:bg-[#3C8CE7] whitespace-nowrap"
          >
            Save
          </button>
          <button
            onClick={closeDialog}
            className="flex-1 mt-4 sm:mt-0 px-4 py-2 bg-[rgba(255,255,255,0.14)] text-white rounded-lg hover:bg-[#5AA5FF] whitespace-nowrap"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  function EditForm({ event }: { event: ReturnType<typeof toDisplayEvent> }) {
    const [form, setForm] = useState({
      eventType: event.type,
      start: event.date.toISOString().slice(0, 16),
      end: event.date.toISOString().slice(0, 16),
      tournamentID: event.raw.tournamentID || '',
    });
    const onSave = async () => {
      const updated = await updateEvent(event.id, form);
      setEvents((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
      closeDialog();
    };
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-white font-semibold">Type</label>
          <select
            value={form.eventType}
            onChange={(e) =>
              setForm((f) => ({ ...f, eventType: e.target.value as EventType }))
            }
            className="w-full px-4 py-2 bg-[rgba(255,255,255,0.1)] text-white rounded-lg"
          >
            {(['GLOBAL', 'TOURNAMENT', 'PRACTICE'] as EventType[]).map((t) => (
              <option key={t} value={t} className="text-black">
                {t}
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-white font-semibold">
              Start
            </label>
            <input
              type="datetime-local"
              value={form.start}
              onChange={(e) =>
                setForm((f) => ({ ...f, start: e.target.value }))
              }
              className="w-full px-4 py-2 bg-[rgba(255,255,255,0.1)] text-white rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm text-white font-semibold">
              End
            </label>
            <input
              type="datetime-local"
              value={form.end}
              onChange={(e) => setForm((f) => ({ ...f, end: e.target.value }))}
              className="w-full px-4 py-2 bg-[rgba(255,255,255,0.1)] text-white rounded-lg"
            />
          </div>
        </div>
        {form.eventType === 'TOURNAMENT' && (
          <div>
            <label className="block text-sm text-white font-semibold">
              Tournament ID
            </label>
            <input
              type="text"
              value={form.tournamentID}
              onChange={(e) =>
                setForm((f) => ({ ...f, tournamentID: e.target.value }))
              }
              className="w-full px-4 py-2 bg-[rgba(255,255,255,0.1)] text-white rounded-lg"
            />
          </div>
        )}
        <div className="flex flex-col sm:flex-row sm:space-x-4 mt-6">
          <button
            onClick={onSave}
            className="flex-1 px-4 py-2 bg-[#5AA5FF] text-white rounded-lg hover:bg-[#3C8CE7] whitespace-nowrap"
          >
            Save
          </button>
          <button
            onClick={closeDialog}
            className="flex-1 mt-4 sm:mt-0 px-4 py-2 bg-[rgba(255,255,255,0.14)] text-white rounded-lg hover:bg-[#5AA5FF] whitespace-nowrap"
          >
            Cancel
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
                <CalendarOutlineIcon className="w-5 h-5 text-white/60 ml-2" />
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
                <CalendarOutlineIcon className="w-5 h-5 text-white/60 ml-2" />
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

        {/* Cards vs Calendar */}
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
                          onClick={() => openEdit(e)}
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
                              <div>
                                {e.allDay
                                  ? 'All Day'
                                  : e.date.toLocaleTimeString([], {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}
                              </div>
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
                eventClick={handleCalendarEventClick}
              />
            </div>
          )
        )}
      </div>

      <SideDialog
        open={dialogOpen}
        onClose={closeDialog}
        title={
          dialogType === 'create'
            ? 'Create Event'
            : dialogType === 'edit'
              ? 'Edit Event'
              : 'Delete Event'
        }
      >
        {dialogType === 'create' && <CreateForm />}
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
