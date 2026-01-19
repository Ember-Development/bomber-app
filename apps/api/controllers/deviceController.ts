import { Request, Response } from 'express';
import { validateRegisterDevice } from '../modules/notifications/validators';
import { prisma } from '../api';
import { sendFCM } from '../lib/fcm';

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

export async function testFCM(req: Request, res: Response) {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Device token is required' });
    }

    console.log(`[FCM Test] Sending test notification to token:`, {
      tokenStart: token.substring(0, 10) + '...',
      tokenLength: token.length,
    });

    await sendFCM({
      token,
      title: 'FCM Test',
      body: "If you see this, you're done 🚀",
      data: { test: 'true' },
    });

    console.log(`[FCM Test] ✅ Test notification sent successfully`);

    res.json({
      success: true,
      message: 'Test notification sent successfully',
    });
  } catch (error: any) {
    console.error('[FCM Test] ❌ Error:', error);
    res.status(500).json({
      error: 'Failed to send test notification',
      message: error.message,
    });
  }
}
