import type { Prisma, EventAttendance } from '../generated/client';

type Relations = {
  users: { user: true };
  events: { event: true };
};

export type EventAttendanceFE = Omit<
  Prisma.EventAttendanceGetPayload<{
    include: { event: true; user: true };
  }>,
  'id'
>;

// this is weird but fixes whatever fucked up since last time
export type EventAttendanceBE = Omit<EventAttendance, 'id'>;

export type NewEventAttendance = Pick<EventAttendance, 'userID' | 'status'>;

// FIXME: for some reason this doesnt work... boo
// export type EventFE = EventDynamic<['attendees']>;
export type EventAttendanceDynamic<R extends (keyof Relations)[]> =
  Prisma.EventGetPayload<{
    include: { [K in R[number]]: true };
  }>;
export type EventAttendanceDB = EventAttendanceDynamic<[]>;
