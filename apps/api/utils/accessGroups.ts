import { prisma } from '@bomber-app/database';
import { Role } from '../auth/permissions';

export const validateGroupAccess = async (
  actingUserId: string,
  role: Role,
  userIdsToAdd: string[]
): Promise<string[]> => {
  if (role === 'ADMIN') return userIdsToAdd;

  const users = await prisma.user.findMany({
    where: { id: { in: userIdsToAdd } },
    include: {
      player: {
        include: {
          team: {
            include: { coaches: true },
          },
          parents: true,
        },
      },
    },
  });

  const actingRegCoach =
    role === 'REGIONAL_COACH'
      ? await prisma.regCoach.findUnique({ where: { userID: actingUserId } })
      : null;

  const actingCoach =
    role === 'COACH'
      ? await prisma.coach.findUnique({
          where: { userID: actingUserId },
          include: { teams: true },
        })
      : null;

  const finalUserIds = new Set<string>();

  for (const user of users) {
    const player = user.player;
    if (!player || !player.team) continue;

    const region = player.team.region;
    const teamCoaches = player.team.coaches;

    if (
      (role === 'REGIONAL_COACH' && actingRegCoach?.region !== region) ||
      (role === 'COACH' &&
        !actingCoach?.teams.some((t) => t.id === player.teamID))
    ) {
      throw new Error(
        `User ${user.id} is not accessible to ${role.toLowerCase()}`
      );
    }

    finalUserIds.add(user.id);

    const isUnder14U =
      player.ageGroup === 'U8' ||
      player.ageGroup === 'U10' ||
      player.ageGroup === 'U12' ||
      player.ageGroup === 'U14';

    if (isUnder14U && !player.isTrusted) {
      for (const parent of player.parents) {
        finalUserIds.add(parent.userID);
      }
    }
  }

  return Array.from(finalUserIds);
};
