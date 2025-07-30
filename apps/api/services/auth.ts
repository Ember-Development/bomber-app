import { prisma } from '@bomber-app/database';

export const authService = {
  getMockLogin: async () => {
    return await prisma.user.findUnique({
      where: { id: 'd9e09a61-f9dd-49d3-82a9-9cbe092b2e3b' },
      include: {
        player: {
          include: {
            team: {
              include: {
                headCoach: true,
                players: true,
                coaches: true,
                trophyCase: true,
              },
            },
            parents: true,
            address: true,
          },
        },
        admin: true,
        coach: true,
        regCoach: true,
        parent: true,
        fan: true,
      },
    });
  },
};
