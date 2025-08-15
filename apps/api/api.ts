import { NextFunction, Request, Response } from 'express';
import express from 'express';
import http from 'http';
import { PrismaClient } from '@bomber-app/database';
import initializeSocket from './websockets/websocket';
import groupRoutes from './routes/groupRoutes';
import messageRoutes from './routes/messageRoutes';
import userRoutes from './routes/userRoutes';
import authRoutes from './routes/authRoutes';
import teamRoutes from './routes/teamRoutes';
import playerRoutes from './routes/playerRoutes';
import eventRoutes from './routes/eventRoutes';
import sponsorRoutes from './routes/sponsorRoutes';
import bannerRoutes from './routes/bannerRoutes';
import mediaRoutes from './routes/mediaRoutes';
import articleRoutes from './routes/articleRoutes';
import coachRoutes from './routes/coachRoutes';
import commitRoutes from './routes/commitRoutes';
import portalRoutes from './routes/portalRoutes';
import parentRoutes from './routes/parentRoutes';
import regCoachRoutes from './routes/regCoachRoutes';

import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';

type Err = any;
const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;
const prisma = new PrismaClient();

app.get('/', (_: Request, res: Response) => {
  res.send('Ready 4 Biznes');
});
app.use(express.json());

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGINS?.split(',') || [] }));
app.use(express.json());
app.use(morgan('dev'));

app.use('/api/groups', groupRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/players', playerRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/sponsors', sponsorRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/medias', mediaRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/coaches', coachRoutes);
app.use('/api/commits', commitRoutes);
app.use('/api/portal', portalRoutes);
app.use('/api/parents', parentRoutes);
app.use('/api/regCoaches', regCoachRoutes);

app.use((err: Err, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res
    .status(err.status || 500)
    .json({ error: err.message || 'Internal Server Error' });
});

const io = initializeSocket(server);

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

export { prisma, io };
