// routes/notificationRoutes.ts
import { Router } from 'express';
import {
  createNotification,
  feed,
  markOpened,
  readAll,
  sendNow,
  updateNotification,
} from '../controllers/notificationController';
import { auth } from '../auth/auth';

export const notificationsRouter = Router();

notificationsRouter.post('/', createNotification);
notificationsRouter.post('/:id/send', sendNow);
notificationsRouter.put('/:id', updateNotification);

notificationsRouter.use(auth);
notificationsRouter.get('/feed', feed);
notificationsRouter.post('/receipt/open', markOpened);
notificationsRouter.post('/readAll', readAll);
