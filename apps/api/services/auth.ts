import { prisma } from '@bomber-app/database';

export const authService = {
  getMockLogin: async () => {
    return await prisma.user.findUnique({
      where: { id: 'b8e7f6fa-2b20-4aaa-bff4-db2c0fa3b0f7' }, // your mock UUID
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
