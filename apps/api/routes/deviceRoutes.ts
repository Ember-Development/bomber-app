import { Router } from 'express';
import { registerDevice, testFCM } from '../controllers/deviceController';
import { auth } from '../auth/auth';

export const devicesRouter = Router();
devicesRouter.post('/register', registerDevice);
devicesRouter.post('/test-fcm', auth, testFCM);
