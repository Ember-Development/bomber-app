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
    return await prisma.event.findMany({
      include: {
        tournament: true, // includes title, body, imageURL
        attendees: {
          include: {
            user: true, // includes the user on each attendance row
          },
        },
      },
      orderBy: {
        start: 'desc',
      },
    });
  },
};
