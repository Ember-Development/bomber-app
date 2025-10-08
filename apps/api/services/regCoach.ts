import { Regions } from '@bomber-app/database/generated/client';
import { prisma } from '../api';
import { userService } from './user';

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

  upsertRegionWithTakeover: async (
    userIdRaw: string | number,
    region: string
  ) => {
    const userID = String(userIdRaw);

    return prisma.$transaction(
      async (tx: {
        regCoach: {
          findUnique: (arg0: {
            where: { region: Regions }; // region has a unique constraint
            select: { userID: boolean };
          }) => any;
          deleteMany: (arg0: { where: { userID: any } }) => any;
          upsert: (arg0: {
            where: { userID: string };
            update: { region: Regions };
            create: { userID: string; region: Regions };
            include: { user: boolean };
          }) => any;
        };
      }) => {
        // Find a current owner of this region (if any)
        const currentOwner = await tx.regCoach.findUnique({
          where: { region: region as Regions }, // region has a unique constraint
          select: { userID: true },
        });

        // If someone else owns it, demote them and free the slot
        if (currentOwner && currentOwner.userID !== userID) {
          await tx.regCoach.deleteMany({
            where: { userID: currentOwner.userID },
          });

          // Optional but recommended: keep roles consistent
          await userService.ensureRole(String(currentOwner.userID), 'COACH');
          await userService.setPrimaryRole(
            String(currentOwner.userID),
            'COACH'
          );
        }

        // 3) Upsert the target user's RegCoach row into the region
        const reg = await tx.regCoach.upsert({
          where: { userID },
          update: { region: region as Regions },
          create: { userID, region: region as Regions },
          include: { user: true },
        });

        return reg;
      }
    );
  },

  deleteByUserId: async (userIdRaw: string | number) => {
    const userID = Number(userIdRaw);
    await prisma.regCoach.deleteMany({ where: { userID } });
  },
};
