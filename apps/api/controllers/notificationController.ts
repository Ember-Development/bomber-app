import { Request, Response } from 'express';
import {
  validateCreateNotification,
  validateOpenReceipt,
} from '../modules/notifications/validators';
import { sendNotificationRecord } from '../services/notifications';
import { AuthenticatedRequest } from '../utils/express';
import { prisma } from '../api';

export async function createNotification(
  req: AuthenticatedRequest,
  res: Response
) {
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

// export async function feed(req: Request, res: Response) {
//   const items = await prisma.notification.findMany({
//     where: { status: 'sent' },
//     orderBy: { sentAt: 'desc' },
//     take: 50,
//     select: {
//       id: true,
//       title: true,
//       body: true,
//       imageUrl: true,
//       deepLink: true,
//       sentAt: true,
//     },
//   });
//   res.json({ items });
// }

export async function feed(req: Request, res: Response) {
  // Default unreadOnly=true, but allow ?unreadOnly=false for "all"
  const unreadOnly =
    req.query.unreadOnly === undefined ? true : req.query.unreadOnly === 'true';

  // If upstream auth added req.user, use personalized feed; otherwise public
  const userId = (req as any)?.user?.id as string | undefined;

  if (userId) {
    const userNotifs = await prisma.userNotification.findMany({
      where: {
        userID: userId,
        ...(unreadOnly ? { isRead: false } : {}),
        notification: { status: 'sent' },
      },
      include: {
        notification: {
          select: {
            id: true,
            title: true,
            body: true,
            imageUrl: true,
            deepLink: true,
            sentAt: true,
          },
        },
      },
      orderBy: [{ notification: { sentAt: 'desc' } }],
      take: 50,
    });

    const items =
      userNotifs
        .map((un) => un.notification)
        .filter((n): n is NonNullable<typeof n> => !!n) ?? [];

    return res.json({ items });
  }

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

  return res.json({ items });
}

export async function markOpened(req: AuthenticatedRequest, res: Response) {
  const parsed = validateOpenReceipt(req.body);
  if (!parsed.ok) return res.status(400).json({ errors: parsed.errors });
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  const { notificationId } = parsed.data;
  const userId = req.user.id;

  await prisma.pushReceipt.updateMany({
    where: { userId, notificationId },
    data: { openedAt: new Date() },
  });

  await prisma.userNotification
    .update({
      where: {
        userID_notificationID: {
          userID: userId,
          notificationID: notificationId,
        },
      },
      data: { isRead: true },
    })
    .catch(() => {});

  res.json({ ok: true });
}

export async function readAll(req: AuthenticatedRequest, res: Response) {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const userId = req.user.id;
  const beforeISO = (req.body?.before as string | undefined) ?? undefined;
  const before = beforeISO ? new Date(beforeISO) : undefined;

  await prisma.userNotification.updateMany({
    where: {
      userID: userId,
      isRead: false,
      ...(before ? { notification: { sentAt: { lte: before } } } : {}),
    },
    data: { isRead: true },
  });

  res.json({ ok: true });
}

export async function updateNotification(req: Request, res: Response) {
  const { id } = req.params;

  const { title, body, imageUrl, deepLink, platform, audience, data } =
    req.body;

  const updated = await prisma.notification.update({
    where: { id },
    data: {
      title,
      body,
      imageUrl: imageUrl ?? null,
      deepLink: deepLink ?? null,
      platform,
      audience: audience ?? undefined,
      data: data ?? undefined,
    },
  });

  res.json(updated);
}
