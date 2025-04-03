import { prisma } from '@bomber-app/database';

export const groupService = {
  getAllGroups: async () => {
    return await prisma.chat.findMany({
      include: { users: true, messages: true },
    });
  },

  createGroups: async (title: string, userIds: string[]) => {
    const group = await prisma.chat.create({
      data: {
        title,
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
