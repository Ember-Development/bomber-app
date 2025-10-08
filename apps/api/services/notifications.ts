import { prisma } from '../api';
import { sendToDevice } from '../lib/push';

export async function resolveAudience(audience: any): Promise<string[]> {
  if (audience?.all) {
    const users = await prisma.user.findMany({
      select: { id: true },
      where: { isDeleted: false },
    });
    return users.map((u) => u.id);
  }
  return audience?.userIds ?? [];
}

export async function sendNotificationRecord(id: string) {
  const n = await prisma.notification.findUnique({ where: { id } });
  if (!n) throw new Error('Notification not found');

  const targetUserIds = await resolveAudience(n.audience as any);

  const deviceWhere =
    n.platform === 'ios'
      ? { platform: 'ios' }
      : n.platform === 'android'
        ? { platform: 'android' }
        : {};

  const devices = await prisma.device.findMany({
    where: {
      ...deviceWhere,
      ...(targetUserIds.length ? { userId: { in: targetUserIds } } : {}),
    },
    select: { id: true, token: true, platform: true, userId: true },
  });

  if (targetUserIds.length) {
    await Promise.all(
      targetUserIds.map((userId) =>
        prisma.userNotification.upsert({
          where: {
            userID_notificationID: { userID: userId, notificationID: n.id },
          },
          create: { userID: userId, notificationID: n.id, isRead: false },
          update: {},
        })
      )
    );
  } else {
    const userIds = [...new Set(devices.map((d) => d.userId))];
    await Promise.all(
      userIds.map((userId) =>
        prisma.userNotification.upsert({
          where: {
            userID_notificationID: { userID: userId, notificationID: n.id },
          },
          create: { userID: userId, notificationID: n.id, isRead: false },
          update: {},
        })
      )
    );
  }

  for (const d of devices) {
    try {
      await sendToDevice({
        platform: d.platform as 'ios' | 'android',
        token: d.token,
        title: n.title,
        body: n.body,
        deepLink: n.deepLink ?? undefined,
        imageUrl: n.imageUrl ?? undefined,
        notificationId: n.id,
      });

      await prisma.pushReceipt.upsert({
        where: {
          deviceId_notificationId: { deviceId: d.id, notificationId: n.id },
        },
        update: { deliveredAt: new Date(), failureReason: null },
        create: {
          deviceId: d.id,
          userId: d.userId,
          notificationId: n.id,
          deliveredAt: new Date(),
        },
      });
    } catch (e: any) {
      const msg = String(e?.message ?? e);
      if (
        msg.includes('BadDeviceToken') ||
        msg.includes('not-registered') ||
        msg.includes('Unregistered')
      ) {
        await prisma.device.delete({ where: { id: d.id } }).catch(() => {});
      }
      await prisma.pushReceipt.upsert({
        where: {
          deviceId_notificationId: { deviceId: d.id, notificationId: n.id },
        },
        update: { failureReason: msg },
        create: {
          deviceId: d.id,
          userId: d.userId,
          notificationId: n.id,
          failureReason: msg,
        },
      });
    }
  }

  await prisma.notification.update({
    where: { id: n.id },
    data: { status: 'sent', sentAt: new Date() },
  });
}
