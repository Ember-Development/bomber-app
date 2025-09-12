import { Router } from 'express';
import {
  signupBase,
  login,
  refresh,
  logout,
  getCurrentUser,
} from '../controllers/authController';
import { auth } from '../auth/auth';

const router = Router();

router.post('/signup', signupBase);
router.post('/login', login);
router.post('/refresh', refresh);
router.post('/logout', auth, logout);
router.get('/me', auth, getCurrentUser);

export default router;
