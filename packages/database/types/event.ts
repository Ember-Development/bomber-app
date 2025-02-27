import { Prisma } from '../generated/client';

type Relations = {
  tournament: { tournament: true };
  attendees: { attendees: true };
};

export type EventDynamic<R extends (keyof Relations)[]> =
  Prisma.EventGetPayload<{
    include: { [K in R[number]]: true };
  }>;

export type EventFE = EventDynamic<['attendees']>;
export type EventDB = EventDynamic<[]>;
