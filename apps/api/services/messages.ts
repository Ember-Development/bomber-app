import { prisma } from '@bomber-app/database';

export const messageService = {
  getMessages: async (chatId: string) => {
    return await prisma.message.findMany({
      where: { chatID: chatId },
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
