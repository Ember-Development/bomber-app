import type { Prisma, Event } from '../generated/client';
export { EventType } from '../enums';

type Relations = {
  tournament: { tournament: true };
  attendees: { attendees: true };
};

export type EventDynamic<R extends (keyof Relations)[]> =
  Prisma.EventGetPayload<{
    include: { [K in R[number]]: true };
  }>;

export type EventFE = Omit<
  Prisma.EventGetPayload<{
    include: { attendees: true };
  }>,
  'id'
>;

// this is weird but fixes whatever fucked up since last time
export type EventBE = Omit<Event, 'id'>;

export type NewEvent = Omit<Event, 'id' | 'tournamentID'>;

// FIXME: for some reason this doesnt work... boo
// export type EventFE = EventDynamic<['attendees']>;
export type EventDB = EventDynamic<[]>;
