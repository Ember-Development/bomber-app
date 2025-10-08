import BackgroundWrapper from '@/components/ui/organisms/backgroundWrapper';
import dayjs from 'dayjs';
import { useMemo, useState, useCallback } from 'react';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import {
  Dimensions,
  View,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  FlatList,
  TextInput,
} from 'react-native';
import { Text } from '@react-navigation/elements';
import {
  Calendar,
  EventRenderer,
  ICalendarEventBase,
  Mode,
} from 'react-native-big-calendar';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors, EventColors } from '@/constants/Colors';
import { EventType } from '@bomber-app/database';
import FullScreenModal from '@/components/ui/organisms/FullSheetModal';
import ViewEvent from '../events/modals/ViewEvent';
import CustomButton from '@/components/ui/atoms/Button';
import { useUserEvents } from '@/hooks/useUser';
// If you have shared types:
import type { EventFE } from '@bomber-app/database/types/event'; // adjust import path to your monorepo
import { useUserContext } from '@/context/useUserContext';
import { api } from '@/api/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AddEventModal } from '../events/modals/AddEvent';

// ---------------------------
// Types / constants
// ---------------------------
type Modes = Exclude<Mode, 'custom'>;
const MODE_OPTIONS: Modes[] = [
  'day',
  '3days',
  'week',
  'month',
  'schedule',
] as const;
const MODE_LABELS: Record<Modes, string> = {
  day: 'Day',
  '3days': '3 Days',
  week: 'Week',
  month: 'Month',
  schedule: 'List',
};

const INIT_MODE: Modes = '3days';
const MAX_READABLE_EVENT_MINUTES = 32;

type EventDTO = {
  id: string;
  eventType: EventType;
  start: string | Date;
  end: string | Date;
  title: string | null;
  body?: string | null;
  location?: string | null;
  tournamentID: string | null;
  attendees: any[];
  tournament?: { id: string; title: string | null } | null;
};

type UserEvent = { event: EventDTO } & Record<string, any>;

export interface CalEvent extends ICalendarEventBase {
  id: string;
  color: string;
  fill: boolean;
  type: EventType;
  // hydrate more as needed (location, team, etc.)
}

const ICON_FOR_TYPE: Record<EventType, string> = {
  TOURNAMENT: '🏆',
  PRACTICE: '🏋️',
  GLOBAL: '📣',
};

// ---------------------------
// Data fetching
// ---------------------------
function getVisibleRange(currentDate: Date, mode: Modes) {
  const start = dayjs(currentDate).startOf('day');
  const end =
    mode === 'day'
      ? start.add(1, 'day')
      : mode === '3days'
        ? start.add(3, 'day')
        : mode === 'week'
          ? start.add(1, 'week')
          : mode === 'month'
            ? start.add(1, 'month')
            : /* schedule */ start.add(3, 'week');
  return { from: start.toDate(), to: end.toDate() };
}

// ---------------------------
// Helpers
// ---------------------------
function mapToCalendar(ev: EventDTO): CalEvent {
  const start = new Date(ev.start as any);
  const end = new Date(ev.end as any);
  const color = EventColors[ev.eventType as EventType] ?? '#8A2BE2';
  const title =
    ev.title ?? (ev.tournament?.title ? ev.tournament.title : ev.eventType);

  return {
    id: String(ev.id),
    title,
    start,
    end,
    color,
    fill: true,
    type: ev.eventType as EventType,
  };
}

function splitUpcomingPast(events: CalEvent[]) {
  const now = new Date();
  const past = events
    .filter((e) => e.end < now)
    .sort((a, b) => b.end.getTime() - a.end.getTime());
  const future = events
    .filter((e) => e.start >= now)
    .sort((a, b) => a.start.getTime() - b.start.getTime());
  return {
    last: past[0],
    next: future[0],
  };
}

// ---------------------------
// Component
// ---------------------------
export default function EventsScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useColorScheme();
  const isDark = theme === 'dark';

  // Layout
  const screenHeight = Dimensions.get('window').height;
  const headerHeight = 112; // our custom header height
  const calendarHeight =
    screenHeight - insets.top - insets.bottom - headerHeight;

  // State
  const [modeIndex, setModeIndex] = useState(() =>
    MODE_OPTIONS.indexOf(INIT_MODE)
  );
  const mode = MODE_OPTIONS[modeIndex];
  const [date, setDate] = useState<Date>(new Date());
  const [selected, setSelected] = useState<CalEvent | undefined>();

  // Data
  const { user } = useUserContext();
  const userId = user?.id;
  const { data, isLoading, isError, refetch } = useUserEvents(userId);

  const rawEvents: EventDTO[] = useMemo(() => {
    const list = (data ?? []) as any[];
    return list.map((row) => (row?.event ? row.event : row)) as EventDTO[];
  }, [data]);

  const { from, to } = useMemo(() => getVisibleRange(date, mode), [date, mode]);
  const calEvents = useMemo(() => {
    return rawEvents
      .filter((e) => {
        const s = new Date(e.start as any).getTime();
        const en = new Date(e.end as any).getTime();
        return en >= from.getTime() && s <= to.getTime();
      })
      .map(mapToCalendar);
  }, [rawEvents, from, to]);

  // Now-line offset
  const offsetMinutes = useMemo(() => {
    const d = new Date();
    return d.getMinutes() + 60 * d.getHours();
  }, []);

  // Palette for big-calendar (dark by default; we style tiles ourselves)
  const calendarTheme = useMemo(
    () => ({
      palette: {
        primary: { main: '#8A2BE2', contrastText: '#000' },
        gray: {
          '100': isDark ? '#1b1b1f' : '#f3f3f5',
          '200': isDark ? '#22232a' : '#ececf0',
          '300': isDark ? '#2a2c34' : '#e5e6ea',
          '500': isDark ? '#5e6270' : '#cacdd4',
          '800': isDark ? '#b9bed1' : '#5a5f72',
        },
      },
    }),
    [isDark]
  );

  const handleChangeDate = useCallback(
    (next: Date | Date[]) => {
      const target = Array.isArray(next) ? next[0] : next;

      // Only advance date if page actually changed.
      const same =
        mode === 'month'
          ? dayjs(target).isSame(date, 'month')
          : dayjs(target).isSame(date, 'day');

      if (!same) setDate(target);
    },
    [date, mode]
  );

  // role based
  const canCreate =
    !!user &&
    ['ADMIN', 'COACH', 'REGIONAL_COACH'].includes(
      (Array.isArray(user.primaryRole)
        ? user.primaryRole[0]
        : user.primaryRole) as string
    );

  const [addOpen, setAddOpen] = useState(false);

  // Custom event renderer — gradient chip with icon & smart time text
  const renderEvent: EventRenderer<CalEvent> = useCallback(
    (event, touchableProps) => {
      const minutes = dayjs(event.end).diff(event.start, 'minute');
      const compact = minutes < MAX_READABLE_EVENT_MINUTES;

      return (
        <TouchableOpacity
          {...touchableProps}
          activeOpacity={0.9}
          key={touchableProps.key}
          onPress={() => setSelected(event)}
          style={[
            ...(touchableProps.style as any[]),
            {
              borderWidth: 1,
              borderColor: event.color,
              backgroundColor: isDark ? `${event.color}35` : `${event.color}22`,
              borderRadius: 10,
              overflow: 'hidden',
              paddingHorizontal: 8,
              justifyContent: 'center',
            },
          ]}
        >
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 4,
              backgroundColor: event.color,
            }}
          />
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text
              style={{
                fontSize: compact ? 11 : 13,
                fontWeight: Platform.OS === 'ios' ? '600' : '700',
                color: Colors[theme].text,
              }}
              numberOfLines={1}
            >
              {ICON_FOR_TYPE[event.type]} {event.title}
            </Text>
          </View>

          {!compact && (
            <Text
              style={{ marginTop: 2, fontSize: 11, color: Colors[theme].text }}
              numberOfLines={1}
            >
              {dayjs(event.start).format('h:mm')}–
              {dayjs(event.end).format('h:mm A')}
            </Text>
          )}
        </TouchableOpacity>
      );
    },
    [isDark, theme]
  );

  // Top chips: Next Up / Most Recent (computed from currently loaded range)
  const { next, last } = useMemo(
    () => splitUpcomingPast(calEvents),
    [calEvents]
  );

  return (
    <BackgroundWrapper>
      <SafeAreaView style={{ flex: 1, paddingBottom: insets.bottom }}>
        {/* Header (glass) */}
        <View
          style={{
            paddingTop: 6,
            paddingHorizontal: 16,
            paddingBottom: 10,
            gap: 10,
          }}
        >
          {/* Mode Segmented + Today + Nav */}
          <View
            style={{
              flexDirection: 'column',
              alignItems: 'center',
              gap: 8,
              justifyContent: 'space-between',
            }}
          >
            <View
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 14,
              }}
            >
              <Segmented
                options={MODE_OPTIONS.map((m) => MODE_LABELS[m])}
                selectedIndex={modeIndex}
                onChange={(i) => setModeIndex(i)}
              />

              {canCreate ? (
                <TouchableOpacity
                  onPress={() => setAddOpen(true)}
                  style={{
                    padding: 4,
                    borderRadius: 20,
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    elevation: 4,
                  }}
                  activeOpacity={0.85}
                >
                  <Text
                    style={{ color: '#fff', fontSize: 20, fontWeight: '700' }}
                  >
                    ＋
                  </Text>
                </TouchableOpacity>
              ) : null}
            </View>

            <View style={{ flexDirection: 'row', gap: 8 }}>
              <CustomButton
                title="‹"
                onPress={() => {
                  const nextDate =
                    mode === 'month'
                      ? dayjs(date).subtract(1, 'month').toDate()
                      : dayjs(date)
                          .subtract(
                            mode === 'week' ? 7 : mode === '3days' ? 3 : 1,
                            'day'
                          )
                          .toDate();
                  setDate(nextDate);
                }}
              />
              <CustomButton title="Today" onPress={() => setDate(new Date())} />
              <CustomButton
                title="›"
                onPress={() => {
                  const nextDate =
                    mode === 'month'
                      ? dayjs(date).add(1, 'month').toDate()
                      : dayjs(date)
                          .add(
                            mode === 'week' ? 7 : mode === '3days' ? 3 : 1,
                            'day'
                          )
                          .toDate();
                  setDate(nextDate);
                }}
              />
            </View>
          </View>

          {/* “Next up / Most recent” summary row */}
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <InfoChip
              label="Next up"
              value={
                next
                  ? `${dayjs(next.start).format('ddd, MMM D • h:mm A')}`
                  : '—'
              }
            />
            <InfoChip
              label="Most recent"
              value={
                last ? ` ${dayjs(last.end).format('ddd, MMM D • h:mm A')}` : '—'
              }
            />
          </View>

          {/* Legend */}
          <Legend />
        </View>

        {/* Body */}
        <View style={{ flex: 1 }}>
          {isLoading ? (
            <View
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ActivityIndicator />
            </View>
          ) : isError ? (
            <Retry onRetry={() => refetch()} />
          ) : mode === 'schedule' ? (
            <ScheduleList events={calEvents} onPress={(e) => setSelected(e)} />
          ) : (
            <Calendar
              date={date}
              onChangeDate={handleChangeDate}
              theme={calendarTheme}
              events={calEvents}
              height={calendarHeight}
              scrollOffsetMinutes={offsetMinutes}
              ampm
              mode={mode}
              renderEvent={renderEvent}
              onPressEvent={(event: CalEvent) => setSelected(event)}
            />
          )}
        </View>

        {/* Single modal instance (outside renderer) */}
        <FullScreenModal
          isVisible={Boolean(selected)}
          onClose={() => setSelected(undefined)}
          title="Event"
        >
          {/* Pass data into your modal as needed */}
          <ViewEvent eventId={selected?.id} />
        </FullScreenModal>

        <AddEventModal open={addOpen} onClose={() => setAddOpen(false)} />
      </SafeAreaView>
    </BackgroundWrapper>
  );
}

// ---------------------------
// Small UI bits
// ---------------------------
function Segmented({
  options,
  selectedIndex,
  onChange,
}: {
  options: string[];
  selectedIndex: number;
  onChange: (i: number) => void;
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: 16,
        overflow: 'hidden',
      }}
    >
      {options.map((label, i) => (
        <TouchableOpacity
          key={label}
          onPress={() => onChange(i)}
          style={{
            paddingVertical: 8,
            paddingHorizontal: 12,
            backgroundColor:
              i === selectedIndex ? 'rgba(255,255,255,0.18)' : 'transparent',
          }}
        >
          <Text style={{ fontSize: 12, fontWeight: '600' }}>{label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

function InfoChip({ label, value }: { label: string; value: string }) {
  return (
    <View
      style={{
        flex: 1,
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.06)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.12)',
      }}
    >
      <Text style={{ fontSize: 11, opacity: 0.7 }}>{label}</Text>
      <Text style={{ fontSize: 12, marginTop: 2 }} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

function Legend() {
  const items: { label: string; color: string; icon: string }[] = [
    {
      label: 'Tournament',
      color: EventColors[EventType.TOURNAMENT],
      icon: ICON_FOR_TYPE.TOURNAMENT,
    },
    {
      label: 'Practice',
      color: EventColors[EventType.PRACTICE],
      icon: ICON_FOR_TYPE.PRACTICE,
    },
    {
      label: 'Global',
      color: EventColors[EventType.GLOBAL],
      icon: ICON_FOR_TYPE.GLOBAL,
    },
  ];
  return (
    <View style={{ flexDirection: 'row', gap: 12 }}>
      {items.map((it) => (
        <View
          key={it.label}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
        >
          <View
            style={{
              width: 10,
              height: 10,
              borderRadius: 6,
              backgroundColor: it.color,
              borderWidth: 1,
              borderColor: '#ffffff30',
            }}
          />
          <Text style={{ fontSize: 12 }}>{it.label}</Text>
        </View>
      ))}
    </View>
  );
}

function Retry({ onRetry }: { onRetry: () => void }) {
  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
      }}
    >
      <Text>Couldn’t load events.</Text>
      <CustomButton title="Try again" onPress={onRetry} />
    </View>
  );
}

// Simple schedule list for “List” mode
function ScheduleList({
  events,
  onPress,
}: {
  events: CalEvent[];
  onPress: (e: CalEvent) => void;
}) {
  const grouped = useMemo(() => {
    const map = new Map<string, CalEvent[]>();
    const sorted = [...events].sort(
      (a, b) => a.start.getTime() - b.start.getTime()
    );
    for (const e of sorted) {
      const key = dayjs(e.start).format('YYYY-MM-DD');
      const arr = map.get(key) ?? [];
      arr.push(e);
      map.set(key, arr);
    }
    return Array.from(map.entries());
  }, [events]);

  return (
    <FlatList
      data={grouped}
      keyExtractor={([dayKey]) => dayKey}
      renderItem={({ item: [dayKey, evs] }) => (
        <View style={{ paddingHorizontal: 16, paddingBottom: 20 }}>
          <Text style={{ fontSize: 12, opacity: 0.7, marginBottom: 8 }}>
            {dayjs(dayKey).format('dddd, MMM D')}
          </Text>
          {evs.map((e) => (
            <TouchableOpacity
              key={e.id}
              onPress={() => onPress(e)}
              style={{
                padding: 12,
                borderRadius: 12,
                backgroundColor: 'rgba(255,255,255,0.06)',
                borderWidth: 1,
                borderColor: e.color,
                marginBottom: 10,
              }}
            >
              <Text style={{ fontWeight: '600' }}>
                {ICON_FOR_TYPE[e.type]} {e.title}
              </Text>
              <Text style={{ marginTop: 4, fontSize: 12, opacity: 0.8 }}>
                {dayjs(e.start).format('h:mm A')} –{' '}
                {dayjs(e.end).format('h:mm A')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    />
  );
}
