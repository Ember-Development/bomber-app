import { prisma } from '@bomber-app/database';

export const groupService = {
  getAllGroups: async (take: number = 10, cursor?: string) => {
    return await prisma.chat.findMany({
      include: {
        users: true,
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: {
        id: 'desc',
      },
      take,
      ...(cursor && {
        skip: 1,
        cursor: { id: cursor },
      }),
    });
  },

  createGroups: async (title: string, userIds: string[]) => {
    const group = await prisma.chat.create({
      data: {
        title,
        createdAt: new Date(),
        users: {
          create: userIds.map((id) => ({
            user: { connect: { id } },
            joinedAt: new Date(),
          })),
        },
      },
      include: { users: true, messages: true },
    });
    return group;
  },

  addUsersToGroup: async (groupId: string, userIds: string[]) => {
    const updates = userIds.map((id) =>
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
