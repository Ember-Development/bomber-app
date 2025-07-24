import { prisma } from '@bomber-app/database';

export const authService = {
  getMockLogin: async () => {
    return await prisma.user.findUnique({
      where: { id: '32c565dc-cc22-4ad9-b9f4-517d7b2c0610' }, // your mock UUID
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
        coach: {
          include: {
            headTeams: true,
            address: true,
            teams: {
              include: {
                players: {
                  include: { user: true },
                },
                coaches: {
                  include: { user: true },
                },
                trophyCase: true,
                headCoach: true,
              },
            },
          },
        },
        regCoach: true,
        parent: {
          include: {
            children: {
              include: {
                team: true,
                address: true,
                user: true,
              },
            },
            address: true,
          },
        },
        admin: true,
        fan: true,
      },
    });
  },
};
