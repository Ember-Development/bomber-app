import { prisma } from '../api';

export const integrationService = {
  /**
   * Get all NIL athletes with their user, team, and parent information
   * for external integration purposes
   */
  getNilAthletesForIntegration: async () => {
    return prisma.player.findMany({
      where: {
        nil: true,
      },
      select: {
        id: true,
        jerseyNum: true,
        pos1: true,
        pos2: true,
        ageGroup: true,
        gradYear: true,
        college: true,
        user: {
          select: {
            id: true,
            email: true,
            fname: true,
            lname: true,
          },
        },
        team: {
          select: {
            id: true,
            name: true,
            ageGroup: true,
            region: true,
            state: true,
          },
        },
        address: {
          select: {
            id: true,
            address1: true,
            address2: true,
            city: true,
            state: true,
            zip: true,
          },
        },
        parents: {
          select: {
            id: true,
            user: {
              select: {
                fname: true,
                lname: true,
                email: true,
                phone: true,
              },
            },
          },
        },
      },
    });
  },

  /**
   * Get all admin users with their user information
   * for external integration purposes
   * Filters by primaryRole === 'ADMIN'
   */
  getAdminsForIntegration: async () => {
    return prisma.user.findMany({
      where: {
        primaryRole: 'ADMIN',
        isDeleted: false,
      },
      select: {
        id: true,
        email: true,
        fname: true,
        lname: true,
        phone: true,
        primaryRole: true,
        emailVerification: true,
      },
    });
  },
};
