import bcrypt from 'bcrypt';
import { signAccess, signRefresh, verifyRefresh } from '../utils/jwt';
import { PrismaClient } from '@bomber-app/database/generated/client';
const prisma = new PrismaClient();

export async function issueTokenPair(user: { id: string; role: any }) {
  const access = signAccess({ sub: user.id, role: user.role });
  const refreshPlain = signRefresh({ sub: user.id });
  const hashed = await bcrypt.hash(refreshPlain, 12);
  await prisma.refreshToken.create({
    data: { userId: user.id, hashedToken: hashed },
  });
  return { access, refresh: refreshPlain };
}

export async function rotateRefreshToken(oldRefresh: string) {
  let payload: any;
  try {
    payload = verifyRefresh(oldRefresh);
  } catch {
    throw new Error('invalid-refresh');
  }
  const userId = payload.sub as string;

  // find a valid stored token that matches this refresh
  const tokens = await prisma.refreshToken.findMany({
    where: { userId, revokedAt: null },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  let matchedId: string | null = null;
  for (const t of tokens) {
    const ok = await bcrypt.compare(oldRefresh, t.hashedToken);
    if (ok) {
      matchedId = t.id;
      break;
    }
  }
  if (!matchedId) throw new Error('refresh-not-found');

  // revoke the matched one
  await prisma.refreshToken.update({
    where: { id: matchedId },
    data: { revokedAt: new Date() },
  });

  // issue a new pair (rotate)
  const access = signAccess({ sub: userId });
  const newRefresh = signRefresh({ sub: userId });
  const hashed = await bcrypt.hash(newRefresh, 12);
  await prisma.refreshToken.create({ data: { userId, hashedToken: hashed } });

  return { access, refresh: newRefresh, userId };
}

export async function revokeAllUserRefreshTokens(userId: string) {
  await prisma.refreshToken.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}
