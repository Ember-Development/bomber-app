import { prisma } from '@bomber-app/database';

export const authService = {
  getMockLogin: async () => {
    return await prisma.user.findUnique({
      where: { id: '5ca9200a-ead4-47a9-a10a-b448bf43e302' }, // change if need to work with seeded database may be different than mine
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
