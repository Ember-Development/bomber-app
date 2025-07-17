// src/utils/roleHelpers.ts
import { prisma } from '@bomber-app/database';

const NO_CHANGE: readonly string[] = ['Coach', 'RegionalCoach', 'Admin'];
const NO_CHANGE_PLAYER = ['Player'] as const;

export async function ensureUserIsCoach(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { primaryRole: true },
  });
  if (!user) throw new Error('User not found');
  if (!NO_CHANGE.includes(user.primaryRole)) {
    await prisma.user.update({
      where: { id: userId },
      data: { primaryRole: 'COACH' },
    });
  }
}

export async function ensureUserIsPlayer(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { primaryRole: true },
  });
  if (!user) throw new Error('User not found');
  if (!NO_CHANGE_PLAYER.includes(user.primaryRole as any)) {
    await prisma.user.update({
      where: { id: userId },
      data: { primaryRole: 'PLAYER' },
    });
  }
}
