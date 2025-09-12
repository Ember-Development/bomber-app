import { prisma } from '@bomber-app/database';
import { Server as SocketIOServer } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import createClient from 'ioredis';
import { Server } from 'http';
import { messageService } from '../services/messages';

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
    socket.on('joinChat', (chatId) => {
      socket.join(chatId);
    });

    socket.on('sendMessage', async (data, ack) => {
      const { text, chatId, userId } = data;

      try {
        const newMessage = await messageService.sendMessage(
          text,
          chatId,
          userId
        );

        io.in(chatId).emit('NewMessage', newMessage);

        if (ack) ack({ success: true });
      } catch (error) {
        if (ack) ack({ success: false });
      }
    });

    socket.on('retryMessage', async ({ messageId }, callback) => {
      try {
        const message = await messageService.retryMessage(messageId);
        io.to(message.chatID).emit('NewMessage', message);
        callback?.({ success: true });
      } catch {
        callback?.({ success: false });
      }
    });

    socket.on('disconnect', () => {});
  });

  return io;
}
