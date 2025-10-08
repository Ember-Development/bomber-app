import { prisma } from '../api';

export const messageService = {
  getAllMessages: async () => {
    return await prisma.message.findMany({
      include: {
        sender: true,
        chat: true,
      },
      orderBy: { createdAt: 'desc' }, // Newest to oldest
    });
  },

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
    const now = new Date();

    const [message] = await prisma.$transaction([
      prisma.message.create({
        data: {
          text,
          chatID: chatId,
          userID: userId,
          createdAt: now,
          retryCount: 0,
          failedToSend: false,
        },
        include: { sender: true, chat: true },
      }),
      prisma.chat.update({
        where: { id: chatId },
        data: { lastMessageAt: now },
      }),
    ]);

    return message;
  },

  retryMessage: async (messageId: string) => {
    const existing = await prisma.message.findUnique({
      where: { id: messageId },
      select: {
        retryCount: true,
      },
    });

    if (!existing) {
      throw new Error('Message not found');
    }

    if (existing.retryCount >= 3) {
      throw new Error('Retry limit reached');
    }

    return await prisma.message.update({
      where: { id: messageId },
      data: {
        retryCount: { increment: 1 },
        failedToSend: false,
      },
      include: {
        sender: true,
        chat: true,
      },
    });
  },
};
