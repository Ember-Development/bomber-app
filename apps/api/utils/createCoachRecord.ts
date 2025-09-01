import { prisma } from '@bomber-app/database';

export async function ensureCoachRecordFor(userId: string): Promise<string> {
  const coach = await prisma.coach.upsert({
    where: { userID: userId },
    create: { userID: userId },
    update: {},
  });
  return coach.id;
}

export async function ensurePlayerRecordFor(
  userID: string,
  teamID: string
): Promise<string> {
  const player = await prisma.player.upsert({
    where: { userID },
    create: {
      userID,
      teamID,
      pos1: 'PITCHER',
      pos2: 'FIRST_BASE',
      jerseyNum: '0',
      gradYear: '2025',
      jerseySize: 'AM',
      pantSize: 'SIZE_20',
      stirrupSize: 'ADULT',
      shortSize: 'ASM',
      practiceShortSize: 'ASM',
      ageGroup: 'U8',
    },
    update: { teamID },
  });
  return player.id;
}
