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
};
