import { prisma } from '@bomber-app/database';

export const authService = {
  getMockLogin: async () => {
    return await prisma.user.findUnique({
      where: { id: '2fc0894b-1fb7-4734-a64a-ea24d93883e4' }, // change if need to work with seeded database may be different than mine
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
