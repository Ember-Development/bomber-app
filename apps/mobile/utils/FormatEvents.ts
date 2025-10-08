import dayjs from 'dayjs';

type TournamentMaybe = { title?: string | null } | null | undefined;

type FlatEvent = {
  id: string;
  eventType: string;
  start: string | Date;
  end: string | Date;
  title?: string | null;
  location?: string | null;
  tournament?: TournamentMaybe;
};

type UserEventRow = { event?: FlatEvent } & Record<string, any>;

export type SpotlightEvent = {
  date: string; // MUST be ISO for EventCardContainer comparisons
  title: string;
  location: string;
  time: string; // "h:mm A – h:mm A"
};

function toISO(d: string | Date): string | null {
  const dt = new Date(d as any);
  return isNaN(dt.getTime()) ? null : dt.toISOString();
}

export function formatEvents(
  raw: UserEventRow[] | FlatEvent[]
): SpotlightEvent[] {
  if (!raw?.length) return [];

  // 1) Flatten both shapes: [{ event: {...} }] OR [{...flat}]
  const events: FlatEvent[] = (raw as any[]).map((row) =>
    row?.event ? row.event : row
  );

  // 2) Validate + normalize times
  const normalized = events
    .map((e) => {
      const startISO = toISO(e.start);
      const endISO = toISO(e.end);
      if (!startISO || !endISO) return null;

      const start = new Date(startISO);
      const end = new Date(endISO);

      const title = e.title ?? e.tournament?.title ?? e.eventType ?? 'Event';
      const location = e.location ?? e.tournament?.title ?? 'Unknown Location';
      const time = `${dayjs(start).format('h:mm A')} – ${dayjs(end).format('h:mm A')}`;

      return {
        date: startISO, // always ISO; EventCardContainer relies on this!
        title,
        location,
        time,
      } as SpotlightEvent;
    })
    .filter(Boolean) as SpotlightEvent[];

  // 3) Sort soonest first (EventCardContainer will split upcoming/past)
  normalized.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return normalized;
}

// unchanged
export function getCountdown(diff: number) {
  if (diff <= 0) return 'Event Started';
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}
