import { Router } from 'express';
import { registerDevice } from '../controllers/deviceController';
import { auth } from '../auth/auth';

export const devicesRouter = Router();
devicesRouter.post('/register', registerDevice);
