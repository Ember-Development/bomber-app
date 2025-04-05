import { prisma } from '@bomber-app/database';
import { Server as SocketIOServer } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import createClient from 'ioredis';
import { Server } from 'http';

export default function initializeSocket(server: Server) {
  const io = new SocketIOServer(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  const pubClient = new createClient({
    host: process.env.REDIS_HOST || 'localhost',
    port: Number(process.env.REDIS_PORT) || 6379,
    retryStrategy: (times) => {
      return Math.min(times * 50, 2000); // 2 seconds max
    },
  });
  const subClient = pubClient.duplicate();

  pubClient.on('error', (err) => console.error('Redis Pub Client Error', err));
  subClient.on('error', (err) => console.error('Redis Sub Client Error', err));

  io.adapter(createAdapter(pubClient, subClient));

  io.on('connection', (socket) => {
    console.log(`socket connected: ${socket.id}`);

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
        console.error('Error sending message', error);
      }
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });

  return io;
}
