import { UserEvent } from '@/types';

export function formatEvents(rawEvents: UserEvent[]) {
  return (
    rawEvents?.flatMap((e) => {
      if (!e.event?.start || !e.event?.end) return [];

      const start = new Date(e.event.start);
      const end = new Date(e.event.end);
      const time = `${start.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })} - ${end.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })}`;

      return [
        {
          date:
            typeof e.event.start === 'string'
              ? e.event.start
              : e.event.start.toISOString(),
          title: e.event.tournament
            ? `Tournament – ${e.event.tournament.title}`
            : e.event.eventType,
          location: e.event.tournament?.title ?? 'Unknown Location',
          time,
        },
      ];
    }) ?? []
  );
}
