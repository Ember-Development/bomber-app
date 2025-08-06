import { prisma } from '@bomber-app/database';

//FIXME: replace the any once we have full types
const validateEvent = (event: any) => {
  const errors = [];

  //TODO: use enums when we have full types
  if (event.eventType == 'Global') {
    if (event.attendees.length > 0) {
      errors.push(
        'Global events implicitly invite all users, do not track them as this will cause a huge storage issue'
      );
    }
  } else if (event.eventType == 'Tournament') {
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

  createEvent: async (data: any) => {
    const errors = validateEvent(data);
    if (errors) throw new Error(errors.join('; '));

    return prisma.event.create({
      data: {
        eventType: data.eventType,
        start: new Date(data.start),
        end: new Date(data.end),
        tournamentID: data.tournamentID || undefined,
      },
      include: {
        tournament: true,
        attendees: { include: { user: true } },
      },
    });
  },

  updateEvent: async (id: string, data: any) => {
    const errors = validateEvent(data);
    if (errors) throw new Error(errors.join('; '));

    return prisma.event.update({
      where: { id },
      data: {
        eventType: data.eventType,
        start: new Date(data.start),
        end: new Date(data.end),
        tournamentID: data.tournamentID || undefined,
      },
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
