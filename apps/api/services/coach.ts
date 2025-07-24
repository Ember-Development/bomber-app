import { Prisma, prisma } from '@bomber-app/database';

export interface UpdateCoachInput
  extends Omit<Prisma.CoachUpdateInput, 'address'> {
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  zip?: string;
}

export const coachService = {
  getAllCoaches: async () => {
    return prisma.coach.findMany({
      include: {
        user: true,
        headTeams: true,
        teams: true,
        address: true,
      },
    });
  },

  getCoachById: async (id: string) => {
    return prisma.coach.findUnique({
      where: { id },
      include: {
        user: true,
        headTeams: true,
        teams: true,
        address: true,
      },
    });
  },

  updateCoach: async (id: string, data: UpdateCoachInput) => {
    const { addressID, address1, address2, city, state, zip, ...coachData } =
      data as any;

    return prisma.coach.update({
      where: { id },
      data: {
        ...coachData,
        address: address1
          ? {
              upsert: {
                create: { address1, address2, city, state, zip },
                update: { address1, address2, city, state, zip },
              },
            }
          : undefined,
      },
      include: {
        user: true,
        headTeams: true,
        teams: true,
        address: true,
      },
    });
  },

  deleteCoach: async (id: string) => {
    return prisma.coach.delete({
      where: { id },
    });
  },
};
