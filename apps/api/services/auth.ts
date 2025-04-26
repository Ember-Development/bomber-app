import { prisma } from '@bomber-app/database';

export const authService = {
  getMockLogin: async () => {
    return await prisma.user.findUnique({
      where: { id: '15181fa0-16aa-4583-bbb7-9a6f26ae3227' },
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
