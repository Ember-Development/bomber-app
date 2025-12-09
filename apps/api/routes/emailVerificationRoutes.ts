import { Router } from 'express';
import {
  requestEmailVerification,
  verifyEmail,
} from '../controllers/emailVerificationController';
import { auth } from '../auth/auth';

const router = Router();

router.post('/request', auth, requestEmailVerification);
router.get('/verify', verifyEmail); // Public endpoint for email link

export default router;
