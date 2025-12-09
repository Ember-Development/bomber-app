import { config } from 'dotenv';
config(); // Load .env file at the top

import { NextFunction, Request, Response } from 'express';
import express from 'express';
import http from 'http';
import cors, { CorsOptions } from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { PrismaClient } from '@bomber-app/database/generated/client';
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
import { devicesRouter } from './routes/deviceRoutes';
import { notificationsRouter } from './routes/notificationsRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import schoolRoutes from './routes/schoolRoutes';
import recruitmentRoutes from './routes/recruitmentRoutes';
import contactRoutes from './routes/contactRoutes';
import integrationRoutes from './routes/integrationRoutes';
import emailVerificationRoutes from './routes/emailVerificationRoutes';

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;
const prisma = new PrismaClient();

// Log allowed CORS origins for debugging
const allowed = (process.env.CORS_ORIGINS ?? '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);
console.log('Allowed CORS origins:', allowed);

// CORS configuration
const corsOptions: CorsOptions = {
  origin(origin, cb) {
    console.log('CORS origin check:', origin); // Debug origin
    if (!origin || allowed.includes(origin)) {
      cb(null, true);
    } else {
      cb(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Allow credentials (cookies, authorization headers, etc.)
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 204,
};

// Apply CORS globally before other middleware
app.use(cors(corsOptions));

// Handle OPTIONS requests globally
app.options('*', cors(corsOptions));

// Other middleware
app.use(helmet());
app.use(express.json());
app.use(morgan('dev'));

// Debug middleware for specific routes
app.use((req, _res, next) => {
  if (req.method === 'PUT' && req.path.startsWith('/api/users/')) {
    console.log('[HEADERS BEFORE AUTH]', {
      method: req.method,
      path: req.path,
      auth: req.headers['authorization'] || req.headers['Authorization'],
      ct: req.headers['content-type'],
      ua: req.headers['user-agent'],
      hv: req.httpVersionMajor + '.' + req.httpVersionMinor,
      host: req.headers['host'],
      origin: req.headers['origin'],
      referer: req.headers['referer'],
    });
  }
  next();
});

// Routes
app.get('/', (_: Request, res: Response) => {
  res.send('Ready 4 Biznes!');
});

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
app.use('/api/devices', devicesRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/schools', schoolRoutes);
app.use('/api/recruitment', recruitmentRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/integrations', integrationRoutes);
app.use('/api/email-verification', emailVerificationRoutes);

// Error handling middleware (single instance)
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res
    .status(err.status || 500)
    .json({ error: err.message || 'Internal Server Error' });
});

const io = initializeSocket(server);

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  const { getLatestVersionInfo } = require('./utils/versionManager');
  const versionInfo = getLatestVersionInfo();
  console.log(`📱 Latest app version: ${versionInfo.version}`);
});

export { prisma, io };
