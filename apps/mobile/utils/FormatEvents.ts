import { EventFE, TournamentFE } from '@bomber-app/database';

//FIXME: this should be updated in the event FE type so it's consistent
export function formatEvents(rawEvents: EventFE[]) {
  return (
    rawEvents?.flatMap((e) => {
      if (!e.start || !e.end) return [];

      const start = new Date(e.start);
      const end = new Date(e.end);
      const time = `${start.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })} - ${end.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })}`;

      return [
        {
          date: typeof e.start === 'string' ? e.start : e.start.toISOString(),
          title: e.tournament
            ? `Tournament – ${e.tournament.title}`
            : e.eventType,
          location: e.tournament?.title ?? 'Unknown Location',
          time,
        },
      ];
    }) ?? []
  );
}

export function getCountdown(diff: number) {
  if (diff <= 0) return 'Event Started';
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}
