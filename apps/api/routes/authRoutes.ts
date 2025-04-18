import express from 'express';
import { getMockLogins } from '../controllers/authController';

const router = express.Router();

router.get('/login', getMockLogins);

export default router;
