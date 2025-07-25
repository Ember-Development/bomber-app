import { prisma } from '@bomber-app/database';
import { validateGroupAccess } from '../utils/accessGroups';
import { Role } from '../auth/permissions';

export const groupService = {
  getAllGroups: async (
    take: number = 10,
    cursor?: { lastMessageAt: Date; id: string }
  ) => {
    return await prisma.chat.findMany({
      include: {
        users: true,
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: [{ lastMessageAt: 'desc' }, { id: 'desc' }],
      take,
      ...(cursor && {
        skip: 1,
        cursor,
      }),
    });
  },

  createGroup: async (
    title: string,
    userIds: string[],
    actingUserId: string,
    role: Role
  ) => {
    const validatedIds = await validateGroupAccess(actingUserId, role, userIds);
    return prisma.chat.create({
      data: {
        title,
        createdAt: new Date(),
        users: {
          create: validatedIds.map((id) => ({
            user: { connect: { id } },
            joinedAt: new Date(),
          })),
        },
      },
      include: { users: true, messages: true },
    });
  },

  addUsersToGroup: async (
    groupId: string,
    userIds: string[],
    actingUserId: string,
    role: Role
  ) => {
    const validatedIds = await validateGroupAccess(actingUserId, role, userIds);

    const existing = await prisma.userChat.findMany({
      where: {
        chatID: groupId,
        userID: { in: validatedIds },
      },
      select: { userID: true },
    });

    const alreadyInGroup = new Set(existing.map((u) => u.userID));
    const toAdd = validatedIds.filter((id) => !alreadyInGroup.has(id));

    const updates = toAdd.map((id) =>
      prisma.userChat.create({
        data: {
          userID: id,
          chatID: groupId,
          joinedAt: new Date(),
        },
      })
    );

    await Promise.all(updates);

    return prisma.chat.findUnique({
      where: { id: groupId },
      include: { users: true, messages: true },
    });
  },
};
