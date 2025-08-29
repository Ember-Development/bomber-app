import { Router } from 'express';
import {
  createNotification,
  feed,
  markOpened,
  sendNow,
} from '../controllers/notificationController';
import { auth } from '../auth/auth';

export const notificationsRouter = Router();
notificationsRouter.post('/', createNotification);
notificationsRouter.post('/:id/send', sendNow);
notificationsRouter.get('/feed', feed);
notificationsRouter.post('/receipt/open', markOpened);
