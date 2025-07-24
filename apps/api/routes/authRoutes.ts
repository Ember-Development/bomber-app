import express from 'express';
import { getMockLogins } from '../controllers/authController';
import { devAuth } from '../auth/devAuth';
import { authorize } from '../middleware/authorize';

const router = express.Router();

router.get('/login', devAuth, authorize('view-my-info'), getMockLogins);

export default router;
