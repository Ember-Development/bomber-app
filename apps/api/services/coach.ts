import { Prisma, prisma } from '@bomber-app/database';
import { Role } from '../auth/permissions';

export interface UpdateCoachInput
  extends Omit<Prisma.CoachUpdateInput, 'address' | 'user'> {
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  zip?: string;
  fname?: string;
  lname?: string;
  email?: string;
  phone?: string;
}

const canAccessCoach = async (
  actingUserId: string,
  coachId: string,
  role: Role
): Promise<boolean> => {
  if (role === 'ADMIN') return true;

  const coach = await prisma.coach.findUnique({
    where: { id: coachId },
    include: {
      teams: {
        select: {
          region: true,
          coaches: {
            where: { userID: actingUserId },
          },
        },
      },
    },
  });

  if (!coach || coach.teams.length === 0) return false;

  switch (role) {
    case 'COACH':
      return coach.teams.some((t) => t.coaches.length > 0);

    case 'REGIONAL_COACH':
      const regCoach = await prisma.regCoach.findUnique({
        where: { userID: actingUserId },
      });
      return coach.teams.some((t) => t.region === regCoach?.region);

    default:
      return false;
  }
};

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

  updateCoach: async (
    coachId: string,
    data: UpdateCoachInput,
    actingUserId: string,
    role: Role
  ) => {
    const authorized = await canAccessCoach(actingUserId, coachId, role);
    if (!authorized) throw new Error('Not authorized to update this coach.');

    const {
      address1,
      address2,
      city,
      state,
      zip,
      fname,
      lname,
      email,
      phone,
      ...coachData
    } = data as any;

    const coach = await prisma.coach.findUnique({
      where: { id: coachId },
      include: { user: true, address: true },
    });

    if (!coach) throw new Error('Coach not found');
    return prisma.$transaction(async (tx) => {
      // 1. Update user
      const updatedUser = await tx.user.update({
        where: { id: coach.userID },
        data: {
          ...(fname && { fname }),
          ...(lname && { lname }),
          ...(email && { email }),
          ...(phone && { phone }),
        },
      });

      // 2. Update or create address
      if (address1) {
        if (coach.address?.id) {
          const updatedAddress = await tx.address.update({
            where: { id: coach.address.id },
            data: { address1, address2, city, state, zip },
          });
        } else {
          const newAddress = await tx.address.create({
            data: { address1, address2, city, state, zip },
          });

          await tx.coach.update({
            where: { id: coachId },
            data: {
              address: { connect: { id: newAddress.id } },
            },
          });
        }
      }

      const finalCoach = await tx.coach.findUnique({
        where: { id: coachId },
        include: {
          user: true,
          headTeams: true,
          teams: true,
          address: true,
        },
      });

      return finalCoach;
    });
  },

  deleteCoach: async (coachId: string, actingUserId: string, role: Role) => {
    const authorized = await canAccessCoach(actingUserId, coachId, role);
    if (!authorized) throw new Error('Not authorized to remove this coach.');

    return prisma.coach.delete({
      where: { id: coachId },
    });
  },
};
