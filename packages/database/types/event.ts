import { Prisma, Event } from '../generated/client';

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

// weird that we need this now... again... everything was working with types last I used it...
export { EventType } from '../generated/client';

// FIXME: for some reason this doesnt work... boo
// export type EventFE = EventDynamic<['attendees']>;
export type EventDB = EventDynamic<[]>;
