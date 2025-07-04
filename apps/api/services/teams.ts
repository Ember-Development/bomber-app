import { Prisma, prisma } from '@bomber-app/database';

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

  getMyTeams: async (userId: string) => {
    return prisma.team.findMany({
      where: {
        OR: [
          { headCoach: { userID: userId } },
          { coaches: { some: { userID: userId } } },
        ],
      },
      include: {
        trophyCase: true,
        players: {
          include: { user: true },
        },
        coaches: {
          include: { user: true },
        },
        headCoach: {
          include: { user: true },
        },
      },
    });
  },

  updateTeam: async (teamId: string, data: Prisma.TeamUpdateInput) => {
    return prisma.team.update({
      where: { id: teamId },
      data,
      include: {
        trophyCase: true,
        players: {
          include: { user: true },
        },
        coaches: {
          include: { user: true },
        },
        headCoach: {
          include: { user: true },
        },
      },
    });
  },

  deleteTeam: async (teamId: string) => {
    return prisma.team.delete({
      where: { id: teamId },
    });
  },
};
