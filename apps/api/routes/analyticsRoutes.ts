import express from 'express';
import { getAnalytics } from '../controllers/analyticsController';
import { auth } from '../auth/auth';

const router = express.Router();

router.get('/', auth, getAnalytics);

export default router;
