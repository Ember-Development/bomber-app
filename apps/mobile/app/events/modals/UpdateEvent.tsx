// app/components/events/UpdateEventModal.tsx
import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  Modal,
} from 'react-native';
import DateTimePicker, {
  AndroidNativeProps,
  IOSNativeProps,
} from '@react-native-community/datetimepicker';
import dayjs from 'dayjs';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/api';
import FullScreenModal from '@/components/ui/organisms/FullSheetModal';
import CustomButton from '@/components/ui/atoms/Button';
import CustomSelect from '@/components/ui/atoms/dropdown';
import { useUserContext } from '@/context/useUserContext';
import { US_STATES, getStateName, toAbbr } from '@/utils/state';
import { GlobalColors } from '@/constants/Colors';
import { EventType } from '@bomber-app/database';
import type { UserFE } from '@bomber-app/database';

type UpdateEventModalProps = {
  open: boolean;
  onClose: () => void;
  event: {
    id: string;
    eventType: EventType;
    start: string; // ISO
    end: string; // ISO
    title: string;
    body?: string | null;
    location?: string | null; // e.g., "City, ST"
  };
};

type TeamDTO = { id: string; name: string };

type RoleFilter =
  | 'ALL'
  | 'COACH'
  | 'PLAYER'
  | 'PARENT'
  | 'REGIONAL_COACH'
  | 'ADMIN';

/** Small glass card wrapper */
const Box = ({ children }: { children: React.ReactNode }) => (
  <View
    style={{
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.2)',
      borderRadius: 10,
      overflow: 'hidden',
      backgroundColor: 'rgba(255,255,255,0.06)',
    }}
  >
    {children}
  </View>
);

/** Shared button-like field shell */
function FieldShell({
  label,
  valueText,
  onPress,
}: {
  label: string;
  valueText: string;
  onPress: () => void;
}) {
  return (
    <View style={{ marginBottom: 12, flex: 1 }}>
      <Text
        style={{
          fontWeight: '700',
          fontSize: 14,
          color: '#fff',
          marginBottom: 6,
        }}
      >
        {label}
      </Text>
      <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
        <Box>
          <View
            style={{
              padding: 14,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#fff', fontSize: 16 }}>{valueText}</Text>
            <Text style={{ color: '#fff' }}>▾</Text>
          </View>
        </Box>
      </TouchableOpacity>
    </View>
  );
}

/** iOS modal wrapper for DateTimePicker */
function IOSPickerModal({
  open,
  label,
  children,
  onClose,
}: {
  open: boolean;
  label: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <Modal
      visible={open}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPress={onClose}
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: 20,
        }}
      >
        <View
          style={{
            width: '100%',
            borderRadius: 14,
            overflow: 'hidden',
            backgroundColor: 'rgba(20,20,20,0.95)',
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.18)',
          }}
        >
          <View
            style={{
              padding: 12,
              borderBottomWidth: 1,
              borderBottomColor: 'rgba(255,255,255,0.1)',
            }}
          >
            <Text style={{ color: '#fff', fontWeight: '700' }}>{label}</Text>
          </View>
          <View style={{ padding: 8 }}>{children}</View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'flex-end',
              gap: 8,
              padding: 10,
            }}
          >
            <CustomButton title="Done" onPress={onClose} />
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

/** Date field (date-only) */
function DateField({
  label,
  value,
  onChange,
  minimumDate,
}: {
  label: string;
  value: Date;
  onChange: (next: Date) => void;
  minimumDate?: Date;
}) {
  const [open, setOpen] = useState(false);
  const display = useMemo(
    () => dayjs(value).format('ddd, MMM D, YYYY'),
    [value]
  );

  const onDatePicked: NonNullable<AndroidNativeProps['onChange']> = (
    _,
    selected
  ) => {
    if (Platform.OS === 'android') setOpen(false);
    if (!selected) return;
    // preserve time of day
    const merged = dayjs(selected)
      .hour(dayjs(value).hour())
      .minute(dayjs(value).minute())
      .second(0)
      .millisecond(0)
      .toDate();
    onChange(merged);
  };

  const picker = (
    <DateTimePicker
      value={value}
      mode="date"
      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
      minimumDate={minimumDate}
      onChange={onDatePicked}
      {...(Platform.OS === 'ios'
        ? { textColor: '#fff', themeVariant: 'dark' as const }
        : {})}
    />
  );

  return (
    <>
      <FieldShell
        label={label}
        valueText={display}
        onPress={() => setOpen(true)}
      />
      {Platform.OS === 'ios' ? (
        <IOSPickerModal
          open={open}
          label={label}
          onClose={() => setOpen(false)}
        >
          {picker}
        </IOSPickerModal>
      ) : (
        open && picker
      )}
    </>
  );
}

/** Time field (time-only) */
function TimeField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: Date;
  onChange: (next: Date) => void;
}) {
  const [open, setOpen] = useState(false);
  const display = useMemo(() => dayjs(value).format('h:mm A'), [value]);

  const onTimePicked: NonNullable<AndroidNativeProps['onChange']> = (
    _,
    selected
  ) => {
    if (Platform.OS === 'android') setOpen(false);
    if (!selected) return;
    // merge selected time into existing date
    const merged = dayjs(value)
      .hour(dayjs(selected).hour())
      .minute(dayjs(selected).minute())
      .second(0)
      .millisecond(0)
      .toDate();
    onChange(merged);
  };

  const picker = (
    <DateTimePicker
      value={value}
      mode="time"
      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
      onChange={onTimePicked}
      is24Hour={false}
      {...(Platform.OS === 'ios'
        ? { textColor: '#fff', themeVariant: 'dark' as const }
        : {})}
    />
  );

  return (
    <>
      <FieldShell
        label={label}
        valueText={display}
        onPress={() => setOpen(true)}
      />
      {Platform.OS === 'ios' ? (
        <IOSPickerModal
          open={open}
          label={label}
          onClose={() => setOpen(false)}
        >
          {picker}
        </IOSPickerModal>
      ) : (
        open && picker
      )}
    </>
  );
}

/** Helpers to split / join location */
function splitLocation(loc?: string | null): { city: string; state: string } {
  if (!loc) return { city: '', state: '' };
  const parts = loc.split(',').map((s) => s.trim());
  if (parts.length === 2) {
    return { city: parts[0], state: getStateName(parts[1]) };
  }
  return { city: loc, state: '' };
}

// ---- data hooks for users/teams/attendees ----
function useAllUsers() {
  return useQuery({
    queryKey: ['users:all'],
    queryFn: async () => {
      const { data } = await api.get<UserFE[]>('/api/users');
      return data;
    },
  });
}

function useAllTeams() {
  return useQuery({
    queryKey: ['teams:all'],
    queryFn: async () => {
      const { data } = await api.get<TeamDTO[]>('/api/teams');
      return data;
    },
  });
}

function useEventAttendees(eventId: string) {
  return useQuery({
    queryKey: ['event-attendees', eventId],
    queryFn: async () => {
      const { data } = await api.get<
        Array<{
          user: {
            id: string;
            fname?: string | null;
            lname?: string | null;
            primaryRole?: string;
          };
        }>
      >(`/api/events/${eventId}/attendees`);
      return data;
    },
  });
}

export default function UpdateEventModal({
  open,
  onClose,
  event,
}: UpdateEventModalProps) {
  const qc = useQueryClient();
  const { user } = useUserContext();

  const role =
    (Array.isArray(user?.primaryRole)
      ? user?.primaryRole[0]
      : user?.primaryRole) ?? undefined;

  // Role-based allowed event types (mirror AddEvent)
  const allowedTypes: EventType[] =
    role === 'ADMIN'
      ? [EventType.PRACTICE, EventType.TOURNAMENT, EventType.GLOBAL]
      : role === 'COACH' || role === 'REGIONAL_COACH'
        ? [EventType.PRACTICE, EventType.TOURNAMENT]
        : [];

  // Prefill from event
  const initial = useMemo(() => {
    const { city, state } = splitLocation(event.location ?? undefined);
    return {
      type: event.eventType,
      title: event.title ?? '',
      body: event.body ?? '',
      city,
      state, // full state name if possible
      start: dayjs(event.start).toDate(),
      end: dayjs(event.end).toDate(),
    };
  }, [event]);

  const [type, setType] = useState<EventType>(initial.type);
  const [title, setTitle] = useState(initial.title);
  const [body, setBody] = useState(initial.body);
  const [city, setCity] = useState(initial.city);
  const [stateInput, setStateInput] = useState(initial.state);
  const [start, setStart] = useState<Date>(initial.start);
  const [end, setEnd] = useState<Date>(initial.end);

  // Reset when event changes / modal reopens
  useEffect(() => {
    setType(initial.type);
    setTitle(initial.title);
    setBody(initial.body);
    setCity(initial.city);
    setStateInput(initial.state);
    setStart(initial.start);
    setEnd(initial.end);
  }, [open, event.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const location = useMemo(() => {
    const c = city.trim();
    const s = toAbbr(getStateName(stateInput || ''));
    if (c && s) return `${c}, ${s}`;
    if (c) return c;
    if (s) return s;
    return '';
  }, [city, stateInput]);

  // keep end > start
  const ensureOrdering = (nextStart: Date, nextEnd: Date) => {
    if (!dayjs(nextEnd).isAfter(dayjs(nextStart))) {
      return dayjs(nextStart).add(1, 'hour').toDate();
    }
    return nextEnd;
  };

  const handleStartDate = (d: Date) => {
    const newStart = d;
    setStart(newStart);
    setEnd((prev) => ensureOrdering(newStart, prev));
  };
  const handleStartTime = (d: Date) => {
    const newStart = d;
    setStart(newStart);
    setEnd((prev) => ensureOrdering(newStart, prev));
  };
  const handleEndDate = (d: Date) => {
    const newEnd = d;
    setEnd(ensureOrdering(start, newEnd));
  };
  const handleEndTime = (d: Date) => {
    const newEnd = d;
    setEnd(ensureOrdering(start, newEnd));
  };

  // ---- Attendees section state & data ----
  const { data: allUsers = [] } = useAllUsers();
  const { data: teams = [] } = useAllTeams();
  const {
    data: attendeeRows = [],
    isLoading: attendeesLoading,
    error: attendeesError,
  } = useEventAttendees(event.id);

  // current attendees as a set
  const [selected, setSelected] = useState<Set<string>>(new Set());
  useEffect(() => {
    const ids = new Set(
      (attendeeRows || []).map((a) => (a.user?.id ? String(a.user.id) : ''))
    );
    setSelected(ids);
  }, [attendeeRows]);

  // filters (default: hide fans)
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('ALL');
  const [teamFilter, setTeamFilter] = useState<string | 'ALL'>('ALL');
  const [query, setQuery] = useState('');

  const selectableUsers = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allUsers
      .filter((u) => {
        const role = u.primaryRole;

        // Hide fans by default when "ALL" is selected
        if (roleFilter === 'ALL' && role === 'FAN') return false;

        // If a specific role is selected, enforce it
        if (roleFilter !== 'ALL' && role !== roleFilter) return false;

        // Team filter
        if (teamFilter !== 'ALL') {
          // players: team.id (note: not teamID)
          const playerTeamId: string | undefined = (u as any)?.player?.team?.id;

          // coaches: any team.id
          const coachTeamIds: string[] =
            ((u as any)?.coach?.teams ?? []).map((t: any) => t.id) ?? [];

          // parents: any child's team.id
          const parentChildTeamIds: string[] =
            ((u as any)?.parent?.children ?? [])
              .map((c: any) => c?.team?.id)
              .filter(Boolean) ?? [];

          const isOnTeam =
            (playerTeamId && playerTeamId === teamFilter) ||
            (coachTeamIds.length && coachTeamIds.includes(teamFilter)) ||
            (parentChildTeamIds.length &&
              parentChildTeamIds.includes(teamFilter));

          if (!isOnTeam) return false;
        }

        // Text search
        if (!q) return true;
        const full = `${u.fname ?? ''} ${u.lname ?? ''}`.toLowerCase();
        return full.includes(q);
      })
      .sort((a, b) =>
        `${a.fname} ${a.lname}`.localeCompare(`${b.fname} ${b.lname}`)
      );
  }, [allUsers, roleFilter, teamFilter, query]);

  // ---- Update event mutation ----

  const updateMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        eventType: type,
        start: start.toISOString(),
        end: end.toISOString(),
        title: title.trim() || null,
        body: body.trim() || null,
        location: location || null,
      };
      return api.put(`/api/events/${event.id}`, payload).then((r) => r.data);
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['events'] });
      await qc.invalidateQueries({ queryKey: ['event', event.id] });
      await qc.invalidateQueries({ queryKey: ['user-events'] });
      onClose();
    },
  });

  // ---- Attendee add/remove mutations (immediate toggle) ----
  const addAttendeesMutation = useMutation({
    mutationFn: async (ids: string[]) =>
      api
        .post(`/api/events/${event.id}/attendees`, {
          userIds: ids,
          status: 'PENDING',
        })
        .then((r) => r.data),
    onSettled: async () => {
      await qc.invalidateQueries({ queryKey: ['event-attendees', event.id] });
    },
  });

  const removeAttendeeMutation = useMutation({
    mutationFn: async (userId: string) =>
      api
        .delete(`/api/events/${event.id}/attendees/${userId}`)
        .then((r) => r.data),
    onSettled: async () => {
      await qc.invalidateQueries({ queryKey: ['event-attendees', event.id] });
    },
  });

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      const wasOn = next.has(id);
      if (wasOn) {
        next.delete(id);
        // optimistic remove
        removeAttendeeMutation.mutate(id);
      } else {
        next.add(id);
        // optimistic add (single)
        addAttendeesMutation.mutate([id]);
      }
      return next;
    });
  };

  return (
    <FullScreenModal isVisible={open} onClose={onClose} title="Update Event">
      <ScrollView contentContainerStyle={{ padding: 16, gap: 14 }}>
        {/* Type (Global hidden for Coach/Reg Coach) */}
        <Text style={{ fontWeight: '700', fontSize: 14, color: '#fff' }}>
          Type
        </Text>
        <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
          {allowedTypes.map((t) => (
            <TouchableOpacity
              key={t}
              onPress={() => setType(t)}
              style={{
                paddingVertical: 8,
                paddingHorizontal: 12,
                borderRadius: 10,
                borderWidth: 1,
                borderColor:
                  type === t
                    ? `${GlobalColors.bomber}`
                    : 'rgba(255,255,255,0.2)',
                backgroundColor:
                  type === t ? 'rgba(39, 166, 245,0.15)' : 'transparent',
              }}
            >
              <Text style={{ fontWeight: '600', color: '#fff' }}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Title */}
        <Text style={{ fontWeight: '700', fontSize: 14, color: '#fff' }}>
          Title
        </Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Event title"
          placeholderTextColor="#aaa"
          style={{
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.2)',
            borderRadius: 10,
            padding: 10,
            color: '#fff',
            backgroundColor: 'rgba(255,255,255,0.06)',
          }}
        />

        {/* Location */}
        <Text style={{ fontWeight: '700', fontSize: 14, color: '#fff' }}>
          Location
        </Text>
        <View style={{ flexDirection: 'column', gap: 10 }}>
          <View style={{ flex: 2 }}>
            <Text style={{ opacity: 0.8, marginBottom: 6, color: '#fff' }}>
              City
            </Text>
            <TextInput
              value={city}
              onChangeText={setCity}
              placeholder="e.g. College Station"
              placeholderTextColor="#aaa"
              style={{
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.2)',
                borderRadius: 10,
                padding: 14,
                color: '#fff',
                backgroundColor: 'rgba(255,255,255,0.06)',
              }}
            />
          </View>
          <View style={{ flex: 1 }}>
            <CustomSelect
              label="Select state"
              options={US_STATES} // [{ label, value: 'Alabama' }, ...]
              value={stateInput || undefined}
              onSelect={(v) => setStateInput(v)}
            />
          </View>
        </View>

        {/* Details (body) */}
        <Text style={{ fontWeight: '700', fontSize: 14, color: '#fff' }}>
          Details (Stadium / Facility / Address / Notes)
        </Text>
        <TextInput
          value={body}
          onChangeText={setBody}
          placeholder="e.g. Veterans Park & Athletic Complex, Field 3"
          placeholderTextColor="#aaa"
          multiline
          textAlignVertical="top"
          style={{
            minHeight: 90,
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.2)',
            borderRadius: 10,
            padding: 12,
            color: '#fff',
            backgroundColor: 'rgba(255,255,255,0.06)',
          }}
        />

        {/* Start / End — separate Date & Time fields */}
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <DateField
            label="Start Date"
            value={start}
            onChange={handleStartDate}
          />
          <TimeField
            label="Start Time"
            value={start}
            onChange={handleStartTime}
          />
        </View>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <DateField
            label="End Date"
            value={end}
            onChange={handleEndDate}
            minimumDate={start}
          />
          <TimeField label="End Time" value={end} onChange={handleEndTime} />
        </View>

        {/* Invitees */}
        <Text style={{ fontWeight: '700', fontSize: 14, color: '#fff' }}>
          Invitees
        </Text>

        {/* Role filter chips */}
        <Text style={{ opacity: 0.8, color: '#fff' }}>Filter by role</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {(
            [
              'ALL',
              'COACH',
              'PLAYER',
              'PARENT',
              'REGIONAL_COACH',
              'ADMIN',
            ] as RoleFilter[]
          ).map((r) => (
            <TouchableOpacity
              key={r}
              onPress={() => setRoleFilter(r)}
              style={{
                paddingVertical: 6,
                paddingHorizontal: 10,
                borderRadius: 999,
                borderWidth: 1,
                borderColor:
                  roleFilter === r
                    ? `${GlobalColors.bomber}`
                    : 'rgba(255,255,255,0.2)',
                backgroundColor:
                  roleFilter === r ? 'rgba(39,166,245,0.14)' : 'transparent',
              }}
            >
              <Text style={{ fontWeight: '600', color: '#fff' }}>{r}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Team filter */}
        <Text style={{ opacity: 0.8, marginTop: 8, color: '#fff' }}>
          Filter by team
        </Text>
        <CustomSelect
          label="All Teams"
          options={[
            { label: 'All Teams', value: 'ALL' },
            ...teams.map((t) => ({ label: t.name, value: t.id })),
          ]}
          value={teamFilter}
          onSelect={(v) => setTeamFilter(v)}
        />

        {/* Search input */}
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search by name"
          placeholderTextColor="#aaa"
          style={{
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.2)',
            borderRadius: 10,
            padding: 10,
            color: '#fff',
            backgroundColor: 'rgba(255,255,255,0.06)',
          }}
        />

        {/* User list (toggle add/remove) */}
        <View style={{ maxHeight: 260, borderRadius: 12, overflow: 'hidden' }}>
          <ScrollView>
            {attendeesLoading ? (
              <Text style={{ opacity: 0.8, padding: 10, color: '#fff' }}>
                Loading attendees…
              </Text>
            ) : attendeesError ? (
              <Text style={{ color: '#e66', padding: 10 }}>
                Failed to load attendees
              </Text>
            ) : selectableUsers.length === 0 ? (
              <Text style={{ opacity: 0.8, padding: 10, color: '#fff' }}>
                No users
              </Text>
            ) : (
              selectableUsers.map((u) => {
                const id = u.id;
                const name =
                  `${u.fname ?? ''} ${u.lname ?? ''}`.trim() ||
                  (u as any).email;
                const isOn = selected.has(id);
                return (
                  <TouchableOpacity
                    key={id}
                    onPress={() => toggleSelect(id)}
                    style={{
                      padding: 10,
                      borderBottomWidth: 1,
                      borderBottomColor: 'rgba(255,255,255,0.06)',
                      backgroundColor: isOn
                        ? 'rgba(39,166,245,0.12)'
                        : 'transparent',
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{ fontWeight: '600', color: '#fff' }}>
                      {name}
                    </Text>
                    <Text style={{ opacity: 0.7, fontSize: 12, color: '#fff' }}>
                      {isOn ? 'Invited ✓' : 'Tap to add'}
                    </Text>
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>
        </View>

        {/* Actions */}
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
          <CustomButton
            title={updateMutation.isPending ? 'Saving…' : 'Save Changes'}
            onPress={() => updateMutation.mutate()}
            disabled={updateMutation.isPending || allowedTypes.length === 0}
          />
          <CustomButton title="Cancel" variant="secondary" onPress={onClose} />
        </View>

        {!!updateMutation.error && (
          <Text style={{ color: '#e66' }}>
            {(updateMutation.error as any)?.response?.data?.error ??
              (updateMutation.error as Error).message}
          </Text>
        )}
        {!!addAttendeesMutation.error && (
          <Text style={{ color: '#e66' }}>
            {(addAttendeesMutation.error as any)?.response?.data?.error ??
              (addAttendeesMutation.error as Error).message}
          </Text>
        )}
        {!!removeAttendeeMutation.error && (
          <Text style={{ color: '#e66' }}>
            {(removeAttendeeMutation.error as any)?.response?.data?.error ??
              (removeAttendeeMutation.error as Error).message}
          </Text>
        )}
      </ScrollView>
    </FullScreenModal>
  );
}
