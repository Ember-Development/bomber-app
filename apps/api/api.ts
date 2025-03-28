import { Request, Response } from 'express';
import express from 'express';
import http from 'http';
import { PrismaClient } from '@bomber-app/database';
import initializeSocket from './websockets/websocket';
import groupRoutes from './routes/groupRoutes';
import messageRoutes from './routes/messageRoutes';

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;
const prisma = new PrismaClient();

app.get('/', (_: Request, res: Response) => {
  res.send('Ready 4 Biznes');
});

app.use('/api/chats', groupRoutes);
app.use('/api/messages', messageRoutes);

initializeSocket(server);

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

export { prisma };
