import { prisma } from '@bomber-app/database';
import { Request, Response } from 'express';
import {
  validateCreateNotification,
  validateOpenReceipt,
} from '../modules/notifications/validators';
import { sendNotificationRecord } from '../services/notifications';
import { AuthenticatedRequest } from '../utils/express';

export async function createNotification(
  req: AuthenticatedRequest,
  res: Response
) {
  // require ADMIN middleware before this
  const parsed = validateCreateNotification(req.body);
  if (!parsed.ok) return res.status(400).json({ errors: parsed.errors });

  const { scheduledAt, ...rest } = parsed.data;
  const record = await prisma.notification.create({
    data: {
      ...rest,
      status: scheduledAt ? 'queued' : 'draft',
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      createdAt: new Date(),
    } as any,
  });
  res.json(record);
}

export async function sendNow(req: Request, res: Response) {
  const { id } = req.params;
  await prisma.notification.update({
    where: { id },
    data: { status: 'queued' },
  });
  await sendNotificationRecord(id);
  res.json({ ok: true });
}

export async function feed(req: Request, res: Response) {
  // simple feed; refine to per-user if you use UserNotification for read-state
  const items = await prisma.notification.findMany({
    where: { status: 'sent' },
    orderBy: { sentAt: 'desc' },
    take: 50,
    select: {
      id: true,
      title: true,
      body: true,
      imageUrl: true,
      deepLink: true,
      sentAt: true,
    },
  });
  res.json({ items });
}

export async function markOpened(req: AuthenticatedRequest, res: Response) {
  const parsed = validateOpenReceipt(req.body);
  if (!parsed.ok) return res.status(400).json({ errors: parsed.errors });

  const { notificationId } = parsed.data;
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const userId = req.user.id;

  await prisma.pushReceipt.updateMany({
    where: { userId, notificationId },
    data: { openedAt: new Date() },
  });
  res.json({ ok: true });
}
