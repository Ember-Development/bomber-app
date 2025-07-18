import { prisma } from '@bomber-app/database';

export const authService = {
  getMockLogin: async () => {
    return await prisma.user.findUnique({
      where: { id: '04a33843-74ea-48a1-ae63-596ec289bae6' },
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
