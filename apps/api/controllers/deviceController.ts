import { prisma } from '@bomber-app/database';
import { Request, Response } from 'express';
import { validateRegisterDevice } from '../modules/notifications/validators';

export async function registerDevice(req: Request, res: Response) {
  const parsed = validateRegisterDevice(req.body);
  if (!parsed.ok) return res.status(400).json({ errors: parsed.errors });

  const { userId, platform, token, appVersion } = parsed.data;

  await prisma.device.upsert({
    where: { token },
    update: { userId, platform, appVersion },
    create: { userId, platform, token, appVersion },
  });

  res.json({ ok: true });
}
