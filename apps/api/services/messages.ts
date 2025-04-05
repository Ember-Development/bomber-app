import { prisma } from '@bomber-app/database';

export const messageService = {
  getMessages: async (
    chatId: string,
    options: { cursor?: string; limit?: number }
  ) => {
    const { cursor, limit = 20 } = options || {};

    return await prisma.message.findMany({
      where: { chatID: chatId },
      take: limit,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: { createdAt: 'desc' },
      include: { sender: true },
    });
  },

  sendMessage: async (text: string, chatId: string, userId: string) => {
    return await prisma.message.create({
      data: { text, chatID: chatId, userID: userId, createdAt: new Date() },
      include: { sender: true, chat: true },
    });
  },
};
