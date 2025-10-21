import { Request, Response } from 'express';
import { validateRegisterDevice } from '../modules/notifications/validators';
import { prisma } from '../api';

export async function registerDevice(req: Request, res: Response) {
  const parsed = validateRegisterDevice(req.body);
  if (!parsed.ok) return res.status(400).json({ errors: parsed.errors });

  const { userId, platform, token, appVersion } = parsed.data;

  console.log(`[Device Registration] Registering device for user ${userId}:`, {
    platform,
    tokenLength: token.length,
    appVersion,
    tokenStart: token.substring(0, 10) + '...',
  });

  try {
    const device = await prisma.device.upsert({
      where: { token },
      update: { userId, platform, appVersion },
      create: { userId, platform, token, appVersion },
    });

    console.log(
      `[Device Registration] ✅ Successfully registered device ${device.id}`
    );
    res.json({ ok: true });
  } catch (error) {
    console.error(`[Device Registration] ❌ Failed to register device:`, error);
    res.status(500).json({ error: 'Failed to register device' });
  }
}
