import { prisma } from '@bomber-app/database';

export const teamService = {
  getAllTeams: async () => {
    return prisma.team.findMany({
      include: {
        trophyCase: true,
        players: true,
        // regCoaches: true, // Removed as it is not a valid property
        coaches: true,
        headCoach: {
          include: {
            user: true,
          },
        },
      },
    });
  },

  getTeamById: async (id: string) => {
    return prisma.team.findUnique({
      where: { id },
      include: {
        trophyCase: true,
        players: {
          include: {
            user: true,
          },
        },
        coaches: {
          include: {
            user: true,
          },
        },
        headCoach: {
          include: {
            user: true,
          },
        },
      },
    });
  },
};
