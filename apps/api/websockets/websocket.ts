import { prisma } from '@bomber-app/database';
import { Server } from 'socket.io';

export default function initializeSocket(server: any) {
  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log(`user connected: ${socket.id}`);

    socket.on('joinChat', (chatId) => {
      socket.join(chatId);
      console.log(`User has joined the chat: ${chatId}`);
    });

    socket.on('sendMessage', async (data) => {
      const { text, chatId, userId } = data;

      try {
        const newMessage = await prisma.message.create({
          data: {
            text,
            chatID: chatId,
            userID: userId,
            createdAt: new Date(),
          },
          include: { sender: true, chat: true },
        });

        io.to(chatId).emit('NewMessage', newMessage);
      } catch (error) {
        console.error('Error sending message');
      }
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });

  return io;
}
