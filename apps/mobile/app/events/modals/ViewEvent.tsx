import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { Text } from '@react-navigation/elements';
import dayjs from 'dayjs';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Colors, EventColors, GlobalColors } from '@/constants/Colors';
import { EventType } from '@bomber-app/database';
import { ThemedText } from '@/components/ThemedText';
import CustomButton from '@/components/ui/atoms/Button';
import { useColorScheme } from '@/hooks/useColorScheme';
import { api } from '@/api/api';
import { useUserContext } from '@/context/useUserContext';
import UpdateEventModal from './UpdateEvent';

type ViewEventProps = {
  eventId?: string;
};

type EventDetailDTO = {
  id: string;
  title: string | null;
  body?: string | null;
  location?: string | null;
  eventType: EventType;
  start: string | Date;
  end: string | Date;
  tournament?: { id: string; title?: string | null } | null;
  attendees: Array<{
    status: 'ATTENDING' | 'MAYBE' | 'DECLINED' | 'PENDING';
    user: {
      id: string;
      fname?: string | null;
      lname?: string | null;
      avatarUrl?: string | null;
    };
  }>;
};

const STATUS_COLOR: Record<string, string> = {
  ATTENDING: '#00ff7f',
  MAYBE: '#caa400',
  DECLINED: '#c0392b',
  PENDING: '#6b7280',
};

function useEventDetail(eventId?: string) {
  return useQuery({
    queryKey: ['event', eventId],
    enabled: !!eventId,
    queryFn: async () => {
      const { data } = await api.get<EventDetailDTO>(`/api/events/${eventId}`);
      return data;
    },
  });
}

function Badge({ label, color }: { label: string; color: string }) {
  return (
    <View
      style={[
        styles.badge,
        { borderColor: color, backgroundColor: `${color}22` },
      ]}
    >
      <Text style={[styles.badgeText, { color }]}>{label}</Text>
    </View>
  );
}

function Row({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <View style={styles.row}>
      <ThemedText style={styles.rowLabel}>{label}</ThemedText>
      <ThemedText style={styles.rowValue}>{value}</ThemedText>
    </View>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

function InitialsAvatar({
  fname,
  lname,
  uri,
}: {
  fname?: string | null;
  lname?: string | null;
  uri?: string | null;
}) {
  const initials =
    `${(fname?.[0] ?? '').toUpperCase()}${(lname?.[0] ?? '').toUpperCase()}` ||
    '•';
  if (uri) {
    return <Image source={{ uri }} style={styles.avatar} />;
  }
  return (
    <View style={[styles.avatar, styles.avatarFallback]}>
      <Text style={{ color: '#fff', fontWeight: '700' }}>{initials}</Text>
    </View>
  );
}

export default function ViewEvent({ eventId }: ViewEventProps) {
  const { theme } = useColorScheme();
  const { user } = useUserContext();
  const qc = useQueryClient();

  const { data, isLoading, isError, refetch } = useEventDetail(eventId);
  const [showUpdate, setShowUpdate] = useState(false);
  const [deleted, setDeleted] = useState(false);

  const title = useMemo(() => {
    if (!data) return '';
    return data.title ?? data.tournament?.title ?? data.eventType;
  }, [data]);

  const when = useMemo(() => {
    if (!data) return '';
    const start = dayjs(data.start);
    const end = dayjs(data.end);

    const sameDay = start.isSame(end, 'day');
    const sameMonth = start.isSame(end, 'month');
    const sameYear = start.isSame(end, 'year');

    // Date range formatting
    const dateStr = sameDay
      ? start.format('dddd, MMM D, YYYY')
      : sameMonth
        ? `${start.format('MMM D')}–${end.format('D, YYYY')}`
        : sameYear
          ? `${start.format('MMM D')} – ${end.format('MMM D, YYYY')}`
          : `${start.format('MMM D, YYYY')} – ${end.format('MMM D, YYYY')}`;

    // Time range formatting
    const timeStr = `${start.format('h:mm A')} – ${end.format('h:mm A')}`;

    return `${dateStr}\n${timeStr}`;
  }, [data]);

  const myStatus = useMemo(() => {
    if (!data || !user) return undefined;
    return data.attendees.find((a) => a.user.id === user.id)?.status;
  }, [data, user]);

  const color = data?.eventType
    ? EventColors[data.eventType]
    : GlobalColors.bomber;

  // Allow edit/delete for admin/coach/regional coach
  const canManage = useMemo(() => {
    if (!user) {
      console.log('[canManage] No user');
      return false;
    }

    // Check if user has admin, coach, or regCoach relation
    const isAdmin = !!user.admin;
    const isCoach = !!user.coach;
    const isRegCoach = !!user.regCoach;

    const hasPermission = isAdmin || isCoach || isRegCoach;

    if (!hasPermission) {
      console.log(
        '[canManage] User does not have permission. PrimaryRole:',
        user.primaryRole,
        'Relations:',
        { isAdmin, isCoach, isRegCoach }
      );
    } else {
      console.log('[canManage] User has permission:', user.primaryRole);
    }

    return hasPermission;
  }, [user]);

  // ---- RSVP mutations (optimistic) ----
  const eventKey = ['event', eventId];
  const userEventsKey = ['user-events', user?.id];

  const rsvpMutation = useMutation({
    mutationFn: (status: 'ATTENDING' | 'MAYBE' | 'DECLINED') =>
      api.post(`/api/events/${eventId}/rsvp`, { status }).then((r) => r.data),
    onMutate: async (status) => {
      await qc.cancelQueries({ queryKey: eventKey });
      const prev = qc.getQueryData<EventDetailDTO>(eventKey);

      if (prev && user) {
        const next = { ...prev, attendees: [...prev.attendees] };
        const idx = next.attendees.findIndex((a) => a.user.id === user.id);
        if (idx >= 0) next.attendees[idx] = { ...next.attendees[idx], status };
        else
          next.attendees.unshift({
            status,
            user: {
              id: user.id,
              fname: (user as any).fname,
              lname: (user as any).lname,
              avatarUrl: (user as any).avatarUrl,
            },
          });
        qc.setQueryData(eventKey, next);
      }

      return { prev };
    },
    onError: (_e, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(eventKey, ctx.prev);
    },
    onSettled: async () => {
      await qc.invalidateQueries({ queryKey: eventKey });
      await qc.invalidateQueries({ queryKey: userEventsKey });
    },
  });

  const unRsvpMutation = useMutation({
    mutationFn: () =>
      api.delete(`/api/events/${eventId}/rsvp`).then((r) => r.data),
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: eventKey });
      const prev = qc.getQueryData<EventDetailDTO>(eventKey);

      if (prev && user) {
        const next = {
          ...prev,
          attendees: prev.attendees.filter((a) => a.user.id !== user.id),
        };
        qc.setQueryData(eventKey, next);
      }

      return { prev };
    },
    onError: (_e, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(eventKey, ctx.prev);
    },
    onSettled: async () => {
      await qc.invalidateQueries({ queryKey: eventKey });
      await qc.invalidateQueries({ queryKey: userEventsKey });
    },
  });

  // ---- Delete event ----
  const deleteMutation = useMutation({
    mutationFn: async () => {
      try {
        const response = await api.delete(`/api/events/${eventId}`);
        return response.data;
      } catch (error) {
        console.error('Delete event error:', error);
        throw error;
      }
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['events'] });
      await qc.invalidateQueries({ queryKey: eventKey });
      await qc.invalidateQueries({ queryKey: userEventsKey });
      setDeleted(true);
      Alert.alert('Success', 'Event deleted successfully');
    },
    onError: (error: any) => {
      console.error('Failed to delete event:', error);
      const message = error?.response?.data?.error || 'Failed to delete event';
      Alert.alert('Error', message);
    },
  });

  const confirmDelete = () => {
    if (!data) return;
    Alert.alert(
      'Delete event?',
      'This will remove the event and all RSVPs.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: deleteMutation.isPending ? 'Deleting…' : 'Delete',
          style: 'destructive',
          onPress: () => deleteMutation.mutate(),
        },
      ],
      { cancelable: true }
    );
  };

  // ---- UI states ----
  if (!eventId) {
    return (
      <View style={styles.center}>
        <ThemedText>No event selected.</ThemedText>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <ThemedText style={{ marginTop: 8 }}>Loading event…</ThemedText>
      </View>
    );
  }

  if (isError || !data) {
    return (
      <View style={styles.center}>
        <ThemedText>Couldn’t load event.</ThemedText>
        <CustomButton title="Retry" onPress={() => refetch()} />
      </View>
    );
  }

  if (deleted) {
    return (
      <View style={styles.center}>
        <ThemedText>Event deleted.</ThemedText>
      </View>
    );
  }

  // Attendee summaries
  const grouped = data.attendees.reduce<Record<string, number>>((acc, a) => {
    acc[a.status] = (acc[a.status] ?? 0) + 1;
    return acc;
  }, {});
  const topAttendees = data.attendees.slice(0, 6);

  return (
    <>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* Header */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.title, { color: Colors[theme].text }]}>
              {title}
            </Text>
            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: 8,
                marginTop: 8,
              }}
            >
              <Badge
                label={data.eventType}
                color={color ?? GlobalColors.bomber}
              />
              {data.tournament?.title ? (
                <Badge
                  label="Tournament"
                  color={color ?? GlobalColors.bomber}
                />
              ) : null}
              {myStatus ? (
                <Badge
                  label={`You: ${myStatus}`}
                  color={STATUS_COLOR[myStatus] ?? '#6b7280'}
                />
              ) : null}
            </View>
          </View>
        </View>

        {/* Manage buttons (Edit/Delete) */}
        {canManage && (
          <View
            style={{
              flexDirection: 'row',
              gap: 8,
              marginTop: 6,
              marginBottom: 6,
              flexWrap: 'wrap',
            }}
          >
            <CustomButton
              title="Edit"
              variant="secondary"
              onPress={() => setShowUpdate(true)}
            />
            <CustomButton
              title={deleteMutation.isPending ? 'Deleting…' : 'Delete'}
              variant="danger"
              onPress={confirmDelete}
            />
          </View>
        )}

        <Divider />

        {/* When/Where */}
        <Row label="When" value={when} />
        <Row label="Where" value={data.location ?? '—'} />
        {data.tournament?.title ? (
          <Row label="Tournament" value={data.tournament.title ?? '—'} />
        ) : null}

        {/* Description */}
        {data.body ? (
          <>
            <Divider />
            <ThemedText style={styles.sectionTitle}>Details</ThemedText>
            <ThemedText style={styles.bodyText}>{data.body}</ThemedText>
          </>
        ) : null}

        {/* RSVP Actions */}
        <Divider />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          <CustomButton
            title="Going"
            onPress={() => rsvpMutation.mutate('ATTENDING')}
          />
          <CustomButton
            title="Maybe"
            variant="secondary"
            onPress={() => rsvpMutation.mutate('MAYBE')}
          />
          <CustomButton
            title="Decline"
            variant="danger"
            onPress={() => rsvpMutation.mutate('DECLINED')}
          />
          <CustomButton
            title="Remove My RSVP"
            variant="text"
            onPress={() => unRsvpMutation.mutate()}
          />
        </View>

        {/* Attendees */}
        <Divider />
        <ThemedText style={styles.sectionTitle}>Attendees</ThemedText>
        <View
          style={{
            flexDirection: 'row',
            gap: 10,
            flexWrap: 'wrap',
            marginBottom: 8,
          }}
        >
          {Object.entries(grouped).map(([status, count]) => (
            <View
              key={status}
              style={[
                styles.statusPill,
                { borderColor: STATUS_COLOR[status] ?? '#888' },
              ]}
            >
              <Text
                style={{
                  color: STATUS_COLOR[status] ?? '#888',
                  fontWeight: '700',
                }}
              >
                {status}: {count}
              </Text>
            </View>
          ))}
        </View>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          {topAttendees.map((a) => (
            <View key={a.user.id} style={styles.attendee}>
              <InitialsAvatar
                fname={a.user.fname}
                lname={a.user.lname}
                uri={a.user.avatarUrl || undefined}
              />
              <ThemedText style={styles.attendeeName}>
                {(a.user.fname ?? '').trim()} {(a.user.lname ?? '').trim()}
              </ThemedText>
              <ThemedText
                style={[
                  styles.attendeeStatus,
                  { color: STATUS_COLOR[a.status] ?? '#aaa' },
                ]}
              >
                {a.status}
              </ThemedText>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Update modal */}
      {data && (
        <UpdateEventModal
          open={showUpdate}
          onClose={() => setShowUpdate(false)}
          event={{
            id: data.id,
            eventType: data.eventType,
            start: String(data.start),
            end: String(data.end),
            title: data.title ?? '',
            body: data.body ?? '',
            location: data.location ?? '',
          }}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center', padding: 24 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  title: { fontSize: 20, fontWeight: '800' },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginVertical: 12,
  },
  row: { marginBottom: 10 },
  rowLabel: { opacity: 0.7, marginBottom: 2, fontSize: 12 },
  rowValue: { fontSize: 14, lineHeight: 20 },
  sectionTitle: { fontSize: 14, fontWeight: '700', marginBottom: 6 },
  bodyText: { fontSize: 14, opacity: 0.9, lineHeight: 20 },
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  badgeText: { fontSize: 12, fontWeight: '700' },
  statusPill: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  attendee: {
    width: '47%',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  attendeeName: { marginTop: 8, fontSize: 13, fontWeight: '600' },
  attendeeStatus: { marginTop: 2, fontSize: 12, fontWeight: '700' },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#222' },
  avatarFallback: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
});
