import { Prisma } from '@bomber-app/database/generated/client';
import { Role } from '../auth/permissions';
import { prisma } from '../api';

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

const canManageTeam = async (
  actingUserId: string,
  teamId: string,
  role: Role
) => {
  if (role === 'ADMIN') return true;

  if (role === 'COACH') {
    const onTeam = await prisma.team.findFirst({
      where: { id: teamId, coaches: { some: { userID: actingUserId } } },
      select: { id: true },
    });
    return !!onTeam;
  }

  if (role === 'REGIONAL_COACH') {
    const rc = await prisma.regCoach.findUnique({
      where: { userID: actingUserId },
      select: { region: true },
    });
    if (!rc) return false;
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      select: { region: true },
    });
    return !!team && team.region === rc.region;
  }

  return false;
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
      user: userPayload, // <-- nested user.update may be here
      ...rest
    } = data as any;

    // Pull potential top-level fields (if client sends them that way)
    const topFname = (data as any).fname;
    const topLname = (data as any).lname;
    const topEmail = (data as any).email;
    const topPhone = (data as any).phone;

    // Merge nested user.update with top-level overrides (top-level wins if provided)
    const mergedUserUpdate: any = {
      ...(userPayload?.update ?? {}),
      ...(typeof topFname !== 'undefined' ? { fname: topFname } : {}),
      ...(typeof topLname !== 'undefined' ? { lname: topLname } : {}),
      ...(typeof topEmail !== 'undefined' ? { email: topEmail } : {}),
      ...(typeof topPhone !== 'undefined' ? { phone: topPhone } : {}),
    };

    const hasUserUpdate = Object.keys(mergedUserUpdate).length > 0;

    const hasAddressInput = [address1, address2, city, state, zip].some(
      (v) => typeof v !== 'undefined'
    );

    return prisma.coach.update({
      where: { id: coachId },
      data: {
        // make sure we don't pass the raw user payload back in
        ...rest,
        ...(hasUserUpdate ? { user: { update: mergedUserUpdate } } : {}),
        ...(hasAddressInput
          ? {
              address: {
                upsert: {
                  create: {
                    address1: address1 ?? '',
                    address2: address2 ?? null,
                    city: city ?? '',
                    state: state ?? '',
                    zip: zip ?? '',
                  },
                  update: {
                    address1: address1 ?? '',
                    address2: address2 ?? null,
                    city: city ?? '',
                    state: state ?? '',
                    zip: zip ?? '',
                  },
                },
              },
            }
          : {}),
      },
      include: { user: true, headTeams: true, teams: true, address: true },
    });
  },

  removeCoachFromTeam: async (
    coachId: string,
    teamId: string,
    actingUserId: string,
    role: Role
  ) => {
    const allowed = await canManageTeam(actingUserId, teamId, role);
    if (!allowed) throw new Error('Not authorized to modify this team.');

    return prisma.$transaction(async (tx) => {
      const team = await tx.team.findUnique({
        where: { id: teamId },
        select: { id: true, headCoachID: true },
      });
      if (!team) throw new Error('Team not found');

      const data: any = {
        coaches: { disconnect: { id: coachId } },
      };
      if (team.headCoachID === coachId) {
        data.headCoachID = null;
      }

      const updated = await tx.team.update({
        where: { id: teamId },
        data,
        include: {
          headCoach: { include: { user: true } },
          coaches: { include: { user: true } },
          players: { include: { user: true } },
          trophyCase: true,
        },
      });

      return updated;
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
