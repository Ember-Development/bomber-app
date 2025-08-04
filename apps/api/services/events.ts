import {
  EventBE,
  EventFE,
  NewEvent,
  NewEventAttendance,
  prisma,
} from '@bomber-app/database';
import { EventType, Prisma } from '@bomber-app/database/generated/client';

const validateEvent = (event: EventFE) => {
  const errors = [];

  if (event.eventType == EventType.GLOBAL) {
    if (event.attendees.length > 0) {
      errors.push(
        'Global events implicitly invite all users, do not track them as this will cause a huge storage issue'
      );
    }
  } else if (event.eventType == EventType.TOURNAMENT) {
    if (!event.tournamentID) {
      errors.push('Tournament event types should have a tournament relation');
    }
  }

  if (errors.length > 0) return errors;
};

export { validateEvent };

export const eventService = {
  getAllEvents: async () => {
    return prisma.event.findMany({
      include: {
        tournament: true,
        attendees: { include: { user: true } },
      },
      orderBy: { start: 'desc' },
    });
  },

  getEventById: async (id: string) => {
    return prisma.event.findUnique({
      where: { id },
      include: {
        tournament: true,
        attendees: { include: { user: true } },
      },
    });
  },

  createEvent: async (
    event: NewEvent,
    attendees: NewEventAttendance[],
    tournamentID: string | null
  ) => {
    // primary model creation
    const newEvent = await prisma.event.create({
      data: {
        eventType: event.eventType,
        start: new Date(event.start),
        end: new Date(event.end),
        tournamentID,
      },
      include: {
        tournament: true,
        attendees: { include: { user: true } },
      },
    });

    // related fields
    const attendance = prisma.eventAttendance.createMany({
      data: attendees.map((attendee) => {
        return {
          eventID: newEvent.id,
          userID: attendee.userID,
          status: attendee.status,
        };
      }),
    });

    return { event: newEvent, attendance: attendance };
  },

  // note this is only for direct fields for new events, not relationships i.e. tournaments / attendants
  updateEvent: async (id: string, data: Partial<NewEvent>) => {
    // sort of thing zod is for but this effectively strips out anything undefined
    // intentionally will accept nulls in case we want to start omitting fields, although a bit dangerous!
    const safeUpdate: Prisma.EventUpdateInput = Object.fromEntries(
      Object.entries({
        eventType: data.eventType,
        start: data.start ? new Date(data.start) : undefined,
        end: data.end ? new Date(data.end) : undefined,
      }).filter(([, v]) => v !== undefined)
    );

    return prisma.event.update({
      where: { id },
      data: safeUpdate,
      include: {
        tournament: true,
        attendees: { include: { user: true } },
      },
    });
  },

  deleteEvent: async (id: string) => {
    await prisma.event.delete({ where: { id } });
    return true;
  },
};
