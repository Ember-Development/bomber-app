// import { prisma } from '@bomber-app/database';
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

  // Only use Redis adapter if explicitly enabled
  // For local development, Redis is optional - Socket.IO will use in-memory adapter by default
  const useRedis = process.env.REDIS_ENABLED === 'true';

  if (useRedis) {
    const pubClient = new createClient({
      host: process.env.REDIS_HOST || 'localhost',
      port: Number(process.env.REDIS_PORT) || 6379,
      retryStrategy: (times) => {
        // Stop retrying after 5 attempts to avoid spam
        if (times > 5) {
          console.warn(
            '⚠ Redis connection failed after 5 attempts. Socket.IO will use in-memory adapter.'
          );
          return null; // Stop retrying
        }
        return Math.min(times * 50, 2000);
      },
      lazyConnect: true, // Don't connect immediately
      enableOfflineQueue: false, // Don't queue commands when offline
    });
    const subClient = pubClient.duplicate();

    // Suppress ECONNREFUSED errors (expected when Redis is not running)
    pubClient.on('error', (err: any) => {
      if (err.code !== 'ECONNREFUSED') {
        console.error('Redis Pub Client Error:', err.message);
      }
    });
    subClient.on('error', (err: any) => {
      if (err.code !== 'ECONNREFUSED') {
        console.error('Redis Sub Client Error:', err.message);
      }
    });

    pubClient.on('connect', () => {
      console.log('✓ Redis Pub Client connected');
    });
    subClient.on('connect', () => {
      console.log('✓ Redis Sub Client connected');
    });

    // Try to connect asynchronously and set adapter if successful
    Promise.all([
      pubClient.connect().catch(() => null),
      subClient.connect().catch(() => null),
    ])
      .then(() => {
        // Check if both clients are actually connected
        if (pubClient.status === 'ready' && subClient.status === 'ready') {
          io.adapter(createAdapter(pubClient, subClient));
          console.log('✓ Socket.IO using Redis adapter');
        } else {
          console.warn(
            '⚠ Redis connection failed. Socket.IO using in-memory adapter.'
          );
        }
      })
      .catch(() => {
        console.warn(
          '⚠ Redis connection failed. Socket.IO using in-memory adapter.'
        );
      });
  } else {
    console.log(
      'ℹ Redis disabled (set REDIS_ENABLED=true to enable). Socket.IO using in-memory adapter.'
    );
  }

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
