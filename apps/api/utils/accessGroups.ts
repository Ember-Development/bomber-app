import { prisma } from '@bomber-app/database';
import { Role } from '../auth/permissions';

export const validateGroupAccess = async (
  actingUserId: string,
  role: Role,
  userIdsToAdd: string[]
): Promise<string[]> => {
  if (role === 'ADMIN') {
    const users = await prisma.user.findMany({
      where: {
        id: { in: userIdsToAdd },
        primaryRole: { not: 'FAN' },
      },
      include: {
        player: {
          include: {
            team: true,
            parents: true,
          },
        },
      },
    });

    const finalIds = new Set<string>();

    for (const user of users) {
      finalIds.add(user.id);

      const player = user.player;
      if (player && player.team) {
        const age = player.ageGroup;
        const is12UorUnder = age === 'U8' || age === 'U10' || age === 'U12';
        const is14UNotTrusted = age === 'U14' && !player.isTrusted;

        if (is12UorUnder || is14UNotTrusted) {
          for (const parent of player.parents) {
            finalIds.add(parent.userID);
          }
        }
      }
    }

    return Array.from(finalIds);
  }

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
      coach: {
        include: { teams: true },
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
    const coach = user.coach;

    // ✅ 1. Handle players
    if (player && player.team) {
      const region = player.team.region;

      const isValid =
        (role === 'REGIONAL_COACH' && actingRegCoach?.region === region) ||
        (role === 'COACH' &&
          actingCoach?.teams.some((t) => t.id === player.teamID));

      if (!isValid) {
        throw new Error(`Player ${user.id} is not accessible`);
      }

      finalUserIds.add(user.id);

      const age = player.ageGroup;
      const is12UorUnder = age === 'U8' || age === 'U10' || age === 'U12';
      const is14UNotTrusted = age === 'U14' && !player.isTrusted;

      if (is12UorUnder || is14UNotTrusted) {
        for (const parent of player.parents) {
          finalUserIds.add(parent.userID);
        }
      }

      continue;
    }

    // ✅ 2. Handle coaches
    if (coach) {
      const coachTeamIds = coach.teams.map((t) => t.id);
      const allowed =
        (role === 'REGIONAL_COACH' &&
          actingRegCoach &&
          coach.teams.some((t) => t.region === actingRegCoach.region)) ||
        (role === 'COACH' &&
          actingCoach &&
          actingCoach.teams.some((t) => coachTeamIds.includes(t.id)));

      if (!allowed) {
        throw new Error(`Coach ${user.id} is not accessible`);
      }

      finalUserIds.add(user.id);
      continue;
    }

    // ✅ 3. Handle manually-added parents
    if (user.primaryRole === 'PARENT') {
      const parentPlayers = await prisma.player.findMany({
        where: {
          parents: { some: { userID: user.id } },
          ...(role === 'COACH' && actingCoach
            ? { teamID: { in: actingCoach.teams.map((t) => t.id) } }
            : role === 'REGIONAL_COACH' && actingRegCoach
              ? {
                  team: {
                    region: actingRegCoach.region,
                  },
                }
              : {}),
        },
      });

      if (parentPlayers.length === 0) {
        throw new Error(
          `Parent ${user.id} is not associated with accessible players`
        );
      }

      finalUserIds.add(user.id);
    }
  }

  return Array.from(finalUserIds);
};
