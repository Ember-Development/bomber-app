import { Router } from 'express';
import {
  signupBase,
  login,
  refresh,
  logout,
} from '../controllers/authController';

const router = Router();

router.post('/signup', signupBase);
router.get('/login', getMockLogins);
router.post('/login', login);
router.post('/refresh', refresh);
router.post('/logout', logout);

export default router;
