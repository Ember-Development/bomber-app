import { prisma } from '@bomber-app/database';

export const regCoachService = {
  upsertByUser: (userID: string, region: string) => {
    return prisma.regCoach.upsert({
      where: { userID },
      update: { region: region as any },
      create: { userID, region: region as any },
      include: { user: true },
    });
  },

  removeByUser: (userID: string) => {
    return prisma.regCoach.delete({ where: { userID } });
  },

  list: () => prisma.regCoach.findMany({ include: { user: true } }),
};
