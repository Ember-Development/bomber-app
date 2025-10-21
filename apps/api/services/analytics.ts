import { prisma } from '../api';

export const analyticsService = {
  getAnalytics: async () => {
    // Get total players count
    const totalPlayers = await prisma.player.count();

    // Get total notifications sent count
    const totalNotificationsSent = await prisma.notification.count({
      where: {
        status: 'sent',
      },
    });

    // Get total teams count
    const totalTeams = await prisma.team.count();

    // Get total users count (excluding deleted users)
    const totalUsers = await prisma.user.count({
      where: {
        isDeleted: false,
      },
    });

    return {
      totalPlayers,
      totalNotificationsSent,
      totalTeams,
      totalUsers,
    };
  },
};
