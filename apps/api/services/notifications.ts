// notifications.ts
import { prisma } from '../api';
import { sendToDevice } from '../lib/push';

/**
 * Resolve which user IDs a notification should go to.
 * Supports { all: true } or { userIds: string[] } in the audience JSON.
 */
export async function resolveAudience(audience: any): Promise<string[]> {
  if (audience?.all) {
    const users = await prisma.user.findMany({
      select: { id: true },
      where: { isDeleted: false },
    });
    return users.map((u) => u.id);
  }
  return Array.isArray(audience?.userIds) ? audience.userIds : [];
}

/**
 * Sends a Notification record by ID to its audience/devices.
 * - Ensures UserNotification rows exist (for unread tracking)
 * - Computes per-user unread counts for iOS badge (unless overridden on the Notification.badge)
 * - Sends via APNs / FCM
 * - Writes PushReceipt rows and deletes dead device tokens
 */
export async function sendNotificationRecord(id: string) {
  const n = await prisma.notification.findUnique({ where: { id } });
  if (!n) throw new Error('Notification not found');

  const targetUserIds = await resolveAudience(n.audience as any);

  console.log(`[Send Notification] Notification ${id}:`, {
    title: n.title,
    audience: n.audience,
    targetUserIds: targetUserIds.length,
    platform: n.platform,
    status: n.status,
  });

  // Optional platform filter for device lookup
  const deviceWhere =
    n.platform === 'ios'
      ? { platform: 'ios' as const }
      : n.platform === 'android'
        ? { platform: 'android' as const }
        : {};

  // Fetch devices for targeted users (or all if audience is empty and platform is not restricted)
  const devices = await prisma.device.findMany({
    where: {
      ...deviceWhere,
      ...(targetUserIds.length ? { userId: { in: targetUserIds } } : {}),
    },
    select: { id: true, token: true, platform: true, userId: true },
  });

  console.log(
    `[Send Notification] Found ${devices.length} devices for ${targetUserIds.length} users`
  );

  // Determine which users we are marking as recipients (for unread tracking)
  const userIds =
    targetUserIds.length > 0
      ? targetUserIds
      : [...new Set(devices.map((d) => d.userId))];

  // Ensure userNotification records exist (so unread counts include this notification)
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

  // Precompute unread counts per user to use for iOS badge fallback
  // NOTE: userNotification columns are userID / notificationID in your schema.
  const unreadCountsRaw = await prisma.userNotification.groupBy({
    by: ['userID'],
    where: { userID: { in: userIds }, isRead: false },
    _count: { _all: true },
  });
  const unreadCounts: Record<string, number> = {};
  for (const row of unreadCountsRaw) {
    unreadCounts[row.userID] = row._count._all;
  }

  // Send pushes device-by-device
  for (const d of devices) {
    console.log(
      `[Send Notification] Sending to device ${d.id} (${d.platform}) for user ${d.userId}`
    );

    // If Notification.badge is set, use it; otherwise fall back to the user's unread count.
    const badge = (n as any).badge ?? unreadCounts[d.userId] ?? 0;

    try {
      await sendToDevice({
        platform: d.platform as 'ios' | 'android',
        token: d.token,
        title: n.title,
        body: n.body,
        deepLink: n.deepLink ?? undefined,
        imageUrl: n.imageUrl ?? undefined,
        notificationId: n.id,
        badge, // ← per-user badge
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

      console.log(`[Send Notification] ✅ Successfully sent to device ${d.id}`);
    } catch (e: any) {
      const msg = String(e?.message ?? e);
      console.error(
        `[Send Notification] ❌ Failed to send to device ${d.id}:`,
        msg
      );

      let deviceDeleted = false;

      // Common permanent token errors (APNs / FCM)
      if (
        msg.includes('BadDeviceToken') ||
        msg.includes('not-registered') ||
        msg.includes('Unregistered')
      ) {
        await prisma.device.delete({ where: { id: d.id } }).catch(() => {});
        deviceDeleted = true;
        console.log(`[Send Notification] 🗑️ Deleted invalid device ${d.id}`);
      }

      // Record failure if the device record still exists
      if (!deviceDeleted) {
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
  }

  // Mark the notification as sent
  await prisma.notification.update({
    where: { id: n.id },
    data: { status: 'sent', sentAt: new Date() },
  });

  console.log(`[Send Notification] 🎯 Notification ${id} fully processed`);
}
